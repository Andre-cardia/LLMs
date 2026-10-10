import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceStatus, aggregateStatus } from '../src/domain/freshness.mjs';
import { source, fixture } from './helpers/local-fixtures.mjs';

test('frescor usa coleta/horário upstream, não assume idade quando ausente', () => {
  assert.equal(sourceStatus(source(), fixture.now).status, 'LIVE');
  assert.equal(sourceStatus(source(), fixture.now).sourceAgeSeconds, null);
  assert.equal(sourceStatus(source({ observedAt: '2026-10-10T09:59:59Z' }), fixture.now).reason, 'source-old');
  assert.equal(sourceStatus(source({ lastSuccessAt: '2026-10-10T09:59:59Z' }), fixture.now).status, 'ATRASADO');
  assert.equal(sourceStatus(source({ lastSuccessAt: '2026-10-10T10:00:00Z' }), fixture.now).status, 'LIVE');
  assert.equal(sourceStatus(source({ observedAt: '2026-10-10T12:05:01Z' }), fixture.now).reason, 'future-timestamp');
  assert.equal(sourceStatus(source({ observedAt: '2026-10-10T12:05:00Z' }), fixture.now).status, 'LIVE');
});

test('precedência de fonte desativada/credencial/sem dado/falhas e conexões', () => {
  assert.equal(sourceStatus(source({ enabled: false }), fixture.now).reason, 'disabled');
  assert.equal(sourceStatus(source({ credentialsValid: false }), fixture.now).status, 'OFFLINE');
  assert.equal(sourceStatus(source({ hasValidData: false }), fixture.now).status, 'OFFLINE');
  const failed = source({ lastSuccessAt: '2026-10-10T09:59:59Z', lastFailureAt: '2026-10-10T11:00:00Z', consecutiveFailures: 3 });
  assert.equal(sourceStatus(failed, fixture.now).status, 'OFFLINE');
  assert.equal(sourceStatus(source({ lastFailureAt: fixture.now, consecutiveFailures: 1 }), fixture.now).status, 'ATRASADO');
  const live = sourceStatus(source(), fixture.now); const disabled = sourceStatus(source({ enabled: false }), fixture.now);
  assert.equal(aggregateStatus([live, disabled]), 'LIVE'); assert.equal(aggregateStatus([live], false), 'OFFLINE');
  assert.equal(aggregateStatus([live, sourceStatus(failed, fixture.now)]), 'ATRASADO');
  assert.equal(aggregateStatus([disabled]), 'OFFLINE');
});

test('cotações exigem origem/calendário e aplicam apenas atraso declarado', () => {
  const quote = source({ kind: 'quotes', cadenceMs: 900000, observedAtRequired: true, market: { calendarVerified: true, open: true, expectedCloseAt: null, currentCloseAt: null, postCloseCollected: false, nextDueAt: null } });
  assert.equal(sourceStatus(quote, fixture.now).reason, 'source-time-required');
  assert.equal(sourceStatus({ ...quote, observedAt: '2026-10-10T11:29:59Z' }, fixture.now).status, 'ATRASADO');
  assert.equal(sourceStatus({ ...quote, observedAt: '2026-10-10T11:30:00Z' }, fixture.now).status, 'LIVE');
  assert.equal(sourceStatus({ ...quote, observedAt: '2026-10-10T11:15:00Z', documentedDelayMs: 900000 }, fixture.now).status, 'LIVE');
  assert.equal(sourceStatus({ ...quote, observedAt: fixture.now, market: { ...quote.market, calendarVerified: false } }, fixture.now).reason, 'calendar-unverified');
});

test('fechamento validado fica LIVE no fim de semana até nextDueAt', () => {
  const close = '2026-10-09T20:00:00Z';
  const quote = source({ kind: 'quotes', cadenceMs: 900000, observedAtRequired: true, observedAt: close, lastSuccessAt: '2026-10-09T20:15:00Z',
    market: { calendarVerified: true, open: false, expectedCloseAt: close, currentCloseAt: close, postCloseCollected: true, nextDueAt: '2026-10-12T13:45:00Z' } });
  assert.equal(sourceStatus(quote, fixture.now).reason, 'market-closed');
  assert.equal(sourceStatus(quote, '2026-10-12T13:45:00Z').status, 'LIVE');
  assert.equal(sourceStatus(quote, '2026-10-12T13:45:01Z').reason, 'collection-due');
  assert.equal(sourceStatus({ ...quote, market: { ...quote.market, postCloseCollected: false } }, fixture.now).reason, 'close-unverified');
});
