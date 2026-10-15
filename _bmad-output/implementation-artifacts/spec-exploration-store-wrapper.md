---
title: 'exploration-store: wrapper único e síncrono do reducer de exploração'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'dd622934a40a24fd25129ca28d184e80afd0f502'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `explorationReducer` é puro (`(state, intent) → {state, effects}`), sem dono de estado nem de inscrição. Hoje só um closure de 6 linhas no harness de teste (`tests/search.test.mjs`) o embrulha. Nada impede que Globo (Epic 4) e Busca (Epic 7) criem wrappers divergentes, e nada executa os efeitos devolvidos.

**Approach:** implementar `src/application/exploration-store.mjs` (AD-18 do spine do Epic 7): único wrapper com `getState`, `dispatch`, `subscribe`, `dispose`, todos síncronos sobre `explorationReducer`. Cada listener recebe `(state, {intent, effects})`; dispatch reentrante lança; descarte é terminal.

## Boundaries & Constraints

**Always:**
- Construtor recebe `{data, revision, now, config, hiddenNewsIds, preferences}` e chama `createExploration` internamente — o store possui a única instância de estado.
- `dispatch(intent)`: chama `explorationReducer(estadoAtual, intent)`; em sucesso, atualiza o estado interno e chama cada listener, na ordem de inscrição, com `(novoEstado, {intent, effects})`; devolve `{state, effects}` ao chamador (que ignora `effects` — só o listener de efeitos da raiz os executa, fora desta spec).
- Um `dispatch` iniciado enquanto outro ainda está em andamento (ex.: um listener síncrono chama `dispatch` de volta) lança `REENTRANT_DISPATCH`, sem alterar o estado.
- `subscribe(listener)`: não emite estado inicial; devolve função `unsubscribe` idempotente (chamar duas vezes não lança e não afeta outros listeners).
- `dispose()`: depois dele, `getState()` e `dispatch()` lançam `STORE_DISPOSED`; chamar `dispose()` mais de uma vez não lança.
- `explorationReducer` já lança (ex. `assertExplorationIntent`); essas exceções do reducer propagam sem o estado interno do store mudar.

**Never:** executar efeitos (`persistPreferences`, `camera`) — isso pertence ao listener de efeitos da raiz de composição, fora desta spec; tocar DOM, `localStorage`, `history` ou `fetch`; `src/ui/` ou qualquer código de navegador; mudar `explorationReducer` ou os contratos.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dispatch simples | store novo; `dispatch({type:'tab',tab:'models'})` | `getState().sessionState.tab === 'models'`; retorno `{state, effects:[]}` | N/A |
| Múltiplos listeners | 2 listeners inscritos, depois `dispatch` | ambos chamados uma vez, nessa ordem, com o mesmo `(state, {intent, effects})` | N/A |
| Unsubscribe durante dispatch | listener A faz `unsubscribeB()` ao ser chamado | B não é chamado neste dispatch (ou é — definir e testar um comportamento determinístico) | N/A |
| Dispatch reentrante | listener síncrono chama `store.dispatch(...)` | lança `REENTRANT_DISPATCH`; dispatch externo ainda completa e devolve seu próprio resultado | `Error('REENTRANT_DISPATCH')` |
| Dispatch após dispose | `store.dispose(); store.dispatch(x)` | lança | `Error('STORE_DISPOSED')` |
| getState após dispose | `store.dispose(); store.getState()` | lança | `Error('STORE_DISPOSED')` |
| Intent inválido | `dispatch({type:'bogus'})` | reducer lança; estado interno inalterado; nenhum listener chamado | propaga erro do contrato |
| Unsubscribe duas vezes | `const u = subscribe(fn); u(); u();` | não lança na segunda chamada | N/A |

</frozen-after-approval>

## Code Map

- `src/domain/exploration-state.mjs` -- `createExploration(options)` constrói o estado inicial; `explorationReducer(state, intent)` devolve `{state, effects}` sempre, exceto quando lança (schema inválido). Reutilizar sem alterar.
- `src/contracts/exploration.mjs` -- `assertExplorationIntent`/`assertExplorationState` já validam; não duplicar validação no store.
- `tests/search.test.mjs:17-24` -- o closure `function store(data)` hoje embrulha o reducer manualmente para o harness de teste; é a referência de uso, não para reescrever, mas mostra que `getState`/`dispatch` são a interface mínima esperada por `LocalSearch`.
- `src/application/local-search.mjs` -- consome `{getState, dispatch}` (ver `#intentToken()`, `#store.dispatch(...)`); o novo wrapper deve ser um substituto compatível (não precisa integrar nesta spec, só não quebrar o formato).
- Não mudar: `src/domain/*`, `src/contracts/*`, `tests/search.test.mjs`, `tests/exploration.test.mjs`.

