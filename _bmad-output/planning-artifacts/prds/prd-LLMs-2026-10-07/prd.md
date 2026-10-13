---
title: PRD — Íris Global
status: final
created: 2026-10-07
updated: 2026-10-12
---

# PRD: Íris Global
*Monitor Global de IA, infraestrutura e mercados.*

O nome aprovado para o produto é **Íris Global**. O posicionamento e as hipóteses de crescimento para uma eventual versão pública estão registrados em [Posicionamento e crescimento — Íris Global](../../brand-positioning-iris-global.md); esse material não altera o escopo pessoal da v1 definido neste PRD.

Os requisitos estão consolidados para definir a arquitetura. Antes das stories das funções afetadas, fechar custos e serviços do chat, cobertura de MERCADOS, fontes geográficas e questões de UX; responsáveis e momentos de revisão estão em §11.

## 0. Propósito do Documento

Este PRD define a primeira versão do Monitor Global de Labs de LLM para Andre, dono e único usuário. Parte da sessão Forge Idea e incorpora as decisões registradas na UX de 09/10/2026. Serve à arquitetura, aos épicos e às stories. O vocabulário segue o Glossário (§3); os requisitos FR-1 a FR-30 mantêm seus IDs, e o novo escopo ocupa FR-31 a FR-40. Inferências aparecem como `[ASSUMPTION]`, indexadas em §12. Escolhas técnicas e evidência de fontes ficam no [addendum](addendum.md). Os documentos de UX e o protótipo são referências de experiência; suas simulações não comprovam integrações reais.

## 1. Visão

Um painel web pessoal, com linguagem de central de operações inspirada no OSIRIS, que mostra onde estão os Laboratórios que treinam LLMs e o ecossistema que os sustenta: chips, nuvem e data centers, energia e software de IA. O Globo é o protagonista, e os Laboratórios têm prioridade visual. Cada Empresa é um Ponto com a cor da sua Camada principal; um Lançamento recente faz o Ponto pulsar por sete dias. O Globo permanece tridimensional e alterna entre a base cartográfica escura MAPA e a base de satélite SAT; terreno, edifícios e detalhe fotorealístico aprofundam a exploração quando disponíveis. Relações entre Empresas, cabos submarinos e detalhe de ruas ajudam a explorar a infraestrutura.

O Terminal retrô mostra os dados da Empresa, Modelos, Relações, cotação e Notícias. A Tabela de modelos fica na aba MODELOS; Notícias aparecem também no Fluxo de notícias, na aba LABS e na aba NOTÍCIAS, com um Leitor em português. A Faixa de cotações fica na base, e o Painel MERCADOS reúne ações de IA, índices e indicadores macroeconômicos. O Agente especialista em LLMs ajuda a pesquisar, comparar Modelos e navegar pelo painel, com fontes citadas e Histórico.

O valor está em reunir dados e pesquisa sobre LLMs num lugar que Andre possa consultar várias vezes ao dia. Dados estruturados se atualizam automaticamente, Notícias passam por filtro e tradução, e mudanças curadas no Cadastro e nas Relações exigem revisão humana. O contexto financeiro e a infraestrutura apoiam a leitura do setor de IA.

## 2. Usuário-alvo

### 2.1 Jobs To Be Done

- **Funcional:** saber, em menos de um minuto, o que mudou no mundo dos LLMs desde a última visita: Lançamentos, Notícias e movimento das ações.
- **Funcional:** comparar Modelos por custo, inteligência e capacidade para escolher qual usar num projeto.
- **Funcional:** pesquisar IA com um Agente especialista em LLMs que usa os dados do painel, consulta a web com fontes e leva à Empresa, ao Modelo ou à Notícia relevante.
- **Contextual:** ler as Notícias do setor em português, sem garimpar veículos em vários idiomas.
- **Emocional:** ter um "centro de comando" próprio, bonito e com personalidade (o Terminal retrô), que dê prazer em abrir.

### 2.2 Não-usuários (v1)

- Público geral e visitantes anônimos: o acesso é restrito ao dono (ver FR-30).
- Investidores que precisam de cotações em tempo real ou de análise financeira profunda.

### 2.3 Jornadas principais

