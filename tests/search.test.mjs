import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture, workspace} from './helpers/local-fixtures.mjs';
import {clone} from '../src/contracts/primitives.mjs';
import {assertSearchQuery, assertSearchContext, assertSearchResult, assertSearchResponse} from '../src/contracts/search.mjs';
import {LocalSearch} from '../src/application/local-search.mjs';
import {LocalNewsView} from '../src/application/local-news-view.mjs';
import {globalSearch} from '../src/domain/global-search.mjs';
import {createExploration, explorationReducer} from '../src/domain/exploration-state.mjs';
import {MemoryNews} from '../src/adapters/memory-news.mjs';
import {LocalUpdate} from '../src/application/local-update.mjs';
import {AccessDeniedError} from '../src/contracts/access.mjs';

const cases = JSON.parse(readFileSync(new URL('./fixtures/search-contract.json', import.meta.url), 'utf8'));
const config = {schemaVersion:2,initialBase:'MAPA',availableBases:['MAPA','SAT']};
function store(data = fixture) {
  let state = createExploration({data,revision:'initial',now:fixture.now,config});
  const intents = [], effects = [];
  return {getState:() => state,intents,effects,dispatch(intent) {
    const result = explorationReducer(state, intent); state = result.state;
    intents.push(intent); effects.push(...result.effects); return result;
  }};
}
function setup(data = clone(fixture)) {
  const source = {data,revision:'one',feedbackRevision:0,hiddenNewsIds:[],allowed:true,now:fixture.now};
  const check = () => { if (!source.allowed) throw new AccessDeniedError(); };
  const view = new LocalNewsView({
    readSnapshot:() => { check(); return {...source.data,manifest:{revision:source.revision}}; },
    readFeedback:() => { check(); return {feedbackRevision:source.feedbackRevision,items:source.data.news,hiddenNewsIds:source.hiddenNewsIds}; },
    resolveAlias:id => { check(); return source.data.news.find(n => n.newsId === id) ?? null; },
    clock:() => source.now
  });
  const s = store(data), search = new LocalSearch({view,store:s});
  return {source,view,store:s,search};
}
const action = (s, intent) => s.dispatch({schemaVersion:2,...intent});
function deferred() { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b;}); return {promise,resolve,reject}; }
function removeCompany(data, id) {
  data.catalog.companies = data.catalog.companies.filter(c => c.id !== id);
  data.catalog.relations = data.catalog.relations.filter(r => r.fromCompanyId !== id && r.toCompanyId !== id);
  data.models = data.models.filter(m => m.companyId !== id);
  data.news = data.news.filter(n => ![...n.relevantCompanyIds,...n.citedCompanyIds].includes(id));
}

test('7.1 contrato: fixtures independentes de resultados/revisões, inválidos e estados explícitos', () => {
  assert.equal(assertSearchContext(cases.context), cases.context);
  for (const result of cases.results) assert.equal(assertSearchResult(result), result);
  for (const value of cases.invalidContexts) assert.throws(() => assertSearchContext(value), TypeError);
  for (const value of cases.invalidResults) assert.throws(() => assertSearchResult(value), TypeError);
  assert.equal(assertSearchResponse(cases.empty), cases.empty);
  const response = {schemaVersion:1,query:'ficticio',status:'results',context:cases.context,results:cases.results};
  assert.equal(assertSearchResponse(response), response);
  for (const patch of [{schemaVersion:2},{status:'empty'},{context:null},{query:'x'.repeat(257)},{status:'unavailable'},{extra:true}]) {
    assert.throws(() => assertSearchResponse({...response,...patch}), TypeError);
  }
  for (const status of ['idle','loading','unavailable']) assert.doesNotThrow(() => assertSearchResponse({...cases.empty,status,context:null}));
  for (const query of ['', '  ', 'x'.repeat(256)]) assert.equal(assertSearchQuery(query),query);
  for (const query of [null,{},'x'.repeat(257)]) assert.throws(() => assertSearchQuery(query), TypeError);
  let called = 0;
  const hostile = Object.defineProperty({},'target',{enumerable:true,get() {called++;}});
  assert.throws(() => assertSearchResult(hostile), TypeError); assert.equal(called,0);
});

