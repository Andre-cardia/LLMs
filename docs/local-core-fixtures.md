# Fundações locais do Monitor Global de Labs de LLM

Os fundamentos históricos cobrem fatias locais de snapshots, orçamento, curadoria, Modelos, Notícias, exploração e busca; não comprovam conclusão integral das stories atuais. A Story 4.1 recebeu contrato/store/URL v2 e provas locais descritas abaixo, com revisão automatizada concluída e [aceite humano do escopo local](../_bmad-output/implementation-artifacts/acceptance-4-1-local.md) após walkthrough e demonstrações; os itens diferidos permanecem abertos. A Story 7.1 e o épico 4 não são declarados concluídos. Apresentação, Fontes reais e infraestrutura conservam os gates do planejamento.

## Executar

- `npm test`: contratos, domínio, orquestração e adaptadores simulados.
- `npm run check`: sintaxe de todos os módulos ESM de src/scripts/tests.
- `npm run demo:local`: cenário integrado, dados fictícios e JSON de saída.
- `npm run demo`: demo anterior de preços, preservada.

Não há dependências npm, HTTP, SDK de Fonte, cron, servidor, credencial, implantação ou orçamento real. Node 25.9.0 é o runtime disponível no Mac; Node 24 LTS e browsers ainda precisam de validação no incremento correspondente. `example.invalid` identifica todas as evidências simuladas.

## Limite das provas

`MemoryControl`, `MemorySnapshots`, `MemoryCuration`, `MemoryNews` e `MemoryBudgetLedger` são adaptadores de um processo. Autorização injetada nega por padrão; símbolos usados nos testes representam dono/job/agente. Isso não prova JWT, CSRF, proteção de assets nem transação durável multi-processo. O publisher confirma catálogo curado, baselines e coleções por Fonte e recibo de Update numa transação de memória; CAS/fencing/rollback são exercitados nesse ambiente.

Slices inválidas/timeout conservam dados e horários anteriores. Negação explícita de acesso limpa o cache e impede a leitura composta. O leitor troca somente revisão inteira válida. Coleções completas vazias ou menores que metade do baseline comparável são rejeitadas. Notícias incrementais vazias são sucesso. Frescor é cálculo puro; ainda não existe scheduler/provider/calendário operacional.

O orçamento usa microUSD exatos e tetos zero por padrão. A porta de tentativa é simulada. Preço/limite desconhecido ou raciocínio sem limite verificável impede a tentativa. Reservas desconhecidas ficam comprometidas; overrun conserva gasto e exige reconciliação explícita autorizada com evidência simulada. Admissão real depende de Q1/Q7 e do teto autorizado.

Propostas não alteram Cadastro diretamente. Aprovação conserva a versão revisada; publicação posterior aplica alvos disjuntos e deixa conflitos staged. Evidência/fact dedup ignora novos horários de fetch; reenviar rejeitada precisa de Fonte independente. Reabertura por novo Modelo canônico e pares/logos reais dependem da integração correspondente. Compensação pós-publicação não é assumida automaticamente.

Notícias usam NewsId persistente e aliases exatos de URL/Fonte, sem similaridade de título. O índice conserva união de relevância/citação separadas. `LocalNewsView` compõe revisão do snapshot e feedback atual antes de retornar Terminal, Fluxo, LABS, NOTÍCIAS, Leitor, busca/navegação/contexto. Os utilitários puros pressupõem que o consumidor passe esse contexto. Confirmação cancelada não escreve; aliases conservam supressão owner-wide.

O reducer é a única transição semântica; URL não emite persistência, e ação explícita salva só o campo solicitado. Callbacks carregam token/revisão. O módulo não controla DOM, animação, teclado físico, WebGL, som ou foco real. Não substitui nem altera o protótipo UX.

## Story 4.1 — contrato local v2

