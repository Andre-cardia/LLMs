import { object, string, oneOf, list, utc, https, sourceRefs, uniqueIds, fail } from './primitives.mjs';
export function assertNewsItem(value) {
  object(value, ['schemaVersion', 'newsId', 'originalUrl', 'titleOriginal', 'language', 'publishedAt', 'fetchedAt', 'relevantCompanyIds', 'citedCompanyIds', 'summary', 'sourceRefs'], 'News');
  oneOf(value.schemaVersion, [1], 'News.schemaVersion'); string(value.newsId, 'newsId');
  https(value.originalUrl, 'originalUrl'); string(value.titleOriginal, 'titleOriginal', 4096); string(value.language, 'language');
  utc(value.publishedAt, 'publishedAt'); utc(value.fetchedAt, 'fetchedAt');
  for (const key of ['relevantCompanyIds', 'citedCompanyIds']) list(value[key], string, key, { unique: true });
  sourceRefs(value.sourceRefs);
  if (!value.sourceRefs.some(ref => ref.sourceUrl === value.originalUrl)) fail('originalUrl', 'deve constar das fontes consultadas');
  if (value.summary !== null) {
    object(value.summary, ['summaryPt', 'extendedSummaryPt', 'keyPoints', 'generatedByAi'], 'summary');
    for (const key of ['summaryPt', 'extendedSummaryPt']) string(value.summary[key], key, 100000);
    list(value.summary.keyPoints, (item, field) => string(item, field, 10000), 'keyPoints');
    oneOf(value.summary.generatedByAi, [true], 'generatedByAi');
  }
  return value;
}
export function assertNews(value) { list(value, assertNewsItem, 'news'); uniqueIds(value, 'newsId', 'news'); return value; }