test('7.1 AC1: Empresa/Modelo/ticker/Notícia navegam no reducer com o par vigente', async () => {
  for (const expected of cases.results) {
    const w = setup(), before = w.store.getState();
    const response = await w.search.search(expected.label);
    assert.equal(assertSearchResponse(response),response);
    const result = response.results.find(r => r.target.type === expected.target.type);
    assert.deepEqual(result,expected);
    assert.deepEqual(response.context,{dataRevision:'one',feedbackRevision:0});
    assert.equal(w.store.getState(),before); // Buscar não seleciona automaticamente.
    w.source.revision = 'two'; w.source.feedbackRevision = 7;
    const outcome = await w.search.select(result), state = w.store.getState();
    assert.deepEqual(outcome,{status:'available',target:expected.target,context:{dataRevision:'two',feedbackRevision:7}});
    assert.equal(state.snapshotRevision,'two'); assert.equal(state.effectiveState.companyId,result.target.companyId);
    assert.equal(state.effectiveState.projection,'3D');
    if (result.target.type === 'model') {
      assert.equal(state.effectiveState.tab,'models'); assert.equal(state.terminal,null);
      assert.equal(state.selectedModel.variantId,result.target.variantId);
    } else {
      assert.equal(state.effectiveState.tab,'globe'); assert.equal(state.terminal.companyId,result.target.companyId);
      if (result.target.type === 'news') {assert.equal(state.readerNewsId,result.target.newsId);assert.equal(state.sidePanel,'reader');}
    }
    assert.deepEqual(w.store.effects,[]);
    assert.deepEqual(w.store.intents.map(i => i.type),['advanceSnapshot','navigate']);
  }
});

test('7.1 vazio/matching: preserva texto, substring, acentos/caixa, limite e ordem sem ranking', async () => {
  const w = setup();
  for (const query of ['  sem CORRESPONDÊNCIA  ', '', '   ', 'x'.repeat(256)]) {
    const response = await w.search.search(query);
    assert.equal(response.query,query); assert.equal(response.status,'empty'); assert.deepEqual(response.results,[]);
  }
  for (const query of ['ficticio','  FICTÍCIO  ','noticia','LaboratÓrio','Modelo fictício 0']) {
    const response = await w.search.search(query);
    assert.deepEqual(response.results,globalSearch(w.source.data,query,{now:fixture.now}));
  }
  const previous = w.search.current;
  await assert.rejects(w.search.search('x'.repeat(257)),TypeError);
  assert.equal(w.search.current,previous); assert.deepEqual(w.store.intents,[]);
});

test('7.1 contrato: título longo válido não é truncado nem impede navegação', async () => {
  const data=clone(fixture); data.news[0].titleOriginal='N'.repeat(4096);
  const w=setup(data), response=await w.search.search('NN');
  assert.equal(response.status,'results'); assert.equal(response.results[0].label.length,4096);
  assert.equal((await w.search.select(response.results[0])).status,'available');
});

test('7.1 privacidade: seleção pendente remove resultados inclusive quando intent externo vence negação', async () => {
  const w=setup(), pending=deferred(); let block=false;
  const search=new LocalSearch({store:w.store,view:{frame:t => block ? pending.promise : w.view.frame(t)}});
  const result=(await search.search('noticia')).results[0]; block=true;
  const selected=search.select(result);
  assert.equal(search.current.status,'loading'); assert.deepEqual(search.current.results,[]);
  action(w.store,{type:'company',companyId:'company-2'}); pending.reject(new AccessDeniedError());
  assert.deepEqual(await selected,{status:'superseded'}); assert.deepEqual(search.current.results,[]);
  assert.equal(search.current.context,null); assert.equal(w.store.getState().readerNewsId,null);
});

test('7.1 ticker: homônimos conservam Empresa/símbolo/bolsa e exigem escolha explícita', async () => {
  const data = clone(fixture);
  data.catalog.companies[0].listing = {symbol:'FAKE',exchange:'OTHER',currency:'USD'};
  const w = setup(data), response = await w.search.search('fake');
  assert.deepEqual(response.results.map(r => [r.target.companyId,r.target.exchange]),[['company-1','OTHER'],['company-3','SIMULATED']]);
  assert.equal(w.store.getState().effectiveState.companyId,null);
  assert.equal((await w.search.select(response.results[1])).target.companyId,'company-3');
  w.source.data.catalog.companies[2].listing.exchange = 'CHANGED';
  assert.equal((await w.search.select(response.results[1])).status,'unavailable');
  assert.equal(w.store.intents.filter(i => i.type === 'navigate').length,1);
});

