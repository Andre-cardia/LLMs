---
reviewer: adversarial_seams_epic_7
date: 2026-10-14
target: ../ARCHITECTURE-SPINE.md
target_sha256: 4ad52e88770b51b19a3947fccfc4a78c213b0470455d881ac47828d5bf48375d
verdict: fail
critical: 3
high: 4
medium: 3
low: 2
---

# Revisão adversarial de costuras — Epic 7 spine (AD-18 a AD-24)

## Veredito

**FAIL — 3 holes críticos.** Encontrei 12 pares de unidades que obedecem literalmente a TODAS as regras de AD-18 a AD-24 (e aos invariantes herdados AD-1, AD-2, AD-3, AD-9, AD-10, AD-15, AD-16) e ainda assim constroem artefatos incompatíveis entre si. Os três críticos não são "gates em aberto", porque o spine os declara explicitamente fechados: AD-22 declara que o contrato do manifesto "precisa carregar esse campo ... antes das stories consumidoras" sem dizer qual é a forma do campo; AD-19 enumera uma classificação de intents que cobre 6 dos 12 tipos de intent existentes em `src/contracts/exploration.mjs:113`; e AD-23 prescreve `LocalSearch.cancel()` como o mecanismo de descarte quando `cancel()` demonstravelmente não impede publicação após o descarte.

O método é sempre o mesmo: duas unidades, implementadas uma ao lado da outra por implementadores que leram apenas este spine e o spine pai, cada uma com uma leitura defensável da mesma regra, produzindo artefatos que não se compõem. Nenhum dos forks abaixo exige que um implementador viole uma regra escrita.

## Escopo e método

Ataque às regras AD-18 a AD-24 do spine do Epic 7, confrontadas com o código executável em `src/contracts/`, `src/domain/` e `src/application/`, mais os critérios de aceitação das Stories 7.1, 7.2, 7.3 e 4.2 em `_bmad-output/planning-artifacts/epics.md`.

Unidades imaginadas (um implementador cada, sem comunicação entre eles, sem acesso a nada além do spine do Epic 7 + spine pai `architecture-LLMs-2026-10-10`):

- **U1** — fatia de navegador da Story 7.1: diálogo de Busca + escritor de endereço (`epics.md:1619`).
- **U2** — Story 7.2: Busca com fontes e navegação tipada (`epics.md:1645`).
- **U3** — Story 7.3: Histórico privado (`epics.md:1679`).
- **U4** — Story 4.2: renderer Cesium do Globo, consumidor do mesmo store por AD-18 e do mesmo endereço por AD-19 (`epics.md:1159`).

Probes executados (sem alterar código ou spine; este arquivo é a única escrita):

- `parseExplorationUrl` com `?view=3d`, `?view=3D`, `?view=sat`, `?view=SAT`, `?tab=globo`, `?tab=modelos`, `?mode=claro`, `?select=`, `?pov=`, `?layers=`.
- `assertManifest` com e sem um campo `companyRemaps` adicionado.
- `LocalSearch.search()` com `frame()` pendente, seguido de `cancel()` e resolução tardia, contra dois wrappers de store diferentes.

---

## CRÍTICO 1 — `companyRemaps` no manifesto não tem forma especificada; o manifesto atual rejeita o campo

**Severidade: critical.** Bloqueia tanto 7.1 quanto 4.2 e produz dois contratos de manifesto incompatíveis.

### As duas unidades

- **U1** (Story 7.1, diálogo de Busca) precisa repassar remaps a `advanceSnapshot` ao confirmar um resultado, porque é o caminho que `LocalSearch.select` já exercita em `src/application/local-search.mjs:61-62`.
- **U4** (Story 4.2, renderer) também consome `advanceSnapshot` ao avançar a revisão da cena, e AD-22 vincula "FR-37, FR-38; contrato de manifesto; `advanceSnapshot`" — isto é, as duas.

### Como as duas obedecem à letra de AD-22

AD-22 (`ARCHITECTURE-SPINE.md:96`) diz: "o Publicador declara os `companyRemaps` no manifesto da revisão; eles atravessam o frame de `LocalNewsView` e o consumidor apenas os repassa a `advanceSnapshot`". Nenhuma das três partes dessa cadeia tem forma declarada:

1. **No manifesto:** `assertManifest` em `src/contracts/snapshot.mjs:7-17` exige exatamente os campos `['schemaVersion','revision','curationRevision','publishedAt','slices']`, e `object()` em `src/contracts/primitives.mjs:8` falha quando `keys.length !== fields.length`. Probe: adicionar `companyRemaps: []` a um manifesto válido resulta em `Manifest: campos incompatíveis`. **O campo que AD-22 manda o Publicador declarar é hoje rejeitado pelo contrato.** AD-22 reconhece isso ("o contrato do manifesto precisa carregar esse campo") mas não diz qual forma carregar, nem em que nível (raiz do manifesto? por slice? sob `slices.catalog`?).
2. **No frame:** `LocalNewsView.#frame()` em `src/application/local-news-view.mjs:38` devolve exatamente `freeze({data,now,hiddenNewsIds,dataRevision,feedbackRevision})`. Não há `companyRemaps`. AD-22 diz que eles "atravessam o frame" sem dizer sob que chave.
3. **No intent:** apenas aqui a forma existe — `src/contracts/exploration.mjs:138-141` exige `[{fromCompanyId, toCompanyId}]`, pares de strings, e `src/domain/exploration-state.mjs:110-114` rejeita duplicatas e remaps inválidos.

Como só o terceiro elo é especificado, cada implementador infere os dois primeiros.

### A incompatibilidade

**U1 escolhe a forma de pares, espelhando o intent** (leitura razoável: "o consumidor apenas os repassa", logo a forma do frame deve ser igual à forma do intent):

```
manifest.companyRemaps = [{fromCompanyId:'company-1', toCompanyId:'merged'}]
frame.companyRemaps     = manifest.companyRemaps        // repasse literal
dispatch({type:'advanceSnapshot', ..., companyRemaps: frame.companyRemaps})
```

