import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/local-fixtures.mjs';
import {createExplorationStore} from '../src/application/exploration-store.mjs';

const config = {schemaVersion:2,initialBase:'MAPA',availableBases:['MAPA','SAT']};
function makeStore(extra = {}) {
  return createExplorationStore({data:fixture,revision:'initial',now:fixture.now,config,...extra});
}
const action = intent => ({schemaVersion:2,...intent});

test('dispatch simples: estado atualiza e retorno traz state/effects', () => {
  const store = makeStore();
  const result = store.dispatch(action({type:'tab',tab:'models'}));
  assert.equal(store.getState().sessionState.tab, 'models');
  assert.equal(result.state, store.getState());
  assert.deepEqual(result.effects, []);
});

test('múltiplos listeners: ambos chamados uma vez, na ordem de inscrição, antes do dispatch retornar', () => {
  const store = makeStore();
  const calls = [];
  store.subscribe((state, meta) => calls.push({who:'A', state, meta}));
  store.subscribe((state, meta) => calls.push({who:'B', state, meta}));
  const result = store.dispatch(action({type:'tab',tab:'models'}));
  // Prova de sincronia: os dois listeners já foram chamados quando dispatch retorna.
  assert.deepEqual(calls.map(c => c.who), ['A', 'B']);
  for (const call of calls) {
    assert.equal(call.state, result.state);
    assert.deepEqual(call.meta.intent, action({type:'tab',tab:'models'}));
    assert.deepEqual(call.meta.effects, result.effects);
  }
});

test('subscribe não emite estado inicial', () => {
  const store = makeStore();
  let called = false;
  store.subscribe(() => { called = true; });
  assert.equal(called, false);
});

test('unsubscribe durante dispatch: listener removido não é chamado neste dispatch', () => {
  const store = makeStore();
  const calls = [];
  let unsubscribeB;
  store.subscribe(() => { calls.push('A'); unsubscribeB(); });
  unsubscribeB = store.subscribe(() => { calls.push('B'); });
  store.dispatch(action({type:'tab',tab:'models'}));
  assert.deepEqual(calls, ['A']);
  // Uma segunda rodada confirma que B continua desinscrito, não só pulado uma vez.
  store.dispatch(action({type:'tab',tab:'news'}));
  assert.deepEqual(calls, ['A', 'A']);
});

test('dispatch reentrante lança e o dispatch externo ainda completa com seu próprio resultado', () => {
  const store = makeStore();
  let reentrantError = null;
  store.subscribe(() => {
    try { store.dispatch(action({type:'tab',tab:'news'})); }
    catch (error) { reentrantError = error; }
  });
  const result = store.dispatch(action({type:'tab',tab:'models'}));
  assert.ok(reentrantError, 'esperava erro reentrante capturado pelo listener');
  assert.match(reentrantError.message, /REENTRANT_DISPATCH/);
  // O dispatch externo não foi corrompido pela tentativa reentrante.
  assert.equal(store.getState().sessionState.tab, 'models');
  assert.equal(result.state.sessionState.tab, 'models');
});

test('dispatch após dispose lança STORE_DISPOSED', () => {
  const store = makeStore();
  store.dispose();
  assert.throws(() => store.dispatch(action({type:'tab',tab:'models'})), /STORE_DISPOSED/);
});

test('getState após dispose lança STORE_DISPOSED', () => {
  const store = makeStore();
  store.dispose();
  assert.throws(() => store.getState(), /STORE_DISPOSED/);
});

test('dispose() mais de uma vez não lança', () => {
  const store = makeStore();
  store.dispose();
  assert.doesNotThrow(() => store.dispose());
});

test('dispose() não notifica listeners inscritos', () => {
  const store = makeStore();
  let called = false;
  store.subscribe(() => { called = true; });
  store.dispose();
  assert.equal(called, false);
});

test('intent inválido: reducer lança, estado interno inalterado, nenhum listener chamado', () => {
  const store = makeStore();
  const before = store.getState();
  let called = false;
  store.subscribe(() => { called = true; });
  assert.throws(() => store.dispatch(action({type:'bogus'})), TypeError);
  assert.equal(store.getState(), before);
  assert.equal(called, false);
});

test('unsubscribe duas vezes não lança na segunda chamada', () => {
  const store = makeStore();
  const unsubscribe = store.subscribe(() => {});
  assert.doesNotThrow(() => { unsubscribe(); unsubscribe(); });
});

