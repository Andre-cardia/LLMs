# Reconciliação de entrada — template adicional Artificial Analysis claro

Data: 2026-10-12. Extração documental para a sessão `bmad-ux`. Pedido atual informado pelo agente principal: acrescentar **mais um template do programa**, no padrão visual Artificial Analysis, mesmas cores e light mode, **mantendo tudo já criado**. Esta extração não é revisão formal, não inclui pesquisa externa e não muda spines, memlog, protótipos, PRD, SPEC ou arquitetura.

## Decisão atual e separação da variante

- A adição é uma **versão visual independente**, além dos seis temas atuais. Não substitui OSIRIS fiel, Fósforo âmbar ou Sala de controle noturna, seus pares claro/escuro ou suas preferências/padrões.
- A alternativa é do **programa inteiro**, não somente um quarto estilo da Tabela de modelos. A Tabela já tem ANALÍTICO; esse modo isolado não satisfaz o novo pedido.
- O light mode adicional deve ter superfícies e leitura coerentes com a referência atual a ser capturada pelo agente principal. O OSIRIS claro usa painéis sempre escuros; aplicá-lo apenas com outro acento não representa a nova alternativa clara.
- Separar nesta sessão “AA” = **Artificial Analysis** de “AA” = **contraste WCAG AA**. Comentários `/* AA: ... */` dos HTML existentes tratam do contraste e não são uma implementação da referência Artificial Analysis.
- O pedido atual revê a antiga rejeição do Artificial Analysis como referência visual **apenas para esta versão adicional**. A linha principal OSIRIS, sua assinatura Terminal e seu contrato permanecem.
- Os inputs locais não informam a paleta atual da referência. **Não inferir os hex, fontes, ícones ou espaçamentos da referência a partir dos tokens OSIRIS claros.** A análise visual feita fora desta subtask deve registrar a evidência e os tokens usados no novo template.

## Artefatos atuais e precedência

| Artefato | Estado lido | Implicação para a adição |
|---|---|---|
| `DESIGN.md` / `EXPERIENCE.md` | `draft`, updated 2026-10-09; conteúdo de seis temas e composição v5 | Mantêm o contrato da linha original. A autoridade das spines sobre mocks está explícita em EXPERIENCE §início |
| `.memlog.md` UX | Última atualização 2026-10-09T23:12; termina em BACKBONES/OSM | Decisões novas posteriores à spine precisam ser preservadas; ainda não há entrada do novo template nesse arquivo nesta leitura |
| `mockups/prototype-globe.html` | v5 promovida, inclui MERCADOS, sem código de BACKBONES/OSM | Não tratá-la como versão de maior cobertura funcional só por estar em mockups |
| `.working/prototype-globe.html` | Variante posterior com botão `bBB`, cabos/estações e troca OSM | Fonte de referência mais recente para controles de infraestrutura, sem editar/substituir |
| `mockups/directions-1.html` e histórico `.working/prototype-globe-v1…v4*.html` | Direções e versões preservadas | Mantê-las e suas capturas/assets intactas |
| PRD atual | `final`, FR-1…FR-40, atualizado 2026-10-09 e polido/reorganizado desde extração anterior | Autoridade do escopo; não usar a lista antiga de pendências UX como se o PRD ainda precisasse incorporar chat/MERCADOS/infraestrutura |
| Addendum atual | Distingue versões promovida/trabalho e evidências | Preservar limites de mock, fontes e atribuições; não afirmar licença/integração de infra pronta |
| `SPEC.md` | `partial`, 2026-10-10; CAP-1…CAP-8 e companions | Preserva 40 FR e seis temas da versão original, todos os recursos móveis, vanilla/WebGL e gates |
| `ARCHITECTURE-SPINE.md` | `final`, 2026-10-10; AD-1…AD-16 | Final documental, não autorização de produto/publicação. Novo visual deve respeitar estado semântico e contratos únicos |
| `implementation-readiness.md` | Fotografia de 2026-10-10, implementação completa não pronta, produção não autorizada | A frase sobre ausência de código é baseline daquela data: o inventário atual já tem `package.json` e testes locais. Esta subtask não auditou o código e não extrapola prontidão |

