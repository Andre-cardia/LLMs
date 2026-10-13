---
name: Monitor Global de Labs de LLM
type: architecture-spine
purpose: build-substrate
altitude: initiative
paradigm: monólito modular com portas e adaptadores
scope: FR-1 a FR-40, dashboard pessoal, rotinas de atualização e renderer CesiumJS do Globo principal
status: final
created: 2026-10-10
updated: 2026-10-12
binds: [FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25, FR-26, FR-27, FR-28, FR-29, FR-30, FR-31, FR-32, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38, FR-39, FR-40]
sources:
  - ../../prds/prd-LLMs-2026-10-07/prd.md
  - ../../prds/prd-LLMs-2026-10-07/addendum.md
  - ../../ux-designs/ux-LLMs-2026-10-09/DESIGN.md
  - ../../ux-designs/ux-LLMs-2026-10-09/EXPERIENCE.md
  - ../../ux-designs/ux-LLMs-2026-10-09/mockups/prototype-cesium.html
companions: [contracts.md, coverage.md, technology-evidence.md, implementation-readiness.md, cesium-integration.md]
---

# Architecture Spine — Monitor Global de Labs de LLM

Contrato para decompor o produto em épicos. Requisitos citados do PRD/UX são herdados. AD-17 registra a escolha de integrar CesiumJS ao Globo principal; dados geográficos e provedores de tiles continuam sujeitos aos gates indicados. `final` significa decisões registradas e revisadas, sem atestar implementação, direitos de uso de fontes ou autorização de publicação.

## Design Paradigm

Monólito modular com portas e adaptadores. `domain` contém identidade, curadoria, datas, dinheiro, publicação e orçamento. `application` orquestra comandos e consultas. `adapters` traduzem fornecedores, persistência e autenticação. `ui` usa HTML/CSS/JavaScript vanilla, como herdado da UX; o renderer CesiumJS fica atrás da fronteira do Globo e não possui dados curados. Domínio não importa DOM, SDK de hospedagem, CesiumJS ou cliente LLM.

```mermaid
flowchart LR
  UI[UI vanilla e renderers] --> HTTP[Adaptador HTTP autenticado]
  CRON[Adaptador de agendamento] --> APP[Application: comandos e consultas]
  HTTP --> APP
  APP --> DOMAIN[Domain e contratos]
  ADAPTERS[Adaptadores de Fontes e persistência] --> PORTS[Portas do domínio]
  APP --> PORTS
  PORTS --> DOMAIN
```

## Invariants & Rules

### AD-1 — Uma regra, um proprietário

- **Binds:** todos os módulos.
- **Prevents:** telas e provedores implementarem identidades, preços ou mutações incompatíveis.
- **Rule:** somente `domain` define essas regras; `application` é a entrada de comandos. Adaptadores convertem para contratos versionados, sem criar regras alternativas. UI consulta projeções e emite intenções.

### AD-2 — Snapshot consistente e privado

- **Binds:** FR-9, FR-14, FR-23 a FR-26, FR-30, FR-31, FR-33 a FR-37.
- **Prevents:** combinar Cadastro, Modelos e Relações de revisões incompatíveis ou expor JSON privado como asset público.
- **Rule:** armazenamento curado é a autoridade de escrita. O Publisher é o único escritor do manifesto `schemaVersion: 1`, com `revision`, `publishedAt`, `curationRevision` e refs imutáveis por slice. Valida integridade referencial e troca o ponteiro por compare-and-swap. O leitor usa uma revisão por sessão de leitura; avanço troca o conjunto inteiro. Objetos e APIs exigem autorização do dono.

### AD-3 — Identidade e ausência de dados

- **Binds:** FR-1, FR-3, FR-9 a FR-13, FR-20, FR-26, FR-31, FR-37.
- **Prevents:** duplicatas entre Fontes, relançamentos falsos e ausência tratada como zero.
- **Rule:** IDs internos opacos são estáveis; `(source, externalId)` é único. Aliases de Modelo e variantes têm entidade proprietária explícita. Correspondência incerta vai à Fila; merge exige decisão humana. Data de Lançamento segue AA > HF > OpenRouter, preservando evidência por Fonte. Promoção de prévia para final conserva o Lançamento. Valores ausentes são `null`; dinheiro e unidades seguem `contracts.md`.

