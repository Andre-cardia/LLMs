---
status: draft
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories]
inputDocuments:
  - prds/prd-LLMs-2026-10-07/prd.md
  - prds/prd-LLMs-2026-10-07/addendum.md
  - prds/prd-LLMs-2026-10-07/reconcile-cesium-architecture-2026-10-12.md
  - prds/prd-LLMs-2026-10-07/reconcile-cesium-ux-2026-10-12.md
  - prds/prd-LLMs-2026-10-07/reconcile-cesium-prototype-2026-10-12.md
  - ux-designs/ux-LLMs-2026-10-09/DESIGN.md
  - ux-designs/ux-LLMs-2026-10-09/EXPERIENCE.md
  - ux-designs/ux-LLMs-2026-10-09/.memlog.md
  - ux-designs/ux-LLMs-2026-10-09/variants/artificial-analysis-light/DESIGN.md
  - ux-designs/ux-LLMs-2026-10-09/variants/artificial-analysis-light/EXPERIENCE.md
  - ux-designs/ux-LLMs-2026-10-09/verification-artificial-analysis-2026-10-12.md
  - architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - architecture/architecture-LLMs-2026-10-10/contracts.md
  - architecture/architecture-LLMs-2026-10-10/implementation-readiness.md
  - architecture/architecture-LLMs-2026-10-10/cesium-integration.md
  - architecture/architecture-LLMs-2026-10-10/reviews/review-technology-2026-10-12-cesium-prd.md
  - architecture/architecture-LLMs-2026-10-10/reviews/review-rubric-2026-10-12-cesium-prd.md
  - architecture/architecture-LLMs-2026-10-10/reviews/review-adversarial-2026-10-12-cesium-prd.md
executionAuthorization: continuação local delegada em 2026-10-10
storyApproval:
  batchId: LLMs-2026-10-12-reconciled-current
  status: approved-requirements-scope-and-acceptance-criteria
  approvedBy: Andre
  approvedOn: 2026-10-12
  storyCount: 35
  record: approvals/story-approvals-reconciled-2026-10-12.json
  initialRecord: approvals/story-approvals-2026-10-12.json
  futureBatchesApproved: false
approvalDelegation:
  authorizedBy: Andre
  scope: stories restantes deste planejamento, FR-1 a FR-40, oito épicos
  perStoryValidationRequired: false
  sourceThreadId: 01a13163-92ba-7fe2-9be9-025ea401dcf4
  request: bmad-help pode aprovar as demais Stories sem passar pela minha validação
  technicalGatesClosed: false
validation:
  step: step-04-final-validation
  coverage: pass
  structure: pass
  dependencies: pass
  readiness: concerns
  openGateGroups: 9
  report: reviews/epics-planning-review-2026-10-12.md
productionAuthorized: false
---

# LLMs — épicos e stories

## Overview

O PRD final atualizado em 12/10, a arquitetura (AD-1 a AD-17 e contratos) e os pares UX principal/Artificial Analysis são as fontes normativas desta decomposição. A UX atualizada em 12/10 fixa o Globo em 3D com bases MAPA/SAT e fotorealismo automático derivado de SAT; os handoffs UX ainda estão em draft e Q3/Q6 continuam abertos. Fontes, hospedagem, custos e provedores permanecem sujeitos aos gates registrados; a decomposição não os considera aprovados.

Em 12/10/2026, Andre aprovou o lote inicial de 32 stories e a atualização pontual da Story 3.5; o [registro inicial](approvals/story-approvals-2026-10-12.json) permanece como histórico das versões daquele momento. Em seguida autorizou revisar e aprovar as demais stories sem validação individual. O [registro reconciliado](approvals/story-approvals-reconciled-2026-10-12.json) identifica as 35 versões atuais, hashes, linhagem e a autorização direta nesta conversa. O escopo permanece nos 40 FR e oito épicos; a divisão do renderer, das Relações e das finanças em Notícias tornou as fatias menores. O antigo detalhe geográfico 8.2 passa a 4.3; a tabela de IDs acompanha o registro. Essa delegação limita-se a este planejamento e não aprova futuros projetos/lotes, implantação, serviços ou decisões ainda abertas.

A etapa de criação/reconciliação das stories foi concluída documentalmente. A validação de cobertura, estrutura e dependências passou; a prontidão para integração permanece com nove grupos de gates abertos, conforme o [relatório de planejamento](reviews/epics-planning-review-2026-10-12.md). `status: draft` e a etapa 4 ainda não concluída em stepsCompleted explicitam essas pendências e não declaram implementação concluída. Readiness das fatias locais e os arquivos de execução permanecem preservados; local-plan/sprint-status exigem reconciliação dos IDs no próximo Sprint Planning. As antigas notas de validação de 29 stories foram preservadas no registro de auditoria, sem servir de prova do lote atual.

## Requirements Inventory

### Functional Requirements

#### FR-1: Exibir Empresas no Globo

O usuário vê um Ponto por Empresa do Cadastro, posicionado pelas coordenadas da sede.
**Consequências:**

- Toda Empresa do Cadastro com coordenadas válidas tem exatamente um Ponto.
- O Globo é uma Terra reconhecível, com oceanos, continentes e relevo; a textura segue a família de tema e a base atual MAPA ou SAT (a projeção do produto é sempre 3D).
- Os Pontos são pequenos e têm a cor da Camada principal. As cinco cores de Camada são distinguíveis entre si e se destacam sobre a textura da Terra no design padrão e nos seis temas alternativos.
- Empresas que atendem à definição de Laboratório usam losango com brilho e rótulo fixo, inclusive quando Laboratórios é uma Etiqueta; a cor continua sendo da Camada principal. As demais Empresas usam Pontos menores. A desobstrução de rótulos prioriza o Laboratório selecionado e os Lançamentos recentes.
- Sedes próximas recebem espalhamento leve ao redor da posição real, recalculado com o zoom, para manter cada Empresa visível e selecionável.

#### FR-2: Filtrar por Camada

O usuário liga e desliga cada Camada na legenda horizontal da base, sem uma barra lateral de Camadas.
**Consequências:**

- Com o Filtro de uma Camada ativo, aparecem as Empresas que a têm como Camada principal ou como Etiqueta.
- O estado dos Filtros é mantido entre visitas no mesmo navegador.
- Cada botão mostra a contagem de Empresas pela Camada principal e fica esmaecido quando desligado; o Filtro continua incluindo Etiquetas.

#### FR-3: Pulso de Lançamento

O usuário percebe Lançamentos recentes pelo Pulso no Ponto do Laboratório.
**Consequências:**

- Um Ponto só pulsa se a data do Lançamento estiver dentro dos últimos 7 dias. O Pulso começa forte na data do Lançamento, enfraquece de forma contínua e termina 7 dias depois dela.
- A primeira carga de dados e os Modelos antigos que só agora aparecem numa Fonte não pulsam, porque a data do Lançamento deles está fora da janela.
- Se houver vários Lançamentos na janela de 7 dias, vale o mais recente.
- O rótulo do Laboratório indica a idade do Lançamento recente.
- Com redução de movimento ativa no sistema, o Pulso vira um destaque estático (por exemplo, um anel) com a mesma duração.

#### FR-4: Logos no zoom

Com zoom regional, o usuário vê a logo de cada Empresa no lugar do Ponto.
**Consequências:**

- Acima de um nível de zoom definido, cada Ponto mostra a logo dentro de um círculo com a borda na cor da Camada principal.
- Empresa sem logo mostra um monograma (iniciais) na cor da Camada principal.

#### FR-5: Prévia ao passar o mouse

Após cerca de 0,3 s com o cursor sobre um Ponto, o usuário vê a Prévia com logo, nome e Camada.
**Consequências:**

- A Prévia fecha quando o cursor sai, desde que o Terminal não esteja Fixado.
- Passar o mouse sem parar sobre vários Pontos não abre várias Prévias.
- O rótulo do Laboratório oferece as mesmas ações de seu Ponto. Em superfícies de toque não há Prévia: tocar abre o Terminal Fixado.

#### FR-6: Terminal Fixado

Ao clicar ou tocar num Ponto, o Terminal fica Fixado e o usuário vê o conteúdo completo:

- nome, cidade e país;
- site e contato (e-mail, quando existir, ou link de formulário);
- Camada principal e Etiquetas;
- Modelos (para Laboratórios), com os Lançamentos mais recentes primeiro;
- cotação (preço, variação do dia e minigráfico de 30 dias), se a Empresa for listada, ou o rótulo "Privada", se não for;
- as Notícias mais recentes.
- as Relações da Empresa, com direção, tipo e Empresa ligada.

**Consequências:**

- Todos os links do Terminal Fixado são clicáveis.
- Depois que a digitação termina, o Terminal fecha pelo botão de fechar ou por `Esc` quando nenhuma janela acima dele precisa consumir a tecla. Durante a digitação, `Esc` primeiro completa o texto (FR-7).
- Clicar no Globo ou numa área vazia fecha o Terminal; arrastar para girar nunca fecha. Interagir com barras de ações, Legenda, popovers, seletor de base MAPA/SAT, Faixa de cotações, Fluxo, Leitor, Agente, Fila ou MERCADOS mantém o Terminal aberto.
- Terminal e Leitor podem coexistir e se reposicionam para não cobrir o painel lateral ou o console do Agente.
- Trocar para MODELOS ou NOTÍCIAS fecha o Terminal.
- O Terminal funciona com toque em telas sem mouse.

#### FR-7: Animação de digitação

O conteúdo aparece caractere a caractere, imitando um terminal.
**Consequências:**

- A digitação completa leva no máximo cerca de 2 s. A lista de Notícias aparece linha a linha.
- Durante a digitação, apertar `Esc` ou clicar dentro do Terminal pula a animação e mostra todo o conteúdo na hora, sem fechar.
- Com redução de movimento ativa no sistema, o texto aparece sem animação.
- A logo aparece primeiro em ASCII ou pixel art e faz a transição para a imagem real.

#### FR-8: Som de digitação e ambiente

O usuário pode ligar som de teclado sincronizado com a digitação e som ambiente espacial.
**Consequências:**

- Ambos começam **desligados**. Um clique no botão de som liga/desliga; ao religar, restaura os canais anteriormente ativos. A seta ao lado abre os controles de Digitação e Ambiente, com ON/OFF e volume independentes.
- As preferências ficam salvas entre visitas.
- O som é gerado no navegador, com pequena variação entre os cliques, e não depende de arquivos de áudio.

#### FR-9: Colunas da Tabela de modelos

Para cada Modelo, o usuário vê:

- Laboratório (com logo) e nome do Modelo;
- data do Lançamento;
- índices de inteligência, programação e matemática (Artificial Analysis);
- preço por milhão de tokens de entrada e de saída;
- preço de cache (leitura e escrita);
- janela de contexto;
- tempo até a resposta e velocidade (tokens por segundo);
- entradas aceitas (texto, imagem, vídeo, áudio, arquivo) e saídas;
- características: pesos abertos ou fechados, licença e raciocínio;
- Custo estimado por tarefa.

**Consequências:**

- Campo sem dado em nenhuma Fonte aparece como "—", nunca como zero.
- Ao expandir a linha de um Modelo, o usuário vê os benchmarks individuais fornecidos pelo Artificial Analysis (por exemplo, GPQA, HLE, LiveCodeBench, Terminal-Bench, τ²).
- A Tabela de modelos mostra a atribuição "Dados: Artificial Analysis", com link.
- Custo estimado por tarefa fica logo após Inteligência; trocar o estilo mantém os mesmos dados e filtros.

#### FR-10: Ordenar e filtrar

O usuário ordena por qualquer coluna numérica e filtra por Laboratório, por entradas aceitas, por saídas e por pesos abertos ou fechados.
**Consequências:**

- Ordenação e filtros combinados atualizam a Tabela de modelos sem recarregar a página.

#### FR-11: Custo estimado por tarefa

O sistema calcula o Custo estimado por tarefa de cada Modelo com base na Tarefa padrão.
**Consequências:**

- O ⓘ do cabeçalho mostra a fórmula e o perfil da Tarefa padrão: 2.000 tokens de entrada + 1.000 de saída.
- Em Modelos de raciocínio, o valor aparece com "≈" e um aviso de que os tokens de raciocínio não estão incluídos.
- O nome da coluna é "Custo estimado por tarefa", para não ser confundido com o dado do Artificial Analysis.

#### FR-12: Rótulo de latência

A coluna de latência se chama "Tempo até a resposta". O ⓘ explica que, em Modelos de raciocínio, esse tempo inclui o "pensamento".

#### FR-13: Ligar Modelos entre Fontes

O sistema reconhece o mesmo Modelo nas várias Fontes e mostra uma única linha por Modelo.
**Consequências:**

- Pares com correspondência incerta não são unidos automaticamente: vão para a Fila de revisão.
- Um Modelo presente em uma só Fonte aparece com os campos que essa Fonte fornece.

#### FR-14: Coletar Notícias

A cada Atualização, o sistema busca Notícias recentes de cada Empresa do Cadastro.
**Consequências:**

- Notícias repetidas (a mesma matéria em vários veículos) aparecem uma vez só.
- Cada Empresa mostra até 5 Notícias, das últimas 2 semanas.

#### FR-15: Filtrar Notícias pela Empresa certa

O Agente de notícias descarta matérias que não são sobre a Empresa, como homônimos ("Mistral", o vento) e menções de passagem.
**Consequências:**

- Matérias descartadas não aparecem em nenhuma superfície de Notícias.
- O filtro descarta corretamente um conjunto fixo de casos de teste de homônimos: "Apple" (fruta), "Amazon" (floresta), "Oracle" (palavra comum), "Meta" (palavra comum), "Mistral" (vento) e "Constellation" (astronomia).
- Numa amostra de 50 Notícias publicadas, pelo menos 90% são de fato sobre a Empresa.
- O botão "marcar como irrelevante" pede confirmação. Cancelar mantém a Notícia; confirmar oculta a mesma Notícia no Terminal, Fluxo, LABS, NOTÍCIAS e Leitor, e orienta o filtro da Empresa.

#### FR-16: Resumir e traduzir

Cada Notícia é exibida com o resumo traduzido para o português, o título original, o veículo, a data e o link para a matéria original.
**Consequências:**

- O título original e o link estão sempre presentes, sem exceção.
- Se a tradução falhar, a Notícia aparece só com o título original e o link, sem resumo.
- O Leitor usa resumo estendido, pontos-chave e Empresas citadas; não traduz nem reproduz a matéria completa (FR-34).

#### FR-17: Isolamento do Agente de notícias

O Agente de notícias trata o conteúdo das matérias como entrada não confiável.
**Consequências:**

- O Agente de notícias não altera o Cadastro, os Modelos nem a Fila de revisão.
- Instruções embutidas no texto de uma matéria não mudam o comportamento do sistema. O formato de saída do Agente de notícias é fixo e validado antes da publicação.

#### FR-18: Exibir cotações

O usuário vê, para cada Índice e cada ação: nome ou ticker, valor e variação do dia, em verde ou vermelho.
**Consequências:**

- Os quatro Índices estão sempre presentes: Nasdaq-100, Nasdaq Composite, S&P 500 e SOX.
- Inclui ações de bolsas fora dos EUA quando a Empresa só é listada lá, ou quando essa é a listagem principal (por exemplo, SK Hynix e Samsung).
- A Faixa pausa quando o mouse está sobre ela; com reduzir movimento, todos os itens continuam acessíveis sem rolagem automática.
- Cada ação mostra a logo pequena da Empresa (ou o monograma) ao lado do ticker.
- Clicar numa ação leva à aba GLOBO, gira até a Empresa e abre o Terminal Fixado.

#### FR-19: Frescor das cotações

As cotações se mantêm recentes, e o usuário sabe de quando elas são.
**Consequências:**

- Durante o pregão, as cotações são atualizadas a cada cerca de 15 minutos, com mais uma Atualização após o fechamento.
- A Faixa e o Painel MERCADOS mostram o horário da cotação e o aviso "Dados com atraso, apenas para fins informativos". Horários indicam seu fuso; pregões respeitam o calendário da respectiva bolsa.
- Se a Fonte principal falhar, o sistema usa a Fonte de reserva. Se as duas falharem, mostra os últimos valores conhecidos com o horário.
- Ativos do Painel MERCADOS, inclusive macro, cripto e índices internacionais, precisam de cobertura e cadência documentadas antes das stories desse painel (§11). Dados indisponíveis aparecem como "—" ou como último valor válido com horário; não se promete uma Fonte de reserva sem verificar a cobertura.

