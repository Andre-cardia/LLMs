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
