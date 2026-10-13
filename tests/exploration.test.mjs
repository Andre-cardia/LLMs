import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {fixture} from './helpers/local-fixtures.mjs';import {clone} from '../src/contracts/primitives.mjs';import {createExploration,explorationReducer as dispatch,DEFAULT_PREFERENCES} from '../src/domain/exploration-state.mjs';import {explorationQuery,parseExplorationUrl} from '../src/domain/exploration-url.mjs';
import {assertExplorationState,assertExplorationConfig,assertExplorationIntent,assertExplorationSnapshot,assertPreferences,assertPreference} from '../src/contracts/exploration.mjs';
const cases=JSON.parse(readFileSync(new URL('./fixtures/exploration-contract.json',import.meta.url),'utf8'));
const start=(extra={})=>createExploration({data:fixture,revision:'one',now:fixture.now,config:cases.config,...extra});
const explorationReducer=(s,i)=>dispatch(s,{schemaVersion:2,...i});const reduce=(s,i)=>explorationReducer(s,i).state;

test('review: query vazia é válida no parser e na hidratação', () => {
 const state=start();
 assert.deepEqual(parseExplorationUrl('',{companyIds:state.index.companyIds,config:cases.config}),{});
 const result=explorationReducer(state,{type:'hydrateUrl',url:''});
 assert.deepEqual(result.state.effectiveState,state.effectiveState);assert.deepEqual(result.effects,[]);
});
test('review: payload profundamente aninhado é rejeitado sem estouro de stack ou mutação', () => {
 let nested={};for(let i=0;i<10000;i++)nested={nested};
 const state=start(),before=clone(state);
 assert.throws(()=>explorationReducer(state,{type:'base',base:'SAT',extra:nested}),{name:'TypeError'});
 assert.deepEqual(state,before);
});
test('review: câmera fora do Globo é recusada sem mudar contexto', () => {
 for(const tab of ['models','news']){
  const state=reduce(start(),{type:'tab',tab}),before=clone(state);
  assert.throws(()=>explorationReducer(state,{type:'camera',companyId:'company-1'}),/CAMERA_UNAVAILABLE/);
  assert.deepEqual(state,before);
 }
});
test('review: lote de remaps é atômico e aceita merge many-to-one explícito', () => {
 const state=reduce(start(),{type:'company',companyId:'company-1'}),before=clone(state),data=clone(fixture);
 data.catalog.companies=[{...data.catalog.companies[0],id:'merged'}];data.catalog.relations=[];data.models=[];data.news=[];
 const action={type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[{fromCompanyId:'company-1',toCompanyId:'merged'},{fromCompanyId:'missing',toCompanyId:'merged'}]};
 assert.throws(()=>explorationReducer(state,action),/INVALID_REMAP/);assert.deepEqual(state,before);
 action.companyRemaps[1].fromCompanyId='company-2';const result=explorationReducer(state,action);
 assert.equal(result.state.effectiveState.companyId,'merged');assert.equal(result.state.terminal.companyId,'merged');assert.deepEqual(result.effects,[]);assert.deepEqual(state,before);
});
test('review: fixture literal independente atravessa contrato, reducer e URL', () => {
 const state=cases.validState,before=clone(state);
 assert.equal(assertExplorationState(state),state);
 assert.equal(explorationQuery(state),'?layers=cloud&base=SAT&tab=globe&company=literal-company');
 const result=explorationReducer(state,{type:'base',base:'MAPA'});
 assert.equal(result.state.effectiveState.base,'MAPA');assert.deepEqual(result.state.terminal,state.terminal);assert.deepEqual(result.state.cameraOperation,state.cameraOperation);assert.deepEqual(result.effects,[]);
 assert.equal(reduce(result.state,{type:'callback',target:'camera',token:3,snapshotRevision:'literal-revision'}).cameraOperation.status,'completed');assert.deepEqual(state,before);
});