### AD-4 — Curadoria e DESFAZER auditáveis

- **Binds:** FR-13, FR-20 a FR-23, FR-31.
- **Prevents:** Agentes publicarem, aprovação aparecer antes da Atualização, DESFAZER apagar histórico ou concorrer com publicação.
- **Rule:** comandos de dono recebem `expectedRevision` estruturada e `idempotencyKey`, conforme escopos em `contracts.md`. Aprovar cria decisão staged, publicada somente na próxima Atualização válida; edição manual usa o mesmo limite de publicação. Antes de publicar, DESFAZER devolve a proposta a pending por operação atômica. Após publicar, cria proposta compensatória, exige confirmação humana e só altera a próxima revisão; a revisão anterior e a decisão original permanecem auditáveis. Rejeição guarda fingerprint do fato e evidência; reapresentação exige fato novo verificável.

### AD-5 — Autoridade limitada de Agentes

- **Binds:** FR-15 a FR-17, FR-22, FR-34, FR-35.
- **Prevents:** instruções de páginas virarem ferramentas, autoridade ou dados curados.
- **Rule:** Notícias só retornam saída de esquema fixo, sem ferramentas ou escrita. Descoberta só grava propostas; limite de dez propostas de Empresas novas por semana UTC, inclusive curadoria inicial em lotes; quota global e inserção são atômicas, replay não consome novamente. Chat v1 lê e navega, sem permissão de propor ou aprovar. IDs, links, alegações e schema são validados fora do LLM; citações só referenciam fontes realmente consultadas. Texto externo não entra no canal de instruções. Busca/fetch no servidor usa allowlist ou proteção contra SSRF e não envia credenciais a URLs geradas.

### AD-6 — Atualização idempotente e falha parcial

- **Binds:** FR-14, FR-19, FR-23 a FR-26.
- **Prevents:** cron concorrente consumir/ver publicar duas vezes, dado inválido apagar o válido, falha de uma Fonte contaminar outra.
- **Rule:** lease por slice, token de fencing crescente, chave por Fonte/escopo/janela e CAS do manifesto. Fonte tem timeout, retries limitados e schema. Coleção comparável vazia ou com menos de metade da última coleção aceita é rejeitada; não se compara com tentativa falha. Notícias incrementais vazias e consultas de ativo único têm validadores próprios. Falha preserva slice e `lastSuccessAt`; novas slices só entram após validar referências contra a revisão curada da publicação.

### AD-7 — Cadência e frescor verificáveis

- **Binds:** FR-19, FR-24, FR-25, FR-36.
- **Prevents:** UI dizer LIVE por ter acesso HTTP, bolsa fechada virar atraso ou dado velho ganhar timestamp novo.
- **Rule:** modelos/preços/Lançamentos a cada hora; Notícias a cada hora ou seis horas no modo de orçamento de 80%; ações e índices a cada quinze minutos em pregão, mais coleta pós-fechamento. `quotedAt` e `lastSuccessAt` são distintos. Calendário, fuso, sessão e cadência pertencem ao instrumento. Ausência de calendário não permite inferir pregão aberto. Estados por Fonte e agregado são calculados pela política comum de `contracts.md`; nenhuma tela recalcula com limiares próprios.

### AD-8 — Orçamento fechado por padrão

- **Binds:** FR-15, FR-16, FR-22, FR-34, FR-35 e PRD §6.
- **Prevents:** retries ou chat ultrapassarem silenciosamente o teto automático.
- **Rule:** ledger em mês UTC separa automação de chat/busca. Cada chamada paga reserva atomicamente seu máximo estimado, vinculado imutavelmente a bucket/mês UTC; os limiares usam gasto + reservado, inclusive igualdade; retry usa nova reserva, acerto ocorre uma vez e resultado desconhecido mantém reserva. Sem preço/limite verificável não se chama. A 80% Notícias passam a seis horas; a 100% suspendem-se chamadas automáticas pagas e permanecem título/link. Chat/busca começam com limite zero até verba e fornecedor decididos. Nenhuma escolha de arquitetura ativa cobrança.

