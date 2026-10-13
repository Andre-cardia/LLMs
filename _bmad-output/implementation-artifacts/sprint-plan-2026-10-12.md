---
project: LLMs
product: Íris Global
planned: 2026-10-12
timezone: America/Sao_Paulo
readiness: CONCERNS
scope: contratos e regras locais com fixtures
fullProductReady: false
productionAuthorized: false
---

# Plano de sprint — Íris Global

## Objetivo e tracking

Preparar o estado e a URL para o Globo principal sempre 3D com bases MAPA/SAT, preservando os filtros, a seleção, as Relações e o Terminal. O [tracking](sprint-status.yaml) contém **oito épicos e 35 Stories: três concluídas no escopo local e 32 em backlog**.

A autorização de Andre para continuar após a revisão com nove grupos de gates abertos permite este planejamento local. A aprovação de requisitos/escopo/critérios está no [registro das 35 Stories](../planning-artifacts/approvals/story-approvals-reconciled-2026-10-12.json); o progresso de execução tem evidências próprias.

## Primeira sequência de trabalho

| Ordem | Story | Trabalho elegível | Condição de saída |
|---|---|---|---|
| 1 | **4.1 — Store, bases e preferências** | Migrar o contrato executável de `view/VIEWS` para `base: MAPA\|SAT`; atualizar o reducer e aliases de URL com fixtures. Base inicial recebida por configuração. | Cobrir os seis cenários aprovados da Story 4.1; publicar schema/fixtures comuns antes dos consumidores, preservar contexto e recusar intents inválidos/callbacks vencidos. |
| 2 | **7.1 — Busca e URL**, incremento local | Consumir o contrato de 4.1 na serialização/hidratação, destinos tipados e supressão por revisão. Reutilizar a Busca atual. | Entregar a parte local rastreada; teclado/toque/foco, interface e acesso real continuam pendentes de Q3/Q2 e dos consumidores integrados. A Story completa permanece aberta até seus critérios estarem atendidos. |

A Story 4.1 é a prioridade operacional. O gerador genérico pode recomendar o primeiro item em backlog, 1.1; para este objetivo use **4.1 explicitamente** ao chamar `bmad-build`. O arquivo de Story será criado pelo fluxo de implementação. Nesta rodada nenhuma Story foi promovida a ready-for-dev por existir um SPEC antigo com outro nome.

O escopo aprovado de 4.1 continua em [epics.md](../planning-artifacts/epics.md). A implementação deve conservar ESM e seguir AD-16/Q11, sem escolher a base inicial real de Q6. A migração de URL trata `base` como canônico; `view=MAPA|SAT` é alias; `view=3D` não escolhe base e `view=2D` usa a configuração inicial.

## Fundamentos existentes a reconciliar depois

| Story atual | Próxima ação local |
|---|---|
| 1.1 | Conferir last-good, regra de coleção completa/incremental e publicação contra os critérios atuais; reutilizar guard/update/reader. |
| 1.2 | Conferir reservas, categorias, ledger UTC e marcos 80%/100% contra o escopo atual; chamadas continuam simuladas. |
| 1.5 | Criar/conferir cálculo de cadência com política/calendário injetados; não iniciar cron remoto. |
| 2.1 | Conferir decisões staged, rejeição/reapresentação, versões/idempotência e undo antes da publicação. |
| 2.2 | Conferir quota global e origem por campo com propostas sintéticas; não criar seed real ou descoberta externa. |
| 5.1 | Conferir aliases/dedup, dataRevision/feedbackRevision, supressão nas projeções/Busca/contexto e sinais de foco consumidos pela UI. |

São candidatos a incrementos ou revisão de conformidade, com conclusão condicionada ao escopo atual. A evidência histórica de componentes locais permanece no [mapa de reconciliação](sprint-scope-reconciliation-2026-10-12.json). A ordem posterior pode ser ajustada conforme os contratos e o resultado da Story 4.1.

## Progresso preservado

| Story | Evidência de conclusão local | Limite |
|---|---|---|
| 3.1 — Custo por tarefa | [SPEC](spec-model-cost-fixtures.md), [verificação histórica](model-cost-fixtures-verification.json), contrato de preços/cálculo no código atual. | Cálculo puro com fixtures; a interface integrada é trabalho de 3.5. |
| 3.2 — Datas/Lançamentos | [SPEC de consultas](spec-local-model-queries.md), [verificação histórica](local-core-verification.json), contratos e resolução local de datas. | Famílias/variantes e Pulso calculado; APIs e renderização permanecem nas respectivas Stories. |
| 3.3 — Comparação/filtros | Mesmo SPEC/verificação; projeção e ordenação locais em model-queries. | Regras locais; API/UI em 3.4/3.5. |

Os três estados `done` representam esses escopos locais já entregues. O Epic 3 fica in-progress; 3.4 e 3.5 continuam em backlog. Os outros épicos conservam seus fundamentos históricos no mapa e entram no novo tracking sem conclusão transferida automaticamente.

## Pendências antes das integrações

O [relatório de prontidão](../planning-artifacts/reviews/sprint-readiness-2026-10-12.md) registra nove grupos abertos: Q1/Q7, Q2, Q3, Q4, Q5, Q6, Q8, Q9 e Q11-implementação. O mapa associa cada grupo às Stories afetadas.

A sequência Cesium após 4.1 é **4.2 adapter → 4.3 composição/camadas → 4.4 Empresas → 4.5 Relações/prévias → 4.6 Terminal/som → 4.7 acabamento**. Cada parte recebe os gates e contratos anteriores antes de ser iniciada. BACKBONES é 8.1, com Q4 próprio. Fotorealismo permanece automático em SAT, MAPA permanece escuro e nenhum controle de voos foi acrescentado.

Este plano não define duração, velocidade de equipe ou data de entrega. A rodada produziu tracking e reconciliação; não iniciou implementação nem reexecutou testes de produto.
