# Reconciliação — referência visual OSIRIS MARKETS (ref-osiris-markets.webp)

Fonte: [ref-osiris-markets.webp](<imports/ref-osiris-markets.webp>), o painel lateral MARKETS do OSIRIS (osirisai.live). Comparada com [.memlog.md](<.memlog.md>) (entradas posteriores prevalecem; ver as entradas "Painel MERCADOS"), com o [prototype-globe.html](<mockups/prototype-globe.html>) (bloco `/* painel MERCADOS */`, `#mkt`, `renderMkt()`), com a captura [v5-markets.png](<mockups/shots/v5-markets.png>) e, como apoio, com [EXPERIENCE.md](<EXPERIENCE.md>) e [DESIGN.md](<DESIGN.md>).
Os elementos da barra superior que aparecem cortados na captura (LAYERS, ENTITIES, SOLAR Kp, V5.0, $OSIRIS, SUPPORT) já foram tratados em [reconcile-ref-osiris-globo.md](<reconcile-ref-osiris-globo.md>). Aqui eles só aparecem resumidos.

| Ideia (na referência) | Status | Evidência/nota |
|---|---|---|
| Painel lateral de mercados à direita, aberto por um ícone na barra direita | Adotado | memlog: "painel lateral à direita aberto por botão novo na barra direita". O protótipo usa o botão `$` (`#bMkt`, dica "Mercados"). |
| Ícone de gráfico de barras na barra direita, com marcador dourado de "ativo" ao lado | Adaptado | O ícone virou `$`. O protótipo não marca o botão como ativo com o painel aberto (`#bMkt` não recebe `.on`), e não houve decisão sobre isso. |
| Painel flutuante, com cantos arredondados e afastado da borda | Adaptado | DESIGN: `{rounded.none}`, "painéis presos à direita", com a mesma largura da Fila. O protótipo usa `#mkt`, fixo e com borda à esquerda. |
| Painel convive com o globo, sem fechar ao clicar fora | Adotado | memlog: "não fecha com clique fora". Abrir o painel fecha a Fila e o Leitor lateral, o que é uma regra própria do produto. |
| Título "MARKETS" com ícone, em maiúsculas espaçadas | Adotado | "$ MERCADOS" em `--acc` e estilo HUD (`.hd .ttl`). |
| Selo com a aba ativa ao lado do título (WEI) | Não capturado | O cabeçalho do protótipo mostra só título + UPD. |
| Carimbo de atualização no cabeçalho "UPD 01:13Z" | Adaptado | "UPD 13:25 ET". Usa o fuso de mercado (ET), não Zulu, como a Faixa (memlog: "COTAÇÕES 13:25 ET"). |
| Botão expandir ⤢ (painel maior ou em tela cheia) | Não capturado | Só o console do Agente tem ⤢ (memlog). O Painel MERCADOS tem apenas ✕. |
| Ponto de status no cabeçalho (indicador ao vivo, em dourado) | Não capturado | Não há indicador no cabeçalho do painel. O STATUS LIVE/ATRASADO/OFFLINE só existe na barra superior (memlog). |
| Botão recolher ˄ (painel reduzido ao cabeçalho) | Não capturado | O protótipo só fecha (✕, `$`, `Esc` como assumption). Não há estado recolhido. |
| Campo de comando com prompt `>` e placeholder "Ticker or function · LMT · gold · FX · help" | Adaptado | memlog: "campo de busca por ticker". O protótipo mostra `❯` "Ticker · ex.: NVDA, TSM, 000660, SOX". A busca encontra ações do Cadastro e índices e mostra uma mensagem quando não acha nada. |
| Campo aceita funções/comandos (gold, FX, help), além de ticker | Não capturado | O protótipo só resolve ticker ou nome. Não há comandos nem `help`. |
| Botão GO | Adaptado | Traduzido como "IR" (`#mktF button`). |
| Abas de categoria temáticas (WEI, DEF, NRG, CMDTY, FX, CRYPTO, DON) | Adaptado | Ficou uma única "VISÃO GERAL" + WATCH (`.mtabs`). A divisão por tema virou seções por Camada ("Ações de IA · Laboratórios · 8", "· Chips · 8"…) dentro de uma só visão. As categorias da referência não têm equivalente no domínio. |
| Aba WATCH (favoritos) | Adotado | memlog: "favoritos com ☆ e aba WATCH". O protótipo guarda a escolha (`store 'mg4-watch'`) e mostra uma mensagem quando a lista está vazia. |
| Atalhos numéricos 1–8 nas abas | Não capturado | Não há atalhos no painel. As teclas 1/2/3 já trocam GLOBO/MODELOS/NOTÍCIAS (memlog), então haveria conflito. |
| Ícone próprio em cada aba | Adaptado | Só WATCH tem ícone (☆). VISÃO GERAL não tem. |
| Grade de cartões de índice com 4 colunas (rótulo, valor grande, variação %) | Adotado | `.mcards` com `repeat(4,1fr)`. Visível em v5-markets.png. |
| Seleção de cartões: S&P 500, NASDAQ, VIX, US 10Y, DOLLAR, GOLD, WTI, BITCOIN | Adaptado | memlog: 10 cartões. Entram ainda Nasdaq Composite e SOX, porque o foco é IA e semicondutores. "NASDAQ" virou Nasdaq-100. |
| Cartões mudam conforme a aba de categoria | Não capturado | Os cartões são fixos (`MACRO`). Isso só faria sentido com abas de categoria. |
| Barra de amplitude "BREADTH 25▲ 8▼" com barra verde/vermelha proporcional | Adaptado | "AMPLITUDE IA". Conta só as ações de IA do Cadastro (memlog). Na referência, ela vale para os ativos da aba. |
| Maior alta e maior queda sob a barra (▲ PLTR +7,69% · ▼ Corn −3,95%) | Adotado | memlog: "+ maior alta e maior queda". O protótipo mostra `.mbreadth .ext`. |
| Caixa "WORLD EQUITY INDICES" com borda própria | Adaptado | Vira o título de seção "Índices mundiais", sem caixa e abaixo das ações por Camada (memlog). |
| Indicador "● 3 OF 10 TRADING" (quantos mercados estão em pregão agora) | Não capturado | Não há horário de pregão nem estado aberto/fechado por bolsa. |
| Cabeçalhos de coluna SECURITY · LAST · %CHG · 1M | Não capturado | As linhas `.mrow` não têm cabeçalho (v5-markets.png). |
| Agrupamento por região AMERICAS · EMEA · ASIA | Adaptado | memlog: "por região (Américas, Europa, Ásia)". EMEA virou Europa, e entraram Ibovespa, CAC 40, KOSPI e TAIEX (`WORLD`). |
| Grupo "RATES · VOLATILITY · DOLLAR" (US 10Y, VIX, Dollar Index) na tabela | Adaptado | Esses ativos ficam só nos Cartões de índice. Não há grupo repetido na tabela. |
| Rótulo de região em dourado e espaçado | Adotado | DESIGN: `regiao-cor: acc`. Nota: no protótipo, as sub-regiões usam `--mu`; só "Índices mundiais" está em `--acc`. |
| Linha: ☆ + nome curto em negrito + símbolo/nome longo apagado e truncado + último + %chg + minigráfico | Adotado | `.mrow`: ☆ · ticker em negrito · nome em `--mu` com reticências · preço · variação · minigráfico. A ordem mudou: ticker primeiro, nome depois. |
| ☆ favorito também nos índices mundiais | Adaptado | Só as ações do Cadastro têm ☆. As linhas `.mrow.idx` têm a coluna vazia. |
| Minigráfico 1M colorido pela direção | Adotado | memlog: "minigráfico 1M". O protótipo usa `sparkS()`, verde ou vermelho. |
| Variação % só por cor com sinal (+0,64% / −3,70%) | Adaptado | O protótipo usa ▲/▼ + valor + cor (`pct()`), para não depender só da cor. |
| Ações do próprio domínio na tabela | Adaptado | Ideia nova do produto: "ações do Cadastro agrupadas por Camada" (memlog). Clicar numa ação voa até a Empresa (`goTo`). |
| Dica no hover com nome completo, símbolo e bolsa ("EURO STOXX 50 — ^STOXX50E · Zurich") | Adaptado | EXPERIENCE: "Hover mostra o nome completo". O símbolo e a bolsa não foram capturados, e o protótipo ainda não tem a dica (`.nm` sem `title`). |
| Destaque de fundo na linha sob o cursor | Adotado | `.mrow:hover{background:var(--s2)}`. |
| Tabela com rolagem própria, deixando busca, cartões e botão de IA à vista (aparente na referência) | Não capturado | No protótipo, o corpo inteiro (`#mkt .bd`) rola junto e o botão do Agente fica no fim da lista. |
| Rodapé "SPACE WX Kp 0 — Quiet · flare C3.1" (clima espacial) | Não capturado | Não há leitura equivalente. O SOLAR Kp da barra superior foi trocado por contadores do domínio (reconcile-ref-osiris-globo.md). Não se encaixa no domínio. |
| Atribuição de fontes no rodapé "YAHOO · NOAA" | Adaptado | "Dados com atraso · apenas informativo · Yahoo Finance" (`.foot2`), com o aviso de FR-19. |
| Botão "✨ AI OVERVIEW" de largura total, com borda dourada, no fim do painel | Adaptado | memlog: "botão de resumo do Agente (humor do mercado de IA hoje)". O protótipo mostra "✳ Resumo do Agente · mercado de IA hoje" e abre o console do Agente com a resposta, destacando as maiores variações no painel. A resposta não aparece dentro do painel. |
| Números em formato americano (7,866.00) | Adaptado | Formato pt-BR no protótipo (6.795,3 · 4,21%). |
| Tipografia mono, HUD, valores grandes nos cartões e rótulos pequenos em maiúsculas | Adotado | memlog (b). `.mcard .l/.v/.c`. |
| Ordem vertical: busca → abas → cartões → amplitude → tabela → rodapé → botão de IA | Adotado | EXPERIENCE registra a ordem, com as ações por Camada antes dos índices mundiais. No protótipo, o botão do Agente vem antes do rodapé de fontes. |
| CTAs no topo ($OSIRIS, SUPPORT) | Descartado explicitamente | memlog: "Não entram (da referência): … CTAs no topo direito". |
| Contadores da barra superior (LAYERS, ENTITIES, SOLAR Kp, V5.0) | Adaptado | Já tratados em reconcile-ref-osiris-globo.md: viraram contadores de Empresas/Modelos/Lançamentos. |

