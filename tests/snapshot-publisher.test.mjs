import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LEASE_KEY, POINTER_KEY, SLICES, revisionKey } from '../src/contracts/snapshot.mjs';
import { SYNTHETIC_FIXTURE } from '../src/contracts/provenance.mjs';
import { SYNTHETIC_WORKSPACE } from '../src/contracts/synthetic-workspace.mjs';
import { SYNTHETIC_WORKSPACE as UI_WORKSPACE } from '../src/ui/fixtures/synthetic-workspace.mjs';
import { S3SnapshotPublisher, createMemoryObjectStore } from '../src/adapters/s3-snapshots.mjs';
import { createSnapshotPublisherHandler, handler, LEASE_TTL_MS } from '../src/adapters/lambda/snapshot-publisher.mjs';
import { createSnapshotReaderHandler } from '../src/adapters/lambda/snapshot-reader.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { createHttpSnapshotPort } from '../src/ui/http-snapshot-port.mjs';
import { webDigest } from '../src/ui/web-digest.mjs';
import { CLIENT_ID, OWNER_SUB, fetchViaLambda } from './helpers/snapshot-bucket.mjs';

const API = 'https://api.example.invalid';
const T0 = '2026-10-16T12:00:00.000Z';
function clockFrom(start = T0) { let ms = Date.parse(start); return () => new Date(ms += 1).toISOString(); }
function quiet(t) { const logs = []; t.mock.method(console, 'log', line => logs.push(line)); return logs; }

test('handler: publica o dataset sintético e devolve só revisões e o token; a leitura dá updated', async t => {
  const logs = quiet(t);
  const store = createMemoryObjectStore();
  const result = await createSnapshotPublisherHandler({ store, clock: clockFrom(), owner: 'req-1' })({});
  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result).sort(), ['fencingToken', 'ok', 'provenance', 'readableRevisions', 'revision']);
  assert.equal(result.provenance, SYNTHETIC_FIXTURE);
  assert.deepEqual(result.readableRevisions, [result.revision]);
  assert.ok(store.objects.has(revisionKey(result.revision)));
  assert.ok(Date.parse(JSON.parse(store.objects.get(LEASE_KEY).text).expiresAt) <= Date.now(), 'lease liberado no fim');
  assert.equal(logs.length, 1);
  assert.deepEqual(JSON.parse(logs[0]), { event: 'snapshot_publish', ok: true, revision: result.revision, fencingToken: 1 });
  const lambda = createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: async key => store.objects.get(key)?.text ?? null });
  const port = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok', fetch: fetchViaLambda(lambda, { apiOrigin: API }).fetch });
  const read = await new SnapshotReader({ readManifest: port.readManifest, readSlice: port.readSlice, digest: webDigest }).refresh();
  assert.equal(read.status, 'updated');
  for (const slice of SLICES) assert.deepEqual(read.snapshot[slice], SYNTHETIC_WORKSPACE[slice]);
});

test('handler: quatro invocações deixam as 3 mais novas legíveis', async t => {
  quiet(t);
  const store = createMemoryObjectStore(); const clock = clockFrom();
  const revisions = [];
  for (let i = 0; i < 4; i += 1) revisions.push((await createSnapshotPublisherHandler({ store, clock, owner: `req-${i}` })({})).revision);
  assert.deepEqual(JSON.parse(store.objects.get(POINTER_KEY).text).readableRevisions, revisions.slice(1).reverse());
});

test('handler: lease vigente de outro → {ok:false, LEASE_BUSY}, sem gravar e sem apagar o lease alheio', async t => {
  const logs = quiet(t);
  const store = createMemoryObjectStore();
  await new S3SnapshotPublisher({ store }).acquire('outro', 60000, T0);
  const result = await createSnapshotPublisherHandler({ store, clock: clockFrom(), owner: 'req-1' })({});
  assert.deepEqual(result, { ok: false, error: 'LEASE_BUSY' });
  assert.equal(store.objects.has(POINTER_KEY), false);
  assert.equal(JSON.parse(store.objects.get(LEASE_KEY).text).owner, 'outro');
  assert.equal(store.calls.some(c => c.op === 'delete'), false);
  // O log traz o nome do erro de origem e o status HTTP do S3, nunca dados.
  assert.deepEqual(JSON.parse(logs[0]), { event: 'snapshot_publish', ok: false, error: 'LEASE_BUSY', cause: 'Error', httpStatus: null });
});

test('handler: CAS perdido → {ok:false, SNAPSHOT_CAS_LOST} e o lease é liberado', async t => {
  quiet(t);
  const base = createMemoryObjectStore();
  const store = { ...base, async put(key, text, options) {
    if (key === POINTER_KEY) { await base.put(POINTER_KEY, '{}', {}); }
    return base.put(key, text, options);
  } };
  const result = await createSnapshotPublisherHandler({ store, clock: clockFrom(), owner: 'req-1' })({});
  assert.deepEqual(result, { ok: false, error: 'SNAPSHOT_CAS_LOST' });
  assert.equal(base.objects.get(POINTER_KEY).text, '{}');
  assert.ok(Date.parse(JSON.parse(base.objects.get(LEASE_KEY).text).expiresAt) <= Date.now(), 'lease liberado');
});

