---
title: EXPERIENCE — Monitor Global de Labs de LLM
status: draft
created: 2026-10-09
updated: 2026-10-09
sources:
  - ../../prds/prd-LLMs-2026-10-07/prd.md
  - ../../prds/prd-LLMs-2026-10-07/addendum.md
  - ../../../forge/llm-labs-globe/forged-idea.md
---

# Monitor Global de Labs de LLM — Experience Spine

Par do [DESIGN.md](<DESIGN.md>) (como parece); este arquivo diz como funciona. Requisitos de produto ficam no PRD e são citados por número, não repetidos. Referência de composição e comportamento: [prototype-globe.html](<mockups/prototype-globe.html>) (v5, WebGL, servido por http local; inclui o Painel MERCADOS e a Legenda-filtro de Camadas). Itens decididos sem representação no protótipo estão marcados *spine-only (sem mock)*.

> **Este EXPERIENCE.md e o DESIGN.md vencem em caso de conflito** com qualquer mock, protótipo, captura ou import.

## Foundation

| Item | Decisão |
|---|---|
| Superfícies | **Desktop e tablet** são as principais (Andre usa um MacBook Pro). **Celular: básico** — todas as funções funcionam; só o acabamento do layout é simples (reorganização, sem layout dedicado caprichado) |
| Sistema de UI | Nenhum de terceiros. Web vanilla (HTML/CSS/JS) + Globo WebGL (addendum §D; o protótipo usa globe.gl). Pontos e Rótulos de Laboratório como elementos HTML sobre o Globo — mais nítidos e com brilho (nota para a arquitetura) |
| Identidade visual | [DESIGN.md](<DESIGN.md>) — tokens referenciados aqui no formato `caminho.do.token` entre chaves (ex.: `{spacing.terminal}`); exemplos de cor usam o tema padrão `osiris-escuro` |
| Idioma | Interface em português; nomes de Modelos, Empresas e títulos originais no idioma original (PRD §7) |
| Usuário | Um só: Andre, dono (FR-30) |

### Glossário UX

Termos de produto seguem o Glossário do PRD (§3). Termos novos desta UX, usados de forma idêntica nos dois arquivos:

| Termo | Definição |
|---|---|
| **Relação** | Ligação dirigida entre duas Empresas, de um de cinco tipos — fabricação de chips · nuvem e infraestrutura · investimento · energia · parceria de modelos —, desenhada como arco no Globo e mantida pela Fila de revisão. Escopo novo (ver Pendências para o PRD) |
| **Leitor de notícia** | Janela com uma Notícia: resumo estendido em português, pontos-chave, Empresas citadas e link para a matéria original em nova guia. Layout LATERAL (padrão) ou FLUTUANTE |
| **Fluxo de notícias** | Painel à esquerda sobre o Globo com as Notícias mais recentes de todas as Empresas, atualizado a cada Atualização |
| **aba LABS** | Aba do painel esquerdo, ao lado do Fluxo de notícias, com os Laboratórios agrupados por região |
| **Agente especialista em LLMs** | Agente de chat, aberto como console, que responde com os dados do painel e da web (com fontes citadas) e age no painel. Não é o Agente de notícias nem o Agente de descoberta |
| **Família de tema · Modo · Tema** | Família = OSIRIS fiel, Fósforo âmbar ou Sala de controle noturna. Modo = escuro ou claro. Tema = família × modo (6 temas) |
| **Vista** | Forma de exibir o Globo: 3D · 2D · MAPA · SAT |
| **Ponto fantasma** | Prévia tracejada, no Globo, de uma Empresa ou Relação proposta na Fila de revisão |
| **Voar até** | Ação composta: vai para a aba GLOBO, gira até a Empresa e abre o Terminal Fixado |
| **Painel MERCADOS** | Painel lateral à direita com índices e macro, amplitude das ações de IA, ações do Cadastro por Camada, índices mundiais por região, favoritos (aba WATCH) e resumo do Agente. Escopo novo (ver Pendências para o PRD) |
| **Amplitude** | Quantas ações de IA do Cadastro sobem (▲) e quantas caem (▼) no dia, com a maior alta e a maior queda |
| **Favorito · aba WATCH** | Ativo marcado com ☆ no Painel MERCADOS; a aba WATCH lista só os favoritos |
| **Rótulo geográfico · Polo de IA** | Nome discreto de país/cidade principal ou de polo de IA (Vale do Silício, Hsinchu, Shenzhen, Pequim, Hangzhou, Paris…) sobre o Globo |
| **Terminador** | Linha dia/noite ao vivo no Globo 3D |
| **Legenda-filtro de Camadas** | Legenda horizontal na base do Globo em que cada Camada é um botão liga/desliga com a contagem de Empresas pela Camada principal; é o filtro de Camadas (FR-2) e substitui a barra lateral esquerda de Camadas, eliminada |
| **Busca global** | Busca única aberta pelo ⌕: Empresa, Modelo, ticker ou Notícia; `Enter` leva ao lugar certo |
| **Estado na URL** | Camadas ligadas, Vista, aba e Empresa selecionada gravadas no endereço, para guardar e compartilhar o link; vale só na sessão e não sobrescreve preferências salvas |

## Information Architecture

| Superfície | Como se chega | Propósito | Como sai |
|---|---|---|---|
| Globo (aba GLOBO) | Abertura do painel · tecla `1` · Abas principais · qualquer "voar até" · link com Estado na URL | Pontos, Pulso, Relações, Rótulos geográficos, Terminador; palco de todos os painéis | — |
| aba MODELOS | Tecla `2` · Abas principais · ação do Agente | Tabela de modelos em tela cheia | Outra aba |
| aba NOTÍCIAS | Tecla `3` · Abas principais | Todas as Notícias, com filtros por Camada e Empresa | Outra aba |
| Fluxo de notícias · aba LABS | Painel esquerdo, sempre presente na aba GLOBO (padrão: Fluxo de notícias) | Notícias ao vivo · Laboratórios por região | Minimizar ▁ |
| Prévia | Mouse parado ~300 ms sobre Ponto ou Rótulo de Laboratório | Identificar a Empresa sem abrir nada | Cursor sai |
| Terminal Fixado | Clique/toque em Ponto ou Rótulo · cotação na Faixa · item do Fluxo · linha ou Notícia da aba LABS · Empresa citada no Leitor · "◍ ver no globo" · ação do Agente | Dados completos da Empresa (FR-6) | `Esc` · ✕ · clique fora (com exceções) · trocar para MODELOS/NOTÍCIAS |
| Leitor de notícia | Manchete no Terminal · item do Fluxo (após o voo) · Notícia expandida na aba LABS · título na aba NOTÍCIAS (sempre LATERAL) · ação do Agente | Ler a Notícia em português | `Esc` · ✕ · clique fora (com exceções) · abrir a Fila de revisão ou o Painel MERCADOS |
| Console do Agente | Tecla `/` · botão ❯_ · botão de resumo do Agente no Painel MERCADOS | Perguntar, comparar, pedir ações | `Esc` (ver prioridade) · ✕ · ❯_ — nunca clique fora |
| Fila de revisão | Botão ☰ (selo com o número de pendentes) | Aprovar, editar ou rejeitar propostas sem sair do Globo | ✕ · `Esc` · ☰ · abrir o Leitor ou o Painel MERCADOS — nunca clique fora |
| Painel MERCADOS | Botão $ na Barra lateral de ações · ticker na Busca global | Ver o mercado de IA de relance: índices e macro, amplitude, ações do Cadastro por Camada, índices mundiais, favoritos | ✕ · $ · `Esc` · abrir o Leitor LATERAL ou a Fila de revisão — nunca clique fora |
| Busca global | Botão ⌕ na Barra lateral de ações | Achar uma Empresa, um Modelo, um ticker ou uma Notícia num só campo | `Enter` leva ao destino (ver Component Patterns) |
| Legenda-filtro de Camadas | Sempre visível na aba GLOBO, embaixo à direita (no celular, com rolagem horizontal) | Ligar/desligar Camadas (FR-2) vendo quantas Empresas há em cada uma | — (clicar nela não fecha o Terminal) |
| Ajuda de atalhos | Tecla `?` | Ver todos os atalhos de teclado | `Esc` · `?` `[ASSUMPTION]` |
| Popovers Relações · Tema · Som | ⟡ · ◐ · seta ‹ do botão de som | Filtrar Relações, trocar tema, ajustar som | `Esc` · clique fora · mesmo botão |
| Matéria original | "↗ Abrir matéria original (nova guia)" no Leitor · ↗ no Terminal e na aba NOTÍCIAS | Fonte completa | Nova guia do navegador |

**Coexistência de painéis.**

