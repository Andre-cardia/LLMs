import test from 'node:test';import assert from 'node:assert/strict';
import { workspace,publish,fixture } from './helpers/local-fixtures.mjs';import { clone } from '../src/contracts/primitives.mjs';
import { MemoryCuration,weekStartUtc } from '../src/adapters/memory-curation.mjs';
function setup(){const w=workspace();const c=new MemoryCuration({...w,authorizeOwner:x=>x===w.owner,authorizePropose:x=>x===w.agent||x===w.owner,authorizePublish:x=>x===w.job});return {...w,c};}
function propose(w,id,entity,kind='company',factKey=id){return w.c.propose({schemaVersion:1,proposalId:id,entity,kind,factKey},w.agent);}
function decision(w,p,action='approve',editedEntity=null){return w.c.decide({schemaVersion:1,proposalId:p.proposalId,expectedProposalVersion:p.version,action,editedEntity,idempotencyKey:`${p.proposalId}-${p.version}-${action}`},w.owner);}
function company(id){return {...clone(fixture.catalog.companies[0]),id,name:id};}
test('nega por padrão, agente só propõe e dono staged não muda catálogo até Update',()=>{
 const w=setup(),p=propose(w,'p1',company('new'));assert.throws(()=>w.c.decide({schemaVersion:1,proposalId:p.proposalId,expectedProposalVersion:1,action:'approve',editedEntity:null,idempotencyKey:'a'},w.agent),/FORBIDDEN/);
 decision(w,p);assert.equal(w.control.read().catalog.companies.length,3);publish(w,'pub',s=>w.c.preparePublish(s,w.job));assert.equal(w.control.read().catalog.companies.length,4);assert.equal(w.c.read(w.owner).proposals.get('p1').status,'published');assert.throws(()=>w.c.read(w.agent),/FORBIDDEN/);
});
test('DESFAZER vence antes de publicar; pós-publicação exige compensação e conflito de versão',()=>{
 const w=setup(),p=propose(w,'p',company('new'));const staged=decision(w,p);decision(w,staged,'undo');publish(w,'pub',s=>{w.c.preparePublish(s,w.job);});assert.equal(w.control.read().catalog.companies.length,3);
 assert.throws(()=>decision(w,p,'reject'),/VERSION_CONFLICT/);const p2=propose(w,'p2',company('other'));decision(w,p2);publish(w,'pub2',s=>{w.c.preparePublish(s,w.job);});assert.throws(()=>decision(w,w.c.read(w.owner).proposals.get('p2'),'undo'),/COMPENSATION/);
});
test('quota global atômica: replay/dedup não consome, rejeição não devolve, segunda UTC reinicia',()=>{
 const w=setup();for(let i=0;i<10;i++)propose(w,`p${i}`,company(`c${i}`));const replay=propose(w,'another-id',company('c0'),'company','p0');assert.equal(replay.proposalId,'p0');decision(w,w.c.read(w.owner).proposals.get('p0'),'reject');assert.throws(()=>propose(w,'eleven',company('c11')),/QUOTA/);
 assert.equal(weekStartUtc('2026-10-11T23:59:59Z'),'2026-10-05T00:00:00.000Z');w.setClock('2026-10-12T00:00:00Z');propose(w,'next',company('next'));assert.equal(w.c.read(w.owner).weeks.size,2);
 const existing=clone(fixture.catalog.companies[0]);propose(w,'correction',existing);assert.equal([...w.c.read(w.owner).weeks.values()].reduce((a,b)=>a+b),11);
});
test('disjuntas publicam juntas; sobreposição fica staged; relações sem endpoint ficam em conflito',()=>{
 const w=setup();const a=propose(w,'a',company('new-a')),b=propose(w,'b',company('new-b'));decision(w,a);decision(w,b);
 const x=propose(w,'x',clone(fixture.catalog.companies[0])),y=propose(w,'y',{...clone(fixture.catalog.companies[0]),name:'outro',sourceRefs:[{...clone(fixture.catalog.companies[0].sourceRefs[0]),source:'independent-fixture',sourceUrl:'https://example.invalid/independent'}]});decision(w,x);decision(w,y);
 const relation={...clone(fixture.catalog.relations[0]),id:'new-r',fromCompanyId:'new-a'};decision(w,propose(w,'r',relation,'relation'));
 const missing={...relation,id:'missing-r',fromCompanyId:'absent'};decision(w,propose(w,'missing',missing,'relation'));
 publish(w,'pub',s=>{w.c.preparePublish(s,w.job);});const c=w.c.read(w.owner);assert.equal(c.proposals.get('a').status,'published');assert.equal(c.proposals.get('r').status,'published');assert.equal(c.proposals.get('x').conflict,'overlapping-target');assert.equal(c.proposals.get('missing').conflict,'missing-company');
});
test('perder CAS não consome decisões; receipt é idempotente e patch conserva identidade',()=>{
 const w=setup(),p=propose(w,'p',company('new')),s=decision(w,p);assert.deepEqual(decision(w,p),s);
 assert.throws(()=>w.c.decide({schemaVersion:1,proposalId:'p',expectedProposalVersion:1,action:'approve',editedEntity:null,idempotencyKey:'p-1-approve',extra:true},w.owner),TypeError);
 const lease=w.snapshots.acquireLease('snapshot','bad',60000,w.job);assert.throws(()=>w.snapshots.publish({expectedRevision:'wrong',lease,models:fixture.models,news:fixture.news,lastSuccessAt:{catalog:fixture.now,models:fixture.now,news:fixture.now}},w.job,state=>{w.c.preparePublish(state,w.job);}),/CAS/);assert.equal(w.c.read(w.owner).proposals.get('p').status,'staged');
});

