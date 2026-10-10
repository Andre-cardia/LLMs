import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryBudgetLedger } from '../src/adapters/memory-budget-ledger.mjs';
import { assertReservationRequest, assertReservationReceipt } from '../src/contracts/budget.mjs';
const request = (id, maxCostMicroUsd, bucket = 'automation') => ({ schemaVersion: 1, reservationId: id, callId: `call-${id}`, bucket, maxCostMicroUsd });
const settlement = (id, actualCostMicroUsd) => ({ schemaVersion: 1, reservationId: id, actualCostMicroUsd });
const clock = () => '2026-10-31T23:59:59Z';
const ledger = () => new MemoryBudgetLedger({ clock, ceilings: { automation: '5000000', chat: '0' } });

test('teto zero por padrão bloqueia preços desconhecidos e qualquer cobrança positiva', () => {
  const budget = new MemoryBudgetLedger({ clock });
  assert.equal(budget.getMonth('automation').mode, 'paused'); assert.equal(budget.getMonth('chat').mode, 'paused');
  assert.throws(() => budget.reserve(request('a', '1')), /BUDGET_LIMIT/);
  for (const amount of [null, 1, '-1', '1.0', '1e6']) assert.throws(() => budget.reserve(request('a', amount)), TypeError);
});

test('80% inclui igualdade, gasto+reserva governa modo e liquidação menor permite normalizar', () => {
  const budget = ledger(); const admitted = budget.reserve(request('a', '4000000'));
  assertReservationRequest(request('a', '4000000')); assertReservationReceipt(admitted);
  assert.equal(budget.getMonth('automation').mode, 'degraded'); assert.equal(budget.getMonth('automation').newsCadenceMs, 21600000);
  budget.settle(settlement('a', '2000000')); assert.equal(budget.getMonth('automation').mode, 'normal');
  assert.equal(budget.getMonth('automation').committedMicroUsd, '2000000');
});

test('100% suspende por igualdade; rejeição não altera reserva e liquidação é idempotente', () => {
  const budget = ledger(); budget.reserve(request('a', '5000000'));
  const before = budget.getMonth('automation'); assert.equal(before.mode, 'paused');
  assert.throws(() => budget.reserve(request('b', '1')), /BUDGET_LIMIT/); assert.deepEqual(budget.getMonth('automation'), before);
  assert.equal(budget.reserve(request('a', '5000000')).replayed, true);
  assert.throws(() => budget.reserve(request('a', '4999999')), /IDEMPOTENCY_CONFLICT/);
  budget.settle(settlement('a', '100')); budget.settle(settlement('a', '100'));
  assert.equal(budget.getMonth('automation').spentMicroUsd, '100');
  assert.throws(() => budget.settle(settlement('a', '101')), /IDEMPOTENCY_CONFLICT/);
});

test('dez admissões concorrentes em memória aceitam só cinco sem ultrapassar o teto', async () => {
  const budget = ledger();
  const attempts = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => Promise.resolve().then(() => budget.reserve(request(`r-${i}`, '1000000')))));
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 5);
  assert.equal(budget.getMonth('automation').committedMicroUsd, '5000000');
});

test('resultado desconhecido conserva reserva e retry exige tentativa distinta', () => {
  const budget = ledger(); budget.reserve(request('a', '1000')); budget.markUnknown('a'); budget.markUnknown('a');
  assert.equal(budget.getMonth('automation').reservedMicroUsd, '1000');
  assert.equal(budget.reserve(request('a', '1000')).status, 'unknown');
  assert.throws(() => budget.reserve({ ...request('b', '1000'), callId: 'call-a' }), /CALL_ALREADY_RESERVED/);
  budget.reserve(request('b', '1000')); assert.equal(budget.getMonth('automation').reservedMicroUsd, '2000');
  budget.settle(settlement('a', '0')); assert.equal(budget.getMonth('automation').reservedMicroUsd, '1000');
});

test('reserva que cruza mês UTC liquida no mês original; mês novo não libera reservas antigas', () => {
  let now = clock(); const budget = new MemoryBudgetLedger({ clock: () => now, ceilings: { automation: '5000000', chat: '0' } });
  budget.reserve(request('oct', '4000000')); budget.markUnknown('oct'); now = '2026-11-01T00:00:01Z';
  budget.reserve(request('nov', '3000000')); budget.settle(settlement('oct', '2000000'));
  assert.equal(budget.getMonth('automation', '2026-10').spentMicroUsd, '2000000');
  assert.equal(budget.getMonth('automation', '2026-10').reservedMicroUsd, '0');
  assert.equal(budget.getMonth('automation', '2026-11').reservedMicroUsd, '3000000');
});

test('overrun conta todo gasto real e pausa o bucket até reconciliação, inclusive mês novo', () => {
  let now = clock(); const budget = new MemoryBudgetLedger({ clock: () => now, ceilings: { automation: '5000000', chat: '0' } });
  budget.reserve(request('a', '1000')); assert.equal(budget.settle(settlement('a', '2000')).status, 'overrun');
  assert.equal(budget.getMonth('automation').spentMicroUsd, '2000'); assert.equal(budget.getMonth('automation').reservedMicroUsd, '0');
  assert.equal(budget.getMonth('automation').haltedReason, 'cost-overrun');
  assert.throws(() => budget.reserve(request('b', '1')), /RECONCILIATION_REQUIRED/);
  now = '2026-11-01T00:00:01Z'; assert.throws(() => budget.reserve(request('c', '1')), /RECONCILIATION_REQUIRED/);
});

test('microUSD não perde precisão acima de Number.MAX_SAFE_INTEGER e buckets não compartilham verba', () => {
  const budget = new MemoryBudgetLedger({ clock, ceilings: { automation: '900719925474099300000', chat: '0' } });
  budget.reserve(request('a', '9007199254740993')); budget.settle(settlement('a', '9007199254740993'));
  assert.equal(budget.getMonth('automation').spentMicroUsd, '9007199254740993');
  assert.throws(() => budget.reserve(request('chat', '1', 'chat')), /BUDGET_LIMIT/);
  assert.throws(() => assertReservationRequest({ ...request('a', '1'), billingMonthUtc: '2026-09' }), TypeError);
});
