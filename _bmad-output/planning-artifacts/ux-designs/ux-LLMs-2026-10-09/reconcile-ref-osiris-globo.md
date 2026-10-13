# Reconciliação — referência visual OSIRIS (ref-osiris-globo.webp)

Fonte: [ref-osiris-globo.webp](imports/ref-osiris-globo.webp) (captura de osirisai.live). Confrontada com [.memlog.md](.memlog.md) (entradas posteriores prevalecem), [prototype-globe.html](mockups/prototype-globe.html) (v5 final) e capturas em `mockups/shots/` (ex.: [v5-globe-labs.png](mockups/shots/v5-globe-labs.png), [osiris-escuro.png](mockups/shots/osiris-escuro.png)).
A barra do navegador e os favoritos que aparecem na captura não fazem parte da referência e foram ignorados.

| Ideia (na referência) | Status | Evidência/nota |
|---|---|---|
| Estilo geral "central de operações tática", escuro | Adotado | memlog: "TUDO no estilo OSIRIS (central de operações tática), inclusive Tabela de modelos". |
| Globo com textura de satélite realista sobre fundo preto | Adotado | memlog (a) + "Qualidade do globo aprovada (Blue Marble 5400px / Black Marble 8K + relevo)". |
| Fundo preto liso, sem estrelas | Adaptado | O protótipo usa campo de estrelas atrás do globo (shots v5); isso não foi discutido explicitamente. |
| Brilho fino de atmosfera azul na borda do globo | Adotado | Protótipo: `showAtmosphere(true)`, cor `--atm` definida por tema. |
| Globo grande, centralizado e cortado pela borda de baixo (câmera próxima) | Adaptado | No protótipo o globo aparece inteiro, menor e deslocado para a direita por causa do painel esquerdo (Fluxo/LABS). Não houve decisão sobre o enquadramento. |
| Tipografia HUD: maiúsculas espaçadas, monoespaçada | Adotado | memlog (b) "maiúsculas espaçadas, fonte monoespaçada". O tema Sala de controle noturna troca por sans (`--label:var(--sans)`). |
| Marca em dourado com letras espaçadas (OSIRIS) + subtítulo | Adaptado | "MONITOR GLOBAL" + "LABS DE LLM · ECOSSISTEMA DE IA", com acento dourado, memlog (d). |
| Emblema/ícone da marca (olho de Hórus) | Não capturado | O protótipo só tem a marca em texto; não há símbolo. |
| Linha de tagline quase invisível com os domínios ("FLIGHTS · MARITIME · …") | Adaptado | Vira o subtítulo curto. Um texto tão apagado conflita com o piso WCAG AA (memlog: "contraste de texto mínimo WCAG AA nos 6 temas"). |
| Barra de status no topo: relógio ZULU, STATUS: LIVE, contadores | Adotado | memlog (c). Protótipo: UTC · STATUS: LIVE · EMPRESAS · MODELOS · LANÇAMENTOS 7D · ATUALIZADO. |
| Readouts de domínio no status (SOLAR Kp2, N LAYERS) e versão (V5.0) | Adaptado | Trocados por contadores do domínio (Empresas/Modelos/Lançamentos). Versão do app e nº de camadas ativas foram descartados sem discussão. |
| Cores: ciano no relógio, verde para LIVE/números, dourado nos acentos | Adotado | memlog (d) "acentos dourado/âmbar + dados ciano/verde". |
| Só tema escuro | Adaptado | memlog: 6 temas (3 famílias × escuro/claro), atalho ☀/☾ (FR-27). |
| Botões CTA no canto superior direito ($OSIRIS token, SUPPORT ▾) | Não capturado | Não há equivalente. Provavelmente fora de escopo, mas é o lugar natural de uma ação "Sobre/Fontes/Feedback". |
| Barra lateral esquerda só de ícones (camadas) com badges de contagem em ciano | Adaptado | memlog (e). No protótipo virou bolinhas coloridas por Camada com contagem (14/8/6/5/2). |
| Barra lateral direita só de ícones (ferramentas: radar, broadcast, gráficos, alertas, lápis, busca, base de dados…) | Adaptado | memlog (e). No protótipo o conjunto é outro: busca, ❯_ Agente, Relações, tema, som, ☰ Fila. |
| Ferramenta ativa destacada com círculo dourado (ícone "OI") | Adaptado | O protótipo destaca o estado selecionado com borda dourada em abas e vistas; na barra direita não existe "ferramenta ativa" persistente. |
| Ferramentas de anotação/medição (ícone de lápis) e de análise/gráficos na barra | Não capturado | Desenhar ou medir no globo nunca foi discutido. Gráficos ficaram para a aba MODELOS. |
| Linhas finas sobre o globo (feixes de cabos submarinos colados à superfície) | Adaptado | memlog: "Linhas (f) = relações entre Empresas", 5 tipos com cor, rede sutil que acende ao selecionar. No protótipo são arcos elevados, não traçados na superfície. |
| Muitos pontos (milhares de entidades, verdes com contorno) | Adaptado | Densidade bem menor (35 Empresas). Laboratórios em losango ◆ 9 px, ecossistema 6 px, espalhamento de pontos próximos (memlog "hierarquia dos Laboratórios… confirmado"). |
| Marcadores de evento com magnitude (círculos laranja "M4.8", "M5.1") | Adaptado | Equivale ao Pulso de lançamento ("◉ 5D" no rótulo, memlog: sugestão da hierarquia dos Labs). |
| Rótulos de hotspots nomeados em laranja (Suez Canal, Bab el-Mandeb, Cape of Good Hope) | Não capturado | O protótipo só rotula Empresas. Rótulos de polos/regiões (ex.: "Baía de SF", "Shenzhen") nunca foram discutidos. |
| Rótulos geográficos de países, muito apagados, sobre a textura | Não capturado | O protótipo não tem nomes de países ou cidades no globo; o contexto vem só da textura. |
| Rótulos sobre o globo em geral | Adotado | memlog (f) + rótulo fixo de 8 px com desobstrução para Laboratórios. |
| Camada dia/noite (`day_night` na URL), terminador ao vivo | Adaptado | Virou a vista MAPA = globo noturno (memlog: "MAPA = globo noturno (luzes das cidades)"). Não existe sobreposição do terminador em tempo real. |
| Seletor 3D · 2D · MAPA · SAT (canto inferior esquerdo, pílulas com borda dourada) | Adaptado | memlog (h). Na referência são dois eixos (projeção 3D/2D × base MAP/SAT, por isso 3D **e** SAT aparecem ativos ao mesmo tempo). O memlog definiu "quatro distintas" e mutuamente exclusivas. |
| Barra de escala ("500 km") sob o seletor | Adotado | memlog (i). Protótipo: "├──────┤ 2.520 km". |
| Leitura de cursor: CURSOR lat/lng · ZOOM | Adotado | memlog (i) "coordenadas, zoom, escala". |
| Leitura LOCATION (nome do lugar sob o cursor) | Não capturado | O protótipo mostra só coordenadas e zoom; não há geocodificação reversa (país/cidade). |
| Faixa de cotações na base, com rolagem contínua | Adotado | memlog (g) "Faixa de cotações na BASE" + "COTAÇÕES 13:25 ET · DADOS COM ATRASO". |
| Ícones coloridos por ativo e variação ▲▼ verde/vermelho na faixa | Adotado | Protótipo: monogramas (AP, NV, MI…) + ▲▼ com `--up`/`--dn`. |
| Faixa mistura eventos (terremotos ● M4.4 …) e preços | Não capturado | No protótipo a faixa só tem cotações e as notícias ficam no Fluxo. Pôr manchetes ou lançamentos de Modelos na faixa nunca foi decidido. |
| Rodapé com links sociais (Discord, X), DOCS, PRIVACY | Não capturado | O protótipo usa esse espaço para o aviso de cotações. Não há página de fontes, metodologia ou privacidade. |
| Indicador de conexão "● ONLINE" no canto inferior direito | Não capturado | Não há estado de conexão/dados desatualizados além de "STATUS: LIVE" fixo. |
| Dica de atalhos ("Press ? for shortcuts · F fullscreen · R reset view") | Não capturado | Há atalhos 1/2/3, / e Esc, mas faltam ajuda "?", tela cheia (F), "resetar vista" (R) e uma dica visível. |
| Controle de navegação no canto inferior direito (+/− zoom e setas de rotação) | Não capturado | O protótipo depende de arrastar, roda e pinça (memlog: pinça sempre controla o zoom do Globo). Não há botões. |
| Estado das camadas codificado na URL (`?layers=…`), compartilhável | Não capturado | O protótipo lê `?tab`, `?select`, `?pov` só para teste; não persiste (memlog: "parâmetros de URL não persistem"). Link compartilhável nunca foi discutido. |
| Ícones da base da barra esquerda (ajustes/filtros) | Adaptado | Tema, som e Relações foram para a barra direita como popovers (memlog: botão de som 1 clique + seta). |
| Globo sem painéis abertos (tela limpa, HUD só nas bordas) | Adaptado | O protótipo abre o painel Fluxo/LABS por padrão sobre o globo (memlog: "Painel esquerdo mantém o Fluxo de notícias… como aba PADRÃO"). |
| Movimento: relógio ao vivo, faixa rolando, marcadores pulsando | Adotado | Protótipo: relógio, `@keyframes scroll`, Pulso. Tudo respeita "reduzir movimento" (memlog piso de acessibilidade). |

