---
title: Reconciliação do padrão Artificial Analysis Light e Pass 1 do delta
date: 2026-10-12
status: captured
scope: ux-contract-delta
sources:
  - ../.memlog.md
  - ../DESIGN.md
  - ../EXPERIENCE.md
  - ../variants/artificial-analysis-light/DESIGN.md
  - ../variants/artificial-analysis-light/EXPERIENCE.md
  - reconcile-aa-existing-2026-10-12.md
  - ../mockups/prototype-artificial-analysis.html
  - ../mockups/prototype-globe.html
  - ../imports/yahoo-finance-reference-2026-10-12.md
  - ../mockups/assets/news-original-sources.js
  - ../verification-artificial-analysis-2026-10-12.md
---

# Delta aprovado em 2026-10-12

Andre aprovou Artificial Analysis Light como design padrão e preservou os seis temas originais como alternativas. Pediu retorno dos templates antigos ao padrão, teste de fundo cinza suave no Globo e Notícias com composição Yahoo Finance. A decisão posterior substitui a condição anterior de versão apenas adicional; os contratos e tokens dos seis temas permanecem preservados.

| Tema | Decisão capturada | Limite |
|---|---|---|
| Padrão e entrada | `artificial-analysis-light`/`light`/`analytic`; MODELOS sem URL/preferência própria válida | Default interno OSIRIS/modo do sistema continua válido apenas na linha original; preferências antigas válidas não são apagadas |
| Retorno entre previews | “Design padrão ↗” no cabeçalho antigo, também pelo menu de tema; Templates abre a galeria a partir do padrão | Navegação entre previews não migra nem regrava preferências `mg4-*`; URL válida pode retornar ao Globo sem mudar o default MODELOS |
| Fundo do Globo | Seletor experimental: Cinza suave `#ECEDEF` inicial, Cinza original `#F1F2F4`, Branco `#FFFFFF`; preferência só no namespace AA | Três opções/persistência conferidas no preview; tom final pendente de Andre. Não muda satélite, Vistas, seleção, Camadas, atmosfera ou os temas antigos |
| Notícias | Destaque com ilustração, Principais notícias/manchetes relacionadas, Últimas notícias e coluna Empresas em foco/cotações; acento `#6001D2` aproximado | Yahoo foi observado em modo escuro pelo agente responsável pela referência; sua composição é adaptada ao claro aprovado. Sans em negrito, Arial/system substitui GT America; roxo não foi medido como token do site |
| Dados e ações de Notícias | Mesmos filtros Empresa/Camada e Leitor imediato; ticker→MERCADOS; badge Empresa→GLOBO. SVGs “Ilustração editorial · demo” | Blocos de manchetes usam o conjunto filtrado; cotações laterais vêm do Cadastro/MERCADOS, sem nova Fonte. Nenhuma manchete real ou coleta foi introduzida pela documentação |

Os detalhes da observação Yahoo e do preview foram informados pelo agente responsável em 2026-10-12 e conferidos, quando aplicável, no HTML atual e na [fonte importada](../imports/yahoo-finance-reference-2026-10-12.md). Os HTMLs anteriores receberam navegação de retorno e compactação do cabeçalho móvel; visuais, conteúdos e preferências foram preservados. Não se aplica mais a afirmação anterior de arquivos/hashes intactos após esses acréscimos.

## Pass 1 mecânico — etapa clara inicial

Verificação limitada aos quatro contratos alterados, sem revisão formal extra de UX/acessibilidade, conforme escolha de Andre registrada no memlog.

| Checagem | Resultado |
|---|---|
| YAML/frontmatter | Quatro documentos carregados pelo parser YAML do Ruby; status master `draft` e par padrão `final` preservados |
| Headings canônicos | Sequência existente de seções `##` preservada nos quatro documentos; VX-2 registra o novo percurso dentro de Key Flows |
| Tokens | Referências resolvidas nos contratos correspondentes: DESIGN master 200, EXPERIENCE master 16, DESIGN padrão 79, EXPERIENCE padrão 3; zero referências sem definição |
| Temas antigos | Seis conjuntos de tokens presentes no master; nenhuma alteração de valor nas paletas originais neste delta |
| Tokens novos | `colors.globe-ground = #ECEDEF` e `colors.news-accent = #6001D2`; modelos/fundo original e branco continuam usando tokens existentes |
| Referências locais | Links e entradas `sources` dos quatro contratos conferidos após criar este registro; zero destinos locais ausentes |
| Limite de autoria | Apenas DESIGN/EXPERIENCE master, DESIGN/EXPERIENCE padrão e este registro alterados por esta subtask; HTML, galeria, PRD/SPEC, imports, logs e registro de conferência ficam com o agente responsável |