| Combinação | Regra |
|---|---|
| Terminal + Leitor | Leitor FLUTUANTE abre ao lado do Terminal; LATERAL fica preso à direita e o Terminal se desloca para a esquerda dele |
| Leitor LATERAL × Fila de revisão × Painel MERCADOS | Mutuamente exclusivos: abrir um fecha os outros dois |
| Console do Agente + qualquer painel | Convive com Globo, Terminal, Leitor, Fila e Painel MERCADOS; Terminal, Leitor LATERAL, Fila e Painel MERCADOS encolhem para caber acima do console (Painel MERCADOS: `[ASSUMPTION: como a Fila]`) |
| Terminal + Painel MERCADOS | Como com a Fila: o Terminal desvia do Painel MERCADOS e nunca o invade (protótipo v5) |
| Trocar de aba | Ir para MODELOS ou NOTÍCIAS fecha o Terminal; o Leitor permanece |
| Prévia | No máximo uma por vez; abrir o Terminal Fixado fecha a Prévia |

**Atalhos de teclado.**

| Tecla | Ação | Quando não vale |
|---|---|---|
| `1` · `2` · `3` | Abas GLOBO · MODELOS · NOTÍCIAS | Com foco em campo de texto ou seletor |
| `/` | Abre o Console do Agente com foco no campo | Em campo de texto ou com modificador (⌘, Ctrl, Alt) |
| `Esc` | Fecha ou completa uma camada por vez (ver Interaction Primitives) | — |
| `Enter` / `Espaço` | Ativa o item focado (Ponto, linha da aba LABS, Notícia, cotação, filtro, tema) | — |
| `Enter` no Agente | Envia a pergunta | — |
| `?` | Abre/fecha a Ajuda de atalhos | Em campo de texto |
| `←` `→` `↑` `↓` | Giram o Globo (o mesmo que as setas dos Controles de navegação) | Em campo de texto. `[ASSUMPTION: só na aba GLOBO e sem foco numa lista ou tabela que use as setas]` |
| `+` / `−` | Zoom do Globo (o mesmo que os Controles de navegação) | Em campo de texto ou com ⌘ (aí é o zoom da página) |
| `F` | Tela cheia | Em campo de texto |
| `R` | Volta à vista inicial do Globo | Em campo de texto |
| `⌘ +` / `⌘ −` | Zoom da página (acessibilidade) | — |

Todos os atalhos novos desta lista (`?`, setas, `+`/`−`, `F`, `R`) são *spine-only (sem mock)*.

Composição: [prototype-globe.html](<mockups/prototype-globe.html>); visão geral do palco em [v5-globe-labs](<mockups/shots/v5-globe-labs.png>); Painel MERCADOS em [v5-markets](<mockups/shots/v5-markets.png>) e [v5-markets-ai](<mockups/shots/v5-markets-ai.png>); Legenda-filtro de Camadas, sem barra lateral à esquerda, em [v5-legend](<mockups/shots/v5-legend.png>).

## Voice and Tone

Microcopy. A voz da marca está em DESIGN.md § Brand & Style.

| Do | Don't |
|---|---|
| Rótulos de HUD em MAIÚSCULAS: "STATUS: LIVE", "35 EMPRESAS", "2 LANÇAMENTOS 7D" | Rótulos em caixa mista ou em inglês ("Loading…", "Live status") |
| STATUS honesto: "STATUS: LIVE" só com dados em dia; "STATUS: ATRASADO" com a idade da última Atualização; "STATUS: OFFLINE" sem conexão ou fonte | "LIVE" fixo com dados velhos |
| Lugar em MAIÚSCULAS, do geral ao específico: "EUA · CALIFÓRNIA" | Coordenadas sem contexto como única pista |
| Horário com fuso explícito: "UTC 13:52:36Z", "COTAÇÕES 13:25 ET · DADOS COM ATRASO · APENAS INFORMATIVO" | Horário sem fuso; omitir o aviso de atraso (FR-19) |
| Separador " · " entre fatos: "Laboratórios · Hangzhou, China" | Frases longas em rótulos |
| Números em pt-BR: "$0,0280", "▼ 2,1%", "2.520 KM" | Ponto decimal em inglês |
| Tempo relativo curto: "◉ LANÇAMENTO HÁ 5 DIAS", "◉ 5D", "◉ HOJE", "HÁ 2 H" | "Lançado em 2026-10-04T00:00Z" |
| Ações como verbo MAIÚSCULO: "✓ APROVAR", "✎ EDITAR", "✕ REJEITAR", "SALVAR E APROVAR", "DESFAZER", "OCULTAR" | "Clique aqui para aprovar" |
| Confirmação curta: "Ocultar esta notícia? · OCULTAR · CANCELAR" | "Tem certeza de que deseja continuar?" |
| Estado vazio afirmativo: "✓ NADA PARA REVISAR" | "Nenhum item encontrado :(" |
| Garantia antes da ação: "Nada muda no Cadastro sem a sua aprovação · ↗ = origem de cada dado" | Esconder de onde veio o dado |
| Transparência de IA: "Resumo gerado por IA a partir da fonte" | Apresentar resumo como texto do veículo |
| Agente em primeira pessoa, frases completas, fontes numeradas: "fontes: [1] Artificial Analysis · [2] OpenRouter" | Resposta sem fonte; tom de vendedor |
| Agente anuncia o que faz: "⟶ abrindo a Tabela de modelos com os Modelos destacados", "⟶ voando até Mistral AI no globo e abrindo o Terminal" | Agir no painel sem avisar |
| "—" para dado ausente; "PRIVADA" para Empresa sem ação | "0", "N/A", "null" |
| Dicas curtas: "Agente · tecla /", "Som · clique liga/desliga" | Dicas com instruções longas |

A marca "resposta simulada · protótipo" existe só no protótipo e não vai para o produto.

## Component Patterns

Comportamento. Visual em DESIGN.md § Components (mesmos nomes).

