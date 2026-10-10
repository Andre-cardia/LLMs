---
status: draft
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments:
  - prds/prd-LLMs-2026-10-07/prd.md
  - prds/prd-LLMs-2026-10-07/addendum.md
  - ux-designs/ux-LLMs-2026-10-09/DESIGN.md
  - ux-designs/ux-LLMs-2026-10-09/EXPERIENCE.md
  - ux-designs/ux-LLMs-2026-10-09/.memlog.md
  - architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - architecture/architecture-LLMs-2026-10-10/contracts.md
executionAuthorization: continuação local delegada em 2026-10-10
productionAuthorized: false
---

# LLMs — épicos e stories

## Overview

PRD final, UX concluída declarada por Andre e arquitetura final documental são os inputs. A ordem e decomposição são escolhas reversíveis dentro da continuação local autorizada; nenhum novo aceite de serviços/UX é presumido. Menus de confirmação repetida são dispensados pela instrução expressa de continuar o trabalho local já autorizado. Gates de integração permanecem registrados, sem cortar requisitos.

## Requirements Inventory

### Functional Requirements

#### FR-1: Exibir Empresas no Globo

O usuário vê um Ponto por Empresa do Cadastro, posicionado pelas coordenadas da sede.
**Consequências:**

- Toda Empresa do Cadastro com coordenadas válidas tem exatamente um Ponto.
- O Globo é uma Terra reconhecível, com oceanos, continentes e relevo; a textura segue a família de tema e a Vista.
- Os Pontos são pequenos e têm a cor da Camada principal. As cinco cores de Camada são distinguíveis entre si e se destacam sobre a textura da Terra nos seis temas.
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
- Clicar no Globo ou numa área vazia fecha o Terminal; arrastar para girar nunca fecha. Interagir com barras de ações, Legenda, popovers, seletor de Vistas, Faixa de cotações, Fluxo, Leitor, Agente, Fila ou MERCADOS mantém o Terminal aberto.
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

#### FR-27: Seis temas

O usuário escolhe OSIRIS fiel, Fósforo âmbar ou Sala de controle noturna, cada uma com modo claro e escuro.
**Consequências:**

- Na primeira visita, a família é OSIRIS fiel e o modo segue o sistema operacional. A escolha manual fica salva.
- O controle claro/escuro alterna o modo dentro da família atual; o seletor de família oferece as três famílias.
- As cinco cores de Camada e o conteúdo continuam distinguíveis nos seis temas. Terminal, Leitor, Agente, Fila e MERCADOS ficam escuros nas famílias OSIRIS fiel e Fósforo âmbar, inclusive no modo claro.

#### FR-28: Atribuição de Fontes

Cada dado e sobreposição mantém atribuição acessível com link; o crédito ao Artificial Analysis é obrigatório. BACKBONES mostra "Cabos: TeleGeography" quando ligada, e o Detalhe OpenStreetMap mostra "© OpenStreetMap contributors" e o crédito do provedor de mapa exigido por sua licença. A posição desses créditos segue a UX, sem acrescentar um rodapé institucional.

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

#### FR-32: Vistas e navegação

O usuário explora Vistas distintas e controla o Globo por mouse, trackpad, toque e teclado.
**Consequências:**

- O seletor oferece 3D (Globo diurno), 2D (mapa plano), MAPA (Globo noturno) e SAT (satélite com relevo acentuado). Na Sala de controle noturna escura, 3D é noturna e MAPA é diurna. Uma Vista indisponível não aparece como selecionável.
- A Vista 2D mantém os mesmos Pontos, Relações e ações do Terminal.
- Há controles visíveis de zoom e rotação. Pinça sobre o Globo ou seus Pontos controla o zoom do Globo; o zoom de página por teclado permanece disponível.
- Rótulos discretos de países, cidades e polos de IA respeitam a prioridade dos rótulos de Laboratórios. A leitura de cursor mostra coordenadas, lugar, zoom e escala.
- O terminador dia/noite acompanha o horário na Vista 3D. Reduzir movimento elimina rotação automática e transições animadas; não impede atualizar os dados de iluminação.
- A ajuda `?` apresenta os atalhos: `1/2/3` para GLOBO/MODELOS/NOTÍCIAS, `/` para o Agente, `Esc` para sair da janela ativa, `F` para tela cheia, `R` para vista inicial, setas para girar e `+/-` para zoom. Atalhos não interceptam digitação em campos de texto.

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
- Status, atraso, falhas e acesso seguem FR-19, FR-25 e FR-30. MERCADOS amplia o contexto da IA sem cadastrar todas as empresas de uma bolsa.

