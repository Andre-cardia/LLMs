// Publicador S3 (Q2, AD-2, AD-6): lease, fencing e CAS do manifesto só com
// escrita condicional do S3, na disposição que a Lambda de leitura já lê
// (constantes em src/contracts/manifest.mjs).
//
// Porta de objetos injetada:
//   get(key)                         → {text, etag} | null
//   put(key, text, {ifNoneMatch?, ifMatch?}) → {etag}
//   delete(key, {ifMatch})           (opcional; só o release do lease usa)
// Um put condicional que perde falha com PreconditionFailedError (412) ou
// ConflictError (409). createMemoryObjectStore é a implementação fiel em memória
// (inclusive 412 em corrida); createS3ObjectStore fala com o S3 pelo SDK
// injetado (`IfNoneMatch: '*'`, `IfMatch: etag`).
//
// Slices e manifestos de revisão são imutáveis: sempre If-None-Match, nunca
// apagados nem sobrescritos. O ponteiro só muda por If-Match no ETag lido no
// início da publicação. Sem retry automático: quem perde o CAS falha.
//
// scripts/render-auth-stack.mjs empacota este arquivo no código inline da
// Lambda snapshot-publisher: só imports relativos na forma de uma linha, sem
// require (o SDK do S3 entra pela porta).
import {LEASE_KEY, LEASE_VERSION, MANIFEST_VERSION, POINTER_KEY, POINTER_VERSION, READABLE_REVISIONS, SLICES, SLICE_PREFIX, assertCompanyMergedInto, assertManifest, assertRevision, assertSnapshotData, assertSnapshotLease, assertSnapshotPointer, envelopeBytes, revisionKey} from '../contracts/snapshot.mjs';
import {integer, string, utc} from '../contracts/primitives.mjs';

export class PreconditionFailedError extends Error { constructor(key) { super('PRECONDITION_FAILED'); this.name = 'PreconditionFailedError'; this.code = 'PRECONDITION_FAILED'; this.status = 412; this.key = key; } }
export class ConflictError extends Error { constructor(key) { super('CONFLICT'); this.name = 'ConflictError'; this.code = 'CONFLICT'; this.status = 409; this.key = key; } }
const lost = error => error instanceof PreconditionFailedError || error instanceof ConflictError;
function publishError(code, cause) {
  const error = new Error(code); error.code = code;
  if (cause !== undefined) error.cause = cause;
  return error;
}
const DEFAULT_CURATION_REVISION = 'curation-0';
const JSON_TYPE = 'application/json; charset=utf-8';

function conditions(options) {
  const {ifNoneMatch, ifMatch} = options ?? {};
  if (ifNoneMatch !== undefined && ifNoneMatch !== '*') throw new TypeError('ifNoneMatch: só "*"');
  if (ifMatch !== undefined && (typeof ifMatch !== 'string' || ifMatch === '')) throw new TypeError('ifMatch: ETag exigido');
  if (ifNoneMatch !== undefined && ifMatch !== undefined) throw new TypeError('ifNoneMatch e ifMatch são exclusivos');
  return {ifNoneMatch, ifMatch};
}

// Bucket em memória fiel às regras de escrita condicional: a condição é avaliada
// e a escrita aplicada no mesmo passo síncrono, antes de qualquer await, então
// duas escritas concorrentes com a mesma condição nunca vencem juntas.
export function createMemoryObjectStore() {
  const objects = new Map(); const calls = []; let version = 0;
  const etagOf = () => `"m${(version += 1).toString(16)}"`;
  return {
    objects, calls,
    async get(key) {
      calls.push({op: 'get', key});
      const found = objects.get(key);
      return found === undefined ? null : {text: found.text, etag: found.etag};
    },
    async put(key, text, options) {
      const {ifNoneMatch, ifMatch} = conditions(options);
      if (typeof text !== 'string') throw new TypeError('text deve ser string');
      calls.push({op: 'put', key, ifNoneMatch, ifMatch});
      const found = objects.get(key);
      if (ifNoneMatch === '*' && found !== undefined) throw new PreconditionFailedError(key);
      if (ifMatch !== undefined && found?.etag !== ifMatch) throw new PreconditionFailedError(key);
      const etag = etagOf(); objects.set(key, {text, etag});
      return {etag};
    },
    async delete(key, options) {
      const {ifMatch} = conditions(options);
      calls.push({op: 'delete', key, ifMatch});
      const found = objects.get(key);
      if (ifMatch !== undefined && found?.etag !== ifMatch) throw new PreconditionFailedError(key);
      objects.delete(key);
    }
  };
}

