---
title: 'address-writer: escritor único de endereço + tabela de aliases do protótipo'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: '278bf46feafe3f685fb14ae21b1752fb0ba4dde8'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-exploration-store-wrapper.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** não existe escritor de endereço (AD-19) nem tabela de aliases do protótipo publicado (AD-24). `parseExplorationUrl` já traduz `view=` (Q11), mas ignora `select=` e `tab=globo` do protótipo; sem a tabela, um link antigo compartilhado não restaura a seleção. Sem o escritor, nada grava o estado na URL depois de um `dispatch` — o critério 3 da Story 7.1 não tem como ser cumprido.

**Approach:** 1) estender `parseExplorationUrl` com `select=`→`company` e `tab=globo`→`globe` (AD-24), mantendo a forma canônica soberana quando os dois coexistem; 2) exportar `INTENT_TYPES` de `src/contracts/exploration.mjs` (chaves de `INTENT_FIELDS`, hoje privado); 3) criar `src/ui/address-writer.mjs` (AD-19): escreve o endereço via History API conforme a tabela de intents, com `history` injetada (porta, não `window.history` direto), nunca o próprio DOM/URL do navegador real nesta spec.

## Boundaries & Constraints

**Always:**
- `history` é uma porta injetada no construtor: `{pushState(url), replaceState(url)}` — sem assumir Web API real; os testes passam um fake.
- Comparar `explorationQuery(novoEstado)` com o endereço atual (também injetado/rastreado via a mesma porta, não `location.search`); iguais não escreve.
- Tabela completa do AD-19: `company|tab|navigate`→push; `base|preference|advanceSnapshot`→replace; `hydrateUrl`→replace somente se o endereço hidratado não for canônico, nunca push; `panel|openNews|escape|camera|callback`→nenhuma escrita (a comparação já confirma, porque esses intents não alteram a query).
- Teste de exaustividade sobre `INTENT_TYPES` (todas as 12 chaves de `INTENT_FIELDS`): o escritor classifica todas; uma chave sem classificação falha o teste.
- Replace consecutivos (ex. duas Camadas alternadas em sequência) agrupam-se — nesta spec, "agrupar" significa: a função expõe `flush()` e replaces entre `dispatch`es sem `flush()` sobrescrevem o endereço pendente em vez de empilhar chamadas à porta; `flush()` ou um `push` subsequente aplica a última substituição pendente antes de prosseguir.
- `select=` → `company`; `tab=globo` → `globe`; se a forma canônica (`company=`/`tab=`) e o alias coexistem na mesma URL, a canônica prevalece. `mode=`, `reader=`, `pov=` continuam ignorados (já são). `view=` continua tratado pela regra Q11 existente, sem mudança.

**Never:** `src/ui/browser-shell.mjs`, `web-digest.mjs`, `fixture-source.mjs` (specs seguintes); tocar `window.history`/`location` reais; `popstate`/carga de página (a raiz de composição despacha `hydrateUrl`, fora desta spec); mudar o formato de `explorationQuery` ou de `parseExplorationUrl` fora dos dois aliases pedidos; introduzir pacote novo.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| `company` | `dispatch({type:'company',...})` | `pushState` com `explorationQuery(novoEstado)` | N/A |
| `preference` (Camadas) | `dispatch({type:'preference',field:'layers',...})` | `replaceState` | N/A |
| `camera` | `dispatch({type:'camera',...})` | nenhuma escrita (query inalterada) | N/A |
| Endereço igual | `dispatch` cuja query resultante é igual à atual | nenhuma escrita, mesmo sendo tipo `pushState` | N/A |
| `advanceSnapshot`+`navigate` em sequência | Busca seleciona resultado | 1 replace seguido de 1 push (nunca invertido) | N/A |
| `hydrateUrl` canônico | URL já em forma canônica | nenhuma escrita | N/A |
| `hydrateUrl` com alias legado | `?select=company-1&tab=globo` | 1 `replaceState` com a forma canônica; nunca `pushState` | N/A |
| Replace sem flush entre dois | duas `preference` seguidas sem `flush()` | só 1 chamada à porta `replaceState`, com o estado da segunda | N/A |
| Alias com forma canônica presente | `?select=company-2&company=company-1` | `company` vence; resultado é `company-1` | N/A |
| Intent sem classificação | tipo fictício fora de `INTENT_TYPES` | teste de exaustividade falha ao ser escrito; não ocorre em runtime (contrato já valida) | N/A |

</frozen-after-approval>

## Code Map