test('7.1 AC3: remoção não usa homônimo, Modelo perde variante e Notícia perde relevância/validade', async () => {
  const mutations = [
    ['company', w => {const c = w.source.data.catalog.companies[0]; removeCompany(w.source.data,c.id); w.source.data.catalog.companies.push({...c,id:'homonym'});} ],
    ['model', w => {w.source.data.models.shift();}],
    ['news', w => {w.source.data.news[0].relevantCompanyIds=['company-2'];}],
    ['news', w => {w.source.data.news=[];}],
    ['news', w => {w.source.now='2026-11-10T12:00:00Z';}],
    ['ticker', w => {w.source.data.catalog.companies[2].listing=null;}]
  ];
  for (const [type, mutate] of mutations) {
    const w = setup(), result = cases.results.find(r => r.target.type === type);
    await w.search.search(result.label); mutate(w);
    assert.equal((await w.search.select(result)).status,'unavailable');
    assert.equal(w.store.getState().effectiveState.companyId,null);
    assert.equal(w.store.intents.some(i => i.type === 'navigate'),false);
    assert.deepEqual(w.search.current.results,[]);
  }
});

test('7.1 AC3: feedback entre busca e seleção fecha Leitor e suprime owner-wide no mesmo frame', async () => {
  const w = setup();
  const response = await w.search.search('noticia ficticia 1'), result = response.results[0];
  await w.search.select(result);
  w.source.hiddenNewsIds=['news-1']; w.source.feedbackRevision=1;
  assert.equal((await w.search.select(result)).status,'unavailable');
  assert.equal(w.store.getState().readerNewsId,null); assert.equal(w.store.getState().sidePanel,null);
  assert.deepEqual(w.search.current.results,[]);
  const updated = await w.search.search('noticia ficticia 1');
  assert.equal(updated.status,'empty'); assert.equal(updated.context.feedbackRevision,1);
});

test('7.1 AC3: negação/falha em snapshot, feedback ou alias limpa dados sem navegar', async () => {
  for (const stage of ['snapshot','feedback','alias']) for (const error of [new AccessDeniedError(),new Error('segredo privado')]) {
    const w = setup(), result = (await w.search.search('noticia ficticia 1')).results[0];
    const fail = () => {throw error;};
    const view = new LocalNewsView({readSnapshot:stage === 'snapshot' ? fail : () => ({...fixture,manifest:{revision:'two'}}),
      readFeedback:stage === 'feedback' ? fail : () => ({feedbackRevision:1,items:fixture.news,hiddenNewsIds:[]}),
      resolveAlias:stage === 'alias' ? fail : () => fixture.news[0],clock:() => fixture.now});
    const search = new LocalSearch({view,store:w.store});
    if (stage === 'alias') assert.equal((await search.search('noticia')).status,'results');
    assert.deepEqual(await search.select(result),{status:'unavailable'});
    assert.equal(search.current.status,'unavailable'); assert.equal(search.current.context,null);
    assert.deepEqual(search.current.results,[]); assert.deepEqual(w.store.intents,[]);
    assert.equal(JSON.stringify(search.current).includes('segredo'),false);
  }
  const w = setup(); await w.search.search('ficticio'); w.source.allowed=false;
  assert.equal((await w.search.search('ficticio')).status,'unavailable');
  assert.deepEqual(w.search.current.results,[]); assert.equal(w.search.current.context,null);
});

test('7.1 AC2: consultas sobrepostas descartam sucesso/falha antigos sem expor seu retorno', async () => {
  for (const failed of [false,true]) {
    const w = setup(), pending = deferred(), frame = await w.view.frame(); let calls=0;
    const search = new LocalSearch({store:w.store,view:{frame:() => ++calls === 1 ? pending.promise : w.view.frame()}});
    const first = search.search('noticia'), second = await search.search('fake');
    if (failed) pending.reject(new AccessDeniedError()); else pending.resolve(frame);
    assert.deepEqual(await first,{status:'superseded'}); assert.equal(search.current,second);
    assert.equal(search.current.query,'fake'); assert.deepEqual(w.store.intents,[]);
  }
});

