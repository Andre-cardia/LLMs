// Artefato do shell de navegador (AD-25). Copia src/contracts, src/domain,
// src/application e src/ui para `destination`, preservando os nomes das pastas
// para que os imports relativos funcionem sem reescrita, e põe cada página de
// APP_PAGES no seu caminho publicado (src/ui/index.html na raiz de
// `destination`). Não usa bundler nem pacote (Q9); não faz deploy.
// Também exporta o gate de imports de src/ui/ usado por scripts/check-local.mjs.
import {cp, lstat, mkdir, readdir, readFile, realpath, rename, rm, stat, writeFile} from 'node:fs/promises';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';

export const APP_FOLDERS = Object.freeze(['contracts', 'domain', 'application', 'ui']);
// Marcador que identifica um diretório como artefato deste build: só um
// diretório vazio, inexistente ou com este marcador pode ser substituído.
export const APP_MARKER = '.llms-app-artifact';
// Páginas HTML do artefato, todas obrigatórias: origem em src/ e caminho
// publicado em `destination`. A callback do login (AD-9) é /app/auth/callback.
export const APP_PAGES = Object.freeze([
  Object.freeze({source: 'ui/index.html', output: 'index.html'}),
  Object.freeze({source: 'ui/auth/callback/index.html', output: 'auth/callback/index.html'}),
]);
const PAGE_OUTPUTS = new Set(APP_PAGES.map(page => page.output));
// O artefato só publica módulos `.mjs` e as páginas de APP_PAGES; qualquer outro
// arquivo (JSON, mapas, .env, backups de editor) reprova o build.
const SKIPPED = new Set(['.DS_Store']);

// Tokenizador mínimo de JavaScript, só o necessário para achar imports sem
// confundir texto com código: comentários são descartados, e strings,
// template literals e regex literais viram tokens opacos. Um marcador de
// comentário dentro de uma string não apaga código, e um "import" dentro de
// uma string não conta como import.
function tokenize(text) {
  const tokens = [];
  let i = 0;
  const n = text.length;
  // Depois destes tokens, uma "/" inicia regex; depois de valor, é divisão.
  const regexAllowedAfter = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', 'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'await', 'yield']);
  const regexAllowed = () => {
    const last = tokens[tokens.length - 1];
    return !last || (last.type === 'punct' && regexAllowedAfter.has(last.value)) || (last.type === 'word' && regexAllowedAfter.has(last.value));
  };
  while (i < n) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') { while (i < n && text[i] !== '\n') i += 1; continue; }
    if (c === '/' && text[i + 1] === '*') { const end = text.indexOf('*/', i + 2); i = end === -1 ? n : end + 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1, value = '';
      while (j < n && text[j] !== c && text[j] !== '\n') { if (text[j] === '\\') { value += text[j + 1] ?? ''; j += 2; continue; } value += text[j]; j += 1; }
      tokens.push({type: 'string', value}); i = j + 1; continue;
    }
    if (c === '`') {
      // Template literal: o conteúdo é opaco; uma interpolação ${…} o torna não literal.
      let j = i + 1, depth = 0, interpolated = false;
      while (j < n) {
        if (text[j] === '\\') { j += 2; continue; }
        if (depth === 0 && text[j] === '`') break;
        if (text[j] === '$' && text[j + 1] === '{') { interpolated = true; depth += 1; j += 2; continue; }
        if (depth > 0 && text[j] === '}') { depth -= 1; j += 1; continue; }
        j += 1;
      }
      tokens.push({type: 'template', interpolated}); i = j + 1; continue;
    }
    if (c === '/' && regexAllowed()) {
      let j = i + 1, inClass = false;
      while (j < n && text[j] !== '\n') {
        if (text[j] === '\\') { j += 2; continue; }
        if (text[j] === '[') inClass = true; else if (text[j] === ']') inClass = false;
        else if (text[j] === '/' && !inClass) break;
        j += 1;
      }
      j += 1; while (j < n && /[a-z]/i.test(text[j])) j += 1;
      tokens.push({type: 'regex'}); i = j; continue;
    }
    if (/\s/.test(c)) { i += 1; continue; }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (j < n && /[\w$]/.test(text[j])) j += 1; tokens.push({type: 'word', value: text.slice(i, j)}); i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i; while (j < n && /[\w.]/.test(text[j])) j += 1; tokens.push({type: 'number'}); i = j; continue; }
    tokens.push({type: 'punct', value: c}); i += 1;
  }
  return tokens;
}

