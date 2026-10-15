---
title: 'browser-shell: raiz de composição única, efeitos e descarte em ordem fixa'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'de68fa8522ed7f60471fda68ee1b871b626c8d8b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** store, escritor de endereço, digest e fonte de fixtures existem isolados; nada os compõe numa página, executa os efeitos do reducer, hidrata a URL na carga e em `popstate`, nem descarta tudo em ordem quando a permissão cai (AD-23). Sem isso o shell não roda no navegador.

**Approach:** `src/ui/browser-shell.mjs` exporta `createBrowserShell(ports)`, a única raiz de composição da página. Recebe portas injetadas (`history`, `location`, `storage`, `clock`, `digest`, `source`) e cria uma instância de cada colaborador; não toca `window` diretamente. Um `start()` faz a carga e o primeiro snapshot; `dispose()` descarta em ordem fixa. `src/ui/main.mjs` é o único arquivo que lê `window` e chama `createBrowserShell` com as portas reais.

## Boundaries & Constraints

**Decisões (Andre, 15/10):** a spec 5 foi dividida; esta é só a raiz de composição. Build, `dist/ui/app/`, gate de imports e headers ficam na spec 5b. A página desta sequência é mínima (Busca, resultados, Empresa selecionada, marcador de procedência), sem o visual do UX.

**Always:**
- Ordem de inscrição no store: 1º escritor de endereço, 2º listener de efeitos (AD-19, convenção Efeitos). Quem despacha nunca executa efeitos.
- Listener de efeitos: `persistPreferences` grava no `storage` só chaves de `PREFERENCE_KEYS`, numa única chave `llms.preferences` com JSON; `camera` é registrado numa fila `cameraRequests` observável (não há renderer ainda). Tipo de efeito desconhecido lança.
- Preferências iniciais: lidas de `storage['llms.preferences']`, validadas com `assertPreferences`; JSON inválido ou formato errado cai em `DEFAULT_PREFERENCES` e não lança.
- `start()`: `reader.refresh()`; com `updated`, cria o store com o snapshot, o escritor com `explorationQuery` do estado inicial e despacha `hydrateUrl` com `location.search`; com outro status, não cria store e expõe `status` (`unavailable`/`access-denied`). Só a raiz despacha `hydrateUrl`: na carga e em `onPopState()`.
- `onPopState()`: despacha `hydrateUrl` com o endereço atual; o escritor não pode gerar entrada nova (o reducer produz o mesmo endereço; nenhum `pushState`).
- `refreshSnapshot()`: `reader.refresh()`; só despacha `advanceSnapshot` se a revisão lida for a `current` do reader naquele instante e diferente da do store (convenção Ordem de snapshots), repassando `companyMergedInto` inteiro. Status `access-denied` dispara `dispose()`.
- `dispose()` (AD-23), nesta ordem: `search.cancel()`, todos os `unsubscribe`, `store.dispose()`, descarta `reader` e `view` (referências zeradas). Idempotente. Depois dele, `search`, `getState` e `refreshSnapshot` lançam `SHELL_DISPOSED`.
- `src/ui/main.mjs` só opera sob `isSecureContext`; senão exibe aviso e não chama `createBrowserShell`. Renderiza a página mínima a partir de `shell.getState()`, `shell.search(q)`, `shell.select(result)` e mostra `shell.provenance`. Não é testado por `node --test` (é o único arquivo com DOM).

**Never:** build, cópia para `dist/`, `customHttp.yml`, `amplify.yml`, `scripts/` (spec 5b); Cesium/Globo; `fetch`, Cognito ou API (pós-Q2); gravar no storage qualquer coisa além das preferências; mudar `exploration-store`, `address-writer`, `web-digest`, `fixture-source`, `LocalSearch`, `LocalNewsView`, `SnapshotReader` ou o reducer.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Carga canônica | `location.search` já canônico | store criado; nenhuma escrita no history | N/A |
| Carga com alias | `?select=company-1&tab=globo` | 1 `replaceState` com a forma canônica após `flush` | N/A |
| Preferência | `dispatch` de `preference` | `storage['llms.preferences']` atualizado; nada mais gravado | N/A |
| Storage corrompido | `llms.preferences` = `'{'` | inicia com `DEFAULT_PREFERENCES` | não lança |
| Camera | `dispatch` de `camera` | efeito vai para `cameraRequests`; endereço não muda | N/A |
| popstate | `onPopState()` após `company` | estado reflete o endereço; zero `pushState` novos | N/A |
| Busca → seleção | `search('fictício')` e `select` | 1 `replace` (advance) + 1 `push` (navigate), nesta ordem | N/A |
| Snapshot vencido | reader trocou de revisão entre ler e despachar | `advanceSnapshot` não despachado | N/A |
| Perda de permissão | fonte passa a lançar `AccessDeniedError` em `refreshSnapshot()` | `dispose()` executado; nenhuma resposta de Busca publicada depois | N/A |
| Ordem do descarte | `dispose()` | chamadas em ordem `cancel` → unsubscribes → `store.dispose` | N/A |
| Após dispose | `search`/`getState`/`refreshSnapshot` | lançam | `Error('SHELL_DISPOSED')` |
| Isolamento | duas instâncias de shell | despachar numa não altera a outra | N/A |