- [Contrato compartilhado](../src/contracts/exploration.mjs): configuração, estado e intents exigem `schemaVersion: 2`; `NavigationTarget` permanece v1. Não há migração implícita do estado v1. Preferências legadas válidas são preservadas, assim como os padrões Artificial Analysis/light/analytic; família não força modo.
- `createExploration` exige `config: {schemaVersion: 2, initialBase, availableBases}`. Ambas as bases permitidas são `MAPA|SAT`; a inicial deve estar disponível. A configuração do [demo](../scripts/demo-local-core.mjs) é sintética e não decide produção. Opcionais `hiddenNewsIds`, `preferences` e `systemMode` preservam defaults quando omitidos ou `undefined`; seus descritores são validados antes da normalização.
- `projection: '3D'` é fixa. A base pertence à sessão, nunca às preferências. O intent `{schemaVersion:2,type:'base',base:'SAT'}` não emite efeitos e conserva seleção, Modelo, Terminal, Leitor, filtros, painéis, índice e tokens de operações existentes. Não escreve Pontos/Relações nem movimenta câmera.
- A [URL](../src/domain/exploration-url.mjs) serializa apenas `layers`, `base`, `tab` e `company`, sem segredos ou preferências. `base` presente prevalece mesmo inválida/duplicada/indisponível: fallback para a inicial injetada, sem consultar `view`. Somente na ausência de `base`, `view=MAPA|SAT` é alias; `view=3D` não escolhe base; `view=2D` usa a inicial, nunca uma projeção plana. `view`/`availableViews` são recusados nos contratos de estado/configuração/intents.
- O [reducer](../src/domain/exploration-state.mjs) valida entrada e saída completas: contador inteiro seguro não negativo, referências/IDs únicos do índice, derivações exatas de preferências/sessão/overrides, seleção dependente, tokens/status/revisão, layout e exclusividade entre laterais. Um incremento que excederia `MAX_SAFE_INTEGER` falha explicitamente. O limite não bloqueia callback válido, que não incrementa.
- Intents `camera` emitem somente `{type:'camera',companyId,token,snapshotRevision}`. O consumidor local confirma com intent v2 `callback` e `target:'camera'`; não há coordenadas, Cesium nem controle físico. Troca de Empresa, navegação, hidratação, saída do Globo e novo snapshot invalidam câmera. Base e preferência independentes não invalidam operações. Callback vencido ou duplicado retorna a referência anterior com efeitos vazios.
- Snapshot reconcilia remapeamentos explícitos de origem existente para destino disponível atomicamente; remoção sem substituição limpa seleção/Terminal com aviso. Limpar Empresa também limpa Modelo. Fila, MERCADOS e Leitor lateral são exclusivos **entre si**, mas coexistem com Terminal no Globo. Leitor flutuante pode coexistir com Fila/MERCADOS; NOTÍCIAS força lateral sem persistir a preferência.
- Configuração/preferências/intents/estado/snapshot/contexto URL recusam accessors e arrays com protótipo customizado antes de percorrê-los. A fronteira aceita dados JSON simples com profundidade de objetos/arrays limitada a 128 níveis, não promete isolamento de Proxy JavaScript hostil ou de ambiente global adulterado. A correção CR-01 memoriza, por chamada, a altura dos subgrafos já validados: referências compartilhadas não repetem o percurso, ciclos continuam proibidos e um caminho mais profundo revalida o limite de 128 níveis. Nenhuma mudança foi necessária em primitives ou nos outros domínios.

### Evidências e limitações

[Fixtures compartilhadas](../tests/fixtures/exploration-contract.json), [testes do contrato](../tests/exploration-contract.test.mjs) e [testes do store/URL](../tests/exploration.test.mjs) exercitam AC1–AC6 e todas as linhas da matriz: configuração, precedência canônica, aliases legados, rejeição segura e callbacks vencidos. Os estados inválidos passam pelo validador, reducer e serializador; getters próprios/herdados têm contador de execução zero. A preservação cobre Modelo selecionado, Leitor lateral/flutuante, Fila/MERCADOS e callbacks positivos/negativos.

