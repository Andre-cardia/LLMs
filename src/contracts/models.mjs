import { assertModelPricing } from './model-pricing.mjs';
import { object, string, boolean, oneOf, list, nullable, number, integer, utc, decimal, sourceRefs, uniqueIds, fail } from './primitives.mjs';
export const NUMERIC_MODEL_FIELDS = Object.freeze(['intelligence', 'programming', 'math', 'contextTokens', 'ttftSeconds', 'tokensPerSecond']);
export const MODALITIES = Object.freeze(['text', 'image', 'video', 'audio', 'file']);
export function assertVariant(value) {
  object(value, ['variantId', 'name', 'pricing', ...NUMERIC_MODEL_FIELDS, 'cacheReadUsdPerMillion', 'cacheWriteUsdPerMillion', 'inputModalities', 'outputModalities', 'openWeights', 'license', 'reasoning', 'benchmarks', 'sourceRefs'], 'Variant');
  string(value.variantId, 'variantId'); string(value.name, 'Variant.name');
  nullable(value.pricing, assertModelPricing, 'Variant.pricing');
  for (const key of NUMERIC_MODEL_FIELDS) nullable(value[key], key === 'contextTokens' ? integer : number, key);
  for (const key of ['cacheReadUsdPerMillion', 'cacheWriteUsdPerMillion']) nullable(value[key], decimal, key);
  for (const key of ['inputModalities', 'outputModalities']) list(value[key], (item, field) => oneOf(item, MODALITIES, field), key, { unique: true });
  nullable(value.openWeights, boolean, 'openWeights'); nullable(value.license, string, 'license'); boolean(value.reasoning, 'reasoning');
  list(value.benchmarks, (item, field) => {
    object(item, ['name', 'value', 'sourceRefs'], field); string(item.name, 'benchmark.name');
    number(item.value, 'benchmark.value'); sourceRefs(item.sourceRefs);
  }, 'benchmarks'); sourceRefs(value.sourceRefs);
  if (value.pricing && (value.pricing.variantId !== value.variantId || value.pricing.reasoning !== value.reasoning)) fail('Variant.pricing', 'identidade/raciocínio divergentes');
  return value;
}
export function assertModel(value) {
  object(value, ['schemaVersion', 'modelId', 'companyId', 'name', 'releaseDates', 'variants', 'sourceRefs'], 'Model');
  oneOf(value.schemaVersion, [1], 'Model.schemaVersion');
  for (const key of ['modelId', 'companyId', 'name']) string(value[key], `Model.${key}`);
  object(value.releaseDates, ['artificialAnalysis', 'huggingFace', 'openRouter'], 'releaseDates');
  for (const key of Object.keys(value.releaseDates)) nullable(value.releaseDates[key], utc, key);
  list(value.variants, assertVariant, 'variants', { nonempty: true }); uniqueIds(value.variants, 'variantId', 'variants');
  for (const variant of value.variants) if (variant.pricing && variant.pricing.modelId !== value.modelId) fail('pricing.modelId', 'família divergente');
  sourceRefs(value.sourceRefs); return value;
}
export function assertModels(value) {
  list(value, assertModel, 'models'); uniqueIds(value, 'modelId', 'models');
  uniqueIds(value.flatMap(model => model.variants), 'variantId', 'variants globais'); return value;
}
