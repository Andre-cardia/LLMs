import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {APP_MARKER, APP_PAGES, buildApp, checkUiImports, moduleSpecifiers} from '../scripts/build-app.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));

async function temp(t) {
  const dir = await mkdtemp(join(tmpdir(), 'build-app-'));
  t.after(() => rm(dir, {recursive: true, force: true}));
  return dir;
}

async function tree(dir) {
  const out = {};
  async function walk(current) {
    for (const entry of await readdir(current, {withFileTypes: true})) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await walk(path);
      else out[relative(dir, path).split(sep).join('/')] = await readFile(path, 'utf8');
    }
  }
  await walk(dir);
  return out;
}

async function write(root, files) {
  for (const [path, text] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), {recursive: true});
    await writeFile(join(root, path), text);
  }
}

// Um src sintético mínimo e válido; cada caso de falha acrescenta o defeito.
const SYNTHETIC = Object.freeze({
  'src/contracts/a.mjs': 'export const a = 1;\n',
  'src/domain/b.mjs': "import {a} from '../contracts/a.mjs';\nexport const b = a + 1;\n",
  'src/application/c.mjs': "import {b} from '../domain/b.mjs';\nexport const c = b + 1;\n",
  'src/adapters/node-only.mjs': "import {createHash} from 'node:crypto';\nexport const h = createHash;\n",
  'src/ui/main.mjs': "import {c} from '../application/c.mjs';\nimport {x} from './fixtures/x.mjs';\nexport const m = c + x;\n",
  'src/ui/fixtures/x.mjs': 'export const x = 0;\n',
  'src/ui/index.html': '<!doctype html><script type="module" src="./ui/main.mjs"></script>\n',
  'src/ui/auth/callback/index.html': '<!doctype html><script type="module" src="../../ui/main.mjs"></script>\n',
});

async function synthetic(t, extra = {}) {
  const root = await temp(t);
  await write(root, {...SYNTHETIC, ...extra});
  return root;
}

const exists = path => stat(path).then(() => true, () => false);

test('build completo: artefato do repositório tem index.html, ui/, contracts/, domain/, application/ e nenhum adapter', async t => {
  const destination = join(await temp(t), 'app');
  await buildApp({root: repo, destination});
  for (const path of ['index.html', 'ui/main.mjs', 'ui/browser-shell.mjs', 'contracts', 'domain', 'application']) {
    assert.ok(await exists(join(destination, path)), path);
  }
  for (const path of ['adapters', 'tests', 'scripts', '_bmad-output', 'ui/index.html', 'ui/auth/callback/index.html']) {
    assert.equal(await exists(join(destination, path)), false, path);
  }
  const files = Object.keys(await tree(destination));
  assert.deepEqual(files.filter(path => path.endsWith('.json')), []);
  assert.equal(await readFile(join(destination, 'index.html'), 'utf8'), await readFile(join(repo, 'src/ui/index.html'), 'utf8'));
  // O shell não lê cesium-config.json nem token.
  for (const [path, text] of Object.entries(await tree(destination))) assert.doesNotMatch(text, /cesium-config|ionAccessToken|CESIUM_/, path);
});

test('imports resolvem: o grafo a partir de index.html carrega sem 404 e todo import relativo existe', async t => {
  const destination = join(await temp(t), 'app');
  await buildApp({root: repo, destination});
  const html = await readFile(join(destination, 'index.html'), 'utf8');
  const entries = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(entries, ['./ui/main.mjs']);
  // Simula o navegador: cada URL pedida a partir de index.html precisa existir no artefato.
  const base = new URL('http://localhost/app/index.html');
  const pending = entries.map(src => new URL(src, base));
  const loaded = new Set();
  while (pending.length > 0) {
    const url = pending.pop();
    if (loaded.has(url.href)) continue;
    assert.ok(url.pathname.startsWith('/app/'), url.href);
    const file = join(destination, decodeURIComponent(url.pathname.slice('/app/'.length)));
    assert.ok(await exists(file), `404: ${url.pathname}`);
    loaded.add(url.href);
    const {specifiers, dynamic} = moduleSpecifiers(await readFile(file, 'utf8'));
    assert.equal(dynamic, false, url.pathname);
    for (const specifier of specifiers) {
      assert.match(specifier, /^\.\.?\//, `${url.pathname} → ${specifier}`);
      pending.push(new URL(specifier, url));
    }
  }
  assert.ok(loaded.has('http://localhost/app/ui/browser-shell.mjs'));
  assert.ok(loaded.size >= 10);
  // Além do grafo de index.html, todo .mjs copiado tem imports que resolvem.
  for (const path of Object.keys(await tree(destination)).filter(path => path.endsWith('.mjs'))) {
    const file = join(destination, path);
    for (const specifier of moduleSpecifiers(await readFile(file, 'utf8')).specifiers) {
      assert.ok(await exists(resolve(dirname(file), specifier)), `${path} → ${specifier}`);
    }
  }
});

test('import quebrado: um .mjs copiado que importa caminho inexistente faz o build lançar com o caminho', async t => {
  const root = await synthetic(t, {'src/domain/broken.mjs': "import {z} from './missing.mjs';\nexport const y = z;\n"});
  await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), error => {
    assert.ok(error instanceof Error);
    assert.match(error.message, /APP_IMPORT_UNRESOLVED/);
    assert.match(error.message, /domain\/broken\.mjs → \.\/missing\.mjs/);
    return true;
  });
});

