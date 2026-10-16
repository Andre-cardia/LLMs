import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCollection } from '../src/domain/collection-guard.mjs';
import { assertSnapshotData, assertManifest, assertManifestResponse, assertCompanyMergedInto } from '../src/contracts/snapshot.mjs';
import { MemoryControl } from '../src/adapters/memory-control.mjs';
import { MemorySnapshots, sha256Text } from '../src/adapters/memory-snapshots.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { LocalUpdate } from '../src/application/local-update.mjs';
import { clone, canonicalJson } from '../src/contracts/primitives.mjs';
import { fixture, invalidFixture, workspace, publish } from './helpers/local-fixtures.mjs';

test('full vazio/<50% rejeitado, metade aceita, baseline precisa mesmo escopo/fonte/schema', () => {
  const baseline = { sourceId: 'a', scope: 'all', schemaVersion: 1, mode: 'full', items: [1, 2, 3, 4] };
  for (const [count, expected] of [[0, false], [1, false], [2, true], [3, true]]) assert.equal(evaluateCollection({ ...baseline, items: baseline.items.slice(0, count) }, baseline).accepted, expected);
  for (const mode of ['incremental', 'single']) assert.equal(evaluateCollection({ ...baseline, mode, items: [] }, baseline).accepted, true);
  for (const change of [{ scope: 'new' }, { sourceId: 'b' }, { schemaVersion: 2 }]) assert.equal(evaluateCollection({ ...baseline, ...change, items: [1] }, baseline).accepted, true);
  assert.equal(evaluateCollection({ ...baseline, items: [1, 2] }, { ...baseline, items: [1, 2, 3, 4, 5] }).accepted, false);
});

test('produtor/consumidor usam schema válido e rejeitam fixture de referência quebrada', async () => {
  assertSnapshotData(fixture); assert.throws(() => assertSnapshotData(invalidFixture), /Empresa ausente/);
  const work = workspace(); publish(work); const loaded = await work.reader.refresh();
  assert.equal(loaded.status, 'updated'); assert.deepEqual(loaded.snapshot.catalog, fixture.catalog);
  assert.throws(() => { loaded.snapshot.catalog.companies[0].name = 'alterado'; }, TypeError);
});

test('sem autorização injetada nega por padrão, símbolos distintos não publicam/lêem', () => {
  const work = workspace(); publish(work);
  assert.throws(() => work.snapshots.readManifest(work.agent), /FORBIDDEN/);
  assert.throws(() => work.snapshots.readSlice('snapshot-1', 'models', undefined), /FORBIDDEN/);
  assert.throws(() => work.snapshots.acquireLease('snapshot', 'agent-run', 1000, work.agent), /FORBIDDEN/);
  const denied = new MemorySnapshots({ control: new MemoryControl(), clock: work.clock, catalog: fixture.catalog });
  assert.throws(() => denied.readManifest(work.owner), /FORBIDDEN/);
});

test('CAS perdido/lease vencido não aplicam curadoria nem trocam manifesto', () => {
  const work = workspace(); publish(work);
  const stale = work.snapshots.acquireLease('snapshot', 'run-2', 1000, work.job);
  const payload = { expectedRevision: null, lease: stale, models: work.data.models, news: work.data.news, lastSuccessAt: { catalog: work.clock(), models: work.clock(), news: work.clock() } };
  const before = work.control.read(); let applied = false;
  assert.throws(() => work.snapshots.publish(payload, work.job, state => { applied = true; state.catalog.companies[0].name = 'novo'; }), /CAS_LOST/);
  assert.equal(applied, false); assert.deepEqual(work.control.read(), before);
  work.setClock('2026-10-10T12:00:02Z');
  const newer = work.snapshots.acquireLease('snapshot', 'run-3', 1000, work.job);
  assert.ok(newer.fencingToken > stale.fencingToken);
  assert.throws(() => work.snapshots.publish({ ...payload, expectedRevision: before.snapshotRevision }, work.job), /FENCED/);
  assert.equal(work.snapshots.releaseLease(stale, work.job), false);
  assert.equal(work.control.read().leases.get('snapshot').ownerRunId, 'run-3');
});

test('referência inválida reverte a curadoria inteira antes da publicação', () => {
  const work = workspace(); publish(work);
  assert.throws(() => publish(work, 'run-2', state => { state.catalog.companies = state.catalog.companies.filter(company => company.id !== 'company-1'); state.catalog.relations = []; }), /Empresa ausente/);
  assert.equal(work.control.read().snapshotRevision, 'snapshot-1');
  assert.equal(work.control.read().catalog.companies.length, 3);
});