**U4 escolhe a forma de mapa, espelhando como o domínio efetivamente usa os remaps** (leitura igualmente razoável: `src/domain/exploration-state.mjs:110` converte imediatamente para `new Map(...)`, e um objeto é a representação natural num manifesto JSON, sem duplicatas por construção):

```
manifest.companyRemaps = {'company-1': 'merged'}
frame.companyRemaps     = manifest.companyRemaps
dispatch({type:'advanceSnapshot', ..., companyRemaps: frame.companyRemaps})
```

A segunda forma estoura em `src/contracts/exploration.mjs:138`, porque `list()` em `primitives.mjs:43` exige `Array.isArray`. Mas o estouro acontece **em runtime, no consumidor**, não no Publicador: cada unidade fez fixtures válidas do seu lado conforme AD-16 e AD-22 ("com fixtures válidas e inválidas nos dois lados"), e as duas passam seus próprios testes. O Publicador é um só; ele emite uma das duas formas; a outra unidade quebra na primeira revisão que carrega um remap não vazio — ou seja, exatamente no caso que AD-22 existe para proteger (quarto critério da Story 7.1, `epics.md:1637`: "usa substituição canônica explícita").

Pior: há um terceiro fork silencioso. `LocalSearch.select` em `local-search.mjs:62` hoje passa `companyRemaps:[]` **hard-coded**. Um implementador de U1 que leia AD-22 como já satisfeita por esse código entrega uma Busca que nunca aplica remap algum, enquanto U4 aplica. Duas superfícies, mesma revisão, Empresas reconciliadas diferentemente: U4 mostra `merged`, U1 mostra `company-unavailable` via `exploration-state.mjs:126`. Isso é precisamente o que AD-22 lista em **Prevents** ("dois consumidores derivarem remaps diferentes da mesma revisão") e a regra escrita não o impede.

### Fechar

Novo AD ou endurecimento de AD-22 que fixe, executavelmente: (a) `companyRemaps` na raiz do manifesto como `list` de `{fromCompanyId,toCompanyId}`, acrescentado a `assertManifest` em `src/contracts/snapshot.mjs:8` com o mesmo validador já usado em `exploration.mjs:138-141`, reutilizado por import e não reescrito; (b) `LocalNewsView` incluindo `companyRemaps` no frame em `local-news-view.mjs:38` sob esse nome exato; (c) remoção do `companyRemaps:[]` literal em `local-search.mjs:62` em favor de `frame.companyRemaps`; (d) `advanceSnapshot` emitido por qualquer consumidor sem os remaps do frame é um defeito, não uma escolha.

---

## CRÍTICO 2 — AD-19 classifica 6 de 12 intents; os outros 6 ficam ao critério de cada implementador

**Severidade: critical.** Produz históricos de navegador divergentes entre a Busca e o Globo, no mesmo app.

### As duas unidades

- **U1** (Story 7.1) é dona do diálogo de Busca e dos intents `openNews`, `escape`, `panel`, `hydrateUrl`.
- **U4** (Story 4.2) encaminha "intents tipados ao store" por AD-17 e `epics.md:1177`, e é dona de `camera` e `callback`.

### Como as duas obedecem à letra de AD-19

AD-19 (`ARCHITECTURE-SPINE.md:78`) classifica exaustivamente apenas: "`company`, `tab`, `navigate` e seleção de resultado de Busca usam `pushState`; `base`, `layers` e `preference` usam `replaceState`".

A lista executável de intents em `src/contracts/exploration.mjs:113` tem doze tipos: `hydrateUrl`, `preference`, `tab`, `base`, `company`, `panel`, `openNews`, `camera`, `callback`, `escape`, `advanceSnapshot`, `navigate`.

Cruzando: `tab`, `base`, `company`, `navigate`, `preference` estão classificados. `layers` **não é um intent** — é um campo de `preference` (`exploration.mjs:9`, `PREFERENCE_KEYS` inclui `layers`) e também uma chave de `sessionOverrides` (`exploration.mjs:187`), o que gera um subfork próprio (ver HIGH 3). Ficam **sem classificação**: `panel`, `openNews`, `escape`, `camera`, `callback`, `advanceSnapshot`, `hydrateUrl`.

Isso não é inocente, porque quatro deles mudam o estado que `explorationQuery` serializa. `explorationQuery` em `src/domain/exploration-url.mjs:24-25` emite sempre `layers`, `base`, `tab`, `company` a partir de `effectiveState`. E:

- `openNews` → via `navigate`-like reconciliação não muda as quatro chaves, mas `navigate` com `target.type === 'news'` muda `companyId` e `tab` (`exploration-state.mjs:146`) — e `navigate` ESTÁ classificado como push. Já `openNews` puro não muda nenhuma das quatro.
- `escape` em `exploration-state.mjs:102-107` pode apagar `terminal`, que não está na URL. Nenhuma das quatro chaves muda.
- `camera` em `exploration-state.mjs:91-95` não muda nenhuma das quatro.
- `advanceSnapshot` em `exploration-state.mjs:120-126` **muda `companyId`** quando um remap se aplica ou quando a Empresa desaparece: `s.sessionState.companyId = reconcile(...)`. O endereço serializado muda sem qualquer ação do usuário.
- `hydrateUrl` em `exploration-state.mjs:73` substitui `sessionOverrides` por inteiro, o que muda `effectiveState` e logo `explorationQuery`.

### A incompatibilidade

**U1 adota "classificado explicitamente ou não escreve"** — leitura literal e conservadora: AD-19 diz que o shell "é o único escritor do endereço" e lista quais intents escrevem; o que não está listado não escreve.

**U4 adota "todo intent que muda `explorationQuery` escreve, e o default é `replaceState`"** — leitura igualmente defensável: AD-19 existe para evitar que o endereço divirja do estado, e sua lista de **Prevents** ataca "histórico inflado", o que torna `replaceState` o default seguro.

