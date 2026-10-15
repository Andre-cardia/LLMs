// Raiz de composição única da página (AD-23 e convenções Composição, Efeitos e
// Ordem de snapshots do spine do Epic 7). Cria exatamente uma instância de cada
// colaborador — reader, view, store, busca e escritor de endereço — a partir das
// portas injetadas e as possui até o descarte. Não toca `window`: `history`,
// `location`, `storage`, `clock`, `digest` e `source` chegam por `ports`
// (src/ui/main.mjs é o único arquivo que lê o navegador).
import {EXPLORATION_VERSION, PREFERENCE_KEYS, assertPreferences} from '../contracts/exploration.mjs';
import {AccessDeniedError} from '../contracts/access.mjs';
import {DEFAULT_PREFERENCES} from '../domain/exploration-state.mjs';
import {explorationQuery} from '../domain/exploration-url.mjs';
import {createExplorationStore} from '../application/exploration-store.mjs';
import {SnapshotReader} from '../application/snapshot-reader.mjs';
import {LocalNewsView} from '../application/local-news-view.mjs';
import {LocalSearch} from '../application/local-search.mjs';
import {createAddressWriter} from './address-writer.mjs';

export const PREFERENCES_STORAGE_KEY = 'llms.preferences';
const CONFIG = Object.freeze({schemaVersion:EXPLORATION_VERSION, initialBase:'MAPA', availableBases:Object.freeze(['MAPA','SAT'])});
const intent = fields => ({schemaVersion:EXPLORATION_VERSION, ...fields});
// Intents que só a raiz despacha (AD-19, Ordem de snapshots); a página não pode enviá-los.
const ROOT_ONLY = Object.freeze(['hydrateUrl', 'advanceSnapshot']);

