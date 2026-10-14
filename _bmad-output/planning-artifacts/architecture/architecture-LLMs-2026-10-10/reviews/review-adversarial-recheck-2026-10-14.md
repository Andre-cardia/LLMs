# Recheck adversário — correções de 14/10 (AD-2 acumulado, AD-9 apertado, AD-26, AD-27)

- **Data:** 2026-10-14
- **Lente:** adversarial (recheck). Para cada par e achado do relatório anterior: fechado, parcial ou aberto. Depois, busca de pares incompatíveis **criados** pelas correções.
- **Lidos:** [review-adversarial-2026-10-14-emendas.md](review-adversarial-2026-10-14-emendas.md), [review-rubric-2026-10-14-emendas.md](review-rubric-2026-10-14-emendas.md), [review-technology-2026-10-14-emendas.md](review-technology-2026-10-14-emendas.md); [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), [contracts.md](../contracts.md), [technology-evidence.md](../technology-evidence.md), [.memlog.md](../.memlog.md) (últimas entradas); [spine do Epic 7](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md) e o memlog dele. Código: [exploration-state.mjs](../../../../../src/domain/exploration-state.mjs#L108-L139), [exploration.mjs](../../../../../src/contracts/exploration.mjs#L113-L143), [snapshot.mjs](../../../../../src/contracts/snapshot.mjs), [snapshot-reader.mjs](../../../../../src/application/snapshot-reader.mjs), [local-search.mjs](../../../../../src/application/local-search.mjs#L61-L62), [exploration-url.mjs](../../../../../src/domain/exploration-url.mjs#L18), [memory-snapshots.mjs](../../../../../src/adapters/memory-snapshots.mjs), [curation.mjs](../../../../../src/contracts/curation.mjs#L5), [exploration.test.mjs](../../../../../tests/exploration.test.mjs#L82-L84).
- **Nenhum arquivo além deste relatório foi editado.**

## Veredito: **CONCERNS**

Os três defeitos de execução que motivaram o FAIL estão fechados no texto:

- a CSP agora é gerada com `connect-src` para a API e o Cognito ([spine:156](../ARCHITECTURE-SPINE.md#L156); [Epic 7:145](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L145));
- o "from nunca publicado" passa a ser ignorado pelo reducer ([spine:52](../ARCHITECTURE-SPINE.md#L52));
- o salto de revisões deixa de perder merges, porque a tabela acumulada vale contra qualquer revisão anterior (mesma linha; [Epic 7:127](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L127)).

A própria tabela acumulada criou, porém, um par incompatível novo e sério. "Entradas nunca são removidas" e "`from` ausente do catálogo novo" juntos impedem o DESFAZER pós-publicação de um merge (AD-4), a recovery com refs anteriores a um merge (AD-14) e a exclusão de um sobrevivente. Nos três casos o Publicador fica sem conseguir publicar. Isso não bloqueia o Epic 7 em fixtures, nem a story básica do Publicador v2. Precisa ser fechado antes da story de merge/curadoria e da story de recovery.

## Contagem

| Origem | Fechado | Parcial | Aberto |
| --- | --- | --- | --- |
| Adversário (Pares 1–5, achados 6–15) | 12 | 3 | 0 |
| Rubrica ALTA/MÉDIA (F-1 a F-5) | 5 | 0 | 0 |
| Tecnologia ALTA/MÉDIA (A, B, C, D) | 4 | 0 | 0 |
| **Total** | **21** | **3** | **0** |

## Relatório adversário anterior

| Item | Status | Onde (linha) | Nota |
| --- | --- | --- | --- |
| Par 1 — salto de revisões e cadeia | **Parcial** | [spine:52](../ARCHITECTURE-SPINE.md#L52); [contracts:46](../contracts.md#L46); [Epic 7:127](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L127) | Salto, cadeia na mesma janela (compactação `A→C, B→C`) e ordem estão fechados. Com o store em r1 e o leitor em r3, `A→C` é aplicado porque `A` está no índice anterior. **Resta o link antigo:** `?company=A` continua virando `null` em [exploration-url.mjs:18](../../../../../src/domain/exploration-url.mjs#L18). O adiamento existe só no memlog do pai ("fica para a story de URL (Q11)"); não aparece no Q11 ([spine:245](../ARCHITECTURE-SPINE.md#L245)) nem no AD-24 do filho ([Epic 7:139](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L139)). Ver N4. |
| Par 2 — validador único × reducer | **Parcial** | [spine:52](../ARCHITECTURE-SPINE.md#L52); [contracts:46-48](../contracts.md#L46-L48) | No texto está fechado: uma função, `assertCompanyMergedInto(entries,{nextCompanyIds})`, com três chamadores, e o reducer ignora `from` fora do índice anterior. **O código e o inventário ainda dizem o contrário:** [exploration-state.mjs:113](../../../../../src/domain/exploration-state.mjs#L113) lança `INVALID_REMAP` quando `!s.index.companyIds.includes(from)`, e [exploration.test.mjs:82-83](../../../../../tests/exploration.test.mjs#L82-L83) e o primeiro caso de [:358](../../../../../tests/exploration.test.mjs#L358) **exigem** esse lançamento. O inventário de migração ([contracts:48](../contracts.md#L48)) lista manifesto, `MemorySnapshots`, testes de manifesto e `fixture-source`, mas não o reducer, esses testes, o `companyRemaps:[]` fixo de [local-search.mjs:62](../../../../../src/application/local-search.mjs#L62) nem a exposição de `companyMergedInto` no frame de `LocalNewsView`. Ver N2. |
| Par 3 — CSP × API/Cognito | Fechado | [spine:156](../ARCHITECTURE-SPINE.md#L156); [Epic 7:61](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L61), [:145](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L145) | Uma `APP_ORIGIN` alimenta as quatro listas, a API é cross-origin, CORS fica só no gateway com `OPTIONS` sem auth, previews estão presos ao ambiente e a configuração pública é gerada por branch. |
| Par 4 — fronteira HTTP do manifesto | Fechado (com N3) | [spine:158-168](../ARCHITECTURE-SPINE.md#L158-L168); [contracts:48](../contracts.md#L48) | `PublishedManifest` e `ManifestResponse` estão separados, a slice volta em bytes verbatim, o 401 é mapeado, há retenção de três revisões e o padrão de `revision` está definido. A correção, porém, se contradiz no refresh (N3). |
| Par 5 — token, escopo e guarda | Fechado | [spine:98-100](../ARCHITECTURE-SPINE.md#L98-L100); [Epic 7:121](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L121) | Só access token, `llms-api/read\|write`, tabela rota→escopo, `token_use`, callback dedicado, tokens em memória, PKCE próprio sem pacote e exceção nomeada no AD-21. |
| 6 — regra de remap no despachante | Fechado | [Epic 7:127](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L127) | O despachante repassa a tabela inteira e o reducer decide (AD-1). |
| 7 — `warning` para remap descartado | Fechado (obsoleto) | [spine:52](../ARCHITECTURE-SPINE.md#L52) | Com a tabela acumulada não há descarte por salto, e o enum de [exploration.mjs:233](../../../../../src/contracts/exploration.mjs#L233) basta. |
| 8 — origem dos remaps | Fechado | [spine:52](../ARCHITECTURE-SPINE.md#L52); [contracts:46](../contracts.md#L46) | Só `MergeDecision` consumida no commit, sem parâmetro de `publish`. O contrato ainda não existe ([curation.mjs:5](../../../../../src/contracts/curation.mjs#L5)), mas foi atribuído antes da story. |
| 9 — inventário de fixtures | Fechado | [contracts:48](../contracts.md#L48) | Cobre manifesto e fixtures. A lacuna do reducer está em N2. |
| 10 — sessão de leitura e gatilho de refresh | Fechado | [spine:52](../ARCHITECTURE-SPINE.md#L52), [:168](../ARCHITECTURE-SPINE.md#L168) | Uma revisão por `frame`; só a raiz dispara refresh. |
| 11 — marcador e detector do build | Fechado | [spine:96](../ARCHITECTURE-SPINE.md#L96); [Epic 7:121](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L121) | `provenance: 'synthetic-fixture'` com allowlist de diretórios. |
| 12 — recovery × remap | **Parcial** | [spine:52](../ARCHITECTURE-SPINE.md#L52) | "Recovery publica revisão nova com as refs antigas e a tabela atual." Se as refs antigas forem anteriores a um merge, o catálogo antigo contém `A` e a tabela atual tem `A→C`. O validador ("`from` ausente do catálogo novo") reprova, e a recovery fica impossível. Ver N1. |
| 13 — allowlist por ambiente | Fechado | [spine:98](../ARCHITECTURE-SPINE.md#L98) | `OWNER_SUBS` do ambiente; lista vazia nega. |
| 14 — tabela de versões | Fechado | [contracts:5-10](../contracts.md#L5-L10); [spine:174](../ARCHITECTURE-SPINE.md#L174) | |
| 15 — sinal de perda de acesso | Fechado | [spine:168](../ARCHITECTURE-SPINE.md#L168); [Epic 7:133](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L133) | Um único `access-lost` dispara o descarte do AD-23. |

## Rubrica e tecnologia (ALTA/MÉDIA)

| Item | Status | Onde |
| --- | --- | --- |
| Rubrica F-1 (ALTA) — HTTP API × streaming | Fechado | [spine:97](../ARCHITECTURE-SPINE.md#L97); [tech-evidence:38](../technology-evidence.md#L38) |
| Rubrica F-2 (MÉDIA) — validador incompleto | Fechado no texto | [spine:52](../ARCHITECTURE-SPINE.md#L52). A regra deixou de exigir `from` no anterior e passou a ignorá-lo. O delta de código está em N2 |
| Rubrica F-3 (MÉDIA) — "o build falha" | Fechado | [spine:96](../ARCHITECTURE-SPINE.md#L96) (mockups fora de `/app` como exceção nomeada) |
| Rubrica F-4 (MÉDIA) — token e CSP | Fechado | [spine:100](../ARCHITECTURE-SPINE.md#L100), [:156](../ARCHITECTURE-SPINE.md#L156); [Epic 7:121](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L121), [:145](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L145) |
| Rubrica F-5 (MÉDIA) — agendador, bundle→ambiente, Gen 2 | Fechado | [spine:101](../ARCHITECTURE-SPINE.md#L101), [:156](../ARCHITECTURE-SPINE.md#L156), [:237](../ARCHITECTURE-SPINE.md#L237) |
| Tecnologia A (alto) — `aud`/`client_id` | Fechado | [spine:98](../ARCHITECTURE-SPINE.md#L98); [tech-evidence:35](../technology-evidence.md#L35) |
| Tecnologia B (alto) — managed login e resource server | Fechado | [spine:98-99](../ARCHITECTURE-SPINE.md#L98-L99); [tech-evidence:36](../technology-evidence.md#L36) |
| Tecnologia C (médio) — `amplifyapp.com` | Fechado | [spine:156](../ARCHITECTURE-SPINE.md#L156); [tech-evidence:34](../technology-evidence.md#L34) |
| Tecnologia D (médio) — presigned × BPA | Fechado | [spine:97](../ARCHITECTURE-SPINE.md#L97); [tech-evidence:37](../technology-evidence.md#L37); prova em [spine:237](../ARCHITECTURE-SPINE.md#L237) |

Tecnologia E (processo) também está fechado ([tech-evidence:35-37](../technology-evidence.md#L35-L37)).

## Achados novos ou restantes

### N1 — ALTA — "Entradas nunca são removidas" × DESFAZER pós-publicação, recovery e exclusão do sobrevivente

- **Local:** [spine:52](../ARCHITECTURE-SPINE.md#L52) ("Entradas nunca são removidas"; o validador exige "`from` ausente do catálogo novo, `to` presente"), contra AD-4 em [spine:64](../ARCHITECTURE-SPINE.md#L64) (proposta compensatória pós-publicação), AD-14 em [spine:132](../ARCHITECTURE-SPINE.md#L132) (recovery) e [contracts:50](../contracts.md#L50) ("exclusão/merge… exige remapeamento curado ou impede publicar").
- **Pares, todos obedecendo o texto:**
  1. **Desfazer merge.** O dono desfaz `A→C` depois de publicado. A compensação restaura `A` no catálogo, mas a entrada `A→C` não pode sair. O validador reprova, e nenhuma revisão nova é publicada.
  2. **Recovery.** Refs antigas anteriores ao merge trazem `A` no catálogo, enquanto a tabela atual tem `A→C`. O validador reprova, e o AD-14 fica sem caminho.
  3. **Exclusão do sobrevivente.** `C` é removida sem merge. Então `A→C` e `B→C` têm `to` ausente, e o Publicador fica bloqueado para sempre.
- **Consequência:** o Publicador trava, ou uma story "conserta" por conta própria, apagando entradas ou reescrevendo `to` por heurística, contra AD-16 e AD-3.
- **Correção:** emendar o AD-2.
  - Entradas só mudam por `MergeDecision` compensatória (AD-4), que remove `from` da tabela e recompacta.
  - O sobrevivente excluído vira `toCompanyId: null` ("retirado sem sobrevivente"), e o reducer limpa a seleção com `company-unavailable`. A mudança de schema ainda cabe antes de qualquer v2 real.
  - Recovery reconstrói a tabela atual contra o catálogo das refs antigas. Se houver conflito, a recovery exige decisão humana, nunca uma publicação parcial.
  - Fixtures inválidas e válidas cobrem os três casos.

### N2 — MÉDIA — O código e os testes ainda impõem a regra antiga, e o inventário não manda migrá-los

- **Local:** [exploration-state.mjs:110-114](../../../../../src/domain/exploration-state.mjs#L110-L114) (lança `INVALID_REMAP` se `from` não está no índice anterior); [exploration.test.mjs:82-83](../../../../../tests/exploration.test.mjs#L82-L83) e [:358](../../../../../tests/exploration.test.mjs#L358) (exigem o lançamento para `missing`); [local-search.mjs:62](../../../../../src/application/local-search.mjs#L62) (`companyRemaps:[]` fixo); inventário em [contracts:48](../contracts.md#L48).
- **Gatilho:** a story Domain/Contracts segue o inventário literal e não toca no reducer. A story de consumidor segue o AD-22 e repassa a tabela inteira. Qualquer manifesto com uma entrada antiga (`from` já ausente desde revisões anteriores, o caso normal de uma tabela acumulada) faz `advanceSnapshot` lançar. `LocalSearch.select` então devolve `unavailable` para todos os resultados. É exatamente o Par 2 original, reaberto pelo código.
- **Correção:** acrescentar ao inventário de [contracts:48](../contracts.md#L48):
  - o reducer troca a checagem inline por `assertCompanyMergedInto` mais um filtro pelo índice anterior;
  - os testes `exploration.test.mjs:82-84` e o caso `missing` de `:358` passam a afirmar "ignora";
  - `DUPLICATE_REMAP`, `from` presente no novo e `to` ausente continuam sendo erro;
  - `LocalNewsView.frame` expõe `companyMergedInto`, e `LocalSearch` deixa de enviar `[]`.

  Registrar no texto o que o memlog já diz: a mudança relaxa a validação sem bump de `EXPLORATION_VERSION`.

### N3 — MÉDIA — AD-27 se contradiz no refresh, e a "reautenticação silenciosa" tem dois mecanismos plausíveis

- **Local:** [spine:165](../ARCHITECTURE-SPINE.md#L165) ("404/410 de slice: … o reader faz refresh") × [spine:168](../ARCHITECTURE-SPINE.md#L168) ("Só a raiz de composição chama `refresh`"); [spine:163](../ARCHITECTURE-SPINE.md#L163) ("401: uma reautenticação silenciosa") × [spine:100](../ARCHITECTURE-SPINE.md#L100) (`/oauth2/authorize` com `prompt=none`, que é navegação de topo).
- **Gatilho:**
  - **Refresh:** uma story põe o refresh dentro do `SnapshotReader`, com risco de loop se a revisão nova também der 404. Outra o deixa só na raiz.
  - **401:** a porta HTTP tenta `prompt=none`, um redirect que destrói o store em memória no meio de um `frame`. Outra usa `refresh_token` em memória no `/oauth2/token`, o que o texto nem permite nem proíbe.
- **Correção:**
  - 404/410 → a porta lança `RevisionSupersededError`, e a raiz agenda **um** refresh (no máximo um por manifesto; na segunda falha, `kept-last-good`).
  - 401 → a porta tenta uma vez o grant `refresh_token` guardado em memória. Se falhar, emite `access-lost`. Só a raiz decide o redirect `prompt=none`, salvando a query.
  - Nomear o arquivo da porta (ex.: `src/ui/http-snapshot-port.mjs`) e `src/ui/auth/` no seed do filho ([Epic 7:174-186](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L174-L186)).
  - A query salva durante o redirect cabe no `state` ou entra na exceção nomeada do AD-21 ([Epic 7:121](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L121)).

### N4 — BAIXA — Tamanho da tabela sem limite declarado e link antigo sem dono no spine

- **Tamanho:** a tabela é acumulada e nunca encolhe ([spine:52](../ARCHITECTURE-SPINE.md#L52)). Ela é limitada na prática pelo número de IDs de Empresa já retirados, e a descoberta admite até 10 Empresas novas por semana (AD-5), ou seja, alguns milhares de entradas e centenas de KB no pior caso. Não há teto no contrato: `list` em [primitives.mjs:42](../../../../../src/contracts/primitives.mjs#L42) não limita comprimento. A tabela inteira viaja em todo manifesto, em todo frame e em todo `advanceSnapshot`. O reducer faz `includes` linear por entrada ([exploration-state.mjs:113](../../../../../src/domain/exploration-state.mjs#L113)), o que dá custo O(n·m) por avanço. A tabela também entra no orçamento de 6 MB da Lambda ([spine:237](../ARCHITECTURE-SPINE.md#L237)).
  - **Correção:** teto no validador (ex.: 10 000 entradas), teste de tamanho do manifesto no gate Q2, e `Set` no reducer.
- **Link antigo:** `hydrateUrl` não recebe a tabela e o estado não a guarda. Resolver `?company=A` exige, portanto, mudar o intent ou o estado, ou seja, `EXPLORATION_VERSION` 3 sob AD-16.
  - **Correção:** registrar isso no Q11 ([spine:245](../ARCHITECTURE-SPINE.md#L245)) e no AD-24 do filho, não só no memlog.

## Coerência de revisões pai × filho

- Os dois spines têm `updated: 2026-10-14` ([spine:10](../ARCHITECTURE-SPINE.md#L10); [Epic 7:10](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L10)).
- O filho herda AD-26 e AD-27 em `binds` e em Inherited Invariants ([Epic 7:11](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L11), [:61-62](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L61-L62)).
- A tabela "Emendas aplicadas" descreve o AD-2 acumulado e o AD-22 simplificado ([Epic 7:71](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L71)), coerente com o pai, e o memlog do filho registra a propagação.
- A renumeração (a proposta AD-26 de remap foi absorvida pelo AD-2; AD-27→26 e AD-28→27) está consistente nas referências cruzadas ([spine:102](../ARCHITECTURE-SPINE.md#L102)).
- Resíduos baixos:
  - o paradigma do filho ([Epic 7:27](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md#L27)) lista `localStorage` e `crypto.subtle`, mas não `sessionStorage` nem `fetch`, que o shell agora usa;
  - o seed do filho omite `src/ui/auth/` e a porta HTTP;
  - [implementation-readiness.md](../implementation-readiness.md) continua com `checked: 2026-10-12` (F-6 da rubrica, BAIXA, não contado).

## Ordem sugerida

1. N1 e N2 antes da story Domain/Contracts do manifesto v2 (N2) e antes das stories de merge/recovery (N1).
2. N3 antes da story da porta HTTP e do shell autenticado (Q2).
3. N4 junto do gate Q2 (tamanho) e de Q11 (link antigo).