test('import quebrado: import que sai do artefato (para adapters) também lança', async t => {
  const root = await synthetic(t, {'src/application/leak.mjs': "export {h} from '../adapters/node-only.mjs';\n"});
  await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), /APP_IMPORT_UNRESOLVED: application\/leak\.mjs → \.\.\/adapters\/node-only\.mjs/);
});

test('JSON no artefato: um .json em src/ui/ faz o build lançar', async t => {
  const root = await synthetic(t, {'src/ui/fixtures/data.json': '{"a":1}\n'});
  await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), /APP_JSON_NOT_ALLOWED: ui\/fixtures\/data\.json/);
});

test('rebuild: duas execuções dão resultado idêntico e arquivo removido de src/ some do destino', async t => {
  const root = await synthetic(t, {'src/ui/extra.mjs': 'export const e = 1;\n'});
  const destination = join(root, 'dist', 'app');
  await mkdir(join(root, 'dist', 'app'), {recursive: true});
  await writeFile(join(root, 'dist', 'sibling.html'), 'preview');
  await buildApp({root, destination});
  const first = await tree(destination);
  await buildApp({root, destination});
  assert.deepEqual(await tree(destination), first);
  assert.deepEqual(Object.keys(first).sort(), [
    APP_MARKER, 'application/c.mjs', 'auth/callback/index.html', 'contracts/a.mjs', 'domain/b.mjs', 'index.html', 'ui/extra.mjs', 'ui/fixtures/x.mjs', 'ui/main.mjs'
  ].sort());
  await rm(join(root, 'src/ui/extra.mjs'));
  await buildApp({root, destination});
  assert.equal('ui/extra.mjs' in await tree(destination), false);
  // Só o subdiretório do app é limpo; vizinhos (o preview) ficam.
  assert.equal(await readFile(join(root, 'dist', 'sibling.html'), 'utf8'), 'preview');
});

test('rebuild: destino que conteria src/ ou a raiz é recusado antes de qualquer limpeza', async t => {
  const root = await synthetic(t);
  await assert.rejects(buildApp({root, destination: root}), /APP_DESTINATION_UNSAFE/);
  await assert.rejects(buildApp({root, destination: join(root, 'src')}), /APP_DESTINATION_UNSAFE/);
  await assert.rejects(buildApp({root, destination: join(root, 'src', 'ui', 'app')}), /APP_DESTINATION_UNSAFE/);
  assert.ok(await exists(join(root, 'src/ui/main.mjs')));
});

test('gate: árvore válida passa e conta os módulos alcançáveis', async t => {
  const root = await synthetic(t);
  const {violations, modules} = await checkUiImports({root});
  assert.deepEqual(violations, []);
  assert.equal(modules, 5);
});

test('gate: adapter direto é reprovado com a cadeia', async t => {
  const root = await synthetic(t, {'src/ui/direct.mjs': "import {h} from '../adapters/node-only.mjs';\nexport const d = h;\n"});
  const {violations} = await checkUiImports({root});
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0].chain, ['src/ui/direct.mjs', 'src/adapters/node-only.mjs']);
  assert.match(violations[0].message, /src\/ui\/direct\.mjs → src\/adapters\/node-only\.mjs \(src\/adapters\/\)/);
});

