import {object,integer,list,string} from '../contracts/primitives.mjs';
import {assertNews} from '../contracts/news.mjs';
import {newsProjection,visibleNews} from '../domain/news-projections.mjs';import {globalSearch,resolveNavigation} from '../domain/global-search.mjs';
// Une a revisão privada completa ao ledger de feedback atual antes de expor projeções.
export class LocalNewsView {
 #snapshot;#feedback;#resolve;#clock;
 constructor({readSnapshot,readFeedback,resolveAlias,clock}){this.#snapshot=readSnapshot;this.#feedback=readFeedback;this.#resolve=resolveAlias;this.#clock=clock;}
 async #frame(){const snapshot=await this.#snapshot();if(!snapshot)throw new Error('SNAPSHOT_UNAVAILABLE');const feedback=await this.#feedback();object(feedback,['feedbackRevision','items','hiddenNewsIds'],'NewsFeedbackView');integer(feedback.feedbackRevision,'feedbackRevision');assertNews(feedback.items);list(feedback.hiddenNewsIds,string,'hiddenNewsIds',{unique:true});return {snapshot,feedback,now:this.#clock(),dataRevision:snapshot.manifest.revision,feedbackRevision:feedback.feedbackRevision};}
 async project(options){const f=await this.#frame();const selected=options.selectedNewsId?(await this.#resolve(options.selectedNewsId))?.newsId??null:null;return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,items:newsProjection(f.snapshot.news,{...options,selectedNewsId:selected,now:f.now,hiddenNewsIds:f.feedback.hiddenNewsIds})};}
 async search(query){const f=await this.#frame();return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,results:globalSearch(f.snapshot,query,{now:f.now,hiddenNewsIds:f.feedback.hiddenNewsIds})};}
 async navigate(target){const f=await this.#frame();if(target.type==='news'){const item=await this.#resolve(target.newsId);if(!item)return {status:'unavailable'};target={...target,newsId:item.newsId};}return {...resolveNavigation(f.snapshot,target,{now:f.now,hiddenNewsIds:f.feedback.hiddenNewsIds}),dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision};}
 async context(){const f=await this.#frame();return {dataRevision:f.dataRevision,feedbackRevision:f.feedbackRevision,news:visibleNews(f.snapshot.news,{now:f.now,hiddenNewsIds:f.feedback.hiddenNewsIds})};}
}
