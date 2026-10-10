import { object, string, oneOf, integer, nullable, fail } from './primitives.mjs';
import { assertCompany, assertRelation } from './catalog.mjs';
export function assertProposalRequest(value) {
 object(value,['schemaVersion','proposalId','kind','entity','factKey'],'ProposalRequest');oneOf(value.schemaVersion,[1],'schemaVersion');
 string(value.proposalId,'proposalId');oneOf(value.kind,['company','relation'],'kind');string(value.factKey,'factKey');
 (value.kind==='company'?assertCompany:assertRelation)(value.entity);return value;
}
export function assertDecisionRequest(value) {
 object(value,['schemaVersion','proposalId','expectedProposalVersion','action','editedEntity','idempotencyKey'],'DecisionRequest');
 oneOf(value.schemaVersion,[1],'schemaVersion');string(value.proposalId,'proposalId');integer(value.expectedProposalVersion,'expectedProposalVersion',1);
 oneOf(value.action,['approve','editApprove','reject','undo'],'action');string(value.idempotencyKey,'idempotencyKey');
 if(value.action==='editApprove'){if(value.editedEntity===null)fail('editedEntity');}
 else if(value.editedEntity!==null)fail('editedEntity');return value;
}
