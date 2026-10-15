import {createExploration, explorationReducer} from '../domain/exploration-state.mjs';

// Único wrapper síncrono do reducer de exploração (AD-18 do spine do Epic 7).
// O store possui a única instância de estado; quem despacha ignora os efeitos
// devolvidos — eles são executados pelo listener de efeitos da raiz de composição,
// fora desta spec. Nenhum DOM, localStorage, history ou fetch é tocado aqui.
export function createExplorationStore(options) {
  let state = createExploration(options);
  let disposed = false;
  let dispatching = false;
  let nextListenerId = 0;
  // Map preserva a ordem de inscrição; dispatch() tira um snapshot dela no início
  // (ver abaixo), então inscrição/remoção durante o próprio dispatch só valem
  // a partir do próximo.
  const listeners = new Map();
  function ensureAlive() {
    if (disposed) throw new Error('STORE_DISPOSED');
  }
  function getState() {
    ensureAlive();
    return state;
  }
  function dispatch(intent) {
    ensureAlive();
    if (dispatching) throw new Error('REENTRANT_DISPATCH');
    dispatching = true;
    try {
      // explorationReducer já valida e lança (ex. assertExplorationIntent);
      // essa exceção propaga sem o estado interno do store mudar.
      const result = explorationReducer(state, intent);
      state = result.state;
      // effects é saída do reducer, nunca de quem despacha: congelado para que
      // nenhum listener corrompa o que os demais e o chamador original recebem.
      Object.freeze(result.effects);
      const meta = Object.freeze({intent, effects: result.effects});
      // Snapshot da ordem de inscrição no início: um listener inscrito dentro
      // deste dispatch (ex. se resinscrevendo) não é alcançado nesta passada —
      // só a partir do próximo dispatch. Um já removido por outro listener é
      // pulado (comportamento determinístico e testado).
      const snapshot = [...listeners];
      const errors = [];
      for (const [id, listener] of snapshot) {
        if (!listeners.has(id)) continue;
        try { listener(state, meta); } catch (error) { errors.push(error); }
      }
      // Todo listener inscrito no início é chamado, mesmo que outro lance;
      // o primeiro erro é relançado só depois de notificar os demais.
      if (errors.length) throw errors[0];
      return result;
    } finally {
      dispatching = false;
    }
  }
  function subscribe(listener) {
    ensureAlive();
    if (typeof listener !== 'function') throw new TypeError('listener');
    const id = nextListenerId;
    nextListenerId += 1;
    listeners.set(id, listener);
    let unsubscribed = false;
    return function unsubscribe() {
      if (unsubscribed) return;
      unsubscribed = true;
      listeners.delete(id);
    };
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    listeners.clear();
  }
  return {getState, dispatch, subscribe, dispose};
}
