---
title: Reconciliação de input — BACKBONES e detalhe OpenStreetMap
date: 2026-10-09
status: extracted-input
purpose: Subsídio factual para editar o PRD existente, sem escolher fornecedor ou arquitetura
---

# Reconciliação de input — BACKBONES e detalhe OpenStreetMap

Extração por leitura de código e documentos em 2026-10-09. Nenhuma execução no navegador ou integração de produção foi realizada nesta extração. Código de protótipo não comprova implementação do produto.

## Decisões explícitas na UX

Fonte: `../../ux-designs/ux-LLMs-2026-10-09/.memlog.md`, linhas 101–103.

| Tema | Decisão registrada | Limite da evidência |
| --- | --- | --- |
| BACKBONES | Camada de cabos submarinos e estações de pouso; cidade e cabos conectados; referência TeleGeography; relações com infraestrutura. | O registro menciona 733 cabos e CC BY-NC-SA. Esses dados são do snapshot do protótipo e a licença não foi confirmada para o dataset atual. |
| Controle | Botão próprio na barra direita; desligado no início; passar o mouse no cabo mostra seu nome. | Comportamento solicitado para o produto. |
| Crédito | “Cabos: TeleGeography” visível enquanto a camada estiver ligada. | Texto de atribuição registrado; licença e condições do dataset precisam ser verificadas separadamente. |
| Fibra terrestre | Camada futura. | Não entra na camada submarina atual. O motivo “sem base aberta global hoje” consta no log; não foi pesquisado nesta extração. |
| Detalhe OSM | Afastado: satélite do tema. Ao aproximar além de um limiar: tiles OSM com cidades, rodovias e ruas. Ao afastar: volta ao satélite. | Limiar final não definido; o número no código é parâmetro de protótipo. |
| Crédito OSM | “© OpenStreetMap contributors” visível durante exibição dos tiles. | Requisito confirmado. |
| Tiles | Visualização interativa, sem pré-download, cache do navegador. Avaliar estilo escuro derivado de OSM na arquitetura. | Não houve escolha de provedor; estilo escuro não foi implementado no trecho inspecionado. |

## Estado encontrado nos artefatos

Fonte de código mais recente: `../../ux-designs/ux-LLMs-2026-10-09/.working/prototype-globe.html`, linhas 809–823. A versão promovida `mockups/prototype-globe.html` não contém `bBB`, `BACKBONES`, `OSM_ALT` ou `globeTileEngineUrl`; portanto, as últimas duas decisões ainda não aparecem nesse HTML promovido, embora seus assets estejam presentes.

| Item | Observado por inspeção estática |
| --- | --- |
| Dados locais | `assets/cables.json`: 327.807 bytes, campo `cables: 733`, 1.948 segmentos; `assets/landing-points.json`: 108.238 bytes, 1.926 pontos. Arquivos presentes tanto em `.working/assets/` como em `mockups/assets/`. Não são uma verificação da cobertura global atual. |
| Proveniência local | Ambos têm apenas a string `src: TeleGeography submarinecablemap.com (CC BY-NC-SA 3.0) — baixado para protótipo pessoal`. Não há URL exata de download, data de captura, hash upstream ou texto de licença no JSON inspecionado. |
| Cabo | Cada segmento contém `n` (nome), `id` e `p` (coordenadas). O código desenha caminhos no globo, muda a cor ao passar o mouse e exibe nome. |
| Estação | Cada ponto contém `n`, `lat`, `lng`. Tooltip exibe “Estação de pouso” e nome/cidade; o JSON não contém ligação com IDs de cabos, logo “cidade + cabos” não está representado integralmente nesse snapshot. |
| Carregamento | `loadBB()` busca os dois JSONs locais em paralelo somente na primeira ativação e mantém os dados em memória (`BB`). Desligar limpa os caminhos/pontos exibidos. |
| Atribuição | `updateAttr()` combina links para TeleGeography e copyright OSM conforme `bbOn`/`osmOn`. A string CC BY-NC-SA é texto do protótipo, não validação independente. |
| Tiles | `osmCheck()` consulta altitude a cada 400 ms na aba Globo. Abaixo de `0.55`, configura `https://tile.openstreetmap.org/{z}/{x}/{y}.png`; acima retorna à textura local. Não há provedor alternativo configurado. |
| Performance local | Sem transições para caminhos/pontos; resolução de caminho 1, resolução de ponto 6; pixel ratio do renderer limitado a 2; captura integral do dataset somente na ativação. São escolhas de protótipo sem medição de latência/FPS. |
| Falhas | Fetch de cabos não checa `response.ok` nem trata rejeição. `bbOn` e botão são ativados antes do `await`; erro pode deixar estado visual sem dados. Tiles não têm tratamento explícito de erro, disponibilidade ou recuperação. |

