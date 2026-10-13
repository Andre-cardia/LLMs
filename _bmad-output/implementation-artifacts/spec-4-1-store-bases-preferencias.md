---
title: '4.1 — Estado, bases e preferências no store compartilhado'
type: 'feature'
created: '2026-10-12'
status: 'done'
baseline_commit: '50ba405ea82a0d39d2df946fed74af5fc745b8ed'
route: 'dispatch'
review_loop_iteration: 1
story_key: '4-1-manter-estado-bases-e-preferências-no-store-compartilhado'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** O núcleo mistura projeção e base em `view`, incompatível com o Globo sempre 3D. A Story 4.1 atual não está concluída pelos fundamentos históricos.

**Abordagem:** Migrar contrato, reducer e URL para `base: MAPA|SAT`, com configuração inicial injetada, contexto preservado e testes dos seis critérios aprovados.

## Boundaries & Constraints

**Sempre:** ESM; reducer único; preferências/sessão/estado efetivo separados. Preservar Artificial Analysis/light/analytic e preferências legadas. Base inicial obrigatória, válida e disponível, injetada sem escolher produção. Base permanece na sessão; só edição de preferência persiste seu campo.

**Nunca:** 2D, terceira base, migração implícita, patches livres, serviços externos, deploy ou alteração dos protótipos. Câmera física pertence ao renderer: testar protocolo local, sem Cesium/geometria/Relações de 4.5. Trocar base não move/reinicia câmera nem muda Pontos/Relações. Gates continuam abertos.

## I/O & Edge-Case Matrix

| Cenário | Entrada | Resultado / erro |
|---|---|---|
| Configuração | Base inicial ausente, inválida ou indisponível | Erro explícito; sem escolher padrão de produção |
| URL canônica | `base` junto de `view` | `base` prevalece; inválida/duplicada/indisponível usa inicial, não alias |
| URL legada | `view=MAPA|SAT`, `3D`, `2D` | Alias válido; 3D não escolhe base; 2D usa inicial; nunca projeção plana |
| Segurança | Intent/payload/ID incompatível, accessor, patch extra | Rejeitar sem mutar estado ou executar conteúdo |
| Concorrência | Callback de operação/revisão substituída | Mesmo estado anterior, sem efeitos |

</frozen-after-approval>

## Code Map

- `src/contracts/exploration.mjs`: substituir `VIEWS`; preservar validadores de preferências.
- `src/domain/exploration-state.mjs`: reutilizar reconciliação/painéis/tokens por operação; ações independentes não vencem digitação.
- `src/domain/exploration-url.mjs`: allowlist sem segredos.
- `src/contracts/primitives.mjs`: reutilizar sem alterar.

## Tasks & Acceptance

**Execução, em ordem:**
- [x] `src/contracts/exploration.mjs`, `tests/fixtures/exploration-contract.json`, `tests/exploration-contract.test.mjs` — publicar versão, configuração, intents e fixtures válidas/inválidas antes dos consumidores; rejeitar formas antigas fora dos aliases URL.
- [x] `src/domain/exploration-state.mjs` — adotar 3D/base/disponibilidade; validar payloads e origem/destino dos remaps; adicionar operação/callback de câmera com token/revisão, sem coordenadas.
- [x] `src/domain/exploration-url.mjs` — consumir contrato compartilhado; aplicar precedência/aliases/fallback; serializar somente `base`, nunca `view`.
- [x] `tests/exploration.test.mjs` — cobrir matriz e AC1–AC6, preservando regressões; verificar callbacks positivos e negativos e fixtures compartilhadas nas fronteiras.
- [x] `scripts/demo-local-core.mjs` — injetar configuração sintética explicitamente e demonstrar base canônica sem chamadas externas.
- [x] `docs/local-core-fixtures.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml` — documentar migração/limites e registrar somente a conclusão comprovada de 4.1, sem concluir 7.1 ou o épico.

