---
project: LLMs
checked: 2026-10-12
status: concerns
documentaryCoverage: pass
documentaryStructure: pass
documentaryDependencies: pass
fullImplementationReady: false
productionAuthorized: false
---

# Revisão documental dos épicos e stories

## Resultado e autorização

Andre autorizou diretamente nesta conversa: “bmad-help pode aprovar as demais Stories sem passar pela minha validação”. A autorização substitui as revisões individuais e confirmações entre épicos da etapa 3 para este planejamento de FR-1 a FR-40 nos oito épicos. A atualização da Story 3.5 também recebeu “sim” após a proposta apresentada.

Foram reconciliadas e aprovadas **35 stories**, distribuídas em **6 / 5 / 5 / 7 / 4 / 4 / 3 / 1** pelos Epics 1–8. O lote inicial tinha 32. As três fatias adicionais separam adapter Cesium, Relações/prévias e finanças/demonstração em Notícias; o detalhe geográfico antigo 8.2 passa a 4.3. O escopo permanece nos 40 requisitos, sem voos, análise financeira real ou aprovação de fornecedores.

Fontes, versões e hashes constam no [registro reconciliado](../approvals/story-approvals-reconciled-2026-10-12.json). O [registro inicial](../approvals/story-approvals-2026-10-12.json) foi preservado; quinze blocos mantêm o hash inicial, incluindo todos os Epics 1/2 e as Stories 3.1–3.4.

**epics.md salvo como draft, 9 verificações de prontidão abertas.** Cobertura, estrutura, arquitetura e ordem de dependências passaram documentalmente; os gates abaixo impedem declarar todas as stories prontas para integração. A etapa 3 está concluída; a avaliação da etapa 4 foi executada com resultado concerns e não foi marcada como concluída em stepsCompleted. Não foi oferecido nem escolhido C para finalizar como final.

## Conferências da etapa 4

| Conferência | Resultado | Evidência/limite |
|---|---|---|
| Cobertura de FR | PASS documental | 40/40 referenciados e revisados pelas capacidades da tabela abaixo. |
| Cobertura de UX | PASS documental | 41/41 têm consumidor explícito; tokens/deltas continuam normativos e Q3 permanece aberto. |
| NFR | PASS documental | Desempenho, confiabilidade, segurança, acessibilidade e portabilidade têm critérios e gates. |
| Estrutura/numeração | PASS | Oito seções e stories consecutivas dentro de cada épico; 35 IDs únicos, sem placeholders de template. |
| Critérios | PASS documental | Cada story tem Given/When/Then equilibrados e comportamento/erro identificável; quantidade abaixo. |
| Starter | Não aplicável como escolha fechada | A spine §Build Shape diz que Vite/TypeScript/Cloudflare são alternativas/propostas e preserva ESM; Q2/Q9 ainda decidem infraestrutura/build. Não há starter escolhido que exija trocar a Story 1.1 por clone/scaffold. |
| Entidades | PASS documental | Contratos/entidades são criados quando a primeira fronteira precisa deles; nenhum épico cria banco inteiro ou todos os tipos antecipadamente. |
| Tamanho | PASS para as fatias planejadas | Renderer básico, camadas, Empresas, Relações, Terminal e acabamento são separados; as integrações recebem decisões/gates antes do desenvolvimento. |
| Independência/ordem | PASS documental | Entradas por contratos/fixtures e consumidores anteriores; referências futuras são extensões/portas, sem bloquear a capacidade atual. |
| File churn | Justificado | Domain/Contracts tem autor único; outros módulos consomem schemas/intents. Composer é extensível por recurso, inclusive BACKBONES; store/URL não são reimplementados por UI/provider. |
| Prontidão completa | CONCERNS | Nove grupos de gates abertos; aprovação de story não os resolve. |

## Cobertura funcional

