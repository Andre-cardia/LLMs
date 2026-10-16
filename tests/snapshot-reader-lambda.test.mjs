import test from 'node:test';
import assert from 'node:assert/strict';
import { assertManifestResponse, toManifestResponse, SLICES, POINTER_KEY, revisionKey } from '../src/contracts/snapshot.mjs';
import { sha256Text } from '../src/adapters/memory-snapshots.mjs';
import { createSnapshotReaderHandler, handler } from '../src/adapters/lambda/snapshot-reader.mjs';
import { webDigest } from '../src/ui/web-digest.mjs';
import { workspace, publish } from './helpers/local-fixtures.mjs';
import { CLIENT_ID, OWNER_SUB, fakeBucket, lambdaEvent, mirrorPublications, ownerClaims } from './helpers/snapshot-bucket.mjs';

const MANIFEST_ROUTE = 'GET /api/v1/snapshot';
const SLICE_ROUTE = 'GET /api/v1/snapshots/{revision}/{slice}';

function setup(count = 1) {
  const work = workspace(); const revisions = [];
  for (let i = 1; i <= count; i += 1) revisions.push(publish(work, `run-${i}`).revision);
  const bucket = fakeBucket(); const readable = mirrorPublications(work, bucket, revisions);
  const reader = createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: bucket.getObject });
  return { work, bucket, revisions, readable, reader };
}
function assertPrivate(res) {
  assert.equal(res.headers['cache-control'], 'private, no-store');
  for (const name of Object.keys(res.headers)) assert.ok(!name.startsWith('access-control-'), `Lambda não emite CORS: ${name}`);
}
const slice = (revision, name) => lambdaEvent({ routeKey: SLICE_ROUTE, pathParameters: { revision, slice: name } });

test('Lambda dono: 200 com ManifestResponse da revisão corrente, sem objectKey', async () => {
  const { work, reader, revisions } = setup(2);
  const res = await reader(lambdaEvent({ routeKey: MANIFEST_ROUTE }));
  assert.equal(res.statusCode, 200); assertPrivate(res);
  assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
  const body = JSON.parse(res.body);
  assertManifestResponse(body);
  assert.equal(body.revision, revisions.at(-1));
  assert.doesNotMatch(res.body, /objectKey|slices\//);
  assert.deepEqual(body, work.snapshots.readManifestResponse(work.owner));
});

test('Lambda não dono: 403 genérico, sem ler o S3', async () => {
  const { bucket, reader } = setup();
  for (const claims of [ownerClaims({ sub: 'owner-b' }), ownerClaims({ token_use: 'id' }), ownerClaims({ client_id: 'other' }), null]) {
    for (const event of [lambdaEvent({ routeKey: MANIFEST_ROUTE, claims }), lambdaEvent({ routeKey: SLICE_ROUTE, pathParameters: { revision: 'snapshot-1', slice: 'catalog' }, claims })]) {
      const res = await reader(event);
      assert.equal(res.statusCode, 403); assertPrivate(res);
      assert.deepEqual(JSON.parse(res.body), { error: { code: 'ACCESS_DENIED', message: 'Forbidden', retryable: false }, requestId: 'req-1' });
    }
  }
  assert.deepEqual(bucket.reads, []);
  const empty = createSnapshotReaderHandler({ ownerSubs: '', appClientId: CLIENT_ID, getObject: bucket.getObject });
  assert.equal((await empty(lambdaEvent({ routeKey: MANIFEST_ROUTE }))).statusCode, 403);
  assert.deepEqual(bucket.reads, []);
});

test('Lambda bytes: corpo idêntico aos bytes gravados, sem reserializar nem base64', async () => {
  const { work, bucket, reader, revisions } = setup();
  const revision = revisions[0];
  const internal = work.snapshots.readManifest(work.owner, revision);
  for (const name of SLICES) {
    const res = await reader(slice(revision, name));
    assert.equal(res.statusCode, 200); assertPrivate(res);
    assert.equal(res.isBase64Encoded, false);
    const stored = work.snapshots.readSlice(revision, name, work.owner);
    assert.equal(res.body, stored);
    assert.equal(res.body, bucket.objects.get(`slices/${internal.slices[name].digest}`));
    assert.equal(sha256Text(res.body), internal.slices[name].digest);
  }
  // Bytes que JSON.parse + JSON.stringify mudariam (espaços, ordem) saem intactos.
  const odd = '{ "slice":"catalog" ,  "schemaVersion":1, "data":{} }';
  bucket.put(`slices/${internal.slices.catalog.digest}`, odd);
  assert.equal((await reader(slice(revision, 'catalog'))).body, odd);
});

test('Lambda revisão antiga: só as 3 últimas são legíveis; a 4ª mais velha e as inexistentes → 404', async () => {
  const { bucket, reader, revisions, readable } = setup(4);
  assert.deepEqual(readable, [revisions[3], revisions[2], revisions[1]]);
  for (const revision of readable) assert.equal((await reader(slice(revision, 'models'))).statusCode, 200, revision);
  // O manifesto da 4ª continua no bucket, mas ela saiu das legíveis.
  assert.ok(bucket.objects.has(revisionKey(revisions[0])));
  for (const revision of [revisions[0], 'snapshot-99', '..', '../manifest', 'a/b', '', 'x'.repeat(129)]) {
    const res = await reader(slice(revision, 'models'));
    assert.equal(res.statusCode, 404, revision); assertPrivate(res);
    assert.equal(JSON.parse(res.body).error.code, 'SNAPSHOT_NOT_FOUND');
  }
  for (const name of ['bogus', '__proto__', 'constructor', undefined]) assert.equal((await reader(slice(revisions[3], name))).statusCode, 404);
  assert.equal((await reader(lambdaEvent({ routeKey: 'GET /api/v1/other' }))).statusCode, 404);
});

test('Lambda sem ponteiro ou objeto ausente → 404; objeto corrompido ou S3 fora → 503 sem detalhe', async () => {
  const { bucket, reader, revisions } = setup();
  const revision = revisions[0];
  const pointer = bucket.objects.get(POINTER_KEY);
  bucket.objects.delete(POINTER_KEY);
  assert.equal((await reader(lambdaEvent({ routeKey: MANIFEST_ROUTE }))).statusCode, 404);
  assert.equal((await reader(slice(revision, 'catalog'))).statusCode, 404);
  bucket.put(POINTER_KEY, pointer);
  const manifest = JSON.parse(bucket.objects.get(revisionKey(revision)));
  bucket.objects.delete(manifest.slices.news.objectKey);
  assert.equal((await reader(slice(revision, 'news'))).statusCode, 404);
  const cases = [
    () => bucket.put(POINTER_KEY, '{'),
    () => bucket.put(POINTER_KEY, JSON.stringify({ schemaVersion: 1, revision, readableRevisions: ['other'] })),
    () => bucket.put(revisionKey(revision), JSON.stringify({ ...manifest, revision: 'other' })),
    () => bucket.put(revisionKey(revision), JSON.stringify({ ...manifest, schemaVersion: 1 })),
    () => bucket.put(revisionKey(revision), JSON.stringify({ ...manifest, slices: { ...manifest.slices, catalog: { ...manifest.slices.catalog, objectKey: 'manifest/current.json' } } }))
  ];
  const original = bucket.objects.get(revisionKey(revision));
  for (const [i, corrupt] of cases.entries()) {
    corrupt();
    const res = i === 4 ? await reader(slice(revision, 'catalog')) : await reader(lambdaEvent({ routeKey: MANIFEST_ROUTE }));
    assert.equal(res.statusCode, 503, `caso ${i}`); assertPrivate(res);
    assert.deepEqual(JSON.parse(res.body), { error: { code: 'SNAPSHOT_UNAVAILABLE', message: 'Service unavailable', retryable: true }, requestId: 'req-1' });
    bucket.put(POINTER_KEY, pointer); bucket.put(revisionKey(revision), original);
  }
  const down = createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: async () => { throw new Error('s3 secret-detail'); } });
  const res = await down(lambdaEvent({ routeKey: MANIFEST_ROUTE }));
  assert.equal(res.statusCode, 503); assert.doesNotMatch(res.body, /secret-detail/);
});

