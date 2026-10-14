import { assertCatalog } from './catalog.mjs';
import { assertModels } from './models.mjs';
import { assertNews } from './news.mjs';
import { object, string, oneOf, nullable, list, utc, fail } from './primitives.mjs';
export const SLICE_VALIDATORS = Object.freeze({ catalog: assertCatalog, models: assertModels, news: assertNews });
export const SLICES = Object.freeze(Object.keys(SLICE_VALIDATORS));
export const MANIFEST_VERSION = 2;
export const MAX_COMPANY_MERGES = 10000;
const MERGE_FIELD = 'INVALID_MERGE_TABLE';
// Validador único da tabela acumulada e compactada (AD-2): Publisher, SnapshotReader e reducer.
// Sem nextCompanyIds valida só a forma; com ele, exige from ausente e to (não nulo) presente no catálogo novo.
export function assertCompanyMergedInto(entries, { nextCompanyIds } = {}) {
  if (!Array.isArray(entries)) fail(MERGE_FIELD, 'array exigido');
  if (entries.length > MAX_COMPANY_MERGES) fail(MERGE_FIELD, `mais de ${MAX_COMPANY_MERGES} entradas`);
  const targets = new Map();
  list(entries, (entry, field) => {
    object(entry, ['fromCompanyId', 'toCompanyId'], field);
    string(entry.fromCompanyId, `${field}.fromCompanyId`); nullable(entry.toCompanyId, string, `${field}.toCompanyId`);
    if (entry.fromCompanyId === entry.toCompanyId) fail(field, 'from igual a to');
    if (targets.has(entry.fromCompanyId)) fail(field, 'from duplicado');
    targets.set(entry.fromCompanyId, entry.toCompanyId);
  }, MERGE_FIELD);
  for (const to of targets.values()) if (to !== null && targets.has(to)) fail(MERGE_FIELD, 'tabela não compactada');
  if (nextCompanyIds !== undefined) {
    const next = nextCompanyIds instanceof Set ? nextCompanyIds : new Set(nextCompanyIds);
    for (const [from, to] of targets) {
      if (next.has(from)) fail(MERGE_FIELD, 'from presente no catálogo novo');
      if (to !== null && !next.has(to)) fail(MERGE_FIELD, 'to ausente do catálogo novo');
    }
  }
  return entries;
}
export function assertManifest(value) {
  object(value, ['schemaVersion', 'revision', 'curationRevision', 'publishedAt', 'slices', 'companyMergedInto'], 'Manifest');
  oneOf(value.schemaVersion, [MANIFEST_VERSION], 'schemaVersion'); string(value.revision, 'revision'); string(value.curationRevision, 'curationRevision');
  utc(value.publishedAt, 'publishedAt'); object(value.slices, SLICES, 'slices');
  for (const slice of SLICES) {
    const ref = value.slices[slice]; object(ref, ['objectKey', 'digest', 'lastSuccessAt'], `slices.${slice}`);
    string(ref.objectKey, 'objectKey'); if (!/^[a-f0-9]{64}$/.test(ref.digest)) fail('digest');
    nullable(ref.lastSuccessAt, utc, 'lastSuccessAt');
  }
  assertCompanyMergedInto(value.companyMergedInto);
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