test('gate: adapter transitivo (via application, por import() literal) é reprovado com a cadeia inteira', async t => {
  const root = await synthetic(t, {
    'src/application/c.mjs': "import {b} from '../domain/b.mjs';\nexport const c = b + 1;\nexport const lazy = () => import('../adapters/node-only.mjs');\n",
  });
  const {violations} = await checkUiImports({root});
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0].chain, ['src/ui/main.mjs', 'src/application/c.mjs', 'src/adapters/node-only.mjs']);
});

test('gate: node:crypto alcançável é reprovado', async t => {
  const root = await synthetic(t, {'src/domain/b.mjs': "import {createHash} from 'node:crypto';\nimport {a} from '../contracts/a.mjs';\nexport const b = a + 1;\n"});
  const {violations} = await checkUiImports({root});
  assert.equal(violations.length, 1);
  assert.deepEqual(violations[0].chain, ['src/ui/main.mjs', 'src/application/c.mjs', 'src/domain/b.mjs', 'node:crypto']);
  assert.equal(violations[0].reason, 'node:');
});

test('gate: pacote e import() não literal também são reprovados', async t => {
  const root = await synthetic(t, {'src/ui/pkg.mjs': "import x from 'lodash';\nexport const p = name => import(name);\nexport default x;\n"});
  const reasons = (await checkUiImports({root})).violations.map(v => v.reason).sort();
  assert.deepEqual(reasons, ['import() não literal', 'pacote']);
});

test('gate: só um comentário citando src/adapters/ ou node: passa', async t => {
  const root = await synthetic(t, {
    'src/ui/commented.mjs': "// import {h} from '../adapters/node-only.mjs';\n/* import {createHash} from 'node:crypto';\n   import('../adapters/node-only.mjs') */\nexport const ok = 'https://example.invalid/src/adapters/';\n",
  });
  assert.deepEqual((await checkUiImports({root})).violations, []);
});

test('gate: npm run check sai com código ≠ 0 e mostra a cadeia quando src/ui alcança um adapter', async t => {
  const {spawnSync} = await import('node:child_process');
  const root = await synthetic(t, {'src/ui/direct.mjs': "import {h} from '../adapters/node-only.mjs';\nexport const d = h;\n"});
  await mkdir(join(root, 'scripts'), {recursive: true});
  await mkdir(join(root, 'tests'), {recursive: true});
  for (const name of ['check-local.mjs', 'build-app.mjs']) await writeFile(join(root, 'scripts', name), await readFile(join(repo, 'scripts', name)));
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'check-local.mjs')], {encoding: 'utf8'});
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /UI_IMPORT_FORBIDDEN: src\/ui\/direct\.mjs → src\/adapters\/node-only\.mjs/);
  // E o repositório real passa no gate.
  assert.deepEqual((await checkUiImports({root: repo})).violations, []);
});

