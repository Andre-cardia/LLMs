import { assertModelPricing } from '../contracts/model-pricing.mjs';
import { integer, object } from '../contracts/primitives.mjs';
export function conservativeCallBound(pricing,limits){
 assertModelPricing(pricing);object(limits,['inputTokens','outputTokens'],'limits');integer(limits.inputTokens,'inputTokens');integer(limits.outputTokens,'outputTokens');
 if(pricing.inputUsdPerMillion===null||pricing.outputUsdPerMillion===null)throw new Error('PRICE_UNKNOWN');if(pricing.reasoning)throw new Error('REASONING_BOUND_UNVERIFIED');
 const scaled=value=>{const [whole,fraction='']=value.split('.');return {n:BigInt(whole+fraction),scale:fraction.length};};
 const input=scaled(pricing.inputUsdPerMillion),output=scaled(pricing.outputUsdPerMillion),scale=Math.max(input.scale,output.scale);
 const numerator=input.n*10n**BigInt(scale-input.scale)*BigInt(limits.inputTokens)+output.n*10n**BigInt(scale-output.scale)*BigInt(limits.outputTokens),denominator=10n**BigInt(scale);
 return ((numerator+denominator-1n)/denominator).toString();
}
