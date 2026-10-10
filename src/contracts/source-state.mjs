import { object, string, boolean, oneOf, integer, nullable, utc } from './primitives.mjs';
export function assertSourceState(value) {
  object(value, ['schemaVersion', 'sourceId', 'kind', 'enabled', 'credentialsValid', 'hasValidData', 'lastSuccessAt', 'lastFailureAt', 'consecutiveFailures', 'cadenceMs', 'observedAt', 'observedAtRequired', 'documentedDelayMs', 'market'], 'SourceState');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); string(value.sourceId, 'sourceId'); oneOf(value.kind, ['models', 'news', 'quotes'], 'kind');
  for (const key of ['enabled', 'credentialsValid', 'hasValidData', 'observedAtRequired']) boolean(value[key], key);
  for (const key of ['lastSuccessAt', 'lastFailureAt', 'observedAt']) nullable(value[key], utc, key);
  integer(value.consecutiveFailures, 'consecutiveFailures'); integer(value.cadenceMs, 'cadenceMs', 1);
  nullable(value.documentedDelayMs, integer, 'documentedDelayMs');
  if (value.kind === 'models') oneOf(value.cadenceMs, [3600000], 'models.cadenceMs');
  if (value.kind === 'news') oneOf(value.cadenceMs, [3600000, 21600000], 'news.cadenceMs');
  if (value.kind === 'quotes') {
    oneOf(value.cadenceMs, [900000], 'quotes.cadenceMs'); oneOf(value.observedAtRequired, [true], 'quotes.observedAtRequired');
    object(value.market, ['calendarVerified', 'open', 'expectedCloseAt', 'currentCloseAt', 'postCloseCollected', 'nextDueAt'], 'market');
    for (const key of ['calendarVerified', 'postCloseCollected']) boolean(value.market[key], key);
    nullable(value.market.open, boolean, 'market.open');
    for (const key of ['expectedCloseAt', 'currentCloseAt', 'nextDueAt']) nullable(value.market[key], utc, `market.${key}`);
  } else oneOf(value.market, [null], 'market');
  return value;
}
export function assertSourceStatus(value) {
  object(value, ['schemaVersion', 'sourceId', 'enabled', 'hasValidData', 'status', 'reason', 'lastSuccessAt', 'sourceAgeSeconds'], 'SourceStatus');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); string(value.sourceId, 'sourceId'); string(value.reason, 'reason');
  for (const key of ['enabled', 'hasValidData']) boolean(value[key], key);
  oneOf(value.status, ['LIVE', 'ATRASADO', 'OFFLINE'], 'status'); nullable(value.lastSuccessAt, utc, 'lastSuccessAt');
  nullable(value.sourceAgeSeconds, integer, 'sourceAgeSeconds'); return value;
}