| Requisito | Stories | Capacidade conferida |
|---|---|---|
| FR-1 | 4.4 | Pontos por Empresa/localização elegível; classes Q8 e coordenadas preservadas. |
| FR-2 | 4.1, 4.4 | Filtros por Camada principal ou Etiqueta; contagens pela principal e preferências. |
| FR-3 | 4.4 | Pulso de sete dias pelo último Lançamento, decaimento e redução de movimento. |
| FR-4 | 4.4 | Logo local/monograma no zoom regional conforme limiar Q3. |
| FR-5 | 4.4, 4.6 | Prévia de cerca de 300 ms apenas com mouse; toque seleciona diretamente. |
| FR-6 | 4.1, 4.6 | Terminal, campos disponíveis, links, fechamento, coexistência e foco. |
| FR-7 | 4.6 | Digitação/ASCII nas alternativas; conclusão imediata por Esc/clique/redução de movimento e delta AA. |
| FR-8 | 4.6 | Som gerado no browser, OFF inicial, gesto, canais/volumes e preferências. |
| FR-9 | 3.3, 3.4, 3.5 | Campos da comparação, benchmarks, ausência distinta de zero e atribuição. |
| FR-10 | 3.3, 3.5 | Filtros combinados e ordenação numérica preservada entre estilos. |
| FR-11 | 3.1, 3.5 | Fórmula 2.000+1.000 tokens, precisão decimal, ≈ e explicação. |
| FR-12 | 3.3, 3.4, 3.5 | Tempo até a resposta e explicação de raciocínio. |
| FR-13 | 2.4, 3.2, 3.4 | IDs canônicos, variantes/aliases e correspondência incerta com decisão humana. |
| FR-14 | 5.1, 5.2 | Coleta/dedup, cinco por Empresa e duas semanas. |
| FR-15 | 5.1, 5.2 | Seis homônimos, 50/90% como aceite futuro, relevância e feedback/supressão. |
| FR-16 | 5.2, 5.4 | Síntese em português, título/veículo/data/link preservados e fallback. |
| FR-17 | 5.2 | Saída fixa validada fora do LLM, conteúdo externo sem autoridade de escrita. |
| FR-18 | 6.1, 6.3 | Quatro índices obrigatórios, ações aplicáveis e identificação/unidades. |
| FR-19 | 1.5, 6.1, 6.2, 6.3, 6.4 | Quinze minutos em pregão, pós-close, calendário/fuso, atraso e reserva comprovada. |
| FR-20 | 2.2, 2.3, 6.1 | Lista inicial, dados/vínculos/tickers conferidos e IDs únicos. |
| FR-21 | 2.3 | Logos oficiais locais, monograma e aviso de marcas. |
| FR-22 | 2.2, 2.3 | Descoberta só propõe, origem por campo e quota global atômica. |
| FR-23 | 2.1, 2.2, 2.3, 2.4, 2.5, 4.5 | Fila/decisões/prévias, staged, conflitos, undo e compensação. |
| FR-24 | 1.2, 1.5 | Cadências por tipo, scheduler local/durável conforme gate. |
| FR-25 | 1.1, 1.2, 1.3, 1.6, 6.2 | Last-good, invalidade, status comum e horários. |
| FR-26 | 3.2, 3.4, 4.4 | Datas por precedência, identidade única e detecção/Pulso. |
| FR-27 | 3.5, 4.1, 4.7 | AA Light inicial/escuro opcional, alternativas e preferências. |
| FR-28 | 4.2, 4.3, 5.4, 8.1 | Origem/horário e créditos de fontes/camadas ativas. |
| FR-29 | 4.7, 6.3 | Todas as funções alcançáveis por celular, toque e layout adaptado. |
| FR-30 | 1.4 | Dados, comandos e histórico privados e proteção do dono. |
| FR-31 | 2.1, 2.2, 2.4, 4.5, 4.6, 8.1 | Curadoria, arcos dirigidos/filtros/seleção, Terminal e ausência de vínculo inferido. |
| FR-32 | 4.1, 4.2, 4.3, 4.7 | Globo 3D, MAPA/SAT, navegação, camadas, terminador e ajuda. |
| FR-33 | 5.1, 5.3 | FLUXO/LABS, filtros/contagens, regiões, Lançamentos e destinos. |
| FR-34 | 5.1, 5.2, 5.3, 5.4 | Leitor, síntese/links, imagens vinculadas, layouts, exclusividade e foco. |
| FR-35 | 7.2, 7.3 | Pesquisa read-only, fontes/datas, orçamento, streaming, navegação e Histórico. |
| FR-36 | 6.1, 6.3, 6.4, 7.2 | Mercados, favoritos/WATCH, contexto financeiro em Notícias e especialista demo separado. |
| FR-37 | 7.1 | Busca por tipo/ID, destinos, sem resultados e supressão. |
| FR-38 | 4.1, 7.1 | URL com base canônica/aliases, saneamento e overrides sem segredos/persistência indevida. |
| FR-39 | 8.1 | BACKBONES OFF inicial, cabos/estações, conexões confirmadas, licença e crédito. |
| FR-40 | 4.2, 4.3, 8.1 | Detalhe OSM/SAT/fotorealismo progressivo, histerese, cache/créditos e falha sem trocar MAPA. |