#### FR-20: Lista inicial obrigatória

O Cadastro inicial contém, no mínimo, as Empresas abaixo, além dos Laboratórios que atendem ao critério do Glossário:

- **Laboratórios:** Google/Alphabet, Apple, SpaceX (xAI), Microsoft, IBM, Meta, Amazon (como Etiqueta), OpenAI, Anthropic, Mistral, DeepSeek, Alibaba, Baidu, Moonshot e Zhipu.
- **Chips:** NVIDIA, TSMC, Broadcom, AMD, ASML, Micron, SK Hynix e Samsung.
- **Nuvem:** Amazon, Oracle, CoreWeave, Equinix, Vertiv e Arista.
- **Energia:** Constellation, Vistra, Oklo, GE Vernova e NuScale.
- **Software:** Tesla e Palantir. As demais Empresas de Software são definidas na curadoria inicial.

**Consequências:**

- Cada Empresa tem Camada principal, Etiquetas, ticker e bolsa conforme a tabela do `addendum.md` §B; ticker, bolsa e vínculos societários são conferidos na curadoria antes da publicação.

#### FR-21: Logos do Cadastro

Cada Empresa tem uma logo oficial, sem alterações, guardada no próprio projeto.
**Consequências:**

- Nenhuma tela depende de um serviço externo de logos para exibir uma imagem.
- Em todos os lugares onde a logo aparece (Globo, Terminal, Tabela de modelos, Faixa de cotações, Fila de revisão), a falta de logo é coberta pelo monograma na cor da Camada principal.
- O rodapé informa: "Marcas pertencem aos respectivos titulares."

#### FR-22: Agente de descoberta

O Agente de descoberta propõe Empresas novas que atendem ao critério de Laboratório, além de correções nos dados do Cadastro.
**Consequências:**

- Cada proposta traz o link de origem de cada dado.
- Nenhuma proposta é publicada sem aprovação do dono.
- Propostas de Relação seguem a mesma exigência de origem e aprovação (FR-31).
- O Agente de descoberta faz no máximo 10 propostas de Empresas novas por semana.
- A lista inicial (FR-20) é montada pelo Agente de descoberta e entra na Fila de revisão para aprovação do dono antes da primeira publicação.

#### FR-23: Revisar propostas

O dono vê a Fila de revisão e, para cada proposta, aprova, edita e aprova, ou rejeita.
**Consequências:**

- Uma Empresa aprovada aparece no Globo na Atualização seguinte.
- Uma proposta rejeitada não volta, a menos que surja um fato novo: um novo Modelo publicado pela Empresa ou uma nova Fonte que confirme os dados.
- A Fila de revisão também recebe pares incertos de Modelos (FR-13) e logos candidatas.
- A Fila é um painel lateral com cartões por proposta, motivo e link de origem de cada campo. Empresa ou Relação nova tem prévia no Globo como Ponto ou arco fantasma, sem publicá-la.
- Pares incertos oferecem "É O MESMO MODELO" e "SÃO DIFERENTES". Antes da publicação, DESFAZER cancela a decisão e devolve o cartão ao estado pendente. O efeito em dados já publicados exige definição na arquitetura (§11).
- A Fila fecha por botão, `Esc` ou sua ação na barra, sem fechar por clique fora; é exclusiva com Leitor lateral e MERCADOS.
- O botão da Fila mostra a contagem de propostas pendentes e fica aceso enquanto ela está aberta; o selo desaparece com a Fila vazia.

#### FR-24: Atualização periódica

O sistema executa Atualizações em intervalos fixos para cada tipo de dado.
**Consequências:**

- Modelos, preços e Lançamentos são atualizados pelo menos a cada hora. Notícias seguem a mesma cadência, salvo a degradação por orçamento de §6.
- Cotações seguem o FR-19.

#### FR-25: Tolerância a falhas de Fontes

A falha de uma Fonte não compromete os dados já publicados.
**Consequências:**

- A falha de uma Fonte não apaga os dados já publicados que vieram dela.
- A interface mostra o horário da última Atualização bem-sucedida de cada tipo de dado.
- Uma resposta é inválida quando vem vazia ou traz menos da metade dos itens da Atualização anterior. Uma resposta inválida não sobrescreve os dados válidos anteriores.
- Essa regra vale para coleções comparáveis de uma Fonte, não para ausência legítima de Notícias novas, resposta de chat ou consulta de um único ativo.
- A barra mostra STATUS LIVE, ATRASADO ou OFFLINE. O horário da última Atualização de cada tipo permanece acessível também em telas menores; os critérios de estado são definidos na arquitetura (§11).

#### FR-26: Lançamento detectado automaticamente

O sistema registra um Lançamento quando aparece um Modelo novo em qualquer Fonte, usando a ordem de precedência de datas do Glossário.
**Consequências:**

- O Pulso aparece na primeira Atualização após a detecção, desde que a data do Lançamento esteja dentro dos últimos 7 dias (FR-3).

#### FR-27: Design padrão e seis temas alternativos

Artificial Analysis é o design padrão, com modo claro inicial e versão escura opcional. O usuário também escolhe OSIRIS fiel, Fósforo âmbar ou Sala de controle noturna, cada uma com modo claro e escuro.
**Consequências:**

- Na primeira visita, o design é Artificial Analysis Light, sempre claro, com tabela analítica. Escolhas manuais e preferências antigas continuam salvas.
- O seletor oferece o padrão e as três famílias alternativas. O controle claro/escuro alterna o modo em todas as famílias, incluindo Artificial Analysis; cada alternativa permite retorno visível ao padrão.
- As cinco cores de Camada e o conteúdo continuam distinguíveis no padrão e nos seis temas alternativos. Terminal, Leitor, Agente, Fila e MERCADOS ficam escuros nas famílias OSIRIS fiel e Fósforo âmbar, inclusive no modo claro.

#### FR-28: Atribuição de Fontes

Cada dado e sobreposição mantém atribuição acessível com link; o crédito ao Artificial Analysis é obrigatório. BACKBONES mostra "Cabos: TeleGeography" quando ligada, e o Detalhe OpenStreetMap mostra "© OpenStreetMap contributors" e o crédito do provedor de mapa exigido por sua licença. Fontes ativas de terreno, edifícios e conteúdo fotorealístico também recebem os créditos exigidos por seus provedores. A posição desses créditos segue a UX, sem acrescentar um rodapé institucional.

#### FR-29: Responsividade

A interface mantém todas as funções em celular, tablet e desktop; desktop e tablet têm prioridade de acabamento visual.
**Consequências:**

- No celular, o Globo ocupa a largura da tela e aceita arrastar e o gesto de pinça para zoom.
- Sem mouse, não existe Prévia: tocar num Ponto abre direto o Terminal Fixado, que no celular ocupa a tela como um painel deslizante de baixo para cima.
- A Tabela de modelos, no celular, mostra as colunas principais (Modelo, inteligência, Custo estimado por tarefa) e expande as demais ao tocar na linha. Ela também pode rolar na horizontal.
- A Faixa de cotações continua visível e legível no celular.
- A Fila de revisão pode ser usada no celular.
- Busca, Relações, Temas, Som, Agente, Fila, MERCADOS, BACKBONES e navegação permanecem alcançáveis por toque no celular; esconder uma barra não pode eliminar suas funções. A forma dos controles fica com a UX (§11).

#### FR-30: Acesso restrito ao dono

Só o dono acessa o painel, dados privados, Histórico e ações da Fila de revisão. Endereços salvos não concedem acesso. A forma de autenticação e autorização é decidida na arquitetura antes da publicação (§11).

#### FR-31: Relações entre Empresas

O usuário explora Relações dirigidas no Globo e no Terminal.
**Consequências:**

- Cada Relação liga duas Empresas do Cadastro, tem um dos cinco tipos do Glossário e uma origem verificável. Arcos mostram direção e usam a cor semântica do tipo; Filtros permitem escolher os tipos visíveis.
- A rede aparece sutil por padrão; selecionar uma Empresa destaca suas Relações. A sobreposição pode ser ligada/desligada e só mostra arcos cujas duas Empresas estão visíveis pelos Filtros de Camada.
- A linha RELAÇÕES do Terminal mostra direção, Empresa ligada e tipo; selecionar a Empresa ligada navega até ela.
- O Agente de descoberta propõe Relações e correções na Fila. Aprovar, editar ou rejeitar segue FR-23; uma Relação nova aparece na Atualização seguinte.
- Arcos fantasmas na prévia de uma proposta não entram nos dados publicados. A infraestrutura de BACKBONES pode ser vista junto às Relações, sem inferir vínculo entre cabo e Empresa só pela proximidade geográfica.

#### FR-32: Navegação e bases do Globo

O usuário explora o Globo sempre em projeção 3D, alterna as bases MAPA e SAT e controla a câmera por mouse, trackpad, toque e teclado.
**Consequências:**

- A projeção permanece em um Globo tridimensional; a v1 não oferece um seletor de mapa plano 2D. MAPA e SAT alternam a base visual sem alterar a projeção, câmera, Pontos, Relações, Filtros, Empresa selecionada ou ações do Terminal.
- MAPA usa uma base cartográfica de fundo bem escuro, com cidades, rodovias e ruas legíveis e mais detalhadas ao aproximar. SAT mostra imagem de satélite em zoom amplo. O terreno acompanha as duas bases; edifícios aparecem em detalhe urbano quando disponíveis.
- Em SAT, ao aproximar em área coberta, o Globo transita automaticamente para conteúdo fotorealístico 3D quando disponível. Ao afastar, sair da área coberta ou ocorrer falha nessa camada, retorna à imagem de satélite; a cena não duplica edifícios já fornecidos pelo fotorealismo.
- Se uma camada opcional falhar, o Globo e a base escolhida continuam utilizáveis com indicação de indisponibilidade. Uma base indisponível não aparece como selecionável; seus limites, fontes e fallback são definidos antes das stories do mapa (§11).
- Há controles visíveis de zoom e rotação. Pinça sobre o Globo ou seus Pontos controla o zoom do Globo; o zoom de página por teclado permanece disponível.
- Rótulos discretos de países, cidades e polos de IA respeitam a prioridade dos rótulos de Laboratórios. A leitura de cursor mostra coordenadas, lugar, zoom e escala.
- O terminador dia/noite acompanha o horário no Globo quando compatível com a base ativa. Reduzir movimento elimina rotação automática e transições animadas; não impede atualizar os dados de iluminação.
- A ajuda ? apresenta os atalhos: 1/2/3 para GLOBO/MODELOS/NOTÍCIAS, / para o Agente, Esc para sair da janela ativa, F para tela cheia, R para vista inicial, setas para girar e +/- para zoom. Atalhos não interceptam digitação em campos de texto.

#### FR-33: Laboratórios e Fluxo de notícias

O painel esquerdo alterna entre FLUXO e LABS sem tirar o Globo de vista.
**Consequências:**

- FLUXO é a aba inicial; a escolha entre FLUXO e LABS fica salva.
- FLUXO oferece TODAS e SÓ LABORATÓRIOS, com preferência salva e contagem coerente com o Filtro. Novas Notícias respeitam o Filtro.
- FLUXO mostra até 14 itens recentes do mesmo conjunto publicado de Notícias; isso não altera o limite por Empresa do FR-14.
- LABS agrupa Laboratórios por região, mostra o último Modelo e o Lançamento recente, e expande as três Notícias mais recentes de cada Laboratório.
- Selecionar um Laboratório gira até ele e abre o Terminal. Selecionar uma Notícia abre também o Leitor. A aba NOTÍCIAS permite filtrar por Camada e Empresa.

#### FR-34: Leitor de notícia

O usuário lê uma Notícia em português sem perder o contexto da Empresa.
**Consequências:**

- Manchetes no Terminal, FLUXO, LABS e NOTÍCIAS abrem o mesmo Leitor, com resumo estendido, pontos-chave, Empresas citadas, título original, veículo, data e link original em nova guia.
- Resumos são identificados como gerados por IA.
- Nos principais destaques de NOTÍCIAS, usar imagem da própria matéria com procedência e link original. Sem imagem vinculada ou em falha de carga, manter título, Fonte e link e mostrar placeholder; imagem da Empresa não prova correspondência. Notícias demonstrativas e sínteses editoriais são identificadas como tais.
- A preferência inicial é LATERAL; alternar para FLUTUANTE fica salvo. Abrir pela aba NOTÍCIAS usa LATERAL sem substituir a preferência salva.
- Empresas citadas são clicáveis e levam à Empresa correspondente do Cadastro. Aberturas e fechamentos respeitam foco e teclado (§5); durante a digitação, `Esc` primeiro mostra o conteúdo completo.
- Leitor lateral, Fila e MERCADOS são mutuamente exclusivos. O Leitor flutuante pode coexistir com esses painéis quando houver espaço.
- Se a tradução falhar ou o orçamento suspender resumos, continuam disponíveis o título original, o veículo, a data e o link, com indicação de resumo indisponível. O tamanho editorial do resumo fica com a UX (§11).

#### FR-35: Agente especialista em LLMs

Andre pesquisa IA/LLMs num console de chat ligado ao painel.
**Consequências:**

- O console abre pelo botão ou `/`, sobe da base, pode expandir para tela cheia e voltar ao painel. Traz sugestões de perguntas e Histórico; clique fora não o fecha.
- Respostas podem consultar Modelos, preços, benchmarks, Notícias, Relações e cotações do painel e pesquisar na web. Citam fontes numeradas com links; informações dos dados publicados indicam sua data de Atualização.
- Ações de navegação incluem girar até uma Empresa, abrir seu Terminal, abrir um Leitor, abrir MODELOS filtrada/ordenada e destacar Modelos ou Laboratórios. Cada ação aparece na conversa e pode ser verificada na interface.
- Ao executar uma ação estando em tela cheia, o console volta ao tamanho de painel para deixar o resultado visível.
- O Histórico permite retomar conversas e permanece restrito ao dono. Local, prazo de retenção e exclusão são definidos na arquitetura (§11).
- Páginas e Notícias são entradas não confiáveis: suas instruções não concedem ferramentas, acesso a segredos ou permissão de escrita. Nenhuma mudança no Cadastro ou nas Relações dispensa a Fila de revisão; eventual permissão do chat para propor itens precisa ser decidida antes das stories do Agente.
- Falha ou esgotamento de orçamento mostra um estado compreensível; o painel e as conversas já salvas continuam acessíveis. Orçamento adicional, provedor e busca ficam em §11.

#### FR-36: Painel MERCADOS

Andre consulta o mercado de IA num painel lateral com opção de ampliar para tela cheia.
**Consequências:**

- O botão próprio abre MERCADOS e permanece aceso; o painel fecha por botão ou `Esc`, sem fechar por clique fora. Abrir MERCADOS fecha Fila e Leitor lateral.
- Há cartões de S&P 500, Nasdaq-100, Nasdaq Composite, SOX, VIX, US 10Y, Dólar, Ouro, Petróleo WTI e Bitcoin; a lista mundial agrupa índices de Américas, Europa e Ásia. Os símbolos exatos e a cobertura ficam com a arquitetura (§11).
- Ações do Cadastro aparecem por Camada, com ATIVO, ÚLTIMO, VAR% e minigráfico de um mês. A amplitude das ações de IA informa quantas sobem/caem e a maior alta/queda; dados ausentes não contam como variação zero.
- Cabeçalhos e controles ficam acessíveis enquanto a lista rola. Cada ativo permite consultar nome, símbolo, bolsa ou mercado e horário da cotação; índices mundiais mostram pregão aberto/fechado e a contagem de bolsas em pregão.
- Buscar um ticker do Cadastro leva à Empresa e ao Terminal; buscar índice destaca seu cartão/linha; ticker desconhecido mostra aviso em linha.
- Favoritos ficam salvos e a aba WATCH mostra apenas esses ativos. Clicar numa ação navega até a Empresa; Resumo do Agente abre o chat com leitura do mercado baseada nos dados e suas datas.
- A aba NOTÍCIAS também apresenta os dados financeiros existentes: panorama macro, amplitude/extremos, favoritos, seis Empresas em foco e demais ações abaixo delas por Camada, mais índices mundiais. Filtros de manchetes não reduzem essa cobertura, inclusive quando não há Notícias. Quantidades acompanham o Cadastro.
- Abaixo de cada ação em NOTÍCIAS, um botão abre diálogo próprio do futuro especialista em ações, separado do especialista LLM. O preview identifica ação/bolsa/moeda e permite perguntas/sugestões demonstrativas. Integração, fontes, provedor, orçamento e análise financeira real permanecem futuras; a interface não as declara disponíveis.
- Status, atraso, falhas e acesso seguem FR-19, FR-25 e FR-30. MERCADOS amplia o contexto da IA sem cadastrar todas as empresas de uma bolsa.

