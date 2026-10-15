---
title: EXPERIENCE — família Artificial Analysis
status: final
created: 2026-10-12
updated: 2026-10-12
template-id: artificial-analysis
scope: visual-variant-only
sources:
  - ../../EXPERIENCE.md
  - ../../DESIGN.md
  - ../../.memlog.md
  - ../../.working/reconcile-aa-existing-2026-10-12.md
  - ../../.working/reconcile-aa-default-yahoo-2026-10-12.md
  - ../../imports/artificial-analysis-reference-2026-10-12.md
  - ../../imports/yahoo-finance-reference-2026-10-12.md
  - ../../mockups/assets/news-original-sources.js
  - ../../../../prds/prd-LLMs-2026-10-07/prd.md
  - ../../../../prds/prd-LLMs-2026-10-07/addendum.md
  - ../../../../../specs/spec-llm-labs-globe/SPEC.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/cesium-integration.md
  - ../../../../architecture/architecture-LLMs-2026-10-10/contracts.md
---

# Monitor Global — experiência da família Artificial Analysis

## Foundation

| Item | Contrato |
|---|---|
| Alcance | Família padrão `artificial-analysis`, claro inicial e escuro opcional, com entrada editorial em MODELOS. O diretório `artificial-analysis-light` conserva o nome histórico; o pedido posterior de dark substitui a regra light fixa. Seis temas originais preservam visuais/conteúdos e preferências como alternativas |
| Retorno ao padrão | Cada um dos seis previews antigos oferece “Design padrão ↗” no cabeçalho e menu de tema, com `?mode=claro&tab=globo`; esse override abre o padrão claro mesmo com escuro salvo. Templates volta à galeria. Abrir outro preview preserva as preferências separadas |
| Plataforma | Mesma web vanilla/WebGL; desktop/tablet prioritários, todas as funções no celular. Nenhum novo sistema UI ou backend adotado por esta sessão |
| Identidade | [DESIGN.md](DESIGN.md); tokens deste delta substituem aparência e composição apenas desta variante |
| Herança | FR-1…FR-40 do [PRD](../../../../prds/prd-LLMs-2026-10-07/prd.md); [EXPERIENCE original](../../EXPERIENCE.md) em todo comportamento não alterado abaixo; [contracts.md](../../../../architecture/architecture-LLMs-2026-10-10/contracts.md) para estado, publicação, identidade e gates |
| Fontes posteriores | PRD/SPEC/arquitetura e decisões posteriores no memlog resolvem as antigas “Pendências para o PRD” e Open Questions genéricas da spine original; não importar sua fotografia de integração/prontidão como estado atual |
| Precedência | Escopo/IDs/segurança/custos vêm de PRD e arquitetura; este par define o delta visual, o design padrão, a entrada, as preferências e a apresentação imediata da Ficha de empresa e do Leitor. A aprovação posterior do padrão substitui o default global OSIRIS, preservando esse default dentro das alternativas. Neste alcance, **DESIGN/EXPERIENCE da variante vencem mocks/capturas/imports**. Não finalizam retroativamente os contratos originais |
| Usuário/idioma | Andre, dono único; português, nomes e títulos originais mantidos |
| Estado documental | `final` apenas para o delta de design capturado. Modos claro/escuro, restauração/URL, Leitor e fundos foram conferidos no preview desktop/celular. Tons do Globo permanecem experimentais até escolha final de Andre. Mock usa fixtures e demonstração, não prova produto, login, APIs, Histórico persistido ou serviços pagos |
| Delta financeiro atual | QA local confirmada para 29 ações/29 botões, 10 indicadores macro/11 linhas mundiais, imagens vinculadas/Leitor, favoritos compartilhados e diálogo demonstrativo em desktop/celular. As cinco matérias são snapshot estático, as outras 73 Notícias são demo; IA financeira real permanece futura, separada de LLMs |

Referências: [observação Artificial Analysis](../../imports/artificial-analysis-reference-2026-10-12.md), [observação Yahoo Finance](../../imports/yahoo-finance-reference-2026-10-12.md), [captura importada](../../imports/artificial-analysis-home-2026-10-12.jpg), [reconciliação do existente](../../.working/reconcile-aa-existing-2026-10-12.md) e [reconciliação de padrão/modos](../../.working/reconcile-aa-default-yahoo-2026-10-12.md). [Preview claro](../../mockups/prototype-artificial-analysis.html?mode=claro) e [preview escuro](../../mockups/prototype-artificial-analysis.html?mode=escuro) usam o mesmo HTML; [alias escuro](../../mockups/prototype-artificial-analysis-dark.html) redireciona para ele. A [galeria](../../mockups/templates.html) oferece ambos e as seis alternativas. O [HTML de trabalho](../../.working/prototype-artificial-analysis.html) conserva a construção anterior. O [Pass 1 inicial](../../.working/coverage-aa-2026-10-12.md) e a reconciliação distinguem decisão documental de comportamento observado.

