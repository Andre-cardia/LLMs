# PRD Quality Review — Monitor Global de Labs de LLM

Rubrica aplicada: `.agents/skills/bmad-prd/assets/prd-validation-checklist.md`. Escopo: versão atual de `prd.md` (525 linhas) e `addendum.md` (131 linhas), confrontada com a extração UX de 09/10/2026. Revisão documental, sem execução do produto e sem revalidar APIs/preços/licenças. IDs finais FR-1…FR-40 são preservados.

## Overall verdict

O PRD está adequado para orientar a arquitetura do produto pessoal: incorpora chat, MERCADOS, Relações, BACKBONES/OSM, conserva os requisitos anteriores e dá responsáveis e momentos de fechamento às questões abertas. A conferência localizada das correções resolveu os quatro achados médios e os dois baixos desta revisão; não há achados abertos no Reviewer Gate. As escolhas técnicas abertas de §11 permanecem com dono e momento de fechamento e não impedem finalizar editorialmente o PRD.

Contagem final aberta: **0 critical · 0 high · 0 medium · 0 low**. Resolvidos: **4 medium · 2 low**.

### Conferência localizada após correções — 2026-10-09

Foram relidas somente as partes alteradas do PRD: Glossário Índice/Fonte/Cadastro, FR-23, §4.7, FR-27, FR-31, FR-32, FR-35 e §5. As notas originais abaixo ficam preservadas como histórico; esta tabela registra seu estado final. Não foi repetida a revisão integral nem alterado PRD/addendum nesta conferência.

| Achado original | Estado | Evidência corrigida no PRD atual |
|---|---|---|
| Ações do chat | Resolvido | FR-35:385-386 exige MODELOS filtrada/ordenada, destaque de Modelos/Laboratórios e retorno do console ao tamanho de painel ao agir em tela cheia |
| Cursor zoom/escala | Resolvido | FR-32:355 exige coordenadas, lugar, zoom e escala |
| Piso de teclado | Resolvido | §5:438 exige todas as funções conforme o dispositivo e declara navegação por teclado completa |
| DESFAZER | Resolvido | FR-23:285 cancela decisão anterior à publicação e devolve cartão a pendente; contagem é derivada das pendentes em :287; compensação posterior segue corretamente para arquitetura |
| Glossário Índice/Fonte | Resolvido | §3:61-62 inclui MERCADOS no conceito de Índice e dados geográficos no conceito de Fonte |
| Cor semântica da Relação | Resolvido | FR-31:343 exige direção e cor semântica do tipo; a lista textual permanece em :345 |

Também conferidos: FR-27:319 alterna claro/escuro dentro da família atual; FR-32:353 mantém Pontos/Relações/ações de Terminal em 2D; §4.7:290 admite edição manual do dono e proíbe publicação direta dos dados curados por Agentes. A observação herdada sobre edição manual está, portanto, resolvida.

## Decision-readiness — strong

§1 e FR-31…FR-40 apresentam escolhas como compromissos concretos. §9.1 conserva o novo escopo; §9.1.1:488 exige decisão de Andre para cortes posteriores, evitando apresentar uma redução silenciosa como implementação. A tensão entre o teto original de US$5 e chat/busca/mapas aparece em §6:440, com premissa e gate de ativação.

§11:509-521 permite à arquitetura atuar: autenticação, escrita, Histórico, custos, mercados, dados geográficos e acabamento têm responsáveis e momento de revisão. A proveniência do snapshot TeleGeography está assumida como questão real, e não resolvida com um crédito visual (addendum §F:102-108). Não exigir decisão de backend, provedor ou valor de orçamento agora é adequado ao estágio.

## Substance over theater — strong

O único usuário, Andre, determina desktop/tablet prioritários, linguagem em português, frequência de consulta e acesso restrito (§2; FR-29/FR-30). As três jornadas conservadas explicam os usos centrais; não há personas decorativas nem alegação de inovação artificial.

Requisitos quantitativos são próprios do produto: 7 dias de Pulso, até 5 Notícias/2 semanas por Empresa, 90% de relevância em amostra de 50, 10 propostas/semana, atualizações de 1h/15min, Tarefa padrão 2.000+1.000 tokens e desempenho de ~200 Pontos. Os cenários que ainda dependem de arquitetura estão nomeados em addendum §H, sem apresentar teste de mock como teste de serviço.

## Strategic coherence — adequate

§1 e §2 sustentam uma tese compreensível: reunir descoberta, leitura e comparação de LLMs para uso frequente do dono. A hierarquia dos Laboratórios no Globo e o contexto financeiro/infraestrutura são coerentes com essa tese; §8 conserva limites de terminal financeiro e agregador genérico, mesmo após a entrada de macro/Bitcoin.

