---
title: 'Build e headers do shell: dist/ui/app/, gate de imports e customHttp.yml (AD-25)'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'fc8d786c8b9a988deaeec8144b0bc503e9928160'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o shell (`src/ui/`) existe, mas não chega ao navegador: `scripts/build-ui-preview.mjs` só copia os mockups, então `dist/ui/app/` não existe e `index.html` não encontra `./ui/main.mjs`. Nada impede que um módulo de `src/ui/` passe a importar `src/adapters/` ou `node:*`, e o Amplify não tem headers para `/app/`.

**Approach:** um módulo `scripts/build-app.mjs` exporta `buildApp({root, destination})`, que copia `src/contracts`, `src/domain`, `src/application` e `src/ui` para `destination` preservando as pastas e põe `src/ui/index.html` na raiz de `destination`. `build-ui-preview.mjs` continua sendo o único build e o chama com `dist/ui/app`. `scripts/check-local.mjs` ganha o gate de imports. `customHttp.yml` ganha os headers de `/app/`.

## Boundaries & Constraints

**Always:**
- `buildApp` verifica, depois de copiar, que todo import relativo de todo `.mjs` em `destination` resolve para um arquivo copiado; falha (lança) se não resolver. Nada de `src/adapters/`, `tests/`, `_bmad-output/` ou `scripts/` entra em `destination`; todo `.json` copiado falha o build (as fixtures são módulos JS).
- Gate em `check-local.mjs`: a partir de cada `.mjs` em `src/ui/`, segue imports estáticos e `import()` literais; falha com o caminho da cadeia se algum alcançável estiver em `src/adapters/` ou for `node:*`/pacote. Comentários não contam.
- Ordem no build existente: as validações de variáveis Cesium e a cópia dos mockups ficam como estão; `buildApp` roda depois, sobre `dist/ui/app`, limpando antes só esse subdiretório. `dist/ui/index.html` e o gate `test -s dist/ui/index.html` do `amplify.yml` ficam intactos.
- `customHttp.yml`, acrescentando sem remover os existentes: `/app/**` com `Content-Security-Policy: default-src 'self'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`; `/app/**/*.mjs` com `Content-Type: text/javascript; charset=utf-8`; `/app/ui/fixtures/*` com `Cache-Control: no-store`.
- O shell continua sem ler `cesium-config.json` nem token.

**Never:** mudar `amplify.yml`, o pipeline ou a ordem dos comandos de build; deploy, push ou chamada à AWS; bundler ou pacote novo (Q9); alterar `src/`; mexer nos mockups.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Build completo | `buildApp` num diretório temporário | `index.html`, `ui/main.mjs`, `ui/browser-shell.mjs`, `contracts/`, `domain/`, `application/` presentes; sem `adapters/` | N/A |
| Imports resolvem | artefato gerado | todo import relativo aponta para arquivo existente | N/A |
| Import quebrado | um `.mjs` copiado importa caminho inexistente | build lança com o caminho | `Error` |
| JSON no artefato | um `.json` em `src/ui/` | build lança | `Error` |
| Rebuild | `buildApp` duas vezes | resultado idêntico; arquivo removido de `src/` some de `destination` | N/A |
| Gate: adapter | módulo de `src/ui/` (direto ou transitivo) importa `src/adapters/` | `npm run check` sai com código ≠ 0 e mostra a cadeia | N/A |
| Gate: node | módulo alcançável importa `node:crypto` | idem | N/A |
| Gate: comentário | só um comentário cita `src/adapters/` | passa | N/A |
| Headers | `customHttp.yml` | entradas antigas preservadas; as quatro novas presentes | N/A |
| Preview intacto | build local | `dist/ui/index.html` e mockups continuam gerados | N/A |

</frozen-after-approval>

## Code Map

