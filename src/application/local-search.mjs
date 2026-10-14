import {clone, freeze, requireSynchronous, integer} from '../contracts/primitives.mjs';
import {assertSearchQuery, assertSearchResult, assertSearchResponse, SEARCH_VERSION} from '../contracts/search.mjs';
import {globalSearch} from '../domain/global-search.mjs';

// O store injetado fornece getState()/dispatch(intent) síncronos e usa o reducer v2.
// Somente o estado transitório da consulta vive aqui; seleção e painéis pertencem ao store.
export class LocalSearch {
  #view; #store; #generation = null;
  #current = freeze({schemaVersion:SEARCH_VERSION,query:'',status:'idle',context:null,results:[]});
  constructor({view, store}) { this.#view = view; this.#store = store; }
  get current() { return this.#current; }
  #publish(query, status, context = null, results = []) {
    this.#current = freeze(assertSearchResponse({schemaVersion:SEARCH_VERSION,query,status,context,results}));
    return this.#current;
  }
  #intentToken() {
    const state = requireSynchronous(this.#store.getState());
    return integer(state?.intentToken, 'store.intentToken');
  }
  #begin() {
    const intentToken = this.#intentToken();
    const generation = Symbol('busca'); this.#generation = generation;
    return {generation,intentToken};
  }
  #active(operation) {
    return operation.generation === this.#generation && operation.intentToken === this.#intentToken();
  }
  #superseded(operation) {
    // Uma intenção externa encerra loading, mas nunca apaga uma consulta mais nova.
    if (operation.generation === this.#generation) this.cancel();
    return {status:'superseded'};
  }
  cancel() {
    this.#generation = null;
    return this.#publish(this.#current.query, 'idle');
  }
  async search(query) {
    assertSearchQuery(query);
    const operation = this.#begin();
    this.#publish(query, 'loading');
    try {
      const frame = await this.#view.frame();
      if (!this.#active(operation)) return this.#superseded(operation);
      const results = globalSearch(frame.data, query, frame);
      const context = {dataRevision:frame.dataRevision,feedbackRevision:frame.feedbackRevision};
      return this.#publish(query, results.length ? 'results' : 'empty', context, results);
    } catch {
      if (!this.#active(operation)) return this.#superseded(operation);
      // Não expor erro/resultado/cache privado após negação ou leitura inválida.
      return this.#publish(query, 'unavailable');
    }
  }
  async select(result) {
    assertSearchResult(result);
    const target = clone(result.target), operation = this.#begin(), query = this.#current.query;
    this.#publish(query, 'loading');
    try {
      const frame = await this.#view.frame(target);
      if (!this.#active(operation)) return this.#superseded(operation);
      // O índice do reducer recebe exatamente a mesma revisão e supressão da revalidação;
      // a tabela de merges segue inteira, o reducer decide o que se aplica.
      requireSynchronous(this.#store.dispatch({schemaVersion:2,type:'advanceSnapshot',data:frame.data,
        revision:frame.dataRevision,now:frame.now,hiddenNewsIds:frame.hiddenNewsIds,companyRemaps:frame.companyMergedInto}));
      operation.intentToken += 1;
      // Uma subscription síncrona pode ter emitido nova intenção durante o dispatch.
      if (!this.#active(operation)) return this.#superseded(operation);
      if (frame.navigation.status !== 'available') {
        this.#publish(query, 'unavailable');
        return {status:'unavailable'};
      }
      requireSynchronous(this.#store.dispatch({schemaVersion:2,type:'navigate',target:frame.navigation.target}));
      operation.intentToken += 1;
      if (!this.#active(operation)) return this.#superseded(operation);
      const context = {dataRevision:frame.dataRevision,feedbackRevision:frame.feedbackRevision};
      const results = globalSearch(frame.data, query, frame);
      this.#publish(query, results.length ? 'results' : 'empty', context, results);
      return freeze({status:'available',target:clone(frame.navigation.target),context});
    } catch {
      if (!this.#active(operation)) return this.#superseded(operation);
      this.#publish(query, 'unavailable');
      return {status:'unavailable'};
    }
  }
}
