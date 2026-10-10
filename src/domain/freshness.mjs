import { assertSourceState, assertSourceStatus } from '../contracts/source-state.mjs';
import { utc, list, boolean } from '../contracts/primitives.mjs';
const CLOCK_SKEW_MS = 300000;
export function sourceStatus(source, now) {
  assertSourceState(source); const time = utc(now);
  const success = source.lastSuccessAt === null ? null : utc(source.lastSuccessAt);
  const failure = source.lastFailureAt === null ? null : utc(source.lastFailureAt);
  const observed = source.observedAt === null ? null : utc(source.observedAt);
  function result(status, reason) {
    const value = { schemaVersion: 1, sourceId: source.sourceId, enabled: source.enabled,
      hasValidData: source.hasValidData, status, reason, lastSuccessAt: source.lastSuccessAt,
      sourceAgeSeconds: observed === null ? null : Math.max(0, Math.floor((time - observed) / 1000)) };
    return assertSourceStatus(value);
  }
  if (!source.enabled) return result('OFFLINE', 'disabled');
  if (!source.credentialsValid) return result('OFFLINE', 'credentials-invalid');
  if (!source.hasValidData || success === null) return result('OFFLINE', 'no-valid-data');
  if (source.consecutiveFailures >= 3 && time - success > source.cadenceMs * 2) return result('OFFLINE', 'repeated-failure');
  if ([success, failure, observed].some(value => value !== null && value > time + CLOCK_SKEW_MS)) return result('ATRASADO', 'future-timestamp');
  if (source.observedAtRequired && observed === null) return result('ATRASADO', 'source-time-required');
  if (source.kind === 'quotes' && (!source.market.calendarVerified || source.market.open === null)) return result('ATRASADO', 'calendar-unverified');
  if (failure !== null && (failure > success || (failure === success && source.consecutiveFailures > 0))) return result('ATRASADO', 'last-attempt-failed');
  if (source.kind === 'quotes' && !source.market.open) {
    const market = source.market;
    if (!market.expectedCloseAt || !market.currentCloseAt || !market.nextDueAt ||
        utc(market.expectedCloseAt) !== utc(market.currentCloseAt) || !market.postCloseCollected ||
        success < utc(market.expectedCloseAt) || observed < utc(market.expectedCloseAt) - (source.documentedDelayMs ?? 0) || utc(market.nextDueAt) <= utc(market.expectedCloseAt)) return result('ATRASADO', 'close-unverified');
    return time > utc(market.nextDueAt) ? result('ATRASADO', 'collection-due') : result('LIVE', 'market-closed');
  }
  if (time - success > source.cadenceMs * 2) return result('ATRASADO', 'collection-old');
  if (observed !== null && time - observed > source.cadenceMs * 2 + (source.kind === 'quotes' ? source.documentedDelayMs ?? 0 : 0)) return result('ATRASADO', 'source-old');
  return result('LIVE', observed === null ? 'source-age-unknown' : 'validated-within-cadence');
}
export function aggregateStatus(statuses, clientOnline = true) {
  boolean(clientOnline, 'clientOnline'); list(statuses, assertSourceStatus, 'statuses');
  if (!clientOnline) return 'OFFLINE';
  const enabled = statuses.filter(status => status.enabled);
  if (!enabled.length || !enabled.some(status => status.hasValidData)) return 'OFFLINE';
  return enabled.every(status => status.status === 'LIVE') ? 'LIVE' : 'ATRASADO';
}
