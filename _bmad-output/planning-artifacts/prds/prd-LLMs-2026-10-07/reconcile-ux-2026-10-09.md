# Extração UX → PRD — 2026-10-09

Extração para edição do PRD existente; não substitui o PRD. Foram lidos `prd.md` e `addendum.md` neste diretório, mais `DESIGN.md`, `EXPERIENCE.md`, `.memlog.md`, `reconcile-ref-osiris-globo.md` e `reconcile-ref-osiris-markets.md` no diretório `../../ux-designs/ux-LLMs-2026-10-09/` (os caminhos UX completos estão nas referências abaixo). Nenhum desses artefatos foi alterado nesta extração. As fontes externas, seus preços, disponibilidade, quantidades e licenças não foram revalidados aqui.

## Regra de evidência e precedência

- `EXPERIENCE.md:16` dá precedência às spines DESIGN/EXPERIENCE sobre mocks, capturas e imports. A implementação simulada do protótipo não prova integração real.
- Entradas posteriores do `.memlog.md` resolvem propostas antigas contraditórias. BACKBONES e OpenStreetMap são decisões explícitas nas duas últimas entradas (`.memlog.md:101-103`) e ainda não aparecem nas spines.
- As listas "não capturadas" dos dois arquivos de reconciliação são propostas para decisão, não escopo automaticamente aprovado. Usar as decisões posteriores do memlog e a destilação nas spines.
- Conservar FR-1…FR-30. Alterar suas consequências quando a UX detalha ou substitui comportamento. Criar FRs posteriores somente para capacidade nova, sem renumerar os existentes.
- Separar o que o usuário decidiu de detalhes técnicos ainda sugeridos: biblioteca WebGL, elementos HTML sobre o Globo, hospedagem, persistência do Histórico, provedor de tiles e provedor de busca pertencem à arquitetura ou às questões abertas.

## Alterações dos requisitos existentes

