---
project: LLMs
product: Íris Global
checked: 2026-10-12
workflow: bmad-sprint-planning
gate: CONCERNS
trackingGenerated: true
fullImplementationReady: false
productionAuthorized: false
---

# Prontidão e reconciliação do sprint

## Resultado

**CONCERNS — tracking gerado para execução local, com nove grupos de integração abertos.** Andre pediu “continue” após a recomendação de Sprint Planning para reconciliar IDs e planejar o trabalho elegível. Essa instrução cobre a continuidade com as pendências já apresentadas; sua delegação de aprovação das Stories permanece no escopo documentado.

O [plano de trabalho](../../implementation-artifacts/sprint-plan-2026-10-12.md) prioriza **4.1**, depois a parte local de **7.1**. Um desenvolvedor pode executar esses incrementos com as decisões já registradas e configuração/fixtures injetadas. A implementação integrada completa exige as decisões/provas dos grupos abaixo.

## Inventário e rastreabilidade

Foram identificados por conteúdo: PRD final/addendum; spine final, contracts, cesium-integration e implementation-readiness; pares DESIGN/EXPERIENCE principal e Artificial Analysis; um documento atual de épicos/Stories; registros de aprovação; sete SPECs locais, verificações anteriores e local-plan.json.

O pacote normativo conserva os **dez hashes** do registro reconciliado de aprovação. Os **35 blocos de Story e o hash completo de epics.md** correspondem às versões aprovadas. Não há versão shard concorrente dos épicos. O local-plan é histórico de execução de fatias e tem 29 entradas; o lote inicial de aprovação tem 32 e o pacote atual tem 35. São três bases distintas, reconciliadas por título/escopo e evidência.

A [revisão documental anterior](epics-planning-review-2026-10-12.md) cobre 40/40 FR, 41/41 UX-DR, NFRs e AD-1 a AD-17. As leituras atuais confirmam as decisões relevantes para o sprint: Globo principal sempre 3D, base canônica MAPA/SAT, MAPA escuro e fotorealismo automático em SAT; AD-16 antes dos consumidores e gates explicitamente mantidos. O nome atual do PRD é Íris Global; o identificador de projeto continua LLMs.

## Achados tratados nesta rodada

| Achado | Tratamento |
|---|---|
| IDs do local-plan divergem do pacote atual | [Mapa de reconciliação](../../implementation-artifacts/sprint-scope-reconciliation-2026-10-12.json) preserva 29 origens e liga cada uma aos IDs atuais; todos os 35 IDs possuem rastreabilidade. local-plan.json e SPECs históricos ficaram íntegros. |
| done-local de escopo antigo poderia encerrar trabalho novo | Conclusão transferida somente em 3.1/3.2/3.3, cujo escopo local é equivalente e sustentado por SPEC/verificação histórica/código atual. As outras seis conclusões locais ficam como evidência parcial ou de escopo a reconciliar. |
| Estado/URL executáveis ainda usam view/VIEWS | Leitura de src/contracts/exploration.mjs, exploration-url.mjs e exploration-state.mjs confirma a migração pendente. 4.1 define a nova fronteira e precede o incremento 7.1. |
| Estados padrão não expressam gates de integração | O YAML conserva vocabulário BMAD; metadados apontam à prontidão, à reconciliação e à próxima Story. workDisposition/integrationGates estão no JSON por Story. |
| Parser avisa sobre “## Epic List” | Aviso aceito como título do índice, sem omissão de Story. Oito épicos/35 IDs foram conferidos. epics.md aprovado ficou preservado por hash. |

O gerador não encontrou orphans, status ilegais ou arquivos de Story correspondentes que elevassem automaticamente itens a ready-for-dev. Os slugs, incluindo acentos e limite de comprimento, foram mantidos exatamente como o script os produziu.

## Grupos abertos

