import test from 'node:test';
import assert from 'node:assert/strict';
import { clone } from '../src/contracts/primitives.mjs';
import { LEASE_KEY, POINTER_KEY, REVISION_PATTERN, SLICES, SLICE_PREFIX, assertManifest, assertSnapshotPointer, envelopeBytes, revisionKey } from '../src/contracts/snapshot.mjs';
import { SYNTHETIC_WORKSPACE } from '../src/contracts/synthetic-workspace.mjs';
import { ConflictError, PreconditionFailedError, S3SnapshotPublisher, createMemoryObjectStore, createS3ObjectStore, sha256Hex } from '../src/adapters/s3-snapshots.mjs';
import { sha256Text } from '../src/adapters/memory-snapshots.mjs';
import { createSnapshotReaderHandler } from '../src/adapters/lambda/snapshot-reader.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { createHttpSnapshotPort } from '../src/ui/http-snapshot-port.mjs';
import { webDigest } from '../src/ui/web-digest.mjs';
import { CLIENT_ID, OWNER_SUB, fetchViaLambda, lambdaEvent } from './helpers/snapshot-bucket.mjs';

const API = 'https://api.example.invalid';
const T0 = '2026-10-16T12:00:00.000Z';
const at = ms => new Date(Date.parse(T0) + ms).toISOString();
const dataset = () => clone({ catalog: SYNTHETIC_WORKSPACE.catalog, models: SYNTHETIC_WORKSPACE.models, news: SYNTHETIC_WORKSPACE.news });
const puts = store => store.calls.filter(call => call.op === 'put');
const textOf = (store, key) => store.objects.get(key)?.text;
const json = (store, key) => JSON.parse(textOf(store, key));
// A Lambda de leitura sobre o mesmo bucket em memória (getObject → texto ou null).
const readerLambda = store => createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: async key => textOf(store, key) ?? null });

async function publishOnce(publisher, { owner = 'run', now = T0, data = dataset() } = {}) {
  const lease = await publisher.acquire(owner, 60000, now);
  const result = await publisher.publish({ data, now, lease });
  await publisher.release(lease);
  return result;
}
async function rejectsCode(promise, code) {
  await assert.rejects(promise, error => { assert.equal(error.code, code, `${error.code} ≠ ${code}`); return true; });
}

// ---------- Porta em memória ----------

test('porta em memória: If-None-Match e If-Match falham com 412; corrida no mesmo instante tem um único vencedor', async () => {
  const store = createMemoryObjectStore();
  const { etag } = await store.put('k', 'a', { ifNoneMatch: '*' });
  await assert.rejects(store.put('k', 'b', { ifNoneMatch: '*' }), PreconditionFailedError);
  await assert.rejects(store.put('k', 'b', { ifMatch: '"outro"' }), PreconditionFailedError);
  await assert.rejects(store.put('ausente', 'b', { ifMatch: etag }), PreconditionFailedError);
  const next = await store.put('k', 'b', { ifMatch: etag });
  assert.notEqual(next.etag, etag);
  assert.deepEqual(await store.get('k'), { text: 'b', etag: next.etag });
  assert.equal(await store.get('nada'), null);
  const race = await Promise.allSettled([store.put('r', '1', { ifNoneMatch: '*' }), store.put('r', '2', { ifNoneMatch: '*' })]);
  assert.deepEqual(race.map(r => r.status).sort(), ['fulfilled', 'rejected']);
  const swap = await Promise.allSettled([store.put('k', 'c', { ifMatch: next.etag }), store.put('k', 'd', { ifMatch: next.etag })]);
  assert.deepEqual(swap.map(r => r.status).sort(), ['fulfilled', 'rejected']);
  await assert.rejects(store.put('k', 'x', { ifNoneMatch: 'etag' }), TypeError);
  await assert.rejects(store.put('k', 'x', { ifNoneMatch: '*', ifMatch: next.etag }), TypeError);
});

// ---------- Primeira publicação (aceite) ----------