| Requisito | Decisão explícita a incorporar | Evidência UX |
|---|---|---|
| FR-1 | Laboratórios são o foco; ◆ de 9 px, selecionado 12 px, rótulo fixo de 8 px com desobstrução; ecossistema com círculos de 6 px. Sedes próximas são espalhadas levemente em anel para seleção individual, preservando a sede real nos dados. A premissa "agrupamento ou espalhamento" está resolvida. Globo com satélite real em alta resolução, relevo, imersivo e podendo ser cortado pelas bordas. | `.memlog.md:69-76,84`; `EXPERIENCE.md:134,138-139,242`; `DESIGN.md:350,356,412,415-416` |
| FR-2 | Filtros pela legenda horizontal na base, com contagem pela Camada principal; botão desliga/liga, estado salvo, visível no celular com rolagem horizontal. A barra lateral esquerda foi eliminada. Manter regra de incluir Empresas por Camada principal **ou Etiqueta**: a contagem pela principal não revoga as Etiquetas. Relações só aparecem quando ambas as Empresas estão visíveis. | `.memlog.md:91`; `EXPERIENCE.md:141,157,244` |
| FR-3 | Rótulo de Laboratório mostra idade do Lançamento, mantendo duração de 7 dias e mais recente. Reduzir movimento usa anel estático. | `EXPERIENCE.md:139-140,201,251` |
| FR-4/FR-5 | Logos no zoom e Prévia de ~300 ms continuam. Rótulo de Laboratório tem a mesma ativação do Ponto. Sem Prévia em qualquer superfície de toque, inclusive tablet. Limiar de logos ainda aberto. | `EXPERIENCE.md:138-142,347,453` |
| FR-6 | Incluir linha RELAÇÕES com direção, Empresa e tipo. Clique no Globo/área vazia fecha; interagir com controles, painéis e faixa não fecha. Arrastar nunca fecha. Terminal desvia dos painéis abertos. Trocar para MODELOS/NOTÍCIAS fecha o Terminal. Preservar toque. | `.memlog.md:41-42,95`; `EXPERIENCE.md:76-80,143,229-238` |
| FR-7 | Digitação e salto por Esc/clique continuam; Leitor e Agente usam a mesma linguagem. Reduzir movimento remove digitação, rotação automática e animações de entrada. Não transformar mocks ASCII incompletos em requisitos removidos. | `EXPERIENCE.md:143-144,161,221-228,251,453` |
| FR-8 | Som de digitação e ambiente espacial com ON/OFF e volumes independentes, ambos desligados no início e iniciados após gesto. Um clique no botão restaura/desliga a combinação anterior; seta abre ajustes. | `.memlog.md:26,28,45`; `EXPERIENCE.md:154,243-244` |
| FR-9 | Tabela em aba MODELOS de tela cheia; estilos HÍBRIDO (padrão), TERMINAL, ANALÍTICO com preferência salva. Custo estimado por tarefa logo após Inteligência. Manter todas as colunas e benchmarks; sua ausência no mock é lacuna de prototipagem. | `.memlog.md:39`; `EXPERIENCE.md:159,434,454` |
| FR-10…FR-13 | Preservar ordenação, filtros, fórmula, aviso de raciocínio e correspondência incerta. Agente pode abrir a tabela filtrada/ordenada e destacar linhas. Fila apresenta É O MESMO MODELO / SÃO DIFERENTES. | `EXPERIENCE.md:159,399,413` |
| FR-14 | Notícias também no Fluxo sobre o Globo e aba NOTÍCIAS de tela cheia; aba LABS permite expandir 3 mais recentes por Laboratório. Fluxo padrão, filtro TODAS / SÓ LABORATÓRIOS salvo, contagem e entrada de novas Notícias respeitam filtro. Fluxo mostra até 14 itens recentes; manter até 5 por Empresa e janela de 2 semanas do FR-14. | `.memlog.md:27,59-61`; `EXPERIENCE.md:145-146,160` |
| FR-15 | "Marcar como irrelevante" pede OCULTAR/CANCELAR. Confirmada, a matéria desaparece de Terminal, Fluxo, aba NOTÍCIAS e Leitor; aba LABS usa o mesmo conjunto de Notícias. | `.memlog.md:51`; `EXPERIENCE.md:172,197,436` |
| FR-16 | Leitor com resumo estendido em português, pontos-chave, Empresas citadas clicáveis, título original, veículo, data e link em nova guia. Padrão LATERAL com alternativa FLUTUANTE salva; aba NOTÍCIAS sempre lateral sem sobrescrever preferência. Resumo identificado como gerado por IA. Sem tradução integral. Falha/teto: preservar título original e link; formato exato do Leitor nessa situação segue aberto. | `.memlog.md:32-36,40`; `EXPERIENCE.md:120,144,196,455` |
| FR-17 | Preservar isolamento do Agente de notícias. Agente especialista é distinto e precisa contrato próprio; não assumir que o contrato sem ferramentas do Agente de notícias permite as ações do novo chat. | `EXPERIENCE.md:38,445` |
| FR-18 | Faixa de cotações na **base**; só cotações, sem manchetes/eventos. Clique numa ação vai para GLOBO, voa até a Empresa e abre Terminal. Os quatro índices existentes continuam obrigatórios na Faixa; macro e demais ativos são escopo do Painel MERCADOS. | `.memlog.md:10-12,52,85`; `EXPERIENCE.md:147,421,430` |
| FR-19 | Preservar atualização de ~15 min no pregão, reserva e últimos valores com horário. Aviso visível com fuso; registrar frescor também no novo painel. A cobertura da reserva para macro, índices globais, cripto e ativos não americanos ainda precisa definição; Finnhub EUA não prova essa cobertura. | `.memlog.md:52,93`; `EXPERIENCE.md:183-184,430`; addendum A |
| FR-20/FR-21 | Preservar Cadastro e logos oficiais locais/monogramas. Não corrigir situação societária, tickers, bolsas ou listagens usando os exemplos simulados da UX; revalidar na etapa apropriada. | `EXPERIENCE.md:169`; addendum B |
| FR-22/FR-23 | Fila lateral à direita sem sair do Globo; badge de pendentes, cartões com motivo e origem de cada campo, APROVAR/EDITAR/REJEITAR; Empresa/Relação fantasma no Globo; par incerto com duas ações próprias; resolvidos com DESFAZER. Nada publicado sem dono aprovar. Empresa aparece na próxima Atualização; mock imediato é demonstração. Fila não fecha com clique fora; é exclusiva com Leitor lateral e MERCADOS. Incluir manutenção de Relações. | `.memlog.md:63-66`; `EXPERIENCE.md:162,205-206,406-415` |
| FR-24/FR-25 | Preservar agendamento e proteção de dados anteriores. Barra superior com LIVE / ATRASADO (idade última Atualização) / OFFLINE, relógio UTC e contadores; estado deve refletir dados reais. Não omitir o horário de atualização em telas menores. Limiares e falha parcial ainda abertos. | `.memlog.md:80`; `EXPERIENCE.md:148,178-184,448,461` |
| FR-26 | Preservar detecção e precedência do Lançamento. Exemplos Qwen/Claude/GPT da UX não são afirmações de disponibilidade. | `EXPERIENCE.md:263-327` |
| FR-27 | Seis temas: 3 famílias × claro/escuro; primeira família OSIRIS fiel, modo do sistema; escolha salva; atalho alterna o par da mesma família. Em OSIRIS e âmbar, Terminal, Leitor, Agente, Fila e MERCADOS sempre escuros. Na noturna acompanham modo. Exceção noturna escura: 3D noturno, MAPA diurno. | `.memlog.md:22-23,96,98-100`; `EXPERIENCE.md:374-389`; DESIGN Colors |
| FR-28 | Preservar atribuições obrigatórias existentes. Acrescentar TeleGeography quando BACKBONES ligado e OpenStreetMap enquanto os tiles aparecem. A rejeição de um rodapé Sobre/Fontes não remove atribuição. | `.memlog.md:85,101-103` |
| FR-29 | Desktop/tablet são prioritários no acabamento. No celular **todas as funções** seguem exigidas, com reorganização simples; não reduzir cobertura funcional. Tablet usa layout desktop, sem Prévia no toque. Inclui chat, Fila e MERCADOS e os novos controles; forma de exposição no celular segue aberta. | `.memlog.md:47-50`; `EXPERIENCE.md:340-350,447` |
| FR-30 | Preservar dono único e acesso restrito. Aplicar também ao chat, Histórico e ações de revisão. Decisão de hospedagem/login ainda aberta; link compartilhável não equivale a acesso público. | `EXPERIENCE.md:26,50,445`; PRD §11 |

