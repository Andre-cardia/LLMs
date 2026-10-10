---
title: 'Atualizar dados locais sem perder a última revisão válida'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Criar contratos compartilhados de Cadastro, Modelos, Notícias e snapshot e um adaptador privado em memória. Validar coleções comparáveis full (vazio/<50% rejeitado; metade aceita), incremental vazio legítimo e frescor por relógio injetado. Leases/fencing/CAS protegem publicação; o leitor valida digest/schema/referências e só troca o conjunto completo, conservando a última revisão em falha. Nenhuma autenticação real, fonte, cron ou infraestrutura é ativada; as regras inferidas de frescor são provas locais da arquitetura proposta.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 1.1; AD-2/3/6/7/9/14/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 9; 10 achados. Relatório: `local-core-reviews/update-integrity.json`.

- 1. **high · patched** — Baseline único perdido ao alternar Fontes. modelCollections agora usa chave Fonte/escopo/schema; teste A4→B1→A1 rejeita A1.
- 2. **high · patched** — Referência inválida de Modelos bloqueia Notícias válidas. Validação referencial por slice após preparar curadoria; Modelo inválido conserva última slice, Notícias válidas publicam.
- 3. **medium · patched** — Fetch que nunca resolve impede Update. Prazo por tentativa limitado a30s, AbortSignal e falha local conservam slice; teste20ms nunca-resolve publica Notícias.
- 4. **high · patched** — Callback async publica metade da curadoria. Publisher e LocalUpdate recusam Promise antes de confirmar; regressão conserva catálogo e ponteiro.
- 5. **high · patched** — Recibo em transação separada quebra replay. completedUpdates agora participa da mesma transação do manifesto; repetição não coleta novamente.
- 6. **high · patched** — Lease pode vencer dentro da preparação. Expiração revalidada imediatamente antes da confirmação; avanço do relógio no callback reverte publicação.
- 7. **high · patched** — Fechamento admite cotação de outra sessão. observedAt precisa alcançar fechamento esperado descontado apenas atraso declarado; cotação2020 não ficaLIVE.
- 8. **medium · patched** — Strings UTC equivalentes discordam. Fechamentos comparados por utc() e teste Z/.000Z.
- 9. **medium · patched** — Timestamp futuro antecede falha repetida. OFFLINE por3falhas/>2cadências agora precede invalidação temporal.
- 10. **high · patched** — Modelo pode pertencer a Empresa que não é Lab. Contrato cruzado exige isLab:true; fixture company-3 rejeitada.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
