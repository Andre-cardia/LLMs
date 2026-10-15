---
title: 'fixture-source: única fonte de dados sintéticos marcados do navegador'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'c102e0073e8b875dca5308eea6f5b9e2b1136cde'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/contracts.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o navegador não tem fonte de dados. `SnapshotReader` e `LocalNewsView` recebem portas (`readManifest`, `readSlice`, `readFeedback`, `resolveAlias`), mas só existem implementações em `src/adapters/` (Node e teste, proibidas no bundle). Sem uma fonte sintética marcada, o shell não pode mostrar nada antes de Q2, e nada impede que um dado real acabe servido como asset estático (AD-21, AD-9).

**Approach:** `src/ui/fixture-source.mjs` (AD-21) fornece as quatro portas a partir de um dataset sintético empacotado em `src/ui/fixtures/synthetic-workspace.mjs`, e exporta o único marcador de procedência. O manifesto v2 é gerado em tempo de execução pelo mesmo helper de envelope que o Publisher usa, com digest pela porta injetada — nunca um manifesto literal.

## Boundaries & Constraints

**Always:**
- Constante `SYNTHETIC_FIXTURE = 'synthetic-fixture'` em `src/contracts/provenance.mjs` (AD-9 do pai). O dataset declara `provenance: SYNTHETIC_FIXTURE`; `fixture-source` exporta `provenance` com esse valor e recusa (lança) um dataset sem o marcador.
- Helper único `envelopeBytes(slice, data)` em `src/contracts/snapshot.mjs` devolve `canonicalJson({schemaVersion: 1, slice, data})`. `MemorySnapshots.publish` passa a usá-lo (mesma saída byte a byte). `fixture-source` usa o mesmo helper.
- `createFixtureSource({digest})`: `digest` é a porta injetada (`webDigest` no navegador, `sha256Text` em teste). O manifesto v2 (`revision: 'fixture-1'`, `companyMergedInto: []`, `publishedAt`/`lastSuccessAt` = `now` do dataset, `objectKey` = digest) é construído uma vez, de forma preguiçosa, e validado por `assertManifest`.
- Portas: `readManifest()`, `readSlice(revision, slice)` (revisão desconhecida ou slice fora de `SLICES` → erro), `readFeedback()` → `{feedbackRevision: 0, items, hiddenNewsIds: []}`, `resolveAlias(newsId)` → item ou `null`. Todas devolvem cópias: mutar o retorno não altera chamadas seguintes.
- Dataset sintético: copiado de `tests/fixtures/local-workspace.json` (Empresas fictícias, URLs só em `example.invalid`) como módulo JS congelado; nenhum `import` de JSON.

**Never:** escrever em qualquer armazenamento; `fetch`; importar `src/adapters/` ou `node:*` a partir de `src/ui/`; dado real, Cadastro curado ou Histórico; mudar `SnapshotReader`, `LocalNewsView`, `LocalSearch` ou o formato do manifesto; raiz de composição e build (spec seguinte).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Leitura completa | `SnapshotReader` com as portas e `digest: webDigest` | `refresh()` → `updated`, catálogo igual ao dataset | N/A |
| Paridade de digest | mesma fonte com `sha256Text` e com `webDigest` | manifestos idênticos | N/A |
| Envelope igual ao Publisher | `envelopeBytes` vs bytes gravados por `MemorySnapshots` | idênticos | N/A |
| Slice desconhecida | `readSlice('fixture-1','bogus')` | rejeita | `Error('SLICE_NOT_FOUND')` |
| Revisão desconhecida | `readSlice('outra','catalog')` | rejeita | `Error('SNAPSHOT_NOT_FOUND')` |
| Feedback | `readFeedback()` | aceito por `LocalNewsView`; `hiddenNewsIds` vazio | N/A |
| Alias | `resolveAlias` de ID existente / inexistente | item / `null` | N/A |
| Retorno mutado | alterar objeto devolvido e ler de novo | segunda leitura intacta | N/A |
| Dataset sem marcador | dataset sem `provenance` | não constrói | `TypeError` |
| Busca de ponta a ponta | fonte → reader → view → `LocalSearch` com `createExplorationStore` | `search('fictício')` devolve resultados | N/A |

</frozen-after-approval>

## Code Map

