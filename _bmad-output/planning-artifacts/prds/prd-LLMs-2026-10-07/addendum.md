# Addendum — PRD Monitor Global de Labs de LLM

Material técnico para a arquitetura do [PRD](prd.md), atualizado em 12/10/2026 para refletir as decisões de UX e a integração planejada do Cesium ao Globo principal. Opções de implementação não comprovam integração real. As verificações de 07/10 abaixo permanecem uma fotografia datada; as fontes geográficas de §F foram reconsultadas em 09/10 e a evidência técnica Cesium está nos documentos de arquitetura.

## A. Fontes de dados (fotografia de 2026-10-07)

| Dado | Fonte | Acesso | Observações |
|---|---|---|---|
| Índice de inteligência, benchmarks, preço de entrada/saída, tokens/s, TTFT, `release_date` | Artificial Analysis `GET /api/v2/data/llms/models` | Chave gratuita (`x-api-key`, em `.env` como `AA_API_KEY`) | 696 modelos / 58 criadores. Limite de 1.000 req/dia; recomenda-se cache. Atribuição obrigatória. Não traz custo por tarefa, tokens de raciocínio, contexto, cache nem modalidades. Usar `id` e `model_creator.id` como chaves estáveis. |
| Contexto, preço de cache (leitura/escrita), modalidades de entrada/saída, data de criação | OpenRouter `GET /api/v1/models` | Sem chave | 467 modelos / 63 organizações. Preços vêm por token; multiplicar por 1e6 para obter o preço por milhão. |
| Modelos de pesos abertos, licença, downloads, data | Hugging Face `GET /api/models?author=<org>&sort=createdAt` | Sem chave | Detecta Lançamentos de Modelos de pesos abertos. |
| Notícias | GDELT DOC API (`mode=artlist&format=json`) | Sem chave | Multilíngue; gera muitos falsos positivos na busca por nome. |
| Notícias | Google News RSS (`/rss/search?q=`) | Sem chave | Complementar ao GDELT. |
| Cotações e Índices (`^IXIC`, `^NDX`, `^GSPC`, `^SOX`, bolsas fora dos EUA) | Yahoo Finance `v8/finance/chart` (não oficial) | Sem chave | Fonte principal de cotações. Pode quebrar ou ser bloqueada sem aviso. |
| Cotações dos EUA (reserva) | Finnhub `/api/v1/quote` | Chave gratuita | Usar apenas como fonte de reserva para o Yahoo Finance. |
| Lista de títulos da Nasdaq (referência) | nasdaqtrader.com / screener api.nasdaq.com | Sem chave | Apenas para conferir tickers. |

**Logos (coleta única, guardadas no projeto):** Simple Icons (SVG; não cobre todas as marcas, como a OpenAI), kits de imprensa oficiais e Wikimedia Commons. Logos novas entram pela Fila de revisão.

**Indisponíveis ou descartadas:** Clearbit Logo API (fora do ar), logo.dev (exige chave), Stooq (não responde) e scraping do site do Artificial Analysis (viola os termos).

**Ampliação MERCADOS (FR-36):** Yahoo/Finnhub acima não comprovam cobertura e reserva de todos os ativos novos. A arquitetura precisa definir símbolos, unidades, bolsas/mercados, histórico de um mês, calendário/fuso e cadência para VIX, US 10Y, Dólar, Ouro, WTI, Bitcoin e índices de Américas/Europa/Ásia. Nenhum ticker de exemplo do protótipo vira obrigação de curadoria. Reserva gratuita para ações dos EUA não equivale a reserva mundial; registrar lacunas e o comportamento com últimos dados válidos.

## B. Lista inicial obrigatória (FR-20) — tabela completa

A Camada principal define a cor do Ponto. As Etiquetas não mudam a cor, mas fazem a Empresa aparecer também no Filtro da Camada correspondente. *Confirmar cada ticker na implementação.*

