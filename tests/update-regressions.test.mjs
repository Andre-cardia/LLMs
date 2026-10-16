import test from 'node:test';
import assert from 'node:assert/strict';
import { workspace, fixture, publish, source } from './helpers/local-fixtures.mjs';
import { clone } from '../src/contracts/primitives.mjs';
import { LocalUpdate } from '../src/application/local-update.mjs';
import { sourceStatus } from '../src/domain/freshness.mjs';
import { assertSnapshotData } from '../src/contracts/snapshot.mjs';
test('baselines separados por Fonte/escopo/schema conservam redução suspeita', async () => {
 const w=workspace(), u=new LocalUpdate(w); const run=(id,src,models)=>u.run({runId:id,modelsSourceId:src,scope:'all',fetchModels:()=>models,fetchNews:()=>[],context:w.job});
 await run('a1','A',fixture.models); await run('b1','B',fixture.models.slice(0,1));
 assert.equal((await run('a2','A',fixture.models.slice(0,1))).modelsOutcome,'below-half-baseline');
 assert.equal(w.control.read().modelCollections.size,2);assert.equal((await w.reader.refresh()).snapshot.models.length,4);
});
test('Fonte inválida não bloqueia outra válida, timeout também conserva último conjunto', async () => {
 const w=workspace(),u=new LocalUpdate({...w,attemptTimeoutMs:20}); const args={modelsSourceId:'A',scope:'all',context:w.job,fetchModels:()=>clone(fixture.models),fetchNews:()=>clone(fixture.news)};
 await u.run({...args,runId:'first'}); const bad=clone(fixture.models);bad[0].companyId='missing'; const news=clone(fixture.news);news[0].titleOriginal='Atualizado';
 assert.equal((await u.run({...args,runId:'second',fetchModels:()=>bad,fetchNews:()=>news})).modelsOutcome,'schema-invalid');
 assert.equal((await w.reader.refresh()).snapshot.news[0].titleOriginal,'Atualizado');
 const r=await u.run({...args,runId:'hung',fetchModels:()=>new Promise(()=>{})});assert.equal(r.modelsOutcome,'failed');assert.equal(r.newsOutcome,'incremental-valid');
});
test('curadoria assíncrona e lease vencido durante preparação nunca confirmam', () => {
 const w=workspace();assert.throws(()=>publish(w,'async',async state=>{state.catalog.companies[0].name='partial';await Promise.resolve();}),/ASYNC_CURATION/);
 assert.equal(w.control.read().snapshotRevision,null); assert.equal(w.control.read().catalog.companies[0].name,fixture.catalog.companies[0].name);
 w.setClock('2026-10-10T12:02:00Z');assert.throws(()=>publish(w,'expired',()=>w.setClock('2026-10-10T12:03:01Z')),/LEASE_EXPIRED/);assert.equal(w.control.read().snapshotRevision,null);
});
test('recibo faz parte da publicação atômica e replay dispensa fetch', async()=>{
 const w=workspace(),u=new LocalUpdate(w);const a={runId:'atomic',modelsSourceId:'A',scope:'all',context:w.job,fetchModels:()=>fixture.models,fetchNews:()=>fixture.news};
 const r=await u.run(a);assert.deepEqual(w.control.read().completedUpdates.get('atomic').result,r);
 assert.deepEqual(await u.run({...a,fetchModels:()=>{throw new Error('must not call');}}),r);
});
test('fechamento exige cotação da sessão e compara instantes; falha repetida precede timestamp futuro',()=>{
 const close='2026-10-09T20:00:00Z';const q=source({kind:'quotes',cadenceMs:900000,observedAtRequired:true,observedAt:close,lastSuccessAt:'2026-10-09T20:15:00Z',market:{calendarVerified:true,open:false,expectedCloseAt:close,currentCloseAt:'2026-10-09T20:00:00.000Z',postCloseCollected:true,nextDueAt:'2026-10-12T13:45:00Z'}});
 assert.equal(sourceStatus(q,fixture.now).status,'LIVE');assert.equal(sourceStatus({...q,observedAt:'2020-01-01T00:00:00Z'},fixture.now).status,'ATRASADO');
 assert.equal(sourceStatus(source({consecutiveFailures:3,lastSuccessAt:'2026-10-10T09:00:00Z',observedAt:'2026-10-10T12:05:01Z'}),fixture.now).status,'OFFLINE');
 const bad=clone(fixture);bad.models[0].companyId='company-3';assert.throws(()=>assertSnapshotData(bad),/Empresa ausente/);
});
test('leitor descarta revisão completa cujo refresh termina depois de uma intenção nova',async()=>{
 const {SnapshotReader}=await import('../src/application/snapshot-reader.mjs');const {sha256Text}=await import('../src/adapters/memory-snapshots.mjs');const w=workspace();publish(w,'first');const old=w.snapshots.readManifestResponse(w.owner);publish(w,'new');let calls=0,release;
 const reader=new SnapshotReader({readManifest:()=>++calls===1?new Promise(resolve=>{release=()=>resolve(old);}):w.snapshots.readManifestResponse(w.owner),readSlice:(revision,slice)=>w.snapshots.readSlice(revision,slice,w.owner),digest:sha256Text});
 const delayed=reader.refresh();const fresh=await reader.refresh();release();assert.equal((await delayed).status,'superseded');assert.equal(reader.current.manifest.revision,fresh.snapshot.manifest.revision);assert.throws(()=>{reader.current.catalog.companies[0].name='mutated';},TypeError);
});