test('7.1 AC2: busca nova, seleção nova, cancelamento e intents externos vencem seleção pendente', async () => {
  for (const next of ['search','select','cancel','company','hydrateUrl','escape','advanceSnapshot']) {
    const w = setup(), pending = deferred(), staleFrame = await w.view.frame(cases.results[3].target); let calls=0;
    const search = new LocalSearch({store:w.store,view:{frame:t => ++calls === 1 ? pending.promise : w.view.frame(t)}});
    const first = search.select(cases.results[3]);
    if (next === 'search') await search.search('fake');
    else if (next === 'select') await search.select(cases.results[2]);
    else if (next === 'cancel') search.cancel();
    else if (next === 'company') action(w.store,{type:'company',companyId:'company-2'});
    else if (next === 'hydrateUrl') action(w.store,{type:'hydrateUrl',url:'?company=company-2'});
    else if (next === 'escape') action(w.store,{type:'escape'});
    else action(w.store,{type:'advanceSnapshot',data:fixture,revision:'newer',now:fixture.now,hiddenNewsIds:[],companyRemaps:[]});
    const state=w.store.getState(), current=search.current, count=w.store.intents.length;
    pending.resolve(staleFrame);
    assert.deepEqual(await first,{status:'superseded'}); assert.equal(w.store.getState(),state);
    if (['company','hydrateUrl','escape','advanceSnapshot'].includes(next)) {
      assert.equal(search.current.status,'idle'); assert.equal(search.current.query,current.query);
      assert.deepEqual(search.current.results,[]); assert.equal(search.current.context,null);
    } else assert.equal(search.current,current);
    assert.equal(w.store.intents.length,count); assert.equal(state.readerNewsId,null);
  }
});

test('7.1 AC2: seleção atual vence consulta pendente e callback antigo não reabre Leitor', async () => {
  const w = setup(), pending = deferred(), frame = await w.view.frame(); let calls=0;
  const search = new LocalSearch({store:w.store,view:{frame:t => ++calls === 1 ? pending.promise : w.view.frame(t)}});
  const first=search.search('noticia'); await search.select(cases.results[3]);
  const token=w.store.getState().readerToken;
  action(w.store,{type:'escape'}); action(w.store,{type:'escape'});
  const state=w.store.getState(); pending.resolve(frame);
  assert.deepEqual(await first,{status:'superseded'}); assert.equal(w.store.getState(),state);
  action(w.store,{type:'callback',target:'reader',token,snapshotRevision:'one'});
  assert.equal(w.store.getState(),state); assert.equal(state.readerNewsId,null);
});

test('7.1 AC2: intenção reentrante no refresh impede o segundo dispatch de navegação', async () => {
  const w = setup(), dispatch=w.store.dispatch;
  w.store.dispatch=intent => {const result=dispatch(intent); if (intent.type === 'advanceSnapshot') action(w.store,{type:'company',companyId:'company-2'}); return result;};
  assert.deepEqual(await w.search.select(cases.results[3]),{status:'superseded'});
  assert.equal(w.store.getState().effectiveState.companyId,'company-2'); assert.equal(w.store.getState().readerNewsId,null);
});

test('7.1 frame: alias aguardado antes do feedback; mutação de snapshot não mistura revisões', async () => {
  const data=clone(fixture), alias=deferred(), feedback=deferred(), captured=deferred();
  const view=new LocalNewsView({readSnapshot:() => ({...data,manifest:{revision:'one'}}),
    readFeedback:() => {captured.resolve();return feedback.promise;},resolveAlias:() => alias.promise,clock:() => fixture.now});
  const promise=view.frame(cases.results[3].target);
  alias.resolve(fixture.news[0]); await captured.promise;
  data.catalog.companies[0].name='mutação tardia';
  feedback.resolve({feedbackRevision:9,items:fixture.news,hiddenNewsIds:['news-1']});
  const frame=await promise;
  assert.equal(frame.data.catalog.companies[0].name,fixture.catalog.companies[0].name);
  assert.equal(frame.feedbackRevision,9); assert.equal(frame.navigation.status,'unavailable');
  assert.equal(Object.isFrozen(frame.data.catalog.companies),true);
});