| Componente | Onde | Regras de comportamento |
|---|---|---|
| Globo | aba GLOBO | Gira devagar sozinho até a primeira interação (arrastar para a rotação). Arrastar gira; pinça e roda com Ctrl fazem zoom do Globo; Controles de navegação e teclado (setas, `+`/`−`) também. `R` volta à vista inicial. Troca de textura com o tema e a Vista. Enquadramento grande e imersivo, podendo ser cortado pelas bordas (*spine-only (sem mock)*) |
| Terminador | Globo, Vista 3D | Linha dia/noite ao vivo, atualizada continuamente com a hora real. Só na Vista 3D. *spine-only (sem mock)* |
| Rótulo geográfico | Globo | Países e cidades principais e polos de IA, discretos e só de leitura `[ASSUMPTION: não clicáveis]`. Na desobstrução, cedem lugar a qualquer Rótulo de Laboratório. *spine-only (sem mock)* |
| Controles de navegação | Sobre o Globo | Botões na tela: `+`/`−` dão zoom no Globo; setas giram. Alternativa a arrastar e pinça para teclado, mouse sem roda e toque. Mesmo efeito das teclas. *spine-only (sem mock)* |
| Ponto | Globo | Um por Empresa visível (FR-1, FR-2). Laboratórios em ◆ `{spacing.ponto-laboratorio}`; ecossistema em círculo `{spacing.ponto-ecossistema}`. Hover ~300 ms → Prévia; clique/toque → Terminal Fixado. Sedes próximas espalham em anel (ver Interaction Primitives). Zoom regional → logo em círculo (FR-4). Selecionado cresce para `{spacing.ponto-laboratorio-sel}` |
| Rótulo de Laboratório | Globo | Fixo ao lado de cada ◆; mesmo comportamento do Ponto (hover, clique). Rótulos que se sobrepõem são ocultados por prioridade: selecionado > lançamento mais recente > Rótulos geográficos (sempre os primeiros a sair). Durante o Pulso mostra "◉ ND" / "◉ HOJE". Tipografia `{typography.rotulo-laboratorio}` |
| Pulso | Ponto de Laboratório | Ativo só com Lançamento nos últimos 7 dias; força decai até sumir no 7º dia (FR-3). Vale o Lançamento mais recente. Cor `{colors.osiris-escuro-acc}` (acento do tema). Reduzir movimento → anel estático |
| Relação (arco) | Globo | Rede inteira sempre visível e quase transparente; ao selecionar uma Empresa, as Relações dela acendem e as demais apagam. Só aparece se as duas Empresas estão visíveis pelos Filtros de Camada. Filtrável por tipo no Popover Relações. Cores por tipo em `{components.relacao-arco}` |
| Prévia | Globo (só com mouse) | Abre após ~300 ms parado; acompanha o cursor; fecha ao sair. Passar sem parar não abre Prévias em série (FR-5). Não existe em toque |
| Terminal Fixado | Sobre o Globo | Abre junto ao Ponto e vira de lado se não couber; nunca invade Leitor LATERAL, Fila, Painel MERCADOS ou Console do Agente; mantém a linha RELAÇÕES com a lista das Relações da Empresa (→/← nome · tipo), como no protótipo aprovado; altura máxima `{spacing.terminal-altura-max}`. Digita em ≤ ~2 s (FR-7); `Esc` ou clique dentro pula sem fechar. Manchete abre o Leitor. "marcar como irrelevante" pede Confirmação de ocultar. Links clicáveis (FR-6) |
| Leitor de notícia | Direita (LATERAL, até `{spacing.leitor-lateral}`) ou ao lado do Terminal (FLUTUANTE, `{spacing.leitor-flutuante}`) | Padrão LATERAL; alternância FLUTUANTE/LATERAL no cabeçalho, escolha salva. Aberto pela aba NOTÍCIAS usa sempre LATERAL sem mudar a preferência. Digita o conteúdo; `Esc`/clique completa e ativa as Empresas citadas. Empresa citada → voar até. Abrir fecha a Fila de revisão e o Painel MERCADOS |
| Fluxo de notícias | Painel esquerdo | Aba padrão do painel. Mostra até 14 itens mais recentes; novas Notícias entram no topo com destaque breve. Filtro TODAS · ◆ SÓ LABORATÓRIOS (salvo); contagem e novas Notícias respeitam o filtro. Clique no item → voar até a Empresa + Leitor. Minimizável |
| aba LABS | Painel esquerdo | Laboratórios por região (EUA · CHINA · EUROPA · OUTROS), ordenados por Lançamento mais recente e depois nome. Hover na linha realça o Ponto. Clique no nome → voar até. "▸ N notícias" expande as 3 mais recentes sob a linha sem abrir o Terminal; clique numa delas → voar até + Leitor. Aba escolhida fica salva |
| Faixa de cotações | Base da tela | Rola continuamente; pausa com o mouse em cima (FR-18). Clique numa ação → aba GLOBO + voar até a Empresa. Índices não são clicáveis. Aviso com o horário da última cotação sempre visível |
| Barra de status | Topo | Emblema da marca + marca. Relógio UTC ao vivo; STATUS real — LIVE (dados em dia) · ATRASADO (última Atualização há X) · OFFLINE (sem conexão / fonte indisponível), ATRASADO e OFFLINE *spine-only (sem mock)*; contadores de Empresas, Modelos e Lançamentos 7D; horário da última Atualização. Itens menos importantes somem em larguras menores (ver Responsive) |
| Abas principais | Barra de status | GLOBO (padrão) · MODELOS · NOTÍCIAS; teclas 1/2/3; aba atual destacada |
| Barra lateral de ações | Direita (única barra lateral) | ⌕ abre a Busca global · ❯_ abre/fecha o Agente · ⟡ abre o Popover Relações · $ abre/fecha o Painel MERCADOS · ◐ abre o Popover Tema · ☀/☾ alterna o modo da família atual · Som (ver Interaction Primitives) · ☰ abre/fecha a Fila de revisão. ❯_, $ e ☰ ficam acesos (estado ativo) enquanto o painel correspondente está aberto e apagam ao fechar, por qualquer caminho. Dica no hover |
| Busca global | Barra lateral de ações (⌕) | Um só campo para Empresa, Modelo, ticker ou Notícia. `Enter` leva ao lugar certo: Empresa → voar até (Globo + Terminal Fixado); Modelo → aba MODELOS com a linha destacada na Tabela de modelos; ticker → a Empresa (voar até) ou o Cartão de índice/linha no Painel MERCADOS; Notícia → Leitor de notícia. Não substitui o campo de busca por ticker do Painel MERCADOS. *spine-only (sem mock)* |
| Popover Relações | Barra lateral de ações | Liga/desliga cada tipo de Relação; "Mostrar rede" liga/desliga tudo (o botão ⟡ reflete o estado). Um popover aberto por vez |
| Popover Tema | Barra lateral de ações | Escolhe a família e o modo (6 temas); aplica na hora e salva |
| Popover Som | Seta ‹ do botão de som | Digitação e Ambiente com ON/OFF e volume independentes; ambos começam OFF |
| Seletor de vistas | Canto inferior esquerdo, na margem | Troca a Vista (3D · 2D · MAPA · SAT) — 4 Vistas exclusivas, confirmadas após a reconciliação OSIRIS; Vista não implementada nunca fica selecionável |
| Leitura de cursor | Canto inferior esquerdo, na margem | Latitude/longitude e nome do lugar sob o cursor (ex.: "EUA · CALIFÓRNIA"; "—" fora da Terra), zoom e escala em km, atualizados ao mover e ao dar zoom. Lugar: *spine-only (sem mock)* |
| Legenda-filtro de Camadas | Base, canto inferior direito | É o filtro de Camadas (FR-2): cada item (● LABORATÓRIOS 14 · ● CHIPS 8 · ● NUVEM 6 · ● ENERGIA 5 · ● SOFTWARE 2) é um botão liga/desliga com a contagem de Empresas pela Camada principal; desligado fica esmaecido e os Pontos da Camada somem (com as Relações que dependem deles). Clicar na legenda nunca fecha o Terminal. Estado salvo e no Estado na URL. No celular fica visível, com rolagem horizontal |
| Ajuda de atalhos | Sobre o palco | `?` abre a lista de atalhos (1/2/3, /, Esc, F, R, setas, +/−); `Esc` fecha. *spine-only (sem mock)* |
| Tabela de modelos | aba MODELOS | Estilo HÍBRIDO (padrão) · TERMINAL · ANALÍTICO, escolha salva. Clique no cabeçalho ordena (1º clique decrescente, 2º inverte; vazios por último). Filtros combinados sem recarregar (FR-10). ⓘ mostra fórmula e Tarefa padrão (FR-11, FR-12). "Custo estimado por tarefa" logo após Inteligência. Linhas destacadas quando o Agente as aponta. Expandir linha → benchmarks (FR-9) |
| aba NOTÍCIAS | aba NOTÍCIAS | Chips por Camada (inclui Etiquetas) + seletor de Empresa, combinados. Título → Leitor LATERAL. "◍ ver no globo" → voar até. "↗ matéria original" → nova guia. "marcar como irrelevante" → Confirmação de ocultar |
| Console do Agente | Base, acima da Faixa | `/` ou ❯_ abre com foco no campo; ⤢ alterna tela cheia; ◷ mostra o Histórico (clique reabre a pergunta). Sugestões clicáveis. Respostas digitadas; clique ou `Esc` completa. Ao agir, mostra a linha "⟶" e, se estiver em tela cheia, volta ao tamanho normal para a ação ficar visível. Não fecha com clique fora |
| Fila de revisão | Painel à direita | Abre pelo ☰ sem sair do Globo; recebe o foco; abrir fecha o Leitor LATERAL e o Painel MERCADOS. Pendentes no topo, resolvidas abaixo. Fechar limpa Pontos e arcos fantasmas. Não fecha com clique fora |
| Cartão de proposta | Fila de revisão | Ver § Fila de revisão. ↗ em cada campo abre a origem do dado (FR-22) |
| Painel MERCADOS | Painel à direita | Abre e fecha pelo $ (que fica aceso enquanto aberto) sem sair do Globo; exclusivo com o Leitor LATERAL e a Fila de revisão; `Esc` fecha; não fecha com clique fora. Conteúdo, na ordem registrada na decisão: campo de busca por ticker → Cartões de índice → Barra de amplitude → ações do Cadastro por Camada → índices mundiais por região (AMÉRICAS · EUROPA · ÁSIA) → botão de resumo do Agente. Topo fixo (busca, abas, Cartões de índice, Barra de amplitude); só a lista rola, com cabeçalhos de coluna ATIVO · ÚLTIMO · VAR% · 1M. Busca por ticker (confirmado no protótipo aprovado): ticker do Cadastro → voar até a Empresa com o Terminal; índice → destaca o Cartão de índice/linha; ticker desconhecido → aviso em linha. Aba WATCH mostra só os favoritos. Resumo do Agente abre o Console do Agente com o humor do mercado de IA. ⤢ abre o painel maior/em tela cheia. "N de M bolsas em pregão" no grupo de índices mundiais, com aberto/fechado em cada índice. Ponto de status ao vivo/atrasado no cabeçalho, ligado ao STATUS LIVE · ATRASADO · OFFLINE. ⤢, topo fixo, cabeçalhos, pregão e ponto de status: *spine-only (sem mock)*. Captura: [v5-markets](<mockups/shots/v5-markets.png>) |
| Cartão de índice | Painel MERCADOS | Somente leitura: índices e macro — S&P 500, Nasdaq-100, Nasdaq Composite, SOX, VIX, US 10Y, Dólar, Ouro, Petróleo WTI, Bitcoin — com valor e variação do dia |
| Linha de cotação | Painel MERCADOS | Uma por ativo: ações do Cadastro agrupadas por Camada e índices mundiais por região, com preço, variação % e minigráfico 1M. ☆ liga/desliga o favorito, que entra/sai da aba WATCH na hora e fica salvo. Clique numa ação do Cadastro → voar até a Empresa. Hover mostra a Dica com nome completo, símbolo e bolsa (*spine-only (sem mock)*). Empresas privadas não aparecem (não têm cotação) |
| Barra de amplitude | Painel MERCADOS | Somente leitura: conta as ações de IA do Cadastro que sobem × caem no dia e mostra a maior alta e a maior queda |
| Chip de filtro | aba MODELOS, aba NOTÍCIAS, Fluxo | Clique alterna ligado/desligado; resultado atualiza na hora |
| Monograma | Globo, Prévia, Terminal, Tabela, Faixa, Fila, aba NOTÍCIAS | Substitui a logo ausente em todo lugar (FR-4, FR-21) |
| Emblema da marca | Barra de status, favicon | Identidade fixa, sem ação `[ASSUMPTION]`. Forma a definir (Open Questions). *spine-only (sem mock)* |
| Dica | Barra lateral de ações, Linha de cotação | Aparece no hover; não existe em toque |
| Confirmação de ocultar | Terminal, Leitor, aba NOTÍCIAS | "Ocultar esta notícia? · OCULTAR · CANCELAR". Confirmada, a Notícia some do Terminal, do Fluxo, da aba NOTÍCIAS e do Leitor, e orienta o filtro da Empresa (FR-15). Cancelar não muda nada |