### AD-9 — Autorização de ponta a ponta

- **Binds:** FR-30, todas as rotas, objetos, Histórico e mutações.
- **Prevents:** proteção apenas da página, acesso por preview/origem direta ou escrita com header de identidade falsificado.
- **Rule:** identidade verificada e allowlist do dono antes de servir assets, JSON ou comandos. Worker proposto usa `run_worker_first: true`, JWT com assinatura/JWKS confiável, issuer, audience e expiração, mais dono autorizado. Config ausente nega acesso. Origens alternativas e previews precisam da mesma prova. Respostas privadas usam cache privado; mutações validam Origin/CSRF, método, schema e autorização. Segredos ficam em bindings/env servidor e nunca nos snapshots, bundles, URLs ou logs.

### AD-10 — Estado semântico único de experiência

- **Binds:** FR-1 a FR-8, FR-27, FR-29, FR-31 a FR-38.
- **Prevents:** projeções, bases, chat, busca e URL escolherem Empresas diferentes ou quebrarem foco/preferências.
- **Rule:** um reducer é o único escritor semântico do store: intents tipados, preferences persistidas, sessionOverrides e effectiveState separados. Hidratação de URL não dispara persistência. Avanço de snapshot reconcilia seleção/remapeamentos/janelas em uma transição; callbacks vencidos de voo/digitação não restauram intenção antiga. O Globo permanece em projeção 3D; o estado de experiência seleciona a base `MAPA|SAT`, nunca uma Vista 2D. A troca de base preserva câmera, Pontos, Relações, Filtros, Empresa selecionada e Terminal. Um seletor/projeção comum calcula uma vez o conjunto elegível/visível de Empresas a partir dos contratos e filtros ativos; renderers recebem esse conjunto e projetam as mesmas entidades, sem reavaliar predicados de Camada/Etiqueta/Laboratório; espalhamento só altera coordenadas visuais. URL restaura a base/contexto da sessão sem sobrescrever preferência persistida; compatibilidade dos parâmetros legados é Q11. O estado não guarda conversas/segredos. Lateral Leitor/Fila/MERCADOS exclusivos; `Esc` age no foco superior e completa digitação primeiro. Teclado/toque, reduzir movimento, temas, som inicialmente desligado e tokens herdam os contratos vigentes de UX, com gates de acabamento preservados.

### AD-11 — Finanças e modelos com unidades explícitas

- **Binds:** FR-9 a FR-12, FR-18, FR-19, FR-36.
- **Prevents:** comparar moedas, trocar símbolo entre bolsas ou usar preço por token como preço por milhão.
- **Rule:** um instrumento inclui ID interno, símbolo por Fonte, moeda/unidade, mercado/calendário/fuso. Origem, horário e atraso acompanham o valor; fallback por instrumento precisa cobertura verificada. Snapshot não fabrica zeros nem reserva mundial. Modelos usam preço USD por milhão; custo da tarefa é `(2000 × inputUsdPerMillion + 1000 × outputUsdPerMillion) / 1000000`, aproximado para raciocínio. Representação decimal e regras de ausência ficam em `contracts.md`.

### AD-12 — Chat e Histórico privados

- **Binds:** FR-35.
- **Prevents:** streaming incompatível, navegação inválida, retenção indefinida por omissão ou recuperação de conteúdo excluído.
- **Rule:** protocolo e tools de navegação versionados, com IDs canônicos, allowlist e validação no servidor e cliente. Ação visível na conversa; execução volta do console cheio ao painel. Histórico pertence ao dono e exige prazo configurado antes de habilitar; apagar retira acesso imediato e segue política de eliminação/backup decidida antes da story. Logs operacionais não têm conteúdo de conversa. Schema dos eventos consta em `contracts.md`.