- **UJ-1. Andre confere a manhã do setor de IA.** Às 8h, Andre abre o painel no MacBook Pro. Na Faixa de cotações da base, confere o SOX e a NVIDIA. No Globo, o rótulo de Alibaba indica um Lançamento recente; ele abre o Terminal e lê as Notícias em português. Uma manchete abre o Leitor com resumo estendido, pontos-chave e link original. Em menos de um minuto, identifica o que mudou. **Caso de borda:** se a Atualização falhou, o STATUS informa o atraso e mantém acessível o horário da última Atualização válida.
- **UJ-2. Andre escolhe um Modelo barato para um projeto.** Andre abre a aba MODELOS, filtra por entrada "imagem" e ordena por Custo estimado por tarefa. Confere a fórmula no ⓘ e compara três candidatos por inteligência, custo e contexto. Pode pedir ao Agente especialista em LLMs uma comparação baseada nesses dados. **Caso de borda:** Modelos de raciocínio mostram "≈" e o aviso sobre tokens de raciocínio; dados ausentes aparecem como "—".
- **UJ-3. Andre aprova um Laboratório novo.** O Agente de descoberta detectou um Laboratório que publicou pesos abertos próprios e ainda não está no Cadastro. Andre abre a Fila de revisão, vê a proposta (nome, cidade, coordenadas, site, contato, logo candidata e o link de origem de cada dado), corrige a cidade e aprova. Na Atualização seguinte, o Ponto aparece no Globo. **Caso de borda:** se ele rejeitar, a Empresa não é proposta de novo até surgir um fato novo, como outro Modelo publicado.

## 3. Glossário

- **Empresa** — Qualquer organização exibida no produto. Toda Empresa tem exatamente uma Camada principal e zero ou mais Etiquetas.
- **Laboratório** — Empresa que treina o próprio modelo base de LLM, de fronteira ou de pesos abertos, privada ou listada em bolsa. Quem só hospeda ou revende modelos de terceiros não conta. Critério de entrada: ter modelo no Artificial Analysis ou no OpenRouter, ou ter um modelo base próprio de pesos abertos com pelo menos 10 mil downloads nos últimos 30 dias no Hugging Face.
- **Camada** — Grupo do ecossistema de IA. São cinco: **Laboratórios**, **Chips**, **Nuvem** (inclui data centers), **Energia** e **Software** (software e IA aplicada).
- **Camada principal** — A Camada que define a cor do Ponto de uma Empresa.
- **Etiqueta** — Camada secundária de uma Empresa. Não muda a cor do Ponto, mas faz a Empresa aparecer quando o Filtro dessa Camada está ativo.
- **Cadastro** — Conjunto curado das Empresas e dos seus dados estáticos: nome, cidade, coordenadas, site, contato, logo, Camada principal, Etiquetas e ticker. Só muda por aprovação na Fila de revisão ou por edição manual.
- **Modelo** — Versão de LLM publicada pelo próprio Laboratório (por exemplo, "Claude Opus 5.5" ou "Qwen 4"). Variantes do mesmo Lançamento (níveis de esforço como "High" e "Max", ou tamanhos como "Mini" lançados juntos) ficam agrupadas como variantes de um único Modelo. Quantizações, ajustes de terceiros e cópias hospedadas por provedores não são Modelos. Cada Modelo é identificado de forma única mesmo que cada Fonte use um identificador diferente.
- **Lançamento** — Evento em que um Laboratório publica um Modelo novo. Ordem de precedência da data: Artificial Analysis (`release_date`) > Hugging Face (data de criação) > OpenRouter (data de criação). A passagem de prévia para versão final de um mesmo Modelo não é um novo Lançamento.
- **Pulso** — Animação do Ponto que indica Lançamento recente. Começa forte, enfraquece e termina 7 dias após o Lançamento.
- **Ponto** — Representação de uma Empresa no Globo.
- **Globo** — Visualização 3D interativa da Terra onde ficam os Pontos.
- **MAPA** — Base cartográfica escura do Globo 3D; cidades, rodovias e ruas ganham detalhe ao aproximar.
- **SAT** — Base de imagem de satélite do Globo 3D; em zoom próximo, o conteúdo fotorealístico aparece automaticamente quando disponível.
- **Terminal** — Janela de estilo retrô com os dados de uma Empresa. Tem dois estados: **Prévia** (ao passar o mouse) e **Fixado** (ao clicar ou tocar).
- **Notícia** — Matéria sobre uma Empresa obtida das Fontes. É exibida com resumo traduzido para o português, título original e link.
- **Tabela de modelos** — Lista comparativa na aba MODELOS, com estilos HÍBRIDO, TERMINAL e ANALÍTICO.
- **Custo estimado por tarefa** — Custo, em US$, de uma Tarefa padrão calculado com os preços de cada Modelo. A fórmula fica visível no ⓘ da coluna.
- **Tarefa padrão** — Perfil fixo de tokens de entrada e saída usado no Custo estimado por tarefa.
- **Faixa de cotações** — Barra rolante na base com Índices e ações de Empresas listadas.
- **Índice** — Indicador de mercado exibido na Faixa de cotações ou em MERCADOS. A Faixa inclui obrigatoriamente Nasdaq-100, Nasdaq Composite, S&P 500 e SOX.
- **Fonte** — Serviço ou dataset externo de Modelos, Notícias, cotações ou dados geográficos, com origem e condições de uso identificadas.
- **Atualização** — Execução agendada que busca dados nas Fontes e publica o resultado.
- **Agente de notícias** — Componente com LLM de baixo custo que filtra, resume e traduz Notícias. Não tem permissão de escrita no Cadastro.
- **Agente de descoberta** — Componente que propõe Empresas novas ou correções no Cadastro. Só escreve na Fila de revisão.
- **Fila de revisão** — Lista de propostas sobre Cadastro, Relações, logos e correspondência de Modelos que aguardam decisão do dono.
- **Relação** — Ligação dirigida entre Empresas: fabricação de chips, nuvem e infraestrutura, investimento, energia ou parceria de modelos. Tem origem verificável e passa pela Fila de revisão.
- **Fluxo de notícias** — Painel sobre o Globo, com Notícias de todas as Empresas ou só de Laboratórios; alterna com a aba LABS.
- **Leitor** — Janela de Notícia com resumo estendido em português, pontos-chave, Empresas citadas e link original; pode ser lateral ou flutuante.
- **Agente especialista em LLMs** — Chat de pesquisa que consulta dados do painel e a web, cita fontes e executa ações de navegação.
- **Histórico** — Conversas anteriores do Agente especialista em LLMs, acessíveis somente ao dono.
- **Painel MERCADOS** — Painel de cotações, indicadores macroeconômicos, índices mundiais e favoritos, com resumo pelo Agente especialista em LLMs.
- **BACKBONES** — Sobreposição de cabos submarinos de internet e estações de pouso; não é uma sexta Camada de Empresas.
- **Detalhe OpenStreetMap** — Mapa de cidades, rodovias e ruas exibido ao aproximar quando a base MAPA está selecionada.

