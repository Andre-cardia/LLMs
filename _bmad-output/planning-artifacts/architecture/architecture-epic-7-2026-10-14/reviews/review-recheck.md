---
review: recheck
target: ../ARCHITECTURE-SPINE.md (revisão AD-18..AD-25 + "Conflitos com o spine pai")
inputs: [review-seams.md, review-rubric.md, review-inherited.md, review-technology.md]
date: '2026-10-14'
verdict: CONCERNS
critical_open: 0
high_open_or_partial: 3
---

# Re-review: spine revisado do Epic 7 contra os achados CRITICAL/HIGH

## Veredito

**CONCERNS.** Nenhum achado crítico continua aberto como crítico. Os críticos anteriores (C1/F-6, C2, C3/F-4, F-17, A5) ficaram assim: C1/F-6, C3/F-4 e A5 fecharam; F-17 ficou parcial e caiu para medium; C2/F-5 ficou parcial e caiu para high, porque a tabela agora é total, mas uma costura nova impede que ela seja aplicada de forma determinística. Dos HIGH, a maioria fecha. Restam três problemas de severidade high, parciais ou novos. Todos têm a mesma raiz: **AD-18 não define o que um listener recebe nem o que um `dispatch` enfileirado devolve.** Por isso o escritor de endereço (AD-19) e o executor de efeitos (Convenções) não têm um gancho definido. Não encontrei nada que justifique FAIL.

Método: li o código real. Também rodei probes descartáveis em Node 25 (o mesmo comportamento vale em Node ≥24), com um store mínimo que segue o FIFO de AD-18 e a `LocalSearch` real. Nenhum arquivo do repositório foi alterado além deste.

---

## Verificações pedidas

### (1) AD-23: `cancel()` → `unsubscribe` → `dispose()` impede publicação pós-descarte? **Sim. Fecha.**

