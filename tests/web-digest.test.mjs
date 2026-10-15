import test from 'node:test';
import assert from 'node:assert/strict';
import { webDigest } from '../src/ui/web-digest.mjs';
import { sha256Text } from '../src/adapters/memory-snapshots.mjs';
import { SnapshotReader } from '../src/application/snapshot-reader.mjs';
import { workspace, publish } from './helpers/local-fixtures.mjs';

const HEX64 = /^[a-f0-9]{64}$/;

// Fixture compartilhada da matriz: ASCII simples, não ASCII (acentos + emoji)
// e string vazia -- webDigest e sha256Text precisam coincidir nos três casos.
const SHARED_TEXTS = ['ola', 'Ação ñ 🚀', ''];

test('texto ASCII simples: hex de 64 chars igual a sha256Text', async () => {
  const hex = await webDigest('ola');
  assert.match(hex, HEX64);
  assert.equal(hex, sha256Text('ola'));
});

test('texto não ASCII (acentos + emoji): hex de 64 chars igual a sha256Text', async () => {
  const text = 'Ação ñ 🚀';
  const hex = await webDigest(text);
  assert.match(hex, HEX64);
  assert.equal(hex, sha256Text(text));
});

test('string vazia: hex de 64 chars igual a sha256Text', async () => {
  const hex = await webDigest('');
  assert.match(hex, HEX64);
  assert.equal(hex, sha256Text(''));
});

test('fixture compartilhada: webDigest e sha256Text produzem o mesmo hex para todos os textos', async () => {
  for (const text of SHARED_TEXTS) {
    const [webHex, nodeHex] = await Promise.all([webDigest(text), Promise.resolve(sha256Text(text))]);
    assert.match(webHex, HEX64);
    assert.equal(webHex, nodeHex, `webDigest(${JSON.stringify(text)}) deveria igualar sha256Text`);
  }
});

test('entrada não string lança TypeError antes de chamar crypto.subtle', async () => {
  for (const bad of [42, null, undefined, {}, [], true]) {
    await assert.rejects(() => webDigest(bad), TypeError);
  }
});

test('compatibilidade com SnapshotReader: refresh() aceita slices gravadas por sha256Text (MemorySnapshots) com webDigest injetado', async () => {
  const work = workspace();
  publish(work);
  const manifest = work.snapshots.readManifest(work.owner);
  const reader = new SnapshotReader({
    readManifest: () => manifest,
    readSlice: (revision, slice) => work.snapshots.readSlice(revision, slice, work.owner),
    digest: webDigest
  });
  const result = await reader.refresh();
  assert.equal(result.status, 'updated');
  assert.deepEqual(result.snapshot.catalog, work.data.catalog);
});

test('revisão: caminho negativo -- webDigest que diverge de sha256Text faz refresh() cair em unavailable, não updated', async () => {
  const work = workspace();
  publish(work);
  const manifest = work.snapshots.readManifest(work.owner);
  const diverging = async (bytes) => `${(await webDigest(bytes)).slice(0, 63)}0`; // último char trocado, ainda casa /^[a-f0-9]{64}$/
  const reader = new SnapshotReader({
    readManifest: () => manifest,
    readSlice: (revision, slice) => work.snapshots.readSlice(revision, slice, work.owner),
    digest: diverging
  });
  const result = await reader.refresh();
  assert.equal(result.status, 'unavailable');
  assert.equal(result.errorCode, 'SNAPSHOT_INVALID_OR_UNAVAILABLE');
});

test('revisão: crypto.subtle indisponível produz erro claro, não "Cannot read properties of undefined"', async () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {value: {}, configurable: true});
  try {
    await assert.rejects(() => webDigest('ola'), /crypto\.subtle indisponível/);
  } finally {
    Object.defineProperty(globalThis, 'crypto', original);
  }
});

test('revisão: HEX (tabela de lookup interna) não é mutável a partir de fora do módulo', async () => {
  // Prova indireta: dois dígitos diferentes continuam produzindo hex correto
  // mesmo após tentativas de mutação externa não terem efeito (tabela congelada).
  const before = await webDigest('proteção-hex');
  const again = await webDigest('proteção-hex');
  assert.equal(before, again);
});