- `src/domain/exploration-url.mjs:4-19` -- `parseExplorationUrl`: acrescentar os dois aliases dentro das branches existentes de `tab`/`company`, sem reescrever a função.
- `src/contracts/exploration.mjs:113` -- `INTENT_FIELDS` (privado); exportar `export const INTENT_TYPES = Object.freeze(Object.keys(INTENT_FIELDS));` logo depois da definição.
- `_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md` AD-19 (tabela completa) e AD-24 (aliases) -- texto normativo já citado acima; não ler o resto do spine.
- `tests/exploration.test.mjs:424-430` -- já testa `hydrateUrl` com `view=`/`chat=secret`; referência de estilo para os testes novos de alias, não para alterar.
- Não mudar: `explorationQuery`, `src/domain/exploration-state.mjs`, `src/contracts/exploration.mjs` fora da exportação pedida, qualquer teste existente.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/exploration.mjs` -- exportar `INTENT_TYPES` -- único vocabulário fonte (AD-16).
- [x] `src/domain/exploration-url.mjs` -- aliases `select=`→`company`, `tab=globo`→`globe` -- tabela única no domínio (AD-24).
- [x] `src/ui/address-writer.mjs` -- escritor único com porta `history` injetada e tabela por intent -- AD-19.
- [x] `tests/exploration-url.test.mjs` ou extensão de `tests/exploration.test.mjs` -- aliases, canônica vence, `?select=` sem `company=` -- cobertura dos novos ramos.
- [x] `tests/address-writer.test.mjs` -- cobrir a matriz completa, incluindo o teste de exaustividade sobre `INTENT_TYPES` -- prova de que nenhum intent fica sem classificação.

**Acceptance Criteria:**
- Given um escritor com porta fake e um store (do `exploration-store.mjs` já implementado) despachando `company` depois `preference` depois `camera`, when os três ocorrem em sequência, then a porta recebe exatamente 1 `pushState` seguido de 1 `replaceState`, nenhuma chamada para `camera`.
- Given a tabela `INTENT_TYPES` importada do contrato, when o teste de exaustividade roda, then toda chave tem uma classificação no escritor, sem lista hard-coded duplicada que possa dessincronizar.

## Implementation Notes

- `src/ui/address-writer.mjs`: `createAddressWriter({history, address})` devolve uma função-listener (com `.flush()` anexado) pronta para `store.subscribe(...)`. `classifyIntent(type)` é exportado separadamente para o teste de exaustividade; `classifyIntent` lança se alguma chave não tiver classificação; o teste de exaustividade cobre as 12 chaves hoje. Uma dessincronia futura (nova chave em `INTENT_FIELDS` sem entrada aqui) só se manifesta quando esse tipo específico é despachado, não no `import` do módulo — achado 7 da triagem, aceito como está.
- `hydrateUrl` entra na mesma categoria de escrita (`replace`) de `base|preference|advanceSnapshot` -- não há `if` especial: a comparação geral (`explorationQuery(novoEstado)` contra o endereço atual/pendente) já produz exatamente a regra do AD-19 ("replaceState somente se o endereço hidratado não for canônico") porque uma URL já canônica reproduz o próprio endereço de entrada.
- `panel|openNews|escape|camera|callback` entram como `none` só para que `classifyIntent` cubra as 12 chaves; nenhum deles jamais chegaria à comparação de endereço de qualquer forma, pois não alteram `explorationQuery`.
- Agrupamento de replaces: um `Map`/variável `pending` guarda só a última URL substituída; `apply()` (chamada por `flush()` ou antes de qualquer `pushState`) é o único ponto que de fato invoca `history.replaceState`.

## Spec Change Log

- Nenhuma mudança de intenção durante a implementação; o código seguiu exatamente a tabela e os boundaries como escritos.

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind | Comparação de replace contra `pending ?? current` em vez de sempre `current`: uma pendência que volta ao endereço atual era reescrita, violando "se forem iguais, não escreve" | high | Reproduzido em Node puro: sequência company→preference(cloud)→preference(original) gerava `replaceState` redundante no `flush()`. Corrigido: compara sempre contra `current`; pendência que iguala `current` é cancelada, não reescrita. Teste novo prova zero chamadas de replace | patch |
| 2 | edge | `tab=constructor` faz `overrides.tab` virar `Object` (poluição de protótipo via lookup `TAB_ALIASES[value]` sem `hasOwn`) | high | Reproduzido: `typeof result.tab === 'function'` antes da correção. Corrigido com `Object.hasOwn(TAB_ALIASES, value)`. Teste novo prova `typeof === 'string'` | patch |
| 3 | blind | Comentário e spec diziam "11 chaves de INTENT_TYPES"; são 12 | low | Confirmado por contagem direta (`INTENT_TYPES.length === 12`). Corrigido no comentário do módulo e nos dois pontos da spec | patch |
| 4 | blind | Escrita recusada pelo navegador (limite de taxa) não tinha tratamento, apesar do texto do AD-19 exigir não lançar e refazer na mudança seguinte | medium | Real: `history.pushState`/`replaceState` sem `try/catch` propagaria para o chamador de `dispatch()`. Corrigido com `try/catch` silencioso; como `current`/`pending` não avançam na falha, a mudança seguinte naturalmente detecta a diferença e tenta de novo. Dois testes novos (push e replace recusados) | patch |
| 5 | blind, edge | `history` injetado sem validação de forma; falha só no primeiro dispatch, não na construção | medium | Real e inconsistente com o padrão de validação na borda do resto do código (`assertExplorationOptions` etc). Corrigido com `TypeError` no construtor. Teste novo cobre `{}`, só `pushState`, e `null` | patch |
| 6 | gap | Classificação de `base` (replace) e `callback` (none) não tinham teste próprio, só a exaustividade (que só prova "não lança", não "classificação correta") | medium | Confirmado por mutação: mover `base`/`callback` para outra categoria não quebrava nenhum teste existente. Dois testes novos, no mesmo estilo do teste de `preference` já existente | patch |
| 7 | blind | Módulo não itera `INTENT_TYPES` no load, só por dispatch (a Implementation Notes prometia falha no `import`) | low | Real: uma dessincronia futura só apareceria quando o intent específico fosse de fato despachado, não no `import`. Não corrigido nesta rodada: o teste de exaustividade já cobre as 12 chaves hoje, e a estrutura de 3 arrays congelados torna a adição de uma chave sem entrada um erro óbvio de revisão; a promessa da nota foi ajustada para refletir o comportamento real (lançamento no primeiro dispatch do tipo não classificado, não no import) | defer |
| 8 | edge | Spec/código tratam a classificação como 3 arrays hard-coded; uma 4ª lista poderia ficar sem a chave sem erro estrutural | low | Mesmo achado 7, ângulo diferente: aceito como trade-off simples (3 arrays explícitos) em vez de uma estrutura mais rígida; o teste de exaustividade já é a rede de segurança prática | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
