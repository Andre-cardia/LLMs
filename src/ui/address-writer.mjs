import {INTENT_TYPES} from '../contracts/exploration.mjs';
import {explorationQuery} from '../domain/exploration-url.mjs';

// Único escritor do endereço (AD-19). `history` é a porta injetada no
// construtor -- {pushState(url), replaceState(url)} -- sem assumir Web API
// real; os testes passam um fake. O endereço "atual" também é só
// injetado/rastreado por esta mesma porta (o valor inicial recebido no
// construtor, mais o que o próprio escritor já escreveu) -- nunca
// `location.search`.
const PUSH = Object.freeze(['company', 'tab', 'navigate']);
// `hydrateUrl` entra na mesma categoria de escrita de `base|preference|advanceSnapshot`:
// a comparação geral abaixo (`url === endereço atual/pendente`) já implementa a
// regra do AD-19 para `hydrateUrl` -- "replaceState somente se o endereço
// hidratado não for canônico" --, porque `url` nasce de
// `explorationQuery(novoEstado)` e, quando a URL hidratada já é canônica, o
// estado resultante reproduz exatamente o endereço atual; só um alias legado
// produz uma query diferente, disparando a substituição.
const REPLACE = Object.freeze(['base', 'preference', 'advanceSnapshot', 'hydrateUrl']);
// Nenhum destes altera `explorationQuery` -- a comparação geral já concluiria
// "sem escrita" por si só. A entrada aqui existe para que o teste de
// exaustividade prove que a tabela cobre todas as chaves de INTENT_TYPES.
const NONE = Object.freeze(['panel', 'openNews', 'escape', 'camera', 'callback']);

export function classifyIntent(type) {
  if (PUSH.includes(type)) return 'push';
  if (REPLACE.includes(type)) return 'replace';
  if (NONE.includes(type)) return 'none';
  // Teste de exaustividade: qualquer chave de INTENT_TYPES sem entrada nas três
  // listas acima cai aqui -- prova que a tabela está incompleta.
  throw new TypeError(`address-writer: intent sem classificação -- ${type}`);
}

// `createAddressWriter({history, address})` devolve a função-listener que a
// raiz de composição inscreve no store, como primeiro listener, antes do de
// efeitos (fora desta spec). A própria função expõe `flush()`.
export function createAddressWriter({history, address}) {
  if (typeof address !== 'string') throw new TypeError('address');
  if (typeof history?.pushState !== 'function' || typeof history?.replaceState !== 'function') throw new TypeError('history');
  let current = address;
  // Substituição pendente: replaces entre dispatches sem flush() sobrescrevem
  // o endereço pendente em vez de empilhar chamadas à porta -- só a mais
  // recente conta. `flush()` ou um `pushState` subsequente a aplica antes de
  // prosseguir.
  let pending = null;
  function apply() {
    if (pending === null) return;
    const url = pending;
    // AD-19: escrita recusada pelo navegador (limite de taxa) não lança erro à
    // interface; `pending` continua com `url`, então a mudança seguinte refaz
    // a tentativa (a comparação contra `current`, que não avançou, continua
    // vendo diferença).
    try { history.replaceState(url); } catch { return; }
    pending = null;
    current = url;
  }
  function listener(state, meta) {
    const kind = classifyIntent(meta.intent.type);
    if (kind === 'none') return;
    const url = explorationQuery(state);
    if (kind === 'push') {
      // AD-19: uma substituição pendente é sempre aplicada antes de qualquer pushState.
      apply();
      if (url === current) return;
      // Push recusado (limite de taxa) também não lança e será refeito na próxima mudança.
      try { history.pushState(url); } catch { return; }
      current = url;
      return;
    }
    // replace (inclui hydrateUrl): a comparação é sempre contra o endereço
    // ATUAL já escrito, nunca contra uma pendência anterior -- uma pendência
    // que acabou voltando ao valor de current é cancelada (não reescrita).
    if (url === current) { pending = null; return; }
    pending = url;
  }
  listener.flush = apply;
  return listener;
}