test('unsubscribe de um listener não afeta os demais inscritos', () => {
  const store = makeStore();
  const calls = [];
  const unsubscribeA = store.subscribe(() => calls.push('A'));
  store.subscribe(() => calls.push('B'));
  unsubscribeA();
  store.dispatch(action({type:'tab',tab:'models'}));
  assert.deepEqual(calls, ['B']);
});

test('revisão: effects não vazios chegam ao listener e ao retorno (intent preference)', () => {
  const store = makeStore();
  const calls = [];
  store.subscribe((state, meta) => calls.push(meta));
  const result = store.dispatch(action({type:'preference', field:'leftTab', value:'flux'}));
  assert.deepEqual(result.effects, [{type:'persistPreferences', patch:{leftTab:'flux'}}]);
  assert.deepEqual(calls[0].effects, result.effects);
});

test('revisão: effects devolvidos ao listener e ao chamador são congelados (não corrompíveis)', () => {
  const store = makeStore();
  let received;
  store.subscribe((state, meta) => { received = meta; });
  const result = store.dispatch(action({type:'preference', field:'leftTab', value:'flux'}));
  assert.throws(() => { received.effects.push('x'); }, TypeError);
  assert.throws(() => { received.intent = {}; }, TypeError);
  assert.equal(Object.isFrozen(result.effects), true);
});

test('revisão: listener que se inscreve durante um dispatch só é chamado a partir do próximo', () => {
  const store = makeStore();
  const calls = [];
  store.subscribe((state, meta) => {
    calls.push('A');
    store.subscribe((s2, m2) => calls.push('late'));
  });
  store.dispatch(action({type:'tab', tab:'models'}));
  assert.deepEqual(calls, ['A']);
  store.dispatch(action({type:'tab', tab:'news'}));
  assert.deepEqual(calls, ['A', 'A', 'late']);
});

test('revisão: listener que se reinscreve a si mesmo não causa crescimento ilimitado dentro do dispatch', () => {
  const store = makeStore();
  let selfCalls = 0;
  function selfResubscribing() {
    selfCalls += 1;
    store.subscribe(selfResubscribing);
  }
  store.subscribe(selfResubscribing);
  store.dispatch(action({type:'tab', tab:'models'}));
  assert.equal(selfCalls, 1);
});

test('revisão: um listener que lança não impede os demais de serem notificados; o primeiro erro propaga depois', () => {
  const store = makeStore();
  const calls = [];
  const unsubA = store.subscribe(() => { calls.push('A'); throw new Error('boom-A'); });
  const unsubB = store.subscribe(() => { calls.push('B'); throw new Error('boom-B'); });
  store.subscribe(() => { calls.push('C'); });
  assert.throws(() => store.dispatch(action({type:'tab', tab:'models'})), /boom-A/);
  assert.deepEqual(calls, ['A', 'B', 'C']);
  // O estado já foi comprometido antes da notificação, mesmo com erro.
  assert.equal(store.getState().sessionState.tab, 'models');
  // Sem os listeners que lançam, o dispatch seguinte funciona normalmente.
  unsubA(); unsubB();
  assert.equal(store.dispatch(action({type:'tab', tab:'news'})).state.sessionState.tab, 'news');
});

test('revisão: subscribe depois de dispose lança STORE_DISPOSED, igual a getState/dispatch', () => {
  const store = makeStore();
  store.dispose();
  assert.throws(() => store.subscribe(() => {}), /STORE_DISPOSED/);
});

test('revisão: subscribe recusa um argumento que não é função', () => {
  const store = makeStore();
  assert.throws(() => store.subscribe('not-a-function'), TypeError);
  assert.throws(() => store.subscribe(null), TypeError);
});

test('revisão: dispose chamado por um listener durante o próprio dispatch encerra a notificação (dispose limpa todos de uma vez)', () => {
  const store = makeStore();
  const calls = [];
  store.subscribe(() => { calls.push('A'); store.dispose(); });
  store.subscribe(() => calls.push('B'));
  store.dispatch(action({type:'tab', tab:'models'}));
  // dispose() limpa a lista inteira; B, que ainda não tinha sido chamado, fica
  // sem notificação — mesma regra de "removido durante o dispatch não é alcançado".
  assert.deepEqual(calls, ['A']);
  assert.throws(() => store.getState(), /STORE_DISPOSED/);
});