#### FR-37: Busca global

Uma busca única encontra Empresa, Modelo, ticker ou Notícia.
**Consequências:**

- Resultados identificam o tipo. Confirmar uma Empresa abre Globo e Terminal; Modelo abre MODELOS com a linha destacada; ticker leva à Empresa ou ao ativo em MERCADOS; Notícia abre o Leitor.
- Ausência de resultado mantém a consulta e informa que nada foi encontrado; não inventa Empresa ou ativo.

#### FR-38: Estado na URL

O usuário salva um endereço que restaura seu contexto de exploração.
**Consequências:**

- A URL representa Camadas ligadas, Vista, aba principal e Empresa selecionada. Ao abri-la, o estado vale para a sessão sem sobrescrever preferências salvas.
- Valores desconhecidos usam uma opção válida; a URL não contém segredos, texto de conversas ou Histórico e continua exigindo acesso do dono.

#### FR-39: BACKBONES

O usuário liga uma sobreposição de cabos submarinos e estações de pouso.
**Consequências:**

- BACKBONES tem botão próprio e começa desligada. Ligar mostra cabos e estações; desligar remove a sobreposição e mantém os Pontos de Empresas.
- Selecionar ou passar o mouse num cabo mostra seu nome. Selecionar uma estação mostra cidade e cabos conectados conforme a Fonte; sem confirmação, o vínculo fica indicado como indisponível.
- "Cabos: TeleGeography" fica visível enquanto a sobreposição estiver ligada. O snapshot do protótipo não determina quantidade fixa de cabos nem garante disponibilidade ou licença da Fonte; proveniência e direito de uso/atualização precisam ser comprovados antes da publicação dessa função (§11; addendum §F).
- Falha da Fonte mantém os últimos dados válidos com sua data ou informa indisponibilidade, sem impedir explorar Empresas. A geometria é uma referência do mapa, sem promessa de rota física precisa.
- Fibra terrestre fica fora da v1; BACKBONES não altera as cinco Camadas do Cadastro.

#### FR-40: Detalhe OpenStreetMap no zoom

Ao aproximar, a textura dá lugar ao mapa de cidades, rodovias e ruas; ao afastar, volta ao satélite do tema.
**Consequências:**

- A troca ocorre num limiar consistente e não oscila continuamente perto dele. Limiar e combinação com cada Vista/tema são definidos antes das stories do mapa (§11).
- Pontos, Relações e seleção de Empresas permanecem utilizáveis na troca. "© OpenStreetMap contributors" e créditos do provedor ficam visíveis enquanto o mapa aparece.
- Tiles são carregados para a visualização interativa, com cache conforme a política do provedor, sem pré-download ou modo offline.
- Falha de tiles permite continuar explorando a textura de satélite e informa indisponibilidade; não deixa o Globo em branco. A escolha de provedor e de estilo escuro fica com a arquitetura.

### NonFunctional Requirements