## 4. Funcionalidades

### 4.1 Globo
**Descrição:** O Globo ocupa a parte principal da tela e mostra todos os Pontos sobre a Terra. Ele gira e permite zoom com mouse, trackpad ou toque. Cada Ponto tem a cor da Camada principal da Empresa. Uma legenda com Filtros por Camada permite mostrar ou esconder Camadas. Com zoom numa região, os Pontos viram logos em círculos com a borda na cor da Camada principal. Realiza UJ-1.

#### FR-1: Exibir Empresas no Globo
O usuário vê um Ponto por Empresa do Cadastro, posicionado pelas coordenadas da sede.
**Consequências:**

- Toda Empresa do Cadastro com coordenadas válidas tem exatamente um Ponto.
- O Globo é uma Terra reconhecível, com oceanos, continentes e relevo; a textura segue a família de tema e a Vista.
- As camadas geográficas descritas em FR-32 não alteram Pontos, Filtros ou a Empresa selecionada.
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

### 4.2 Terminal
**Descrição:** Janela de estilo terminal retrô ligada a um Ponto. Ao passar o mouse, abre a Prévia. Ao clicar ou tocar, o Terminal fica Fixado e digita o conteúdo completo, com som opcional de teclado. Realiza UJ-1.

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

### 4.3 Tabela de modelos
**Descrição:** Tabela na aba MODELOS, em tela cheia, que compara os Modelos de todos os Laboratórios. O estilo HÍBRIDO (Terminal com barra de inteligência) é o padrão; TERMINAL e ANALÍTICO são opções com preferência salva. Realiza UJ-2.

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

### 4.4 Notícias
**Descrição:** Notícias por Empresa, filtradas, resumidas e traduzidas pelo Agente de notícias. Aparecem no Terminal, Fluxo, aba LABS, aba NOTÍCIAS e Leitor. Realiza UJ-1.

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

### 4.5 Faixa de cotações e Painel MERCADOS
**Descrição:** Barra rolante na base com os Índices e ações de IA. O Painel MERCADOS amplia a consulta financeira (FR-36). Realiza UJ-1.

#### FR-18: Exibir cotações
O usuário vê, para cada Índice e cada ação: nome ou ticker, valor e variação do dia, em verde ou vermelho.
**Consequências:**