## Information Architecture

| Superfície | Entrada/saída e delta |
|---|---|
| Modo | Controle Modo alterna claro/escuro no mesmo renderer; salva preferência AA independente da família. URL `?mode=claro/escuro` válida ganha da escolha salva; trocar família não força light |
| Galeria de templates | Oito opções: Artificial Analysis claro/escuro e seis alternativas originais. Ambos os modos AA abrem o mesmo HTML com `?mode=claro/escuro`; cada preview antigo tem retorno visível ao padrão. Escolher não regrava tema/modo da linha original |
| MODELOS | Entrada padrão do projeto quando não há estado válido restaurado nesta apresentação; navegação e tecla2 continuam. Hero, três Gráficos de métricas e Tabela completa. Outra aba sai |
| GLOBO | Aba/tecla1, Empresa da Busca/cotação/chat ou URL. Mesmo domínio; projeção sempre 3D e bases MAPA/SAT conforme o contrato comum, mais seleção, FLUXO/LABS e painéis. Fundo experimental só altera o entorno do palco. Claro: Cinza suave `#ECEDEF`, Cinza original `#F1F2F4`, Branco. Escuro: Cinza suave `#25272D`, Cinza original `#1B1D22`, Preto `#08090B` |
| NOTÍCIAS | Aba/tecla3; mesmo conjunto/filtros de manchetes e Leitor. Destaque/Principais notícias com imagem da matéria original quando verificada, Últimas notícias e lateral financeira. Sem URL/imagem ou em erro, placeholder. Yahoo observado escuro, claro adaptado; acento `#6001D2` claro / `#C092FF` escuro |
| Finanças em NOTÍCIAS | Faixa superior com 10 indicadores macro; lateral com amplitude/extremos, seis Empresas em foco, demais 23 ações por Camada, favoritos e 11 linhas mundiais em três regiões. Usa o Cadastro/MERCADOS e permanece quando o filtro de manchetes está vazio |
| Especialista financeiro por ação | “Conversar sobre {ticker}” abaixo de cada uma das 29 ações abre diálogo modal próprio, com contexto da ação, pergunta/sugestões e respostas locais demo. Fecha por botão ou Escape; não abre nem substitui o especialista em LLMs |
| FLUXO/LABS | Presente em GLOBO; FLUXO padrão herdado, escolha própria salva. Notícias, Lab e expansão de três itens mantêm destinos |
| Prévia/Terminal | Hover~300ms ou clique/toque; mesma Empresa. Fecha/convive pelas regras herdadas, sem mudar seleção por CSS |
| Leitor | Notícia em qualquer superfície; lateral padrão, flutuante salvo; NOTÍCIAS força lateral sem regravar preferência |
| Chat | Botão ou `/`; expansão, Histórico e ações tipadas herdadas; acompanha o modo, com aviso de demonstração no mock |
| Fila | Botão/badge; revisão, prévias e desfazer herdados; exclusiva com Leitor lateral/MERCADOS |
| Faixa/MERCADOS | Faixa na base; painel pelo botão/ticker. Todas as consultas, WATCH, resumo e navegação permanecem |
| Busca/Ajuda/ajustes | Busca global, atalhos, Relações e Som são alcançáveis. Templates substitui apenas a entrada de apresentação, sem retirar acesso aos seis temas na linha original |
| BACKBONES/OSM | Mesmos controles e regras do FR-39/40; visualização com créditos, falha e seleção preservados |

Nenhuma superfície herdada é removida por estar sem mock, com Fonte indisponível ou com integração gated. Bases e camadas indisponíveis seguem os estados/fallbacks de EXPERIENCE.md; a variante visual não afirma integração real de provider.

## Voice and Tone

Usar português claro e títulos em caixa comum no editorial; nomes técnicos, IDs e nomes de controles continuam consistentes. A aparência não altera os termos Laboratório, Empresa, Modelo, Lançamento, Relação, Fila ou Fonte do PRD.

