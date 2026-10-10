---
title: 'Restaurar e reconciliar a exploração local sem alterar preferências por URL'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Implementar reducer único, intenções tipadas e preferência/override/effectiveState separados com defaults da UX. URL contém somente Camadas/Vista/aba/Empresa, saneia valores e não persiste; ação explícita salva só seus campos. Reconciliar IDs/remapeamentos/seleção em uma transição, fechar Terminal ao trocar para MODELOS/NOTÍCIAS, manter exclusividade entre painéis laterais e descartar callback antigo. Preservar preferências de Leitor quando NOTÍCIAS força lateral. Nenhum controle/visual/foco DOM novo ou service de histórico é escolhido.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 4.1/7.1; AD-10/14/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 5; 5 achados. Relatório: `local-core-reviews/exploration.json`.

- 1. **high · patched** — URL diverge seleção e Terminal. Hidratação reconcilia Terminal e seleção atomicamente; invalidocompanylimpaambos.
- 2. **medium · patched** — Ação independente invalida digitação ativa. Tokens por operação terminal/reader; preferência/abrirLeitor não vence callbackTerminal, trocaEmpresa ainda vence.
- 3. **medium · patched** — Leitor flutuante sofre exclusividade lateral. readerNewsId separado da ocupação sidePanel; floatingcoexistequeue/markets; newsforçalateralsemgravarpref.
- 4. **medium · patched** — Destino de Modelo perde identidade. selectedModel conserva family/variant/company e avança/limpa na reconciliação.
- 5. **medium · patched** — Primeira visita ignora modo do sistema. systemModeinjetado resolve defaults somente quando preferências ausentes; escolha salva prevalece.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
