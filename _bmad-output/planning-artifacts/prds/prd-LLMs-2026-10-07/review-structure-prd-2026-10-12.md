# Revisão editorial — estrutura

**Documento revisado:** [prd.md](prd.md)  
**Propósito e público:** Este PRD existe para ajudar Andre e os autores de UX, arquitetura e épicos a definir e decompor a v1 pessoal do Íris Global.  
**Modelo escolhido:** Strategic/Context (Pyramid), apropriado para PRDs: prioridade e contexto antes dos requisitos detalhados.  
**Métrica exata:** 8.575 palavras no documento; contagens por seção obtidas com `word_metrics.py`.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | §3 — Glossário (804 palavras) | **PRESERVE** antes dos requisitos. | O vocabulário controlado aparece ao longo de 40 FRs e prepara leitores humanos para os detalhes. As definições longas são úteis para distinguir termos do produto; não recomendo movê-las para um apêndice. Impacto: 0 palavras. |
| structure | §9.1 — Dentro (184 palavras) | **PRESERVE** como checklist conciso de escopo e rastreabilidade. | A lista oferece uma conferência rápida do MVP antes dos FRs detalhados. Ela separa o Globo principal das capacidades geográficas complementares, por isso mantenha as entradas e referências. Impacto: 0 palavras. |
| structure | FR-1 — Exibir Empresas no Globo (172 palavras), em especial: “Terreno, edifícios e contexto fotorealístico enriquecem o Globo em zoom próximo nas bases e áreas compatíveis, sem mudar Pontos, Filtros ou seleção.” (22 palavras) | **CONDENSE** para: “As camadas descritas em FR-32 não alteram Pontos, Filtros ou a Empresa selecionada.” (13 palavras). | FR-32 (332 palavras) já especifica terreno, edifícios e a transição fotorealística por zoom. A frase concisa preserva a regra de estado que não está no resumo de FR-32. Redução estimada: 9 palavras de FR-1. |
| structure | FR-32 — Navegação e bases do Globo (332 palavras) e FR-40 — Carregamento de detalhe geográfico (147 palavras) | **PRESERVE** a divisão atual entre comportamento da navegação/base e carregamento, atribuição, cache e falha das camadas geográficas. | A repetição anterior foi consolidada. FR-32 declara explicitamente o MAPA de fundo bem escuro e a transição automática de SAT para fotorealismo em zoom próximo; FR-40 referencia essa transição e mantém os requisitos de detalhe cartográfico e tiles. Não recomendo nova fusão. Impacto: 0 palavras. |
| structure | §11 — Questões em aberto (428 palavras) | **PRESERVE** como registro central de gates após os requisitos. | A introdução sinaliza decisões pendentes e aponta para §11; o registro no fim mantém responsáveis e momentos de revisão juntos para o handoff. Impacto: 0 palavras. |

**Resumo:** 5 recomendações; redução estimada de **9 palavras (cerca de 0,1% de 8.575)**. Não foi informado limite de extensão. A condensação mantém a regra de interação, apontando a descrição das camadas para FR-32. O antigo ponto de repetição entre FR-32 e FR-40 está resolvido.