#### FR-37: Busca global

Uma busca única encontra Empresa, Modelo, ticker ou Notícia.
**Consequências:**

- Resultados identificam o tipo. Confirmar uma Empresa abre Globo e Terminal; Modelo abre MODELOS com a linha destacada; ticker leva à Empresa ou ao ativo em MERCADOS; Notícia abre o Leitor.
- Ausência de resultado mantém a consulta e informa que nada foi encontrado; não inventa Empresa ou ativo.

#### FR-38: Estado na URL

O usuário salva um endereço que restaura seu contexto de exploração.
**Consequências:**

- A URL representa Camadas ligadas, base do Globo (MAPA/SAT), aba principal e Empresa selecionada. Ao abri-la, o estado vale para a sessão sem sobrescrever preferências salvas.
- Valores desconhecidos usam uma opção válida; a URL não contém segredos, texto de conversas ou Histórico e continua exigindo acesso do dono.
- Compatibilidade legada: view=MAPA|SAT é alias; view=3D não escolhe base; view=2D retorna à base inicial; se base e view coexistirem, base prevalece. A base inicial continua pendente em Q6.

#### FR-39: BACKBONES

O usuário liga uma sobreposição de cabos submarinos e estações de pouso.
**Consequências:**

- BACKBONES tem botão próprio e começa desligada. Ligar mostra cabos e estações; desligar remove a sobreposição e mantém os Pontos de Empresas.
- Selecionar ou passar o mouse num cabo mostra seu nome. Selecionar uma estação mostra cidade e cabos conectados conforme a Fonte; sem confirmação, o vínculo fica indicado como indisponível.
- "Cabos: TeleGeography" fica visível enquanto a sobreposição estiver ligada. O snapshot do protótipo não determina quantidade fixa de cabos nem garante disponibilidade ou licença da Fonte; proveniência e direito de uso/atualização precisam ser comprovados antes da publicação dessa função (§11; addendum §F).
- Falha da Fonte mantém os últimos dados válidos com sua data ou informa indisponibilidade, sem impedir explorar Empresas. A geometria é uma referência do mapa, sem promessa de rota física precisa.
- Fibra terrestre fica fora da v1; BACKBONES não altera as cinco Camadas do Cadastro.

#### FR-40: Carregamento de detalhe geográfico

As camadas geográficas necessárias às bases MAPA e SAT carregam conforme a aproximação e a transição automática descritas em FR-32.
**Consequências:**

- O detalhe cartográfico de cidades, rodovias e ruas aumenta ao cruzar limiares consistentes, sem oscilar perto deles. Limiar e compatibilidade com MAPA/SAT e temas são definidos antes das stories do mapa (§11).
- Pontos, Relações e seleção de Empresas permanecem utilizáveis na troca. © OpenStreetMap contributors e créditos do provedor ficam visíveis enquanto o mapa aparece.
- Tiles são carregados para a visualização interativa, com cache conforme a política do provedor, sem pré-download ou modo offline.
- Falha de tiles mantém o Globo e os Pontos utilizáveis e informa indisponibilidade; não deixa a cena em branco nem troca silenciosamente MAPA por SAT. Em SAT, a camada de detalhe indisponível preserva a imagem de satélite. A escolha de provedor e fallback fica com a arquitetura.

### NonFunctional Requirements

- **Desempenho:** a primeira tela útil (Globo com Pontos) aparece em até cerca de 3 s numa conexão doméstica comum. O Globo gira a cerca de 60 fps num notebook recente com ~200 Pontos e a pelo menos cerca de 30 fps num celular intermediário recente. A avaliação inclui terreno, edifícios e fotorealismo onde disponíveis; camadas opcionais não bloqueiam a primeira tela nem a seleção dos Pontos.
- **Confiabilidade:** a interface nunca fica em branco por falha de uma Fonte. Em caso de falha, mostra os últimos dados conhecidos com o horário.
- **Segurança:** chaves de API ficam no servidor ou na Atualização. Notícias e páginas da web entram como dados não confiáveis (FR-17, FR-35); toda ação de escrita valida a autorização do dono. Cadastro, Relações e Histórico não podem ficar acessíveis por caminhos públicos alternativos.
- **Acessibilidade:** todas as funções operam por teclado ou toque, conforme o dispositivo; a navegação por teclado é completa. Abrir Terminal/Leitor leva o foco para a janela; fechar devolve à origem. `Esc` age sobre a janela ativa mais acima e completa a digitação antes de fechá-la. Reduzir movimento elimina pulso animado, digitação, rotação automática e animações de entrada. Texto atende contraste WCAG AA no design padrão e nos seis temas alternativos, inclusive sobre texturas e painéis; pontos, rótulos e atalhos têm alternativa acessível, e sinais de estado não dependem só de cor. A UX define a navegação entre muitos Pontos antes das stories do Globo.
- **Portabilidade:** a interface consulta snapshots publicados para dados de leitura. Fila, chat e Histórico têm contratos autenticados independentes da hospedagem; trocar de provedor preserva esses contratos e a lógica de Atualização. A v1 já inclui interações que exigem escrita e execução no servidor.

### Additional Requirements

- AD-1 a AD-17 da spine são normativos: proprietário único de contratos/domínio, identidades opacas, ausências, snapshots/CAS/fencing, curadoria staged/DESFAZER, autoridade limitada de Agentes, orçamento UTC, reducer único e composição geográfica centralizada. Os formatos compartilhados são definidos em src/contracts/.
- CesiumJS 1.146 é a baseline do renderer do Globo principal, ainda não integrado: `GlobeRenderer`/adapter não possui estado do domínio; `GlobeSceneComposer` compõe MAPA/SAT, terreno, edifícios e camadas por tema, zoom, cobertura e disponibilidade. Não incluir rastreamento de voos, controles por Empresa/região ou cartões de voo. Q9 decide CDN ou pacote NPM/Vite, assets/workers, CSP/cache, WebGL e desempenho; a base ESM existente permanece válida até decisão explícita.
- Hosting/IdP, custo e prova durável ficam em Q2; UX/acessibilidade em Q3; fonte/licença/cobertura/custo/credenciais/cache/composição geográfica em Q6; semântica das localizações em Q8; migração base/URL em Q11. Nenhum gate equivale a aprovação de provider ou serviço.
- Não criar infraestrutura, secrets, migrations, jobs remotos ou ativar provider pago por esta decomposição. SourceRefs precedem publicação; seed de 35 Empresas requer revisão e quatro janelas semanais de quota. Exemplos fictícios são fixtures, não curadoria.

### UX Design Requirements

