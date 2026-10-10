import { assertCatalog } from './catalog.mjs';
import { assertModels } from './models.mjs';
import { assertNews } from './news.mjs';
import { object, string, oneOf, nullable, utc, fail } from './primitives.mjs';
export const SLICE_VALIDATORS = Object.freeze({ catalog: assertCatalog, models: assertModels, news: assertNews });
export const SLICES = Object.freeze(Object.keys(SLICE_VALIDATORS));
export function assertManifest(value) {
  object(value, ['schemaVersion', 'revision', 'curationRevision', 'publishedAt', 'slices'], 'Manifest');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); string(value.revision, 'revision'); string(value.curationRevision, 'curationRevision');
  utc(value.publishedAt, 'publishedAt'); object(value.slices, SLICES, 'slices');
  for (const slice of SLICES) {
    const ref = value.slices[slice]; object(ref, ['objectKey', 'digest', 'lastSuccessAt'], `slices.${slice}`);
    string(ref.objectKey, 'objectKey'); if (!/^[a-f0-9]{64}$/.test(ref.digest)) fail('digest');
    nullable(ref.lastSuccessAt, utc, 'lastSuccessAt');
  }
  return value;
}
export function assertEnvelope(value, expectedSlice) {
  object(value, ['schemaVersion', 'slice', 'data'], 'Envelope');
  oneOf(value.schemaVersion, [1], 'schemaVersion'); oneOf(value.slice, SLICES, 'slice');
  if (value.slice !== expectedSlice) fail('slice', 'fronteira divergente');
  SLICE_VALIDATORS[expectedSlice](value.data); return value;
}
export function assertSnapshotData({ catalog, models, news }) {
  assertCatalog(catalog); assertModels(models); assertNews(news);
  const companies = new Set(catalog.companies.map(company => company.id));
  for (const model of models) if (!catalog.companies.some(company => company.id === model.companyId && company.isLab)) fail('models', 'Empresa ausente');
  for (const item of news) for (const id of [...item.relevantCompanyIds, ...item.citedCompanyIds]) if (!companies.has(id)) fail('news', 'Empresa ausente');
}