- **Desempenho:** a primeira tela útil (Globo com Pontos) aparece em até cerca de 3 s numa conexão doméstica comum. O Globo gira de forma fluida (cerca de 60 fps) num notebook recente com ~200 Pontos, e de forma utilizável (pelo menos cerca de 30 fps) num celular intermediário recente.
- **Confiabilidade:** a interface nunca fica em branco por falha de uma Fonte. Em caso de falha, mostra os últimos dados conhecidos com o horário.
- **Segurança:** chaves de API ficam no servidor ou na Atualização. Notícias e páginas da web entram como dados não confiáveis (FR-17, FR-35); toda ação de escrita valida a autorização do dono. Cadastro, Relações e Histórico não podem ficar acessíveis por caminhos públicos alternativos.
- **Acessibilidade:** todas as funções operam por teclado ou toque, conforme o dispositivo; a navegação por teclado é completa. Abrir Terminal/Leitor leva o foco para a janela; fechar devolve à origem. `Esc` age sobre a janela ativa mais acima e completa a digitação antes de fechá-la. Reduzir movimento elimina pulso animado, digitação, rotação automática e animações de entrada. Texto atende contraste WCAG AA nos seis temas, inclusive sobre texturas e painéis; pontos, rótulos e atalhos têm alternativa acessível, e sinais de estado não dependem só de cor. A UX define a navegação entre muitos Pontos antes das stories do Globo.
- **Portabilidade:** a interface consulta snapshots publicados para dados de leitura. Fila, chat e Histórico têm contratos autenticados independentes da hospedagem; trocar de provedor preserva esses contratos e a lógica de Atualização. A v1 já inclui interações que exigem escrita e execução no servidor.

### Additional Requirements

- AD-1 a AD-16 da spine são normativos: proprietário de contratos/domínio, identidades opacas, ausências, snapshots/CAS/fencing, curação staged/DESFAZER, autoridade limitada de Agentes, orçamento UTC e reducer único. Os formatos são definidos somente em `src/contracts/`.
- Seed Vite vanilla-ts/Cloudflare é proposta gated por Q2; não criar infraestrutura, secrets, migrations ou jobs remotos nesta delegação. A base ESM atual continua executável sem instalar dependências.
- SourceRefs e fatos precedem publicação; seed de 35 Empresas requer revisão e pelo menos quatro janelas semanais de quota. Exemplos fictícios não são essa curadoria.
- A atomicidade local só prova o contrato do adaptador em memória; repositório durável, autorização real, recuperação e concorrência entre processos precisam provas em Q2.

### UX Design Requirements

