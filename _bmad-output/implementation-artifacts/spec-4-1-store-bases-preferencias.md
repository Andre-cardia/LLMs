---
title: '4.1 — Estado, bases e preferências no store compartilhado'
type: 'feature'
created: '2026-10-12'
status: 'done'
completion_scope: 'accepted-local-contract-store-url-v2'
human_acceptance: 'acceptance-4-1-local.md'
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

### Aceite humano do escopo local — registrado em 2026-10-12

Andre aceitou explicitamente a entrega local após walkthrough e demonstrações, incluindo CR-01 e mantendo todos os diferidos. O [registro de aceite](acceptance-4-1-local.md) delimita a evidência e as exclusões. O status atual é `done` **somente no escopo local aceito**; as notas históricas abaixo sobre aceite pendente descrevem a situação anterior e foram preservadas. Não conclui 7.1, Épico 4, UI/Cesium ou produção. Próximo passo autorizado: planejar o incremento local de 7.1 e obter aprovação antes de implementar.

### Review Findings

#### Code review independente — 2026-10-12, 22:02 -03:00

Escopo: baseline `50ba405` → HEAD `e7867d3`, oito arquivos executáveis/testes/demo, 883 inserções e 58 remoções. Árvore limpa antes do registro. Revisão completa contra esta especificação e o [contexto do Épico 4](epic-4-context.md). Quatro revisores independentes executados: `blind-hunter` apresentou os dez candidatos abaixo; `edge-case-hunter`, `verification-gap` e `acceptance-auditor` retornaram sem achados. Todos os candidatos receberam veredito individual antes do agrupamento; nenhuma causa foi agrupada.

**Resultado:** 0 `decision_needed`, 1 `patch`, 8 `defer`, 1 rejeitado. Os diferidos não representam oito regressões: quatro são comportamentos locais preexistentes e quatro são riscos de integração com impacto potencial médio ainda não verificado. Andre escolheu aplicar o único patch; CR-01 foi corrigido e verificado no fechamento abaixo. Os oito itens diferidos permanecem inalterados; não há patch desta revisão aguardando implementação.