test('proposta obsoleta conserva versão revisada; rejeição exige evidência nova e colisão é erro',()=>{
 const w=setup(),old=propose(w,'old',clone(fixture.catalog.companies[0]));
 const changed={...clone(fixture.catalog.companies[0]),name:'newer',sourceRefs:[{...clone(fixture.catalog.companies[0].sourceRefs[0]),source:'independent-fixture',sourceUrl:'https://example.invalid/new-evidence'}]};
 decision(w,propose(w,'new',changed));publish(w,'first',s=>w.c.preparePublish(s,w.job));decision(w,old);publish(w,'second',s=>w.c.preparePublish(s,w.job));assert.equal(w.c.read(w.owner).proposals.get('old').conflict,'target-version-changed');assert.equal(w.control.read().catalog.companies[0].name,'newer');
 const p=propose(w,'reject',company('fresh'));decision(w,p,'reject');assert.equal(propose(w,'same-new-key',company('fresh'),'company','arbitrary').status,'rejected');
 assert.throws(()=>propose(w,'collision',{...company('fresh'),name:'different'}),/FACT_CONFLICT/);
 const oldRef=company('fresh');oldRef.sourceRefs[0].sourceUrl='https://example.invalid/changed-url-same-source';assert.throws(()=>propose(w,'bypass',oldRef),/NEW_INDEPENDENT/);
});

