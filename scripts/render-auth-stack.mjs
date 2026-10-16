import {realpathSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {posix} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
// Gera infra/auth-stack.yaml a partir de infra/auth-stack.template.yaml, embutindo os três
// handlers no ZipFile de cada Lambda. Única forma de gerar o template aplicável; o teste
// "template gerado está atualizado" falha quando divergem.
// O CloudFormation grava o ZipFile como index.js (CommonJS no nodejs24.x).
//  - owner-gate: arquivo autossuficiente; só a linha final `export {...};` vira `module.exports`.
//  - snapshot-reader: empacotado com seus imports locais (owner-gate e src/contracts/manifest.mjs),
//    cada módulo no próprio escopo; o único require permitido é o SDK do S3 do runtime.
//  - snapshot-publisher: mesmo empacotador, com o Publicador S3, os contratos do snapshot e o
//    dataset sintético de src/contracts/synthetic-workspace.mjs.

export const MARKER = '__OWNER_GATE_SOURCE__';
export const READER_MARKER = '__SNAPSHOT_READER_SOURCE__';
export const READER_ENTRY = 'src/adapters/lambda/snapshot-reader.mjs';
export const PUBLISHER_MARKER = '__SNAPSHOT_PUBLISHER_SOURCE__';
export const PUBLISHER_ENTRY = 'src/adapters/lambda/snapshot-publisher.mjs';
export const LAMBDA_ENTRIES = Object.freeze([READER_ENTRY, PUBLISHER_ENTRY]);
const markerLine = marker => new RegExp(`^( *)${marker}$`, 'm');
const EXPORT_LINE = /^export \{([A-Za-z0-9_$, ]+)\};$/m;
// Teto próprio, bem abaixo do limite do ZipFile inline (zip de até 4 MB, segundo a referência
// AWS::Lambda::Function Code): mantém o handler pequeno e o template legível.
export const ZIPFILE_MAX_CHARS = 4096;
// O leitor leva os validadores de src/contracts/ junto: teto próprio, ainda longe dos 4 MB.
export const READER_MAX_CHARS = 32768;
// O publicador leva todos os validadores do snapshot e o dataset sintético (~13 KB).
export const PUBLISHER_MAX_CHARS = 98304;
export const READER_REQUIRES = Object.freeze(['@aws-sdk/client-s3']);

const stripComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

export function toCommonJs(source) {
  // O index.js inline não resolve dependências: nenhum import estático, import() ou require().
  const code = stripComments(source);
  if (/^\s*import[\s{*'"]/m.test(code) || /\bimport\s*\(/.test(code) || /\brequire\s*\(/.test(code)) throw new Error('OWNER_GATE_IMPORT_NOT_ALLOWED');
  const exports = source.match(new RegExp(EXPORT_LINE.source, 'gm')) ?? [];
  if (exports.length !== 1) throw new Error('OWNER_GATE_EXPORT_LINE_REQUIRED');
  if (/^export\s/m.test(source.replace(EXPORT_LINE, ''))) throw new Error('OWNER_GATE_UNEXPECTED_EXPORT');
  return source.replace(EXPORT_LINE, (_, names) => `module.exports = {${names}};`);
}

// Só a forma `import {a, b as c} from './x.mjs';`, numa linha, com caminho relativo.
const IMPORT_LINE = /^import \{([A-Za-z0-9_$, ]+)\} from '(\.{1,2}\/[A-Za-z0-9_./-]+\.mjs)';$/gm;
const DECLARED_EXPORT = /^export (?:async )?(?:function\*? |const |let |class )([A-Za-z0-9_$]+)/gm;

function importsOf(path, source) {
  const code = stripComments(source);
  const found = [...code.matchAll(IMPORT_LINE)];
  const rest = code.replace(IMPORT_LINE, '');
  if (/^\s*import[\s{*'"]/m.test(rest) || /\bimport\s*\(/.test(rest)) throw new Error(`READER_IMPORT_NOT_ALLOWED: ${path}`);
  for (const [, name] of rest.matchAll(/\brequire\s*\(\s*([^)]*)\)/g)) {
    if (!READER_REQUIRES.some(allowed => name.trim() === `'${allowed}'`)) throw new Error(`READER_REQUIRE_NOT_ALLOWED: ${path}`);
  }
  return found.map(([line, names, specifier]) => ({line, names, path: posix.normalize(posix.join(posix.dirname(path), specifier))}));
}
const bindings = names => names.split(',').map(part => part.trim()).filter(Boolean)
  .map(part => { const [name, alias] = part.split(/\s+as\s+/); return alias ? `${name}: ${alias}` : name; }).join(', ');

// Ordem topológica a partir da entrada; ciclos e módulos ausentes falham.
export function readerModuleOrder(modules, entry = READER_ENTRY) {
  const order = [], state = new Map();
  (function visit(path) {
    if (state.get(path) === 'done') return;
    if (state.get(path) === 'visiting') throw new Error(`READER_IMPORT_CYCLE: ${path}`);
    if (typeof modules[path] !== 'string') throw new Error(`READER_MODULE_MISSING: ${path}`);
    state.set(path, 'visiting');
    for (const dependency of importsOf(path, modules[path])) visit(dependency.path);
    state.set(path, 'done'); order.push(path);
  })(entry);
  return order;
}

export function bundleReader(modules, entry = READER_ENTRY) {
  const order = readerModuleOrder(modules, entry);
  const id = path => JSON.stringify(path.replace(/^src\//, ''));
  const rewrite = (path, source) => {
    let out = source;
    for (const dependency of importsOf(path, source)) out = out.replace(dependency.line, `const {${bindings(dependency.names)}} = __modules[${id(dependency.path)}];`);
    return out;
  };
  const parts = ["'use strict';", '// Empacotado por scripts/render-auth-stack.mjs: um escopo por módulo.', 'const __modules = {};'];
  for (const path of order.slice(0, -1)) {
    let body = rewrite(path, modules[path]);
    if (/^export (default|\*|\{[^}]*\} from)/m.test(body)) throw new Error(`READER_EXPORT_NOT_ALLOWED: ${path}`);
    const names = [...body.matchAll(DECLARED_EXPORT)].map(match => match[1]);
    for (const [, list] of body.matchAll(new RegExp(EXPORT_LINE.source, 'gm'))) names.push(...list.split(',').map(name => name.trim()).filter(Boolean));
    body = body.replace(new RegExp(EXPORT_LINE.source, 'gm'), '').replace(/^export (?=(?:async )?(?:function|const|let|class)\b)/gm, '');
    if (/^export\s/m.test(body)) throw new Error(`READER_EXPORT_NOT_ALLOWED: ${path}`);
    parts.push(`// ${path}`, `__modules[${id(path)}] = (() => {`, body.replace(/\s+$/, ''), `return {${names.join(', ')}};`, '})();');
  }
  const main = rewrite(entry, modules[entry]);
  const exports = main.match(new RegExp(EXPORT_LINE.source, 'gm')) ?? [];
  if (exports.length !== 1) throw new Error('READER_EXPORT_LINE_REQUIRED');
  if (/^export\s/m.test(main.replace(EXPORT_LINE, ''))) throw new Error('READER_UNEXPECTED_EXPORT');
  parts.push(`// ${entry}`, main.replace(EXPORT_LINE, (_, names) => `module.exports = {${names}};`));
  return parts.join('\n');
}

function embed(template, marker, code, {max, label}) {
  const line = markerLine(marker);
  const found = template.match(new RegExp(line.source, 'gm')) ?? [];
  if (found.length !== 1) throw new Error('AUTH_STACK_MARKER_REQUIRED');
  const trimmed = code.replace(/\s+$/, '');
  if (trimmed.length > max) throw new Error(`${label}_TOO_LARGE`);
  if (trimmed.includes('\t')) throw new Error(`${label}_TAB_NOT_ALLOWED`);
  const indent = template.match(line)[1];
  const block = trimmed.split('\n').map(text => text.length === 0 ? '' : `${indent}${text.replace(/\s+$/, '')}`).join('\n');
  return template.replace(line, () => block);
}

const lf = text => text.replace(/\r\n/g, '\n');
export function renderAuthStack({template: rawTemplate, source: rawSource, modules: rawModules}) {
  // Checkouts com CRLF (Windows) geram o mesmo template.
  const template = lf(rawTemplate), source = lf(rawSource);
  let out = embed(template, MARKER, toCommonJs(source), {max: ZIPFILE_MAX_CHARS, label: 'OWNER_GATE'});
  const modules = Object.fromEntries(Object.entries(rawModules ?? {}).map(([path, text]) => [path, lf(text)]));
  out = embed(out, READER_MARKER, bundleReader(modules), {max: READER_MAX_CHARS, label: 'READER'});
  out = embed(out, PUBLISHER_MARKER, bundleReader(modules, PUBLISHER_ENTRY), {max: PUBLISHER_MAX_CHARS, label: 'PUBLISHER'});
  const header = '# Gerado por scripts/render-auth-stack.mjs a partir de infra/auth-stack.template.yaml,\n'
    + '# src/adapters/lambda/owner-gate.mjs, src/adapters/lambda/snapshot-reader.mjs e\n'
    + '# src/adapters/lambda/snapshot-publisher.mjs. Não editar à mão.\n';
  return header + out;
}

const root = fileURLToPath(new URL('..', import.meta.url));
export const PATHS = Object.freeze({
  template: `${root}infra/auth-stack.template.yaml`,
  source: `${root}src/adapters/lambda/owner-gate.mjs`,
  reader: `${root}${READER_ENTRY}`,
  output: `${root}infra/auth-stack.yaml`,
});

// Lê as entradas do leitor e do publicador e tudo o que elas importam, por caminho
// relativo à raiz, num único mapa (cada pacote leva só o que a sua entrada alcança).
export async function readReaderModules(entries = LAMBDA_ENTRIES) {
  const modules = {};
  async function load(path) {
    if (Object.hasOwn(modules, path)) return;
    modules[path] = await readFile(`${root}${path}`, 'utf8');
    for (const dependency of importsOf(path, lf(modules[path]))) await load(dependency.path);
  }
  for (const entry of [entries].flat()) await load(entry);
  return modules;
}

export async function renderFromRepo() {
  const [template, source, modules] = await Promise.all([readFile(PATHS.template, 'utf8'), readFile(PATHS.source, 'utf8'), readReaderModules()]);
  return renderAuthStack({template, source, modules});
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await writeFile(PATHS.output, await renderFromRepo());
  console.log(JSON.stringify({status: 'generated', output: 'infra/auth-stack.yaml'}));
}
