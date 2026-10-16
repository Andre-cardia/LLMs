// Única fonte de dados do navegador enquanto Q2 estiver aberto (AD-21).
// Fornece as quatro portas que SnapshotReader e LocalNewsView esperam a partir
// do dataset sintético empacotado, e exporta o único marcador de procedência
// que a interface exibe. Nada aqui escreve em armazenamento, faz fetch ou
// importa src/adapters/ ou node:* (AD-20, AD-25).
//
// O manifesto v2 é gerado em tempo de execução — nunca literal — com os mesmos
// bytes de envelope que o Publisher grava (envelopeBytes) e o digest calculado
// pela porta injetada (webDigest no navegador, sha256Text em teste).
import { SYNTHETIC_FIXTURE } from '../contracts/provenance.mjs';
import { assertManifest, assertSnapshotData, envelopeBytes, toManifestResponse, MANIFEST_VERSION, SLICES } from '../contracts/snapshot.mjs';
import { clone, freeze, utc } from '../contracts/primitives.mjs';
import { SYNTHETIC_WORKSPACE } from './fixtures/synthetic-workspace.mjs';

export const provenance = SYNTHETIC_FIXTURE;
export const FIXTURE_REVISION = 'fixture-1';
const FIXTURE_CURATION_REVISION = 'fixture-curation-1';

export function createFixtureSource({ digest, dataset = SYNTHETIC_WORKSPACE } = {}) {
  if (typeof digest !== 'function') throw new TypeError('createFixtureSource: digest deve ser função');
  if (!dataset || typeof dataset !== 'object' || dataset.provenance !== SYNTHETIC_FIXTURE) {
    throw new TypeError(`createFixtureSource: dataset sem marcador de procedência ${SYNTHETIC_FIXTURE}`);
  }
  // Validação na borda com TypeError consistente, antes de clonar ou congelar.
  for (const key of ['catalog', 'models', 'news']) if (!Object.hasOwn(dataset, key)) throw new TypeError(`createFixtureSource: dataset sem ${key}`);
  const now = dataset.now; utc(now, 'now');
  // Cópia própria e congelada: o dataset de origem nunca é exposto por referência.
  let data;
  try { data = freeze(clone({ catalog: dataset.catalog, models: dataset.models, news: dataset.news })); }
  catch (error) { throw new TypeError(`createFixtureSource: dataset não clonável: ${error.message}`); }
  assertSnapshotData(data);
  const bytes = Object.freeze(Object.fromEntries(SLICES.map(slice => [slice, envelopeBytes(slice, data[slice])])));

  let manifest = null;
  // Construído uma vez, de forma preguiçosa; uma falha da porta não fica memorizada.
  function buildManifest() {
    manifest ??= (async () => {
      const entries = await Promise.all(SLICES.map(async slice => {
        const hex = await digest(bytes[slice]);
        return [slice, { objectKey: hex, digest: hex, lastSuccessAt: now }];
      }));
      const built = { schemaVersion: MANIFEST_VERSION, revision: FIXTURE_REVISION, curationRevision: FIXTURE_CURATION_REVISION,
        publishedAt: now, slices: Object.fromEntries(entries), companyMergedInto: [] };
      return freeze(assertManifest(built));
    })().catch(error => { manifest = null; throw error; });
    return manifest;
  }

  // Formato externo (AD-27): a mesma projeção que a Lambda de leitura devolve.
  async function readManifest() {
    return toManifestResponse(clone(await buildManifest()));
  }
  async function readSlice(revision, slice) {
    if (revision !== FIXTURE_REVISION) throw new Error('SNAPSHOT_NOT_FOUND');
    if (!SLICES.includes(slice)) throw new Error('SLICE_NOT_FOUND');
    return bytes[slice];
  }
  // `items` são as matérias canônicas do ledger de feedback, o mesmo formato que
  // MemoryNews.read devolve; sem feedback confirmado, nada fica oculto.
  async function readFeedback() {
    return { feedbackRevision: 0, items: clone(data.news), hiddenNewsIds: [] };
  }
  // O dataset sintético não tem matérias sindicadas: cada newsId é o próprio
  // alias. Merge de aliases é testado contra MemoryNews, não aqui.
  async function resolveAlias(newsId) {
    const item = data.news.find(entry => entry.newsId === newsId);
    return item ? clone(item) : null;
  }
  return Object.freeze({ provenance, readManifest, readSlice, readFeedback, resolveAlias });
}