Paridade verificada por inventário/texto, sem abrir ou executar os protótipos: os dois `prototype-globe.html` possuem hashes distintos. Ambos os diretórios têm assets de cabos/estações, mas somente o HTML de trabalho contém os comportamentos BACKBONES/OSM. A existência do asset na pasta promovida não significa funcionalidade promovida.

## Superfícies a preservar na alternativa

| Superfície/capacidade | Conteúdo e comportamento que deve permanecer alcançável |
|---|---|
| Navegação principal | GLOBO, MODELOS, NOTÍCIAS; teclas 1/2/3 fora de campos de texto; Pesquisa global; controles de tema/som/Relações/MERCADOS/Fila/BACKBONES |
| Globo e Laboratórios | Cinco Camadas; uma Camada principal + Etiquetas. Laboratórios têm prioridade inclusive por Etiqueta: losango/rótulo, seleção e Lançamento. Pontos próximos espalham somente a posição visual; coordenadas verdadeiras permanecem. Filtros incluem Etiquetas e contagem é pela principal |
| Vistas/geografia | 3D/2D/MAPA/SAT são quatro Vistas exclusivas; opção indisponível não selecionável. 2D usa mesmas entidades/ações. Controle de zoom/rotação, coordenadas/lugar/zoom/escala, países/cidades/polos discretos, terminador em 3D e retorno de vista |
| Prévia/Terminal | Hover ~300ms; sem Prévia no toque. Clique/toque abre Terminal com dados da Empresa, Modelos, Relações dirigidas, cotação/privada e Notícias. Durante digitação, Esc/clique completa antes de fechar. Arrastar Globo nunca fecha |
| Relações | Cinco tipos com cor semântica e nome textual; rede sutil e destaque da selecionada; filtros/liga-desliga; ambas as pontas devem estar visíveis. Lista no Terminal navega à Empresa ligada. Fantasma é prévia de proposta, não dado publicado |
| FLUXO/LABS | FLUXO inicial, escolha salva; TODAS/SÓ LABORATÓRIOS com contagem e novos itens coerentes, até 14. LABS por região, último Modelo/Lançamento e expansão de três Notícias; nome vai à Empresa e notícia abre Terminal+Leitor |
| MODELOS | Comparação completa e estilo HÍBRIDO/TERMINAL/ANALÍTICO da versão original preservados. Ordenação/filtros combinados, custo logo após Inteligência, entrada/saída/cache/contexto/velocidade/licença/raciocínio, expansão benchmarks e crédito. A adição visual não muda dados/fórmula |
| NOTÍCIAS/Leitor | Mesmo conjunto nas cinco superfícies; filtros Empresa/Camada. Resumo estendido, pontos-chave, Empresas citadas, título original, veículo/data, link em nova guia e indicação IA. LATERAL padrão, FLUTUANTE opcional salvo; NOTÍCIAS sempre lateral sem mudar preferência |
| Ocultar Notícia | Confirmar antes de ocultar; cancelar não grava. Supressão comum a Terminal/Fluxo/LABS/NOTÍCIAS/Leitor, busca e chat; refresh/novo snapshot não faz a matéria voltar |
| Faixa/MERCADOS | Faixa na base, cotações e aviso com horário/fuso. MERCADOS: dez cartões índice/macro, ações do Cadastro por Camada, amplitude IA, índices por Américas/Europa/Ásia, minigráfico 1M, busca ticker, favoritos/WATCH e resumo pelo chat. Ticker desconhecido avisa; Empresa leva a Globo+Terminal |
| Fila | Badge pendentes, cartões com origem de cada campo/motivo, aprovar/editar/rejeitar; fantasmas de Empresa/Relação, decisão de par incerto. DESFAZER antes da publicação cancela e volta a pendente; depois é compensação proposta, confirmada e publicada em revisão seguinte |
| Chat | Console com sugestões/fontes/Histórico, abre botão ou /, amplia e retorna ao agir. Ações de navegar, abrir Leitor/Terminal, filtrar/ordenar/destacar Modelos e destacar Labs. Resposta/ação não autoriza escrita curada. Na arquitetura chat pago está desativado até gates |
| BACKBONES | Namespace geográfico independente, botão próprio, OFF inicial. Cabos/estações, nome na interação, cidade/vínculo confirmado, atribuição TeleGeography enquanto ligado. Sem inferir Empresa proprietária pelo lugar e sem alegar rota física exata |
| OSM | Satélite distante, ruas/cidades ao aproximar, satélite ao afastar; seleção/Pontos/Relações mantidos. Histerese, créditos enquanto exibido, uso interativo/cache do provedor, falha volta ao satélite. Provider/licença/limiar/Vistas seguem gate |
| Estado/erro | Dado ausente é “—”, não zero; privado sem cotação; erro preserva last-good com data; status LIVE/ATRASADO/OFFLINE vem da política comum e não de decoração fixa |