FR-23 e FR-31 mantêm curadoria no Epic 2 e completam prévias/Relações no Epic 4. FR-36 tem as superfícies do Epic 6 e o consumidor de contexto no chat do Epic 7. FR-40 pertence ao compositor do Epic 4; não ficou no épico de cabos.

## Cobertura de UX

As referências abaixo apontam ao comportamento e aos tokens do inventário e dos pares DESIGN/EXPERIENCE principal e Artificial Analysis. São contratos documentais; a tabela não declara prova de browser, contraste ou acessibilidade executada.

| Requisito UX | Stories consumidoras |
|---|---|
| UX-DR1 | 1.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.7, 5.3, 6.3, 6.4 |
| UX-DR2 | 3.5, 4.1, 4.4, 4.6, 5.3, 6.3, 6.4, 7.2 |
| UX-DR3 | 4.2, 4.7 |
| UX-DR4 | 4.4 |
| UX-DR5 | 4.4 |
| UX-DR6 | 4.4 |
| UX-DR7 | 4.4 |
| UX-DR8 | 4.5 |
| UX-DR9 | 4.6 |
| UX-DR10 | 4.6 |
| UX-DR11 | 5.3 |
| UX-DR12 | 5.3 |
| UX-DR13 | 5.3 |
| UX-DR14 | 4.7, 6.3 |
| UX-DR15 | 1.3, 5.4 |
| UX-DR16 | 4.7 |
| UX-DR17 | 4.3 |
| UX-DR18 | 4.7 |
| UX-DR19 | 4.7 |
| UX-DR20 | 4.7 |
| UX-DR21 | 4.7, 6.3 |
| UX-DR22 | 4.7, 6.3 |
| UX-DR23 | 4.7, 6.3 |
| UX-DR24 | 6.3 |
| UX-DR25 | 4.7 |
| UX-DR26 | 4.6, 4.7 |
| UX-DR27 | 7.1 |
| UX-DR28 | 4.6, 4.7, 7.1 |
| UX-DR29 | 4.3 |
| UX-DR30 | 4.7 |
| UX-DR31 | 4.4, 4.7 |
| UX-DR32 | 3.5 |
| UX-DR33 | 5.3 |
| UX-DR34 | 7.2, 7.3 |
| UX-DR35 | 2.4, 2.5 |
| UX-DR36 | 2.4, 2.5 |
| UX-DR37 | 5.3 |
| UX-DR38 | 2.3, 4.4, 5.3, 6.3 |
| UX-DR39 | 3.5, 4.7, 5.3, 7.1 |
| UX-DR40 | 3.1, 3.2, 3.3, 3.4, 5.1 |
| UX-DR41 | 2.3, 2.4, 2.5, 3.5, 4.1, 4.6, 4.7, 5.3, 6.3, 6.4, 7.2, 7.3 |

## NFR e arquitetura

- **Desempenho:** 4.2/4.3 controlam carga/ciclo de vida; 4.7 exige matriz Q9 e cerca de 3 s/60 fps/30 fps com cerca de 200 Empresas e camadas representativas.
- **Confiabilidade:** 1.1/1.3/1.6, 4.2/4.3, 5.1 e 6.2 preservam última revisão válida, estados e datas.
- **Segurança:** 1.4, 2.1, 4.2, 5.2, 7.2/7.3 preservam dono, comandos versionados, credenciais, orçamento, conteúdo externo e privacidade.
- **Acessibilidade:** 3.5, 4.4–4.7, 5.3, 6.3/6.4 e 7.1–7.3 incluem foco/teclado/toque/contraste/redução de movimento e gates.
- **Portabilidade:** AD-16 publica schemas no primeiro consumidor; snapshots/intents/composer/streaming não possuem regras paralelas por provider.