function invalidAtBoundaries(state) {
  assert.throws(() => assertExplorationState(state), TypeError);
  assert.throws(() => explorationQuery(state), TypeError);
  assert.throws(() => reduce(state, {type:'base',base:'SAT'}), TypeError);
}
function modelTarget() {
  const m = fixture.models[0];
  return {schemaVersion:1,type:'model',companyId:m.companyId,modelId:m.modelId,variantId:m.variants[0].variantId};
}
test('AC3/AC6: fixtures de estados incompatíveis são recusadas por contrato, reducer e serializador', () => {
  for (const {path,value} of cases.invalidStateMutations) {
    const state = clone(start());
    let target = state;
    for (const key of path.slice(0,-1)) target = target[key];
    target[path.at(-1)] = clone(value);
    invalidAtBoundaries(state);
  }
  const populated = reduce(reduce(reduce(start(), {type:'company',companyId:'company-1'}), {type:'openNews',newsId:'news-1'}), {type:'camera',companyId:'company-1'});
  const invalid = [
    s => s.terminal.token = -1,
    s => s.terminal.token = s.intentToken + 1,
    s => s.terminal.companyId = 'company-2',
    s => s.terminal.typing = null,
    s => s.readerToken = 0,
    s => s.readerToken = s.intentToken + 1,
    s => s.readerNewsId = 'missing',
    s => s.sidePanel = 'queue',
    s => s.cameraOperation.status = 'other',
    s => s.cameraOperation.snapshotRevision = 'old',
    s => s.cameraOperation.companyId = 'missing',
    s => s.cameraOperation.token = s.intentToken + 1,
    s => s.cameraOperation.token = 0,
    s => s.sessionOverrides.companyId = 'company-2',
    s => s.effectiveState.layers = [],
    s => s.index.modelTargets.push(clone(s.index.modelTargets[0])),
    s => s.index.newsTargets.push(clone(s.index.newsTargets[0])),
    s => s.index.tickers.push(clone(s.index.tickers[0])),
    s => {s.sessionState.tab = 'models'; s.effectiveState.tab = 'models';},
    s => {s.sessionState.companyId = null; s.effectiveState.companyId = null;}
  ];
  for (const mutate of invalid) { const state = clone(populated); mutate(state); invalidAtBoundaries(state); }
  const model = reduce(start(), {type:'navigate',target:modelTarget()});
  for (const mutate of [s => s.selectedModel.variantId = 'missing', s => s.selectedModel.companyId = 'company-2', s => {s.sessionState.companyId=null;s.effectiveState.companyId=null;}]) {
    const state = clone(model); mutate(state); invalidAtBoundaries(state);
  }
  // Cada campo operacional é obrigatório, inclusive os explicitamente nulos.
  for (const [path, object] of [[[],populated],[['terminal'],populated.terminal],[['cameraOperation'],populated.cameraOperation],[['index'],populated.index],[['sessionState'],populated.sessionState],[['effectiveState'],populated.effectiveState]]) {
    for (const key of Object.keys(object)) {
      const state = clone(populated); let target = state;
      for (const part of path) target = target[part];
      delete target[key]; invalidAtBoundaries(state);
    }
  }
  assert.equal(assertExplorationState(populated), populated);
  assert.equal(assertExplorationState(model), model);
});
test('AC6: arrays com protótipos/getters próprios ou herdados nunca executam conteúdo nas fronteiras', () => {
  let calls = 0;
  const getter = () => { calls++; throw new Error('getter executado'); };
  const factories = [
    values => { const a=[...values]; const p=Object.create(Array.prototype); Object.defineProperty(p,Symbol.iterator,{get:getter}); return Object.setPrototypeOf(a,p); },
    values => { const a=[...values]; const p=Object.create(Array.prototype); Object.defineProperty(p,'0',{get:getter}); delete a[0]; return Object.setPrototypeOf(a,p); },
    values => Object.defineProperty([...values],'0',{enumerable:true,get:getter}),
    values => Object.defineProperty([...values],Symbol.iterator,{get:getter}),
    values => Object.defineProperty([...values],'includes',{get:getter}),
    values => Object.setPrototypeOf([...values],null)
  ];
  const valid = start();
  for (const make of factories) {
    const config = {...cases.config,availableBases:make(['MAPA','SAT'])};
    for (const run of [() => assertExplorationConfig(config), () => start({config}), () => parseExplorationUrl('?base=SAT',{companyIds:[],config})]) assert.throws(run, TypeError);
    for (const field of ['layers','favorites']) {
      const value = make([field === 'layers' ? 'cloud' : 'company-1']);
      const preferences = {...clone(DEFAULT_PREFERENCES),[field]:value};
      const intent = {schemaVersion:2,type:'preference',field,value};
      for (const run of [() => assertPreference(field,value), () => assertPreferences(preferences), () => start({preferences}), () => assertExplorationIntent(intent), () => dispatch(valid,intent)]) assert.throws(run,TypeError);
    }
    const data = clone(fixture); data.catalog.companies = make(data.catalog.companies);
    const intent = {schemaVersion:2,type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]};
    for (const run of [() => assertExplorationSnapshot(data), () => start({data}), () => dispatch(valid,intent)]) assert.throws(run,TypeError);
    assert.throws(() => start({hiddenNewsIds:make(['news-1'])}),TypeError);
    assert.throws(() => parseExplorationUrl('?company=company-1',{companyIds:make(['company-1']),config:cases.config}),TypeError);
    const state = clone(valid); state.index.companyIds = make(state.index.companyIds); invalidAtBoundaries(state);
  }
  const state = clone(valid); Object.defineProperty(state,'intentToken',{enumerable:true,get:getter}); invalidAtBoundaries(state);
  assert.equal(calls,0);
  assert.deepEqual(valid,start());
});
test('AC6: opcionais omitidos/undefined conservam defaults, mas seus accessors são recusados', () => {
  const defaults = start(); let calls = 0;
  for (const field of ['hiddenNewsIds','preferences','systemMode']) {
    assert.deepEqual(start({[field]:undefined}),defaults);
    const options = {data:fixture,revision:'one',now:fixture.now,config:cases.config};
    Object.defineProperty(options,field,{enumerable:true,get(){calls++;return undefined;}});
    assert.throws(() => createExploration(options),TypeError);
  }
  assert.deepEqual(start({hiddenNewsIds:undefined,preferences:undefined,systemMode:undefined}),defaults);
  assert.throws(() => start({config:undefined}),TypeError);
  assert.equal(calls,0);
});
test('AC4/AC6: limite do contador nunca produz token inseguro; callback não incrementa', () => {
  const almost = clone(start()); almost.intentToken = Number.MAX_SAFE_INTEGER - 1;
  const result = explorationReducer(almost,{type:'camera',companyId:'company-1'});
  assert.equal(result.state.intentToken,Number.MAX_SAFE_INTEGER);
  assert.equal(result.effects[0].token,Number.MAX_SAFE_INTEGER);
  const state = result.state;
  for (const intent of [{type:'escape'},{type:'base',base:'SAT'},{type:'company',companyId:'company-1'}]) assert.throws(() => explorationReducer(state,intent),/contador esgotado/);
  const callback = {type:'callback',target:'camera',token:state.intentToken,snapshotRevision:'one'};
  const done = reduce(state,callback);
  assert.equal(done.cameraOperation.status,'completed'); assert.equal(done.intentToken,state.intentToken);
  assert.equal(reduce(done,callback),done);
  assert.doesNotThrow(() => explorationQuery(done));
});
test('AC4: tab fora do Globo, URL e navigate invalidam câmera; retorno tardio conserva referência e efeitos vazios', () => {
  for (const action of [{type:'tab',tab:'models'},{type:'tab',tab:'news'},{type:'hydrateUrl',url:'?company=company-1'},{type:'navigate',target:modelTarget()},{type:'navigate',target:{schemaVersion:1,type:'company',companyId:'company-1'}}]) {
    let state = reduce(reduce(start(),{type:'company',companyId:'company-1'}),{type:'camera',companyId:'company-1'});
    const callback = {type:'callback',target:'camera',token:state.cameraOperation.token,snapshotRevision:'one'};
    state = reduce(state,action); assert.equal(state.cameraOperation,null);
    const result = explorationReducer(state,callback);
    assert.equal(result.state,state); assert.deepEqual(result.effects,[]);
  }
});
test('AC4: limpar Empresa limpa Modelo dependente; seleção de sessão encoberta também reconcilia', () => {
  const model = reduce(start(),{type:'navigate',target:modelTarget()});
  const state = reduce(model,{type:'company',companyId:null});
  assert.equal(state.selectedModel,null); assert.equal(state.effectiveState.companyId,null);
  assert.doesNotThrow(() => explorationQuery(state));
  let hidden = reduce(reduce(start(),{type:'company',companyId:'company-1'}),{type:'hydrateUrl',url:'?company=company-2'});
  const data = clone(fixture); data.catalog.companies = data.catalog.companies.filter(c => c.id !== 'company-1');
  data.catalog.relations = data.catalog.relations.filter(r => r.fromCompanyId !== 'company-1' && r.toCompanyId !== 'company-1');
  data.models = data.models.filter(m => m.companyId !== 'company-1'); data.news = [];
  hidden = reduce(hidden,{type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});
  assert.equal(hidden.sessionState.companyId,'company-2'); assert.equal(hidden.effectiveState.companyId,'company-2');
  assert.doesNotThrow(() => explorationQuery(hidden));
});
test('AC1 ampliado: duas bases preservam Modelo, Leitor lateral/flutuante, Fila/MERCADOS e todos os tokens', () => {
  const dataBefore = clone(fixture);
  for (const layout of ['side','floating']) for (const panel of [null,'queue','markets']) {
    let state = reduce(start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:layout}}),{type:'navigate',target:modelTarget()});
    state = reduce(state,{type:'tab',tab:'globe'});
    state = reduce(state,{type:'preference',field:'layers',value:['cloud']});
    state = reduce(state,{type:'camera',companyId:'company-1'});
    state = reduce(state,{type:'openNews',newsId:'news-1'});
    if (panel) state = reduce(state,{type:'panel',panel});
    const before = clone(state);
    assert.notEqual(state.selectedModel,null);
    for (const base of ['SAT','MAPA']) {
      const result = explorationReducer(state,{type:'base',base}); state = result.state;
      assert.deepEqual(result.effects,[]); assert.equal(state.effectiveState.projection,'3D'); assert.equal(state.effectiveState.base,base);
      for (const key of ['selectedModel','terminal','readerNewsId','readerTyping','readerToken','sidePanel','readerLayoutEffective','cameraOperation','index','preferences']) assert.deepEqual(state[key],before[key]);
      assert.deepEqual(state.effectiveState.layers,['cloud']); assert.equal(state.effectiveState.companyId,before.effectiveState.companyId);
    }
    const callback = {type:'callback',target:'camera',token:state.cameraOperation.token,snapshotRevision:'one'};
    state = reduce(state,callback); assert.equal(state.cameraOperation.status,'completed');
    if (state.readerNewsId) {state=reduce(state,{type:'callback',target:'reader',token:state.readerToken,snapshotRevision:'one'});assert.equal(state.readerTyping,false);}
  }
  // Terminal coexistindo com laterais e Leitor: ambas as trocas preservam a operação ativa.
  for (const layout of ['side','floating']) for (const panel of [null,'queue','markets']) {
    let state=reduce(start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:layout}}),{type:'company',companyId:'company-1'});
    state=reduce(state,{type:'openNews',newsId:'news-1'}); if(panel) state=reduce(state,{type:'panel',panel});
    const before=clone(state);
    for(const base of ['SAT','MAPA']) {
      const result=explorationReducer(state,{type:'base',base});state=result.state;assert.deepEqual(result.effects,[]);
      for(const key of ['terminal','readerNewsId','readerToken','readerTyping','sidePanel'])assert.deepEqual(state[key],before[key]);
    }
    state=reduce(state,{type:'callback',target:'terminal',token:state.terminal.token,snapshotRevision:'one'});assert.equal(state.terminal.typing,false);
  }
  assert.deepEqual(fixture,dataBefore);
});

