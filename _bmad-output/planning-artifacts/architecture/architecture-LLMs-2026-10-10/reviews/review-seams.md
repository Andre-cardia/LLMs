# Revisão independente de fronteiras entre módulos

Data: 2026-10-10. Lente adversarial mandatória de `bmad-architecture/references/reviewer-gate.md`: construir dois módulos que respeitem as regras locais documentadas e ainda façam escolhas incompatíveis. Projeto de origem somente leitura: `/Users/andrecardia/Github/LLMs`. Esta revisão é a única escrita deste revisor.

**Veredito: corrigir antes de tratar os contratos como substrato para implementação independente.** Há três lacunas altas e duas médias. A arquitetura pode continuar em documentação e fixtures; as lacunas não exigem escolha de provedor ou cobrança para serem fechadas.

Escopo principal: `ARCHITECTURE-SPINE.md` e `contracts.md`. Foram consultados `coverage.md`, `implementation-readiness.md`, os trechos de FR-20/22/23 do PRD e as regras de estado da UX para distinguir lacunas novas de decisões já herdadas. Não foram lidos segredos, instalado software ou alterados os documentos revisados.

Versões examinadas, SHA-256:

- Spine: `c75e3232ab4b71d3d9a5ff202d168e7e4b077466a04a95712e0290d50d528bc4`.
- Contratos: `232e2aa580b35e335e16e3cf4a206ee0ad9936d254b123abe2b45f2af3c59f55`.

## S1 — Alta: revisão de proposta, curadoria e snapshot não têm tipos nem fronteira de commit distintos

**Evidência:** AD-2, AD-4 e AD-6; `contracts.md` linhas 23–25, 37, 51 e 57. O manifesto distingue `revision` de `curationRevision`, mas comandos só recebem `expectedRevision`. O Publisher aplica decisões ordenadas contra esse campo; a transação conjunta cobre ponteiro e decisões, sem declarar a versão/estado das propostas que entrou na leitura do Publisher.

**Par permitido:** o módulo HTTP/Fila entende `expectedRevision` como versão da proposta, incrementada ao aprovar/desfazer. O módulo Publisher entende-o como revisão global curada, validada ao aplicar o lote. Ambos usam strings opacas, CAS, staged e auditoria; não existe contrato para tornar suas interpretações iguais. Mesmo se ambos escolherem a revisão curada, duas aprovações independentes contra C0 podem passar na Fila: um Publisher valida o lote inteiro contra C0 e aplica as duas, outro incrementa a revisão após a primeira e devolve a segunda como conflito.

**Falha adicional no mesmo limite:** o Publisher lê uma decisão staged; DESFAZER retorna a proposta a pending atomicamente; o Publisher ainda pode tentar o commit com a lista lida, porque o contrato não obriga o CAS a verificar a versão/estado de cada proposta. A mera atomicidade de cada operação não define qual vence.

**Fechamento mínimo — autofix:** separar `expectedProposalVersion`, `baseCurationRevision` e `expectedSnapshotRevision`; definir o proprietário de cada contador. O commit deve conferir versões e estado staged do conjunto selecionado, fencing e as duas revisões, e marcar consumo uma única vez. Declarar a regra para decisões independentes no mesmo lote e a precedência de DESFAZER versus commit. Definir a identidade/ordenação estável do lote e o escopo da chave de idempotência por dono, comando e recurso.

**Prova exigida:** duas aprovações independentes na mesma base; edição conflitante; DESFAZER entre leitura e commit; replay após resposta perdida; dois Publishers. Não basta testar apenas CAS do ponteiro.

## S2 — Alta: a versão compartilhada não tem dono nem definição executável nas fronteiras

**Evidência:** AD-1/2/3/12 e `contracts.md` linhas 5–12, 20–33, 77 e 85–87. Há convenções úteis, um exemplo de manifesto e nomes de campos; faltam registro de slices, envelopes das projeções/consultas, tipos e payloads dos eventos. `schemaVersion: 1` sozinho não seleciona uma definição concreta. O Deferred deixa detalhes de tabelas/componentes para os épicos, mas não nomeia quem fecha esses formatos compartilhados antes de consumidores paralelos.

**Par permitido:** o épico de leitura publica `catalog` como `{schemaVersion:1, companies:[...]}` com localização `{lat, lon}` e `sourceRefs` em array. O épico de UI aceita `{schemaVersion:1, companiesById:{...}}` com localização GeoJSON e `sourceRefs` indexados por campo. Ambos usam IDs opacos, WGS84, camelCase, null e proveniência; não conseguem integrar. O mesmo ocorre entre streaming que envia `delta.text` e consumidor que espera `delta.content`, embora ambos usem os seis eventos e a sequência exigidos.