### AD-13 — Infraestrutura geográfica independente

- **Binds:** FR-28, FR-31, FR-39, FR-40.
- **Prevents:** cabo virar Camada/Empresa/Relação ou associação geográfica virar dado afirmado.
- **Rule:** BACKBONES tem namespace e carregamento próprios, começa desligado e só é habilitado com proveniência/licença aceita. Estação ↔ cabo exige vínculo de Fonte, ausência aparece indisponível. Tiles seguem cache/atribuição do provedor e apenas viewport interativo; sem prefetch em massa/offline. Histerese evita oscilação. Falha de camada MAPA não troca a base silenciosamente para SAT; mantém o Globo e os Pontos utilizáveis e informa a indisponibilidade. Em SAT, falha do detalhe fotorealístico volta à imagem de satélite. Seleção e Empresas são preservadas nos dois casos. Provedores, zoom, bases e estilo escuro são gates antes das stories do Globo.

### AD-14 — Ambientes, recuperação e prova operacional

- **Binds:** infraestrutura, jobs e todos os testes.
- **Prevents:** teste local chamar serviço pago, dados de preview virarem produção ou rollback apagar curadoria.
- **Rule:** local/test usam fixtures sintéticas; preview/prod têm bancos, objetos, segredos, ledgers e identidades isolados. Não há deploy/cron/ativação paga automática por teste, build ou instalação. Recuperar snapshot usa ponteiro validado; banco auditado restaura separadamente. Backup privado, retenção, exclusão e recovery exigem teste antes da publicação. Logs possuem run ID, Fonte, duração, status e custo, sem conteúdo/chaves. Operação mede SM-2 e SM-3 após sete dias reais.

### AD-15 — Feedback de Notícias comum a todas as superfícies

- **Binds:** FR-14, FR-15, FR-33, FR-34, FR-35 e FR-37.
- **Prevents:** matéria marcada reaparecer no refresh, feed ou Leitor e telas divergirem em relevância.
- **Rule:** NewsId é canônico por grupo de matéria deduplicada. Comando autenticado do dono, com confirmação explícita, persiste feedback privado owner-wide; cancelar não grava. Confirmar oculta imediatamente aquela Notícia em todas as cinco superfícies e navegação/chat, independentemente do ciclo de snapshot. Toda projeção combina revisão de dados e revisão de feedback; aliases sindicatados conservam supressão. O filtro da Empresa recebe esse feedback como exemplo, sem News Agent escrever no ledger.

### AD-16 — Contratos compartilhados têm autor único

- **Binds:** fronteiras entre todos os módulos, schemas de request/response/snapshot/event/patch/state.
- **Prevents:** produtores e consumidores criarem formatos v1 diferentes para a mesma entidade ou evento.
- **Rule:** `src/contracts/` é a única definição executável de formatos de fronteira, sob responsabilidade do núcleo Domain/Contracts; produtores e consumidores importam os mesmos validadores. Antes de liberar stories independentes de uma fronteira, sua implementação de schema e fixtures válidas/inválidas precisa existir e passar nos dois lados. Registry de slices, JSON envelopes, payload de cada evento, patches e frescor pertencem a esse pacote; sua ausência bloqueia a fronteira. Mudança incompatível exige nova versão/migração, nunca heurística local.

### AD-17 — CesiumJS renderiza o Globo principal sem possuir estado de produto [ADOPTED]