AD-1 a AD-17 foram mantidos. Snapshot/CAS/fencing/ledger permanecem no Epic 1; decisões staged/undo/compensação no Epic 2; identidade/unidades no Epic 3; estado canônico/adapter/composer no Epic 4; agentes continuam limitados. Q10 e a decisão arquitetural de Q11 permanecem resolvidos; seus gates de execução não são reabertos como decisões de produto.

## Ordem, independência e IDs

| Área | Justificativa |
|---|---|
| Epic 2 antes do 3 | Curadoria funciona com propostas/IDs/fixtures e publicação do Epic 1; pares podem chegar depois, sem exigir ingestão real antecipada. |
| Epic 3 | Cálculo, datas e projeção local funcionam antes dos adaptadores de Fonte; a interface consome contratos anteriores. |
| Epic 4 | 4.1 define store/base/URL; 4.2 adapter; 4.3 camadas; 4.4 Empresas; 4.5 Relações/prévias; 4.6 Terminal/som; 4.7 acabamento. Intents/projeções produzidos em 4.4/4.5 habilitam o Terminal posterior sem depender dele. |
| Epic 5 | Projeção/feedback precedem Agente e interfaces. Leitor/Notícias funcionam sem a extensão financeira posterior. |
| Epic 6 | Matriz precede coleta e UI. Resumo do Agente é uma porta com indisponibilidade explícita até o chat; consultar mercados não espera o Epic 7. |
| Epic 7 | Busca/URL precedem chat; chat cria somente os registros mínimos necessários e funciona antes da lista de retomada/exclusão do Histórico. |
| Epic 8 | Só depende do compositor anterior e seu próprio gate Q4; não altera o domínio de Empresas/Relações. |

| ID anterior | ID atual | Ajuste |
|---|---|---|
| 4.1 | 4.1 | Store e contrato canônico base/URL. |
| 4.2 | 4.2 / 4.4 / 4.5 | Adapter, Empresas e consumidor visual de Relações/prévias separados. |
| 4.3 | 4.6 | Terminal/som depois de entidades e projeções. |
| 4.4 | 4.7 | Famílias/controles/acessibilidade depois das superfícies do Globo. |
| 8.2 | 4.3 | Detalhe geográfico junto de MAPA/SAT e fotorealismo. |
| 6.3 | 6.3 / 6.4 | MERCADOS separado da extensão financeira/demonstração em NOTÍCIAS. |

local-plan.json e eventuais arquivos sprint-status foram preservados. Antes da execução pelo novo plano, Sprint Planning precisa reconciliar seus IDs e manter o histórico de implementação das fatias antigas, sem transferir done automaticamente para uma story de escopo alterado.

## Gates e prontidão

| Grupo aberto | Condição necessária |
|---|---|
| Q1/Q7 | Fornecedor LLM/busca, verba/tetos, retenção/exclusão e tamanho editorial antes das integrações afetadas. |
| Q2 | Hospedagem/IdP/custo e prova de autorização, transações/CAS/fencing, jobs, recuperação e sete dias operacionais. |
| Q3 | Acabamento, emblema, controles móveis/foco, contraste sobre texturas, leitores de tela e evidência de browser. |
| Q4 | Origem/data/licença e associação cabo/estação para BACKBONES. |
| Q5 | Matriz de instrumentos, símbolos/listagens/unidades, calendários, histórico e cobertura principal/reserva. |
| Q6 | Base inicial, providers/cobertura/composição, credenciais, licença/custo/quota/cache/créditos e histerese. |
| Q8 | Significado, precisão, evidência própria e classe visual/seleção/limite de câmera das localizações reais. |
| Q9 | Estratégia Cesium CDN/npm/build, assets/workers/CSP/WebGL e matriz/desempenho/recuperação do renderer. |
| Q11-implementação | Publicar/adotar o contrato executável base/URL antes de consumidores. A decisão arquitetural está resolvida; src/contracts/exploration.mjs ainda exporta VIEWS legadas 3D/2D/MAPA/SAT. |

Na leitura atual, src/contracts/exploration.mjs ainda exporta VIEWS com 3D/2D/MAPA/SAT. A migração exigida por Q11 é trabalho da Story 4.1; este relatório não declara esse código implementado nem testa seus consumidores.