// MergeDecision publicada pela Fila: Fontes que ainda mandam o ID retirado não bloqueiam a Atualização.
async function mergeWork(){
 const {MemoryCuration}=await import('../src/adapters/memory-curation.mjs');const {MemoryNews}=await import('../src/adapters/memory-news.mjs');
 const w=workspace();const c=new MemoryCuration({...w,authorizeOwner:x=>x===w.owner,authorizePropose:x=>x===w.agent,authorizePublish:x=>x===w.job});
 const n=new MemoryNews({...w,authorizeOwner:x=>x===w.owner,authorizeIngest:x=>x===w.job});
 const stage=(id,from,to)=>{const entity={schemaVersion:1,id,fromCompanyId:from,toCompanyId:to,sourceRefs:[{...clone(fixture.catalog.companies[0].sourceRefs[0]),sourceRecordId:id,sourceUrl:`https://example.invalid/${id}`}]};
  const p=c.propose({schemaVersion:1,proposalId:id,kind:'merge',entity,factKey:id},w.agent);
  return c.decide({schemaVersion:1,proposalId:id,expectedProposalVersion:p.version,action:'approve',editedEntity:null,idempotencyKey:`${id}-approve`},w.owner);};
 const u=new LocalUpdate(w);const args={modelsSourceId:'A',scope:'all',context:w.job,fetchModels:()=>clone(fixture.models),fetchNews:()=>clone(fixture.news),prepareCuration:s=>c.preparePublish(s,w.job),reconcileNews:(s,items)=>n.ingest(s,items,w.job)};
 return {w,c,n,u,args,stage};
}
test('merge publicado: Fonte que ainda manda A publica com C, sem schema-invalid', async()=>{
 const {w,c,u,args,stage}=await mergeWork();await u.run({...args,runId:'before'});stage('m','company-1','company-2');
 const merged=await u.run({...args,runId:'merge'});assert.equal(merged.modelsOutcome,'valid-full');assert.equal(merged.newsOutcome,'incremental-valid');
 assert.deepEqual(merged.manifest.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'company-2'}]);assert.equal(c.read(w.owner).proposals.get('m').status,'published');
 const again=await u.run({...args,runId:'after'});assert.equal(again.modelsOutcome,'valid-full');assert.equal(again.newsOutcome,'incremental-valid');
 const snap=(await w.reader.refresh()).snapshot;assert.equal(snap.manifest.revision,again.manifest.revision);
 assert.equal(snap.models.every(m=>m.companyId==='company-2'),true);assert.equal(snap.models.length,4);
 assert.equal(snap.news.some(item=>[...item.relevantCompanyIds,...item.citedCompanyIds].includes('company-1')),false);
 assert.deepEqual(snap.news.find(item=>item.newsId==='news-1').relevantCompanyIds,['company-2']);
 // A falha de uma Fonte preserva a base anterior, também reescrita.
 const failed=await u.run({...args,runId:'failed',fetchModels:()=>{throw new Error('down');},fetchNews:()=>{throw new Error('down');}});
 assert.equal(failed.modelsOutcome,'failed');assert.equal((await w.reader.refresh()).snapshot.models.every(m=>m.companyId==='company-2'),true);
});
test('conflito de merge não impede as demais propostas nem as slices de Modelos e Notícias', async()=>{
 const {w,c,u,args,stage}=await mergeWork();stage('lab','company-1','company-3');
 const news=clone(fixture.news);news[0].titleOriginal='Atualizado';const models=clone(fixture.models);models[0].name='Modelo atualizado';
 const r=await u.run({...args,runId:'conflict',fetchModels:()=>models,fetchNews:()=>news});
 assert.equal(r.modelsOutcome,'valid-full');assert.equal(r.newsOutcome,'incremental-valid');assert.deepEqual(r.manifest.companyMergedInto,[]);
 assert.equal(c.read(w.owner).proposals.get('lab').conflict,'survivor-not-lab');
 const snap=(await w.reader.refresh()).snapshot;assert.equal(snap.models[0].name,'Modelo atualizado');assert.equal(snap.news[0].titleOriginal,'Atualizado');
});
test('critério: merge A→C pela Fila é seguido de SnapshotReader a LocalSearch.select sem tocar a tabela', async()=>{
 const {LocalNewsView}=await import('../src/application/local-news-view.mjs');const {LocalSearch}=await import('../src/application/local-search.mjs');
 const {createExploration,explorationReducer}=await import('../src/domain/exploration-state.mjs');
 const {w,n,u,args,stage}=await mergeWork();const first=await u.run({...args,runId:'r1'});
 const view=new LocalNewsView({readSnapshot:async()=>(await w.reader.refresh()).snapshot,readFeedback:()=>n.read(w.owner),resolveAlias:id=>n.resolve(id,w.owner),clock:w.clock});
 const loaded=await w.reader.refresh();let state=createExploration({data:loaded.snapshot,revision:first.manifest.revision,now:fixture.now,config:{schemaVersion:2,initialBase:'MAPA',availableBases:['MAPA','SAT']}});
 const store={getState:()=>state,dispatch(intent){const result=explorationReducer(state,intent);state=result.state;return result;}};
 const search=new LocalSearch({view,store});const stale=(await search.search('Laboratório fictício A')).results.find(r=>r.target.type==='company');
 assert.equal((await search.select(stale)).status,'available');assert.equal(state.effectiveState.companyId,'company-1');
 stage('m','company-1','company-2');const merged=await u.run({...args,runId:'r2'});assert.deepEqual(merged.manifest.companyMergedInto,[{fromCompanyId:'company-1',toCompanyId:'company-2'}]);
 assert.equal(state.snapshotRevision,first.manifest.revision);
 await search.select(stale);assert.equal(state.snapshotRevision,merged.manifest.revision);assert.equal(state.effectiveState.companyId,'company-2');assert.equal(state.warning,null);
});
test('revisão: coleção guardada de outra Fonte, anterior ao merge, também é reescrita', async()=>{
 const {w,u,args,stage}=await mergeWork();await u.run({...args,runId:'b',modelsSourceId:'B'});stage('m','company-1','company-2');
 const r=await u.run({...args,runId:'a'});assert.equal(r.modelsOutcome,'valid-full');
 const snap=(await w.reader.refresh()).snapshot;assert.equal(snap.models.every(m=>m.companyId==='company-2'),true);
});
test('revisão: feedback de Notícia mesclada usa a Empresa sobrevivente', async()=>{
 const {w,n,u,args,stage}=await mergeWork();await u.run({...args,runId:'before'});stage('m','company-1','company-2');await u.run({...args,runId:'merge'});
 const item=n.read(w.owner).items.find(i=>i.newsId==='news-1');assert.deepEqual(item.relevantCompanyIds,['company-2']);
 assert.equal([...item.relevantCompanyIds,...item.citedCompanyIds].includes('company-1'),false);
 const result=n.feedback({schemaVersion:1,newsId:'news-1',companyId:'company-2',expectedFeedbackRevision:n.read(w.owner).feedbackRevision,irrelevant:true,confirmed:true,idempotencyKey:'fb'},w.owner);
 assert.ok(result);
});