- UX-DR1: Conservar todos os tokens de cores/typo/spacing/rounded de DESIGN.md; fonte vanilla, HUD mono, seis temas, painéis sempre escuros em OSIRIS/âmbar; medir AA em texturas/brilho e resolver cores de Camada como texto conforme Q3.
- UX-DR2: Preservar comportamentos de EXPERIENCE.md (foco, Esc, clique vs drag, toque sem hover, reduzir movimento, preferências e override de URL); não escolher novos controles móveis ou limiares de Vista/tiles sob Q3/Q6.
- UX-DR3: Implementar o componente `globo` com anatomia/tokens `{ fundo: '{colors.osiris-escuro-globe}', atmosfera: '{colors.osiris-escuro-atm}', z: '0' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
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
- UX-DR29: Implementar o componente `seletor-de-vistas` com anatomia/tokens `{ tipografia: '{typography.hud}', selecionada: '{colors.osiris-escuro-acc}', raio: '{rounded.lg}' }` e comportamento do componente homônimo em EXPERIENCE.md; questões explicitamente abertas continuam gated.
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

### FR Coverage Map

- FR-24: Epic 1 — Consultar dados coerentes e entender falhas
- FR-25: Epic 1 — Consultar dados coerentes e entender falhas
- FR-30: Epic 1 — Consultar dados coerentes e entender falhas
- FR-20: Epic 2 — Curar Empresas e Relações com revisão humana
- FR-21: Epic 2 — Curar Empresas e Relações com revisão humana
- FR-22: Epic 2 — Curar Empresas e Relações com revisão humana
- FR-23: Epic 2 — Curar Empresas e Relações com revisão humana
- FR-31: Epic 2 — Curar Empresas e Relações com revisão humana
- FR-9: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-10: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-11: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-12: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-13: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-26: Epic 3 — Comparar Modelos e acompanhar Lançamentos
- FR-1: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-2: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-3: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-4: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-5: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-6: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-7: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-8: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-27: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-29: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-32: Epic 4 — Explorar o ecossistema no Globo e Terminal
- FR-14: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-15: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-16: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-17: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-28: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-33: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-34: Epic 5 — Ler Notícias relevantes sem perder contexto
- FR-18: Epic 6 — Consultar o contexto de MERCADOS
- FR-19: Epic 6 — Consultar o contexto de MERCADOS
- FR-36: Epic 6 — Consultar o contexto de MERCADOS
- FR-35: Epic 7 — Encontrar dados e retomar pesquisa
- FR-37: Epic 7 — Encontrar dados e retomar pesquisa
- FR-38: Epic 7 — Encontrar dados e retomar pesquisa
- FR-39: Epic 8 — Explorar cabos e detalhe geográfico
- FR-40: Epic 8 — Explorar cabos e detalhe geográfico

## Epic List

### Epic 1: Consultar dados coerentes e entender falhas

Atualizações preservam últimos dados válidos, revisões completas e acesso privado; erros não deixam a interface em branco.

**FRs:** FR-24, FR-25, FR-30

### Epic 2: Curar Empresas e Relações com revisão humana

Andre vê evidência, aprova/edita/rejeita e controla a publicação do Cadastro e Relações.

**FRs:** FR-20, FR-21, FR-22, FR-23, FR-31

### Epic 3: Comparar Modelos e acompanhar Lançamentos

Andre compara famílias/variantes e custos com origem e percebe novos Lançamentos sem duplicatas.

**FRs:** FR-9, FR-10, FR-11, FR-12, FR-13, FR-26

### Epic 4: Explorar o ecossistema no Globo e Terminal

Andre navega Empresas, filtros e Vistas com teclado/toque, Terminal retrô e temas coerentes.

**FRs:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-27, FR-29, FR-32

### Epic 5: Ler Notícias relevantes sem perder contexto

Andre usa um conjunto comum de Notícias com Leitor, relevância, supressão persistente e fontes.

**FRs:** FR-14, FR-15, FR-16, FR-17, FR-28, FR-33, FR-34

### Epic 6: Consultar o contexto de MERCADOS

Andre vê índices/ações/macroeconomia com unidades, horários, atrasos e favoritos corretos.

**FRs:** FR-18, FR-19, FR-36

### Epic 7: Encontrar dados e retomar pesquisa

Andre busca por entidade, restaura a exploração pela URL e pesquisa com fontes no chat privado.

**FRs:** FR-35, FR-37, FR-38

### Epic 8: Explorar cabos e detalhe geográfico

Andre liga BACKBONES e detalhe OSM sem perder Empresas, com proveniência/licença e fallback.

**FRs:** FR-39, FR-40


A ordem não obriga habilitar infraestrutura antes de provas locais. A base local de um épico pode ser validada isoladamente; a conclusão do épico exige sua interface/integração e gates. Stories dentro de cada épico são ordenadas sem depender de stories futuras. Núcleos compartilhados têm autor único (AD-16), preservando a separação por valor ao usuário.

## Epic 1: Consultar dados coerentes e entender falhas

Atualizações preservam últimos dados válidos, revisões completas e acesso privado; erros não deixam a interface em branco.

### Story 1.1: Preservar uma revisão completa em Atualizações locais

As a Andre, dono do painel,
I want preservar uma revisão completa em Atualizações locais,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-24, FR-25

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de preservar uma revisão completa em atualizações locais,
**Then** coleção full vazia ou <50% é rejeitada; exatamente50% e incremental vazio passam; fonte falha não altera último dado/horário; leitor mantém última revisão completa; CAS/fencing perdido não publica.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 1.2: Controlar orçamento e tentativas em simulação

As a Andre, dono do painel,
I want controlar orçamento e tentativas em simulação,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-24, FR-25

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de controlar orçamento e tentativas em simulação,
**Then** ledger UTC em microUSD separa automação/chat, reserva atômica e mês imutável; gasto+reservado governa 80%/100%; retry não reutiliza reserva; chamada desconhecida conserva reserva; teto zero bloqueia cobrança.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 1.3: Servir assets/dados privados e autenticar comandos

As a Andre, dono do painel,
I want servir assets/dados privados e autenticar comandos,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-30

**Readiness:** blocked-integration; gate: `Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de servir assets/dados privados e autenticar comandos,
**Then** ausência/forja/expiração/issuer/audience incorretos negam assets, APIs, origem, preview e snapshots; autorização do dono e CSRF são verificadas antes da escrita.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 1.4: Agendar e recuperar Atualizações no repositório durável