**Fechamento mínimo — autofix:** um proprietário de contratos de fronteira e um pacote/registro canônico, compartilhado por produtor e consumidor. Antes de abrir stories independentes para cada fronteira, aprovar schemas executáveis de request/response/event, registry de slices e exemplos válidos/inválidos. A forma completa pode continuar como seed do épico; sua produção prévia e autoridade única precisam ser invariantes. A mesma regra deve abranger patches de proposta e projeções de estado/freshness, sem obrigar tabelas SQL ou componentes de UI.

**Prova exigida:** produtor e consumidor validam a mesma fixture no mesmo schema; versão incompatível é rejeitada; payloads desconhecidos não recebem interpretação heurística. Marcar a fronteira como gated até isso existir.

## S3 — Alta: reserva não está ligada imutavelmente ao mês da chamada e os limiares divergem

**Evidência:** AD-8 e `contracts.md` linha 79. O ledger informa mês UTC e call ID, mas não fixa o mês escolhido ao reservar, como liquidar atravessando o mês, nem se os 80%/100% usam `spent` ou `spent + reserved`.

**Par permitido:** o adaptador LLM reserva US$0,20 em outubro e a chamada termina em novembro. Um repositório liquida no mês da reserva; outro libera a reserva de outubro e lança gasto no mês corrente. Em novembro, este último já pode ter autorizado US$4,90 de outras chamadas contra um teto de US$5: todos passaram a fórmula no momento de autorização, mas a liquidação tardia eleva o gasto a US$5,10. Um scheduler também pode manter cadência horária ao observar só `spent`, enquanto outro desacelera com a verba já comprometida; ambos interpretam “a 80%” sem regra numérica comum.

**Fechamento mínimo — autofix:** registro de reserva com `reservationId`, call ID, bucket, `billingMonthUtc` imutável, máximo reservado e estado. Toda liquidação/reconciliação debita o registro original; nenhum reset de mês libera reservas desconhecidas. Declarar que `committed = spent + reserved` governa admissão e os limiares, incluindo igualdade, saída do modo degradado e virada de mês. Custos e reservas em microUSD com arredondamento conservador; liquidação acima da reserva deve falhar fechada e gerar reconciliação explícita.

**Prova exigida:** relógio cruza mês com chamada pendente; duas reservas concorrentes próximas do teto; liquidação duplicada; resultado desconhecido; entrada nos limiares com reservas ainda abertas. O limite financeiro atual não precisa ser alterado.

## S4 — Média: o limite de Descoberta mudou de propostas para Empresas e não tem consumo atômico

**Evidência:** AD-5 diz “dez novas Empresas por semana UTC”; `contracts.md` não define contador de Descoberta. FR-22 do PRD, linha 315, fixa dez **propostas de Empresas novas** por semana. `coverage.md` alterna as duas formas.

**Par permitido pela spine:** um agente consome quota ao gravar proposta nova, outro conta só aprovações/Empresas publicadas. O segundo pode gerar trinta propostas sem publicar nenhuma; o primeiro limita a dez. Mesmo escolhendo propostas, dois jobs podem ler nove e gravar uma cada, porque lease por slice não define o contador global da semana.

**Fechamento mínimo — autofix:** ratificar a unidade do PRD: inserção aceita de proposta para Empresa nova, incluindo lotes iniciais. Um dono de quota global por semana UTC, reserva/inserção conjunta e dedup/idempotência; definir segunda-feira 00:00 UTC como fronteira, replay sem consumo e tratamento de nova proposta por fato novo. Correções/Relações não devem consumir esta quota por inferência. Rejeição não libera quota já consumida sem decisão explícita.

**Prova exigida:** duas inserções concorrentes com nove propostas, replay, rejeição/reproposta e passagem domingo→segunda. É correção de consistência com o PRD, não uma nova decisão de produto.

## S5 — Média: um store único ainda permite múltiplos proprietários das transições e da persistência

**Evidência:** AD-10; UX `EXPERIENCE.md` linhas 212 e 241–245. A UX já define override de sessão para URL e preferências persistidas. A spine exige um store versionado, mas não diz que apenas um reducer/transicionador normaliza intents, nem separa a propriedade de sessão e preferências. Também não fixa a reconciliação do estado ao avançar snapshot.

**Par permitido localmente:** o módulo URL aplica Camadas de sessão ao store; o módulo de preferências observa alterações de Camadas e persiste toda mudança. Nenhum possui um segundo store, e ambos implementam sua função isolada, mas a integração sobrescreve preferências porque a origem da transição não foi contratada. Outro par normaliza uma seleção remapeada no snapshot no renderer e no Terminal, escolhendo respectivamente limpar ou seguir substituição: continuam apontando para o mesmo store, mas competem para reescrever sua seleção.

**Fechamento mínimo — autofix:** store/reducer é o único proprietário de transições semânticas; UI, URL e tools emitem intents tipados, não patches avulsos. Separar `preferences` persistidas de `sessionOverrides` e `effectiveState`; hidratação de URL nunca gera evento de persistência. Snapshot e reconciliação de seleção/janelas/filtros ocorrem em uma transição, com uma política central para remapeamento/410. Callbacks de voos/digitação levam versão/token e não restauram uma intenção vencida. Preservar as prioridades de Esc e painéis já dadas pela UX, sem reabri-las como decisão.