- UX-DR1: Aplicar DESIGN.md e a variante Artificial Analysis: Artificial Analysis Light é o padrão inicial, modo escuro opcional; OSIRIS fiel, Fósforo âmbar e Sala de controle noturna permanecem seis temas alternativos. Preservar tokens de cores/typo/spacing/rounded, fonte vanilla e HUD mono da família correspondente; painéis permanecem sempre escuros em OSIRIS/âmbar. Garantir WCAG AA no padrão e nas seis alternativas, incluindo texturas/brilho, e resolver cores de Camada como texto conforme Q3.
- UX-DR2: Preservar comportamentos de EXPERIENCE.md (foco, Esc, clique vs. arraste, toque sem hover, reduzir movimento, preferências e override de URL); a projeção é sempre 3D e só MAPA/SAT são bases. Q3 fecha controles móveis, foco por muitos Pontos, contraste, teclado, leitor de tela e toque; Q6 fecha provedores, cobertura e limiares de tiles.
- UX-DR3: Implementar o componente `globo` conforme o tema ativo, mantendo o palco/entorno configurável da família Artificial Analysis separado da base cartográfica; o seletor de fundo não altera MAPA/SAT. Integrar Cesium ao Globo principal compartilhando store e intents, sem estado de domínio no adapter; preservar câmera, entidades, filtros, seleção e Terminal ao trocar base. Q3/Q6/Q8/Q9/Q11 continuam gated.
- UX-DR4: Implementar o componente `ponto` com anatomia/tokens `{ tamanho: '{spacing.ponto-ecossistema}', forma: 'círculo', cor: 'cor da Camada principal', opacidade: '0.82', contorno: '{colors.ponto-contorno-escuro}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR5: Implementar o componente `ponto-laboratorio` com anatomia/tokens `{ tamanho: '{spacing.ponto-laboratorio}', tamanho-selecionado: '{spacing.ponto-laboratorio-sel}', forma: 'losango ◆ (quadrado 45°, raio 1.5px)', cor: '{colors.osiris-escuro-camada-laboratorios}', anel-selecao: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR6: Implementar o componente `rotulo-laboratorio` com anatomia/tokens `{ tipografia: '{typography.rotulo-laboratorio}', texto: '{colors.osiris-escuro-tx}', filete: '1px na cor da Camada', hover: '{colors.osiris-escuro-acc}', marca-pulso: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR7: Implementar o componente `pulso` com anatomia/tokens `{ cor: '{colors.osiris-escuro-acc}', forma: 'anéis concêntricos que se propagam' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR8: Implementar o componente `relacao-arco` com anatomia/tokens `{ fabricacao-de-chips: '{colors.osiris-escuro-camada-chips}', nuvem-e-infraestrutura: '{colors.osiris-escuro-camada-nuvem}', investimento: '{colors.osiris-escuro-acc}', energia: '{colors.osiris-escuro-camada-energia}', parceria-de-modelos: '{colors.osiris-escuro-camada-laboratorios}', fantasma: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR9: Implementar o componente `previa` com anatomia/tokens `{ fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.md}', largura-min: '{spacing.previa-min}', z: '35' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR10: Implementar o componente `terminal-fixado` com anatomia/tokens `{ largura: '{spacing.terminal}', altura-max: '{spacing.terminal-altura-max}', tipografia: '{typography.terminal}', titulo: '{colors.osiris-escuro-acc}', z: '36' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR11: Implementar o componente `leitor-de-noticia` com anatomia/tokens `{ largura-flutuante: '{spacing.leitor-flutuante}', largura-lateral: '{spacing.leitor-lateral}', raio-flutuante: '{rounded.DEFAULT}', raio-lateral: '{rounded.none}', tipografia: '{typography.leitor-corpo}', secao: '{colors.osiris-escuro-acc}', z: '37' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR12: Implementar o componente `fluxo-de-noticias` com anatomia/tokens `{ largura: '{spacing.painel-fluxo}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.DEFAULT}', tipografia: '{typography.fluxo-item}', z: '21' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR13: Implementar o componente `aba-labs` com anatomia/tokens `{ losango: '{colors.osiris-escuro-camada-laboratorios}', lancamento: '{colors.osiris-escuro-acc}', expandir: '{colors.osiris-escuro-d1}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR14: Implementar o componente `faixa-de-cotacoes` com anatomia/tokens `{ altura: '{spacing.faixa}', fundo: '{colors.osiris-escuro-bar}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}', aviso: '{colors.osiris-escuro-mu}', z: '25' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR15: Implementar o componente `barra-de-status` com anatomia/tokens `{ altura: '{spacing.barra-status}', marca: '{typography.marca}', marca-cor: '{colors.osiris-escuro-acc}', valor: '{colors.osiris-escuro-d1}', ao-vivo: '{colors.osiris-escuro-up}', atrasado: '{colors.osiris-escuro-acc}', offline: '{colors.osiris-escuro-dn}', z: '20' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR16: Implementar o componente `emblema-da-marca` com anatomia/tokens `{ forma: 'a definir (Open Question)', onde: 'favicon + barra de status, junto à marca', cor: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR17: Implementar o componente `terminador` com anatomia/tokens `{ vista: '3D', atualizacao: 'ao vivo', lado-noturno: 'escurecido sobre a textura do tema' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR18: Implementar o componente `rotulo-geografico` com anatomia/tokens `{ tipografia: '{typography.rotulo-laboratorio}', texto: '{colors.osiris-escuro-mu}', prioridade: 'abaixo do Rótulo de Laboratório na desobstrução' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR19: Implementar o componente `controles-de-navegacao` com anatomia/tokens `{ botao: '{spacing.botao-trilho}', raio: '{rounded.lg}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', icone: '{colors.osiris-escuro-tx}', ativo: '{colors.osiris-escuro-acc}', z: '20' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR20: Implementar o componente `ajuda-de-atalhos` com anatomia/tokens `{ fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.lg}', titulo: '{colors.osiris-escuro-acc}', tecla: '{typography.meta}', z: '30' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR21: Implementar o componente `painel-mercados` com anatomia/tokens `{ largura: '{spacing.fila}', raio: '{rounded.none}', titulo: '{colors.osiris-escuro-acc}', prompt: '{colors.osiris-escuro-d2}', regiao: '{typography.secao}', regiao-cor: '{colors.osiris-escuro-acc}', aba-selecionada: '{colors.osiris-escuro-acc}', aviso: '{colors.osiris-escuro-mu}', resumo-agente: '{colors.osiris-escuro-acc}', cabecalho-colunas: '{typography.tabela-cabecalho}', cabecalho-colunas-cor: '{colors.osiris-escuro-mu}', status-ao-vivo: '{colors.osiris-escuro-up}', status-atrasado: '{colors.osiris-escuro-acc}', status-offline: '{colors.osiris-escuro-dn}', pregao: '{typography.micro}', z: '37' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR22: Implementar o componente `cartao-de-indice` com anatomia/tokens `{ fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.DEFAULT}', rotulo: '{typography.micro}', rotulo-cor: '{colors.osiris-escuro-mu}', valor: '{typography.tabela-celula}', valor-cor: '{colors.osiris-escuro-tx}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR23: Implementar o componente `linha-de-cotacao` com anatomia/tokens `{ tipografia: '{typography.tabela-celula}', ticker: '{colors.osiris-escuro-tx}', nome: '{colors.osiris-escuro-mu}', alta: '{colors.osiris-escuro-up}', baixa: '{colors.osiris-escuro-dn}', minigrafico: '1M', favorito: '{colors.osiris-escuro-acc}', favorito-desligado: '{colors.osiris-escuro-mu}', hover: '{colors.osiris-escuro-s2}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR24: Implementar o componente `barra-de-amplitude` com anatomia/tokens `{ sobem: '{colors.osiris-escuro-up}', caem: '{colors.osiris-escuro-dn}', trilho: '{colors.osiris-escuro-s2}', raio: '{rounded.full}', rotulo: '{typography.micro}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR25: Implementar o componente `abas-principais` com anatomia/tokens `{ tipografia: '{typography.aba}', selecionada: '{colors.osiris-escuro-acc}', repouso: '{colors.osiris-escuro-mu}', raio: '{rounded.DEFAULT}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR26: Implementar o componente `barra-lateral` com anatomia/tokens `{ largura: '{spacing.trilho}', botao: '{spacing.botao-trilho}', raio-botao: '{rounded.lg}', selo: '{colors.osiris-escuro-d1}', ativo-borda: '{colors.osiris-escuro-acc}', ativo-icone: '{colors.osiris-escuro-acc}', ativo-brilho: 'glow do tema (Elevation & Depth)', z: '20' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR27: Implementar o componente `busca-global` com anatomia/tokens `{ forma: 'a definir — spine-only (sem mock)', botao: '{spacing.botao-trilho}', destaque-modelo: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR28: Implementar o componente `popover` com anatomia/tokens `{ fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', raio: '{rounded.lg}', titulo: '{colors.osiris-escuro-acc}', z: '30' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR29: Implementar o componente seletor-de-base como grupo segmentado MAPA/SAT na projeção 3D fixa, com base selecionada em acc e contorno interno; 3D não é opção selecionável. MAPA tem cartografia de fundo bem escuro e revela cidades, rodovias e ruas ao aproximar. SAT usa imagem de satélite em zoom amplo e transita automaticamente para fotorealismo 3D em área coberta e zoom próximo; zoom-out, falta de cobertura ou falha fotorealística retorna à imagem de satélite. Terreno acompanha ambas; prédios só entram quando compatíveis e sem duplicar geometria fotorealística. Créditos das camadas ativas permanecem legíveis. Q3/Q6 mantêm gated acabamento, provedores, composição, cobertura, limiares e disponibilidade real.
- UX-DR30: Implementar o componente `leitura-de-cursor` com anatomia/tokens `{ tipografia: '{typography.hud}', rotulo: '{colors.osiris-escuro-mu}', valor: '{colors.osiris-escuro-d1}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR31: Implementar o componente `legenda-filtro-de-camadas` com anatomia/tokens `{ tipografia: '{typography.hud}', texto: '{colors.osiris-escuro-mu}', contagem: '{colors.osiris-escuro-tx}', ponto: 'cor da Camada, 8px, com brilho', raio: '{rounded.DEFAULT}', hover-borda: '{colors.osiris-escuro-line}', hover-texto: '{colors.osiris-escuro-tx}', desligado: 'opacidade 0.35, ponto sem brilho', z: '20' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR32: Implementar o componente `tabela-de-modelos` com anatomia/tokens `{ cabecalho: '{typography.tabela-cabecalho}', celula: '{typography.tabela-celula}', numero: '{colors.osiris-escuro-d1}', barra-inteligencia: '{colors.osiris-escuro-d1}', destaque: '{colors.osiris-escuro-acc}', prompt: '{colors.osiris-escuro-d2}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR33: Implementar o componente `aba-noticias` com anatomia/tokens `{ titulo: '{typography.noticia-titulo}', meta: '{typography.hud}', data: '{colors.osiris-escuro-mu}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR34: Implementar o componente `agente-console` com anatomia/tokens `{ altura: '{spacing.agente-altura}', historico: '{spacing.agente-historico}', topo: '{colors.osiris-escuro-acc}', pergunta: '{colors.osiris-escuro-d1}', acao: '{colors.osiris-escuro-d2}', fontes: '{colors.osiris-escuro-mu}', tipografia: '{typography.agente}', z: '38' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR35: Implementar o componente `fila-de-revisao` com anatomia/tokens `{ largura: '{spacing.fila}', titulo: '{colors.osiris-escuro-acc}', z: '37' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR36: Implementar o componente `cartao-de-proposta` com anatomia/tokens `{ raio: '{rounded.DEFAULT}', aprovar: '{colors.osiris-escuro-up}', rejeitar: '{colors.osiris-escuro-dn}', ver-no-globo: '{colors.osiris-escuro-d1}', tipo: '{colors.osiris-escuro-acc}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR37: Implementar o componente `chip-filtro` com anatomia/tokens `{ tipografia: '{typography.chip}', raio: '{rounded.full}', fundo: '{colors.osiris-escuro-s1}', borda: '{colors.osiris-escuro-line}', desligado: 'opacidade 0.4' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR38: Implementar o componente `monograma` com anatomia/tokens `{ forma: 'círculo', fundo: 'cor da Camada principal', texto: '{colors.osiris-escuro-bg}', indice: '{colors.osiris-escuro-d1}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR39: Implementar o componente `dica` com anatomia/tokens `{ tipografia: '{typography.meta}', fundo: '{colors.osiris-escuro-s2}', raio: '{rounded.DEFAULT}', z: '40' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR40: Implementar o componente `confirmacao-ocultar` com anatomia/tokens `{ confirmar: '{colors.osiris-escuro-dn}', raio: '{rounded.botao}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
- UX-DR41: A família Artificial Analysis muda apenas a apresentação: preservar conteúdo, domínio, contratos e estados de exploração comuns; começar em claro, permitir modo escuro e retorno visível às alternativas. A entrada sem estado válido restaurado abre MODELOS, com três cartões de métricas antes da Tabela. Notícias usa composição editorial inspirada no Yahoo Finance. Nas opções de fundo do Globo, trocar apenas o entorno do palco, salvar a escolha por modo e manter base MAPA/SAT independente. Usar os tokens e comportamentos específicos dos pares UX da variante; não transportar logotipo, dados ou funcionalidades dos sites de referência.

### FR Coverage Map

- FR-1: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-2: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-3: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-4: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-5: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-6: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-7: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-8: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-9: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-10: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-11: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-12: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-13: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-14: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-15: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-16: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-17: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-18: Epic 6 — Acompanhar o mercado de IA
- FR-19: Epic 6 — Acompanhar o mercado de IA
- FR-20: Epic 2 — Manter o Cadastro e as Relações sob revisão humana
- FR-21: Epic 2 — Manter o Cadastro e as Relações sob revisão humana
- FR-22: Epic 2 — Manter o Cadastro e as Relações sob revisão humana
- FR-23: Epic 2 — decisões/Fila; Epic 4 — renderização das prévias temporárias
- FR-24: Epic 1 — Acompanhar dados atualizados com confiança e acesso privado
- FR-25: Epic 1 — Acompanhar dados atualizados com confiança e acesso privado
- FR-26: Epic 3 — Comparar Modelos e perceber Lançamentos
- FR-27: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-28: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-29: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-30: Epic 1 — Acompanhar dados atualizados com confiança e acesso privado
- FR-31: Epic 2 — curadoria; Epic 4 — Relações no Globo e Terminal
- FR-32: Epic 4 — Explorar Empresas e Lançamentos no Globo
- FR-33: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-34: Epic 5 — Ler Notícias relevantes com contexto e fontes
- FR-35: Epic 7 — Pesquisar, localizar e retomar contexto
- FR-36: Epic 6 — Acompanhar o mercado de IA
- FR-37: Epic 7 — Pesquisar, localizar e retomar contexto
- FR-38: Epic 7 — Pesquisar, localizar e retomar contexto
- FR-39: Epic 8 — Explorar cabos submarinos
- FR-40: Epic 4 — Explorar Empresas no Globo Cesium

## Epic List

### Epic 1: Acompanhar dados atualizados com confiança e acesso privado

Andre consulta dados publicados, entende quando estão atuais ou atrasados e mantém o painel e as ações protegidos para seu uso privado.
**FRs covered:** FR-24, FR-25, FR-30
**Implementation notes:** priorizar snapshots last-good e indicadores compreensíveis. Hosting, autenticação, autorização e persistência durável permanecem gated por Q2.

### Epic 2: Manter o Cadastro e as Relações sob revisão humana

Andre confere origem, corrige e decide cada proposta antes que Empresas e Relações entrem nos dados publicados.
**FRs covered:** FR-20, FR-21, FR-22, FR-23, FR-31
**Implementation notes:** propostas usam fontes por campo; fixtures locais não substituem a curadoria da lista inicial. A publicação segue o fluxo staged e auditável da arquitetura.

### Epic 3: Comparar Modelos e perceber Lançamentos

Andre compara capacidades e custos dos Modelos e vê cada lançamento uma vez, ligado à identidade correta e à data da fonte.
**FRs covered:** FR-9, FR-10, FR-11, FR-12, FR-13, FR-26
**Implementation notes:** dados ausentes e preços zero permanecem distintos; pares incertos aguardam a Fila. Artificial Analysis mantém sua atribuição obrigatória.

### Epic 4: Explorar Empresas no Globo Cesium

Andre localiza Empresas e Lançamentos num Globo sempre 3D, alterna MAPA/SAT e usa o Terminal sem perder filtros, câmera ou seleção. Explora terreno, prédios compatíveis, detalhe OSM progressivo e fotorealismo automático em SAT quando coberto.
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-27, FR-29, FR-32, FR-40
**Implementation notes:** MAPA/SAT são bases do mesmo Globo 3D e FR-40 pertence à composição geográfica do renderer. Controles e acessibilidade ficam sob Q3; base inicial, providers, composição, cobertura e custo ficam sob Q6; geodados reais sob Q8; integração Cesium sob Q9; estado e URL sob Q11. Nenhum provider é aprovado por este épico.

### Epic 5: Ler Notícias relevantes com contexto e fontes

Andre acompanha Notícias filtradas por Empresa, lê sínteses em português e abre a matéria original mantendo o contexto da pesquisa.
**FRs covered:** FR-14, FR-15, FR-16, FR-17, FR-28, FR-33, FR-34
**Implementation notes:** título original e link sobrevivem a falhas de resumo; conteúdo externo é dado não confiável. A atribuição de origem é regra transversal a todas as superfícies que exibem dados.

### Epic 6: Acompanhar o mercado de IA

Andre consulta índices, ações e indicadores com unidade, horário, atraso e disponibilidade claros, vê o contexto financeiro na aba Notícias e navega de uma ação à Empresa relacionada.
**FRs covered:** FR-18, FR-19, FR-36
**Implementation notes:** estende a superfície Notícias do Epic 5; cobertura, calendário, histórico e fontes de reserva precisam de matriz aprovada em Q5 antes das stories que exibem esses dados. O diálogo do futuro especialista em ações permanece demonstrativo até aprovações de integração/orçamento.

### Epic 7: Pesquisar, localizar e retomar contexto

Andre encontra Empresas, Modelos, tickers e Notícias e pesquisa o setor com fontes citadas, ações de navegação e Histórico privado.
**FRs covered:** FR-35, FR-37, FR-38
**Implementation notes:** a Busca pode operar localmente; chat, orçamento, retenção e serviços externos permanecem gated por Q1/Q2/Q7. A URL usa base MAPA/SAT e nunca inclui conversa ou segredo.

### Epic 8: Explorar cabos submarinos

Andre liga BACKBONES no Globo, inspeciona cabos e estações e consulta sua proveniência sem perder Empresas, Relações ou a base selecionada.
**FRs covered:** FR-39
**Implementation notes:** estende o `GlobeSceneComposer` do Epic 4 como sobreposição independente; permanece separada porque origem, associação e licença dos cabos têm o gate Q4, distinto das bases e camadas Cesium em Q6/Q9.

**Dependências e sobreposição:** os Epics 2 e 3 usam o snapshot privado confiável do Epic 1 e podem avançar em paralelo. O Epic 4 consome Empresas curadas e dados de Lançamentos dos Epics 2 e 3. O Epic 5 consome os dados publicados de Empresas/snapshot após a disponibilidade dos contratos compartilhados. O Epic 6 estende a superfície Notícias do Epic 5 e consome dados publicados de mercado/Empresas; não depende de épicos futuros. O Epic 7 integra as superfícies de entidade dos Epics 2–6. O Epic 8 depende do Globo do Epic 4, mas permanece separado porque origem, associação e licenciamento dos cabos seguem Q4, distintos dos gates de provedores/composição MAPA/SAT. Nenhum épico depende de um épico futuro; AD-16 mantém um único autor dos contratos compartilhados. NFRs e UX-DRs aplicam-se às stories afetadas; decisões não resolvidas continuam como gates de prontidão.

A ordem não obriga habilitar infraestrutura antes de provas locais. A base local de um épico pode ser validada isoladamente; a conclusão do épico exige sua interface/integração e gates. Stories dentro de cada épico são ordenadas sem depender de stories futuras. Núcleos compartilhados têm autor único (AD-16), preservando a separação por valor ao usuário.

## Epic 1: Acompanhar dados atualizados com confiança e acesso privado

Andre consulta dados publicados, entende quando estão atuais ou atrasados e mantém o painel e as ações protegidos para seu uso privado.

### Story 1.1: Manter os dados publicados quando uma Fonte falha

Como Andre, dono do painel,
Quero continuar vendo a última coleção válida quando uma Fonte falhar,
Para identificar dados antigos sem confundi-los com uma atualização bem-sucedida.

**Acceptance Criteria:**

**Given** um snapshot completo anterior e uma resposta de carga completa vazia ou com menos da metade dos itens comparáveis,
**When** a resposta for validada,
**Then** ela é rejeitada, o snapshot e seu horário de sucesso são mantidos, e a falha fica registrada (FR-25).

**Given** um fluxo incremental sem notícias novas ou uma consulta de ativo individual sem resultado,
**When** a resposta for processada,
**Then** a regra de coleção completa não a marca como inválida apenas por estar vazia (FR-25).

**Given** uma Fonte falha enquanto outra conclui a atualização,
**When** os dados forem publicados,
**Then** a Fonte bem-sucedida pode avançar e a Fonte com falha mantém seus últimos dados válidos (FR-25).

**Given** uma atualização antiga perde a revisão de publicação para uma mais recente,
**When** tentar gravar,
**Then** a gravação antiga é rejeitada e leitores veem uma revisão completa, nunca dados parciais (AD-16).


### Story 1.2: Aplicar o orçamento das rotinas automáticas

Como Andre, dono do painel,
Quero limitar gastos das rotinas automáticas e reduzir ou suspender tarefas nos marcos definidos,
Para manter custos previsíveis e separar o orçamento automático de chat e busca.

**Acceptance Criteria:**

**Given** fixtures locais e um teto automático configurado,
**When** uma chamada paga automática for admitida,
**Then** o sistema reserva atomicamente o custo máximo estimado no ledger UTC, em microUSD, vinculado ao mês e à categoria `automation`; sem preço ou teto verificável, a chamada não ocorre (FR-24, FR-25, AD-8).

**Given** categorias separadas para `automation` e `chat`,
**When** gasto e reservas atingirem 80% do teto automático,
**Then** Notícias passam à cadência de seis horas; retornam à cadência normal somente após liquidação verificada abaixo de 80%. Chat e busca não consomem esse teto, e o limite do chat permanece zero até a decisão Q1/Q7.

**Given** gasto mais reservas atingir 100% do teto automático,
**When** uma atualização de Notícias ocorrer,
**Then** resumo e tradução ficam suspensos até o próximo mês UTC; novas Notícias ainda exibem título original e link. Chamadas pagas automáticas, incluindo descoberta, ficam bloqueadas.

**Given** uma chamada for repetida ou seu resultado ficar desconhecido,
**When** o ledger processar a tentativa,
**Then** cada retry exige nova reserva, a liquidação é idempotente e o valor desconhecido continua reservado para reconciliação no mês original.

**Given** execução local com fixtures,
**When** os limites forem exercitados,
**Then** o comportamento pode ser verificado sem iniciar cobranças, infraestrutura ou implantação.

### Story 1.3: Mostrar o status e o horário de atualização por tipo de dado

Como Andre, dono do painel,
Quero ver o estado de atualização e o horário da última atualização bem-sucedida de cada tipo de dado,
Para distinguir dados atuais, atrasados e indisponíveis sem perder o último snapshot válido.

**Acceptance Criteria:**

**Given** uma projeção de status por tipo de dado e estado agregado calculada pela política comum,
**When** a barra de status for exibida,
**Then** apresenta LIVE, ATRASADO ou OFFLINE e o horário de sucesso de cada tipo; a interface não recalcula esses estados nem trata sucesso HTTP como prova de frescor (FR-25, AD-7).

**Given** uma fonte atrasada ou offline com dados válidos anteriores,
**When** o status correspondente for apresentado,
**Then** os últimos dados e seus horários permanecem visíveis com o motivo/estado de indisponibilidade, sem tela vazia (FR-25).

**Given** viewport estreita ou uso por toque/teclado,
**When** Andre consulta a barra ou seus detalhes,
**Then** o status e os horários por tipo continuam alcançáveis e legíveis; sinais de estado não dependem apenas de cor (FR-25, UX-DR1, UX-DR15).

**Given** a apresentação nos temas padrão e alternativos,
**When** o status é renderizado,
**Then** usa os tokens da família ativa e mantém contraste acessível sobre a interface, sem alterar a política de classificação (UX-DR1, UX-DR15).

### Story 1.4: Restringir dados e comandos privados ao dono

Como Andre, dono do painel,
Quero que leituras e ações privadas exijam minha identidade autorizada,
Para que URL salva, preview ou rota direta não contornem meu acesso.

**Acceptance Criteria:**

**Given** configuração de autenticação ausente, token inválido/expirado ou identidade que não consta na allowlist do dono,
**When** uma rota privada, asset, snapshot, dado ou comando for solicitado,
**Then** o acesso é negado sem revelar conteúdo privado (FR-30, AD-9).

**Given** acesso por URL direta, preview ou origem alternativa,
**When** o recurso privado é solicitado,
**Then** a mesma verificação de identidade e autorização é aplicada; possuir um endereço salvo não concede acesso (FR-30, AD-9).

**Given** uma mutação solicitada por uma identidade autenticada,
**When** o comando atravessa a fronteira,
**Then** método, schema, Origin/CSRF e autorização do dono são validados; um header de identidade fornecido pelo cliente não concede acesso (AD-9).

**Given** segredo de autenticação ou provider necessário à execução,
**When** a aplicação é compilada, responde ou registra uma falha,
**Then** segredos permanecem no ambiente servidor e não aparecem em bundle, snapshot, URL ou log (AD-9).

**Given** o gate Q2 ainda não fechado,
**When** a story for exercitada,
**Then** ela usa apenas contratos e fixtures locais, sem ativar provider, publicar dados ou implantar infraestrutura.

### Story 1.5: Agendar atualizações na cadência de cada dado

Como Andre, dono do painel,
Quero que Modelos, preços, Lançamentos e Notícias sejam agendados na cadência definida,
Para acompanhar dados recentes sem criar execuções desnecessárias.

**Acceptance Criteria:**

**Given** as categorias de Modelos, preços e Lançamentos habilitadas,
**When** o plano de atualização for calculado,
**Then** cada categoria vence pelo menos uma vez por hora (FR-24, AD-7).

**Given** a política de orçamento automático da Story 1.2,
**When** gasto e reservas atingirem 80% do teto,
**Then** a cadência de Notícias muda para seis horas; ela retorna à cadência horária somente após liquidação verificada abaixo de 80% (FR-24, AD-7, AD-8).

**Given** um instrumento de mercado,
**When** sua cadência for definida,
**Then** o agendador respeita a política de cotação do FR-19 e o calendário do instrumento, sem aplicar a cadência horária deste épico.

**Given** chat ou busca sem orçamento aprovado,
**When** o plano de atualização for calculado,
**Then** nenhuma tarefa paga é agendada para esses recursos até a decisão Q1/Q7.

**Given** execução local com fixtures e Q2 ainda aberto,
**When** o plano de cadência for exercitado,
**Then** pode ser conferido sem iniciar cobranças, cron remoto, infraestrutura ou publicação.

### Story 1.6: Executar e recuperar Atualizações sem publicações duplicadas

Como Andre, dono do painel,
Quero que atualizações concorrentes ou interrompidas preservem a última revisão válida e possam ser recuperadas,
Para continuar consultando dados íntegros sem publicações duplicadas.

**Acceptance Criteria:**

**Given** execuções concorrentes da mesma Fonte, escopo e janela,
**When** o executor admite e processa a atualização,
**Then** usa a chave de execução comum, lease por slice e fencing token crescente; cada escrita verifica o token vigente e uma execução expirada não publica após sua sucessora (AD-6).

**Given** uma falha transitória de fetch,
**When** o executor tenta novamente,
**Then** realiza até três tentativas com backoff/jitter dentro dos limites da Fonte; cada tentativa paga exige a reserva da Story 1.2 (AD-6, AD-8).

**Given** objetos imutáveis gravados e validados pelos contratos comuns,
**When** o Publisher tenta publicar uma nova revisão,
**Then** valida as referências contra a revisão curada e troca o manifesto por CAS na mesma transação dos efeitos de curadoria presentes no plano; perder CAS ou fencing aborta todos esses efeitos, mantendo a revisão anterior completa (FR-25, AD-2, AD-6, AD-16).
**And** custos de chamadas externas já realizadas permanecem no ledger, mesmo se a publicação for abortada.

**Given** interrupção antes de concluir a troca do ponteiro ou falha de uma slice na leitura,
**When** a aplicação recupera a execução ou abre os dados,
**Then** mantém a última revisão completa com schema/digest/referências válidos; objetos sem manifesto concluído permanecem privados e não são usados para formar uma revisão parcial (FR-25, AD-2).

**Given** recuperação de snapshot e execução do scheduler,
**When** os processos retomam no ambiente aprovado,
**Then** o snapshot usa um ponteiro validado e o banco auditado tem restauração própria; a identidade do scheduler é verificada separadamente da identidade do dono, e logs registram run ID, Fonte, duração, status e custo sem conteúdo privado ou chaves (AD-9, AD-14).

**Given** Q2 ainda aberto,
**When** a story é exercitada localmente,
**Then** usa fixtures e adaptadores locais; a integração durável requer Q2 fechado e evidência de concorrência, rollback e recuperação no ambiente escolhido. Resultados locais não comprovam SM-2/SM-3, que exigem sete dias reais de operação (AD-14).

## Epic 2: Manter o Cadastro e as Relações sob revisão humana

Andre confere origem, corrige e decide cada proposta antes que Empresas e Relações entrem nos dados publicados.

### Story 2.1: Aprovar, editar e rejeitar propostas com revisão registrada

Como Andre, dono do painel,
Quero decidir alterações no Cadastro e nas Relações e desfazer decisões antes da publicação,
Para controlar quais dados entram na próxima Atualização.

**Acceptance Criteria:**

**Given** uma proposta pendente com origem por campo,
**When** Andre aprova ou edita e aprova,
**Then** uma decisão auditável fica staged; o snapshot publicado permanece igual até a próxima Atualização válida (FR-23, FR-31, AD-4).

**Given** uma proposta rejeitada,
**When** a descoberta encontra novamente os mesmos fatos,
**Then** ela permanece suprimida; somente um novo Modelo canônico publicado ou uma nova Fonte independente permite reapresentá-la. Uma nova data de coleta não basta (FR-23).

**Given** um comando com versão esperada e chave de idempotência,
**When** ele é repetido,
**Then** o mesmo payload retorna o resultado anterior sem repetir efeitos; payload diferente com a mesma chave retorna conflito. Versões vencidas não sobrescrevem decisões novas (AD-4, AD-16).

**Given** decisões staged sobre alvos distintos,
**When** ocorre a próxima publicação válida,
**Then** elas podem publicar juntas, atomicamente. Decisões sobre o mesmo alvo ou alvo alterado permanecem staged com conflito explícito para reconciliação humana (AD-4).

**Given** uma decisão ainda não publicada,
**When** Andre usa DESFAZER com a versão válida,
**Then** ela volta a pendente e perde a elegibilidade para publicação. Se a publicação venceu a corrida, os dados publicados são preservados e o resultado informa que é necessária compensação (FR-23, AD-4).

**Given** acesso não autorizado, patch inválido ou IDs/campos desconhecidos,
**When** o comando é recebido,
**Then** ele é recusado com erro explícito e mantém propostas, decisões e dados anteriores íntegros (AD-9, AD-16).

### Story 2.2: Receber propostas de descoberta com evidência e quota

Como Andre, dono do painel,
Quero receber propostas verificáveis de Empresas e Relações, com volume controlado,
Para ampliar e corrigir o Cadastro com revisão humana.

**Acceptance Criteria:**

**Given** uma Empresa candidata,
**When** a descoberta avalia sua entrada,
**Then** exige evidência do critério de Laboratório do Glossário; na curadoria inicial, também admite as Empresas obrigatórias das demais Camadas previstas em FR-20 (FR-20, FR-22).

**Given** uma proposta nova ou de correção,
**When** ela é validada,
**Then** cada dado proposto tem link de origem e motivo; schema, IDs e evidências são verificados fora do LLM. Campos extras, links inventados e instruções presentes no conteúdo externo não são aceitos como comandos (FR-22, AD-5, AD-16).
**And** consultas no servidor aplicam proteção contra SSRF e não enviam credenciais a URLs geradas.

**Given** uma proposta de Relação,
**When** ela é validada,
**Then** identifica duas Empresas canônicas do Cadastro, direção, um dos cinco tipos permitidos e origem verificável; proximidade geográfica não comprova vínculo (FR-31).

**Given** o contador global da semana, iniciada segunda-feira às 00:00 UTC,
**When** chegam propostas de Empresas novas, inclusive simultâneas,
**Then** deduplicação, consumo da quota e inserção são atômicos; no máximo dez propostas novas são inseridas naquela semana, incluindo a curadoria inicial. Ao atingir o limite, o resultado informa a suspensão de novas inserções (FR-22, AD-5).

**Given** repetição, rejeição ou reapresentação de uma proposta,
**When** a quota é calculada,
**Then** repetição não consome novamente, rejeição não devolve quota e reapresentação válida por fato novo consome uma nova unidade. Correções de Empresas cadastradas e propostas de Relação não consomem essa quota (FR-22, FR-23).

**Given** uma saída válida do Agente de descoberta,
**When** ela é recebida,
**Then** apenas uma proposta pendente é criada; decisões e dados publicados permanecem sob os comandos de curadoria da Story 2.1 e a publicação da próxima Atualização (AD-4, AD-5).

**Given** execução local com fixtures ou tentativa de chamada paga,
**When** a descoberta é executada,
**Then** as regras podem funcionar localmente; integração durável exige Q2, e chamadas pagas exigem fornecedor e teto aprovados, além da reserva de orçamento da Story 1.2. Sem essas condições, a chamada não ocorre (AD-8).

### Story 2.3: Conferir o Cadastro inicial e os logos antes da primeira publicação

Como Andre, dono do painel,
Quero conferir as Empresas obrigatórias, seus dados e logos oficiais,
Para começar com um Cadastro confiável e identificável.

**Acceptance Criteria:**

**Given** a lista obrigatória de FR-20 e do addendum §B,
**When** o Cadastro inicial é preparado,
**Then** contempla as 35 Empresas listadas e os demais Laboratórios elegíveis, com IDs canônicos únicos; uma Empresa presente em várias Camadas usa Etiquetas, sem duplicar seu cadastro (FR-20, AD-3).

**Given** uma Empresa proposta,
**When** seus dados são conferidos,
**Then** nome, site, contato disponível, Camada principal, Etiquetas, condição de Laboratório, ticker, bolsa e vínculos societários têm origem verificável. Dados ausentes ou pendentes ficam explícitos; os exemplos do addendum não substituem essa conferência (FR-20, FR-22).

**Given** uma localização candidata,
**When** ela é validada,
**Then** registra significado geográfico, precisão e evidência própria; coordenadas utilizáveis seguem WGS84. Ausência e aproximação permanecem distintas de endereço preciso, conforme o contrato definido em Q8 (AD-16, AD-17).

**Given** a curadoria inicial pela descoberta,
**When** as propostas são inseridas e aprovadas,
**Then** seguem a quota da Story 2.2 e as decisões da Story 2.1. As 35 entradas exigem pelo menos quatro janelas semanais; cada aprovação permanece staged até a publicação válida (FR-20, FR-22, FR-23).

**Given** um logo oficial aprovado,
**When** ele é incorporado ao Cadastro,
**Then** o arquivo é guardado no projeto, sem alterações, com sua origem registrada e associação à Empresa canônica. A exibição usa o arquivo local; o rodapé informa “Marcas pertencem aos respectivos titulares.” (FR-21).

**Given** logo ausente ou falha ao carregá-lo,
**When** o componente compartilhado de identidade é usado,
**Then** apresenta o monograma de duas letras na cor da Camada principal, conforme os tokens da família ativa, com identificação acessível da Empresa. Esse componente atende Globo, Prévia, Terminal, Tabela, Faixa, Fila e Notícias (FR-21, UX-DR38, UX-DR41).

**Given** dados demonstrativos ou pendências de integração,
**When** a primeira publicação real é preparada,
**Then** exige curadoria humana concluída, Q2 resolvido para publicação durável e Q8 para localizações reais; fixtures do protótipo permanecem identificadas como demonstração. O acabamento visual depende de Q3.

### Story 2.4: Operar a Fila de revisão com evidências, decisões e prévias

Como Andre, dono do painel,
Quero inspecionar e resolver propostas pela Fila de revisão,
Para decidir alterações com evidência e acompanhar seu efeito.

**Acceptance Criteria:**

**Given** propostas disponíveis,
**When** Andre abre a Fila,
**Then** o painel recebe foco, mostra pendentes acima das resolvidas e fecha Leitor lateral e MERCADOS. O botão indica abertura e quantidade pendente; quando vazia, apresenta “✓ NADA PARA REVISAR” e remove o selo (FR-23, UX-DR35).

**Given** um cartão de Empresa, correção, Relação, par incerto ou logo candidata,
**When** Andre o inspeciona,
**Then** vê tipo, motivo, origem, data e links por campo. Logos usam o componente da Story 2.3; Relações mostram direção e tipo; pares apresentam os identificadores e evidências comparadas (FR-23, FR-31, UX-DR36).

**Given** uma proposta pendente,
**When** Andre aprova, rejeita ou edita e aprova,
**Then** a interface envia o comando versionado e idempotente da Story 2.1. Após confirmação, mostra resultado compacto e efeito na próxima Atualização; cancelar a edição preserva a proposta original (FR-23, AD-4).

**Given** um par incerto de Modelos,
**When** Andre escolhe “É O MESMO MODELO” ou “SÃO DIFERENTES”,
**Then** registra uma decisão humana explícita de unir ou manter separados, preservando a trilha de IDs e aliases. O efeito publicado segue a próxima Atualização válida (FR-13, FR-23, AD-3).

**Given** uma proposta com localização utilizável,
**When** Andre escolhe “VER NO GLOBO”,
**Then** a Fila produz a projeção temporária e o intent compartilhado para Ponto ou arco fantasma, separado dos dados publicados. Para correção de Empresa existente, solicita foco nela; sem localização utilizável, informa a indisponibilidade da prévia (FR-23, FR-31, AD-16).
**And** resolver o cartão ou fechar a Fila remove a projeção temporária; o Epic 4 implementa sua renderização no Cesium.

**Given** uma decisão resolvida,
**When** Andre usa DESFAZER antes da publicação,
**Then** o cartão volta a pendente após confirmação do comando. Se já publicado, informa a necessidade de compensação e preserva os dados publicados (FR-23, AD-4).

**Given** falha de leitura, comando em andamento, conflito de versão ou autorização negada,
**When** a interface recebe esse estado,
**Then** apresenta mensagem explícita, evita envio duplicado e preserva os dados e a edição local. Falha de leitura não aparece como Fila vazia; conflito exige reconciliação humana (AD-4, AD-9).

**Given** uso por teclado, toque ou tela pequena,
**When** Andre opera ou fecha a Fila,
**Then** todas as ações permanecem alcançáveis, com rótulos e foco visíveis. Fechar por botão, ação da barra ou `Esc` segue a prioridade global e devolve o foco; clique fora não fecha. A apresentação acompanha a família ativa e redução de movimento (UX-DR1, UX-DR35, UX-DR36, UX-DR41).
**And** Q3 governa acabamento e acessibilidade; Q2 governa decisões duráveis e Q8 as localizações reais das prévias.

### Story 2.5: Desfazer alterações publicadas com compensação auditável

Como Andre, dono do painel,
Quero revisar e confirmar a compensação de uma alteração já publicada,
Para corrigir os dados preservando o histórico das decisões.

**Acceptance Criteria:**

**Given** uma decisão já publicada,
**When** Andre solicita DESFAZER,
**Then** cria uma proposta compensatória vinculada à decisão e à revisão originais. Os dados publicados e o histórico permanecem íntegros (FR-23, AD-4).

**Given** uma compensação pendente,
**When** Andre examina o efeito proposto,
**Then** a Fila mostra as alterações e referências afetadas. Somente confirmação humana, com versões válidas, torna a compensação staged; cancelar a confirmação não altera os dados publicados (AD-4, UX-DR35, UX-DR36).

**Given** alvos alterados, decisões concorrentes ou referências incompatíveis,
**When** a compensação é validada,
**Then** apresenta conflito e exige reconciliação humana. Exclusão ou separação de entidades não deixa Modelos, Relações ou outras referências apontando para IDs inválidos (AD-2, AD-3, AD-4).

**Given** uma compensação staged e válida,
**When** ocorre a próxima Atualização,
**Then** o Publisher da Story 1.6 aplica seus efeitos atomicamente, revalidando versões e referências. A compensação fica registrada como concluída e vinculada à nova revisão; a decisão e a revisão originais continuam auditáveis (AD-4, AD-6).

**Given** DESFAZER concorrendo com a publicação,
**When** as operações são processadas,
**Then** o resultado respeita o estado vencedor: antes da publicação, a proposta volta a pendente; depois, segue o fluxo compensatório. Nenhum cancelamento pré-publicação modifica diretamente dados já publicados (AD-4).

**Given** comando repetido, versão vencida, payload inválido ou acesso não autorizado,
**When** a solicitação é recebida,
**Then** repetição válida retorna o resultado anterior; mesma chave com payload diferente retorna conflito. Solicitações inválidas são recusadas sem duplicar compensações ou sobrescrever decisões (AD-9, AD-16).

**Given** execução local ou integração real,
**When** o fluxo compensatório é disponibilizado,
**Then** fixtures permitem demonstrar os estados sem alterar dados reais; integração durável exige Q2. A Fila distingue compensação pendente, aguardando publicação, concluída e em conflito, com apresentação e acessibilidade governadas por Q3 (UX-DR41).

## Epic 3: Comparar Modelos e perceber Lançamentos

Andre compara capacidades e custos dos Modelos e vê cada lançamento uma vez, ligado à identidade correta e à data da fonte.

### Story 3.1: Calcular custo por tarefa com preços ausentes/zero

As a Andre, dono do painel,
I want calcular custo por tarefa com preços ausentes/zero,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-11

**Readiness:** done-local; gate: `done-local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de calcular custo por tarefa com preços ausentes/zero,
**Then** contrato/cálculo já entregues em af622bf6b254f46feb968043173dcdedd57a86e9; 2.000+1.000 tokens, precisão decimal, aproximação de raciocínio e proveniência; UI ainda não integrada.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 3.2: Resolver datas e perceber Lançamentos únicos

As a Andre, dono do painel,
I want resolver datas e perceber Lançamentos únicos,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-26, FR-13

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de resolver datas e perceber lançamentos únicos,
**Then** AA>HF>OR preserva origem, invalidade/futuro não gera Pulso; família aparece uma vez, variantes explícitas; preview→final não fabrica novo lançamento; match incerto não une IDs.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 3.3: Consultar a comparação com filtros combinados

As a Andre, dono do painel,
I want consultar a comparação com filtros combinados,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-9, FR-10, FR-12

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de consultar a comparação com filtros combinados,
**Then** projeção local tem custo logo após inteligência, dados ausentes null; filtros de Laboratório/modalidades/pesos combinam; toda coluna numérica ordena sem modificar snapshot e vazios ficam no fim nas duas direções.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 3.4: Normalizar APIs estruturadas e identidade por Fonte

As a Andre, dono do painel,
I want normalizar APIs estruturadas e identidade por Fonte,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-9, FR-12, FR-13, FR-26

**Readiness:** blocked-integration; gate: `acesso/API/Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `acesso/API/Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de normalizar apis estruturadas e identidade por fonte,
**Then** AA só API/cache/atribuição e quota, OpenRouter por token→por milhão uma vez, HF base própria/critério; correspondência source+externalId única, variantes e benchmarks com proveniência por valor.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 3.5: Apresentar a comparação de Modelos no padrão Artificial Analysis e nos estilos existentes

Como Andre, dono do painel,
Quero comparar Modelos, consultar suas métricas e expandir seus detalhes,
Para escolher com base em capacidades, custos e fontes verificáveis.

**Acceptance Criteria:**

**Given** entrada sem estado válido restaurado,
**When** a aplicação abre MODELOS,
**Then** usa Artificial Analysis Light, apresentação analítica e três cartões de Inteligência, Velocidade e Custo antes da tabela. Nas famílias alternativas, HÍBRIDO permanece como padrão próprio (FR-27, UX-DR41).

**Given** uma comparação com filtros, ordenação e variantes selecionadas,
**When** Andre troca entre HÍBRIDO, TERMINAL e ANALÍTICO,
**Then** preserva os mesmos dados, IDs, variantes e consulta; a escolha manual fica salva conforme o contrato de preferências (FR-9, FR-10).

**Given** Modelos normalizados,
**When** a tabela ou uma linha expandida é exibida,
**Then** apresenta os campos de FR-9 e os benchmarks disponíveis, com origem e atribuição “Dados: Artificial Analysis” vinculada à fonte. Ausência aparece como “—”; zero informado continua zero.

**Given** o Custo estimado por tarefa e a latência,
**When** Andre consulta os respectivos controles ⓘ,
**Then** vê a fórmula de 2.000 tokens de entrada + 1.000 de saída, o aviso sobre tokens de raciocínio e a explicação de “Tempo até a resposta”. Custo fica logo após Inteligência e usa “≈” nos Modelos de raciocínio (FR-11, FR-12).

**Given** os três cartões de métricas,
**When** seus gráficos são apresentados ou uma barra é selecionada,
**Then** usam os dados normalizados da comparação, com unidade, legenda e variante identificáveis; não fabricam métricas nem preenchem ausências. A seleção solicita destaque do Modelo na tabela; se os filtros o excluírem, informa isso sem alterar a consulta silenciosamente (UX-DR41).

**Given** teclado, toque, tela pequena ou redução de movimento,
**When** Andre opera a comparação,
**Then** filtros, estilos, gráficos, controles ⓘ e expansão permanecem acessíveis. Os cartões se empilham no celular; a tabela mantém acesso às colunas por rolagem, com foco visível e tokens da família ativa (UX-DR1, UX-DR2, UX-DR32, UX-DR39, UX-DR41).

**Given** carregamento, falha de fonte ou dados demonstrativos,
**When** a interface apresenta a comparação,
**Then** distingue esses estados, conserva a última revisão válida disponível e identifica fixtures como demonstração. O gate Q3/browser e a readiness blocked-integration permanecem vigentes.

## Epic 4: Explorar Empresas no Globo Cesium

Andre localiza Empresas e Lançamentos num Globo sempre 3D, alterna MAPA/SAT e usa o Terminal sem perder filtros, câmera ou seleção. Explora terreno, prédios compatíveis, detalhe OSM progressivo e fotorealismo automático em SAT quando coberto.

### Story 4.1: Manter estado, bases e preferências no store compartilhado

Como Andre, dono do painel,
Quero preservar seleção, filtros e preferências ao navegar e trocar a base do Globo,
Para retomar a exploração com o mesmo contexto.

**Readiness:** ready-local; gate: local para fixtures. A implementação do contrato Q11/AD-16 precede consumidores; a base inicial real permanece em Q6.

**Acceptance Criteria:**

**Given** o contrato de experiência compartilhado,
**When** uma intenção de navegação ou troca de base é recebida,
**Then** somente o reducer escreve o estado semântico; a projeção permanece 3D e a base aceita MAPA ou SAT. A troca preserva seleção, filtros, Relações e Terminal e não persiste fotorealismo como uma terceira base (FR-2, FR-32, AD-10, AD-16, AD-17).

**Given** preferências salvas, configuração inicial e overrides da sessão,
**When** o estado é restaurado ou alterado manualmente,
**Then** mantém preferences, sessionOverrides e effectiveState separados; restauração de URL não regrava preferências e uma ação explícita salva somente o campo editado. A base inicial é recebida como configuração; fixtures não a decidem para produção (FR-27, AD-10, Q6).

**Given** URL com base ou parâmetros legados view,
**When** o contrato de URL é aplicado,
**Then** base prevalece; view=MAPA ou SAT funciona como alias, view=3D não escolhe base e view=2D usa a base inicial configurada sem projeção plana. Schema e fixtures são publicados pelo proprietário de contratos antes dos consumidores (FR-32, FR-38, AD-16, Q11).

**Given** avanço de snapshot ou callback assíncrono,
**When** a revisão ou intenção atual já mudou,
**Then** reconcilia substituições canônicas e seleção em uma transição; remove seleção sem substituição com aviso e descarta callbacks vencidos de câmera ou digitação (AD-10).

**Given** ações de painel e aba,
**When** Andre abre Fila, Leitor lateral ou MERCADOS, ou troca para MODELOS/NOTÍCIAS,
**Then** mantém os painéis laterais exclusivos e fecha o Terminal ao sair de GLOBO; a família e o modo visual acompanham as preferências sem duplicar estado (FR-6, UX-DR2, UX-DR41).

**Given** intent, ID ou payload incompatível,
**When** a fronteira de experiência é chamada,
**Then** retorna erro explícito, preserva o contexto válido e não executa JS, URL ou patch arbitrário (AD-9, AD-16).

### Story 4.2: Integrar o renderer Cesium ao Globo principal

Como Andre, dono do painel,
Quero abrir e trocar as bases do Globo na mesma experiência,
Para explorar a Terra mantendo câmera e contexto.

**Readiness:** blocked-integration; gates Q3/Q6/Q9 e contratos da Story 4.1. Esta story estabelece o adapter e a composição básica; as camadas de detalhe são acrescentadas na Story 4.3.

**Acceptance Criteria:**

**Given** a estratégia de runtime, assets, workers e CSP decidida em Q9,
**When** o Globo principal inicializa,
**Then** carrega a versão CesiumJS fixada na baseline de arquitetura, por trás de GlobeRenderer, consumindo os módulos ESM e contratos existentes. A experiência usa o mesmo store e rota de produto (FR-32, AD-17, UX-DR3).

**Given** recursos e composição básica aprovados em Q6,
**When** uma base implementada é selecionada,
**Then** GlobeSceneComposer possui as coleções e aplica a base MAPA escura ou imagery SAT; adapters de provider retornam recurso, status e créditos sem mutar diretamente a cena. A troca conserva posição/orientação da câmera e contexto sem reinicializar o Viewer (FR-32, FR-40).

**Given** eventos da cena,
**When** ocorre seleção ou navegação,
**Then** o adapter encaminha intents tipados ao store; não possui Cadastro, filtros, preferências ou publicação e não acrescenta rastreamento nem controles de voo por Empresa/região. As ações existentes de foco por câmera continuam disponíveis (AD-10, AD-17).

**Given** mudança de geração da cena ou encerramento do renderer,
**When** cargas ou callbacks antigos terminam,
**Then** ignora seus resultados; dispose remove listeners/subscriptions, cancela cargas e libera recursos sem remover a seleção semântica (AD-17).

**Given** falha de base, runtime ou contexto WebGL,
**When** a cena fica indisponível ou é restaurada,
**Then** informa o estado, mantém a intenção e o contexto no store e restaura somente a geração atual conforme Q9. MAPA não muda silenciosamente para SAT; só bases implementadas e disponíveis podem ser escolhidas (FR-32, AD-17).

**Given** recursos ou credenciais de provider,
**When** o adapter os usa,
**Then** exige licença, cobertura, orçamento/quota, cache e crédito aprovados em Q6; segredos privados e de escrita permanecem no servidor. Credenciais públicas permitidas seguem restrições do app/ambiente e monitoramento. Créditos ativos ficam legíveis e acessíveis (FR-28).

### Story 4.3: Compor terreno, edifícios e detalhe automático de MAPA/SAT

Como Andre, dono do painel,
Quero ver relevo, prédios e detalhes geográficos conforme me aproximo,
Para explorar localidades no Globo sem perder as Empresas.

**Readiness:** blocked-integration; gates Q3/Q6/Q9. Depende apenas da composição básica da Story 4.2 e dos contratos anteriores.

**Acceptance Criteria:**

**Given** MAPA ativa e uma receita de camadas comprovada em Q6,
**When** a câmera se aproxima,
**Then** mantém cartografia de fundo bem escuro e aumenta o detalhe de cidades, rodovias e ruas OSM conforme limiares e histerese aprovados, sem oscilar continuamente perto deles (FR-32, FR-40, UX-DR29).

**Given** SAT ativa,
**When** o zoom é amplo ou se aproxima de uma área coberta com fotorealismo disponível,
**Then** mostra imagery de satélite no zoom amplo e transita automaticamente para fotorealismo 3D no zoom próximo coberto. A camada ativa é derivada da câmera, cobertura e disponibilidade; não cria controle manual ou preferência de terceira base (FR-32, AD-17).

**Given** uma área fotorealística ativa,
**When** Andre afasta a câmera, sai da cobertura ou a camada falha,
**Then** retorna à imagem SAT e conserva câmera, Pontos, Relações, seleção, filtros e Terminal (FR-32, FR-40).

**Given** MAPA ou SAT e recursos aprovados,
**When** o compositor resolve a cena,
**Then** terreno acompanha ambas as bases e edifícios aparecem quando disponíveis e compatíveis, sem segunda geometria sobre prédios do fotorealismo. A receita comprova a compatibilidade real; não presume sobreposição simultânea de imagery, terreno e tiles fotorealísticos (Q6, AD-17).

**Given** cargas opcionais, falha de tiles ou troca rápida de base,
**When** o estado da cena muda,
**Then** cargas de geração vencida não entram na cena; camadas opcionais não bloqueiam a exploração nem a primeira tela. Falha em MAPA mantém MAPA utilizável com aviso; falha de detalhe em SAT preserva imagery SAT (FR-40).

**Given** camadas ativas ou removidas,
**When** tiles são consultados ou créditos são compostos,
**Then** usa carga interativa e cache permitido pelo provider, sem pré-download ou modo offline; mostra apenas os créditos ativos, incluindo © OpenStreetMap contributors quando aplicável (FR-28, FR-40).

**Given** horário e preferência de movimento,
**When** o terminador é atualizado,
**Then** acompanha dia/noite somente onde a composição for compatível; reduzir movimento elimina rotação e transições animadas sem impedir a atualização da iluminação (FR-32, UX-DR17).

### Story 4.4: Mostrar e selecionar Empresas e Lançamentos no Globo

Como Andre, dono do painel,
Quero identificar Empresas e perceber seus Lançamentos no Globo,
Para escolher o que explorar por localização e Camada.

**Readiness:** blocked-integration; gates Q3/Q8 e renderer das Stories 4.2/4.3. Conserva a readiness da antiga Story 4.2.

**Acceptance Criteria:**

**Given** uma projeção elegível/visível calculada pelo domínio,
**When** o adapter renderiza Empresas,
**Then** projeta os mesmos IDs sem recalcular filtros; cada Empresa com localização elegível tem um marcador conforme a classe visual Q8. Localização ausente omite o marcador; aproximação não aparece como endereço preciso e segue limites de seleção/câmera aprovados (FR-1, AD-10, AD-16, AD-17).

**Given** Camada principal, Etiquetas e evidência de isLab,
**When** Andre opera a legenda horizontal,
**Then** os filtros incluem Camada principal ou Etiqueta, as contagens usam Camada principal e o domínio mantém a elegibilidade única. Laboratórios usam losango e rótulo prioritário; as cores seguem a Camada principal (FR-1, FR-2, UX-DR4, UX-DR5, UX-DR6, UX-DR31).

**Given** sedes próximas e mudanças de zoom,
**When** os marcadores são desobstruídos,
**Then** o espalhamento muda apenas coordenadas visuais, preserva as localizações curadas e mantém Empresas selecionáveis; prioriza Laboratório selecionado e Lançamentos recentes (FR-1, Q3).

**Given** o último Lançamento canônico por Laboratório da Story 3.2,
**When** sua idade está na janela de sete dias,
**Then** o Pulso enfraquece continuamente e termina ao completar a janela; carga inicial e reaparição de Modelo antigo não criam novo Pulso. Reduzir movimento usa destaque estático e o rótulo mostra a idade (FR-3, FR-26, UX-DR7).

**Given** zoom regional e limiar aprovado em Q3,
**When** a identidade visual é apresentada,
**Then** usa logo local em círculo com borda da Camada ou o monograma compartilhado da Story 2.3 (FR-4, UX-DR38).

**Given** mouse, teclado ou toque sobre Ponto/Rótulo,
**When** Andre os ativa,
**Then** envia o mesmo intent canônico de seleção/foco; hover estável de cerca de 300 ms em mouse solicita Prévia, saída a cancela e toque seleciona diretamente sem hover. A interface do Terminal consumirá esses intents na Story 4.6 (FR-5, UX-DR2).

### Story 4.5: Explorar Relações e prévias fantasmas sem publicar propostas

Como Andre, dono do painel,
Quero ver Relações dirigidas e prévias de propostas no Globo,
Para entender ligações e revisar alterações com contexto geográfico.

**Readiness:** blocked-integration; gates Q3/Q8 e compositor anterior. Consome Cadastro/Relações publicados e projeções temporárias da Story 2.4.

**Acceptance Criteria:**

**Given** Relações publicadas com duas Empresas canônicas, direção, tipo e origem,
**When** a sobreposição é ativada,
**Then** desenha arcos dirigidos com as cinco cores semânticas e filtro por tipo; a rede é sutil por padrão e selecionar uma Empresa destaca suas Relações. Só desenha arcos quando os dois extremos estão no conjunto elegível/visível (FR-31, UX-DR8).

**Given** uma Relação selecionada,
**When** a projeção para o Terminal é consultada,
**Then** retorna direção, tipo, origem e Empresa ligada por ID canônico; a navegação usa intent compartilhado de foco, consumido pela Story 4.6 (FR-31, AD-16).

**Given** VER NO GLOBO na Fila de revisão,
**When** a projeção temporária da Story 2.4 chega ao renderer,
**Then** desenha Ponto ou arco fantasma tracejado, distinguível e identificado como proposta, em coleção separada dos dados publicados. Usa classes Q8 e indica indisponibilidade quando falta localização utilizável (FR-23, FR-31).

**Given** cartão resolvido, Fila fechada ou callback antigo,
**When** o estado temporário é removido,
**Then** limpa fantasmas e ignora resultados vencidos sem publicar ou alterar entidades curadas (AD-4, AD-17).

**Given** troca de base, filtros ou presença de infraestrutura,
**When** as Relações são reprojetadas,
**Then** conserva IDs e direção e não infere vínculo empresarial por proximidade de cabos ou estações; a sobreposição de Relações é independente de BACKBONES (FR-31).

### Story 4.6: Operar Prévia, Terminal e som por teclado e toque

Como Andre, dono do painel,
Quero abrir o Terminal de uma Empresa e controlar sua leitura e som,
Para consultar seus dados sem perder a exploração.

**Readiness:** blocked-integration; gate Q3/browser. Conserva a readiness da antiga Story 4.3; usa contratos de snapshot e intents anteriores, com fixtures para dados ainda sem integração.

**Acceptance Criteria:**

**Given** hover estável em mouse ou ativação de Ponto/Rótulo,
**When** a interface recebe o intent da Story 4.4,
**Then** abre Prévia após cerca de 300 ms ou Terminal Fixado por clique/toque; saída cancela a Prévia e toque não a apresenta (FR-5, FR-6, UX-DR9, UX-DR10).

**Given** uma Empresa selecionada em uma revisão consistente,
**When** o Terminal abre,
**Then** mostra identidade, localização/qualidade, site/contato disponível, Camada/Etiquetas, Modelos, Notícias e cotações disponíveis ou Privada/ausência explícita. A linha RELAÇÕES usa direção, tipo e Empresa ligada da Story 4.5; links e navegação usam IDs validados. Fixtures permitem integrar a superfície antes dos providers de Notícias/mercados (FR-6, FR-31).

**Given** família retrô ou Artificial Analysis e preferência de movimento,
**When** o conteúdo é apresentado,
**Then** nas alternativas retrô a digitação leva até cerca de dois segundos, Notícias aparecem linha a linha e ASCII/pixel art transita para o logo; em Artificial Analysis ou reduzir movimento o conteúdo aparece imediatamente. Clique interno ou Esc primeiro completa a digitação sem fechar (FR-7, UX-DR2, UX-DR41).

**Given** Terminal completo e janelas sobrepostas,
**When** Andre fecha ou interage com a cena,
**Then** botão/Esc obedecem à prioridade da janela ativa e devolvem foco; clique em área vazia pode fechar, arrasto nunca fecha e controles/painéis mantêm o Terminal. Troca para MODELOS/NOTÍCIAS fecha o Terminal; Leitor e Terminal podem coexistir e se reposicionam (FR-6).

**Given** controles de Som,
**When** Andre faz gesto explícito para ligá-los,
**Then** gera áudio no navegador, com canais Digitação/Ambiente e volumes independentes; ambos começam desligados e religar restaura canais previamente ativos sem autoplay antes do gesto. Preferências permanecem salvas (FR-8, UX-DR2, UX-DR26, UX-DR28).

**Given** callback de Empresa antiga, ID inválido ou dado indisponível,
**When** a interface o recebe,
**Then** conserva a seleção atual, descarta callback vencido e informa ausência/erro sem abrir dados de outra Empresa (AD-10, AD-16).

### Story 4.7: Aplicar famílias visuais, navegação e acesso completo no celular

Como Andre, dono do painel,
Quero escolher a aparência e alcançar as funções do Globo em qualquer dispositivo,
Para explorar com legibilidade, foco e conforto.

**Readiness:** blocked-integration; gates Q3/browser e matriz/performance Q9. Conserva a readiness da antiga Story 4.4; implementa tokens e primitivas que as superfícies posteriores herdam.

**Acceptance Criteria:**

**Given** entrada inicial ou escolha manual de aparência,
**When** o tema e o modo são resolvidos,
**Then** Artificial Analysis Light é o padrão inicial, escuro é opcional e as seis alternativas permanecem com retorno visível ao padrão. Trocar família preserva modo/preferências/contexto; painéis OSIRIS/âmbar continuam escuros nos dois modos (FR-27, UX-DR1, UX-DR41).

**Given** seletor de Fundo do Globo na família Artificial Analysis,
**When** Andre escolhe uma opção do modo atual,
**Then** altera somente o entorno do palco e salva por modo, preservando MAPA/SAT, câmera, entidades e filtros; os tons experimentais seguem o gate de acabamento e não substituem a exigência de MAPA bem escuro (UX-DR3, UX-DR41).

**Given** desktop, tablet ou celular,
**When** a interface se reorganiza,
**Then** Globo aceita arrastar/pinça, Terminal móvel usa painel de baixo para cima e Legenda/Faixa permanecem legíveis. Busca, Relações, Temas, Som, Agente, Fila, MERCADOS, BACKBONES e navegação ficam alcançáveis por toque; primitivas e tokens comuns permitem às superfícies posteriores herdar o mesmo acesso (FR-29, UX-DR14, UX-DR21, UX-DR22, UX-DR23, UX-DR25, UX-DR26, UX-DR31).

**Given** teclado ou leitor de tela,
**When** Andre percorre os controles e até cerca de 200 Empresas,
**Then** aplica a ordem de foco decidida em Q3, alternativas acessíveis para Pontos/rótulos, rótulos/estados anunciados e retorno de foco. Ajuda ? descreve 1/2/3, /, Esc, F, R, setas e +/−; atalhos não interceptam campos de texto (FR-32, UX-DR16, UX-DR19, UX-DR20, UX-DR28, UX-DR39).

**Given** câmera, controles de zoom/rotação e leitura de cursor,
**When** Andre navega no Globo,
**Then** mantém controles visíveis de zoom/rotação, pinça afeta o Globo e zoom de página por teclado permanece disponível; leitura mostra coordenadas, lugar, zoom e escala conforme dados disponíveis e rótulos geográficos respeitam Labs. Reduzir movimento elimina rotação automática e transições animadas (FR-32, UX-DR18, UX-DR19, UX-DR30).

**Given** a identidade visual do emblema definida no gate de acabamento,
**When** a interface aplica a marca,
**Then** usa o mesmo emblema no favicon e na barra de status junto à marca, com tokens da família ativa; a forma ainda aberta não é inventada nem considerada aprovada por esta decomposição (UX-DR16, Q3).

**Given** todos os modos/famílias e camadas representativas,
**When** a implementação futura passa pelo gate Q3/Q9,
**Then** exige contraste WCAG AA inclusive sobre textura/brilho, estados identificáveis além de cor e matriz de desempenho: cerca de três segundos para primeira tela útil, cerca de 60 fps no notebook e pelo menos cerca de 30 fps no celular com cerca de 200 Empresas, incluindo terreno/prédios/fotorealismo disponíveis. Esta documentação não declara medições executadas.

## Epic 5: Ler Notícias relevantes com contexto e fontes

Andre acompanha Notícias filtradas por Empresa, lê sínteses em português e abre a matéria original mantendo o contexto da pesquisa.

### Story 5.1: Projetar e ocultar Notícias nas cinco superfícies

Como Andre, dono do painel,
Quero consultar e ocultar a mesma Notícia em todas as superfícies,
Para manter a leitura coerente e retirar resultados irrelevantes.

**Readiness:** ready-local; regras e projeções em fixtures. Persistência e comandos reais continuam sob Q2; a interface consome estas projeções na Story 5.3.

**Acceptance Criteria:**

**Given** Notícias normalizadas com URLs e aliases verificáveis,
**When** a coleção é deduplicada,
**Then** conserva NewsId estável e evidência de conteúdo sindicado; não une matérias distintas apenas por título similar. Mantém até cinco Notícias por Empresa nas últimas duas semanas, até 14 no FLUXO e três ao expandir LABS (FR-14, FR-33, AD-6).

**Given** relevância por Empresa e Empresas apenas citadas,
**When** as listagens são projetadas,
**Then** usa relevantCompanyIds para distribuir Notícias e citedCompanyIds para links no Leitor, sem atribuir uma matéria a Empresa somente mencionada (FR-15, FR-34, AD-16).

**Given** marcar como irrelevante,
**When** Andre cancela ou confirma,
**Then** cancelar não emite comando; confirmar usa dono, versão e idempotência, registra feedback privado e oculta imediatamente o grupo em Terminal, FLUXO, LABS, NOTÍCIAS e Leitor, com reposição de foco se o item aberto desaparecer (FR-15, UX-DR40).

**Given** novo snapshot, alias antigo ou tentativa de navegação para item oculto,
**When** a projeção é consultada,
**Then** aplica supressão owner-wide por dataRevision/feedbackRevision antes dos limites e bloqueia reabertura também na Busca e no contexto de chat; merge conserva aliases/feedback e o Agente de notícias não escreve esse ledger (FR-15, AD-5).

**Given** comandos ou dados inválidos, versão vencida ou acesso negado,
**When** a fronteira é chamada,
**Then** retorna erro explícito, não fabrica coleção vazia como sucesso de leitura e conserva dados/feedback anteriores (AD-9, AD-16).

### Story 5.2: Coletar e validar resumos sem dar autoridade de escrita ao Agente

Como Andre, dono do painel,
Quero receber Notícias da Empresa certa com síntese em português,
Para acompanhar o setor sem homônimos ou instruções externas alterarem meus dados.

**Readiness:** blocked-integration; gates Q1/Q7/fontes e Q2 para execução durável. Fixtures permitem desenvolver os validadores; provider/teto/tamanho editorial precisam estar definidos antes da integração paga.

**Acceptance Criteria:**

**Given** fontes de Notícias aprovadas e adaptadores de coleta,
**When** a rotina da Story 1.5 busca matérias,
**Then** normaliza título original, veículo, data e URL, preserva evidência de origem e usa as regras de coleção incremental/publicação do Epic 1; consultas externas seguem allowlist/proteção SSRF (FR-14, AD-5, AD-6).

**Given** conteúdo externo ou resposta do LLM,
**When** o Agente produz o esquema fixo NewsResult,
**Then** valida fora do LLM IDs existentes, campos permitidos, referências realmente consultadas, resumo em português, resumo estendido e pontos-chave; instruções externas não viram ferramentas e o Agente não altera Cadastro, Modelos ou Fila (FR-16, FR-17).

**Given** os seis casos de homônimos Apple/fruta, Amazon/floresta, Oracle/palavra, Meta/palavra, Mistral/vento e Constellation/astronomia,
**When** a implementação futura é validada para integração,
**Then** deve descartar os casos fixos e alcançar pelo menos 90% de relevância numa amostra humana de 50 Notícias, considerando a Empresa-alvo e menções de passagem. Esta revisão documental não declara esse resultado observado (FR-15).

**Given** chamada paga, retry ou falta de preço/teto,
**When** o processamento é admitido,
**Then** usa a reserva da Story 1.2, respeita os modos 80%/100% e suspende geração paga quando não houver autorização de orçamento verificável (AD-8).

**Given** falha de tradução, resumo, validação ou orçamento,
**When** uma matéria de origem válida é exibida,
**Then** conserva título original, veículo, data e link, informa resumo indisponível e não publica texto inválido. Sínteses válidas são identificadas como geradas por IA; não reproduzem nem traduzem integralmente a matéria (FR-16, FR-34).

### Story 5.3: Operar FLUXO, LABS, NOTÍCIAS e Leitor com contexto

Como Andre, dono do painel,
Quero alternar listagens e ler uma Notícia mantendo sua Empresa e fonte,
Para explorar o conteúdo sem perder a navegação.

**Readiness:** blocked-integration; gate Q3/browser. Usa os contratos anteriores e fixtures para a interface; dados reais dependem das integrações anteriores.

**Acceptance Criteria:**

**Given** o painel sobre o Globo,
**When** Andre alterna FLUXO/LABS ou TODAS/SÓ LABORATÓRIOS,
**Then** FLUXO é a aba inicial sem preferência válida, escolhas ficam salvas e contagens/novos itens respeitam o filtro. LABS agrupa por região e mostra último Modelo/Lançamento e três Notícias ao expandir (FR-33, UX-DR12, UX-DR13).

**Given** a aba NOTÍCIAS na família Artificial Analysis,
**When** a coleção filtrada é apresentada,
**Then** organiza Destaque/Principais notícias e Últimas notícias no estilo editorial da variante, com filtros combinados de Empresa/Camada, estado vazio/reset, títulos e metadados legíveis em claro/escuro e no celular. Os dados financeiros são uma extensão independente do Epic 6, sem dependência para esta leitura (FR-33, UX-DR33, UX-DR37, UX-DR41).

**Given** imagem candidata para uma manchete,
**When** a interface decide exibi-la,
**Then** exige vínculo verificável entre imagem, matéria, procedência e link original. Sem imagem, durante falha ou sem correspondência, usa placeholder e conserva título/Fonte/link; uma foto genérica da Empresa não substitui essa evidência. Fixtures e sínteses editoriais permanecem identificadas (FR-34).

**Given** manchete em Terminal, FLUXO, LABS ou NOTÍCIAS,
**When** Andre a abre,
**Then** consulta o mesmo NewsId elegível e abre o Leitor com resumo estendido, pontos-chave, Empresas citadas canônicas, título original, veículo, data e link em nova guia. Seleção de Laboratório foca a Empresa; Notícia no Globo abre também seu Leitor; em AA o conteúdo aparece imediatamente (FR-33, FR-34, UX-DR11, UX-DR41).

**Given** preferência de Leitor e outros painéis,
**When** o Leitor é aberto ou fechado,
**Then** LATERAL é inicial, FLUTUANTE pode ser salvo e abrir por NOTÍCIAS usa override LATERAL sem regravar a preferência. Lateral é exclusivo com Fila/MERCADOS; flutuante pode coexistir quando houver espaço. Abrir/fechar move/devolve foco e Esc respeita digitação e a janela superior (FR-34, UX-DR2).

**Given** item oculto, ID vencido, falha, teclado/toque ou reduzir movimento,
**When** a interface recebe o estado ou uma ação,
**Then** aplica a projeção da Story 5.1, não reabre conteúdo suprimido, mostra ausência/últimos dados válidos e mantém ações acessíveis sem animações obrigatórias; utiliza tokens, monograma e dicas da família ativa (UX-DR1, UX-DR38, UX-DR39).

### Story 5.4: Manter origem e créditos nas projeções de dados

Como Andre, dono do painel,
Quero ver a origem e o horário dos dados e das camadas ativas,
Para distinguir evidência, síntese e demonstração.

**Readiness:** blocked-integration; gates fontes/licenças/browser. A regra compartilhada de atribuição serve aos módulos posteriores sem exigir suas integrações antecipadas.

**Acceptance Criteria:**

**Given** dados estruturados ou Notícias de uma fonte,
**When** uma projeção apresenta seus valores,
**Then** conserva referência/URL de origem e datas disponíveis, distingue horário de origem de coleta e não fabrica asOf; Modelos exibem a atribuição obrigatória Artificial Analysis e a coluna de custo própria fica identificada (FR-28, AD-11).

**Given** resumos ou falta de geração,
**When** a Notícia é apresentada,
**Then** mantém título/link originais e identifica a síntese como IA, seu estado indisponível ou a demonstração conforme o contrato comum (FR-16, FR-34).

**Given** recursos geográficos ativos,
**When** seus créditos são compostos pelo contrato de recurso,
**Then** exibe somente fontes das camadas ativas, inclusive OSM, imagery, terreno, edifícios, fotorealismo ou BACKBONES quando aplicáveis. Atribuição permanece acessível no celular e não certifica licença nem custo aprovado (FR-28, Q4, Q6).

**Given** fonte parcial/falha ou licença não comprovada,
**When** o consumidor recebe o estado,
**Then** preserva dados/horários válidos com indicação de estado e mantém a integração bloqueada onde exigido. O mecanismo usa os metadados compartilhados e não introduz novo rodapé institucional (AD-16, UX-DR15).

## Epic 6: Acompanhar o mercado de IA

Andre consulta índices, ações e indicadores com unidade, horário, atraso e disponibilidade claros, vê o contexto financeiro na aba Notícias e navega de uma ação à Empresa relacionada.

### Story 6.1: Confirmar instrumentos, cobertura, calendários e fontes de reserva

Como Andre, dono do painel,
Quero uma identificação verificável de cada instrumento e sua cobertura,
Para interpretar cotações e indisponibilidades na unidade e no mercado corretos.

**Readiness:** blocked-integration; gate Q5. A matriz e os contratos precedem coleta e interfaces das Stories 6.2 a 6.4.

**Acceptance Criteria:**

**Given** ações do Cadastro, índices e indicadores previstos em FR-18/FR-36,
**When** a matriz de cobertura é preparada para aceite Q5,
**Then** cada InstrumentId tem símbolo por Fonte, moeda/unidade, listagem principal, mercado, calendário/sessões/feriados, timezone IANA, atraso declarado, cadência, histórico de um mês e cobertura principal/reserva com evidência (AD-11, AD-16).

**Given** Nasdaq-100, Nasdaq Composite, S&P 500 e SOX, os dez cartões macro e índices mundiais,
**When** suas políticas são definidas,
**Then** mantém os quatro índices obrigatórios e identifica VIX, US 10Y, Dólar, Ouro, WTI e Bitcoin e regiões Américas/Europa/Ásia; macro/cripto recebem políticas próprias, sem inferir pregão ou cadência de ações (FR-18, FR-19, FR-36).

**Given** Empresa privada ou listada fora dos EUA,
**When** sua cotação é associada,
**Then** usa ticker/bolsa conferidos na curadoria e a listagem aplicável; não substitui silenciosamente por outra bolsa/moeda. Privada e sem cobertura são estados distintos (FR-18, FR-20).

**Given** reserva não comprovada, símbolo desconhecido ou calendário ausente,
**When** a integração é avaliada,
**Then** registra a lacuna e mantém dados indisponíveis ou último válido com horário; não promete fallback mundial nem aprovação de provider apenas pela existência da matriz (Q5).

### Story 6.2: Atualizar cotações respeitando sessões, atraso e falha parcial

Como Andre, dono do painel,
Quero cotações com origem e horário corretos e continuidade em falhas,
Para acompanhar o mercado sabendo a idade de cada valor.

**Readiness:** blocked-integration; gates Q5/Q2. Consome a matriz da Story 6.1 e a execução/publicação do Epic 1.

**Acceptance Criteria:**

**Given** instrumento e calendário aprovados,
**When** a atualização é agendada,
**Then** ações/índices em pregão usam cerca de 15 minutos e coleta pós-fechamento; feriados, fins de semana e sessões seguem o instrumento. Macro/cripto seguem somente sua política Q5 (FR-19, AD-7).

**Given** resposta de Fonte,
**When** a cotação é validada,
**Then** conserva quotedAt, fetchedAt/lastSuccessAt e atraso separadamente, verifica moeda/unidade/listagem e calcula variação usando fechamento comparável; não fabrica horário, zero ou valor de outra listagem (AD-11, AD-16).

**Given** falha da Fonte principal,
**When** a reserva comprovada é consultada,
**Then** identifica sua origem e mantém a falha principal visível. Se ambas falharem, conserva o último valor válido com data; se não houver dado válido, retorna ausência explícita (FR-19).

**Given** estados de fonte e sessão,
**When** a projeção calcula frescor,
**Then** usa a política comum do Epic 1: calendário/nextDueAt fora de pregão, duas cadências mais atraso documentado em pregão e horário obrigatório. Sucesso HTTP não renova dado velho; ausência de calendário não anuncia mercado aberto ou LIVE (FR-25).

**Given** retry, payload inválido ou atualização concorrente,
**When** o resultado tenta publicar,
**Then** segue limites por Fonte, last-good e CAS/fencing da Story 1.6; nenhuma slice inconsistente sobrescreve a revisão válida (AD-6).

### Story 6.3: Explorar a Faixa e o Painel MERCADOS

Como Andre, dono do painel,
Quero consultar ações e indicadores, salvar favoritos e navegar às Empresas,
Para acompanhar o mercado de IA num painel consistente.

**Readiness:** blocked-integration; gates Q3/Q5/browser. Fixtures permitem compor a interface com os contratos anteriores; Resumo usa uma porta de navegação e permanece indisponível enquanto o chat estiver gated.

**Acceptance Criteria:**

**Given** a Faixa de cotações,
**When** instrumentos são apresentados,
**Then** inclui os quatro índices obrigatórios e ações aplicáveis, com ticker/nome, logo/monograma, valor, variação textual/▲▼ e horário/fuso/aviso de atraso. Hover pausa a faixa; reduzir movimento remove rolagem automática mantendo todos os itens acessíveis (FR-18, FR-19, UX-DR14, UX-DR23, UX-DR38).

**Given** o botão MERCADOS,
**When** Andre abre, amplia ou fecha o painel,
**Then** o botão indica abertura, pode ampliar para tela cheia e fecha por botão/Esc, sem clique fora; Fila e Leitor lateral são fechados e foco segue a janela ativa (FR-36, UX-DR21).

**Given** o painel aberto,
**When** os dados são projetados,
**Then** apresenta dez cartões macro, ações por Camada e índices de Américas/Europa/Ásia, com ATIVO/ÚLTIMO/VAR%/1M e controles acessíveis durante rolagem. Amplitude/extremos usam valores disponíveis; ausência não conta como zero. Pregão por índice e número de bolsas abertas usam somente calendários confirmados (FR-36, UX-DR22, UX-DR24).

**Given** busca por ticker, seleção ou favorito,
**When** Andre confirma a ação,
**Then** ticker do Cadastro navega à Empresa/Terminal, índice destaca sua linha/cartão e desconhecido informa ausência mantendo a consulta. Favoritos persistem por ID e WATCH usa o mesmo conjunto; marcar favorito não dispara navegação (FR-36).

**Given** Resumo do Agente,
**When** Andre o solicita,
**Then** emite a ação de abertura/contexto do especialista LLM com dados e datas; se Q1/Q7 ou integração de chat estiverem pendentes, informa indisponibilidade. A consulta financeira funciona independentemente dessa porta, que o Epic 7 poderá consumir (FR-36).

**Given** dados atrasados/ausentes, dispositivo móvel ou outro modo visual,
**When** o painel é operado,
**Then** mantém unidades, horários, estados e ações com teclado/toque, tokens da família ativa e foco visível; fixtures não recebem rótulo de cotação real (FR-19, FR-29, UX-DR1, UX-DR2, UX-DR41).

### Story 6.4: Mostrar finanças em NOTÍCIAS e a demonstração do especialista em ações

Como Andre, dono do painel,
Quero consultar o contexto financeiro junto às Notícias e abrir uma demonstração por ação,
Para relacionar manchetes ao mercado e entender a interface futura do especialista.

**Readiness:** blocked-integration para dados reais, gates Q3/Q5/browser; o diálogo é somente demonstração local, sem provider financeiro/LLM. Deriva de FR-36 e do delta UX já aprovado; não adiciona análise financeira real.

**Acceptance Criteria:**

**Given** NOTÍCIAS da Story 5.3 e instrumentos das Stories 6.1 a 6.3,
**When** o contexto financeiro é apresentado,
**Then** mostra panorama macro, amplitude/extremos, seis Empresas em foco e demais ações por Camada abaixo delas, com favoritos e panorama mundial. Cobertura acompanha o Cadastro/matriz; 29 ações e 11 linhas mundiais do preview não são quotas fixas de produto (FR-36, UX-DR41).

**Given** filtro de manchetes ou zero Notícias,
**When** a lista editorial muda,
**Then** mantém ações, macro, índices e controles financeiros; preço/bolsa/moeda/horário/variação/mini tendência seguem os dados disponíveis da mesma projeção e ausências permanecem explícitas (FR-19, FR-36).

**Given** a linha de uma ação,
**When** Andre escolhe Conversar sobre seu ticker,
**Then** abre diálogo modal próprio do futuro especialista em ações, separado do console LLM, com Empresa/ação/bolsa/moeda, campo de pergunta, sugestões e respostas locais identificadas como demonstração. Não chama API, cria análise real ou estabelece Histórico financeiro persistido (FR-36).

**Given** troca de ação, pergunta, favorito ou resposta local,
**When** a interação ocorre,
**Then** conserva o contexto da ação correta e ignora callback antigo; favorito compartilha WATCH e não abre conversa/navegação acidentalmente. A demonstração não consulta segredos nem conversas do especialista LLM (UX-DR41).

**Given** diálogo aberto em claro/escuro ou celular,
**When** Andre navega ou fecha,
**Then** foco inicia na pergunta, Tab permanece no modal, fundo não recebe ações e Escape/botão fecha e devolve foco à origem. Fechar preserva filtros/aba/seleção e todos os blocos financeiros permanecem alcançáveis (UX-DR1, UX-DR2, UX-DR41).

## Epic 7: Pesquisar, localizar e retomar contexto

Andre encontra Empresas, Modelos, tickers e Notícias e pesquisa o setor com fontes citadas, ações de navegação e Histórico privado.

### Story 7.1: Buscar entidades e restaurar o contexto da URL

Como Andre, dono do painel,
Quero localizar entidades e reabrir um endereço salvo,
Para retomar minha exploração com o contexto correto.

**Readiness:** ready-local para busca/projeção/URL em fixtures; integração da interface continua sob Q3/browser. Usa os contratos Q11/AD-16 e consumidores dos Epics 2 a 6, sem dependência de chat ou Histórico.

**Acceptance Criteria:**

**Given** uma revisão de dados e feedback vigente,
**When** a consulta de Busca global é executada,
**Then** retorna Empresa, Modelo, ticker ou Notícia com tipo e ID canônico, respeita supressão e não inventa resultados; sem resultado preserva o texto e informa ausência (FR-37, AD-16).

**Given** resultado confirmado na interface,
**When** Andre o ativa por teclado/toque,
**Then** Empresa abre GLOBO/Terminal, Modelo abre MODELOS com destaque, ticker navega à Empresa/ativo em MERCADOS e Notícia abre o Leitor. Popover/campo recebem foco, Esc segue a prioridade e uma intenção vencida não troca o destino atual (FR-37, UX-DR27, UX-DR28, UX-DR39).

**Given** Camadas, base, aba e Empresa selecionada,
**When** a URL é produzida ou hidratada,
**Then** usa base=MAPA|SAT e o contrato/aliases Q11 da Story 4.1, saneia valores desconhecidos para opções válidas e aplica overrides só à sessão. Não contém conversa/Histórico/segredos e continua exigindo autenticação (FR-38, AD-10).

**Given** entidade eliminada, remapeada, oculta ou acesso negado,
**When** um endereço/resultado tenta reabri-la,
**Then** usa substituição canônica explícita ou informa indisponibilidade, sem selecionar outra entidade por acidente; nenhuma Notícia suprimida é reaberta (AD-3, AD-9).

### Story 7.2: Pesquisar com fontes, navegação tipada e orçamento separado

Como Andre, dono do painel,
Quero pesquisar o setor e navegar aos dados citados na resposta,
Para aprofundar a análise com fontes e efeitos verificáveis.

**Readiness:** blocked-integration; gates Q1/Q7/Q2 e acabamento Q3. Histórico navegável é uma extensão posterior; esta story cria apenas os registros mínimos de conversa/mensagem necessários ao chat, conforme política Q7 previamente definida.

**Acceptance Criteria:**

**Given** fornecedor, busca, teto e política Q1/Q7 aprovados,
**When** uma pergunta é admitida,
**Then** usa bucket de chat separado do automático e reserva máxima da Story 1.2; sem preço/teto verificável ou verba permanece indisponível. Calls pagas, retries e liquidação seguem o ledger comum (FR-35, AD-8).

**Given** consulta de Modelos, preços, benchmarks, Notícias, Relações, cotações ou web, inclusive contexto de Resumo do Agente emitido pela Story 6.3,
**When** o especialista responde,
**Then** cita apenas fontes realmente consultadas com links numerados e datas/revisão dos dados; conteúdo externo é dado não confiável, sem ferramentas de escrita, shell, segredos, aprovação ou publicação (FR-35, FR-36, AD-5, AD-12).

**Given** streaming start/delta/citation/navigation/error/done,
**When** eventos chegam ao cliente,
**Then** valida schemaVersion, conversationId/messageId/requestId e sequence crescente, descarta duplicatas e não executa eventos fora de sequência. Sem done a mensagem fica interrompida; retry humano cria novo messageId/reserva e não repete navegação silenciosamente (AD-16).

**Given** uma ação de navegação,
**When** o servidor e a interface a processam,
**Then** aceitam somente focusCompany, openNews, openModels com filtros/ordenação permitidos ou highlightLabs; verificam IDs na revisão consultada e na exibida, aplicam supressão e mostram erro compreensível para ID inválido. A ação aparece na conversa e reduz tela cheia para revelar o resultado (FR-35).

**Given** botão do Agente, atalho / ou resposta em andamento,
**When** Andre abre, amplia, completa ou fecha o console,
**Then** foco inicia na pergunta, clique fora não fecha, clique/Esc completa digitação antes de fechar e reduzir movimento apresenta texto imediatamente. Interface segue a família ativa e mensagens não autorizadas não ficam acessíveis (UX-DR2, UX-DR34, UX-DR41).

**Given** falha, resposta parcial ou limite atingido,
**When** o processamento termina,
**Then** mantém a pergunta/resposta parcial identificada e painel acessível, não fabrica citações ou ações e conserva os registros privados já existentes. Retomada/exclusão da lista de Histórico será acrescentada na Story 7.3, sem condicionar a conversa atual (FR-35).

### Story 7.3: Retomar e excluir o Histórico privado

Como Andre, dono do painel,
Quero reabrir e excluir minhas conversas,
Para retomar pesquisas e controlar seus registros.

**Readiness:** blocked-integration; gates Q7/Q2 e interface Q3. Consome os registros e contratos privados da Story 7.2.

**Acceptance Criteria:**

**Given** local de armazenamento, retenção e exclusão definidos em Q7,
**When** o Histórico é habilitado,
**Then** aplica a política aprovada a conversas/mensagens/citações e backups; a existência de uma fixture ou provider não decide prazo de retenção (FR-35, AD-12).

**Given** o dono autenticado,
**When** lista ou reabre uma conversa,
**Then** recupera perguntas/respostas e referências originais com suas datas, preserva estados interrompidos e não executa novamente ações antigas nem chama provider pago apenas ao abrir (FR-35).

**Given** solicitação autorizada de exclusão,
**When** ela é confirmada,
**Then** retira imediatamente o acesso à conversa e às mensagens e aplica a política de eliminação de armazenamento/backups Q7. Logs operacionais não guardam conteúdo, perguntas ou segredos (AD-9, AD-12).

**Given** usuário não autorizado, ID de outra identidade, comando inválido ou falha de persistência,
**When** a fronteira é chamada,
**Then** recusa acesso/escrita e mostra erro explícito sem expor conteúdo privado ou declarar exclusão concluída que não ocorreu (AD-9, AD-16).

**Given** teclado, toque ou modo visual distinto,
**When** Andre navega pelo Histórico,
**Then** mantém seleção, foco, fechamento e estados vazio/erro/retomado/excluído acessíveis, compartilhando o mesmo domínio entre famílias (UX-DR34, UX-DR41).

## Epic 8: Explorar cabos submarinos

Andre liga BACKBONES e consulta cabos e estações junto das Empresas e Relações, com origem, data, atribuição e limites de precisão visíveis.

### Story 8.1: Validar a fonte e explorar BACKBONES com contexto

Como Andre, dono do painel,
Quero ligar a sobreposição de cabos submarinos e consultar suas estações,
Para explorar a infraestrutura com evidência de origem e conexão.

**Readiness:** blocked-integration; gates Q4/Q3 e compositor do Epic 4. O antigo detalhe OSM da Story 8.2 foi realocado para a Story 4.3, mantendo FR-40.

**Acceptance Criteria:**

**Given** dataset candidato de cabos e estações,
**When** a integração é preparada,
**Then** exige origem, data/versão, licença e direito de uso/atualização comprovados em Q4; os assets do protótipo permanecem demonstrativos e sua quantidade não vira uma quota fixa (FR-39).

**Given** BACKBONES inicialmente desligada,
**When** Andre liga ou desliga o botão próprio,
**Then** adiciona/remove coleções pelo compositor compartilhado, conservando Empresas, Relações, seleção, filtros e câmera; cabos/estações usam IDs separados de CompanyId e não acrescentam uma sexta Camada do Cadastro (FR-39, AD-17).

**Given** cabo ou estação selecionável,
**When** Andre passa o mouse ou seleciona por teclado/toque,
**Then** mostra nome do cabo ou cidade/estação e cabos conectados somente quando confirmados na Fonte. Vínculo ausente aparece como indisponível; proximidade de Empresa não cria Relação comercial (FR-31, FR-39).

**Given** a sobreposição ativa,
**When** os recursos são exibidos,
**Then** mantém Cabos: TeleGeography e os créditos efetivos conforme origem aprovada, data e indicação de geometria de referência; não promete rota física precisa ou fibra terrestre. Créditos são legíveis no celular (FR-28, FR-39).

**Given** falha, desligamento ou carga de geração vencida,
**When** o estado da sobreposição muda,
**Then** conserva últimos dados válidos com data ou informa indisponibilidade sem impedir explorar Empresas; remove recursos/listeners e ignora callbacks antigos conforme o ciclo de vida do renderer (FR-39).