test('leitor conserva conjunto inteiro em falha/schema/digest e não aceita mistura de slices', async () => {
  const work = workspace(); publish(work); await work.reader.refresh();
  let mode = 'ok'; const manifest = work.snapshots.readManifestResponse(work.owner);
  const reader = new SnapshotReader({ readManifest: () => manifest, digest: sha256Text,
    readSlice: (revision, slice) => {
      if (mode === 'fail' && slice === 'news') throw new Error('fonte caiu');
      if (mode === 'corrupt' && slice === 'models') return '{}';
      if (mode === 'wrong-slice' && slice === 'models') return work.snapshots.readSlice(revision, 'news', work.owner);
      return work.snapshots.readSlice(revision, slice, work.owner);
    } });
  await reader.refresh(); const initial = reader.current;
  for (mode of ['fail', 'corrupt', 'wrong-slice']) {
    const result = await reader.refresh(); assert.equal(result.status, 'kept-last-good'); assert.equal(reader.current, initial);
  }
  const broken = clone(manifest); const invalidBytes = canonicalJson({ schemaVersion: 1, slice: 'models', data: invalidFixture.models });
  broken.slices.models.digest = sha256Text(invalidBytes);
  const invalidReader = new SnapshotReader({ readManifest: () => broken, digest: sha256Text,
    readSlice: (revision, slice) => slice === 'models' ? invalidBytes : work.snapshots.readSlice(revision, slice, work.owner) });
  assert.equal((await invalidReader.refresh()).status, 'unavailable');
});

test('atualização integra guards e preserva dado/horário na falha; replay não coleta de novo', async () => {
  const work = workspace(); const updater = new LocalUpdate(work);
  let calls = 0;
  const args = { runId: 'window-1', modelsSourceId: 'fake', scope: 'all', context: work.job,
    fetchModels: () => { calls += 1; return clone(fixture.models); }, fetchNews: () => clone(fixture.news) };
  const first = await updater.run(args); assert.equal(first.manifest.revision, 'snapshot-1');
  assert.deepEqual(await updater.run(args), first); assert.equal(calls, 1);
  await assert.rejects(updater.run({ ...args, modelsSourceId: 'different' }), /IDEMPOTENCY_CONFLICT/);
  await assert.rejects(updater.run({ ...args, context: work.agent }), /FORBIDDEN/);
  work.setClock('2026-10-10T13:00:00Z');
  const invalid = await updater.run({ ...args, runId: 'window-2', fetchModels: () => [], fetchNews: () => { throw new Error('offline'); } });
  assert.equal(invalid.modelsOutcome, 'empty-full'); assert.equal(invalid.newsOutcome, 'failed');
  const current = await work.reader.refresh(); assert.deepEqual(current.snapshot.models, fixture.models);
  assert.equal(current.snapshot.manifest.slices.models.lastSuccessAt, fixture.now);
  assert.equal(current.snapshot.manifest.slices.news.lastSuccessAt, fixture.now);
  assert.equal(current.snapshot.manifest.slices.catalog.lastSuccessAt, fixture.now);
  assert.equal([...work.control.read().modelCollections.values()][0].items.length, fixture.models.length);
});

test('transação recusa callback assíncrono/reentrada e conserva baseline', () => {
  const control = new MemoryControl({ value: 1 });
  assert.throws(() => control.transact(state => { state.value = 2; return Promise.resolve(); }), /SYNCHRONOUS/);
  assert.throws(() => control.transact(() => control.transact(() => {})), /REENTRANT/);
  assert.deepEqual(control.read(), { value: 1 });
});

test('schema rejeita arrays esparsos/campos extras/versões e limites de coordenadas', () => {
  for (const mutate of [data => { data.models = Array(1); }, data => { data.catalog.companies[0].location.latitude = 91; }, data => { data.models[0].schemaVersion = 2; }, data => { data.news[0].tool = 'write'; }]) {
    const bad = clone(fixture); mutate(bad); assert.throws(() => assertSnapshotData(bad), TypeError);
  }
});

// Retira uma Empresa do catálogo curado e das slices, como faria a curadoria de um merge.
function retire(state, data, id) {
  state.catalog.companies = state.catalog.companies.filter(company => company.id !== id);
  state.catalog.relations = state.catalog.relations.filter(r => r.fromCompanyId !== id && r.toCompanyId !== id);
  return { models: data.models.filter(m => m.companyId !== id), news: data.news.filter(n => ![...n.relevantCompanyIds, ...n.citedCompanyIds].includes(id)),
    lastSuccessAt: { catalog: data.now, models: data.now, news: data.now } };
}

