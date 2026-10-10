import { assertReservationRequest, assertReservationReceipt, assertSettlement, assertBillingMonth, BUDGET_BUCKETS } from '../contracts/budget.mjs';
import { object, oneOf, string, microUsd, utc, canonicalJson, list, https } from '../contracts/primitives.mjs';
import { MemoryControl } from './memory-control.mjs';
// Adaptador contábil local: nenhuma chamada externa é feita por este ledger.
export class MemoryBudgetLedger {
  #clock; #ceilings; #control; #mayReconcile;
  constructor({ clock, ceilings = { automation: '0', chat: '0' }, authorizeReconcile = () => false }) {
    object(ceilings, BUDGET_BUCKETS, 'ceilings');
    for (const bucket of BUDGET_BUCKETS) microUsd(ceilings[bucket], bucket);
    this.#mayReconcile=authorizeReconcile; this.#ceilings = { ...ceilings }; this.#clock = clock;
    this.#control = new MemoryControl({ months: new Map(), reservations: new Map(), calls: new Map(), haltedBuckets: new Map(), reconciliations: new Map(), reconciledOverruns: new Set() });
  }
  #month() { const now = this.#clock(); utc(now, 'clock'); return now.slice(0, 7); }
  #row(state, month, bucket) {
    const key = `${month}:${bucket}`;
    if (!state.months.has(key)) state.months.set(key, { spent: 0n, reserved: 0n });
    return state.months.get(key);
  }
  #receipt(reservation, replayed = false) {
    const { payload, ...value } = reservation; return assertReservationReceipt({ ...value, replayed });
  }
  reserve(request) {
    assertReservationRequest(request); const payload = canonicalJson(request);
    return this.#control.transact(state => {
      const prior = state.reservations.get(request.reservationId);
      if (prior) {
        if (prior.payload !== payload) throw new Error('RESERVATION_IDEMPOTENCY_CONFLICT');
        return this.#receipt(prior, true);
      }
      if (state.calls.has(request.callId)) throw new Error('CALL_ALREADY_RESERVED');
      const month=this.#month(); const row = this.#row(state, month, request.bucket);
      const max = microUsd(request.maxCostMicroUsd); const ceiling = microUsd(this.#ceilings[request.bucket]);
      if (state.haltedBuckets.has(request.bucket)) throw new Error('BUDGET_RECONCILIATION_REQUIRED');
      if (row.spent + row.reserved + max > ceiling) throw new Error('BUDGET_LIMIT');
      row.reserved += max;
      const reservation = { schemaVersion: 1, reservationId: request.reservationId, callId: request.callId, bucket: request.bucket,
        billingMonthUtc: month, maxCostMicroUsd: request.maxCostMicroUsd, status: 'reserved', actualCostMicroUsd: null, payload };
      state.reservations.set(request.reservationId, reservation); state.calls.set(request.callId, request.reservationId);
      return this.#receipt(reservation);
    });
  }
  markUnknown(reservationId) {
    string(reservationId, 'reservationId');
    return this.#control.transact(state => {
      const reservation = state.reservations.get(reservationId); if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
      const replayed = reservation.status !== 'reserved';
      if (reservation.status === 'reserved') reservation.status = 'unknown';
      return this.#receipt(reservation, replayed);
    });
  }
  settle(request) {
    assertSettlement(request);
    return this.#control.transact(state => {
      const reservation = state.reservations.get(request.reservationId); if (!reservation) throw new Error('RESERVATION_NOT_FOUND');
      if (reservation.actualCostMicroUsd !== null) {
        if (reservation.actualCostMicroUsd !== request.actualCostMicroUsd) throw new Error('SETTLEMENT_IDEMPOTENCY_CONFLICT');
        return this.#receipt(reservation, true);
      }
      const actual = microUsd(request.actualCostMicroUsd); const maximum = microUsd(reservation.maxCostMicroUsd);
      const row = this.#row(state, reservation.billingMonthUtc, reservation.bucket);
      row.reserved -= maximum; row.spent += actual; reservation.actualCostMicroUsd = request.actualCostMicroUsd;
      reservation.status = actual > maximum ? 'overrun' : 'settled';
      if (actual > maximum) state.haltedBuckets.set(reservation.bucket, 'cost-overrun');
      return this.#receipt(reservation);
    });
  }
  reconcile(request,context) {
    if(this.#mayReconcile(context)!==true)throw new Error('FORBIDDEN');
    object(request,['reconciliationId','bucket','overrunReservationIds','evidenceRef'],'Reconciliation');
    string(request.reconciliationId,'reconciliationId');oneOf(request.bucket,BUDGET_BUCKETS,'bucket');https(request.evidenceRef,'evidenceRef');
    list(request.overrunReservationIds,string,'overrunReservationIds',{unique:true,nonempty:true});const payload=canonicalJson(request);
    return this.#control.transact(state=>{
      const prior=state.reconciliations.get(request.reconciliationId);if(prior){if(prior.payload!==payload)throw new Error('RECONCILIATION_IDEMPOTENCY_CONFLICT');return prior.result;}
      const rows=[...state.reservations.values()].filter(r=>r.bucket===request.bucket);
      if(rows.some(r=>r.actualCostMicroUsd===null))throw new Error('UNSETTLED_RESERVATIONS');
      const ids=rows.filter(r=>r.status==='overrun'&&!state.reconciledOverruns.has(r.reservationId)).map(r=>r.reservationId).sort();
      if(canonicalJson(ids)!==canonicalJson([...request.overrunReservationIds].sort()))throw new Error('RECONCILIATION_MISMATCH');
      for(const id of ids)state.reconciledOverruns.add(id);state.haltedBuckets.delete(request.bucket);
      const result={...request,reconciledAt:this.#clock()};utc(result.reconciledAt);
      state.reconciliations.set(request.reconciliationId,{payload,result});return result;
    });
  }
  getMonth(bucket, month = this.#month()) {
    oneOf(bucket, BUDGET_BUCKETS, 'bucket'); assertBillingMonth(month);
    const state = this.#control.read(); const row = state.months.get(`${month}:${bucket}`) ?? { spent: 0n, reserved: 0n };
    const ceiling = microUsd(this.#ceilings[bucket]); const committed = row.spent + row.reserved;
    const haltedReason = state.haltedBuckets.get(bucket) ?? null;
    const mode = haltedReason || committed >= ceiling ? 'paused' : committed * 100n >= ceiling * 80n ? 'degraded' : 'normal';
    return { bucket, billingMonthUtc: month, ceilingMicroUsd: ceiling.toString(), spentMicroUsd: row.spent.toString(), reservedMicroUsd: row.reserved.toString(),
      committedMicroUsd: committed.toString(), mode, haltedReason, newsCadenceMs: mode === 'paused' ? null : mode === 'degraded' ? 21600000 : 3600000 };
  }
}
