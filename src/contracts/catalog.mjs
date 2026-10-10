import { object, string, number, boolean, oneOf, list, nullable, https, sourceRefs, uniqueIds, integer, fail } from './primitives.mjs';
export const LAYERS = Object.freeze(['labs', 'chips', 'cloud', 'energy', 'software']);
export const RELATION_TYPES = Object.freeze(['chip-manufacturing', 'cloud-infrastructure', 'investment', 'energy', 'model-partnership']);
export function assertCompany(value) {
  object(value, ['schemaVersion', 'id', 'name', 'primaryLayer', 'tags', 'isLab', 'region', 'location', 'website', 'contact', 'logo', 'listing', 'sourceRefs'], 'Company');
  oneOf(value.schemaVersion, [1], 'Company.schemaVersion');
  for (const key of ['id', 'name']) string(value[key], `Company.${key}`);
  oneOf(value.primaryLayer, LAYERS, 'Company.primaryLayer');
  list(value.tags, (tag, field) => oneOf(tag, LAYERS, field), 'Company.tags', { unique: true });
  boolean(value.isLab, 'Company.isLab'); oneOf(value.region, ['US', 'CHINA', 'EUROPE', 'OTHER'], 'Company.region');
  object(value.location, ['latitude', 'longitude'], 'Company.location');
  number(value.location.latitude, 'latitude', -90, 90); number(value.location.longitude, 'longitude', -180, 180);
  nullable(value.website, https, 'Company.website'); nullable(value.contact, string, 'Company.contact');
  nullable(value.logo, string, 'Company.logo');
  if (value.logo !== null && (!/^logos\/[a-zA-Z0-9_-]+\.(svg|png|webp)$/.test(value.logo))) fail('Company.logo', 'asset local exigido');
  if (value.listing !== null) {
    object(value.listing, ['symbol', 'exchange', 'currency'], 'Company.listing');
    for (const key of ['symbol', 'exchange', 'currency']) string(value.listing[key], `listing.${key}`);
  }
  sourceRefs(value.sourceRefs); return value;
}
export function assertRelation(value) {
  object(value, ['schemaVersion', 'id', 'fromCompanyId', 'toCompanyId', 'type', 'sourceRefs'], 'Relation');
  oneOf(value.schemaVersion, [1], 'Relation.schemaVersion');
  for (const key of ['id', 'fromCompanyId', 'toCompanyId']) string(value[key], `Relation.${key}`);
  oneOf(value.type, RELATION_TYPES, 'Relation.type'); sourceRefs(value.sourceRefs);
  if (value.fromCompanyId === value.toCompanyId) fail('Relation', 'duas Empresas distintas exigidas');
  return value;
}
export function assertCatalog(value) {
  object(value, ['companies', 'relations'], 'Catalog');
  list(value.companies, assertCompany, 'companies'); list(value.relations, assertRelation, 'relations');
  uniqueIds(value.companies, 'id', 'companies'); uniqueIds(value.relations, 'id', 'relations');
  const ids = new Set(value.companies.map(company => company.id));
  for (const relation of value.relations) if (!ids.has(relation.fromCompanyId) || !ids.has(relation.toCompanyId)) fail('Relation', 'referência ausente');
  return value;
}