## Capacidades novas e IDs sugeridos

São propostas de organização para o editor do PRD, não IDs já aprovados. Evitar criar novo ID só para reposicionar a Faixa, escolher tema, adicionar volume ou detalhar um requisito existente.

| ID sugerido | Capacidade nova | Conteúdo decidido e limites |
|---|---|---|
| FR-31 | Relações entre Empresas | Entidade dirigida, cinco tipos: fabricação de chips, nuvem/infraestrutura, investimento, energia, parceria de modelos. Rede sutil por padrão, ilumina relações da selecionada; liga/desliga e filtros por tipo. Cor semântica por tipo e lista dirigida no Terminal. Curadoria pela Fila, sem publicação automática. Fontes e manutenção detalhada na arquitetura. |
| FR-32 | Navegação por Laboratórios e Notícias | Abas GLOBO/MODELOS/NOTÍCIAS; painel esquerdo com Fluxo padrão e LABS, escolha salva. LABS agrupada EUA/China/Europa/Outros, ordenada por Lançamento recente e nome, expansão das 3 Notícias recentes, nome voa até. Fluxo e aba Notícias usam o mesmo corpus de FR-14…FR-16. |
| FR-33 | Agente especialista em LLMs | Dados do painel + busca web com fontes numeradas; ações anunciadas para voar, abrir Terminal/Leitor/tabela e destacar Modelos/Laboratórios; console pela tecla / ou botão, expandível; Histórico guardado e reabrível. Resumo do mercado abre o console. Propostas na Fila **não decididas**; isolamento, modelo, busca, custo, erros e retenção ainda abertos. |
| FR-34 | Painel MERCADOS | Painel lateral exclusivo com Fila/Leitor lateral, sem fechar por clique fora, Esc fecha, botão ativo, expandível. Busca ticker, 10 cartões de índices/macro, amplitude IA, ações do Cadastro por Camada com gráfico 1M, índices mundiais Américas/Europa/Ásia, favoritos salvos/WATCH, resumo do Agente. Topo fixo, lista rola; ATIVO/ÚLTIMO/VAR%/1M, status e pregão N de M, dicas de nome/símbolo/bolsa. Desconhecido avisa; ação voa até Empresa; índice destaca. Sem trading, carteira, alertas ou gráficos avançados. |
| FR-35 | Quatro Vistas | 3D, 2D plano com Pontos/Relações/Terminal, MAPA noturno, SAT com relevo acentuado; quatro exclusivas, nunca opção não implementada selecionável. Exceção da família noturna escura; aparência 2D/SAT ainda sem protótipo aprovado. |
| FR-36 | Navegação e ajuda | Controles na tela e teclado para girar/zoom; ajuda ?, F tela cheia, R vista inicial; pinça no Globo sempre controla Globo, inclusive sobre Pontos/rótulos; zoom da página permanece via Cmd +/−. Teclas não interceptam campos de texto. |
| FR-37 | Contexto geográfico | Lugar sob o cursor, coordenadas, zoom e escala; países/cidades/polos de IA discretos com desobstrução abaixo da prioridade dos Labs; terminador dia/noite em 3D atualizado pela hora real. Lista de rótulos, obtenção dos nomes e redução de movimento do terminador ainda abertos. |
| FR-38 | Estado na URL | Camadas ligadas, Vista, aba e Empresa selecionada guardáveis/compartilháveis. Override só da sessão, sem sobrescrever preferências; valores inválidos retornam ao padrão. Painel MERCADOS na URL ainda não decidido. |
| FR-39 | Busca global | Campo único: Empresa/Modelo/ticker/Notícia; Enter leva respectivamente Globo+Terminal, MODELOS+linha destacada, Empresa ou ativo MERCADOS, Leitor. Busca visual sem mock; não substitui busca ticker do MERCADOS. |
| FR-40 | BACKBONES | Camada geográfica independente de cabos submarinos + estações de pouso (cidade e cabos). Botão próprio na barra direita, OFF inicial; hover cabo mostra nome; atribuição TeleGeography visível enquanto ligado. Não transformar em sexta Camada principal de Empresa. Fibra terrestre registrada somente como futura. Quantidade 733 é fotografia do levantamento UX, não mínimo funcional nem comprovação atual. |
| FR-41 | Detalhe OpenStreetMap no zoom | De longe satélite do tema; próximo, detalhe de cidades/rodovias/ruas por tiles OSM; afastar restaura satélite. Atribuição visível enquanto tiles aparecem. Só uso interativo, sem pré-download, com cache do navegador. Limiar, métrica de zoom, projeção, provedor e estilo escuro ainda para arquitetura. Não fixar "zoom abaixo/acima" sem definir se mede distância/altitude ou nível de tile. |