| Grupo | Decisão/evidência necessária | Responsável registrado |
|---|---|---|
| Q1/Q7 | Fornecedores LLM/busca, preços, verba/tetos separados, tamanho editorial e política de retenção/exclusão. | Andre + Arquitetura/UX |
| Q2 | Hospedagem/IdP/custo e provas de autorização, transações/CAS/fencing, jobs, rollback, recuperação e sete dias operacionais. | Andre + Arquitetura |
| Q3 | Acabamento/emblema, controles móveis, ordem e retorno de foco, teclado/toque, contraste, leitores de tela e evidência de browser. | UX |
| Q4 | Proveniência/data/licença e associação confirmada entre cabos e estações para BACKBONES. | Arquitetura + Andre |
| Q5 | Matriz de instrumentos, símbolos/listagens, unidades/moedas, calendários, histórico e cobertura principal/reserva. | Arquitetura |
| Q6 | Base inicial, providers/composição/coverage, credenciais, licença, custo/quota/cache/créditos e limiares/histerese. | Arquitetura + UX + Andre |
| Q8 | Significado, precisão, evidência de Localização real e regras de classe visual, seleção e limite de câmera. | Andre + Domain/Contracts |
| Q9 | Estratégia de runtime Cesium, assets/workers/CSP/cache/WebGL e matriz de browser/dispositivo/desempenho/recuperação. | Arquitetura |
| Q11-implementação | Contrato executável compartilhado base=MAPA|SAT e aliases de URL; implementar decisão já fechada antes dos consumidores. | Domain/Contracts + UI |

Q10 e a decisão arquitetural de Q11 estão resolvidos. Q11-implementação é trabalho executável, previsto em 4.1/7.1. A base inicial real depende de Q6; nas fixtures ela é parâmetro, sem escolha de produção inferida.

Questões de execução e decisões locais podem ser tratadas com `bmad-build`; detalhes de interação com `bmad-ux`; providers/runtime/infra e contratos com `bmad-architecture`; mudanças de requisito com `bmad-prd` ou `bmad-correct-course` quando afetarem várias fontes. Fechar um grupo exige sua decisão/evidência, preservando a aprovação de requisitos já obtida.

## Status das 35 Stories

| ID | Desenvolvimento | Disposição de trabalho | Gates da integração afetada |
|---|---|---|---|
| 1.1 | backlog | local-conformance | Q2 |
| 1.2 | backlog | local-conformance | Q1/Q7, Q2 |
| 1.3 | backlog | blocked-integration | Q2, Q3 |
| 1.4 | backlog | blocked-integration | Q2 |
| 1.5 | backlog | local-conformance | Q1/Q7, Q2, Q5 |
| 1.6 | backlog | blocked-integration | Q2 |
| 2.1 | backlog | local-conformance | Q2 |
| 2.2 | backlog | local-conformance | Q2 |
| 2.3 | backlog | blocked-integration | Q2, Q3, Q8 |
| 2.4 | backlog | blocked-integration | Q2, Q3, Q8 |
| 2.5 | backlog | blocked-integration | Q2, Q3 |
| 3.1 | done | complete-local | Escopo local |
| 3.2 | done | complete-local | Escopo local |
| 3.3 | done | complete-local | Escopo local |
| 3.4 | backlog | blocked-integration | Q2 |
| 3.5 | backlog | blocked-integration | Q3 |
| 4.1 | backlog | local-delta | Q6, Q11-implementação |
| 4.2 | backlog | blocked-integration | Q3, Q6, Q9 |
| 4.3 | backlog | blocked-integration | Q3, Q6, Q9 |
| 4.4 | backlog | blocked-integration | Q3, Q8 |
| 4.5 | backlog | blocked-integration | Q3, Q8 |
| 4.6 | backlog | blocked-integration | Q3 |
| 4.7 | backlog | blocked-integration | Q3, Q9 |
| 5.1 | backlog | local-conformance | Q2 |
| 5.2 | backlog | blocked-integration | Q1/Q7, Q2 |
| 5.3 | backlog | blocked-integration | Q3 |
| 5.4 | backlog | blocked-integration | Q3, Q4, Q6 |
| 6.1 | backlog | blocked-integration | Q5 |
| 6.2 | backlog | blocked-integration | Q2, Q5 |
| 6.3 | backlog | blocked-integration | Q3, Q5 |
| 6.4 | backlog | blocked-integration | Q3, Q5 |
| 7.1 | backlog | local-delta | Q3, Q11-implementação |
| 7.2 | backlog | blocked-integration | Q1/Q7, Q2, Q3 |
| 7.3 | backlog | blocked-integration | Q1/Q7, Q2, Q3 |
| 8.1 | backlog | blocked-integration | Q3, Q4, Q9 |

Resumo: **três done no escopo local, 32 backlog; sete épicos backlog e Epic 3 in-progress; oito retrospectivas optional**. Existem oito candidatos a trabalho local, incluindo 7.1 após 4.1; outras 24 Stories aguardam os gates da parte integrada. As candidaturas locais não declaram a Story completa pronta ou o produto concluído.

## Linhagem do local-plan histórico

