import { object, string, oneOf, integer, nullable, sourceRefs, fail } from './primitives.mjs';
import { assertCompany, assertRelation } from './catalog.mjs';
export const PROPOSAL_KINDS = Object.freeze(['company', 'relation', 'merge']);
// MergeDecision humana (AD-3): retira fromCompanyId em favor de toCompanyId na próxima Atualização (AD-2).
export function assertCompanyMerge(value) {
 object(value,['schemaVersion','id','fromCompanyId','toCompanyId','sourceRefs'],'CompanyMerge');oneOf(value.schemaVersion,[1],'CompanyMerge.schemaVersion');
 for(const key of ['id','fromCompanyId','toCompanyId'])string(value[key],`CompanyMerge.${key}`);
 if(value.fromCompanyId===value.toCompanyId)fail('CompanyMerge','from igual a to');
 sourceRefs(value.sourceRefs);return value;
}
const ENTITY_VALIDATORS = Object.freeze({ company: assertCompany, relation: assertRelation, merge: assertCompanyMerge });
// Validador único da entidade de cada tipo de proposta; usado em propose e decide.
export function assertProposalEntity(kind, entity) { oneOf(kind,PROPOSAL_KINDS,'kind'); return ENTITY_VALIDATORS[kind](entity); }
export function assertProposalRequest(value) {
 object(value,['schemaVersion','proposalId','kind','entity','factKey'],'ProposalRequest');oneOf(value.schemaVersion,[1],'schemaVersion');
 string(value.proposalId,'proposalId');oneOf(value.kind,PROPOSAL_KINDS,'kind');string(value.factKey,'factKey');
 assertProposalEntity(value.kind,value.entity);return value;
}
export function assertDecisionRequest(value) {
 object(value,['schemaVersion','proposalId','expectedProposalVersion','action','editedEntity','idempotencyKey'],'DecisionRequest');
 oneOf(value.schemaVersion,[1],'schemaVersion');string(value.proposalId,'proposalId');integer(value.expectedProposalVersion,'expectedProposalVersion',1);
 oneOf(value.action,['approve','editApprove','reject','undo'],'action');string(value.idempotencyKey,'idempotencyKey');
 if(value.action==='editApprove'){if(value.editedEntity===null)fail('editedEntity');}
 else if(value.editedEntity!==null)fail('editedEntity');return value;
}