**Critérios de aceitação:**
- **AC1:** Dado contexto selecionado, quando alternar MAPA/SAT, então projeção fica 3D, seleção/filtros/Terminal permanecem e não há comando de câmera ou mutação de Pontos/Relações.
- **AC2:** Dadas preferências e configuração, quando hidratar URL ou editar preferência, então URL afeta só sessão e edição persiste exclusivamente seu campo; família não força modo.
- **AC3:** Dadas fixtures comuns, quando produtor/consumidor aplicarem URL e estado, então ambos obedecem à matriz e rejeitam versões incompatíveis.
- **AC4:** Dado novo snapshot/operação, quando reconciliar ou receber callbacks, então remapeamento explícito é atômico, remoção limpa seleção/Terminal com aviso e callbacks vencidos de câmera/digitação não alteram contexto.
- **AC5:** Dadas ações de painel/aba, quando abrir Fila/Leitor lateral/MERCADOS ou sair de GLOBO, então laterais são exclusivas entre si e preservam Terminal no Globo; sair de GLOBO fecha Terminal. Leitor flutuante e preferências mantêm regras existentes.
- **AC6:** Dado payload inválido, quando chamar a fronteira, então erro explícito preserva o contexto válido, sem executar JS, URL ou patch arbitrário.

## Design Notes

### Exigências da rederivação após revisão 1

- `assertExplorationState` deve validar TODOS os campos consumidos por reducer/serializador: contador inteiro seguro não negativo, revisão string; shapes/IDs únicos e referências do índice; Terminal/Leitor/câmera/Modelo, tokens, status, enums, nulls e relação com seleção/revisão atual. Estado efetivo deve ser exatamente preferences + sessionState + sessionOverrides; layout efetivo e exclusividade também coerentes. Rejeitar estado incompatível na entrada e verificar saídas. Nenhum próximo incremento pode exceder MAX_SAFE_INTEGER. Fixtures de estados inválidos devem passar pelas duas fronteiras.
- Validadores de configuração/preferência/intent/estado/snapshot/URL rejeitam arrays com protótipo customizado antes de iterator/includes/map/Set ou qualquer leitura que possa executar accessor herdado. Reutilizar primitives, mas fazer proteção local em exploration, sem alterar os outros domínios. Testar getters herdados e próprios, retornando erro com contador de execução zero. Payloads JSON simples são a fronteira; não prometer isolamento de Proxy JS hostil ou ambiente global adulterado.
- Transições mantêm seleção dependente coerente: limpar Empresa limpa selectedModel. Sair de Globo via tab invalida câmera pendente. Hidratar URL e navigate também invalidam; nova base/preferência independente não invalida tokens ativos. Testar todos esses caminhos, inclusive retorno tardio com mesmo objeto e efeitos vazios.
- Preservar defaults quando campos opcionais conhecidos de createExploration (`hiddenNewsIds`, `preferences`, `systemMode`) são omitidos OU undefined, validando descritores antes da normalização. Configuração inicial continua obrigatória.
- Ampliar AC1 com Modelo selecionado, Leitor lateral/flutuante e Fila/MERCADOS ativos; provar preservação de contexto/tokens sem efeitos nas duas trocas de base. Laterais coexistem com Terminal conforme continuidade já registrada.
- Não corrigir neste Build dois comportamentos preexistentes separados: ausência de company na URL deixa seleção de sessão; typing abstrato no tema AA. Registrar limitações para histórias consumidoras sem redefinir hidratação/apresentação.
- Implementação anterior e testes estão preservados em `/var/folders/j7/m9pljcks58qfr68k5k1jnzsr0000gn/T/story-4-1-rederive-q8goplnb` para referência das instruções KEEP; rederivar a partir dos fontes restaurados, não copiar cegamente a validação parcial.

## Implementation Notes

