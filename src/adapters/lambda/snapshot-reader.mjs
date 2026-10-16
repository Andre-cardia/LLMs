// Lambda de leitura de snapshot (AD-27), atrás do mesmo JWT authorizer de /whoami.
//   GET /api/v1/snapshot                      → ManifestResponse da revisão corrente
//   GET /api/v1/snapshots/{revision}/{slice}  → bytes gravados da slice, sem tocar
// A regra de dono é a do owner-gate, reaproveitada por import local: quem não é
// dono recebe o mesmo 403 genérico, sem nenhuma leitura no S3.
//
// Layout do bucket (só leitura aqui; a publicação é Q2):
//   manifest/current.json               ponteiro {schemaVersion: 1, revision, readableRevisions}
//   manifest/revisions/{revision}.json  PublishedManifest interno (com objectKey)
//   slices/...                          bytes de envelope, endereçados pelo objectKey
// Só as revisões de `readableRevisions` (no máximo 3, AD-27) são servidas; as
// demais, e as inexistentes, recebem 404.
//
// scripts/render-auth-stack.mjs empacota este arquivo com os imports locais no
// ZipFile da Lambda. O único require fora do pacote é o SDK do S3, que o runtime
// nodejs24.x já traz. Nunca registra token, claims nem conteúdo.
import {createOwnerGate} from './owner-gate.mjs';
import {READABLE_REVISIONS, SLICES, assertManifest, assertRevision, assertSnapshotPointer, toManifestResponse} from '../../contracts/manifest.mjs';

const POINTER_KEY = 'manifest/current.json';
const SLICE_PREFIX = 'slices/';
const revisionKey = revision => `manifest/revisions/${revision}.json`;
const JSON_HEADERS = Object.freeze({'content-type': 'application/json; charset=utf-8', 'cache-control': 'private, no-store'});

function requestIdOf(event) {
  return typeof event?.requestContext?.requestId === 'string' ? event.requestContext.requestId : null;
}
function failure(event, statusCode, code, message, retryable) {
  return {statusCode, headers: {...JSON_HEADERS}, body: JSON.stringify({error: {code, message, retryable}, requestId: requestIdOf(event)})};
}
const notFound = event => failure(event, 404, 'SNAPSHOT_NOT_FOUND', 'Not found', false);
const unavailable = event => failure(event, 503, 'SNAPSHOT_UNAVAILABLE', 'Service unavailable', true);

function parseJson(text) {
  if (typeof text !== 'string') throw new Error('SNAPSHOT_OBJECT_INVALID');
  return JSON.parse(text);
}

// `getObject(key)` → Promise<string | null>: texto exato do objeto, ou null se
// ele não existe (sem s3:ListBucket, o S3 responde AccessDenied para chave ausente).
function createSnapshotReaderHandler({ownerSubs, appClientId, getObject}) {
  const gate = createOwnerGate({ownerSubs, appClientId});
  async function pointer() {
    const text = await getObject(POINTER_KEY);
    return text === null ? null : assertSnapshotPointer(parseJson(text));
  }
  async function manifestOf(revision) {
    const text = await getObject(revisionKey(revision));
    if (text === null) return null;
    const manifest = assertManifest(parseJson(text));
    if (manifest.revision !== revision) throw new Error('SNAPSHOT_REVISION_MISMATCH');
    return manifest;
  }
  async function readManifest(event) {
    const current = await pointer();
    const manifest = current === null ? null : await manifestOf(current.revision);
    if (manifest === null) return notFound(event);
    return {statusCode: 200, headers: {...JSON_HEADERS}, body: JSON.stringify(toManifestResponse(manifest))};
  }
  async function readSlice(event, {revision, slice}) {
    try { assertRevision(revision); } catch { return notFound(event); }
    if (typeof slice !== 'string' || !SLICES.includes(slice)) return notFound(event);
    const current = await pointer();
    if (current === null || !current.readableRevisions.slice(0, READABLE_REVISIONS).includes(revision)) return notFound(event);
    const manifest = await manifestOf(revision);
    if (manifest === null) return notFound(event);
    // O papel só lê manifest/* e slices/*: uma chave fora de slices/ é manifesto corrompido.
    const key = manifest.slices[slice].objectKey;
    if (!key.startsWith(SLICE_PREFIX) || key.includes('..')) throw new Error('SNAPSHOT_OBJECT_KEY_INVALID');
    const bytes = await getObject(key);
    if (bytes === null) return notFound(event);
    if (typeof bytes !== 'string') throw new Error('SNAPSHOT_OBJECT_INVALID');
    // Os bytes gravados, como texto: sem JSON.parse, reserialização nem base64.
    return {statusCode: 200, headers: {...JSON_HEADERS}, body: bytes, isBase64Encoded: false};
  }
  return async function snapshotReader(event) {
    const verdict = await gate(event);
    if (verdict.statusCode !== 200) return verdict;
    try {
      if (event.routeKey === 'GET /api/v1/snapshot') return await readManifest(event);
      if (event.routeKey === 'GET /api/v1/snapshots/{revision}/{slice}') return await readSlice(event, event.pathParameters ?? {});
      return notFound(event);
    } catch (error) {
      // Diagnóstico sem token, claims nem conteúdo: só o código interno ou o nome do erro.
      console.error(JSON.stringify({event: 'snapshot_read_failed', requestId: event?.requestContext?.requestId ?? null, error: error?.message?.match(/^[A-Z][A-Z0-9_]*(?=$|[:\s])/)?.[0] ?? error?.name ?? 'Error'}));
      return unavailable(event);
    }
  };
}

// Um cliente por contêiner, criado na primeira leitura.
let s3 = null;
function s3GetObject(bucket) {
  return async function getObject(key) {
    if (s3 === null) {
      const sdk = require('@aws-sdk/client-s3');
      s3 = {client: new sdk.S3Client({}), GetObjectCommand: sdk.GetObjectCommand};
    }
    try {
      const output = await s3.client.send(new s3.GetObjectCommand({Bucket: bucket, Key: key}));
      return await output.Body.transformToString('utf-8');
    } catch (error) {
      // Sem s3:ListBucket, o S3 responde AccessDenied também para chave ausente: tratado
      // como 404. O nome do erro vai ao log (sem chave nem conteúdo) para que uma falha
      // real de permissão ou de criptografia continue visível no CloudWatch.
      if (error?.name === 'NoSuchKey' || error?.name === 'AccessDenied') {
        console.warn(JSON.stringify({event: 'snapshot_object_missing', s3Error: error.name}));
        return null;
      }
      throw error;
    }
  };
}

// Lê o ambiente a cada invocação: o mesmo código serve preview e prod (AD-14).
async function handler(event) {
  const bucket = process.env.SNAPSHOT_BUCKET;
  return createSnapshotReaderHandler({ownerSubs: process.env.OWNER_SUBS, appClientId: process.env.APP_CLIENT_ID,
    getObject: typeof bucket === 'string' && bucket !== '' ? s3GetObject(bucket) : async () => { throw new Error('SNAPSHOT_BUCKET_MISSING'); }})(event);
}

export {handler, createSnapshotReaderHandler, POINTER_KEY, SLICE_PREFIX, revisionKey};
