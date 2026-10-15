import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {AUTH_CONFIG} from '../src/ui/auth/auth-config.mjs';
import {AuthError, PENDING_KEY, SILENT_MARKER_KEY} from '../src/ui/auth/auth-storage.mjs';
import {completeCallback} from '../src/ui/auth/callback-flow.mjs';
import {createAuthSession, REFRESH_MARGIN_MS} from '../src/ui/auth/auth-session.mjs';
import {UNRESERVED, VERIFIER_LENGTH, base64url, codeChallenge, createState, createVerifier} from '../src/ui/auth/pkce.mjs';

const CONFIG = Object.freeze({
  enabled: true,
  cognitoDomain: 'https://auth.example.invalid',
  clientId: 'testclient123',
  appOrigin: 'https://app.example.invalid',
  scopes: Object.freeze(['llms-api/read', 'llms-api/write'])
});
const REDIRECT_URI = 'https://app.example.invalid/app/auth/callback';

// sessionStorage compartilhado entre /app/ e a callback (mesma aba).
function fakeSessionStorage() {
  const data = new Map();
  return {data,
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => { data.set(key, String(value)); },
    removeItem: key => { data.delete(key); }};
}
// Registra toda URL que passou pela barra de endereço ou pelo histórico.
function fakeBrowser({href = 'https://app.example.invalid/app/', storage = fakeSessionStorage()} = {}) {
  const urls = [];
  const navigations = [];
  let current = new URL(href);
  const location = {
    get pathname() { return current.pathname; },
    get search() { return current.search; },
    get hash() { return current.hash; },
    assign(url) { navigations.push({method: 'assign', url}); },
    replace(url) { navigations.push({method: 'replace', url}); }
  };
  const history = {replaceState(url) { current = new URL(url, current); urls.push(current.href); }};
  return {location, history, storage, urls, navigations, open(url) { current = new URL(url, current); urls.push(current.href); }};
}
function fakeFetch(responses) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({url, init, params: Object.fromEntries(new URLSearchParams(init.body))});
    const next = responses.shift();
    if (next === undefined) throw new Error('fetch inesperado');
    if (next instanceof Error) throw next;
    return {ok: next.status >= 200 && next.status < 300, status: next.status, json: async () => next.body};
  };
  return {fetch, calls};
}
function clock(start = 1_000_000) {
  const c = () => c.now;
  c.now = start;
  return c;
}
function session({browser = fakeBrowser(), responses = [], now = clock()} = {}) {
  const {fetch, calls} = fakeFetch(responses);
  const auth = createAuthSession({config: CONFIG, ports: {fetch, location: browser.location, history: browser.history, sessionStorage: browser.storage, crypto: webcrypto, clock: now}});
  return {auth, browser, calls, now};
}
const tokenBody = (extra = {}) => ({access_token: 'access-1', refresh_token: 'refresh-1', id_token: 'id-1', expires_in: 3600, token_type: 'Bearer', ...extra});
const pending = storage => JSON.parse(storage.getItem(PENDING_KEY));
const authorizeParams = url => {
  const parsed = new URL(url);
  assert.equal(`${parsed.origin}${parsed.pathname}`, 'https://auth.example.invalid/oauth2/authorize');
  return Object.fromEntries(parsed.searchParams);
};
const errorCode = code => error => { assert.ok(error instanceof AuthError); assert.equal(error.code, code); assert.equal(error.message, code); return true; };

// ---------- PKCE ----------

test('PKCE: verifier tem 64 caracteres do alfabeto não reservado do RFC 7636', () => {
  assert.equal(UNRESERVED.length, 66);
  for (let i = 0; i < 50; i += 1) {
    const verifier = createVerifier(webcrypto);
    assert.equal(verifier.length, VERIFIER_LENGTH);
    assert.match(verifier, /^[A-Za-z0-9._~-]{64}$/);
  }
});

