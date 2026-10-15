import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AccessDeniedError} from '../src/contracts/access.mjs';
import {envelopeBytes} from '../src/contracts/snapshot.mjs';
import {PREFERENCE_KEYS} from '../src/contracts/exploration.mjs';
import {SYNTHETIC_FIXTURE} from '../src/contracts/provenance.mjs';
import {DEFAULT_PREFERENCES} from '../src/domain/exploration-state.mjs';
import {explorationQuery} from '../src/domain/exploration-url.mjs';
import {createExplorationStore} from '../src/application/exploration-store.mjs';
import {LocalSearch} from '../src/application/local-search.mjs';
import {createBrowserShell, PREFERENCES_STORAGE_KEY} from '../src/ui/browser-shell.mjs';
import {createFixtureSource, FIXTURE_REVISION} from '../src/ui/fixture-source.mjs';
import {webDigest} from '../src/ui/web-digest.mjs';
import {SYNTHETIC_WORKSPACE} from '../src/ui/fixtures/synthetic-workspace.mjs';

const action = intent => ({schemaVersion:2, ...intent});

function fakeHistory(log = []) {
  const calls = [];
  return {calls,
    pushState(url) { calls.push({method:'pushState', url}); log.push('pushState'); },
    replaceState(url) { calls.push({method:'replaceState', url}); log.push('replaceState'); }};
}
function fakeStorage(initial = {}, log = []) {
  const data = new Map(Object.entries(initial)); const writes = [];
  return {data, writes,
    getItem: key => data.has(key) ? data.get(key) : null,
    setItem(key, value) { writes.push({key, value}); data.set(key, String(value)); log.push('setItem'); }};
}
// Fonte sintética real (webDigest) com controles de teste: revisão anunciada,
// negação de acesso e uma comporta em readFeedback para segurar uma leitura.
function controlledSource() {
  const base = createFixtureSource({digest: webDigest});
  const control = {revision: FIXTURE_REVISION, denied: false, feedbackDenied: false, gate: null, feedbackCalls: 0, companyMergedInto: [], hiddenNewsIds: [], catalogWithout: null};
  const source = {
    provenance: base.provenance,
    async readManifest() {
      if (control.denied) throw new AccessDeniedError();
      const manifest = await base.readManifest();
      if (control.catalogWithout === null) return {...manifest, revision: control.revision, companyMergedInto: control.companyMergedInto};
      const bytes = envelopeBytes('catalog', {...SYNTHETIC_WORKSPACE.catalog, companies: SYNTHETIC_WORKSPACE.catalog.companies.filter(c => c.id !== control.catalogWithout), relations: []});
      const models = envelopeBytes('models', SYNTHETIC_WORKSPACE.models.filter(m => m.companyId !== control.catalogWithout));
      const news = envelopeBytes('news', SYNTHETIC_WORKSPACE.news.map(n => ({...n, relevantCompanyIds: n.relevantCompanyIds.filter(id => id !== control.catalogWithout), citedCompanyIds: n.citedCompanyIds.filter(id => id !== control.catalogWithout)})).filter(n => n.relevantCompanyIds.length));
      control.bytes = {catalog: bytes, models, news};
      const slices = {};
      for (const slice of ['catalog', 'models', 'news']) { const hex = await webDigest(control.bytes[slice]); slices[slice] = {objectKey: hex, digest: hex, lastSuccessAt: manifest.publishedAt}; }
      return {...manifest, revision: control.revision, slices, companyMergedInto: control.companyMergedInto};
    },
    async readSlice(_revision, slice) {
      if (control.denied) throw new AccessDeniedError();
      if (control.bytes) return control.bytes[slice];
      return base.readSlice(FIXTURE_REVISION, slice);
    },
    async readFeedback() {
      control.feedbackCalls += 1;
      const gate = control.gate; control.gate = null;
      if (gate) await gate.promise;
      if (control.feedbackDenied) throw new AccessDeniedError();
      return {...await base.readFeedback(), hiddenNewsIds: control.hiddenNewsIds};
    },
    resolveAlias: base.resolveAlias
  };
  return {source, control};
}
function deferred() {
  let resolve; const promise = new Promise(r => { resolve = r; });
  return {promise, resolve};
}
function makeShell({search = '', storage = fakeStorage(), source = createFixtureSource({digest: webDigest}), log = [], internals = {}} = {}) {
  const history = fakeHistory(log);
  const location = {search};
  const shell = createBrowserShell({history, location, storage, clock: () => SYNTHETIC_WORKSPACE.now, digest: webDigest, source}, internals);
  return {shell, history, location, storage, log};
}
// Costura de teste: registra inscrição, chamadas de listener, unsubscribe e dispose.
function spiedInternals(log) {
  const stores = [], searches = [], listeners = [];
  return {stores, searches, listeners,
    createStore(options) {
      const store = createExplorationStore(options);
      stores.push(store);
      return {...store,
        subscribe(listener) {
          const name = typeof listener.flush === 'function' ? 'writer' : 'effects';
          listeners.push({name, listener});
          const unsubscribe = store.subscribe((state, meta) => { log.push(`listener:${name}`); listener(state, meta); });
          return () => { log.push(`unsubscribe:${name}`); unsubscribe(); };
        },
        dispose() { log.push('store.dispose'); store.dispose(); }};
    },
    createSearch(options) {
      const search = new LocalSearch(options);
      searches.push(search);
      const cancel = search.cancel.bind(search);
      search.cancel = () => { log.push('search.cancel'); return cancel(); };
      return search;
    }};
}
async function started(options) {
  const made = makeShell(options);
  const result = await made.shell.start();
  assert.equal(result.status, 'updated');
  return made;
}
const companyResult = response => response.results.find(result => result.target.type === 'company');