## Ideias não capturadas para decidir

- **Selo da aba ativa no cabeçalho** (ex.: "MERCADOS · WATCH"): ajuda pouco, já que hoje só há duas abas.
- **Botão expandir ⤢** para abrir o Painel MERCADOS maior ou em tela cheia, como já existe no console do Agente.
- **Ponto de status no cabeçalho do painel** (ao vivo/atrasado), ligado ao STATUS LIVE · ATRASADO · OFFLINE.
- **Recolher ˄** o painel ao cabeçalho, sem fechá-lo.
- **Comandos no campo de busca** (ex.: `ouro`, `fx`, `help`, nomes de Camada), além de ticker.
- **Atalhos numéricos para as abas do painel**: conflitam com 1/2/3 (GLOBO/MODELOS/NOTÍCIAS). Seria preciso usar outra tecla ou só dentro do painel focado.
- **Cartões que mudam por aba/categoria**: só fazem sentido se houver abas por Camada.
- **Indicador "N de M mercados em pregão"** e estado aberto/fechado por bolsa nos índices mundiais.
- **Cabeçalhos de coluna** (ATIVO · ÚLTIMO · VAR% · 1M) na tabela de ações e índices.
- **Tabela com rolagem própria**, mantendo busca, cartões, amplitude e o botão do Agente sempre visíveis.
- **Rodapé de "clima" contextual** no lugar do SPACE WX: algum indicador do domínio, ou descartar de vez o clima espacial.
- **Símbolo e bolsa na dica do hover**, além do nome completo; a dica também ainda não está no protótipo.
