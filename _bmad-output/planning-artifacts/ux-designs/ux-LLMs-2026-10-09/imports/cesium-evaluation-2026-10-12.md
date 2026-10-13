# Cesium para o Monitor Global — avaliação em 2026-10-12

Andre pediu verificar Cesium ion e acrescentou a direção de mapas 3D e pontos de destaque no Globo. A conclusão é favorável a testar CesiumJS como candidato ao renderer geográfico; a substituição definitiva ainda exige a comparação prevista pela arquitetura. Artificial Analysis Light continua como abertura padrão.

## Evidência do projeto e da conta

- O preview atual usa Globe.gl, texturas locais, rótulos/pontos e arcos; em aproximação usa tiles OpenStreetMap. Não implementa cidades fotogramétricas. O núcleo local continua separado do renderer.
- [Arquitetura vigente](../../../architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md#structural-seed): porta para renderer e benchmark antes de fixar biblioteca; Q6 cobre provider, estilo, licença, custo e comportamento por Vista. O status final registra decisões, não integração pronta.
- Conta aberta no Chrome, consultada somente para leitura: My Assets mostra 11 assets, incluindo World Terrain, OSM Buildings, Google Photorealistic 3D Tiles e imagens Google/Bing. Armazenamento 0/10 GiB. Usage na janela Week de 05–12/10 mostra zero streaming/sessões/geocodes. Isso não é medição de consumo futuro nem confirmação da licença final.
- Nenhum token próprio foi lido/criado, asset enviado ou assinatura alterada. O protótipo usa o acesso público de avaliação incluído na biblioteca.

## O que já foi executado

[Protótipo Cesium](../mockups/prototype-cesium.html), CesiumJS 1.146, CSS da família AA e snapshot dos 35 pontos demonstrativos existentes. Entrada no projeto: botão Mapa 3D · teste; retorno ao Globo/ficha padrão.

| Capacidade | Evidência observada |
| --- | --- |
| Bases geográficas | Terreno mundial, imagens e OSM Buildings:3/3 inicializações concluídas |
| Fotorealismo Google | Tiles carregaram e renderizaram San Francisco, com ponto OpenAI do preview sobreposto |
| Pontos | 35 empresas; busca NVIDIA reduz para 1; seleção destaca marcador/rótulo e abre ficha contextual |
| Clique no mapa | Clique no ponto NVIDIA reabriu o painel correto |
| Vistas | 2D selecionável; Aproximar em 3D retorna a 3D e câmera sobre Santa Clara |
| Responsivo | 390×844 sem overflow global; lista/painel alternáveis, toolbar rolável; ponto e fotorealismo visíveis |
| Integração de navegação | Ficha no projeto retornou ao AA Light/Globo com select=openai e Terminal Empresa · OpenAI; botão do padrão abriu teste separado com a mesma seleção |

A configuração usa renderização sob demanda e resolução limitada. Não houve benchmark comparativo de FPS, bateria, memória, tráfego ou duração de sessões. Também não foram portados Relações/BACKBONES, todos os atalhos e demais estados do renderer original. Coordenadas continuam fixtures: uma foto de cidade não valida o campus de uma empresa.

## Fontes oficiais e implicações

- [CesiumJS](https://cesium.com/platform/cesiumjs/): biblioteca Apache 2.0, livre para uso comercial/não comercial; suporta 3D Tiles, terrain/imagery, vetores e vistas 3D/2D/Columbus. Permite manter nossos painéis e design, trocando só o motor do Globo.
- [Quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/): inicialização do mapa/terreno/prédios; versão 1.146 e diretórios estáticos necessários em bundler.
- [Fotorealismo Google](https://cesium.com/learn/cesiumjs-learn/cesiumjs-photorealistic-3d-tiles/): camada de 3D Tiles própria, navegação inclinada e créditos; cobertura não comprova atualização ou exatidão de instalações específicas.
- [Ion/default token](https://cesium.com/learn/cesiumjs/ref-doc/Ion.html): acesso público fornecido somente para avaliação. A integração final deverá configurar um token próprio de leitura com assets/origens restritos, sem gravar credenciais em repositório.
- [Viewer](https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html): requestRenderMode reduz renderizações desnecessárias; não prova que este projeto será mais rápido.
- [Preços/cotas](https://cesium.com/platform/cesium-ion/pricing/), consultados hoje: Community gratuito para uso pessoal/não comercial e avaliação; 10 GB armazenamento, 15 GB/mês streaming, 1.000 sessões de imagery/mês e1.000 root tiles Google/mês. Commercial individual anunciado a US$ 149/mês. Uso comercial, integração para terceiros e licenças devem seguir as condições correspondentes; o orçamento de ~US$ 5 de automação do projeto não inclui mapas.

## Próximo passo BMAD

Atualizar [CA] Architecture (`bmad-architecture`) em contexto novo, usando esta avaliação como entrada. Comparar 35/200 pontos, aglomeração na Bay Area, seleção por mouse/toque/teclado, 2D/3D, retomada de contexto, falhas de rede/cota, créditos, tráfego e celular. Se escolhido, implementar adaptador Cesium dos contratos comuns; preservar Cadastro, Modelos, Notícias/Mercados e design AA, e portar Relações/BACKBONES de forma explícita. Esta avaliação não fecha Q6 nem autoriza infraestrutura paga.

Capturas: [Fotorealismo e ponto destacado](../mockups/shots/cesium-google-openai-2026-10-12.jpg), [Mapa no celular](../mockups/shots/cesium-google-mobile-2026-10-12.jpg). Troca de claro/escuro conservou a seleção e foi restaurada para claro.