## Tasks & Acceptance

**Execution:**
- [ ] `src/application/exploration-store.mjs` -- implementar `createExplorationStore(options)` devolvendo `{getState, dispatch, subscribe, dispose}` -- único wrapper (AD-18).
- [ ] `tests/exploration-store.test.mjs` -- cobrir toda a matriz acima com `node --test` -- prova de síncrono/reentrante/descarte sem DOM.

**Acceptance Criteria:**
- Given um store recém-criado, when dois listeners se inscrevem e um `dispatch` ocorre, then ambos são chamados exatamente uma vez, na ordem de inscrição, antes de `dispatch` retornar (prova de sincronia).
- Given um store descartado, when `getState` ou `dispatch` é chamado, then lança `STORE_DISPOSED` e nenhum listener é notificado.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind, edge | Listener que se reinscreve dentro do próprio dispatch causa crescimento ilimitado síncrono (Map visita entradas adicionadas durante a iteração) | high | Reproduzido em Node puro: `for..of` sobre `Map` alcança entrada inserida na própria volta. Corrigido com snapshot `[...listeners]` no início do dispatch; teste novo prova 1 chamada, não recursão | patch |
| 2 | blind, edge | Listener que lança interrompe a notificação dos listeners seguintes, apesar do estado já ter sido comprometido | high | Reproduzido. Corrigido: todo listener do snapshot é chamado mesmo se outro lançar; o primeiro erro é relançado só depois. Teste novo cobre ordem e propagação | patch |
| 3 | blind, edge | `subscribe()` depois de `dispose()` não lançava `STORE_DISPOSED`, só `getState`/`dispatch` faziam | medium | Reproduzido: inconsistência real entre os quatro métodos. Corrigido com `ensureAlive()` em `subscribe`; teste novo | patch |
| 4 | blind, edge | `effects`/`intent` passados ao listener e devolvidos ao chamador eram o mesmo objeto mutável compartilhado | medium | Real: uma mutação por um listener vazaria para os demais e para o retorno de `dispatch`. Corrigido com `Object.freeze` em `effects` e no objeto `meta`; teste novo prova `TypeError` em mutação | patch |
| 5 | blind | `subscribe(listener)` não validava que `listener` é função | low | Falha só apareceria tarde, dentro de um `dispatch` futuro. Corrigido com `TypeError` imediato; teste novo | patch |
| 6 | blind, gap | Nenhum teste exercitava um intent com `effects` não vazios (`preference`→`persistPreferences`) | medium | Toda asserção de `effects` nos testes originais usava só `type:'tab'`, que nunca produz efeito. Teste novo com `preference` | patch |
| 7 | blind | Comentário acima de `listeners` descrevia só a remoção durante o dispatch, nunca a inscrição durante o dispatch | low | Comentário reescrito para refletir o snapshot; o comportamento (achado 1) já está corrigido e testado | patch |
| 8 | blind, edge | Nenhum teste cobria `dispose()` chamado por um listener enquanto o próprio dispatch ainda notifica os demais | medium | Comportamento real (dispose limpa a lista inteira; quem ainda não foi chamado não é notificado) agora coberto por teste, consistente com a regra já testada de remoção durante o dispatch | patch |
| 9 | edge | Spec deixava a ordem "unsubscribe durante dispatch" aberta como escolha de implementação | false | Não é achado de defeito: a spec explicitamente autorizava a escolha ("ou é — definir e testar"); a escolha (não chamado) está documentada e testada | rejeitado |
| 10 | gap | Construtor não testado com `hiddenNewsIds`/`preferences`/opções inválidas | low | Esses parâmetros só repassam para `createExploration`, já testado em `tests/exploration.test.mjs`; duplicar aqui não prova nada novo sobre o wrapper | rejeitado |
| 11 | gap | Nenhum teste exercita os outros 9 tipos de intent (`hydrateUrl`, `base`, `company`, `camera`, `callback`, `advanceSnapshot`, `navigate`, `panel`, `openNews`) | low | Esses tipos já são testados exaustivamente em `tests/exploration.test.mjs` contra o reducer puro; o wrapper só repassa o intent, o que o achado 6 (`preference`) já prova para o caso com efeito | rejeitado |

## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
