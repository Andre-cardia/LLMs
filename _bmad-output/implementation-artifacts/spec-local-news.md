---
title: 'Consultar e ocultar a mesma Notícia em todas as projeções locais'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Usar NewsId estável e aliases de URL/ID de Fonte para dedup determinístico, preservando identidade anterior/supressão; não agrupar por título similar. Distinguir relevantCompanyIds de citedCompanyIds, limitar notícias a duas semanas/cinco por Empresa, Fluxo14 e LABS3. Feedback de dono confirmado e versionado é owner-wide; cancelar não escreve. Todas as cinco projeções, busca e navegação compartilham supressão antes dos limites. Só fixtures; geração/resumo real, qualidade de relevância e apresentação visual continuam gated.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 5.1; AD-5/15/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 4; 6 achados. Relatório: `local-core-reviews/news.json`.

- 1. **high · patched** — Fluxo/NOTÍCIAS sem Company excede cinco por Empresa. Cap por Empresa antes de limite global14; teste trêsEmpresas resulta14Fluxo/15Notícias.
- 2. **medium · patched** — LABS3 aplicado ao conjunto inteiro. Cap3porLaboratório; teste doisLabs retorna seis.
- 3. **high · patched** — Dedup perde associações de relevância/citação. Union dessas listas separadas, preservando refs e identidade.
- 4. **medium · patched** — Replay de feedback depende de relevância mutável. Recibo confirmado consultado antes das condições mutáveis; payload diferente permanece conflito.
- 5. **medium · patched** — Alias não chega ao Leitor canônico. LocalNewsView normaliza alias via índice antes de projeção/navegação; testealias visívelabreNewsIdoriginal.
- 6. **high · patched** — Snapshot sem feedback reexibe oculto. LocalNewsView compõe snapshot+feedback autenticados com par dataRevision/feedbackRevision; teste apósrefreshoculta5superfícies e contexto/navegação.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
