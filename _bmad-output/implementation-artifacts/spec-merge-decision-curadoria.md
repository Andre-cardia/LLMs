---
title: 'MergeDecision: proposta de merge de Empresas na Fila como fonte única de companyMergedInto'
type: 'feature'
created: '2026-10-14'
status: 'done'
baseline_commit: '9643d92ea701e16853b1001505ce31a29cb0b3e0'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/contracts.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-manifest-v2-company-merged-into.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `companyMergedInto` existe no manifesto v2, mas nenhum caminho de produto cria merges; só testes alteram a tabela. Sem isso, duplicatas de Empresa não podem ser resolvidas por decisão humana (AD-3), e uma curadoria que readicione um ID mesclado bloquearia toda publicação.

**Approach:** novo tipo de proposta `merge` na Fila, validado em `src/contracts/curation.mjs`, aprovado pelo dono e aplicado em `MemoryCuration.preparePublish` na próxima Atualização. O merge retira a Empresa `from`, reescreve Relações e a tabela, e o Publisher reescreve Modelos e Notícias pela tabela, mecanicamente, antes de validar o snapshot.

## Boundaries & Constraints

**Decisões (Andre, 14/10):** entrada só pela Fila (proposta `kind: 'merge'`, mesmo ciclo pending → staged → published, idempotência, versão e DESFAZER pré-publicação); Modelos e Notícias que citam `from` são reescritos pela tabela na publicação, nunca bloqueiam; escopo inclui merge encadeado e recusa de readicionar ID mesclado.

**Always:**
- Entidade `CompanyMerge`: `{schemaVersion: 1, id, fromCompanyId, toCompanyId, sourceRefs}`, `from ≠ to`, validada por `assertCompanyMerge` em `src/contracts/curation.mjs`. `editApprove` mantém `id`.
- Aplicação em `preparePublish`, depois das propostas de Empresa e antes das de Relação, na ordem de `decisionSequence`: conflito `missing-company` se `from` ou `to` não existir no catálogo naquele ponto; conflito `survivor-not-lab` se `from.isLab` e não `to.isLab`; conflito `overlapping-target` se duas propostas prontas mesclam o mesmo `from`.
- Merge aplicado: remove `from` do catálogo; em Relações troca `from` por `to` nas duas pontas e descarta as que viram auto-relação; na tabela reescreve toda entrada com `to = from` para `to` e acrescenta `{from, to}`, que continua compactada e validada por `assertCompanyMergedInto`.
- Proposta de Empresa cujo `id` é `from` na tabela, ou numa proposta de merge pronta do mesmo lote, fica em conflito `merged-company` e não é aplicada.
- Uma função pura `applyCompanyMerges(data, table)` em `src/domain/company-merges.mjs` troca `companyId` dos Modelos e IDs em `relevantCompanyIds`/`citedCompanyIds` das Notícias (sem duplicar), sem mutar a entrada. O Publisher a aplica em `models` e `news` antes de `assertSnapshotData`; `LocalUpdate` a aplica nas coleções recebidas antes das próprias validações.
- Tudo dentro da transação de controle: CAS perdido ou validação falha não consome a proposta.

**Never:** compensação pós-publicação (`undo` de merge publicado continua `POST_PUBLICATION_COMPENSATION_REQUIRED`); retirada do sobrevivente (`to: null`), recovery e exclusão de Empresa; merge automático, por nome ou alias; UI, AWS, API; resolver na Busca o alvo antigo; renomear códigos de erro existentes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Merge simples | A e C no catálogo; merge A→C aprovado; Atualização | A some do catálogo; Relações de A apontam para C; tabela `[A→C]`; Modelos e Notícias de A publicados com C | N/A |
| Encadeado | tabela `[A→B]`; merge B→C publicado | tabela `[A→C, B→C]` | N/A |
| Mesmo lote | merges A→B e depois B→C staged juntos | ambos publicam; tabela `[A→C, B→C]` | N/A |
| Alvo já mesclado | merge X→A depois de A→B no mesmo lote | X→A em conflito | `missing-company` |
| Readicionar | tabela `[A→C]`; proposta de Empresa A aprovada | não aplicada; publicação segue | `merged-company` |
| Auto-relação | Relação A→C existente; merge A→C | Relação descartada | N/A |
| Lab | A lab com Modelos, C não lab | merge não aplicado | `survivor-not-lab` |
| Fonte ainda manda A | merge publicado; Atualização recebe Modelo com `companyId: A` | publicado com C; `modelsOutcome` não vira `schema-invalid` por isso | N/A |
| DESFAZER antes de publicar | merge staged; `undo` | volta a pending; Atualização não mescla | N/A |
| DESFAZER depois | merge publicado; `undo` | recusado | `POST_PUBLICATION_COMPENSATION_REQUIRED` |
| Forma inválida | `from = to` ou campo extra | recusado no `propose` | `TypeError` |

