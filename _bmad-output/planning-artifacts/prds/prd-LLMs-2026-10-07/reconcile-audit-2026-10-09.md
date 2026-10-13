# Auditoria da reconciliação pós-edição — 2026-10-09

Escopo: `prd.md` e `addendum.md` atuais, comparados com `reconcile-baseline-2026-10-09.md`, o histórico preservado em `.memlog.md` do PRD e as decisões posteriores no `.memlog.md` da UX. Nenhum PRD, addendum ou log foi alterado por esta auditoria. A verificação é documental; não valida fontes externas, APIs ou o protótipo.

## Veredito

A reconciliação preserva as invariantes do produto e aplica os overrides centrais autorizados. Não encontrei perda substantiva de requisito original, reintrodução de decisão antiga já substituída, corte indevido do novo escopo ou promessa de integração real. Restam duas explicitações pequenas no PRD para transmitir integralmente comportamentos já aprovados na UX; ambas podem ser aplicadas sem nova decisão do usuário. As escolhas técnicas listadas em §11 são pendências intencionais com responsáveis e marcos, não lacunas desta atualização.

## Preservado

| Núcleo | Evidência atual |
|---|---|
| Uso pessoal, foco em Labs, ecossistema curado, sem Nasdaq inteira ou seleção por bolsa | §1–3, §8, FR-20, addendum §B/E |
| Laboratório treina base própria; limiar HF ≥10 mil downloads/30 dias; hosts não contam | Glossário §3 |
| Cinco Camadas empresariais, principal define cor, Etiquetas respondem a filtros; Tesla em Software | §3, FR-1/2/20, addendum §B |
| Lista inicial obrigatória, inclusive fora Nasdaq e Labs privados | FR-20, tabela integral do addendum §B; tickers/vínculos têm verificação de curadoria |
| Modelo único/variantes, incerteza revisada, campos ausentes como “—”, índices/benchmarks/modos/contexto/latência | §3, FR-9–13 |
| Tarefa 2.000+1.000, fórmula própria, ≈ em raciocínio | FR-11/12, addendum §C |
| Pulso na janela original de sete dias, precedência AA>HF>OR, sem reset de Modelo antigo | §3, FR-3/26 |
| Notícias até cinco/Empresa, duas semanas, deduplicação, ≥90% relevância, título/link sempre | FR-14–17, FR-34 |
| Notícias hostis, agentes sem publicação direta, curadoria/relações por aprovação, lista inicial na Fila, dez propostas novas/semana | FR-17/22/23/31, addendum §D/H |
| Atualização horária, cotações ~15 min/pós-fechamento, últimos dados válidos, guarda contra respostas incompletas | FR-19/24–26; a guarda foi corretamente restringida a coleções comparáveis |
| Teto notícias+descoberta ≈US$5, degradação 80%/100%, sem presumir chat ilimitado | §6, FR-35, addendum §D |
| Acesso do dono a interface/dados/Fila/Histórico, segredos fora navegador, URL não concede acesso | FR-30/35/38, §5, addendum §D/H |
| Logos oficiais locais, monograma, marcas creditadas, atribuição AA, sem scraping | FR-21/28, §6, addendum §A/E |
| Reduzir movimento, teclado/toque, foco, contraste AA, metas de desempenho, leitura tolerante a falhas | §5; critérios adicionais antes das stories em addendum §H |
| Fora da v1: Nasdaq inteira, carteira/negociação/alertas/tempo real, benchmark próprio, contas públicas, IA física, perfil variável, fibra terrestre, tradução integral | §8/9.2, addendum §E |

## Substituído ou ampliado corretamente

- **Organização visual:** OSIRIS como referência, AA como densidade/conteúdo; Faixa na base; MODELOS em aba e três estilos com padrão HÍBRIDO; seis temas e exceção dia/noite da Sala de controle noturna; Globo imersivo e marca (§1/3/7; FR-9/27/32).
- **Labs:** hierarquia de losango/rótulo/brilho e espalhamento confirmados; a definição substantiva de Lab inclui Empresa com Etiqueta Laboratórios, preservando cor principal e Ponto único (FR-1; addendum §G). A antiga premissa de colisões saiu do índice.
- **Terminal e som:** exceções a clique fora, arrasto não fecha, prioridade de Esc, coexistência de janelas, canais ambiente/digitação OFF e volumes separados (FR-6–8).
- **Notícias/Leitor:** múltiplas superfícies, Fluxo padrão persistido, filtro só Labs, LABS com três notícias expansíveis, resumo estendido/pontos-chave, link original em nova guia, leitor lateral/flutuante e ocultação confirmada em todas as superfícies (FR-15/16/33/34).
- **Relações:** entidade dirigida com cinco tipos, rede sutil/toggle/filtro, Fila/origem, lista no Terminal e proteção contra inferência de vínculo por proximidade de cabo (FR-22/23/31).
- **Chat e MERCADOS:** pesquisa local/web com fontes, ações de navegação visíveis, Histórico, erro/orçamento; dez cartões, macro/Bitcoin/índices mundiais, amplitude, minigráfico, WATCH, busca e resumo do Agente (FR-35/36). Proibições antigas de outros mercados e cartões foram removidas; heatmap continua fora sem reintroduzir restrição aos cartões aprovados.
- **Fila:** cartões/badge/estado de botão, aprovação/edição/rejeição, pares de Modelos, prévia fantasma, desfazer, exclusividade com Leitor lateral/MERCADOS (FR-23).
- **Geografia/navegação:** quatro vistas, pinça do Globo, atalhos/ajuda, terminador, leitura de cursor, rótulos de lugares, busca global, URL de sessão, BACKBONES e OSM (FR-32/37–40).
- **Portabilidade:** substituiu “interface somente lê arquivos” por snapshots + contratos autenticados independentes da hospedagem; reconhece escrita de Fila e execução/persistência de chat (PRD §5, addendum §D/H).
- **Celular:** preserva todas as funções, inclusive novo escopo, com desktop/tablet prioritários no acabamento (FR-29), sem usar “básico” como corte funcional.

