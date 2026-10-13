import {LAYERS} from '../contracts/catalog.mjs';
import {TABS, assertExplorationUrl, assertExplorationUrlContext, assertExplorationState} from '../contracts/exploration.mjs';

export function parseExplorationUrl(url, context) {
  assertExplorationUrlContext(context);
  const {companyIds,config} = context;
  const params = assertExplorationUrl(url).searchParams, overrides = {};
  const one = key => params.getAll(key).length === 1 ? params.get(key) : null;
  const base = value => config.availableBases.includes(value) ? value : config.initialBase;
  if (params.has('layers')) {
    const raw = one('layers'), values = raw === '' ? [] : raw?.split(',');
    overrides.layers = values && new Set(values).size === values.length && values.every(v => LAYERS.includes(v)) ? values : [...LAYERS];
  }
  // A presença de base é soberana, mesmo quando inválida ou duplicada.
  if (params.has('base')) overrides.base = base(one('base'));
  else if (params.has('view') && one('view') !== '3D') overrides.base = base(one('view'));
  if (params.has('tab')) { const value = one('tab'); overrides.tab = TABS.includes(value) ? value : 'globe'; }
  if (params.has('company')) { const value = one('company'); overrides.companyId = companyIds.includes(value) ? value : null; }
  return overrides;
}
export function explorationQuery(state) {
  assertExplorationState(state);
  const s = state.effectiveState, params = new URLSearchParams();
  params.set('layers', s.layers.join(',')); params.set('base', s.base); params.set('tab', s.tab);
  if (s.companyId !== null) params.set('company', s.companyId);
  return `?${params}`;
}