## Ideias não capturadas para decidir

- **Controle de navegação na tela (+/− e setas, inferior direito):** sem ele, girar e dar zoom exigem mouse/trackpad. Isso conflita com a "navegação por teclado completa" do piso de acessibilidade e prejudica mouse sem roda e o toque no tablet.
- **Dica e atalhos de ajuda ("?", F tela cheia, R resetar vista):** os atalhos atuais (1/2/3, /, Esc) não aparecem em lugar nenhum. "Resetar vista" é útil depois de voar até uma Empresa, e tela cheia combina com o uso de "central de operações".
- **Indicador de conexão/atualização ("● ONLINE"):** "STATUS: LIVE" é fixo. Falta um estado visível para offline ou dados desatualizados, importante porque as cotações têm atraso e o Agente busca dados.
- **Leitura LOCATION (lugar sob o cursor):** completaria a leitura de cursor adotada no item (i), barata de fazer com geocodificação reversa local (país).
- **Rótulos geográficos (países/cidades) sobre o globo:** ajudam a localizar Laboratórios amontoados (ex.: Baía de SF) e dão contexto no zoom alto. Precisam conviver com a desobstrução dos rótulos de Labs.
- **Rótulos de polos/hotspots nomeados (estilo "Suez Canal"):** dá para trazer como polos do ecossistema (Vale do Silício, Hsinchu, Shenzhen, Pequim) e reforçar a narrativa geográfica.
- **Seletor de vistas em dois eixos (3D/2D × MAPA/SAT) em vez de 4 vistas exclusivas:** a referência permite combinar, por exemplo 2D + noturno. O memlog fixou 4 vistas exclusivas; vale confirmar se é intencional.
- **Terminador dia/noite ao vivo:** mostraria onde é dia agora em cada Laboratório, o que é relevante para quem acompanha lançamentos nos EUA/China a partir do Vale do Silício.
- **Eventos/manchetes misturados na Faixa de cotações:** a referência alterna eventos e preços. Seria uma forma de mostrar lançamentos de Modelos sem abrir o Fluxo, mas exige revisar o FR-18/FR-19.
- **Estado compartilhável na URL (camadas, vista, Empresa selecionada):** permitiria mandar link de uma Empresa ou filtro. Hoje os parâmetros só existem para teste.
- **Rodapé com DOCS/PRIVACY (Sobre/Fontes/Metodologia):** é um lugar para explicar origem dos dados, atraso das cotações e privacidade do histórico do Agente.
- **Emblema/ícone da marca:** o produto só tem marca em texto. Falta o símbolo para favicon, aba do navegador e identidade.
- **Enquadramento do globo (grande e cortado pela borda vs inteiro e menor):** muda a sensação de imersão da referência. Nunca foi decidido explicitamente.
- **Ferramentas de anotação/medição no globo (lápis):** provavelmente fora de escopo, mas está na referência e nunca foi descartada.
- **CTAs no topo direito ($OSIRIS/SUPPORT):** o token não se aplica, mas o espaço poderia receber "Feedback/Sobre". É de baixa prioridade.
