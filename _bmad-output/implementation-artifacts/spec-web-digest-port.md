---
title: 'web-digest: porta SHA-256 via crypto.subtle, compatível com sha256Text'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'b132380c955b0e4a2584e96db9d2d177b5fc2b4d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `SnapshotReader` recebe `digest` como porta assíncrona (`(bytes) → hex`) e compara com `!==` contra `/^[a-f0-9]{64}$/`. Hoje só existe `sha256Text` (`src/adapters/memory-snapshots.mjs`), que usa `node:crypto` — proibido no bundle do navegador (AD-20). Sem uma porta de navegador compatível, `SnapshotReader` não pode operar fora de Node.

**Approach:** `src/ui/web-digest.mjs`: função `webDigest(text) → Promise<hex>` usando só `crypto.subtle.digest('SHA-256', ...)` sobre os bytes UTF-8 (`TextEncoder`), convertendo o `ArrayBuffer` resultante para hex minúsculo de 64 caracteres. Mesma assinatura que `SnapshotReader` espera de `digest`.

## Boundaries & Constraints

**Always:**
- Entrada: `string`. Rejeita (`TypeError`) qualquer outro tipo antes de chamar `crypto.subtle`.
- Saída: sempre `string` casando `/^[a-f0-9]{64}$/` — minúsculo, sem prefixo, exatamente 64 caracteres.
- Para o mesmo texto, `webDigest(text)` produz exatamente o mesmo valor que `sha256Text(text)` (de `src/adapters/memory-snapshots.mjs`) — provado por fixture compartilhada com texto não ASCII (ex. acentos, emoji) e com string vazia.
- `crypto.subtle` é lido de `globalThis.crypto.subtle` (nunca `import` de `node:crypto`), para que o mesmo código funcione em Node (teste) e no navegador real sem adaptação.

**Never:** importar `node:crypto` ou qualquer módulo `node:*`; aceitar/retornar `ArrayBuffer` como saída pública da porta; checar `isSecureContext`/HTTPS aqui — isso é responsabilidade da raiz de composição (`browser-shell.mjs`, spec futura, AD-20 "o shell só opera sob HTTPS ou localhost"), não da porta de digest em si; alterar `SnapshotReader`, `src/adapters/memory-snapshots.mjs` ou o contrato de `digest` em `snapshot.mjs`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Texto ASCII simples | `webDigest('ola')` | hex de 64 chars, igual a `sha256Text('ola')` | N/A |
| Texto não ASCII | `webDigest('Ação ñ 🚀')` | hex de 64 chars, igual a `sha256Text(mesmo texto)` | N/A |
| String vazia | `webDigest('')` | hex de 64 chars, igual a `sha256Text('')` | N/A |
| Entrada não string | `webDigest(42)` ou `webDigest(null)` | lança antes de chamar `crypto.subtle` | `TypeError` |
| Compatibilidade com `SnapshotReader` | usar `webDigest` como `digest` no construtor | `reader.refresh()` aceita slices gravadas por `sha256Text` (mesmo digest) | N/A |

</frozen-after-approval>

## Code Map