| Empresa | Ticker · Bolsa | Camada principal | Etiquetas |
|---|---|---|---|
| Google (Alphabet) | GOOGL · Nasdaq | Laboratórios (Gemini) | Chips (TPU), Nuvem |
| Apple | AAPL · Nasdaq | Laboratórios (Apple Foundation Models) | Chips (Apple Silicon) |
| SpaceX (incorporou a xAI em fev/2026) | SPCX · Nasdaq (desde jun/2026) | Laboratórios (Grok) | Nuvem (Colossus) |
| Microsoft | MSFT · Nasdaq | Laboratórios (MAI, Phi) | Nuvem (Azure) |
| IBM | IBM · NYSE | Laboratórios (Granite) | Nuvem |
| Meta | META · Nasdaq | Laboratórios (Llama) | — |
| OpenAI | Privada | Laboratórios | — |
| Anthropic | Privada | Laboratórios | — |
| Mistral AI | Privada | Laboratórios | — |
| DeepSeek | Privada | Laboratórios | — |
| Moonshot AI | Privada | Laboratórios | — |
| Zhipu AI | Confirmar listagem | Laboratórios | — |
| Alibaba | BABA · NYSE / 9988 · HKEX | Laboratórios (Qwen) | Nuvem |
| Baidu | BIDU · Nasdaq | Laboratórios (ERNIE) | Nuvem |
| Amazon | AMZN · Nasdaq | Nuvem (AWS) | Laboratórios (Nova), Chips (Trainium) |
| Oracle | ORCL · NYSE | Nuvem (OCI, Stargate) | — |
| CoreWeave | CRWV · Nasdaq | Nuvem | — |
| Equinix | EQIX · Nasdaq | Nuvem (data centers) | — |
| Vertiv | VRT · NYSE | Nuvem (infra de data center) | Energia |
| Arista | ANET · NYSE | Nuvem (rede) | — |
| NVIDIA | NVDA · Nasdaq | Chips | Software (CUDA), Laboratórios (Nemotron) |
| TSMC | TSM · NYSE / 2330 · TWSE | Chips | — |
| Broadcom | AVGO · Nasdaq | Chips | — |
| AMD | AMD · Nasdaq | Chips | — |
| ASML | ASML · Nasdaq | Chips | — |
| Micron | MU · Nasdaq | Chips | — |
| SK Hynix | 000660 · KRX | Chips | — |
| Samsung | 005930 · KRX | Chips | — |
| Constellation Energy | CEG · Nasdaq | Energia | — |
| Vistra | VST · NYSE | Energia | — |
| Oklo | OKLO · NYSE | Energia | — |
| GE Vernova | GEV · NYSE | Energia | — |
| NuScale | SMR · NYSE | Energia | — |
| Tesla | TSLA · Nasdaq | Software (FSD, Optimus) | Chips (AI5), Energia |
| Palantir | PLTR · Nasdaq | Software | — |

## C. Fórmula do Custo estimado por tarefa (FR-11)

```
custo_tarefa = (tokens_in × preço_in_por_M + tokens_out × preço_out_por_M) / 1.000.000
Tarefa padrão: tokens_in = 2.000, tokens_out = 1.000   (confirmada)
```

Em Modelos de raciocínio, o Custo estimado por tarefa aparece com "≈", porque a API gratuita não informa os tokens de raciocínio.

## D. Arquitetura sugerida (não vinculante)

- **Atualização:** jobs agendados no GitHub Actions. Cada job busca, valida e grava arquivos JSON (`data/models.json`, `data/news/<slug>.json`, `data/quotes.json`, `data/status.json`).
- **Agendamento:** o cron do plano Vercel Hobby roda cerca de 1 vez por dia (confirmar). Por isso, o agendamento fica no GitHub Actions.
- **Cadastro e Relações:** dados curados versionados ou persistidos, com logos locais. Operações de revisão exigem serviço autenticado, validação de origem, efeito de DESFAZER e publicação de snapshot após aprovação. FR-23 preserva a publicação na próxima Atualização; a escrita imediata no protótipo é demonstração.
- **Agente de notícias:** LLM de baixo custo com saída validada por esquema fixo, ampliado para relevância, resumo em português, pontos-chave e Empresas citadas. Resolver citações para Empresas do Cadastro, sem criar Empresas por geração de texto. O texto da matéria entra somente como dado; o agente não tem ferramentas nem permissão de escrita no Cadastro, nos Modelos ou na Fila. Nunca gerar a tradução integral como requisito do Leitor.
- **Interface e serviços:** a leitura de dados estruturados permanece em snapshots JSON. Chat, busca web, Histórico e revisão precisam de contratos autenticados de execução/escrita; a aplicação completa não é apenas um leitor estático. A UX registra HTML/CSS/JS vanilla com WebGL; biblioteca e backend cabem à arquitetura. Hospedagem e persistência permanecem abertas, com adaptadores de Fonte e contratos independentes de provedor.
- **Acesso restrito (FR-30):** verificar acesso em interface, endpoints, snapshots, Histórico e mutações. URL da vista não dá permissão. Vercel, AWS e Cloudflare são opções a comparar por suporte de autenticação, armazenamento e custo atual; não pressupor que proteção de uma página cobre endpoints ou arquivos.
- **Globo:** decisão posterior à redação desta sugestão: CesiumJS é o renderer do Globo principal, atrás de uma fronteira própria. Isso substitui os exemplos anteriores globe.gl / three.js; decisões e gates de integração estão em [AD-17 no spine de arquitetura](../../architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md) e no [handoff Cesium](../../architecture/architecture-LLMs-2026-10-10/cesium-integration.md). A decisão do renderer não aprova provedores de mapas, terreno, edifícios ou fotorealismo.
- **Som:** Web Audio API com cliques sintetizados. O `AudioContext` só é criado após um gesto do usuário.
- **Chat:** contrato próprio de ferramentas de navegação validadas, fontes citadas e isolamento de conteúdo da web. Modelo, provedor de busca, retenção/exclusão do Histórico e permissões de proposta na Fila ainda precisam decisão. Estado simulado do console não comprova inferência, busca nem persistência.
- **Custos:** notícias e descoberta mantêm o teto confirmado de cerca de US$ 5/mês e aplicam o comportamento de degradação previsto nos marcos de 80% e 100% do teto. Resumo estendido do Leitor usa o processamento de Notícias; resumo solicitado em MERCADOS usa o chat. O orçamento de chat/busca/Histórico/mapas e o limite de suspensão do chat devem ser definidos antes de ativar serviços, sem presumir verba ilimitada.
- **Falhas e status:** definir LIVE/ATRASADO/OFFLINE por idade e conectividade de cada tipo de dado, evitando que uma Fonte indisponível apague dados válidos de outra. Guardas contra coleções vazias/incompletas precisam respeitar o contrato de cada Fonte e a ausência legítima de Notícias novas.