**Prova exigida:** link altera sessão sem modificar storage; mudança explícita do usuário persiste apenas os campos pretendidos; snapshot remove/remapeia seleção; navegação antiga termina após nova seleção; duas superfícies disputam abertura de painel. Gate antes das stories de estado/UI, independente do benchmark gráfico.

## Limites e verificação realizada

Leitura cruzada e construção dos cinco contraexemplos acima executadas. Não há verdict crítico: autorização, imutabilidade dos snapshots, ausência de escrita do Chat, isolamento de BACKBONES e gates de infraestrutura/Histórico já têm limites explícitos úteis. Q1–Q7 podem permanecer abertos para as stories afetadas; nenhum achado exige antecipar suas escolhas humanas.

Não foram executados testes de produto, browser, corrida em banco, serviços externos ou benchmark; os casos acima são requisitos de verificação para a implementação. Não executei o lint, que é responsabilidade do gate principal e já tem arquivo próprio. As sugestões são correções documentais para o autor aplicar e revisar, não mudanças efetuadas nesta revisão.

## Rechecagem após mudanças concorrentes do autor

Ao concluir esta revisão, os arquivos evoluíram para spine SHA-256 `bfa4d1807eecb80168c110189abd58f7c2454ba8bdd4268babf3cbf83359a143` e contratos `3927596edd5ea035e9a895aaf3d99b7bbb57f48c21f2d02ed37a3d839ae15da9`. Reli os contratos e AD-1 a AD-12. **S1 parcialmente resolvido:** `expectedRevision` agora distingue proposal/curation/targets, e decisões disjuntas versus conflitantes já têm política. Permanece o fechamento de DESFAZER entre leitura e commit: o commit precisa comparar versão/estado staged de cada proposta, além de CAS/fencing do manifesto. S2–S5 permanecem aplicáveis às versões rechecadas. As descrições iniciais foram preservadas como evidência do cenário encontrado; o autor não deve reaplicar os pontos de S1 já fechados.

## Resolução final — rechecagem da versão estável

Rechecagem solicitada após o autor fechar S1–S5, sem alteração dos achados históricos. SHA-256 das versões atuais examinadas:

- `ARCHITECTURE-SPINE.md`: `2aa8e5adf6709e7ce0100e48b47e57037c6984f1a9a5469e784e61c8c4033478`.
- `contracts.md`: `b4415990571ebb1c1d93daed88ef9cd4cf19e3827d14b0c14400b5acd29380a0`.
- `coverage.md`: `e1791d6079e38ac782456341b560e29d0e752a707d97a8f55edb30f63f9eb35f`.

| Achado | Resolução conferida | Estado |
| --- | --- | --- |
| S1 | Contratos distinguem proposta/curadoria/alvos; disjuntas compartilham baseline; commit confere estado staged, proposalVersion, alvos, curadoria, snapshot e fencing. DESFAZER que vence impede aplicação; publicação que vence conduz à compensação. Lote, ordem, consumo único e escopo de idempotência explícitos. | Resolvido documentalmente |
| S2 | AD-16 nomeia `src/contracts/` e Domain/Contracts como autor único; validadores importados nos dois lados; schemas e fixtures são gate antes de stories independentes. Registro cobre slices, envelopes, patches, estado/frescor e streaming; cobertura ratifica esse gate. | Resolvido documentalmente |
| S3 | AD-8/contratos fixam reserva por bucket/mês, liquidação no registro original, mês novo sem liberar reservas antigas, `committed = spent + reserved`, igualdade nos limiares e reconciliação de excesso. | Resolvido documentalmente |
| S4 | AD-5/contratos contam propostas novas inseridas, semana global segunda-feira UTC, quota/inserção/dedup atômicos, replay sem consumo, rejeição sem restituição e fato novo com novo consumo; cobertura preserva bootstrap em lotes. | Resolvido documentalmente |
| S5 | AD-10/contratos dão escrita semântica exclusiva ao reducer, intents tipados, preferences/sessionOverrides/effectiveState separados, hidratação sem persistência, reconciliação atômica de seleção e tokens de callbacks. | Resolvido documentalmente |

**Veredito final: passa nesta lente de fronteiras para finalizar a arquitetura e continuar a fundação em fixtures, respeitando os gates.** Nenhum achado alto ou médio S1–S5 permanece aberto nas versões acima. O gate de AD-16 continua obrigatório: esta aprovação não libera consumidores independentes antes dos schemas/fixtures executáveis. As provas de corrida, budget, UI e integração listadas nesta revisão continuam não executadas e devem ser realizadas na implementação; não há atestado de runtime, infraestrutura ou publicação.