// Porta S3 sobre o SDK injetado ({S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand}).
// Sem s3:ListBucket, chave ausente volta AccessDenied: tratada como ausente. Isso é
// seguro aqui porque toda escrita que segue a leitura é condicional: um objeto que
// existe e não pôde ser lido faz o If-None-Match falhar com 412, nunca sobrescreve.
export function createS3ObjectStore({bucket, sdk, client = new sdk.S3Client({})}) {
  string(bucket, 'bucket');
  const statusOf = error => error?.$metadata?.httpStatusCode;
  const translate = (error, key) => {
    if (error?.name === 'PreconditionFailed' || statusOf(error) === 412) return new PreconditionFailedError(key);
    if (error?.name === 'ConditionalRequestConflict' || statusOf(error) === 409) return new ConflictError(key);
    return error;
  };
  return {
    async get(key) {
      try {
        const output = await client.send(new sdk.GetObjectCommand({Bucket: bucket, Key: key}));
        return {text: await output.Body.transformToString('utf-8'), etag: output.ETag};
      } catch (error) {
        if (error?.name === 'NoSuchKey' || error?.name === 'AccessDenied') return null;
        throw error;
      }
    },
    async put(key, text, options) {
      const {ifNoneMatch, ifMatch} = conditions(options);
      const input = {Bucket: bucket, Key: key, Body: text, ContentType: JSON_TYPE};
      if (ifNoneMatch !== undefined) input.IfNoneMatch = ifNoneMatch;
      if (ifMatch !== undefined) input.IfMatch = ifMatch;
      try { return {etag: (await client.send(new sdk.PutObjectCommand(input))).ETag}; }
      catch (error) { throw translate(error, key); }
    },
    async delete(key, options) {
      const {ifMatch} = conditions(options);
      const input = {Bucket: bucket, Key: key};
      if (ifMatch !== undefined) input.IfMatch = ifMatch;
      try { await client.send(new sdk.DeleteObjectCommand(input)); }
      catch (error) { throw translate(error, key); }
    }
  };
}

// SHA-256 em hex por crypto.subtle (Node e runtime da Lambda), o mesmo hex de
// sha256Text e webDigest para os mesmos bytes.
export async function sha256Hex(text) {
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}
const randomSuffix = () => globalThis.crypto.randomUUID().slice(0, 8);
// Revisão única, endereçável por URL (REVISION_PATTERN): instante, token de fencing e sufixo aleatório.
const revisionFor = (now, fencingToken, suffix) => assertRevision(`r${now.replace(/[-:]/g, '').replace('.', '')}-${fencingToken}-${suffix}`);
// Estado gravado ilegível (JSON inválido ou fora do contrato) é um problema do bucket,
// não do dataset: vira SNAPSHOT_STATE_INVALID, com código próprio para o operador.
const parse = (text, assert) => {
  try { return assert(JSON.parse(text)); } catch (error) { throw publishError('SNAPSHOT_STATE_INVALID', error); }
};

export class S3SnapshotPublisher {
  #store; #digest; #clock; #random;
  // clock: instante da conferência de fencing logo antes da troca do ponteiro;
  // sem clock, vale o `now` da publicação.
  constructor({store, digest = sha256Hex, clock = null, random = randomSuffix}) {
    for (const name of ['get', 'put']) if (typeof store?.[name] !== 'function') throw new TypeError(`store.${name} deve ser função`);
    this.#store = store; this.#digest = digest; this.#clock = clock; this.#random = random;
  }