As a Andre, dono do painel,
I want agendar e recuperar Atualizações no repositório durável,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-24, FR-25

**Readiness:** blocked-integration; gate: `Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de agendar e recuperar atualizações no repositório durável,
**Then** lease por slice, três tentativas/backoff, CAS+curadoria em transação, recuperação e logs sem segredos passam em concorrência entre processos; SM-2/3 só após sete dias reais.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 2: Curar Empresas e Relações com revisão humana

Andre vê evidência, aprova/edita/rejeita e controla a publicação do Cadastro e Relações.

### Story 2.1: Revisar Empresas/Relações sem publicar antes da Atualização

As a Andre, dono do painel,
I want revisar Empresas/Relações sem publicar antes da Atualização,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-23, FR-31, FR-22

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de revisar empresas/relações sem publicar antes da atualização,
**Then** agente só insere propostas; dono aprova/edita/rejeita com versão/idempotência; undo pré-publicação volta pending; decisões disjuntas publicam juntas, conflito de alvo fica staged; quota global10 Empresas novas/semana e replay/rejeição não liberam consumo.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 2.2: Conferir seed e logos antes da primeira publicação

As a Andre, dono do painel,
I want conferir seed e logos antes da primeira publicação,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-20, FR-21

**Readiness:** blocked-integration; gate: `curadoria/Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `curadoria/Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de conferir seed e logos antes da primeira publicação,
**Then** 35 entradas obrigatórias conferidas por origem, contatos, coordenadas, Camadas/Etiquetas, ticker/bolsa/vínculos; logos oficiais locais e monograma; descoberta exige≥4 semanas de quota.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 2.3: Operar a Fila com prévias e resolução de pares/logos

As a Andre, dono do painel,
I want operar a Fila com prévias e resolução de pares/logos,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-23, FR-31

**Readiness:** blocked-integration; gate: `Q2/Q3`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q2/Q3` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de operar a fila com prévias e resolução de pares/logos,
**Then** cartões/evidência/edição/fantasmas e contador seguem UX; merge/split/aliases de Modelo têm decisão humana; prévias não publicam; Fila limpa fantasmas e é exclusiva com MERCADOS/Leitor lateral.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 2.4: Desfazer dados já publicados com compensação auditável

As a Andre, dono do painel,
I want desfazer dados já publicados com compensação auditável,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-23

**Readiness:** blocked-integration; gate: `Q2/aceite AD-4`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q2/aceite AD-4` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de desfazer dados já publicados com compensação auditável,
**Then** revisão e decisão antigas permanecem; compensação exige confirmação humana e só muda próxima publicação; conflitos e referências são revalidados.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 3: Comparar Modelos e acompanhar Lançamentos

Andre compara famílias/variantes e custos com origem e percebe novos Lançamentos sem duplicatas.

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

### Story 3.5: Apresentar HÍBRIDO/TERMINAL/ANALÍTICO e linha expandida

As a Andre, dono do painel,
I want apresentar HÍBRIDO/TERMINAL/ANALÍTICO e linha expandida,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-9, FR-10, FR-11, FR-12

**Readiness:** blocked-integration; gate: `Q3/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de apresentar híbrido/terminal/analítico e linha expandida,
**Then** estilo HÍBRIDO padrão/salvo, mesma consulta entre estilos, ícones ⓘ fórmula/raciocínio/latência, benchmarks e atribuição, colunas móveis/teclado/foco conforme UX.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 4: Explorar o ecossistema no Globo e Terminal

