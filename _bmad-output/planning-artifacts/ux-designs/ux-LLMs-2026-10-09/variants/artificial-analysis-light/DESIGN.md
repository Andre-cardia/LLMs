---
name: Monitor Global — Artificial Analysis
description: Família editorial padrão do Monitor Global, claro inicial e escuro opcional, inspirada no Artificial Analysis. Mantém domínio e funções, Notícias inspiradas no Yahoo Finance e fundos experimentais do Globo; os seis temas anteriores permanecem como alternativas.
status: final
created: 2026-10-12
updated: 2026-10-12
template-id: artificial-analysis
mode: light
modes: [light, dark]
scope: visual-variant-only
sources:
  - ../../DESIGN.md
  - ../../EXPERIENCE.md
  - ../../.memlog.md
  - ../../imports/artificial-analysis-reference-2026-10-12.md
  - ../../imports/yahoo-finance-reference-2026-10-12.md
  - ../../mockups/assets/news-original-sources.js
  - ../../.working/reconcile-aa-existing-2026-10-12.md
  - ../../.working/reconcile-aa-default-yahoo-2026-10-12.md
  - ../../../../prds/prd-LLMs-2026-10-07/prd.md
  - ../../../../prds/prd-LLMs-2026-10-07/addendum.md
  - ../../../../../specs/spec-llm-labs-globe/SPEC.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/cesium-integration.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/contracts.md
colors:
  background: '#FFFFFF'
  text: '#000000'
  border: '#D9D9D9'
  muted: '#787878'
  secondary-text: '#666666'
  navigation: '#E7E7E7'
  muted-surface: '#F5F5F5'
  models-ground: '#F1F2F4'
  globe-ground: '#ECEDEF'  # Conferido no preview; tom final ainda experimental.
  news-accent: '#6001D2'  # Aproximação visual Yahoo; reservada à apresentação de Notícias.
  primary: '#741A66'
  on-primary: '#FFFFFF'
  metric-intelligence: '#8842FD'
  metric-speed: '#FDE002'
  metric-cost: '#FF7734'
  chart-series-1: '#34A853'
  chart-series-2: '#50C971'
  chart-series-3: '#CC785C'
  chart-series-4: '#1F1F1F'
  chart-series-5: '#0089F4'
  chart-series-6: '#736CD3'
  chart-series-7: '#FF6900'
  chart-series-8: '#2243E6'
  layer-laboratorios: '#8842FD'
  layer-chips: '#CC785C'
  layer-nuvem: '#0089F4'
  layer-energia: '#D87527'
  layer-software: '#736CD3'
  positive: '#257B3C'
  negative: '#B53C32'
  # Modo escuro: adaptação do projeto, não paleta medida no Artificial Analysis.
  dark-background: '#101114'
  dark-surface: '#18191D'
  dark-surface-2: '#24262B'
  dark-border: '#34363E'
  dark-text: '#F2F2F3'
  dark-muted: '#A8ABB3'
  dark-accent: '#C092FF'
  dark-on-accent: '#101114'
  dark-navigation-active: '#F2F2F3'
  dark-navigation-active-text: '#101114'
  dark-news-accent: '#C092FF'
  dark-globe-ground: '#25272D'
  dark-globe-original: '#1B1D22'
  dark-globe-black: '#08090B'
typography:
  editorial:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.12'
  editorial-home:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 80px
    fontWeight: '400'
    lineHeight: '1.05'
  editorial-home-responsive:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 64px
    fontWeight: '400'
    lineHeight: '1.05'
  editorial-home-mobile:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 54px
    fontWeight: '400'
    lineHeight: '1.05'
  card-heading:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.2'
  body:
    fontFamily: 'Arial, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'Arial, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  brand:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: 22px
    fontWeight: '400'
    lineHeight: '1.1'
  data:
    fontFamily: 'Arial, system-ui, sans-serif'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
  code:
    fontFamily: 'ui-monospace, Menlo, Consolas, monospace'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  DEFAULT: 8px
  card: 8px
  button: 8px
  navigation: 24px
  square: 0px
spacing:
  reference-card-padding: 16px
  card-padding: 16px
  metric-marker: 16px
  navigation-y: 8px
  navigation-x: 12px
  gutter: 16px
  page-margin: 24px
  page-margin-mobile: 16px
  header: 72px
  tools: 54px
  header-mobile: 108px
