# Pass 1 de cobertura — delta Artificial Analysis claro

Data: 2026-10-12. Distilação obrigatória de Finalize `bmad-ux`; **não é revisão formal opt-in**, não executa lenses extras nem modifica a linha original. Par novo: [DESIGN](../variants/artificial-analysis-light/DESIGN.md) e [EXPERIENCE](../variants/artificial-analysis-light/EXPERIENCE.md). O status `final` se aplica só ao contrato de variante; originais continuam `draft` e não foram reescritos.

## 1. Flow coverage — delta coberto; integração herdada

Fontes lidas: memlog UX, spines originais, [reconciliação do existente](reconcile-aa-existing-2026-10-12.md), [referência observada](../imports/artificial-analysis-reference-2026-10-12.md), PRD/addendum, SPEC/arquitetura/contratos, exemplos canônicos e spec/validate da skill. Herança explícita evita duplicar os quarenta FR como escopo novo.

| Fonte / necessidade | Key Flow na variante | Cobertura |
|---|---|---|
| Novo template completo e light independente | VX-1. Andre abre o template claro adicional | Nome, cinco passos, clímax, falha de URL/preferência/armazenamento; defaults/preferências antigas preservados |
| UJ-1. Andre confere a manhã do setor de IA; FR-1…8/14…19/24…29/31…34 | UJ-1 na variante + Fluxos4/7 herdados | Nova entrada MODELOS → GLOBO; Empresa/Notícia/mercado, fonte falha e dados demonstrativos |
| UJ-2. Andre escolhe um Modelo barato para um projeto; FR-9…13/35/37/38 | UJ-2 + Fluxo5 herdado | Gráficos/tabela canônica, fórmula, filtro vazio, ≈/—, chat gated |
| UJ-3. Andre aprova um Laboratório novo; FR-20…23/30/31 | UJ-3 + Fluxo6 herdado | Origem/fantasma/edit/revisão/staged/compensação e falha/negado |
| FR-28/39/40, CAP-8 | CAP-8. Andre explora infraestrutura junto às Empresas | Cabo/estação/detalhe OSM/retorno; seleção/crédito/gate e fallback |
| FR-27/29/32/38; apresentação/acesso | VX-1, Foundation, IA, Interaction/Responsive | Template e estado isolados, teclado/toque, URL válida, seis temas não removidos |

Todos os fluxos novos desta variante têm Andre, passos numerados, clímax e falha. Fluxos4…7 originais permanecem por referência, sem tratar seus exemplos simulados/questões antigas como provas atuais.

## 2. Token completeness — definido; contraste da referência explicitado

DESIGN usa frontmatter com `name`, `description`, cores planas em hex, typography/rounded/spacing/components e seções na ordem canônica. EXPERIENCE usa o mesmo par e referências de tokens por nome. Tokens observados: branco/preto, borda/muted/cápsula/surfaces, botão roxo, três acentos, série de barras e medidas80/64/36/24/16/8. Sem fonte comercial copiada: Georgia e Arial/system declaradas.

Semântica de Camadas/alta/baixa é herdada; o preview adapta suas cores para a paleta clara, sem alterar paletas antigas. `{colors.muted}` é observado, mas não aprovado como texto pequeno necessário; DESIGN §Colors usa preto ou `secondary-text` #666666 nesses usos. Cor de referência não comprova contraste sobre textura. Gutter/margem/breakpoint/chaves específicas são adaptações marcadas `[ASSUMPTION]`, sem novas escolhas de produto. A composição home80/mobile54 foi capturada como adaptação do preview, separada do valor responsivo64 observado; seção da Tabela36 permanece. O principal ajustou padding16, marca preta/branca em cápsula24/fonte22 e navegação cinza com ativo preto/branco; estes valores estão no contrato final.

Checagem mecânica final após alinhar com o mock: **66 referências de tokens no DESIGN e três no EXPERIENCE, zero indefinidas; zero fontes locais ausentes e zero links locais quebrados nos dois contratos**. Todas as seções DESIGN estão na ordem canônica; EXPERIENCE contém todos os defaults e seções responsiva/inspiração aplicáveis. `mocked` não é sinônimo de acessibilidade validada.

## 3. Component coverage — delta documentado nos dois contratos

Navegação, Hero de MODELOS, Gráficos de métricas, Tabela de modelos, Globo e controles, FLUXO/LABS, Prévia/Terminal, NOTÍCIAS/Leitor, Chat, Fila de revisão, Faixa/MERCADOS, Busca/Ajuda/ajustes, BACKBONES/OSM e Aviso de demonstração têm linhas em DESIGN §Components e EXPERIENCE §Component Patterns. Nomes de grupos compostos não criam componentes de domínio duplicados; IDs/entidades e ações vêm de contratos existentes.

## 4. State coverage — delta e gates cobertos

EXPERIENCE §State Patterns percorre cada superfície IA: cold-load, normal/seleção, vazio/filtro sem resultado, foco, ausente, erro/last-good, offline/Fonte parcial, gate/negado, demo, preferências inválidas; janela/digitação/retorno, staged/compensação, chat/budget, tile/cabo indisponível e atribuição. Status real é herdado da política da arquitetura. Não há permissão de custear ou publicar pela nova aparência.

## 5. Visual reference coverage — mock promovido; QA conduzida pelo principal