test('aceite: primeira publicação no bucket vazio; a Lambda de leitura serve pela porta HTTP e o SnapshotReader com webDigest dá updated com o dataset sintético', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const { manifest, pointer } = await publishOnce(publisher);
  assert.match(manifest.revision, REVISION_PATTERN);
  assertManifest(json(store, revisionKey(manifest.revision)));
  assert.deepEqual(json(store, revisionKey(manifest.revision)), manifest);
  assert.deepEqual(assertSnapshotPointer(json(store, POINTER_KEY)), { schemaVersion: 1, revision: manifest.revision, readableRevisions: [manifest.revision] });
  assert.deepEqual(pointer, json(store, POINTER_KEY));
  for (const slice of SLICES) {
    const ref = manifest.slices[slice];
    const bytes = envelopeBytes(slice, SYNTHETIC_WORKSPACE[slice]);
    assert.equal(ref.objectKey, `${SLICE_PREFIX}${ref.digest}`);
    assert.equal(ref.digest, sha256Text(bytes));
    assert.equal(ref.lastSuccessAt, T0);
    assert.equal(textOf(store, ref.objectKey), bytes);
  }
  assert.deepEqual(manifest.companyMergedInto, []);
  assert.equal(manifest.publishedAt, T0);
  // Cabeçalhos: slices e revisão com If-None-Match; ponteiro novo também.
  for (const call of puts(store).filter(c => c.key !== LEASE_KEY)) assert.equal(call.ifNoneMatch, '*', call.key);
  // Liberado = lease já vencido no próprio objeto, para o fencingToken seguir crescendo.
  assert.ok(Date.parse(json(store, LEASE_KEY).expiresAt) <= Date.parse(T0), 'lease liberado');

  const net = fetchViaLambda(readerLambda(store), { apiOrigin: API });
  const port = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok-1', fetch: net.fetch });
  const reader = new SnapshotReader({ readManifest: port.readManifest, readSlice: port.readSlice, digest: webDigest });
  const result = await reader.refresh();
  assert.equal(result.status, 'updated');
  assert.equal(result.snapshot.manifest.revision, manifest.revision);
  assert.deepEqual(result.snapshot.catalog, SYNTHETIC_WORKSPACE.catalog);
  assert.deepEqual(result.snapshot.models, SYNTHETIC_WORKSPACE.models);
  assert.deepEqual(result.snapshot.news, SYNTHETIC_WORKSPACE.news);
});

test('ordem da publicação: valida, slices, manifesto da revisão, conferência do lease, ponteiro', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('run', 60000, T0);
  store.calls.length = 0;
  const { manifest } = await publisher.publish({ data: dataset(), now: T0, lease });
  const trail = store.calls.map(c => `${c.op}:${c.key.startsWith(SLICE_PREFIX) ? 'slice' : c.key}`);
  // A primeira conferência do lease vem antes de gravar qualquer objeto (sem órfãos de lease alheio).
  assert.deepEqual(trail, [`get:${LEASE_KEY}`, 'get:manifest/current.json', 'put:slice', 'put:slice', 'put:slice', `put:${revisionKey(manifest.revision)}`, `get:${LEASE_KEY}`, 'put:manifest/current.json']);
});

// ---------- Quarta publicação ----------