- Os quatro Índices estão sempre presentes: Nasdaq-100, Nasdaq Composite, S&P 500 e SOX.
- Inclui ações de bolsas fora dos EUA quando a Empresa só é listada lá, ou quando essa é a listagem principal (por exemplo, SK Hynix e Samsung).
- A Faixa pausa quando o mouse está sobre ela. Com a opção **Reduzir movimento** ativada no sistema, todos os itens continuam acessíveis sem rolagem automática.
- Cada ação mostra a logo pequena da Empresa (ou o monograma) ao lado do ticker.
- Clicar numa ação leva à aba GLOBO, gira até a Empresa e abre o Terminal Fixado.

#### FR-19: Frescor das cotações
As cotações se mantêm recentes, e o usuário sabe de quando elas são.
**Consequências:**

- Durante o pregão, as cotações são atualizadas a cada cerca de 15 minutos, com mais uma Atualização após o fechamento.
- A Faixa e o Painel MERCADOS mostram o horário da cotação e o aviso "Dados com atraso, apenas para fins informativos". Cada horário identifica o fuso utilizado; os pregões respeitam o calendário da respectiva bolsa.
- Se a Fonte principal falhar, o sistema usa a Fonte de reserva. Se as duas falharem, mostra os últimos valores conhecidos com o horário.
- Ativos do Painel MERCADOS, inclusive macro, cripto e índices internacionais, precisam de cobertura e cadência documentadas antes das stories desse painel (§11). Dados indisponíveis aparecem como "—" ou como último valor válido com horário; não se promete uma Fonte de reserva sem verificar a cobertura.

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
- A aba NOTÍCIAS também apresenta os dados financeiros existentes: panorama macro, amplitude/extremos, favoritos, seis Empresas em foco e demais ações abaixo delas por Camada, mais índices mundiais. Filtros de manchetes não reduzem essa cobertura, inclusive quando não há Notícias. Quantidades acompanham o Cadastro.
- Abaixo de cada ação em NOTÍCIAS, um botão abre diálogo próprio do futuro especialista em ações, separado do especialista LLM. O preview identifica ação/bolsa/moeda e permite perguntas/sugestões demonstrativas. Integração, fontes, provedor, orçamento e análise financeira real permanecem futuras; a interface não as declara disponíveis.

### 4.6 Cadastro e Fila de revisão
**Descrição:** O Cadastro é a base curada de Empresas. Ele começa com uma lista inicial e cresce por propostas do Agente de descoberta, sempre com aprovação do dono. Realiza UJ-3.

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
O dono vê a Fila de revisão e, para cada proposta, pode aprová-la sem alterações, editá-la e então aprová-la, ou rejeitá-la.
**Consequências:**

- Uma Empresa aprovada aparece no Globo na Atualização seguinte.
- Uma proposta rejeitada não volta, a menos que surja um fato novo: um novo Modelo publicado pela Empresa ou uma nova Fonte que confirme os dados.
- A Fila de revisão também recebe pares incertos de Modelos (FR-13) e logos candidatas.
- A Fila é um painel lateral com cartões por proposta, motivo e link de origem de cada campo. Empresa ou Relação nova tem prévia no Globo como Ponto ou arco fantasma, sem publicá-la.
- Pares incertos oferecem "É O MESMO MODELO" e "SÃO DIFERENTES". Antes da publicação, DESFAZER cancela a decisão e devolve o cartão ao estado pendente. O efeito em dados já publicados exige definição na arquitetura (§11).
- A Fila fecha por botão, `Esc` ou sua ação na barra, sem fechar por clique fora; é exclusiva com Leitor lateral e MERCADOS.
- O botão da Fila mostra a contagem de propostas pendentes e fica aceso enquanto ela está aberta; o selo desaparece com a Fila vazia.

### 4.7 Atualização de dados
**Descrição:** Os dados chegam por Atualizações agendadas. Dados estruturados (Modelos, preços, Lançamentos, cotações) são publicados direto, sem LLM. Notícias passam pelo Agente de notícias. O Cadastro muda pela Fila de revisão ou por edição manual do dono; Relações propostas passam pela Fila. Nenhum Agente publica diretamente esses dados curados.

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

### 4.8 Aparência e acesso
**Descrição:** Temas, atribuição de Fontes, responsividade e controle de acesso ao painel.

#### FR-27: Design padrão e seis temas alternativos
Artificial Analysis é o design padrão, com modo claro inicial e versão escura opcional. O usuário também escolhe OSIRIS fiel, Fósforo âmbar ou Sala de controle noturna, cada uma com modo claro e escuro.
**Consequências:**

