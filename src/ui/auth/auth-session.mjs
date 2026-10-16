// Sessão de login do shell (AD-9 emendado em 15/10). Tokens só em memória,
// neste objeto; `sessionStorage` guarda só `{verifier, state, returnTo}` durante
// o redirect e o marcador do login silencioso. A troca do code acontece aqui, em
// /app/, no mesmo documento que guarda o token. Nunca decodifica o JWT: a
// expiração vem de `expires_in` e do relógio injetado.
//
// Portas (todas injetadas; testáveis com `node --test` sem DOM):
//   fetch(url, init) → Promise<Response-like {ok, status, json()}>
//   location {pathname, search, hash, assign(url)}
//   history {replaceState(url)}
//   sessionStorage {getItem, setItem, removeItem}
//   crypto {getRandomValues, subtle.digest}
//   clock() → milissegundos (Date.now)
// Com `config.enabled === false`, nenhuma porta é lida nem chamada.
import {codeChallenge, createState, createVerifier} from './pkce.mjs';
import {
  APP_PATH, AuthError, SILENT_MARKER_KEY, assertEnabledConfig, clearPending,
  readPending, redirectUri, safeReturnTo, writePending
} from './auth-storage.mjs';

export {AuthError} from './auth-storage.mjs';
export {completeCallback} from './callback-flow.mjs';

// Renova quando faltam menos de 60 s para expirar.
export const REFRESH_MARGIN_MS = 60_000;
const PORTS = Object.freeze(['fetch', 'location', 'history', 'sessionStorage', 'crypto', 'clock']);

function disabledSession() {
  return Object.freeze({
    enabled: false,
    isAuthenticated: () => false,
    startLogin: async () => ({status: 'disabled'}),
    completeLogin: async () => ({status: 'disabled'}),
    silentLogin: async () => ({status: 'disabled'}),
    accessToken: async () => null,
    signOut: () => ({status: 'disabled'})
  });
}

function parseTokenResponse(body, {requireRefresh}) {
  if (body === null || typeof body !== 'object') throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  const {access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, token_type: tokenType} = body;
  if (typeof accessToken !== 'string' || accessToken === '') throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  if (typeof expiresIn !== 'number' || !Number.isFinite(expiresIn) || expiresIn <= 0) throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  if (tokenType !== undefined && String(tokenType).toLowerCase() !== 'bearer') throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  if (refreshToken !== undefined && (typeof refreshToken !== 'string' || refreshToken === '')) throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  if (requireRefresh && refreshToken === undefined) throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID');
  return {accessToken, refreshToken, expiresIn};
}