- **Binds:** FR-1 a FR-8, FR-27 a FR-29, FR-31 a FR-33 e FR-37 a FR-40.
- **Prevents:** uma rota de mapa paralela divergir na seleção/filtros; coordenadas demonstrativas parecerem fatos curados; eventos de renderização alterarem dados ou preferências fora do fluxo comum.
- **Rule:** CesiumJS 1.146 é a baseline verificada para o futuro renderer do Globo, atrás da fronteira `GlobeRenderer`; a integração ainda não existe no app. A aplicação entregará ao adapter somente a projeção de Empresas elegíveis/visíveis calculada pelo AD-10, com IDs canônicos e Localizações cujo significado, precisão e evidência própria estejam validados; o adapter não recalcula filtros. Ausência/aproximação e schema exato ficam no gate Q8 e contrato comum do AD-16; a projeção fornece ao renderer a classe visual aprovada, sem inferência de precisão. Um único `GlobeSceneComposer` recebe base MAPA/SAT, tema, camadas e estado de câmera/zoom e possui as coleções da cena, aplicando a receita comum definida por Q6; adapters de provider retornam recurso/status/créditos sem mutar a cena. MAPA usa cartografia escura e revela detalhe OSM ao aproximar. SAT usa imagery de satélite em zoom amplo e transita automaticamente a fotorealismo 3D em zoom próximo coberto; zoom-out, falta de cobertura ou falha fotorealística retorna a SAT. Terreno acompanha MAPA/SAT; edifícios só são adicionados quando compatíveis, sem duplicar geometria do fotorealismo. A camada fotorealística ativa é derivada da base SAT, câmera, cobertura e disponibilidade, não uma terceira base persistida. Falha MAPA mantém MAPA selecionada e o Globo utilizável, sem trocar para SAT silenciosamente; indisponibilidade é informada. Falha de detalhe fotorealístico em SAT preserva imagery SAT. Só se mostram créditos das camadas ativas. O adapter encaminhará seleção/navegação como intents tipados ao store semântico do AD-10, sem possuir entidades curadas, filtros, preferências, persistência ou publicação. O PRD define as capacidades; as prescrições antigas de quatro Vistas em `DESIGN.md`/`EXPERIENCE.md` não prevalecem sobre FR-32 e addendum atualizados. O protótipo Cesium é referência exploratória. Pontos sem Localização validada não são apresentados como endereços precisos; coordenadas do protótipo permanecem fixtures. O adapter preserva hover de ~300 ms para Prévia, clique/toque em Ponto ou Rótulo para Terminal Fixado (sem Prévia em toque) e os fluxos existentes de foco/navegação por câmera; não acrescenta voos/controles de voo por Empresa/região nem cartões próprios. Provider e fonte imagery continuam sujeitos a Q6. Cada provider exige aprovação de fonte/licença, modelo de credencial (escopo mínimo/restrição de origem/ambiente/rotação quando aplicável), crédito visível e acessível, custo/quota, cache/Referer permitido e fallback. Credenciais privadas/de escrita nunca entram no browser; credenciais públicas do cliente são específicas do app/ambiente, restritas e monitoradas. Ao trocar base ou encerrar o renderer, `dispose` remove listeners/subscriptions e cancela cargas; conclusões/eventos de geração de cena vencida são ignorados. A carga usa versão fixada e serve assets/workers pela estratégia escolhida. Só MAPA/SAT e camadas disponíveis/implementadas podem ser selecionadas.

## Consistency Conventions

| Concern | Convention |
| --- | --- |
| Contratos | `/api/v1`, `schemaVersion: 1`; incompatibilidade rejeita, migração explícita. Campos JSON camelCase; IDs strings opacas. |
| Datas | ISO 8601 UTC com `Z`; UI mostra fuso. Relógio injetável nos testes. Datas desconhecidas são null, não data de ingestão. |
| Erros | `{error:{code,message,retryable},requestId}`; sem stack/chave/conteúdo externo; 401/403 acesso, 409 revisão, 422 schema, 429 limite, 503 dependência. |
| Comandos | Autorização, schema, idempotência e revisão antes do efeito; nenhum GET altera estado. |
| Atribuição | Fonte/url/fetchedAt por valor ou registro; licenças e marca preservadas em toda superfície correspondente. |
| Entidades | Empresa tem uma Camada principal e zero+ Etiquetas; Laboratório é classificação elegível, inclusive por Etiqueta; cinco Camadas fixas. |

## Structural Seed