- `src/adapters/memory-snapshots.mjs:7` -- `export const sha256Text = text => createHash('sha256').update(text).digest('hex');` — referência de comportamento esperado; não importar nem modificar (AD-20 proíbe `node:crypto` em `src/ui/`).
- `src/contracts/snapshot.mjs:39` -- formato do digest (`/^[a-f0-9]{64}$/`); `webDigest` deve produzir exatamente isso.
- `src/application/snapshot-reader.mjs:6,14` -- assinatura esperada da porta `digest`: `(bytes: string) => Promise<string> | string`, comparada com `!==`.
- Não mudar: `src/adapters/*`, `src/application/snapshot-reader.mjs`, `src/contracts/snapshot.mjs`.

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/web-digest.mjs` -- `webDigest(text)` via `crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))`, convertendo `ArrayBuffer`→hex -- AD-20.
- [x] `tests/web-digest.test.mjs` -- cobrir a matriz, incluindo a fixture compartilhada ASCII/não-ASCII/vazia contra `sha256Text` -- prova de equivalência exigida pelo AD-20.

**Acceptance Criteria:**
- Given um texto com caracteres não ASCII, when `webDigest(texto)` e `sha256Text(texto)` são comparados, then os dois hex são idênticos.
- Given um `SnapshotReader` construído com `digest: webDigest`, when `refresh()` lê slices gravadas por `MemorySnapshots` (que usa `sha256Text`), then o status é `updated`, nunca `SNAPSHOT_DIGEST_INVALID`.

## Implementation Notes

Implementado exatamente conforme a Intent/Approach: `src/ui/web-digest.mjs` exporta `webDigest(text)`, lê `crypto.subtle` de `globalThis.crypto.subtle` (nenhum `import` de `node:*`), rejeita entrada não-string com `TypeError` antes de tocar `crypto.subtle`, e converte o `ArrayBuffer` de `digest('SHA-256', ...)` para hex minúsculo de 64 caracteres via tabela de lookup (sem `Buffer`, que não existe no navegador). `tests/web-digest.test.mjs` cobre a matriz completa: ASCII, não ASCII (acentos + emoji), string vazia, entrada não-string (vários tipos) e a integração com `SnapshotReader` usando `MemorySnapshots`/`sha256Text` como produtor e `webDigest` como `digest` injetado -- `refresh()` resulta em `status: 'updated'`. Nenhum arquivo de `src/adapters/*`, `src/application/snapshot-reader.mjs` ou `src/contracts/snapshot.mjs` foi alterado.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind | Teste "não SNAPSHOT_DIGEST_INVALID" era vazio: `result.status` nunca é essa string literal (ela só aparece como mensagem de exceção interna, nunca como valor de `status`) | high | Confirmado: `status` só assume `updated/superseded/access-denied/kept-last-good/unavailable`; a asserção nunca podia falhar. Trocada por uma asserção que observa o dado real (`result.snapshot.catalog`) e por um teste novo de caminho negativo | patch |
| 2 | blind, edge, gap | Nenhum teste cobria o caminho negativo: um digest incompatível fazendo `refresh()` cair em `kept-last-good`/`unavailable` | high | Mesma raiz do achado 1. Teste novo injeta um `digest` que diverge de 1 caractere (ainda casando o formato hex) e prova `status === 'unavailable'` | patch |
| 3 | blind, edge | `crypto.subtle` indisponível (contexto não seguro) falhava com erro genérico de propriedade indefinida, não um diagnóstico claro | medium | Real, e citado pela própria revisão de tecnologia do spine como risco de severidade alta para o AD-20. Corrigido com checagem explícita e mensagem nomeada. Teste novo usa `Object.defineProperty` para simular a ausência (`crypto` só tem getter em `globalThis`) | patch |
| 4 | blind | `HEX` (tabela de lookup) era array mutável, diferente do padrão `Object.freeze` já usado em tabelas análogas (`address-writer.mjs`) | low | Real, inconsistência de estilo com risco baixo de mutação acidental. Corrigido com `Object.freeze` | patch |
| 5 | edge | Sem timeout/abort para `crypto.subtle.digest` travado | low | Teórico: a API nativa do navegador não é conhecida por travar; nenhuma evidência concreta de que isso ocorra. Mesmo padrão (sem timeout) já usado em outras portas assíncronas do projeto. Não corrigido nesta spec, pequena e focada | rejeitado |
| 6 | blind | Fixture compartilhada não incluía um caractere substituto solto (`\uD800`) UTF-16 malformado, cenário citado por revisão anterior como risco teórico de divergência entre `TextEncoder` e `createHash` | low | Verificado manualmente: ambos produzem o mesmo hash para surrogate solto (o `TextEncoder` já substitui por U+FFFD do mesmo jeito que a codificação UTF-8 do Node faria). Risco teórico não se manifesta; não vale a complexidade de uma fixture extra para esta spec pequena | rejeitado |
| 7 | blind | Nenhum gate estático (`check-local.mjs`) impede `src/ui/*` de importar `node:*`/`src/adapters/*`; a garantia hoje é só por inspeção manual | medium | Real, mas é exatamente o escopo do AD-25 ("`npm run check` falha se algum módulo alcançável a partir de `src/ui/` importar `src/adapters/` ou `node:`"), que é a spec 5 desta sequência (build/headers), ainda não escrita | defer |
| 8 | gap | `webDigest` não é consumido por nenhuma composição de produção nesta spec | false | Não é lacuna: a spec explicitamente escopa a composição (`browser-shell.mjs`) para fora, como as specs 1 (`exploration-store`) e 2 (`address-writer`) também fizeram -- é a sequência de 5 specs já combinada com Andre | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
