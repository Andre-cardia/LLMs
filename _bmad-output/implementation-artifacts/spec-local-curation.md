---
title: 'Revisar e publicar Empresas/Relações somente na Atualização local'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Implementar propostas de Empresas/Relações e decisões locais com autorização injetada que nega por padrão, versões, idempotência e evidência. Agente só propõe; a quota é global de dez inserções de Empresas novas por semana iniciada segunda00UTC, replay não consome e rejeição não devolve. Aprovar/editar cria staged e DESFAZER antes de publicar volta pending. Publicação lê catálogo curado e aplica/consome decisões disjuntas junto com CAS/fencing do snapshot; conflitos de alvo conservam staged. Compensação pós-publicação, pares de modelos e assets oficiais continuam nas stories gated, sem seed real.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 2.1; AD-4/5/6/14/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 4; 4 achados. Relatório: `local-core-reviews/curation.json`.

- 1. **high · patched** — Aprovação substitui versão revisada por atual. targetVersion capturada na proposta é preservada; proposta antiga fica staged com target-version-changed.
- 2. **high · patched** — factKey arbitrário reabre rejeição sem fato. Dedup deriva identidade de Fonte/URL, ignora factKey e horários; mesma evidência retorna rejeitada, novasURLs mesmaFonte não reabrem.
- 3. **medium · patched** — Dedup descarta conteúdo divergente. semanticPayload exclui fetch/observed mas conserva fato; colisão lança PROPOSAL_FACT_CONFLICT.
- 4. **medium · patched** — Receipt de preparePublish interpretado como slice override. Publisher distingue retorno com três campos models/news/lastSuccessAt. Teste e demo usam diretamente callback curation.preparePublish.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
