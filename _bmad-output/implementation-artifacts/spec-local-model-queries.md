---
title: 'Comparar Modelos locais e reconhecer o último Lançamento elegível'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** A continuação autorizada precisa transformar requisitos definidos em componentes locais verificáveis, mantendo UX e arquivos anteriores.

**Abordagem:** Resolver datas AA>HF>OR com evidência, excluir data inválida/futura do Pulso, aplicar decaimento em sete dias e destaque estático com reduzir movimento; identidade de família e variantes não muda por data de fetch/preview. Projeção local usa o cálculo de custo já entregue, combina filtros de Empresa/modalidades/pesos e ordena colunas numéricas com ausentes sempre no fim. Busca identifica Empresa/Modelo/ticker/Notícia com destinos tipados, respeitando supressão. Sem matching automático incerto, providers, cotações reais ou interface.

</frozen-after-approval>

## Implementation Notes

- Referências: stories 3.2/3.3/7.1; AD-3/10/11/16; PRD/UX/spine/contracts.md são autoridade. Continuar localmente foi expressamente autorizado; nenhuma lacuna de intenção/efeito irreversível nesta fatia.
- Investigação: base de preços existente reutilizada, nenhum módulo equivalente encontrado. Acrescentar módulos ESM/fixtures/testes sem dependências. Porta/adaptador em memória delimita provas locais, sem alegar prova durável/JWT/produção.
- Freeform build por incremento pequeno e reversível; plan local rastreia stories, sem sprint/épicos inteiros marcados done. Workflow renderizado da skill bmad-build mantido; revisão Blind Hunter será executada e todos os achados registrados antes do commit.


### Review Triage Log — Blind Hunter

Nenhuma camada configurada foi omitida. Contexto novo; piso 4; 5 achados. Relatório: `local-core-reviews/model-queries.json`.

- 1. **medium · patched** — Linha omite conteúdo de FR-9. Projeção inclui releaseDates, modalidades, pesos, licença, reasoning e benchmarks.
- 2. **high · patched** — Preço/custo perde proveniência. Objeto pricing completo e releaseSourceRefs preservados, independente de variant.sourceRefs.
- 3. **medium · patched** — pricing:null muda shape de standardCost. Fallback uniforme com currency/task/missingPrices; regressão verifica fronteira.
- 4. **medium · patched** — Navigation lê getter antes de validar. Descritor type validado antes do discriminador; getter não executa.
- 5. **medium · patched** — Último lançamento elegível por Lab não resolvido. latestLabReleases exclui futuro/inválido, escolhedata maisrecente porLab; fixturecomfuturoselecionaoutroModelo.


### Integração final

Blind Hunter adicional com contexto novo; piso10,11achados tratados. `local-core-reviews/integration.json` registra classificação, correção e prova de cada um. `tests/integration-regressions.test.mjs` e demo integrada verificam as fronteiras. Nenhuma camada configurada foi omitida; frozenIntent preservado. Validação no projeto ainda pendente.


### Completion

78/78 testes passaram no projeto; zero falhas/skips. Sintaxe dos50módulos passou em Node25.9.0. Demo integrada passou com controles positivos/negativos, tentativa admitida exclusivamente simulada e tentativa negada sem executar. Nenhuma chamada externa, implantação ou publicação. Local-plan conserva20stories blocked-integration e produto inteiro false.