  async #readLease() {
    const found = await this.#store.get(LEASE_KEY);
    return found === null ? null : {lease: parse(found.text, assertSnapshotLease), etag: found.etag};
  }

  // Cria control/lease.json com If-None-Match; se existe e venceu, substitui com
  // If-Match no ETag lido. O token cresce a cada aquisição: o anterior + 1, ou 1.
  async acquire(owner, ttlMs, now) {
    string(owner, 'owner'); integer(ttlMs, 'ttlMs', 1); const at = utc(now, 'now');
    const prior = await this.#readLease();
    if (prior !== null && utc(prior.lease.expiresAt) > at) throw publishError('LEASE_BUSY');
    const lease = {schemaVersion: LEASE_VERSION, owner, expiresAt: new Date(at + ttlMs).toISOString(), fencingToken: (prior?.lease.fencingToken ?? 0) + 1};
    try {
      const {etag} = await this.#store.put(LEASE_KEY, JSON.stringify(lease), prior === null ? {ifNoneMatch: '*'} : {ifMatch: prior.etag});
      return Object.freeze({...lease, etag});
    } catch (error) {
      if (lost(error)) throw publishError('LEASE_BUSY', error);
      throw error;
    }
  }

  // Só apaga, com If-Match, se o dono e o token ainda forem os seus.
  // Liberar = gravar o próprio lease já vencido, com If-Match: o objeto continua e o
  // fencingToken segue crescendo entre publicações (e o papel não precisa de DeleteObject).
  async release(lease, now) {
    const current = await this.#readLease();
    if (current === null || current.lease.owner !== lease?.owner || current.lease.fencingToken !== lease?.fencingToken) return false;
    // Já liberado (ou vencido): nada a fazer.
    if (utc(current.lease.expiresAt) <= utc(now ?? new Date().toISOString())) return false;
    const expired = {...current.lease, expiresAt: new Date(0).toISOString()};
    try { await this.#store.put(LEASE_KEY, JSON.stringify(expired), {ifMatch: current.etag}); return true; }
    catch (error) { if (lost(error) || error?.name === 'NoSuchKey') return false; throw error; }
  }

  async #assertHolds(lease, at) {
    const current = await this.#readLease();
    if (current === null || current.etag !== lease.etag || current.lease.owner !== lease.owner
      || current.lease.fencingToken !== lease.fencingToken || utc(current.lease.expiresAt) <= at) throw publishError('LEASE_EXPIRED_OR_FENCED');
  }

  async #writeSlice(slice, data) {
    const bytes = envelopeBytes(slice, data);
    const digest = await this.#digest(bytes);
    const key = `${SLICE_PREFIX}${digest}`;
    try { await this.#store.put(key, bytes, {ifNoneMatch: '*'}); }
    catch (error) {
      if (!lost(error)) throw error;
      // Chave endereçada pelo digest: 412 (ou 409 de escrita concorrente igual) é o mesmo
      // conteúdo já gravado, aceito sem sobrescrever, desde que a releitura confira o digest.
      const existing = await this.#store.get(key);
      if (existing === null || await this.#digest(existing.text) !== digest) throw publishError('SNAPSHOT_SLICE_CORRUPT');
    }
    return {objectKey: key, digest};
  }

  async publish({data, now, lease, curationRevision}) {
    // Nada é lido nem gravado antes de o dataset e os parâmetros validarem.
    assertSnapshotData(data); const at = utc(now, 'now');
    if (!lease || typeof lease !== 'object') throw new TypeError('lease exigido');
    string(lease.owner, 'lease.owner'); string(lease.etag, 'lease.etag'); integer(lease.fencingToken, 'lease.fencingToken', 1);
    if (curationRevision !== undefined) string(curationRevision, 'curationRevision');
    if (utc(lease.expiresAt, 'lease.expiresAt') <= at) throw publishError('LEASE_EXPIRED_OR_FENCED');

    // Conferência barata antes de gravar: um lease alheio ou vencido não deixa órfãos.
    await this.#assertHolds(lease, at);
    const pointerObject = await this.#store.get(POINTER_KEY);
    const pointer = pointerObject === null ? null : parse(pointerObject.text, assertSnapshotPointer);
    let previous = null;
    if (pointer !== null) {
      const found = await this.#store.get(revisionKey(pointer.revision));
      if (found === null) throw publishError('SNAPSHOT_STATE_INVALID');
      previous = parse(found.text, assertManifest);
      if (previous.revision !== pointer.revision) throw publishError('SNAPSHOT_STATE_INVALID');
    }
    // A tabela acumulada vem do manifesto atual e vale contra o catálogo novo (AD-2).
    const companyMergedInto = (previous?.companyMergedInto ?? []).map(entry => ({fromCompanyId: entry.fromCompanyId, toCompanyId: entry.toCompanyId}));
    assertCompanyMergedInto(companyMergedInto, {nextCompanyIds: data.catalog.companies.map(company => company.id)});

    const slices = {};
    for (const slice of SLICES) slices[slice] = {...await this.#writeSlice(slice, data[slice]), lastSuccessAt: now};
    const revision = revisionFor(now, lease.fencingToken, this.#random());
    if (pointer?.readableRevisions.includes(revision)) throw publishError('SNAPSHOT_REVISION_EXISTS');
    const manifest = assertManifest({schemaVersion: MANIFEST_VERSION, revision,
      curationRevision: curationRevision ?? previous?.curationRevision ?? DEFAULT_CURATION_REVISION, publishedAt: now, slices, companyMergedInto});
    try { await this.#store.put(revisionKey(revision), JSON.stringify(manifest), {ifNoneMatch: '*'}); }
    catch (error) { if (lost(error)) throw publishError('SNAPSHOT_REVISION_EXISTS', error); throw error; }

    // Fencing: o lease ainda é deste dono, com o mesmo token e o mesmo ETag, e não venceu.
    await this.#assertHolds(lease, this.#clock === null ? at : utc(this.#clock(), 'clock'));

    const next = assertSnapshotPointer({schemaVersion: POINTER_VERSION, revision,
      readableRevisions: [revision, ...(pointer?.readableRevisions ?? [])].slice(0, READABLE_REVISIONS)});
    try { await this.#store.put(POINTER_KEY, JSON.stringify(next), pointerObject === null ? {ifNoneMatch: '*'} : {ifMatch: pointerObject.etag}); }
    catch (error) {
      // Revisão órfã fica privada: nunca entra no ponteiro e não é apagada.
      if (lost(error)) throw publishError('SNAPSHOT_CAS_LOST', error);
      throw error;
    }
    return {manifest, pointer: next};
  }
}
