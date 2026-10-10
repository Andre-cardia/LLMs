import {LAYERS} from '../contracts/catalog.mjs';import {VIEWS,TABS} from '../contracts/exploration.mjs';
export function parseExplorationUrl(url,{companyIds,availableViews=['3D']}){const params=new URL(url,'https://example.invalid').searchParams,overrides={};const one=k=>params.getAll(k).length===1?params.get(k):null;
 if(params.has('layers')){const raw=one('layers'),values=raw===''?[]:raw?.split(',');overrides.layers=values&&new Set(values).size===values.length&&values.every(v=>LAYERS.includes(v))?values:[...LAYERS];}
 if(params.has('view')){const v=one('view');overrides.view=VIEWS.includes(v)&&availableViews.includes(v)?v:'3D';}
 if(params.has('tab')){const v=one('tab');overrides.tab=TABS.includes(v)?v:'globe';}
 if(params.has('company')){const v=one('company');overrides.companyId=companyIds.includes(v)?v:null;}
 return overrides;
}
export function explorationQuery(state){const s=state.effectiveState,p=new URLSearchParams();p.set('layers',s.layers.join(','));p.set('view',s.view);p.set('tab',s.tab);if(s.companyId!==null)p.set('company',s.companyId);return `?${p}`;}