test('carga canônica: store criado e nenhuma escrita no history', async () => {
  const probe = await started();
  const canonical = explorationQuery(probe.shell.getState());
  probe.shell.dispose();
  const {shell, history} = await started({search: canonical});
  shell.flushAddress();
  assert.equal(shell.status, 'updated');
  assert.equal(explorationQuery(shell.getState()), canonical);
  assert.deepEqual(history.calls, []);
});

test('carga com alias: 1 replaceState com a forma canônica após flush', async () => {
  const {shell, history} = await started({search: '?select=company-1&tab=globo'});
  assert.deepEqual(history.calls, [], 'replace agrupado até o flush');
  shell.flushAddress();
  const state = shell.getState();
  assert.equal(state.effectiveState.companyId, 'company-1');
  assert.equal(state.effectiveState.tab, 'globe');
  assert.deepEqual(history.calls, [{method:'replaceState', url: explorationQuery(state)}]);
  assert.ok(!history.calls[0].url.includes('select='));
});

test('preferência: storage[llms.preferences] atualizado e nada mais gravado', async () => {
  const {shell, storage} = await started({search: '?select=company-1'});
  assert.deepEqual(storage.writes, [], 'hydrateUrl não persiste');
  shell.dispatch(action({type:'company', companyId:'company-2'}));
  assert.deepEqual(storage.writes, []);
  shell.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  assert.equal(storage.writes.length, 1);
  assert.equal(storage.writes[0].key, PREFERENCES_STORAGE_KEY);
  const saved = JSON.parse(storage.data.get(PREFERENCES_STORAGE_KEY));
  assert.deepEqual(Object.keys(saved).sort(), [...PREFERENCE_KEYS].sort());
  assert.deepEqual(saved.layers, ['cloud']);
  assert.deepEqual([...storage.data.keys()], [PREFERENCES_STORAGE_KEY]);
});

test('preferências persistidas: próxima instância inicia com elas', async () => {
  const storage = fakeStorage({[PREFERENCES_STORAGE_KEY]: JSON.stringify({...DEFAULT_PREFERENCES, mode: 'dark'})});
  const {shell} = await started({storage});
  assert.equal(shell.getState().preferences.mode, 'dark');
});

test('storage corrompido ou com formato errado: inicia com DEFAULT_PREFERENCES sem lançar', async () => {
  for (const raw of ['{', JSON.stringify({theme: 'inexistente'}), JSON.stringify([1]), 'null']) {
    const {shell} = await started({storage: fakeStorage({[PREFERENCES_STORAGE_KEY]: raw})});
    assert.deepEqual(shell.getState().preferences, DEFAULT_PREFERENCES, raw);
    shell.dispose();
  }
  const throwing = {getItem() { throw new Error('SecurityError'); }, setItem() { throw new Error('SecurityError'); }};
  const {shell} = await started({storage: throwing});
  assert.deepEqual(shell.getState().preferences, DEFAULT_PREFERENCES);
});

