// PKCE S256 próprio (AD-9), sem pacote: só `crypto.getRandomValues` e
// `crypto.subtle`, recebidos como porta para que o mesmo código rode em Node
// (`node --test`) e no navegador. O digest aqui é em bytes, para o challenge em
// base64url; web-digest.mjs devolve hex e não serve para isso.

// Alfabeto não reservado do RFC 7636 §4.1 (RFC 3986 §2.3): 66 caracteres.
export const UNRESERVED = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
export const VERIFIER_LENGTH = 64;
const STATE_BYTES = 32;
// Maior múltiplo de 66 que cabe num byte: bytes acima dele são descartados,
// para que cada caractere do alfabeto tenha a mesma probabilidade.
const LIMIT = 256 - (256 % UNRESERVED.length);

function requireCrypto(crypto) {
  if (typeof crypto?.getRandomValues !== 'function' || typeof crypto?.subtle?.digest !== 'function') {
    throw new TypeError('pkce: crypto.getRandomValues e crypto.subtle são obrigatórios');
  }
  return crypto;
}

export function base64url(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (let index = 0; index < view.length; index += 1) binary += String.fromCharCode(view[index]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createVerifier(crypto) {
  requireCrypto(crypto);
  let verifier = '';
  const buffer = new Uint8Array(VERIFIER_LENGTH * 2);
  while (verifier.length < VERIFIER_LENGTH) {
    crypto.getRandomValues(buffer);
    for (let index = 0; index < buffer.length && verifier.length < VERIFIER_LENGTH; index += 1) {
      if (buffer[index] < LIMIT) verifier += UNRESERVED[buffer[index] % UNRESERVED.length];
    }
  }
  return verifier;
}

// code_challenge = BASE64URL-ENCODE(SHA256(ASCII(code_verifier))), sem padding.
export async function codeChallenge(verifier, crypto) {
  requireCrypto(crypto);
  if (typeof verifier !== 'string' || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) throw new TypeError('pkce: verifier inválido');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(digest);
}

export function createState(crypto) {
  requireCrypto(crypto);
  const bytes = new Uint8Array(STATE_BYTES);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}