FR-31…FR-39 têm evidência nas spines e decisões anteriores do memlog. FR-40/FR-41 vêm exclusivamente das entradas `.memlog.md:101-103`, posteriores à destilação. Registrar essa lacuna de documentação UX sem editar a UX neste trabalho.

## Mudanças transversais do PRD e addendum

1. **Visão, JTBD, jornadas e Glossário:** refletir pesquisa assistida, Relações, leitura de Notícia, mercados e contexto geográfico; Tabela em aba e Faixa na base. Incluir conceitos novos mantendo Empresa/Laboratório/Camada/Etiqueta distintos de camadas geográficas de infraestrutura. Fluxos novos da UX (chat, relações, mercado) precisam rastreabilidade, sem apresentar exemplos simulados como dados reais.
2. **NFR acessibilidade:** teclado completo, foco ao abrir/restaurar ao fechar, rótulos acessíveis, redução de movimento abrangendo todos os painéis/Globo/Faixa, WCAG AA nos seis temas e sinais além da cor. Os ajustes de 17 hex não provam contraste sobre satélite/transparência/brilho; cores de Camada em texto pequeno ainda falham em alguns temas claros. Evitar declarar QA global já concluída.
3. **NFR portabilidade e segurança:** o frontend que "só lê arquivos de Atualização" não contempla chat interativo, busca web, gravação de Histórico/revisões e tiles externos. Manter portabilidade como objetivo, revisar a restrição para distinguir dados publicados de serviços interativos. Chaves continuam servidor; isolamento do chat e escopo permitido de ações precisam contrato próprio. Não outorgar escrita em Cadastro ao chat.
4. **Custo:** ~US$5/mês estava definido para Agente de notícias/descoberta. Não tratá-lo como suficiente para chat, pesquisa web, resumos estendidos e mercado. Orçamento do novo chat/busca/Histórico ainda aberto; preservar degradação 80%/100% do processamento de Notícias e explicitar o que ela cobre. Não inventar teto adicional nem provedor pago.
5. **Dados/addendum A:** acrescentar TeleGeography e tiles OSM como fontes novas decididas na UX, com licenças e políticas registradas como provenientes do levantamento UX, pendentes de validação atual. No MERCADOS, precisar fontes, históricos 1M, calendários e reserva de dados além de ações EUA. Lista concreta de índices mundiais ainda não aprovada na decisão; não promover lista do mock a cadastro obrigatório.
6. **Addendum D:** esquema ilustrativo `{relevante,resumo_pt}` não contempla pontos-chave/Empresas citadas; atualizar sugestão sem vinculá-la a uma implementação. Relações curadas, Histórico, ações UI e tiles exigem complementos de arquitetura. HTML/CSS/JS vanilla + WebGL consta como fundação UX; biblioteca específica e pontos HTML são sugestão para arquitetura.
7. **Estética §7:** OSIRIS central de operações para todo o painel, Terminal como assinatura, seis temas; Artificial Analysis só referência de conteúdo/densidade. Referências Bloomberg/Yahoo/Nasdaq seguem úteis para cotações, sem restaurar tema Terminal Bloomberg descartado.
8. **Não objetivos §8 / addendum E:** revogar a proibição absoluta de cripto e outros mercados apenas no alcance macro/Bitcoin/índices globais decidido para MERCADOS. Continuam sem carteira, ordens, alertas de preço, universo financeiro inteiro ou gráficos avançados. Cartões de índices voltaram; heatmap por Camada **não** entrou. Retirar a rejeição composta "cartões e heatmap" ou distingui-los.
9. **MVP §9:** incorporar capacidades aprovadas sem declarar implementação pronta; fibra terrestre permanece fora. Manter ordem de corte já decidida, sem inventar cortes novos para chat/BACKBONES/OSM. Necessário alinhar amplitude do MVP aos riscos/custo na arquitetura, sem reduzir o celular funcional.
10. **Métricas §10 / questões §11 / premissas §12:** manter IDs SM existentes; ampliar rastreabilidade de uso para novas jornadas sem inventar metas quantitativas. Remover premissa resolvida das sedes; manter login como questão técnica. Questões UX abertas devem virar pendências concretas de arquitetura ou de acabamento, sem fingir decisões concluídas.