## Verificação externa em fontes primárias

### TeleGeography

A [URL histórica do GitHub](https://github.com/telegeography/www.submarinecablemap.com) retornou 404 na consulta. A [FAQ oficial atual](https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions) informa que o repositório não é mais mantido, que dados brutos geocodificados exigem licença anual e que as rotas do mapa são estilizadas, não geolocalizações precisas. A [página oficial de licença de dados](https://www2.telegeography.com/license-geocoded-map-data) descreve fornecimento de GeoJSON/JSON com licença anual. A [política de citação](https://www2.telegeography.com/cite-telegeography-map) aplica CC BY-SA 4.0 a referências, mapas e capturas, e distingue o acesso pago às bases subjacentes. Nenhuma dessas evidências confirma CC BY-NC-SA para o snapshot de 733 cabos.

### OpenStreetMap / OSM Foundation

A [política oficial de tiles raster](https://operations.osmfoundation.org/policies/tiles/) exige HTTPS, crédito visível sem sobreposição da UI, Referer válido no navegador e respeito a headers de cache; sem leitura dos headers, cache mínimo de sete dias. Navegadores usam seu User-Agent normal; clientes próprios precisam identificar a aplicação. Não permite descarga em massa, pré-busca/offline, headers de bypass de cache nem automação headless que percorra mapas para forçar downloads. O serviço tem capacidade limitada, disponibilidade sem SLA e pode bloquear tráfego inadequado. A [página copyright OSM](https://www.openstreetmap.org/copyright) confirma ODbL para os dados e o link de crédito/licença. Essa política é específica a `tile.openstreetmap.org`; outras fontes têm condições próprias.

## Questões técnicas ainda abertas, sem decisão de produto nesta extração

- Proveniência e direitos do snapshot TeleGeography: origem exata, versão/data, licença aplicável e direito de atualização/redistribuição permanecem não demonstrados. O PRD não pode tratar o GitHub histórico como feed atual confirmado.
- Esquema de pousos: não há associação estação ↔ cabo no JSON local; o conteúdo “cidade + cabos” precisa de evidência de fonte e modelagem na arquitetura.
- Semântica geográfica: geometria estilizada não prova traçado físico preciso, disponibilidade operacional, capacidade ou incidentes de rede.
- Falhas: não existe estado explícito para erro de JSON ou tile no trecho inspecionado; não se demonstrou retorno automático ao satélite quando o tile falha. A relação com STATUS LIVE/ATRASADO/OFFLINE está indefinida nesse trecho.
- Zoom/vistas: `0.55` é uma altitude de biblioteca, sem especificação de produto. Não há histerese; movimentos ao redor do limiar podem alternar repetidamente. A condição usa a aba Globo, sem distinção explícita entre suas quatro vistas.
- Atribuição: legibilidade, sobreposição com painéis, permanência em zoom/tema e visibilidade no celular não foram verificadas por navegador.
- Rede/cache: volume real de tiles, alcance do viewport/look-ahead da biblioteca, headers efetivos e cache não foram medidos. Nenhuma verificação com download automatizado foi executada.
- Performance: FPS, tempo de ativação, consumo WebGL, redução de geometria por zoom e comportamento em tablet/celular não foram medidos. A inspeção encontrou 1.948 segmentos e 1.926 pontos, mas não estabelece um orçamento de performance.
- Promoção de artefatos: `.working/prototype-globe.html` e `mockups/prototype-globe.html` divergem neste escopo; a versão promovida não demonstra os controles novos.

Esta extração preserva a decisão funcional de BACKBONES e detalhe OSM, registra a evidência disponível e deixa a seleção/contratação de fontes e os parâmetros finais para a arquitetura.
