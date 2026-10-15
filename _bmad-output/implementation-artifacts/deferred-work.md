# Trabalho diferido — revisão da Story 4.1

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Definir em 7.1 o roundtrip de URL sem Empresa ao hidratar uma sessão já selecionada.
  evidence: Comportamento anterior preservado: serializador omite company nulo e parser sem company não sobrescreve a seleção da sessão; probe mantém company-1. Não alterar sem reconciliar semântica dos links.

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Integrar conteúdo imediato do tema Artificial Analysis com estado de digitação e Escape.
  evidence: Estado abstrato typing=true já existia antes da migração de base, inclusive após mudança preexistente do tema padrão. UI deverá consumir/concluir a operação sem digitação visual e provar teclado/foco.

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Garantir entrega ordenada de snapshots e descarte de atualizações preparadas para geração anterior na integração do controlador.
  evidence: Reducer anterior e atual recebem revisão opaca explícita sem expectedRevision; camada SnapshotReader possui controle de corrida próprio. A integração precisa provar que snapshot antigo não é reenviado ao store; não comparar IDs lexicograficamente.

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Verificar isolamento dos callbacks ao destruir e recriar instâncias de store/renderer.
  evidence: medium não verificado em fluxo real; tokens são locais à instância e podem repetir na mesma revisão. É necessário testar disposal/subscriptions do futuro adapter para impedir encaminhamento de callback antigo ao novo store; nenhum consumidor atual realiza essa troca.

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Confirmar identidade e política de referências órfãs dos favoritos na integração consumidora.
  evidence: medium não verificado; favorites contém strings sem definir CompanyId no contrato e persiste preferências sem remapeá-las, como antes. Confirmar se são Empresas/instrumentos e como resolver aliases sem regravar preferências por atualização.

- source_spec: `spec-4-1-store-bases-preferencias.md`
  summary: Reconciliar duração/dismiss de avisos de entidades removidas com a apresentação.
  evidence: Qualquer intent não callback já limpava warning antes da Story 4.1, inclusive view. Trocar base após company-unavailable continua apagando o aviso; definir confirmação/duração no fluxo visual consumidor.

## Deferred from: code review of spec-4-1-store-bases-preferencias.md (2026-10-12)