test('7.1 aliases: evidência MemoryNews remapeia alias e conserva supressão', async () => {
  const w=workspace(), news=new MemoryNews({...w,authorizeOwner:c => c === w.owner,authorizeIngest:c => c === w.job});
  const update=new LocalUpdate(w), args={modelsSourceId:'fake',scope:'all',context:w.job,fetchModels:() => fixture.models,
    fetchNews:() => fixture.news,reconcileNews:(s,items) => news.ingest(s,items,w.job)};
  await update.run({...args,runId:'one'});
  const alias={...clone(fixture.news[0]),newsId:'alias'};
  await update.run({...args,runId:'alias',fetchNews:() => [alias]});
  const snapshot=(await w.reader.refresh()).snapshot;
  const view=new LocalNewsView({readSnapshot:() => snapshot,readFeedback:() => news.read(w.owner),resolveAlias:id => news.resolve(id,w.owner),clock:w.clock});
  const s=store(), search=new LocalSearch({view,store:s}), result={...cases.results[3],target:{...cases.results[3].target,newsId:'alias'}};
  assert.equal((await search.select(result)).target.newsId,'news-1');
  news.feedback({schemaVersion:1,newsId:'alias',companyId:'company-1',expectedFeedbackRevision:0,irrelevant:true,confirmed:true,idempotencyKey:'hide'},w.owner);
  assert.equal((await search.select(result)).status,'unavailable'); assert.equal(s.getState().readerNewsId,null);
  assert.equal((await search.search('noticia ficticia 1')).status,'empty');
  assert.equal((await view.context()).news.some(n => n.newsId === 'news-1'),false);
});

test('7.1 review BH1: intenção externa encerra loading sem sobrescrever busca nova', async () => {
  for (const fail of [false,true]) {
    const w=setup(), pending=deferred(), frame=await w.view.frame();
    const search=new LocalSearch({store:w.store,view:{frame:() => pending.promise}});
    const operation=search.search('  ficticio  ');
    action(w.store,{type:'company',companyId:'company-2'});
    if (fail) pending.reject(new AccessDeniedError()); else pending.resolve(frame);
    assert.deepEqual(await operation,{status:'superseded'});
    assert.deepEqual(search.current,{schemaVersion:1,query:'  ficticio  ',status:'idle',context:null,results:[]});
  }
});

test('7.1 review BH2: getState assíncrono/token inválido falha antes de leitura ou dispatch', async () => {
  for (const getState of [async () => ({intentToken:0}), () => ({}), () => ({intentToken:-1}), () => ({intentToken:NaN})]) {
    let reads=0, dispatches=0;
    const search=new LocalSearch({view:{frame:() => {reads++;throw new Error('não ler');}},store:{getState,dispatch:() => {dispatches++;}}});
    await assert.rejects(search.search('ficticio'));
    await assert.rejects(search.select(cases.results[0]));
    assert.equal(reads,0); assert.equal(dispatches,0); assert.equal(search.current.status,'idle');
  }
});

test('7.1 review BH4: congelamento do frame é limitado por identidade compartilhada', async t => {
  const data=clone(fixture); let graph={leaf:true};
  for(let i=0;i<12;i++)graph={a:graph,b:graph}; data.extra=graph;
  const w=setup(data), original=Object.freeze, identities=new Set(); let visits=0;
  const spy=t.mock.method(Object,'freeze',value => {visits++;identities.add(value);return original(value);});
  let frame;
  try {frame=await w.view.frame();} finally {spy.mock.restore();}
  assert.ok(visits<=3*identities.size,`${visits} visitas para ${identities.size} identidades`);
  assert.equal(frame.data.extra.a,frame.data.extra.b);
  for(let value=frame.data.extra;value;value=value.a) assert.equal(Object.isFrozen(value),true);
});

test('7.1 review BH8: dados malformados nas portas limpam resultados sem navegar', async () => {
  const faults=[
    {readSnapshot:() => null},
    {readSnapshot:() => ({...clone(fixture),catalog:null,manifest:{revision:'two'}})},
    {readSnapshot:() => ({...clone(fixture),manifest:{revision:''}})},
    {readFeedback:() => ({feedbackRevision:-1,items:fixture.news,hiddenNewsIds:[]})},
    {readFeedback:() => ({feedbackRevision:0,items:fixture.news,hiddenNewsIds:[null]})},
    {readFeedback:() => ({feedbackRevision:0,items:[{}],hiddenNewsIds:[]})},
    {clock:() => 'data inválida'},
    {resolveAlias:() => ({newsId:123})}
  ];
  for(const fault of faults) {
    const w=setup(), options={readSnapshot:() => ({...clone(fixture),manifest:{revision:'two'}}),
      readFeedback:() => ({feedbackRevision:0,items:fixture.news,hiddenNewsIds:[]}),
      resolveAlias:() => fixture.news[0],clock:() => fixture.now,...fault};
    let invalid=false;
    const search=new LocalSearch({store:w.store,view:{frame:t => invalid ? new LocalNewsView(options).frame(t) : w.view.frame(t)}});
    const result=(await search.search('noticia ficticia 1')).results[0]; invalid=true;
    assert.deepEqual(await search.select(result),{status:'unavailable'});
    assert.equal(search.current.status,'unavailable'); assert.equal(search.current.context,null);
    assert.deepEqual(search.current.results,[]); assert.deepEqual(w.store.intents,[]);
  }
});

