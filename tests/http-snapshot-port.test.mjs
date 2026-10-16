import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AccessDeniedError, RevisionSupersededError } from '../src/contracts/access.mjs';
import { clone } from '../src/contracts/primitives.mjs';
import { assertManifest, assertManifestResponse, toManifestResponse, REVISION_PATTERN, SLICES } from '../src/contracts/snapshot.mjs';
import { createSnapshotReaderHandler } from '../src/adapters/lambda/snapshot-reader.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { createHttpSnapshotPort, SnapshotHttpError, SNAPSHOT_HTTP_UNAVAILABLE } from '../src/ui/http-snapshot-port.mjs';
import { webDigest } from '../src/ui/web-digest.mjs';
import { workspace, publish } from './helpers/local-fixtures.mjs';
import { CLIENT_ID, OWNER_SUB, fakeBucket, fetchViaLambda, mirrorPublications } from './helpers/snapshot-bucket.mjs';

const API = 'https://api.example.invalid';

// fetch falso com respostas em fila: número = status sem corpo; objeto = {status, body}; Error = falha de rede.
function scripted(responses) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (next === undefined) throw new Error('fetch inesperado');
    if (next instanceof Error) throw next;
    const { status, body = '' } = typeof next === 'number' ? { status: next } : next;
    return { ok: status >= 200 && status < 300, status, json: async () => JSON.parse(body), text: async () => body };
  };
  return { fetch, calls };
}
function tokens(values) {
  const calls = [];
  const accessToken = async options => { calls.push(options ?? null); return values.length > 1 ? values.shift() : values[0]; };
  return { accessToken, calls };
}
function published() {
  const work = workspace(); publish(work);
  const manifest = work.snapshots.readManifestResponse(work.owner);
  const bytes = Object.fromEntries(SLICES.map(slice => [slice, work.snapshots.readSlice(manifest.revision, slice, work.owner)]));
  return { work, manifest, bytes };
}
function port({ responses = [], tokenValues = ['tok-1'] } = {}) {
  const net = scripted(responses); const auth = tokens(tokenValues); let lost = 0;
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: auth.accessToken, fetch: net.fetch, onAccessLost: () => { lost += 1; } });
  return { port: made, net, auth, lost: () => lost };
}

// ---------- Contrato ----------

test('contrato: toManifestResponse copia sem objectKey e valida; assertManifest (interno) continua igual', () => {
  const { work } = published();
  const internal = work.snapshots.readManifest(work.owner);
  const before = clone(internal);
  const external = toManifestResponse(internal);
  assert.deepEqual(internal, before, 'não muta o interno');
  assert.equal(assertManifestResponse(external), external);
  for (const slice of SLICES) {
    assert.deepEqual(Object.keys(external.slices[slice]).sort(), ['digest', 'lastSuccessAt']);
    assert.equal(external.slices[slice].digest, internal.slices[slice].digest);
  }
  assert.notEqual(external.companyMergedInto, internal.companyMergedInto);
  assert.throws(() => assertManifest(external), TypeError, 'interno exige objectKey');
  assert.throws(() => assertManifestResponse(internal), TypeError, 'externo recusa objectKey');
  assert.throws(() => toManifestResponse(external), TypeError);
});

test('contrato: revision casa ^[A-Za-z0-9._-]{1,128}$ e companyMergedInto usa o mesmo validador', () => {
  const { manifest } = published();
  assert.equal(String(REVISION_PATTERN), '/^[A-Za-z0-9._-]{1,128}$/');
  for (const revision of ['a', 'snapshot-1', 'r.2_x-Y', 'x'.repeat(128)]) assertManifestResponse({ ...clone(manifest), revision });
  for (const revision of ['', 'x'.repeat(129), 'a/b', '../x', 'a b', 'ação', '.', '..', 1, null]) assert.throws(() => assertManifestResponse({ ...clone(manifest), revision }), TypeError, String(revision));
  for (const table of [null, [{ fromCompanyId: 'a', toCompanyId: 'a' }], [{ fromCompanyId: 'a', toCompanyId: 'b' }, { fromCompanyId: 'b', toCompanyId: 'c' }]]) {
    assert.throws(() => assertManifestResponse({ ...clone(manifest), companyMergedInto: table }), /INVALID_MERGE_TABLE/);
  }
  const extra = clone(manifest); extra.slices.models.objectKey = 'k';
  assert.throws(() => assertManifestResponse(extra), TypeError);
  assert.throws(() => assertManifestResponse({ ...clone(manifest), schemaVersion: 1 }), TypeError);
});