// Especificadores de imports estáticos, `export … from` e `import()` literais.
// `dynamic` indica um `import()` cujo argumento não é uma única string literal
// (concatenação, variável, template com interpolação ou opções extras).
export function moduleSpecifiers(text) {
  const tokens = tokenize(text);
  const specifiers = [];
  let dynamic = false;
  for (let k = 0; k < tokens.length; k += 1) {
    const t = tokens[k];
    if (t.type !== 'word' || (t.value !== 'import' && t.value !== 'export')) continue;
    const prev = tokens[k - 1];
    if (prev && prev.type === 'punct' && prev.value === '.') continue; // import.meta, obj.import
    const next = tokens[k + 1];
    if (t.value === 'import' && next?.type === 'punct' && next.value === '(') {
      const arg = tokens[k + 2], close = tokens[k + 3];
      if (arg?.type === 'string' && close?.type === 'punct' && close.value === ')') specifiers.push(arg.value);
      else if (arg?.type === 'template' && !arg.interpolated && close?.type === 'punct' && close.value === ')') dynamic = true;
      else dynamic = true;
      continue;
    }
    if (t.value === 'import' && next?.type === 'punct' && next.value === '.') continue; // import.meta
    if (t.value === 'import' && next?.type === 'string') { specifiers.push(next.value); continue; } // import './x.mjs'
    // import … from 'x' / export … from 'x': procura `from` antes do fim da declaração.
    for (let m = k + 1; m < tokens.length; m += 1) {
      const u = tokens[m];
      if (u.type === 'punct' && u.value === ';') break;
      if (u.type === 'word' && (u.value === 'import' || u.value === 'export') && m > k + 1) break;
      if (u.type === 'word' && u.value === 'from' && tokens[m + 1]?.type === 'string') { specifiers.push(tokens[m + 1].value); break; }
      if (t.value === 'export' && u.type === 'word' && ['const', 'let', 'var', 'function', 'class', 'async', 'default'].includes(u.value)) break;
    }
  }
  return {specifiers, dynamic};
}

const isRelative = specifier => specifier.startsWith('./') || specifier.startsWith('../');
const inside = (base, path) => {
  const rel = relative(base, path);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
};

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`SYMLINK_NOT_ALLOWED: ${path}`);
    if (entry.isDirectory()) out.push(...await files(path));
    else out.push(path);
  }
  return out.sort();
}

// Diretórios que só continham fontes de página (ex. ui/auth/callback/) não vão vazios ao artefato.
async function pruneEmptyDirs(dir) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    await pruneEmptyDirs(path);
    if ((await readdir(path)).length === 0) await rm(path, {recursive: true});
  }
}

async function isFile(path) {
  try { return (await stat(path)).isFile(); } catch { return false; }
}