// MergeDecision pela Fila (AD-2, AD-3): fonte única de companyMergedInto.
function merge(id,fromCompanyId,toCompanyId){return {schemaVersion:1,id,fromCompanyId,toCompanyId,sourceRefs:[{...clone(fixture.catalog.companies[0].sourceRefs[0]),sourceRecordId:id,sourceUrl:`https://example.invalid/${id}`}]};}
function stageMerge(w,id,from,to){return decision(w,propose(w,id,merge(id,from,to),'merge'));}
const statusOf=(w,id)=>w.c.read(w.owner).proposals.get(id);
async function snapshot(w){const r=await w.reader.refresh();assert.equal(r.status,'updated');return r.snapshot;}
function addLab(w,id){decision(w,propose(w,`add-${id}`,company(id)));publish(w,`add-${id}`,s=>w.c.preparePublish(s,w.job));}
test('merge simples: retira from, reescreve Relações, tabela, Modelos e Notícias na publicação',async()=>{
 const w=setup();stageMerge(w,'m','company-1','company-2');assert.deepEqual(w.control.read().companyMergedInto,[]);
 const manifest=publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 assert.deepEqual(manifest.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'company-2'}]);assert.equal(manifest.curationRevision,'curation-1');
 const p=statusOf(w,'m');assert.equal(p.status,'published');assert.equal(p.conflict,null);
 const snap=await snapshot(w);assert.equal(snap.catalog.companies.some(c=>c.id==='company-1'),false);
 assert.deepEqual(snap.catalog.relations.map(r=>[r.fromCompanyId,r.toCompanyId]),[['company-3','company-2']]);
 assert.deepEqual(snap.models.map(m=>m.companyId),['company-2','company-2','company-2','company-2']);
 assert.deepEqual(snap.news.map(n=>[n.relevantCompanyIds,n.citedCompanyIds]),[[['company-2'],['company-3']],[['company-3'],['company-2']],[['company-2'],[]]]);
 assert.equal(fixture.models[0].companyId,'company-1');
});
test('merge encadeado e no mesmo lote compactam a tabela',()=>{
 const w=setup();addLab(w,'lab-c');stageMerge(w,'ab','company-1','company-2');publish(w,'ab',s=>w.c.preparePublish(s,w.job));
 stageMerge(w,'bc','company-2','lab-c');const m=publish(w,'bc',s=>w.c.preparePublish(s,w.job));
 assert.deepEqual(m.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'lab-c'},{fromCompanyId:'company-2',toCompanyId:'lab-c'}]);
 const v=setup();addLab(v,'lab-c');stageMerge(v,'ab','company-1','company-2');stageMerge(v,'bc','company-2','lab-c');const same=publish(v,'batch',s=>v.c.preparePublish(s,v.job));
 assert.deepEqual(same.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'lab-c'},{fromCompanyId:'company-2',toCompanyId:'lab-c'}]);
 assert.equal(statusOf(v,'ab').status,'published');assert.equal(statusOf(v,'bc').status,'published');
});
test('conflitos de merge não bloqueiam o lote: alvo já mesclado, survivor-not-lab e overlapping-target',async()=>{
 const w=setup();stageMerge(w,'ab','company-1','company-2');stageMerge(w,'xa','company-3','company-1');
 const other=propose(w,'other',company('fresh'));decision(w,other);
 const m=publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 assert.equal(statusOf(w,'ab').status,'published');assert.equal(statusOf(w,'xa').status,'staged');assert.equal(statusOf(w,'xa').conflict,'missing-company');
 assert.equal(statusOf(w,'other').status,'published');assert.deepEqual(m.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'company-2'}]);
 const lab=setup();stageMerge(lab,'lab','company-1','company-3');decision(lab,propose(lab,'other',company('fresh')));
 const before=publish(lab,'pub',s=>lab.c.preparePublish(s,lab.job));
 assert.equal(statusOf(lab,'lab').conflict,'survivor-not-lab');assert.equal(statusOf(lab,'lab').status,'staged');assert.equal(statusOf(lab,'other').status,'published');
 assert.deepEqual(before.companyMergedInto,[]);const snap=await snapshot(lab);assert.equal(snap.catalog.companies.some(c=>c.id==='company-1'),true);
 assert.deepEqual(snap.models,fixture.models);assert.deepEqual(snap.news,fixture.news);
 const twice=setup();addLab(twice,'lab-c');stageMerge(twice,'one','company-1','company-2');stageMerge(twice,'two','company-1','lab-c');
 publish(twice,'pub',s=>twice.c.preparePublish(s,twice.job));
 for(const id of ['one','two']){assert.equal(statusOf(twice,id).conflict,'overlapping-target');assert.equal(statusOf(twice,id).status,'staged');}
 assert.deepEqual(twice.control.read().companyMergedInto,[]);
});
test('readicionar ID mesclado fica em merged-company e a publicação segue',()=>{
 const w=setup();stageMerge(w,'m','company-1','company-2');publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 decision(w,propose(w,'readd',clone(fixture.catalog.companies[0])));decision(w,propose(w,'fine',company('fresh')));
 const m=publish(w,'pub2',s=>w.c.preparePublish(s,w.job));
 assert.equal(statusOf(w,'readd').conflict,'merged-company');assert.equal(statusOf(w,'readd').status,'staged');assert.equal(statusOf(w,'fine').status,'published');
 assert.equal(w.control.read().catalog.companies.some(c=>c.id==='company-1'),false);assert.deepEqual(m.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'company-2'}]);
 const batch=setup();decision(batch,propose(batch,'edit',{...clone(fixture.catalog.companies[0]),name:'editada'}));stageMerge(batch,'m','company-1','company-2');
 publish(batch,'pub',s=>batch.c.preparePublish(s,batch.job));assert.equal(statusOf(batch,'edit').conflict,'merged-company');assert.equal(statusOf(batch,'m').status,'published');
});
test('merge que gera auto-relação descarta a Relação',()=>{
 const w=setup();stageMerge(w,'m','company-3','company-1');publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 assert.deepEqual(w.control.read().catalog.relations,[]);assert.deepEqual(w.control.read().companyMergedInto,[{fromCompanyId:'company-3',toCompanyId:'company-1'}]);
});
test('DESFAZER de merge: antes de publicar volta a pending; depois exige compensação',()=>{
 const w=setup(),staged=stageMerge(w,'m','company-1','company-2');const undone=decision(w,staged,'undo');assert.equal(undone.status,'pending');
 publish(w,'pub',s=>w.c.preparePublish(s,w.job));assert.deepEqual(w.control.read().companyMergedInto,[]);assert.equal(w.control.read().catalog.companies.length,3);
 decision(w,statusOf(w,'m'));publish(w,'pub2',s=>w.c.preparePublish(s,w.job));assert.equal(statusOf(w,'m').status,'published');
 assert.throws(()=>decision(w,statusOf(w,'m'),'undo'),/POST_PUBLICATION_COMPENSATION_REQUIRED/);
});
test('forma inválida de merge é recusada no propose; editApprove mantém id; CAS perdido não consome',()=>{
 const w=setup();
 for(const entity of [merge('same','company-1','company-1'),{...merge('extra','company-1','company-2'),extra:true},{...merge('bad','company-1','company-2'),schemaVersion:2},{...merge('refs','company-1','company-2'),sourceRefs:[]}])
  assert.throws(()=>propose(w,entity.id,entity,'merge'),TypeError);
 const p=propose(w,'m',merge('m','company-1','company-2'),'merge');assert.throws(()=>decision(w,p,'editApprove',merge('other','company-1','company-2')),/TARGET_ID_IMMUTABLE/);
 assert.throws(()=>decision(w,p,'editApprove',merge('m','company-2','company-2')),TypeError);
 decision(w,p,'editApprove',merge('m','company-2','company-1'));assert.equal(statusOf(w,'m').stagedEntity.fromCompanyId,'company-2');
 assert.equal([...w.c.read(w.owner).weeks.values()].reduce((a,b)=>a+b,0),0);
 const lease=w.snapshots.acquireLease('snapshot','bad',60000,w.job);
 assert.throws(()=>w.snapshots.publish({expectedRevision:'wrong',lease,models:fixture.models,news:fixture.news,lastSuccessAt:{catalog:fixture.now,models:fixture.now,news:fixture.now}},w.job,s=>{w.c.preparePublish(s,w.job);}),/CAS/);
 assert.equal(statusOf(w,'m').status,'staged');assert.deepEqual(w.control.read().companyMergedInto,[]);assert.equal(w.control.read().catalog.companies.length,3);
});
test('proposta de Empresa anterior ao merge publicado também fica em merged-company',()=>{
 const w=setup();const early=propose(w,'early',{...clone(fixture.catalog.companies[0]),name:'antes'});stageMerge(w,'m','company-1','company-2');publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 decision(w,early);publish(w,'pub2',s=>w.c.preparePublish(s,w.job));assert.equal(statusOf(w,'early').conflict,'merged-company');assert.equal(statusOf(w,'early').status,'staged');
});
test('revisão: merge em conflito não bloqueia edição da mesma Empresa no lote',()=>{
 const w=setup();stageMerge(w,'lab','company-1','company-3');decision(w,propose(w,'edit',{...clone(fixture.catalog.companies[0]),name:'editada'}));
 publish(w,'pub',s=>w.c.preparePublish(s,w.job));assert.equal(statusOf(w,'lab').conflict,'survivor-not-lab');
 assert.equal(statusOf(w,'edit').status,'published');assert.equal(w.control.read().catalog.companies.find(c=>c.id==='company-1').name,'editada');
});
test('revisão: Relação proposta para Empresa retirada no mesmo lote fica em missing-company e o lote publica',()=>{
 const w=setup();stageMerge(w,'m','company-1','company-2');
 decision(w,propose(w,'r',{...clone(fixture.catalog.relations[0]),id:'new-r',fromCompanyId:'company-3',toCompanyId:'company-1',type:'cloud-infrastructure'},'relation'));
 publish(w,'pub',s=>w.c.preparePublish(s,w.job));assert.equal(statusOf(w,'m').status,'published');assert.equal(statusOf(w,'r').conflict,'missing-company');
 assert.equal(w.control.read().catalog.relations.some(r=>r.id==='new-r'),false);
});
test('revisão: proposta de Relação anterior ao merge que reescreve o alvo fica em target-version-changed',()=>{
 const w=setup();const stale=propose(w,'stale',{...clone(fixture.catalog.relations[0]),sourceRefs:[{...clone(fixture.catalog.relations[0].sourceRefs[0]),source:'independent-fixture',sourceUrl:'https://example.invalid/stale-relation'}]},'relation');
 stageMerge(w,'m','company-1','company-2');publish(w,'pub',s=>w.c.preparePublish(s,w.job));
 decision(w,w.c.read(w.owner).proposals.get('stale'));publish(w,'pub2',s=>w.c.preparePublish(s,w.job));
 assert.equal(statusOf(w,'stale').conflict,'target-version-changed');assert.equal(statusOf(w,'stale').status,'staged');
 assert.equal(w.control.read().catalog.relations.find(r=>r.id==='relation-1').toCompanyId,'company-2');
});
test('revisão: merge que gera Relação repetida (mesmas pontas e tipo) mantém uma só',()=>{
 const w=setup();const rel=clone(fixture.catalog.relations[0]);
 decision(w,propose(w,'dup',{...rel,id:'relation-dup',toCompanyId:'company-2',sourceRefs:[{...clone(rel.sourceRefs[0]),source:'independent-fixture',sourceUrl:'https://example.invalid/dup'}]},'relation'));
 publish(w,'pub',s=>w.c.preparePublish(s,w.job));stageMerge(w,'m','company-1','company-2');publish(w,'pub2',s=>w.c.preparePublish(s,w.job));
 const edges=w.control.read().catalog.relations.filter(r=>r.fromCompanyId==='company-3'&&r.toCompanyId==='company-2'&&r.type===rel.type);
 // A Relação que já ligava as duas Empresas permanece; a reescrita repetida é descartada.
 assert.equal(edges.length,1);assert.equal(edges[0].id,'relation-dup');
});