test('quarta publicação: ponteiro com as 3 mais novas; a mais velha passa a 404 na leitura, sem ser apagada', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const revisions = [];
  for (let i = 0; i < 4; i += 1) revisions.push((await publishOnce(publisher, { owner: `run-${i}`, now: at(i * 1000) })).manifest.revision);
  assert.equal(new Set(revisions).size, 4, 'revisões únicas');
  assert.deepEqual(json(store, POINTER_KEY).readableRevisions, [revisions[3], revisions[2], revisions[1]]);
  const pointerPuts = puts(store).filter(c => c.key === POINTER_KEY);
  assert.equal(pointerPuts[0].ifNoneMatch, '*');
  for (const call of pointerPuts.slice(1)) { assert.equal(call.ifNoneMatch, undefined); assert.match(call.ifMatch, /^"m/); }
  const lambda = readerLambda(store);
  const slice = revision => lambda(lambdaEvent({ routeKey: 'GET /api/v1/snapshots/{revision}/{slice}', pathParameters: { revision, slice: 'catalog' } }));
  for (const revision of revisions.slice(1)) assert.equal((await slice(revision)).statusCode, 200, revision);
  assert.equal((await slice(revisions[0])).statusCode, 404);
  assert.ok(store.objects.has(revisionKey(revisions[0])), 'manifesto antigo continua no bucket');
  assert.equal(store.calls.some(c => c.op === 'delete'), false, 'nada é apagado');
});

// ---------- Slice repetida ----------

test('slice repetida: 412 de chave igual é sucesso, sem sobrescrita', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const first = (await publishOnce(publisher, { owner: 'a' })).manifest;
  const etags = Object.fromEntries(SLICES.map(slice => [slice, store.objects.get(first.slices[slice].objectKey).etag]));
  const second = (await publishOnce(publisher, { owner: 'b', now: at(1000) })).manifest;
  for (const slice of SLICES) {
    assert.equal(second.slices[slice].objectKey, first.slices[slice].objectKey);
    assert.equal(store.objects.get(first.slices[slice].objectKey).etag, etags[slice], `${slice} não sobrescrita`);
  }
  assert.notEqual(second.revision, first.revision);
  assert.deepEqual(json(store, POINTER_KEY).readableRevisions, [second.revision, first.revision]);
});

test('slice repetida com bytes divergentes na chave do digest: recusa, sem sobrescrever nem trocar o ponteiro', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const key = `${SLICE_PREFIX}${sha256Text(envelopeBytes('catalog', SYNTHETIC_WORKSPACE.catalog))}`;
  await store.put(key, 'corrompido', { ifNoneMatch: '*' });
  const lease = await publisher.acquire('run', 60000, T0);
  await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease }), 'SNAPSHOT_SLICE_CORRUPT');
  assert.equal(textOf(store, key), 'corrompido');
  assert.equal(store.objects.has(POINTER_KEY), false);
});

// ---------- Lease ----------

test('lease ocupado: vigente de outro dono → LEASE_BUSY e nada publicado', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const held = await publisher.acquire('outro', 60000, T0);
  await rejectsCode(publisher.acquire('eu', 60000, at(59999)), 'LEASE_BUSY');
  assert.equal(json(store, LEASE_KEY).owner, 'outro');
  assert.equal(json(store, LEASE_KEY).fencingToken, held.fencingToken);
  assert.equal(store.objects.has(POINTER_KEY), false);
  assert.equal([...store.objects.keys()].some(k => k.startsWith(SLICE_PREFIX)), false);
});

test('lease vencido: de outro dono expirado, assume com If-Match e token maior', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const old = await publisher.acquire('outro', 1000, T0);
  assert.equal(old.fencingToken, 1);
  const leaseEtag = store.objects.get(LEASE_KEY).etag;
  const mine = await publisher.acquire('eu', 60000, at(1000));
  assert.equal(mine.fencingToken, 2);
  assert.deepEqual({ owner: mine.owner, expiresAt: mine.expiresAt }, { owner: 'eu', expiresAt: at(61000) });
  assert.equal(puts(store).at(-1).ifMatch, leaseEtag);
  assert.deepEqual(json(store, LEASE_KEY), { schemaVersion: 1, owner: 'eu', expiresAt: at(61000), fencingToken: 2 });
  const { manifest } = await publisher.publish({ data: dataset(), now: at(2000), lease: mine });
  assert.match(manifest.revision, /-2-/, 'o token entra na revisão');
});

