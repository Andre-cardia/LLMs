import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXPLORATION_VERSION, BASES, assertExplorationConfig, assertExplorationIntent, assertExplorationVersion, assertPreference, assertPreferences} from '../src/contracts/exploration.mjs';
const cases = JSON.parse(readFileSync(new URL('./fixtures/exploration-contract.json', import.meta.url), 'utf8'));

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