</frozen-after-approval>

## Code Map

- `src/contracts/curation.mjs` -- `assertProposalRequest` aceita `kind: 'merge'` e valida com o novo `assertCompanyMerge`; `sourceRefs` reutiliza o validador de `catalog.mjs` (exportar se preciso, sem mudar comportamento).
- `src/adapters/memory-curation.mjs:17-41` -- `propose`/`decide`: escolher validador por `kind` (hoje binário `company ? assertCompany : assertRelation`). Quota semanal continua só para `company`. Fato e evidência usam `entity.sourceRefs`, já compatível.
- `src/adapters/memory-curation.mjs:44-53` -- `preparePublish`: inserir etapa de merge entre Empresas e Relações; conflito `merged-company`; `curationRevision` avança se algum merge for aplicado; `versions` por `merge:{id}`.
- `src/domain/company-merges.mjs` (novo) -- `applyCompanyMerges(data, table)`.
- `src/adapters/memory-snapshots.mjs:53-58` -- aplicar `applyCompanyMerges` a `models`/`news` depois de `prepareCuration`, antes de `assertSnapshotData`. A tabela já é validada antes das slices.
- `src/application/local-update.mjs:36-58` -- aplicar `applyCompanyMerges` com `state.companyMergedInto` às coleções recebidas antes de `assertSnapshotData`/`evaluateCollection`, e à base anterior.
- `tests/curation.test.mjs` -- helper `propose` aceita `kind`; casos da matriz.
- `tests/local-snapshot.test.mjs` ou `tests/update-regressions.test.mjs` -- caso "fonte ainda manda A".
- Não mudar: contratos de Empresa/Relação/Modelo/Notícia, `assertCompanyMergedInto`, reducer, Busca, versões de schema.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/curation.mjs` -- `assertCompanyMerge` e `kind: 'merge'` -- contrato único (AD-16).
- [x] `src/domain/company-merges.mjs` -- reescrita pura de Modelos e Notícias -- regra no domínio (AD-1).
- [x] `src/adapters/memory-curation.mjs` -- propor, decidir e aplicar merge; conflitos `missing-company`, `survivor-not-lab`, `overlapping-target`, `merged-company` -- fonte única da tabela (AD-2, AD-3).
- [x] `src/adapters/memory-snapshots.mjs`, `src/application/local-update.mjs` -- aplicar a reescrita antes das validações -- Atualizações continuam publicando.
- [x] `tests/curation.test.mjs`, `tests/update-regressions.test.mjs` -- cobrir a matriz.
- [x] `_bmad-output/implementation-artifacts/deferred-work.md` -- anexar entrada nova dizendo que o risco de readicionar ID mesclado foi fechado por `merged-company`; o teto de 10 000 e a poda continuam abertos.

**Acceptance Criteria:**
- Given um merge A→C publicado pela Fila, when `SnapshotReader` → `LocalNewsView` → `LocalSearch.select` roda com o store ainda na revisão com A selecionada, then o store fica com C, sem nenhum teste alterar `state.companyMergedInto` diretamente.
- Given qualquer conflito de merge, when a Atualização publica, then as demais propostas do lote e as slices de Modelos e Notícias publicam normalmente.

## Implementation Notes

- `assertProposalEntity(kind, entity)` em `src/contracts/curation.mjs` é o despacho único por `kind`, usado por `propose` e `decide`; `sourceRefs` reutiliza o validador de `primitives.mjs` (sem exportação nova de `catalog.mjs`).
- O conflito `merged-company` também marca propostas de Empresa já em outro conflito (exceto `overlapping-target`), por ser o motivo mais informativo; um merge aplicado incrementa `company:{from}` e `relation:{id}` das Relações reescritas, então propostas antigas sobre esses alvos caem em `target-version-changed`.
- O Publisher valida a tabela antes de reescrever Modelos e Notícias, preservando `INVALID_MERGE_TABLE` como erro de tabela incoerente.
- `LocalUpdate` reescreve a base anterior, as coleções recebidas, as coleções por Fonte já guardadas (sem regravar `modelCollections`) e o resultado de `reconcileNews`.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind | Índice de Notícias guarda o ID retirado; feedback sobre a sobrevivente falha com `COMPANY_NOT_RELEVANT` | high | `MemoryNews.feedback` lê `group.item.relevantCompanyIds`, não reescrito. Corrigido em `local-update.mjs`; teste de feedback pós-merge | patch |
| 2 | edge, gap | Merge em conflito (`survivor-not-lab`, `missing-company`) ainda retira o `from` e bloqueia edição da mesma Empresa | medium | `retired` incluía todo merge pronto. Ensaio sequencial só conta merges que se aplicam; teste novo | patch |
| 3 | blind, edge | Merge cria Relações repetidas (mesmas pontas e tipo) | medium | `assertCatalog` só checa unicidade de ID. Reescrita repetida descartada, a existente permanece; teste novo | patch |
| 4 | blind, edge | Notícia fica com a mesma Empresa relevante e citada | low | Contrato separa relevantes de citadas (`contracts.md`). Citadas sem as relevantes; teste unitário | patch |
| 5 | gap | Reescrita das coleções guardadas de outras Fontes sem teste | medium | Remover a reescrita não falhava nenhum teste. Teste com duas Fontes | patch |
| 6 | gap | `bump` de Relação reescrita não observado | medium | Teste: proposta anterior ao merge fica `target-version-changed` | patch |
| 7 | gap | Ordem merges antes de Relações no mesmo lote não fixada | medium | Teste: Relação para `from` retirado fica `missing-company` e o lote publica | patch |
| 8 | blind | Módulo `company-merges.mjs` sem testes unitários | low | Testes diretos de cópia, não mutação, compactação, `null` e duplicatas | patch |
| 9 | blind | `merged-company` sobrescreve `target-version-changed` | false | Intencional: a mudança de versão vem do próprio merge, e o teste existente exige `merged-company` | rejeitado |
| 10 | blind, edge | `state.companyMergedInto` lido sem `?? []` na curadoria | false | `MemorySnapshots` sempre inicializa o campo antes de qualquer curadoria | rejeitado |
| 11 | edge | Tabela não compactada reescreveria um salto só | false | Publisher valida a tabela com `assertCompanyMergedInto` antes da publicação; curadoria só produz tabela compactada | rejeitado |
| 12 | blind, edge | Entradas `to: null` deixariam referências que bloqueiam publicação | maybe-false (medium se real) | Nenhum caminho cria `to: null` hoje; pertence à retirada do sobrevivente, já diferida | defer |
| 13 | blind | Merge sem checagem de versão de `from`/`to` entre aprovação e publicação | medium | Real: edição do sobrevivente publicada depois da aprovação não invalida o merge. Exige campo novo de versão na proposta | defer |
| 14 | blind | Propostas para Empresa retirada só param na publicação, não no `propose` | low | Ficam staged em `merged-company`; o guarda antecipado acrescenta erro público novo | rejeitado |
| 15 | blind | Relação para Empresa mesclada recebe `missing-company` em vez de `merged-company` | low | Motivo impreciso, sem efeito no resultado; renomear códigos está fora do escopo congelado | rejeitado |

## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
