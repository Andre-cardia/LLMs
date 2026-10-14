import { AccessDeniedError } from '../contracts/access.mjs';
import { createHash } from 'node:crypto';
import { assertCatalog } from '../contracts/catalog.mjs';
import { assertManifest, assertSnapshotData, assertCompanyMergedInto, MANIFEST_VERSION, SLICES } from '../contracts/snapshot.mjs';
import { string, integer, utc, clone, canonicalJson, requireSynchronous } from '../contracts/primitives.mjs';
export const sha256Text = text => createHash('sha256').update(text).digest('hex');
export class MemorySnapshots {
  #control; #clock; #mayRead; #mayUpdate; #objects = new Map(); #history = new Map();
  constructor({ control, clock, catalog, authorizeRead = () => false, authorizeUpdate = () => false }) {
    assertCatalog(catalog); this.#control = control; this.#clock = clock; this.#mayRead = authorizeRead; this.#mayUpdate = authorizeUpdate;
    control.transact(state => {
      if (state.snapshotRevision !== undefined) throw new Error('WORKSPACE_ALREADY_INITIALIZED');
      Object.assign(state, { catalog: clone(catalog), curationRevision: 'curation-0', snapshotRevision: null, snapshotSequence: 0, companyMergedInto: [], leases: new Map(), fenceSequence: new Map(), publishedRuns: new Map(), lastPublishedInput: null });
    });
  }
  #now() { const value = this.#clock(); utc(value, 'clock'); return value; }
  #authorize(callback, context) { if (callback(context) !== true) throw new AccessDeniedError(); }
  assertUpdateAccess(context) { this.#authorize(this.#mayUpdate, context); }
  releaseLease(lease, context) {
    this.assertUpdateAccess(context);
    return this.#control.transact(state => {
      const current = state.leases.get(lease.scope);
      if (!current || current.ownerRunId !== lease.ownerRunId || current.fencingToken !== lease.fencingToken) return false;
      state.leases.delete(lease.scope); return true;
    });
  }
  acquireLease(scope, ownerRunId, ttlMs, context) {
    this.#authorize(this.#mayUpdate, context); string(scope, 'scope'); string(ownerRunId, 'ownerRunId'); integer(ttlMs, 'ttlMs', 1);
    const now = utc(this.#now());
    return this.#control.transact(state => {
      const prior = state.leases.get(scope);
      if (prior && utc(prior.expiresAt) > now) throw new Error('LEASE_BUSY');
      const fencingToken = (state.fenceSequence.get(scope) ?? 0) + 1;
      const lease = { scope, ownerRunId, fencingToken, expiresAt: new Date(now + ttlMs).toISOString() };
      state.fenceSequence.set(scope, fencingToken); state.leases.set(scope, lease); return lease;
    });
  }
  publish({ expectedRevision, lease, models, news, lastSuccessAt }, context, prepareCuration = () => {}, complete = () => {}) {
    this.#authorize(this.#mayUpdate, context);
    const publishedAt = this.#now();
    string(lease.ownerRunId, 'ownerRunId');
    const payload = canonicalJson({ expectedRevision, lease, models, news, lastSuccessAt });
    let replay = false;
    const manifest = this.#control.transact(state => {
      const prior = state.publishedRuns.get(lease.ownerRunId);
      if (prior) {
        if (prior.payload !== payload) throw new Error('UPDATE_IDEMPOTENCY_CONFLICT');
        replay = true; return prior.manifest;
      }
      const active = state.leases.get('snapshot');
      if (!active || lease.scope !== 'snapshot' || active.ownerRunId !== lease.ownerRunId || active.fencingToken !== lease.fencingToken || utc(active.expiresAt) <= utc(publishedAt)) throw new Error('LEASE_EXPIRED_OR_FENCED');
      if (state.snapshotRevision !== expectedRevision) throw new Error('SNAPSHOT_CAS_LOST');
      const prepared = prepareCuration(state);
      requireSynchronous(prepared,'ASYNC_CURATION_FORBIDDEN');
      if (prepared && ['models','news','lastSuccessAt'].every(key=>Object.hasOwn(prepared,key))) ({ models, news, lastSuccessAt } = prepared);
      const data = { catalog: state.catalog, models, news }; assertSnapshotData(data);
      const successTimes = clone(lastSuccessAt);
      if (state.lastPublishedInput === null || state.lastPublishedInput.curationRevision !== state.curationRevision) successTimes.catalog = publishedAt;
      // A tabela só muda na transação de curadoria; o Publisher a emite validada contra o catálogo publicado,
      // antes de gravar qualquer objeto de slice.
      const companyMergedInto = clone(state.companyMergedInto);
      assertCompanyMergedInto(companyMergedInto, { nextCompanyIds: state.catalog.companies.map(company => company.id) });
      const revision = `snapshot-${state.snapshotSequence + 1}`;
      const slices = Object.fromEntries(SLICES.map(slice => {
        const content = canonicalJson({ schemaVersion: 1, slice, data: data[slice] });
        const digest = sha256Text(content); this.#objects.set(digest, content);
        return [slice, { objectKey: digest, digest, lastSuccessAt: successTimes[slice] }];
      }));
      const result = { schemaVersion: MANIFEST_VERSION, revision, curationRevision: state.curationRevision, publishedAt, slices, companyMergedInto }; assertManifest(result);
      const completion = complete(state, result);
      requireSynchronous(completion,'ASYNC_COMPLETION_FORBIDDEN');
      if (utc(active.expiresAt) <= utc(this.#now())) throw new Error('LEASE_EXPIRED_OR_FENCED');
      state.snapshotSequence += 1; state.snapshotRevision = revision;
      state.lastPublishedInput = clone({ models, news, lastSuccessAt: successTimes, curationRevision: state.curationRevision });
      state.leases.delete('snapshot');
      state.publishedRuns.set(lease.ownerRunId, { payload, manifest: result }); return result;
    });
    if (!replay) this.#history.set(manifest.revision, clone(manifest)); return manifest;
  }
  readManifest(context, revision = this.#control.read().snapshotRevision) {
    this.#authorize(this.#mayRead, context);
    if (!this.#history.has(revision)) throw new Error('SNAPSHOT_NOT_FOUND');
    return clone(this.#history.get(revision));
  }
  readSlice(revision, slice, context) {
    const manifest = this.readManifest(context, revision);
    if (!SLICES.includes(slice)) throw new Error('SLICE_NOT_FOUND');
    const content = this.#objects.get(manifest.slices[slice].objectKey);
    if (sha256Text(content) !== manifest.slices[slice].digest) throw new Error('DIGEST_MISMATCH');
    return content;
  }
}