test('PKCE: challenge S256 do verifier de exemplo é o vetor do RFC 7636 apêndice B', async () => {
  const octets = [116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173, 187, 186, 22, 212, 37, 77, 105, 214, 191, 240, 91, 88, 5, 88, 83, 132, 141, 121];
  const verifier = base64url(new Uint8Array(octets));
  assert.equal(verifier, 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  assert.equal(await codeChallenge(verifier, webcrypto), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  assert.equal(base64url(new Uint8Array([3, 236, 255, 224, 193])), 'A-z_4ME'); // apêndice A
});

test('PKCE: distribuição uniforme (bytes acima do maior múltiplo de 66 são descartados)', () => {
  // getRandomValues determinístico: 198..255 (acima do maior múltiplo de 66) são descartados.
  let next = 0;
  const crypto = {getRandomValues(buffer) { for (let i = 0; i < buffer.length; i += 1) buffer[i] = (next++ % 2 === 0) ? 255 : 0; return buffer; }, subtle: webcrypto.subtle};
  assert.equal(createVerifier(crypto), 'A'.repeat(64));
});

test('PKCE: state tem 32 bytes aleatórios em base64url sem padding', () => {
  const state = createState(webcrypto);
  assert.match(state, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(createState(webcrypto), state);
});

// ---------- Desligado ----------

test('desligado: a configuração do repositório tem enabled false e nenhum valor real', () => {
  assert.equal(AUTH_CONFIG.enabled, false);
  assert.equal(AUTH_CONFIG.cognitoDomain, '');
  assert.equal(AUTH_CONFIG.clientId, '');
  assert.equal(AUTH_CONFIG.appOrigin, '');
  assert.deepEqual([...AUTH_CONFIG.scopes], ['llms-api/read', 'llms-api/write']);
  assert.ok(Object.isFrozen(AUTH_CONFIG));
});

test('desligado: nenhuma porta de auth é lida nem chamada (Proxy)', async () => {
  const touched = [];
  const trap = name => new Proxy({}, {get(_, key) { touched.push(`${name}.${String(key)}`); return () => {}; }, has() { touched.push(name); return true; }});
  const ports = new Proxy({}, {get(_, key) { touched.push(String(key)); return trap(String(key)); }});
  const auth = createAuthSession({config: AUTH_CONFIG, ports});
  assert.equal(auth.enabled, false);
  assert.deepEqual(await auth.completeLogin(), {status: 'disabled'});
  assert.deepEqual(await auth.silentLogin(), {status: 'disabled'});
  assert.deepEqual(await auth.startLogin(), {status: 'disabled'});
  assert.equal(await auth.accessToken(), null);
  assert.deepEqual(auth.signOut(), {status: 'disabled'});
  assert.deepEqual(completeCallback({config: AUTH_CONFIG, ports}), {status: 'disabled'});
  assert.deepEqual(touched, []);
});

test('desligado: main.mjs só monta a auth quando AUTH_CONFIG.enabled', async () => {
  const text = await readFile(new URL('../src/ui/main.mjs', import.meta.url), 'utf8');
  assert.match(text, /if \(AUTH_CONFIG\.enabled\) \{[\s\S]*?bootAuth\(\)/);
  assert.equal((text.match(/createAuthSession\(/g) ?? []).length, 1);
  // completeLogin roda antes do shell (e portanto antes do hydrateUrl de start()).
  assert.ok(text.indexOf('await bootAuth()') < text.indexOf('createBrowserShell({'));
  const html = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
  assert.match(html, /<button id="auth-button" type="button" hidden>/);
});

test('configuração ligada inválida (http, caminho, client id vazio) é recusada', () => {
  for (const bad of [{cognitoDomain: 'http://auth.example.invalid'}, {appOrigin: 'https://app.example.invalid/app'}, {clientId: ''}, {scopes: []}]) {
    assert.throws(() => createAuthSession({config: {...CONFIG, ...bad}, ports: {}}), errorCode('AUTH_CONFIG_INVALID'));
  }
});

// ---------- Início do login ----------

test('início do login: 1 redirect para /oauth2/authorize com todos os parâmetros e sessionStorage só com verifier/state/returnTo', async () => {
  const browser = fakeBrowser({href: 'https://app.example.invalid/app/?company=c1&tab=models'});
  const {auth, calls} = session({browser});
  assert.deepEqual(await auth.startLogin(), {status: 'redirected'});
  assert.equal(browser.navigations.length, 1);
  assert.equal(browser.navigations[0].method, 'assign');
  const params = authorizeParams(browser.navigations[0].url);
  const saved = pending(browser.storage);
  assert.deepEqual(Object.keys(saved).sort(), ['returnTo', 'state', 'verifier']);
  assert.equal(saved.returnTo, '?company=c1&tab=models');
  assert.deepEqual(params, {
    response_type: 'code', client_id: 'testclient123', redirect_uri: REDIRECT_URI, scope: 'llms-api/read llms-api/write',
    state: saved.state, code_challenge: await codeChallenge(saved.verifier, webcrypto), code_challenge_method: 'S256'
  });
  assert.equal(browser.storage.data.size, 1);
  assert.deepEqual(calls, []);
});

// ---------- Callback ----------

function callbackPorts(browser, now) {
  return {location: browser.location, history: browser.history, sessionStorage: browser.storage, clock: now ?? (() => 1_000_000)};
}
async function startedLogin(href = 'https://app.example.invalid/app/?company=c1') {
  const browser = fakeBrowser({href});
  const made = session({browser});
  await made.auth.startLogin();
  return {...made, saved: pending(browser.storage)};
}

test('callback ok: nenhum POST; URL limpa; location.replace para /app/ + returnTo + #code; state apagado', async () => {
  const {browser, calls, saved} = await startedLogin();
  browser.open(`${REDIRECT_URI}?code=c&state=${saved.state}`);
  const result = completeCallback({config: CONFIG, ports: callbackPorts(browser)});
  assert.deepEqual(result, {status: 'forwarded'});
  assert.deepEqual(calls, []);
  assert.equal(browser.urls.at(-1), REDIRECT_URI);
  assert.deepEqual(browser.navigations.at(-1), {method: 'replace', url: '/app/?company=c1#code=c'});
  assert.deepEqual(pending(browser.storage), {verifier: saved.verifier, returnTo: '?company=c1', validatedAt: 1_000_000});
});

test('callback: URL com barra final é limpa mantendo o caminho servido', async () => {
  const {browser, saved} = await startedLogin();
  browser.open(`${REDIRECT_URI}/?code=c&state=${saved.state}`);
  completeCallback({config: CONFIG, ports: callbackPorts(browser)});
  assert.equal(browser.urls.at(-1), `${REDIRECT_URI}/`);
});

test('state divergente: sem POST, erro tipado, chave apagada e sem code na mensagem', async () => {
  const {browser, calls} = await startedLogin();
  browser.open(`${REDIRECT_URI}?code=secret-code&state=outro`);
  assert.throws(() => completeCallback({config: CONFIG, ports: callbackPorts(browser)}), error => {
    errorCode('AUTH_STATE_MISMATCH')(error);
    assert.doesNotMatch(error.message + String(error.stack), /secret-code/);
    return true;
  });
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
  assert.deepEqual(calls, []);
  assert.equal(browser.navigations.filter(n => n.method === 'replace').length, 0);
  assert.equal(browser.urls.at(-1), REDIRECT_URI);
});

test('state ausente: recusado como divergente', async () => {
  const {browser} = await startedLogin();
  browser.open(`${REDIRECT_URI}?code=c`);
  assert.throws(() => completeCallback({config: CONFIG, ports: callbackPorts(browser)}), errorCode('AUTH_STATE_MISMATCH'));
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
});

test('sem chave salva: callback aberto direto → sem POST e erro tipado', () => {
  const browser = fakeBrowser({href: `${REDIRECT_URI}?code=c&state=s`});
  assert.throws(() => completeCallback({config: CONFIG, ports: callbackPorts(browser)}), errorCode('AUTH_NO_PENDING_LOGIN'));
  assert.deepEqual(browser.navigations, []);
  assert.equal(browser.urls.at(-1), REDIRECT_URI);
});

test('erro do Cognito: ?error=access_denied → sem POST, chave apagada, mensagem sem detalhes do provedor', async () => {
  const {browser, calls, saved} = await startedLogin();
  browser.open(`${REDIRECT_URI}?error=access_denied&error_description=detalhe-sensivel&state=${saved.state}`);
  assert.throws(() => completeCallback({config: CONFIG, ports: callbackPorts(browser)}), error => {
    errorCode('AUTH_PROVIDER_ERROR')(error);
    assert.doesNotMatch(error.message, /access_denied|detalhe-sensivel/);
    return true;
  });
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
  assert.deepEqual(calls, []);
  assert.equal(browser.urls.at(-1), REDIRECT_URI);
});

test('callback: login_required, interaction_required e consent_required voltam para /app/ + returnTo como não autenticado', async () => {
  for (const error of ['login_required', 'interaction_required', 'consent_required']) {
    const {browser, saved} = await startedLogin();
    browser.open(`${REDIRECT_URI}?error=${error}&state=${saved.state}`);
    assert.deepEqual(completeCallback({config: CONFIG, ports: callbackPorts(browser)}), {status: 'unauthenticated'});
    assert.deepEqual(browser.navigations.at(-1), {method: 'replace', url: '/app/?company=c1'});
    assert.equal(browser.storage.getItem(PENDING_KEY), null);
  }
});

test('callback: returnTo salvo que não seja query do shell vira vazio (nunca URL completa)', async () => {
  const browser = fakeBrowser({href: `${REDIRECT_URI}?code=c&state=s`});
  browser.storage.setItem(PENDING_KEY, JSON.stringify({verifier: 'v'.repeat(64), state: 's', returnTo: 'https://evil.example/'}));
  completeCallback({config: CONFIG, ports: callbackPorts(browser)});
  assert.deepEqual(browser.navigations.at(-1), {method: 'replace', url: '/app/#code=c'});
});

// ---------- Conclusão em /app/ ----------

async function forwarded() {
  const started = await startedLogin();
  started.browser.open(`${REDIRECT_URI}?code=the-code&state=${started.saved.state}`);
  completeCallback({config: CONFIG, ports: callbackPorts(started.browser)});
  // O navegador segue o location.replace para /app/.
  started.browser.open(started.browser.navigations.at(-1).url);
  return started;
}

test('conclusão em /app/: 1 POST correto, fragmento limpo antes do POST, verifier apagado, token em memória', async () => {
  const {browser, saved} = await forwarded();
  const order = [];
  const {fetch, calls} = fakeFetch([{status: 200, body: tokenBody()}]);
  const history = {replaceState(url) { order.push('replaceState'); browser.history.replaceState(url); }};
  const auth = createAuthSession({config: CONFIG, ports: {fetch: (...args) => { order.push('fetch'); return fetch(...args); }, location: browser.location, history, sessionStorage: browser.storage, crypto: webcrypto, clock: clock()}});
  assert.deepEqual(await auth.completeLogin(), {status: 'authenticated'});
  assert.deepEqual(order, ['replaceState', 'fetch']);
  assert.equal(browser.urls.at(-1), 'https://app.example.invalid/app/?company=c1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://auth.example.invalid/oauth2/token');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.deepEqual(calls[0].params, {grant_type: 'authorization_code', client_id: 'testclient123', code: 'the-code', code_verifier: saved.verifier, redirect_uri: REDIRECT_URI});
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
  assert.equal(await auth.accessToken(), 'access-1');
});

test('fragmento órfão: #code sem verifier salvo → nenhum POST, fragmento limpo', async () => {
  const browser = fakeBrowser({href: 'https://app.example.invalid/app/?company=c1#code=c'});
  const {auth, calls} = session({browser});
  assert.deepEqual(await auth.completeLogin(), {status: 'ignored'});
  assert.deepEqual(calls, []);
  assert.equal(browser.urls.at(-1), 'https://app.example.invalid/app/?company=c1');
  assert.equal(await auth.accessToken(), null);
});

test('sem fragmento: completeLogin não toca history nem fetch', async () => {
  const {auth, calls, browser} = session();
  assert.deepEqual(await auth.completeLogin(), {status: 'none'});
  assert.deepEqual(browser.urls, []);
  assert.deepEqual(calls, []);
});

test('token endpoint 400 invalid_grant: erro tipado, nada em memória, verifier apagado', async () => {
  const {browser} = await forwarded();
  const {auth, calls} = session({browser, responses: [{status: 400, body: {error: 'invalid_grant'}}]});
  await assert.rejects(auth.completeLogin(), error => {
    errorCode('AUTH_TOKEN_REJECTED')(error);
    assert.doesNotMatch(error.message, /invalid_grant|the-code/);
    return true;
  });
  assert.equal(calls.length, 1);
  assert.equal(auth.isAuthenticated(), false);
  assert.equal(await auth.accessToken(), null);
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
});

test('resposta de token sem access_token ou expires_in é recusada', async () => {
  for (const body of [{expires_in: 3600}, {access_token: 'a'}, {access_token: 'a', expires_in: -1}]) {
    const {browser} = await forwarded();
    const {auth} = session({browser, responses: [{status: 200, body}]});
    await assert.rejects(auth.completeLogin(), errorCode('AUTH_TOKEN_RESPONSE_INVALID'));
    assert.equal(auth.isAuthenticated(), false);
  }
});

test('falha de rede no token endpoint: AUTH_NETWORK_ERROR', async () => {
  const {browser} = await forwarded();
  const {auth} = session({browser, responses: [new Error('offline the-code')]});
  await assert.rejects(auth.completeLogin(), errorCode('AUTH_NETWORK_ERROR'));
});

// ---------- Renovação ----------

async function authenticated({responses = [], now = clock()} = {}) {
  const {browser} = await forwarded();
  const made = session({browser, responses: [{status: 200, body: tokenBody()}, ...responses], now});
  await made.auth.completeLogin();
  return made;
}

test('renovação: accessToken() a 30 s do fim faz 1 POST refresh_token e devolve o token novo', async () => {
  const now = clock();
  const {auth, calls} = await authenticated({now, responses: [{status: 200, body: {access_token: 'access-2', expires_in: 3600, token_type: 'Bearer'}}]});
  now.now += 3600_000 - REFRESH_MARGIN_MS - 1;
  assert.equal(await auth.accessToken(), 'access-1'); // ainda a mais de 60 s
  now.now += 30_001; // a ~30 s do fim
  assert.equal(await auth.accessToken(), 'access-2');
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].params, {grant_type: 'refresh_token', client_id: 'testclient123', refresh_token: 'refresh-1'});
  assert.equal(calls[1].init.headers['Content-Type'], 'application/x-www-form-urlencoded');
});

test('renovação: sem refresh_token na resposta, o anterior continua valendo', async () => {
  const now = clock();
  const {auth, calls} = await authenticated({now, responses: [{status: 200, body: {access_token: 'access-2', expires_in: 3600}}, {status: 200, body: {access_token: 'access-3', expires_in: 3600}}]});
  now.now += 3600_000 - 30_000;
  assert.equal(await auth.accessToken(), 'access-2');
  now.now += 3600_000;
  assert.equal(await auth.accessToken(), 'access-3');
  assert.equal(calls[2].params.refresh_token, 'refresh-1');
});

test('renovação: chamadas simultâneas compartilham um único POST', async () => {
  const now = clock();
  const {auth, calls} = await authenticated({now, responses: [{status: 200, body: {access_token: 'access-2', expires_in: 3600}}]});
  now.now += 3600_000 - 30_000;
  const tokens = await Promise.all([auth.accessToken(), auth.accessToken(), auth.accessToken()]);
  assert.deepEqual(tokens, ['access-2', 'access-2', 'access-2']);
  assert.equal(calls.length, 2);
});

test('renovação falha: sessão zerada e accessToken() devolve null', async () => {
  const now = clock();
  const {auth, calls} = await authenticated({now, responses: [{status: 400, body: {error: 'invalid_grant'}}]});
  now.now += 3600_000 - 30_000;
  assert.equal(await auth.accessToken(), null);
  assert.equal(auth.isAuthenticated(), false);
  assert.equal(await auth.accessToken(), null);
  assert.equal(calls.length, 2);
});

test('renovação: token renovado depois do signOut é descartado', async () => {
  const now = clock();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const {browser} = await forwarded();
  const {fetch, calls} = fakeFetch([{status: 200, body: tokenBody()}, {status: 200, body: {access_token: 'late', expires_in: 3600}}, {status: 200, body: {}}]);
  // Só o POST de refresh fica preso; o /oauth2/revoke do signOut segue livre.
  const slowFetch = async (url, init) => { if (String(init?.body).includes('grant_type=refresh_token')) await gate; return fetch(url, init); };
  const auth = createAuthSession({config: CONFIG, ports: {fetch: slowFetch, location: browser.location, history: browser.history, sessionStorage: browser.storage, crypto: webcrypto, clock: now}});
  await auth.completeLogin();
  now.now += 3600_000 - 30_000;
  const pendingToken = auth.accessToken();
  const signedOut = auth.signOut();
  release();
  await signedOut;
  assert.equal(await pendingToken, null);
  assert.equal(auth.isAuthenticated(), false);
  assert.equal(await auth.accessToken(), null);
});

test('expiração vem de expires_in e do relógio, não do JWT', async () => {
  const now = clock();
  // access_token não é JWT: se o código o decodificasse, falharia.
  const {auth, calls} = await authenticated({now});
  now.now += 3600_000 - REFRESH_MARGIN_MS;
  assert.equal(await auth.accessToken(), 'access-1');
  assert.equal(calls.length, 1);
  const source = await readFile(new URL('../src/ui/auth/auth-session.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /atob|split\('\.'\)|\.exp\b|claims/);
});

// ---------- Silencioso ----------

test('silencioso sem sessão: prompt=none uma vez; volta com login_required → não autenticado, sem novo redirect', async () => {
  const storage = fakeSessionStorage();
  // Carga 1 de /app/: sem token e sem marcador → uma ida com prompt=none.
  const first = fakeBrowser({href: 'https://app.example.invalid/app/?company=c1', storage});
  const load1 = session({browser: first});
  assert.deepEqual(await load1.auth.completeLogin(), {status: 'none'});
  assert.deepEqual(await load1.auth.silentLogin(), {status: 'redirected'});
  assert.equal(first.navigations.length, 1);
  const params = authorizeParams(first.navigations[0].url);
  assert.equal(params.prompt, 'none');
  assert.equal(storage.getItem(SILENT_MARKER_KEY), '1');
  // Cognito devolve login_required na callback.
  const saved = pending(storage);
  const callback = fakeBrowser({href: `${REDIRECT_URI}?error=login_required&state=${saved.state}`, storage});
  assert.deepEqual(completeCallback({config: CONFIG, ports: callbackPorts(callback)}), {status: 'unauthenticated'});
  // Carga 2 de /app/ (a volta): o marcador impede outra ida.
  const second = fakeBrowser({href: `https://app.example.invalid${callback.navigations.at(-1).url}`, storage});
  const load2 = session({browser: second});
  assert.deepEqual(await load2.auth.completeLogin(), {status: 'none'});
  assert.deepEqual(await load2.auth.silentLogin(), {status: 'unauthenticated'});
  assert.deepEqual(second.navigations, []);
  assert.equal(await load2.auth.accessToken(), null);
  assert.deepEqual(load1.calls, []);
  assert.deepEqual(load2.calls, []);
});

test('silencioso com sessão no Cognito: a volta troca o code e termina autenticada em /app/', async () => {
  const storage = fakeSessionStorage();
  const first = fakeBrowser({href: 'https://app.example.invalid/app/?company=c1', storage});
  await session({browser: first}).auth.silentLogin();
  const saved = pending(storage);
  const callback = fakeBrowser({href: `${REDIRECT_URI}?code=silent-code&state=${saved.state}`, storage});
  completeCallback({config: CONFIG, ports: callbackPorts(callback)});
  const back = fakeBrowser({href: `https://app.example.invalid${callback.navigations.at(-1).url}`, storage});
  const load2 = session({browser: back, responses: [{status: 200, body: tokenBody()}]});
  assert.deepEqual(await load2.auth.completeLogin(), {status: 'authenticated'});
  assert.equal(load2.calls[0].params.code, 'silent-code');
  assert.equal(await load2.auth.accessToken(), 'access-1');
  assert.equal(storage.getItem(SILENT_MARKER_KEY), null);
  assert.deepEqual(back.navigations, []);
});

// ---------- Logout ----------

test('logout: memória zerada e redirect para /logout com client_id e logout_uri; a volta não dispara prompt=none', async () => {
  const {auth, browser, calls} = await authenticated({responses: [{status: 200, body: {}}]});
  assert.equal(await auth.accessToken(), 'access-1');
  assert.deepEqual(await auth.signOut(), {status: 'redirected'});
  // /oauth2/revoke invalida o refresh token antes do /logout.
  const revoke = calls.at(-1);
  assert.equal(revoke.url, 'https://auth.example.invalid/oauth2/revoke');
  assert.deepEqual(revoke.params, {token: 'refresh-1', client_id: 'testclient123'});
  assert.equal(auth.isAuthenticated(), false);
  assert.equal(await auth.accessToken(), null);
  const url = new URL(browser.navigations.at(-1).url);
  assert.equal(`${url.origin}${url.pathname}`, 'https://auth.example.invalid/logout');
  assert.deepEqual(Object.fromEntries(url.searchParams), {client_id: 'testclient123', logout_uri: 'https://app.example.invalid/app/'});
  // Volta do /logout: nova carga de /app/ com o mesmo sessionStorage.
  const back = fakeBrowser({href: 'https://app.example.invalid/app/', storage: browser.storage});
  const reload = session({browser: back});
  assert.deepEqual(await reload.auth.silentLogin(), {status: 'unauthenticated'});
  assert.deepEqual(back.navigations, []);
});

// ---------- Fluxo completo ----------

test('login completo: início → callback → conclusão → renovação → logout, sem nada sensível em sessionStorage, histórico ou mensagens', async () => {
  const storage = fakeSessionStorage();
  const now = clock();
  const seen = {urls: [], messages: []};
  // /app/ inicial: Entrar.
  const app1 = fakeBrowser({href: 'https://app.example.invalid/app/?company=c1', storage});
  const s1 = session({browser: app1, now});
  await s1.auth.startLogin();
  const {verifier, state} = pending(storage);
  // Cognito → callback com code (a URL fica no histórico só até o replaceState).
  const cb = fakeBrowser({href: `${REDIRECT_URI}?code=CODE-XYZ&state=${state}`, storage});
  completeCallback({config: CONFIG, ports: callbackPorts(cb)});
  // Depois do callback, sessionStorage não tem token nem code.
  for (const value of storage.data.values()) assert.doesNotMatch(value, /CODE-XYZ|access-|refresh-/);
  seen.urls.push(...cb.urls);
  // /app/ com #code=: conclusão, renovação e logout.
  const app2 = fakeBrowser({href: `https://app.example.invalid${cb.navigations.at(-1).url}`, storage});
  const s2 = session({browser: app2, now, responses: [{status: 200, body: tokenBody({access_token: 'access-AAA', refresh_token: 'refresh-BBB'})}, {status: 200, body: {access_token: 'access-CCC', expires_in: 3600}}, {status: 400, body: {error: 'invalid_grant'}}]});
  await s2.auth.completeLogin();
  assert.equal(await s2.auth.accessToken(), 'access-AAA');
  now.now += 3600_000 - 30_000;
  assert.equal(await s2.auth.accessToken(), 'access-CCC');
  await s2.auth.signOut();
  seen.urls.push(...app2.urls);
  // Erros possíveis no caminho: nenhum leva dado sensível.
  for (const run of [
    () => completeCallback({config: CONFIG, ports: callbackPorts(fakeBrowser({href: `${REDIRECT_URI}?code=CODE-XYZ&state=bad`, storage: fakeSessionStorage()}))}),
    () => completeCallback({config: CONFIG, ports: callbackPorts(fakeBrowser({href: `${REDIRECT_URI}?error=server_error&error_description=CODE-XYZ`}))})
  ]) {
    try { run(); } catch (error) { seen.messages.push(error.message, String(error.stack)); }
  }
  const bad = await forwarded();
  const failing = session({browser: bad.browser, responses: [{status: 400, body: {error: 'invalid_grant', error_description: 'CODE-XYZ access-AAA'}}]});
  await failing.auth.completeLogin().catch(error => seen.messages.push(error.message, String(error.stack)));
  assert.ok(seen.messages.length >= 4);
  const secrets = ['CODE-XYZ', 'the-code', verifier, 'access-AAA', 'access-CCC', 'refresh-BBB'];
  // Histórico: só URLs limpas ficam (a URL de chegada com code é substituída).
  assert.deepEqual(seen.urls, [REDIRECT_URI, 'https://app.example.invalid/app/?company=c1']);
  for (const text of [...seen.urls, ...seen.messages, ...storage.data.values()]) {
    for (const secret of secrets) assert.ok(!text.includes(secret), `${secret} vazou em ${text}`);
  }
  // Logout não leva token na URL.
  for (const nav of app2.navigations) for (const secret of secrets) assert.ok(!nav.url.includes(secret));
  assert.equal(storage.getItem(PENDING_KEY), null);
});

// ---------- Guardas ----------

test('guarda: src/ui/auth não usa localStorage, pacote, node:, adapters, nem chama a API', async () => {
  for (const name of ['pkce.mjs', 'auth-config.mjs', 'auth-storage.mjs', 'auth-session.mjs', 'callback-flow.mjs', 'callback.mjs']) {
    const text = (await readFile(new URL(`../src/ui/auth/${name}`, import.meta.url), 'utf8'))
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
    assert.doesNotMatch(text, /localStorage|whoami|\/api\/v1|console\./, name);
    assert.doesNotMatch(text, /from\s+['"](node:|[^.'"][^'"]*|.*\/adapters\/)/, name);
  }
  for (const name of ['pkce.mjs', 'auth-storage.mjs', 'auth-session.mjs', 'callback-flow.mjs']) {
    const text = (await readFile(new URL(`../src/ui/auth/${name}`, import.meta.url), 'utf8'))
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
    assert.doesNotMatch(text, /\bwindow\b|\bdocument\b|globalThis/, `${name} recebe tudo por porta`);
  }
});

// ---------- Revisão ----------

test('revisão: PKCE mantém 197 e descarta 198, o limite do maior múltiplo de 66', () => {
  let next = 0;
  const seq = [198, 197];
  const crypto = {getRandomValues(buffer) { for (let i = 0; i < buffer.length; i += 1) buffer[i] = seq[next++ % 2]; return buffer; }, subtle: webcrypto.subtle};
  // 197 % 66 = 65, o último símbolo do alfabeto ('~'); 198 nunca entra.
  assert.equal(createVerifier(crypto), '~'.repeat(64));
});

test('revisão: callback com state válido e sem code → AUTH_CODE_MISSING, chave apagada, sem redirect', async () => {
  const {browser, saved} = await startedLogin();
  browser.open(`${REDIRECT_URI}?state=${saved.state}`);
  const before = browser.navigations.length; // o redirect do startLogin já está registrado
  assert.throws(() => completeCallback({config: CONFIG, ports: callbackPorts(browser)}), errorCode('AUTH_CODE_MISSING'));
  assert.equal(browser.storage.getItem(PENDING_KEY), null);
  assert.equal(browser.navigations.length, before);
});

test('revisão: #code= forjado não consome o verifier de um login ainda não validado pela callback', async () => {
  const {browser, auth, calls} = await startedLogin();
  browser.open('https://app.example.invalid/app/#code=forjado');
  assert.deepEqual(await auth.completeLogin(), {status: 'ignored'});
  assert.deepEqual(calls, []);
  assert.equal(auth.isAuthenticated(), false);
});

test('revisão: code repassado há mais de 5 min é ignorado', async () => {
  const now = clock();
  const {browser} = await forwarded();
  now.now += 5 * 60 * 1000 + 1;
  const {auth, calls} = session({browser, now});
  assert.deepEqual(await auth.completeLogin(), {status: 'ignored'});
  assert.deepEqual(calls, []);
});

test('revisão: sem refresh_token no login, o token vale até expirar e depois a sessão zera sem POST', async () => {
  const now = clock();
  const {browser} = await forwarded();
  const made = session({browser, responses: [{status: 200, body: {access_token: 'only', expires_in: 3600, token_type: 'Bearer'}}], now});
  await made.auth.completeLogin();
  now.now += 3600_000 - 30_000;
  assert.equal(await made.auth.accessToken(), 'only');
  now.now += 30_001;
  assert.equal(await made.auth.accessToken(), null);
  assert.equal(made.auth.isAuthenticated(), false);
  assert.equal(made.calls.length, 1);
});

test('revisão: token_type diferente de Bearer e refresh_token vazio ou não string são recusados', async () => {
  for (const body of [tokenBody({token_type: 'mac'}), tokenBody({refresh_token: ''}), tokenBody({refresh_token: 42})]) {
    const {browser} = await forwarded();
    const {auth} = session({browser, responses: [{status: 200, body}]});
    await assert.rejects(auth.completeLogin(), errorCode('AUTH_TOKEN_RESPONSE_INVALID'));
    assert.equal(auth.isAuthenticated(), false);
  }
});

test('revisão: falha de rede na renovação mantém o token que ainda vale', async () => {
  const now = clock();
  const made = await authenticated({responses: [new Error('offline')], now});
  now.now += 3600_000 - 30_000;
  assert.equal(await made.auth.accessToken(), 'access-1');
  assert.equal(made.auth.isAuthenticated(), true);
});

test('revisão: renovação recusada avisa a página (botão volta a Entrar)', async () => {
  const now = clock();
  const made = await authenticated({responses: [{status: 400, body: {error: 'invalid_grant'}}], now});
  const seen = [];
  made.auth.onChange(value => seen.push(value));
  now.now += 3600_000 - 30_000;
  assert.equal(await made.auth.accessToken(), null);
  assert.deepEqual(seen, [false]);
});

test('revisão: sem sessão no Cognito, recargas seguintes não redirecionam de novo; startLogin libera', async () => {
  const browser = fakeBrowser({href: 'https://app.example.invalid/app/'});
  const first = session({browser});
  assert.deepEqual(await first.auth.silentLogin(), {status: 'redirected'});
  for (let i = 0; i < 3; i += 1) {
    const again = session({browser: fakeBrowser({href: 'https://app.example.invalid/app/', storage: browser.storage})});
    assert.deepEqual(await again.auth.silentLogin(), {status: 'unauthenticated'});
  }
  assert.equal(browser.navigations.length, 1);
  const explicit = session({browser});
  await explicit.auth.startLogin();
  assert.equal(browser.storage.getItem(SILENT_MARKER_KEY), null);
});

test('revisão: logout revoga o refresh token mesmo se o /oauth2/revoke falhar', async () => {
  const made = await authenticated({responses: [new Error('offline')]});
  assert.deepEqual(await made.auth.signOut(), {status: 'redirected'});
  assert.equal(made.calls.at(-1).url, 'https://auth.example.invalid/oauth2/revoke');
  assert.equal(new URL(made.browser.navigations.at(-1).url).pathname, '/logout');
});

test('revisão: callback sem portas lança AuthError tipado', () => {
  assert.throws(() => completeCallback({config: CONFIG, ports: {}}), errorCode('AUTH_PORTS_MISSING'));
});
