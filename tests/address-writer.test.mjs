import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/local-fixtures.mjs';
import {clone} from '../src/contracts/primitives.mjs';
import {createExplorationStore} from '../src/application/exploration-store.mjs';
import {explorationQuery} from '../src/domain/exploration-url.mjs';
import {INTENT_TYPES} from '../src/contracts/exploration.mjs';
import {createAddressWriter, classifyIntent} from '../src/ui/address-writer.mjs';

const config = {schemaVersion:2, initialBase:'MAPA', availableBases:['MAPA','SAT']};
function fakeHistory() {
  const calls = [];
  return {
    calls,
    pushState(url) { calls.push({method:'pushState', url}); },
    replaceState(url) { calls.push({method:'replaceState', url}); }
  };
}
function makeStore(extra = {}) {
  return createExplorationStore({data:fixture, revision:'initial', now:fixture.now, config, ...extra});
}
function wired(extra = {}) {
  const store = makeStore(extra);
  const history = fakeHistory();
  const writer = createAddressWriter({history, address:explorationQuery(store.getState())});
  store.subscribe(writer);
  return {store, history, writer};
}
const action = intent => ({schemaVersion:2, ...intent});

test('teste de exaustividade: toda chave de INTENT_TYPES tem uma classificação, sem lista duplicada hard-coded', () => {
  // Nenhuma chave de INTENT_TYPES pode lançar; o próprio módulo também executa
  // essa iteração ao ser carregado (ver src/ui/address-writer.mjs), então este
  // teste é a prova externa de que a tabela do contrato e a do escritor
  // continuam sincronizadas -- sem redigitar a lista de chaves aqui.
  assert.ok(INTENT_TYPES.length > 0);
  for (const type of INTENT_TYPES) {
    assert.doesNotThrow(() => classifyIntent(type), `intent sem classificação: ${type}`);
  }
  assert.throws(() => classifyIntent('tipo-fora-do-vocabulario'), TypeError);
});

test('company: pushState com explorationQuery(novoEstado)', () => {
  const {store, history} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'}));
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'pushState', url:explorationQuery(store.getState())});
});

test('preference (Camadas): replaceState', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  writer.flush();
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'replaceState', url:explorationQuery(store.getState())});
});

test('camera: nenhuma escrita (query inalterada)', () => {
  const {store, history} = wired();
  const before = explorationQuery(store.getState());
  store.dispatch(action({type:'company', companyId:'company-1'}));
  history.calls.length = 0;
  store.dispatch(action({type:'camera', companyId:'company-1'}));
  assert.equal(history.calls.length, 0);
  assert.notEqual(before, explorationQuery(store.getState())); // sanity: estado mudou (seleção), só a query de endereço não.
});

test('endereço igual: nenhuma escrita, mesmo sendo tipo pushState', () => {
  const {store, history} = wired();
  // tab já começa 'globe'; despachar o mesmo valor não altera explorationQuery.
  store.dispatch(action({type:'tab', tab:'globe'}));
  assert.equal(history.calls.length, 0);
});

test('advanceSnapshot+navigate em sequência: 1 replace seguido de 1 push (nunca invertido)', () => {
  const {store, history} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'}));
  history.calls.length = 0;
  const data = clone(fixture);
  for (const c of data.catalog.companies) if (c.id === 'company-1') c.id = 'merged';
  for (const r of data.catalog.relations) {
    if (r.fromCompanyId === 'company-1') r.fromCompanyId = 'merged';
    if (r.toCompanyId === 'company-1') r.toCompanyId = 'merged';
  }
  for (const m of data.models) if (m.companyId === 'company-1') m.companyId = 'merged';
  for (const n of data.news) for (const key of ['relevantCompanyIds','citedCompanyIds']) n[key] = n[key].map(id => id === 'company-1' ? 'merged' : id);
  store.dispatch(action({type:'advanceSnapshot', data, revision:'two', now:fixture.now, hiddenNewsIds:[], companyRemaps:[{fromCompanyId:'company-1', toCompanyId:'merged'}]}));
  const model = data.models[0];
  store.dispatch(action({type:'navigate', target:{schemaVersion:1, type:'model', companyId:model.companyId, modelId:model.modelId, variantId:model.variants[0].variantId}}));
  assert.deepEqual(history.calls.map(c => c.method), ['replaceState', 'pushState']);
  assert.deepEqual(history.calls[1], {method:'pushState', url:explorationQuery(store.getState())});
});