components:
  navegacao:
    background: '{colors.navigation}'
    color: '{colors.text}'
    borderRadius: '{rounded.navigation}'
    paddingBlock: '{spacing.navigation-y}'
    paddingInline: '{spacing.navigation-x}'
    activeBackground: '{colors.text}'
    activeColor: '{colors.background}'
  hero-modelos:
    background: '{colors.background}'
    typography: '{typography.editorial-home}'
  graficos-de-metricas:
    background: '{colors.background}'
    borderColor: '{colors.border}'
    borderRadius: '{rounded.card}'
    padding: '{spacing.card-padding}'
    markerSize: '{spacing.metric-marker}'
  tabela-de-modelos:
    background: '{colors.background}'
    color: '{colors.text}'
    typography: '{typography.data}'
  palco-globo:
    background: '{colors.globe-ground}'
  noticias-editoriais:
    background: '{colors.background}'
    color: '{colors.text}'
    accent: '{colors.news-accent}'
    borderColor: '{colors.border}'
    fontFamily: '{typography.body.fontFamily}'
    headlineWeight: '700'
  paineis-claros:
    background: '{colors.background}'
    color: '{colors.text}'
    borderColor: '{colors.border}'
    borderRadius: '{rounded.card}'
  botao-acao:
    background: '{colors.primary}'
    color: '{colors.on-primary}'
    borderRadius: '{rounded.button}'
  aviso-demonstracao:
    background: '{colors.muted-surface}'
    color: '{colors.text}'
    typography: '{typography.label}'
  navegacao-escura:
    background: '{colors.dark-surface}'
    color: '{colors.dark-text}'
    activeBackground: '{colors.dark-navigation-active}'
    activeColor: '{colors.dark-navigation-active-text}'
    borderRadius: '{rounded.navigation}'
  paineis-escuros:
    background: '{colors.dark-surface}'
    secondaryBackground: '{colors.dark-surface-2}'
    color: '{colors.dark-text}'
    borderColor: '{colors.dark-border}'
    borderRadius: '{rounded.card}'
  noticias-editoriais-escuras:
    background: '{colors.dark-background}'
    color: '{colors.dark-text}'
    accent: '{colors.dark-news-accent}'
    borderColor: '{colors.dark-border}'
    fontFamily: '{typography.body.fontFamily}'
    headlineWeight: '700'
  palco-globo-escuro:
    background: '{colors.dark-globe-ground}'
---

# Monitor Global — família Artificial Analysis

## Brand & Style

O **design padrão do programa inteiro**, aprovado por Andre em 2026-10-12, é a família Artificial Analysis: claro inicial e escuro opcional solicitado depois. Títulos serifados, navegação arredondada, cards de métricas e comparação legível mantêm a composição nos dois modos. A entrada sem estado válido restaurado é MODELOS, com três gráficos antes da Tabela de modelos. Globo e painéis acompanham o modo. Notícias usa a composição observada no Yahoo Finance: destaque e Principais notícias com imagem verificada da própria matéria quando disponível, manchetes relacionadas, coluna lateral e títulos sans em negrito, com acento roxo próprio da seção.

Este contrato descreve a família `artificial-analysis`; o diretório `variants/artificial-analysis-light` conserva o nome histórico da primeira entrega clara. O pedido de modo escuro substitui a regra anterior de light fixo. Galeria com oito opções: Artificial Analysis claro/escuro e seis temas anteriores. Estes preservam visuais, conteúdos, defaults internos e preferências; links de retorno foram acrescentados, com compactação do cabeçalho móvel. A regra de painéis sempre escuros em OSIRIS/Âmbar continua apenas naquela linha; os painéis Artificial Analysis acompanham o modo. O Terminal conserva nome, conteúdo e interação, com apresentação editorial imediata.

`final` identifica a conclusão documental deste delta, não produto pronto, backend ativo, lançamento ou aprovação retroativa dos [contratos originais ainda draft](../../DESIGN.md). As três opções de fundo claras foram conferidas no preview; os tons claros/escuros permanecem experimentais, com escolha final pendente de Andre. O modo escuro foi conferido em desktop/celular, incluindo troca, restauração, override de URL e Leitor; essa evidência permanece limitada ao preview. O par comportamental é [EXPERIENCE.md](EXPERIENCE.md). Herança e precedência de fontes estão em Foundation desse par; seus contratos vencem os mocks no âmbito desta família padrão.