## State Patterns

| Estado | Superfície | Tratamento |
|---|---|---|
| Primeira carga | Global | Globo com Pontos primeiro (≈3 s, PRD §5); painéis entram depois. `[ASSUMPTION: aparência do carregamento não prototipada]` |
| Dados em dia | Barra de status | "● STATUS: LIVE" |
| Atualização falhou / dados velhos | Barra de status | "STATUS: ATRASADO" com a idade da última Atualização bem-sucedida ("última Atualização há X") (UJ-1, FR-25); dados anteriores continuam. Limiar entre LIVE e ATRASADO: Open Questions. *spine-only (sem mock)* |
| Sem conexão / fonte indisponível | Barra de status | "STATUS: OFFLINE"; os últimos dados continuam na tela. *spine-only (sem mock)* |
| Fonte indisponível | Tabela, Notícias | Últimos dados válidos permanecem; nunca tela em branco (PRD §5, FR-25) |
| Cotações com atraso | Faixa de cotações | Aviso fixo "COTAÇÕES hh:mm ET · DADOS COM ATRASO · APENAS INFORMATIVO" |
| Fontes de cotação falham | Faixa, Terminal, Painel MERCADOS | Fonte de reserva; se ambas falham, últimos valores com o horário (FR-19), mesmo visual (Painel MERCADOS: `[ASSUMPTION: mesma regra da Faixa]`) |
| Empresa privada | Terminal, Faixa, Painel MERCADOS | "COTAÇÃO: PRIVADA"; não entra na Faixa nem no Painel MERCADOS |
| Aba WATCH sem favoritos | Painel MERCADOS | `[ASSUMPTION: linha única em mu explicando que ☆ adiciona favoritos]` |
| Busca por ticker sem resultado | Painel MERCADOS | Aviso em linha sob o campo (ticker desconhecido); a lista não muda |
| Painel aberto | Barra lateral de ações | ❯_, $ ou ☰ aceso enquanto o Console do Agente, o Painel MERCADOS ou a Fila de revisão está aberto |
| Camada desligada | Legenda-filtro de Camadas, Globo | Item esmaecido; Pontos da Camada somem |
| Ativo sem histórico de 1 mês | Linha de cotação | `[ASSUMPTION: minigráfico omitido, "—" no lugar]` |
| Sem logo | Todos os lugares com logo | Monograma na cor da Camada principal |
| Campo sem dado | Tabela, Terminal | "—", nunca zero (FR-9) |
| Modelo de raciocínio | Tabela, Agente | Etiqueta "raciocínio", "≈" no Custo estimado por tarefa e aviso no ⓘ (FR-11) |
| Empresa sem Modelos / sem Relações | Terminal | Linha MODELOS omitida; "RELAÇÕES: —" |
| Empresa sem Notícias | Terminal, aba LABS | `[ASSUMPTION: "NOTÍCIAS: —" no Terminal e sem "▸ N notícias" na aba LABS]` |
| Tradução falhou / teto de custo atingido | Terminal, Fluxo, aba NOTÍCIAS, Leitor | Só título original e link (FR-16, PRD §6). `[ASSUMPTION: o Leitor mostra título original, veículo, data e o botão da matéria original, sem as seções de resumo]` |
| Notícia ocultada | Terminal, Fluxo, aba NOTÍCIAS, Leitor | Some dos quatro lugares após a confirmação |
| Filtros sem resultado | Tabela, aba NOTÍCIAS, Fluxo (SÓ LABORATÓRIOS) | `[ASSUMPTION: linha única em mu dizendo que nada corresponde, sem esconder os filtros]` |
| Todas as Camadas desligadas | Globo, Legenda-filtro de Camadas | Todos os itens da legenda esmaecidos; nenhum Ponto; Relações somem (dependem das duas pontas visíveis) |
| Rede de Relações desligada | Globo, Popover Relações | Nenhum arco; botão ⟡ sem estado ligado |
| Lançamento recente | Ponto, Rótulo, Prévia, aba LABS, Terminal | Pulso + "◉ 5D" + "◉ LANÇAMENTO HÁ 5 DIAS" + "◉ HÁ 5 DIAS" + "(lançado há 5 dias)" |
| Digitando | Terminal, Leitor, Agente | Cursor em bloco; `Esc`/clique completa sem fechar |
| Fila vazia | Fila de revisão, Barra lateral de ações | "✓ NADA PARA REVISAR"; selo do ☰ some |
| Lugar sob o cursor sem nome (oceano) | Leitura de cursor | `[ASSUMPTION: só coordenadas]` |
| Proposta resolvida | Fila de revisão | Linha compacta com resultado, nota do efeito e DESFAZER |
| Empresa aprovada | Globo | Ponto aparece na próxima Atualização (FR-23); o protótipo mostra na hora só para demonstração |
| Vista não implementada | Seletor de vistas | Não selecionável |
| Agente fora dos dados do painel | Console do Agente | Pesquisa na web e responde com fontes numeradas |
| Agente com erro ou sem resposta | Console do Agente | Não prototipado — Open Questions |
| Som bloqueado pelo navegador | Botão de som | Áudio só começa após gesto do usuário; o 1º clique é esse gesto |
| Preferências indisponíveis (armazenamento bloqueado) | Global | Tudo funciona com os padrões; nada é salvo |
| Estado na URL | Global | Camadas ligadas, Vista, aba e Empresa selecionada ficam no endereço, para guardar e compartilhar o link. Ao abrir um link, o estado da URL vale só na sessão (override de sessão), nunca é salvo nem sobrescreve as preferências; valor inválido volta ao padrão. *spine-only (sem mock)* — o protótipo só lê `?tab`, `?select`, `?pov` para teste |
| Largura < `{spacing.quebra-status-xl}` | Barra de status | "ATUALIZADO" some — conflito com FR-25, ver Open Questions |
| Foco | Todos os controles | Anel de foco visível. `[ASSUMPTION: contorno de 2px em acc, como o tema selecionado no Popover Tema]` |
| Reduzir movimento | Global | Ver Accessibility Floor |

## Interaction Primitives

- **Hover (mouse):** ~300 ms parado sobre Ponto ou Rótulo de Laboratório → Prévia. Hover na linha da aba LABS realça o Ponto no Globo.
- **Clique / toque:** Ponto ou Rótulo → Terminal Fixado (fecha a Prévia). Em toque não há Prévia.
- **Digitação:** Terminal em ≤ ~2 s; Notícias linha a linha (FR-7). Leitor e Agente também digitam. Clique dentro ou `Esc` completa sem fechar.
- **Voar até:** aba GLOBO → voo de ~1,1 s → Terminal Fixado; partindo de uma Notícia, o Leitor abre ~1,5 s depois.
- **`Esc` — prioridade (uma camada por toque):**
  1. Popover ou Ajuda de atalhos aberta → fecha.
  2. Console do Agente, se o foco está nele ou se não há Terminal nem Leitor abertos → completa a digitação; senão fecha.
  3. Fila de revisão ou Painel MERCADOS (`Esc` fecha o painel, confirmado; `[ASSUMPTION: mesma posição da Fila nesta prioridade]`), se o foco está nele ou se não há Terminal aberto (e o foco não está num campo de edição) → fecha.
  4. Leitor de notícia → completa a digitação; senão fecha.
  5. Terminal Fixado → pula a digitação; senão fecha.
- **Clique fora:**

| Painel | Fecha ao clicar em | NÃO fecha ao clicar em |
|---|---|---|
| Terminal Fixado | Globo ou área vazia | Barra lateral de ações, Legenda-filtro de Camadas, popovers, Seletor de vistas, Controles de navegação `[ASSUMPTION]`, Faixa de cotações, Fluxo de notícias/aba LABS, Leitor, Console do Agente, Fila de revisão, Painel MERCADOS `[ASSUMPTION]` |
| Leitor de notícia | Globo ou área vazia | Terminal, Fluxo de notícias/aba LABS, itens da aba NOTÍCIAS, Barra lateral de ações, popovers, Console do Agente, Fila de revisão |
| Popovers | Qualquer lugar fora dele e do botão que o abriu | — |
| Console do Agente · Fila de revisão · Painel MERCADOS | Nunca | — |