Resultado observável, mesmo app, mesmo store (AD-18 garante um só store, o que aqui *piora* o conflito em vez de resolvê-lo):

| Ação | U1 escreve | U4 escreve |
| --- | --- | --- |
| `advanceSnapshot` com remap `company-1 → merged` | nada (URL continua `company=company-1`, agora mentindo) | `replaceState('?...&company=merged')` |
| `camera` em uma Empresa | nada | `replaceState` (idempotente, mas uma entrada reescrita) |
| `escape` fechando Terminal | nada | nada (nenhuma das quatro chaves mudou) |
| `panel=markets` | nada | nada |

A linha de `advanceSnapshot` é o dano real: sob U1, o endereço fica permanentemente dessincronizado do estado após qualquer remap, e um `popstate` subsequente despacha `hydrateUrl` com `company=company-1`, que `parseExplorationUrl` em `exploration-url.mjs:18` sanea para `companyId:null` (o ID não está mais em `index.companyIds`), **perdendo a Empresa reconciliada que AD-22 trabalhou para preservar**. Dois ADs se anulam através do hole de classificação de AD-19.

E as duas unidades estão no mesmo app: o usuário que busca (U1) e depois gira o Globo (U4) obtém um histórico cuja profundidade depende de qual superfície tocou o store por último. "Um único Back expulsar Andre do app", em **Prevents** de AD-19, volta por outra porta.

### Fechar

AD-19 precisa ser uma tabela total sobre os doze tipos de `INTENT_FIELDS` (`exploration.mjs:113`), não uma lista parcial — com uma categoria explícita `sem escrita` e a regra de que `advanceSnapshot` que altere `effectiveState` serializável usa `replaceState` (nunca push: não é navegação do usuário). Acrescentar um teste de contrato que falhe quando um novo tipo de intent entrar em `INTENT_FIELDS` sem classificação correspondente.

---

## CRÍTICO 3 — AD-23 prescreve `cancel()` como descarte, e `cancel()` não impede publicação pós-descarte

**Severidade: critical.** A regra prescreve um mecanismo insuficiente, e o teste que ela exige passa nas duas implementações incompatíveis.

### As duas unidades

- **U1** (Story 7.1) instancia `LocalSearch` para o diálogo de Busca.
- **U2** (Story 7.2) instancia um segundo `LocalSearch` (ou o reusa) para a pesquisa com fontes, e precisa descartar ao perder permissão — `epics.md:1673` exige "mensagens não autorizadas não ficam acessíveis".

### Como as duas obedecem à letra de AD-23

AD-23 (`ARCHITECTURE-SPINE.md:102`): "`subscribe` devolve função de `unsubscribe`. Ao trocar instância de store ou perder permissão, o shell cancela as subscriptions, chama `LocalSearch.cancel()` e abandona operações em voo."

Ambas chamam exatamente isso. Mas leia `cancel()` em `src/application/local-search.mjs:33-36`:

```js
cancel() {
  this.#generation = null;
  return this.#publish(this.#current.query, 'idle');
}
```

`cancel()` faz duas coisas: zera a geração e **publica**. Não aborta o `await this.#view.frame()` já em voo em `local-search.mjs:42` — não há `AbortController` em nenhum lugar de `LocalSearch` nem de `LocalNewsView`. A promise continua viva e, quando resolve, a continuação roda.

O que a continuação faz depende de `#active(operation)` em `local-search.mjs:25-27`, que chama `#intentToken()`, que chama `requireSynchronous(this.#store.getState())` em `local-search.mjs:17`. **Ou seja: o comportamento pós-descarte de `LocalSearch` é determinado pelo wrapper de store que o shell injetou** — e AD-18 não diz nada sobre o que `getState()` faz depois do descarte.

### A incompatibilidade

Probe executado (`/tmp/probe.mjs`, duas variantes de wrapper, `frame()` pendente, `cancel()`, depois resolução):

- **Wrapper A de U1** — "store descartado lança": `getState()` lança `STORE_DISPOSED` após o descarte. Resultado: `search()` resolve `{status:'superseded'}`. O `throw` de dentro de `#active` é capturado pelo `catch` de `local-search.mjs:47`, que então chama `#active` **outra vez** em `local-search.mjs:48`, que lança **outra vez** — e essa segunda exceção escapa do `catch`. Na prática o probe mostrou `RESOLVED {"status":"superseded"}` porque `#superseded` é alcançado pelo caminho de `generation === null`, mas a sequência depende de qual linha lança primeiro; com `getState()` lançando, `#publish(query,'unavailable')` em `local-search.mjs:50` nunca roda, e com `cancel()` já tendo publicado `idle`, o estado final é `idle`. Aceitável por acidente, não por desenho.
- **Wrapper B de U2** — "store descartado devolve o último estado congelado" (leitura perfeitamente compatível com AD-18, que exige `getState` "estritamente síncrono" e nada diz sobre descarte; devolver o último estado é mais seguro que lançar, do ponto de vista de um renderer que ainda está desmontando): `getState()` devolve `{intentToken: n}`. Resultado do probe: `RESOLVED {"status":"superseded"}` — mas por um caminho diferente, e **somente porque `cancel()` zerou `#generation`**. Se o shell de U2 fizer o descarte na ordem inversa que AD-23 lista — "cancela as subscriptions, chama `LocalSearch.cancel()`" sugere subscriptions primeiro, mas um implementador que leia "abandona operações em voo" como o passo final pode descartar a instância **sem** chamar `cancel()` quando julga que a instância está sendo jogada fora de todo modo — então `#generation` permanece e `#active` devolve `true`, e `local-search.mjs:46` executa `this.#publish(query, 'results', context, results)` **com dados da revisão privada, depois da perda de permissão**.

