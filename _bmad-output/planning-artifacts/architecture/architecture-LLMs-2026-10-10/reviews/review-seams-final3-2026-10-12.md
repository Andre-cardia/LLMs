# Rechecagem curta — falhas de provider no Globe

Data: 12/10/2026. Escopo: redação atual da Rule 5 em `cesium-integration.md` contra AD-17 e Q6 do spine.

**Veredito: PASS.** A redação elimina a ambiguidade apontada no review anterior e está alinhada ao spine.

- Falha opcional: preserva base e Vista ativa, com indisponibilidade visível; compatível com AD-17/Q6.
- Falha de provider obrigatório: desabilita a Vista no seletor compartilhado e no adapter, preservando seleção/navegação e sem substituição silenciosa; compatível com AD-17, Q6 e estado/fallback comum de Q9.
- Não há divergência de comportamento entre handoff e spine nesta redação.

Conferidos: `ARCHITECTURE-SPINE.md` SHA-256 `385de8f46b985440c9f9744e732cb39426b6ef2d4fc748c1311f0af93b0ae453`; `cesium-integration.md` SHA-256 `d4048d7908aea707ce996f5781c92bfdda5bf9fe9ad73d9d6339eb7a8c4063c5`. Checagem documental, sem execução de providers ou testes de runtime. Não alterei spine, handoff ou código; este arquivo é a única escrita.