test('7.1 review VG1: supressão durante espera do alias prevalece na seleção', async () => {
  const w=setup(), alias=deferred(), entered=deferred(); let blocked=false, feedbackRevision=0, hiddenNewsIds=[], lastFrame;
  const view=new LocalNewsView({readSnapshot:() => ({...fixture,manifest:{revision:'one'}}),
    readFeedback:() => ({feedbackRevision,items:fixture.news,hiddenNewsIds:[...hiddenNewsIds]}),
    resolveAlias:() => {if(blocked){entered.resolve();return alias.promise;}return fixture.news[0];},clock:() => fixture.now});
  const search=new LocalSearch({store:w.store,view:{frame:async t => {lastFrame=await view.frame(t);return lastFrame;}}});
  const result=(await search.search('noticia ficticia 1')).results[0]; await search.select(result);
  blocked=true;const pending=search.select(result);await entered.promise;
  feedbackRevision=1;hiddenNewsIds=['news-1'];alias.resolve(fixture.news[0]);
  assert.deepEqual(await pending,{status:'unavailable'});assert.equal(lastFrame.feedbackRevision,1);
  assert.equal(w.store.getState().readerNewsId,null);assert.deepEqual(search.current.results,[]);
});

test('7.1 review VG2: cancelamento reentrante durante navigate não republica resultados', async () => {
  const w=setup(), dispatch=w.store.dispatch;
  w.store.dispatch=intent => {const result=dispatch(intent);if(intent.type==='navigate')w.search.cancel();return result;};
  assert.deepEqual(await w.search.select(cases.results[3]),{status:'superseded'});
  assert.deepEqual(w.search.current,{schemaVersion:1,query:'',status:'idle',context:null,results:[]});
});

test('7.1 review BH9: merge de grupos distintos suprimidos protege snapshot pré-merge', async () => {
  const w=workspace(), news=new MemoryNews({...w,authorizeOwner:c => c===w.owner,authorizeIngest:c => c===w.job});
  const other={...clone(fixture.news[0]),newsId:'distinct',originalUrl:'https://example.invalid/distinct',
    sourceRefs:[{...fixture.news[0].sourceRefs[0],sourceRecordId:'distinct',sourceUrl:'https://example.invalid/distinct'}]};
  const items=[fixture.news[0],other];
  w.control.transact(state => news.ingest(state,items,w.job));
  const data={...clone(fixture),news:clone(items)}, snapshot={...data,manifest:{revision:'before-merge'}};
  const view=new LocalNewsView({readSnapshot:() => snapshot,readFeedback:() => news.read(w.owner),resolveAlias:id => news.resolve(id,w.owner),clock:w.clock});
  const s=store(data), search=new LocalSearch({view,store:s});
  const results=(await search.search('noticia ficticia 1')).results;assert.equal(results.length,2);
  await search.select(results.find(r => r.target.newsId==='distinct'));assert.equal(s.getState().readerNewsId,'distinct');
  news.feedback({schemaVersion:1,newsId:'distinct',companyId:'company-1',expectedFeedbackRevision:0,irrelevant:true,confirmed:true,idempotencyKey:'suppress-distinct'},w.owner);
  const bridge=clone(other);bridge.sourceRefs.push(clone(fixture.news[0].sourceRefs[0]));
  w.control.transact(state => news.ingest(state,[bridge],w.job));
  assert.equal(news.read(w.owner).items.length,1);
  assert.equal((await search.search('noticia ficticia 1')).status,'empty');
  for(const result of results) assert.deepEqual(await search.select(result),{status:'unavailable'});
  assert.equal(s.getState().readerNewsId,null);assert.equal(s.getState().snapshotRevision,'before-merge');
});
