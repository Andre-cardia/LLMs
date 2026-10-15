---
project: LLMs
product: Íris Global
planned: 2026-10-13
last_reviewed: 2026-10-15
timezone: America/Sao_Paulo
readiness: CONCERNS
scope: planejamento da continuidade de 7.1 após aceite local
fullProductReady: false
productionAuthorized: false
baseline_commit: ce39ffaa4da4a584612b49f6d1760b9f18b87927
reviewed_commit: 278bf46feafe3f685fb14ae21b1752fb0ba4dde8
---

# Continuidade de sprint — Story 7.1

## Objetivo

Preparar o shell de navegador que integra Busca e URL ao reducer e aos contratos compartilhados. O núcleo local de 4.1 está `done`; o incremento local de 7.1 foi aceito e sua Story integral permanece `in-progress`. A revisão de 15/10 incorpora o [spine final do Epic 7](../planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md), o manifesto v2, MergeDecision e o wrapper único do store, já implementados em commits concorrentes.

Estado do sprint: **35 Stories, 4 concluídas localmente, 1 em andamento e 30 em backlog**. Não promover 7.1 a `done` pela conclusão do SPEC local. A [avaliação atual](../planning-artifacts/reviews/sprint-readiness-2026-10-13-continuacao-7-1.md) detalha decisões de UX, código observado e dependências restantes.

## Sequência de execução

| Ordem | Workflow | Entrega concreta | Condição para avançar |
|---|---|---|---|
| Concluído | Architecture + fundações | Spine final AD-18 a AD-25, manifesto v2 com `companyMergedInto`, MergeDecision e `createExplorationStore`. | Código atual verificado: 180 testes e 59 módulos. Não repetir esses incrementos. |
| 1 | **`bmad-build` — shell de navegador, continuação 7.1** | SPEC novo para `src/ui/`, consumindo `LocalSearch`, reader/view e o store único conforme o spine. | Respeitar AD-19 a AD-25, fixtures sintéticas e limites de UI; não reabrir o SPEC local congelado nem repetir seu aceite. |
| 2 | Implementação do shell aprovado | Raiz única, escritor de endereço, Web Crypto, fonte sintética, diálogo de Busca, descarte e publicação em `/app` pelo build atual. | Testar tabela total de intents, URL, digest e lifecycle; provas de navegador nos critérios afetados. |
| 3 | Integração AWS / Q2, fatia própria | IaC e posterior integração Cognito/API Gateway/Lambda/S3, conforme AD-9/AD-26/AD-27. | Região, ferramenta, custos, permissões e provas resolvidos antes de provisionamento ou dados reais. |
| 4 | Fechamento da Story integral | Matriz Q3, autenticação/revogação Q2, destinos financeiros Q5 e extensão Q11 quando afetarem os critérios. | Somente concluir 7.1 quando seus critérios estiverem comprovados; shell com fixtures não fecha autenticação nem MERCADOS. |

O próximo passo recomendado é **`bmad-build` para o shell de navegador de 7.1**. A recomendação inicial de Architecture foi superada pelos commits de 14–15/10. O wrapper AD-18 já está pronto; o shell ainda não existe. Usar contexto novo e informar o incremento explicitamente: **“bmad-build — shell de navegador da Story 7.1, conforme AD-19 a AD-25; reutilizar exploration-store; separar IaC AWS”**. Ler este plano, o spine do Epic 7 e os aceites de 4.1/7.1.

## Mapa para o próximo handoff

| Arquivos atuais | Papel no incremento |
|---|---|
| `src/contracts/search.mjs`, `navigation.mjs`, `exploration.mjs` | Schemas e identidades existentes; sem formatos paralelos. |
| `src/application/exploration-store.mjs`, `local-search.mjs`, `local-news-view.mjs`, `snapshot-reader.mjs` | Wrapper único já pronto; consulta por frame, manifesto v2 e remaps acumulados. Reutilizar portas síncronas e lifecycle definidos. |
| `src/domain/exploration-state.mjs`, `exploration-url.mjs` | Escritor semântico único e contrato URL; browser só envia intents. |
| `src/ui/browser-shell.mjs`, `address-writer.mjs`, `web-digest.mjs`, `fixture-source.mjs`, `index.html` (a criar) | Raiz única, History API por AD-19, digest hex com fixture não ASCII, fonte sintética marcada e descarte AD-23. |
| `mockups/prototype-artificial-analysis.html` | Referência da Busca; o consumidor integrado substitui seus handlers demonstrativos. Caminho completo: `_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/`. |
| `scripts/build-ui-preview.mjs`, `scripts/check-local.mjs`, `amplify.yml`, `customHttp.yml` | Aplicar AD-25: incluir `/app` com imports preservados, impedir adapters/Node no bundle e configurar headers específicos; manter o preview atual. |
| DESIGN/EXPERIENCE principal e variante AA | Consumir decisões Q3 novas, claro/escuro e conteúdo imediato; provas de browser permanecem condição de entrega. |

## Critérios a transportar para o novo SPEC

- Dada a revisão de dados/feedback autorizada, ao consultar/ativar Empresa, Modelo, ticker do Cadastro ou Notícia, retornar identidade canônica e abrir o destino correto. Instrumentos adicionais exigem contrato próprio já aprovado.
- Dada URL canônica/legada ou Back/Forward, aplicar AD-19/AD-24 sem persistir overrides ou transportar conversa/segredos. Exportar `INTENT_TYPES`; `company=` e separação sessão/link já estão aceitos. A resolução de links anteriores a merge exige o incremento Q11/v3, separado da migração de base já concluída.
- Dada ocultação, remoção, negação, revogação ou nova intenção durante uma operação, limpar dados indevidos e impedir retorno tardio de reabrir conteúdo.
- Dado uso por teclado/toque, abrir com foco no campo, ativar o item escolhido, aplicar Esc à camada correta e devolver foco; Artificial Analysis mostra conteúdo imediato e reduzir movimento conserva funções.
- Dada destruição/recriação do consumidor ou snapshot com remaps, cancelar subscriptions/trabalho antigo e aplicar remaps explícitos antes de consolidar remoções.

## Limites preservados

Os aceites locais e seus SPECs não mudam. A página extra de demonstração dispensada no aceite não será recriada; `/app` é a entrada operacional de shell definida pelo AD-25, com referência visual AA e procedência sintética explícita. Não escolher nova base de produção, provider, linguagem/bundler ou serviço pago por inferência. AWS já está decidida no spine pai; provisionamento e acesso real continuam Q2. Q5/Q6/Q8/Q9 condicionam as demais partes afetadas, e a matriz Q3 deve ser executada.

Este plano atualiza a rota operacional. Commit, publicação e produção precisam manter o escopo de autorização correspondente; o preview já autorizado não equivale à autorização do produto integrado.
