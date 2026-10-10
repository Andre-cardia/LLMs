import test from 'node:test';import assert from 'node:assert/strict';import {fixture} from './helpers/local-fixtures.mjs';import {clone} from '../src/contracts/primitives.mjs';import {releasePulse,modelTable} from '../src/domain/model-queries.mjs';import {globalSearch,resolveNavigation} from '../src/domain/global-search.mjs';
const query={schemaVersion:1,companyIds:[],inputModalities:[],outputModalities:[],openWeights:null,sortBy:'intelligence',direction:'desc',variantSelections:[]};
test('AA>HF>OR conserva data sem usar fetch; Pulso sete dias e movimento reduzido',()=>{
 const dates=fixture.models[0].releaseDates;const a=releasePulse(dates,{now:fixture.now});assert.equal(a.source,'artificialAnalysis');assert.equal(a.releaseAt,dates.artificialAnalysis);assert.ok(a.intensity>0);assert.equal(releasePulse(dates,{now:fixture.now,reducedMotion:true}).visual,'static');
 assert.equal(releasePulse({artificialAnalysis:null,huggingFace:fixture.now,openRouter:null},{now:fixture.now}).intensity,1);assert.equal(releasePulse({artificialAnalysis:'2026-10-03T12:00:00Z',huggingFace:null,openRouter:null},{now:fixture.now}).intensity,0);
 assert.equal(releasePulse({artificialAnalysis:'2026-10-11T00:00:00Z',huggingFace:fixture.now,openRouter:null},{now:fixture.now}).alert,'future-release-date');assert.equal(releasePulse({artificialAnalysis:'2026-02-30T00:00:00Z',huggingFace:null,openRouter:null},{now:fixture.now}).alert,'invalid-release-date');
});
test('filtros combinam por AND, família uma vez com variante e ausentes sempre no fim',()=>{
 for(const direction of ['asc','desc'])assert.equal(modelTable(fixture.models,{...query,direction}).at(-1).intelligence,null);
 assert.equal(modelTable(fixture.models,{...query,companyIds:['company-1'],inputModalities:['image'],openWeights:true}).length,1);
 const data=clone(fixture.models);const v=clone(data[0].variants[0]);v.variantId='second';v.pricing.variantId='second';v.intelligence=99;data[0].variants.push(v);const rows=modelTable(data,{...query,variantSelections:[{modelId:data[0].modelId,variantId:'second'}]});assert.equal(rows.length,4);assert.equal(rows[0].variantId,'second');assert.throws(()=>modelTable(data,{...query,variantSelections:[{modelId:data[0].modelId,variantId:'missing'}]}),/NOT_FOUND/);
});
test('custo/preço ordenam decimais exatos e ausente não é zero',()=>{
 const d=clone(fixture.models);d[0].variants[0].pricing.inputUsdPerMillion='9007199254740993';d[1].variants[0].pricing.inputUsdPerMillion='9007199254740992';
 assert.ok(modelTable(d,{...query,sortBy:'inputUsdPerMillion',direction:'asc'}).findIndex(r=>r.modelId===d[1].modelId)<modelTable(d,{...query,sortBy:'inputUsdPerMillion',direction:'asc'}).findIndex(r=>r.modelId===d[0].modelId));assert.equal(modelTable(d,{...query,sortBy:'standardCostUsd'}).at(-1).standardCost.status,'unavailable');
});
test('busca Empresa/Modelo/ticker/Notícia usa destinos tipados e não reabre oculto',()=>{
 assert.equal(globalSearch(fixture,'fake',{now:fixture.now}).some(r=>r.target.type==='ticker'),true);const results=globalSearch(fixture,fixture.news[0].titleOriginal,{now:fixture.now});const target=results.find(r=>r.target.type==='news').target;assert.equal(resolveNavigation(fixture,target,{now:fixture.now,hiddenNewsIds:['news-1']}).status,'unavailable');assert.equal(globalSearch(fixture,fixture.news[0].titleOriginal,{now:fixture.now,hiddenNewsIds:['news-1']}).some(r=>r.target.type==='news'),false);
 assert.equal(resolveNavigation(fixture,{schemaVersion:1,type:'company',companyId:'missing'},{now:fixture.now}).status,'unavailable');assert.throws(()=>resolveNavigation(fixture,{schemaVersion:1,type:'company',companyId:'company-1',command:'write'},{now:fixture.now}),TypeError);
});
test('linhas completas preservam fonte do preço, shape indisponível e último Lab elegível',async()=>{
 const {latestLabReleases}=await import('../src/domain/model-queries.mjs');const rows=modelTable(fixture.models,query),first=rows.find(r=>r.modelId===fixture.models[0].modelId);assert.equal(first.pricing.sourceUrl,fixture.models[0].variants[0].pricing.sourceUrl);assert.deepEqual(first.benchmarks,fixture.models[0].variants[0].benchmarks);assert.deepEqual(first.releaseDates,fixture.models[0].releaseDates);
 const d=clone(fixture.models);d[0].variants[0].pricing=null;const absent=modelTable(d,query).find(r=>r.modelId===d[0].modelId).standardCost;assert.equal(absent.currency,'USD');assert.deepEqual(absent.task,{inputTokens:2000,outputTokens:1000});assert.equal(absent.missingPrices.length,2);
 const lab=latestLabReleases(fixture.models,fixture.catalog.companies,{now:fixture.now}).find(l=>l.companyId==='company-2');assert.equal(lab.release.modelId,fixture.models[2].modelId);
 const {assertNavigationTarget}=await import('../src/contracts/navigation.mjs');let reads=0;const target={schemaVersion:1,companyId:'company-1',get type(){reads++;return 'company';}};assert.throws(()=>assertNavigationTarget(target),TypeError);assert.equal(reads,0);
});