Esse último caminho é o hole crítico. AD-23 lista em **Prevents** "reabertura por resultado vencido após troca de permissão" e `local-search.mjs:49` comenta "Não expor erro/resultado/cache privado após negação ou leitura inválida" — mas a proteção existente cobre o caso em que `frame()` **rejeita**, não o caso em que `frame()` **resolve** com dados legítimos de antes da revogação. O `select()` é pior ainda: em `local-search.mjs:61` ele faz `this.#store.dispatch(...)` num store que o shell considera descartado, e sob o Wrapper B esse dispatch pode ter efeito.

Pior, o teste que AD-23 exige ("Teste de disposal comprova isolamento entre instâncias antes de fechar a story") **passa nas duas implementações**: isolamento entre instâncias é uma propriedade diferente de supressão de publicação pós-descarte. A regra pede a prova errada.

### Fechar

AD-23 precisa (a) nomear `cancel()` como insuficiente e exigir que o shell trate a instância descartada como inalcançável — descartar a referência, não apenas cancelá-la; ou melhor (b) exigir que `LocalSearch` aceite um sinal de descarte terminal (`dispose()`) que faça `#publish` ser um no-op depois de chamado, de modo que a propriedade seja do módulo e não da disciplina do shell; (c) fixar em AD-18 o contrato de `getState()`/`dispatch()` após o descarte (lança `STORE_DISPOSED`, e `LocalSearch` trata esse código como descarte terminal e não como `unavailable`); (d) trocar o teste exigido por "nenhuma publicação nem dispatch ocorre após o descarte, com `frame()` resolvendo **com sucesso** depois dele".

---

## HIGH 1 — "o shell" não é um proprietário; AD-18/AD-19/AD-21 nomeiam um ator, não um módulo

**Severidade: high.**

### As duas unidades

**U1** (Story 7.1) e **U4** (Story 4.2) são ambas "o shell" — as duas tocam DOM, as duas vivem em `src/ui/` por `ARCHITECTURE-SPINE.md:139`, e nenhuma das duas é apontada como a dona.

### Como as duas obedecem

AD-18 (`:72`) é cirúrgico sobre o store: "um único módulo em `src/application/` possui o wrapper". Esse é o padrão de precisão que o resto do spine não segue. Compare com os três proprietários que ficam sem endereço:

| Entidade | Regra | Proprietário nomeado |
| --- | --- | --- |
| wrapper do store | AD-18 `:72` | **sim** — "um único módulo em `src/application/`" |
| escritor de endereço | AD-19 `:78` | não — "o shell" |
| marcador de procedência de fixture | AD-21 `:90` | não — "a interface exibe" |
| tabela de tradução de alias legado | AD-24 `:108` | parcial — "uma única tabela na borda de entrada" (qual arquivo?) |
| executor de efeitos (`persistPreferences`, `camera`) | AD-18 `:72` | não — "O shell executa" |

`Structural Seed` em `:139` diz apenas `ui/ # shell de navegador (novo): DOM, history, storage, digest, fixtures` — um diretório, não um módulo.

### A incompatibilidade

U1 cria `src/ui/url-writer.mjs` com a classificação de AD-19 e o chama do handler do diálogo de Busca. U4 cria `src/ui/globe/address.mjs` porque o renderer precisa serializar `base` quando a base muda, e AD-19 lhe atribui explicitamente `base` → `replaceState`. **Dois escritores de endereço, exatamente o que AD-19 lista em Prevents** ("dois escritores concorrentes de endereço") — e nenhum dos dois implementadores violou uma palavra escrita, porque "o shell" descreve os dois.

O mesmo fork se repete três vezes:
- **Marcador de procedência:** U1 põe um badge no diálogo de Busca; U4 põe um crédito na cena Cesium; U3 (Histórico) põe um aviso na lista. Três marcadores com três textos e três critérios de visibilidade, e `Consistency Conventions` em `:117` ("Toda superfície alimentada por fixture exibe marcador") literalmente endossa isso — mas AD-21 **Prevents** "interface demonstrativa confundida com dados reais", o que um marcador inconsistente em três lugares não resolve.
- **Executor de efeitos:** U1 executa `persistPreferences` gravando `localStorage['prefs']` como objeto achatado; U4 executa `persistPreferences` gravando por chave (`localStorage['pref:layers']`), porque o efeito em `exploration-state.mjs:80` carrega `patch` e um patch por chave sugere gravação por chave. Dois formatos de persistência no mesmo origin; o que recarregar depois perde preferências.
- **Tabela de alias:** ver HIGH 2.

### Fechar

Nomear o módulo proprietário de cada entidade, com o mesmo rigor de AD-18: `src/ui/address.mjs` (escritor único, dono da classificação de AD-19), `src/ui/provenance.mjs` (marcador único), `src/ui/url-aliases.mjs` ou um módulo de `domain/` (tabela única de AD-24), `src/ui/effects.mjs` (executor único, dono do formato de `persistPreferences`). Acrescentar a `Consistency Conventions` que nenhum outro módulo de `src/ui/` importa `history` ou `localStorage` diretamente.

---

## HIGH 2 — AD-24 manda traduzir aliases legados numa tabela única e aponta como modelo um precedente incoerente

**Severidade: high.**

### As duas unidades

**U1** (Story 7.1, dona da URL por `epics.md:1635`) e **U4** (Story 4.2, dona de `base`/`view` por AD-17).

### Como as duas obedecem

AD-24 (`:108`) lista os aliases legados a traduzir: `tab=globo`, `mode=claro|escuro`, `select=`, `view=3d`, `reader=`, `pov=` — e diz "traduzidos numa única tabela na borda de entrada, **como `parseExplorationUrl` já faz com `view=`**".

Esse precedente apontado é a fonte do fork. Probe sobre `src/domain/exploration-url.mjs:16`:

| URL | `parseExplorationUrl` devolve |
| --- | --- |
| `?view=3d` | `{base:'MAPA'}` |
| `?view=3D` | `{}` |
| `?view=sat` | `{base:'MAPA'}` |
| `?view=SAT` | `{base:'SAT'}` |
| `?tab=globo` | `{tab:'globe'}` |
| `?tab=modelos` | `{tab:'globe'}` |
| `?mode=claro` | `{}` |
| `?select=c1` | `{}` |
| `?pov=1,2,3` | `{}` |

Observe o que o código realmente faz em `exploration-url.mjs:16`: `if (params.has('view') && one('view') !== '3D') overrides.base = base(one('view'))`. Isso é **case-sensitive** e **não é uma tabela** — é uma condição inline que trata `view` como se fosse `base`, mapeando qualquer valor desconhecido para `config.initialBase` via `base()` em `:9`. E `?tab=globo` só "funciona" por acidente: `:17` sanea qualquer `tab` desconhecido para `'globe'`, então `globo`, `modelos` e `noticias` **todos** viram `globe`. Nenhum alias de `tab` está realmente traduzido; a aparência de tradução é um artefato do saneamento.

Dos seis aliases que AD-24 lista, **nenhum** tem tradução implementada hoje: `mode=claro`, `select=`, `reader=`, `pov=` são ignorados; `tab=globo` cai no saneamento; `view=3d` é tratado como uma base inválida e saneado para `MAPA`.

### A incompatibilidade

**U1 lê "única tabela na borda de entrada" + "o vocabulário executável de `src/contracts/` é o único canônico" e estende `parseExplorationUrl`** (é a borda de entrada, é em `domain/`, é o precedente citado). Entrega: `?tab=modelos` → `{tab:'models'}`, `?mode=claro` → `preference mode=light`, `?view=3d` → `{}` (projeção é fixa em 3D por `exploration.mjs:194`, logo `view=3d` é ruído, não uma base).

**U4 lê "traduzidos numa única tabela na borda de **entrada**" como uma tabela no shell**, porque AD-24 **Binds** diz "borda de URL e de eventos do navegador" e `Consistency Conventions` em `:118` diz "alias legado só existe **na borda de entrada**" — e a borda de entrada do navegador é `src/ui/`, já que `domain` "permanece sem conhecimento de navegador" (`:27`). Entrega uma tabela em `src/ui/` que normaliza a query **antes** de chamar `parseExplorationUrl`.

Agora as duas traduções compõem, e compõem errado. Com U4 normalizando `?view=3d` → nada e U1 tendo estendido `parseExplorationUrl` para também tratar `view`, um endereço legado `?view=sat` pode: ser normalizado por U4 para `?base=SAT`, ou chegar cru a `parseExplorationUrl` e virar `{base:'MAPA'}` por `exploration-url.mjs:16` (case-sensitive!). **O mesmo endereço do protótipo publicado abre o Globo em SAT ou em MAPA conforme qual unidade processou a entrada** — "Globo e Busca interpretarem o mesmo endereço de formas diferentes", literalmente a primeira linha de **Prevents** de AD-24.

E há um fork de direção: AD-24 diz "o endereço serializado nunca emite alias legado", o que `explorationQuery` em `exploration-url.mjs:21-27` cumpre. Mas ninguém disse se a tradução é **bidirecional para links externos** — U1, que lê o `Deferred` de `:155` sobre links externos, pode decidir emitir `select=` para compatibilidade com o protótipo; AD-24 proíbe isso na serialização, mas o `Deferred` deixa "a semântica desses casos" para outra story, e um implementador pode ler o `Deferred` como autorizando.

### Fechar

AD-24 deve (a) nomear o arquivo único da tabela e a camada (recomendo `domain/exploration-url.mjs`, mantendo `domain` sem conhecimento de navegador — uma tabela de strings não é DOM); (b) especificar a tabela **termo a termo** com case-insensitivity explícita, incluindo o que acontece com `view=3d`, `reader=`, `pov=` (descartar) versus `tab=globo|modelos|noticias`, `mode=claro|escuro`, `select=` (traduzir); (c) retirar `parseExplorationUrl ... já faz com view=` como modelo, porque o precedente é case-sensitive e conflata `view` com `base`; (d) declarar o saneamento-para-default de `exploration-url.mjs:17` como **distinto** de tradução, com fixtures que provem `?tab=modelos → models` e não `→ globe`.

---

## HIGH 3 — `layers` é classificado por AD-19 como se fosse um intent, e tem dois caminhos de mutação

**Severidade: high.**

### As duas unidades

**U1** (diálogo/URL) e **U4** (legenda de Camadas do Globo, `epics.md:1211`).

### Como as duas obedecem

AD-19 (`:78`) diz "`base`, `layers` e `preference` usam `replaceState`". Mas `layers` não existe em `INTENT_FIELDS` (`exploration.mjs:113`). Ele é:

1. uma chave de `PREFERENCE_KEYS` (`exploration.mjs:9`) — logo mutável por `{type:'preference', field:'layers', value:[...]}`, que em `exploration-state.mjs:77-80` grava `s.preferences`, apaga `sessionOverrides.layers` **e emite `{type:'persistPreferences'}`**;
2. uma chave válida de `sessionOverrides` (`exploration.mjs:187`) — gravada **apenas** por `hydrateUrl` em `exploration-state.mjs:73`, via `parseExplorationUrl` em `exploration-url.mjs:10-13`.

Não existe intent que grave `sessionOverrides.layers` sem hidratar uma URL. Então um toggle de Camada no Globo **tem que** ser `preference`, e **tem que** persistir.

### A incompatibilidade

**U4 implementa o toggle de Camada como `preference`** (único caminho disponível) → `replaceState` por AD-19, e `persistPreferences` por `exploration-state.mjs:80`. Camada ativada no Globo vira preferência durável.