- **Arrastar não é clique:** movimento > 5 px entre apertar e soltar nunca fecha nada (girar o Globo, selecionar texto).
- **Pinça:** sobre o Globo — inclusive sobre Pontos e Rótulos — controla sempre o zoom do Globo, nunca o da página (que escondia barra, painéis e Faixa). Sobre painéis e vistas MODELOS/NOTÍCIAS não age no Globo. `⌘ +`/`⌘ −` continuam como zoom da página.
- **Navegação sem gesto:** Controles de navegação na tela (`+`/`−`, setas) e as teclas equivalentes giram e dão zoom no Globo; `R` volta à vista inicial; `F` alterna tela cheia. *spine-only (sem mock)*
- **Estado na URL:** ao mudar Camadas, Vista, aba ou Empresa selecionada, o endereço é atualizado para poder ser guardado e compartilhado `[ASSUMPTION: sem criar entrada nova no histórico do navegador a cada mudança]`. *spine-only (sem mock)*
- **Espalhamento:** Pontos a menos de 16 px na tela se abrem em anel em volta do centro (passo de 17 px), recalculado ao mudar zoom ou Vista; a posição real continua sendo a da sede.
- **Som:** 1 clique no botão liga/desliga e restaura a última combinação ativa (digitação e/ou ambiente; na primeira vez, digitação). A seta ‹ ao lado abre o Popover Som. Ambos começam desligados (FR-8); ambiente entra e sai em fade. Som só após gesto do usuário (addendum §D).
- **Preferências salvas no navegador:** tema e modo, layout do Leitor, estilo da Tabela, aba do painel esquerdo, filtro do Fluxo, som (FR-8), Filtros de Camada (FR-2, pela Legenda-filtro de Camadas), favoritos do Painel MERCADOS (aba WATCH).
- **Proibido:** fechar painel ao arrastar; som automático ou por hover; Prévia em toque; pinça dando zoom na página; Vista não implementada selecionável; Agente, Fila ou Painel MERCADOS fechando por clique fora; Estado na URL sobrescrevendo preferências salvas.

## Accessibility Floor

Comportamento. Contraste visual em DESIGN.md § Colors.

- **Reduzir movimento** (preferência do sistema): Pulso vira anel estático com a mesma duração (FR-3); texto aparece sem digitação no Terminal, Leitor e Agente (FR-7); sem rotação automática do Globo; sem animações de entrada (Leitor, Agente, Fila, destaque de Notícia nova); indicador LIVE sem piscar; Faixa de cotações parada. `[ASSUMPTION: com a Faixa parada, os itens ficam acessíveis por rolagem horizontal manual]`
- **Teclado completo:** Tab, `Enter` e `Espaço` alcançam e ativam Pontos, temas, filtros, itens da Legenda-filtro de Camadas, Busca global, itens de Notícias, cotações, linhas da aba LABS, botões da Fila, Controles de navegação, campo de busca, ☆ e abas do Painel MERCADOS; `Esc` segue a prioridade acima; teclas 1/2/3, `/`, `?`, `F`, `R`, setas e `+`/`−` (o Globo inteiro é navegável sem mouse). A Ajuda de atalhos (`?`) torna os atalhos descobríveis.
- **Foco:** abrir Terminal ou Leitor move o foco para ele; fechar devolve ao elemento de origem. A Fila recebe o foco ao abrir; o Agente foca o campo de pergunta. `[ASSUMPTION: o Painel MERCADOS foca o campo de busca ao abrir]`
- **Semântica:** Terminal, Leitor, Fila, Painel MERCADOS e Console do Agente são diálogos com rótulo acessível; ✕ com rótulo "Fechar"; ☆ e itens da Legenda-filtro de Camadas com estado ligado/desligado anunciado. `[ASSUMPTION: leitores de tela recebem o conteúdo completo ao abrir, sem anúncio caractere a caractere]`
- **Contraste:** texto em WCAG 2.2 AA nos 6 temas — hex ajustados e razões em DESIGN.md § Colors; painéis escuros no OSIRIS fiel e no Fósforo âmbar (§ Temas e modos). Seguem sem verificação: texto sobre a textura do Globo, painéis translúcidos e o brilho do Fósforo âmbar; cores de Camada como texto pequeno em dois temas claros (Open Questions).
- **Cor não é o único sinal:** Laboratórios por forma (◆) além da cor; alta/baixa com ▲/▼ (Faixa, Terminal, Painel MERCADOS, Barra de amplitude); favorito por forma (☆/★); Camada desligada na Legenda-filtro de Camadas pelo esmaecimento e pelo estado anunciado, não só pela cor; tipo de Relação escrito no Terminal e no Popover Relações.
- **Zoom:** `⌘ +`/`⌘ −` amplia a página sem quebrar o layout; a pinça fica reservada ao Globo.

## Key Flows

Protagonista: **Andre**, dono do painel, no MacBook Pro, no Vale do Silício. Abre o painel várias vezes ao dia, a partir das 8h, atrás de Notícias e dados sobre LLMs.

### UJ-1. Andre confere a manhã do setor de IA (8h, café na mão)

1. Andre abre o painel. O Globo aparece girando no tema OSIRIS fiel escuro; a barra de status mostra "STATUS: LIVE" e "2 LANÇAMENTOS 7D"; o painel esquerdo abre no Fluxo de notícias.
2. Na Faixa de cotações, na base, o SOX está "▼ 1,9%" e a NVDA "▼ 2,1%", com o aviso "COTAÇÕES 13:25 ET · DADOS COM ATRASO · APENAS INFORMATIVO".
3. Sobre a China, o ◆ de Hangzhou pulsa forte, com o Rótulo "ALIBABA ◉ 1D".
4. Ele para o mouse no ◆; em ~300 ms a Prévia mostra "Alibaba · Laboratórios · Hangzhou, China · ◉ LANÇAMENTO HÁ 1 DIA".
5. Clica. O Terminal Fixado digita em ~2 s: cotação BABA, "MODELOS: Qwen 4 (lançado há 1 dia)", Relações e três Notícias em português com o título original e ↗.
6. Clica na manchete "Alibaba lança Qwen 4 com janela de 2 milhões de tokens". O Leitor de notícia abre LATERAL à direita e o Terminal desliza para a esquerda dele.
7. **Clímax:** em menos de um minuto ele sabe o que mudou — Lançamento, Notícia em português e ação na bolsa — sem sair do Globo. Dois `Esc` fecham Leitor e Terminal.

Falha: a Atualização da madrugada falhou → a barra de status mostra "STATUS: ATRASADO" com a idade da última Atualização bem-sucedida e os dados anteriores continuam na tela; sem conexão, "STATUS: OFFLINE". A Fonte de cotações caiu → a Fonte de reserva assume; se as duas caírem, a Faixa mostra os últimos valores com o horário.

### UJ-2. Andre escolhe um Modelo barato para um projeto (14h, entre reuniões)

1. Andre aperta `2`. A aba MODELOS abre a Tabela de modelos no estilo HÍBRIDO (o salvo).
2. Liga o chip "imagem" em "entradas:"; a Tabela filtra sem recarregar.
3. Clica no cabeçalho "Custo estimado por tarefa" (o segundo clique inverte para o mais barato primeiro).
4. Passa o mouse no ⓘ e confere a fórmula com a Tarefa padrão de 2.000 + 1.000 tokens.
5. Compara três candidatos pela barra de Inteligência e pelo Contexto.
6. **Clímax:** o mais barato que aceita imagem está no topo, com a inteligência ao lado — ele anota o nome.

Caso de borda: Modelos de raciocínio aparecem com "≈" e etiqueta "raciocínio"; o ⓘ avisa que os tokens de raciocínio não entram. Campo sem dado mostra "—". Filtro que zera a lista mostra o estado de filtros sem resultado.

### UJ-3. Andre aprova um Laboratório novo (18h, fim do expediente)

1. Andre vê o selo "4" no ☰ da Barra lateral de ações e clica (o ☰ fica aceso). A Fila de revisão abre à direita, sem sair do Globo (o Leitor LATERAL ou o Painel MERCADOS, se estava aberto, fecha).
2. O primeiro Cartão de proposta diz "◆ LABORATÓRIO NOVO · HÁ 2 H · AGENTE DE DESCOBERTA": Reflection AI, com o motivo (pesos abertos com 42 mil downloads em 30 dias) e ↗ em cada campo.
3. Ele clica "◍ VER NO GLOBO": o Globo voa até Nova York e mostra o Ponto fantasma tracejado "REFLECTION AI NOVO?".
4. Abre o ↗ da cidade, vê que está errada, clica "✎ EDITAR", corrige a cidade e clica "SALVAR E APROVAR".
5. **Clímax:** o cartão vira a linha "✓ Aprovado · Reflection AI · DESFAZER" com a nota "Entra no Cadastro; o Ponto aparece no Globo na próxima Atualização", e o selo cai para 3.