Andre navega Empresas, filtros e Vistas com teclado/toque, Terminal retrô e temas coerentes.

### Story 4.1: Manter estado semântico e preferências coerentes

As a Andre, dono do painel,
I want manter estado semântico e preferências coerentes,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-2, FR-5, FR-6, FR-7, FR-8, FR-27, FR-32

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de manter estado semântico e preferências coerentes,
**Then** reducer único mantém defaults e overrides distintos; UI explícita salva só preferência editada; IDs removidos/remapeados reconciliam em uma transição; callback antigo é descartado; aba MODELOS/NOTÍCIAS fecha Terminal; painéis laterais exclusivos.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 4.2: Mostrar Empresas/identidades/último Pulso nas Vistas

As a Andre, dono do painel,
I want mostrar Empresas/identidades/último Pulso nas Vistas,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-1, FR-2, FR-3, FR-4, FR-32

**Readiness:** blocked-integration; gate: `Q3/renderer`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/renderer` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de mostrar empresas/identidades/último pulso nas vistas,
**Then** um Ponto por Empresa, isLab independente da Camada principal, filtros incluem Etiquetas/contagens principais, espalhamento16px/17px preserva coordenada real, Pulso sete dias/estático se reduzir movimento, logos/monograma e rótulos prioritários.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 4.3: Interagir com Terminal e som pelo teclado/toque

As a Andre, dono do painel,
I want interagir com Terminal e som pelo teclado/toque,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-5, FR-6, FR-7, FR-8

**Readiness:** blocked-integration; gate: `Q3/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de interagir com terminal e som pelo teclado/toque,
**Then** Prévia300ms mouse apenas, Terminal≤2s, Esc completa antes de fechar, drag>5px não fecha, links/relações/notícias/contexto; áudio WebAudio inicia somente gesto, canais/volumes independentes e OFF padrão.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 4.4: Aplicar os seis temas e acesso completo no celular

As a Andre, dono do painel,
I want aplicar os seis temas e acesso completo no celular,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-27, FR-29

**Readiness:** blocked-integration; gate: `Q3/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de aplicar os seis temas e acesso completo no celular,
**Then** tokens YAML AA atuais, OSIRIS/âmbar painéis sempre escuros, modo inicial do sistema, foco/readers e reduzir movimento; todas as funções alcançáveis no celular; medir AA sobre texturas e ~3s/60fps/30fps com ~200 Empresas.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 5: Ler Notícias relevantes sem perder contexto

Andre usa um conjunto comum de Notícias com Leitor, relevância, supressão persistente e fontes.

### Story 5.1: Projetar e ocultar Notícias nas cinco superfícies

As a Andre, dono do painel,
I want projetar e ocultar Notícias nas cinco superfícies,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-14, FR-15, FR-33, FR-34

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de projetar e ocultar notícias nas cinco superfícies,
**Then** dedup por URLs/aliases verificados conserva NewsId e supressão; relevância difere de citação; até5 por Empresa/2semanas, Fluxo14 e LABS3; cancelamento não escreve, confirmação oculta imediatamente também no Leitor/navegação.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 5.2: Validar resumo/relevância sem dar ferramentas ao Agente

As a Andre, dono do painel,
I want validar resumo/relevância sem dar ferramentas ao Agente,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-15, FR-16, FR-17

**Readiness:** blocked-integration; gate: `Q1/Q7/fontes`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q1/Q7/fontes` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de validar resumo/relevância sem dar ferramentas ao agente,
**Then** schema estrito bloqueia campos/ferramentas/IDs/links inventados; fontes consultadas sustentam citações; testes fixos dos seis homônimos e amostra humana50≥90%; falha/budget conserva título/veículo/data/link; tamanho editorial confirmado.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 5.3: Operar Fluxo/LABS/NOTÍCIAS e Leitor com contexto