test('AC1: alternar bases preserva 3D, contexto, Terminal e operação de câmera, sem efeitos',()=>{
 let s=reduce(start(),{type:'hydrateUrl',url:'?base=SAT&company=company-1&layers=cloud'});
 s=reduce(s,{type:'camera',companyId:'company-1'});const before=clone(s),dataBefore=clone(fixture);
 for(const base of ['MAPA','SAT']){
  const result=explorationReducer(s,{type:'base',base});s=result.state;
  assert.deepEqual(result.effects,[]);assert.equal(s.effectiveState.projection,'3D');assert.equal(s.effectiveState.base,base);
  for(const key of ['preferences','terminal','cameraOperation','index','selectedModel'])assert.deepEqual(s[key],before[key]);
  assert.equal(s.effectiveState.companyId,'company-1');assert.deepEqual(s.effectiveState.layers,['cloud']);assert.equal(s.effectiveState.tab,'globe');
  assert.equal(Object.hasOwn(s.sessionOverrides,'base'),false);assert.equal(Object.hasOwn(s.effectiveState,'view'),false);
 }
 assert.deepEqual(fixture,dataBefore);assert.deepEqual(before.index,s.index);
});
test('AC2: cada edição persiste somente seu campo e remove apenas o override correspondente',()=>{
 const initial=reduce(start(),{type:'hydrateUrl',url:'?base=SAT&layers=cloud&company=company-1'});
 const values={theme:'osiris',mode:'dark',readerLayout:'floating',tableStyle:'hybrid',leftTab:'labs',feedLabsOnly:true,soundTyping:true,soundAmbient:true,layers:[],favorites:['company-1']};
 for(const [field,value] of Object.entries(values)){
  const {state,effects}=explorationReducer(initial,{type:'preference',field,value});
  assert.deepEqual(effects,[{type:'persistPreferences',patch:{[field]:value}}]);
  assert.deepEqual(state.preferences,{...initial.preferences,[field]:value});
  assert.equal(state.effectiveState.base,'SAT');assert.equal(state.effectiveState.companyId,'company-1');
  assert.deepEqual(state.effectiveState.layers,field==='layers'?[]:['cloud']);
 }
 assert.equal(start().preferences.theme,'artificial-analysis');assert.equal(start().preferences.mode,'light');
});
test('AC3: configuração obrigatória e fixtures comuns atravessam contrato, store e URL',()=>{
 const options={data:fixture,revision:'one',now:fixture.now};assert.throws(()=>createExploration(options),TypeError);
 for(const config of cases.invalidConfigs){assert.throws(()=>createExploration({...options,config}),TypeError);assert.throws(()=>parseExplorationUrl('?base=SAT',{companyIds:[],config}),TypeError);}
 for(const config of cases.validConfigs){const s=start({config});assert.equal(s.effectiveState.base,config.initialBase);assert.equal(s.effectiveState.projection,'3D');}
 for(const intent of cases.validIntents)assert.doesNotThrow(()=>dispatch(start(),intent));
 for(const intent of cases.invalidIntents)assert.throws(()=>dispatch(start(),intent),TypeError);
 for(const item of cases.urls){
  const config=item.config??cases.config,s=start({config}),overrides=parseExplorationUrl(item.url,{companyIds:s.index.companyIds,config});
  assert.deepEqual(overrides,item.overrides,item.url);
  const result=explorationReducer(s,{type:'hydrateUrl',url:item.url});assert.deepEqual(result.state.sessionOverrides,overrides,item.url);assert.deepEqual(result.effects,[]);
  assert.equal(result.state.effectiveState.projection,'3D');assert.deepEqual(result.state.preferences,s.preferences);
  const query=explorationQuery(result.state),params=new URLSearchParams(query);
  assert.equal(params.has('view'),false);assert.equal(params.has('secret'),false);assert.equal(params.has('chat'),false);
  assert.equal(params.get('base'),result.state.effectiveState.base);
  assert.deepEqual(reduce(start({config}),{type:'hydrateUrl',url:query}).effectiveState,result.state.effectiveState);
 }
 const sat=reduce(start(),{type:'base',base:'SAT'});assert.equal(reduce(sat,{type:'hydrateUrl',url:'?view=3D'}).effectiveState.base,'SAT');assert.equal(reduce(sat,{type:'hydrateUrl',url:'?view=2D'}).effectiveState.base,'MAPA');
 for(const incompatible of [{...start(),schemaVersion:1},{...start(),view:'3D'},{...start(),sessionOverrides:{view:'2D'}},{...start(),sessionState:{...start().sessionState,projection:'2D'}}]){assert.throws(()=>explorationQuery(incompatible),TypeError);assert.throws(()=>reduce(incompatible,{type:'base',base:'SAT'}),TypeError);}
 assert.throws(()=>start({availableViews:['3D']}),TypeError);
});
test('AC4: câmera explícita tem callbacks positivos, substituídos, duplicados e por revisão',()=>{
 let s=reduce(start(),{type:'company',companyId:'company-1'});
 const first=explorationReducer(s,{type:'camera',companyId:'company-1'});s=first.state;
 assert.deepEqual(first.effects,[{type:'camera',companyId:'company-1',token:s.intentToken,snapshotRevision:'one'}]);
 const stale={type:'callback',target:'camera',token:s.intentToken,snapshotRevision:'one'};
 s=reduce(s,{type:'camera',companyId:'company-2'});const current={...stale,token:s.intentToken};
 assert.equal(reduce(s,stale),s);assert.equal(reduce(s,{...current,snapshotRevision:'old'}),s);
 s=reduce(s,{type:'base',base:'SAT'});s=reduce(s,{type:'preference',field:'theme',value:'ambar'});
 const before=clone(s);s=reduce(s,current);assert.equal(s.cameraOperation.status,'completed');assert.deepEqual(s.terminal,before.terminal);assert.deepEqual(s.effectiveState,before.effectiveState);assert.equal(reduce(s,current),s);
 s=reduce(s,{type:'camera',companyId:'company-1'});const prior={...current,token:s.intentToken};
 s=reduce(s,{type:'advanceSnapshot',data:fixture,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});assert.equal(s.cameraOperation,null);assert.equal(reduce(s,prior),s);
 s=reduce(s,{type:'camera',companyId:'company-1'});const pending={...current,token:s.intentToken,snapshotRevision:'two'};
 s=reduce(s,{type:'company',companyId:'company-2'});assert.equal(reduce(s,pending),s);
});
test('AC4: callbacks de digitação são por operação e snapshot; fechamento não reabre janelas',()=>{
 let s=reduce(start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:'floating'}}),{type:'company',companyId:'company-1'});
 s=reduce(s,{type:'openNews',newsId:'news-1'});
 const terminal={type:'callback',target:'terminal',token:s.terminal.token,snapshotRevision:'one'},reader={type:'callback',target:'reader',token:s.readerToken,snapshotRevision:'one'};
 s=reduce(s,{type:'base',base:'SAT'});s=reduce(s,{type:'preference',field:'mode',value:'dark'});
 s=reduce(s,terminal);assert.equal(s.terminal.typing,false);assert.equal(reduce(s,terminal),s);
 s=reduce(s,reader);assert.equal(s.readerTyping,false);assert.equal(reduce(s,reader),s);
 s=reduce(s,{type:'openNews',newsId:'news-1'});assert.equal(reduce(s,reader),s);
 const pending={...reader,token:s.readerToken};s=reduce(s,{type:'advanceSnapshot',data:fixture,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});assert.equal(reduce(s,pending),s);
 s=reduce(s,{...pending,token:s.readerToken,snapshotRevision:'two'});assert.equal(s.readerTyping,false);
 s=reduce(s,{type:'escape'});assert.equal(s.readerNewsId,null);assert.equal(reduce(s,{...pending,token:s.readerToken,snapshotRevision:'two'}),s);
});
test('AC4: remap explícito conserva Modelo e Leitor numa única revisão e renova callbacks', () => {
  let state=reduce(start(),{type:'navigate',target:modelTarget()});
  state=reduce(state,{type:'openNews',newsId:'news-1'});
  const stale={type:'callback',target:'reader',token:state.readerToken,snapshotRevision:'one'};
  const data=clone(fixture),from=modelTarget().companyId,to='replacement';
  for(const c of data.catalog.companies)if(c.id===from)c.id=to;
  for(const r of data.catalog.relations){if(r.fromCompanyId===from)r.fromCompanyId=to;if(r.toCompanyId===from)r.toCompanyId=to;}
  for(const m of data.models)if(m.companyId===from)m.companyId=to;
  for(const n of data.news)for(const key of ['relevantCompanyIds','citedCompanyIds'])n[key]=n[key].map(id=>id===from?to:id);
  const result=explorationReducer(state,{type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[{fromCompanyId:from,toCompanyId:to}]});
  state=result.state;assert.deepEqual(result.effects,[]);
  assert.equal(state.effectiveState.companyId,to);assert.equal(state.selectedModel.companyId,to);
  assert.equal(state.selectedModel.variantId,modelTarget().variantId);assert.equal(state.readerNewsId,'news-1');assert.equal(state.sidePanel,'reader');
  assert.equal(state.snapshotRevision,'two');
  const late=explorationReducer(state,stale);assert.equal(late.state,state);assert.deepEqual(late.effects,[]);
  state=reduce(state,{...stale,token:state.readerToken,snapshotRevision:'two'});assert.equal(state.readerTyping,false);
});
test('AC4: remaps exigem origem anterior e destino novo, sem alterações parciais',()=>{
 const s=reduce(start(),{type:'company',companyId:'company-1'}),before=clone(s);
 const action={type:'advanceSnapshot',data:fixture,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]};
 for(const companyRemaps of [[{fromCompanyId:'missing',toCompanyId:'company-2'}],[{fromCompanyId:'company-1',toCompanyId:'missing'}],[{fromCompanyId:'company-1',toCompanyId:'company-1'}],[{fromCompanyId:'company-1',toCompanyId:'company-2'}],[{fromCompanyId:'company-1',toCompanyId:'company-2'},{fromCompanyId:'company-1',toCompanyId:'company-2'}]]){
  assert.throws(()=>reduce(s,{...action,companyRemaps}),/REMAP/);assert.deepEqual(s,before);
 }
});
test('AC4: snapshot renova tokens mesmo na mesma revisão e conserva callbacks atuais de Terminal',()=>{
 let s=reduce(start(),{type:'company',companyId:'company-1'});
 const old={type:'callback',target:'terminal',token:s.terminal.token,snapshotRevision:'one'};
 s=reduce(s,{type:'advanceSnapshot',data:fixture,revision:'one',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});
 assert.equal(reduce(s,old),s);assert.equal(reduce(s,{...old,token:s.terminal.token,snapshotRevision:'old'}),s);
 s=reduce(s,{...old,token:s.terminal.token});assert.equal(s.terminal.typing,false);
 s=reduce(s,{type:'company',companyId:'company-1'});const pending={...old,token:s.terminal.token};
 s=reduce(s,{type:'tab',tab:'models'});assert.equal(reduce(s,pending),s);assert.equal(s.terminal,null);
});
test('AC5: laterais exclusivas preservam Terminal; sair do Globo fecha Terminal',()=>{
 const selected=()=>reduce(start(),{type:'company',companyId:'company-1'});
 for(const panel of ['queue','markets']){const before=selected(),s=reduce(before,{type:'panel',panel});assert.deepEqual(s.terminal,before.terminal);assert.equal(s.sidePanel,panel);assert.equal(s.effectiveState.companyId,'company-1');}
 let s=selected();const terminal=clone(s.terminal);
 s=reduce(s,{type:'openNews',newsId:'news-1'});assert.deepEqual(s.terminal,terminal);assert.equal(s.sidePanel,'reader');
 s=reduce(s,{type:'panel',panel:'queue'});assert.deepEqual(s.terminal,terminal);assert.equal(s.sidePanel,'queue');assert.equal(s.readerNewsId,null);
 s=reduce(s,{type:'panel',panel:'markets'});assert.deepEqual(s.terminal,terminal);assert.equal(s.sidePanel,'markets');
 s=reduce(s,{type:'openNews',newsId:'news-1'});assert.equal(s.sidePanel,'reader');assert.deepEqual(s.terminal,terminal);
 for(const tab of ['models','news'])assert.equal(reduce(s,{type:'tab',tab}).terminal,null);
 s=reduce(s,{type:'preference',field:'readerLayout',value:'floating'});assert.deepEqual(s.terminal,terminal);assert.equal(s.sidePanel,null);
 s=reduce(s,{type:'preference',field:'readerLayout',value:'side'});assert.deepEqual(s.terminal,terminal);assert.equal(s.sidePanel,'reader');
});
test('AC6: IDs/payloads incompatíveis, accessors e conteúdo executável preservam contexto',()=>{
 const s=reduce(start(),{type:'company',companyId:'company-1'}),before=clone(s);let calls=0;
 const getter=()=>{calls++;throw new Error('executado');},accessor=(value,key)=>Object.defineProperty(value,key,{enumerable:true,get:getter});
 const bad=[...cases.invalidIntents,{schemaVersion:2,type:'company',companyId:'missing'},{schemaVersion:2,type:'camera',companyId:'missing'},{schemaVersion:2,type:'camera',companyId:'company-1',coordinates:[0,0]},{schemaVersion:2,type:'openNews',newsId:'missing'},{schemaVersion:2,type:'navigate',target:{schemaVersion:1,type:'model',companyId:'company-1',modelId:'missing',variantId:'missing'}},accessor({schemaVersion:2},'type'),accessor({schemaVersion:2,type:'base'},'base'),{schemaVersion:2,type:'preference',field:'layers',value:accessor(['cloud'],'0')},{schemaVersion:2,type:'advanceSnapshot',data:accessor({...fixture},'catalog'),revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]}];
 for(const intent of bad){assert.throws(()=>dispatch(s,intent));assert.deepEqual(s,before);}
 assert.throws(()=>createExploration(accessor({config:cases.config,revision:'one',now:fixture.now},'data')),TypeError);
 assert.throws(()=>parseExplorationUrl('?base=SAT',accessor({companyIds:[]},'config')),TypeError);
 assert.throws(()=>parseExplorationUrl({toString:getter},{companyIds:[],config:cases.config}),TypeError);
 assert.equal(calls,0);assert.deepEqual(s,before);
});
test('defaults UX; URL somente sessão e ação explícita salva apenas seu campo',()=>{
 let s=start();assert.equal(s.preferences.tableStyle,'analytic');assert.equal(s.preferences.readerLayout,'side');assert.equal(s.preferences.soundTyping,false);
 const result=explorationReducer(s,{type:'hydrateUrl',url:'?layers=cloud&view=SAT&tab=models&company=company-1&chat=secret'});s=result.state;assert.deepEqual(result.effects,[]);assert.deepEqual(s.preferences,DEFAULT_PREFERENCES);assert.equal(s.effectiveState.base,'SAT');assert.equal(explorationQuery(s).includes('secret'),false);
 const p=explorationReducer(s,{type:'preference',field:'theme',value:'ambar'});assert.deepEqual(p.effects,[{type:'persistPreferences',patch:{theme:'ambar'}}]);assert.deepEqual(p.state.preferences.layers,DEFAULT_PREFERENCES.layers);assert.deepEqual(p.state.effectiveState.layers,['cloud']);
});
test('URL inválida/duplicada saneada, Camadas todas desligadas e base indisponível rejeitada',()=>{
 let s=reduce(start(),{type:'hydrateUrl',url:'?layers=bogus&view=bogus&tab=models&tab=news&company=missing'});assert.deepEqual(s.effectiveState.layers,DEFAULT_PREFERENCES.layers);assert.equal(s.effectiveState.tab,'globe');assert.equal(s.effectiveState.companyId,null);
 s=reduce(s,{type:'hydrateUrl',url:'?layers='});assert.deepEqual(s.effectiveState.layers,[]);const limited=start({config:{schemaVersion:2,initialBase:'MAPA',availableBases:['MAPA']}});assert.throws(()=>reduce(limited,{type:'base',base:'SAT'}),TypeError);
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
test('Leitor flutuante coexiste com lateral, Modelo conserva variante e padrão claro preserva preferências antigas',()=>{
 let s=start({preferences:{...clone(DEFAULT_PREFERENCES),readerLayout:'floating'}});s=reduce(s,{type:'openNews',newsId:'news-1'});s=reduce(s,{type:'panel',panel:'queue'});assert.equal(s.readerNewsId,'news-1');assert.equal(s.sidePanel,'queue');assert.equal(s.readerLayoutEffective,'floating');
 const m=fixture.models[0];s=reduce(s,{type:'navigate',target:{schemaVersion:1,type:'model',companyId:m.companyId,modelId:m.modelId,variantId:m.variants[0].variantId}});assert.equal(s.selectedModel.variantId,m.variants[0].variantId);
 const data=clone(fixture);data.models.shift();s=reduce(s,{type:'advanceSnapshot',data,revision:'two',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});assert.equal(s.selectedModel,null);assert.equal(s.warning,'model-unavailable');
 assert.equal(start({systemMode:'light'}).preferences.mode,'light');assert.equal(start({systemMode:'dark'}).preferences.mode,'light');
 const legacy={...clone(DEFAULT_PREFERENCES),theme:'osiris',mode:'dark',tableStyle:'hybrid'};assert.deepEqual(start({systemMode:'light',preferences:legacy}).preferences,legacy);
 const changed=explorationReducer(start({preferences:legacy}),{type:'preference',field:'theme',value:'artificial-analysis'});assert.equal(changed.state.preferences.mode,'dark');assert.deepEqual(changed.effects,[{type:'persistPreferences',patch:{theme:'artificial-analysis'}}]);
 const light=reduce(changed.state,{type:'preference',field:'mode',value:'light'});assert.equal(light.preferences.mode,'light');const dark=reduce(light,{type:'preference',field:'mode',value:'dark'});assert.equal(dark.preferences.theme,'artificial-analysis');assert.equal(dark.preferences.mode,'dark');assert.deepEqual(start({systemMode:'light',preferences:dark.preferences}).preferences,dark.preferences);
});