// Uma página: sem script/estilo inline (a CSP os bloquearia) e todo `<script src>`
// relativo resolve, a partir do diretório da página, para um arquivo do artefato.
async function verifyPage(destination, output) {
  const page = join(destination, output);
  if (!await isFile(page)) throw new Error(output === 'index.html' ? 'APP_INDEX_MISSING' : `APP_PAGE_MISSING: ${output}`);
  const html = (await readFile(page, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
  // Script inline seria bloqueado pela CSP (default-src 'self') e não é verificado.
  if (/<script\b(?![^>]*\bsrc\s*=)[^>]*>\s*\S/i.test(html)) throw new Error(output === 'index.html' ? 'APP_INLINE_SCRIPT_NOT_ALLOWED' : `APP_INLINE_SCRIPT_NOT_ALLOWED: ${output}`);
  if (/<style\b|\sstyle\s*=/i.test(html)) throw new Error(output === 'index.html' ? 'APP_INLINE_STYLE_NOT_ALLOWED' : `APP_INLINE_STYLE_NOT_ALLOWED: ${output}`);
  const scripts = [...html.matchAll(/<script\b[^>]*?(?<![\w-])src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi)].map(match => match[1] ?? match[2] ?? match[3]);
  if (scripts.length === 0) throw new Error(output === 'index.html' ? 'APP_INDEX_WITHOUT_SCRIPT' : `APP_PAGE_WITHOUT_SCRIPT: ${output}`);
  for (const src of scripts) {
    const target = resolve(dirname(page), src);
    if (!isRelative(src) || !inside(destination, target) || !await isFile(target)) throw new Error(output === 'index.html' ? `APP_INDEX_SCRIPT_UNRESOLVED: ${output} → ${src}` : `APP_PAGE_SCRIPT_UNRESOLVED: ${output} → ${src}`);
  }
}

// Verifica o artefato: nenhum JSON; todo import de todo `.mjs` é relativo e
// resolve para um arquivo copiado dentro de `destination`; cada página de
// APP_PAGES existe e aponta para módulos existentes.
export async function verifyApp(destination) {
  const all = (await files(destination)).filter(path => relative(destination, path) !== APP_MARKER);
  const json = all.filter(path => /\.json[c5]?$/i.test(path));
  if (json.length > 0) throw new Error(`APP_JSON_NOT_ALLOWED: ${json.map(path => relative(destination, path)).join(', ')}`);
  const other = all.filter(path => !path.endsWith('.mjs') && !PAGE_OUTPUTS.has(relative(destination, path).split(sep).join('/')));
  if (other.length > 0) throw new Error(`APP_FILE_NOT_ALLOWED: ${other.map(path => relative(destination, path)).join(', ')}`);
  for (const file of all.filter(path => path.endsWith('.mjs'))) {
    const {specifiers, dynamic} = moduleSpecifiers(await readFile(file, 'utf8'));
    const from = relative(destination, file);
    if (dynamic) throw new Error(`APP_DYNAMIC_IMPORT: ${from}`);
    for (const specifier of specifiers) {
      if (!isRelative(specifier)) throw new Error(`APP_IMPORT_NOT_RELATIVE: ${from} → ${specifier}`);
      const target = resolve(dirname(file), specifier);
      if (!inside(destination, target) || !await isFile(target)) throw new Error(`APP_IMPORT_UNRESOLVED: ${from} → ${specifier}`);
    }
  }
  for (const page of APP_PAGES) await verifyPage(destination, page.output);
  return {files: all.map(path => relative(destination, path).split(sep).join('/'))};
}

async function realParent(path) {
  // Resolve links simbólicos do caminho existente mais próximo, para que um
  // ancestral que aponte para src/ não engane a verificação.
  let current = path, rest = [];
  for (;;) {
    try { return join(await realpath(current), ...rest); }
    catch { rest = [current.split(sep).pop(), ...rest]; const up = dirname(current); if (up === current) return path; current = up; }
  }
}
async function replaceable(destination) {
  try { if (!(await lstat(destination)).isDirectory()) return false; } catch { return true; }
  const entries = await readdir(destination);
  return entries.length === 0 || entries.includes(APP_MARKER);
}

export async function buildApp({root, destination}) {
  if (!root || !destination || !isAbsolute(root) || !isAbsolute(destination)) throw new Error('APP_PATHS_MUST_BE_ABSOLUTE');
  const realRoot = await realpath(root);
  const src = join(realRoot, 'src');
  destination = await realParent(resolve(destination));
  // A limpeza só atinge um artefato deste build: dentro do repositório, só sob
  // dist/; em qualquer lugar, só um diretório vazio, inexistente ou marcado.
  const insideRepo = destination === realRoot || inside(realRoot, destination);
  if (insideRepo && !inside(join(realRoot, 'dist'), destination)) throw new Error(`APP_DESTINATION_UNSAFE: ${destination}`);
  if (inside(destination, src) || inside(src, destination)) throw new Error(`APP_DESTINATION_UNSAFE: ${destination}`);
  // Dentro de dist/ do repositório, o build é o dono do diretório. Fora do
  // repositório, só substitui um destino vazio, inexistente ou já marcado.
  if (!insideRepo && !await replaceable(destination)) throw new Error(`APP_DESTINATION_UNSAFE: ${destination} (não vazio e sem ${APP_MARKER})`);
  for (const folder of APP_FOLDERS) {
    const info = await lstat(join(src, folder)).catch(() => null);
    if (!info?.isDirectory()) throw new Error(`APP_SOURCE_MISSING: src/${folder}`);
  }
  const pages = APP_PAGES.map(page => ({...page, from: join(src, ...page.source.split('/'))}));
  for (const page of pages) {
    if (!await isFile(page.from)) throw new Error(page.output === 'index.html' ? 'APP_INDEX_MISSING' : `APP_PAGE_MISSING: src/${page.source}`);
  }
  const pageSources = new Set(pages.map(page => page.from));
  // Constrói num diretório irmão e só troca depois de verificar: uma falha deixa
  // o artefato anterior intacto.
  const staging = `${destination}.staging-${process.pid}-${Date.now()}`;
  await rm(staging, {recursive: true, force: true});
  try {
    await mkdir(staging, {recursive: true});
    for (const folder of APP_FOLDERS) {
      await files(join(src, folder)); // links simbólicos reprovam antes de copiar
      await cp(join(src, folder), join(staging, folder), {
        recursive: true,
        // As páginas vão só para o caminho publicado (abaixo), não para ui/.
        filter: path => !SKIPPED.has(path.split(sep).pop()) && !pageSources.has(path),
      });
    }
    for (const page of pages) {
      const target = join(staging, ...page.output.split('/'));
      await mkdir(dirname(target), {recursive: true});
      await cp(page.from, target);
    }
    await writeFile(join(staging, APP_MARKER), '');
    await pruneEmptyDirs(staging);
    const result = await verifyApp(staging);
    await rm(destination, {recursive: true, force: true});
    await mkdir(dirname(destination), {recursive: true});
    await rename(staging, destination);
    return result;
  } catch (error) {
    await rm(staging, {recursive: true, force: true});
    throw error;
  }
}

// Gate de AD-25: a partir de cada `.mjs` de src/ui/, segue imports estáticos e
// `import()` literais; reprova módulo alcançável em src/adapters/, `node:*`,
// pacote, import relativo que não resolve ou `import()` não literal.
// Devolve a lista de violações, cada uma com a cadeia de imports.
export async function checkUiImports({root}) {
  const src = join(await realpath(root), 'src');
  const ui = join(src, 'ui');
  const adapters = join(src, 'adapters');
  const allowed = APP_FOLDERS.map(folder => join(src, folder));
  const show = path => relative(dirname(src), path).split(sep).join('/');
  if (!await lstat(ui).then(info => info.isDirectory(), () => false)) return {violations: [], modules: 0};
  const starts = (await files(ui)).filter(path => path.endsWith('.mjs'));
  const violations = [];
  const visited = new Set();
  const label = item => item.startsWith?.(sep) ? show(item) : item;
  const report = (chain, reason) => violations.push({chain: chain.map(label), reason, message: `${chain.map(label).join(' → ')} (${reason})`});
  async function walk(file, chain) {
    if (visited.has(file)) return;
    visited.add(file);
    const {specifiers, dynamic} = moduleSpecifiers(await readFile(file, 'utf8'));
    if (dynamic) report(chain, 'import() não literal');
    for (const specifier of specifiers) {
      if (!isRelative(specifier)) {
        const reason = specifier.startsWith('node:') ? 'node:' : /^[a-z][\w+.-]*:/i.test(specifier) ? 'URL' : specifier.startsWith('/') ? 'caminho absoluto' : 'pacote';
        report([...chain, specifier], reason);
        continue;
      }
      const resolved = resolve(dirname(file), specifier);
      // realpath normaliza a caixa em sistemas de arquivos que a ignoram (macOS).
      const target = await isFile(resolved) ? await realpath(resolved) : resolved;
      const next = [...chain, target];
      if (target === adapters || inside(adapters, target)) { report(next, 'src/adapters/'); continue; }
      if (!await isFile(target)) { report(next, 'import não resolve'); continue; }
      if (!allowed.some(folder => inside(folder, target))) { report(next, 'fora do artefato'); continue; }
      await walk(target, next);
    }
  }
  for (const start of starts) await walk(start, [start]);
  return {violations, modules: visited.size};
}
