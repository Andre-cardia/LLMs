import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertModelPricing } from '../src/contracts/model-pricing.mjs';

const fixtures = JSON.parse(await readFile(new URL('./fixtures/model-pricing.json', import.meta.url), 'utf8'));
const record = changes => ({ ...fixtures[0], ...changes });

test('produtor aceita fixtures válidas sem modificar os dados', () => {
  const before = JSON.stringify(fixtures);
  for (const fixture of fixtures) assert.equal(assertModelPricing(fixture), fixture);
  assert.equal(JSON.stringify(fixtures), before);
});

test('preços ausentes, zero e decimais de alta precisão são válidos', () => {
  for (const amount of [null, '0', '0.00', '0.000000000000000001', '9007199254740993.125']) {
    assertModelPricing(record({ inputUsdPerMillion: amount }));
  }
});

test('rejeita números, negativos, expoentes e formatos ambíguos', () => {
  for (const amount of [0, 1.2, false, undefined, '-1', '-0', 'NaN', 'Infinity', '1e6', '+1', '01', '.2', '1.', '1,25', '', ' 1', '1 ', '9'.repeat(257)]) {
    assert.throws(() => assertModelPricing(record({ inputUsdPerMillion: amount })), TypeError);
    assert.throws(() => assertModelPricing(record({ outputUsdPerMillion: amount })), TypeError);
  }
});

test('rejeita versão desconhecida, campos extras ou campos obrigatórios ausentes', () => {
  assert.throws(() => assertModelPricing(record({ schemaVersion: 2 })), /schemaVersion/);
  assert.throws(() => assertModelPricing(record({ surprise: 'extra' })), /campos/);
  for (const field of Object.keys(fixtures[0])) {
    const incomplete = record({});
    delete incomplete[field];
    assert.throws(() => assertModelPricing(incomplete), /campos/);
  }
});

test('rejeita registros de formato incompatível e identidades vazias', () => {
  for (const value of [null, [], 'modelo', 42, new Date()]) {
    assert.throws(() => assertModelPricing(value), TypeError);
  }
  for (const field of ['modelId', 'variantId', 'source', 'sourceRecordId']) {
    for (const value of ['', ' ', null, 42, ' x']) {
      assert.throws(() => assertModelPricing(record({ [field]: value })), TypeError);
    }
  }
  assert.throws(() => assertModelPricing(record({ reasoning: 'true' })), /reasoning/);
});

test('rejeita getters e campos não enumeráveis antes de ler seus valores', () => {
  let reads = 0;
  const unstable = record({});
  Object.defineProperty(unstable, 'inputUsdPerMillion', {
    enumerable: true, get() { reads += 1; return reads === 1 ? '1' : '-1'; },
  });
  assert.throws(() => assertModelPricing(unstable), /propriedade própria, enumerável e de dados/);
  assert.equal(reads, 0);
  const hidden = record({});
  Object.defineProperty(hidden, 'modelId', { enumerable: false });
  assert.throws(() => assertModelPricing(hidden), /propriedade própria, enumerável e de dados/);
});

test('exige proveniência HTTPS sem credenciais e datas UTC reais', () => {
  for (const sourceUrl of ['não-url', 'http://example.invalid', 'javascript:alert(1)', 'https://user:password@example.invalid', null]) {
    assert.throws(() => assertModelPricing(record({ sourceUrl })), /sourceUrl/);
  }
  for (const date of ['2026-02-30T00:00:00Z', '2026-10-10', '2026-10-10T25:00:00Z', '2026-10-10T00:00:00+00:00', null]) {
    assert.throws(() => assertModelPricing(record({ fetchedAt: date })), /fetchedAt/);
  }
  assertModelPricing(record({ fetchedAt: '2024-02-29T23:59:59.123Z', observedAt: null }));
  assert.throws(() => assertModelPricing(record({ observedAt: '2026-02-29T00:00:00Z' })), /observedAt/);
});

test('rejeita normalização silenciosa de controles, espaços e barras na URL', () => {
  for (const sourceUrl of ['https://exa\nmple.invalid/path', 'https://exa\tmple.invalid/path',
    'https://example.invalid/a b', 'https://example.invalid\\path', 'https:example.invalid/path',
    'https:///example.invalid/path', 'https://example.invalid/\u007f']) {
    assert.throws(() => assertModelPricing(record({ sourceUrl })), /sourceUrl/);
  }
});
