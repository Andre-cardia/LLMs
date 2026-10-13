import {object, string, integer, oneOf, list, fail} from './primitives.mjs';
import {assertNavigationTarget} from './navigation.mjs';
import {assertExplorationData} from './exploration.mjs';

export const SEARCH_VERSION = 1;
export function assertSearchQuery(query) {
  if (typeof query !== 'string' || query.length > 256) fail('query');
  return query;
}
export function assertSearchContext(context) {
  object(context, ['dataRevision','feedbackRevision'], 'SearchContext');
  string(context.dataRevision, 'dataRevision');
  integer(context.feedbackRevision, 'feedbackRevision');
  return context;
}
export function assertSearchResult(result) {
  assertExplorationData(result, 'SearchResult');
  object(result, ['label','target'], 'SearchResult');
  // Preserva títulos de Notícias (4096) e rótulos compostos de Modelos/tickers.
  string(result.label, 'label', 4096);
  assertNavigationTarget(result.target);
  return result;
}
export function assertSearchResponse(response) {
  assertExplorationData(response, 'SearchResponse');
  object(response, ['schemaVersion','query','status','context','results'], 'SearchResponse');
  oneOf(response.schemaVersion, [SEARCH_VERSION], 'schemaVersion');
  assertSearchQuery(response.query);
  oneOf(response.status, ['idle','loading','results','empty','unavailable'], 'status');
  list(response.results, assertSearchResult, 'results');
  if (['results','empty'].includes(response.status)) {
    assertSearchContext(response.context);
    if ((response.status === 'results') !== (response.results.length > 0)) fail('status', 'resultados divergentes');
  } else if (response.context !== null || response.results.length) fail('results', 'dados privados fora de uma leitura válida');
  return response;
}
