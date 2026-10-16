import { assertCatalog } from './catalog.mjs';
import { assertModels } from './models.mjs';
import { assertNews } from './news.mjs';
import { object, oneOf, fail, canonicalJson } from './primitives.mjs';
import { SLICES } from './manifest.mjs';
// Manifesto interno/externo, revisão e tabela de merges moram no módulo folha
// manifest.mjs (a Lambda de leitura o empacota sem os validadores de slice).
export { SLICES, MANIFEST_VERSION, MAX_COMPANY_MERGES, REVISION_PATTERN, READABLE_REVISIONS, POINTER_VERSION,
  assertRevision, assertCompanyMergedInto, assertManifest, assertManifestResponse, toManifestResponse, assertSnapshotPointer } from './manifest.mjs';
export const SLICE_VALIDATORS = Object.freeze({ catalog: assertCatalog, models: assertModels, news: assertNews });
if (Object.keys(SLICE_VALIDATORS).join() !== SLICES.join()) throw new Error('SLICES divergente de SLICE_VALIDATORS');
export const ENVELOPE_VERSION = 1;
// Helper único dos bytes de envelope de slice: Publisher (MemorySnapshots) e
// fonte sintética do navegador (src/ui/fixture-source.mjs) gravam/servem
// exatamente esta saída, e o digest do manifesto é calculado sobre ela.
export function envelopeBytes(slice, data) {
  return canonicalJson({ schemaVersion: ENVELOPE_VERSION, slice, data });
}
export function assertEnvelope(value, expectedSlice) {
  object(value, ['schemaVersion', 'slice', 'data'], 'Envelope');
  oneOf(value.schemaVersion, [ENVELOPE_VERSION], 'schemaVersion'); oneOf(value.slice, SLICES, 'slice');
  if (value.slice !== expectedSlice) fail('slice', 'fronteira divergente');
  SLICE_VALIDATORS[expectedSlice](value.data); return value;
}
export function assertSnapshotData({ catalog, models, news }) {
  assertCatalog(catalog); assertModels(models); assertNews(news);
  const companies = new Set(catalog.companies.map(company => company.id));
  for (const model of models) if (!catalog.companies.some(company => company.id === model.companyId && company.isLab)) fail('models', 'Empresa ausente');
  for (const item of news) for (const id of [...item.relevantCompanyIds, ...item.citedCompanyIds]) if (!companies.has(id)) fail('news', 'Empresa ausente');
}
