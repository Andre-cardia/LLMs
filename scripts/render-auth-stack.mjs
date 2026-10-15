import {realpathSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
// Gera infra/auth-stack.yaml a partir de infra/auth-stack.template.yaml, embutindo
// src/adapters/lambda/owner-gate.mjs no ZipFile da Lambda. Única forma de gerar o template
// aplicável; o teste "template gerado está atualizado" falha quando divergem.
// O CloudFormation grava o ZipFile como index.js (CommonJS no nodejs24.x), então a linha
// final `export {...};` do handler vira `module.exports = {...};`. Nada mais é reescrito.

export const MARKER = '__OWNER_GATE_SOURCE__';
const MARKER_LINE = new RegExp(`^( *)${MARKER}$`, 'm');
const EXPORT_LINE = /^export \{([A-Za-z0-9_$, ]+)\};$/m;
// Teto próprio, bem abaixo do limite do ZipFile inline (zip de até 4 MB, segundo a referência
// AWS::Lambda::Function Code): mantém o handler pequeno e o template legível.
export const ZIPFILE_MAX_CHARS = 4096;

export function toCommonJs(source) {
  // O index.js inline não resolve dependências: nenhum import estático, import() ou require().
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  if (/^\s*import[\s{*'"]/m.test(code) || /\bimport\s*\(/.test(code) || /\brequire\s*\(/.test(code)) throw new Error('OWNER_GATE_IMPORT_NOT_ALLOWED');
  const exports = source.match(new RegExp(EXPORT_LINE.source, 'gm')) ?? [];
  if (exports.length !== 1) throw new Error('OWNER_GATE_EXPORT_LINE_REQUIRED');
  if (/^export\s/m.test(source.replace(EXPORT_LINE, ''))) throw new Error('OWNER_GATE_UNEXPECTED_EXPORT');
  return source.replace(EXPORT_LINE, (_, names) => `module.exports = {${names}};`);
}

export function renderAuthStack({template: rawTemplate, source: rawSource}) {
  // Checkouts com CRLF (Windows) geram o mesmo template.
  const template = rawTemplate.replace(/\r\n/g, '\n'), source = rawSource.replace(/\r\n/g, '\n');
  const found = template.match(new RegExp(MARKER_LINE.source, 'gm')) ?? [];
  if (found.length !== 1) throw new Error('AUTH_STACK_MARKER_REQUIRED');
  const code = toCommonJs(source).replace(/\s+$/, '');
  if (code.length > ZIPFILE_MAX_CHARS) throw new Error('OWNER_GATE_TOO_LARGE');
  if (code.includes('\t')) throw new Error('OWNER_GATE_TAB_NOT_ALLOWED');
  const indent = template.match(MARKER_LINE)[1];
  const block = code.split('\n').map(line => line.length === 0 ? '' : `${indent}${line.replace(/\s+$/, '')}`).join('\n');
  const header = '# Gerado por scripts/render-auth-stack.mjs a partir de infra/auth-stack.template.yaml\n'
    + '# e src/adapters/lambda/owner-gate.mjs. Não editar à mão.\n';
  return header + template.replace(MARKER_LINE, () => block);
}

const root = fileURLToPath(new URL('..', import.meta.url));
export const PATHS = Object.freeze({
  template: `${root}infra/auth-stack.template.yaml`,
  source: `${root}src/adapters/lambda/owner-gate.mjs`,
  output: `${root}infra/auth-stack.yaml`,
});

export async function renderFromRepo() {
  const [template, source] = await Promise.all([readFile(PATHS.template, 'utf8'), readFile(PATHS.source, 'utf8')]);
  return renderAuthStack({template, source});
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await writeFile(PATHS.output, await renderFromRepo());
  console.log(JSON.stringify({status: 'generated', output: 'infra/auth-stack.yaml'}));
}