| Situação | Microcopy |
|---|---|
| Fixtures | “Demonstração · dados e ações simulados” sempre visível; nome de Fonte sem declaração de coleta real |
| Sem linha filtrada | “Nenhum Modelo com estes filtros”; oferecer remover filtros, sem trocar “—” por zero |
| Gráficos | “Inteligência”, “Velocidade” e “Custo”; unidade, valor e origem identificáveis. Explicar custo estimado com tarefa 2.000+1.000 onde aplicável |
| Chat sem gate | “Pesquisa real indisponível nesta demonstração”; sugestões/respostas demo claramente simuladas |
| Fonte falhou | Último dado válido/data e aviso de indisponibilidade; não selo LIVE decorativo |
| Revisão demo | Aprovar/editar/rejeitar mudam somente o exemplo local; publicação real permanece staged/próxima Atualização |
| Imagem de matéria | Fonte/link original identificam procedência da imagem verificada. “Sem imagem original” quando ausente/não vinculada; “Imagem indisponível” em falha. Notícia demo continua identificada como simulação |
| IA financeira futura | “Especialista financeiro · demonstração”; “Conversar sobre {ticker}”. Informar que pergunta/sugestões usam resposta local simulada, sem análise real ou chamada de API |

## Component Patterns

| Componente | Regra de comportamento da variante |
|---|---|
| Navegação | Artificial Analysis é a família padrão, claro inicial; MODELOS é sua aba default sem estado válido. Modo alterna claro/escuro sem mudar aba, seleção, filtros, Fila ou Histórico e salva só no namespace AA. Trocar família não força light. Templates/retorno direto preservam preferências antigas; teclas1/2/3 e Empresa→GLOBO mantidas |
| Hero de MODELOS | Introduz comparação e demonstração; não é etapa obrigatória nem altera filtros/dados |
| Gráficos de métricas | Três resumos da mesma fonte local de Modelos usada na comparação. No preview, seis barras por gráfico, ordenadas pela métrica; clicar destaca o Modelo na Tabela e leva a essa seção. Valores demonstrativos são identificados; não gerar novos scores ou preencher ausência. Legenda/unidade/valor acessíveis; filtros/ordenação da Tabela continuam fonte de intenção. Não se presume sincronização dos filtros com os seis destaques do gráfico |
| Tabela de modelos | Mesmos IDs, variantes, campos, filtros e fórmula. Custo após Inteligência, “≈” em raciocínio, ausente “—”; benchmarks/filtros ainda sem mock continuam contratados. Estilos da tabela anteriores não são apagados pelo novo template |
| Globo e controles | Mesmo store de seleção/filtros/base. Projeção sempre 3D; MAPA escuro com detalhe OSM progressivo; SAT com imagem em zoom amplo e fotorealismo automático em zoom próximo coberto, retornando à imagem SAT ao afastar, sair da cobertura ou falhar. Terreno acompanha bases e prédios compatíveis não duplicam fotorealismo. O seletor Fundo do Globo compara Cinza suave/Cinza original/Branco no claro e Cinza suave/Cinza original/Preto no escuro; fundo experimental salvo por modo no namespace AA, sem alterar base/câmera/seleção. Pinça controla Globo, zoom de página por teclado continua; Labs prioritários e espalhamento somente visual. Base inicial e composição de provider seguem Q6 |
| FLUXO/LABS | Mesmo conjunto publicado/ocultações; filtro TODAS/SÓ LABORATÓRIOS, contagens e limites herdados; clique em Notícia abre Empresa+Leitor |
| Prévia/Terminal | Toque abre direto Fixado, com conteúdo imediato nesta variante. Arrastar não fecha. Link/Relação/Empresa preserva IDs canônicos |
| NOTÍCIAS/Leitor | Destaque, Principais notícias/manchetes relacionadas e Últimas notícias apresentam o mesmo conjunto publicado e filtrado. Imagem original exige URL/artigo/imagem verificados e correspondência com a notícia; não basta ser foto da mesma Empresa. Procedência/link original ficam disponíveis. Sem vínculo, sem imagem ou em erro, placeholder sem foto mantém título/Fonte/link. Manchete/imagem abre o Leitor imediato, ticker abre MERCADOS e badge Empresa retorna ao Globo. Leitor mantém resumo/pontos-chave/Empresas/título original/link nova guia; filtros e confirmação para ocultar continuam comuns. Acentos `#6001D2` claro / `#C092FF` escuro não mudam Camada. Sem reprodução integral |
| Chat | Somente ferramentas tipadas da arquitetura; execução aparece na conversa, sai de tela cheia para mostrar resultado. Erro/budget preserva painel e Histórico já acessível; mock não dispara chamada paga |
| Fila de revisão | Origem por campo, motivo, fantasma e decisões herdadas. Antes de publicação DESFAZER volta pendente; após publicação, compensação revisada conforme arquitetura |
| Faixa/MERCADOS | Hora/fuso/atraso visíveis, privados/ausentes distintos; WATCH/busca/Resumo e exclusividade herdados. Resumo usa Chat, sem análise financeira nova |
| Cobertura financeira de NOTÍCIAS | 29 ações únicas do Cadastro = 6 em foco + 23 demais, agrupadas por Camada abaixo das seis. Cada ação exibe ticker/bolsa/moeda/preço/variação/mini tendência demo, favorito marcável e botão próprio para conversar. Amplitude registra sobem/caem e maiores alta/baixa; panorama macro na faixa superior tem 10 indicadores e panorama mundial na lateral, 11 linhas/3 regiões. São dados já disponíveis no projeto, independentes de Empresa/Camada do filtro de manchetes, inclusive zero Notícias |
| Especialista financeiro | Diálogo modal nativo próprio, sem usar o console LLM. Contexto identifica a Empresa/ação selecionada e seus dados disponíveis; campo de pergunta e sugestões geram somente respostas locais demonstrativas. Nenhuma API, execução financeira ou recomendação apresentada como análise real. Favoritos usam o mesmo conjunto WATCH no namespace AA; conversa demonstrativa não estabelece Histórico financeiro persistido |
| Busca/Ajuda/ajustes | Destino por tipo: Empresa/ticker→GLOBO/Terminal ou MERCADOS; Modelo→linha; Notícia→Leitor. Atalhos não interceptam digitação. Som em dois canais OFF inicialmente e só por gesto |
| BACKBONES/OSM | OFF inicial para cabos; cidade/conexões só confirmadas; crédito quando ligado. Tiles interativos, histerese e fallback satélite; mesma seleção/Relações, sem inferir vínculo comercial por proximidade |
| Aviso de demonstração | Continua visível com dados demo em MODELOS, GLOBO, NOTÍCIAS e painéis. Seu fechamento não pode tornar dado simulado indistinguível de dado ao vivo |