- `src/adapters/memory-snapshots.mjs:65` -- `canonicalJson({ schemaVersion: 1, slice, data: data[slice] })`: trocar por `envelopeBytes(slice, data[slice])`, sem mudar a saída.
- `src/contracts/snapshot.mjs` -- acrescentar `envelopeBytes`; `assertManifest`, `SLICES` reutilizados.
- `src/application/snapshot-reader.mjs`, `local-news-view.mjs`, `local-search.mjs`, `exploration-store.mjs` -- consumidores das portas; não mudar.
- `src/ui/web-digest.mjs` -- porta `digest` do navegador, já pronta.
- `tests/fixtures/local-workspace.json` -- fonte do conteúdo sintético; não mudar.
- `tests/helpers/local-fixtures.mjs` -- padrão de montagem com `MemorySnapshots` para o teste de paridade de envelope.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/provenance.mjs` -- `SYNTHETIC_FIXTURE` -- marcador único.
- [x] `src/contracts/snapshot.mjs`, `src/adapters/memory-snapshots.mjs` -- `envelopeBytes` e uso no Publisher -- helper único de envelope.
- [x] `src/ui/fixtures/synthetic-workspace.mjs` -- dataset congelado com `provenance`.
- [x] `src/ui/fixture-source.mjs` -- `createFixtureSource({digest})` e `provenance` -- AD-21.
- [x] `tests/fixture-source.test.mjs` -- matriz inteira, mais guarda: todo URL do dataset em `example.invalid` e nenhum `import` de `src/ui/fixture-source.mjs` ou `src/ui/fixtures/` aponta para `adapters`/`node:`.

**Acceptance Criteria:**
- Given a fonte sintética com `webDigest`, when `SnapshotReader` → `LocalNewsView` → `LocalSearch` roda, then a Busca devolve resultados sem nenhum módulo de `src/adapters/` carregado por `src/ui/`.
- Given a suíte existente, when `npm test` roda depois da troca para `envelopeBytes`, then todos os testes do Publisher continuam passando sem alteração.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind, gap | Recuperação após falha da porta `digest` (`.catch` que zera o cache) sem teste | medium | Mutação confirmada: remover o `.catch` não quebrava nenhum teste. Dois testes novos (falha sequencial e concorrente); a mutação agora quebra 2 | patch |
| 2 | blind, edge | Guarda de E/S não pegava `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `caches`, `document.cookie`, `fetch` indireto nem `import()` não literal | medium | Regex original só casava `fetch(` e storage. Ampliada; comentários removidos antes da busca para não gerar falso positivo; mutação com `localStorage` em código agora falha | patch |
| 3 | blind | Comentário de `provenance.mjs` dizia que todo dado servido "declara" o marcador, mas manifesto e slices não o carregam | low | Texto impreciso; reescrito para dizer que o dataset declara e a fonte exporta | patch |
| 4 | blind, edge | Validação de dataset inconsistente: `now` inválido, slice ausente ou valor não clonável lançavam erros de tipos diferentes | low | `DataCloneError` de `structuredClone` escapava. Validação na borda com `TypeError`; teste novo | patch |
| 5 | blind | Versão do envelope (`1`) duplicada como número mágico em `envelopeBytes` e `assertEnvelope` | low | Exportado `ENVELOPE_VERSION`, usado nos dois | patch |
| 6 | blind | Dataset copiado à mão sem como regenerar | low | Criado `scripts/gen-synthetic-workspace.mjs`; o módulo agora é a saída dele, e o teste de drift continua comparando com a fixture | patch |
| 7 | blind | `store.dispose()` fora de `finally` no teste de ponta a ponta | low | Movido para `t.after` | patch |
| 8 | blind | `readFeedback` devolveria a lista de matérias como se fosse feedback | false | `LocalNewsView` valida `items` com `assertNews`, e `MemoryNews.read` devolve as matérias canônicas no mesmo campo. Comentário acrescentado | rejeitado |
| 9 | blind | `canonicalJson` ficaria sem uso em `memory-snapshots.mjs` | false | Ainda usado na linha 43, no payload de idempotência | rejeitado |
| 10 | blind | `resolveAlias` só casa ID exato | low | Correto para o dataset sintético, que não tem matérias sindicadas; merge de aliases é testado contra `MemoryNews`. Comentário acrescentado | patch |
| 11 | blind | Revisão fixa `fixture-1` faria datasets diferentes compartilharem revisão | low | Só o dataset empacotado é usado fora de teste; o parâmetro `dataset` existe para o teste do marcador | rejeitado |
| 12 | blind | Nada liga a fonte à interface nem exibe o marcador | false | Escopo da spec 5 (raiz de composição), combinado com Andre | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
