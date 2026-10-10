import test from 'node:test';import assert from 'node:assert/strict';import { fixture } from './helpers/local-fixtures.mjs';import { clone } from '../src/contracts/primitives.mjs';
import { MemoryBudgetLedger } from '../src/adapters/memory-budget-ledger.mjs';import { conservativeCallBound } from '../src/domain/call-cost-bound.mjs';import { simulatedBudgetCall } from '../src/application/simulated-budget-call.mjs';import { assertReservationReceipt } from '../src/contracts/budget.mjs';
test('recibo contraditório rejeitado; replay não depende de relógio atual',()=>{
 let now=fixture.now;const l=new MemoryBudgetLedger({clock:()=>now,ceilings:{automation:'2',chat:'0'}}),r={schemaVersion:1,reservationId:'r',callId:'c',bucket:'automation',maxCostMicroUsd:'1'},receipt=l.reserve(r);now='invalid';assert.equal(l.reserve(r).replayed,true);
 for(const fields of [{status:'reserved',actualCostMicroUsd:'1'},{status:'settled',actualCostMicroUsd:null},{status:'settled',actualCostMicroUsd:'2'},{status:'overrun',actualCostMicroUsd:'0'}])assert.throws(()=>assertReservationReceipt({...receipt,...fields}),TypeError);
});
test('máximo arredondado para cima precede tentativa; ausência/limite inválido/negação executam zero vezes',async()=>{
 const p=clone(fixture.models[0].variants[0].pricing);p.reasoning=false;p.inputUsdPerMillion='0.0000001';p.outputUsdPerMillion='0';assert.equal(conservativeCallBound(p,{inputTokens:1,outputTokens:0}),'1');
 const l=new MemoryBudgetLedger({clock:()=>fixture.now});let calls=0;const a={ledger:l,reservationId:'r',callId:'c',bucket:'automation',pricing:p,limits:{inputTokens:1,outputTokens:0},attempt:()=>{calls++;return {actualCostMicroUsd:'0'};}};
 await assert.rejects(simulatedBudgetCall(a),/BUDGET_LIMIT/);await assert.rejects(simulatedBudgetCall({...a,pricing:{...p,inputUsdPerMillion:null}}),/PRICE_UNKNOWN/);await assert.rejects(simulatedBudgetCall({...a,limits:{inputTokens:1,outputTokens:null}}),TypeError);assert.equal(calls,0);
 const funded=new MemoryBudgetLedger({clock:()=>fixture.now,ceilings:{automation:'2',chat:'0'}});await simulatedBudgetCall({...a,ledger:funded,attempt:()=>{assert.equal(funded.getMonth('automation').reservedMicroUsd,'1');calls++;return {actualCostMicroUsd:'1'};}});await simulatedBudgetCall({...a,ledger:funded});assert.equal(calls,1);
});
test('reconciliação do dono registra evidência, preserva gasto e não libera chamadas desconhecidas',()=>{
 const owner=Symbol(),l=new MemoryBudgetLedger({clock:()=>fixture.now,ceilings:{automation:'10',chat:'0'},authorizeReconcile:c=>c===owner});l.reserve({schemaVersion:1,reservationId:'r',callId:'c',bucket:'automation',maxCostMicroUsd:'1'});l.settle({schemaVersion:1,reservationId:'r',actualCostMicroUsd:'2'});
 const q={reconciliationId:'ack',bucket:'automation',overrunReservationIds:['r'],evidenceRef:'https://example.invalid/fixture-reconciliation'};assert.throws(()=>l.reconcile(q,null),/FORBIDDEN/);l.reconcile(q,owner);assert.equal(l.getMonth('automation').spentMicroUsd,'2');assert.equal(l.getMonth('automation').mode,'normal');assert.deepEqual(l.reconcile(q,owner),l.reconcile(q,owner));
});