test('headers: customHttp.yml preserva as entradas antigas e cobre /app, /app/, /app/auth/callback e /app/**', async () => {
  const text = await readFile(join(repo, 'customHttp.yml'), 'utf8');
  const blocks = Object.fromEntries(text.split(/\n(?=  - pattern: )/).slice(1).map(block => {
    const pattern = block.match(/pattern: '([^']+)'/)[1];
    const headers = Object.fromEntries([...block.matchAll(/- key: '([^']+)'\n\s+value: (?:'([^']*)'|"([^"]*)")/g)].map(m => [m[1], m[2] ?? m[3]]));
    return [pattern, headers];
  }));
  assert.deepEqual(blocks, {
    '/assets/cesium-config.json': {'Cache-Control': 'no-store'},
    '/prototype-cesium*': {'Referrer-Policy': 'origin'},
    '/app': {'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'},
    '/app/': {'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'},
    '/app/auth/callback': {'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store'},
    '/app/auth/callback/': {'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store'},
    '/app/**': {'Content-Security-Policy': "default-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'", 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'},
    '/app/**/*.mjs': {'Content-Type': 'text/javascript; charset=utf-8'},
    '/app/ui/fixtures/**': {'Cache-Control': 'no-store'},
  });
});

test('preview intacto: build completo numa cópia temporária gera dist/ui/index.html, mockups, _headers e dist/ui/app', async t => {
  const {spawnSync} = await import('node:child_process');
  const {cp} = await import('node:fs/promises');
  const root = await temp(t);
  const mockups = '_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/mockups';
  await cp(join(repo, mockups), join(root, mockups), {recursive: true, filter: path => !/cesium-config(\.local)?\.json$/.test(path)});
  await cp(join(repo, 'src'), join(root, 'src'), {recursive: true});
  await mkdir(join(root, 'scripts'));
  for (const name of ['build-ui-preview.mjs', 'build-app.mjs']) await writeFile(join(root, 'scripts', name), await readFile(join(repo, 'scripts', name)));
  // Um resto de build anterior em dist/ui/app some; o preview é recriado ao lado.
  await write(root, {'dist/ui/app/stale.mjs': 'export {};\n'});
  const env = {PATH: process.env.PATH, CESIUM_ION_PUBLIC_TOKEN: 'eyJfake.eyJfake.signature', CESIUM_APP_ORIGIN: 'https://example.invalid'};
  const result = spawnSync(process.execPath, [join(root, 'scripts', 'build-ui-preview.mjs')], {encoding: 'utf8', env});
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout.trim());
  assert.equal(summary.status, 'built');
  assert.equal(summary.app.output, 'dist/ui/app');
  const dist = join(root, 'dist/ui');
  for (const path of ['index.html', 'prototype-cesium.html', '_headers', 'assets/cesium-config.json', 'app/index.html', 'app/ui/main.mjs', 'app/auth/callback/index.html', 'app/ui/auth/callback.mjs']) {
    assert.ok(await exists(join(dist, path)), path);
  }
  assert.equal(await exists(join(dist, 'app/stale.mjs')), false);
  assert.equal(await readFile(join(dist, 'index.html'), 'utf8'), await readFile(join(repo, mockups, 'index.html'), 'utf8'));
  // Variáveis Cesium continuam exigidas: sem elas o build falha antes de tocar dist/.
  const failed = spawnSync(process.execPath, [join(root, 'scripts', 'build-ui-preview.mjs')], {encoding: 'utf8', env: {PATH: process.env.PATH}});
  assert.notEqual(failed.status, 0);
  const pipeline = await readFile(join(repo, 'amplify.yml'), 'utf8');
  assert.match(pipeline, /test -s dist\/ui\/index\.html/);
  // O pipeline falha se o shell não for gerado.
  assert.match(pipeline, /test -s dist\/ui\/app\/index\.html/);
  assert.match(pipeline, /test -s dist\/ui\/app\/ui\/main\.mjs/);
});

test('revisão: scanner não é enganado por marcadores de comentário dentro de strings', () => {
  assert.deepEqual(moduleSpecifiers("const g='src/*';\nimport {h} from '../adapters/x.mjs';\nconst e='*/';").specifiers, ['../adapters/x.mjs']);
  assert.deepEqual(moduleSpecifiers("const u = 'a//b'; import {x} from './y.mjs';").specifiers, ['./y.mjs']);
  assert.deepEqual(moduleSpecifiers("const r = /'\\/\\*/g; import {g} from './g.mjs';").specifiers, ['./g.mjs']);
});

test('revisão: um "import" dentro de string não conta como import', () => {
  assert.deepEqual(moduleSpecifiers("const s = 'import x from \"node:fs\"';").specifiers, []);
  assert.deepEqual(moduleSpecifiers('const u = new URL("..", import.meta.url);').specifiers, []);
});

test('revisão: sintaxe compacta e multilinha são reconhecidas', () => {
  assert.deepEqual(moduleSpecifiers("import{createHash}from'node:crypto'").specifiers, ['node:crypto']);
  assert.deepEqual(moduleSpecifiers("export*from'../adapters/x.mjs'").specifiers, ['../adapters/x.mjs']);
  assert.deepEqual(moduleSpecifiers("import {\n  a,\n  b\n} from './multi.mjs';").specifiers, ['./multi.mjs']);
});

test('revisão: import() concatenado, por variável ou template é não literal', () => {
  for (const code of ["await import('../adapters/' + name);", 'await import(name);', 'await import(`./f.mjs`);', "await import('./x.mjs', {with: {}});"]) {
    assert.equal(moduleSpecifiers(code).dynamic, true, code);
  }
  assert.deepEqual(moduleSpecifiers("await import('./e.mjs');"), {specifiers: ['./e.mjs'], dynamic: false});
});

test('revisão: import() não literal num módulo copiado reprova o build', async t => {
  const root = await synthetic(t, {'src/domain/lazy.mjs': 'export const l = n => import(n);\n'});
  await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), /APP_DYNAMIC_IMPORT: domain\/lazy\.mjs/);
});