- Na primeira visita, o design é Artificial Analysis Light, sempre claro, com tabela analítica. Escolhas manuais e preferências antigas continuam salvas.
- O seletor oferece o padrão e as três famílias alternativas. O controle claro/escuro alterna o modo em todas as famílias, incluindo Artificial Analysis. Todas as alternativas oferecem retorno visível ao padrão.
- As cinco cores de Camada e o conteúdo continuam distinguíveis no padrão e nos seis temas alternativos. Terminal, Leitor, Agente, Fila e MERCADOS ficam escuros nas famílias OSIRIS fiel e Fósforo âmbar, inclusive no modo claro.

#### FR-28: Atribuição de Fontes
Cada dado e sobreposição mantém atribuição acessível com link; o crédito ao Artificial Analysis é obrigatório. BACKBONES mostra "Cabos: TeleGeography" quando ligada. O Detalhe OpenStreetMap mostra "© OpenStreetMap contributors" e o crédito do provedor de mapa exigido por sua licença. Fontes ativas de terreno, edifícios e conteúdo fotorealístico também recebem os créditos exigidos por seus provedores. A posição desses créditos segue a UX, sem acrescentar um rodapé institucional.

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

### 4.9 Relações e exploração do Globo

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

- A projeção permanece em um Globo tridimensional; a v1 não oferece um seletor de mapa plano 2D. MAPA e SAT alternam a base visual sem alterar a projeção, a câmera, os Pontos, as Relações, os Filtros, a Empresa selecionada ou as ações do Terminal.
- MAPA usa uma base cartográfica de fundo bem escuro, com cidades, rodovias e ruas legíveis e mais detalhadas ao aproximar. SAT mostra imagem de satélite em zoom amplo. O terreno acompanha as duas bases; edifícios aparecem em detalhe urbano quando disponíveis.
- Em SAT, ao aproximar em uma área coberta, o Globo transita automaticamente para o conteúdo fotorealístico 3D quando a Fonte de fotorealismo estiver disponível. Ao afastar, sair da área coberta ou ocorrer uma falha nessa camada, o Globo retorna à imagem de satélite. A cena não sobrepõe uma segunda geometria de edifícios sobre edifícios já fornecidos pelo conteúdo fotorealístico.
- Se uma camada opcional falhar, o Globo e a base escolhida continuam utilizáveis com indicação de indisponibilidade. Uma base indisponível não aparece como selecionável; seus limites, fontes e fallback são definidos antes das stories do mapa (§11).
- Há controles visíveis de zoom e rotação. Pinça sobre o Globo ou seus Pontos controla o zoom do Globo; o zoom de página por teclado permanece disponível.
- Rótulos discretos de países, cidades e polos de IA respeitam a prioridade dos rótulos de Laboratórios. A leitura de cursor mostra coordenadas, lugar, zoom e escala.
- O terminador dia/noite acompanha o horário no Globo quando compatível com a base ativa. Reduzir movimento elimina rotação automática e transições animadas; não impede atualizar os dados de iluminação.
- A ajuda `?` apresenta os atalhos: `1/2/3` para GLOBO/MODELOS/NOTÍCIAS, `/` para o Agente, `Esc` para sair da janela ativa, `F` para tela cheia, `R` para vista inicial, setas para girar e `+/-` para zoom. Atalhos não interceptam digitação em campos de texto.

#### FR-33: Laboratórios e Fluxo de notícias
O painel esquerdo alterna entre FLUXO e LABS sem tirar o Globo de vista.
**Consequências:**

- FLUXO é a aba inicial; a escolha entre FLUXO e LABS fica salva.
- FLUXO oferece TODAS e SÓ LABORATÓRIOS, com preferência salva e contagem coerente com o Filtro. Novas Notícias respeitam o Filtro.
- FLUXO mostra até 14 itens recentes do mesmo conjunto publicado de Notícias; isso não altera o limite por Empresa do FR-14.
- LABS agrupa Laboratórios por região, mostra o último Modelo e o Lançamento recente, e expande as três Notícias mais recentes de cada Laboratório.
- Selecionar um Laboratório gira até ele e abre o Terminal. Selecionar uma Notícia abre também o Leitor. A aba NOTÍCIAS permite filtrar por Camada e Empresa.

### 4.10 Pesquisa e leitura

#### FR-34: Leitor de notícia
O usuário lê uma Notícia em português sem perder o contexto da Empresa.
**Consequências:**

