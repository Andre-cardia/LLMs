// Contratos do manifesto (AD-2, AD-27), num módulo folha que só depende de
// primitives.mjs: a Lambda de leitura (src/adapters/lambda/snapshot-reader.mjs)
// importa estes mesmos validadores e scripts/render-auth-stack.mjs os empacota
// no código inline. src/contracts/snapshot.mjs reexporta tudo daqui.
//
// PublishedManifest (interno, com objectKey) só circula entre Publisher, bucket
// e Lambda. ManifestResponse (externo, sem objectKey) é o que o navegador e o
// SnapshotReader recebem.
import { object, string, oneOf, nullable, list, utc, fail } from './primitives.mjs';

export const SLICES = Object.freeze(['catalog', 'models', 'news']);
export const MANIFEST_VERSION = 2;
export const MAX_COMPANY_MERGES = 10000;
// Revisão endereçável por URL (AD-27). Só ".", ".." e afins também são recusados:
// casam o padrão, mas o navegador os normalizaria como segmentos de caminho.
export const REVISION_PATTERN = Object.freeze(/^[A-Za-z0-9._-]{1,128}$/);
// As três últimas revisões continuam legíveis (AD-27).
export const READABLE_REVISIONS = 3;
export const POINTER_VERSION = 1;
const DIGEST = /^[a-f0-9]{64}$/;
const MERGE_FIELD = 'INVALID_MERGE_TABLE';

export function assertRevision(value, field = 'revision') {
  if (typeof value !== 'string' || !REVISION_PATTERN.test(value) || /^\.+$/.test(value)) fail(field);
  return value;
}
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
const MANIFEST_FIELDS = ['schemaVersion', 'revision', 'curationRevision', 'publishedAt', 'slices', 'companyMergedInto'];
// PublishedManifest, interno (com objectKey). Formato inalterado.
export function assertManifest(value) {
  object(value, MANIFEST_FIELDS, 'Manifest');
  // O Publisher só grava revisões que a leitura externa aceita (AD-27).
  oneOf(value.schemaVersion, [MANIFEST_VERSION], 'schemaVersion'); assertRevision(value.revision, 'revision'); string(value.curationRevision, 'curationRevision');
  utc(value.publishedAt, 'publishedAt'); object(value.slices, SLICES, 'slices');
  for (const slice of SLICES) {
    const ref = value.slices[slice]; object(ref, ['objectKey', 'digest', 'lastSuccessAt'], `slices.${slice}`);
    string(ref.objectKey, 'objectKey'); if (!DIGEST.test(ref.digest)) fail('digest');
    nullable(ref.lastSuccessAt, utc, 'lastSuccessAt');
  }
  assertCompanyMergedInto(value.companyMergedInto);
  return value;
}
// ManifestResponse, externo (AD-27): sem objectKey; revisão endereçável por URL.
export function assertManifestResponse(value) {
  object(value, MANIFEST_FIELDS, 'ManifestResponse');
  oneOf(value.schemaVersion, [MANIFEST_VERSION], 'schemaVersion'); assertRevision(value.revision, 'revision'); string(value.curationRevision, 'curationRevision');
  utc(value.publishedAt, 'publishedAt'); object(value.slices, SLICES, 'slices');
  for (const slice of SLICES) {
    const ref = value.slices[slice]; object(ref, ['digest', 'lastSuccessAt'], `slices.${slice}`);
    if (!DIGEST.test(ref.digest)) fail('digest');
    nullable(ref.lastSuccessAt, utc, 'lastSuccessAt');
  }
  assertCompanyMergedInto(value.companyMergedInto);
  return value;
}
// Projeção única do interno para o externo: cópia nova, sem objectKey, validada.
export function toManifestResponse(manifest) {
  assertManifest(manifest);
  const slices = {};
  for (const slice of SLICES) slices[slice] = { digest: manifest.slices[slice].digest, lastSuccessAt: manifest.slices[slice].lastSuccessAt };
  return assertManifestResponse({
    schemaVersion: manifest.schemaVersion, revision: manifest.revision, curationRevision: manifest.curationRevision,
    publishedAt: manifest.publishedAt, slices,
    companyMergedInto: manifest.companyMergedInto.map(entry => ({ fromCompanyId: entry.fromCompanyId, toCompanyId: entry.toCompanyId }))
  });
}
// Ponteiro manifest/current.json do bucket: revisão corrente e as legíveis,
// da mais nova para a mais velha. Só o Publisher (Q2) o grava, por CAS.
export function assertSnapshotPointer(value) {
  object(value, ['schemaVersion', 'revision', 'readableRevisions'], 'SnapshotPointer');
  oneOf(value.schemaVersion, [POINTER_VERSION], 'schemaVersion'); assertRevision(value.revision, 'revision');
  list(value.readableRevisions, (revision, field) => assertRevision(revision, field), 'readableRevisions', { unique: true, nonempty: true });
  if (value.readableRevisions.length > READABLE_REVISIONS) fail('readableRevisions', `mais de ${READABLE_REVISIONS}`);
  if (value.readableRevisions[0] !== value.revision) fail('readableRevisions', 'primeira diferente da corrente');
  return value;
}