// ---------- Matriz ----------

test('manifesto ok: GET /api/v1/snapshot com Bearer, no-store e sem cookie; SnapshotReader aceita', async () => {
  const { manifest, bytes } = published();
  const made = port({ responses: [{ status: 200, body: JSON.stringify(manifest) }, ...SLICES.map(slice => ({ status: 200, body: bytes[slice] }))] });
  const reader = new SnapshotReader({ readManifest: made.port.readManifest, readSlice: made.port.readSlice, digest: webDigest });
  const result = await reader.refresh();
  assert.equal(result.status, 'updated');
  assert.deepEqual(result.snapshot.manifest, manifest);
  const [first, ...slices] = made.net.calls;
  assert.equal(first.url, `${API}/api/v1/snapshot`);
  assert.deepEqual(slices.map(call => call.url).sort(), SLICES.map(slice => `${API}/api/v1/snapshots/${manifest.revision}/${slice}`).sort());
  for (const { url, init } of made.net.calls) {
    assert.equal(init.method, 'GET');
    assert.deepEqual(init.headers, { Authorization: 'Bearer tok-1' });
    assert.equal(init.cache, 'no-store');
    assert.equal(init.credentials, 'omit');
    assert.doesNotMatch(url, /tok-1/);
  }
});

test('manifesto com objectKey: recusado pelo leitor (unavailable; kept-last-good com conjunto anterior)', async () => {
  const { work, manifest, bytes } = published();
  const internal = work.snapshots.readManifest(work.owner);
  const good = { status: 200, body: JSON.stringify(manifest) };
  const leaked = { status: 200, body: JSON.stringify(internal) };
  const sliceResponses = () => SLICES.map(slice => ({ status: 200, body: bytes[slice] }));
  const made = port({ responses: [leaked, good, ...sliceResponses(), leaked] });
  const reader = new SnapshotReader({ readManifest: made.port.readManifest, readSlice: made.port.readSlice, digest: webDigest });
  const first = await reader.refresh();
  assert.equal(first.status, 'unavailable'); assert.equal(first.errorCode, 'SNAPSHOT_INVALID_OR_UNAVAILABLE');
  assert.equal((await reader.refresh()).status, 'updated');
  const kept = reader.current;
  assert.equal((await reader.refresh()).status, 'kept-last-good');
  assert.equal(reader.current, kept);
});

