// Estado comum ao shell (/app/) e à página de callback (/app/auth/callback):
// erro tipado, chaves de `sessionStorage` e validação da configuração.
// `sessionStorage` guarda só `{verifier, state, returnTo}` sob PENDING_KEY,
// durante o redirect, e o marcador do login silencioso. Nunca token nem code.

export const PENDING_KEY = 'llms.auth.pending';
export const SILENT_MARKER_KEY = 'llms.auth.silent';
export const CALLBACK_PATH = '/app/auth/callback';
export const APP_PATH = '/app/';

// `message === code`: nenhuma mensagem carrega code, token, verifier ou texto do provedor.
export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Só a query do shell (`''` ou `?…`), nunca URL completa nem fragmento.
export function safeReturnTo(value) {
  if (typeof value !== 'string' || value === '') return '';
  if (!value.startsWith('?') || value.includes('#') || /[\s\\]/.test(value) || value.length > 2048) return '';
  return value;
}

export function readPending(storage) {
  let raw;
  try { raw = storage.getItem(PENDING_KEY); } catch { return null; }
  if (typeof raw !== 'string') return null;
  try {
    const value = JSON.parse(raw);
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
    return value;
  } catch {
    return null;
  }
}

export function writePending(storage, value) {
  storage.setItem(PENDING_KEY, JSON.stringify(value));
}

export function clearPending(storage) {
  try { storage.removeItem(PENDING_KEY); } catch { /* storage indisponível: nada a apagar */ }
}

const httpsOrigin = value => {
  if (typeof value !== 'string' || value === '') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.origin === value && !url.username && !url.password;
  } catch {
    return false;
  }
};

// Configuração ligada precisa de origens HTTPS sem caminho e de um client id.
export function assertEnabledConfig(config) {
  if (!httpsOrigin(config.cognitoDomain) || !httpsOrigin(config.appOrigin)) throw new AuthError('AUTH_CONFIG_INVALID');
  if (typeof config.clientId !== 'string' || !/^[A-Za-z0-9]+$/.test(config.clientId)) throw new AuthError('AUTH_CONFIG_INVALID');
  if (!Array.isArray(config.scopes) || config.scopes.length === 0 || config.scopes.some(scope => typeof scope !== 'string' || !/^[\w./:-]+$/.test(scope))) {
    throw new AuthError('AUTH_CONFIG_INVALID');
  }
  return config;
}

export const redirectUri = config => `${config.appOrigin}${CALLBACK_PATH}`;