## Propostas anteriores superseded ou rejeitadas

| Proposta antiga | Decisão vigente |
|---|---|
| Artificial Analysis como visual principal | OSIRIS no painel inteiro; AA conteúdo/densidade |
| Faixa no topo; Tabela abaixo do Globo | Faixa base; Tabela aba MODELOS |
| Relações sem lista no Terminal | Linha dirigida de Relações mantida, `.memlog.md:95` |
| Seis temas aguardando confirmação | Confirmados, `.memlog.md:22` |
| Tema inicial desconhecido | OSIRIS fiel; modo do sistema, `.memlog.md:96` |
| Leitor flutuante/lateral sem escolha | Lateral padrão, alternável; NOTÍCIAS sempre lateral, `.memlog.md:40` |
| Traduzir matéria integral | Resumo estendido + pontos-chave + original em nova guia |
| LABS como aba padrão do painel esquerdo | Fluxo padrão, escolha salva, `.memlog.md:59` |
| Losango 13/16 px e rótulo 10 px | 9/12 px e rótulo 8 px aprovados, `.memlog.md:57,69` |
| Celular funcionalmente reduzido | Cobertura completa, acabamento básico, `.memlog.md:47-49` |
| Clique fora sempre fecha Terminal | Exceções; arrastar nunca fecha |
| Barra esquerda de Camadas | Eliminada; legenda horizontal como filtro |
| "Cartões e heatmap = excesso de painéis" | MERCADOS aprovado com cartões; heatmap não aprovado |
| 3D sempre dia, MAPA sempre noite | Exceção noturna escura: 3D noite/MAPA dia |
| Painéis claros seguindo o tema OSIRIS/âmbar claro | Painéis sempre escuros nessas duas famílias |
| Linhas no Globo somente Relações | Relações continuam; BACKBONES é nova camada geográfica, independente |
| Satélite como única base em todos os níveis | Detalhe OSM ao aproximar decidido, memlog final |
| Alternância 3D/2D × MAPA/SAT em dois eixos | Quatro Vistas exclusivas confirmadas |
| Manchetes na Faixa; anotação/medição; CTAs; rodapé Sobre/Fontes/Metodologia | Rejeitados na reconciliação, sem remover créditos obrigatórios |
| Terminal Bloomberg como quarto tema | Descartado |
| Comandos de mercado, abas de categoria, atalhos numéricos internos, selo de aba, recolher painel, rodapé clima | Não entram no MERCADOS decidido |