## Evidência e trabalho restante

O agente responsável relatou QA do preview em 2026-10-12: as seis URLs originais retornaram ao padrão na aba Globo, com link visível também em 390px; os três fundos computados e persistência passaram. Notícias em 1280px/390px ficou sem overflow global; a seleção por Alibaba reduziu 73→3 itens, vazio/reset funcionou, Leitor correspondeu à manchete/Fonte e ticker NVDA abriu MERCADOS realçando a linha sem sair de NOTÍCIAS. Esses resultados pertencem à [conferência do preview](../verification-artificial-analysis-2026-10-12.md), mantida pelo agente responsável.

Os contratos capturam o padrão aprovado e o tom experimental já conferido no preview. A escolha final do fundo continua com Andre. Checagem de YAML, links, leitura de HTML ou interações demonstrativas não comprova backend, autenticação, APIs, curadoria publicada, histórico persistido, fontes licenciadas ou serviços pagos; os gates herdados continuam válidos. Nenhuma revisão formal extra foi iniciada nesta subtask.

## Delta posterior — modo escuro e Pass 1

O pedido posterior de Andre para dark substitui a regra de light fixo da etapa acima. A família corrente é `artificial-analysis`, com modo manual independente `light`/`dark`, defaults `light`/`analytic` e galeria de oito opções: dois modos AA e seis temas originais. O ID local `artificial-analysis-light` foi substituído antes de uma versão exportada; o diretório mantém o nome histórico, sem migração v1 requerida.

Claro/escuro usam o mesmo HTML por `?mode=claro/escuro`; o alias `prototype-artificial-analysis-dark.html` redireciona e respeita override explícito claro. Modo válido na URL ganha da preferência AA salva; o controle Modo salva somente no namespace AA. Trocar família no core não força light. O retorno dos templates antigos usa explicitamente `?mode=claro&tab=globo`, sem apagar escuro salvo.

Paleta escura registrada como adaptação própria: página `#101114`, superfícies `#18191D`/`#24262B`, borda `#34363E`, texto `#F2F2F3`, metadados `#A8ABB3` e acento `#C092FF`. Métricas mantêm roxo/amarelo/laranja originais. Notícias escura alinha-se ao modo Yahoo observado; claro continua adaptação. Globo escuro usa Earthnight no preview e fundos experimentais Cinza suave `#25272D`, Cinza original `#1B1D22` e Preto `#08090B`.

| Pass 1 após dark | Resultado |
|---|---|
| YAML, família/modos e paleta | PASS nos quatro contratos; `artificial-analysis`, default `light`, modos `[light, dark]`; valores escuros conferidos |
| Headings e tokens | Seções canônicas preservadas; 200/16 referências nos master e 111/5 no par AA; zero tokens indefinidos |
| Links e fontes locais | PASS, incluindo ambos os links de modo, alias escuro e capturas dark; zero destinos ausentes |
| Limite | Somente os quatro contratos e este registro alterados pela subtask; sem nova revisão formal ou repetição de QA/testes |

O agente responsável confirmou QA escura: troca mantém aba, escuro salvo restaura sem parâmetro, alias/override claro e galeria passam; MODELOS/NOTÍCIAS em 390px sem overflow, Leitor escuro legível e três fundos funcionais. A evidência pertence à conferência do preview. A escolha final dos tons do Globo continua com Andre; integração e gates herdados não são inferidos dessas verificações.

## Delta posterior — finanças completas e imagens de matérias