test('camera: efeito vai para cameraRequests; endereço não muda', async () => {
  const {shell, history, storage} = await started();
  shell.flushAddress();
  const before = explorationQuery(shell.getState()); const calls = history.calls.length;
  assert.deepEqual(shell.cameraRequests, []);
  shell.dispatch(action({type:'camera', companyId:'company-1'}));
  shell.flushAddress();
  const state = shell.getState();
  assert.deepEqual(shell.cameraRequests, [{type:'camera', companyId:'company-1', token: state.intentToken, snapshotRevision: FIXTURE_REVISION}]);
  assert.equal(explorationQuery(state), before);
  assert.equal(history.calls.length, calls);
  assert.deepEqual(storage.writes, []);
});

test('efeito desconhecido lança', async () => {
  const log = [], internals = spiedInternals(log);
  const {shell} = await started({internals});
  const effects = internals.listeners.find(entry => entry.name === 'effects').listener;
  assert.throws(() => effects(shell.getState(), {intent: action({type:'escape'}), effects: [{type:'bogus'}]}), TypeError);
});

test('popstate: estado reflete o endereço e zero pushState novos', async () => {
  const {shell, history, location} = await started();
  const before = explorationQuery(shell.getState());
  shell.dispatch(action({type:'company', companyId:'company-1'}));
  assert.equal(history.calls.filter(call => call.method === 'pushState').length, 1);
  // Back do navegador: o endereço volta ao anterior e a raiz reidrata.
  location.search = before;
  const state = shell.onPopState();
  shell.flushAddress();
  assert.equal(state.effectiveState.companyId, null);
  assert.equal(explorationQuery(shell.getState()), before);
  assert.equal(history.calls.filter(call => call.method === 'pushState').length, 1, 'nenhum pushState novo');
  // Qualquer replace eventual reproduz exatamente o endereço atual do navegador.
  for (const call of history.calls.filter(call => call.method === 'replaceState')) assert.equal(call.url, before);
});

test('busca → seleção: 1 replace (advance) + 1 push (navigate), nesta ordem', async () => {
  // Carga com alias sem flush deixa uma substituição pendente; o advance a
  // mantém e o navigate a aplica antes do push.
  const {shell, history} = await started({search: '?select=company-2'});
  assert.deepEqual(history.calls, []);
  const response = await shell.search('fictício');
  assert.equal(response.status, 'results');
  const target = companyResult(response);
  const selected = await shell.select(target);
  assert.equal(selected.status, 'available');
  assert.deepEqual(history.calls.map(call => call.method), ['replaceState', 'pushState']);
  assert.equal(history.calls[1].url, explorationQuery(shell.getState()));
  assert.equal(shell.getState().effectiveState.companyId, target.target.companyId);
});

test('escritor de endereço é chamado antes do listener de efeitos em todo intent', async () => {
  const log = [], internals = spiedInternals(log);
  const {shell} = await started({internals, log, storage: fakeStorage({}, log)});
  assert.deepEqual(internals.listeners.map(entry => entry.name), ['writer', 'effects']);
  const intents = [action({type:'company', companyId:'company-1'}), action({type:'camera', companyId:'company-1'}),
    action({type:'preference', field:'layers', value:['labs']}), action({type:'panel', panel:'queue'}), action({type:'escape'}),
    action({type:'base', base:'SAT'}), action({type:'tab', tab:'models'})];
  for (const intent of intents) {
    log.length = 0;
    shell.dispatch(intent);
    const order = log.filter(entry => entry.startsWith('listener:'));
    assert.deepEqual(order, ['listener:writer', 'listener:effects'], intent.type);
  }
  // Com efeito real: o storage só é gravado depois que o escritor já rodou.
  log.length = 0;
  shell.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  assert.deepEqual(log, ['listener:writer', 'listener:effects', 'setItem']);
});

