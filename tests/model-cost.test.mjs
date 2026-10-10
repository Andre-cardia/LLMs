import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertModelPricing } from '../src/contracts/model-pricing.mjs';
import { estimateStandardTaskCost, STANDARD_TASK } from '../src/domain/model-cost.mjs';

const fixtures = JSON.parse(await readFile(new URL('./fixtures/model-pricing.json', import.meta.url), 'utf8'));
const record = changes => ({ ...fixtures[0], ...changes });

test('perfil do PRD: 2.000 entrada e 1.000 saída, em USD por milhão', () => {
  assert.deepEqual(STANDARD_TASK, { inputTokens: 2000, outputTokens: 1000 });
  const estimate = estimateStandardTaskCost(fixtures[0]);
  assert.equal(estimate.usd, '0.01');
  assert.equal(estimate.currency, 'USD');
  assert.equal(estimate.status, 'available');
  assert.equal(estimate.approximate, false);
  assert.equal(estimate.caveat, null);
});

test('zero informado é disponível; preço ausente impede total parcial', () => {
  assert.equal(estimateStandardTaskCost(fixtures[1]).usd, '0');
  for (const missing of [['inputUsdPerMillion'], ['outputUsdPerMillion'], ['inputUsdPerMillion', 'outputUsdPerMillion']]) {
    const pricing = record(Object.fromEntries(missing.map(field => [field, null])));
    const estimate = estimateStandardTaskCost(pricing);
    assert.equal(estimate.usd, null);
    assert.equal(estimate.status, 'unavailable');
    assert.deepEqual(estimate.missingPrices, missing);
  }
});

test('raciocínio conserva valor e sinaliza aproximação e tokens excluídos', () => {
  const estimate = estimateStandardTaskCost(fixtures[3]);
  assert.equal(estimate.usd, '0.00225');
  assert.equal(estimate.approximate, true);
  assert.match(estimate.caveat, /tokens de raciocínio não estão incluídos/);
});

test('não perde dígitos grandes nem preços menores que um microUSD', () => {
  assert.equal(estimateStandardTaskCost(record({ inputUsdPerMillion: '9007199254740993', outputUsdPerMillion: '0' })).usd, '18014398509481.986');
  assert.equal(estimateStandardTaskCost(record({ inputUsdPerMillion: '0.000000000000000001', outputUsdPerMillion: '0' })).usd, '0.000000000000000000002');
  assert.equal(estimateStandardTaskCost(record({ inputUsdPerMillion: '0.1', outputUsdPerMillion: '0.2' })).usd, '0.0004');
  assert.equal(estimateStandardTaskCost(record({ inputUsdPerMillion: '1.2300', outputUsdPerMillion: '0.00001' })).usd, '0.00246001');
});

test('precisão exata nos limites de 256 caracteres e escalas muito diferentes', () => {
  const maximumInteger = '9'.repeat(256);
  assert.equal(estimateStandardTaskCost(record({
    inputUsdPerMillion: maximumInteger, outputUsdPerMillion: maximumInteger,
  })).usd, `2${'9'.repeat(253)}.997`);
  const large = `1${'0'.repeat(255)}`;
  const tiny = `0.${'0'.repeat(253)}1`;
  assert.equal(large.length, 256);
  assert.equal(tiny.length, 256);
  assert.equal(estimateStandardTaskCost(record({
    inputUsdPerMillion: large, outputUsdPerMillion: tiny,
  })).usd, `2${'0'.repeat(252)}.${'0'.repeat(256)}1`);
});

test('consumidor rejeita o mesmo registro inválido que o produtor', () => {
  const invalid = record({ inputUsdPerMillion: 2 });
  assert.throws(() => assertModelPricing(invalid), TypeError);
  assert.throws(() => estimateStandardTaskCost(invalid), TypeError);
});

test('cálculo é repetível e não muda fixture nem perfil padrão', () => {
  const input = Object.freeze(record({}));
  const before = JSON.stringify(input);
  assert.deepEqual(estimateStandardTaskCost(input), estimateStandardTaskCost(input));
  assert.equal(JSON.stringify(input), before);
  assert.throws(() => { STANDARD_TASK.inputTokens = 1; }, TypeError);
});
