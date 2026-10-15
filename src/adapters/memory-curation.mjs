import { assertProposalRequest, assertDecisionRequest, assertProposalEntity } from '../contracts/curation.mjs';
import { assertCatalog } from '../contracts/catalog.mjs';
import { clone, utc, canonicalJson } from '../contracts/primitives.mjs';
export function weekStartUtc(now) {
 const date=new Date(utc(now));const day=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-day);date.setUTCHours(0,0,0,0);return date.toISOString();
}
export class MemoryCuration {
 #control;#clock;#propose;#owner;#publish;
 constructor({control,clock,authorizePropose=()=>false,authorizeOwner=()=>false,authorizePublish=()=>false}){
  this.#control=control;this.#clock=clock;this.#propose=authorizePropose;this.#owner=authorizeOwner;this.#publish=authorizePublish;
  control.transact(state=>{if(state.curation)throw new Error('CURATION_ALREADY_INITIALIZED');state.curation={proposals:new Map(),facts:new Map(),receipts:new Map(),weeks:new Map(),versions:new Map(),decisions:[],sequence:0};
   for(const company of state.catalog.companies)state.curation.versions.set(`company:${company.id}`,1);
   for(const relation of state.catalog.relations)state.curation.versions.set(`relation:${relation.id}`,1);
  });
 }
 #auth(callback,context){if(callback(context)!==true)throw new Error('FORBIDDEN');}
 propose(request,context){this.#auth(this.#propose,context);assertProposalRequest(request);const payload=canonicalJson(request),week=weekStartUtc(this.#clock());
  return this.#control.transact(state=>{const c=state.curation;const prior=c.proposals.get(request.proposalId);
   if(prior){if(prior.payload!==payload)throw new Error('PROPOSAL_IDEMPOTENCY_CONFLICT');return prior;}
   const evidence=request.entity.sourceRefs.map(r=>[r.source,r.sourceUrl]).sort((a,b)=>canonicalJson(a).localeCompare(canonicalJson(b)));
   const fact=canonicalJson([request.kind,request.entity.id,evidence]);
   const semanticEntity={...clone(request.entity),sourceRefs:request.entity.sourceRefs.map(({fetchedAt,observedAt,...r})=>r)};const semanticPayload=canonicalJson(semanticEntity);
   if(c.facts.has(fact)){const priorFact=c.proposals.get(c.facts.get(fact));if(priorFact.semanticPayload!==semanticPayload)throw new Error('PROPOSAL_FACT_CONFLICT');return priorFact;}
   const rejected=[...c.proposals.values()].filter(p=>p.kind===request.kind&&p.entity.id===request.entity.id&&p.status==='rejected');
   const rejectedSources=new Set(rejected.flatMap(p=>p.entity.sourceRefs.map(r=>r.source)));
   if(rejected.length&&!request.entity.sourceRefs.some(r=>!rejectedSources.has(r.source)))throw new Error('NEW_INDEPENDENT_EVIDENCE_REQUIRED');
   const key=`${request.kind}:${request.entity.id}`,targetVersion=c.versions.get(key)??null;
   if(request.kind==='company'&&targetVersion===null){const count=c.weeks.get(week)??0;if(count>=10)throw new Error('WEEKLY_COMPANY_QUOTA');c.weeks.set(week,count+1);}
   const proposal={...clone(request),payload,semanticPayload,version:1,status:'pending',targetVersion,stagedEntity:null,decisionSequence:null,conflict:null,publishedRevision:null};
   c.proposals.set(request.proposalId,proposal);c.facts.set(fact,request.proposalId);return proposal;
  });
 }
 decide(request,context){this.#auth(this.#owner,context);assertDecisionRequest(request);const payload=canonicalJson(request),key=canonicalJson([request.proposalId,request.action,request.idempotencyKey]);
  return this.#control.transact(state=>{const c=state.curation,receipt=c.receipts.get(key);if(receipt){if(receipt.payload!==payload)throw new Error('DECISION_IDEMPOTENCY_CONFLICT');return receipt.result;}
   const proposal=c.proposals.get(request.proposalId);if(!proposal)throw new Error('PROPOSAL_NOT_FOUND');if(proposal.version!==request.expectedProposalVersion)throw new Error('PROPOSAL_VERSION_CONFLICT');
   if(request.action==='undo'){if(proposal.status==='published')throw new Error('POST_PUBLICATION_COMPENSATION_REQUIRED');if(proposal.status!=='staged')throw new Error('INVALID_PROPOSAL_STATE');proposal.status='pending';proposal.stagedEntity=null;proposal.conflict=null;}
   else {if(proposal.status!=='pending')throw new Error('INVALID_PROPOSAL_STATE');
    if(request.action==='reject')proposal.status='rejected';else{const entity=clone(request.action==='editApprove'?request.editedEntity:proposal.entity);assertProposalEntity(proposal.kind,entity);
     if(entity.id!==proposal.entity.id)throw new Error('TARGET_ID_IMMUTABLE');proposal.status='staged';proposal.stagedEntity=entity;}}
   proposal.version+=1;c.sequence+=1;proposal.decisionSequence=c.sequence;c.decisions.push({sequence:c.sequence,...clone(request),resultVersion:proposal.version});
   const result=clone(proposal);c.receipts.set(key,{payload,result});return result;
  });
 }
 preparePublish(state,context){this.#auth(this.#publish,context);const c=state.curation;const staged=[...c.proposals.values()].filter(p=>p.status==='staged').sort((a,b)=>a.decisionSequence-b.decisionSequence);
  const counts=new Map();for(const p of staged){const key=`${p.kind}:${p.entity.id}`;counts.set(key,(counts.get(key)??0)+1);}
  let ready=[];for(const p of staged){const key=`${p.kind}:${p.entity.id}`;p.conflict=counts.get(key)>1?'overlapping-target':(c.versions.get(key)??null)!==p.targetVersion?'target-version-changed':null;if(!p.conflict)ready.push(p);}
  // Duas MergeDecisions prontas que retiram o mesmo from não se aplicam até reconciliação humana.
  const fromCounts=new Map();for(const p of ready.filter(p=>p.kind==='merge')){const from=p.stagedEntity.fromCompanyId;fromCounts.set(from,(fromCounts.get(from)??0)+1);}
  for(const p of ready)if(p.kind==='merge'&&fromCounts.get(p.stagedEntity.fromCompanyId)>1)p.conflict='overlapping-target';
  ready=ready.filter(p=>!p.conflict);
  // Ensaio sequencial dos merges sobre o catálogo que as Empresas prontas produziriam: só merges que de fato
  // se aplicam retiram o from, para que um merge em conflito não bloqueie edições da mesma Empresa.
  const tableFrom=new Set(state.companyMergedInto.map(e=>e.fromCompanyId));
  const sim=new Map(state.catalog.companies.map(e=>[e.id,e.isLab]));
  for(const p of ready)if(p.kind==='company'&&!tableFrom.has(p.entity.id))sim.set(p.entity.id,p.stagedEntity.isLab);
  const willApply=new Set();for(const p of ready.filter(p=>p.kind==='merge')){const {fromCompanyId:from,toCompanyId:to}=p.stagedEntity;
   if(!sim.has(from)||!sim.has(to)||(sim.get(from)&&!sim.get(to)))continue;sim.delete(from);willApply.add(from);}
  // Readicionar ou alterar uma Empresa já retirada (na tabela ou por merge que se aplica neste lote) não é aplicado.
  const retired=new Set([...tableFrom,...willApply]);
  // merged-company prevalece sobre target-version-changed, porque a mudança de versão vem do próprio merge.
  for(const p of staged)if(p.kind==='company'&&retired.has(p.entity.id)&&p.conflict!=='overlapping-target')p.conflict='merged-company';
  ready=ready.filter(p=>!p.conflict);
  const apply=p=>{const field=p.kind==='company'?'companies':'relations',items=state.catalog[field],i=items.findIndex(e=>e.id===p.entity.id);if(i<0)items.push(clone(p.stagedEntity));else items[i]=clone(p.stagedEntity);};
  const bump=key=>c.versions.set(key,(c.versions.get(key)??0)+1);
  const selected=[];for(const p of ready.filter(p=>p.kind==='company')){apply(p);selected.push(p);}
  // MergeDecisions depois das Empresas e antes das Relações, na ordem de decisionSequence (AD-2, AD-3).
  for(const p of ready.filter(p=>p.kind==='merge')){const {fromCompanyId:from,toCompanyId:to}=p.stagedEntity;
   const source=state.catalog.companies.find(e=>e.id===from),survivor=state.catalog.companies.find(e=>e.id===to);
   if(!source||!survivor){p.conflict='missing-company';continue;}if(source.isLab&&!survivor.isLab){p.conflict='survivor-not-lab';continue;}
   state.catalog.companies=state.catalog.companies.filter(e=>e.id!==from);bump(`company:${from}`);
   // Relação reescrita que vira auto-relação ou repete uma que já existe (mesmas pontas e tipo) é descartada;
   // a existente permanece.
   const edge=r=>`${r.fromCompanyId}|${r.toCompanyId}|${r.type}`;
   const kept=state.catalog.relations.filter(r=>r.fromCompanyId!==from&&r.toCompanyId!==from),edges=new Set(kept.map(edge)),relations=[...kept];
   for(const r of state.catalog.relations){if(r.fromCompanyId!==from&&r.toCompanyId!==from)continue;
    const next={...r,fromCompanyId:r.fromCompanyId===from?to:r.fromCompanyId,toCompanyId:r.toCompanyId===from?to:r.toCompanyId};bump(`relation:${r.id}`);
    if(next.fromCompanyId===next.toCompanyId||edges.has(edge(next)))continue;edges.add(edge(next));relations.push(next);}
   state.catalog.relations=relations;
   state.companyMergedInto=[...state.companyMergedInto.map(e=>e.toCompanyId===from?{fromCompanyId:e.fromCompanyId,toCompanyId:to}:e),{fromCompanyId:from,toCompanyId:to}];
   selected.push(p);}
  const ids=new Set(state.catalog.companies.map(e=>e.id));for(const p of ready.filter(p=>p.kind==='relation')){
   if(!ids.has(p.stagedEntity.fromCompanyId)||!ids.has(p.stagedEntity.toCompanyId)){p.conflict='missing-company';continue;}apply(p);selected.push(p);
  }
  assertCatalog(state.catalog);if(selected.length){const n=Number(state.curationRevision.replace('curation-',''))+1;state.curationRevision=`curation-${n}`;}
  for(const p of selected){bump(`${p.kind}:${p.entity.id}`);p.status='published';p.version+=1;p.publishedRevision=state.curationRevision;p.stagedEntity=null;}
  return {publishedProposalIds:selected.map(p=>p.proposalId),conflicts:staged.filter(p=>p.conflict).map(p=>({proposalId:p.proposalId,reason:p.conflict}))};
 }
 read(context){this.#auth(this.#owner,context);return this.#control.read().curation;}
}