test('snapshot vencido: reader trocou de revisão entre ler e despachar → advanceSnapshot não despachado', async () => {
  const {source, control} = controlledSource();
  const {shell} = await started({source});
  assert.equal(shell.getState().snapshotRevision, FIXTURE_REVISION);
  control.revision = 'fixture-2';
  const gate = deferred(); control.gate = gate;
  const calls = control.feedbackCalls;
  const first = shell.refreshSnapshot();
  for (let i = 0; i < 1000 && control.feedbackCalls === calls; i += 1) await new Promise(resolve => setImmediate(resolve));
  // Enquanto o primeiro espera o feedback, o reader avança para fixture-3.
  control.revision = 'fixture-3';
  assert.deepEqual(await shell.refreshSnapshot(), {status:'advanced', revision:'fixture-3'});
  const tokenAfter = shell.getState().intentToken;
  gate.resolve();
  assert.deepEqual(await first, {status:'stale'});
  assert.equal(shell.getState().snapshotRevision, 'fixture-3');
  assert.equal(shell.getState().intentToken, tokenAfter, 'nenhum dispatch do frame vencido');
});

test('refreshSnapshot: mesma revisão do store não despacha', async () => {
  const {shell} = await started();
  const token = shell.getState().intentToken;
  assert.deepEqual(await shell.refreshSnapshot(), {status:'unchanged'});
  assert.equal(shell.getState().intentToken, token);
});

test('perda de permissão durante Busca pendente: superseded, nada publicado, dispose na ordem do AD-23', async () => {
  const log = [], internals = spiedInternals(log);
  const {source, control} = controlledSource();
  const {shell, history, storage} = await started({source, internals, log});
  const search = internals.searches[0];
  const gate = deferred(); control.gate = gate;
  const calls = control.feedbackCalls;
  const pending = shell.search('fictício');
  for (let i = 0; i < 1000 && control.feedbackCalls === calls; i += 1) await new Promise(resolve => setImmediate(resolve));
  assert.equal(search.current.status, 'loading');
  control.denied = true;
  log.length = 0;
  assert.deepEqual(await shell.refreshSnapshot(), {status:'access-denied'});
  // O motivo do descarte fica visível para a página distinguir revogação de encerramento.
  assert.equal(shell.status, 'access-denied');
  assert.deepEqual(log, ['search.cancel', 'unsubscribe:writer', 'unsubscribe:effects', 'store.dispose']);
  const published = search.current;
  assert.equal(published.status, 'idle');
  const historyCalls = history.calls.length, writes = storage.writes.length;
  gate.resolve();
  assert.deepEqual(await pending, {status:'superseded'});
  assert.equal(search.current, published, 'nenhuma resposta de Busca publicada depois');
  assert.deepEqual(search.current.results, []);
  assert.equal(history.calls.length, historyCalls);
  assert.equal(storage.writes.length, writes);
  assert.throws(() => internals.stores[0].getState(), {message:'STORE_DISPOSED'});
});

test('ordem do descarte: cancel → unsubscribes → store.dispose; idempotente', async () => {
  const log = [], internals = spiedInternals(log);
  const {shell} = await started({internals, log});
  log.length = 0;
  shell.dispose();
  assert.deepEqual(log, ['search.cancel', 'unsubscribe:writer', 'unsubscribe:effects', 'store.dispose']);
  shell.dispose();
  assert.equal(log.length, 4, 'segundo dispose não faz nada');
});

test('após dispose: search, getState e refreshSnapshot lançam SHELL_DISPOSED', async () => {
  const {shell} = await started();
  shell.dispose();
  assert.throws(() => shell.search('fictício'), {message:'SHELL_DISPOSED'});
  assert.throws(() => shell.getState(), {message:'SHELL_DISPOSED'});
  assert.throws(() => shell.refreshSnapshot(), {message:'SHELL_DISPOSED'});
  assert.throws(() => shell.select({label:'x', target:{schemaVersion:1, type:'company', companyId:'company-1'}}), {message:'SHELL_DISPOSED'});
  assert.throws(() => shell.onPopState(), {message:'SHELL_DISPOSED'});
  assert.equal(shell.status, 'disposed');
});