Verificação após a correção CR-01: **37 testes de exploração/contrato, 38 incluindo demo, 108 totais, nenhum ignorado**; **52 módulos** passam na verificação de sintaxe em Node 25.9.0. Cinco testes adicionais cobrem referências compartilhadas no contrato/reducer, profundidade em diferentes caminhos/ordens, ciclos e isolamento do cache entre chamadas. Os dois testes de custo falharam antes da correção: 15.017 inspeções de chaves para 13 objetos distintos; depois, 20 inspeções, sem depender de um limite de tempo de máquina. O demo emite `externalCalls: 0`, projeção `3D`, base `SAT`, URL `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`.

Dois comportamentos preexistentes foram registrados ao encerrar a fatia 4.1:

1. URL sem `company` mantém a seleção de sessão. O roundtrip para limpar seleção foi posteriormente resolvido **no incremento local 7.1 abaixo**, pela decisão humana `company=` (CR-08).
2. O store ainda representa digitação abstrata no tema Artificial Analysis. Conteúdo imediato e handshake de apresentação dependem da integração de UI, não deste protocolo local.

Tokens pertencem à instância de store: o adapter futuro deve descartar callbacks/subscriptions ao substituí-la, sem encaminhá-los à nova instância. Entrega ordenada de snapshots, favoritos e duração dos avisos também estão registrados no [trabalho diferido](../_bmad-output/implementation-artifacts/deferred-work.md). A string de query vazia é aceita como ausência de overrides.

Câmera física, integração Cesium, serviços externos, desempenho real, produção e gates Q3/Q6/Q8/Q9 permanecem fora da prova; protótipos não foram alterados.

## Story 7.1 — incremento local de Busca/URL

[Entrega local aceita por Andre](../_bmad-output/implementation-artifacts/acceptance-7-1-local.md) após walkthrough e demonstrações. A aprovação não conclui a Story integral nem conecta estes módulos ao frontend; os diferidos permanecem abertos.

- [Contrato de Busca v1](../src/contracts/search.mjs) e [fixtures independentes](../tests/fixtures/search-contract.json): `SearchResult` reutiliza `NavigationTarget` v1; o contexto identifica `(dataRevision, feedbackRevision)`. A resposta conserva `query` original, estados `idle|loading|results|empty|unavailable` e resultados vazios/contexto nulo fora de uma leitura válida. Títulos válidos de até 4096 caracteres não são truncados.
- [LocalNewsView](../src/application/local-news-view.mjs) mantém `project/search/navigate/context` e expõe `frame(target?)`. Resolve alias antes de capturar snapshot/feedback, clona o snapshot antes de outra espera e congela o frame com `data`, `now`, `hiddenNewsIds`, revisões e `navigation`. Usa a supressão owner-wide do ledger existente, inclusive aliases, sem criar política paralela ou substituir Notícias publicadas por itens não publicados do feedback.
- [LocalSearch](../src/application/local-search.mjs) recebe `{view, store}`. `store.getState()` e `store.dispatch(intent)` são portas **síncronas**, vinculadas à mesma instância do reducer v2. `search(query)` apenas consulta; `select(result)` revalida no frame atual, envia `advanceSnapshot` e, quando disponível, `navigate`; `cancel()` invalida trabalho pendente. `current` contém somente a consulta transitória, nunca seleção/painéis semânticos paralelos. A configuração inicial continua pertencendo ao store injetado.
- Geração local e `intentToken` descartam sucesso/falha atrasados, inclusive após intenção externa ou reentrância síncrona no dispatch. Retornos vencidos contêm somente `status: 'superseded'`; se não houver consulta mais nova, encerram o loading em `idle`. `getState` assíncrono ou contador inválido é recusado antes de iniciar leitura/dispatch. Iniciar busca/seleção limpa resultados anteriores; erro de acesso/leitura deixa `unavailable`, sem dados privados nem erro bruto. Nenhuma falha de leitura navega. Supressão válida reconcilia o índice e fecha Leitor obsoleto antes de recusar o destino.
- Matching e ordem permanecem os de `globalSearch`: substring sem acentos/caixa, até 256 caracteres, sem ranking novo. Ticker continua ligado ao Cadastro, Empresa, símbolo e bolsa, sem seleção automática ou novos instrumentos. IDs eliminados/homônimos não são remapeados por nome. Alias de Notícia exige evidência do resolvedor existente; remaps de Empresa continuam sendo explícitos no intent do reducer, nunca inferidos pela busca.
- **CR-08:** a [URL](../src/domain/exploration-url.mjs) sempre serializa Empresa; seleção efetiva nula vira `company=`. Hidratar esse valor cria override nulo sem alterar sessão/preferências; ausência de `company` não cria override e retorna à seleção da sessão. `base`, aliases Q11, projeção 3D e allowlist privada permanecem iguais.
- **CR-02:** o [reducer](../src/domain/exploration-state.mjs) reconcilia sessão e override separadamente em refresh, remap explícito ou remoção. Empresa de link nunca é promovida à sessão; remoção do destino do link mantém override explícito `null`, impedindo fallback acidental para outra Empresa. Remover o override retorna à sessão reconciliada.

