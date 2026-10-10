// Autoridade compartilhada para uma cotação de preços da mesma fonte/variante.
const FIELDS = [
  'schemaVersion', 'modelId', 'variantId', 'inputUsdPerMillion',
  'outputUsdPerMillion', 'reasoning', 'source', 'sourceRecordId',
  'sourceUrl', 'fetchedAt', 'observedAt',
];
const DECIMAL = /^(0|[1-9]\d*)(\.\d+)?$/;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

function invalid(field, reason) {
  throw new TypeError(`Preço de modelo inválido: ${field} ${reason}.`);
}

function text(value, field) {
  if (typeof value !== 'string' || value.length === 0 ||
      value.length > 256 || value.trim() !== value) {
    invalid(field, 'deve ser uma string não vazia, sem espaços nas extremidades, com até 256 caracteres');
  }
}

function timestamp(value, field) {
  if (typeof value !== 'string' || !UTC_TIMESTAMP.test(value)) {
    invalid(field, 'deve ser um horário ISO UTC com Z');
  }
  const date = new Date(value);
  const expected = value.includes('.') ? value : value.replace('Z', '.000Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString() !== expected) {
    invalid(field, 'contém data ou horário impossível');
  }
}

/** Valida sem alterar o objeto. null é ausência; "0" é preço informado. */
export function assertModelPricing(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    invalid('registro', 'deve ser um objeto simples');
  }
  const keys = Reflect.ownKeys(value);
  if (keys.length !== FIELDS.length || keys.some(key => !FIELDS.includes(key))) {
    invalid('campos', 'devem corresponder exatamente ao contrato v1');
  }
  for (const field of FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) {
      invalid(field, 'deve ser uma propriedade própria, enumerável e de dados');
    }
  }
  if (value.schemaVersion !== 1) invalid('schemaVersion', 'deve ser 1');
  for (const field of ['modelId', 'variantId', 'source', 'sourceRecordId']) {
    text(value[field], field);
  }
  for (const field of ['inputUsdPerMillion', 'outputUsdPerMillion']) {
    const amount = value[field];
    if (amount !== null && (typeof amount !== 'string' || amount.length > 256 || !DECIMAL.test(amount))) {
      invalid(field, 'deve ser null ou decimal não negativo em USD por milhão de tokens');
    }
  }
  if (typeof value.reasoning !== 'boolean') invalid('reasoning', 'deve ser booleano');
  if (typeof value.sourceUrl !== 'string' || value.sourceUrl.length > 4096 ||
      !/^https:\/\/[^/]/.test(value.sourceUrl) || /[\x00-\x20\x7f\\]/.test(value.sourceUrl)) {
    invalid('sourceUrl', 'deve ser uma URL HTTPS');
  }
  let sourceUrl;
  try { sourceUrl = new URL(value.sourceUrl); }
  catch { invalid('sourceUrl', 'deve ser uma URL HTTPS'); }
  if (sourceUrl.protocol !== 'https:' || sourceUrl.username || sourceUrl.password ||
      value.sourceUrl.trim() !== value.sourceUrl) {
    invalid('sourceUrl', 'deve usar HTTPS sem credenciais');
  }
  timestamp(value.fetchedAt, 'fetchedAt');
  if (value.observedAt !== null) timestamp(value.observedAt, 'observedAt');
  return value;
}