### Critérios de cobertura da atualização de NOTÍCIAS

| Critério | Alvo do preview |
|---|---|
| Ações | Base atual demo: 35 Empresas e 29 ações únicas, seis em foco e 23 demais por Camada; nenhuma duplicada ou perdida. A cobertura futura acompanha o Cadastro |
| Dados por ação | Ticker, bolsa, moeda, preço, variação e mini tendência demo; ausente distinto de zero, favorito marcável e botão “Conversar sobre {ticker}” abaixo da própria ação |
| Mercado de IA | Amplitude de alta/baixa e extremos correspondem ao mesmo conjunto de 29 ações; não mudam pelo filtro de manchetes |
| Panorama macro | 10 indicadores já disponíveis: S&P 500, Nasdaq-100, Nasdaq Composite, SOX, VIX, US 10Y, Dólar, Ouro, WTI e Bitcoin, com unidades/estado aplicáveis |
| Panorama mundial | 11 linhas em Américas/Europa/Ásia, com dados e estado disponíveis; nenhuma região some por falta de manchetes |
| Contexto financeiro | 29 botões de conversa; cada um abre o contexto correspondente, com perguntas/sugestões e resposta local rotulada demo. Abrir o diálogo não envia mensagem ao especialista LLM nem chama API |
| Filtro, vazio e modos | Filtrar por Empresa/Camada ou chegar a zero Notícias mantém todos os blocos financeiros. Claro/escuro e celular preservam as mesmas informações e ações |
| Modal | Foco inicial na pergunta, navegação dentro do diálogo, Escape/botão fecha e restaura foco ao botão de origem; contexto da ação continua correto ao reabrir |
| Imagens das principais Notícias | Imagem verificada da própria matéria e link/procedência correspondentes; sem URL/imagem ou em erro, placeholder. Não usar foto de outra matéria ou Empresa como substituta |
| Snapshot de Notícias | 78 itens atuais: cinco matérias vinculadas ao Yahoo Finance com URL/imagem/crédito no [manifesto estático](../../mockups/assets/news-original-sources.js), consultado em 2026-10-12, e 73 notícias demo. Não há ingestão periódica; disponibilidade das fotos depende do CDN externo |

## State Patterns