test('corrida de lease: dois acquire simultâneos no bucket vazio → só um vence, o outro LEASE_BUSY', async () => {
  const store = createMemoryObjectStore();
  const [a, b] = [new S3SnapshotPublisher({ store }), new S3SnapshotPublisher({ store })];
  const results = await Promise.allSettled([a.acquire('a', 60000, T0), b.acquire('b', 60000, T0)]);
  assert.deepEqual(results.map(r => r.status).sort(), ['fulfilled', 'rejected']);
  const winner = results.find(r => r.status === 'fulfilled').value;
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'LEASE_BUSY');
  assert.equal(json(store, LEASE_KEY).owner, winner.owner);
  // Também na substituição de um lease vencido (If-Match no mesmo ETag).
  const again = await Promise.allSettled([a.acquire('c', 60000, at(60000)), b.acquire('d', 60000, at(60000))]);
  assert.deepEqual(again.map(r => r.status).sort(), ['fulfilled', 'rejected']);
  assert.equal(json(store, LEASE_KEY).fencingToken, 2);
});

test('release alheio: token antigo ou outro dono não libera; o próprio vence o lease com If-Match e o token segue', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const old = await publisher.acquire('a', 1000, T0);
  const current = await publisher.acquire('b', 60000, at(1000));
  assert.equal(await publisher.release(old), false);
  assert.equal(await publisher.release({ ...current, owner: 'a' }), false);
  assert.equal(json(store, LEASE_KEY).owner, 'b');
  const etag = store.objects.get(LEASE_KEY).etag;
  assert.equal(await publisher.release(current), true);
  const released = puts(store).filter(c => c.key === LEASE_KEY).at(-1);
  assert.equal(released.ifMatch, etag);
  assert.equal(store.calls.some(c => c.op === 'delete'), false, 'nada é apagado');
  assert.equal(await publisher.release(current), false, 'lease já liberado não libera de novo');
  // A próxima aquisição assume o lease vencido com token maior: o fencing cresce entre publicações.
  const next = await publisher.acquire('c', 60000, at(2000));
  assert.equal(next.fencingToken, current.fencingToken + 1);
});

// ---------- Fencing ----------

// Porta que executa `hook` logo depois de gravar o manifesto da revisão, antes da troca do ponteiro.
function interfering(store, hook) {
  let fired = false;
  return { ...store, async put(key, text, options) {
    const result = await store.put(key, text, options);
    if (!fired && key.startsWith('manifest/revisions/')) { fired = true; await hook(); }
    return result;
  } };
}

test('fencing: lease tomado por outro durante a publicação → LEASE_EXPIRED_OR_FENCED e o ponteiro não muda', async () => {
  const base = createMemoryObjectStore();
  const first = (await publishOnce(new S3SnapshotPublisher({ store: base }), { owner: 'antes' })).manifest;
  const pointerBefore = textOf(base, POINTER_KEY);
  const other = new S3SnapshotPublisher({ store: base });
  let clock = at(1000);
  const store = interfering(base, async () => { clock = at(400000); await other.acquire('ladrão', 60000, clock); });
  const publisher = new S3SnapshotPublisher({ store, clock: () => clock });
  const lease = await publisher.acquire('eu', 300000, at(1000));
  await rejectsCode(publisher.publish({ data: dataset(), now: at(1000), lease }), 'LEASE_EXPIRED_OR_FENCED');
  assert.equal(textOf(base, POINTER_KEY), pointerBefore);
  assert.equal(json(base, POINTER_KEY).revision, first.revision);
  assert.equal(json(base, LEASE_KEY).owner, 'ladrão');
  assert.equal(json(base, LEASE_KEY).fencingToken, lease.fencingToken + 1);
  assert.equal(await publisher.release(lease), false, 'o release do lease tomado não apaga o do ladrão');
});

test('fencing: lease vencido no relógio antes da troca, mesmo sem outro dono → LEASE_EXPIRED_OR_FENCED', async () => {
  const base = createMemoryObjectStore();
  let clock = T0;
  const store = interfering(base, async () => { clock = at(60000); });
  const publisher = new S3SnapshotPublisher({ store, clock: () => clock });
  const lease = await publisher.acquire('eu', 60000, T0);
  await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease }), 'LEASE_EXPIRED_OR_FENCED');
  assert.equal(base.objects.has(POINTER_KEY), false);
  await rejectsCode(publisher.publish({ data: dataset(), now: at(60000), lease }), 'LEASE_EXPIRED_OR_FENCED');
});