// Preferências duráveis: JSON inválido, formato errado ou storage inacessível
// caem em DEFAULT_PREFERENCES, sem lançar.
function readPreferences(storage) {
  try {
    const raw = storage.getItem(PREFERENCES_STORAGE_KEY);
    if (raw === null || raw === undefined) return DEFAULT_PREFERENCES;
    return assertPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
function pickPreferences(preferences) {
  return Object.fromEntries(PREFERENCE_KEYS.map(key => [key, preferences[key]]));
}

// `internals` é só costura de teste: permite embrulhar as fábricas de store e
// de busca para observar a ordem de inscrição e de descarte. A raiz continua
// criando uma instância de cada.
export function createBrowserShell(ports, internals = {}) {
  const {history, location, storage, clock, digest, source} = ports ?? {};
  if (typeof history?.pushState !== 'function' || typeof history?.replaceState !== 'function') throw new TypeError('createBrowserShell: history');
  if (!location || typeof location.search !== 'string') throw new TypeError('createBrowserShell: location');
  if (typeof storage?.getItem !== 'function' || typeof storage?.setItem !== 'function') throw new TypeError('createBrowserShell: storage');
  if (typeof clock !== 'function') throw new TypeError('createBrowserShell: clock');
  if (typeof digest !== 'function') throw new TypeError('createBrowserShell: digest');
  for (const port of ['readManifest','readSlice','readFeedback','resolveAlias']) {
    if (typeof source?.[port] !== 'function') throw new TypeError(`createBrowserShell: source.${port}`);
  }
  if (typeof source.provenance !== 'string' || !source.provenance) throw new TypeError('createBrowserShell: source.provenance');
  const createStore = internals.createStore ?? createExplorationStore;
  const createSearch = internals.createSearch ?? (options => new LocalSearch(options));

  let reader = new SnapshotReader({readManifest:source.readManifest, readSlice:source.readSlice, digest});
  // A view lê sempre a revisão corrente do único reader; só a raiz chama refresh().
  let view = new LocalNewsView({readSnapshot:async () => reader?.current ?? null, readFeedback:source.readFeedback,
    resolveAlias:source.resolveAlias, clock});
  let store = null, search = null, writer = null;
  let unsubscribes = [];
  let status = 'idle', disposed = false;
  const cameraRequests = [];
  const MAX_CAMERA_REQUESTS = 32;

  function ensureAlive() {
    if (disposed) throw new Error('SHELL_DISPOSED');
  }
  function ensureReady() {
    ensureAlive();
    if (store === null) throw new Error(status === 'idle' || status === 'starting' ? 'SHELL_NOT_STARTED' : 'SHELL_UNAVAILABLE');
  }

  // Executor único dos efeitos de qualquer dispatch, inscrito depois do escritor.
  function effectsListener(state, meta) {
    for (const effect of meta.effects) {
      if (effect.type === 'persistPreferences') {
        // Só as chaves de PREFERENCE_KEYS, numa única entrada JSON (AD-21). Uma
        // escrita recusada (cota, modo privado) não derruba a interface.
        try { storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(pickPreferences(state.preferences))); } catch { /* ignorado */ }
      } else if (effect.type === 'camera') {
        // Sem renderer de Globo ainda: a requisição fica numa fila observável.
        cameraRequests.push(Object.freeze({...effect}));
        if (cameraRequests.length > MAX_CAMERA_REQUESTS) cameraRequests.shift();
      } else {
        throw new TypeError(`browser-shell: efeito desconhecido -- ${effect.type}`);
      }
    }
  }

  function compose(frame) {
    const created = createStore({data:frame.data, revision:frame.dataRevision, now:frame.now, config:CONFIG,
      hiddenNewsIds:frame.hiddenNewsIds, preferences:readPreferences(storage)});
    // O escritor parte do endereço que o navegador realmente mostra: um endereço
    // vazio ou não canônico é substituído pela forma canônica já na carga, para
    // que Voltar a esta entrada reidrate a seleção certa (company= vazio).
    const createdWriter = createAddressWriter({history, address:location.search});
    const subs = [];
    try {
      // Ordem fixa (AD-19): 1º escritor de endereço, 2º listener de efeitos.
      subs.push(created.subscribe(createdWriter), created.subscribe(effectsListener));
      const createdSearch = createSearch({view, store:created});
      created.dispatch(intent({type:'hydrateUrl', url:location.search}));
      store = created; writer = createdWriter; search = createdSearch; unsubscribes = subs;
    } catch (error) {
      for (const unsubscribe of subs) unsubscribe();
      created.dispose();
      throw error;
    }
  }
  async function start() {
    ensureAlive();
    if (status === 'starting' || status === 'updated') throw new Error('SHELL_ALREADY_STARTED');
    status = 'starting';
    const result = await reader.refresh();
    if (disposed) return {status:'disposed'};
    if (result.status === 'access-denied') { status = 'access-denied'; return {status}; }
    if (result.status !== 'updated') { status = 'unavailable'; return {status}; }
    let frame;
    try { frame = await view.frame(); }
    catch (error) {
      if (disposed) return {status:'disposed'};
      status = error instanceof AccessDeniedError ? 'access-denied' : 'unavailable';
      return {status};
    }
    if (disposed) return {status:'disposed'};
    try { compose(frame); } catch { status = 'unavailable'; return {status}; }
    status = 'updated';
    return {status};
  }

  function onPopState() {
    ensureReady();
    // O escritor compara com o endereço hidratado e nunca empilha (hydrateUrl → replace).
    try { store.dispatch(intent({type:'hydrateUrl', url:location.search})); } catch { /* URL fora do contrato: estado mantido */ }
    return store.getState();
  }

  async function refresh() {
    const currentReader = reader, currentView = view;
    const result = await currentReader.refresh();
    if (disposed) return {status:'disposed'};
    if (result.status === 'access-denied') { dispose('access-denied'); return {status:'access-denied'}; }
    if (result.status !== 'updated') return {status:result.status};
    const revision = result.snapshot.manifest.revision;
    let frame;
    try { frame = await currentView.frame(); }
    catch (error) {
      if (disposed) return {status:'disposed'};
      if (error instanceof AccessDeniedError) { dispose('access-denied'); return {status:'access-denied'}; }
      return {status:'unavailable'};
    }
    if (disposed) return {status:'disposed'};
    // Ordem de snapshots (CR-04): só a revisão que ainda é a current do reader
    // neste instante, e só se diferente da do store.
    if (frame.dataRevision !== revision || currentReader.current?.manifest.revision !== revision) return {status:'stale'};
    if (store.getState().snapshotRevision === revision) return {status:'unchanged'};
    store.dispatch(intent({type:'advanceSnapshot', data:frame.data, revision, now:frame.now,
      hiddenNewsIds:frame.hiddenNewsIds, companyRemaps:frame.companyMergedInto}));
    return {status:'advanced', revision};
  }
  function refreshSnapshot() {
    ensureReady();
    return refresh();
  }

  const statusListeners = new Set();
  function dispose(reason = 'disposed') {
    if (disposed) return;
    disposed = true;
    // AD-23, nesta ordem: cancelar a Busca, desinscrever, descartar o store,
    // soltar reader e view (que guardam a última revisão lida).
    search?.cancel();
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
    store?.dispose();
    reader = null; view = null; store = null; search = null; writer = null;
    status = reason === 'access-denied' ? 'access-denied' : 'disposed';
    for (const listener of statusListeners) { try { listener(status); } catch { /* listener da página */ } }
    statusListeners.clear();
  }

  return Object.freeze({
    start,
    onPopState,
    refreshSnapshot,
    search(query) { ensureReady(); return search.search(query); },
    select(result) { ensureReady(); return search.select(result); },
    // Intents da própria página (ex. Camadas); efeitos ficam com o listener da raiz.
    dispatch(pageIntent) {
      ensureReady();
      if (ROOT_ONLY.includes(pageIntent?.type)) throw new Error('ROOT_ONLY_INTENT');
      return store.dispatch(pageIntent).state;
    },
    getState() { ensureReady(); return store.getState(); },
    // Aplica uma substituição de endereço pendente; o chamador agenda no máximo uma por quadro.
    flushAddress() { ensureAlive(); writer?.flush(); },
    get status() { return status; },
    get provenance() { return source.provenance; },
    get cameraRequests() { return Object.freeze([...cameraRequests]); },
    // O renderer futuro consome as requisições; a fila é limitada a 32.
    takeCameraRequests() { return Object.freeze(cameraRequests.splice(0)); },
    // A página observa o fim da sessão (descarte normal ou perda de permissão).
    onStatusChange(listener) { ensureAlive(); statusListeners.add(listener); return () => statusListeners.delete(listener); },
    dispose: () => dispose()
  });
}