### Evidências locais 7.1

[Testes de Busca](../tests/search.test.mjs) e [store/URL](../tests/exploration.test.mjs), junto das regressões de contrato/Notícias: **66 testes direcionados, 132 totais, zero falhas/skips**. `npm run check`: **55 módulos ESM**, Node **v25.9.0**. `npm run demo:local`: `externalCalls: 0`, `projection: '3D'`, `base: 'SAT'`, `persistEffects: []`. `git diff --check` sem erros. O demo histórico não foi convertido em UI nem prova consumidor real.

A matriz cobre os quatro destinos/revisões, vazio/texto original, sobreposição por promises controladas, supressão/remoção/relevância/negação, homônimos e alias explícito, URL duplicada/inválida e ambas as decisões humanas. A revisão acrescentou provas de supressão durante espera de alias, cancelamento no dispatch de navegação, retorno malformado das portas e merge de grupos distintos com snapshot pré-merge. Congelamento privado do frame percorre cada identidade compartilhada uma vez por chamada, evitando amplificação sem refatorar primitives. A regressão CR-01 permanece intacta. A expectativa histórica que promovia B à sessão foi substituída pela decisão CR-02, não por conveniência da implementação.

**Limites:** isto não conclui a Story 7.1 integralmente, não altera produção nem fecha gates. O consumidor real deverá ligar revogação/disposal ao cancelamento, entregar snapshots ordenados à instância correta e validar UI/DOM/foco/browser e autenticação reais. As revisões são opacas, sem ordenação lexicográfica; esta prova controla as operações locais e intents observáveis do store, não fornece transação distribuída entre serviços. Favoritos, avisos e apresentação/renderer permanecem nos [diferidos](../_bmad-output/implementation-artifacts/deferred-work.md).

## Próximas decisões documentadas

Q2: host/IdP, autorização do dono, custo, atomicidade durável e recuperação privada. Q1/Q7: provedor de LLM/busca, tetos, limites de raciocínio, política de Histórico e formato editorial. Q3: UX/acessibilidade, controles móveis/foco e acabamento. O Globo permanece sempre 3D; MAPA/SAT são bases, não projeções. Q4/Q6: Fontes/licenças BACKBONES/tiles, base inicial de produção, composição, custos e limiares. Q8: significado/evidência/precisão geográfica. Q9: distribuição Cesium/assets/workers/CSP/WebGL e desempenho. Q5: cobertura e calendários por instrumento. Seed/logos precisam de evidência e curadoria, sem autorizar publicação por este demo.

Coleções normalizadas de Fontes/escopos diferentes conservam a união de famílias. IDs iguais com conteúdo diferente são conflito e conservam o conjunto publicado, sem escolher matching/precedência não decididos. O Leitor abre qualquer item elegível recebido por busca/navegação; limites de cinco/catorze/três se aplicam às listagens. Supressão inclui aliases antigos para proteger também um snapshot conservado após merge.