test('fencing: lease forjado (token ou ETag que não são os do bucket) → LEASE_EXPIRED_OR_FENCED', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('eu', 60000, T0);
  for (const forged of [{ ...lease, fencingToken: lease.fencingToken + 1 }, { ...lease, etag: '"x"' }, { ...lease, owner: 'outro' }]) {
    await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease: forged }), 'LEASE_EXPIRED_OR_FENCED');
  }
  assert.equal(store.objects.has(POINTER_KEY), false);
});

// ---------- CAS ----------

test('CAS perdido: ponteiro mudou entre a leitura e a troca → SNAPSHOT_CAS_LOST, sem retry; a revisão órfã fica privada', async () => {
  const base = createMemoryObjectStore();
  const first = (await publishOnce(new S3SnapshotPublisher({ store: base }), { owner: 'a' })).manifest;
  let rival = null;
  const store = interfering(base, async () => {
    const pointer = await base.get(POINTER_KEY);
    rival = JSON.stringify({ schemaVersion: 1, revision: first.revision, readableRevisions: [first.revision] });
    await base.put(POINTER_KEY, rival, { ifMatch: pointer.etag });
  });
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('b', 60000, at(1000));
  const before = base.calls.length;
  let orphan = null;
  await assert.rejects(publisher.publish({ data: dataset(), now: at(1000), lease }), error => {
    assert.equal(error.code, 'SNAPSHOT_CAS_LOST'); assert.ok(error.cause instanceof PreconditionFailedError); return true;
  });
  orphan = [...base.objects.keys()].find(key => key.startsWith('manifest/revisions/') && key !== revisionKey(first.revision));
  assert.ok(orphan, 'revisão órfã gravada');
  assert.equal(textOf(base, POINTER_KEY), rival, 'ponteiro do rival intacto');
  assert.equal(base.calls.slice(before).filter(c => c.op === 'put' && c.key === POINTER_KEY).length, 2, 'rival + uma única tentativa, sem retry');
  const revision = orphan.slice('manifest/revisions/'.length, -'.json'.length);
  const res = await readerLambda(base)(lambdaEvent({ routeKey: 'GET /api/v1/snapshots/{revision}/{slice}', pathParameters: { revision, slice: 'catalog' } }));
  assert.equal(res.statusCode, 404, 'órfã não é servida');
});

test('CAS perdido na primeira publicação: outro criou o ponteiro → SNAPSHOT_CAS_LOST', async () => {
  const base = createMemoryObjectStore();
  const store = interfering(base, async () => { await base.put(POINTER_KEY, '{"rival":true}', { ifNoneMatch: '*' }); });
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('a', 60000, T0);
  await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease }), 'SNAPSHOT_CAS_LOST');
  assert.equal(textOf(base, POINTER_KEY), '{"rival":true}');
});

test('CAS: 409 (ConflictError) no ponteiro também é SNAPSHOT_CAS_LOST', async () => {
  const base = createMemoryObjectStore();
  const store = { ...base, async put(key, text, options) { if (key === POINTER_KEY) throw new ConflictError(key); return base.put(key, text, options); } };
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('a', 60000, T0);
  await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease }), 'SNAPSHOT_CAS_LOST');
});

// ---------- Dataset inválido ----------

test('dataset inválido: assertSnapshotData falha com TypeError e nada é lido nem gravado', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('a', 60000, T0);
  store.calls.length = 0;
  const broken = dataset(); broken.models[0].companyId = 'company-ausente';
  await assert.rejects(publisher.publish({ data: broken, now: T0, lease }), TypeError);
  const noCatalog = dataset(); delete noCatalog.catalog.relations;
  await assert.rejects(publisher.publish({ data: noCatalog, now: T0, lease }), TypeError);
  await assert.rejects(publisher.publish({ data: dataset(), now: 'ontem', lease }), TypeError);
  assert.deepEqual(store.calls, []);
});