## E. Alternativas rejeitadas (com justificativa)

- **Nasdaq inteira:** são cerca de 4 mil títulos; os Laboratórios ficariam diluídos e as Notícias custariam cerca de 40 vezes mais.
- **Filtro por bolsa ou setor oficial:** excluiria TSMC, Oracle, Vistra e Oklo e incluiria cerca de 700 empresas de "tech/energia" sem relação com IA.
- **Plano Pro do Artificial Analysis (US$ 417/mês):** desproporcional para uso pessoal.
- **Agente publicando direto no Cadastro, sem a Fila de revisão:** risco de prompt injection e de dados falsos.
- **Rodar só no Mac:** as Atualizações param quando o Mac dorme.
- **Áudio ligado por padrão ou acionado só ao passar o mouse:** os navegadores bloqueiam som sem gesto do usuário, e o som cansa com o uso.
- **Heatmap por Camada:** permanece fora. Cartões de índices e minigráficos fazem parte do Painel MERCADOS vigente.

## F. BACKBONES e detalhe OpenStreetMap — evidência em 2026-10-09

### TeleGeography

A decisão de BACKBONES vem das últimas entradas do memlog UX: cabos submarinos, estações de pouso com cidade/cabos, botão próprio inicialmente desligado, nome do cabo na interação e crédito visível. Fibra terrestre fica futura. Essa sobreposição geográfica é independente das cinco Camadas de Empresas e das Relações curadas.