- Contrato de exploração v2 para configuração, estado e intents; `NavigationTarget` permanece v1. `config.initialBase`/`availableBases` são obrigatórios e injetados. Preferências legadas permanecem sem migração.
- Store separa `projection: '3D'` de `base`; `view`/`availableViews` são recusados fora dos aliases de URL. Ações de base preservam contexto e operação de câmera sem emitir efeitos.
- Protocolo local de câmera usa intent `camera` com `companyId`, efeito com token/revisão e callback `target: 'camera'`, sem coordenadas. Callbacks vencidos/duplicados retornam a referência anterior sem efeitos.
- Snapshot valida origem/destino de remaps antes da transição; painéis laterais são exclusivos entre si e preservam Terminal no Globo. Fronteiras rejeitam accessors, versões e campos incompatíveis antes de executar conteúdo.
- [Fixtures compartilhadas](../../tests/fixtures/exploration-contract.json), [testes do contrato](../../tests/exploration-contract.test.mjs) e [testes do store/URL](../../tests/exploration.test.mjs) cobrem todas as linhas da matriz e AC1–AC6.
- Implementação local concluída e entregue para revisão; integração Cesium, câmera física, produção e conclusão de 7.1/épico 4 não são reivindicadas.
- Correção posterior à entrega: a nota anterior sobre laterais fecharem Terminal foi invalidada pela auditoria. Restaurada coexistência histórica; três testes falharam antes da correção, incluindo remapeamento com Leitor lateral e callback independente, e devem passar antes da revisão.

- Rederivação concluída sobre fontes restaurados: validação completa de todos os campos operacionais e derivações, IDs/referências do índice, seleção dependente, layout e contador seguro; reducer valida entrada e saída e serializador usa o mesmo contrato. Nenhum incremento ultrapassa MAX_SAFE_INTEGER.
- Proteção local de dados simples rejeita protótipos customizados de arrays e accessors próprios/herdados antes de qualquer iteração; não altera primitives nem promete isolamento de Proxy hostil/ambiente adulterado. Opcionais conhecidos undefined preservam defaults após validação de descritores.
- Saída do Globo, hidratação e navigate invalidam câmera; limpar Empresa limpa Modelo. Testes ampliados cobrem Modelo selecionado, Leitor lateral/flutuante, Fila/MERCADOS, remap positivo e callbacks negativos com identidade/efeitos vazios.
- Limitações preexistentes registradas em [documentação local](../../docs/local-core-fixtures.md): ausência de company na URL mantém seleção de sessão; typing abstrato no tema AA permanece para integração de apresentação. Não foram corrigidas ou redefinidas nesta fatia.

## Spec Change Log

- Rodada 1: após preservar KEEP e restaurar somente fontes desta história à base com alterações preexistentes (78/78 testes), acrescentadas Design Notes de contrato completo, coerência, proteção de arrays e regressões. Evita estado v2 aparentemente válido produzir tokens inválidos, seleção divergente ou executar getter herdado. Bloco frozen inalterado.
- Rodada 1, instruções KEEP extraídas antes da rederivação: preservar precedência/aliases/fallback de URL, 3D/base/config v2, defaults AA e independência theme/mode, remaps atômicos e origem válida, tokens por operação, callbacks duplicados sem efeitos, coexistência Terminal/laterais, ausência de serviços/produção, fixtures compartilhadas e todas as provas positivas/negativas já adicionadas. Preservar modificações do usuário anteriores ao Build; não tocar package.json ou protótipos.

- Auditoria do diff pelo Lead: redação resumida do AC5 fora do bloco congelado foi explicitada conforme Story 4.1 original e continuidade histórica: exclusividade é entre laterais, não com Terminal. Evita fechar Terminal ao abrir Leitor. KEEP: preservação de contexto, tokens independentes e preferências. Bloco aprovado permanece intacto.

## Review Triage Log

### Rodada 1 — três camadas executadas; nenhuma omitida

