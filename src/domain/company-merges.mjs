import { clone } from '../contracts/primitives.mjs';
// Reescrita mecânica pela tabela acumulada e compactada (AD-2): cada from aponta direto ao sobrevivente atual.
// Entradas com toCompanyId null (retirada do sobrevivente) não são reescritas aqui.
function survivors(table) {
  const map = new Map();
  for (const entry of table) if (entry.toCompanyId !== null) map.set(entry.fromCompanyId, entry.toCompanyId);
  return map;
}
function rewriteIds(ids, map) {
  const out = [];
  for (const id of ids) { const next = map.get(id) ?? id; if (!out.includes(next)) out.push(next); }
  return out;
}
// Função pura: devolve cópias de models e news com IDs de Empresa mesclada trocados; não muta a entrada.
export function applyCompanyMerges({ models, news }, table) {
  const map = survivors(table);
  const nextModels = clone(models), nextNews = clone(news);
  if (map.size === 0) return { models: nextModels, news: nextNews };
  for (const model of nextModels) model.companyId = map.get(model.companyId) ?? model.companyId;
  for (const item of nextNews) {
    item.relevantCompanyIds = rewriteIds(item.relevantCompanyIds, map);
    // Uma Empresa relevante não é também citada na mesma Notícia.
    item.citedCompanyIds = rewriteIds(item.citedCompanyIds, map).filter(id => !item.relevantCompanyIds.includes(id));
  }
  return { models: nextModels, news: nextNews };
}
