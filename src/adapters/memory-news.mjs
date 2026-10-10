import { assertNews } from '../contracts/news.mjs';import { assertNewsFeedback } from '../contracts/news-feedback.mjs';import { clone,canonicalJson } from '../contracts/primitives.mjs';
const urlAlias=value=>{const u=new URL(value);u.hash='';return `url:${u.href}`;};
const aliases=item=>[`id:${item.newsId}`,urlAlias(item.originalUrl),...item.sourceRefs.flatMap(r=>[canonicalJson(['source',r.source,r.sourceRecordId]),urlAlias(r.sourceUrl)])];
export class MemoryNews {
 #control;#owner;#ingest;
 constructor({control,authorizeOwner=()=>false,authorizeIngest=()=>false}){this.#control=control;this.#owner=authorizeOwner;this.#ingest=authorizeIngest;control.transact(s=>{if(s.newsIndex)throw new Error('NEWS_ALREADY_INITIALIZED');s.newsIndex={groups:new Map(),aliases:new Map(),sequence:0,feedbackRevision:0,receipts:new Map(),feedback:[]};});}
 #auth(f,c){if(f(c)!==true)throw new Error('FORBIDDEN');}
 ingest(state,items,context){this.#auth(this.#ingest,context);assertNews(items);const index=state.newsIndex;
  for(const item of items){const keys=aliases(item),ids=[...new Set(keys.map(k=>index.aliases.get(k)).filter(Boolean))],groups=ids.map(id=>index.groups.get(id)).sort((a,b)=>a.sequence-b.sequence);
   let group=groups[0];if(!group){group={newsId:item.newsId,sequence:++index.sequence,aliases:[],suppressed:false,item:clone(item)};index.groups.set(group.newsId,group);}
   for(const merged of groups.slice(1)){group.suppressed||=merged.suppressed;group.aliases.push(...merged.aliases);index.groups.delete(merged.newsId);}
   group.aliases=[...new Set([...group.aliases,...keys])];for(const key of group.aliases)index.aliases.set(key,group.newsId);
   const refs=[...new Map([...groups.flatMap(g=>g.item.sourceRefs),...item.sourceRefs].map(r=>[canonicalJson([r.source,r.sourceRecordId,r.sourceUrl]),r])).values()];
   group.item={...clone(item),newsId:group.newsId,sourceRefs:refs,relevantCompanyIds:[...new Set([...groups.flatMap(g=>g.item.relevantCompanyIds),...item.relevantCompanyIds])],citedCompanyIds:[...new Set([...groups.flatMap(g=>g.item.citedCompanyIds),...item.citedCompanyIds])]};
  }
  return [...index.groups.values()].map(g=>clone(g.item));
 }
 feedback(request,context){this.#auth(this.#owner,context);assertNewsFeedback(request);return this.#control.transact(state=>{
  const i=state.newsIndex,key=canonicalJson([request.newsId,request.idempotencyKey]),payload=canonicalJson(request),prior=i.receipts.get(key);
  if(request.confirmed&&prior){if(prior.payload!==payload)throw new Error('FEEDBACK_IDEMPOTENCY_CONFLICT');return prior.result;}
  const id=i.aliases.get(`id:${request.newsId}`),group=i.groups.get(id);if(!group)throw new Error('NEWS_NOT_FOUND');
  if(!state.catalog.companies.some(c=>c.id===request.companyId))throw new Error('COMPANY_NOT_FOUND');
  if(!group.item.relevantCompanyIds.includes(request.companyId))throw new Error('COMPANY_NOT_RELEVANT');
  if(!request.confirmed)return {feedbackRevision:i.feedbackRevision,changed:false};
  if(i.feedbackRevision!==request.expectedFeedbackRevision)throw new Error('FEEDBACK_REVISION_CONFLICT');
  group.suppressed=request.irrelevant;i.feedbackRevision+=1;i.feedback.push({...clone(request),canonicalNewsId:id,resultRevision:i.feedbackRevision});
  const result={feedbackRevision:i.feedbackRevision,changed:true};i.receipts.set(key,{payload,result});return result;
 });}
 read(context){this.#auth(this.#owner,context);const i=this.#control.read().newsIndex;return {feedbackRevision:i.feedbackRevision,items:[...i.groups.values()].map(g=>g.item),hiddenNewsIds:[...i.groups.values()].filter(g=>g.suppressed).flatMap(g=>g.aliases.filter(a=>a.startsWith('id:')).map(a=>a.slice(3)))};}
 resolve(newsId,context){const data=this.read(context),i=this.#control.read().newsIndex,id=i.aliases.get(`id:${newsId}`);return data.hiddenNewsIds.includes(id)?null:data.items.find(item=>item.newsId===id)??null;}
}