| Achado | Veredito / rota | Evidência |
|---|---|---|
| BH1 — estado operacional incompleto | medium / bad_spec | Probe aceita `intentToken:-1`, revisão numérica, índice nulo e `readerTyping:42`; callback legítimo pode ficar sem token válido. Completar contrato de estado. |
| BH2 — estado efetivo inconsistente | medium / bad_spec | Probe aceita base efetiva divergente e Empresa inexistente, que o serializador publica. Validar derivação e referências. |
| BH3 — array com comportamento herdado | high / bad_spec | Probe de availableBases com getter herdado de Symbol.iterator executou JS dentro do validador; mesma fronteira aparece em preferências. Recusar protótipos customizados antes de usar métodos. |
| BH4 — câmera após saída do Globo | medium / patch | Probe câmera→MODELOS→callback concluiu operação antiga. Saída deve invalidar a operação; nenhuma geometria necessária. |
| BH5 — roundtrip sem seleção em sessão preenchida | medium / defer | Ausência de company não limpa a seleção de sessão; comportamento já existia no parser/serializador anterior. Registrar para 7.1 sem redefinir hidratação nesta fatia. |
| BH6 — Modelo após limpar Empresa | medium / bad_spec | Probe navigate(model)→company(null) deixa selectedModel com a antiga Empresa. Preexistente, mas exposto pelo novo contrato público de referências coerentes; corrigir transição junto da validação. |
| BH7 — digitação no tema AA | medium / defer | Tema AA/light já era alteração anterior à Story 4.1; reducer já marcava typing. Conteúdo imediato/handshake depende da integração de apresentação, sem alterar esta fatia local. |
| BH8 — opcionais undefined | low / patch | Probe options.preferences=undefined falha antes do default; chamada anterior aceitava. Restaurar defaults dos campos opcionais conhecidos sem ler accessors. |
| BH9 — preservação pouco povoada | low / patch | AC1 só compara selectedModel nulo; expandir casos com Modelo, Leitor/painéis e tokens efetivos. |
| EC1 — token negativo | medium / bad_spec | Mesmo probe BH1: estado aceita contador negativo e pode emitir token 0 recusado pelo contrato de callback. |
| EC2 — getter herdado | high / bad_spec | Mesmo defeito BH3, também confirmado na preferência layers por inspeção de list(unique). |
| VG1 — câmera em hydrate/navigate sem prova | medium / patch | Evidência pré-verificada: testes só cobrem substituição, snapshot e company; acrescentar invalidação e identidade/efeitos após hidratação/navegação. |

Agrupamento: BH1/BH2/BH6/EC1 são contrato/transições de estado; BH3/EC2 são fronteira de arrays. Ambos exigem esclarecimento fora do bloco congelado e rederivação (bad_spec). Patches BH4/BH8/BH9/VG1 ficam como exigências da rederivação; deferrals BH5/BH7 serão registrados após encerrar loopback. Diff integral com arquivos preexistentes foi preservado em temporário; revisão leu recorte desta história incluindo os novos testes/fixtures, não os ~96 MB de instalação/protótipos anteriores.

### Rodada 2 — três camadas executadas; Edge Case Hunter sem achados