| Superfície | Estados aplicáveis e regra |
|---|---|
| Modo | Claro/escuro, URL explícita, preferência válida/inválida e armazenamento indisponível. Mudança manual preserva aba/seleção/filtros/janelas e anuncia o modo ativo; erro de preferência conserva escolha na sessão |
| Entrada/galeria | Claro inicial, escuro opcional; modo válido explícito na URL ganha do default light; a escolha escura anterior não altera a abertura padrão. Aba válida ganha de MODELOS. Alias escuro usa o mesmo HTML; `?mode=claro` explícito ganha de escuro/salvo. Opção original abre os visuais preservados; retorno respeita estado próprio AA |
| MODELOS/gráficos/tabela | Cold-load com descrição, resultados, filtros vazios, campo ausente, foco, erro/last-good e sem acesso. Gráfico sem dado não desenha barra zero; o mock indica fixtures |
| GLOBO/FLUXO/LABS | Cold-load/normal/selecionado/filtrado sem Empresas, MAPA indisponível sem troca silenciosa, SAT ampla/fotorealismo coberto/fallback, troca de base com câmera/seleção preservadas, Fonte parcial/offline, foco e reduzir movimento. Não perder Coordenadas/Camada ao trocar visual |
| Prévia/Terminal | Prévia/fechado/fixado/completo, Empresa privada/sem contato/sem Modelos ou Notícias, foco/restauração. Callback antigo não muda seleção nova |
| NOTÍCIAS/Leitor | Sem Notícias/sem resultado, normal, resumo ausente, confirmado/oculto, conteúdo completo, foco/fechamento e link original. Destaque/relacionadas/Últimas notícias respeitam filtros e ocultações; sem itens, mostram vazio. Imagem carregando/válida/ausente/falhou: somente a matéria correspondente fornece a foto; falha não oculta título/Fonte/link nem usa substituta. Lateral financeira permanece em zero Notícias; valores demo e ausências continuam distintos |
| Finanças em NOTÍCIAS | Cobertura completa/valor ausente/último válido/demo e favorito marcado/desmarcado. Filtro de manchetes não reduz ações, macro ou índices mundiais; estado zero mantém todos os blocos financeiros. Preço/unidade/data/origem/status disponíveis seguem a semântica comum; ausente fica “—”, sem selo LIVE de fixture |
| Diálogo financeiro | Fechado/aberto com ação, pergunta vazia, sugestão/pergunta respondida localmente, foco e fechamento. Reabrir por outro botão identifica o contexto correspondente; callback/resposta antiga não troca a ação atual. IA real indisponível mantém a demonstração explicitamente identificada |
| Fila | Pendentes/preview/edição/resolvido/fila vazia, conflito ou autorização negada, publicação staged/compensação. Fixture local não é aprovação em produção |
| Chat | Fechado/painel/tela cheia, sem Histórico, escrevendo/respondendo, erro/timeout/budget gate/foco e fontes. Ceiling real zero até Q1/Q7; mock pode demonstrar resposta sem rede paga |
| Faixa/MERCADOS | Cold-load/último válido/atrasado/Fonte parcial, fechado-aberto pregão, WATCH vazio, ticker desconhecido/foco e macro indisponível |
| Busca/Ajuda/ajustes | Aberto/fechado/sem resultado/foco, erro de preferência, Som bloqueado sem gesto. Popup superior consome Esc |
| BACKBONES/OSM | Desligado/carregando/mostrado/falhou, sem conexão confirmada, crédito obrigatório. Falha de tiles volta satélite e mantém exploração; proveniência/licença e provider continuam gated |
| Aplicação autenticada | Negado/sem sessão: não expor snapshots, Histórico ou comandos; mock visual não comprova login. Origem/Data/status vêm da política comum, não da paleta |

A Ficha de empresa e o Leitor exibem seu conteúdo imediatamente nesta variante; a decoração ASCII e a digitação CRT ficam restritas aos templates originais. As ações de seleção, leitura, navegação e fechamento continuam herdadas.

## Interaction Primitives

Semântica única: esta variante muda somente a apresentação; renderer, store e domínio são compartilhados. O reducer proprietário e seus intent tokens da arquitetura conservam seleção, filtros, aba, base MAPA/SAT, janelas e callbacks. Painéis Leitor lateral/Fila/MERCADOS continuam exclusivos; Chat convive, Terminal desvia; clique em controle não fecha Empresa e arrasto nunca equivale a clique fora. Esc atua uma camada por vez, com foco de retorno. No Chat, completa uma resposta em andamento antes de fechar; Empresa e Leitor apresentam o conteúdo imediato.

O diálogo financeiro é modal nativo sobre a página Notícias: ao abrir, foco vai para a pergunta; Tab fica no diálogo, Escape/botão fecha e devolve foco ao botão da ação de origem. Enquanto aberto, a página atrás não recebe ações. Fechar não muda filtro, aba ou seleção. Favorito marca/desmarca o WATCH sem disparar ticker, voo ou abertura do diálogo. O botão de conversa identifica o mesmo ticker/Empresa da linha; o contexto não inclui segredos ou conversas do especialista LLM.

Preferências do **preview separado** usam exclusivamente `mg-aa-*` — por exemplo `mg-aa-template`, `mg-aa-tab`, `mg-aa-reader`, `mg-aa-model-style`, `mg-aa-feed`, `mg-aa-watch`, `mg-aa-sound`, `mg-aa-mode`. Não ler, migrar ou escrever `mg4-*`, nem chaves dos seis temas. Erro de localStorage usa estado temporário, sem quebrar leitura. Modelo/Empresa/Notícia continuam os IDs já existentes; não há domínio paralelo.

