---
project: LLMs
product: Íris Global
checked: 2026-10-13
last_reviewed: 2026-10-15
workflow: bmad-sprint-planning
gate: CONCERNS
fullImplementationReady: false
productionAuthorized: false
baseline_commit: ce39ffaa4da4a584612b49f6d1760b9f18b87927
reviewed_commit: 278bf46feafe3f685fb14ae21b1752fb0ba4dde8
---

# Prontidão para a continuidade da Story 7.1

## Resultado

**CONCERNS: arquitetura e fundações locais do consumidor estão prontas; faltam o shell de navegador, as provas de interface e a camada AWS autenticada.** O pedido “Pode seguir” autoriza avaliar a continuidade e atualizar o planejamento, após a revalidação de 4.1 nesta conversa. Não é necessário repetir os aceites locais nem reconstruir o que já foi entregue.

O [novo plano](../../implementation-artifacts/sprint-plan-2026-10-13-continuacao-7-1.md) substitui a sequência operacional de 12/10. Sua primeira redação é de 13/10; a revisão final de 15/10 incorpora os commits concorrentes `591c658`, `9643d92`, `dd62293` e `278bf46`. O próximo passo é especificar o shell conforme o [spine final do Epic 7](../architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md), sem repetir a arquitetura já concluída.

## Estado confirmado

| Item | Evidência atual | Consequência |
|---|---|---|
| 4.1 | [Aceite local](../../implementation-artifacts/acceptance-4-1-local.md), contrato v2, reducer e URL canônica | `done` no escopo local aceito; não reabrir a migração de `view/VIEWS`. |
| 7.1 local | [Aceite](../../implementation-artifacts/acceptance-7-1-local.md), [SPEC](../../implementation-artifacts/spec-7-1-busca-url-local.md), `LocalSearch` e testes | Incremento concluído; Story integral continua `in-progress`. CR-02/CR-08 resolvidos localmente. |
| Tracking | Gerador em dry-run e status oficial | 8 épicos, 35 Stories: 4 `done`, 1 `in-progress`, 30 `backlog`; 3 épicos em andamento e 5 em backlog. Sem órfãos, status ilegais ou promoção automática. |
| Aprovação do escopo | SHA-256 de `epics.md` e dos 35 blocos de Story | Correspondem ao registro aprovado de 12/10. Emendas de arquitetura e UX têm registros posteriores; os critérios aprovados permanecem iguais. |
| UX de 13/10 | DESIGN/EXPERIENCE e herança Artificial Analysis | Decisões Q3 registradas; prova da implementação continua necessária. Três fontes UX diferem do snapshot de aprovação, como esperado pelas novas decisões. |
| Arquitetura do consumidor | Spine final do Epic 7, AD-18 a AD-25; emendas AD-9/AD-26/AD-27 no spine pai | Entrada `/app`, store, escritor de URL, digest Web Crypto, fixtures, descarte, aliases e build registrados. AWS decidida para código/acesso; Q2 conserva pendências de implementação, custo e prova. |
| Fundações posteriores | SPECs `spec-manifest-v2-company-merged-into.md`, `spec-merge-decision-curadoria.md` e `spec-exploration-store-wrapper.md`, todos `done`; código e testes atuais | Manifesto v2, merges pela Fila e wrapper síncrono já implementados; não refazê-los no shell. |
| Frontend | `scripts/build-ui-preview.mjs`, HTML Artificial Analysis e `amplify.yml`; `src/ui/` ainda ausente | Build ainda copia mockups para `dist/ui`; falta executar AD-25 para incluir `/app`. A Busca do mock usa arrays e handlers próprios. |

O aviso do parser para `## Epic List` continua sendo o título do índice: os oito épicos e as 35 Stories foram reconhecidos. Não requer alteração dos épicos aprovados.

## Q3 e Q11: decisão escrita e prova executável

**Q3:** a atualização de UX registra emblema, controles móveis, teclado, foco, contraste, semântica acessível, reduzir movimento e a matriz de evidência: Chrome/Safari macOS, Safari iOS, Chrome Android e VoiceOver macOS. Isso resolve as decisões documentadas nessas áreas. As capturas e o checklist dessa futura integração ainda precisam ser executados; escolher a matriz não equivale a passar nela.

