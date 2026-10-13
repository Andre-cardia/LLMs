# Conferência do template Artificial Analysis Light

Data: 2026-10-12. Escopo: template local, com dados demonstrativos. A revisão formal extra foi dispensada pelo usuário; esta é a conferência visual e funcional solicitada.

## Resultado

- Cores medidas no navegador: fundo branco, marca preta, navegação #E7E7E7 e acentos de métricas #8842FD, #FDE002, #FF7734. Hero 80px e títulos em Georgia no preview; a referência usa fontes comerciais diferentes.
- MODELOS: ordenação por Inteligência mudou a primeira linha de GPT-6 para Mistral Large 3. Busca por Qwen encontrou Modelo e Notícias; selecionar o Modelo fechou a busca e destacou a linha correta.
- GLOBO: WebGL carregou, aba LABS navegou até Mistral AI e abriu ficha clara completa, sem ASCII ou digitação CRT. Dados, Relações e Notícias da Empresa continuaram presentes.
- NOTÍCIAS/Leitor: abrir Qwen 4 mostrou título, data e veículo correspondentes ao item selecionado, com resumo, pontos-chave, Empresas citadas e link de fonte. Conteúdo imediato nesta variante; a simulação de inserção de manchetes foi desativada para não gerar itens sem Leitor correspondente.
- MERCADOS/Revisão: abrir Mercados fechou o Leitor; abrir Revisão fechou Mercados. Chat conviveu com Revisão e o espaço foi reservado.
- BACKBONES: botão carregou os assets locais e exibiu atribuição TeleGeography, 733 cabos e 1.926 estações. O crédito não declara licença sem verificação. Nenhum mapa físico ou vínculo de propriedade foi validado.
- Celular 390×844: página sem overflow horizontal global; barra de ferramentas rolável mantém oito ações alcançáveis. Mercado com largura 358px e início em y=174, abaixo da barra em y=162; cabeçalho/fechar acessíveis. Três cartões de métricas se empilham.
- JavaScript inline passou em node --check na versão final. Console do navegador sem erros ao fim da verificação.
- Três HTML anteriores, incluindo a base de trabalho, conservaram os hashes anteriores. Nenhum asset existente foi editado. As 77 funções nomeadas herdadas permanecem no novo arquivo; isso não comprova a implementação de requisitos que já eram spine-only.
- A camada de armazenamento prefixa todas as leituras/escritas com mg-aa-, inclusive os nomes herdados mg-/mg4-. Modo claro é fixo nesta variante.
- Links e assets declarados no HTML resolvem localmente. A primeira tentativa do verificador encontrou uma expressão de template dentro do JavaScript; a checagem corrigida separou scripts de atributos HTML e passou.

## Capturas

- [Visão de modelos](mockups/shots/aa-models-overview-2026-10-12.jpg)
- [Globo e Empresa](mockups/shots/aa-globe-company-2026-10-12.jpg)
- [Modelos no celular](mockups/shots/aa-models-mobile-2026-10-12.jpg)
- [Mercados no celular](mockups/shots/aa-markets-mobile-2026-10-12.jpg)
- [Galeria](mockups/shots/templates-2026-10-12.jpg)
- [Galeria no celular](mockups/shots/templates-mobile-2026-10-12.jpg)

## Limites da evidência

O preview herda a cobertura funcional demonstrativa da base. Esta conferência não prova backend, cotação atual, busca web, inferência paga, ocultação persistente de Notícias, todos os gates de licenças/provedores, ou demais estados definidos somente nos contratos. Os contratos identificam essas diferenças sem tornar o produto pronto para publicação.


## Atualização: design padrão, retorno, fundo e Notícias (2026-10-12)

Decisão posterior de Andre: Artificial Analysis Light passa a padrão. Os seis temas antigos continuam alternativas. A alegação anterior de hashes intocados descreve a entrega anterior; nesta atualização, os dois HTMLs Globo antigos recebem links de retorno no cabeçalho/menu e compactação do cabeçalho móvel para manter esse retorno visível. Conteúdos, paletas, texturas e preferências das alternativas foram conservados. Directions recebeu um link para o padrão.