`[ASSUMPTION]` Base observada: aplicação em JavaScript ES modules (`src/**/*.mjs`), reducer/contratos compartilhados e scripts Node; Vite, TypeScript, Cesium e Workers não estão instalados/configurados no app principal. Preservar essa base JS como origem do store e dos contratos; não presumir conversão a TypeScript. Vite vanilla JS é alternativa de build, não escolha feita. Cloudflare Workers, D1 e R2 privados permanecem proposta sujeita a Q2, sem scaffold. CesiumJS 1.146 é a baseline de integração escolhida e verificada; nenhum pacote foi instalado para o app principal. Q9 decide CDN ou pacote NPM/Vite e a forma de servir assets/workers, mantendo uma única instância dos módulos atuais. Evidências e alternativas estão em [technology-evidence.md](technology-evidence.md) e o handoff de integração em [cesium-integration.md](cesium-integration.md). O renderer exige benchmark do envelope completo e fallback aprovado antes da adoção operacional.

```mermaid
flowchart TB
  OWNER[Andre] --> AUTH[Access ou IdP validado]
  AUTH --> WEB[Servico autenticado - UI e API]
  WEB --> DB[(Curadoria, Fila, ledger, Historico)]
  WEB --> OBJECTS[(Snapshots e logos privados)]
  TIMER[Agendamento UTC] --> JOB[Atualizacao - Application]
  JOB --> SOURCES[Adaptadores - APIs externas]
  JOB --> DB
  JOB --> OBJECTS
  WEB --> AGENT[Chat e busca - limite zero ate decisao]
```

```mermaid
erDiagram
  EMPRESA ||--o{ MODELO : publica
  MODELO ||--o{ VARIANTE : agrupa
  MODELO ||--o{ ALIAS_FONTE : identifica
  EMPRESA ||--o{ RELACAO : origem
  EMPRESA ||--o{ RELACAO : destino
  PROPOSTA ||--o{ DECISAO : audita
  DECISAO }o--o| REVISAO_CURADA : aplica
  MANIFESTO }o--|| REVISAO_CURADA : referencia
  MANIFESTO ||--|{ SLICE : compoe
  CONVERSA ||--o{ MENSAGEM : contem
  CABO }o--o{ ESTACAO : vinculo_confirmado
```

```text
src/contracts/      schemas/validadores compartilhados e fixtures
src/domain/         identidade, valores, curadoria, frescor, orçamento
src/application/    atualizar, publicar, revisar, pesquisar
src/ports/          Fonte, repositórios, auth, LLM, clock
src/adapters/       HTTP, storage, provider, scheduler
src/ui/             store, componentes vanilla, renderers
tests/              fixtures sintéticas, contratos, E2E privados
```

## Capability → Architecture Map

Os 40 FR, NFR e gates de origem estão em [coverage.md](coverage.md). O protótipo não substitui critérios de integração.

| Capability / Area | Lives in | Governed by |
| --- | --- | --- |
| Globo CesiumJS | `ui/globe` chama `GlobeRenderer`; adapter projeta IDs/localizações e devolve intents tipados | AD-10, AD-13, AD-17 |

## Deferred