test('isolamento: duas instâncias de shell não compartilham estado', async () => {
  const a = await started(); const b = await started();
  a.shell.dispatch(action({type:'company', companyId:'company-1'}));
  a.shell.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  a.shell.dispatch(action({type:'camera', companyId:'company-1'}));
  assert.equal(b.shell.getState().effectiveState.companyId, null);
  assert.deepEqual(b.shell.getState().preferences, DEFAULT_PREFERENCES);
  assert.deepEqual(b.shell.cameraRequests, []);
  assert.deepEqual(b.history.calls, []);
  assert.deepEqual(b.storage.writes, []);
  a.shell.dispose();
  assert.equal(b.shell.getState().effectiveState.companyId, null);
  assert.equal((await b.shell.search('fictício')).status, 'results');
});

test('start sem snapshot: status unavailable/access-denied e nenhum store', async () => {
  const failing = {...createFixtureSource({digest: webDigest}), readManifest: async () => { throw new Error('down'); }};
  const down = makeShell({source: failing});
  assert.deepEqual(await down.shell.start(), {status:'unavailable'});
  assert.equal(down.shell.status, 'unavailable');
  assert.throws(() => down.shell.getState(), {message:'SHELL_UNAVAILABLE'});
  const denied = {...createFixtureSource({digest: webDigest}), readManifest: async () => { throw new AccessDeniedError(); }};
  const log = [], internals = spiedInternals(log);
  const forbidden = makeShell({source: denied, internals});
  assert.deepEqual(await forbidden.shell.start(), {status:'access-denied'});
  assert.equal(forbidden.shell.status, 'access-denied');
  assert.equal(internals.stores.length, 0);
  assert.deepEqual(forbidden.history.calls, []);
});

test('procedência: o shell expõe o marcador da fonte', async () => {
  const {shell} = await started();
  assert.equal(shell.provenance, SYNTHETIC_FIXTURE);
});