**U1 implementa a hidratação de `?layers=` como override de sessão** (correto, é o que o código faz) e, lendo AD-19 ("`layers` usa `replaceState`") junto com AD-10 herdado (`:51`, "hidratação de URL não dispara persistência"), conclui que `layers` é **estado de sessão** e que um toggle não deve persistir. Para honrar isso sem um intent de sessão, U1 pode despachar `hydrateUrl` com uma URL sintética contendo o novo `layers` — o que **obedece AD-19 à letra** (`replaceState`, sem persistência) e é a única forma de gravar `sessionOverrides.layers`.

Resultado: os dois caminhos divergem em efeito durável **e** em `effectiveState`. Pelo merge em `exploration-state.mjs:17` (`{...preferences, ...sessionState, ...sessionOverrides}`), um override de sessão de `layers` posto por U1 via `hydrateUrl` **mascara permanentemente** toda escrita de preferência de U4, porque `preference` em `:79` só apaga `sessionOverrides[field]` quando o próprio `preference` é despachado — mas U1 reescreve `sessionOverrides` inteiro a cada `hydrateUrl` (`:73`). Toggles de Camada no Globo passam a não ter efeito visível depois que a Busca hidratou uma URL com `layers`, e o usuário vê a legenda marcar uma Camada que a cena não mostra.

Pior, a interleaving é exatamente a que a pergunta de ordenação levanta: um `preference` de `layers` emite `persistPreferences` **e** classifica como `replaceState`. Se U4 executa os efeitos antes de escrever o endereço e U1 escreve o endereço antes de executar os efeitos, uma falha de `localStorage` (quota, modo privado) deixa um endereço já reescrito que não corresponde ao estado persistido. **AD-18 diz "`dispatch` devolve os efeitos ao chamador" e AD-19 diz "o shell escreve o endereço", e nada ordena os dois.** Ver MEDIUM 1.

### Fechar

Decidir e escrever se `layers` é preferência durável ou override de sessão, e dar-lhe um caminho de mutação único e nomeado. Se for sessão, acrescentar um intent `layers` a `INTENT_FIELDS` que grave `sessionOverrides` sem persistir; se for preferência, retirar `layers` de `sessionOverrides` em `exploration.mjs:187` e dizer em AD-19 que a classificação de `layers` significa "o intent `preference` cujo `field` é `layers`". Proibir explicitamente `hydrateUrl` sintético como mecanismo de mutação (ele é reservado a `popstate` por AD-19).

---

## HIGH 4 — AD-21 veda Histórico privado, e a Story 7.3 é inteiramente Histórico privado

**Severidade: high.** Conflito direto entre uma regra e um consumidor que o spine declara vinculado.

### As duas unidades

**U3** (Story 7.3, `epics.md:1679`) e **U2** (Story 7.2, que cria "os registros mínimos de conversa/mensagem", `epics.md:1651`).

### Como as duas obedecem

AD-21 (`:90`) **Binds:** "todo consumidor de navegador dos Epics 4 e 7 enquanto Q12 estiver aberto", e a **Rule** diz: "É vedado servir Cadastro real, snapshot curado, **Histórico** ou qualquer JSON privado por esse caminho enquanto a hospedagem não tiver autorização server-side."

Q12 está aberto (`:154`). Logo, para qualquer consumidor de navegador do Epic 7, Histórico é vedado. Mas a Story 7.3 **é** "Retomar e excluir o Histórico privado", e seu AC exige "recupera perguntas/respostas e referências originais com suas datas" (`epics.md:1683`). O `Deferred` em `:158` diz que 7.2/7.3 estão "fora deste escopo" — mas **Binds** de AD-21 diz "todo consumidor ... dos Epics 4 e 7", sem exceção, e o front-matter do spine declara `scope` cobrindo a fronteira de navegador do Epic 7.

### A incompatibilidade

**U3 lê o `Deferred` de `:158` como o controlador** ("Story 7.2 e 7.3: ... Histórico privado seguem sob Q1/Q7 e fora deste escopo") e conclui que AD-21 não a vincula; constrói o Histórico com `localStorage` no navegador, porque o shell é "único lugar autorizado a tocar ... `localStorage`" (`:27`) e Q7 define "local de armazenamento" (`epics.md:1681`).

**U2 lê o **Binds** de AD-21 como o controlador** e conclui que nenhum registro de conversa pode existir no navegador enquanto Q12 estiver aberto; constrói os registros mínimos apenas em memória, descartados ao recarregar.

Resultado: U3 entrega uma lista de Histórico durável que U2 nunca popula, ou U2 entrega registros em memória que U3 persiste por baixo, criando exatamente o "dado privado exposto como asset público contra AD-9" que AD-21 **Prevents**. Um dos dois implementadores vai gravar conversas privadas em `localStorage` num app servido por Amplify estático sem authz, e a regra que deveria impedi-lo também contém a cláusula que o dispensa.

### Fechar

Resolver a contradição explicitamente: ou AD-21 ganha uma exceção nomeada ("Histórico de 7.2/7.3 fica fora do navegador até Q12; nenhum registro de conversa toca `localStorage`"), ou o `Deferred` de `:158` deixa de dizer "fora deste escopo" e passa a dizer "vinculados por AD-21, que os veda até Q12". As duas leituras não podem permanecer disponíveis.

---

## MEDIUM 1 — ordem entre execução de efeitos e escrita do endereço não é especificada

**Severidade: medium.** (Promovido de low porque toca o caso concreto levantado: `persistPreferences` + `replaceState` para o mesmo intent.)

### As duas unidades

**U1** (diálogo de Busca, muda `preference mode`) e **U4** (legenda do Globo, muda `preference layers`).

### Como as duas obedecem

AD-18 (`:72`): "`dispatch` devolve os efeitos ao chamador e nunca os executa ... O shell executa `persistPreferences` e `camera`." AD-19 (`:78`): "o shell é o único escritor do endereço ... `preference` usa `replaceState`." `Consistency Conventions` (`:115`): "`dispatch` devolve efeitos; o shell os executa."