- **Q1/Q7, antes das stories de chat/LLM:** Andre decide orçamento adicional, limite de suspensão, providers LLM/busca e retenção/exclusão. Chat permanece desativado. Teto automático próximo de US$5 não cobre custos novos por inferência.
- **Q2, antes das stories de infraestrutura:** aceite de hospedagem/IdP/custo total e prova de limites do job, transações, proteção e recuperação. Seed Cloudflare é proposta; alternativas preservam as mesmas portas.
- **Q3, antes das stories do Globo e UI afetadas:** projeção fixa 3D e bases MAPA/SAT estão definidas no PRD. UX fecha controles móveis, ordem/foco por muitos Pontos, contraste e legibilidade sobre MAPA/SAT, teclado, leitor de tela, toque/pinça e redução de movimento. Detalhes antigos de quatro Vistas, mapa plano e texturas diurnas/noturnas não são herdados. DESIGN/EXPERIENCE continuam rascunhos e não prevalecem sobre o PRD final.
- **Q4, antes de fonte/publicação BACKBONES:** demonstrar origem/data/licença e associação estação/cabo. Os assets existentes continuam protótipo.
- **Q5, antes de MERCADOS:** matriz de cobertura, símbolos confirmados, reserva por instrumento, unidades, histórico e calendários/fusos de todas as bolsas/macro/cripto. Sem cobertura comprovada, dado indisponível permanece explícito.
- **Q6, antes das stories de mapa/Globo:** os comportamentos de produto já fixados por AD-17/PRD não são reabertos: cartografia escura/OSM no zoom em MAPA; imagery de satélite ampla e transição automática a fotorealismo em zoom próximo coberto em SAT; terreno nas duas bases; edifícios compatíveis sem duplicação; falha em MAPA não muda a base para SAT, e falha fotorealística em SAT retorna a imagery SAT. Escolher a base inicial e provar uma composição tecnicamente compatível que cumpra essas regras. Fechar provedores, cobertura, fonte/licença, credenciais/restrição de origem, custo/quota/monitoramento, créditos acessíveis, cache/Referer, compatibilidade com temas e limiares/histerese. Para Google Photorealistic 3D Tiles, a orientação oficial recomenda restringir a chave Map Tiles API por IP; Q6 precisa provar caminho de requisição browser compatível com a restrição e os termos ou selecionar alternativa, sem chave irrestrita no cliente. A documentação Cesium do quickstart de fotorealismo desativa o globo padrão para conteúdo Google global; logo, não presumir composição simultânea com imagery SAT ou terreno sem teste/provider aprovado. Se usar `tile.openstreetmap.org`, cumprir HTTPS, Referer válido, cache headers, crédito e vedação a prefetch em massa.
- **Q8, antes de carregar pontos reais no Globo:** Andre confirma o que cada ponto representa (por exemplo, matriz, escritório, laboratório ou local aproximado), evidência/precisão aceitas e quais localizações demonstrativas podem ser descartadas; também mapeia cada classe para ponto/região/omissão, elegibilidade para seleção e limite de aproximação da câmera. Sem coordenada utilizável, a projeção omite o marcador. Fechar o contrato comum antes das stories.
- **Q9, antes do scaffold do renderer:** decidir CDN fixada ou pacote NPM/Vite para a base `.mjs` existente (importar módulos atuais ou definir migração explícita), servir assets/workers, CSP/cache e compatibilidade WebGL. O spike define matriz de navegadores/dispositivos, perda/restauração de contexto WebGL, tamanho, desempenho e estado/fallback comum: manter seleção, informar camada indisponível e preservar a base/intenção do usuário; habilitar apenas camadas e bases implementadas.
- **Q10 (resolvido por Andre em 12/10/2026):** Globo principal permanentemente 3D, com bases MAPA/SAT; MAPA escuro com OSM em zoom; SAT com imagem ampla e fotorealismo automático próximo quando coberto; terreno e edifícios compatíveis; sem voos. Preservar store, busca/filtros, câmera/foco e ações existentes. Q3/Q6/Q8/Q9 governam UX/acessibilidade, providers, geodados e integração.
- **Q11 (resolvido pela arquitetura em 12/10/2026; implementação antes das stories de store/URL):** estado canônico usa `base: MAPA|SAT`, intent de troca de base e projeção 3D fixa; URL nova serializa `base`. `view=MAPA|SAT` são aliases legados, `view=3D` não escolhe uma base, `view=2D` cai na base inicial configurada sem projetar mapa plano, e `base` prevalece se coexistir com `view`. A base inicial segue aberta em Q6. Domain/Contracts publica schema e fixtures executáveis via AD-16 antes das stories consumidoras.
- Detalhes de tabelas SQL, componentes, biblioteca gráfica e dimensões visuais serão definidos no épico responsável, respeitando os contratos; não podem criar identidades/publicadores/stores paralelos.