test('revisão: dentro do repositório, só destinos sob dist/ são aceitos', async t => {
  const root = await synthetic(t);
  await write(root, {'scripts/keep.mjs': 'export {};\n', 'tests/keep.mjs': 'export {};\n'});
  for (const folder of ['scripts', 'tests', '_bmad-output']) {
    await assert.rejects(buildApp({root, destination: join(root, folder)}), /APP_DESTINATION_UNSAFE/, folder);
  }
  assert.ok(await exists(join(root, 'scripts/keep.mjs')));
  assert.ok(await exists(join(root, 'tests/keep.mjs')));
});

test('revisão: fora do repositório, diretório não vazio e sem marcador é recusado', async t => {
  const root = await synthetic(t);
  const outside = await temp(t);
  await writeFile(join(outside, 'precioso.txt'), 'não apagar');
  await assert.rejects(buildApp({root, destination: outside}), /APP_DESTINATION_UNSAFE/);
  assert.equal(await readFile(join(outside, 'precioso.txt'), 'utf8'), 'não apagar');
  const empty = join(await temp(t), 'novo');
  await buildApp({root, destination: empty});
  assert.ok(await exists(join(empty, APP_MARKER)));
  await buildApp({root, destination: empty}); // já marcado: pode ser substituído
});

test('revisão: build que falha deixa o artefato anterior intacto e não deixa staging', async t => {
  const root = await synthetic(t);
  const destination = join(root, 'dist', 'app');
  await buildApp({root, destination});
  const before = await tree(destination);
  await write(root, {'src/domain/broken.mjs': "import {z} from './missing.mjs';\nexport const y = z;\n"});
  await assert.rejects(buildApp({root, destination}), /APP_IMPORT_UNRESOLVED/);
  assert.deepEqual(await tree(destination), before);
  assert.deepEqual((await readdir(join(root, 'dist'))).filter(name => name.includes('staging')), []);
});

test('revisão: só .mjs e o index.html da raiz entram no artefato', async t => {
  for (const extra of ['src/ui/notes.md', 'src/domain/x.mjs.map', 'src/ui/.env', 'src/ui/fixtures/data.JSONC']) {
    const root = await synthetic(t, {[extra]: 'x\n'});
    await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), /APP_(FILE|JSON)_NOT_ALLOWED/, extra);
  }
});

test('revisão: index.html com script ou estilo inline é recusado (a CSP os bloquearia)', async t => {
  const inline = await synthetic(t, {'src/ui/index.html': '<!doctype html><script type="module" src="./ui/main.mjs"></script><script>alert(1)</script>\n'});
  await assert.rejects(buildApp({root: inline, destination: join(inline, 'dist', 'app')}), /APP_INLINE_SCRIPT_NOT_ALLOWED/);
  const styled = await synthetic(t, {'src/ui/index.html': '<!doctype html><p style="color:red">x</p><script type="module" src="./ui/main.mjs"></script>\n'});
  await assert.rejects(buildApp({root: styled, destination: join(styled, 'dist', 'app')}), /APP_INLINE_STYLE_NOT_ALLOWED/);
  const commented = await synthetic(t, {'src/ui/index.html': '<!doctype html><!-- <script src="./ui/missing.mjs"></script> --><script type="module" src=./ui/main.mjs></script>\n'});
  await buildApp({root: commented, destination: join(commented, 'dist', 'app')});
});

test('revisão: gate reprova import de src/ui para fora do artefato (tests/, outra pasta de src/)', async t => {
  const root = await synthetic(t, {
    'tests/helper.mjs': 'export const h = 1;\n',
    'src/other/o.mjs': 'export const o = 1;\n',
    'src/ui/leak.mjs': "import {h} from '../../tests/helper.mjs';\nimport {o} from '../other/o.mjs';\nexport const l = h + o;\n"
  });
  const {violations} = await checkUiImports({root});
  assert.deepEqual(violations.map(v => v.reason).sort(), ['fora do artefato', 'fora do artefato']);
});

test('revisão: gate rotula URL e caminho absoluto corretamente e tolera src/ui ausente', async t => {
  const root = await synthetic(t, {'src/ui/abs.mjs': "import a from '/x.mjs';\nimport b from 'https://cdn.example.invalid/m.mjs';\nexport {a, b};\n"});
  const reasons = (await checkUiImports({root})).violations.map(v => v.reason).sort();
  assert.deepEqual(reasons, ['URL', 'caminho absoluto']);
  const empty = await temp(t);
  await mkdir(join(empty, 'src'), {recursive: true});
  assert.deepEqual(await checkUiImports({root: empty}), {violations: [], modules: 0});
});