| Achado | Veredito / rota | Evidência |
|---|---|---|
| BH1 — query vazia | medium / patch | `string` não aceita vazio, mas parser anterior aceitava location.search vazio. Aceitar string vazia mantendo demais validações e testar parser/hidratação. |
| BH2 — snapshot entregue fora de ordem | medium / defer | advanceSnapshot anterior também não possuía geração esperada; origem de revisões e entrega ordenada ficam com controlador/reader. Registrar para integração, sem inventar comparação de IDs opacos. |
| BH3 — callback entre instâncias | maybe-false / defer | Tokens são locais à instância e há colisão possível se consumidor encaminhar evento antigo ao novo store. Nenhum consumidor atual faz essa troca; comprovar lifecycle/disposal no adapter futuro. Impacto potencial medium, não verificado em fluxo real. |
| BH4 — favoritos remapeados | maybe-false / defer | Lista de strings não tem identidade de Empresa definida no contrato; preferências não são reescritas por snapshot desde a base anterior. Confirmar identidade/semântica de favoritos na integração antes de inferir remap. Impacto potencial medium. |
| BH5 — aviso apagado por base | medium / defer | `warning=null` em qualquer intent não callback já existia, inclusive antiga view. Política de duração/dismiss precisa ser reconciliada com apresentação; não criada pela migração. |
| BH6 — profundidade excessiva | medium / patch | Percurso recursivo sem limite da nova proteção pode estourar stack em campo extra profundo; limitar profundidade local e testar erro controlado sem mutação. |
| BH7 — busca linear repetida | low / patch | assertIndex procura cada ID em array; substituir por Set local elimina custo quadrático sem alterar contrato ou adicionar política. Envelope real ~200 não foi benchmarkado por este probe de 8000. |
| BH8 — schema do envelope snapshot | false / rejeitado | `assertSnapshotData` valida catalog/models/news; manifest tem validador próprio no reader e `revision` é argumento explícito. Metadados raiz não consumidos não são schema da exploração. Não existe promessa de validar envelope/manifest por este wrapper; impor isso quebraria fixtures/consumidores válidos. |
| BH9 — estado literal válido | low / patch | Estados válidos derivam do próprio produtor; acrescentar fixture literal independente e atravessar contrato/reducer/serializador. |
| BH10 — lote misto e merge remap | low / patch | Cobertura existente é unitária/duplicada; acrescentar lote válido+inválido e many-to-one sem mudar contrato. |
| VG1 — câmera fora do Globo | medium / patch | Evidência pré-verificada: guarda nova não possui chamada negativa direta; testar MODELOS/NOTÍCIAS e estado anterior intacto. |
| VG2 — integração demo | medium / patch | Evidência pré-verificada: teste da demo não verifica projeção/base/query, apesar da inspeção CLI; acrescentar assertions no teste executável. |

Sem intent_gap/bad_spec nesta rodada. Patches são correções locais ou novas assertions, sem superfície pública nova. Achados corrigidos da rodada 1 permanecem cobertos pelos 27 testes direcionados; BH5/BH7 anteriores seguem defer e não são reabertos.

### Fechamento da revisão

- Patches da rodada 2 aplicados pelo Lead (handoff síncrono não devolveu endereço reutilizável do implementador): query vazia aceita; profundidade limitada a 128; Set para referências; fixture literal independente; lote misto/merge; teste negativo de câmera; assertions de integração da demo. Duas falhas reproduzidas antes dos patches, depois 33/33 testes direcionados incluindo demo e 103/103 totais.
- Seis itens de integração/preexistentes registrados em [trabalho diferido](deferred-work.md); nenhum achado confirmado desta implementação ficou sem correção. Resultado potencial entre instâncias/favoritos explicitamente não verificado, não reivindicado como prova.
- Auditoria da matriz: configuração/aliases/precedência em AC3; segurança em AC6 e testes de getters/profundidade; concorrência em AC4 e invalidação URL/navegação/aba. Todos executados, zero skips. AC1 com estados povoados; AC2 patches unitários; AC5 coexistência/saída confirmados.

## Verification

- `node --test tests/exploration-contract.test.mjs tests/exploration.test.mjs` — 32/32 testes passaram, nenhum ignorado; matriz e AC1–AC6 cobertos, incluindo exigências da rederivação.
- `npm test` — 103/103 testes passaram, nenhum ignorado (baseline restaurado: 78).
- `npm run check` — 52 módulos válidos em Node 25.9.0 (baseline: 51).
- `npm run demo:local` — simulação com `externalCalls: 0`, projeção `3D`, base `SAT`, URL canônica `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`.
- `git diff --check` — sem erros de whitespace.