// ---------- Manifesto ----------

test('manifesto: companyMergedInto herdado do manifesto atual e validado contra o catálogo novo; curationRevision preservada', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const ids = SYNTHETIC_WORKSPACE.catalog.companies.map(company => company.id);
  // Estado anterior com uma Empresa retirada (gravado como o Publicador gravaria).
  const first = (await publishOnce(publisher, { owner: 'a' })).manifest;
  const seeded = { ...first, revision: 'seeded-1', curationRevision: 'curation-7', companyMergedInto: [{ fromCompanyId: 'company-retirada', toCompanyId: ids[0] }] };
  await store.put(revisionKey('seeded-1'), JSON.stringify(seeded), { ifNoneMatch: '*' });
  const pointer = await store.get(POINTER_KEY);
  await store.put(POINTER_KEY, JSON.stringify({ schemaVersion: 1, revision: 'seeded-1', readableRevisions: ['seeded-1', first.revision] }), { ifMatch: pointer.etag });
  const { manifest } = await publishOnce(publisher, { owner: 'b', now: at(1000) });
  assert.deepEqual(manifest.companyMergedInto, seeded.companyMergedInto);
  assert.equal(manifest.curationRevision, 'curation-7');
  assert.equal(first.curationRevision, 'curation-0');
  // Uma tabela que contradiz o catálogo novo recusa antes de gravar slices.
  const bad = { ...seeded, revision: 'seeded-2', companyMergedInto: [{ fromCompanyId: ids[0], toCompanyId: ids[1] }] };
  await store.put(revisionKey('seeded-2'), JSON.stringify(bad), { ifNoneMatch: '*' });
  const p2 = await store.get(POINTER_KEY);
  await store.put(POINTER_KEY, JSON.stringify({ schemaVersion: 1, revision: 'seeded-2', readableRevisions: ['seeded-2'] }), { ifMatch: p2.etag });
  const lease = await publisher.acquire('c', 60000, at(2000));
  const before = puts(store).length;
  await assert.rejects(publisher.publish({ data: dataset(), now: at(2000), lease }), TypeError);
  assert.equal(puts(store).length, before);
});

test('estado inválido: ponteiro aponta para manifesto ausente → SNAPSHOT_STATE_INVALID, nada gravado', async () => {
  const store = createMemoryObjectStore();
  await store.put(POINTER_KEY, JSON.stringify({ schemaVersion: 1, revision: 'sumiu', readableRevisions: ['sumiu'] }), { ifNoneMatch: '*' });
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('a', 60000, T0);
  const before = puts(store).length;
  await rejectsCode(publisher.publish({ data: dataset(), now: T0, lease }), 'SNAPSHOT_STATE_INVALID');
  assert.equal(puts(store).length, before);
});

test('sha256Hex dá o mesmo hex que sha256Text e webDigest', async () => {
  const bytes = envelopeBytes('news', SYNTHETIC_WORKSPACE.news);
  assert.equal(await sha256Hex(bytes), sha256Text(bytes));
  assert.equal(await sha256Hex(bytes), await webDigest(bytes));
});

// ---------- Porta S3 ----------

function sdkFake(handler) {
  const sent = [];
  const commands = Object.fromEntries(['GetObjectCommand', 'PutObjectCommand', 'DeleteObjectCommand'].map(name => [name, class { constructor(input) { this.name = name; this.input = input; } }]));
  return { sent, sdk: { ...commands, S3Client: class { async send(command) { sent.push({ name: command.name, ...command.input }); return handler(command); } } } };
}
const s3Error = (name, status) => Object.assign(new Error(name), { name, $metadata: { httpStatusCode: status } });