- [x] [Review][Patch] **CR-01 — Percurso exponencial de referências compartilhadas** — `medium`; source: `blind-hunter` (BH1). [exploration.mjs:13–28](../../src/contracts/exploration.mjs#L13-L28). O conjunto `seen` detecta apenas o caminho recursivo atual e remove cada objeto ao retornar; um grafo acíclico que reutiliza o mesmo filho em `a` e `b` é percorrido repetidamente. Probe no reducer com intent `base` e campo extra contendo 17/19/21 objetos distintos levou aproximadamente 40/125/538 ms para produzir o mesmo erro de campos incompatíveis; o estado permaneceu íntegro. O custo cresce exponencialmente antes da rejeição estrutural, sem atingir profundidade 128, bloquear getters ou exigir Proxy. Impacto confirmado: bloqueio síncrono da chamada programática ao contrato; não há alegação de ataque remoto ou impacto medido no navegador. Corrigir o percurso local para evitar revalidação exponencial, mantendo detecção de ciclos, descritores/protótipos e limite de profundidade em todos os caminhos; acrescentar regressão de referências compartilhadas no contrato/reducer. Não exige alterar API, critérios ou primitives.

- [x] [Review][Defer] **CR-02 — Snapshot promove override de Empresa à sessão** — `medium`; source: `blind-hunter` (BH2). [exploration-state.mjs:115–117](../../src/domain/exploration-state.mjs#L115-L117). Deferred: preexistente na baseline, que também copiava a Empresa efetiva para a sessão e apagava o override. Probe: selecionar Empresa 1 → hidratar Empresa 2 → atualizar snapshot inalterado → hidratar URL vazia mantém Empresa 2; sem refresh, retorna à Empresa 1. Reconciliar em 7.1 a origem da seleção e a política de remoção de overrides, sem apresentar como regressão v2.

- [x] [Review][Defer] **CR-03 — Renovação de digitação depende do consumidor** — `maybe-false`, impacto potencial `medium` não verificado; source: `blind-hunter` (BH3). [exploration-state.mjs:118–120](../../src/domain/exploration-state.mjs#L118-L120). Deferred: tokens são renovados e o callback antigo é ignorado, mas um callback com token/revisão atuais conclui corretamente; ambos reproduzidos. A renovação já existia e o reducer retorna o novo estado observável. Não existe consumidor de digitação integrado que demonstre travamento. Verificar, na UI, observação/reagendamento/conclusão imediata após refresh, antes de adicionar efeitos ou mudar o protocolo.

- [x] [Review][Defer] **CR-04 — Entrega manual fora de ordem pode regredir snapshot** — `medium`; source: `blind-hunter` (BH4). [exploration-state.mjs:108–120](../../src/domain/exploration-state.mjs#L108-L120). Deferred: preexistente e já registrado. Enviar explicitamente revisão `two` e depois `one` termina em `one`. Isso prova ausência de ordenação no reducer, não corrida no fluxo integrado: [SnapshotReader:8–21](../../src/application/snapshot-reader.mjs#L8-L21) já descarta refresh superado. Provar ordenação no controlador futuro; não comparar revisões opacas lexicograficamente.

- [x] [Review][Defer] **CR-05 — Callback entre instâncias pode colidir** — `maybe-false`, impacto potencial `medium` não verificado; source: `blind-hunter` (BH5). [exploration-state.mjs:32](../../src/domain/exploration-state.mjs#L32) e [52–57](../../src/domain/exploration-state.mjs#L52-L57). Deferred: risco já registrado. Probe roteando deliberadamente um callback de Empresa 1 para outra instância com Empresa 2, mesmo token e revisão, encerra a digitação da segunda. Não há caller atual que faça essa troca; os tokens são locais. Testar disposal/subscriptions e isolamento do adapter para confirmar ou refutar o dano em uso real.

- [x] [Review][Defer] **CR-06 — Cancelamento físico da câmera precisa de prova do renderer** — `maybe-false`, impacto potencial `medium` não verificado; source: `blind-hunter` (BH6). [exploration-state.mjs:49](../../src/domain/exploration-state.mjs#L49) e [91–95](../../src/domain/exploration-state.mjs#L91-L95). Deferred: sair do Globo zera a operação e invalida o callback corretamente; não emite efeito de cancelamento. Nenhum renderer consome o efeito atualmente, portanto não foi demonstrada animação indevida. Na integração 4.2, testar se o adapter observa a invalidação e interrompe/descarta operações anteriores. Câmera física está explicitamente fora de 4.1; não criar nova intent por hipótese.

- [x] [Review][Defer] **CR-07 — Falha de câmera depende do contrato de integração** — `maybe-false`, impacto potencial `medium` não verificado; source: `blind-hunter` (BH7). [exploration-state.mjs:52–62](../../src/domain/exploration-state.mjs#L52-L62) e [exploration.mjs:113–115](../../src/contracts/exploration.mjs#L113-L115). Deferred: callback com campo adicional `status: failed` é recusado, conforme o shape atual; operação suporta pending/completed. Não há renderer ou caller de erro que fique travado, nem requisito local de outcome de falha. Na integração, exercitar falha/aborto real e decidir sua representação com evidência, sem confundir ausência de API futura com defeito comprovado agora.

- [x] [Review][Defer] **CR-08 — URL sem Empresa não limpa sessão selecionada** — `medium`; source: `blind-hunter` (BH8). [exploration-url.mjs:18](../../src/domain/exploration-url.mjs#L18) e [25](../../src/domain/exploration-url.mjs#L25). Deferred: preexistente, já registrado e explicitamente excluído das correções desta fatia. Probe serializando seleção nula e hidratando numa sessão com Empresa 1 mantém Empresa 1. Resolver semântica de roundtrip/limpeza em 7.1, sem escolher agora novo sentinel de URL.

- [x] [Review][Defer] **CR-09 — Ação independente apaga aviso de remoção** — `medium`; source: `blind-hunter` (BH9). [exploration-state.mjs:70](../../src/domain/exploration-state.mjs#L70). Deferred: preexistente e já registrado. Probe remove Empresa selecionada, obtém `company-unavailable` e troca base; aviso torna-se null. O reset geral existia antes da migração; reconciliar duração/dismiss com apresentação, sem introduzir política visual nesta revisão.

**Verificação executada nesta revisão:** `npm test` passou 103/103, zero skips; `npm run check` validou 52 módulos em Node 25.9.0; `npm run demo:local` confirmou `externalCalls: 0`, projeção 3D, base SAT, URL canônica e `persistEffects: []`; `git diff --check` passou. Probes adicionais executados em memória, sem alterar fontes/testes. Tempos do CR-01 são observações locais, não limiares de aceitação nem benchmark de produção. Os testes existentes naquele momento não cobriam a amplificação por referências compartilhadas.

#### Fechamento do patch CR-01 — 2026-10-12, 22:06 -03:00

- Autorização: Andre escolheu **1 — aplicar agora**, exclusivamente CR-01. Base de aplicação: `e7867d33c4b26419a06eb765e3a800e0e8746753`. Os dois registros de revisão já estavam modificados antes deste patch e foram preservados; nenhuma mudança foi feita nos oito itens diferidos.
- [Validador:13–49](../../src/contracts/exploration.mjs#L13-L49): `WeakMap` por chamada memoriza altura máxima de subgrafos concluídos. `seen` continua exclusivo ao caminho ativo; o reuso verifica profundidade atual + altura, sem ignorar ciclos, descritores, protótipos ou o limite de 128. Cache nunca atravessa chamadas. A assinatura, schemas e shapes públicos permanecem iguais; primitives/store/URL e protótipos não foram alterados.
- [Regressões CR-01:8–76](../../tests/exploration-contract.test.mjs#L8-L76): cinco testes novos. Antes do patch, dois falharam demonstrando 15.017 inspeções de chaves para 13 objetos distintos; depois, o mesmo grafo exigiu 20. Testes verificam rejeição do campo extra pelo reducer sem mutação, caminhos compartilhados rasos/profundos em ambas as ordens, 128 aceito/129 recusado, ciclos e invalidação do cache entre chamadas com getter/protótipo alterado. A instrumentação temporária é restaurada em `finally`; não se usa timeout como critério de desempenho.
- Verificação pós-patch: **38/38 testes direcionados incluindo demo**, **108/108 totais**, zero skips; **52 módulos** válidos em Node 25.9.0. Demo executado e validado: `externalCalls: 0`, projeção 3D, base SAT, URL canônica e efeitos de persistência vazios.
- Revisão independente focada do patch: **nenhum achado confirmado**; além de 8/8 testes do contrato, o revisor executou 1.524 probes limitados de profundidade/ordem com arrays/objetos, limpeza após erro e reuso, ciclos e grafo altamente compartilhado de 128 níveis (129 recusado). Esta revisão não reabre os diferidos nem declara integração/UI/produção testadas.
- CR-01 encerrado; 1 patch corrigido, 0 novas ações de patch, 8 diferidos e 1 rejeitado preservados. O status de acompanhamento passa a `in-progress` porque permanecem achados médios diferidos não resolvidos e aceite humano pendente; isso não significa falha do patch nem autoriza implementar os diferidos. Nenhum commit, push ou deploy foi realizado nesta correção.

#### Rejected

- **CR-10 — Validador/versionamento próprio para efeitos** — `false`; source: `blind-hunter` (BH10). [exploration-state.mjs:77–95](../../src/domain/exploration-state.mjs#L77-L95). A falta de um validador separado é verdadeira, mas não demonstra divergência: a especificação define o shape exato do efeito local de câmera, e os [testes:225–234](../../tests/exploration.test.mjs#L225-L234) e [257–265](../../tests/exploration.test.mjs#L257-L265) verificam patches unitários e o efeito completo. Não existe adapter consumidor incompatível ou efeito inválido reproduzido. Exigir nova versão/validator alteraria a superfície acordada sem defeito demonstrado; rejeitado como obrigação desta Story.

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
- Encerramento Git: Andre escolheu explicitamente **Manter sem commit** no checkpoint final. Nenhum commit, push ou deploy realizado por este fluxo. Na checagem final foi observado HEAD externo `8de2490a28e17518af712d8396fef9ae4877fda5` (precedido por `a099be99729d8b0ab59853937f399a835b0e82aa`), incorporando código e artefatos; histórico e alterações concorrentes preservados. Spec done representa Build concluído; sprint permanece review para aceite humano.
- Seis itens de integração/preexistentes registrados em [trabalho diferido](deferred-work.md); nenhum achado confirmado desta implementação ficou sem correção. Resultado potencial entre instâncias/favoritos explicitamente não verificado, não reivindicado como prova.
- Auditoria da matriz: configuração/aliases/precedência em AC3; segurança em AC6 e testes de getters/profundidade; concorrência em AC4 e invalidação URL/navegação/aba. Todos executados, zero skips. AC1 com estados povoados; AC2 patches unitários; AC5 coexistência/saída confirmados.

## Verification

- `node --test tests/exploration-contract.test.mjs tests/exploration.test.mjs` — 32/32 testes passaram, nenhum ignorado; matriz e AC1–AC6 cobertos, incluindo exigências da rederivação.
- `npm test` — 103/103 testes passaram, nenhum ignorado (baseline restaurado: 78).
- `npm run check` — 52 módulos válidos em Node 25.9.0 (baseline: 51).
- `npm run demo:local` — simulação com `externalCalls: 0`, projeção `3D`, base `SAT`, URL canônica `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`.
- `git diff --check` — sem erros de whitespace.