test('fixture compartilhada: os mesmos bytes de slice dão o mesmo digest na Lambda (sha256Text) e no navegador (webDigest)', async () => {
  const { work, reader, revisions } = setup();
  const response = toManifestResponse(work.snapshots.readManifest(work.owner, revisions[0]));
  for (const name of SLICES) {
    const bytes = (await reader(slice(revisions[0], name))).body;
    assert.equal(sha256Text(bytes), response.slices[name].digest);
    assert.equal(await webDigest(bytes), response.slices[name].digest);
  }
});

test('handler lê OWNER_SUBS, APP_CLIENT_ID e SNAPSHOT_BUCKET do ambiente; sem bucket → 503', async t => {
  const saved = { OWNER_SUBS: process.env.OWNER_SUBS, APP_CLIENT_ID: process.env.APP_CLIENT_ID, SNAPSHOT_BUCKET: process.env.SNAPSHOT_BUCKET };
  t.after(() => { for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } });
  process.env.OWNER_SUBS = OWNER_SUB; process.env.APP_CLIENT_ID = CLIENT_ID; delete process.env.SNAPSHOT_BUCKET;
  assert.equal((await handler(lambdaEvent({ routeKey: MANIFEST_ROUTE }))).statusCode, 503);
  process.env.OWNER_SUBS = '';
  assert.equal((await handler(lambdaEvent({ routeKey: MANIFEST_ROUTE }))).statusCode, 403);
});

test('nunca registra token, claims nem conteúdo', async t => {
  const logged = [];
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) t.mock.method(console, method, (...args) => logged.push(args));
  const { reader, revisions } = setup();
  const withHeader = event => ({ ...event, headers: { authorization: 'Bearer secret.jwt.value' } });
  await reader(withHeader(lambdaEvent({ routeKey: MANIFEST_ROUTE })));
  await reader(withHeader(slice(revisions[0], 'catalog')));
  await reader(withHeader(lambdaEvent({ routeKey: MANIFEST_ROUTE, claims: ownerClaims({ sub: 'x' }) })));
  assert.deepEqual(logged, []);
});
