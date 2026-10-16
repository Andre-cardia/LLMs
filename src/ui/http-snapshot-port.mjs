// Porta HTTP única de leitura de snapshot do shell (AD-27). Ainda não ligada:
// o shell continua com src/ui/fixture-source.mjs até o stack existir e o login
// ser ligado. Fornece `readManifest` e `readSlice` com a mesma forma que o
// SnapshotReader espera.
//
// Portas injetadas:
//   apiOrigin            origem HTTPS da API, sem barra final (AD-26)
//   accessToken(opts)    a sessão de src/ui/auth/auth-session.mjs; `{forceRefresh: true}` depois de um 401
//   fetch(url, init)     → Promise<Response-like {ok, status, json(), text()}>
//   onAccessLost()       chamado uma única vez por porta, na primeira AccessDeniedError
//
// Mapeamento: 401 → uma renovação forçada e uma repetição; segundo 401 ou sem
// token → AccessDeniedError. 403 → AccessDeniedError. 404/410 de slice →
// RevisionSupersededError. 5xx, rede ou resposta malformada → SNAPSHOT_HTTP_UNAVAILABLE.
// O token só vai no header Authorization: nunca em URL, log ou mensagem.
import {AccessDeniedError, RevisionSupersededError} from '../contracts/access.mjs';
import {assertManifestResponse, assertRevision, SLICES} from '../contracts/snapshot.mjs';

export const SNAPSHOT_HTTP_UNAVAILABLE = 'SNAPSHOT_HTTP_UNAVAILABLE';
export class SnapshotHttpError extends Error {
  constructor() { super(SNAPSHOT_HTTP_UNAVAILABLE); this.name = 'SnapshotHttpError'; this.code = SNAPSHOT_HTTP_UNAVAILABLE; }
}

function assertApiOrigin(value) {
  let url;
  try { url = new URL(value); } catch { throw new TypeError('createHttpSnapshotPort: apiOrigin'); }
  if (url.protocol !== 'https:' || url.origin !== value) throw new TypeError('createHttpSnapshotPort: apiOrigin');
  return value;
}

export function createHttpSnapshotPort({apiOrigin, accessToken, fetch, onAccessLost} = {}) {
  assertApiOrigin(apiOrigin);
  if (typeof accessToken !== 'function') throw new TypeError('createHttpSnapshotPort: accessToken');
  if (typeof fetch !== 'function') throw new TypeError('createHttpSnapshotPort: fetch');
  if (onAccessLost !== undefined && typeof onAccessLost !== 'function') throw new TypeError('createHttpSnapshotPort: onAccessLost');
  let lost = false;

  // `access-lost` sai uma vez por porta (AD-27): a raiz descarta e só então decide o redirect.
  function denied() {
    if (!lost) {
      lost = true;
      try { onAccessLost?.(); } catch { /* listener da raiz */ }
    }
    return new AccessDeniedError();
  }
  // Prazo por requisição: uma conexão travada não prende o refresh para sempre.
  const REQUEST_TIMEOUT_MS = 15_000;
  async function token(options) {
    // Depois de perder o acesso, nenhuma nova chamada sai até a raiz descartar a porta.
    if (lost) throw new AccessDeniedError();
    let value;
    try { value = await (options === undefined ? accessToken() : accessToken(options)); } catch { throw new SnapshotHttpError(); }
    if (typeof value !== 'string' || value === '') throw denied();
    return value;
  }
  async function send(url, value) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
    try {
      return await fetch(url, {
        signal: controller?.signal,
        method: 'GET',
        headers: {Authorization: `Bearer ${value}`},
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer'
      });
    } catch {
      throw new SnapshotHttpError();
    } finally {
      if (timer !== null) clearTimeout(timer);
    }
  }
  async function request(path, {slice}) {
    const url = `${apiOrigin}${path}`;
    const first = await token();
    let response = await send(url, first);
    if (response?.status === 401) {
      // `rejected` deixa a sessão reaproveitar uma renovação feita por outra slice.
      response = await send(url, await token({forceRefresh: true, rejected: first}));
      if (response?.status === 401) throw denied();
    }
    const status = response?.status;
    if (status === 403) throw denied();
    if (slice && (status === 404 || status === 410)) throw new RevisionSupersededError();
    if (status !== 200 || response.ok === false) throw new SnapshotHttpError();
    return response;
  }

  async function readManifest() {
    const response = await request('/api/v1/snapshot', {slice: false});
    let manifest;
    try { manifest = await response.json(); assertManifestResponse(manifest); } catch { throw new SnapshotHttpError(); }
    return manifest;
  }
  // Os bytes exatos da resposta: sem JSON.parse nem reserialização; o leitor
  // confere o digest sobre este texto.
  async function readSlice(revision, slice) {
    try { assertRevision(revision); } catch { throw new TypeError('readSlice: revision'); }
    if (typeof slice !== 'string' || !SLICES.includes(slice)) throw new TypeError('readSlice: slice');
    const response = await request(`/api/v1/snapshots/${encodeURIComponent(revision)}/${slice}`, {slice: true});
    let bytes;
    try { bytes = await response.text(); } catch { throw new SnapshotHttpError(); }
    if (typeof bytes !== 'string') throw new SnapshotHttpError();
    return bytes;
  }
  return Object.freeze({readManifest, readSlice, get accessLost() { return lost; }});
}
