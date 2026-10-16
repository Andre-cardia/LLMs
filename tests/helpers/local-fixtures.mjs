import { readFile } from 'node:fs/promises';
import { clone } from '../../src/contracts/primitives.mjs';
import { MemoryControl } from '../../src/adapters/memory-control.mjs';
import { MemorySnapshots, sha256Text } from '../../src/adapters/memory-snapshots.mjs';
import { SnapshotReader } from '../../src/application/snapshot-reader.mjs';
export const fixture = JSON.parse(await readFile(new URL('../fixtures/local-workspace.json', import.meta.url), 'utf8'));
export const invalidFixture = JSON.parse(await readFile(new URL('../fixtures/local-workspace-invalid.json', import.meta.url), 'utf8'));
export function workspace() {
  const data = clone(fixture); let now = data.now;
  const owner = Symbol('owner-fixture'); const job = Symbol('scheduler-fixture'); const agent = Symbol('agent-fixture');
  const control = new MemoryControl(); const clock = () => now;
  const snapshots = new MemorySnapshots({ control, clock, catalog: data.catalog, authorizeRead: context => context === owner, authorizeUpdate: context => context === job });
  const reader = new SnapshotReader({ readManifest: () => snapshots.readManifestResponse(owner), readSlice: (revision, slice) => snapshots.readSlice(revision, slice, owner), digest: sha256Text });
  return { data, control, snapshots, reader, owner, job, agent, clock, setClock(value) { now = value; } };
}
export function publish(work, runId = 'run-1', prepare = () => {}) {
  const lease = work.snapshots.acquireLease('snapshot', runId, 60000, work.job);
  return work.snapshots.publish({ expectedRevision: work.control.read().snapshotRevision, lease, models: work.data.models, news: work.data.news,
    lastSuccessAt: { catalog: work.clock(), models: work.clock(), news: work.clock() } }, work.job, prepare);
}
export function source(changes = {}) {
  return { schemaVersion: 1, sourceId: 'fixture-models', kind: 'models', enabled: true, credentialsValid: true, hasValidData: true,
    lastSuccessAt: fixture.now, lastFailureAt: null, consecutiveFailures: 0, cadenceMs: 3600000,
    observedAt: null, observedAtRequired: false, documentedDelayMs: null, market: null, ...changes };
}
