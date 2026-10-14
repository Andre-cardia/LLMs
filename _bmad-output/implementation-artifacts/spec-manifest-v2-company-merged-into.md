---
title: 'Manifesto v2 com companyMergedInto e validador único de merges'
type: 'feature'
created: '2026-10-14'
status: 'done'
baseline_commit: '591c658617df9613e652f66844eab29892a469aa'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/contracts.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o critério 4 da Story 7.1 (Empresa mesclada é seguida, não vira indisponível) não tem fonte de dados. O manifesto é v1, ninguém produz merges, `LocalSearch` envia `companyRemaps: []` fixo e o reducer lança `INVALID_REMAP` para entradas que, numa tabela acumulada, são o caso normal.

**Approach:** implementar o AD-2 emendado: manifesto `schemaVersion: 2` com `companyMergedInto`, validador único `assertCompanyMergedInto` em `src/contracts/`, Publisher emitindo a tabela guardada no estado de controle, leitor e frame repassando-a, `LocalSearch` despachando-a inteira e o reducer aplicando só entradas cujo `from` está no índice anterior.

## Boundaries & Constraints

**Always:**
- Um só validador, chamado por Publisher, `SnapshotReader` e reducer. Regras: array de `{fromCompanyId, toCompanyId}`; `from` string única; `to` string ou `null`; `from ≠ to`; compactada (nenhum `to` aparece como `from`); no máximo 10 000 entradas. Com `{nextCompanyIds}`: `from` ausente e `to` (não nulo) presente.
- Manifesto v1 rejeitado por `assertManifest`; sem leitor dual. Envelopes de slice seguem v1. `EXPLORATION_VERSION` continua 2; o intent `advanceSnapshot` mantém o campo `companyRemaps`, que passa a aceitar `toCompanyId: null` (alargamento compatível).
- `to: null` reconcilia a seleção para `null` com `warning: 'company-unavailable'`.
- O reducer indexa a tabela com `Map`/`Set`; o lote continua atômico (entrada inválida pelo validador não altera estado).
- A tabela só muda dentro da transação de curadoria/publicação (`state.companyMergedInto` no controle); `publish()` não ganha parâmetro de remaps.

**Decisão (Andre, 14/10):** só o encanamento. A tabela vive em `state.companyMergedInto` no controle e, nesta story, só testes a alteram via `prepareCuration`. O contrato e o comando `MergeDecision` ficam em `deferred-work.md`.

**Never:** `MergeDecision` ou comando de merge na curadoria; UI, shell de navegador, AWS, Lambda ou rotas HTTP; `ManifestResponse` (AD-27) fica para a story da API; resolver `?company=` legado pela tabela (extensão de Q11); deduzir merge por nome ou comparação de revisões; refatorar primitives ou ingestão.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Merge seguido | store em r1 com A selecionada; frame r3 com `A→C` | seleção e Terminal vão para C | N/A |
| Salto de revisões | store em r1; tabela `A→C, B→C`, B nunca esteve no índice | aplica `A→C`, ignora `B→C` | N/A |
| Sobrevivente retirado | `A→null`, A selecionada | seleção `null`, `company-unavailable` | N/A |
| Tabela não compactada | `A→B, B→C` | rejeitada | `INVALID_MERGE_TABLE`, estado intacto |
| `from` ainda no catálogo novo / `to` ausente | entrada incoerente | rejeitada | `INVALID_MERGE_TABLE` no reader/reducer; Publisher não publica |
| Duplicata / `from = to` / > 10 000 | — | rejeitada | `INVALID_MERGE_TABLE` |
| Manifesto v1 | `schemaVersion: 1` | leitor `unavailable`/`kept-last-good` | `TypeError` do contrato |

</frozen-after-approval>

## Code Map

