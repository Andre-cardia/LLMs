# Fundações locais do Monitor Global de Labs de LLM

Os fundamentos históricos cobrem fatias locais de snapshots, orçamento, curadoria, Modelos, Notícias, exploração e busca; não comprovam conclusão integral das stories atuais. A Story 4.1 recebeu contrato/store/URL v2 e provas locais descritas abaixo, com revisão automatizada concluída e revisão humana pendente. A Story 7.1 e o épico 4 não são declarados concluídos. Apresentação, Fontes reais e infraestrutura conservam os gates do planejamento.

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
- Configuração/preferências/intents/estado/snapshot/contexto URL recusam accessors e arrays com protótipo customizado antes de percorrê-los. A fronteira aceita dados JSON simples com profundidade de objetos/arrays limitada a 128 níveis, não promete isolamento de Proxy JavaScript hostil ou de ambiente global adulterado. Nenhuma mudança foi necessária em primitives ou nos outros domínios.

### Evidências e limitações

[Fixtures compartilhadas](../tests/fixtures/exploration-contract.json), [testes do contrato](../tests/exploration-contract.test.mjs) e [testes do store/URL](../tests/exploration.test.mjs) exercitam AC1–AC6 e todas as linhas da matriz: configuração, precedência canônica, aliases legados, rejeição segura e callbacks vencidos. Os estados inválidos passam pelo validador, reducer e serializador; getters próprios/herdados têm contador de execução zero. A preservação cobre Modelo selecionado, Leitor lateral/flutuante, Fila/MERCADOS e callbacks positivos/negativos.

Verificação desta rederivação: **32 testes de exploração/contrato, 33 incluindo demo, 103 totais, nenhum ignorado**; **52 módulos** passam na verificação de sintaxe em Node 25.9.0. O demo emite `externalCalls: 0`, projeção `3D`, base `SAT`, URL `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`.

Dois comportamentos preexistentes ficam explicitamente para histórias consumidoras, sem alteração nesta fatia:

1. URL sem `company` mantém a seleção de sessão; roundtrip para limpar uma sessão já selecionada requer decisão posterior em 7.1.
2. O store ainda representa digitação abstrata no tema Artificial Analysis. Conteúdo imediato e handshake de apresentação dependem da integração de UI, não deste protocolo local.

Tokens pertencem à instância de store: o adapter futuro deve descartar callbacks/subscriptions ao substituí-la, sem encaminhá-los à nova instância. Entrega ordenada de snapshots, favoritos e duração dos avisos também estão registrados no [trabalho diferido](../_bmad-output/implementation-artifacts/deferred-work.md). A string de query vazia é aceita como ausência de overrides.

Câmera física, integração Cesium, serviços externos, desempenho real, produção e gates Q3/Q6/Q8/Q9 permanecem fora da prova; protótipos não foram alterados.

## Próximas decisões documentadas

Q2: host/IdP, autorização do dono, custo, atomicidade durável e recuperação privada. Q1/Q7: provedor de LLM/busca, tetos, limites de raciocínio, política de Histórico e formato editorial. Q3: UX/acessibilidade, controles móveis/foco e acabamento. O Globo permanece sempre 3D; MAPA/SAT são bases, não projeções. Q4/Q6: Fontes/licenças BACKBONES/tiles, base inicial de produção, composição, custos e limiares. Q8: significado/evidência/precisão geográfica. Q9: distribuição Cesium/assets/workers/CSP/WebGL e desempenho. Q5: cobertura e calendários por instrumento. Seed/logos precisam de evidência e curadoria, sem autorizar publicação por este demo.

Coleções normalizadas de Fontes/escopos diferentes conservam a união de famílias. IDs iguais com conteúdo diferente são conflito e conservam o conjunto publicado, sem escolher matching/precedência não decididos. O Leitor abre qualquer item elegível recebido por busca/navegação; limites de cinco/catorze/três se aplicam às listagens. Supressão inclui aliases antigos para proteger também um snapshot conservado após merge.