Falha: se ele clicar "✕ REJEITAR", a nota diz "Não será proposto de novo até surgir um fato novo." (FR-23). Clique errado → DESFAZER volta o cartão para pendente.

### Fluxo 4 — Andre lê as Notícias dos Laboratórios (12h, almoço)

1. No Fluxo de notícias, Andre clica "◆ SÓ LABORATÓRIOS"; a contagem muda e a escolha fica salva.
2. Uma Notícia nova entra no topo com destaque breve: "◆ DEEPSEEK — DeepSeek publica relatório técnico do R3".
3. Ele clica no item. O Globo voa até Hangzhou, abre o Terminal da DeepSeek e, em seguida, o Leitor de notícia.
4. No Leitor lê "RESUMO EM PORTUGUÊS" e "PONTOS-CHAVE"; em "EMPRESAS CITADAS", clica numa Empresa e o Globo voa até ela.
5. Troca para a aba LABS, clica "▸ 3 notícias" sob ANTHROPIC e escolhe uma; voa até San Francisco, Terminal e Leitor abrem.
6. **Clímax:** ele entende cada Notícia em português e só abre "↗ Abrir matéria original (nova guia)" quando vale a pena.

Falha: tradução indisponível → a Notícia aparece só com título original e link. Notícia fora do assunto → "marcar como irrelevante" → "Ocultar esta notícia? · OCULTAR" → ela some do Terminal, do Fluxo, da aba NOTÍCIAS e do Leitor. Para varrer tudo com filtros, `3` abre a aba NOTÍCIAS (Leitor sempre LATERAL).

### Fluxo 5 — Andre compara Modelos com o Agente especialista em LLMs (21h, pesquisa em casa)

1. Andre aperta `/`. O Console do Agente sobe da base, acima da Faixa, com o foco no campo e a saudação "Olá, Andre. Sou o agente especialista em LLMs do painel…".
2. Clica na sugestão "Compare Claude Opus 5.5 e GPT-6".
3. A resposta é digitada: inteligência, custo por Tarefa padrão, preços, contexto e velocidade de cada um, o resumo de qual é mais inteligente e qual sai mais barato, e o aviso "≈" de raciocínio; "fontes: [1] Artificial Analysis · [2] OpenRouter".
4. A linha "⟶ abrindo a Tabela de modelos com os Modelos destacados" aparece e a aba MODELOS abre atrás do console com as duas linhas destacadas.
5. Ele pergunta "Quais lançamentos desta semana?" → lista com "◉" e "⟶ destacando no globo"; depois "Onde fica a Mistral?" → "⟶ voando até Mistral AI no globo e abrindo o Terminal".
6. **Clímax:** a conversa e o painel andam juntos — cada resposta aponta para o dado na Tabela ou no Globo, com a fonte numerada ao lado.

Falha: pergunta fora dos dados do painel → o Agente pesquisa na web e responde com fontes numeradas. Para retomar uma pesquisa antiga, ◷ Histórico reabre a pergunta. Erro do Agente: não definido (Open Questions).

### Fluxo 6 — Andre aprova uma Relação nova e resolve um par de Modelos (sábado, 10h)

1. Andre abre a Fila de revisão pelo ☰ (selo 3, depois de ter aprovado a Reflection AI na UJ-3).
2. Cartão "⟡ RELAÇÃO NOVA · ONTEM": Amazon → OpenAI, tipo "Nuvem e infraestrutura" com a amostra de cor e ↗ para a fonte.
3. "◍ VER NO GLOBO" desenha o arco fantasma tracejado entre Seattle e San Francisco. Ele clica "✓ APROVAR": "Relação adicionada à rede do Globo."
4. Cartão "⇄ PAR DE MODELOS INCERTO": "qwen-4-instruct" (Artificial Analysis) ⇄ "qwen/qwen4-235b-a22b" (OpenRouter), com o motivo "janelas de contexto diferentes (2M × 1M)". Ele clica "SÃO DIFERENTES": "Mantidos como Modelos separados."
5. Resolve a "✎ CORREÇÃO DE DADOS" do contato da Moonshot AI com "✓ APROVAR".
6. **Clímax:** a Fila mostra "✓ NADA PARA REVISAR" e o selo do ☰ desaparece — o Cadastro está em dia e nada mudou sem ele aprovar.

Falha: aprovou o par errado → DESFAZER desfaz e o cartão volta a ficar pendente.

### Fluxo 7 — Andre olha o mercado de IA de manhã (8h10, depois da UJ-1)

1. Ainda no Globo, Andre clica no $ da Barra lateral de ações. O Painel MERCADOS abre à direita e o $ fica aceso; o Leitor LATERAL que estava aberto fecha.
2. Nos Cartões de índice do topo, vê o SOX "▼ 1,9%", o Nasdaq-100 em baixa e o VIX subindo.
3. A Barra de amplitude mostra que a maioria das ações de IA do Cadastro cai hoje, com a maior queda "▼ NVDA −2,1%" à direita e a maior alta à esquerda.
4. Desce a lista — busca, Cartões de índice e Barra de amplitude continuam fixos no topo — até as ações agrupadas por Camada; em Chips, o minigráfico 1M da TSM mostra a tendência do mês. Ele marca ☆ na TSM, que passa a aparecer na aba WATCH.
5. Confere os índices mundiais por região — "N de M bolsas em pregão" mostra que a Ásia já fechou — e clica no botão de resumo do Agente: o Console do Agente abre com o humor do mercado de IA hoje.
6. **Clímax:** em poucos segundos ele sabe se o dia é de alta ou de queda para a IA e quem puxou o movimento, sem sair do Globo nem abrir outro site.

Falha: as duas Fontes de cotação falharam → o painel mostra os últimos valores com o horário (FR-19). Ticker não encontrado na busca → aviso em linha. Para voltar às Notícias, abrir o Leitor LATERAL fecha o Painel MERCADOS. Protótipo: [prototype-globe.html](<mockups/prototype-globe.html>) · [v5-markets](<mockups/shots/v5-markets.png>) · [v5-markets-ai](<mockups/shots/v5-markets-ai.png>).

## Responsive & Platform