- `src/contracts/snapshot.mjs` -- `assertManifest`: v2 e campo `companyMergedInto`; novo `assertCompanyMergedInto(entries, {nextCompanyIds} = {})`.
- `src/contracts/exploration.mjs:136-141` -- validação do intent `advanceSnapshot.companyRemaps`; delegar forma ao validador único e aceitar `to: null`.
- `src/domain/exploration-state.mjs:108-133` -- trocar checagem própria (`DUPLICATE_REMAP`/`INVALID_REMAP`) pelo validador com `nextCompanyIds = next.companyIds`, filtrar por `s.index.companyIds`, tratar `null`. Usar `Set` para `companyIds`.
- `src/adapters/memory-snapshots.mjs:12,65` -- inicializar `companyMergedInto: []` no estado; emitir v2 com `clone(state.companyMergedInto)` validado contra o catálogo publicado.
- `src/application/snapshot-reader.mjs:11-17` -- após `assertSnapshotData`, validar a tabela contra `catalog.companies`.
- `src/application/local-news-view.mjs:28-38` -- frame expõe `companyMergedInto` de `data.manifest`.
- `src/application/local-search.mjs:61-62` -- despachar `companyRemaps: frame.companyMergedInto`.
- `tests/exploration.test.mjs:79-86,355-361` -- casos que exigem `INVALID_REMAP` para `from` fora do índice passam a exigir que a entrada seja ignorada; demais rejeições continuam.
- `tests/search.test.mjs` -- snapshots manuais `manifest:{revision}` ganham `companyMergedInto`; novo teste do critério 4 com salto de revisões.
- `tests/local-snapshot.test.mjs:72` -- manifestos/bytes montados à mão migram para v2; novo teste que manifesto v1 é rejeitado.
- Não mudar: `canonicalJson`, envelopes de slice, `exploration-url.mjs`, mockups, scripts de build.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/snapshot.mjs` -- manifesto v2 + `assertCompanyMergedInto` -- validador único (AD-2).
- [x] `src/contracts/exploration.mjs` -- intent usa o validador de forma, aceita `to: null` -- uma definição só.
- [x] `src/domain/exploration-state.mjs` -- aplicar tabela filtrando pelo índice anterior -- regra no domínio (AD-1).
- [x] `src/adapters/memory-snapshots.mjs` -- estado e emissão v2 -- Publisher único escritor.
- [x] `src/application/snapshot-reader.mjs`, `local-news-view.mjs`, `local-search.mjs` -- validar, expor e repassar a tabela -- fim do `[]` fixo.
- [x] `tests/exploration.test.mjs`, `tests/search.test.mjs`, `tests/local-snapshot.test.mjs` -- migrar e cobrir a matriz -- inventário de `contracts.md`.

**Acceptance Criteria:**
- Given qualquer manifesto produzido no repositório, when `npm test` roda, then nenhum tem `schemaVersion: 1` e um teste falha se aparecer um.
- Given Publisher → `SnapshotReader` → `LocalNewsView` → `LocalSearch.select` com `A→C` publicado duas revisões depois da seleção de A, when o resultado é escolhido, then o store fica com C e a URL canônica com `company=C`.

## Implementation Notes

- `assertCompanyMergedInto` lança `TypeError` com prefixo `INVALID_MERGE_TABLE`; sem `nextCompanyIds` valida só a forma (usado por `assertManifest` e pelo intent), com ele valida contra o catálogo (Publisher, `SnapshotReader`, `LocalNewsView`, reducer).
- O frame de `LocalNewsView` também valida a tabela contra o catálogo capturado, porque portas de teste montam snapshots sem passar pelo `SnapshotReader`.
- Critério 4 com resultado de Busca antigo: o `advanceSnapshot` leva a seleção para C, mas o alvo antigo (A) continua `unavailable` em `navigate`; reescrever o alvo pela tabela ficaria fora do escopo (equivale à extensão de Q11). Escolher o resultado atual de C mantém C.
- O teste "nenhum manifesto do repositório é v1" checa manifestos produzidos, JSON em `src/`, `scripts/`, `tests/` e literais `.mjs` com `schemaVersion: 1` junto de campos exclusivos do manifesto.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind, edge | `to: null` com Modelo selecionado sobrescreve `company-unavailable` com `model-unavailable` | medium | Reproduzido; a matriz exige `company-unavailable`. Corrigido em `exploration-state.mjs` e coberto no teste AD-22 | patch |
| 2 | blind | Publisher grava objetos de slice antes de validar a tabela | low | `#objects` fica fora da transação; tabela rejeitada deixava objetos órfãos. Validação movida para antes da serialização | patch |
| 3 | blind, edge | Detector de manifesto v1 só olha blocos sem chaves aninhadas | medium | Reproduzido com `slices:{...}`: zero ofensores. Regex trocada por janela até o fim da instrução; caso aninhado detectado | patch |
| 4 | blind, edge | Curadoria que readiciona um ID já retirado bloqueia toda publicação | maybe-false (medium se real) | Inalcançável hoje: só testes alteram `companyMergedInto`, sempre `[]` no produto. Vira real com `MergeDecision` | defer |
| 5 | edge | Tabela acima de 10 000 entradas bloqueia publicação sem poda | maybe-false (medium se real) | Mesmo motivo do #4; o teto vem do AD-2, a poda pertence ao `MergeDecision` | defer |
| 6 | edge | Estado de controle sem `companyMergedInto` faz publish falhar | false | `MemorySnapshots` sempre inicializa o campo e `MemoryControl` não persiste estado entre versões | rejeitado |
| 7 | blind, edge | Selecionar resultado antigo de A move o store para C, mas `select()` devolve `unavailable` | medium | Real e pré-existente (alvo validado contra a revisão nova); o critério e a matriz congelados cobrem só a seleção, cumprida. Reescrever o alvo pela tabela exige decisão de produto | defer |
| 8 | blind | Entrada BH5 de `deferred-work.md` cita `INVALID_REMAP`, que deixou de existir | low | Texto desatualizado; entradas existentes não são editadas, nova entrada registra a substituição | defer |
| 9 | blind | Falha de tabela vira `SNAPSHOT_INVALID_OR_UNAVAILABLE` genérico; mensagens com prefixos diferentes | low | Real mas raro; a correção acrescenta código de erro público | rejeitado |
| 10 | verification-gap | Nenhuma lacuna: cada comportamento alterado tem teste que falharia | false | Relatório da camada, verificado contra os testes citados | — |

## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
