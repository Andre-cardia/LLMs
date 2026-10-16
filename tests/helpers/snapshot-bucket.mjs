// Bucket privado falso no layout do AD-27, alimentado pelo Publisher de memória:
//   manifest/current.json, manifest/revisions/{revision}.json e slices/{digest}.
// As chaves são as de src/contracts/manifest.mjs, as mesmas que o Publicador S3
// (src/adapters/s3-snapshots.mjs) grava; tests/s3-snapshots.test.mjs prova o formato
// gravado por ele contra a Lambda de leitura.
// `getObject` devolve o texto exato do objeto ou null, como a porta da Lambda espera.
import { POINTER_KEY, POINTER_VERSION, READABLE_REVISIONS, SLICE_PREFIX, revisionKey } from '../../src/contracts/snapshot.mjs';

export const OWNER_SUB = 'owner-a';
export const CLIENT_ID = 'test-client-id';
export const ownerClaims = (overrides = {}) => ({ token_use: 'access', client_id: CLIENT_ID, sub: OWNER_SUB, scope: 'llms-api/read', ...overrides });

export function fakeBucket() {
  const objects = new Map(); const reads = [];
  return {
    objects, reads,
    put(key, text) { objects.set(key, text); },
    async getObject(key) { reads.push(key); return objects.has(key) ? objects.get(key) : null; }
  };
}

// Copia as revisões publicadas (mais nova por último) para o bucket, com o objectKey
// sob slices/, e grava o ponteiro com as três últimas legíveis.
export function mirrorPublications(work, bucket, revisions) {
  for (const revision of revisions) {
    const manifest = work.snapshots.readManifest(work.owner, revision);
    for (const slice of Object.keys(manifest.slices)) {
      const key = `${SLICE_PREFIX}${manifest.slices[slice].digest}`;
      bucket.put(key, work.snapshots.readSlice(revision, slice, work.owner));
      manifest.slices[slice].objectKey = key;
    }
    bucket.put(revisionKey(revision), JSON.stringify(manifest));
  }
  const readable = [...revisions].reverse().slice(0, READABLE_REVISIONS);
  bucket.put(POINTER_KEY, JSON.stringify({ schemaVersion: POINTER_VERSION, revision: readable[0], readableRevisions: readable }));
  return readable;
}

export function lambdaEvent({ routeKey, pathParameters, claims = ownerClaims() }) {
  return { version: '2.0', routeKey, pathParameters, requestContext: { requestId: 'req-1', authorizer: { jwt: { claims, scopes: ['llms-api/read'] } } } };
}

// fetch falso que encaminha para o handler, como o API Gateway (payload 2.0) faria.
export function fetchViaLambda(handler, { apiOrigin, claims = () => ownerClaims() } = {}) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    const { pathname } = new URL(url);
    if (!url.startsWith(`${apiOrigin}/`)) throw new Error('origem inesperada');
    let event;
    if (pathname === '/api/v1/snapshot') event = lambdaEvent({ routeKey: 'GET /api/v1/snapshot', claims: claims() });
    else {
      const match = pathname.match(/^\/api\/v1\/snapshots\/([^/]+)\/([^/]+)$/);
      if (!match) return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
      event = lambdaEvent({ routeKey: 'GET /api/v1/snapshots/{revision}/{slice}', pathParameters: { revision: decodeURIComponent(match[1]), slice: match[2] }, claims: claims() });
    }
    const response = await handler(event);
    return { ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, headers: response.headers,
      json: async () => JSON.parse(response.body), text: async () => response.body };
  };
  return { fetch, calls };
}