Esta tabela é a migração das **29 entradas de local-plan.json**, por conteúdo. A linhagem do lote de aprovação inicial de 32 permanece no registro de aprovação reconciliado; seus IDs não são usados para interpretar o local-plan antigo.

| ID/título no local-plan | IDs atuais | Status histórico | Tratamento |
|---|---|---|---|
| 1.1 — Preservar uma revisão completa em Atualizações locais | 1.1, 1.3, 1.6 | done-local | Evidência/histórico preservados; status atual separado |
| 1.2 — Controlar orçamento e tentativas em simulação | 1.2, 1.5 | done-local | Evidência/histórico preservados; status atual separado |
| 1.3 — Servir assets/dados privados e autenticar comandos | 1.4 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 1.4 — Agendar e recuperar Atualizações no repositório durável | 1.5, 1.6 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 2.1 — Revisar Empresas/Relações sem publicar antes da Atualização | 2.1, 2.2 | done-local | Evidência/histórico preservados; status atual separado |
| 2.2 — Conferir seed e logos antes da primeira publicação | 2.3 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 2.3 — Operar a Fila com prévias e resolução de pares/logos | 2.4 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 2.4 — Desfazer dados já publicados com compensação auditável | 2.5 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 3.1 — Calcular custo por tarefa com preços ausentes/zero | 3.1 | done-local | done preservado no escopo local equivalente |
| 3.2 — Resolver datas e perceber Lançamentos únicos | 3.2 | done-local | done preservado no escopo local equivalente |
| 3.3 — Consultar a comparação com filtros combinados | 3.3 | done-local | done preservado no escopo local equivalente |
| 3.4 — Normalizar APIs estruturadas e identidade por Fonte | 3.4 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 3.5 — Apresentar HÍBRIDO/TERMINAL/ANALÍTICO e linha expandida | 3.5 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 4.1 — Manter estado semântico e preferências coerentes | 4.1 | done-local | Evidência/histórico preservados; status atual separado |
| 4.2 — Mostrar Empresas/identidades/último Pulso nas Vistas | 4.2, 4.4, 4.5 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 4.3 — Interagir com Terminal e som pelo teclado/toque | 4.6 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 4.4 — Aplicar os seis temas e acesso completo no celular | 4.7 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 5.1 — Projetar e ocultar Notícias nas cinco superfícies | 5.1 | done-local | Evidência/histórico preservados; status atual separado |
| 5.2 — Validar resumo/relevância sem dar ferramentas ao Agente | 5.2 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 5.3 — Operar Fluxo/LABS/NOTÍCIAS e Leitor com contexto | 5.3 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 5.4 — Manter atribuição em todas as projeções | 5.4 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 6.1 — Confirmar instrumentos/cobertura/calendários e fallback | 6.1 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 6.2 — Atualizar cotações com atrasos e sessões corretos | 6.2 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 6.3 — Explorar Faixa e Painel MERCADOS | 6.3, 6.4 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 7.1 — Buscar entidades locais e restaurar contexto da URL | 7.1 | done-local | Evidência/histórico preservados; status atual separado |
| 7.2 — Pesquisar com ações/citações versionadas e orçamento | 7.2 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 7.3 — Retomar e excluir Histórico privado | 7.3 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 8.1 — Validar fonte/licença e explorar BACKBONES | 8.1 | blocked-integration | Evidência/histórico preservados; status atual separado |
| 8.2 — Trocar satélite/OSM com cache e fallback | 4.3 | blocked-integration | Evidência/histórico preservados; status atual separado |

## Conferência e limites

O gerador oficial produziu e validou o YAML com escrita atômica. A validação de formato/IDs/status, a correspondência por hashes e a cobertura do mapa foram conferidas. Os resultados são documentais; os relatos de testes de 10/10 permanecem históricos.

**84 arquivos preexistentes** foram registrados por hash antes das escritas, incluindo fontes, testes, package.json, artefatos de implementação, documentos normativos, epics.md e ambos os registros de aprovação. A conferência final exige esses hashes íntegros. O novo tracking e seus companions são os únicos artefatos produzidos nesta rodada.

Nenhum código de aplicação foi alterado, teste de produto adicionado/executado, browser/API/provider chamado, segredo lido, infraestrutura/cron remoto iniciado ou stage/commit/push/deploy feito.

## Próxima ação

Usar `bmad-build` na **Story 4.1**, limitada ao contrato/store/URL e fixtures. Ler o plano e o mapa antes de consumir IDs/status antigos. O relatório CONCERNS permanece válido até decisões/provas novas; epics.md continua draft como registrado na validação anterior.