## Regras de interação e estado que o novo visual não deve perder

1. **Painéis:** Leitor lateral, Fila e MERCADOS são exclusivos. Chat convive e reserva espaço. Terminal desvia dos painéis. Chat/Fila/MERCADOS não fecham por clique fora. Globo/área vazia fecha Terminal/Leitor; ações em controles e painéis não fecham Terminal. Trocar para MODELOS/NOTÍCIAS fecha Terminal. Esc consome uma camada, foco superior e digitação primeiro.
2. **Preferências:** versão original salva tema/mode, leitor, tabela, aba FLUXO/LABS, filtro do Fluxo, Camadas, favoritos e som/volume. URL contém Camadas/Vista/aba/Empresa, override da sessão que não sobrescreve preferências. Valor inválido retorna a opção válida, sem segredos/conversas na URL.
3. **Semântica única:** AD-10 e `contracts.md` exigem um reducer proprietário de seleção/filtros/aba/Vista/janelas. A alternativa pode mudar o renderer/composição; no programa não cria IDs, publicação, estado de Empresa ou regras de custo/frescor paralelos. Callback vencido de voo/digitação não altera intenção nova.
4. **Acessibilidade:** todas as funções por teclado/toque conforme dispositivo, foco ida/retorno, estados anunciados e sinais além da cor. Reduzir movimento remove rotação/digitação/entradas, deixa Pulso estático e Faixa sem movimento com acesso manual aos itens. Zoom de página por teclado preservado; pinça no palco é zoom do Globo.
5. **Som:** digitação e ambiente independentes, OFF no início, gesto para iniciar, volume salvo. Novo template não liga som automaticamente.
6. **Celular:** acabamento simples, funções completas. Não repetir ocultação de barra do mock sem mecanismo alternativo para Busca/Agente/Fila/MERCADOS/Camadas/Relações/Som/Temas/BACKBONES/navegação. Desktop/tablet são superfícies principais.
7. **Domínio em dados:** valores com unidade/moeda/fuso, IDs canônicos e aliases, fonte/data por valor. Modelo é família canônica com variantes explícitas. Custo por Tarefa = 2.000 entrada + 1.000 saída; raciocínio aproximado com “≈”. Dados/cotações/comparações do mock são exemplos, não fatos atuais.
8. **Privacidade e orçamento:** mock local reversível não vira deploy ou chamada real. Histórico/revisões privadas, Agentes só navegam/propoem conforme autoridade; nenhum dado curado publicado por agente. Local/test usam fixtures; chat/busca reais permanecem ceiling zero até Q1/Q7.

## Onde acrescentar a versão sem substituir as anteriores

Proposta de organização, não arquivos criados nesta subtask:

