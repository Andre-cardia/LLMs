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
