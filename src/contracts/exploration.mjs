import {object, oneOf, boolean, string, list, integer, utc, fail, canonicalJson} from './primitives.mjs';
import {LAYERS} from './catalog.mjs';
import {assertNavigationTarget} from './navigation.mjs';
import {assertSnapshotData, assertCompanyMergedInto} from './snapshot.mjs';

export const EXPLORATION_VERSION = 2;
export const BASES = Object.freeze(['MAPA', 'SAT']);
export const TABS = Object.freeze(['globe', 'models', 'news']);
export const PREFERENCE_KEYS = Object.freeze(['theme','mode','readerLayout','tableStyle','leftTab','feedLabsOnly','soundTyping','soundAmbient','layers','favorites']);

// Fronteira JSON local: recusa comportamento herdado ANTES de percorrer arrays.
// Não constitui isolamento de Proxy hostil nem de um ambiente global adulterado.
export function assertExplorationData(value, field = 'payload', seen = new Set()) {
  // Cache por chamada: altura máxima do subgrafo já validado, nunca o caminho ativo.
  const heights = new WeakMap();
  function visit(item, name) {
    if (item === null || ['string', 'boolean'].includes(typeof item)) return 0;
    if (typeof item === 'number' && Number.isFinite(item)) return 0;
    if (!item || typeof item !== 'object' || seen.has(item)) fail(name, 'dados simples exigidos');
    const cachedHeight = heights.get(item);
    if (cachedHeight !== undefined) {
      // Uma referência vista perto da raiz pode reaparecer num caminho mais profundo.
      if (seen.size + cachedHeight > 128) fail(name, 'profundidade excessiva');
      return cachedHeight;
    }
    if (seen.size >= 128) fail(name, 'profundidade excessiva');
    seen.add(item);
    let height = 1;
    const child = (value, field) => { height = Math.max(height, 1 + visit(value, field)); };
    try {
      if (Array.isArray(item)) {
        if (Object.getPrototypeOf(item) !== Array.prototype) fail(name, 'protótipo de array incompatível');
        list(item, child, name);
      } else {
        const keys = Reflect.ownKeys(item);
        if (keys.some(key => typeof key !== 'string')) fail(name, 'campos incompatíveis');
        object(item, keys, name);
        for (const key of keys) child(item[key], `${name}.${key}`);
      }
      heights.set(item, height);
      return height;
    } finally {
      seen.delete(item);
    }
  }
  visit(value, field);
  return value;
}
export function assertPreference(field, value) {
  oneOf(field, PREFERENCE_KEYS, 'field');
  assertExplorationData(value, field);
  const choices = {theme:['artificial-analysis','osiris','ambar','noturna'],mode:['dark','light'],readerLayout:['side','floating'],tableStyle:['hybrid','terminal','analytic'],leftTab:['flux','labs']};
  if (choices[field]) oneOf(value, choices[field], field);
  else if (['feedLabsOnly','soundTyping','soundAmbient'].includes(field)) boolean(value, field);
  else if (field === 'layers') list(value, (v, f) => oneOf(v, LAYERS, f), field, {unique:true});
  else list(value, string, field, {unique:true});
  return value;
}
export function assertPreferences(value) {
  object(value, PREFERENCE_KEYS, 'Preferences');
  for (const key of PREFERENCE_KEYS) assertPreference(key, value[key]);
  return value;
}
export function assertExplorationVersion(value) {
  return oneOf(value, [EXPLORATION_VERSION], 'Exploration.schemaVersion');
}
export function assertExplorationConfig(config) {
  assertExplorationData(config, 'config');
  object(config, ['schemaVersion','initialBase','availableBases'], 'ExplorationConfig');
  assertExplorationVersion(config.schemaVersion);
  list(config.availableBases, (v, f) => oneOf(v, BASES, f), 'availableBases', {unique:true, nonempty:true});
  oneOf(config.initialBase, config.availableBases, 'initialBase');
  return config;
}
export function assertExplorationSnapshot(data) {
  assertExplorationData(data, 'snapshot');
  assertSnapshotData(data);
  return data;
}
export function assertExplorationUrl(url) {
  if (url !== '') string(url, 'url', 4096);
  const parsed = new URL(url, 'https://example.invalid');
  oneOf(parsed.protocol, ['http:', 'https:'], 'url.protocol');
  return parsed;
}
export function assertExplorationUrlContext(context) {
  assertExplorationData(context, 'urlContext');
  object(context, ['companyIds','config'], 'urlContext');
  assertExplorationConfig(context.config);
  list(context.companyIds, string, 'companyIds', {unique:true});
  return context;
}
export function assertExplorationOptions(options) {
  // Os únicos undefined aceitos são opcionais conhecidos, após validar descritores.
  if (!options || typeof options !== 'object') fail('options');
  const keys = Reflect.ownKeys(options);
  object(options, keys, 'options');
  const required = ['data','revision','now','config'];
  for (const key of keys) oneOf(key, [...required,'hiddenNewsIds','preferences','systemMode'], 'options.field');
  for (const key of required) if (!Object.hasOwn(options, key)) fail(`options.${key}`, 'obrigatório');
  for (const key of keys) {
    if (options[key] === undefined && !required.includes(key)) continue;
    assertExplorationData(options[key], `options.${key}`);
  }
  assertExplorationConfig(options.config);
  assertExplorationSnapshot(options.data);
  string(options.revision, 'revision'); utc(options.now, 'now');
  if (options.hiddenNewsIds !== undefined) list(options.hiddenNewsIds, string, 'hiddenNewsIds', {unique:true});
  if (options.preferences != null) assertPreferences(options.preferences);
  if (options.systemMode !== undefined) oneOf(options.systemMode, ['dark','light'], 'systemMode');
  return options;
}
const INTENT_FIELDS = Object.freeze({hydrateUrl:['url'],preference:['field','value'],tab:['tab'],base:['base'],company:['companyId'],panel:['panel'],openNews:['newsId'],camera:['companyId'],callback:['token','snapshotRevision','target'],escape:[],advanceSnapshot:['data','revision','now','hiddenNewsIds','companyRemaps'],navigate:['target']});
export const INTENT_TYPES = Object.freeze(Object.keys(INTENT_FIELDS));
export function assertExplorationIntent(intent) {
  assertExplorationData(intent, 'intent');
  if (!intent || typeof intent !== 'object') fail('intent');
  const descriptor = Object.getOwnPropertyDescriptor(intent, 'type');
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) fail('intent.type');
  oneOf(descriptor.value, Object.keys(INTENT_FIELDS), 'intent.type');
  object(intent, ['schemaVersion','type',...INTENT_FIELDS[descriptor.value]], 'intent');
  assertExplorationVersion(intent.schemaVersion);
  switch (intent.type) {
    case 'hydrateUrl': assertExplorationUrl(intent.url); break;
    case 'preference': assertPreference(intent.field, intent.value); break;
    case 'tab': oneOf(intent.tab, TABS, 'tab'); break;
    case 'base': oneOf(intent.base, BASES, 'base'); break;
    case 'company': if (intent.companyId !== null) string(intent.companyId, 'companyId'); break;
    case 'camera': string(intent.companyId, 'companyId'); break;
    case 'panel': oneOf(intent.panel, ['queue','markets',null], 'panel'); break;
    case 'openNews': string(intent.newsId, 'newsId'); break;
    case 'callback':
      integer(intent.token, 'token', 1); string(intent.snapshotRevision, 'snapshotRevision');
      oneOf(intent.target, ['terminal','reader','camera'], 'target'); break;
    case 'navigate': assertNavigationTarget(intent.target); break;
    case 'advanceSnapshot':
      string(intent.revision, 'revision'); utc(intent.now, 'now');
      list(intent.hiddenNewsIds, string, 'hiddenNewsIds', {unique:true});
      assertCompanyMergedInto(intent.companyRemaps);
      assertExplorationSnapshot(intent.data); break;
  }
  return intent;
}
function assertIndex(index) {
  object(index, ['companyIds','modelTargets','newsTargets','tickers'], 'index');
  list(index.companyIds, string, 'index.companyIds', {unique:true});
  const companyIds = new Set(index.companyIds);
  const company = id => { string(id, 'companyId'); if (!companyIds.has(id)) fail('companyId', 'Empresa ausente'); };
  const variants = new Set(), modelCompanies = new Map();
  list(index.modelTargets, target => {
    object(target, ['modelId','variantId','companyId'], 'modelTarget');
    company(target.companyId); string(target.modelId, 'modelId'); string(target.variantId, 'variantId');
    if (variants.has(target.variantId)) fail('index.modelTargets', 'variante duplicada');
    variants.add(target.variantId);
    if (modelCompanies.has(target.modelId) && modelCompanies.get(target.modelId) !== target.companyId) fail('index.modelTargets', 'Empresa divergente');
    modelCompanies.set(target.modelId, target.companyId);
  }, 'index.modelTargets');
  const news = new Set();
  list(index.newsTargets, target => {
    object(target, ['newsId','companyIds'], 'newsTarget'); string(target.newsId, 'newsId');
    if (news.has(target.newsId)) fail('index.newsTargets', 'ID duplicado');
    news.add(target.newsId);
    list(target.companyIds, company, 'newsTarget.companyIds', {unique:true, nonempty:true});
  }, 'index.newsTargets');
  const tickers = new Set();
  list(index.tickers, target => {
    object(target, ['companyId','symbol','exchange','currency'], 'ticker'); company(target.companyId);
    for (const key of ['symbol','exchange','currency']) string(target[key], key);
    if (tickers.has(target.companyId)) fail('index.tickers', 'Empresa duplicada');
    tickers.add(target.companyId);
  }, 'index.tickers');
}
export function assertExplorationState(state) {
  assertExplorationData(state, 'state');
  object(state, ['schemaVersion','config','preferences','sessionOverrides','sessionState','snapshotRevision','index','intentToken','terminal','sidePanel','readerNewsId','readerTyping','readerToken','cameraOperation','selectedModel','warning','effectiveState','readerLayoutEffective'], 'ExplorationState');
  assertExplorationVersion(state.schemaVersion); assertExplorationConfig(state.config); assertPreferences(state.preferences);
  string(state.snapshotRevision, 'snapshotRevision'); integer(state.intentToken, 'intentToken'); assertIndex(state.index);
  const company = id => { if (id !== null) { string(id, 'companyId'); oneOf(id, state.index.companyIds, 'companyId'); } };
  const contextFields = ['projection','base','tab','companyId'];
  object(state.sessionState, contextFields, 'sessionState');
  object(state.effectiveState, [...PREFERENCE_KEYS,...contextFields], 'effectiveState');
  const overrides = state.sessionOverrides;
  object(overrides, Object.keys(overrides), 'sessionOverrides');
  for (const [field, value] of Object.entries(overrides)) {
    oneOf(field, ['layers','base','tab','companyId'], 'sessionOverrides.field');
    if (field === 'layers') assertPreference(field, value);
    else if (field === 'base') oneOf(value, state.config.availableBases, field);
    else if (field === 'tab') oneOf(value, TABS, field);
    else company(value);
  }
  for (const context of [state.sessionState,state.effectiveState]) {
    oneOf(context.projection, ['3D'], 'projection'); oneOf(context.base, state.config.availableBases, 'base');
    oneOf(context.tab, TABS, 'tab'); company(context.companyId);
  }
  for (const key of PREFERENCE_KEYS) assertPreference(key, state.effectiveState[key]);
  const expected = {...state.preferences,...state.sessionState,...overrides};
  if (canonicalJson(expected) !== canonicalJson(state.effectiveState)) fail('effectiveState', 'derivação divergente');
  const token = value => {
    integer(value, 'operation.token', 1);
    if (value > state.intentToken) fail('operation.token', 'contador divergente');
  };
  if (state.terminal !== null) {
    object(state.terminal, ['companyId','typing','token'], 'terminal');
    company(state.terminal.companyId); boolean(state.terminal.typing, 'terminal.typing'); token(state.terminal.token);
    if (state.terminal.companyId === null || state.terminal.companyId !== expected.companyId || expected.tab !== 'globe') fail('terminal', 'seleção divergente');
  }
  oneOf(state.sidePanel, [null,'queue','markets','reader'], 'sidePanel');
  boolean(state.readerTyping, 'readerTyping'); integer(state.readerToken, 'readerToken');
  if (state.readerToken > state.intentToken) fail('readerToken', 'contador divergente');
  if (state.readerNewsId === null) {
    if (state.readerTyping || state.sidePanel === 'reader') fail('reader', 'Leitor ausente');
  } else {
    string(state.readerNewsId, 'readerNewsId'); token(state.readerToken);
    if (!state.index.newsTargets.some(n => n.newsId === state.readerNewsId)) fail('readerNewsId', 'Notícia ausente');
  }
  const layout = expected.tab === 'news' ? 'side' : state.preferences.readerLayout;
  if (state.readerLayoutEffective !== layout) fail('readerLayoutEffective', 'layout divergente');
  if ((state.readerNewsId !== null && layout === 'side') !== (state.sidePanel === 'reader')) fail('sidePanel', 'exclusividade divergente');
  if (state.cameraOperation !== null) {
    const operation = state.cameraOperation;
    object(operation, ['companyId','token','snapshotRevision','status'], 'cameraOperation');
    company(operation.companyId); token(operation.token); string(operation.snapshotRevision, 'camera.snapshotRevision');
    oneOf(operation.status, ['pending','completed'], 'camera.status');
    if (operation.companyId === null || operation.snapshotRevision !== state.snapshotRevision || expected.tab !== 'globe') fail('cameraOperation', 'contexto divergente');
  }
  if (state.selectedModel !== null) {
    object(state.selectedModel, ['companyId','modelId','variantId'], 'selectedModel');
    for (const key of ['companyId','modelId','variantId']) string(state.selectedModel[key], key);
    if (state.selectedModel.companyId !== expected.companyId || !state.index.modelTargets.some(m => ['companyId','modelId','variantId'].every(k => m[k] === state.selectedModel[k]))) fail('selectedModel', 'seleção divergente');
  }
  oneOf(state.warning, [null,'company-unavailable','model-unavailable','news-unavailable'], 'warning');
  return state;
}