- Padrão: galeria identifica AA Light; `index.html` abre esse preview. Núcleo inicia com `artificial-analysis-light`, `light`, tabela `analytic`. Preferências antigas OSIRIS/dark/hybrid continuam válidas; troca para AA persiste light junto do tema e modo escuro no AA é rejeitado.
- Retorno: seis URLs (OSIRIS, âmbar e noturna × claro/escuro), link do cabeçalho clicado via browser, destino AA com aba Globo. Link também alcançável em 390 px; em 320 px ocupa cabeçalho em duas linhas e termina em x=282 px.
- Globo: fundo computado Cinza suave `rgb(236,237,239)`, original `rgb(241,242,244)` e branco `rgb(255,255,255)`. Escolha soft restaura após reload; somente fundo é alterado. Soft é proposta experimental, ainda ajustável pelo usuário.
- Notícias: composição Yahoo Finance observada diretamente no browser e adaptada ao claro. Destaque com ilustração SVG local rotulada demo, Principais notícias, últimas notícias e coluna de empresas/cotações. Manchetes sans/negrito; acento aproximado #6001D2. Marca e conteúdo pertencem ao projeto.
- Filtros: 73 notícias inicialmente; Alibaba → 3, destaque Qwen 4; todas as camadas desligadas → estado vazio; ação Mostrar todas restaura 73.
- Leitor: Qwen 4 abre imediatamente título correto e metadados 08/10 · The Verge · Alibaba.
- Mercado: cotação NVDA abre Mercados, destaca a linha NVIDIA e conserva Notícias. Badge de empresa mantém navegação ao Globo.
- Responsivo: desktop 1280×720 e móvel 390×844 sem overflow global em Notícias; faixa de cotações e ferramentas têm rolagem própria. Globo móvel mantém seletor de fundo separado da Vista e legenda. SVGs sem IDs duplicados.
- Verificação local: 78 testes passaram e `npm run check` passou (50 módulos). JavaScript inline de AA e das duas cópias Globo passou em `node --check`; AA de trabalho/promovido idênticos.

Capturas: [Notícias desktop](mockups/shots/aa-news-yahoo-desktop-2026-10-12.jpg), [Notícias móvel](mockups/shots/aa-news-yahoo-mobile-2026-10-12.jpg), [Globo cinza](mockups/shots/aa-globe-gray-2026-10-12.jpg). Referência: [Yahoo Finance](imports/yahoo-finance-reference-2026-10-12.md).

Conferência visual/funcional escolhida pelo usuário, sem revisão formal extra. As evidências são de preview e núcleo locais; notícias, cotações, imagens editoriais e chat continuam demonstrações.


## Atualização posterior: Artificial Analysis Dark (2026-10-12)

Pedido adicional de Andre substitui a regra de modo claro obrigatório. Família `artificial-analysis`: claro inicial + escuro opcional. Os registros anteriores de `artificial-analysis-light`/light fixo descrevem a etapa anterior, agora substituída.

- Entrada Dark: `prototype-artificial-analysis.html?mode=escuro`; alias `prototype-artificial-analysis-dark.html` redireciona para o mesmo template e conserva aba/query. Alias `?tab=news` abriu Notícias escura; override explícito `?mode=claro` abriu claro.
- Galeria: oito versões; duas entradas AA explícitas claro/escuro e seis alternativas antigas. Link Dark clicado abriu MODELOS escuro. Retorno dos antigos explicita `mode=claro&tab=globo`.
- Paleta computada: fundo rgb(16,17,20) #101114; texto rgb(242,242,243) #F2F2F3; cartões/Leitor rgb(24,25,29) #18191D. Bordas #34363E, acento #C092FF e texto secundário #A8ABB3 são adaptação local; não medição de Artificial Analysis Dark oficial.
- Claro/Escuro: alternância preservou a aba; claro retornou fundo #FFFFFF; escuro salvo restaurou em URL sem mode. Override válido da URL precede preferência própria. Preferências das alternativas antigas ficam separadas.
- Globo Dark: textura local earth-night-8k.jpg; cinza suave computado rgb(37,39,45) #25272D. Comparação com original #1B1D22 e preto #08090B; escolhas de fundo separadas por modo. Claro mantém #ECEDEF/#F1F2F4/branco.
- Notícias Dark: mesma composição e filtros; Leitor abriu título correto com superfície #18191D e texto #F2F2F3.
- Responsivo: MODELOS e Notícias Dark em 390×844 sem overflow global; notícias em uma coluna. Desktop 1280×720 sem overflow, controle de modo acessível e sem erros de console capturados.
- Núcleo: família `artificial-analysis` aceita light/dark. Default light/analytic; trocar família mantém modo escolhido e preferências salvas antigas. Teste cobre restauração de AA dark mesmo com systemMode light. 78 testes e check de 50 módulos passaram após essa mudança.
- Sintaxe inline: AA, alias Dark e ambas as cópias Globo passaram node --check. AA de trabalho/promovido idênticos.

Capturas: [Modelos Dark](mockups/shots/aa-dark-models-2026-10-12.jpg), [Modelos Dark móvel](mockups/shots/aa-dark-models-mobile-2026-10-12.jpg), [Notícias Dark](mockups/shots/aa-dark-news-2026-10-12.jpg), [Notícias Dark móvel](mockups/shots/aa-dark-news-mobile-2026-10-12.jpg). Dados e ilustrações permanecem demonstrativos.


## Atualização posterior: finanças em Notícias e imagens originais (2026-10-12)

