import {assertSnapshotData} from '../contracts/snapshot.mjs';import {assertNavigationTarget} from '../contracts/navigation.mjs';import {visibleNews} from './news-projections.mjs';
const normalized=v=>v.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('pt-BR');
export function globalSearch(data,query,{now,hiddenNewsIds=[]}){assertSnapshotData(data);if(typeof query!=='string'||query.length>256)throw new TypeError('query');const q=normalized(query.trim());if(!q)return [];const out=[];const add=(label,target)=>{if(normalized(label).includes(q))out.push({label,target:assertNavigationTarget({schemaVersion:1,...target})});};
 for(const c of data.catalog.companies){add(c.name,{type:'company',companyId:c.id});if(c.listing)add(`${c.listing.symbol} ${c.name}`,{type:'ticker',companyId:c.id,symbol:c.listing.symbol,exchange:c.listing.exchange});}
 for(const m of data.models)for(const v of m.variants)add(`${m.name} ${v.name}`,{type:'model',companyId:m.companyId,modelId:m.modelId,variantId:v.variantId});
 for(const n of visibleNews(data.news,{now,hiddenNewsIds}))if(n.relevantCompanyIds.length)add(n.titleOriginal,{type:'news',companyId:n.relevantCompanyIds[0],newsId:n.newsId});return out;
}
export function resolveNavigation(data,target,{now,hiddenNewsIds=[]}){assertSnapshotData(data);assertNavigationTarget(target);const company=data.catalog.companies.find(c=>c.id===target.companyId);if(!company)return {status:'unavailable'};
 if(target.type==='model'&&!data.models.some(m=>m.companyId===target.companyId&&m.modelId===target.modelId&&m.variants.some(v=>v.variantId===target.variantId)))return {status:'unavailable'};
 if(target.type==='ticker'&&(company.listing?.symbol!==target.symbol||company.listing?.exchange!==target.exchange))return {status:'unavailable'};
 if(target.type==='news'&&!visibleNews(data.news,{now,hiddenNewsIds,companyId:target.companyId}).some(n=>n.newsId===target.newsId))return {status:'unavailable'};
 return {status:'available',target};
}
