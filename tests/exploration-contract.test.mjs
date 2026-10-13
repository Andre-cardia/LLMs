import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXPLORATION_VERSION, BASES, assertExplorationData, assertExplorationConfig, assertExplorationIntent, assertExplorationVersion, assertPreference, assertPreferences} from '../src/contracts/exploration.mjs';
import {explorationReducer} from '../src/domain/exploration-state.mjs';
const cases = JSON.parse(readFileSync(new URL('./fixtures/exploration-contract.json', import.meta.url), 'utf8'));

function sharedGraph(depth) {
  let value = {leaf:true};
  const nodes = new Set([value]);
  for (let i = 0; i < depth; i++) {
    value = i % 2 === 0 ? {a:value,b:value} : [value,value];
    nodes.add(value);
  }
  return {value,nodes};
}
function countInspections(t, nodes, run) {
  const ownKeys = Reflect.ownKeys;
  let inspections = 0;
  const spy = t.mock.method(Reflect, 'ownKeys', value => {
    if (nodes.has(value)) inspections++;
    return ownKeys(value);
  });
  try { run(); } finally { spy.mock.restore(); }
  return inspections;
}
function wrap(value, count) {
  for (let i = 0; i < count; i++) value = {child:value};
  return value;
}

test('CR-01: grafo compartilhado é validado por identidade, sem percurso exponencial', t => {
  const {value,nodes} = sharedGraph(12);
  const inspections = countInspections(t, nodes, () => assert.equal(assertExplorationData(value),value));
  // object() inspeciona chaves duas vezes; arrays apenas uma. Sem limite de tempo frágil.
  assert.ok(inspections <= 2 * nodes.size, `${inspections} inspeções para ${nodes.size} objetos`);
});
test('CR-01: reducer rejeita campo extra compartilhado sem amplificação ou mutação', t => {
  const {value,nodes} = sharedGraph(12);
  const state = structuredClone(cases.validState), before = structuredClone(state);
  const inspections = countInspections(t, nodes, () => {
    assert.throws(() => explorationReducer(state,{schemaVersion:2,type:'base',base:'MAPA',extra:value}), /campos incompatíveis/);
  });
  assert.deepEqual(state,before);
  assert.ok(inspections <= 2 * nodes.size, `${inspections} inspeções para ${nodes.size} objetos`);
});
test('CR-01: cache respeita profundidade 128 em todos os caminhos e ordens', () => {
  for (const shallowFirst of [true,false]) {
    for (const extraDepth of [123,124]) {
      const shared = wrap({},3); // Quatro objetos no subgrafo compartilhado.
      const deep = wrap(shared,extraDepth);
      const value = shallowFirst ? {shallow:shared,deep} : {deep,shallow:shared};
      if (extraDepth === 123) assert.equal(assertExplorationData(value),value); // 1 + 123 + 4 = 128.
      else assert.throws(() => assertExplorationData(value), /profundidade excessiva/);
    }
  }
});
test('CR-01: referências repetidas não escondem ciclos de objetos ou arrays', () => {
  const self = {}; self.self = self;
  const array = []; array.push(array);
  const branch = {}, shared = {branch}; branch.back = shared;
  for (const value of [self,array,{a:shared,b:shared}]) assert.throws(() => assertExplorationData(value), /dados simples exigidos/);
});
test('CR-01: cache é local à chamada e mantém proteção de descritores e protótipos', () => {
  const shared = {safe:true}, value = {a:shared,b:shared};
  assert.equal(assertExplorationData(value),value);
  let reads = 0;
  Object.defineProperty(shared,'safe',{enumerable:true,get(){reads++;return true;}});
  assert.throws(() => assertExplorationData(value), /propriedade de dados exigida/);
  const array = ['cloud'];
  assert.equal(assertExplorationData({a:array,b:array}).a,array);
  const prototype = Object.create(Array.prototype);
  Object.defineProperty(prototype,Symbol.iterator,{get(){reads++;return Array.prototype[Symbol.iterator];}});
  Object.setPrototypeOf(array,prototype);
  assert.throws(() => assertExplorationData({a:array,b:array}), /protótipo de array incompatível/);
  assert.equal(reads,0);
});

test('contrato publicado v2: configuração e intents válidos/inválidos compartilhados', () => {
  assert.equal(EXPLORATION_VERSION, cases.schemaVersion);
  assert.deepEqual(BASES, ['MAPA','SAT']);
  for (const version of [undefined,null,1,3,'2']) assert.throws(() => assertExplorationVersion(version),TypeError);
  for (const config of cases.validConfigs) assert.equal(assertExplorationConfig(config), config);
  for (const config of cases.invalidConfigs) assert.throws(() => assertExplorationConfig(config), TypeError);
  for (const intent of cases.validIntents) assert.equal(assertExplorationIntent(intent), intent);
  for (const intent of cases.invalidIntents) assert.throws(() => assertExplorationIntent(intent), TypeError);
});
test('contrato recusa accessors sem executá-los, inclusive arrays e alvos aninhados', () => {
  let calls=0; const getter=()=>{calls++;throw new Error('não executar');};
  const accessor=(value,key)=>Object.defineProperty(value,key,{enumerable:true,get:getter});
  for (const intent of [accessor({},'type'),accessor({schemaVersion:2,type:'base'},'base'),accessor({type:'base',base:'SAT'},'schemaVersion'),{schemaVersion:2,type:'preference',field:'layers',value:accessor(['cloud'],'0')},{schemaVersion:2,type:'navigate',target:accessor({schemaVersion:1,type:'company'},'companyId')}]) assert.throws(()=>assertExplorationIntent(intent),TypeError);
  assert.throws(()=>assertExplorationConfig(accessor({schemaVersion:2,availableBases:['MAPA']},'initialBase')),TypeError);
  assert.equal(calls,0);
});
test('preferências legadas continuam válidas, sem migração ou acoplamento família/modo', () => {
  const preferences = {theme:'osiris',mode:'dark',readerLayout:'floating',tableStyle:'hybrid',leftTab:'labs',feedLabsOnly:true,soundTyping:false,soundAmbient:true,layers:[],favorites:['company-1']};
  assert.equal(assertPreferences(preferences), preferences);
  assert.equal(assertPreference('theme', 'artificial-analysis'), 'artificial-analysis');
  assert.throws(() => assertPreference('base', 'MAPA'), TypeError);
  assert.throws(() => assertPreferences({...preferences, view:'3D'}), TypeError);
});
