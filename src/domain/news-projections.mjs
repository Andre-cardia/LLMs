import { assertNews } from '../contracts/news.mjs';import { utc,string,list } from '../contracts/primitives.mjs';
export const NEWS_SURFACES=Object.freeze(['terminal','flux','labs','news','reader']);
export function visibleNews(items,{now,companyId=null,hiddenNewsIds=[]}){
 assertNews(items);const time=utc(now);if(companyId!==null)string(companyId,'companyId');list(hiddenNewsIds,string,'hiddenNewsIds',{unique:true});const hidden=new Set(hiddenNewsIds);
 return items.filter(item=>item.relevantCompanyIds.length>0&&!hidden.has(item.newsId)&&utc(item.publishedAt)<=time&&time-utc(item.publishedAt)<=1209600000&&(companyId===null||item.relevantCompanyIds.includes(companyId))).sort((a,b)=>utc(b.publishedAt)-utc(a.publishedAt)||a.newsId.localeCompare(b.newsId));
}
function cappedPerCompany(values,limit,companyIds=null){const counts=new Map();return values.filter(n=>{const ids=companyIds?n.relevantCompanyIds.filter(id=>companyIds.has(id)):n.relevantCompanyIds;if(!ids.length||ids.some(id=>(counts.get(id)??0)>=limit))return false;for(const id of ids)counts.set(id,(counts.get(id)??0)+1);return true;});}
export function newsProjection(items,{surface,now,companyId=null,hiddenNewsIds=[],selectedNewsId=null,labCompanyIds=[]}){
 if(!NEWS_SURFACES.includes(surface))throw new TypeError('surface');let values=visibleNews(items,{now,companyId,hiddenNewsIds});
 if(surface==='labs'){const labs=new Set(labCompanyIds);return cappedPerCompany(values,3,labs);}
 if(surface==='reader')return values.filter(n=>n.newsId===selectedNewsId).slice(0,1);
 values=cappedPerCompany(values,5);
 if(surface==='flux')return values.slice(0,14);
 return companyId===null?values:values.slice(0,5);
}
