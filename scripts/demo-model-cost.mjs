import { readFile } from 'node:fs/promises';
import { assertModelPricing } from '../src/contracts/model-pricing.mjs';
import { estimateStandardTaskCost } from '../src/domain/model-cost.mjs';

const fixtures = JSON.parse(await readFile(new URL('../tests/fixtures/model-pricing.json', import.meta.url), 'utf8'));
// A fronteira produtora e o consumidor de domínio usam o mesmo contrato.
fixtures.forEach(assertModelPricing);
console.log(JSON.stringify({
  simulated: true,
  notice: 'Dados fictícios; não representam preços de provedores reais.',
  models: fixtures.map(pricing => ({
    modelId: pricing.modelId, variantId: pricing.variantId,
    source: pricing.source, sourceRecordId: pricing.sourceRecordId, sourceUrl: pricing.sourceUrl,
    fetchedAt: pricing.fetchedAt, observedAt: pricing.observedAt,
    estimate: estimateStandardTaskCost(pricing),
  })),
}, null, 2));