A forma geral da Busca ainda aparece como *spine-only* em EXPERIENCE § Component Patterns e como pendência no item 19, enquanto o preview Artificial Analysis já possui um diálogo. O Build deve usar esse diálogo como referência e reconciliar o handoff do incremento, sem declarar aprovados todos os visuais de todas as famílias. O escopo de destinos também deve ser explícito: o núcleo atual resolve tickers do Cadastro para Empresa/Terminal; instrumentos e índices adicionais dependem dos contratos de MERCADOS/Q5.

**Q11:** contrato/store/URL canônicos v2 já estão implementados e testados localmente. AD-19 agora define `pushState`/`replaceState` por intent, `popstate` e agrupamento de substituições; AD-24 define `select` → `company` e `tab=globo` → `globe`. Exportar `INTENT_TYPES`, implementar os aliases e adotar os contratos no navegador são tarefas do próximo incremento. A extensão que resolve Empresa mesclada em links antigos exige `EXPLORATION_VERSION` 3 e continua separada; não confundir isso com o remap já transportado pelo manifesto v2. A base inicial real permanece Q6.

## Dependências da integração de 7.1

| Dependência | Trabalho necessário antes da parte afetada |
|---|---|
| Consumidor e entrada | Implementar `src/ui/` com uma raiz de composição e publicar `/app` pelo build atual, conforme AD-20/AD-21/AD-25. Mapear IDs canônicos aos elementos e usar Web Crypto, sem `src/adapters/` ou `node:`. |
| Q2 / acesso | AWS já decidida: Amplify para código/fixtures; Cognito → API Gateway JWT → Lambda → S3 privado para dados reais. Faltam recursos, IaC/região, custos e provas. O shell com fixtures é elegível antes dessa infraestrutura; não satisfaz autenticação. |
| URL do navegador | Implementar a tabela e o escritor único AD-19, exportação `INTENT_TYPES` e aliases AD-24; testes por portas injetadas. |
| BH3 / store | Reutilizar `createExplorationStore`, já implementado em `src/application/`. Manter dispatch síncrono, efeitos no listener da raiz e proteção de reentrância. Não criar segundo wrapper. |
| BH5 / remaps | Superado pelo manifesto v2: tabela acumulada `companyMergedInto` atravessa frame e Busca. Preservar o validador único e provar o consumo pelo shell; não inferir substituição por nomes. |
| Lifecycle / Q3 | Implementar o descarte na ordem AD-23 e provar foco, Esc, toque, teclado e ausência de reabertura por resultado vencido. |

Os demais grupos Q1/Q7, Q4, Q5, Q6, Q8 e Q9 permanecem nas respectivas partes afetadas. A Busca local não autoriza chat, fontes pagas, geodados reais ou integração Cesium. O registro [de diferidos](../../implementation-artifacts/deferred-work.md) foi atualizado pelos commits concorrentes e é preservado nesta rodada.

**Continuidade a observar no próximo Build:** o Deferred do spine do Epic 7 ainda chama CR-02 de preexistente, mas o aceite local e os testes atuais comprovam a correção de sessão/override. Não reabrir esse item. Permanecem a extensão Q11 para links antigos e o resultado de Busca antigo de Empresa mesclada que pode devolver `unavailable`, além dos diferidos atuais de MergeDecision (versões, limite/poda e retirada sem sobrevivente). Não ampliar o shell para corrigir todos esses itens por inferência.

## Verificação e limites

Na revisão final de **15/10**, `npm run validate` passou no HEAD `278bf46feafe3f685fb14ae21b1752fb0ba4dde8`: **180 testes, zero falhas/skips e 59 módulos**. A primeira conferência desta conversa tinha 132 testes e 55 módulos; esses números são históricos após os commits concorrentes. Nenhuma das suítes prova o shell ou autenticação real.

A conferência inicial protegeu 87 arquivos e confirmou sua preservação antes dos commits concorrentes. A comparação posterior detectou 19 mudanças desses arquivos, explicadas pelos novos commits; foram incorporadas à leitura, sem reversão. Uma nova baseline de **91 arquivos** protege os fontes/testes e documentos já inventariados durante o fechamento, incluindo as novas implementações. Esta rodada altera apenas o tracking e estes dois documentos; preserva código, aceites, diferidos e UX. Os testes foram repetidos porque havia código novo. Nenhum commit/push/deploy foi executado por este fluxo.

O histórico de aprovação e o mapa de reconciliação de 12/10 ficam preservados. O tracker aponta para esta avaliação atual; os documentos históricos não devem ser usados como estado presente.