Origem: [Review Findings da Story 4.1](spec-4-1-store-bases-preferencias.md#review-findings), revisão independente do HEAD `e7867d3`. Os IDs CR distinguem esta revisão das rodadas anteriores. Reconfirmações abaixo preservam a linhagem dos registros existentes; não são oito regressões nem autorização de ampliar o escopo atual.

- **CR-02 — medium, preexistente:** snapshot promove a Empresa de `sessionOverrides` para `sessionState` e apaga o override. Probe Empresa 1 → URL Empresa 2 → refresh inalterado → URL vazia mantém Empresa 2; sem refresh, retorna à Empresa 1. O mesmo código semântico existe na baseline. Reconciliar origem/remoção de overrides em 7.1. Local: [exploration-state.mjs:115–117](../../src/domain/exploration-state.mjs#L115-L117).
- **CR-03 — maybe-false; impacto potencial medium não verificado:** snapshot renova tokens de digitação, sem efeito de restart; callback antigo é ignorado e o novo conclui corretamente. A renovação é preexistente e o próximo estado é observável. Falta consumidor integrado que comprove travamento: testar observação/reagendamento/conclusão imediata da UI no refresh antes de mudar o protocolo. Complementa a pendência de apresentação Artificial Analysis. Local: [exploration-state.mjs:118–120](../../src/domain/exploration-state.mjs#L118-L120).
- **CR-04 — medium, preexistente, reconfirmado:** reducer aceita entrega manual `two` → `one`; não possui ordenação de revisão opaca. O [SnapshotReader](../../src/application/snapshot-reader.mjs#L8-L21) já descarta refresh concorrente superado. Provar que o controlador não reenvia snapshot antigo ao store; não alegar corrida integrada comprovada nem ordenar IDs lexicograficamente. Local: [exploration-state.mjs:108–120](../../src/domain/exploration-state.mjs#L108-L120).
- **CR-05 — maybe-false; impacto potencial medium não verificado, reconfirmado:** callback deliberadamente roteado de uma instância para outra com token/revisão iguais pode encerrar operação da segunda. Nenhum caller atual faz isso; testar disposal/subscriptions do adapter para comprovar isolamento entre instâncias. Local: [exploration-state.mjs:52–57](../../src/domain/exploration-state.mjs#L52-L57).
- **CR-06 — maybe-false; impacto potencial medium não verificado:** invalidação local da câmera não emite cancelamento físico; callback vencido é ignorado corretamente. Não há renderer integrado, logo animação indevida não foi demonstrada. Na Story 4.2, testar observação de invalidação e cancelamento/descarte de trabalho vencido, sem criar API nesta fatia local. Local: [exploration-state.mjs:49](../../src/domain/exploration-state.mjs#L49).
- **CR-07 — maybe-false; impacto potencial medium não verificado:** callback local de câmera só conclui sucesso e recusa campo extra de falha, conforme o contrato atual. Não existe caller de erro/renderer que demonstre operação travada. Exercitar falha/aborto real na integração e definir o outcome apropriado com evidência; isso não é requisito local faltante já comprovado. Local: [exploration-state.mjs:52–62](../../src/domain/exploration-state.mjs#L52-L62).
- **CR-08 — medium, preexistente, reconfirmado:** roundtrip da URL sem Empresa mantém seleção da sessão de destino. Semântica já explicitamente diferida para 7.1; não adotar novo sentinel sem reconciliar intenção dos links. Local: [exploration-url.mjs:18–25](../../src/domain/exploration-url.mjs#L18-L25).
- **CR-09 — medium, preexistente, reconfirmado:** após remoção da Empresa, troca de base apaga `company-unavailable` por reset geral de warning. Reconciliar duração/dismiss com a apresentação. Local: [exploration-state.mjs:70](../../src/domain/exploration-state.mjs#L70).

## Encaminhamento no incremento local 7.1

- source_spec: [spec-7-1-busca-url-local.md](spec-7-1-busca-url-local.md)
  summary: CR-02 e CR-08 implementados e verificados somente no escopo local, conforme decisões humanas 1A + 2A.
  evidence: [Testes de exploração](../../tests/exploration.test.mjs) provam reconciliação separada sessão/override, remaps explícitos/remoções e company= em sessão povoada sem persistência. Os registros históricos acima ficam preservados; não são pendências semânticas restantes desta fatia.

- source_spec: [spec-7-1-busca-url-local.md](spec-7-1-busca-url-local.md)
  summary: Integrar Busca/URL ao consumidor real e verificar UI, foco, teclado/toque, navegador e autenticação/revogação efetivas na continuação 7.1.
  evidence: [LocalSearch](../../src/application/local-search.mjs) prova somente coordenação por portas locais síncronas; [testes](../../tests/search.test.mjs) usam promises controladas e autorização simulada. Nenhum DOM, Cesium, serviço real, deploy ou gate foi alterado.

- source_spec: [spec-7-1-busca-url-local.md](spec-7-1-busca-url-local.md)
  summary: Provar entrega ordenada e isolamento/disposal entre instâncias e serviços no adapter futuro; preservar CR-04/CR-05 como integração pendente.
  evidence: Geração local mais intentToken impedem retorno atrasado de enviar snapshot/navegação ao store atual e verificam reentrância. Não ordenam revisões opacas nem implementam atomicidade distribuída; o adapter deve cancelar trabalho ao trocar instância/permissão. CR-03/CR-06/CR-07 seguem apresentação/renderer (4.2 e consumidores), favoritos e avisos seguem seus registros existentes.

- source_spec: `spec-7-1-busca-url-local.md`
  summary: BH3 — preservar porta de dispatch síncrona; qualquer adapter futuro assíncrono exige protocolo transacional próprio, não apenas requireSynchronous.
  evidence: Medium; comportamento preexistente do guard compartilhado. Probe injeta deliberadamente dispatch assíncrono incompatível: a Promise é recusada, mas o corpo do adapter pode mutar o store depois de cancel(). Não há esse adapter entre consumidores suportados; proibir async no contrato não constitui isolamento de callback arbitrário nem rollback. Não reabrir como patch do coordenador sem definir a integração.

- source_spec: `spec-7-1-busca-url-local.md`
  summary: BH5 — verificar transporte e ordenação de evidências de remap de Empresa junto aos snapshots no controlador futuro.
  evidence: Maybe-false, impacto potencial medium não verificado. Probe envia remoção sem remap e depois um remap cuja origem já foi removida; INVALID_REMAP está conforme o reducer. Falta caller/fonte integrada que comprove entrega legítima nesse fluxo. O coordenador não inventa correspondências e não transporta mapas ausentes do frame; provar que o proprietário dos remaps os aplica antes de outro consumidor consolidar remoções.
- source_spec: `_bmad-output/implementation-artifacts/spec-manifest-v2-company-merged-into.md`
  summary: Contrato e comando MergeDecision em src/contracts/curation.mjs e MemoryCuration, única fonte de companyMergedInto (merge, DESFAZER compensatório, retirada do sobrevivente, recovery).
  evidence: Andre escolheu em 14/10 entregar só o encanamento do manifesto v2; sem esse comando nenhum caminho de produto cria merges (AD-2, AD-3, AD-4).
- source_spec: `_bmad-output/implementation-artifacts/spec-manifest-v2-company-merged-into.md`
  summary: Curadoria que readiciona um ID já presente como `from` em `companyMergedInto`, ou tabela acima de 10 000 entradas, faz todo `publish` lançar `INVALID_MERGE_TABLE`, inclusive Atualizações de Modelos e Notícias.
  evidence: Maybe-false hoje (só testes alteram a tabela); torna-se real com o comando `MergeDecision`, que precisa recusar o readicionamento ou reescrever a tabela na mesma transação e definir a poda antes do teto.
- source_spec: `_bmad-output/implementation-artifacts/spec-manifest-v2-company-merged-into.md`
  summary: Selecionar na Busca um resultado antigo de Empresa mesclada move o store para o sobrevivente, mas `LocalSearch.select` devolve e publica `unavailable`.
  evidence: Pré-existente (o alvo é validado contra a revisão nova, onde A não existe); resolver o alvo pela tabela é decisão de produto ligada à extensão de Q11.
- source_spec: `_bmad-output/implementation-artifacts/spec-manifest-v2-company-merged-into.md`
  summary: BH5 (acima) está superado: `INVALID_REMAP` foi removido e a tabela acumulada `companyMergedInto` transporta remaps independentemente da ordem de revisões.
  evidence: `src/domain/exploration-state.mjs` aplica só entradas cujo `from` está no índice anterior; teste AD-22 cobre o salto de revisões.
- source_spec: `_bmad-output/implementation-artifacts/spec-merge-decision-curadoria.md`
  summary: O risco de uma curadoria readicionar um ID já presente como `from` em `companyMergedInto` (e bloquear toda publicação) foi fechado: a proposta de Empresa fica em conflito `merged-company` e a Atualização segue. Continuam abertos o teto de 10 000 entradas e a poda da tabela.
  evidence: `MemoryCuration.preparePublish` aplica a proposta `kind: 'merge'` e recusa readicionar IDs mesclados; [testes de curadoria](../../tests/curation.test.mjs) cobrem `merged-company`. Nenhuma poda foi implementada; acima de 10 000 entradas o Publisher ainda lança `INVALID_MERGE_TABLE`.
- source_spec: `_bmad-output/implementation-artifacts/spec-merge-decision-curadoria.md`
  summary: Merge aprovado não verifica as versões de `company:from` e `company:to`; uma edição do sobrevivente publicada entre a aprovação e a publicação não invalida o merge.
  evidence: `targetVersion` só cobre `merge:{id}`; corrigir exige registrar as versões das Empresas no staging e conflito `target-version-changed`.
- source_spec: `_bmad-output/implementation-artifacts/spec-merge-decision-curadoria.md`
  summary: Entradas `toCompanyId: null` não são reescritas por `applyCompanyMerges`; Modelos ou Notícias que ainda citem a Empresa retirada sem sobrevivente fariam a publicação falhar.
  evidence: Maybe-false hoje, nenhum caminho cria `to: null`; definir a regra (remover das Notícias, descartar ou colocar Modelos em quarentena) junto da story de retirada do sobrevivente.