test('handler: evento de API Gateway é recusado sem tocar o bucket; o payload nunca vira dado', async t => {
  quiet(t);
  const store = createMemoryObjectStore();
  const publish = createSnapshotPublisherHandler({ store, clock: clockFrom(), owner: 'req-1' });
  for (const event of [{ routeKey: 'POST /api/v1/publish' }, { requestContext: { http: {} } }, { httpMethod: 'POST' }]) {
    assert.deepEqual(await publish(event), { ok: false, error: 'PUBLISH_EVENT_NOT_ALLOWED' });
  }
  assert.deepEqual(store.calls, []);
  const result = await publish({ data: { catalog: { companies: [], relations: [] }, models: [], news: [] } });
  assert.equal(result.ok, true);
  assert.deepEqual(JSON.parse(store.objects.get(revisionKey(result.revision)).text).slices.catalog.digest.length, 64);
  const catalogKey = JSON.parse(store.objects.get(revisionKey(result.revision)).text).slices.catalog.objectKey;
  assert.equal(JSON.parse(store.objects.get(catalogKey).text).data.companies.length, SYNTHETIC_WORKSPACE.catalog.companies.length);
});

test('handler do runtime: sem SNAPSHOT_BUCKET → {ok:false, SNAPSHOT_BUCKET_MISSING}', async t => {
  quiet(t);
  const saved = process.env.SNAPSHOT_BUCKET;
  t.after(() => { if (saved === undefined) delete process.env.SNAPSHOT_BUCKET; else process.env.SNAPSHOT_BUCKET = saved; });
  delete process.env.SNAPSHOT_BUCKET;
  assert.deepEqual(await handler({}, { awsRequestId: 'r' }), { ok: false, error: 'SNAPSHOT_BUCKET_MISSING' });
});

test('TTL do lease abaixo do Timeout de 30 s da função', () => {
  assert.ok(LEASE_TTL_MS < 30000);
});

test('dataset: um único módulo de dados; o shell reexporta o mesmo objeto, sem duplicar o JSON', async () => {
  assert.equal(UI_WORKSPACE, SYNTHETIC_WORKSPACE);
  assert.equal(SYNTHETIC_WORKSPACE.provenance, SYNTHETIC_FIXTURE);
  const ui = await readFile(new URL('../src/ui/fixtures/synthetic-workspace.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(ui, /"catalog"|"companies"/, 'sem JSON no módulo do shell');
  assert.match(ui, /from '\.\.\/\.\.\/contracts\/synthetic-workspace\.mjs'/);
});

test('guarda: a Lambda de publicação e o Publicador não importam src/ui/, node: nem pacotes; sem fetch', async () => {
  for (const path of ['../src/adapters/lambda/snapshot-publisher.mjs', '../src/adapters/s3-snapshots.mjs']) {
    const text = (await readFile(new URL(path, import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const [, specifier] of text.matchAll(/from '([^']+)'/g)) {
      assert.match(specifier, /^\.\.?\//, `${path} → ${specifier}`);
      assert.doesNotMatch(specifier, /\/ui\//, `${path} → ${specifier}`);
    }
    assert.doesNotMatch(text, /\bfetch\s*\(|artificialanalysis|https:\/\//i);
  }
});

// ---------- Revisão ----------

test('revisão: handler devolve SNAPSHOT_STATE_INVALID e LEASE_EXPIRED_OR_FENCED pelo nome, e libera o lease', async t => {
  const logs = quiet(t);
  const store = createMemoryObjectStore();
  store.objects.set(POINTER_KEY, { text: '{}', etag: '"x"' });
  const run = createSnapshotPublisherHandler({ store, clock: clockFrom(), owner: 'req-1' });
  assert.deepEqual(await run({}), { ok: false, error: 'SNAPSHOT_STATE_INVALID' });
  assert.ok(Date.parse(JSON.parse(store.objects.get(LEASE_KEY).text).expiresAt) <= Date.now(), 'lease liberado');

  const fenced = createMemoryObjectStore();
  let stolen = false;
  const stealing = { ...fenced, objects: fenced.objects, calls: fenced.calls, get: key => fenced.get(key),
    async put(key, text, options) {
      const out = await fenced.put(key, text, options);
      if (!stolen && key.startsWith('manifest/revisions/')) {
        stolen = true;
        const current = fenced.objects.get(LEASE_KEY);
        await fenced.put(LEASE_KEY, JSON.stringify({ ...JSON.parse(current.text), owner: 'outro' }), { ifMatch: current.etag });
      }
      return out;
    } };
  const result = await createSnapshotPublisherHandler({ store: stealing, clock: clockFrom(), owner: 'req-2' })({});
  assert.deepEqual(result, { ok: false, error: 'LEASE_EXPIRED_OR_FENCED' });
  assert.equal(fenced.objects.has(POINTER_KEY), false, 'ponteiro não mudou');
  assert.ok(logs.every(line => !/catalog|Laboratório/.test(line)), 'log sem conteúdo');
});

test('revisão: lease limitado ao tempo restante da invocação, com folga', async t => {
  quiet(t);
  const store = createMemoryObjectStore();
  const clock = clockFrom();
  let ttl;
  const spying = { ...store, objects: store.objects, calls: store.calls, get: key => store.get(key),
    async put(key, text, options) { if (key === LEASE_KEY && ttl === undefined) { const l = JSON.parse(text); ttl = Date.parse(l.expiresAt) - Date.parse(T0); } return store.put(key, text, options); } };
  await createSnapshotPublisherHandler({ store: spying, clock, owner: 'req-ttl', remainingMs: () => 12_000 })({});
  assert.ok(ttl <= 7_100, `ttl ${ttl} respeita 12 s restantes menos 5 s de folga`);
});

test('revisão: SNAPSHOT_DATA_NOT_SYNTHETIC é um código conhecido do handler', async () => {
  const text = await readFile(new URL('../src/adapters/lambda/snapshot-publisher.mjs', import.meta.url), 'utf8');
  assert.match(text.match(/const KNOWN_ERRORS = [^;]+;/)[0], /'SNAPSHOT_DATA_NOT_SYNTHETIC'/);
});