- Manchetes no Terminal, FLUXO, LABS e NOTÍCIAS abrem o mesmo Leitor, com resumo estendido, pontos-chave, Empresas citadas, título original, veículo, data e link original em nova guia.
- Resumos são identificados como gerados por IA.
- Nos principais destaques de NOTÍCIAS, usar a imagem da própria matéria, com indicação de procedência e link original. Se não houver imagem vinculada à matéria ou se o carregamento falhar, manter o título, a Fonte e o link, e mostrar um placeholder; uma foto da mesma Empresa não prova correspondência com a matéria. O preview identifica notícias fictícias como demo e sínteses editoriais como tais.
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

### 4.11 Infraestrutura geográfica

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

- O detalhe cartográfico de cidades, rodovias e ruas aumenta ao cruzar limiares consistentes, sem oscilar continuamente perto deles. Limiar e compatibilidade com MAPA/SAT e temas são definidos antes das stories do mapa (§11).
- Pontos, Relações e seleção de Empresas permanecem utilizáveis na troca. "© OpenStreetMap contributors" e créditos do provedor ficam visíveis enquanto o mapa aparece.
- Tiles são carregados para a visualização interativa, com cache conforme a política do provedor, sem pré-download ou modo offline.
- Falha de tiles mantém o Globo e seus Pontos utilizáveis e informa indisponibilidade; não deixa a cena em branco nem troca silenciosamente MAPA por SAT. Em SAT, a camada de detalhe indisponível preserva a imagem de satélite. A escolha de provedor e fallback fica com a arquitetura.

## 5. Requisitos não funcionais transversais

- **Desempenho:** a primeira tela útil (Globo com Pontos) aparece em até cerca de 3 s numa conexão doméstica comum. O Globo gira de forma fluida (cerca de 60 fps) num notebook recente com ~200 Pontos e de forma utilizável (pelo menos cerca de 30 fps) num celular intermediário recente. A avaliação inclui terreno, edifícios e fotorealismo nos cenários representativos em que essas camadas estão disponíveis; camadas opcionais não bloqueiam a primeira tela nem a seleção dos Pontos.
- **Confiabilidade:** a interface nunca fica em branco por falha de uma Fonte. Em caso de falha, mostra os últimos dados conhecidos com o horário.
- **Segurança:** chaves de API ficam no servidor ou na Atualização. Notícias e páginas da web entram como dados não confiáveis (FR-17, FR-35); toda ação de escrita valida a autorização do dono. Cadastro, Relações e Histórico não podem ficar acessíveis por caminhos públicos alternativos.
- **Acessibilidade:** todas as funções operam por teclado ou toque, conforme o dispositivo; a navegação por teclado é completa. Abrir Terminal/Leitor leva o foco para a janela; fechar devolve à origem. `Esc` age sobre a janela ativa mais acima e completa a digitação antes de fechá-la. Reduzir movimento elimina pulso animado, digitação, rotação automática e animações de entrada. Texto atende contraste WCAG AA nos seis temas, inclusive sobre texturas e painéis; pontos, rótulos e atalhos têm alternativa acessível, e sinais de estado não dependem só de cor. A UX define a navegação entre muitos Pontos antes das stories do Globo.
- **Portabilidade:** a interface consulta snapshots publicados para dados de leitura. Fila, chat e Histórico têm contratos autenticados independentes da hospedagem; trocar de provedor preserva esses contratos e a lógica de Atualização. A v1 já inclui interações que exigem escrita e execução no servidor.

## 6. Restrições e limites

- **Custo:** priorizar Fontes gratuitas e hospedagem gratuita ou quase. O teto confirmado para o Agente de notícias e o Agente de descoberta continua perto de US$ 5/mês. A 80%, Notícias passam a cada seis horas; a 100%, resumo e tradução param até o mês seguinte e Notícias novas trazem título original e link. `[ASSUMPTION: separar contabilmente esse teto das despesas do chat, busca, Histórico e mapas]`. O valor adicional e a regra de suspensão precisam ser decididos com Andre antes de ativar serviços pagos; o novo escopo não cabe presumidamente nos US$ 5.
- **Dados e licenças:** a API gratuita do Artificial Analysis exige atribuição e tem limite de 1.000 consultas por dia. O uso é pessoal na v1. Antes de qualquer abertura ao público, as licenças do Artificial Analysis e das cotações devem ser revistas.
- **Confiabilidade das Fontes:** a Fonte principal de cotações é não oficial e pode parar sem aviso. Por isso, a Fonte de reserva é obrigatória.
- **Proibido:** copiar dados do site do Artificial Analysis (scraping).
- **Fontes geográficas:** BACKBONES depende de comprovação da licença do dataset utilizado; atribuir o mapa não comprova direito sobre seus dados brutos. OpenStreetMap exige crédito visível e uso conforme a política do provedor de tiles. Custos e condições atuais constam como questão de arquitetura, sem garantia de fonte gratuita contínua.

