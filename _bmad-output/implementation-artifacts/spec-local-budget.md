---
title: 'Manter o orçamento da Atualização fechado por padrão'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Implementar ledger em memória por mês UTC, separado em automação e chat, com tetos zero por padrão e microUSD em strings inteiras. Reserva precede uma tentativa simulada, gasto+reservado governa80%/100%, desconhecido conserva reserva, retry exige nova reserva/callId e liquidação ocorre uma vez no mês original. Overrun registra gasto real e pausa para reconciliação. Fixtures podem configurar tetos apenas para provar as regras; nenhuma chamada paga ou verba real é inferida.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 1.2; AD-8/14/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 4; 4 achados. Relatório: `local-core-reviews/budget.json`.

- 1. **medium · patched** — Recibos contraditórios aceitos. Contrato relaciona estado/custo real/máximo; regressões rejeitam4combinações incompatíveis.
- 2. **medium · patched** — Overrun não tem reconciliação verificável. reconcile() exige autorização, evidência HTTPS, lista exata de overruns e ausência de reservas pendentes; não apaga gasto.
- 3. **low · patched** — Replay exige relógio novo válido. Replay resolvido antes de consultar relógio; teste com clock inválido retorna recibo original.
- 4. **high · patched** — Preço→reserva→tentativa não comprovado. conservativeCallBound calcula máximo exato arredondado acima; simulatedBudgetCall reserva antes. Preço/limite desconhecido e recusa executam zero tentativas; reasoning não limitado é recusado.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