export function createAuthSession({config, ports} = {}) {
  if (!config?.enabled) return disabledSession();
  assertEnabledConfig(config);
  for (const name of PORTS) if (!ports?.[name]) throw new TypeError(`createAuthSession: porta ${name}`);
  const {fetch, location, history, sessionStorage, crypto, clock} = ports;
  const tokenEndpoint = `${config.cognitoDomain}/oauth2/token`;

  // Única cópia dos tokens. `generation` muda a cada descarte: uma renovação
  // que termine depois de signOut/reset é descartada.
  let tokens = null;
  let generation = 0;
  let refreshing = null;

  const listeners = new Set();
  function notify() { for (const listener of listeners) { try { listener(tokens !== null); } catch { /* listener da página */ } } }
  // Prazo entre a callback validar o state e /app/ trocar o code.
  const PENDING_MAX_AGE_MS = 5 * 60 * 1000;
  function reset() {
    tokens = null;
    generation += 1;
    refreshing = null;
  }

  async function postToken(params) {
    let response;
    try {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(params).toString()
      });
    } catch {
      throw new AuthError('AUTH_NETWORK_ERROR');
    }
    // 400 `invalid_grant` e afins: o corpo do provedor não é repassado.
    if (!response?.ok) throw new AuthError('AUTH_TOKEN_REJECTED');
    let body;
    try { body = await response.json(); } catch { throw new AuthError('AUTH_TOKEN_RESPONSE_INVALID'); }
    return body;
  }

  function setMarker() {
    try { sessionStorage.setItem(SILENT_MARKER_KEY, '1'); } catch { /* sem storage: o silencioso pode repetir uma vez */ }
  }
  function clearMarker() {
    try { sessionStorage.removeItem(SILENT_MARKER_KEY); } catch { /* idem */ }
  }
  function hasMarker() {
    try { return sessionStorage.getItem(SILENT_MARKER_KEY) !== null; } catch { return false; }
  }

  async function redirectToAuthorize({prompt} = {}) {
    const verifier = createVerifier(crypto);
    const state = createState(crypto);
    const challenge = await codeChallenge(verifier, crypto);
    writePending(sessionStorage, {verifier, state, returnTo: safeReturnTo(location.search)});
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: redirectUri(config),
      scope: config.scopes.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    if (prompt !== undefined) params.set('prompt', prompt);
    location.assign(`${config.cognitoDomain}/oauth2/authorize?${params.toString()}`);
    return {status: 'redirected'};
  }

  // Login interativo (botão "Entrar").
  function startLogin() {
    // Login explícito: a tentativa silenciosa volta a valer depois dele.
    clearMarker();
    return redirectToAuthorize();
  }

  // Recarga: no máximo uma ida com `prompt=none` por aba. O marcador, gravado
  // antes do redirect (ou no signOut), fica até um login concluído ou explícito.
  async function silentLogin() {
    if (tokens !== null) return {status: 'authenticated'};
    // Sem sessão no Cognito uma vez nesta aba: não volta a redirecionar a cada
    // recarga. O marcador sai num login concluído ou num startLogin explícito.
    if (hasMarker()) return {status: 'unauthenticated'};
    setMarker();
    return redirectToAuthorize({prompt: 'none'});
  }

  // Conclusão em /app/: lê `#code=` antes de qualquer hydrateUrl, limpa o
  // fragmento e troca o code. Fragmento sem verifier salvo é ignorado e limpo.
  async function completeLogin() {
    const hash = typeof location.hash === 'string' ? location.hash : '';
    if (hash === '' || hash === '#') return {status: 'none'};
    const fragment = new URLSearchParams(hash.slice(1));
    if (!fragment.has('code')) return {status: 'none'};
    const code = fragment.get('code');
    history.replaceState(`${location.pathname}${location.search}`);
    const pending = readPending(sessionStorage);
    // O verifier sai do storage antes da troca, dê ela certo ou não.
    clearPending(sessionStorage);
    // Só troca um code repassado pela callback que validou o `state`: um
    // `#code=` forjado não consome o verifier de um login ainda não validado.
    const validated = pending !== null && pending.state === undefined && typeof pending.validatedAt === 'number' && clock() - pending.validatedAt >= 0 && clock() - pending.validatedAt <= PENDING_MAX_AGE_MS;
    if (!validated || typeof pending.verifier !== 'string' || pending.verifier === '' || code === '') {
      return {status: 'ignored'};
    }
    reset();
    const startedAt = generation;
    const body = await postToken({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code,
      code_verifier: pending.verifier,
      redirect_uri: redirectUri(config)
    });
    const parsed = parseTokenResponse(body, {requireRefresh: false});
    if (startedAt !== generation) return {status: 'discarded'};
    tokens = {accessToken: parsed.accessToken, refreshToken: parsed.refreshToken ?? null, expiresAt: clock() + parsed.expiresIn * 1000};
    clearMarker();
    notify();
    return {status: 'authenticated'};
  }

  // Último resultado de renovação: 'ok', 'network' ou 'rejected'.
  let lastRefreshOutcome = null;
  function refresh() {
    if (refreshing !== null) return refreshing;
    const startedAt = generation;
    const refreshToken = tokens.refreshToken;
    refreshing = (async () => {
      try {
        const body = await postToken({grant_type: 'refresh_token', client_id: config.clientId, refresh_token: refreshToken});
        const parsed = parseTokenResponse(body, {requireRefresh: false});
        if (startedAt !== generation) return null;
        // O Cognito não devolve refresh token novo no refresh: o anterior continua.
        tokens = {accessToken: parsed.accessToken, refreshToken: parsed.refreshToken ?? refreshToken, expiresAt: clock() + parsed.expiresIn * 1000};
        lastRefreshOutcome = 'ok';
        return tokens.accessToken;
      } catch (error) {
        if (startedAt !== generation) return null;
        const network = error instanceof AuthError && error.message === 'AUTH_NETWORK_ERROR';
        lastRefreshOutcome = network ? 'network' : 'rejected';
        // Rede instável: o token atual segue válido até expirar. Só um refresh
        // recusado pelo Cognito encerra a sessão.
        if (network && tokens !== null && tokens.expiresAt > clock()) return tokens.accessToken;
        // Falha de rede numa renovação forçada pela API: a sessão continua; quem
        // pediu decide (a porta HTTP trata como indisponibilidade, não perda de acesso).
        if (network && forcing) return null;
        reset();
        notify();
        return null;
      } finally {
        if (startedAt === generation) refreshing = null;
      }
    })();
    return refreshing;
  }

  // `forceRefresh` (AD-27): a API recusou o token atual com 401. Renova pelo
  // refresh token mesmo fora da margem; sem refresh token não há o que tentar.
  let forcing = false;
  async function accessToken({forceRefresh = false, rejected = null} = {}) {
    if (tokens === null) return null;
    if (forceRefresh) {
      if (tokens.refreshToken === null) return null;
      // Outra requisição já renovou depois do 401 desta: usa o token novo sem
      // outra ida ao Cognito (três slices em paralelo recebem 401 juntas).
      if (rejected !== null && tokens.accessToken !== rejected) return tokens.accessToken;
      forcing = true;
      let renewed;
      try { renewed = await refresh(); } finally { forcing = false; }
      // Rede instável na renovação: não é perda de acesso.
      if (lastRefreshOutcome === 'network') throw new AuthError('AUTH_NETWORK_ERROR');
      return renewed;
    }
    if (tokens.expiresAt - clock() >= REFRESH_MARGIN_MS) return tokens.accessToken;
    if (tokens.refreshToken === null) {
      if (tokens.expiresAt > clock()) return tokens.accessToken;
      reset();
      return null;
    }
    return refresh();
  }

  async function signOut() {
    // /oauth2/revoke invalida o refresh token e os access tokens emitidos com ele
    // (o /logout só encerra o cookie do managed login). Melhor esforço: falha de
    // rede não impede o logout.
    const refreshToken = tokens?.refreshToken ?? null;
    reset();
    notify();
    clearPending(sessionStorage);
    if (refreshToken !== null) {
      try {
        await fetch(`${config.cognitoDomain}/oauth2/revoke`, {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({token: refreshToken, client_id: config.clientId}).toString()
        });
      } catch { /* revogação é melhor esforço */ }
    }
    // A volta do /logout não deve disparar `prompt=none`.
    setMarker();
    const params = new URLSearchParams({client_id: config.clientId, logout_uri: `${config.appOrigin}${APP_PATH}`});
    location.assign(`${config.cognitoDomain}/logout?${params.toString()}`);
    return {status: 'redirected'};
  }

  return Object.freeze({
    enabled: true,
    isAuthenticated: () => tokens !== null,
    onChange(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    startLogin,
    completeLogin,
    silentLogin,
    accessToken,
    signOut
  });
}