test('slice ok: texto idêntico ao corpo, sem JSON.parse; digest confere', async () => {
  const { manifest, bytes } = published();
  const odd = ` ${bytes.catalog}\n`;
  const made = port({ responses: [{ status: 200, body: odd }] });
  const text = await made.port.readSlice(manifest.revision, 'catalog');
  assert.equal(text, odd);
  assert.notEqual(await webDigest(text), manifest.slices.catalog.digest, 'nenhum espaço foi aparado');
  const exact = port({ responses: [{ status: 200, body: bytes.models }] });
  assert.equal(await webDigest(await exact.port.readSlice(manifest.revision, 'models')), manifest.slices.models.digest);
  const source = await readFile(new URL('../src/ui/http-snapshot-port.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source.replace(/\/\/.*$/gm, ''), /JSON\.parse|JSON\.stringify/);
});

test('401 uma vez: 1 renovação forçada e 1 repetição', async () => {
  const { manifest } = published();
  const made = port({ responses: [401, { status: 200, body: JSON.stringify(manifest) }], tokenValues: ['tok-1', 'tok-2'] });
  assert.deepEqual(await made.port.readManifest(), manifest);
  assert.deepEqual(made.auth.calls, [null, { forceRefresh: true, rejected: 'tok-1' }]);
  assert.deepEqual(made.net.calls.map(call => call.init.headers.Authorization), ['Bearer tok-1', 'Bearer tok-2']);
  assert.equal(made.lost(), 0);
});

test('401 duas vezes: AccessDeniedError e onAccessLost uma única vez por porta', async () => {
  const made = port({ responses: [401, 401, 401, 401, 403], tokenValues: ['tok-1', 'tok-2'] });
  await assert.rejects(made.port.readManifest(), AccessDeniedError);
  assert.equal(made.net.calls.length, 2);
  assert.deepEqual(made.auth.calls, [null, { forceRefresh: true, rejected: 'tok-1' }]);
  await assert.rejects(made.port.readSlice('snapshot-1', 'news'), AccessDeniedError);
  await assert.rejects(made.port.readManifest(), AccessDeniedError);
  assert.equal(made.lost(), 1);
  assert.equal(made.port.accessLost, true);
});

test('401 e renovação sem token: AccessDeniedError sem segunda requisição', async () => {
  const made = port({ responses: [401], tokenValues: ['tok-1', null] });
  await assert.rejects(made.port.readManifest(), AccessDeniedError);
  assert.equal(made.net.calls.length, 1);
  assert.equal(made.lost(), 1);
});

test('sem token: nenhum fetch; AccessDeniedError', async () => {
  for (const value of [null, undefined, '']) {
    const made = port({ tokenValues: [value] });
    await assert.rejects(made.port.readManifest(), AccessDeniedError);
    await assert.rejects(made.port.readSlice('snapshot-1', 'catalog'), AccessDeniedError);
    assert.equal(made.net.calls.length, 0);
    assert.equal(made.lost(), 1);
  }
});

test('403: AccessDeniedError sem renovar', async () => {
  const made = port({ responses: [403] });
  await assert.rejects(made.port.readSlice('snapshot-1', 'catalog'), AccessDeniedError);
  assert.deepEqual(made.auth.calls, [null]);
  assert.equal(made.lost(), 1);
});

test('404/410 de slice: RevisionSupersededError; 404 do manifesto é erro genérico', async () => {
  for (const status of [404, 410]) {
    const made = port({ responses: [status] });
    await assert.rejects(made.port.readSlice('snapshot-1', 'models'), RevisionSupersededError);
    assert.equal(made.lost(), 0);
  }
  const made = port({ responses: [404] });
  await assert.rejects(made.port.readManifest(), error => error instanceof SnapshotHttpError && error.code === SNAPSHOT_HTTP_UNAVAILABLE);
});

test('5xx, rede ou resposta malformada: erro genérico SNAPSHOT_HTTP_UNAVAILABLE; leitor kept-last-good', async () => {
  const generic = error => { assert.ok(error instanceof SnapshotHttpError); assert.equal(error.message, SNAPSHOT_HTTP_UNAVAILABLE); assert.doesNotMatch(error.message, /tok-1/); return true; };
  for (const response of [503, 500, new Error('offline tok-1'), { status: 200, body: '{' }, { status: 200, body: '{}' }, 302, 204]) {
    await assert.rejects(port({ responses: [response] }).port.readManifest(), generic);
  }
  for (const response of [503, new Error('offline'), 302]) await assert.rejects(port({ responses: [response] }).port.readSlice('snapshot-1', 'news'), generic);
  // accessToken que lança também vira genérico, sem fetch.
  const failing = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => { throw new Error('tok-1'); }, fetch: async () => { throw new Error('não'); } });
  await assert.rejects(failing.readManifest(), generic);

  const { manifest, bytes } = published();
  const made = port({ responses: [{ status: 200, body: JSON.stringify(manifest) }, ...SLICES.map(slice => ({ status: 200, body: bytes[slice] })), 503, new Error('offline')] });
  const reader = new SnapshotReader({ readManifest: made.port.readManifest, readSlice: made.port.readSlice, digest: webDigest });
  assert.equal((await reader.refresh()).status, 'updated');
  const kept = reader.current;
  for (let i = 0; i < 2; i += 1) {
    const result = await reader.refresh();
    assert.equal(result.status, 'kept-last-good'); assert.equal(reader.current, kept);
  }
});

