---
title: 'Contrato de preços e custo por tarefa com fixtures locais'
type: 'feature'
created: '2026-10-10'
status: 'done'
route: 'oneshot'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** O projeto tem PRD, UX concluída por Andre e arquitetura revisada, mas ainda não tem contrato executável de preços nem cálculo verificável do Custo estimado por tarefa. Essa base deve distinguir preço ausente de zero e evitar perda de precisão monetária.

**Abordagem:** Criar uma fatia local com contrato compartilhado, dados fictícios e cálculo exato em USD para 2.000 tokens de entrada mais 1.000 de saída. Marcar a estimativa de modelos de raciocínio e a exclusão dos tokens de raciocínio; verificar produtores e consumidores com o mesmo validador. Esta fatia não integra serviços, não altera a UX aprovada e não publica nem implanta o produto.

</frozen-after-approval>

## Implementation Notes

- Continuação local autorizada por Andre; não há escolha humana pendente nesta fatia. Q1/Q2/Q4/Q5/Q6/Q7 permanecem gates apenas das integrações correspondentes.
- Referências: PRD FR-11; arquitetura AD-3, AD-11 e AD-16 e `contracts.md`. Nenhum código de produto preexistente foi encontrado para reutilizar.
- Rota oneshot: sem lacuna de intenção ou efeito irreversível; contrato/cálculo/demo/testes sem dependências externas. JavaScript ESM permite executar a base sem instalar scaffold ou escolher hospedagem.
- Os arquivos anteriores, incluindo UX, BMAD e `.git`, são preservados. Não há commit anterior; esta execução conserva o estado de versionamento e não faz add/commit/push.
- Implementados `src/contracts/model-pricing.mjs` e `src/domain/model-cost.mjs`, com demo local, fixtures válidas/inválida e testes. O registro de preços cobre somente esta fronteira; schemas completos de Modelos e snapshots continuam necessários antes de suas stories consumidoras.
- Cálculo com `BigInt`/inteiros escalados, sem arredondamento; preços são strings decimais de até 256 caracteres. Normalização de USD por token para USD por milhão pertence ao futuro adaptador, sem dupla conversão no domínio.
- Revisão BMAD Blind Hunter executada em subagente independente sem contexto, conforme workflow renderizado. Cinco achados classificados e corrigidos; nenhum adiado. O perfil informado e o cálculo usam a mesma constante; getters/campos invisíveis/URLs ambíguas falham antes do consumo.
- Verificação local: 17/17 testes passam, checagem sintática passa, demo por subprocesso passa; cobertura medida de linhas 100% e branches 98,53% para esta fatia. Node 25.9.0 instalado, sem dependências baixadas. Node 24 LTS, navegador, build de UI, auth, APIs/fontes reais, orçamento concorrente, performance e deploy não foram executados.
- Baseline de instalação: 760 arquivos anteriores permitidos conferidos por SHA-256, incluindo os 730 do baseline inicial. Instalação somente de arquivos novos, com lock e recusa de qualquer destino existente; resultado final em `model-cost-fixtures-verification.json`.
- Ajuste da nota inicial sobre versionamento: o workflow `bmad-build` prevê commit local. Confirmado índice vazio e ausência de HEAD; o commit terá somente os arquivos novos desta fatia, preservando todos os arquivos/untracked anteriores. A proibição de stage dos artefatos antigos e de push continua. Hash do commit será retornado no relatório final após a verificação no projeto.

## Review Triage Log

- **medium → patch** — `model-pricing.mjs`, propriedades instáveis/invisíveis: o exemplo do getter era aceito e podia mudar a leitura entre validação/cálculo; campo não enumerável sumia do JSON. Agora somente propriedades próprias, enumeráveis e de dados passam. Teste confirma rejeição sem executar getter.
- **low → patch** — `model-pricing.mjs`, URL com controles/barra invertida: `URL` normalizava entradas que a demo conservava sem normalizar. Agora exige prefixo HTTPS absoluto e rejeita controles/espaços/barras invertidas; regressões exercitam os exemplos da revisão.
- **medium → patch** — `demo-model-cost.mjs`, proveniência omitida: saída perdia `sourceRecordId`, `fetchedAt` e `observedAt`. Campos preservados e verificados fixture a fixture pelo teste de subprocesso.
- **low → patch** — `model-cost.mjs`, perfil duplicado: valores atuais coincidiam com o PRD, mas manutenção poderia alterar o perfil sem alterar multiplicadores. Cálculo deriva ambos de `STANDARD_TASK`; teste fixa o perfil exigido pelo PRD.
- **low → patch** — `model-cost.test.mjs`, limites sem prova: limites de 256 caracteres e escalas extremas não estavam exercitados. Adicionados resultados decimais exatos para preços máximos e soma de inteiro muito grande com fração mínima; testes passam.
