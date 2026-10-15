import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture} from './helpers/local-fixtures.mjs';
import {createExploration, explorationReducer as dispatch} from '../src/domain/exploration-state.mjs';
import {explorationQuery, parseExplorationUrl} from '../src/domain/exploration-url.mjs';

// Cobre AD-24: aliases do protótipo (`select=`, `tab=globo`) traduzidos só em
// `parseExplorationUrl`, com a forma canônica sempre soberana quando coexiste.
const cases = JSON.parse(readFileSync(new URL('./fixtures/exploration-contract.json', import.meta.url), 'utf8'));
const start = (extra = {}) => createExploration({data:fixture, revision:'one', now:fixture.now, config:cases.config, ...extra});
const explorationReducer = (s, i) => dispatch(s, {schemaVersion:2, ...i});
const reduce = (s, i) => explorationReducer(s, i).state;

test('AD-24: select= traduz para company quando o ID existe no índice', () => {
  const state = start();
  const context = {companyIds:state.index.companyIds, config:cases.config};
  assert.deepEqual(parseExplorationUrl('?select=company-1', context), {companyId:'company-1'});
});

test('AD-24: select= com ID ausente do índice vira null, como company= hoje', () => {
  const state = start();
  const context = {companyIds:state.index.companyIds, config:cases.config};
  assert.deepEqual(parseExplorationUrl('?select=missing', context), {companyId:null});
  assert.deepEqual(parseExplorationUrl('?company=missing', context), {companyId:null});
});

test('AD-24: tab=globo traduz para globe; forma canônica tab= continua intacta', () => {
  const state = start();
  const context = {companyIds:state.index.companyIds, config:cases.config};
  assert.deepEqual(parseExplorationUrl('?tab=globo', context), {tab:'globe'});
  assert.deepEqual(parseExplorationUrl('?tab=models', context), {tab:'models'});
  // Valor desconhecido (nem canônico nem alias) continua caindo em 'globe' (padrão existente).
  assert.deepEqual(parseExplorationUrl('?tab=bogus', context), {tab:'globe'});
});

test('AD-24: forma canônica prevalece quando o alias coexiste na mesma URL', () => {
  const state = start();
  const context = {companyIds:state.index.companyIds, config:cases.config};
  // Exemplo da matriz: ?select=company-2&company=company-1 -- company vence; resultado é company-1.
  assert.deepEqual(parseExplorationUrl('?select=company-2&company=company-1', context), {companyId:'company-1'});
  // tab= e select= são parâmetros distintos: company= soberano ignora select= mesmo quando ambos presentes.
  assert.deepEqual(parseExplorationUrl('?select=company-1&company=', context), {companyId:null});
});

test('AD-24: select= sem company= não altera a seleção da sessão (CR-08), igual a company=', () => {
  const session = reduce(start(), {type:'company', companyId:'company-1'});
  const viaSelect = explorationReducer(session, {type:'hydrateUrl', url:'?select='});
  const viaCompany = explorationReducer(session, {type:'hydrateUrl', url:'?company='});
  assert.equal(viaSelect.state.effectiveState.companyId, null);
  assert.equal(viaSelect.state.sessionState.companyId, 'company-1');
  assert.deepEqual(viaSelect.state.effectiveState, viaCompany.state.effectiveState);
});

test('AD-24: mode=, reader=, pov= continuam ignorados; view= segue a regra Q11 sem mudança', () => {
  const state = start();
  const context = {companyIds:state.index.companyIds, config:cases.config};
  assert.deepEqual(parseExplorationUrl('?mode=dark&reader=floating&pov=1', context), {});
  assert.deepEqual(parseExplorationUrl('?view=SAT', context), {base:'SAT'});
  assert.deepEqual(parseExplorationUrl('?view=3D', context), {});
});

test('AD-24: hidratar alias legado completo produz o mesmo estado efetivo que a forma canônica, e explorationQuery nunca emite alias', () => {
  const viaAlias = reduce(start(), {type:'hydrateUrl', url:'?select=company-1&tab=globo'});
  const viaCanonical = reduce(start(), {type:'hydrateUrl', url:'?company=company-1&tab=globe'});
  assert.deepEqual(viaAlias.effectiveState, viaCanonical.effectiveState);
  const query = explorationQuery(viaAlias);
  assert.equal(query.includes('select'), false);
  assert.equal(query.includes('globo'), false);
  assert.equal(new URLSearchParams(query).get('company'), 'company-1');
  assert.equal(new URLSearchParams(query).get('tab'), 'globe');
});