test('revisão inválida ou slice fora de SLICES: TypeError antes do fetch', async () => {
  const made = port();
  for (const revision of ['../x', 'a/b', '', '..', '.', 'x'.repeat(129), 'a?b', 'a#b', null, 1]) await assert.rejects(made.port.readSlice(revision, 'catalog'), TypeError, String(revision));
  for (const slice of ['bogus', '__proto__', '../catalog', null]) await assert.rejects(made.port.readSlice('snapshot-1', slice), TypeError, String(slice));
  assert.equal(made.net.calls.length, 0);
  assert.equal(made.auth.calls.length, 0);
});

test('porta: apiOrigin HTTPS sem caminho e portas obrigatórias', () => {
  const ok = { apiOrigin: API, accessToken: async () => 't', fetch: async () => ({}) };
  assert.doesNotThrow(() => createHttpSnapshotPort(ok));
  for (const apiOrigin of ['http://api.example.invalid', `${API}/`, `${API}/v1`, 'api.example.invalid', '', undefined]) assert.throws(() => createHttpSnapshotPort({ ...ok, apiOrigin }), TypeError, String(apiOrigin));
  assert.throws(() => createHttpSnapshotPort({ ...ok, accessToken: 't' }), TypeError);
  assert.throws(() => createHttpSnapshotPort({ ...ok, fetch: null }), TypeError);
  assert.throws(() => createHttpSnapshotPort({ ...ok, onAccessLost: 'x' }), TypeError);
  assert.throws(() => createHttpSnapshotPort(), TypeError);
});

test('onAccessLost que lança não muda o erro devolvido', async () => {
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => null, fetch: async () => { throw new Error('não'); }, onAccessLost: () => { throw new Error('listener'); } });
  await assert.rejects(made.readManifest(), AccessDeniedError);
});

// ---------- Ponta a ponta: Lambda → porta → leitor ----------

test('aceite: porta HTTP com fetch falso servindo o handler Lambda, bytes do MemorySnapshots, SnapshotReader com webDigest → updated', async () => {
  const work = workspace(); const revision = publish(work).revision;
  const bucket = fakeBucket(); mirrorPublications(work, bucket, [revision]);
  const lambda = createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: bucket.getObject });
  const net = fetchViaLambda(lambda, { apiOrigin: API });
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok-1', fetch: net.fetch });
  const reader = new SnapshotReader({ readManifest: made.readManifest, readSlice: made.readSlice, digest: webDigest });
  const result = await reader.refresh();
  assert.equal(result.status, 'updated');
  assert.equal(result.snapshot.manifest.revision, revision);
  assert.deepEqual(result.snapshot.catalog, work.data.catalog);
  assert.deepEqual(result.snapshot.models, work.data.models);
  assert.equal(net.calls.length, 1 + SLICES.length);
});

test('ponta a ponta: não dono (403 da Lambda) → access-denied no leitor e onAccessLost uma vez', async () => {
  const work = workspace(); const revision = publish(work).revision;
  const bucket = fakeBucket(); mirrorPublications(work, bucket, [revision]);
  const lambda = createSnapshotReaderHandler({ ownerSubs: 'someone-else', appClientId: CLIENT_ID, getObject: bucket.getObject });
  let lost = 0;
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok-1', fetch: fetchViaLambda(lambda, { apiOrigin: API }).fetch, onAccessLost: () => { lost += 1; } });
  const reader = new SnapshotReader({ readManifest: made.readManifest, readSlice: made.readSlice, digest: webDigest });
  assert.equal((await reader.refresh()).status, 'access-denied');
  assert.equal((await reader.refresh()).status, 'access-denied');
  assert.equal(lost, 1);
  assert.deepEqual(bucket.reads, []);
});

