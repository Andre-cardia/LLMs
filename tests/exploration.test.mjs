import test from 'node:test';import assert from 'node:assert/strict';import {fixture} from './helpers/local-fixtures.mjs';import {clone} from '../src/contracts/primitives.mjs';import {createExploration,explorationReducer,DEFAULT_PREFERENCES} from '../src/domain/exploration-state.mjs';import {explorationQuery} from '../src/domain/exploration-url.mjs';
const start=(extra={})=>createExploration({data:fixture,revision:'one',now:fixture.now,availableViews:['3D','2D','MAPA','SAT'],...extra});const reduce=(s,i)=>explorationReducer(s,i).state;
test('defaults UX; URL somente sessão e ação explícita salva apenas seu campo',()=>{
 let s=start();assert.equal(s.preferences.tableStyle,'hybrid');assert.equal(s.preferences.readerLayout,'side');assert.equal(s.preferences.soundTyping,false);
 const result=explorationReducer(s,{type:'hydrateUrl',url:'?layers=cloud&view=SAT&tab=models&company=company-1&chat=secret'});s=result.state;assert.deepEqual(result.effects,[]);assert.deepEqual(s.preferences,DEFAULT_PREFERENCES);assert.equal(s.effectiveState.view,'SAT');assert.equal(explorationQuery(s).includes('secret'),false);
 const p=explorationReducer(s,{type:'preference',field:'theme',value:'ambar'});assert.deepEqual(p.effects,[{type:'persistPreferences',patch:{theme:'ambar'}}]);assert.deepEqual(p.state.preferences.layers,DEFAULT_PREFERENCES.layers);assert.deepEqual(p.state.effectiveState.layers,['cloud']);
});
test('URL inválida/duplicada saneada, Camadas todas desligadas e Vista indisponível rejeitada',()=>{
 let s=reduce(start(),{type:'hydrateUrl',url:'?layers=bogus&view=bogus&tab=models&tab=news&company=missing'});assert.deepEqual(s.effectiveState.layers,DEFAULT_PREFERENCES.layers);assert.equal(s.effectiveState.tab,'globe');assert.equal(s.effectiveState.companyId,null);
 s=reduce(s,{type:'hydrateUrl',url:'?layers='});assert.deepEqual(s.effectiveState.layers,[]);const limited=start({availableViews:['3D']});assert.throws(()=>reduce(limited,{type:'view',view:'SAT'}),TypeError);
});
test('Terminal fecha ao trocar aba; Leitor forçado não sobrescreve preferência e laterais exclusivas',()=>{
 let s=start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:'floating'}});s=reduce(s,{type:'company',companyId:'company-1'});assert.equal(s.terminal.companyId,'company-1');s=reduce(s,{type:'tab',tab:'news'});assert.equal(s.terminal,null);assert.equal(s.readerLayoutEffective,'side');assert.equal(s.preferences.readerLayout,'floating');
 s=reduce(s,{type:'openNews',newsId:'news-1'});s=reduce(s,{type:'panel',panel:'markets'});assert.equal(s.sidePanel,'markets');assert.equal(s.readerNewsId,null);s=reduce(s,{type:'openNews',newsId:'news-1'});assert.equal(s.sidePanel,'reader');
 s=reduce(s,{type:'escape'});assert.equal(s.readerTyping,false);assert.equal(s.sidePanel,'reader');s=reduce(s,{type:'escape'});assert.equal(s.sidePanel,null);
});
test('callbacks vencidos não restauram estado e reconciliação inteira remapeia/limpa IDs',()=>{
 let s=reduce(start(),{type:'company',companyId:'company-1'});const token=s.intentToken;s=reduce(s,{type:'company',companyId:'company-2'});assert.equal(reduce(s,{type:'callback',token,snapshotRevision:'one',target:'terminal'}),s);
 const data=clone(fixture);data.catalog.companies[0].id='replacement';for(const r of data.catalog.relations)if(r.toCompanyId==='company-1')r.toCompanyId='replacement';for(const m of data.models)if(m.companyId==='company-1')m.companyId='replacement';for(const n of data.news){n.relevantCompanyIds=n.relevantCompanyIds.map(id=>id==='company-1'?'replacement':id);n.citedCompanyIds=n.citedCompanyIds.map(id=>id==='company-1'?'replacement':id);}
 s=reduce(s,{type:'company',companyId:'company-1'});s=reduce(s,{type:'openNews',newsId:'news-1'});s=reduce(s,{type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:['news-1'],companyRemaps:[{fromCompanyId:'company-1',toCompanyId:'replacement'}]});assert.equal(s.effectiveState.companyId,'replacement');assert.equal(s.terminal.companyId,'replacement');assert.equal(s.readerNewsId,null);assert.equal(s.snapshotRevision,'two');
 const removed=reduce(s,{type:'advanceSnapshot',data:fixture,revision:'three',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});assert.equal(removed.effectiveState.companyId,null);assert.equal(removed.terminal,null);assert.equal(removed.warning,'company-unavailable');
});
test('destinos tipados exigem identidade completa; sem patches livres ou navegação de notícia oculta',()=>{
 const s=start({hiddenNewsIds:['news-1']});assert.throws(()=>reduce(s,{type:'navigate',target:{schemaVersion:1,type:'news',companyId:'company-1',newsId:'news-1'}}),/UNAVAILABLE/);assert.throws(()=>reduce(s,{type:'preference',field:'layers',value:['unknown']}),TypeError);assert.throws(()=>reduce(s,{type:'tab',tab:'models',command:'write'}),TypeError);
 const model=fixture.models[0];assert.equal(reduce(s,{type:'navigate',target:{schemaVersion:1,type:'model',companyId:model.companyId,modelId:model.modelId,variantId:model.variants[0].variantId}}).effectiveState.tab,'models');
});
test('URL reconcilia Terminal junto da seleção e operações independentes conservam callbacks',()=>{
 let s=reduce(start(),{type:'company',companyId:'company-1'});const token=s.terminal.token;s=reduce(s,{type:'preference',field:'theme',value:'ambar'});s=reduce(s,{type:'openNews',newsId:'news-1'});s=reduce(s,{type:'callback',token,snapshotRevision:'one',target:'terminal'});assert.equal(s.terminal.typing,false);
 s=reduce(s,{type:'hydrateUrl',url:'?company=company-2'});assert.equal(s.terminal.companyId,s.effectiveState.companyId);s=reduce(s,{type:'hydrateUrl',url:'?company=missing'});assert.equal(s.effectiveState.companyId,null);assert.equal(s.terminal,null);
});
test('Leitor flutuante coexiste com lateral, Modelo conserva variante e primeira visita segue modo injetado',()=>{
 let s=start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:'floating'}});s=reduce(s,{type:'openNews',newsId:'news-1'});s=reduce(s,{type:'panel',panel:'queue'});assert.equal(s.readerNewsId,'news-1');assert.equal(s.sidePanel,'queue');assert.equal(s.readerLayoutEffective,'floating');
 const m=fixture.models[0];s=reduce(s,{type:'navigate',target:{schemaVersion:1,type:'model',companyId:m.companyId,modelId:m.modelId,variantId:m.variants[0].variantId}});assert.equal(s.selectedModel.variantId,m.variants[0].variantId);
 const data=clone(fixture);data.models.shift();s=reduce(s,{type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});assert.equal(s.selectedModel,null);assert.equal(s.warning,'model-unavailable');
 assert.equal(start({systemMode:'light'}).preferences.mode,'light');assert.equal(start({systemMode:'light',preferences:DEFAULT_PREFERENCES}).preferences.mode,'dark');
});