test('hydrateUrl canônico: nenhuma escrita', () => {
  const store = makeStore();
  const canonical = explorationQuery(store.getState());
  const history = fakeHistory();
  const writer = createAddressWriter({history, address:canonical});
  store.subscribe(writer);
  store.dispatch(action({type:'hydrateUrl', url:canonical}));
  writer.flush();
  assert.equal(history.calls.length, 0);
});

test('hydrateUrl com alias legado: 1 replaceState com a forma canônica; nunca pushState', () => {
  const store = makeStore();
  const history = fakeHistory();
  const writer = createAddressWriter({history, address:explorationQuery(store.getState())});
  store.subscribe(writer);
  store.dispatch(action({type:'hydrateUrl', url:'?select=company-1&tab=globo'}));
  writer.flush();
  assert.equal(history.calls.length, 1);
  assert.equal(history.calls[0].method, 'replaceState');
  assert.deepEqual(history.calls[0], {method:'replaceState', url:explorationQuery(store.getState())});
  assert.equal(new URLSearchParams(history.calls[0].url).get('company'), 'company-1');
  assert.equal(new URLSearchParams(history.calls[0].url).get('tab'), 'globe');
});

test('replace sem flush entre dois: só 1 chamada à porta replaceState, com o estado da segunda', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  store.dispatch(action({type:'preference', field:'layers', value:['energy']}));
  assert.equal(history.calls.length, 0); // ainda pendente, nada escrito até flush/push.
  writer.flush();
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'replaceState', url:explorationQuery(store.getState())});
});

test('alias com forma canônica presente: company vence; resultado é company-1', () => {
  const store = makeStore();
  const history = fakeHistory();
  const writer = createAddressWriter({history, address:explorationQuery(store.getState())});
  store.subscribe(writer);
  store.dispatch(action({type:'hydrateUrl', url:'?select=company-2&company=company-1'}));
  writer.flush();
  assert.equal(new URLSearchParams(history.calls[0].url).get('company'), 'company-1');
});

test('intent sem classificação: tipo fictício fora de INTENT_TYPES falha ao ser escrito; runtime nunca o produz', () => {
  const {store} = wired();
  assert.equal(INTENT_TYPES.includes('bogus'), false);
  assert.throws(() => classifyIntent('bogus'), TypeError);
  // No runtime real, assertExplorationIntent já recusaria esse intent antes do dispatch.
  assert.throws(() => store.dispatch(action({type:'bogus'})), TypeError);
});

test('acceptance: company, depois preference, depois camera -- exatamente 1 pushState seguido de 1 replaceState, nenhuma chamada para camera', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'}));
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  store.dispatch(action({type:'camera', companyId:'company-1'}));
  writer.flush();
  assert.deepEqual(history.calls.map(c => c.method), ['pushState', 'replaceState']);
  assert.deepEqual(history.calls[1], {method:'replaceState', url:explorationQuery(store.getState())});
});

test('panel, openNews, escape não escrevem (query inalterada por esses intents)', () => {
  const {store, history} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'}));
  history.calls.length = 0;
  store.dispatch(action({type:'panel', panel:'queue'}));
  store.dispatch(action({type:'openNews', newsId:'news-1'}));
  store.dispatch(action({type:'escape'}));
  assert.equal(history.calls.length, 0);
});

test('revisão: base: replaceState (classificação de "base" não pinada antes)', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'base', base:'SAT'}));
  writer.flush();
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'replaceState', url:explorationQuery(store.getState())});
});