## Deferido explicitamente, com dono e momento

O PRD §11 e o addendum §A/D/F/G/H cobrem hospedagem/autenticação/serviços de escrita, efeito de DESFAZER publicado, modelos/busca/orçamento extra, retenção/exclusão do Histórico, eventual proposta pelo chat, fontes/cadência/calendário de MERCADOS, licença/proveniência de cabos e associação estação↔cabo, provedor/estilo/cache/limiar de tiles, critérios de status, acabamento móvel/2D/SAT/ajuda/marca, navegação acessível entre muitos Pontos, curadoria de contatos/tickers e verificação de contraste/desempenho com infraestrutura.

Essa delegação não reabre autorizações de escopo. Cabos e OSM seguem na v1; sua licença e implementação precisam confirmação factual antes de publicar. A verificação de fonte TeleGeography registrada pelo editor corrige a confiança na licença do snapshot sem remover a função. Os números 733/1.926 são fotografia local, não exigência de cobertura constante.

## Audit do histórico de decisões antigas superseded

| Registro antigo | Substituição registrada | Estado vigente nos documentos |
|---|---|---|
| Fila e descoberta ficam v1.1, Cadastro editado em arquivo | PRD memlog: `(change) Fila de revisão e Agente de descoberta ... movidos para o MVP a pedido do usuário` | FR-22/23 e §9 incluem ambos no MVP; não voltou a v1.1 |
| Tarefa, notícias, atualização e US$5 como premissas | PRD memlog: confirmações explícitas subsequentes | Valores continuam requisitos; somente separação contábil do custo adicional aparece como premissa em §12 |
| Celular básico interpretado como cobertura mínima | PRD responsividade completa; UX posterior esclarece todas as funções, básico só acabamento | FR-29 registra cobertura integral; §9 reforça; não houve redução funcional |
| Pontos próximos agrupados ou espalhados, adiado | UX aprovou espalhamento leve/rótulos | FR-1 resolveu a premissa; addendum §G preserva coordenadas verdadeiras |
| Login da hospedagem como premissa | Arquitetura aberta, autorização do dono obrigatória | FR-30 é requisito, §11 decide implementação; não depender de proteção de página que exponha dados/endpoints |
| Faixa no topo/Tabela abaixo/AA visual/dois temas/clique fora fecha sempre | Override de 09/10 no PRD memlog e decisões UX | Base/abas/OSIRIS/seis temas/exceções em FR-6/9/18/27 e visão |
| LABS como aba esquerda inicial na sugestão de v5 | UX decidiu Fluxo padrão, escolha salva | FR-33 mantém Fluxo padrão |
| Lista de Relações no Terminal não escolhida | UX decisão posterior mantém lista →/← | FR-6/31 a incluem |
| Cartões financeiros rejeitados; sem macro/cripto | UX aprovou MERCADOS | FR-36/§8/addendum §E permitem escopo autorizado; não reabre Nasdaq inteira/heatmap |
| 3D sempre dia, MAPA sempre noite | UX exceção Sala de controle noturna escura | FR-32 preserva exceção |
| Interface totalmente estática, só leitura | Chat/revisão/Histórico já aprovados | §5/addendum §D reconhecem execução/escrita autenticada |
| PRD finalized em 07/10 | Novo evento de atualização documental autorizada em 09/10, ainda sob revisão editorial | Estado de 07/10 é histórico; nenhuma aprovação nova da ideia foi presumida |

O memlog é append-only e conserva os registros antigos; suas entradas posteriores estabelecem a precedência necessária. Não é preciso apagar ou editar decisões antigas para confirmar que foram substituídas. Não encontrei requisito atual sustentado apenas por uma premissa antiga superseded.

## Lacunas remanescentes de rastreabilidade

1. **FR-32 (§4.9): paridade funcional da vista 2D.** A UX aprovou explicitamente mapa plano “com os mesmos Pontos, Relações e Terminal”. O PRD diz apenas “2D (mapa plano)” e delega seu desenho à UX. Acrescentar a preservação desses três elementos evita que a arquitetura trate 2D como textura/mapa sem seleção de Empresas. A forma/tecnologia permanece com UX/arquitetura; a cobertura já está decidida.
2. **FR-27 (§4.8): atalho claro/escuro da mesma família.** A UX confirmou seletor de seis temas e atalho ☀/☾ que alterna o par da família atual. O PRD preserva as seis opções/padrão/persistência, mas não o comportamento do atalho; o addendum tampouco o explicita. Acrescentar esse comportamento para impedir que o botão troque também a família. Nenhuma nova aprovação é necessária.

Sem gaps substantivos adicionais. Não classifiquei como lacuna o que já está expresso em §11 ou delegado ao DESIGN/EXPERIENCE para tokens, medidas e acabamento, nem pedi revalidação de decisões confirmadas pelo usuário.