As a Andre, dono do painel,
I want operar Fluxo/LABS/NOTÍCIAS e Leitor com contexto,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-33, FR-34

**Readiness:** blocked-integration; gate: `Q3/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de operar fluxo/labs/notícias e leitor com contexto,
**Then** Fluxo inicial/filtro/aba salvos e contagens coerentes; LABS por região, abertura mesma Notícia e citado apenas navega; LATERAL default, NOTÍCIAS força lateral sem sobrescrever preferências, foco/teclado/Esc e exclusividade preservados.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 5.4: Manter atribuição em todas as projeções

As a Andre, dono do painel,
I want manter atribuição em todas as projeções,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-28, FR-16

**Readiness:** blocked-integration; gate: `fontes/licenças/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `fontes/licenças/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de manter atribuição em todas as projeções,
**Then** cada valor/fonte tem URL e datas; AA obrigatório, resumos identificados IA, título original/link sempre presentes; geografia exibe crédito condicionado à sobreposição/licença, sem rodapé institucional novo.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 6: Consultar o contexto de MERCADOS

Andre vê índices/ações/macroeconomia com unidades, horários, atrasos e favoritos corretos.

### Story 6.1: Confirmar instrumentos/cobertura/calendários e fallback

As a Andre, dono do painel,
I want confirmar instrumentos/cobertura/calendários e fallback,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-18, FR-19, FR-36

**Readiness:** blocked-integration; gate: `Q5`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q5` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de confirmar instrumentos/cobertura/calendários e fallback,
**Then** matriz por ativo define símbolo/currency/unidade/listagem/calendar/timezone/horários/histórico1M/fonte principal e reserva; não presume reserva mundial ou cadência macro/cripto.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 6.2: Atualizar cotações com atrasos e sessões corretos

As a Andre, dono do painel,
I want atualizar cotações com atrasos e sessões corretos,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-18, FR-19

**Readiness:** blocked-integration; gate: `Q5/Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q5/Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de atualizar cotações com atrasos e sessões corretos,
**Then** 15min em pregão+pós-close, origem e coleta distintas, weekend/feriado seguem nextDueAt/calendário; fallback conserva falha principal e último válido, ausentes não viram0.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 6.3: Explorar Faixa e Painel MERCADOS

As a Andre, dono do painel,
I want explorar Faixa e Painel MERCADOS,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-18, FR-19, FR-36

**Readiness:** blocked-integration; gate: `Q3/Q5/browser`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q3/Q5/browser` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de explorar faixa e painel mercados,
**Then** 4 índices Faixa base, ações foraEUA/listagemprincipal, pausa/reduzir movimento, ação→Empresa, cartões10macro/índices, amplitude sem ausentes, topo fixo, regiões/pregão, WATCH/favoritos e busca; resumo usa chat separado.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 7: Encontrar dados e retomar pesquisa

Andre busca por entidade, restaura a exploração pela URL e pesquisa com fontes no chat privado.

### Story 7.1: Buscar entidades locais e restaurar contexto da URL

As a Andre, dono do painel,
I want buscar entidades locais e restaurar contexto da URL,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-37, FR-38

**Readiness:** ready-local; gate: `local`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e fixtures sintéticas sem serviço externo,
**When** Andre ou a Atualização executa o fluxo de buscar entidades locais e restaurar contexto da url,
**Then** busca identifica Empresa/Modelo/ticker/Notícia, respeita supressão e não inventa resultados; URL só Camadas/Vista/aba/Empresa, saneia inválidos, aplica sessão sem persistir prefs ou expor conversas/segredos.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 7.2: Pesquisar com ações/citações versionadas e orçamento

As a Andre, dono do painel,
I want pesquisar com ações/citações versionadas e orçamento,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-35