| Artefato/superfície | Classificação nesta primeira entrega | O que comprova |
|---|---|---|
| `imports/artificial-analysis-home-2026-10-12.jpg` | Import observado, ligado inline no DESIGN/EXPERIENCE | Referência atual de home clara; não equivalência pixel a pixel nem conteúdo a copiar |
| `imports/artificial-analysis-reference-2026-10-12.md` | Evidência local ligada inline | Home e /models, paleta/fontes/medidas, fallback e uso visual |
| `.working/prototype-artificial-analysis.html` | Mock salvo e inspecionado por texto depois da primeira gravação; runtimeQA ainda não executado nesta subtask | Hero home80/mobile54, três gráficos com seis barras, destaque do Modelo na Tabela, barra de ferramentas global e dados demo |
| `mockups/prototype-artificial-analysis.html` | Mock promovido pelo principal e aberto no browser; esta subtask conferiu contrato/texto, sem executar runtimeQA | Superfícies demonstrativas do programa no novo visual; nenhum produto/backend real inferido |
| `mockups/templates.html` | Galeria nova existente, ligada nos contratos; construída pelo principal | Novo template independente e acesso à linha original |
| MODELOS: hero+três gráficos+tabela | Mocked no HTML de trabalho, leitura do código/CSS/DOM | Delta estrutural central, fonte de dados local de MODELS; título36 e seleção por gráfico; sem benchmark/marca copiados |
| GLOBO/FLUXO/LABS/Terminal/NOTÍCIAS/Leitor/Chat/Fila/MERCADOS | Mocked por herança no HTML novo e regras claras próprias; interações ainda sem runtimeQA desta subtask | Funções de demonstração permanecem; badges/demo em Chat/Leitor/Fila/MERCADOS; não prova backend |
| BACKBONES/OSM | Comportamento no HTML original de trabalho; promovido original não tem paridade | Funções contratadas na variante; licença/provider/gates seguem abertos |
| Busca global | Mocked adicional no HTML novo | Dialog com campo e resultados locais de Empresa/Modelo/Notícia; não demonstra pesquisa web nem cobertura completa de todos os instrumentos de MERCADOS |
| Ajuda/2D/SAT/teclado completo/estados de falha/login | Spine-only ou cobertura antiga incompleta | Contratos permanecem; nenhum mock novo é presumido como implementação |

As spines declaram uma única vez precedência no âmbito da variante e nomeiam o que cada import/HTML ilustra. O HTML novo de trabalho, o promovido e a galeria existem e seus links resolvem. Não inventariamos como orphans todos os artefatos históricos da linha original: eles pertencem ao contrato herdado, não ao delta desta sessão. O namespace `mg-aa-*` foi identificado no wrapper de armazenamento do HTML; esta subtask não executou a prova de ausência de gravação nas chaves originais. O principal informou JS sem erros ao abrir; verificações funcionais e capturas permanecem com ele e não são extrapoladas neste relatório.

## Reconciliação do pedido e dos inputs adicionais

| Ideia/entrada | Destino | Resultado |
|---|---|---|
| “Mais um template do programa” | Scope/template-id, Foundation/IA, VX-1 e galeria | Mantém seis temas e artefatos; delta do programa inteiro |
| “Estilo Artificial Analysis atual, mesmas cores e light mode” | DESIGN tokens/Brand/Colors/Typography/Layout e import observado | Fonte visual atual, claro em todas as superfícies; fontes locais substitutas e limites declarados |
| Composição editorial, três cards de métricas e tabela | MODELOS default, Hero/Gráficos/Tabela nos dois contratos | Vai além de recolorir HUD; métrica/fórmula/IDs herdados |
| Preservar Globo/Notícias/Chat/mercados/revisão/cabos/OSM | IA/Components/Key Flows/State e herança FR-1…40 | Todos alcançáveis pelo contrato; integração ainda não provada |
| Preservar seis temas/defaults | Variant-only, light-only, Templates/galeria, namespace mg-aa-* | Preferências/artifacts originais não lidos/regravados |
| Não copiar marca/logos/benchmarks | DESIGN Do's and Don'ts e Voice/Graph/estado demo | Conteúdo do Monitor Global com fixtures visíveis |
| Tokens observados enviados pelo principal | YAML/Components e ressalva de contraste/fallback | Capturados; nenhuma fonte proprietária redistribuída |
| Reconciliação do existente | Foundation/precedência/gates e tabela de cobertura | Atualizações PRD/arquitetura prevalecem sobre pendências históricas resolvidas |

Não identifiquei ideia qualitativa atual descartada na distilação. Não acrescentei dark mode à variante, Premium, novas métricas, novas contas, backend ou nova cobertura de fontes.

## Lacunas antigas, separadas do delta

- Original DESIGN/EXPERIENCE continuam `draft`; possuem pendências históricas/afirmações de escopo novo já resolvidas em PRD/SPEC/arquitetura. A variante referencia a autoridade posterior, sem finalização retroativa.
- HTML promovido original e HTML de trabalho diferem em BACKBONES/OSM; assets presentes nas duas pastas não comprovam comportamento igual.
- Protótipos não provam autenticação, Fonte licenciada, publicação/revisão real, Histórico persistido, busca/inferência paga, quota, tiles ou atendimento integral de mobile/teclado/contraste/performance.
- Os seis temas, logos no zoom/transição ASCII, 2D/SAT e estados de erro têm dívidas de representação/validação já registradas; esta sessão não os resolve por troca visual nem os remove.

## Próximo ajuste permitido

O mock novo já foi salvo/promovido: nomes de controles/chaves, composição, links e indicadores demo foram conferidos por texto; `mocked` versus `spine-only` está acima. Capturas e QA funcional/layout finais são conduzidas pelo principal; qualquer ajuste de composição pode ser refletido neste delta sem tocar a linha original. Essa conferência obrigatória de cobertura não inicia revisão formal ou opt-in adicional, não contrata serviços e não altera a política dos gates.
