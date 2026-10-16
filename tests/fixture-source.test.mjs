import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fixture, workspace, publish } from './helpers/local-fixtures.mjs';
import { clone, canonicalJson } from '../src/contracts/primitives.mjs';
import { assertManifestResponse, envelopeBytes, SLICES } from '../src/contracts/snapshot.mjs';
import { SYNTHETIC_FIXTURE } from '../src/contracts/provenance.mjs';
import { sha256Text } from '../src/adapters/memory-snapshots.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { LocalNewsView } from '../src/application/local-news-view.mjs';
import { LocalSearch } from '../src/application/local-search.mjs';
import { createExplorationStore } from '../src/application/exploration-store.mjs';
import { webDigest } from '../src/ui/web-digest.mjs';
import { createFixtureSource, provenance } from '../src/ui/fixture-source.mjs';
import { SYNTHETIC_WORKSPACE } from '../src/ui/fixtures/synthetic-workspace.mjs';

const config = { schemaVersion: 2, initialBase: 'MAPA', availableBases: ['MAPA', 'SAT'] };
const readerFor = source => new SnapshotReader({ readManifest: source.readManifest, readSlice: source.readSlice, digest: webDigest });
function viewFor(source, reader) {
  return new LocalNewsView({ readSnapshot: async () => (await reader.refresh()).snapshot, readFeedback: source.readFeedback,
    resolveAlias: source.resolveAlias, clock: () => SYNTHETIC_WORKSPACE.now });
}

test('marcador único: constante do contrato, dataset e export de fixture-source', () => {
  assert.equal(SYNTHETIC_FIXTURE, 'synthetic-fixture');
  assert.equal(SYNTHETIC_WORKSPACE.provenance, SYNTHETIC_FIXTURE);
  assert.equal(provenance, SYNTHETIC_FIXTURE);
  assert.equal(createFixtureSource({ digest: webDigest }).provenance, SYNTHETIC_FIXTURE);
});

test('dataset congelado e com o mesmo conteúdo de tests/fixtures/local-workspace.json', () => {
  assert.ok(Object.isFrozen(SYNTHETIC_WORKSPACE) && Object.isFrozen(SYNTHETIC_WORKSPACE.catalog.companies[0]));
  const { provenance: marker, ...content } = clone(SYNTHETIC_WORKSPACE);
  assert.equal(marker, SYNTHETIC_FIXTURE);
  assert.deepEqual(content, fixture);
});

test('leitura completa: SnapshotReader com webDigest → updated, catálogo igual ao dataset', async () => {
  const result = await readerFor(createFixtureSource({ digest: webDigest })).refresh();
  assert.equal(result.status, 'updated');
  assert.deepEqual(result.snapshot.catalog, fixture.catalog);
  assert.deepEqual(result.snapshot.models, fixture.models);
  assert.deepEqual(result.snapshot.news, fixture.news);
});

test('manifesto v2 gerado: revisão fixture-1, tabela vazia, tempos = now, formato externo sem objectKey', async () => {
  const manifest = await createFixtureSource({ digest: webDigest }).readManifest();
  assertManifestResponse(manifest);
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.revision, 'fixture-1');
  assert.deepEqual(manifest.companyMergedInto, []);
  assert.equal(manifest.publishedAt, fixture.now);
  for (const slice of SLICES) {
    const ref = manifest.slices[slice];
    assert.equal(ref.lastSuccessAt, fixture.now);
    assert.equal(Object.hasOwn(ref, 'objectKey'), false);
    assert.equal(ref.digest, sha256Text(envelopeBytes(slice, fixture[slice])));
  }
});

test('manifesto construído uma vez, de forma preguiçosa', async () => {
  let calls = 0;
  const source = createFixtureSource({ digest: text => { calls += 1; return webDigest(text); } });
  assert.equal(calls, 0);
  await Promise.all([source.readManifest(), source.readManifest()]);
  await source.readManifest();
  assert.equal(calls, SLICES.length);
});

test('paridade de digest: sha256Text e webDigest produzem manifestos idênticos', async () => {
  const web = await createFixtureSource({ digest: webDigest }).readManifest();
  const node = await createFixtureSource({ digest: sha256Text }).readManifest();
  assert.deepEqual(web, node);
});