test('revisão: callback não escreve nem força flush de um replace pendente', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'})); // push
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']})); // pending replace
  assert.equal(history.calls.length, 1); // só o push de company
  const terminal = store.getState().terminal;
  store.dispatch(action({type:'callback', token:terminal.token, snapshotRevision:store.getState().snapshotRevision, target:'terminal'}));
  // callback não altera a query e não deve aplicar o replace pendente.
  assert.equal(history.calls.length, 1);
  writer.flush();
  assert.equal(history.calls.length, 2);
});

test('revisão: pendência que volta ao endereço atual é cancelada, não reescrita (compara sempre contra current, nunca contra pending obsoleto)', () => {
  const {store, history, writer} = wired();
  store.dispatch(action({type:'company', companyId:'company-1'})); // push -> current = url1
  const originalLayers = [...store.getState().preferences.layers];
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']})); // pending = url2 (!= current)
  store.dispatch(action({type:'preference', field:'layers', value:originalLayers})); // volta a url1 === current
  writer.flush();
  // Nenhuma escrita de replace deveria ter ocorrido: a pendência cancelada não gera chamada.
  assert.equal(history.calls.length, 1); // só o push inicial de company
  assert.equal(history.calls.every(c => c.method === 'pushState'), true);
});

test('revisão: history malformado (sem pushState/replaceState) falha no construtor, não no primeiro dispatch', () => {
  assert.throws(() => createAddressWriter({history:{}, address:'?layers=cloud&base=MAPA&tab=globe&company='}), TypeError);
  assert.throws(() => createAddressWriter({history:{pushState(){}}, address:'?layers=cloud&base=MAPA&tab=globe&company='}), TypeError);
  assert.throws(() => createAddressWriter({history:null, address:'?layers=cloud&base=MAPA&tab=globe&company='}), TypeError);
});

test('revisão: tab=constructor não causa poluição de protótipo (overrides.tab permanece string)', async () => {
  const {parseExplorationUrl} = await import('../src/domain/exploration-url.mjs');
  const result = parseExplorationUrl('?tab=constructor', {companyIds:['company-1'], config});
  assert.equal(typeof result.tab, 'string');
  assert.equal(result.tab, 'globe');
});

test('revisão: replaceState recusado (limite de taxa) não lança e é refeito na mudança seguinte', () => {
  const store = makeStore();
  let fail = true;
  const history = {
    calls: [],
    pushState(url) { this.calls.push({method:'pushState', url}); },
    replaceState(url) { if (fail) throw new Error('rate-limited'); this.calls.push({method:'replaceState', url}); }
  };
  const writer = createAddressWriter({history, address:explorationQuery(store.getState())});
  store.subscribe(writer);
  store.dispatch(action({type:'preference', field:'layers', value:['cloud']}));
  assert.doesNotThrow(() => writer.flush()); // recusado: não lança
  assert.equal(history.calls.length, 0);
  fail = false;
  store.dispatch(action({type:'preference', field:'layers', value:['energy']})); // mudança seguinte
  writer.flush();
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'replaceState', url:explorationQuery(store.getState())});
});

test('revisão: pushState recusado (limite de taxa) não lança e é refeito na mudança seguinte', () => {
  const store = makeStore();
  let fail = true;
  const history = {
    calls: [],
    pushState(url) { if (fail) throw new Error('rate-limited'); this.calls.push({method:'pushState', url}); },
    replaceState(url) { this.calls.push({method:'replaceState', url}); }
  };
  const writer = createAddressWriter({history, address:explorationQuery(store.getState())});
  store.subscribe(writer);
  assert.doesNotThrow(() => store.dispatch(action({type:'company', companyId:'company-1'})));
  assert.equal(history.calls.length, 0);
  fail = false;
  store.dispatch(action({type:'company', companyId:'company-2'})); // mudança seguinte reavalia contra o current antigo
  assert.equal(history.calls.length, 1);
  assert.deepEqual(history.calls[0], {method:'pushState', url:explorationQuery(store.getState())});
});