| Superfície | Entrada | Comportamento |
|---|---|---|
| Desktop ≥ `{spacing.quebra-status-xl}` | Mouse/trackpad + teclado | Layout completo |
| Desktop `{spacing.quebra-status-lg}`–1559 px | Idem | Some "ATUALIZADO" da barra de status (o MacBook Pro 14" fica nessa faixa — ver Open Questions) |
| Desktop/tablet 761–1279 px | Idem | Some também "LANÇAMENTOS 7D" e as dicas de tecla das Abas principais |
| Tablet | Toque | Layout igual ao desktop. Sem Prévia: tocar no Ponto abre direto o Terminal Fixado (FR-29). Pinça = zoom do Globo; Controles de navegação na tela como alternativa. Dicas e realce por hover não existem |
| Celular ≤ `{spacing.quebra-celular}` | Toque | Todas as funções (Globo + Terminal, Notícias + Leitor, Tabela de modelos, cotações e Painel MERCADOS, tema, som, Camadas, Relações, Fila de revisão) funcionam com reorganização simples. Legenda-filtro de Camadas visível, com rolagem horizontal. Globo na largura da tela com arrastar e pinça; Terminal Fixado como painel de baixo para cima; Tabela com colunas principais e rolagem horizontal; Faixa visível (FR-29) |

No protótipo, o celular esconde o Fluxo de notícias, a Barra lateral de ações e a Leitura de cursor; a Legenda-filtro de Camadas fica visível com rolagem horizontal (decisão). Como os controles da Barra lateral de ações ficam acessíveis no celular está em Open Questions.

## Inspiration & Anti-patterns

- **Do OSIRIS** ([ref-osiris-globo.webp](<imports/ref-osiris-globo.webp>)): Globo de satélite sobre preto, HUD em maiúsculas mono, barra de status com relógio e LIVE, barras laterais só de ícones, linhas finas e rótulos sobre o Globo, alternância 3D/2D/MAPA/SAT, leitura de cursor com escala, ticker na base.
- **Da reconciliação OSIRIS** ([reconcile-ref-osiris-globo.md](<reconcile-ref-osiris-globo.md>), 40 ideias, 15 não capturadas levadas ao Andre) — entram, todas *spine-only (sem mock)*: Controles de navegação na tela (+/− e setas) e por teclado; Ajuda de atalhos na tecla `?`; STATUS real LIVE · ATRASADO · OFFLINE; Estado na URL; lugar sob o cursor na Leitura de cursor; Rótulos geográficos de países/cidades e polos de IA; Terminador dia/noite ao vivo no 3D; Emblema da marca (forma a definir); Globo grande e imersivo, cortado pelas bordas.
- **Do painel MARKETS do OSIRIS** ([ref-osiris-markets.webp](<imports/ref-osiris-markets.webp>)): Painel MERCADOS com campo de busca, Cartões de índice, Barra de amplitude, tabela por região com minigráfico 1M, favoritos ☆ e aba WATCH, botão de resumo por IA. As abas temáticas da referência (DEF, NRG, CMDTY, FX, CRYPTO) não estão no conteúdo decidido — só a aba WATCH.
- **Da reconciliação MARKETS** ([reconcile-ref-osiris-markets.md](<reconcile-ref-osiris-markets.md>), 43 ideias, 11 não capturadas levadas ao Andre) — entram, todas *spine-only (sem mock)*: ⤢ para abrir o Painel MERCADOS maior/em tela cheia; cabeçalhos de coluna ATIVO · ÚLTIMO · VAR% · 1M; topo fixo com só a lista rolando; "N de M bolsas em pregão" + aberto/fechado em cada índice mundial; Dica com nome completo, símbolo e bolsa; ponto de status ao vivo/atrasado no cabeçalho. Correção de passagem: ❯_, $ e ☰ acesos com o painel aberto.
- **De Bloomberg, Yahoo Finance e Nasdaq:** a Faixa de cotações rolante com verde/vermelho e pausa no hover.
- **Do artificialanalysis.ai:** só conteúdo e densidade da Tabela de modelos (colunas, benchmarks, atribuição) — não o visual.
- **Rejeitado — direção 03 Terminal Bloomberg** ([directions-1.html](<mockups/directions-1.html>)): densidade máxima, laranja sólido, zero brilho; descartada como tema.
- **Rejeitado — artificialanalysis.ai como referência visual principal:** tudo segue o OSIRIS, inclusive a Tabela.
- **Rejeitado — Faixa de cotações no topo:** vai para a base.
- **Rejeitado — Tabela de modelos abaixo do Globo:** vai para a aba MODELOS em tela cheia.
- **Rejeitado — tradução completa da matéria no Leitor:** fica o resumo estendido + link.
- **Rejeitado — Laboratórios com o mesmo ponto do ecossistema:** achado crítico do Andre ("não encontrei nada sobre os laboratórios de IA no Globo") → ◆ + Rótulo fixo + espalhamento.
- **Rejeitado — aba LABS como padrão do painel esquerdo:** o Fluxo de notícias ao vivo continua padrão.
- **Rejeitado — Globo de baixa resolução:** só textura de satélite real (Blue Marble / Black Marble).
- **Rejeitado (reconciliação OSIRIS):** manchetes ou eventos misturados na Faixa de cotações (FR-18/FR-19 seguem só cotações); rodapé Sobre/Fontes/Metodologia; ferramentas de anotação/medição no Globo; CTAs no topo direito; seletor de Vistas em dois eixos (3D/2D × MAPA/SAT) — confirmadas 4 Vistas exclusivas.
- **Rejeitado (reconciliação MARKETS,** [reconcile-ref-osiris-markets.md](<reconcile-ref-osiris-markets.md>)**):** selo da aba ativa no cabeçalho do Painel MERCADOS; recolher ˄ o painel ao cabeçalho; comandos no campo de busca (ouro, fx, help…); atalhos numéricos para as abas do painel; Cartões de índice que mudam por aba/categoria; rodapé de "clima" (SPACE WX).
- **Rejeitado — barra lateral esquerda de Camadas:** eliminada a pedido do Andre; a Legenda-filtro de Camadas na base faz o filtro ([v5-legend](<mockups/shots/v5-legend.png>)).
- **Rejeitado (PRD e addendum):** scraping do Artificial Analysis; som ligado por padrão ou por hover.
- **Revertido — "cartões de Índices com minigráfico e mapa de calor por Camada — excesso de painéis"** (rejeição da ideação): os cartões de índice com minigráfico voltam no Painel MERCADOS (override, ver Pendências para o PRD); mapa de calor por Camada não entrou no conteúdo decidido do painel.

## Temas e modos

- Popover Tema lista as 3 famílias × ESCURO/CLARO (6 temas); ☀/☾ alterna o modo da família atual (atende FR-27).
- Primeira visita: família OSIRIS fiel (decidido), modo claro/escuro do sistema operacional (FR-27). A escolha manual fica salva.
- Trocar de tema aplica na hora: cores, textura do Globo, atmosfera, fundo estrelado e personalidade do Terminal; seleção e painéis abertos continuam.
- **Regra AA — painéis escuros (decidido):** no OSIRIS fiel e no Fósforo âmbar, os painéis Terminal Fixado, Leitor de notícia, Console do Agente, Fila de revisão e Painel MERCADOS são sempre escuros; no modo claro eles usam a paleta do modo escuro da mesma família. No OSIRIS claro, os rótulos sobre o Globo (Rótulos de Laboratório e geográficos) e a Leitura de cursor, sobre a janela escura do Globo, usam texto claro. Alternar ☀/☾ nessas famílias muda o cromo em volta, não esses painéis. Na Sala de controle noturna, os painéis acompanham o modo.
- Vistas (decisão confirmada; mantidas como 4 exclusivas após a reconciliação OSIRIS):

| Vista | Conteúdo |
|---|---|
| 3D | Globo com a textura de dia do tema + Terminador dia/noite ao vivo (*spine-only (sem mock)*) |
| 2D | Mapa plano com os mesmos Pontos, Relações e Terminal |
| MAPA | Globo noturno (luzes das cidades) |
| SAT | Imagem de satélite com relevo acentuado |

**Exceção — Sala de controle noturna (decidido):** no modo escuro, a Vista 3D usa o globo noturno (luzes das cidades, assinatura da família) e a MAPA mostra o dia, como no protótipo. No modo claro dessa família e nas demais famílias vale a tabela: 3D = dia, MAPA = noturno.

Capturas: [osiris-escuro](<mockups/shots/osiris-escuro.png>) · [osiris-claro](<mockups/shots/osiris-claro.png>) · [ambar-escuro](<mockups/shots/ambar-escuro.png>) · [ambar-claro](<mockups/shots/ambar-claro.png>) · [noturna-escuro](<mockups/shots/noturna-escuro.png>) · [noturna-claro](<mockups/shots/noturna-claro.png>) · [v5-globe-noturna](<mockups/shots/v5-globe-noturna.png>).

## Agente especialista em LLMs

| Capacidade | Regra |
|---|---|
| Dados do painel | Modelos, preços, benchmarks, Notícias, Relações, cotações |
| Web | Busca com fontes citadas e numeradas |
| Ações no painel | Voar até uma Empresa, abrir a Tabela filtrada/ordenada com Modelos destacados, abrir Terminal e Leitor, destacar Laboratórios no Globo — sempre anunciadas pela linha "⟶" |
| Histórico | Conversas guardadas e reabríveis (◷) |
| Sugestões iniciais | "Compare Claude Opus 5.5 e GPT-6" · "Quais lançamentos desta semana?" · "Onde fica a Mistral?" · "Modelo mais barato com inteligência acima de 50" · "Últimas notícias da NVIDIA" · "Quem fornece chips para a NVIDIA?" |
| Layout | Console de `{spacing.agente-altura}` na base, expansível para tela cheia; ao agir, volta ao tamanho normal |

Exemplo do console: [v5-chat-compare](<mockups/shots/v5-chat-compare.png>) (sobre a Tabela) e [v5-chat-goto](<mockups/shots/v5-chat-goto.png>) (agindo no Globo).

## Fila de revisão

| Tipo de cartão | Ações | Efeito ao aprovar | Efeito ao rejeitar |
|---|---|---|---|
| ◆ LABORATÓRIO NOVO | APROVAR · EDITAR (→ SALVAR E APROVAR / CANCELAR) · REJEITAR · VER NO GLOBO (Ponto fantasma) | Entra no Cadastro; Ponto na próxima Atualização | Não volta sem fato novo |
| ✎ CORREÇÃO DE DADOS | Idem; VER NO GLOBO voa até a Empresa e abre o Terminal | Cadastro corrigido | Correção descartada |
| ⟡ RELAÇÃO NOVA | Idem; VER NO GLOBO desenha o arco fantasma | Relação entra na rede do Globo | Relação descartada |
| ⇄ PAR DE MODELOS INCERTO | É O MESMO MODELO · SÃO DIFERENTES | Unidos: uma linha na Tabela (FR-13) | Mantidos separados |

Fantasmas somem ao resolver o cartão ou fechar a Fila. Itens resolvidos ficam abaixo dos pendentes com DESFAZER. Capturas: [v5-queue-preview](<mockups/shots/v5-queue-preview.png>), [v5-queue-done](<mockups/shots/v5-queue-done.png>). Outras referências do protótipo: [v4-fix-term-reader](<mockups/shots/v4-fix-term-reader.png>) (Terminal + Leitor LATERAL), [v5-feed-default](<mockups/shots/v5-feed-default.png>) (Fluxo de notícias padrão), [v5-labs-news](<mockups/shots/v5-labs-news.png>) (aba LABS com Notícias expandidas), [v5-bay-area](<mockups/shots/v5-bay-area.png>) (espalhamento na Baía de SF).

## Pendências para o PRD

Overrides do memlog que exigem Update do PRD (`bmad-prd`):

- **FR-18 / Glossário "Faixa de cotações" / §1 / §4.5:** Faixa na **base**, não no topo.
- **§7 Estética:** referência visual passa a ser o OSIRIS; artificialanalysis.ai só como referência de conteúdo/densidade; o painel inteiro (não só o Terminal) é HUD.
- **Nova entidade Relação:** 5 tipos, desenhada no Globo e mantida pela Fila de revisão (estende FR-22 e FR-23; Glossário).
- **FR-27:** seletor de 6 temas (3 famílias × escuro/claro), não só claro/escuro.
- **FR-6:** "um clique fora sempre o fecha" → clique fora com exceções (Barra lateral de ações, Legenda-filtro de Camadas, popovers, vistas, Faixa, Fluxo, Leitor, Agente, Fila, Painel MERCADOS); arrastar nunca fecha.
- **Escopo novo — Agente especialista em LLMs:** custo de LLM além do teto de ~US$ 5/mês (§6), busca na web, armazenamento do Histórico, acesso restrito (FR-30).
- **FR-16 / Glossário "Notícia":** Leitor de notícia com resumo estendido + pontos-chave + Empresas citadas (impacto no custo do Agente de notícias, §6).
- **FR-2:** Filtros de Camada pela Legenda-filtro de Camadas na base (botões com contagem pela Camada principal), não por barra lateral.
- **FR-29:** escopo funcional completo no celular mantido; registrar a prioridade "desktop e tablet primeiro" no acabamento.
- **FR-18 / FR-19 e escopo do painel financeiro — Painel MERCADOS:** reverte a rejeição da ideação ("cartões de índices com minigráfico e mapa de calor por camada — excesso de painéis"). Novo painel lateral com índices e macro (S&P 500, Nasdaq-100, Nasdaq Composite, SOX, VIX, US 10Y, Dólar, Ouro, Petróleo WTI, Bitcoin), amplitude das ações de IA, ações do Cadastro por Camada com minigráfico 1M, índices mundiais por região (Américas, Europa, Ásia), favoritos/aba WATCH e resumo do Agente. Impactos a registrar: Fontes de cotação para macro, câmbio, commodities, cripto e índices mundiais; histórico de 1 mês por ativo; aviso de atraso (FR-19) também no painel; horário de pregão por bolsa (indicador "N de M bolsas em pregão"); custo do resumo do Agente (§6).

Divergências detectadas na destilação (não registradas como override, mas o PRD descreve outra coisa):

- **Glossário "Tabela de modelos" / §1 / §4.3 / UJ-2:** "abaixo do Globo" → aba MODELOS em tela cheia, com estilo selecionável.
- **§4.4:** Notícias também no Fluxo de notícias, na aba LABS e na aba NOTÍCIAS, não só no Terminal Fixado.
- **FR-15:** "marcar como irrelevante" pede confirmação e oculta a Notícia nos quatro lugares.
- **FR-8:** som ambiente "do espaço" além do som de digitação, com controles independentes.
- **§4.1:** Vistas 3D · 2D · MAPA · SAT e destaque visual dos Laboratórios (◆, Rótulo fixo).
- **FR-1 / §12:** a premissa de sedes próximas foi resolvida (espalhamento leve) — pode sair do índice de premissas.
- **§4.1 / FR-25 (reconciliação OSIRIS):** STATUS LIVE · ATRASADO · OFFLINE, Estado na URL, Terminador, Rótulos geográficos, Controles de navegação e Ajuda de atalhos acrescentam comportamento que o PRD não descreve — avaliar se viram FRs.

## Open Questions

1. **Vistas 2D e SAT não prototipadas.** O protótipo mostra 2D desabilitada ("em breve") e SAT igual à 3D. Como ficam 2D e SAT em cada família? (Resolvido: a textura invertida da Sala de controle noturna virou exceção decidida — no modo escuro, 3D = globo noturno e MAPA = dia; ver Temas e modos.)
2. **Agente especialista em LLMs:** qual LLM, custo mensal, provedor de busca na web, onde e por quanto tempo guardar o Histórico, se pode propor itens à Fila de revisão, isolamento contra instruções embutidas em páginas da web (como FR-17), e o estado de erro/sem resposta. As respostas do protótipo são simuladas.
3. **Botão ⌕ Busca** — Resolvida: Busca global única (Empresa, Modelo, ticker, Notícia) com destino por tipo; ver Component Patterns.
4. **Controles no celular:** o protótipo esconde a Barra lateral de ações (Busca, Relações, Tema, Som, Agente, Fila, MERCADOS) e o Fluxo de notícias até `{spacing.quebra-celular}` (as Camadas ficam na Legenda-filtro de Camadas, visível com rolagem horizontal); a decisão exige todas as funções no celular. Como expor? Onde ficam os Controles de navegação no celular?
5. **Horário da última Atualização** some abaixo de `{spacing.quebra-status-xl}` — inclusive no MacBook Pro 14" do Andre — mas FR-25 pede que ele esteja visível. Onde mostrar quando o STATUS é LIVE? (A forma do aviso de falha passou a ser "STATUS: ATRASADO" com a idade da última Atualização.)
6. **Contraste AA** — Resolvida: 17 hex ajustados mantendo o tom (YAML do DESIGN.md, marcados `# AA (antes …)`), todos ≥ 4,5:1 contra `bg`/`s1`/`s2`/`bar` do próprio tema; Terminal, Leitor, Agente, Fila e Painel MERCADOS sempre escuros no OSIRIS fiel e no Fósforo âmbar, com a paleta escura da família; no OSIRIS claro, rótulos sobre o Globo e Leitura de cursor em texto claro. Razões em DESIGN.md § Colors. Seguem sem verificação possível: texto sobre a textura do Globo, painéis translúcidos e o brilho do Fósforo âmbar (`[ASSUMPTION: verificar contraste]`).
7. **Linha "RELAÇÕES" no Terminal** — Resolvida: fica, com a lista das Relações da Empresa (→/← nome · tipo), como no protótipo aprovado.
8. **Família de tema na primeira visita** — Resolvida: OSIRIS fiel, com o modo do sistema operacional (FR-27).
9. **Persistência não prototipada:** Filtros de Camada (FR-2), filtros de Relações, som ambiente e volumes.
10. **Logos no zoom (FR-4)** e **transição ASCII → logo (FR-7):** não prototipadas; limiar de zoom indefinido. Logo candidata na Fila (FR-23) só aparece como "não encontrada".
11. **Tabela de modelos incompleta no protótipo:** linha expandida com benchmarks (FR-9), filtros por Laboratório, saídas e pesos (FR-10), colunas de programação, matemática, cache de escrita, licença e pesos abertos/fechados, e as colunas do celular (FR-29).
12. **Leitor de notícia:** tamanho do resumo estendido (o texto de exemplo do protótipo fala em 150–250 palavras) e comportamento quando a tradução falha.
13. **Confirmação de ocultar:** forma visual (no lugar ou em diálogo) não prototipada.
14. **Ordem de Tab entre ~200 Pontos** no Globo para a navegação por teclado completa.
15. **Faixa de cotações com reduzir movimento:** como ver todos os itens com a rolagem parada.
16. **Emblema da marca:** forma do símbolo (favicon + barra de status) a definir.
17. **Painel MERCADOS — o que segue aberto:** largura do painel e tamanho do modo ⤢; se o painel aberto entra no Estado na URL; layout no celular. (Resolvido pelo protótipo aprovado: busca por ticker, clique numa ação, resumo do Agente no console, favoritos salvos, `Esc`, exclusividade com Fila e Leitor LATERAL.)
18. **STATUS ATRASADO / OFFLINE:** a partir de quanto tempo sem Atualização o STATUS passa de LIVE para ATRASADO; se a falha de uma só Fonte (ex.: cotações) já conta como OFFLINE; cores dos estados (`[ASSUMPTION]` em DESIGN.md).
19. **Itens da reconciliação sem mock:** posição e forma dos Controles de navegação e da Ajuda de atalhos; forma visual da Busca global; forma do estado aberto/fechado de pregão no Painel MERCADOS; lista e estilo dos Rótulos geográficos e polos de IA (diferença visual entre país/cidade e polo); aparência do Terminador e se ele fica estático com reduzir movimento (inclusive sobre o globo noturno da Vista 3D na Sala de controle noturna escura); enquadramento exato do Globo grande ao lado do painel esquerdo e dos painéis à direita; vista inicial usada por `R`.
20. **Cores de Camada como texto pequeno:** as cores de Camada não entraram no ajuste AA; passam de 3:1 como elementos não textuais, mas o nome da EMPRESA no Fluxo de notícias (sobre `s1`) fica abaixo de 4,5:1 no Fósforo âmbar claro (laboratorios 4,1) e na Sala de controle noturna clara (nuvem e energia 4,0). Ajustar esses hex ou trocar o texto para `tx` com marcador na cor da Camada?