Nenhuma das três ordena as duas ações. Um `{type:'preference', field:'mode', value:'light'}` produz, num único `dispatch`: um novo estado, um efeito `persistPreferences` (`exploration-state.mjs:80`) e uma obrigação de `replaceState` (AD-19).

### A incompatibilidade

**U1 escolhe `dispatch` → `replaceState` → efeitos** (o endereço reflete o estado imediatamente; a persistência é best-effort).
**U4 escolhe `dispatch` → efeitos → `replaceState`** (só anuncia no endereço o que foi duravelmente gravado).

Divergência observável quando `localStorage` falha (modo privado, quota): sob U1 o endereço já mudou e a preferência não persistiu — recarregar restaura a preferência antiga mas a URL diz outra coisa, e `hydrateUrl` em `exploration-state.mjs:73` grava `sessionOverrides`, de modo que o estado efetivo passa a depender da URL e não da preferência, divergindo entre as duas superfícies. Sob U4, a escrita de endereço é abortada e o diálogo mostra um estado que a URL não contém.

Pior no caso de `camera`: um `{type:'camera'}` produz o efeito `camera` (`exploration-state.mjs:95`) que U4 executa como um voo de câmera assíncrono. Se U4 escreve o endereço antes, um `popstate` durante o voo despacha `hydrateUrl`, que em `exploration-state.mjs:74` faz `s.cameraOperation = null` — e o `callback` que chega depois é descartado por `exploration-state.mjs:57` (`intent.token !== token`). A câmera fica parada no meio do voo sem nenhum estado que registre isso. AD-19 diz que "o escritor permanece silencioso durante o tratamento" de `popstate`, mas não diz que o **executor de efeitos** fica silencioso, nem o que acontece com efeitos em voo quando `hydrateUrl` os anula.

### Fechar

Fixar em AD-18 ou AD-19 a ordem canônica — recomendo `dispatch` → notificar subscribers → escrever endereço → executar efeitos, com a regra de que falha de efeito não reverte o endereço (porque o reducer já é o escritor semântico por AD-10) e é reportada como aviso. E declarar que `hydrateUrl` anulando `cameraOperation` obriga o shell a cancelar o voo em curso.

---

## MEDIUM 2 — `subscribe` existe em AD-18/AD-23 e não existe no store que o código exercita

**Severidade: medium.**

AD-18 (`:72`) exige "`getState`, `dispatch` e `subscribe` estritamente síncronos". AD-23 (`:102`) exige "`subscribe` devolve função de `unsubscribe`". Mas o store que `LocalSearch` consome tem apenas `getState`/`dispatch` (`local-search.mjs:17,61`), e o único store existente no repositório é o shim de teste em `tests/search.test.mjs:17-23`, que **não tem `subscribe`**.

Fork: **U1** implementa `subscribe(listener)` chamando o listener **imediatamente** com o estado atual (padrão comum, conveniente para montar UI); **U4** implementa `subscribe` sem chamada inicial (o renderer já leu `getState()` na montagem). Dois consumidores do mesmo wrapper único de AD-18 — e AD-18 diz que há **um só** wrapper, logo um dos dois está errado, mas nada diz qual.

A chamada inicial não é cosmética: `local-search.mjs:64` comenta "Uma subscription síncrona pode ter emitido nova intenção durante o dispatch", e `#active` em `:26` compara `operation.intentToken === this.#intentToken()`. Uma notificação inicial síncrona durante a montagem, enquanto um `select()` está em voo, incrementa nada — mas um listener que reaja despachando (U4 ajustando a câmera na montagem) incrementa `intentToken` e **invalida silenciosamente a seleção de Busca em voo**. AD-18 **Prevents** exatamente isso ("handler de efeito despachar reentrantemente e corromper a sequência de `intentToken`") mas só proíbe reentrância **durante** `dispatch`, não durante `subscribe`.

**Fechar:** especificar a assinatura de `subscribe` (com ou sem emissão inicial — recomendo sem), proibir dispatch de dentro de um listener, e acrescentar `subscribe` ao wrapper real com fixtures nos dois lados por AD-16.

---

## MEDIUM 3 — AD-20 injeta `digest` em `SnapshotReader`, e o caminho de dados de AD-21 não usa `SnapshotReader`

**Severidade: medium.**

AD-20 (`:84`): "o shell injeta um digest Web Crypto ... na porta `digest` que `SnapshotReader` já aguarda". AD-21 (`:90`): "o shell injeta `readSnapshot`, `readFeedback`, `resolveAlias` e `clock` a partir de fixtures sintéticas empacotadas".

Essas são duas composições diferentes. `SnapshotReader` (`src/application/snapshot-reader.mjs:6`) recebe `{readManifest, readSlice, digest}` e verifica digests em `:14`. `LocalNewsView` (`local-news-view.mjs:22`) recebe `{readSnapshot, readFeedback, resolveAlias, clock}` e **não verifica digest nenhum**. Os testes mostram as duas montagens coexistindo: `tests/search.test.mjs:29` injeta `readSnapshot` direto da fixture (sem `SnapshotReader`), enquanto `tests/news.test.mjs:28` injeta `readSnapshot: async()=>(await w.reader.refresh()).snapshot` (com).

Fork: **U1** segue AD-21 à letra e injeta `readSnapshot` lendo a fixture empacotada diretamente — nenhum digest é verificado, logo AD-20 é vacuamente satisfeito (não há `SnapshotReader`, logo não há porta `digest` a injetar). **U4** segue AD-20 à letra, monta `SnapshotReader` com `crypto.subtle.digest` e o encadeia em `readSnapshot`.

Incompatibilidade: U1 aceita uma fixture cujo manifesto não tem digests coerentes; U4 rejeita a mesma fixture com `SNAPSHOT_DIGEST_INVALID` (`snapshot-reader.mjs:14`). As fixtures empacotadas que AD-21 manda usar servem a uma unidade e quebram a outra, e AD-20 **Prevents** "consumidor reimplementar verificação de digest e divergir da checagem de integridade do manifesto" — aqui a divergência é entre verificar e não verificar.