test('envelope igual ao Publisher: envelopeBytes = bytes gravados por MemorySnapshots, e a fonte serve os mesmos', async () => {
  const work = workspace(); const published = publish(work);
  const source = createFixtureSource({ digest: sha256Text }); const manifest = await source.readManifest();
  for (const slice of SLICES) {
    const stored = work.snapshots.readSlice(published.revision, slice, work.owner);
    assert.equal(envelopeBytes(slice, work.data[slice]), stored);
    assert.equal(canonicalJson({ schemaVersion: 1, slice, data: work.data[slice] }), stored);
    assert.equal(await source.readSlice('fixture-1', slice), stored);
    assert.equal(manifest.slices[slice].digest, published.slices[slice].digest);
  }
});

test('slice desconhecida rejeita SLICE_NOT_FOUND; revisão desconhecida rejeita SNAPSHOT_NOT_FOUND', async () => {
  const source = createFixtureSource({ digest: webDigest });
  await assert.rejects(source.readSlice('fixture-1', 'bogus'), { message: 'SLICE_NOT_FOUND' });
  await assert.rejects(source.readSlice('fixture-1', '__proto__'), { message: 'SLICE_NOT_FOUND' });
  await assert.rejects(source.readSlice('outra', 'catalog'), { message: 'SNAPSHOT_NOT_FOUND' });
});

test('feedback: forma aceita por LocalNewsView, hiddenNewsIds vazio', async () => {
  const source = createFixtureSource({ digest: webDigest });
  const feedback = await source.readFeedback();
  assert.deepEqual(feedback, { feedbackRevision: 0, items: fixture.news, hiddenNewsIds: [] });
  const view = viewFor(source, readerFor(source));
  const context = await view.context();
  assert.equal(context.dataRevision, 'fixture-1');
  assert.equal(context.feedbackRevision, 0);
  assert.ok(context.news.length > 0);
  const frame = await view.frame();
  assert.deepEqual(frame.hiddenNewsIds, []);
});

test('alias: ID existente devolve item, inexistente devolve null', async () => {
  const source = createFixtureSource({ digest: webDigest });
  assert.deepEqual(await source.resolveAlias('news-1'), fixture.news[0]);
  assert.equal(await source.resolveAlias('news-inexistente'), null);
});

test('retorno mutado: segunda leitura intacta em todas as portas', async () => {
  const source = createFixtureSource({ digest: webDigest });
  const manifest = await source.readManifest();
  manifest.revision = 'mutado'; manifest.slices.catalog.digest = '0'.repeat(64); manifest.companyMergedInto.push({ fromCompanyId: 'x', toCompanyId: null });
  const again = await source.readManifest();
  assert.equal(again.revision, 'fixture-1'); assert.notEqual(again.slices.catalog.digest, '0'.repeat(64)); assert.deepEqual(again.companyMergedInto, []);
  const feedback = await source.readFeedback();
  feedback.items[0].titleOriginal = 'mutado'; feedback.items.pop(); feedback.hiddenNewsIds.push('news-1');
  assert.deepEqual(await source.readFeedback(), { feedbackRevision: 0, items: fixture.news, hiddenNewsIds: [] });
  const item = await source.resolveAlias('news-1'); item.titleOriginal = 'mutado';
  assert.deepEqual(await source.resolveAlias('news-1'), fixture.news[0]);
  assert.equal(typeof await source.readSlice('fixture-1', 'catalog'), 'string');
  const result = await readerFor(source).refresh();
  assert.equal(result.status, 'updated');
});

test('dataset sem marcador não constrói (TypeError); digest ausente também', () => {
  const { provenance: _omit, ...unmarked } = clone(SYNTHETIC_WORKSPACE);
  assert.throws(() => createFixtureSource({ digest: webDigest, dataset: unmarked }), TypeError);
  assert.throws(() => createFixtureSource({ digest: webDigest, dataset: { ...unmarked, provenance: 'real' } }), TypeError);
  assert.throws(() => createFixtureSource({}), TypeError);
});

test('busca de ponta a ponta: fonte → reader → view → LocalSearch com createExplorationStore', async t => {
  const source = createFixtureSource({ digest: webDigest });
  const reader = readerFor(source);
  const first = await reader.refresh();
  const store = createExplorationStore({ data: first.snapshot, revision: first.snapshot.manifest.revision, now: SYNTHETIC_WORKSPACE.now, config });
  t.after(() => store.dispose());
  const search = new LocalSearch({ view: viewFor(source, reader), store });
  const response = await search.search('fictício');
  assert.equal(response.status, 'results');
  assert.ok(response.results.length > 0);
  assert.equal(response.context.dataRevision, 'fixture-1');
  const selected = await search.select(response.results.find(result => result.target.type === 'company'));
  assert.equal(selected.status, 'available');
});