**Readiness:** blocked-integration; gate: `Q1/Q7/Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q1/Q7/Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de pesquisar com ações/citações versionadas e orçamento,
**Then** chat read-only/whitelist, conteúdo externo dados, fontes reais numeradas+datas, eventos sequenciais e IDs validados nas duas revisões, ações visíveis reduzem tela cheia, falha/budget explícitos.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 7.3: Retomar e excluir Histórico privado

As a Andre, dono do painel,
I want retomar e excluir Histórico privado,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-35

**Readiness:** blocked-integration; gate: `Q7/Q2`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q7/Q2` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de retomar e excluir histórico privado,
**Then** retencão/local/exclusão/backups definidos antes de habilitar; somente dono acessa; apagar retira acesso imediato; nenhum conteúdo em logs operacionais.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Epic 8: Explorar cabos e detalhe geográfico

Andre liga BACKBONES e detalhe OSM sem perder Empresas, com proveniência/licença e fallback.

### Story 8.1: Validar fonte/licença e explorar BACKBONES

As a Andre, dono do painel,
I want validar fonte/licença e explorar BACKBONES,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-39

**Readiness:** blocked-integration; gate: `Q4/Q3`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q4/Q3` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de validar fonte/licença e explorar backbones,
**Then** origem/data/versão/licença/uso/atualização provados, cabo/estação namespace separado, vínculo só confirmado, começaOFF, labels/crédito duranteexibição, falha last-good sem impedir Empresas.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

### Story 8.2: Trocar satélite/OSM com cache e fallback

As a Andre, dono do painel,
I want trocar satélite/OSM com cache e fallback,
So that os dados e a exploração seguem os requisitos aprovados sem perder controle e contexto.

**FRs:** FR-40

**Readiness:** blocked-integration; gate: `Q6/Q3`. Dependências: contrato partilhado AD-16 e stories anteriores relevantes; nenhuma depende de story futura no próprio épico.

**Acceptance Criteria:**

**Given** os inputs/contratos da fronteira e o gate `Q6/Q3` fechado por seu responsável,
**When** Andre ou a Atualização executa o fluxo de trocar satélite/osm com cache e fallback,
**Then** provider/licença/estilo/limiar por Vista definidos; histerese não oscila, cache/viewport semprefetchoffline, créditos visíveis, falha volta satélite sem perder seleção/Pontos/Relações.
**And** falhas preservam dados/contexto e o resultado não autoriza implantação ou serviços pagos.

**Given** formato inválido, ID ausente, revisão/callback vencido ou acesso não autorizado quando aplicável,
**When** o comando ou leitura atravessa a fronteira,
**Then** erro/indisponibilidade explícitos substituem inferências silenciosas e os dados anteriores permanecem íntegros.

**UX:** todos os critérios do componente correspondente em UX-DR1 a UX-DR40 e EXPERIENCE.md/ DESIGN.md são herdados; a story local implementa apenas regras sem representação visual. A story de interface exige os componentes/tokens específicos do inventário e prova em browser, incluindo todos os estados/foco/responsividade/acessibilidade.

## Validação e limite desta delegação

- Cobertura:40/40 FR,5 NFR e40 UX-DR referenciados nas stories;29 stories em8 épicos.
- Starter: é proposta, não seleção vinculante; manter scaffold ESM existente e reservar Vite/host/lockfile à integração Q2, sem clonar/instalar provider agora.
- Não criar banco/tabelas neste plano; adaptadores em memória só acrescentam entidades necessárias a cada fronteira. Compartilhar schemas não torna épicos técnicos.
- `draft` é mantido:20 stories dependem de gates reais/UX/fontes/browser, inclusive a integração visual da story3.1. A estrutura não é aprovação desses pontos. Oito fundações locais têm regras definidas e podem avançar; o estado `done-local` não significa FR/épico completo.
- Gates antes de produção: Q2(host/IdP/custo/prova durável),Q1/Q7(provider/budget/retencão/tamanho editorial),Q3(acabamento/controles/AA),Q4/Q6(licença/custo/tiles/Vistas),Q5(cobertura/calendários). Inferências AD-4/7 aguardam aceite antes da integração real; testes em fixtures mostram o comportamento proposto.
