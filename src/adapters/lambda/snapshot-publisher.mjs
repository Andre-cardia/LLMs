// Lambda snapshot-publisher (Q2): publica o dataset sintético no bucket privado
// pelo Publicador S3 (lease, fencing e CAS por escrita condicional). Sem rota
// HTTP e sem agendador: só `aws lambda invoke`, com credencial IAM humana. O
// payload da invocação é ignorado; nenhum dado entra pelo evento, e um evento
// com cara de API Gateway é recusado.
//
// O dataset vem de src/contracts/synthetic-workspace.mjs (provenance
// 'synthetic-fixture'), o mesmo módulo de dados que o shell reexporta; nenhuma
// fonte real nem chamada externa além do S3.
//
// scripts/render-auth-stack.mjs empacota este arquivo com os imports locais no
// ZipFile da Lambda. O único require é o SDK do S3, que o runtime nodejs24.x já
// traz. O resultado e o log levam só revisões e códigos, sem conteúdo.
import {S3SnapshotPublisher, createS3ObjectStore} from '../s3-snapshots.mjs';
import {SYNTHETIC_WORKSPACE} from '../../contracts/synthetic-workspace.mjs';
import {SYNTHETIC_FIXTURE} from '../../contracts/provenance.mjs';

// Bem abaixo do Timeout de 30 s da função: o lease vence antes de a função ser cortada.
const LEASE_TTL_MS = 25000;
const KNOWN_ERRORS = Object.freeze(['LEASE_BUSY', 'LEASE_EXPIRED_OR_FENCED', 'SNAPSHOT_CAS_LOST', 'SNAPSHOT_REVISION_EXISTS', 'SNAPSHOT_SLICE_CORRUPT', 'SNAPSHOT_STATE_INVALID', 'SNAPSHOT_BUCKET_MISSING', 'PUBLISH_EVENT_NOT_ALLOWED', 'SNAPSHOT_DATA_NOT_SYNTHETIC']);

function errorCode(error) {
  if (KNOWN_ERRORS.includes(error?.code)) return error.code;
  if (KNOWN_ERRORS.includes(error?.message)) return error.message;
  if (error instanceof TypeError) return 'SNAPSHOT_DATA_INVALID';
  return 'SNAPSHOT_PUBLISH_FAILED';
}
const isHttpEvent = event => event !== null && typeof event === 'object' && ('requestContext' in event || 'routeKey' in event || 'httpMethod' in event);

function syntheticData() {
  if (SYNTHETIC_WORKSPACE.provenance !== SYNTHETIC_FIXTURE) throw new Error('SNAPSHOT_DATA_NOT_SYNTHETIC');
  return {catalog: SYNTHETIC_WORKSPACE.catalog, models: SYNTHETIC_WORKSPACE.models, news: SYNTHETIC_WORKSPACE.news};
}

// `store`: porta de objetos; `clock()` → ISO UTC; `owner`: dono do lease (o requestId da invocação);
// `remainingMs()`: tempo restante da invocação. O lease vence antes de a função ser cortada,
// medido a partir do momento da aquisição (depois do cold start), com folga de 5 s.
const LEASE_MARGIN_MS = 5000;
function createSnapshotPublisherHandler({store, clock, owner, remainingMs = () => LEASE_TTL_MS + LEASE_MARGIN_MS}) {
  return async function snapshotPublisher(event) {
    let lease = null; let publisher = null; let result; let diagnostic = {};
    try {
      if (isHttpEvent(event)) throw new Error('PUBLISH_EVENT_NOT_ALLOWED');
      if (store === null) throw new Error('SNAPSHOT_BUCKET_MISSING');
      publisher = new S3SnapshotPublisher({store, clock});
      const data = syntheticData();
      const ttl = Math.min(LEASE_TTL_MS, Math.max(1, remainingMs() - LEASE_MARGIN_MS));
      lease = await publisher.acquire(owner, ttl, clock());
      const {manifest, pointer} = await publisher.publish({data, now: clock(), lease});
      result = {ok: true, revision: manifest.revision, readableRevisions: pointer.readableRevisions, fencingToken: lease.fencingToken, provenance: SYNTHETIC_FIXTURE};
    } catch (error) {
      result = {ok: false, error: errorCode(error)};
      // Diagnóstico sem dados: o nome do erro de origem e o status HTTP do S3, se houver.
      const cause = error?.cause ?? error;
      diagnostic = {cause: typeof cause?.name === 'string' ? cause.name : 'Error', httpStatus: cause?.$metadata?.httpStatusCode ?? null};
    }
    if (lease !== null) {
      try { await publisher.release(lease, clock()); } catch { /* o lease vence sozinho */ }
    }
    console.log(JSON.stringify({event: 'snapshot_publish', ...(result.ok ? {ok: true, revision: result.revision, fencingToken: result.fencingToken} : {...result, ...diagnostic})}));
    return result;
  };
}

// Um cliente por contêiner, criado na primeira invocação.
let s3 = null;
function s3Store(bucket) {
  if (s3 === null) {
    const sdk = require('@aws-sdk/client-s3');
    s3 = {sdk, client: new sdk.S3Client({})};
  }
  return createS3ObjectStore({bucket, sdk: s3.sdk, client: s3.client});
}

// Lê o ambiente a cada invocação: o mesmo código serve preview e prod (AD-14).
async function handler(event, context) {
  const bucket = process.env.SNAPSHOT_BUCKET;
  let store;
  try { store = typeof bucket === 'string' && bucket !== '' ? s3Store(bucket) : null; }
  catch (error) {
    const result = {ok: false, error: 'SNAPSHOT_PUBLISH_FAILED'};
    console.log(JSON.stringify({event: 'snapshot_publish', ...result, cause: typeof error?.name === 'string' ? error.name : 'Error'}));
    return result;
  }
  const owner = typeof context?.awsRequestId === 'string' && context.awsRequestId !== '' ? context.awsRequestId : 'manual-invoke';
  const remainingMs = typeof context?.getRemainingTimeInMillis === 'function' ? () => context.getRemainingTimeInMillis() : undefined;
  return createSnapshotPublisherHandler({store, clock: () => new Date().toISOString(), owner, remainingMs})(event);
}

export {handler, createSnapshotPublisherHandler, LEASE_TTL_MS};