test('guarda: todo URL do dataset está em example.invalid', () => {
  const urls = [];
  const visit = value => {
    if (typeof value === 'string') { if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) urls.push(value); }
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  visit(SYNTHETIC_WORKSPACE);
  assert.ok(urls.length > 0);
  for (const url of urls) assert.equal(new URL(url).hostname, 'example.invalid', url);
});

test('guarda: nenhum módulo alcançável de fixture-source ou src/ui/fixtures/ importa adapters, node: ou JSON', async () => {
  const root = new URL('../', import.meta.url);
  const start = [new URL('src/ui/fixture-source.mjs', root), new URL('src/ui/fixtures/synthetic-workspace.mjs', root)];
  const seen = new Set(); const offenders = [];
  const IMPORT = /\b(?:import|export)\s*(?:[^'"`;]*?\sfrom\s*)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  async function walk(url) {
    if (seen.has(url.href)) return; seen.add(url.href);
    // Comentários (de linha e de bloco) não são código: removidos antes das buscas.
    const text = (await readFile(url, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
    for (const match of text.matchAll(IMPORT)) {
      const specifier = match[1] ?? match[2];
      if (!specifier.startsWith('.')) { offenders.push(`${fileURLToPath(url)} → ${specifier} (${specifier.startsWith('node:') ? 'node:' : 'pacote'})`); continue; }
      const target = new URL(specifier, url);
      if (target.pathname.includes('/src/adapters/') || target.pathname.endsWith('.json')) { offenders.push(`${fileURLToPath(url)} → ${specifier}`); continue; }
      await walk(target);
    }
    if (/\bimport\s*\(\s*[^'"\s)]/.test(text)) offenders.push(`${fileURLToPath(url)}: import dinâmico não literal`);
    if (/\bfetch\b|XMLHttpRequest|WebSocket|EventSource|sendBeacon|\bcaches\b|document\.cookie|importScripts|localStorage|sessionStorage|indexedDB/.test(text)) offenders.push(`${fileURLToPath(url)}: E/S proibida`);
  }
  for (const url of start) await walk(url);
  assert.ok(seen.size >= 3);
  assert.deepEqual(offenders, []);
});

test('revisão: falha da porta digest não fica memorizada; a leitura seguinte reconstrói o manifesto', async () => {
  let calls = 0, fail = true;
  const source = createFixtureSource({ digest: text => { calls += 1; if (fail) return Promise.reject(new Error('digest-down')); return webDigest(text); } });
  await assert.rejects(source.readManifest(), /digest-down/);
  await assert.rejects(source.readManifest(), /digest-down/);
  fail = false;
  const before = calls;
  const manifest = await source.readManifest();
  assert.equal(assertManifestResponse(manifest).revision, 'fixture-1');
  assert.ok(calls > before);
});

test('revisão: chamadas concorrentes durante uma construção que falha rejeitam juntas e a seguinte reconstrói', async () => {
  let fail = true;
  const source = createFixtureSource({ digest: text => fail ? Promise.reject(new Error('digest-down')) : webDigest(text) });
  const results = await Promise.allSettled([source.readManifest(), source.readManifest()]);
  assert.deepEqual(results.map(r => r.status), ['rejected', 'rejected']);
  fail = false;
  assert.equal((await source.readManifest()).revision, 'fixture-1');
});

test('revisão: dataset sem now válido, sem slice ou não clonável recusa com TypeError', () => {
  const base = { ...clone(SYNTHETIC_WORKSPACE), provenance: SYNTHETIC_FIXTURE };
  assert.throws(() => createFixtureSource({ digest: webDigest, dataset: { ...base, now: 'ontem' } }), TypeError);
  const { news, ...semNews } = base;
  assert.throws(() => createFixtureSource({ digest: webDigest, dataset: semNews }), /dataset sem news/);
  assert.throws(() => createFixtureSource({ digest: webDigest, dataset: { ...base, catalog: { ...base.catalog, extra: () => {} } } }), TypeError);
});