## 7. Estética e tom

- **Referência visual:** Artificial Analysis é o padrão aprovado em 2026-10-12: modo claro inicial e escuro opcional, títulos editoriais, navegação em cápsulas e cartões de métricas. Notícias usa a composição editorial do Yahoo Finance no modo escolhido. OSIRIS e as demais famílias permanecem alternativas.
- **Globo:** grande e imersivo, podendo ser cortado pelas bordas. Laboratórios têm prioridade; o ecossistema e a infraestrutura apoiam a exploração sem encobrir os Laboratórios.
- **Personalidade:** No padrão, fichas, Leitor e painéis seguem o modo escolhido e são editoriais, com leitura imediata. Nas alternativas antigas, Terminal retrô, cursor em bloco e digitação continuam conforme seus contratos.
- **Marca:** emblema próprio no favicon e junto ao nome na barra; forma a definir na UX.
- **Textos do produto:** em português. Nomes de Modelos, Empresas e títulos originais de Notícias ficam no idioma original.

## 8. Não objetivos

- Não é um terminal financeiro: sem cotações em tempo real, sem gráficos avançados, sem carteira, sem alertas de preço.
- Não cobre a Nasdaq inteira nem setores sem relação com IA.
- Não é um benchmark próprio: não roda testes nos Modelos, apenas agrega as Fontes.
- Não é um agregador de notícias genérico: só Notícias sobre Empresas do Cadastro.
- Não permite contas de terceiros, comentários nem recursos sociais.
- Macro, índices mundiais e Bitcoin entram como contexto em MERCADOS e NOTÍCIAS; negociação, carteira, alertas e análise financeira profunda continuam fora do escopo.
- Fibra terrestre, capacidade/incidentologia de cabos e rotas físicas precisas ficam fora da v1.
- Tradução integral de matérias fica fora; o Leitor oferece resumo estendido e acesso ao original.

## 9. Escopo do MVP

### 9.1 Dentro

- Globo com Pontos, cores por Camada, Filtros, Pulso de 7 dias e logos no zoom (FR-1 a FR-4).
- Terminal com Prévia, Fixado, digitação, transição ASCII e som opcional (FR-5 a FR-8).
- Tabela de modelos completa, com Custo estimado por tarefa (FR-9 a FR-13).
- Notícias traduzidas com título original e link (FR-14 a FR-17).
- Faixa de cotações com Fonte de reserva (FR-18, FR-19).
- Lista inicial obrigatória e logos (FR-20, FR-21).
- Agente de descoberta e Fila de revisão (FR-22, FR-23).
- Atualizações agendadas, tolerância a falhas e detecção de Lançamentos (FR-24 a FR-26).
- Design padrão e seis temas alternativos, atribuição de Fontes, todas as funções no celular e acesso restrito (FR-27 a FR-30).
- Globo principal sempre 3D com bases MAPA/SAT, terreno, edifícios e transição automática para o fotorealismo em zoom próximo; sem seletor 2D (FR-1, FR-32, FR-40).
- Relações curadas e painel FLUXO/LABS (FR-31, FR-33).
- Leitor, Agente especialista em LLMs, MERCADOS, Busca global e Estado na URL (FR-34 a FR-38).
- BACKBONES e Detalhe OpenStreetMap (FR-39, FR-40), com validação das Fontes e licenças antes da publicação.

#### 9.1.1 Ordem de corte
Se o MVP atrasar, estes itens saem primeiro, nesta ordem:
1. Transição ASCII da logo (FR-7).
2. Som de digitação (FR-8).
3. Logos no zoom (FR-4).
4. Benchmarks na linha expandida da Tabela de modelos (FR-9).

A ordem de corte acima é a que já estava acordada; não autoriza retirar o novo escopo. Qualquer corte em FR-31 a FR-40 exige decisão de Andre.

### 9.2 Fora do MVP

- Ajuste do perfil da Tarefa padrão pelo usuário (chat, resumo, programação) — v2.
- Tamanho do Ponto como indicador (valor de mercado, número de Modelos) — v2.
- 6ª Camada "IA física" — reavaliar se o Cadastro crescer nessa direção.
- Abertura ao público — depende da revisão de licenças.
- Rastreamento de voos de aeronaves e controles adicionais do protótipo para voos por Empresa/região; os fluxos de foco e câmera existentes ao selecionar Empresas continuam.