test('porta S3: IfNoneMatch "*" e IfMatch <etag> nos comandos; 412 e 409 viram PreconditionFailedError e ConflictError', async () => {
  let next = () => ({ ETag: '"e1"' });
  const fake = sdkFake(command => next(command));
  const store = createS3ObjectStore({ bucket: 'b', sdk: fake.sdk });
  assert.deepEqual(await store.put('slices/x', 'bytes', { ifNoneMatch: '*' }), { etag: '"e1"' });
  await store.put('manifest/current.json', 'p', { ifMatch: '"e0"' });
  await store.put('control/lease.json', 'l');
  assert.deepEqual(fake.sent.map(({ name, Bucket, Key, IfNoneMatch, IfMatch, Body }) => ({ name, Bucket, Key, IfNoneMatch, IfMatch, Body })), [
    { name: 'PutObjectCommand', Bucket: 'b', Key: 'slices/x', IfNoneMatch: '*', IfMatch: undefined, Body: 'bytes' },
    { name: 'PutObjectCommand', Bucket: 'b', Key: 'manifest/current.json', IfNoneMatch: undefined, IfMatch: '"e0"', Body: 'p' },
    { name: 'PutObjectCommand', Bucket: 'b', Key: 'control/lease.json', IfNoneMatch: undefined, IfMatch: undefined, Body: 'l' }
  ]);
  assert.equal('IfMatch' in fake.sent[0], false, 'sem cabeçalho vazio');
  next = () => { throw s3Error('PreconditionFailed', 412); };
  await assert.rejects(store.put('k', 'v', { ifNoneMatch: '*' }), PreconditionFailedError);
  next = () => { throw s3Error('ConditionalRequestConflict', 409); };
  await assert.rejects(store.put('k', 'v', { ifMatch: '"e"' }), ConflictError);
  await assert.rejects(store.delete('k', { ifMatch: '"e"' }), ConflictError);
  next = () => { throw s3Error('InternalError', 500); };
  await assert.rejects(store.put('k', 'v', { ifNoneMatch: '*' }), /InternalError/);
});

test('porta S3: get devolve texto e ETag; NoSuchKey e AccessDenied (sem ListBucket) são ausência; delete com IfMatch', async () => {
  let next = () => ({ ETag: '"e9"', Body: { transformToString: async encoding => { assert.equal(encoding, 'utf-8'); return 'texto'; } } });
  const fake = sdkFake(command => next(command));
  const store = createS3ObjectStore({ bucket: 'b', sdk: fake.sdk });
  assert.deepEqual(await store.get('manifest/current.json'), { text: 'texto', etag: '"e9"' });
  for (const name of ['NoSuchKey', 'AccessDenied']) { next = () => { throw s3Error(name, name === 'NoSuchKey' ? 404 : 403); }; assert.equal(await store.get('k'), null); }
  next = () => { throw s3Error('SlowDown', 503); };
  await assert.rejects(store.get('k'), /SlowDown/);
  next = () => ({});
  await store.delete('control/lease.json', { ifMatch: '"e9"' });
  assert.deepEqual(fake.sent.at(-1), { name: 'DeleteObjectCommand', Bucket: 'b', Key: 'control/lease.json', IfMatch: '"e9"' });
});

test('Publicador sobre a porta S3 com SDK falso fiel: primeira e segunda publicação com os cabeçalhos certos', async () => {
  const objects = new Map(); let version = 0;
  const fake = sdkFake(({ name, input }) => {
    const found = objects.get(input.Key);
    if (name === 'GetObjectCommand') { if (!found) throw s3Error('AccessDenied', 403); return { ETag: found.etag, Body: { transformToString: async () => found.text } }; }
    if ((input.IfNoneMatch === '*' && found) || (input.IfMatch !== undefined && found?.etag !== input.IfMatch)) throw s3Error('PreconditionFailed', 412);
    if (name === 'DeleteObjectCommand') { objects.delete(input.Key); return {}; }
    const etag = `"s${version += 1}"`; objects.set(input.Key, { text: input.Body, etag }); return { ETag: etag };
  });
  const publisher = new S3SnapshotPublisher({ store: createS3ObjectStore({ bucket: 'b', sdk: fake.sdk }) });
  const first = await publishOnce(publisher, { owner: 'a' });
  const pointerEtag = objects.get(POINTER_KEY).etag;
  const second = await publishOnce(publisher, { owner: 'b', now: at(1000) });
  const pointerPuts = fake.sent.filter(c => c.name === 'PutObjectCommand' && c.Key === POINTER_KEY);
  assert.deepEqual(pointerPuts.map(c => [c.IfNoneMatch, c.IfMatch]), [['*', undefined], [undefined, pointerEtag]]);
  for (const c of fake.sent.filter(c => c.name === 'PutObjectCommand' && (c.Key.startsWith(SLICE_PREFIX) || c.Key.startsWith('manifest/revisions/')))) assert.equal(c.IfNoneMatch, '*', c.Key);
  assert.deepEqual(JSON.parse(objects.get(POINTER_KEY).text).readableRevisions, [second.manifest.revision, first.manifest.revision]);
});

