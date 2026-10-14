---
project: LLMs
checked: 2026-10-12
architectureReadyToStart: true
fullImplementationReady: false
productionAuthorized: false
---

# Prontidão e continuação

Projeto inequívoco: **LLMs — Monitor Global de Labs de LLM**, `/Users/andrecardia/Github/LLMs`. Cadastro do Codex identifica LLMs nesse caminho; configuração resolvida usa `project_name: LLMs`; PRD tem título correspondente. Não é Bíblia Harness nem mapas mentais.

## Estado encontrado

- BMAD instalado, configuração de módulo registra 6.12.1; skills disponíveis em `.agents/skills`.
- PRD final atualizado em 12/10, FR-1 a FR-40; §11 mantém gates antes das stories geográficas.
- Andre confirmou em 10/10 que concluiu a UX e autorizou iniciar Architecture se ainda não iniciada. Os arquivos UX conservam frontmatter `draft`; sua conclusão declarada é aceita sem alterar os arquivos.
- No inventário do baseline de 10/10, ainda não havia arquitetura/épicos/stories/sprint. O spine foi criado em 10/10 e retomado em 12/10 para a extensão CesiumJS, concluída após o reviewer gate. `main` continua sem commit; os artefatos BMAD seguem untracked. Preservar, sem add/reset/commit/clean.
- Codex **“Get BMad workflow guidance”**, ID `01a1239f-ae42-77f2-b9fd-dedf8fc02a59`, estava idle; último turno completed finalizou PRD e recomendou `bmad-architecture`. A tarefa atual **“Continuar projeto LLMs BMAD”** é a execução desta continuidade.
- Nenhum AGENTS.md foi encontrado em projeto/ancestrais ou árvore relevante. `.env` não foi lido. Inventário por conteúdo permitido e hash baseline, sem segredos.

## Ação desta execução

Retomada do run existente de `bmad-architecture`, sem reiniciar contratos ou IDs. O PRD final e Andre definem CesiumJS 1.146 como renderer do Globo principal sempre 3D, com bases MAPA/SAT, terreno, edifícios compatíveis e transição automática SAT→fotorealismo em zoom próximo coberto. MAPA usa cartografia escura com detalhe OSM ao aproximar; não há voos adicionais por Empresa/região. Busca/filtros e navegação/foco por câmera existentes permanecem no store/produto. O protótipo e os 35 pontos são apenas referência/fixtures. Q3/Q6/Q8/Q9 e Q11 delimitam UX/acessibilidade, providers/base inicial, Localizações reais, carregamento e migração do estado/URL. Evidências e handoff estão em `technology-evidence.md` e `cesium-integration.md`.

O contrato permite prosseguir com fundações em fixtures: identidade/valores, publicação consistente, curadoria/DESFAZER, status/last-good e orçamento. Não inicia infraestrutura paga ou integrações sem os gates respectivos. AD-16 exige schemas/fixtures compartilhados antes de stories independentes de cada fronteira. A seed de 35 Empresas via descoberta exige pelo menos quatro janelas semanais da quota do PRD; não foi criada exceção. Criar o SPEC companion mantém FR/AD estáveis; depois decompor épicos/stories com a UX vigente e gates.

## Decisões antes das partes afetadas

| ID | Decisão/evidência necessária | Dono | Bloqueia |
| --- | --- | --- | --- |
| Q1 | Verba adicional e limite de suspensão do chat/busca | Andre | Stories de chat e ativação |
| Q2 | Provedor e camada autenticada decididos em 14/10 (AWS, AD-9). Faltam persistência de controle com CAS/lease/fencing, agendador, IaC, região, custo/quota, isolamento por ambiente e provas de auth/CAS/recovery | Andre + arquitetura | Infra real, autenticação integrada, publicação, dado real no navegador |
| Q3 | Globo sempre 3D com bases MAPA/SAT é decisão do PRD; UX fecha controles móveis, ordem/foco por muitos Pontos, legibilidade/contraste, teclado/toque, leitor de tela, reduzir movimento e detalhes pendentes de Leitor/horários | UX | Stories do Globo e superfícies afetadas |
| Q4 | Proveniência/licença/atualização e vínculos cabo-estação | Arquitetura + Andre | Escolher fonte/habilitar/publicar BACKBONES |
| Q5 | Matriz de instrumentos, symbols, unidade/moeda, calendários, fallback e histórico | Arquitetura | Stories MERCADOS/cotações reais |
| Q6 | Base inicial MAPA ou SAT; selecionar e provar composição/provider compatíveis com os comportamentos fixos do PRD (MAPA escuro/OSM no zoom; SAT amplo e transição/fallback fotorealísticos; terreno e edifícios compatíveis); fechar cobertura/licença, créditos, credenciais, custo/quota, cache/Referer, limiares/histerese e temas | Arquitetura + UX + Andre | Stories do Globo e ativação de provider |
| Q7 | LLMs/preços/busca, tamanho resumo, retenção/exclusão do Histórico | Arquitetura + Andre/UX | Stories de geração/Histórico e cobrança |
| Q8 | Significado de cada localização, precisão e evidência específica vinculada a ela; permitir ausência/aproximação sem declarar endereço preciso e descartar os pontos demonstrativos | Andre | Contrato compartilhado e stories que mostrem localizações reais |
| Q9 | CDN ou NPM/Vite preservando módulos `.mjs`; assets/workers, CSP/cache, WebGL, browsers/dispositivos, desempenho e fallback; sem conversão de linguagem presumida | Arquitetura | Scaffold e habilitação das bases/camadas |
| Q10 | Resolvido: Globo principal sempre 3D, bases MAPA/SAT, transição fotorealística automática em SAT, terreno e edifícios compatíveis; sem voos. Store, busca/filtros e navegação/foco existentes permanecem | Andre/PRD | Escopo definido; Q3/Q6/Q8/Q9/Q11 bloqueiam as stories afetadas |
| Q11 | Decisão fechada: estado `base: MAPA|SAT`, URL canônica `base`; aliases legados `view=MAPA|SAT`, `view=3D` sem base, `view=2D` cai na base inicial. Implementar schema/fixtures comuns via AD-16 | Domain/Contracts + UI | Story do store/URL; base inicial depende de Q6 |

Esses gates não autorizam reduzir FR-31 a FR-40. A lista de corte do PRD continua exclusiva para itens acordados.

## Provas e limites

Reviewer gate concluído: rubric aprovável após corrigir o estado de ciclo de vida para `final`; revisão de seams PASS; revisão tecnológica PASS; reconciliação PASS. O lint documental final retornou `ok: true`, zero achados. Isso valida os contratos escritos, não a integração de CesiumJS nem providers reais.

Esta retomada alterou apenas artefatos de planejamento. Não foram executados scaffold/build, testes de produto, browser/acessibilidade/performance, APIs privadas, chamadas de provider, custos reais ou jobs agendados. Nenhuma publicação, deploy, compra, migração ou alteração de segredo foi feita.
