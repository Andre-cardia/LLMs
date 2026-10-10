import { object, string, integer, oneOf, list } from '../contracts/primitives.mjs';
export function evaluateCollection(current, previous = null) {
  object(current, ['sourceId', 'scope', 'schemaVersion', 'mode', 'items'], 'Collection');
  string(current.sourceId, 'sourceId'); string(current.scope, 'scope'); integer(current.schemaVersion, 'schemaVersion', 1);
  oneOf(current.mode, ['full', 'incremental', 'single'], 'mode'); list(current.items, () => {}, 'items');
  if (previous !== null) evaluatePrevious(previous);
  if (current.mode !== 'full') return { accepted: true, reason: 'legitimate-partial' };
  if (current.items.length === 0) return { accepted: false, reason: 'empty-full' };
  const comparable = previous && previous.sourceId === current.sourceId && previous.scope === current.scope && previous.schemaVersion === current.schemaVersion && previous.mode === 'full';
  if (comparable && current.items.length < previous.items.length / 2) return { accepted: false, reason: 'below-half-baseline' };
  return { accepted: true, reason: 'valid-full' };
}
function evaluatePrevious(previous) {
  object(previous, ['sourceId', 'scope', 'schemaVersion', 'mode', 'items'], 'Baseline');
  string(previous.sourceId, 'sourceId'); string(previous.scope, 'scope'); integer(previous.schemaVersion, 'schemaVersion', 1);
  oneOf(previous.mode, ['full', 'incremental', 'single'], 'mode'); list(previous.items, () => {}, 'items');
}
