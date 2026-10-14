# Revisão adversária — emendas de 14/10 ao AD-2 e ao AD-9

- **Data:** 2026-10-14
- **Lente:** adversarial (bmad-review), focada em *pares de unidades um nível abaixo* que obedecem a todo AD ao pé da letra e mesmo assim se constroem de forma incompatível.
- **Conteúdo revisado (docs + código):**
  - Pai: [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md) (AD-2, AD-9, Structural Seed, Q2), [contracts.md](../contracts.md) §Leitura e publicação, [.memlog.md](../.memlog.md) (entradas de 14/10).
  - Filho: [Epic 7 ARCHITECTURE-SPINE.md](../../architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md) (AD-18 a AD-25).
  - Código: [snapshot.mjs](../../../../../src/contracts/snapshot.mjs), [exploration.mjs](../../../../../src/contracts/exploration.mjs#L113-L143), [exploration-state.mjs](../../../../../src/domain/exploration-state.mjs#L108-L139), [memory-snapshots.mjs](../../../../../src/adapters/memory-snapshots.mjs), [snapshot-reader.mjs](../../../../../src/application/snapshot-reader.mjs), [local-search.mjs](../../../../../src/application/local-search.mjs), [local-news-view.mjs](../../../../../src/application/local-news-view.mjs), [scripts/build-ui-preview.mjs](../../../../../scripts/build-ui-preview.mjs), `amplify.yml`, `customHttp.yml`.
- **Nenhum arquivo além deste relatório foi editado.**

## Veredito: **FAIL**

As emendas fixam formato (manifesto v2) e topologia (Amplify → Cognito → API Gateway JWT → Lambda → S3), mas deixam abertas exatamente as costuras que duas stories independentes precisam combinar. Pelo menos três pares produzem falha de execução, não só divergência de estilo, quando cada lado segue o texto literal:

1. a CSP do AD-25 (`default-src 'self'`) bloqueia toda chamada à API e ao Cognito exigidos pelo AD-9;
2. um manifesto aceito pelo "validador único" do AD-2 faz o reducer atual lançar `INVALID_REMAP`, e o store não avança;
3. a regra do AD-22 (`remapsFrom === snapshotRevision`) descarta merges sempre que o leitor salta uma revisão, e isso é o caso normal de uma aba aberta durante duas Atualizações horárias.

O AD-2 e o AD-9 continuam válidos como direção. O spine não está pronto como substrato de build para as stories do Publicador v2, da API Lambda e do shell autenticado até as correções abaixo entrarem.

---

## Pares incompatíveis (núcleo da revisão)

### Par 1 — Publicador/Domain-Contracts × Busca/Globo do Epic 7: o leitor salta revisões e remaps encadeados se perdem

- **Unidade A (Publicador v2, Domain/Contracts):** segue AD-2 ao pé da letra. `remapsFrom` = revisão esperada do CAS; `companyRemaps` = merges entre `remapsFrom` e a nova revisão. r2 publica `A→B` (remapsFrom r1); r3 publica `B→C` (remapsFrom r2), ou r3 não tem merge (`[]`).
- **Unidade B (consumidor de Busca, AD-22):** o store está em r1, porque a aba ficou aberta e nenhum `advanceSnapshot` ocorreu entre as duas Atualizações. O `SnapshotReader` lê r3 (o ponteiro atual), cujo `remapsFrom` = r2 ≠ r1. A regra manda repassar `[]` e "informar indisponibilidade". O reducer limpa a seleção de `A` com `company-unavailable`.
- **Por que é buraco:** os dois lados cumprem AD-2 e AD-22, e mesmo assim o critério 4 da Story 7.1 (Empresa mesclada é seguida, e não vira indisponível) só funciona quando o leitor vê **todas** as revisões em sequência. Com cadência horária (AD-7) e sessões longas, o salto é o caso comum. O texto também não diz nada sobre:
  - **cadeia na mesma janela:** `A→B` e depois `B→C` antes da mesma publicação. `B` teria de ser `from` (ausente) e `to` (presente) ao mesmo tempo. O validador rejeita, e o Publicador fica bloqueado ou compõe por conta própria (heurística local, contra AD-16);
  - **link antigo:** `?company=A` de um favorito anterior ao merge. `parseExplorationUrl` mapeia para `null` ([exploration-url.mjs:18](../../../../../src/domain/exploration-url.mjs#L18)), e nenhum remap alcança a URL;
  - **ordem:** `revision` é opaca e não há sequência. O consumidor não distingue "saltei duas revisões" de "o ponteiro voltou" (recovery do AD-14).
- **Correção proposta — AD-26 "Remaps componíveis e ordenados":**
  1. O manifesto v2 ganha `sequence` (inteiro estritamente crescente por ambiente). Antes de qualquer v2 real, a mudança cabe na mesma emenda; não há leitor dual.
  2. O Publicador **compõe transitivamente** `companyRemaps` dentro da janela: nenhum `to` aparece como `from`, e `A→B` + `B→C` vira `A→C, B→C`.
  3. Há um endpoint autenticado `GET /api/v1/company-remaps?from=<revision>&to=<revision>` (ou um campo `remapLog` limitado às últimas K revisões) que devolve o remap **composto** entre duas revisões publicadas. O validador e o compositor ficam em `src/contracts/`/`src/domain/`, sob um único dono.
  4. A regra do AD-22 muda de "repasse se `remapsFrom === snapshotRevision`, senão `[]`" para "obtenha o remap composto de `store.snapshotRevision` até `frame.revision`; se a janela exceder a retenção, `[]` + aviso tipado".
  5. Recovery do AD-14 sempre publica uma **revisão nova** (sequence + 1, `remapsFrom` = atual), nunca reaponta para um manifesto antigo.

### Par 2 — Validador único (Domain/Contracts) × validação atual do reducer: manifesto válido, store travado

- **Unidade A (validador único em `src/contracts/`, AD-2):** implementa exatamente as quatro regras escritas: `from` ausente do catálogo novo, `to` presente, `from` único, `from ≠ to`.
- **Unidade B (reducer, [exploration-state.mjs:111-114](../../../../../src/domain/exploration-state.mjs#L111-L114)):** exige também `s.index.companyIds.includes(from)`, ou seja, `from` precisa existir na revisão **do store**. Se não existir, lança `INVALID_REMAP` e aborta o `advanceSnapshot` inteiro (o lote é atômico, como provado em [exploration.test.mjs:79](../../../../../tests/exploration.test.mjs#L79)).
- **Cenário de quebra:** a Empresa `X` foi criada (staged) e mesclada em `Y` antes de qualquer publicação. A janela r1→r2 contém o merge `X→Y`, mas `X` nunca esteve publicada. O validador do AD-2 aceita. O reducer, mesmo com `remapsFrom === snapshotRevision`, lança. Resultado: `LocalSearch.select` cai no `catch` e devolve `unavailable` para **todo** resultado daquela revisão, e o store fica preso em r1 até a próxima publicação sem esse remap.
- **Segundo ponto do mesmo par:** o "validador único que serve ao manifesto e ao intent" não tem entradas suficientes em nenhum dos dois pontos de uso:
  - `assertManifest` só vê o manifesto, sem o catálogo, e não consegue checar presença ou ausência;
  - o Publicador tem o catálogo novo e o de `remapsFrom`;
  - o `SnapshotReader` tem o catálogo novo depois de baixar as slices, mas não o anterior;
  - o reducer tem o índice anterior e o novo.

  Três assinaturas plausíveis, todas "o validador único". Hoje `SnapshotReader.refresh` só chama `assertManifest` + `assertSnapshotData` ([snapshot-reader.mjs:11-17](../../../../../src/application/snapshot-reader.mjs#L11-L17)), e nenhum dos dois verifica `companyRemaps` contra o catálogo.
- **Correção proposta — aperto do AD-2 (Rule):**
  - Fixar a regra completa: `from` **presente no catálogo de `remapsFrom`** (ou explicitamente permitido ausente, com o reducer ignorando a entrada em vez de lançar), `from` ausente no novo, `to` presente no novo, `to` nunca é `from`, `from` único.
  - Fixar **uma função e uma assinatura**: `assertCompanyRemaps(remaps, {previousCompanyIds, nextCompanyIds})` em `src/contracts/snapshot.mjs`, chamada por três pontos nomeados (Publicador antes do CAS; `SnapshotReader` depois das slices, com `previousCompanyIds = null` para validar só o lado novo; reducer com os dois índices). O reducer deixa de ter checagem própria.
  - Fixtures inválidas cobrem "from nunca publicado" e "cadeia na mesma janela".

### Par 3 — Shell de navegador (AD-25, headers) × API Lambda/Cognito (AD-9): a CSP bloqueia o caminho de dados

- **Unidade A (story de build/headers do Epic 7):** aplica literalmente o AD-25: `/app/**` com `Content-Security-Policy: default-src 'self'` em `customHttp.yml`.
- **Unidade B (story do shell autenticado / API):** aplica literalmente o AD-9. O shell faz `fetch` para o endpoint do API Gateway (`https://<id>.execute-api.<região>.amazonaws.com`) e para o domínio do Cognito (`/oauth2/authorize`, `/oauth2/token`).
- **Por que é buraco:** `default-src 'self'` implica `connect-src 'self'`, então toda chamada à API e ao endpoint de token falha no navegador. Os dois lados cumprem seus ADs, e o produto não lê dado nenhum. A escolha alternativa (proxy de rewrite do Amplify `/api/<*>` → API Gateway, tornando a API "same-origin") também é compatível com o texto e muda CORS, Origin e cache de cabo a rabo. Sem decisão, duas stories escolhem caminhos diferentes.
- **Agravante (CORS por ambiente):** "CORS só aceita a origem do próprio ambiente", mas um ambiente Amplify tem várias origens: `branch.<appid>.amplifyapp.com` (não desligável), domínio custom, previews de PR (`pr-N.<appid>…`) e `localhost` em dev. A origem é configurada em pelo menos quatro lugares: CORS do HTTP API (IaC), checagem de Origin na Lambda, callback/logout URLs do app client Cognito e `CESIUM_APP_ORIGIN` do build. Nada amarra essas quatro listas.
- **Correção proposta — AD-27 "Origem canônica e caminho de rede do shell":**
  1. Cada ambiente tem **uma** `APP_ORIGIN` canônica, declarada uma vez na IaC e usada para: `allowOrigins` do HTTP API, a checagem de `Origin` da Lambda, as callback/logout URLs do Cognito e a CSP. O domínio `amplifyapp.com` serve o código, mas **não** é origem aceita pela API (o shell carregado ali mostra "acesso indisponível"). Previews de PR ficam desligados ou ligados ao ambiente de preview.
  2. Decidir explicitamente **API cross-origin** (CSP `connect-src 'self' <API_ORIGIN> <COGNITO_DOMAIN>`) **ou** proxy same-origin do Amplify (e então CORS sai do escopo). Recomendação: cross-origin, porque mantém o Amplify só com código, como o AD-9 pretende.
  3. CORS é configurado **só** no API Gateway (que responde ao preflight antes do JWT authorizer). A Lambda não emite cabeçalhos CORS. Isso evita a variante em que a Lambda trata CORS, o `OPTIONS` cai no authorizer e recebe 401.
  4. Emendar o AD-25: a CSP de `/app/**` passa a ser gerada a partir das origens do AD-27, não literal.

### Par 4 — API Lambda × `SnapshotReader`: o que é "o manifesto" na fronteira HTTP

- **Unidade A (story da API Lambda):** por AD-9 e por segurança, não expõe a chave interna do S3. Devolve o manifesto sem `objectKey`, ou com `objectKey` reescrito para a rota `/api/v1/snapshots/:revision/:slice`. Ou ainda embrulha a resposta num envelope `{data: manifest, requestId}`, como sugere a convenção de erros.
- **Unidade B (`SnapshotReader`, código atual):** `assertManifest` exige **exatamente** `objectKey`, `digest` e `lastSuccessAt` por slice ([snapshot.mjs:12](../../../../../src/contracts/snapshot.mjs#L12)) e o manifesto nu na raiz. `readSlice(revision, slice)` usa o nome da slice, não o `objectKey`. A comparação de digest usa `!==` sobre os bytes de texto recebidos ([snapshot-reader.mjs:14](../../../../../src/application/snapshot-reader.mjs#L14)).
- **Quebras plausíveis com ambos "corretos":**
  - Sem `objectKey`, `assertManifest` rejeita, e o leitor fica `unavailable` para sempre.
  - Com `objectKey` = chave S3, a chave interna vaza para o navegador. Com `objectKey` = rota, um shell usa o campo como URL e outro monta a rota, e os dois passam.
  - A Lambda faz `JSON.stringify(JSON.parse(obj))`, ou responde com `isBase64Encoded`/compressão. Os bytes mudam, e `DIGEST_INVALID` aparece em toda leitura, porque o digest é sobre o `canonicalJson` gravado.
  - 401 (token expirado) mapeado para erro genérico: o `SnapshotReader` devolve `kept-last-good` e continua exibindo dado privado depois da perda de autorização, contra o AD-23. Só `AccessDeniedError` limpa o `current` ([snapshot-reader.mjs:22](../../../../../src/application/snapshot-reader.mjs#L22)).
  - A Lambda só serve slices da revisão **atual**. O leitor busca as slices de rN depois que o ponteiro passou para rN+1 e recebe 404 em loop, ou a limpeza de órfãos (contracts.md) apaga rN durante a leitura.
- **Correção proposta — AD-28 "Contrato HTTP de leitura de snapshot" (em `src/contracts/`, sob AD-16):**
  1. Dois schemas distintos: `PublishedManifest` (interno: com `objectKey`, gravado pelo Publicador) e `ManifestResponse` (externo: sem `objectKey`, slices endereçadas só por nome). O `SnapshotReader` valida o `ManifestResponse`, e o v2 externo nasce já sem `objectKey`.
  2. A resposta de manifesto é o objeto nu, `Content-Type: application/json`. A resposta de slice são **os bytes gravados, verbatim** (`Content-Type: application/json; charset=utf-8`, sem re-serialização nem base64), provados por uma fixture compartilhada Lambda × `web-digest`.
  3. Porta HTTP única do shell (`src/ui/http-snapshot-port.mjs`): 401 → uma tentativa de refresh de token, e depois `AccessDeniedError`; 403 → `AccessDeniedError`; 404/410 em slice → erro de revisão substituída (refresh); 5xx → erro genérico.
  4. Retenção: as K últimas revisões (ou T minutos) continuam legíveis por rota de slice. A limpeza de órfãos respeita esse limite.
  5. `revision` tem padrão URL-safe definido no contrato (ex.: `^[A-Za-z0-9._-]{1,128}$`).

### Par 5 — Story de autenticação do shell × API Gateway/Lambda: formato, escopo e guarda do token

- **Unidade A (shell):** usa o ID token do Cognito, comum em exemplos Amplify Auth. Guarda os tokens no `localStorage`, padrão da biblioteca. Recebe `?code=…&state=…` na URL de retorno.
- **Unidade B (API):** o authorizer exige escopo por rota (AD-9). ID tokens do Cognito **não** têm `scope`, só access tokens, e o access token traz `client_id` (não `aud`). A Lambda lê `sub` de `requestContext.authorizer.jwt.claims`.
- **Quebras com ambos obedecendo:**
  - ID token + escopo exigido → 401 em tudo. Access token + Lambda conferindo `aud` → 403 em tudo.
  - Os escopos não têm nome nem resource server definido, então IaC e Lambda inventam nomes diferentes.
  - Guardar tokens no `localStorage` contraria o AD-21 ("escritas do shell limitam-se a `persistPreferences`"). Bloquear isso força token só em memória e login a cada recarga. Nenhuma das duas escolhas está decidida.
  - O retorno OAuth põe `code`/`state` na URL. O AD-9 só veda *token* na URL, e o AD-19 manda o escritor de endereço reescrever para `explorationQuery`. Se a raiz despachar `hydrateUrl`, ou o escritor fizer `replaceState`, antes de a biblioteca trocar o código, o login falha. Se depois, o `code` fica no histórico.
  - O Epic 7 declara "nenhum pacote novo". Uma biblioteca de auth seria pacote novo; PKCE manual é trabalho não atribuído.
- **Correção proposta — aperto do AD-9 + emenda ao AD-21:**
  - O token enviado é o **access token** (`token_use = access`). O resource server se chama, por exemplo, `llms-api`, com escopos `llms-api/read` e `llms-api/write`. A tabela rota → escopo fica em `src/contracts/`, e a Lambda confere `token_use`, `client_id` e `sub`.
  - Rota de callback dedicada (`/app/auth/callback`) fora da raiz de composição: troca o código, limpa a URL e redireciona para `/app/` com a query salva. Só depois a raiz despacha `hydrateUrl`.
  - Decidir a guarda: access/ID token só em memória e refresh token em `sessionStorage` ou só memória. Emendar o AD-21 para nomear essa exceção, ou proibi-la explicitamente.
  - Decidir PKCE manual × pacote (exceção explícita à regra "nenhum pacote novo").

---

## Achados adicionais (formato canônico)

| # | location | trigger_condition | guard_snippet | potential_consequence |
| --- | --- | --- | --- | --- |
| 6 | Epic 7 AD-22; [local-search.mjs:61-62](../../../../../src/application/local-search.mjs#L61-L62); `INTENT_FIELDS` em [exploration.mjs:113](../../../../../src/contracts/exploration.mjs#L113) | A regra "repassar remaps só se `remapsFrom === snapshotRevision`" vive em **cada despachante** (Busca, Globo, futuros). O intent `advanceSnapshot` não tem `remapsFrom`, e o reducer não pode aplicá-la. Isso contraria o AD-1 (regra com um só dono no domain). | Acrescentar `remapsFrom` ao intent `advanceSnapshot` (mudança incompatível do intent → `EXPLORATION_VERSION` 3 sob AD-16). O reducer decide aplicar ou ignorar e emite um aviso tipado. Os despachantes repassam o frame cru. | Busca compara com o `snapshotRevision` lido no início do frame, Globo compara no despacho (ou não compara); a mesma revisão resulta em Empresas diferentes nas duas superfícies, contra o AD-10. |
| 7 | Epic 7 AD-22 ("a interface informa indisponibilidade"); `warning` em [exploration.mjs:233](../../../../../src/contracts/exploration.mjs#L233) | Não existe código de aviso para "remaps descartados por salto de revisão". O enum de `warning` é fechado. | Novo valor (ex.: `remap-unavailable`) definido no contrato e emitido só pelo reducer, e apenas quando a Empresa afetada estava selecionada. | Cada shell inventa sua mensagem, ou reaproveita `company-unavailable` para casos distintos. |
| 8 | AD-2 + AD-22 ("Publicador em memória emitindo `companyRemaps`"); [curation.mjs:5](../../../../../src/contracts/curation.mjs#L5) | Não existe comando/contrato de **decisão de merge**: `kind` só admite `company` e `relation`. A fonte de `companyRemaps` não está definida. | Definir `MergeDecision {decisionId, fromCompanyId, toCompanyId}` em `src/contracts/curation.mjs`. O Publicador deriva `companyRemaps` **só** das decisões de merge consumidas no commit/CAS. As fixtures passam pelo comando de curadoria, nunca por um parâmetro de `publish`. | A story do Publicador acrescenta `publish({companyRemaps})` vindo do chamador (backdoor de teste), e a story de curadoria do Epic 2 espera derivação. Surgem dois caminhos de criação de remap. |
| 9 | AD-2 ("fixtures migram na mesma mudança"); Epic 7 AD-21/AD-22 | Não se diz **quais** fixtures nem **quem** as migra: o produtor `MemorySnapshots` ([memory-snapshots.mjs:65](../../../../../src/adapters/memory-snapshots.mjs#L65)), os testes que montam manifestos à mão ([local-snapshot.test.mjs:60-72](../../../../../tests/local-snapshot.test.mjs#L60-L72)) e o futuro `src/ui/fixture-source.mjs`, que traz manifesto e digest literais. | Inventário nomeado na story de Domain/Contracts: (a) `assertManifest` v2 + fixtures válidas/inválidas em `tests/fixtures/manifest-v2*.json`; (b) `MemorySnapshots` emite v2; (c) `fixture-source` **gera** o manifesto pelo mesmo helper, nunca com literal. Um teste falha se houver `schemaVersion: 1` em qualquer manifesto. | `fixture-source` nasce com um manifesto v1 literal copiado de um teste antigo e fica `unavailable` no navegador, ou um teste ainda produz v1 e mascara a rejeição. |
| 10 | AD-2 ("O leitor usa uma revisão por sessão de leitura"); Epic 7 AD-20, Convenção "Ordem de snapshots" | "Sessão de leitura" não está definida, nem quem dispara `SnapshotReader.refresh` (por frame, por intervalo, por `visibilitychange`). | Definir: sessão de leitura = um `frame()`. `refresh` é disparado só pela raiz (no load, a cada N min e em `visibilitychange`), e `readSnapshot` de `LocalNewsView` lê `reader.current` sem refresh. | Uma implementação faz GET de manifesto a cada tecla da Busca (custo de Lambda/S3, revisões trocando no meio da consulta); outra nunca avança. |
| 11 | AD-9 ("o build falha se algum desses entrar no artefato"); Epic 7 AD-21 ("marcador de procedência") | O detector do build e o formato do marcador "fixtures sintéticas marcadas" não estão definidos. | Contrato `provenance: 'synthetic-fixture'` (constante em `src/contracts/`), exigido em todo JSON/módulo de fixture copiado. `build-ui-preview.mjs` falha se `dist/ui/app/` contiver JSON sem o marcador, ou qualquer arquivo sob `tests/`, `_bmad-output/` ou `src/adapters/`. | A story de build checa um campo JSON enquanto a de fixtures exporta uma constante JS; a verificação passa vazia e um dado real atravessa sem alarme. |
| 12 | AD-2 (`remapsFrom` = CAS esperado) × AD-14 (recovery por ponteiro validado) | Recovery que reaponta para um manifesto antigo faz o leitor "avançar" para trás. O `remapsFrom` antigo nunca casa, e Empresas mescladas em revisões posteriores reaparecem. | Coberto pelo AD-26 (Par 1): recovery publica revisão nova com `sequence + 1`; o leitor rejeita `sequence` menor que a atual. | Seleção e URL apontam para IDs que o banco curado considera mesclados; o critério 4 é violado após qualquer rollback. |
| 13 | AD-9 (allowlist de `sub` por ambiente) × AD-14 (identidades isoladas) | Não se diz onde vive a allowlist (variável de ambiente, SSM, tabela), nem como pool, bucket e API por ambiente se ligam a ela. | Variável `OWNER_SUBS` por função, definida na IaC do ambiente. A Lambda falha fechada se estiver vazia, e o teste de "config ausente nega" faz parte do gate de contracts.md §Gates. | O `sub` do preview vai parar na allowlist de produção (ou o contrário), e o isolamento do AD-14 se perde sem nenhum AD violado. |
| 14 | Pai, Structural Seed e convenção "Contratos" | "Manifesto v2", "Exploration v2" (`EXPLORATION_VERSION = 2`) e envelopes v1 coexistem. O memlog diz "versão é por contrato", mas o intent `advanceSnapshot` (v2) carrega dados de manifesto. | Tabela explícita contrato → versão em contracts.md. Mudanças no intent (achado 6) sobem `EXPLORATION_VERSION` independentemente do manifesto. | Um revisor ou implementador lê "v2" como a mesma versão e acopla a evolução dos dois contratos. |
| 15 | Epic 7 AD-23 × AD-9 | O descarte "ao perder permissão" não define o **sinal**: 401 de refresh falho, 403, logout ou expiração local do token. | A porta HTTP (achado do Par 4) emite um único evento `access-lost` para a raiz, que executa a sequência do AD-23. | Uma story descarta no 403 e outra só no logout; a resposta privada é publicada após o token expirar. |

## Sobreposição entre achados

- Pares 1, 2 e os achados 6, 7 e 12 tratam a mesma costura (remap/revisão). Fechá-los com AD-26 + o aperto do AD-2 + `remapsFrom` no intent resolve o conjunto.
- Pares 3, 4 e 5 e os achados 13 e 15 são a fronteira HTTP/auth que o AD-9 nomeia, mas não contratualiza. AD-27 + AD-28 + o aperto do AD-9 resolvem o conjunto.

## Correções propostas (resumo)

| Fecha | Proposta |
| --- | --- |
| Par 1, achado 12 | **AD-26** — `sequence` monotônico; remaps compostos transitivamente pelo Publicador; endpoint ou log de remap composto entre revisões; recovery sempre como revisão nova. |
| Par 2 | **Aperto do AD-2** — regra completa (incluindo `from` em `remapsFrom` e "`to` nunca é `from`"); `assertCompanyRemaps(remaps,{previousCompanyIds,nextCompanyIds})` como função única; reducer sem checagem própria. |
| Par 3 | **AD-27** — `APP_ORIGIN` única por ambiente alimentando CORS, Origin, Cognito e CSP; API cross-origin com `connect-src` explícito; CORS só no API Gateway; emenda da CSP do AD-25. |
| Par 4, achado 15 | **AD-28** — `ManifestResponse` sem `objectKey`; slice como bytes verbatim; porta HTTP com mapeamento 401/403/404/5xx; retenção de K revisões; padrão de `revision`. |
| Par 5 | **Aperto do AD-9 + AD-21** — access token, resource server e escopos nomeados; rota de callback dedicada; guarda de tokens decidida; PKCE manual × pacote. |
| Achados 6, 7 | Intent `advanceSnapshot` com `remapsFrom`, decisão no reducer, novo `warning` (Exploration v3). |
| Achado 8 | Contrato `MergeDecision`; Publicador deriva remaps só dele. |
| Achados 9, 11 | Inventário de migração de fixtures; marcador de procedência como contrato; detector no build. |
| Achados 10, 13, 14 | Definir sessão de leitura e gatilho de refresh; allowlist por ambiente na IaC; tabela de versões por contrato. |
