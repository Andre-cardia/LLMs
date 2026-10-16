import { AccessDeniedError, RevisionSupersededError } from '../contracts/access.mjs';
import { assertManifestResponse, assertEnvelope, assertSnapshotData, assertCompanyMergedInto, SLICES } from '../contracts/snapshot.mjs';
import { clone, freeze } from '../contracts/primitives.mjs';
// Lê o ManifestResponse externo (AD-27): sem objectKey, slices por nome.
export class SnapshotReader {
  #current = null; #intent = 0; #manifest; #slice; #digest;
  constructor({ readManifest, readSlice, digest }) { this.#manifest = readManifest; this.#slice = readSlice; this.#digest = digest; }
  get current() { return this.#current; }
  async refresh() {
    const intent = ++this.#intent;
    try {
      const manifest = clone(await this.#manifest()); assertManifestResponse(manifest);
      const settled = await Promise.allSettled(SLICES.map(async slice => {
        const bytes = await this.#slice(manifest.revision, slice);
        if (typeof bytes !== 'string' || await this.#digest(bytes) !== manifest.slices[slice].digest) throw new Error('SNAPSHOT_DIGEST_INVALID');
        const envelope = JSON.parse(bytes); assertEnvelope(envelope, slice); return [slice, envelope.data];
      }));
      // Perda de acesso numa slice prevalece sobre qualquer outra falha simultânea:
      // o descarte não pode virar um novo refresh por revisão superada.
      const failures = settled.filter(result => result.status === 'rejected').map(result => result.reason);
      if (failures.length > 0) throw failures.find(reason => reason instanceof AccessDeniedError) ?? failures[0];
      const entries = settled.map(result => result.value);
      const data = Object.fromEntries(entries); assertSnapshotData(data);
      assertCompanyMergedInto(manifest.companyMergedInto, { nextCompanyIds: data.catalog.companies.map(company => company.id) });
      if (intent !== this.#intent) return { status: 'superseded', snapshot: this.#current };
      this.#current = freeze({ manifest, ...data }); return { status: 'updated', snapshot: this.#current };
    } catch (error) {
      if (intent !== this.#intent) return { status: 'superseded', snapshot: this.#current };
      if(error instanceof AccessDeniedError){this.#current=null;return {status:'access-denied',snapshot:null,errorCode:'FORBIDDEN'};}
      // Revisão recém-superada (404/410 de slice): o conjunto atual fica, e a raiz decide o único novo refresh.
      const errorCode = error instanceof RevisionSupersededError ? 'REVISION_SUPERSEDED' : 'SNAPSHOT_INVALID_OR_UNAVAILABLE';
      return { status: this.#current ? 'kept-last-good' : 'unavailable', snapshot: this.#current, errorCode };
    }
  }
}
