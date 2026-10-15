import test from 'node:test';import assert from 'node:assert/strict';
import { applyCompanyMerges } from '../src/domain/company-merges.mjs';
const news=(relevant,cited)=>({newsId:'n',relevantCompanyIds:relevant,citedCompanyIds:cited});
test('applyCompanyMerges: tabela vazia devolve cópias; entrada não é mutada',()=>{
 const input={models:[{companyId:'a'}],news:[news(['a'],[])]},snapshot=JSON.stringify(input);
 const out=applyCompanyMerges(input,[]);assert.deepEqual(out,input);assert.notEqual(out.models,input.models);
 applyCompanyMerges(input,[{fromCompanyId:'a',toCompanyId:'c'}]);assert.equal(JSON.stringify(input),snapshot);
});
test('applyCompanyMerges: tabela compactada reescreve Modelos e Notícias sem duplicar',()=>{
 const out=applyCompanyMerges({models:[{companyId:'a'},{companyId:'b'},{companyId:'x'}],news:[news(['a','b','c'],['b','x'])]},[{fromCompanyId:'a',toCompanyId:'c'},{fromCompanyId:'b',toCompanyId:'c'}]);
 assert.deepEqual(out.models.map(m=>m.companyId),['c','c','x']);assert.deepEqual(out.news[0].relevantCompanyIds,['c']);assert.deepEqual(out.news[0].citedCompanyIds,['x']);
});
test('applyCompanyMerges: relevante e citada fundidas mantêm só a relevante; null não reescreve',()=>{
 const out=applyCompanyMerges({models:[{companyId:'r'}],news:[news(['a'],['c'])]},[{fromCompanyId:'a',toCompanyId:'c'},{fromCompanyId:'r',toCompanyId:null}]);
 assert.deepEqual(out.news[0].relevantCompanyIds,['c']);assert.deepEqual(out.news[0].citedCompanyIds,[]);assert.equal(out.models[0].companyId,'r');
});