- Desenvolver em **`.working/template-artificial-analysis-light.html`** (ou nome equivalente novo e inequívoco), com CSS/tokens próprios. Usar composição independente para o programa completo; preservar `.working/prototype-globe.html` e `mockups/prototype-globe.html`.
- Referenciar assets locais existentes por caminhos relativos ou copiar somente para pasta nova quando a estrutura exigir. Não alterar paletas/imagens/JS compartilhados usados pelos seis temas.
- Capturas novas em **`.working/shots/aa-light/`**; análise visual local da referência em novo arquivo/import. Não substituir as capturas originais de seis temas ou v5.
- Após aprovação/conclusão da sessão, promover a versão nova para **`mockups/template-artificial-analysis-light.html`** e capturas próprias, lado a lado com as versões existentes. A atualização descritiva das spines/memlog é do agente principal; registrar explicitamente “versão adicional light”, sem converter o novo visual em escolha padrão da versão antiga.
- Em protótipo isolado, se houver preferências interativas, usar namespace novo, como `mg-aa-light-v1-*`, ou estado efêmero. Não sobrescrever chaves `mg4-*`/preferências originais durante a avaliação visual. Na integração posterior ao programa real, usar a mesma semântica/store com identificador de apresentação distinto; não um segundo domínio.
- Oferecer acesso claro às duas versões com link/entrada de template quando fizer sentido para a composição, sem substituir o seletor de três famílias original por uma opção só.

## Pontos atualizados desde nosso trabalho anterior

- **PRD final já incorporou os overrides:** base da Faixa, MODELOS em aba, seis temas, clique fora com exceções, som ambiente, Notícias/Leitor, chat, MERCADOS, Relações, infraestrutura e celular completo. `EXPERIENCE.md` §Pendências para PRD ainda descreve o estado anterior e não representa dívida atual desses requisitos.
- **Reviewer Gate de PRD fechou:** ações chat ordenada/filtrada com destaques/retorno de tela cheia, zoom/escala do cursor, teclado completo, DESFAZER a pendente, Índice/Fonte e cor semântica estão no PRD atual. Não retomar nossos achados resolvidos como requisitos faltantes.
- **Arquitetura existe e está final documental:** identidade/snapshots privados, curadoria/compensação, reducer único, orçamento fechado, tools chat tipadas e feedback comum substituem os antigos “a definir” genéricos. Tecnologia/serviços ainda têm gates; a criação visual não fecha provider/custo/licença por aparência.
- **STATUS passou a ter política técnica definida:** agregação e Fonte, idade, falha parcial, fallback e mercado fechado vêm de `contracts.md`; mock “LIVE” fixo não é um contrato para o novo template. Macro/cripto ainda Q5.
- **Curadoria não aplica imediatamente no produto:** aprovação é staged/publicada na próxima Atualização; DESFAZER após publicar exige compensação. O mock imediato é demonstração explícita.
- **Histórico/chat ainda dependem de gates:** modelo/busca/limite, retenção/exclusão não decididos por visual aprovado; tools v1 são `focusCompany`, `openNews`, `openModels`, `highlightLabs`.
- **BACKBONES/OSM continuam fora das spines mas dentro do PRD/SPEC/arquitetura:** preserve seus controles na alternativa sem reproduzir a afirmação antiga de licença CC BY-NC-SA como prova atual. Addendum exige origem/licença utilizável; Q4/Q6 controlam integração. Quantidade 733 é snapshot demonstrativo, não mínimo funcional.
- **Novo pedido vence restrição visual anterior para a variante:** “AA só conteúdo/densidade” descreve OSIRIS existente. Para o template adicional de 12/10, a referência AA agora é visual e light. Separar esse delta do contrato funcional e dos seis temas anteriores.

## Referências lidas

- UX no diretório pai: `DESIGN.md`, `EXPERIENCE.md`, `.memlog.md`; inventário e trechos relevantes dos dois `prototype-globe.html`.
- PRD/addendum: `_bmad-output/planning-artifacts/prds/prd-LLMs-2026-10-07/`.
- SPEC: `_bmad-output/specs/spec-llm-labs-globe/SPEC.md`.
- Arquitetura: `_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md`, `contracts.md`, `implementation-readiness.md`.

Entrega desta subtask é somente este documento. Nenhum comportamento, token visual, biblioteca, deploy ou serviço foi executado/alterado.
