# Revisão do rubric walker — Architecture Spine

**Alvo:** `ARCHITECTURE-SPINE.md`  
**Data:** 2026-10-12  
**Veredito:** PASS COM AJUSTE EDITORIAL (um achado médio, não bloqueia decomposição após esclarecer Q6)

## Escopo e referências consultadas

Revisão independente do spine contra a checklist *Good-spine* em `.agents/skills/bmad-architecture/references/reviewer-gate.md`. O PRD final e o addendum foram consultados para conferir cobertura e alinhamento da decisão Cesium; `coverage.md` e as definições atuais de exploração/URL foram consultados como evidência auxiliar de cobertura e brownfield. Nenhum outro arquivo foi alterado.

## Achados

### [MÉDIO] Q6 mantém em aberto receitas de produto já decididas

Q6 diz que a arquitetura ainda deve “definir receita única por base/tema”, mas AD-17 já fixa as semânticas exigidas: MAPA escuro com detalhe OSM ao aproximar; SAT com imagery ampla e transição automática para fotorealismo coberto em zoom próximo; terreno em ambas; edifícios somente quando compatíveis; falhas e retornos específicos. O PRD final e o addendum registram os mesmos comportamentos como decisões de produto. A redação atual mistura esses requisitos resolvidos com as decisões genuinamente abertas de Q6 e pode levar épicos/stories a reabrir o comportamento ou duplicar essa definição.

**Ação recomendada:** editar Q6 para preservar esses comportamentos como entradas fixas e limitar o gate à escolha da base inicial, composição tecnicamente compatível, providers/fontes/licenças, cobertura, credenciais, custos, atribuição, cache, thresholds/histerese e provas de falha/desempenho. Não é necessário mudar AD-17.

## Checklist Good-spine

- **Divergências do nível abaixo:** atende. AD-10 consolida store, filtros, foco, projeções, câmera e URL; AD-13/17 definem as fronteiras geográficas e os fallbacks. Q3, Q6, Q8, Q9 e Q11 nomeiam gates antes das stories afetadas.
- **Regras executáveis e prevenção:** atende no nível de arquitetura. As regras são prescritivas e ligam proprietários, estados, transições e falhas observáveis. AD-17 é extenso, mas especifica composição e fronteiras que serão verificáveis em stories.
- **Deferred e divergência entre unidades:** atende com a ressalva de Q6 acima. A escolha da base inicial, fornecedores e detalhes de integração ficam adiados explicitamente; Q11 define compatibilidade URL e migração sem habilitar Vista 2D.
- **Tecnologias atuais:** atende. CesiumJS 1.146 está fixado e a release oficial 1.146, de 01/10/2026, foi verificada como release atual na data da revisão. Isso valida a atualidade do número, não compatibilidade de provedores ou a composição visual.
- **Brownfield:** atende com migração explicitada. O código atual mantém `view`/`VIEWS` e serializa `view`; Q11 registra a evolução para `base`, aliases legados e precedência, e AD-16 exige contrato executável e fixtures antes das stories consumidoras. Nenhuma implementação foi alegada.
- **Cobertura do PRD:** atende. O frontmatter vincula FR-1 a FR-40; as regras AD-2 a AD-17 cobrem as capacidades, com responsabilidade e gates detalhados também no `coverage.md`. As capacidades Cesium de FR-32/FR-40 aparecem em AD-10, AD-13 e AD-17.
- **Herança:** não há indicação de spine-pai herdado. A conciliação reconhece UX anterior como rascunho e registra explicitamente que o PRD final posterior prevalece sobre as quatro Vistas antigas.
- **Dimensões da altitude:** atende. AD-14 define isolamento por ambiente, recuperação, operação, logs e medições; AD-9 trata acesso; Q2 mantém provedores de hospedagem e identidade como decisão anterior às stories de infraestrutura; Q6 explicita provedores geográficos/custos/licenças. Os gates estão visíveis, sem fingir que decisões ainda abertas foram aprovadas.

## Evidência de alinhamento Cesium

O spine mantém o Globo em projeção 3D com duas bases MAPA/SAT, sem controles novos de voos. Preserva a store e a navegação atuais, deixa coordenadas demonstrativas fora de fatos curados e especifica transição automática do fotorealismo com retorno à imagem SAT. Terreno, prédios compatíveis, cobertura, créditos, fallback, credenciais e custo aparecem como composição/gates. A nota sobre o quickstart Google, que desativa o globo padrão, evita presumir que a composição SAT + terreno + tileset esteja comprovada.

## Resumo do gate

O spine cobre o PRD, respeita as mudanças de brownfield e explicita o envelope operacional. Aplicar a clarificação recomendada em Q6 para retirar a duplicidade entre decisões do produto já fixadas e escolhas técnicas ainda abertas; o restante não revela finding crítico ou alto.

## Reverificação

Após a revisão inicial, Q6 foi alterado para declarar os comportamentos MAPA/SAT/transição/fallback como fixos e limitar o gate às escolhas técnicas e à prova da composição. O revisor rubric confirmou que o achado está fechado; a base inicial, os provedores e a composição compatível permanecem intencionalmente em aberto.
