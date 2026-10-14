import {LAYERS} from '../contracts/catalog.mjs';
import {EXPLORATION_VERSION, assertExplorationOptions, assertExplorationIntent, assertExplorationState} from '../contracts/exploration.mjs';
import {assertCompanyMergedInto} from '../contracts/snapshot.mjs';
import {clone, freeze, oneOf} from '../contracts/primitives.mjs';
import {parseExplorationUrl} from './exploration-url.mjs';
import {visibleNews} from './news-projections.mjs';

export const DEFAULT_PREFERENCES = freeze({theme:'artificial-analysis',mode:'light',readerLayout:'side',tableStyle:'analytic',leftTab:'flux',feedLabsOnly:false,soundTyping:false,soundAmbient:false,layers:[...LAYERS],favorites:[]});
function index(data, now, hiddenNewsIds) {
  return {
    companyIds:data.catalog.companies.map(c => c.id),
    modelTargets:data.models.flatMap(m => m.variants.map(v => ({modelId:m.modelId,variantId:v.variantId,companyId:m.companyId}))),
    newsTargets:visibleNews(data.news, {now,hiddenNewsIds}).map(n => ({newsId:n.newsId,companyIds:[...n.relevantCompanyIds]})),
    tickers:data.catalog.companies.filter(c => c.listing).map(c => ({companyId:c.id,...c.listing}))
  };
}
function effective(s) {
  s.effectiveState = {...clone(s.preferences),...clone(s.sessionState),...clone(s.sessionOverrides)};
  s.readerLayoutEffective = s.effectiveState.tab === 'news' ? 'side' : s.preferences.readerLayout;
  if (s.readerNewsId !== null) {
    if (s.readerLayoutEffective === 'side') s.sidePanel = 'reader';
    else if (s.sidePanel === 'reader') s.sidePanel = null;
  }
  return s;
}
function checked(s) { assertExplorationState(s); return freeze(s); }
export function createExploration(options) {
  assertExplorationOptions(options);
  const {data,revision,now,config,hiddenNewsIds = [],preferences = null} = options;
  return checked(effective({
    schemaVersion:EXPLORATION_VERSION,config:clone(config),preferences:clone(preferences ?? DEFAULT_PREFERENCES),
    sessionOverrides:{},sessionState:{projection:'3D',base:config.initialBase,tab:'globe',companyId:null},
    snapshotRevision:revision,index:index(data,now,hiddenNewsIds),intentToken:0,
    terminal:null,sidePanel:null,readerNewsId:null,readerTyping:false,readerToken:0,
    cameraOperation:null,selectedModel:null,warning:null
  }));
}
function closeReader(s) {
  if (s.sidePanel === 'reader') s.sidePanel = null;
  s.readerNewsId = null; s.readerTyping = false;
}
function setSession(s, field, value) { s.sessionState[field] = value; delete s.sessionOverrides[field]; }
function terminal(s, companyId) { return {companyId,typing:true,token:s.intentToken}; }
function applyContext(s) {
  effective(s);
  if (s.effectiveState.companyId !== null && !s.index.companyIds.includes(s.effectiveState.companyId)) {
    setSession(s, 'companyId', null); s.terminal = null; s.selectedModel = null;
    s.warning = 'company-unavailable'; effective(s);
  }
  if (s.effectiveState.tab !== 'globe') { s.terminal = null; s.cameraOperation = null; }
  if (s.effectiveState.companyId === null) { s.terminal = null; s.selectedModel = null; }
}
function callback(previous, intent) {
  const effects = [];
  const operation = intent.target === 'terminal' ? previous.terminal : intent.target === 'camera' ? previous.cameraOperation : null;
  const token = intent.target === 'reader' ? previous.readerToken : operation?.token;
  const pending = intent.target === 'reader' ? previous.readerNewsId !== null && previous.readerTyping : intent.target === 'terminal' ? operation?.typing : operation?.status === 'pending';
  if (!pending || intent.token !== token || intent.snapshotRevision !== previous.snapshotRevision) return {state:previous,effects};
  const s = clone(previous);
  if (intent.target === 'terminal') s.terminal.typing = false;
  else if (intent.target === 'reader') s.readerTyping = false;
  else s.cameraOperation.status = 'completed';
  return {state:checked(s),effects};
}
export function explorationReducer(previous, intent) {
  // Validar antes de clonar impede que structuredClone execute um getter recebido.
  assertExplorationState(previous); assertExplorationIntent(intent);
  if (intent.type === 'callback') return callback(previous, intent);
  if (previous.intentToken === Number.MAX_SAFE_INTEGER) throw new TypeError('intentToken: contador esgotado');
  const s = clone(previous), effects = [];
  s.intentToken += 1; s.warning = null;
  switch (intent.type) {
    case 'hydrateUrl':
      s.sessionOverrides = parseExplorationUrl(intent.url, {companyIds:s.index.companyIds,config:s.config});
      effective(s); s.cameraOperation = null; s.selectedModel = null;
      s.terminal = s.effectiveState.companyId !== null && s.effectiveState.tab === 'globe' ? terminal(s, s.effectiveState.companyId) : null;
      break;
    case 'preference': {
      const patch = {[intent.field]:clone(intent.value)};
      s.preferences = {...s.preferences,...patch}; delete s.sessionOverrides[intent.field];
      effects.push({type:'persistPreferences',patch}); break;
    }
    case 'tab': setSession(s, 'tab', intent.tab); break;
    case 'base':
      oneOf(intent.base, s.config.availableBases, 'base'); setSession(s, 'base', intent.base); break;
    case 'company':
      if (intent.companyId !== null && !s.index.companyIds.includes(intent.companyId)) throw new Error('COMPANY_NOT_FOUND');
      setSession(s, 'companyId', intent.companyId); s.selectedModel = null; s.cameraOperation = null;
      if (intent.companyId !== null) { setSession(s, 'tab', 'globe'); s.terminal = terminal(s, intent.companyId); }
      else s.terminal = null;
      break;
    case 'camera':
      if (!s.index.companyIds.includes(intent.companyId)) throw new Error('COMPANY_NOT_FOUND');
      if (s.effectiveState.tab !== 'globe') throw new Error('CAMERA_UNAVAILABLE');
      s.cameraOperation = {companyId:intent.companyId,token:s.intentToken,snapshotRevision:s.snapshotRevision,status:'pending'};
      effects.push({type:'camera',companyId:intent.companyId,token:s.intentToken,snapshotRevision:s.snapshotRevision}); break;
    case 'panel':
      if (s.readerLayoutEffective === 'side') closeReader(s);
      s.sidePanel = intent.panel; break;
    case 'openNews':
      if (!s.index.newsTargets.some(n => n.newsId === intent.newsId)) throw new Error('NEWS_UNAVAILABLE');
      s.readerNewsId = intent.newsId; s.readerTyping = true; s.readerToken = s.intentToken; break;
    case 'escape':
      if (s.readerNewsId !== null) { if (s.readerTyping) s.readerTyping = false; else closeReader(s); }
      else if (s.sidePanel !== null) s.sidePanel = null;
      else if (s.terminal?.typing) s.terminal.typing = false;
      else s.terminal = null;
      break;
    case 'advanceSnapshot': {
      const next = index(intent.data, intent.now, intent.hiddenNewsIds);
      const nextIds = new Set(next.companyIds), previousIds = new Set(s.index.companyIds);
      assertCompanyMergedInto(intent.companyRemaps, {nextCompanyIds:nextIds});
      // Tabela acumulada: só entradas cujo from estava no índice anterior se aplicam.
      const remaps = new Map(intent.companyRemaps.filter(r => previousIds.has(r.fromCompanyId)).map(r => [r.fromCompanyId,r.toCompanyId]));
      // Cada origem é reconciliada separadamente; o link nunca vira preferência/sessão.
      const reconcile = id => {
        const mapped = remaps.has(id) ? remaps.get(id) : id;
        return mapped !== null && nextIds.has(mapped) ? mapped : null;
      };
      const oldId = s.effectiveState.companyId;
      s.sessionState.companyId = reconcile(s.sessionState.companyId);
      if (Object.hasOwn(s.sessionOverrides, 'companyId')) {
        s.sessionOverrides.companyId = reconcile(s.sessionOverrides.companyId);
      }
      const id = Object.hasOwn(s.sessionOverrides, 'companyId') ? s.sessionOverrides.companyId : s.sessionState.companyId;
      if (oldId !== null && id === null) s.warning = 'company-unavailable';
      if (s.terminal && id !== null) { s.terminal.companyId = id; s.terminal.token = s.intentToken; }
      if (s.readerNewsId !== null) s.readerToken = s.intentToken;
      s.cameraOperation = null; s.index = next; s.snapshotRevision = intent.revision;
      if (s.selectedModel) {
        const companyId = remaps.has(s.selectedModel.companyId) ? remaps.get(s.selectedModel.companyId) : s.selectedModel.companyId;
        const selected = {...s.selectedModel,companyId};
        // Empresa retirada (to: null) já sinalizou company-unavailable; não sobrescrever com o aviso do Modelo.
        if (companyId === null) s.selectedModel = null;
        else if (next.modelTargets.some(m => ['companyId','modelId','variantId'].every(k => m[k] === selected[k]))) s.selectedModel = selected;
        else { s.selectedModel = null; s.warning = 'model-unavailable'; }
      }
      if (s.readerNewsId !== null && !next.newsTargets.some(n => n.newsId === s.readerNewsId)) {
        closeReader(s); s.warning = 'news-unavailable';
      }
      break;
    }
    case 'navigate': {
      const t = intent.target;
      if (!s.index.companyIds.includes(t.companyId)) throw new Error('TARGET_UNAVAILABLE');
      if (t.type === 'model' && !s.index.modelTargets.some(m => m.companyId === t.companyId && m.modelId === t.modelId && m.variantId === t.variantId) ||
          t.type === 'news' && !s.index.newsTargets.some(n => n.newsId === t.newsId && n.companyIds.includes(t.companyId)) ||
          t.type === 'ticker' && !s.index.tickers.some(c => c.companyId === t.companyId && c.symbol === t.symbol && c.exchange === t.exchange)) throw new Error('TARGET_UNAVAILABLE');
      setSession(s, 'companyId', t.companyId); setSession(s, 'tab', t.type === 'model' ? 'models' : 'globe');
      s.cameraOperation = null;
      s.selectedModel = t.type === 'model' ? {companyId:t.companyId,modelId:t.modelId,variantId:t.variantId} : null;
      s.terminal = t.type === 'model' ? null : terminal(s, t.companyId);
      if (t.type === 'news') { s.readerNewsId = t.newsId; s.readerTyping = true; s.readerToken = s.intentToken; }
      break;
    }
  }
  applyContext(s);
  return {state:checked(s),effects};
}
