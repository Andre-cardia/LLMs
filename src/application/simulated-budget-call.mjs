import { conservativeCallBound } from '../domain/call-cost-bound.mjs';
import { microUsd } from '../contracts/primitives.mjs';
// Exercita reserva/settle com porta de fixture; não contém cliente HTTP ou SDK.
export async function simulatedBudgetCall({ledger,reservationId,callId,bucket,pricing,limits,attempt}){
 if(typeof attempt!=='function')throw new TypeError('attempt deve ser função');
 const maxCostMicroUsd=conservativeCallBound(pricing,limits);
 const receipt=ledger.reserve({schemaVersion:1,reservationId,callId,bucket,maxCostMicroUsd});
 if(receipt.replayed)return {status:'replayed',receipt};
 try {const result=await attempt(Object.freeze({maxCostMicroUsd,limits:Object.freeze({...limits})}));microUsd(result.actualCostMicroUsd);return {status:'settled',receipt:ledger.settle({schemaVersion:1,reservationId,actualCostMicroUsd:result.actualCostMicroUsd})};}
 catch(error){ledger.markUnknown(reservationId);throw error;}
}