test('manifesto v2: Publisher emite a tabela do controle e leitor a valida contra o catálogo', async () => {
  const work = workspace(); const first = publish(work);
  assert.equal(first.schemaVersion, 2); assert.deepEqual(first.companyMergedInto, []);
  assert.deepEqual(work.control.read().companyMergedInto, []);
  const merged = publish(work, 'run-2', state => { state.companyMergedInto = [{ fromCompanyId: 'company-1', toCompanyId: 'company-3' }]; return retire(state, work.data, 'company-1'); });
  assert.deepEqual(merged.companyMergedInto, [{ fromCompanyId: 'company-1', toCompanyId: 'company-3' }]);
  const loaded = await work.reader.refresh(); assert.equal(loaded.status, 'updated');
  assert.deepEqual(loaded.snapshot.manifest.companyMergedInto, merged.companyMergedInto);
  // Retirada do sobrevivente regrava a entrada com null; o Publisher aceita.
  const retired = publish(work, 'run-3', state => { state.companyMergedInto = [{ fromCompanyId: 'company-1', toCompanyId: null }, { fromCompanyId: 'company-3', toCompanyId: null }];
    const data = { ...work.data, models: work.data.models.filter(m => m.companyId !== 'company-1'), news: work.data.news.filter(n => ![...n.relevantCompanyIds, ...n.citedCompanyIds].includes('company-1')) };
    return retire(state, data, 'company-3'); });
  assert.deepEqual(retired.companyMergedInto.map(e => e.toCompanyId), [null, null]);
});

test('manifesto v2: Publisher não publica tabela incoerente e preserva o controle', () => {
  const work = workspace(); publish(work); const before = work.control.read();
  const tables = [
    [{ fromCompanyId: 'company-1', toCompanyId: 'company-3' }],
    [{ fromCompanyId: 'gone', toCompanyId: 'missing' }],
    [{ fromCompanyId: 'gone-a', toCompanyId: 'gone-b' }, { fromCompanyId: 'gone-b', toCompanyId: 'company-3' }],
    [{ fromCompanyId: 'gone', toCompanyId: 'company-3' }, { fromCompanyId: 'gone', toCompanyId: 'company-2' }],
    [{ fromCompanyId: 'company-3', toCompanyId: 'company-3' }]
  ];
  for (const [i, table] of tables.entries()) {
    assert.throws(() => publish(work, `bad-${i}`, state => { state.companyMergedInto = table; }), /INVALID_MERGE_TABLE/);
    work.snapshots.releaseLease(work.control.read().leases.get('snapshot'), work.job);
    const after = work.control.read();
    assert.equal(after.snapshotRevision, before.snapshotRevision); assert.deepEqual(after.companyMergedInto, []); assert.deepEqual(after.catalog, before.catalog);
  }
});

test('manifesto v1 é rejeitado pelo contrato e pelo leitor; tabela incoerente torna o leitor indisponível', async () => {
  const work = workspace(); publish(work); const internal = work.snapshots.readManifest(work.owner);
  assert.equal(assertManifest(clone(internal)).schemaVersion, 2);
  const variants = base => { const v1 = clone(base); v1.schemaVersion = 1; delete v1.companyMergedInto;
    const missing = clone(base); delete missing.companyMergedInto; return [v1, { ...clone(base), schemaVersion: 1 }, missing]; };
  for (const bad of variants(internal)) assert.throws(() => assertManifest(bad), TypeError);
  // O leitor recebe o formato externo (AD-27); o v1 é recusado nos dois contratos.
  const manifest = work.snapshots.readManifestResponse(work.owner);
  assert.equal(assertManifestResponse(clone(manifest)).schemaVersion, 2);
  const [v1, v1WithTable, missing] = variants(manifest);
  for (const bad of [v1, v1WithTable, missing]) assert.throws(() => assertManifestResponse(bad), TypeError);
  const readSlice = (revision, slice) => work.snapshots.readSlice(revision, slice, work.owner);
  for (const bad of [v1, v1WithTable]) {
    const reader = new SnapshotReader({ readManifest: () => bad, readSlice, digest: sha256Text });
    const result = await reader.refresh(); assert.equal(result.status, 'unavailable'); assert.equal(reader.current, null);
  }
  let current = manifest; const reader = new SnapshotReader({ readManifest: () => current, readSlice, digest: sha256Text });
  assert.equal((await reader.refresh()).status, 'updated'); const good = reader.current;
  const incoherent = [
    [{ fromCompanyId: 'company-1', toCompanyId: 'company-3' }],
    [{ fromCompanyId: 'gone', toCompanyId: 'missing' }],
    [{ fromCompanyId: 'gone-a', toCompanyId: 'gone-b' }, { fromCompanyId: 'gone-b', toCompanyId: 'company-3' }]
  ];
  for (const table of [...incoherent, null]) {
    current = { ...clone(manifest), companyMergedInto: table };
    const result = await reader.refresh(); assert.equal(result.status, 'kept-last-good'); assert.equal(reader.current, good);
  }
  current = v1; assert.equal((await reader.refresh()).status, 'kept-last-good'); assert.equal(reader.current, good);
});

