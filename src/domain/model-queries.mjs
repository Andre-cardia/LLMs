import {assertCompany} from '../contracts/catalog.mjs';
import {assertModels} from '../contracts/models.mjs';import {assertModelQuery} from '../contracts/model-query.mjs';import {estimateStandardTaskCost,STANDARD_TASK} from './model-cost.mjs';import {object,string,nullable,utc,boolean,clone,list,uniqueIds} from '../contracts/primitives.mjs';
export function releasePulse(releaseDates,{now,reducedMotion=false}){
 object(releaseDates,['artificialAnalysis','huggingFace','openRouter'],'releaseDates');utc(now);boolean(reducedMotion,'reducedMotion');for(const k of Object.keys(releaseDates))nullable(releaseDates[k],string,k);
 const source=['artificialAnalysis','huggingFace','openRouter'].find(k=>releaseDates[k]!==null)??null;let releaseAt=source===null?null:releaseDates[source],alert=null,intensity=0;
 if(releaseAt!==null){let time;try{time=utc(releaseAt);}catch{alert='invalid-release-date';releaseAt=null;}if(time!==undefined){const age=utc(now)-time;if(age<0)alert='future-release-date';else if(age<604800000)intensity=1-age/604800000;}}
 return {releaseAt,source,alert,intensity,visual:intensity>0?(reducedMotion?'static':'pulse'):'none'};
}
export function compareDecimals(a,b){const scale=Math.max((a.split('.')[1]??'').length,(b.split('.')[1]??'').length);const n=v=>{const [w,f='']=v.split('.');return BigInt(w+f.padEnd(scale,'0'));};const left=n(a),right=n(b);return left<right?-1:left>right?1:0;}
export function modelTable(models,query){assertModels(models);assertModelQuery(query);const selections=new Map(query.variantSelections.map(s=>[s.modelId,s.variantId]));
 for(const [id,variant]of selections){if(!models.some(m=>m.modelId===id&&m.variants.some(v=>v.variantId===variant)))throw new Error('VARIANT_SELECTION_NOT_FOUND');}
 const rows=[];for(const model of models){if(query.companyIds.length&&!query.companyIds.includes(model.companyId))continue;const v=model.variants.find(v=>v.variantId===selections.get(model.modelId))??model.variants[0];
 if(!query.inputModalities.every(m=>v.inputModalities.includes(m))||!query.outputModalities.every(m=>v.outputModalities.includes(m))||query.openWeights!==null&&query.openWeights!==v.openWeights)continue;
 const cost=v.pricing?estimateStandardTaskCost(v.pricing):{status:'unavailable',usd:null,currency:'USD',task:STANDARD_TASK,missingPrices:['inputUsdPerMillion','outputUsdPerMillion'],approximate:v.reasoning,caveat:v.reasoning?'Estimativa aproximada: tokens de raciocínio não estão incluídos.':null};
 rows.push({modelId:model.modelId,companyId:model.companyId,name:model.name,variantId:v.variantId,variantName:v.name,releaseDates:clone(model.releaseDates),inputModalities:clone(v.inputModalities),outputModalities:clone(v.outputModalities),openWeights:v.openWeights,license:v.license,reasoning:v.reasoning,benchmarks:clone(v.benchmarks),pricing:v.pricing?clone(v.pricing):null,releaseSourceRefs:clone(model.sourceRefs),standardCost:cost,standardCostUsd:cost.usd,inputUsdPerMillion:v.pricing?.inputUsdPerMillion??null,outputUsdPerMillion:v.pricing?.outputUsdPerMillion??null,...Object.fromEntries(['intelligence','programming','math','contextTokens','ttftSeconds','tokensPerSecond','cacheReadUsdPerMillion','cacheWriteUsdPerMillion'].map(k=>[k,v[k]])),sourceRefs:clone(v.sourceRefs)});}
 return rows.sort((a,b)=>{const x=a[query.sortBy],y=b[query.sortBy];if(x===null&&y!==null)return 1;if(y===null&&x!==null)return -1;const cmp=x===null?0:typeof x==='string'?compareDecimals(x,y):x-y;return cmp*(query.direction==='asc'?1:-1)||a.modelId.localeCompare(b.modelId);});
}

export function latestLabReleases(models,companies,{now,reducedMotion=false}){assertModels(models);list(companies,assertCompany,'companies');uniqueIds(companies,'id','companies');utc(now);boolean(reducedMotion,'reducedMotion');
 return companies.filter(c=>c.isLab).map(c=>{const eligible=models.filter(m=>m.companyId===c.id).map(m=>({modelId:m.modelId,name:m.name,...releasePulse(m.releaseDates,{now,reducedMotion}),sourceRefs:clone(m.sourceRefs)})).filter(m=>m.releaseAt!==null&&m.alert===null).sort((a,b)=>utc(b.releaseAt)-utc(a.releaseAt)||a.modelId.localeCompare(b.modelId));return {companyId:c.id,release:eligible[0]??null};});
}
