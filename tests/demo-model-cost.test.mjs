import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { assertModelPricing } from '../src/contracts/model-pricing.mjs';
import { estimateStandardTaskCost } from '../src/domain/model-cost.mjs';

const run = promisify(execFile);
const fixtures = JSON.parse(await readFile(new URL('./fixtures/model-pricing.json', import.meta.url), 'utf8'));
const invalid = JSON.parse(await readFile(new URL('./fixtures/model-pricing-invalid.json', import.meta.url), 'utf8'));

test('demo executável é simulada, conserva proveniência e emite os quatro estados', async () => {
  const { stdout, stderr } = await run(process.execPath, [fileURLToPath(new URL('../scripts/demo-model-cost.mjs', import.meta.url))]);
  assert.equal(stderr, '');
  const result = JSON.parse(stdout);
  assert.equal(result.simulated, true);
  assert.match(result.notice, /fictícios/);
  assert.equal(result.models.length, fixtures.length);
  for (const [index, output] of result.models.entries()) {
    for (const field of ['modelId', 'variantId', 'source', 'sourceRecordId', 'sourceUrl', 'fetchedAt', 'observedAt']) {
      assert.equal(output[field], fixtures[index][field]);
    }
  }
  assert.deepEqual(result.models.map(model => model.estimate.usd), ['0.01', '0', null, '0.00225']);
  assert.equal(result.models[3].estimate.approximate, true);
});

test('fixture inválida compartilhada falha nas duas fronteiras', () => {
  assert.throws(() => assertModelPricing(invalid), /inputUsdPerMillion/);
  assert.throws(() => estimateStandardTaskCost(invalid), /inputUsdPerMillion/);
});