As métricas §10 são proporcionais a um painel pessoal: uso recorrente, Atualizações bem-sucedidas e tempo para detectar Lançamentos, acompanhados de contramétricas de ruído de Notícias/Cadastro/Fila. Não há meta separada para qualidade da pesquisa por chat; nesse estágio isso limita medir a extensão nova, mas não torna a tese incoerente nem justifica inventar nova meta sem Andre.

## Done-ness clarity — adequate

Cada FR tem ao menos uma condição verificável. Os novos requisitos dão caminhos de abertura/saída, conteúdo e efeito da ação; FR-39/FR-40 acrescentam crédito, falha e limites de exibição. §11 e addendum §H tornam explícito que a arquitetura precisa completar contratos e cenários antes das stories. É uma entrada adequada para essa etapa, embora não seja autorização para construir tudo imediatamente.

### Findings

- **[medium] Ações do chat perderam capacidades de comparação já confirmadas** (prd.md FR-35:383; UX EXPERIENCE.md:159,399-402) — O PRD exige girar, abrir Terminal/Leitor e abrir MODELOS filtrada, mas não preserva abrir a Tabela **ordenada**, destacar os Modelos referidos nem destacar Laboratórios no Globo. São ações concretas decididas; fontes numeradas e filtro não garantem que o dado citado fique visível. O comportamento de sair da tela cheia ao agir também foi perdido, embora ajude a verificar a ação na interface. *Fix:* completar a consequência do FR-35 com ordenação e destaque de Modelos/Laboratórios, além de retornar o console ao tamanho normal quando agir em tela cheia. Manter apenas ações de navegação, sem outorgar escrita.

- **[medium] Leitura de cursor perdeu zoom e escala** (prd.md FR-32:353; UX EXPERIENCE.md:156 e `.memlog.md:11`) — A consequência atual pede somente coordenadas e lugar. A leitura de zoom e escala em km foi explicitamente adotada e permaneceu na spine, mas não aparece em outro FR ou no addendum atual. *Fix:* incluir zoom e escala na mesma consequência do FR-32; a arquitetura/UX podem definir cálculo e forma visual sem criar ID novo.

- **[medium] Piso de teclado ficou restrito a funções “essenciais” sem definir esse conjunto** (prd.md §5:435; UX EXPERIENCE.md:252) — A decisão UX exige navegação completa por teclado nos Pontos, temas, filtros, Notícias, cotações, LABS, Fila, busca, favoritos e abas MERCADOS. “Todas as funções essenciais” permite excluir controles já escolhidos, pois o PRD não distingue essenciais de opcionais. “Por teclado ou toque” também pode ser lido como cobertura de apenas um modo por função, em vez de ambas nas superfícies correspondentes. *Fix:* exigir todas as funções interativas por teclado no desktop/tablet com teclado e por toque nas superfícies de toque; conservar o gate de desenho para ordem de Tab entre Pontos. Não acrescentar novas funções.

- **[medium] DESFAZER tem controle, mas perdeu o efeito já definido sobre a Fila** (prd.md FR-23:285; UX EXPERIENCE.md:294,327,415) — A consequência oferece DESFAZER e remete o efeito em dados publicados à arquitetura, mas não exige devolver o cartão a pendente. A UX já define esse retorno após decisão equivocada; ele é verificável sem decidir armazenamento ou compensação após publicação. *Fix:* exigir que DESFAZER restaure o estado pendente do cartão e sua contagem, cancelando a decisão ainda não publicada; manter para arquitetura o efeito compensatório quando dados já foram publicados.

## Scope honesty — strong

O MVP §9 inclui explicitamente FR-31…FR-40; §8 registra fibra terrestre, tradução integral, trading, carteiras e incidentologia de cabos como fora. O addendum distingue snapshots/dados reais de simulação e as duas variantes do protótipo. Isso evita inferir que BACKBONES/OSM estejam promovidos e integrados apenas porque seus assets existem.

Há 11 linhas de questões abertas, uma premissa inline e um item correspondente em §12. Essa densidade é aceitável para um produto de um usuário que vai entrar em arquitetura, pois os gates são atribuídos. Licença/proveniência TeleGeography, mapeamento estação↔cabo e fontes de reserva para macro não foram ocultados. `final` em §11 descreve estado editorial e não prontidão de implementação.

## Downstream usability — adequate