Referência direta: [observação Artificial Analysis de 12/10](../../imports/artificial-analysis-reference-2026-10-12.md), [captura da página inicial](../../imports/artificial-analysis-home-2026-10-12.jpg), [página inicial](https://artificialanalysis.ai/) e [modelos](https://artificialanalysis.ai/models). A observação clara informa a linguagem geral; a paleta escura é adaptação própria, sem alegação de medição no Artificial Analysis. Para Notícias, [Yahoo Finance foi observado em modo escuro](../../imports/yahoo-finance-reference-2026-10-12.md): esse modo passa a ter correspondência com a apresentação escura, enquanto o claro continua adaptação. Roxos `#6001D2` no claro e `#C092FF` no escuro são aproximações/adaptações, não tokens medidos do site. Marca, logos, benchmarks e dados dos sites não foram incorporados ao produto.

## Colors

| Papel | Token | Uso |
|---|---|---|
| Fundo e leitura | `{colors.background}` / `{colors.text}` | Branco e preto no modo claro; substituição escura na tabela abaixo |
| Divisão visual | `{colors.border}` | Linhas de cards/tabela; não substituir foco ou única pista de limite de controle |
| Navegação e fundos secundários | `{colors.navigation}`, `{colors.muted-surface}`, `{colors.models-ground}` | Cápsulas, campos neutros e cabeçalho editorial de MODELOS |
| Fundo experimental do Globo | `{colors.globe-ground}` (`#ECEDEF`), `{colors.models-ground}` (`#F1F2F4`) ou `{colors.background}` (`#FFFFFF`) | Seletor Fundo do Globo: Cinza suave inicial, Cinza original ou Branco; manter textura, atmosfera, Pontos e rótulos. Não propagar aos temas originais |
| Acento de Notícias | `{colors.news-accent}` (`#6001D2`) | Links, rótulos de seção e destaque editorial; não substituir cores de Camada, alta/baixa ou métricas |
| Ação principal | `{colors.primary}` / `{colors.on-primary}` | Ação com texto branco, sem importar botão Premium ou negócio da referência |
| Métricas | `{colors.metric-intelligence}`, `{colors.metric-speed}`, `{colors.metric-cost}` | Quadrados de Inteligência, Velocidade e Custo; nomes/valores pretos, sem texto branco sobre amarelo |
| Séries do gráfico | `{colors.chart-series-1}` a `{colors.chart-series-8}` | Paleta observada de barras; série também tem nome e valor |
| Texto secundário legível | `{colors.secondary-text}` | Adaptação do preview para metadados necessários em tamanho pequeno |
| Camadas e mercado | `{colors.layer-laboratorios}`, `{colors.layer-chips}`, `{colors.layer-nuvem}`, `{colors.layer-energia}`, `{colors.layer-software}`, `{colors.positive}`, `{colors.negative}` | Cores de domínio adaptadas no preview claro; preservam cinco Camadas, direção de mercado e nomes, sem alterar paletas originais |

`{colors.muted}` conserva o valor observado no claro. Ele não é garantia de contraste WCAG AA em texto pequeno: sobre branco fica perto de 4,4:1. Texto pequeno necessário usa `{colors.text}` ou `{colors.secondary-text}` no claro, e `{colors.dark-text}` ou `{colors.dark-muted}` no escuro. Texto normal precisa ≥4,5:1, texto grande ≥3:1; estados e seleção não dependem somente de cor. Foco usa contorno preto no claro e claro no escuro, inclusive em controles de borda cinza. Sobre o Globo, rótulos têm suporte e texto do modo suficientes para leitura; conferir o contraste em cada textura.

### Aplicação dos tokens no escuro

`mode: light` no frontmatter é o default; `modes` enumera os dois modos. Tokens sem prefixo `dark-` são a base clara preservada. A adaptação escura aplica os seguintes papéis a MODELOS, GLOBO, NOTÍCIAS, Empresa, Leitor, Chat, Fila e MERCADOS; não altera fontes, dados ou cores de métricas.

| Papel | Token escuro | Valor/uso |
|---|---|---|
| Página e hero | `{colors.dark-background}` | `#101114` |
| Superfície / superfície secundária | `{colors.dark-surface}` / `{colors.dark-surface-2}` | `#18191D` / `#24262B`, cards, painéis e campos |
| Bordas | `{colors.dark-border}` | `#34363E` |
| Texto / metadados | `{colors.dark-text}` / `{colors.dark-muted}` | `#F2F2F3` / `#A8ABB3` |
| Acento / texto sobre acento | `{colors.dark-accent}` / `{colors.dark-on-accent}` | `#C092FF` / `#101114`, ações e links |
| Navegação ativa | `{colors.dark-navigation-active}` / `{colors.dark-navigation-active-text}` | `#F2F2F3` / `#101114`, contraste invertido do item ativo |
| Notícias | `{colors.dark-news-accent}` | `#C092FF`, adaptação para a apresentação escura Yahoo |
| Globo experimental | `{colors.dark-globe-ground}`, `{colors.dark-globe-original}`, `{colors.dark-globe-black}` | Cinza suave `#25272D` inicial, Cinza original `#1B1D22`, Preto `#08090B` |

Os acentos de métricas continuam `#8842FD`/`#FDE002`/`#FF7734` nos dois modos, com nomes e valores usando o token de texto do modo. Acentos de Camada e direção de mercado conservam a identidade; adequar suporte de leitura sem converter a troca de modo em novo significado.

## Typography

Victor Serif Basic e Suisse Intl foram observadas no site. O preview usa **Georgia** e **Arial/system**, sem baixar ou redistribuir as fontes proprietárias. Não se declara equivalência pixel a pixel.

`{typography.editorial}` registra o hero /models observado em 36px e serve ao título da seção de Tabela no preview. `{typography.card-heading}` nomeia os cards em 24px. A entrada MODELOS desta alternativa adota a composição home aprovada: `{typography.editorial-home}` em 80px com descrição/ações ao lado, seguida dos três cards. `{typography.editorial-home-responsive}` registra a escala 64px da referência; o preview usa `{typography.editorial-home-mobile}` em 54px no celular como adaptação de composição. Não transformar todas as telas operacionais em hero de 80px. Corpo, filtros, tabela e painéis usam sans; monoespaçada em `{typography.code}` é reservada a IDs, códigos e conteúdo que a exige, sem tornar toda a aplicação HUD.

NOTÍCIAS usa sans e manchetes em negrito, conforme a composição Yahoo observada. GT America foi observada na referência; Arial/system serve como substituta local no preview. A seção não herda a serifa dos heroes de MODELOS.

## Layout & Spacing

MODELOS abre com navegação e apresentação editorial home, seguida de três cards lado a lado de Inteligência, Velocidade e Custo. O claro conserva o fundo branco; o escuro aplica página `#101114` e cards `#18191D`, mantendo composição, serifas e dimensões. Cada card tem gráfico de barras, legenda textual e unidade. A tabela vem depois, com os filtros próximos de seus resultados e título de 36px. `{colors.models-ground}` permanece o fundo neutro claro observado em /models. Não esconder comparação, fonte, data ou fórmula atrás dos gráficos.

Em GLOBO, a projeção 3D e as bases MAPA/SAT são as mesmas do contrato comum. O Seletor Fundo do Globo compara Cinza suave, Cinza original e Branco no claro (`#ECEDEF`/`#F1F2F4`/`#FFFFFF`); no escuro, Cinza suave, Cinza original e Preto (`#25272D`/`#1B1D22`/`#08090B`). Essas escolhas alteram somente o entorno do palco, ficam separadas por modo e são salvas no namespace desta apresentação; não trocam a base. Navegação, FLUXO/LABS, Empresa, Leitor, Chat, Fila e MERCADOS acompanham o modo. O preview escuro Earthnight é uma referência anterior, não define imagery SAT, fotorealismo ou tema das camadas Cesium. A Faixa de cotações segue na base; topologia/exclusividade dos painéis e seleção permanecem herdadas.

NOTÍCIAS organiza o mesmo conjunto filtrado com uma notícia em destaque, bloco Principais notícias com manchetes relacionadas e lista Últimas notícias. Destaque/Principais notícias usam a imagem da própria matéria somente quando URL do artigo, imagem e correspondência com a notícia foram verificadas; título/Fonte/link original identificam a procedência. Notícia demo sem URL ou sem imagem verificada usa placeholder sem foto; erro de carga mantém placeholder, título e link, sem escolher imagem genérica de Empresa ou de outra matéria. A imagem original não é recolorida ao trocar claro/escuro. A coluna lateral apresenta Empresas em foco/cotações e cobertura por Camada, com dados do Cadastro/MERCADOS separados do filtro de manchetes. A composição Yahoo usa `{colors.news-accent}` (`#6001D2`) no claro adaptado e `{colors.dark-news-accent}` (`#C092FF`) no escuro. Fonte, data, Empresas citadas e Leitor permanecem identificáveis; dados demonstrativos continuam identificados como tal. O preview atual contém 78 Notícias: cinco matérias vinculadas, com URL/imagem/crédito no [manifesto estático](../../mockups/assets/news-original-sources.js) do snapshot de 2026-10-12, e 73 notícias demo. As imagens permanecem no CDN da fonte; esse vínculo não é ingestão automática ou notícia atualizada em tempo real.

A atualização financeira de NOTÍCIAS amplia a lateral e a faixa superior com as informações já disponíveis no projeto. A base atual do preview tem 35 Empresas e 29 ações: seis em foco e outras 23 agrupadas por Camada, com favoritos, amplitude e maiores alta/baixa; a faixa superior expõe 10 indicadores macro e a lateral, 11 linhas de índices mundiais em três regiões. Cada ação mostra ticker, bolsa, moeda, preço, variação e mini tendência demonstrativa. Demais ações ficam abaixo de Empresas em foco; a lateral permanece mesmo com zero Notícias. Claro/escuro e celular mantêm todos os blocos, dados e botões; a cobertura acompanha o Cadastro, não uma cota fixa futura de 29 ações.

Abaixo de cada ação há “Conversar sobre {ticker}”, com acesso a um diálogo modal do futuro especialista financeiro em ações. O diálogo usa superfícies, texto e acento do modo atual, identifica a ação no título/contexto e oferece campo de pergunta, sugestões, respostas locais demonstrativas e fechamento visível. É uma superfície própria, distinta do console do especialista em LLMs. A interface é um preview da IA futura; respostas simuladas não são apresentadas como análise real. A QA local confirmou os 29 acessos, favoritos compartilhados com MERCADOS e amostras de contexto USD/NASDAQ e KRW/KRX; pergunta/resposta demonstrativa, Escape e retorno de foco passaram. Desktop 1280×720 e celular 390×844 ficaram sem overflow global. Isso comprova o preview, mantendo a IA financeira real futura.

O padding `{spacing.card-padding}`, quadrado `{spacing.metric-marker}`, cápsula de navegação e raios seguem a referência. O cabeçalho de 72px e ferramentas de 54px do preview são adaptações para o programa; no celular, cabeçalho de 108px e ferramentas de 54px. Gutter e margens são adaptações de composição `[ASSUMPTION: ajustar conforme mock, sem mudar funções]`. No celular, empilhar os cards e permitir rolagem da tabela; reorganizar ações sem removê-las. A barra de ferramentas clara fica no topo em todas as abas e pode rolar horizontalmente; o preview não oculta suas ações globais como o HUD móvel antigo.

Um só renderer serve os dois modos: [preview claro](../../mockups/prototype-artificial-analysis.html?mode=claro) e [preview escuro](../../mockups/prototype-artificial-analysis.html?mode=escuro); o [alias escuro](../../mockups/prototype-artificial-analysis-dark.html) redireciona para ele. Um `?mode=claro` explícito no alias ganha do destino escuro e da preferência salva. O controle Modo alterna e salva apenas preferência AA; trocar família não força claro. O [HTML de trabalho](../../.working/prototype-artificial-analysis.html) conserva a construção anterior. A [galeria](../../mockups/templates.html) oferece oito opções. Modo, restauração, alias, galeria de oito opções e Notícias/Leitor escuros foram conferidos no preview em desktop/celular, sem inferir integração final. O retorno dos seis templates antigos usa `?mode=claro&tab=globo`: abre o padrão claro mesmo com escuro salvo, sem apagar essa preferência.

## Elevation & Depth

Profundidade vem de borda fina e níveis de superfície do modo: branco/cinzas no claro, `#101114`/`#18191D`/`#24262B` no escuro. Evitar glow, scanlines e vinheta CRT; o modo escuro conserva a composição editorial. Painéis sobrepostos mantêm separação visível e conteúdo legível, sem nova semântica de janela. O Globo mantém relevo/textura próprios.

## Shapes

Navegação usa `{rounded.navigation}`. Botões e cards usam `{rounded.button}` e `{rounded.card}`. Marcadores de métrica são quadrados de `{spacing.metric-marker}` com `{rounded.square}`. Marcadores de Empresa continuam ◆/pontos conforme o domínio e não se tornam quadrados de métrica.

## Components

A tabela descreve a base clara; a aplicação de tokens escuros acima substitui fundo, superfície, borda, texto, acento e item ativo em todos os componentes. Tipografia, composição, conteúdo e interações permanecem. Empresa e Leitor exibem conteúdo imediato nos dois modos.

| Componente | Especificação visual da variante | Referência/alcance |
|---|---|---|
| Navegação | Cápsula `{colors.navigation}`/raio24 no claro; no escuro, superfície `#18191D` e ativo `#F2F2F3`/texto `#101114`. Marca com raio24 e fonte22/peso400; ações com nomes legíveis | GLOBO/MODELOS/NOTÍCIAS, Modo, Busca, Templates, Som, Relações, Agente, Fila, MERCADOS e BACKBONES; nos seis previews antigos, “Design padrão ↗” no cabeçalho e retorno pelo menu de tema |
| Hero de MODELOS | Apresentação home branca, título serifado até 80px, descrição e ações ao lado; 54px/empilhado no preview móvel; Tabela tem título 36px | Nova entrada editorial e aviso de demonstração |
| Gráficos de métricas | Três cards brancos com borda/raio8/padding16; título serifado e quadrado16 roxo/amarelo/laranja; barras/valores/legendas em leitura direta | Inteligência, Velocidade e Custo dos mesmos dados da Tabela; não benchmarks copiados |
| Tabela de modelos | Sans, linhas/bordas claras, cabeçalho preto, números/unidades legíveis e estado de ordenação | Todas as colunas, filtros, variantes e expansão herdadas; estilos da linha original não são apagados |
| Globo e controles | Claro com Cinza suave/Cinza original/Branco; escuro com fundo de palco experimental; controles acompanham o modo, Labs prioritários | Seletor Fundo do Globo muda só o entorno. Herda projeção 3D fixa, bases MAPA/SAT, terreno, prédios compatíveis e transição automática SAT/fotorealismo do contrato comum; estilo/provider SAT e compatibilidade claro/escuro seguem Q6 |
| FLUXO/LABS | Painel claro, notícia com título legível e marcador de domínio; expansão de notícias em linhas | Mesmos conjuntos e contagens |
| Prévia/Terminal | Card branco com títulos sans/serif e dados estruturados; sem escurecimento forçado | Identidade e seleção não mudam |
| NOTÍCIAS/Leitor | Destaque/Principais notícias com imagem verificada da própria matéria ou placeholder, Últimas notícias e coluna financeira; acento do modo, manchetes sans em negrito e metadados legíveis | Procedência e link original por item; sem URL/imagem ou erro usa placeholder sem foto. Mesmos filtros e destinos: manchete→Leitor, ticker→MERCADOS, badge Empresa→GLOBO |
| Finanças em NOTÍCIAS | Cards/linhas nos tokens do modo, números e unidades legíveis, direção de variação textual e mini tendência demo; amplitude, seis em foco e demais ações por Camada antes do panorama mundial; macro na faixa superior | Cobertura conferida no preview: 29 ações únicas = 6 + 23, 10 indicadores macro e 11 linhas mundiais/3 regiões; cobertura independente de filtro ou vazio de Notícias |
| Especialista financeiro por ação | Botão “Conversar sobre {ticker}” abaixo de cada ação; diálogo modal nativo com título/contexto da ação, aviso de IA futura/demo, pergunta/sugestões, respostas e botão fechar | 29 pontos de entrada, sem reaproveitar o console LLM; acompanha claro/escuro e cabe em tela móvel |
| Chat | Console claro com pergunta/resposta, fontes numeradas, Histórico e linha de ação distinta | Execução real continua gated |
| Fila de revisão | Cards claros com campos, links de origem, motivo, ações e estado pendente/resolvido | Fantasmas de proposta não são dados publicados |
| Faixa/MERCADOS | Dados pretos, alta/baixa com direção/valor; cards e lista claros, filtros/WATCH visíveis | Dez cartões, amplitude, índices mundiais e aviso de atraso mantidos |
| Busca/Ajuda/ajustes | Campos e popovers claros, resultado/tipo, fechamento e foco visíveis | Sem campo disfarçado de terminal de comandos |
| BACKBONES/OSM | Botão/controles claros e atribuição legível; geometrias e tiles mantêm seus contratos | Nenhuma afirmação de licença, rota precisa ou cobertura nova |
| Aviso de demonstração | Faixa neutra com texto preto e informação explícita, sem selo LIVE falso | Visível nas telas com fixtures; não só rodapé escondido |

A Ficha de empresa usa título em serifas, nome e localização legíveis, campos em sans e conteúdo imediato, sem moldura ASCII ou cursor CRT. O Leitor também apresenta o texto imediatamente.

Capturas da versão: [Modelos](../../mockups/shots/aa-models-overview-2026-10-12.jpg), [Globo e Empresa](../../mockups/shots/aa-globe-company-2026-10-12.jpg), [Modelos no celular](../../mockups/shots/aa-models-mobile-2026-10-12.jpg), [Mercados no celular](../../mockups/shots/aa-markets-mobile-2026-10-12.jpg), [Notícias editorial no desktop](../../mockups/shots/aa-news-yahoo-desktop-2026-10-12.jpg) e [Notícias editorial no celular](../../mockups/shots/aa-news-yahoo-mobile-2026-10-12.jpg). Modo escuro: [Modelos](../../mockups/shots/aa-dark-models-2026-10-12.jpg), [Modelos no celular](../../mockups/shots/aa-dark-models-mobile-2026-10-12.jpg), [Notícias](../../mockups/shots/aa-dark-news-2026-10-12.jpg) e [Notícias no celular](../../mockups/shots/aa-dark-news-mobile-2026-10-12.jpg). A [conferência](../../verification-artificial-analysis-2026-10-12.md) registra a evidência e seus limites; capturas anteriores mantêm valor histórico sem provar deltas posteriores.

Capturas da atualização financeira/imagens: [Notícias claro](../../mockups/shots/aa-news-original-images-light-2026-10-12.jpg), [Notícias escuro](../../mockups/shots/aa-news-original-images-dark-2026-10-12.jpg), [Notícias no celular](../../mockups/shots/aa-news-original-images-mobile-2026-10-12.jpg) e [diálogo financeiro escuro](../../mockups/shots/aa-finance-agent-dark-2026-10-12.jpg). As cinco imagens originais carregaram com largura natural de 1200px e corresponderam ao artigo/link no Leitor. Placeholder sem URL foi observado; falha de rede não foi induzida e permanece estado contratado.

## Do's and Don'ts

- Manter a família inteira coerente com o modo escolhido, inclusive Leitor, Empresa, Fila, Chat e MERCADOS; claro é inicial, escuro é opcional.
- Usar a paleta clara Artificial Analysis observada e as adaptações próprias escuras/Yahoo, fontes locais substitutas declaradas e espaço editorial; preservar conteúdos e ações do Monitor Global.
- Manter os seis temas antigos como alternativas, com visuais, conteúdos, defaults internos e preferências preservados; links de retorno acrescentados.
- Usar `#6001D2` no claro e `#C092FF` no escuro como acentos adaptados de Notícias; manter os tons do Globo experimentais até a escolha final de Andre.
- Manter os dois modos no mesmo renderer e store; modo manual é preferência independente da família e nunca motivo para apagar estado.
- Identificar dados simulados; fonte citada no mock não significa chamada de API ou benchmark real.
- Nas principais Notícias, usar somente imagem verificada da própria matéria com procedência/link original; sem correspondência ou em erro, manter placeholder em vez de foto substituta.
- Manter a cobertura financeira disponível mesmo sem manchetes e um acesso ao especialista financeiro abaixo de cada ação; respostas locais continuam rotuladas como demo, sem API ou análise real.
- Não copiar marca, logos, dados ou proposição comercial do Artificial Analysis; não acrescentar Premium, pricing ou novas métricas de produto.
- Não usar amarelo/cinza de referência como texto pequeno obrigatório com contraste insuficiente.
- Não declarar produto pronto ou ativar serviços pagos, autenticação, publicação de curadoria ou tiles pelo visual aprovado.

Abertura padrão confirmada por Andre em 2026-10-12: Artificial Analysis Light, inclusive após uma sessão em Dark. Dark permanece acessível pelo controle Modo, galeria e URL explícita; não determina o próximo início padrão.
