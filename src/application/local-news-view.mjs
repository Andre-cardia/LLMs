import {object, integer, list, string, utc, clone} from '../contracts/primitives.mjs';
import {assertNews} from '../contracts/news.mjs';
import {assertExplorationSnapshot} from '../contracts/exploration.mjs';
import {assertNavigationTarget} from '../contracts/navigation.mjs';
import {assertSearchContext} from '../contracts/search.mjs';
import {newsProjection, visibleNews} from '../domain/news-projections.mjs';
import {globalSearch, resolveNavigation} from '../domain/global-search.mjs';

// O frame pode conter referências compartilhadas válidas; percorrer cada identidade uma vez.
function freeze(value, seen = new WeakSet()) {
  if (value && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const child of Object.values(value)) freeze(child, seen);
    Object.freeze(value);
  }
  return value;
}

// Une a revisão privada completa ao ledger de feedback atual antes de expor projeções.
export class LocalNewsView {
  #snapshot; #feedback; #resolve; #clock;
  constructor({readSnapshot, readFeedback, resolveAlias, clock}) {
    this.#snapshot = readSnapshot; this.#feedback = readFeedback;
    this.#resolve = resolveAlias; this.#clock = clock;
  }
  async #frame() {
    const snapshot = await this.#snapshot();
    if (!snapshot) throw new Error('SNAPSHOT_UNAVAILABLE');
    assertExplorationSnapshot(snapshot);
    // Capturar antes de outra espera, inclusive para portas que devolvem objetos mutáveis.
    const data = clone(snapshot), feedback = await this.#feedback();
    object(feedback, ['feedbackRevision','items','hiddenNewsIds'], 'NewsFeedbackView');
    integer(feedback.feedbackRevision, 'feedbackRevision'); assertNews(feedback.items);
    list(feedback.hiddenNewsIds, string, 'hiddenNewsIds', {unique:true});
    const now = this.#clock(); utc(now);
    const context = {dataRevision:data.manifest.revision,feedbackRevision:feedback.feedbackRevision};
    assertSearchContext(context);
    return freeze({data,now,hiddenNewsIds:clone(feedback.hiddenNewsIds),...context});
  }
  async #alias(target) {
    assertNavigationTarget(target);
    const copy = clone(target);
    if (copy.type !== 'news') return copy;
    const item = await this.#resolve(copy.newsId);
    return item ? {...copy,newsId:item.newsId} : null;
  }
  // Uma única captura alimenta matching, revalidação e advanceSnapshot do consumidor.
  // Resolver aliases ANTES da captura evita reutilizar feedback anterior à espera.
  async frame(target = null) {
    const resolved = target === null ? null : await this.#alias(target);
    const frame = await this.#frame();
    const navigation = resolved === null ? {status:'unavailable'} : resolveNavigation(frame.data, resolved, frame);
    return freeze({...frame,navigation});
  }
  async project(options) {
    const selected = options.selectedNewsId ? (await this.#resolve(options.selectedNewsId))?.newsId ?? null : null;
    const f = await this.#frame();
    return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,items:newsProjection(f.data.news, {...options,selectedNewsId:selected,now:f.now,hiddenNewsIds:f.hiddenNewsIds})};
  }
  async search(query) {
    const f = await this.frame();
    return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,results:globalSearch(f.data, query, f)};
  }
  async navigate(target) {
    const f = await this.frame(target);
    return {...f.navigation,dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision};
  }
  async context() {
    const f = await this.#frame();
    return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,news:visibleNews(f.data.news, f)};
  }
}