Fundo do Globo é uma preferência experimental no namespace AA. A escolha fica salva separadamente em cada modo: claro `#ECEDEF`/`#F1F2F4`/Branco `#FFFFFF`; escuro `#25272D`/`#1B1D22`/Preto `#08090B`. Trocar fundo ou modo não altera base, câmera, seleção, filtros ou cores das Camadas nem regrava os temas originais. O core usa família `artificial-analysis`, modo independente `light`/`dark` e defaults `light`/`analytic`. O ID local recém-introduzido `artificial-analysis-light` foi substituído antes de uma versão exportada; o diretório conserva esse nome histórico, sem migração v1 requerida. Preferências antigas válidas continuam preservadas; o default não comprova integração final.

Prioridade no preview: modo válido `?mode=claro/escuro` explícito → light, independentemente do último modo salvo. A entrada do projeto explicita `?mode=claro`. O alias escuro acrescenta `mode=escuro` quando não há override explícito válido; `?mode=claro` no alias ganha de escuro e da preferência salva. O controle Modo salva escolha manual apenas no namespace AA. A aba segue URL/restauração própria → MODELOS, independentemente do modo. Valores inválidos são ignorados, sem apagar estado válido.

A URL de domínio continua Camadas/base/aba/Empresa, com `base=MAPA|SAT` canônico e aliases legados `view` conforme o contrato comum; `mode` é parâmetro de apresentação destes previews, sem segredos ou conversas. Override da URL não regrava preferências. O retorno dos previews antigos abre a família padrão em `?mode=claro&tab=globo`, com prioridade sobre modo próprio salvo sem regravá-lo; não copia filtros/seleções ou preferências `mg4-*` para o preview separado. Na aplicação, família e modo são preferências independentes do mesmo store; trocar família não força light, e Histórico/curadoria não são duplicados. `[ASSUMPTION: nomes finais das chaves mg-aa-* conforme implementação do preview]`.

## Accessibility Floor

Todas as funções herdadas operam por teclado/toque conforme dispositivo; nenhuma desaparece porque o HUD virou editorial. Abrir/fechar janelas move/restaura foco; controles e estados têm nomes e sinais além da cor. Gráficos precisam leitura equivalente por tabela/valores, inclusive quando sem dados.

Texto e controles essenciais seguem os alvos de contraste de DESIGN §Colors. `{colors.muted}` e amarelo de métrica não são automaticamente cores de texto acessível; usar `{colors.text}`/`{colors.secondary-text}` no claro e `{colors.dark-text}`/`{colors.dark-muted}` no escuro. Foco preto em controles claros, claro em controles escuros. Modo é acionável por teclado/toque e informa estado atual além da cor. Reduzir movimento remove rotação, pulso/digitação animados/entradas; deixa destaque estático e Faixa acessível manualmente. Zoom de página continua disponível. Campos/gráficos/tabela não capturam atalhos do Globo quando o foco está neles.

## Key Flows