- `#active` em [local-search.mjs:25-27](../../../../../src/application/local-search.mjs#L25-L27) é `operation.generation === this.#generation && operation.intentToken === this.#intentToken()`. Depois de `cancel()` ([:33-36](../../../../../src/application/local-search.mjs#L33-L36)), `#generation` é `null` e `operation.generation` é um `Symbol`. A primeira comparação dá `false` e o `&&` **interrompe a avaliação antes de `getState()`**, então o store descartado nunca é lido.
- `#superseded` ([:28-32](../../../../../src/application/local-search.mjs#L28-L32)) só chama `cancel()` de novo se `operation.generation === this.#generation`. Como isso é falso, devolve `{status:'superseded'}` **sem publicar**.
- **Branch `catch`** em `search` ([:47-48](../../../../../src/application/local-search.mjs#L47-L48)) e em `select` ([:77-78](../../../../../src/application/local-search.mjs#L77-L78)): fazem a mesma chamada a `#active`, com a mesma interrupção. Uma rejeição de `frame()` depois do descarte também resolve como `superseded`, sem publicar e sem `getState()`.
- **`select()`:** a checagem em [:59](../../../../../src/application/local-search.mjs#L59) vem antes do `dispatch` em [:61](../../../../../src/application/local-search.mjs#L61), então não há dispatch no store descartado. Se um listener executar o descarte de forma síncrona dentro do `dispatch`, as checagens em [:65](../../../../../src/application/local-search.mjs#L65) e [:72](../../../../../src/application/local-search.mjs#L72) também interrompem na geração.
- Probe com `frame()` pendente → `cancel()` → `dispose()` → resolução bem-sucedida: retorna `{"status":"superseded"}`; `current.status` era `idle` antes e continua `idle` depois. A ordem importa. No probe, `dispose()` **sem** `cancel()` faz `#active` lançar `STORE_DISPOSED` dentro do `try`; o `catch` chama `#active` de novo, que lança outra vez; a promise rejeita com `STORE_DISPOSED` e `current` fica preso em `loading`. Não há publicação, mas ficam uma rejeição sem tratamento e uma UI travada. A ordem fixada em AD-23 é, portanto, essencial e está certa.
- Resíduos de baixa severidade: (a) o próprio `cancel()` **publica** `idle` (consulta sem resultados nem contexto). O teste de AD-23 ("nenhuma resposta é publicada depois da perda de permissão") precisa abrir essa exceção, ou um autor de teste literal vai reprovar a implementação correta. (b) Uma `search()` chamada na mesma instância depois do descarte rejeita com `STORE_DISPOSED` em `#begin`, antes de publicar. É seguro, mas a raiz precisa largar a referência.

### (2) A tabela de AD-19 é total sobre `INTENT_FIELDS`? **Sim. 12 de 12.**

As chaves em [exploration.mjs:113](../../../../../src/contracts/exploration.mjs#L113) são: `hydrateUrl, preference, tab, base, company, panel, openNews, camera, callback, escape, advanceSnapshot, navigate`. A tabela cobre: push = `company, tab, navigate` (3); replace = `base, preference, advanceSnapshot` (3); silencioso = `hydrateUrl` (1); sem mudança = `panel, openNews, escape, camera, callback` (5). Total de 12, sem sobra e sem duplicata. Conferi no reducer ([exploration-state.mjs:96-107](../../../../../src/domain/exploration-state.mjs#L96-L107), [:52-63](../../../../../src/domain/exploration-state.mjs#L52-L63)) que os cinco "sem mudança" não alteram `layers/base/tab/companyId`. `advanceSnapshot`, que pode zerar `companyId` ([:121-126](../../../../../src/domain/exploration-state.mjs#L121-L126)), agora está em replace. Isso fecha o núcleo de F-5/C2.

Ressalvas, detalhadas em N1 e N4: `INTENT_FIELDS` **não é exportado** (`const` local). Além disso, a frase "a comparação confirma" da última linha da tabela é falsa depois de hidratar um endereço não canônico.

### (3) FIFO de AD-18 × `operation.intentToken += 1` de `select()`: **reporta `superseded` corretamente, como o código aceito pretende, mas com efeito colateral não decidido.**

- Com o FIFO, um `dispatch` feito por um listener é processado **antes** de o `dispatch` externo retornar. O `intentToken` do store sobe 2 (com exceção de `callback`, que devolve `previous` sem incrementar, [exploration-state.mjs:57,67](../../../../../src/domain/exploration-state.mjs#L57)). `select()` soma exatamente 1 ([local-search.mjs:63](../../../../../src/application/local-search.mjs#L63), [:71](../../../../../src/application/local-search.mjs#L71)), `#active` falha, e o resultado é `superseded` + `cancel()` + `idle`.
- Esse **é** o comportamento pretendido pelo núcleo aceito: o comentário em [:64](../../../../../src/application/local-search.mjs#L64) e os testes "7.1 AC2: intenção reentrante no refresh impede o segundo dispatch de navegação" e "7.1 review VG2" ([tests/search.test.mjs:232-237](../../../../../tests/search.test.mjs#L232-L237), [:341-346](../../../../../tests/search.test.mjs#L341-L346)) esperam `superseded` exatamente nesse cenário. O FIFO é compatível: sem chamada aninhada ao reducer, a contagem fica linear e a regra "+1 por dispatch próprio" continua valendo.
- Probes com um listener que despacha `camera` de forma síncrona:
  - reagindo a `advanceSnapshot`: `{"status":"superseded"}`, token 2, `navigate` **não** despachado, busca `idle`;
  - reagindo a `navigate`: `{"status":"superseded"}`, token 3, a navegação **foi aplicada**, mas a Busca diz `superseded` e vai a `idle`;
  - sem listener: segue o caminho normal.
- O problema (N3): qualquer reação benigna e natural de um listener, como o Globo voar a câmera para a Empresa recém-navegada, transforma **toda** seleção de Busca bem-sucedida em `superseded`. O shell não fecha o diálogo nem move o foco, embora o destino tenha mudado. É correto pela semântica de token, mas o spine não decide se listeners podem despachar de forma síncrona. Por isso, dois implementadores do Globo divergem e um deles quebra AC-2 da 7.1 em silêncio.

### (4) Contradições novas introduzidas pela revisão

São N1 a N8, abaixo. As principais são N1 (gancho do escritor de endereço e dos efeitos) e N2 (semântica de retorno e de erro de um `dispatch` enfileirado), ambas criadas pelo FIFO e pela regra "primeiro o endereço, depois os efeitos".

---

## Tabela de status: todos os CRITICAL/HIGH anteriores

| ID(s) | Sev. original | Status | Evidência / resíduo |
| --- | --- | --- | --- |
| C1 / F-6 / A3: forma e autoridade de `companyRemaps` | critical / critical / high | **CLOSED** | AD-22 fixa `remapsFrom` + `companyRemaps: [{fromCompanyId,toCompanyId}]`, um único validador em `src/contracts/`, nova versão por AD-16, autoria Domain/Contracts e bloqueio até a emenda de AD-2 (seção Conflitos); o frame expõe os dois campos; a regra de repasse é determinística (`remapsFrom === snapshotRevision` ou `[]`). Hoje `assertManifest` exige chaves exatas ([snapshot.mjs:8](../../../../../src/contracts/snapshot.mjs#L8)), e isso agora está reconhecido como incompatível. Nota baixa: o validador hoje está inline em [exploration.mjs:138-141](../../../../../src/contracts/exploration.mjs#L138-L141) e, como `exploration.mjs` importa `snapshot.mjs`, precisa morar em `snapshot.mjs` ou num módulo folha para evitar ciclo. |
| C2 / F-5: AD-19 cobria 6 de 12 intents | critical / high | **PARTIAL (high)** | A tabela é total (verificação 2). Mas não fica determinado **onde** o escritor descobre o intent (N1). Num `dispatch` com intents enfileirados (`base` externo + `company` vindo de listener), um implementador classifica por intent e outro pelo `dispatch` externo, o que gera históricos diferentes. Também falta o export de `INTENT_FIELDS` para o teste de exaustividade (N5). |
| C3 / F-4: `cancel()` não impedia publicação pós-descarte | critical / critical | **CLOSED** | Verificação 1: a comparação de geração interrompe antes de `getState()`, também no `catch`; o probe confirma. Resíduo baixo: o `idle` publicado pelo próprio `cancel()` e a falta de escopo para leitor/view (N6). |
| H1: "o shell" não era proprietário | high | **CLOSED** | Raiz única `src/ui/browser-shell.mjs`; `address-writer.mjs`, `fixture-source.mjs` (marcador único), `web-digest.mjs`; tabela de alias em `domain`; efeitos executados pela raiz. Resíduo baixo: o layout de `localStorage` (blob único ou chave por preferência, revalidação com `assertPreferences` na carga) não está fixado, mas agora tem um dono só. |
| H2 / F-2: tabela de alias e `reader=`/`pov=` | high / high | **CLOSED** | A tabela fica em `parseExplorationUrl`; `select=`→`company`, `tab=globo`→`globe`, a forma canônica prevalece, `mode/reader/pov` são ignorados, "não inventa `company=`". Conferi no protótipo ([prototype-artificial-analysis.html:1132-1135](../../ux-designs/ux-LLMs-2026-10-09/mockups/prototype-artificial-analysis.html#L1132-L1135)): `tab` só usa `globo|models|news`, então o mapa de `tab` está completo. Resíduo baixo: `select=<id desconhecido>` vira `company=<desconhecido>` → `companyId:null` ([exploration-url.mjs:18](../../../../../src/domain/exploration-url.mjs#L18)) e **apaga** a seleção da sessão, ao contrário do protótipo, que ignora; caixa (`tab=GLOBO`) não está especificada. |
| H3: `layers` com dois caminhos de mutação | high | **PARTIAL (medium)** | `layers` saiu da tabela, e o toggle só pode ser `preference` → `replaceState` + `persistPreferences`. Mas o spine não diz explicitamente que um toggle de Camada é preferência durável, nem **proíbe** despachar `hydrateUrl` fora de `popstate`/carga inicial. A tabela só diz que nesses casos ele é silencioso. Um `hydrateUrl` sintético para gravar um override de sessão continua literalmente permitido. |
| H4: AD-21 × Histórico da 7.3 | high | **CLOSED** | AD-21: conversa, Histórico e consultas nunca são gravados no navegador; a 7.3 não começa antes de Q2+Q7; o item de Deferred é coerente. |
| F-17: envelope operacional silencioso | critical | **PARTIAL (medium)** | AD-25 decide o build (único script), o destino `dist/ui/app/`, preserva o gate do `amplify.yml`, põe os headers em `customHttp.yml`, exige contexto seguro, testes por portas, nenhum token, e acrescenta AD-14 a `binds`. Restam três pontos: (a) **o conteúdo** dos headers (CSP, cache das fixtures, `Content-Type` de `.mjs`) não está fixado; o MIME de `.mjs` no Amplify é risco não verificado; (b) o layout da cópia é ambíguo: `src/ui/index.html` precisa acabar em `dist/ui/app/index.html` enquanto os diretórios são preservados (achatar quebra os imports `../application/`), e o caminho do `<script>` difere entre fonte e dist; (c) [build-ui-preview.mjs:11-14](../../../../../scripts/build-ui-preview.mjs#L11-L14) aborta sem as variáveis do Cesium, então o shell, que "não lê token", ainda depende delas para ser construído. |
| F-9: `Esc` com Busca aberta | high | **CLOSED** | Convenção: a Busca é a superfície mais alta, o shell fecha e devolve o foco a ⌕, sem despachar `escape`; fechada a Busca, vale a escada do reducer. |
| F-13 / T-2: digest ArrayBuffer × hex | high / high | **CLOSED** | AD-20: `TextEncoder` UTF-8, hex minúsculo de 64 caracteres, fixture não ASCII compartilhada contra `sha256Text`, contexto seguro, nenhum caminho que pule `SnapshotReader`. `crypto.subtle.digest` existe no Node ≥24 (confirmado). |
| F-15: ticker → MERCADOS | high | **CLOSED (divergência)** | Decidido: `navigate` apenas; MERCADOS sob Q5. Mas isso deixa uma lacuna de aceitação (N7). |
| A5: Q12 inventado | critical | **CLOSED** | Q12 sumiu; Q2 é referenciado diretamente e o conflito está na seção própria. |
| A2b: store relocado silenciosamente | high | **CLOSED** | Linha "Local do store" em Conflitos. |
| B3: URL sem conversa/segredo; autenticação | high | **CLOSED** | AD-19: "o escritor nunca acrescenta parâmetros" + Prevents; AD-21: a 7.1 fica `in-progress` até Q2. |
| B5: mapeamento ID→DOM; aposentar `aaSearchRows()` | high | **CLOSED** | Convenção "Ligação ao DOM". |
| B6: entrega ordenada de snapshots (CR-04) | high | **PARTIAL (medium)** | A convenção "Ordem de snapshots" atribui a ordem ao único `SnapshotReader`. Mas [snapshot-reader.mjs:9,18](../../../../../src/application/snapshot-reader.mjs#L9) ordena **chamadas de `refresh()`**, não revisões. Nada proíbe um despachante que segura um frame antigo de emitir `advanceSnapshot` depois de o store já ter avançado. Na `LocalSearch` o token protege; em outros despachantes (a raiz no refresh, o Globo), não. Falta a regra: "`advanceSnapshot` só com o frame de `SnapshotReader.current` no instante do dispatch". Também não está dito quem despacha `advanceSnapshot` quando o leitor atualiza. |

---

## Contradições e lacunas novas

**N1 — high. Gancho do escritor de endereço e do executor de efeitos não definido.**
AD-19 pede a classificação "por intent, após cada `dispatch`", e as Convenções dizem que "a raiz executa os efeitos depois de escrever o endereço". Mas `LocalSearch` despacha **direto no store** e descarta os efeitos devolvidos ([local-search.mjs:61,70](../../../../../src/application/local-search.mjs#L61)), e AD-18 diz que listeners não recebem argumentos especificados ("quem assina lê `getState()`"). Um implementador decora `dispatch` na raiz e entrega esse store decorado aos consumidores; outro passa `(state, intent, effects)` aos listeners; um terceiro classifica pelo diff de estado. Hoje só `preference` e `camera` emitem efeitos ([exploration-state.mjs:80,95](../../../../../src/domain/exploration-state.mjs#L80)), mas um `camera` despachado pelo Globo direto no store fica sem executor. Correção: AD-18 deve fixar que o listener recebe `{intent, effects}` por passo do reducer, e que o escritor de endereço e o executor de efeitos são listeners da raiz registrados primeiro, nessa ordem.

**N2 — medium. Semântica de um `dispatch` enfileirado.**
O FIFO faz a chamada interna retornar antes de processar o intent. O que ela devolve? Os efeitos ainda não existem. Se o intent enfileirado lança (`COMPANY_NOT_FOUND`), quem recebe a exceção? A chamada interna já retornou, então só sobra o `dispatch` externo, cujo intent **já foi confirmado**. Pelo `catch` de `select()`, isso vira `superseded` com `advanceSnapshot` aplicado e `navigate` não aplicado. Também não está definido o que acontece com um `dispose()` durante o esvaziamento da fila. Três leituras compatíveis com AD-18: engolir o erro, relançar no externo ou registrar o erro em log. Correção: fixar o retorno (`undefined` ou os efeitos entregues via N1), o destino dos erros enfileirados e o comportamento de `dispose` no meio da fila.

**N3 — high. Listener que despacha de forma síncrona anula a Busca (verificação 3).**
É o comportamento correto e testado, mas o spine não diz se listeners **podem** despachar de forma síncrona. Um Globo que reage a `navigate` com `camera` deixa toda seleção de Busca `superseded`/`idle`, mesmo com a navegação aplicada, e quebra o fechamento do diálogo e o foco da AC-2. Correção: "listeners não despacham de forma síncrona; reações vão por efeito ou microtarefa", ou então tornar a câmera um efeito de `navigate`.

**N4 — medium. A tabela de AD-19 contradiz a própria comparação depois de hidratar um endereço não canônico.**
`hydrateUrl` não escreve. Por isso, depois da carga de `?select=c1&tab=globo` ou de `?tab=lixo`, o endereço continua não canônico. O próximo `panel`/`openNews` encontra `explorationQuery ≠ endereço` e a tabela manda "nenhuma", mas a linha diz "a comparação confirma". Um implementador trata a divergência como asserção; outro, como gatilho para `replaceState`. O endereço também fica com alias legado, ou com `company` que virou indisponível, até a próxima escrita. Decidir se a carga inicial e o `popstate` fazem `replaceState` canônico, ou se o endereço não canônico persiste.

**N5 — medium. `INTENT_FIELDS` não é exportado.**
[exploration.mjs:113](../../../../../src/contracts/exploration.mjs#L113) declara `const` sem `export`. O teste de exaustividade de AD-19 exige uma mudança em `src/contracts/`, sujeita a AD-16 e de autoria Domain/Contracts, que nenhum AD atribui. Copiar a lista no teste anula o propósito do teste.

**N6 — medium. AD-23 só cobre `LocalSearch`.**
Na perda de permissão, `SnapshotReader.#current` mantém a última revisão boa ([snapshot-reader.mjs:19,23](../../../../../src/application/snapshot-reader.mjs#L19)), a menos que um `refresh` devolva `access-denied`. Um `refresh()` ou um `LocalNewsView.project()` em voo, ou callbacks de efeito (`camera` → `callback`), continuam vivos. O spine não diz se leitor e view são recriados com o store novo. Se não forem, uma nova `LocalSearch` pesquisa a revisão privada antiga. Hoje isso não tem efeito sob AD-21 (só fixtures), mas é exatamente o Prevents de AD-23.

**N7 — medium. Consequência de aceitação de F-15 não declarada.**
A AC-2 da 7.1 exige "ticker navega à Empresa/ativo em MERCADOS" ([epics.md:1635](../../../epics.md#L1635)). O spine adia MERCADOS para Q5, mas não diz que a 7.1 fica `in-progress` por isso, ao contrário do que AD-21 faz com a autenticação. Um aceitador pode fechar a story com a AC parcial.

**N8 — low. Conflito de remap × 7.1.**
A seção Conflitos diz que "stories consumidoras de remap não começam", mas a 7.1 (critério 4) é consumidora de remap e já começou. A leitura pretendida, "repassa `[]` e informa indisponibilidade", está na mesma linha, mas vale dizer explicitamente que a 7.1 segue com `[]` e que o critério 4 fica parcial até a emenda.

---

## Abertos ou parciais (resumo)

- C2/F-5: classificação de endereço sem gancho definido (tabela total): **PARTIAL, high**
- N1: escritor de endereço e executor de efeitos sem gancho em AD-18: **NEW, high**
- N3: listener síncrono transforma seleção bem-sucedida em `superseded`: **NEW, high**
- F-17: conteúdo dos headers, layout da cópia, dependência do build no Cesium: **PARTIAL, medium**
- H3: `hydrateUrl` sintético não proibido; toggle de Camada durável não declarado: **PARTIAL, medium**
- B6: ordem de `advanceSnapshot` só garantida na `LocalSearch`: **PARTIAL, medium**
- N2: retorno, erro e `dispose` de um `dispatch` enfileirado: **NEW, medium**
- N4: "a comparação confirma" falso depois de hidratação não canônica: **NEW, medium**
- N5: `INTENT_FIELDS` não exportado: **NEW, medium**
- N6: escopo do descarte não cobre leitor/view: **NEW, medium**
- N7: AC-2 da 7.1 (MERCADOS) sem consequência de aceitação: **NEW, medium**
- N8: linha de remap × 7.1: **NEW, low**