test('revisão: _headers do build espelha a CSP e o no-store de /app/', async t => {
  const text = await readFile(join(repo, 'scripts', 'build-ui-preview.mjs'), 'utf8');
  const yml = await readFile(join(repo, 'customHttp.yml'), 'utf8');
  const csp = yml.match(/Content-Security-Policy'\n\s+value: "([^"]+)"/)[1];
  assert.ok(text.includes(csp), 'a CSP de _headers precisa ser a mesma de customHttp.yml');
  assert.match(text, /\/app\/ui\/fixtures\/\*\\n {2}Cache-Control: no-store/);
  assert.match(text, /\['\/app\/auth\/callback','\/app\/auth\/callback\/'\]/);
  assert.match(text, /Referrer-Policy: no-referrer\\n {2}Cache-Control: no-store\\n`\)/);
});

test('callback: APP_PAGES inclui a página da callback, obrigatória', () => {
  assert.deepEqual(APP_PAGES.map(page => page.output), ['index.html', 'auth/callback/index.html']);
});

test('callback: o artefato do repositório publica auth/callback/index.html e o script dela resolve a partir de /app/auth/callback/', async t => {
  const destination = join(await temp(t), 'app');
  await buildApp({root: repo, destination});
  const html = await readFile(join(destination, 'auth/callback/index.html'), 'utf8');
  assert.equal(html, await readFile(join(repo, 'src/ui/auth/callback/index.html'), 'utf8'));
  const entries = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(entries, ['../../ui/auth/callback.mjs']);
  const url = new URL(entries[0], 'http://localhost/app/auth/callback/');
  assert.equal(url.pathname, '/app/ui/auth/callback.mjs');
  assert.ok(await exists(join(destination, 'ui/auth/callback.mjs')));
  assert.doesNotMatch(html.replace(/<!--[\s\S]*?-->/g, ''), /<script\b(?![^>]*\bsrc\s*=)[^>]*>\s*\S|<style\b|\sstyle\s*=/i);
});

test('callback: página ausente, com script que não resolve ou com inline reprova o build', async t => {
  const missing = await temp(t);
  const {['src/ui/auth/callback/index.html']: _omit, ...rest} = SYNTHETIC;
  await write(missing, rest);
  await assert.rejects(buildApp({root: missing, destination: join(missing, 'dist', 'app')}), /APP_PAGE_MISSING: src\/ui\/auth\/callback\/index\.html/);
  const broken = await synthetic(t, {'src/ui/auth/callback/index.html': '<!doctype html><script type="module" src="../../ui/missing.mjs"></script>\n'});
  await assert.rejects(buildApp({root: broken, destination: join(broken, 'dist', 'app')}), /APP_PAGE_SCRIPT_UNRESOLVED: auth\/callback\/index\.html → \.\.\/\.\.\/ui\/missing\.mjs/);
  // Relativo à raiz do artefato (e não à página) não resolve: o navegador pediria /app/auth/callback/ui/main.mjs.
  const rootRelative = await synthetic(t, {'src/ui/auth/callback/index.html': '<!doctype html><script type="module" src="./ui/main.mjs"></script>\n'});
  await assert.rejects(buildApp({root: rootRelative, destination: join(rootRelative, 'dist', 'app')}), /APP_PAGE_SCRIPT_UNRESOLVED/);
  const inline = await synthetic(t, {'src/ui/auth/callback/index.html': '<!doctype html><script type="module" src="../../ui/main.mjs"></script><script>alert(1)</script>\n'});
  await assert.rejects(buildApp({root: inline, destination: join(inline, 'dist', 'app')}), /APP_INLINE_SCRIPT_NOT_ALLOWED: auth\/callback\/index\.html/);
  const noScript = await synthetic(t, {'src/ui/auth/callback/index.html': '<!doctype html><p>x</p>\n'});
  await assert.rejects(buildApp({root: noScript, destination: join(noScript, 'dist', 'app')}), /APP_PAGE_WITHOUT_SCRIPT: auth\/callback\/index\.html/);
});

test('callback: outro .html fora de APP_PAGES continua reprovando o build', async t => {
  const root = await synthetic(t, {'src/ui/auth/other.html': '<!doctype html>\n'});
  await assert.rejects(buildApp({root, destination: join(root, 'dist', 'app')}), /APP_FILE_NOT_ALLOWED: ui\/auth\/other\.html/);
});
