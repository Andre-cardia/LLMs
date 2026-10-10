import { AccessDeniedError } from '../contracts/access.mjs';
import { assertManifest, assertEnvelope, assertSnapshotData, SLICES } from '../contracts/snapshot.mjs';
import { clone, freeze } from '../contracts/primitives.mjs';
export class SnapshotReader {
  #current = null; #intent = 0; #manifest; #slice; #digest;
  constructor({ readManifest, readSlice, digest }) { this.#manifest = readManifest; this.#slice = readSlice; this.#digest = digest; }
  get current() { return this.#current; }
  async refresh() {
    const intent = ++this.#intent;
    try {
      const manifest = clone(await this.#manifest()); assertManifest(manifest);
      const entries = await Promise.all(SLICES.map(async slice => {
        const bytes = await this.#slice(manifest.revision, slice);
        if (typeof bytes !== 'string' || await this.#digest(bytes) !== manifest.slices[slice].digest) throw new Error('SNAPSHOT_DIGEST_INVALID');
        const envelope = JSON.parse(bytes); assertEnvelope(envelope, slice); return [slice, envelope.data];
      }));
      const data = Object.fromEntries(entries); assertSnapshotData(data);
      if (intent !== this.#intent) return { status: 'superseded', snapshot: this.#current };
      this.#current = freeze({ manifest, ...data }); return { status: 'updated', snapshot: this.#current };
    } catch (error) {
      if (intent !== this.#intent) return { status: 'superseded', snapshot: this.#current };
      if(error instanceof AccessDeniedError){this.#current=null;return {status:'access-denied',snapshot:null,errorCode:'FORBIDDEN'};}
      return { status: this.#current ? 'kept-last-good' : 'unavailable', snapshot: this.#current, errorCode: 'SNAPSHOT_INVALID_OR_UNAVAILABLE' };
    }
  }
}