test('guarda: browser-shell não toca window/document/localStorage nem importa adapters ou node:', async () => {
  const text = (await readFile(new URL('../src/ui/browser-shell.mjs', import.meta.url), 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
  assert.doesNotMatch(text, /\bwindow\b|\bdocument\b|localStorage|sessionStorage|\bfetch\b|globalThis/);
  assert.doesNotMatch(text, /from\s+['"](node:|[^.'"][^'"]*|.*\/adapters\/)/);
});

test('revisão: carga com endereço vazio é canonizada, e Voltar a ela limpa a seleção', async () => {
  const {shell, history, location} = makeShell({search: ''});
  await shell.start(); shell.flushAddress();
  assert.equal(history.calls.length, 1);
  assert.equal(history.calls[0].method, 'replaceState');
  const initial = history.calls[0].url;
  assert.match(initial, /company=$/);
  shell.dispatch(action({type: 'company', companyId: 'company-1'}));
  assert.equal(shell.getState().effectiveState.companyId, 'company-1');
  location.search = initial; // Voltar
  const back = shell.onPopState(); shell.flushAddress();
  assert.equal(back.effectiveState.companyId, null);
  assert.equal(history.calls.filter(c => c.method === 'pushState').length, 1);
});

test('revisão: negação de acesso vinda do feedback durante refresh descarta o shell', async () => {
  const {source, control} = controlledSource();
  const {shell} = makeShell({source});
  await shell.start();
  control.feedbackDenied = true;
  assert.deepEqual(await shell.refreshSnapshot(), {status: 'access-denied'});
  assert.equal(shell.status, 'access-denied');
  assert.throws(() => shell.getState(), {message: 'SHELL_DISPOSED'});
});

test('revisão: negação de acesso vinda do feedback na carga vira access-denied, não unavailable', async () => {
  const {source, control} = controlledSource();
  control.feedbackDenied = true;
  const {shell} = makeShell({source});
  assert.deepEqual(await shell.start(), {status: 'access-denied'});
});

test('revisão: a página é avisada do fim da sessão por onStatusChange', async () => {
  const {source, control} = controlledSource();
  const {shell} = makeShell({source});
  await shell.start();
  const seen = [];
  shell.onStatusChange(value => seen.push(value));
  control.denied = true;
  await shell.refreshSnapshot();
  assert.deepEqual(seen, ['access-denied']);
});

test('revisão: advance repassa a tabela de merges e as notícias ocultas', async () => {
  const {source, control} = controlledSource();
  const {shell} = makeShell({source});
  await shell.start();
  shell.dispatch(action({type: 'company', companyId: 'company-1'}));
  control.revision = 'fixture-merged';
  control.catalogWithout = 'company-1';
  control.companyMergedInto = [{fromCompanyId: 'company-1', toCompanyId: 'company-2'}];
  control.hiddenNewsIds = ['news-3'];
  assert.deepEqual(await shell.refreshSnapshot(), {status: 'advanced', revision: 'fixture-merged'});
  const state = shell.getState();
  assert.equal(state.effectiveState.companyId, 'company-2');
  assert.equal(state.warning, null);
  assert.equal(state.index.newsTargets.some(n => n.newsId === 'news-3'), false);
});

test('revisão: storage que recusa escrita não derruba um dispatch de preferência', async () => {
  const storage = {getItem() { return null; }, setItem() { throw new Error('QuotaExceededError'); }};
  const {shell} = makeShell({storage});
  await shell.start();
  const state = shell.dispatch(action({type: 'preference', field: 'layers', value: ['cloud']}));
  assert.deepEqual(state.preferences.layers, ['cloud']);
});

test('revisão: start duplo lança SHELL_ALREADY_STARTED; antes de start, SHELL_NOT_STARTED', async () => {
  const {shell} = makeShell();
  assert.throws(() => shell.getState(), {message: 'SHELL_NOT_STARTED'});
  const pending = shell.start();
  await assert.rejects(shell.start(), {message: 'SHELL_ALREADY_STARTED'});
  await pending;
  await assert.rejects(shell.start(), {message: 'SHELL_ALREADY_STARTED'});
});

test('revisão: start que falhou pode ser repetido', async () => {
  const {source, control} = controlledSource();
  control.denied = true;
  const {shell} = makeShell({source});
  assert.deepEqual(await shell.start(), {status: 'access-denied'});
  control.denied = false;
  assert.deepEqual(await shell.start(), {status: 'updated'});
});

test('revisão: dispose durante start não cria store', async () => {
  const {source, control} = controlledSource();
  const gate = deferred();
  control.gate = gate;
  const log = [];
  const internals = spiedInternals(log);
  const {shell} = makeShell({source, internals});
  const pending = shell.start();
  for (let i = 0; i < 1000 && control.feedbackCalls === 0; i += 1) await new Promise(resolve => setImmediate(resolve));
  assert.equal(control.feedbackCalls, 1);
  shell.dispose();
  gate.resolve();
  assert.deepEqual(await pending, {status: 'disposed'});
  assert.equal(internals.stores.length, 0);
});

test('revisão: a página não despacha intents exclusivos da raiz', async () => {
  const {shell, location} = makeShell();
  await shell.start();
  assert.throws(() => shell.dispatch(action({type: 'hydrateUrl', url: location.search})), {message: 'ROOT_ONLY_INTENT'});
});

test('revisão: popstate para URL fora do contrato mantém o estado sem lançar', async () => {
  const {shell, location} = makeShell();
  await shell.start();
  const before = shell.getState();
  location.search = `?${'a'.repeat(5000)}`;
  assert.equal(shell.onPopState(), before);
});

test('revisão: fila de câmera é limitada e drenável', async () => {
  const {shell} = makeShell();
  await shell.start();
  for (let i = 0; i < 40; i += 1) shell.dispatch(action({type: 'camera', companyId: 'company-1'}));
  assert.equal(shell.cameraRequests.length, 32);
  assert.equal(shell.takeCameraRequests().length, 32);
  assert.equal(shell.cameraRequests.length, 0);
});

test('revisão: fonte sem marcador de procedência é recusada', () => {
  const base = createFixtureSource({digest: webDigest});
  const {provenance, ...rest} = base;
  assert.throws(() => createBrowserShell({history: fakeHistory(), location: {search: ''}, storage: fakeStorage(), clock: () => SYNTHETIC_WORKSPACE.now, digest: webDigest, source: rest}), TypeError);
});