Os nomes UJ-1…3 são os do PRD. Fluxos4…7 do [EXPERIENCE original](../../EXPERIENCE.md#key-flows) permanecem herdados, com painéis do modo escolhido e gates/estado atualizados pela arquitetura. VX registra entrada, composição editorial e diálogo demonstrativo; não declara IA financeira real disponível.

### VX-1. Andre entra no padrão e alterna templates

1. Andre abre a família padrão `artificial-analysis`; a galeria oferece seus modos claro/escuro e mantém os seis temas originais, totalizando oito opções.
2. Sem URL/preferência própria válida, MODELOS abre com hero serifado, três cards de métricas e Tabela; o aviso de demonstração fica visível.
3. Ele confere Inteligência, Velocidade e Custo, usando valores/unidades/legendas, e continua na Tabela para filtrar.
4. **Clímax:** reconhece um programa editorial completo em claro ou escuro e consegue acessar Globo/Notícias/Agente/Fila/MERCADOS sem abandonar as funções anteriores.
5. Usa Templates para abrir uma alternativa; “Design padrão ↗” no cabeçalho ou a entrada no menu de tema permite retornar diretamente ao padrão. Tema e preferências de cada preview continuam preservados; um override válido `tab=globo` pode retornar à mesma aba sem mudar o default MODELOS.
6. Usa Modo para alternar claro/escuro sem perder a aba, a seleção ou os filtros. Um link explícito de modo ou o alias escuro abre a mesma aplicação no modo solicitado, com prioridade sobre a preferência salva.

Falha: valor inválido de URL/preferência é ignorado; sem estado próprio válido usa MODELOS/light. Armazenamento indisponível mantém a escolha manual na sessão. Dados demo não se tornam LIVE pelo template.

### VX-2. Andre lê Notícias na composição editorial

1. Andre abre NOTÍCIAS e encontra o destaque com imagem original verificada ou placeholder, Principais notícias, Últimas notícias e a coluna Empresas em foco/cotações, no modo escolhido, com acento `#6001D2` claro / `#C092FF` escuro.
2. Filtra por Camada ou Empresa; os blocos de manchetes respeitam esse mesmo conjunto e as ocultações existentes. As cotações laterais continuam ligadas ao Cadastro/MERCADOS.
3. Abre uma manchete e lê o conteúdo imediato no Leitor, conferindo Fonte, data, Empresas e link original.
4. **Clímax:** percorre as Notícias do setor com a nova hierarquia editorial, preservando os destinos e ações do programa.

Destino complementar: ticker abre MERCADOS; badge Empresa retorna ao Globo. Imagem verificada da matéria mantém procedência/link original; ausência ou erro usa placeholder sem foto, sem bloquear leitura.

Falha: filtro vazio mostra estado vazio nos blocos, sem manchete inventada; resumo ausente mantém título/veículo/data/link. No preview, notícias demonstrativas continuam identificadas como simulação.

### VX-3. Andre consulta uma ação na lateral financeira

1. Andre abre NOTÍCIAS e confere amplitude, seis Empresas em foco, outras 23 ações por Camada, panorama macro e índices mundiais, todos demonstrativos. Mesmo com zero manchetes, a cobertura financeira permanece.
2. Marca um favorito e usa “Conversar sobre {ticker}” abaixo da ação desejada; o diálogo identifica a Empresa/ação e move o foco para a pergunta.
3. Escolhe uma sugestão ou escreve uma pergunta; recebe resposta local claramente simulada do futuro especialista financeiro, sem enviar ao console LLM ou chamar API.
4. **Clímax:** acessa os dados e o contexto de qualquer uma das 29 ações no mesmo lugar. Fecha com Escape/botão e retorna ao ponto de origem, sem perder filtros ou modo.

Falha: campo ausente permanece “—”; IA real indisponível não é disfarçada por resposta demo. Reabrir por outra ação troca o contexto correspondente, sem reaproveitar resposta antiga como se fosse da nova ação.

### UJ-1. Andre confere a manhã do setor de IA

1. Partindo de MODELOS, Andre ativa GLOBO ou escolhe uma Empresa; Globo, FLUXO e Faixa se apresentam com os tokens do modo escolhido.
2. Vê o Lab com Lançamento recente, usa Prévia ou toque e fixa o Terminal com Modelos/Notícias/Relações.
3. A manchete abre Leitor no mesmo modo; ele confere resumo em português, pontos-chave e fonte original.
4. **Clímax:** identifica as mudanças do setor sem perder a Empresa selecionada, mantendo navegação e fontes.

Falha: Fonte atrasada mantém last-good/data; resumo indisponível mantém título/veículo/data/link. No mock o aviso demo distingue o exemplo de evento real.

### UJ-2. Andre escolhe um Modelo barato para um projeto

1. Andre já chega em MODELOS e observa os três resumos visuais, sem tratá-los como benchmark produzido pelo aplicativo.
2. Filtra a Tabela por capacidade e ordena por custo estimado; confere a fórmula 2.000+1.000 no ⓘ.
3. Compara inteligência/contexto/unidade de preço e sinal ≈ em raciocínio; pede navegação ao Agente somente no modo permitido.
4. **Clímax:** encontra o candidato nos mesmos dados canônicos da Tabela, com a apresentação editorial do modo escolhido ajudando a leitura.

Falha: filtros sem resultados exibem estado vazio; falta de valor fica “—”; erro/budget do Agente não bloqueia comparação nem ativa chamadas pagas.

### UJ-3. Andre aprova um Laboratório novo

1. Andre abre a Fila pelo badge, no modo atual e inspeciona motivo/origem por campo.
2. Usa a prévia fantasma em GLOBO, edita o campo e confirma a revisão.
3. A decisão fica staged para a próxima Atualização; DESFAZER antes da publicação devolve pendente.
4. **Clímax:** curadoria continua sob autoridade de Andre, com estado visível e sem publicação direta de agente.

Falha: conflito/negado preserva a proposta e informa o estado; depois de publicar, desfazer é compensação revisada. No preview a ação é simulada e não grava em serviço real.

### CAP-8. Andre explora infraestrutura junto às Empresas

1. Andre abre GLOBO e liga BACKBONES; identifica cabo/estação com créditos presentes.
2. Confere cidade e conexão confirmada sem inferir propriedade de Empresa pela localização.
3. Aproxima para detalhe OSM, preservando a Empresa selecionada e atribuição; afasta e retorna ao satélite.
4. **Clímax:** explora ruas e infraestrutura no mesmo contexto das Empresas, com os painéis do modo escolhido.

Falha: Fonte/proveniência/provider não autorizado mostra indisponibilidade sem eliminar os controles; tile falho retorna satélite. O preview não comprova integração/licença nem inicia varredura de tiles.

A [conferência visual e funcional](../../verification-artificial-analysis-2026-10-12.md) registra as interações executadas no preview e separa os estados ainda definidos somente nos contratos. O retorno dos seis temas ao padrão ficou visível também em 390px; as opções de fundo e sua persistência funcionaram. Dark foi conferido com página `#101114`, texto `#F2F2F3`, cards/Leitor `#18191D`, Globe Earthnight e fundo suave `#25272D`. Troca de modo manteve a aba; escuro salvo restaurou sem parâmetro; alias escuro e override claro passaram; galeria teve oito links. MODELOS/NOTÍCIAS escuros em 390px ficaram sem overflow global. Notícias foi conferida em 1280px e 390px sem overflow global, com filtro Empresa/Camada, estado vazio/reset, Leitor correspondente à manchete e ticker abrindo MERCADOS na mesma aba NOTÍCIAS. A escolha final do tom do Globo permanece com Andre.

A atualização financeira/imagens foi conferida em 1280×720 e 390×844, em claro/escuro, sem overflow global. Os 29 botões, 10 indicadores macro e 11 linhas mundiais permaneceram com zero Notícias; favoritos NVDA sincronizaram entre Notícias e MERCADOS nos dois sentidos. As cinco imagens originais carregaram com largura natural de 1200px; manchete Nvidia abriu Leitor com a mesma imagem/URL e demos sem URL usaram placeholder. NVDA abriu USD/NASDAQ, SK Hynix/Samsung KRW/KRX; modal Samsung coube em 356px no celular. Pergunta/resposta local demo, foco inicial, Escape e retorno de foco foram observados. Essa amostragem não comprova IA real, ingestão automática nem falha de rede: o fallback em erro continua contratado e não foi induzido.

## Responsive & Platform

Desktop/tablet são principais. Em largura reduzida, os três cards se empilham; a Tabela mantém colunas principais e expansão/rolagem herdadas; Notícias apresenta destaque/Principais notícias, coluna financeira e Últimas notícias na sequência móvel atual. Ações podem reorganizar, mantendo Busca, Som, Relações, Templates, Agente, Fila, MERCADOS, BACKBONES e navegação alcançáveis; retorno ao padrão continua visível nas alternativas. Horário/status/créditos não desaparecem por quebra de layout. Painel móvel pode ocupar a tela e o foco acompanha a janela. `[ASSUMPTION: breakpoint exato definido pelo mock, sem corte funcional]`.

Na lateral financeira, os 29 botões de conversa, favoritos, amplitude e panoramas continuam alcançáveis no celular. Diálogo financeiro respeita a largura/altura disponível, com conteúdo rolável, pergunta e fechamento acessíveis em ambos os modos; nenhuma ação depende de hover.

## Inspiration & Anti-patterns

Capturar a composição Artificial Analysis clara observada: serifas editoriais, cápsulas, cards e gráficos densos legíveis. O escuro é adaptação própria. Notícias usa Yahoo Finance observado escuro, claro adaptado, com destaque/imagem da matéria original verificada, manchetes sans em negrito, Principais notícias e lateral financeira; acento `#6001D2` claro / `#C092FF` escuro. Imagens pertencem à matéria correspondente, com procedência/link; ausência/erro usa placeholder, sem importar fotografias genéricas do Yahoo. Não copiar métricas, logos, Premium ou modelo comercial do Artificial Analysis. Preservar os seis temas; nesta família todos os painéis acompanham o modo, sem forçar light ao trocar família.

## Gates e limites herdados

Fontes/métricas/cotações continuam com origem/data/unidade, IDs canônicos e ausência distinta de zero. Q1/Q7 preservam ceiling zero de chat/busca até decisões/provas; Q2 preserva infraestrutura/autenticação; Q4/Q6 preservam licença de cabos/provedor de tiles; Q5 preserva cobertura de macro. **Q3 resolvido em 2026-10-13 na linha original** (ver [Accessibility Floor](../../EXPERIENCE.md#accessibility-floor)) — herdado por compartilhar renderer/store/domínio; emblema também compartilhado, sem versão própria da variante. Fixtures e revisão local não abrem os demais gates. Desenho final da variante não declara funcionalidades reais implementadas, publicação autorizada ou readiness completa.

O especialista financeiro por ação é IA futura representada por diálogo e respostas locais demo. Provider, modelo, pesquisa, fontes financeiras reais, custo e política de conversa dependem de decisão própria antes de integração; o preview não ativa serviços pagos nem altera o gate do especialista LLM. A cobertura financeira descrita nesta atualização usa apenas as informações já disponíveis no projeto.