## 10. Métricas de sucesso

- **SM-1 (principal):** Andre abre o painel pelo menos 4 dias por semana durante o primeiro mês e continua usando depois de 3 meses. Valida FR-1, FR-6 e FR-14.
- **SM-2:** 95% das Atualizações agendadas de uma semana terminam com sucesso. Valida FR-24 e FR-25.
- **SM-3:** todo Lançamento de um Laboratório do Cadastro aparece com Pulso em até 2 h após surgir numa Fonte. Valida FR-3 e FR-26.
- **SM-C1 (contramétrica):** quantidade de Notícias exibidas. Não deve ser maximizada: mais Notícias significam mais ruído e mais custo. Contrabalança SM-1.
- **SM-C2 (contramétrica):** quantidade de Empresas no Cadastro. Crescer não é objetivo: o Cadastro vale pela curadoria. Contrabalança FR-22.
- **SM-C3 (contramétrica):** volume da Fila de revisão. Mais de 20 propostas pendentes por semana indica que o Agente de descoberta está gerando ruído. Contrabalança FR-22 e FR-13.

## 11. Questões em aberto

As questões abaixo não impedem definir a arquitetura. Seus responsáveis precisam fechá-las no momento indicado antes de transformar a função em stories ou publicá-la. `final` descreve o estado editorial deste PRD.

| Questão | Responsável | Momento de revisão |
|---|---|---|
| Hospedagem, autenticação e autorização de Fila, dados e Histórico; persistência e contratos de escrita/chat; efeito de DESFAZER após publicação | Arquitetura | Antes das stories de Fila/chat e de qualquer publicação |
| LLMs de Notícias/descoberta/chat, provedor de busca, orçamento adicional, limites e estado de erro; retenção/exclusão do Histórico e eventual permissão do chat para propor itens | Arquitetura + Andre | Antes das stories do chat e de contratar/ativar serviços |
| Combinação de Fontes de Notícias e validação de tradução/resumo | Arquitetura | Antes das stories de Notícias |
| Símbolos e cobertura de todos os ativos de MERCADOS, Fontes de reserva, histórico de um mês, cadência de macro/cripto e calendários/fusos de pregão | Arquitetura | Antes das stories de MERCADOS |
| Origem, versão, licença e possibilidade de atualização do snapshot TeleGeography; Fonte utilizável para cabos/estações e associação entre eles | Arquitetura + Andre | Antes de escolher a Fonte e publicar BACKBONES; custo adicional exige decisão do dono |
| Reconciliar o spine/handoff de arquitetura, que ainda prevê uma Vista 2D e quatro modos, com o Globo 3D e as bases MAPA/SAT deste PRD | Arquitetura + Andre | Antes de decompor as stories do Globo |
| Base visual inicial (MAPA ou SAT); provedor que entregue a base cartográfica escura acordada; provedores/cobertura e composição de terreno, edifícios e fotorealismo; limiares da transição por zoom, fallback, créditos, cache, custo/quota e combinação com temas | UX + Arquitetura + Andre | Antes das stories do Globo e de ativar qualquer Fonte geográfica |
| Critérios por tipo de dado para LIVE/ATRASADO/OFFLINE, incluindo falha parcial e ausência de conexão | Arquitetura | Antes das stories de status/Atualização |
| Controles no celular, navegação por teclado entre Pontos, contraste sobre MAPA/SAT e painéis, apresentação com reduzir movimento, tamanho do Leitor e do modo ampliado MERCADOS | UX | Antes das stories dessas superfícies |
| Posição acessível dos horários em telas menores, forma da Busca/ajuda e emblema da marca | UX | Antes das stories de navegação e marca |
| Empresas de Software além de Tesla/Palantir, contatos ausentes, tickers e vínculos societários | Curadoria via Fila | Antes da primeira publicação de cada entrada |
| Camada "IA física" | Andre / produto | Apenas se uma expansão futura justificar; fora da v1 |

## 12. Índice de premissas

- §6 — Separação contábil do teto das rotinas automáticas em relação a chat, busca, Histórico e mapas; responsável: arquitetura + Andre; revisar antes de ativar serviços.
- §4.9 / FR-32 — A base visual inicial (MAPA ou SAT) ainda não foi escolhida; responsáveis: UX + Andre; revisar antes das stories do Globo.