// ---------- Revisão ----------

test('revisão: ponteiro ou manifesto ilegível no bucket vira SNAPSHOT_STATE_INVALID', async () => {
  for (const corrupt of [store => store.objects.set(POINTER_KEY, { text: '{não json', etag: '"x"' }), store => store.objects.set(POINTER_KEY, { text: '{}', etag: '"x"' })]) {
    const store = createMemoryObjectStore();
    const publisher = new S3SnapshotPublisher({ store });
    await publishOnce(publisher);
    corrupt(store);
    const lease = await publisher.acquire('again', 60000, at(5000));
    await assert.rejects(publisher.publish({ data: dataset(), now: at(5000), lease }), error => error.code === 'SNAPSHOT_STATE_INVALID');
  }
});

test('revisão: lease ilegível vira SNAPSHOT_STATE_INVALID, não um TypeError genérico', async () => {
  const store = createMemoryObjectStore();
  store.objects.set(LEASE_KEY, { text: 'lixo', etag: '"x"' });
  const publisher = new S3SnapshotPublisher({ store });
  await assert.rejects(publisher.acquire('a', 60000, T0), error => error.code === 'SNAPSHOT_STATE_INVALID');
});

test('revisão: lease forjado não grava nenhum objeto antes de ser recusado', async () => {
  const store = createMemoryObjectStore();
  const publisher = new S3SnapshotPublisher({ store });
  const real = await publisher.acquire('dono', 60000, T0);
  const forged = { ...real, owner: 'intruso' };
  await assert.rejects(publisher.publish({ data: dataset(), now: T0, lease: forged }), error => error.code === 'LEASE_EXPIRED_OR_FENCED');
  assert.equal([...store.objects.keys()].some(key => key.startsWith(SLICE_PREFIX) || key.startsWith('manifest/')), false);
});

test('revisão: 412 numa slice cuja releitura volta vazia não é aceito como igual', async () => {
  const base = createMemoryObjectStore();
  const store = { ...base, objects: base.objects, calls: base.calls,
    async put(key, text, options) { if (key.startsWith(SLICE_PREFIX)) throw new PreconditionFailedError(); return base.put(key, text, options); },
    async get(key) { return key.startsWith(SLICE_PREFIX) ? null : base.get(key); } };
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('run', 60000, T0);
  await assert.rejects(publisher.publish({ data: dataset(), now: T0, lease }), error => error.code === 'SNAPSHOT_SLICE_CORRUPT');
});

test('revisão: 409 concorrente numa slice de mesmo conteúdo é aceito após conferir o digest', async () => {
  const base = createMemoryObjectStore();
  let first = true;
  const store = { ...base, objects: base.objects, calls: base.calls, get: key => base.get(key),
    async put(key, text, options) {
      if (key.startsWith(SLICE_PREFIX) && first) { first = false; await base.put(key, text, options); throw new ConflictError(); }
      return base.put(key, text, options);
    } };
  const publisher = new S3SnapshotPublisher({ store });
  const lease = await publisher.acquire('run', 60000, T0);
  const { pointer } = await publisher.publish({ data: dataset(), now: T0, lease });
  assert.equal(pointer.readableRevisions.length, 1);
});