- Fonte atual confirmada: 35 Empresas, 29 com ticker. Notícias mostra as seis em foco e as 23 demais por Camada, sem duplicações; 29 botões de conversa. A faixa expõe todos os 10 indicadores macro; lateral inclui amplitude (20 altas/9 baixas), extremos, favoritos e 11 índices mundiais em três regiões. Valores continuam fixtures.
- Imagens: cinco matérias consultadas no Yahoo Finance, com URL/og:image da própria matéria e crédito. Todas as cinco imagens tiveram naturalWidth=1200 no browser; título, imagem e link correspondentes. Manchete Nvidia abriu Leitor com a mesma foto e URL original. Matérias demo usam placeholder e o Leitor não oferece o site da Empresa como se fosse a matéria original. Total: 78 notícias, cinco originais +73 demo.
- Filtros: Apple → duas notícias demo/placeholder, mantendo 29 ações/10macro/11WORLD. Todas as camadas desligadas → zero Notícias, mantendo os mesmos blocos financeiros; reset restaura cobertura.
- Favoritos: NVDA marcado em Notícias apareceu com estrela ativa em MERCADOS; desmarcado em MERCADOS atualizou Meus favoritos em Notícias. Notícias e MERCADOS compartilham watch e persistência AA; handlers de ambos atualizam o resumo de Notícias.
- Diálogo: NVDA abre USD/NASDAQ e preço demo correto; SK Hynix e Samsung abrem KRW/KRX, ₩338.000 e ₩91.200. Pergunta recebe confirmação local rotulada demonstração, sem chamada de IA. Escape fecha e restaura foco ao botão NVDA; fechar/reabrir identifica a nova ação. Foco inicial na pergunta.
- Visual/funcional: desktop1280×720 e móvel390×844; fotos e controles nos modos claro/escuro. Sem overflow global; rolagem da faixa macro é própria. Diálogo Samsung móvel cabe em356px de largura, sem sair do viewport. No móvel, destaques precedem coluna financeira, seguida de Últimas notícias.
- JavaScript inline e manifesto passaram node --check; .working e mockups idênticos. Não houve alteração nova do núcleo; os 78 testes/check50 citados acima pertencem à etapa anterior, não foram repetidos nesta mudança de preview.

Capturas: [Notícias com fotos no escuro](mockups/shots/aa-news-original-images-dark-2026-10-12.jpg), [Notícias com fotos no claro](mockups/shots/aa-news-original-images-light-2026-10-12.jpg), [Notícias móvel](mockups/shots/aa-news-original-images-mobile-2026-10-12.jpg), [Especialista financeiro escuro](mockups/shots/aa-finance-agent-dark-2026-10-12.jpg). [Procedência das imagens](imports/yahoo-finance-original-images-2026-10-12.md).

Limites: manifesto estático de cinco matérias, sem ingestão periódica ou backend; disponibilidade das fotos depende do CDN externo. Handler de falha retorna placeholder; falha de rede não foi induzida nesta conferência. Cotação e resposta financeira continuam demo.


## Confirmação da abertura padrão Light (2026-10-12)

Andre confirmou Artificial Analysis Light como abertura padrão. Index redireciona com mode=claro; HTML sem mode também começa claro, sem restaurar Dark nessa entrada. Conferência via navegador: entrada direta sem parâmetro → Light/MODELOS; URL explícita mode=escuro → Dark; raiz / → Light com mode=claro. JavaScript inline passou node --check; .working/mockups idênticos. Núcleo já tinha default artificial-analysis/light e não foi alterado nesta confirmação. [Captura da abertura](mockups/shots/aa-light-default-opening-2026-10-12.jpg).


## Experimento Cesium (2026-10-12)

Pedido de mapa3D/pontos após avaliação bmad-help. Protótipo separado ligado por Mapa3D · teste, mantendo abertura Light.35 pontos, busca/filtros, seleção por lista e clique em mapa,2D/3D, terreno/imagens/prédios3/3 e fotorealismo Google observados. Mobile390×844 sem overflow global e lista/painel alternados. Acesso público de avaliação do SDK, sem token da conta. [Avaliação detalhada](imports/cesium-evaluation-2026-10-12.md). JavaScript do teste/snapshot/entrada AA passou node--check; núcleo não mudou e seus testes anteriores não foram repetidos. Sem benchmark de desempenho/custo, validação de coordenadas ou adoção definitiva de renderer.


## Token próprio e preparo para nuvem

Token restrito criado com confirmação de Andre, salvo em arquivo local ignorado pelo Git. Mapa validado em Chrome com 3/3 bases + Google 3D, 35 pontos e OpenAI. API: quatro recursos 200 com origem local; origem pública não permitida 403; recurso não permitido 404. Build de ensaio validou variáveis obrigatórias, rejeição de HTTP/local, arquivos estáticos, ausência do token local no pacote e entrada Light. Check: 51 módulos. Domínio público e token de produção pendentes; sem deploy. Detalhes em imports/cesium-token-deploy-2026-10-12.md.


## Token de produção IRIS Global configurado

Token existente na conta observado após confirmação, restrições verificadas e configuração salva fora do Git. Build real dist/ui passou. Oito verificações API passaram: quatro bases 200 com origem HTTPS do domínio, www 200, HTTP/localhost/outro domínio 403. Nenhum token local copiado no pacote. Renderização hospedada e DNS/HTTPS ainda não validados; sem deploy. Evidências em imports/cesium-production-api-checks-2026-10-12.json e shots/cesium-token-iris-criado-2026-10-12.jpg.
