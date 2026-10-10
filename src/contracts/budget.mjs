import { object, string, oneOf, microUsd, nullable, boolean, fail } from './primitives.mjs';
export const BUDGET_BUCKETS = Object.freeze(['automation', 'chat']);
export function assertReservationRequest(value) {
  object(value, ['schemaVersion', 'reservationId', 'callId', 'bucket', 'maxCostMicroUsd'], 'ReservationRequest');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); string(value.reservationId, 'reservationId'); string(value.callId, 'callId');
  oneOf(value.bucket, BUDGET_BUCKETS, 'bucket'); microUsd(value.maxCostMicroUsd, 'maxCostMicroUsd'); return value;
}
export function assertReservationReceipt(value) {
  object(value, ['schemaVersion', 'reservationId', 'callId', 'bucket', 'billingMonthUtc', 'maxCostMicroUsd', 'status', 'actualCostMicroUsd', 'replayed'], 'ReservationReceipt');
  oneOf(value.schemaVersion, [1], 'schemaVersion');
  for (const key of ['reservationId', 'callId']) string(value[key], key);
  oneOf(value.bucket, BUDGET_BUCKETS, 'bucket'); assertBillingMonth(value.billingMonthUtc);
  microUsd(value.maxCostMicroUsd); nullable(value.actualCostMicroUsd, microUsd, 'actualCostMicroUsd');
  oneOf(value.status, ['reserved', 'unknown', 'settled', 'overrun'], 'status'); boolean(value.replayed, 'replayed');
  const pending=['reserved','unknown'].includes(value.status);
  if(pending !== (value.actualCostMicroUsd===null)) fail('actualCostMicroUsd','estado incompatível');
  if(!pending && (microUsd(value.actualCostMicroUsd)>microUsd(value.maxCostMicroUsd)) !== (value.status==='overrun')) fail('status','custo incompatível');
  return value;
}
export function assertBillingMonth(value) {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) throw new TypeError('billingMonthUtc inválido');
  return value;
}
export function assertSettlement(value) {
  object(value, ['schemaVersion', 'reservationId', 'actualCostMicroUsd'], 'Settlement');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); string(value.reservationId, 'reservationId'); microUsd(value.actualCostMicroUsd); return value;
}
