export function fail(field, reason = 'formato inválido') {
  throw new TypeError(`${field}: ${reason}`);
}
export function object(value, fields, field = 'objeto') {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(field);
  const keys = Reflect.ownKeys(value);
  if (keys.length !== fields.length || keys.some(key => !fields.includes(key))) fail(field, 'campos incompatíveis');
  for (const key of fields) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail(`${field}.${key}`, 'propriedade de dados exigida');
  }
  return value;
}
export function string(value, field, max = 256) {
  if (typeof value !== 'string' || !value.length || value.length > max || value.trim() !== value) fail(field);
  return value;
}
export function boolean(value, field) { if (typeof value !== 'boolean') fail(field); return value; }
export function oneOf(value, choices, field) { if (!choices.includes(value)) fail(field); return value; }
export function number(value, field, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) fail(field);
  return value;
}
export function integer(value, field, min = 0) {
  number(value, field, min); if (!Number.isSafeInteger(value)) fail(field); return value;
}
export function utc(value, field = 'timestamp') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) fail(field);
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !==
      (value.includes('.') ? value : value.replace('Z', '.000Z'))) fail(field, 'data impossível');
  return milliseconds;
}
export function https(value, field = 'URL') {
  string(value, field, 4096);
  if (!/^https:\/\/[^/]/.test(value) || /[\x00-\x20\x7f\\]/.test(value)) fail(field);
  let url; try { url = new URL(value); } catch { fail(field); }
  if (url.protocol !== 'https:' || url.username || url.password) fail(field);
  return value;
}
export function list(value, check, field, { unique = false, nonempty = false } = {}) {
  if (!Array.isArray(value) || (nonempty && value.length === 0)) fail(field);
  if (Reflect.ownKeys(value).length !== value.length + 1) fail(field, 'array denso sem campos extras exigido');
  for (let i = 0; i < value.length; i += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
    if (!descriptor || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) fail(field, 'array de dados exigido');
    check(descriptor.value, `${field}[${i}]`);
  }
  if (unique && new Set(value).size !== value.length) fail(field, 'duplicatas');
  return value;
}
export function nullable(value, check, field) { if (value !== null) check(value, field); }
export function decimal(value, field) {
  if (typeof value !== 'string' || value.length > 256 || !/^(0|[1-9]\d*)(\.\d+)?$/.test(value)) fail(field);
}
export function microUsd(value, field = 'microUSD') {
  if (typeof value !== 'string' || value.length > 256 || !/^(0|[1-9]\d*)$/.test(value)) fail(field);
  return BigInt(value);
}
export function sourceRef(value, field = 'sourceRef') {
  object(value, ['source', 'sourceRecordId', 'sourceUrl', 'fetchedAt', 'observedAt'], field);
  for (const key of ['source', 'sourceRecordId']) string(value[key], `${field}.${key}`);
  https(value.sourceUrl, `${field}.sourceUrl`); utc(value.fetchedAt, `${field}.fetchedAt`);
  nullable(value.observedAt, utc, `${field}.observedAt`);
}
export function sourceRefs(value, field = 'sourceRefs') { list(value, sourceRef, field, { nonempty: true }); }
export function uniqueIds(items, key, field) {
  if (new Set(items.map(item => item[key])).size !== items.length) fail(field, 'IDs duplicados');
}
export function clone(value) { return structuredClone(value); }
export function freeze(value) {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}
export function canonicalJson(value) {
  function ordered(item) {
    if (Array.isArray(item)) return item.map(ordered);
    if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map(key => [key, ordered(item[key])]));
    return item;
  }
  return JSON.stringify(ordered(value));
}

export function requireSynchronous(value,code='SYNCHRONOUS_TRANSACTION_REQUIRED'){
 if(value&&typeof value.then==='function'){Promise.resolve(value).catch(()=>{});throw new Error(code);}
 return value;
}