</frozen-after-approval>

## Code Map

- `src/application/exploration-store.mjs` -- `createExplorationStore(options)`; `subscribe` devolve `unsubscribe`; `dispose()` terminal.
- `src/ui/address-writer.mjs` -- `createAddressWriter({history, address})` devolve listener com `.flush()`.
- `src/ui/fixture-source.mjs` -- `createFixtureSource({digest})`: portas `readManifest`, `readSlice`, `readFeedback`, `resolveAlias` e `provenance`.
- `src/ui/web-digest.mjs` -- `webDigest`, porta `digest` do navegador.
- `src/application/snapshot-reader.mjs` -- `refresh()` devolve `{status, snapshot}`; `status` `access-denied` quando a porta lança `AccessDeniedError` (`src/contracts/access.mjs`).
- `src/application/local-news-view.mjs`, `local-search.mjs` -- `LocalSearch({view, store})`, `search`, `select`, `cancel`.
- `src/domain/exploration-state.mjs` -- `DEFAULT_PREFERENCES`; efeitos `persistPreferences` (linha 81) e `camera` (linha 96).
- `src/contracts/exploration.mjs` -- `PREFERENCE_KEYS`, `assertPreferences`.
- `src/domain/exploration-url.mjs` -- `explorationQuery`.

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/browser-shell.mjs` -- `createBrowserShell(ports)` com `start`, `onPopState`, `refreshSnapshot`, `search`, `select`, `getState`, `provenance`, `cameraRequests`, `dispose` -- AD-23, convenções Composição/Efeitos/Ordem de snapshots.
- [x] `src/ui/main.mjs` -- portas reais do navegador e página mínima -- único ponto que toca `window`.
- [x] `src/ui/index.html` -- página mínima que carrega `main.mjs` como módulo; marcador de procedência visível.
- [x] `tests/browser-shell.test.mjs` -- matriz inteira com portas fake, `createFixtureSource({digest: webDigest})` e `node --test`.

**Acceptance Criteria:**
- Given um shell iniciado sobre a fonte sintética, when a fonte passa a negar acesso e `refreshSnapshot()` roda durante uma Busca pendente, then a Busca resolve `superseded`, nada é publicado depois e `dispose()` rodou na ordem do AD-23.
- Given o shell em execução, when qualquer intent é despachado, then o escritor de endereço é chamado antes do listener de efeitos.

## Implementation Notes

- A view lê `reader.current` (não chama `refresh()`); só a raiz chama `reader.refresh()`, então a revisão do frame e a `current` do reader vêm da mesma fonte. O store inicial é criado a partir de `view.frame()` para receber `hiddenNewsIds` do feedback.
- Superfície além da lista da spec: `dispatch(intent)` (intents da página, ex. Camadas), `flushAddress()` (`main.mjs` agenda no máximo um por quadro com `requestAnimationFrame`, AD-19) e `status`. `onPopState`/`select`/`dispatch` também lançam `SHELL_DISPOSED`; antes de `start` ou sem snapshot lançam `SHELL_NOT_STARTED`/`SHELL_UNAVAILABLE`.
- `createBrowserShell(ports, internals)`: `internals.createStore`/`createSearch` são costura de teste para observar ordem de inscrição e de descarte; produção não os passa.
- `config` do store fixo no shell (`MAPA`/`SAT`, inicial `MAPA`), igual aos testes existentes.
- `index.html` carrega `./ui/main.mjs`, caminho do artefato publicado por AD-25 (`dist/ui/app/index.html` + `dist/ui/app/ui/`); aberto direto de `src/ui/` não resolve — servir a página é da spec 5b.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | edge | Carga com endereço vazio não era canonizada, e Voltar à entrada inicial não limpava a Empresa selecionada | high | Reproduzido: `?` vazio → `company` → Voltar a `''` mantinha `company-1`. O escritor partia de `explorationQuery(estado)` em vez do endereço real. Agora parte de `location.search`: a carga faz 1 `replaceState` canônico e Voltar restaura `company=` vazio. Teste novo | patch |
| 2 | edge | `AccessDeniedError` vindo do feedback (via `view.frame`) virava `unavailable` e não descartava o shell | high | Reproduzido: `refreshSnapshot` devolvia `unavailable` com `status` `updated`. Tratado em `start` e `refresh`; dois testes novos | patch |
| 3 | blind, edge | Fim da sessão não chegava à página; `status` perdia o motivo (`access-denied` virava `disposed`) | medium | `onStatusChange` novo; `status` guarda `access-denied`; `main.mjs` esconde a Busca e mostra aviso. Teste novo; teste existente ajustado ao novo `status` | patch |
| 4 | blind, edge | `main.mjs` nunca chamava `refreshSnapshot` nem descartava a página | medium | Refresh em `visibilitychange`; descarte em `pagehide` só quando a página não entra no bfcache | patch |
| 5 | blind, edge | Falha no meio de `start` deixava store e inscrições meio criados; `start` não podia ser repetido | medium | Composição atômica (`compose` desfaz tudo em falha); `start` pode ser repetido após `unavailable`/`access-denied`. Testes novos | patch |
| 6 | edge | `hydrateUrl` de URL fora do contrato (ex. > 4096 chars) lançava no handler de popstate | low | Capturado; estado mantido. Teste novo | patch |
| 7 | blind | `dispatch` público aceitava `hydrateUrl`/`advanceSnapshot`, contornando a ordem de snapshots | medium | Recusados com `ROOT_ONLY_INTENT`. Teste novo | patch |
| 8 | blind, edge | Fila `cameraRequests` crescia sem limite e não podia ser drenada | low | Limite de 32 e `takeCameraRequests()`. Teste novo | patch |
| 9 | blind | `source.provenance` não era exigido, apesar de a página mostrar o marcador | low | `TypeError` na construção. Teste novo | patch |
| 10 | gap | `companyMergedInto` e `hiddenNewsIds` repassados no advance sem teste | medium | Teste novo publica revisão com merge `company-1→company-2` e notícia oculta; seleção remapeada e notícia fora do índice | patch |
| 11 | gap | `setItem` que lança nunca foi exercitado por um dispatch | medium | Teste novo com dispatch de `preference` | patch |
| 12 | gap | `SHELL_ALREADY_STARTED`/`SHELL_NOT_STARTED` sem teste | medium | Teste novo, inclusive `start` concorrente | patch |
| 13 | gap | Dispose durante `start` sem teste | medium | Teste novo: `start` resolve `disposed` e nenhum store é criado | patch |
| 14 | blind | Laços de espera nos testes podiam travar | low | Limitados a 1 000 iterações | patch |
| 15 | blind | `schemaVersion: 2` repetido como número | low | Trocado por `EXPLORATION_VERSION` | patch |
| 16 | blind | Página mostrava status crus (`results`, `globe`), sem estado de busca, e `dataset.companyId = "undefined"` para alvos que não são Empresa | low | Rótulos em português, estado "buscando…", atributo só quando existe, erros de Busca/seleção capturados | patch |
| 17 | edge | Mesma revisão de dados com feedback novo não atualiza o índice do store | low | Real, mas a fonte sintética não muda feedback; reavaliar com a fonte autenticada (Q2) | defer |
| 18 | blind | Falhas silenciosas sem porta de diagnóstico (logger) | low | Sem consumidor de log hoje; entra com a camada autenticada | rejeitado |
| 19 | gap | `main.mjs` sem verificação automatizada | medium | A spec exclui DOM de `node --test`; servir e verificar a página pertence à spec 5b | defer |
| 20 | gap | `index.html` só resolve no layout de `dist/ui/app/` | false | Esperado: a cópia para `dist/ui/app/` é a spec 5b | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `git diff --check` -- expected: sem erros.