Andre pediu as informações financeiras disponíveis em NOTÍCIAS, demais ações abaixo de Empresas em foco e um botão de conversa abaixo de cada ação para o futuro especialista financeiro. A fonte atual `C`, corrigida pelo responsável, contém 35 Empresas e 29 ações: seis em foco + 23 demais por Camada. Os quatro contratos registram essa cobertura atual, sem fixar o Cadastro futuro em 29 ações.

| Cobertura alvo | Contrato |
|---|---|
| Ações e mercado de IA | 29 ações únicas, ticker/bolsa/moeda/preço/variação/mini tendência demo, favoritos, amplitude e maiores alta/baixa; seis em foco seguidas de 23 demais por Camada |
| Panoramas | 10 indicadores macro e 11 linhas mundiais em três regiões; dados existentes, sem nova Fonte ou atualização real presumida |
| Filtro e modos | Finanças independentes dos filtros Empresa/Camada de manchetes, visíveis inclusive em zero Notícias; mesma cobertura em claro/escuro e celular |
| Especialista financeiro futuro | 29 botões “Conversar sobre {ticker}”, diálogo modal nativo próprio, contexto correspondente, pergunta/sugestões e respostas locais demo; distinto do console LLM, sem API ou análise real apresentada |
| Foco e fechamento | Pergunta recebe foco, navegação fica no modal, Escape/botão fecha e devolve foco à ação de origem; favorito não dispara outra ação |
| Principais Notícias | Imagem verificada da própria matéria com URL/procedência/link original correspondentes. Sem URL/imagem ou em erro, placeholder sem foto, mantendo título/Fonte/link; nenhuma foto genérica substituta |

Pass 1 desta atualização: YAML e headings canônicos válidos; 200/16 referências de tokens nos master e 110/5 no par AA, zero tokens indefinidos e zero destinos locais ausentes. Defaults `artificial-analysis`/`light`/`analytic` e os seis temas anteriores preservados. Verificação documental confirmou cobertura, contagens corrigidas, modal e fallback de imagem; não executou QA visual/funcional nem revisão formal extra.

O responsável confirmou a [QA nova](../verification-artificial-analysis-2026-10-12.md): 29 ações/29 botões, 10 indicadores macro e 11 linhas mundiais permaneceram inclusive com zero Notícias; NVDA favorito sincronizou Notícias→MERCADOS e MERCADOS→Notícias. Desktop 1280×720 e celular 390×844 ficaram sem overflow global; modal Samsung coube em 356px. NVDA abriu USD/NASDAQ e Samsung/SK Hynix KRW/KRX; pergunta/resposta local demo, foco inicial, Escape e retorno de foco passaram. Essas observações pertencem ao preview local, não à IA financeira real.

O [manifesto estático de fontes originais](../mockups/assets/news-original-sources.js) registra cinco matérias consultadas em 2026-10-12, com URL, imagem, texto alternativo e crédito; as outras 73 Notícias são demo, totalizando 78. As cinco fotos carregaram no browser com largura natural de 1200px, links e Leitor correspondentes; demos sem URL usaram placeholder. Falha de rede não foi induzida: o handler de erro/placeholder continua definido, sem alegar teste desse cenário. Imagens permanecem no CDN da fonte, sem ingestão periódica/backend. Perguntas/respostas locais representam IA futura; provider/modelo/custo/política de conversa e fontes reais precisam de decisão antes de integração.

Pass 1 de fechamento: o delta registrado como observado foi limitado à evidência confirmada pelo responsável. A apresentação foi alinhada à conferência atual: Fundo do Globo mantém escolhas separadas por modo; no celular, destaque/Principais notícias precedem a coluna financeira, seguida de Últimas notícias; os 10 indicadores macro ficam na faixa superior, ações e WORLD na lateral. Esta subtask alterou somente os quatro contratos e este registro; nenhuma nova revisão formal ou repetição da QA do preview/núcleo foi executada.


Fechamento mecânico confirmado: frontmatter YAML e headings canônicos preservados; referências de tokens master 200/16 e AA 110/5, zero tokens indefinidos e zero destinos locais ausentes. Manifesto e quatro novas capturas referenciados. Família `artificial-analysis`, default `light` e modos `light`/`dark` preservados.
