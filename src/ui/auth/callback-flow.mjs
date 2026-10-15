// Página /app/auth/callback (AD-9 emendado em 15/10), sem DOM: valida o `state`,
// apaga-o e repassa o `code` para /app/ no fragmento. Não chama o token
// endpoint: a troca acontece em /app/, no mesmo documento que guarda o token.
// Portas: `location` (`pathname`, `search`, `replace`), `history` (`replaceState(url)`) e
// `sessionStorage`. Erros são AuthError com `message === code`.
import {APP_PATH, AuthError, CALLBACK_PATH, clearPending, readPending, safeReturnTo, writePending} from './auth-storage.mjs';

// Respostas do `prompt=none` que só significam "sem sessão no Cognito".
export const UNAUTHENTICATED_ERRORS = Object.freeze(['login_required', 'interaction_required', 'consent_required']);

export function completeCallback({config, ports}) {
  if (!config?.enabled) return {status: 'disabled'};
  const {location, history, sessionStorage, clock = () => Date.now()} = ports ?? {};
  if (!location || !history || !sessionStorage) throw new AuthError('AUTH_PORTS_MISSING');
  const params = new URLSearchParams(typeof location?.search === 'string' ? location.search : '');
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  // A URL com code/state sai do histórico antes de qualquer outra coisa
  // (mantém o caminho servido, com ou sem barra final).
  const path = typeof location.pathname === 'string' && location.pathname.startsWith(CALLBACK_PATH) ? location.pathname : CALLBACK_PATH;
  history.replaceState(path);
  const pending = readPending(sessionStorage);
  const stateMatches = pending !== null && typeof pending.state === 'string' && pending.state !== '' && state === pending.state;

  if (error !== null) {
    clearPending(sessionStorage);
    if (UNAUTHENTICATED_ERRORS.includes(error)) {
      const returnTo = stateMatches ? safeReturnTo(pending.returnTo) : '';
      location.replace(`${APP_PATH}${returnTo}`);
      return {status: 'unauthenticated'};
    }
    throw new AuthError('AUTH_PROVIDER_ERROR');
  }
  if (pending === null || typeof pending.verifier !== 'string' || pending.verifier === '') {
    clearPending(sessionStorage);
    throw new AuthError('AUTH_NO_PENDING_LOGIN');
  }
  if (!stateMatches) {
    clearPending(sessionStorage);
    throw new AuthError('AUTH_STATE_MISMATCH');
  }
  if (code === null || code === '') {
    clearPending(sessionStorage);
    throw new AuthError('AUTH_CODE_MISSING');
  }
  const returnTo = safeReturnTo(pending.returnTo);
  // O `state` é apagado; o verifier fica até a troca em /app/, marcado como
  // validado por esta callback e com prazo curto (o code do Cognito vale 5 min).
  writePending(sessionStorage, {verifier: pending.verifier, returnTo, validatedAt: clock()});
  location.replace(`${APP_PATH}${returnTo}#code=${encodeURIComponent(code)}`);
  return {status: 'forwarded'};
}