Também: `crypto.subtle.digest` devolve `ArrayBuffer`; `snapshot-reader.mjs:14` compara `await this.#digest(bytes) !== manifest.slices[slice].digest` contra o hex de `/^[a-f0-9]{64}$/` (`snapshot.mjs:13`). A porta exige **hex lowercase string**, e AD-20 não diz isso. Dois implementadores produzem hex e base64, e o segundo falha todo digest silenciosamente como `kept-last-good` (`snapshot-reader.mjs:23`).

**Fechar:** AD-20/AD-21 devem dizer se o caminho de fixture atravessa `SnapshotReader` (recomendo sim, para que o caminho de produção seja o mesmo) e fixar a forma de retorno da porta `digest` como string hex lowercase de 64 caracteres, com fixture de contrato.

---

## LOW 1 — `escape` sem classificação cria um fork de prioridade entre superfícies

**Severidade: low.** (Gated por Q3, mas o estado é compartilhado.)

`escape` em `exploration-state.mjs:102-107` tem uma cascata fixa: Leitor digitando → Leitor → painel → Terminal digitando → Terminal. O `Deferred` em `:156` manda `Esc` para as stories de UI. Mas o diálogo de Busca de U1 é uma superfície **nova** que a cascata do domínio não conhece, e `epics.md:1633` exige "Esc segue a prioridade".

Fork: U1 faz `Esc` fechar o diálogo **sem** despachar `escape` (o diálogo não é estado do store); U4 faz `Esc` despachar `escape`. Com o diálogo aberto sobre o Globo, `Esc` fecha o diálogo (U1) ou desliga o Terminal por baixo (U4), ou ambos. AD-19 não classifica `escape`, então nenhum dos dois escreve o endereço — consistente por acidente.

**Fechar:** declarar que o diálogo de Busca é estado de shell (não de store) e que `Esc` com o diálogo aberto não despacha `escape`; ou acrescentar o diálogo à cascata do domínio. Qualquer das duas, escrita.

---

## LOW 2 — `Deferred` CR-02/CR-08 autoriza duas semânticas para `company=` ausente

**Severidade: low.**

`:155` diz que "`explorationQuery` sempre emite as quatro chaves, então toda URL produzida pelo sistema carrega `company` e firma override" e que a ambiguidade "atinge apenas endereços legados ou editados à mão", deixando a semântica "para a story que introduzir links externos".

Mas U4 (Story 4.2) **é** um consumidor de URL por AD-19 **Binds** e pode receber um endereço do protótipo publicado — que usa `select=`, não `company=` (AD-24 `:108`). Probe: `?select=c1` devolve `{}`, logo nenhum override de `companyId`; `?company=` devolve `{companyId:null}`, logo um override **explícito** para nenhuma Empresa. Essas são semânticas opostas para a mesma intenção do usuário, e um endereço legado traduzido por U4 (que converte `select=` → `company=`) passa a firmar um override que U1 (que ignora `select=`) não firma.

**Fechar:** decidir agora, numa linha, o que `company` ausente significa (sem override) versus `company=` vazio (override para nenhuma), e exigir que a tabela de AD-24 traduza `select=` para `company=` preservando essa distinção.

---

## Resumo

| # | Hole | Unidades | Sev |
| --- | --- | --- | --- |
| C1 | Forma de `companyRemaps` não especificada no manifesto nem no frame; `assertManifest` rejeita o campo | 7.1 vs 4.2 | critical |
| C2 | AD-19 classifica 6 de 12 intents; `advanceSnapshot`/`hydrateUrl` mudam a URL sem regra | 7.1 vs 4.2 | critical |
| C3 | `cancel()` não impede publicação nem dispatch pós-descarte; o teste exigido não detecta | 7.1 vs 7.2 | critical |
| H1 | "o shell" não nomeia proprietário: dois escritores de endereço, três marcadores, dois formatos de `persistPreferences` | 7.1 vs 4.2 | high |
| H2 | Tabela de alias de AD-24 aponta um precedente case-sensitive e inexistente; tradução dupla | 7.1 vs 4.2 | high |
| H3 | `layers` tem dois caminhos de mutação; override de sessão mascara preferência | 7.1 vs 4.2 | high |
| H4 | AD-21 veda Histórico; Story 7.3 é Histórico; o `Deferred` dispensa | 7.2 vs 7.3 | high |
| M1 | Ordem entre efeitos e escrita de endereço não especificada | 7.1 vs 4.2 | medium |
| M2 | `subscribe` especificado em AD-18/AD-23, ausente do código; emissão inicial indefinida | 7.1 vs 4.2 | medium |
| M3 | AD-20 (digest via `SnapshotReader`) e AD-21 (fixtures via `readSnapshot`) são composições distintas | 7.1 vs 4.2 | medium |
| L1 | `escape` e o diálogo de Busca: prioridade não escrita | 7.1 vs 4.2 | low |
| L2 | `company` ausente vs `company=` vazio: duas semânticas autorizadas pelo `Deferred` | 7.1 vs 4.2 | low |

## Recomendação

Não abrir as stories consumidoras antes de fechar C1, C2 e C3. C1 e C2 exigem mudança em `src/contracts/` (manifesto com `companyRemaps`; classificação total de intents com teste de exaustividade sobre `INTENT_FIELDS`), o que AD-16 coloca sob autor único e AD-22 já declara pré-requisito. C3 exige decidir se a propriedade "nada publica após o descarte" pertence a `LocalSearch` (recomendado, via `dispose()`) ou à disciplina do shell (frágil, porque AD-23 nomeia `cancel()` e `cancel()` não basta). H1 é a correção de maior alcance por menor custo: nomear cinco módulos proprietários fecha quatro forks de uma vez.

Checagem documental e por probe local; não executei a suíte de testes nem alterei spine, contratos ou código. Este arquivo é a única escrita.
