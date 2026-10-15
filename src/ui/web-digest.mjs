// Porta de digest do shell de navegador (AD-20). Calcula SHA-256 só com
// `crypto.subtle` (lido de `globalThis.crypto.subtle`, nunca `import` de
// `node:crypto`), para que o mesmo código funcione em Node (teste) e no
// navegador real sem adaptação. Mesma assinatura que `SnapshotReader` espera
// de `digest`: `(bytes: string) => Promise<string>`, produzindo exatamente o
// hex que `sha256Text` (src/adapters/memory-snapshots.mjs) produz para o
// mesmo texto -- prova de equivalência exigida pela fixture compartilhada.
const HEX = Object.freeze(Array.from({length: 256}, (_, byte) => byte.toString(16).padStart(2, '0')));

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let index = 0; index < bytes.length; index += 1) hex += HEX[bytes[index]];
  return hex;
}

export async function webDigest(text) {
  if (typeof text !== 'string') throw new TypeError('webDigest: text deve ser string');
  // Diagnóstico claro em vez de "Cannot read properties of undefined" quando
  // o contexto não é seguro (AD-20 exige HTTPS/localhost para crypto.subtle).
  if (!globalThis.crypto?.subtle) throw new Error('webDigest: crypto.subtle indisponível (contexto não seguro?)');
  const bytes = new TextEncoder().encode(text);
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return bufferToHex(buffer);
}