- `scripts/build-ui-preview.mjs` -- único build; valida `CESIUM_*`, copia mockups para `dist/ui`, grava `cesium-config.json` e `_headers`. Acrescentar a chamada a `buildApp` no fim, sem tocar no resto.
- `scripts/check-local.mjs` -- hoje só `node --check` por módulo; acrescentar o gate depois do laço existente.
- `customHttp.yml` -- duas entradas atuais (`/assets/cesium-config.json`, `/prototype-cesium*`); acrescentar.
- `amplify.yml` -- `npm run validate`, `npm run build`, `test -s dist/ui/index.html`; não mudar.
- `src/ui/index.html` -- já carrega `./ui/main.mjs`, caminho do artefato.
- `tests/fixture-source.test.mjs`, `tests/browser-shell.test.mjs` -- guardas locais de import; referência de regex, não remover.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/build-app.mjs` -- `buildApp({root, destination})` com cópia, limpeza e verificação de resolução.
- [x] `scripts/build-ui-preview.mjs` -- chamar `buildApp` para `dist/ui/app`.
- [x] `scripts/check-local.mjs` -- gate de imports de `src/ui/`.
- [x] `customHttp.yml` -- headers de `/app/`.
- [x] `tests/build-app.test.mjs` -- matriz com diretórios temporários (`os.tmpdir`) e um `src` sintético para os casos de falha; o gate testado chamando a função de verificação exportada sobre uma árvore temporária.

**Acceptance Criteria:**
- Given `npm run build:ui:local`, when termina, then `dist/ui/app/index.html` existe, todo import de `dist/ui/app/**/*.mjs` resolve e `dist/ui/index.html` continua presente.
- Given o artefato gerado servido por um servidor estático local, when `index.html` é aberto, then `main.mjs` e seus imports carregam sem 404 (verificado por um teste que resolve o grafo a partir de `index.html`).

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind, edge, gap | Scanner de imports por regex era enganado por `/*` e `//` dentro de strings, por `import` dentro de string, por sintaxe compacta (`import{x}from'y'`) e por `import()` concatenado | high | Os quatro casos reproduzidos: imports para `src/adapters/` passavam pelo gate e pelo `verifyApp`. Trocado por um tokenizador mínimo (strings, templates, regex e comentários), sem pacote; testes cobrem os dois sentidos | patch |
| 2 | blind, edge | `buildApp` apagava qualquer destino fora de `src/` (ex. `scripts/`, `tests/`, `$HOME/...`) com `rm -rf` | high | Destino dentro do repositório agora só sob `dist/`; fora dele, só diretório vazio, inexistente ou com o marcador `.llms-app-artifact`; ancestral simbólico resolvido por `realpath`. Mutação confirmada | patch |
| 3 | blind, edge | Build não atômico: falha depois do `rm` deixava `dist/ui/app` vazio ou parcial | medium | Constrói num diretório irmão de staging, verifica e só então troca; falha remove o staging e mantém o artefato anterior. Teste novo | patch |
| 4 | blind | Gate aceitava alvos relativos fora do artefato (`tests/`, outra pasta de `src/`) que depois quebravam o build | medium | Gate agora exige alvo dentro de `src/{contracts,domain,application,ui}`; rótulos `URL` e `caminho absoluto`; `src/ui` ausente não quebra | patch |
| 5 | blind, edge | Só JSON era barrado; `.md`, `.map`, `.env`, `.JSONC` seriam publicados | medium | Allowlist: só `.mjs` e o `index.html` da raiz. Teste novo | patch |
| 6 | blind, edge | CSP sem `frame-ancestors`, `base-uri`, `form-action`, `object-src`; padrões não cobriam `/app` e `/app/`; fixtures aninhadas sem `no-store` | medium | CSP completa em `/app`, `/app/` e `/app/**`; fixtures em `/app/ui/fixtures/**`. Verificado no Chrome headless sob a CSP: zero bloqueios | patch |
| 7 | blind, edge | `_headers` divergia de `customHttp.yml` para `/app/` | low | `_headers` passa a espelhar CSP e `no-store`; teste mantém os dois iguais | patch |
| 8 | edge | `index.html` com script/estilo inline seria bloqueado em silêncio pela CSP; `src` sem aspas ou comentado era mal lido | low | Inline reprova o build; `src` sem aspas aceito; comentários HTML ignorados. Teste novo | patch |
| 9 | gap | Nenhum `buildApp` exercitava `APP_DYNAMIC_IMPORT` | medium | Teste novo; mutação removendo a checagem agora quebra o teste | patch |
| 10 | edge | `lstat`/`index.html` ausentes davam `ENOENT` cru antes dos códigos | low | Checados antes da limpeza com códigos próprios | patch |
| 11 | blind | Comentários misturavam inglês e português em `build-ui-preview.mjs` | low | Traduzidos | patch |
| 12 | edge | Prefixo `..cache` era tratado como fora da base | low | `inside` corrigido para `..` + separador | patch |
| 13 | blind | `/app` sem barra final resolveria `./ui/main.mjs` errado | false | O Amplify acrescenta a barra quando `app.html` não existe ([Redirects and rewrites](https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.md)); o smoke test confirmou o redirecionamento `/app` → `/app/` | rejeitado |
| 14 | blind | `amplify.yml` não confere `dist/ui/app/index.html` | medium | Real, mas a spec congelada proíbe mudar `amplify.yml`. Decisão de Andre | defer |
| 15 | blind | Fixture sintética de 13 kB é publicada | false | Intencional (AD-21): é a única fonte de dados do navegador até Q2 | rejeitado |
| 16 | edge | Diferença de caixa (`../Adapters/`) escapava da comparação | low | Alvo resolvido por `realpath` antes de comparar | patch |
| 17 | blind | Teste de `customHttp.yml` lê YAML por regex dependente de indentação | low | Aceito: evita pacote de YAML; o arquivo é pequeno e versionado | rejeitado |

**Verificação no navegador real (fora da matriz):** artefato servido com os headers de produção e aberto no Chrome headless via DevTools. `/app` redireciona para `/app/`; o marcador `synthetic-fixture` aparece; a carga canoniza a URL; a busca "fictício" devolve 7 resultados; a seleção grava `company=company-1`; Voltar restaura `company=` vazio; zero exceções, zero bloqueios de CSP, só o 404 de `favicon.ico`.


## Verification

**Commands:**
- `npm run validate` -- expected: check (com o gate) e todos os testes passam, zero falhas/skips.
- `npm run build:ui:local` -- expected: `status: built`; `dist/ui/app/` presente.
- `git diff --check` -- expected: sem erros.
