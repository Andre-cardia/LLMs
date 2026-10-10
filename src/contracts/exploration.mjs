import {object,oneOf,boolean,string,list} from './primitives.mjs';import {LAYERS} from './catalog.mjs';
export const VIEWS=Object.freeze(['3D','2D','MAPA','SAT']),TABS=Object.freeze(['globe','models','news']);
export const PREFERENCE_KEYS=Object.freeze(['theme','mode','readerLayout','tableStyle','leftTab','feedLabsOnly','soundTyping','soundAmbient','layers','favorites']);
export function assertPreference(field,value){oneOf(field,PREFERENCE_KEYS,'field');const choices={theme:['osiris','ambar','noturna'],mode:['dark','light'],readerLayout:['side','floating'],tableStyle:['hybrid','terminal','analytic'],leftTab:['flux','labs']};
 if(choices[field])oneOf(value,choices[field],field);else if(['feedLabsOnly','soundTyping','soundAmbient'].includes(field))boolean(value,field);else if(field==='layers')list(value,(v,f)=>oneOf(v,LAYERS,f),field,{unique:true});else list(value,string,field,{unique:true});return value;
}
export function assertPreferences(p){object(p,PREFERENCE_KEYS,'Preferences');for(const k of PREFERENCE_KEYS)assertPreference(k,p[k]);return p;}
