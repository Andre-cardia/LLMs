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
 const {SnapshotReader}=await import('../src/application/snapshot-reader.mjs');const {sha256Text}=await import('../src/adapters/memory-snapshots.mjs');const w=workspace();publish(w,'first');const old=w.snapshots.readManifest(w.owner);publish(w,'new');let calls=0,release;
 const reader=new SnapshotReader({readManifest:()=>++calls===1?new Promise(resolve=>{release=()=>resolve(old);}):w.snapshots.readManifest(w.owner),readSlice:(revision,slice)=>w.snapshots.readSlice(revision,slice,w.owner),digest:sha256Text});
 const delayed=reader.refresh();const fresh=await reader.refresh();release();assert.equal((await delayed).status,'superseded');assert.equal(reader.current.manifest.revision,fresh.snapshot.manifest.revision);assert.throws(()=>{reader.current.catalog.companies[0].name='mutated';},TypeError);
});