test('validador único: forma, compactação, limite e coerência com o catálogo novo', () => {
  const ok = [{ fromCompanyId: 'a', toCompanyId: 'c' }, { fromCompanyId: 'b', toCompanyId: 'c' }, { fromCompanyId: 'd', toCompanyId: null }];
  assert.equal(assertCompanyMergedInto(ok), ok); assert.equal(assertCompanyMergedInto([]).length, 0);
  assert.equal(assertCompanyMergedInto(ok, { nextCompanyIds: ['c'] }), ok);
  assert.equal(assertCompanyMergedInto(ok, { nextCompanyIds: new Set(['c', 'x']) }), ok);
  const limit = Array.from({ length: 10000 }, (_, i) => ({ fromCompanyId: `old-${i}`, toCompanyId: 'c' }));
  assert.equal(assertCompanyMergedInto(limit).length, 10000);
  const invalid = [null, {}, [null], [{ fromCompanyId: 'a' }], [{ fromCompanyId: 'a', toCompanyId: 'c', extra: 1 }], [{ fromCompanyId: '', toCompanyId: 'c' }],
    [{ fromCompanyId: 'a', toCompanyId: 1 }], [{ fromCompanyId: 'a', toCompanyId: 'a' }], [{ fromCompanyId: 'a', toCompanyId: 'c' }, { fromCompanyId: 'a', toCompanyId: 'd' }],
    [{ fromCompanyId: 'a', toCompanyId: 'b' }, { fromCompanyId: 'b', toCompanyId: 'c' }], [...limit, { fromCompanyId: 'extra', toCompanyId: 'c' }]];
  for (const value of invalid) assert.throws(() => assertCompanyMergedInto(value), /INVALID_MERGE_TABLE/);
  assert.throws(() => assertCompanyMergedInto(ok, { nextCompanyIds: ['c', 'a'] }), /INVALID_MERGE_TABLE: from presente/);
  assert.throws(() => assertCompanyMergedInto(ok, { nextCompanyIds: [] }), /INVALID_MERGE_TABLE: to ausente/);
});

test('nenhum manifesto do repositório é v1: produzidos e literais', async () => {
  const work = workspace(); const manifests = [publish(work), work.snapshots.readManifest(work.owner)];
  const updated = workspace();
  manifests.push((await new LocalUpdate(updated).run({ runId: 'scan', modelsSourceId: 'fake', scope: 'all', context: updated.job, fetchModels: () => clone(fixture.models), fetchNews: () => clone(fixture.news) })).manifest);
  for (const manifest of manifests) { assert.equal(manifest.schemaVersion, 2); assertManifest(manifest); }
  const { readdir, readFile } = await import('node:fs/promises');
  const root = new URL('../', import.meta.url); const offenders = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
      if (entry.isDirectory()) await walk(url);
      else if (/\.(mjs|json)$/.test(entry.name)) {
        const text = await readFile(url, 'utf8');
        if (entry.name.endsWith('.json')) {
          const visit = value => { if (value && typeof value === 'object') {
            if (!Array.isArray(value) && Object.hasOwn(value, 'slices') && Object.hasOwn(value, 'revision') && value.schemaVersion !== 2) offenders.push(url.pathname);
            Object.values(value).forEach(visit); } };
          visit(JSON.parse(text));
        }
        // Literal de manifesto: objeto com schemaVersion 1 e campo exclusivo do manifesto.
        // Janela até o fim da instrução, para alcançar campos depois de objetos aninhados (slices:{...}).
        if (/schemaVersion\s*:\s*1(?!\d)[^;]{0,600}?\b(curationRevision|publishedAt|companyMergedInto)\b/.test(text)) offenders.push(url.pathname);
      }
    }
  }
  for (const folder of ['src/', 'scripts/', 'tests/']) await walk(new URL(folder, root));
  assert.deepEqual(offenders, []);
});
