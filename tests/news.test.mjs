import test from 'node:test';import assert from 'node:assert/strict';import { workspace,fixture } from './helpers/local-fixtures.mjs';import { clone } from '../src/contracts/primitives.mjs';import { MemoryNews } from '../src/adapters/memory-news.mjs';import { visibleNews,newsProjection,NEWS_SURFACES } from '../src/domain/news-projections.mjs';import { LocalUpdate } from '../src/application/local-update.mjs';
function setup(){const w=workspace();const n=new MemoryNews({...w,authorizeOwner:c=>c===w.owner,authorizeIngest:c=>c===w.job});return {...w,n};}
function ingest(w,items){w.control.transact(s=>{w.n.ingest(s,items,w.job);});}
function feedback(w,extra={}){return w.n.feedback({schemaVersion:1,newsId:'news-1',companyId:'company-1',expectedFeedbackRevision:0,irrelevant:true,confirmed:true,idempotencyKey:'hide',...extra},w.owner);}
test('citada não vira relevante; futuro/duas semanas/limites e supressão precedem seleção',()=>{
 const rows=visibleNews(fixture.news,{now:fixture.now,companyId:'company-1'});assert.deepEqual(rows.map(n=>n.newsId),['news-1']);
 const items=Array.from({length:20},(_,i)=>({...clone(fixture.news[0]),newsId:`n${i}`,publishedAt:new Date(Date.parse(fixture.now)-i*1000).toISOString()}));
 assert.equal(newsProjection(items,{surface:'terminal',companyId:'company-1',now:fixture.now}).length,5);assert.equal(newsProjection(items,{surface:'flux',now:fixture.now}).length,5);assert.equal(newsProjection(items,{surface:'labs',labCompanyIds:['company-1'],now:fixture.now}).length,3);
 const future={...items[0],newsId:'future',publishedAt:'2026-10-11T00:00:00Z'};assert.equal(visibleNews([future,...items],{now:fixture.now,hiddenNewsIds:['n0']})[0].newsId,'n1');
});
test('cancelamento não grava; feedback do dono é versionado/privado e todas cinco superfícies ocultam',()=>{
 const w=setup();ingest(w,fixture.news);assert.equal(feedback(w,{confirmed:false}).changed,false);assert.equal(w.n.read(w.owner).feedbackRevision,0);assert.throws(()=>w.n.read(w.agent),/FORBIDDEN/);
 feedback(w);const data=w.n.read(w.owner);for(const surface of NEWS_SURFACES)assert.equal(newsProjection(data.items,{surface,now:fixture.now,companyId:'company-1',selectedNewsId:'news-1',labCompanyIds:['company-1'],hiddenNewsIds:data.hiddenNewsIds}).length,0);assert.equal(w.n.resolve('news-1',w.owner),null);assert.equal(feedback(w).feedbackRevision,1);assert.throws(()=>feedback(w,{idempotencyKey:'other'}),/REVISION_CONFLICT/);
});
test('alias/merge conserva identidade e supressão; título parecido não agrupa',()=>{
 const w=setup();ingest(w,fixture.news);feedback(w);const same={...clone(fixture.news[0]),newsId:'reappeared',originalUrl:fixture.news[0].originalUrl+'#fragment'};same.sourceRefs[0].sourceUrl=same.originalUrl;ingest(w,[same]);assert.equal(w.n.resolve('reappeared',w.owner),null);assert.equal(w.n.read(w.owner).items.length,3);
 const distinct={...clone(fixture.news[0]),newsId:'distinct',originalUrl:'https://example.invalid/distinct',sourceRefs:[{...fixture.news[0].sourceRefs[0],sourceRecordId:'distinct',sourceUrl:'https://example.invalid/distinct'}]};ingest(w,[distinct]);assert.notEqual(w.n.resolve('distinct',w.owner),null);
 const bridge=clone(distinct);bridge.sourceRefs.push(clone(fixture.news[0].sourceRefs[0]));ingest(w,[bridge]);assert.equal(w.n.resolve('distinct',w.owner),null);assert.equal(w.n.read(w.owner).items.length,3);
});
test('ingestão no Update e feedback não é apagado pelo próximo snapshot',async()=>{
 const w=setup(),u=new LocalUpdate(w);const args={modelsSourceId:'fake',scope:'all',context:w.job,fetchModels:()=>fixture.models,fetchNews:()=>fixture.news,reconcileNews:(state,items)=>w.n.ingest(state,items,w.job)};
 await u.run({...args,runId:'first'});feedback(w);await u.run({...args,runId:'second'});assert.equal(w.n.resolve('news-1',w.owner),null);assert.equal(w.n.read(w.owner).feedbackRevision,1);
});
test('cinco por Empresa no Fluxo/NOTÍCIAS, três por Lab e composto não revela oculto via snapshot/alias',async()=>{
 const {LocalNewsView}=await import('../src/application/local-news-view.mjs');const items=[];for(let c=1;c<=3;c++)for(let i=0;i<6;i++)items.push({...clone(fixture.news[0]),newsId:`c${c}-n${i}`,relevantCompanyIds:[`company-${c}`],publishedAt:new Date(Date.parse(fixture.now)-i*1000-c).toISOString()});
 assert.equal(newsProjection(items,{surface:'flux',now:fixture.now}).length,14);assert.equal(newsProjection(items,{surface:'news',now:fixture.now}).length,15);assert.equal(newsProjection(items,{surface:'labs',labCompanyIds:['company-1','company-2'],now:fixture.now}).length,6);
 const w=setup(),u=new LocalUpdate(w),a={modelsSourceId:'fake',scope:'all',context:w.job,fetchModels:()=>fixture.models,fetchNews:()=>fixture.news,reconcileNews:(s,items)=>w.n.ingest(s,items,w.job)};await u.run({...a,runId:'one'});
 const view=new LocalNewsView({readSnapshot:async()=>(await w.reader.refresh()).snapshot,readFeedback:()=>w.n.read(w.owner),resolveAlias:id=>w.n.resolve(id,w.owner),clock:w.clock});
 const alias={...clone(fixture.news[0]),newsId:'alias'};await u.run({...a,runId:'alias-update',fetchNews:()=>[alias]});assert.equal((await view.project({surface:'reader',selectedNewsId:'alias'})).items[0].newsId,'news-1');
 feedback(w);await u.run({...a,runId:'refresh'});for(const surface of NEWS_SURFACES)assert.equal((await view.project({surface,companyId:'company-1',selectedNewsId:'alias',labCompanyIds:['company-1']})).items.length,0);
 assert.equal((await view.context()).news.some(n=>n.newsId==='news-1'),false);assert.equal((await view.navigate({schemaVersion:1,type:'news',companyId:'company-1',newsId:'alias'})).status,'unavailable');
});