O snapshot local do protótipo contém 733 cabos e 1.926 estações; essa quantidade não é requisito de cobertura atual. A string de origem nos JSONs menciona CC BY-NC-SA 3.0, mas não inclui origem exata, data de captura ou texto de licença. A [FAQ atual da TeleGeography](https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions) informa que o repositório GitHub deixou de ser mantido e diferencia o mapa dos dados brutos licenciados. A [oferta de dados geocodificados](https://www2.telegeography.com/license-geocoded-map-data) usa licença anual; a [política de citação de mapas](https://www2.telegeography.com/cite-telegeography-map) não demonstra os direitos do snapshot local.

Antes da publicação de BACKBONES, comprovar proveniência, licença aplicável, direito de uso/atualização e custo. Não substituir essa comprovação por atribuição visual, nem inferir que a licença de uma captura cobre os dados brutos. A arquitetura pode avaliar Fonte utilizável sem mudar o escopo funcional acordado; eventual custo precisa decisão do dono.

O JSON de estações inspecionado traz nome/coordenadas, sem IDs dos cabos conectados; o contrato estação ↔ cabo ainda precisa fonte e modelagem. Os traçados são referências estilizadas e não representam levantamentos precisos das rotas físicas. Os dados são carregados quando a camada é ligada; seleção de Empresas e desempenho do Globo precisam continuar utilizáveis.

### Tiles OpenStreetMap

Na v1, o usuário escolhe MAPA ou SAT sobre o Globo sempre 3D. MAPA usa base cartográfica de fundo bem escuro e revela cidades, rodovias e ruas OpenStreetMap ao aproximar. Em SAT, imagem de satélite aparece em zoom amplo; em área coberta e zoom próximo, ocorre uma transição automática para a cena fotorealística 3D. Ao afastar, sair da área de cobertura ou ocorrer falha na camada fotorealística, a base retorna à imagem de satélite. Terreno acompanha as bases; edifícios aparecem onde houver conteúdo compatível, sem duplicar a geometria de um tileset fotorealístico. A composição entre SAT, terreno e o tileset fotorealístico depende do provedor e precisa ser validada pela arquitetura. Os limiares do protótipo são demonstrativos; não fixam distância ou nível de zoom do produto. A UX define a base inicial antes das stories e a arquitetura define os limiares, estabilidade, provedores e fallback.

A cartografia escura é um requisito de estilo; não presumir que o raster padrão de um serviço de tiles OSM o satisfaça. A arquitetura deve escolher uma fonte ou composição que entregue a aparência escura e os créditos exigidos.

Se usar `tile.openstreetmap.org`, seguir a [política oficial de tiles raster](https://operations.osmfoundation.org/policies/tiles/): HTTPS, Referer válido no navegador, crédito visível, cache conforme os headers, sem bypass de cache, pré-busca em massa ou download offline. O serviço não oferece SLA. Outro provedor pode ter condições próprias. A [página copyright do OSM](https://www.openstreetmap.org/copyright) documenta a atribuição e a licença dos dados; dados e serviço de tiles não são o mesmo contrato.

A falha de tiles MAPA não troca silenciosamente a base para SAT; mantém o Globo utilizável e informa indisponibilidade. Se a camada fotorealística falhar em SAT, a imagem de satélite continua como base. Os créditos permanecem legíveis nos seis temas e no celular. Avaliar cache, tráfego e desempenho por uso interativo; não executar varredura automatizada de tiles para validar o protótipo.

### Composição SAT e fotorealismo Cesium

O [quickstart oficial Cesium para Google Photorealistic 3D Tiles](https://cesium.com/learn/cesiumjs-learn/cesiumjs-photorealistic-3d-tiles) desativa o globo padrão (`globe: false`) para usar as tiles como base global. A [API de ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html) também documenta imagery sobre Globe ou Cesium3DTileset; isso não comprova que misturar uma imagem SAT com as texturas fotorealísticas seja legível ou licenciável. Validar a combinação e suas transições com o provedor efetivo antes das stories.

## G. Referência de UX e limites do protótipo

- [DESIGN.md](../../ux-designs/ux-LLMs-2026-10-09/DESIGN.md) define estética e tokens; [EXPERIENCE.md](../../ux-designs/ux-LLMs-2026-10-09/EXPERIENCE.md) define interação. Ambos seguem em rascunho e agora registram a projeção 3D fixa com bases MAPA/SAT, cartografia escura, detalhe OSM progressivo e transição automática entre imagem de satélite e fotorealismo; Q3/Q6 continuam abertos. BACKBONES/OSM e os limites de provider seguem descritos nos documentos UX.
- O [HTML promovido](../../ux-designs/ux-LLMs-2026-10-09/mockups/prototype-globe.html) demonstra a experiência v5 até MERCADOS. O [HTML de trabalho](../../ux-designs/ux-LLMs-2026-10-09/.working/prototype-globe.html) contém controles de BACKBONES/OSM posteriores que ainda não foram promovidos. Assets nas duas pastas não comprovam paridade de comportamento.
- Chat, Fila e MERCADOS têm dados/ações simulados. Checks anteriores de UI não provam APIs, autenticação, escrita, busca, licenças, persistência ou integração real. Esta atualização é documental e não executou o protótipo.
- Medidas de referência: Laboratório ◆9 px (selecionado 12), rótulo 8 px, ecossistema 6 px; coordenadas verdadeiras ficam no Cadastro, mesmo quando a UI espalha Pontos. Temas: OSIRIS fiel, Fósforo âmbar e Sala de controle noturna, cada uma com modo claro/escuro. Ajustes de acessibilidade em conformidade com WCAG AA registrados não substituem verificação de texto sobre textura, transparência e brilho.
- Acabamento pendente: controles móveis, apresentação e legibilidade de MAPA/SAT e da transição automática para o fotorealismo, tratamento de horários em telas menores, busca/ajuda/emblema, largura e modo ampliado de MERCADOS, logos no zoom e transição ASCII, navegação por muitos Pontos e limiares de status. Donos e momentos de revisão estão no PRD §11.

## H. Critérios para o desenho técnico

Antes das stories, arquitetura e UX precisam definir cenários verificáveis para chat/erros/orçamento, gravação e DESFAZER, status por Fonte, faltas de dados em macro, associação estação/cabo, bases MAPA/SAT, transição automática e carregamento/falha do fotorealismo. Avaliar as metas do PRD com ~200 Empresas e também com terreno, edifícios, Relações, rótulos e BACKBONES ligados; o desempenho com infraestrutura não foi medido. Não reduzir funções no celular para compensar problemas de layout.

Os requisitos de navegação e Histórico do Agente não o autorizam a alterar diretamente o Cadastro. Ferramentas, limites de acesso a dados e estado restaurado por URL devem ser validados no servidor quando envolverem escrita ou dados privados.