Os gates são decisões/provas necessárias antes das integrações afetadas. Não foi escolhido provider, custo, base inicial, significado de localização, retenção ou estratégia de runtime para suprir um gate silenciosamente. As regras locais podem ser desenvolvidas conforme seu escopo, enquanto UI/providers/produção continuam condicionados.

## Stories e critérios

| ID | Story | Cenários Given/When/Then |
|---|---|---|
| 1.1 | Manter os dados publicados quando uma Fonte falha | 4 |
| 1.2 | Aplicar o orçamento das rotinas automáticas | 5 |
| 1.3 | Mostrar o status e o horário de atualização por tipo de dado | 4 |
| 1.4 | Restringir dados e comandos privados ao dono | 5 |
| 1.5 | Agendar atualizações na cadência de cada dado | 5 |
| 1.6 | Executar e recuperar Atualizações sem publicações duplicadas | 6 |
| 2.1 | Aprovar, editar e rejeitar propostas com revisão registrada | 6 |
| 2.2 | Receber propostas de descoberta com evidência e quota | 7 |
| 2.3 | Conferir o Cadastro inicial e os logos antes da primeira publicação | 7 |
| 2.4 | Operar a Fila de revisão com evidências, decisões e prévias | 8 |
| 2.5 | Desfazer alterações publicadas com compensação auditável | 7 |
| 3.1 | Calcular custo por tarefa com preços ausentes/zero | 2 |
| 3.2 | Resolver datas e perceber Lançamentos únicos | 2 |
| 3.3 | Consultar a comparação com filtros combinados | 2 |
| 3.4 | Normalizar APIs estruturadas e identidade por Fonte | 2 |
| 3.5 | Apresentar a comparação de Modelos no padrão Artificial Analysis e nos estilos existentes | 7 |
| 4.1 | Manter estado, bases e preferências no store compartilhado | 6 |
| 4.2 | Integrar o renderer Cesium ao Globo principal | 6 |
| 4.3 | Compor terreno, edifícios e detalhe automático de MAPA/SAT | 7 |
| 4.4 | Mostrar e selecionar Empresas e Lançamentos no Globo | 6 |
| 4.5 | Explorar Relações e prévias fantasmas sem publicar propostas | 5 |
| 4.6 | Operar Prévia, Terminal e som por teclado e toque | 6 |
| 4.7 | Aplicar famílias visuais, navegação e acesso completo no celular | 7 |
| 5.1 | Projetar e ocultar Notícias nas cinco superfícies | 5 |
| 5.2 | Coletar e validar resumos sem dar autoridade de escrita ao Agente | 5 |
| 5.3 | Operar FLUXO, LABS, NOTÍCIAS e Leitor com contexto | 6 |
| 5.4 | Manter origem e créditos nas projeções de dados | 4 |
| 6.1 | Confirmar instrumentos, cobertura, calendários e fontes de reserva | 4 |
| 6.2 | Atualizar cotações respeitando sessões, atraso e falha parcial | 5 |
| 6.3 | Explorar a Faixa e o Painel MERCADOS | 6 |
| 6.4 | Mostrar finanças em NOTÍCIAS e a demonstração do especialista em ações | 5 |
| 7.1 | Buscar entidades e restaurar o contexto da URL | 4 |
| 7.2 | Pesquisar com fontes, navegação tipada e orçamento separado | 6 |
| 7.3 | Retomar e excluir o Histórico privado | 5 |
| 8.1 | Validar a fonte e explorar BACKBONES com contexto | 5 |

## Limites desta verificação

Foram feitas leituras e conferências de Markdown/JSON, hashes, referências e fontes normativas locais. Não foram executados testes de produto, chamadas de API/LLM, browser, medição de desempenho, auth/CSRF/CAS durável, instalação de pacote, criação de segredo, migração, push, publicação ou deploy.

As alterações preexistentes em package.json, src/contracts/exploration.mjs, src/domain/exploration-state.mjs, tests/exploration.test.mjs e local-plan.json conservaram seus hashes capturados antes desta revisão. A evidência de done-local da base antiga permanece histórica; este aceite não promove implementação nova a done/ready.

O próximo passo é Sprint Planning para reconciliar tracking/IDs e planejar apenas o trabalho elegível, mantendo as nove verificações abertas e as decisões/provas de integração com seus responsáveis.