FR-1…FR-40 são contínuos e únicos, UJ-1…UJ-3 têm Andre como protagonista, e SM-1…SM-3/SM-C1…SM-C3 têm rastreabilidade. Cada seção pode ser extraída com seu Glossário e referências locais; §11 ajuda o arquiteto a distinguir decisões e contratos pendentes. A lista do addendum B exige curadoria antes da publicação, sem transformar dados societários antigos em verificação atual.

### Findings

- **[low] Glossário de Índice/Fonte ficou estreito para o novo escopo** (prd.md §3:60-61; FR-36:392,394-395; FR-39/FR-40) — “Índice — Indicador de mercado exibido na Faixa de cotações: [quatro]” não acomoda os índices mundiais do painel, apesar de o termo ser usado em MERCADOS. Fonte ainda enumera apenas modelos/notícias/cotações, sem TeleGeography e mapas/tiles; nesse caso a enumeração pode ser lida como ilustrativa, porém ficou desatualizada. *Fix:* generalizar Índice para indicador exibido em Faixa/MERCADOS e deixar os quatro obrigatórios em FR-18; ampliar Fonte para dados e serviços geográficos, com exemplos no addendum. Não misturar títulos/commodities/Bitcoin com índices.

## Shape fit — strong

A estrutura é leve o suficiente para um produto pessoal, com dono único e três jornadas úteis, e rigor suficiente para alimentar arquitetura, UX e stories. Não precisa PRFAQ, personas adicionais, seções de inovação ou governança empresarial. O addendum absorve evidência de provedores, escolhas sugeridas e limitações; o PRD conserva o comportamento de produto.

## Mechanical notes

- Continuidade/uniquidade: **FR-1…FR-40, UJ-1…UJ-3 e SMs existentes preservados**; não há motivo para renumerar segundo os IDs sugeridos anteriormente na extração.
- Premissas: a única `[ASSUMPTION]` inline em §6 possui entrada correspondente em §12. A antiga premissa de sedes próximas saiu, pois foi decidida como espalhamento.
- O frontmatter segue `draft` durante o Reviewer Gate; mudar para `final` depois da incorporação dos achados é ação editorial, não evidência de integração.
- A redução de movimento da Faixa já está em FR-18:236 e a disponibilização do horário em telas menores em FR-25:305; não registrá-las como ausentes apenas porque o mock tinha lacunas.
- BACKBONES/OSM estão efetivamente no contrato final, com fonte/licença e gate; a ausência nas spines UX está informada em addendum §G e não é omissão do PRD.
- **Fallback macro versus FR-19:** FR-19:245 e §6:442 exigem reserva em linguagem geral; FR-19:246 e addendum A explicam que essa cobertura para macro/cripto/índices mundiais ainda precisa comprovação e aceitam dado indisponível/último válido. O gate §11:514 torna isso uma questão explícita, não uma alegação de backup já implementado. Não classifico como bloqueador; na destilação para stories, indicar o alcance da obrigação original e quais ativos novos dependem de cobertura confirmada evita interpretações contraditórias.
- **Restrição herdada sobre edição manual:** o Glossário Cadastro (§3:48) permite aprovação na Fila **ou edição manual**, enquanto a descrição §4.7:290 diz “O Cadastro só muda pela Fila de revisão”. O contexto de §4.7 é o pipeline de Atualização, que não deve fazer edições curadas automáticas. Clarificar “na Atualização, mudanças curadas só são publicadas após revisão” elimina a leitura global contraditória, sem revogar a edição manual do dono nem dar escrita ao Agente. Não é falha material para o gate de arquitetura.
- **Restrições herdadas efetivamente corrigidas:** Faixa na base, Tabela em aba, OSIRIS como referência, seis temas, Notícias em todas as superfícies, smartphone funcionalmente completo e exceção macro/Bitcoin estão no PRD vigente. Não resta a rejeição de cartões do addendum anterior; heatmap continua fora.
- **[low] Cor semântica por tipo de Relação ficou implícita** (prd.md FR-31:342-343; UX `.memlog.md:23`; DESIGN.md:300-307) — O PRD pede direção/tipo e filtros, mas não registra a decisão confirmada de diferenciar os cinco tipos por cor. Isso não bloqueia arquitetura, pois DESIGN traz o mapeamento, porém seria útil manter a rastreabilidade dessa decisão. *Fix:* declarar que o tipo é diferenciado por cor semântica conforme UX, com nome textual no Terminal/popover; não copiar hex para o PRD.

## Encaminhamento do gate

**Reviewer Gate aprovado para finalização editorial e encaminhamento à arquitetura.** Os seis achados desta revisão estão resolvidos. Manter §11 e os gates técnicos: eles são parte honesta deste PRD e pertencem à próxima etapa, não uma falha de completude editorial. Aprovação documental não comprova implementação ou integrações.
