import { assertModels } from '../contracts/models.mjs';
import { assertNews } from '../contracts/news.mjs';
import { assertSnapshotData } from '../contracts/snapshot.mjs';
import { evaluateCollection } from '../domain/collection-guard.mjs';
import { clone, string, utc, integer, canonicalJson, requireSynchronous } from '../contracts/primitives.mjs';
// Portas locais com prazo; nenhum fetch externo embutido.
export class LocalUpdate {
  #snapshots; #control; #clock; #timeout;
  constructor({ snapshots, control, clock, attemptTimeoutMs = 5000 }) {
    integer(attemptTimeoutMs, 'attemptTimeoutMs', 1);if(attemptTimeoutMs>30000)throw new TypeError('attemptTimeoutMs acima do limite');
    this.#snapshots = snapshots; this.#control = control; this.#clock = clock; this.#timeout = attemptTimeoutMs;
  }
  async #attempt(port) {
    const controller = new AbortController(); let timer;
    try { return await Promise.race([Promise.resolve().then(() => port({ signal: controller.signal })),
      new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('SOURCE_TIMEOUT')); }, this.#timeout); })]); }
    finally { clearTimeout(timer); }
  }
  async run({ runId, modelsSourceId, scope, fetchModels, fetchNews, context, prepareCuration = () => {}, reconcileNews = null }) {
    string(runId, 'runId'); string(modelsSourceId, 'modelsSourceId'); string(scope, 'scope');
    this.#snapshots.assertUpdateAccess(context);
    const cached = this.#control.read().completedUpdates?.get(runId);
    if (cached) {
      if (cached.modelsSourceId !== modelsSourceId || cached.scope !== scope) throw new Error('UPDATE_IDEMPOTENCY_CONFLICT');
      return clone(cached.result);
    }
    const lease = this.#snapshots.acquireLease('snapshot', runId, 60000, context);
    try {
      const before = this.#control.read();
      const previous = before.lastPublishedInput ?? { models: [], news: [], lastSuccessAt: { catalog: null, models: null, news: null } };
      const [modelsAttempt, newsAttempt] = await Promise.allSettled([this.#attempt(fetchModels), this.#attempt(fetchNews)]);
      const now = this.#clock(); utc(now, 'clock');
      const baselineKey = canonicalJson([modelsSourceId, scope, 1]);
      let modelsOutcome = 'failed'; let newsOutcome = 'failed';
      const manifest = this.#snapshots.publish({ expectedRevision: before.snapshotRevision, lease, models: previous.models, news: previous.news, lastSuccessAt: previous.lastSuccessAt }, context, state => {
        const prepared = prepareCuration(state);
        requireSynchronous(prepared,'ASYNC_CURATION_FORBIDDEN');
        let models = previous.models; let news = previous.news; const lastSuccessAt = clone(previous.lastSuccessAt);
        if (modelsAttempt.status === 'fulfilled') {
          try {
            assertModels(modelsAttempt.value);
            assertSnapshotData({ catalog: state.catalog, models: modelsAttempt.value, news: [] });
            const incoming = { sourceId: modelsSourceId, scope, schemaVersion: 1, mode: 'full', items: modelsAttempt.value };
            const evaluated = evaluateCollection(incoming, state.modelCollections?.get(baselineKey) ?? null); modelsOutcome = evaluated.reason;
            if (evaluated.accepted) {
              const collections=clone(state.modelCollections??new Map());collections.set(baselineKey,clone(incoming));const combined=new Map();
              for(const c of collections.values())for(const m of c.items){const existing=combined.get(m.modelId);if(existing&&canonicalJson(existing)!==canonicalJson(m))throw new Error('SOURCE_COLLECTION_CONFLICT');combined.set(m.modelId,m);}
              const candidate=[...combined.values()];assertSnapshotData({catalog:state.catalog,models:candidate,news:[]});
              models=clone(candidate);lastSuccessAt.models=now;state.modelCollections=collections;
            }
          } catch(error) { modelsOutcome = error.message==='SOURCE_COLLECTION_CONFLICT'?'source-conflict':'schema-invalid'; }
        }
        if (newsAttempt.status === 'fulfilled') {
          try {
            assertNews(newsAttempt.value);
            assertSnapshotData({ catalog: state.catalog, models: [], news: newsAttempt.value });
            const newsDraft=clone(state);
            const selectedNews=reconcileNews ? reconcileNews(newsDraft,newsAttempt.value) : [...new Map([...previous.news, ...newsAttempt.value].map(item => [item.newsId, item])).values()];
            requireSynchronous(selectedNews,'ASYNC_NEWS_FORBIDDEN');assertNews(selectedNews);assertSnapshotData({catalog:state.catalog,models:[],news:selectedNews});
            news=clone(selectedNews);if(reconcileNews&&Object.hasOwn(newsDraft,'newsIndex'))state.newsIndex=clone(newsDraft.newsIndex);
            lastSuccessAt.news = now; newsOutcome = 'incremental-valid';
          } catch { news=previous.news;newsOutcome = 'schema-invalid'; }
        }
        return { models, news, lastSuccessAt };
      }, (state, published) => {
        state.completedUpdates ??= new Map();
        state.completedUpdates.set(runId, { modelsSourceId, scope, result: clone({ manifest: published, modelsOutcome, newsOutcome }) });
      });
      return { manifest, modelsOutcome, newsOutcome };
    } finally { this.#snapshots.releaseLease(lease, context); }
  }
}