## Questões ainda abertas e limites de confiança

- **Chat:** LLM, orçamento, provedor de busca, armazenamento/retensão do Histórico, isolamento de conteúdo web, permissão de propor à Fila, estado de erro/sem resposta. Protótipo responde por simulação (`EXPERIENCE.md:445`).
- **Celular e status:** expor todos os controles escondidos no mock; acesso ao Fluxo/Agente/Fila/MERCADOS; mostrar última Atualização em telas menores; definir LIVE/ATRASADO/OFFLINE e falha parcial (`447-448,461`).
- **Vistas e infraestrutura:** 2D e SAT distintos não aprovados em mock; Limiar de logos, OSM e provedor/estilo/compatibilidade; ligação entre estações/cabos e Relações empresariais não decidida; calendário/frescor/backup de macro e índices globais requer arquitetura. Sem fonte aberta terrestre no levantamento UX não deve virar afirmação permanente sem revalidação.
- **Leitura e acessibilidade:** tamanho de resumo estendido (150–250 é exemplo de mock), fallback do Leitor, forma da confirmação de ocultar, Tab entre ~200 Pontos, itens da Faixa parada, texto sobre textura/transparência/brilho e cores de Camada como texto pequeno (`449,455-458,463`).
- **Persistência e pendências visuais:** filtros de Relações/volumes/ambiente sem persistência demonstrada, Busca global sem mock, emblema da marca, posição de controles/ajuda, rótulos geográficos, vista inicial R, pregão mundial, tamanho/URL/layout mobile do MERCADOS (`452-453,459-462`).
- **Fontes e licenças:** "733 cabos", CC BY-NC-SA e política OSM foram anotados na UX, não revalidados por esta extração. Tratar como dados do levantamento, usar fontes oficiais na validação. Não extrapolar CC BY-NC-SA para mapas/tiles OSM ou todo o produto.
- **FRs ainda não prototipados:** logos no zoom/transição ASCII, benchmarks/filtros/colunas da Tabela e colunas mobile permanecem no contrato (453-454). Checks headless do mock não demonstram acesso autenticado, coleta real, notícias LLM, cotações reais, persistência remota nem chat/busca integrado.

## Referências locais

- UX: `_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/DESIGN.md` e `EXPERIENCE.md`.
- Decisões UX: `_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/.memlog.md`.
- Reconciliações visuais: `reconcile-ref-osiris-globo.md` e `reconcile-ref-osiris-markets.md` no mesmo diretório UX.
- Base comparada: `prd.md` e `addendum.md` no diretório deste arquivo.