test('ponta a ponta: revisão superada entre manifesto e slice → REVISION_SUPERSEDED no leitor', async () => {
  const work = workspace(); const revisions = [];
  for (let i = 1; i <= 4; i += 1) revisions.push(publish(work, `run-${i}`).revision);
  const bucket = fakeBucket(); mirrorPublications(work, bucket, revisions.slice(0, 1));
  const lambda = createSnapshotReaderHandler({ ownerSubs: OWNER_SUB, appClientId: CLIENT_ID, getObject: bucket.getObject });
  const net = fetchViaLambda(lambda, { apiOrigin: API });
  // O ponteiro avança três revisões entre a leitura do manifesto e as slices.
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok-1', fetch: async (url, init) => {
    const response = await net.fetch(url, init);
    if (url.endsWith('/api/v1/snapshot')) mirrorPublications(work, bucket, revisions);
    return response;
  } });
  const reader = new SnapshotReader({ readManifest: made.readManifest, readSlice: made.readSlice, digest: webDigest });
  const result = await reader.refresh();
  assert.equal(result.status, 'unavailable');
  assert.equal(result.errorCode, 'REVISION_SUPERSEDED');
});

// ---------- Guardas ----------

test('guarda: a porta não importa adapters/node:, não usa storage nem cookie e o token só vai no header', async () => {
  const text = (await readFile(new URL('../src/ui/http-snapshot-port.mjs', import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const [, specifier] of text.matchAll(/from '([^']+)'/g)) assert.match(specifier, /^\.\.\/contracts\//);
  assert.doesNotMatch(text, /localStorage|sessionStorage|document\.cookie|console\.|globalThis|window/);
  assert.doesNotMatch(text, /credentials: 'include'|credentials: 'same-origin'/);
  assert.match(text, /Authorization: `Bearer \$\{value\}`/);
});

test('guarda: o shell continua com fixture-source; a porta HTTP não está ligada', async () => {
  for (const file of ['../src/ui/main.mjs', '../src/ui/browser-shell.mjs']) {
    const text = await readFile(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(text, /http-snapshot-port/);
  }
  assert.match(await readFile(new URL('../src/ui/main.mjs', import.meta.url), 'utf8'), /createFixtureSource/);
});

test('revisão: depois de perder o acesso, nenhuma nova requisição sai', async () => {
  const made = port({ responses: [403] });
  await assert.rejects(made.port.readManifest(), AccessDeniedError);
  await assert.rejects(made.port.readManifest(), AccessDeniedError);
  assert.equal(made.net.calls.length, 1);
  assert.equal(made.lost(), 1);
});

test('revisão: requisição travada expira e vira indisponibilidade, não espera para sempre', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fetch = (url, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(new Error('aborted'))); });
  const made = createHttpSnapshotPort({ apiOrigin: API, accessToken: async () => 'tok-1', fetch });
  const pending = made.readManifest();
  await Promise.resolve(); await Promise.resolve();
  t.mock.timers.tick(15_000);
  await assert.rejects(pending, error => error.message === 'SNAPSHOT_HTTP_UNAVAILABLE' || error.code === 'SNAPSHOT_HTTP_UNAVAILABLE');
});

test('revisão: perda de acesso numa slice prevalece sobre revisão superada em outra', async () => {
  const { manifest } = published();
  let n = 0;
  const reader = new SnapshotReader({
    readManifest: async () => manifest,
    readSlice: async () => { n += 1; if (n === 1) throw new RevisionSupersededError(); throw new AccessDeniedError(); },
    digest: webDigest
  });
  const result = await reader.refresh();
  assert.equal(result.status, 'access-denied');
});

test('revisão: o Publisher recusa revisão que a leitura externa não aceitaria', () => {
  const { work } = published();
  const internal = work.snapshots.readManifest(work.owner);
  assert.throws(() => assertManifest({ ...internal, revision: 'com espaço' }), TypeError);
  assert.throws(() => assertManifest({ ...internal, revision: '..' }), TypeError);
});
