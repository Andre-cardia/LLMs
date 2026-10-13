# Prose review — Addendum

This document exists to help implementers and architects use the PRD’s source, data, and integration notes without mistaking proposals or prototype evidence for confirmed behavior. The reference/database structure fits this purpose. The addendum uses a compact technical voice, domain labels, tables, and explicit implementation caveats; preserve those choices.

The prose pass found five changes that would improve precision or remove awkward phrasing. Suggestions are limited to the quoted text.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| prose | §A, Finnhub — “Apenas Fonte de reserva do Yahoo Finance.” | “Usar apenas como fonte de reserva para o Yahoo Finance.” | Completes the elliptical table note and normalizes capitalization, making the fallback relationship easier to read. |
| prose | §D, Custos — “notícias e descoberta preservam o teto confirmado perto de US$5/mês e sua degradação a 80%/100%.” | “notícias e descoberta mantêm o teto confirmado de cerca de US$ 5/mês e aplicam o comportamento de degradação previsto nos marcos de 80% e 100% do teto.” | Replaces the unclear possessive “sua” and clarifies that 80% and 100% refer to the budget ceiling without specifying behavior beyond the existing text. |
| prose | §F, TeleGeography — “Traçados são referências estilizadas, não levantamento de rota física precisa.” | “Os traçados são referências estilizadas e não representam levantamentos precisos das rotas físicas.” | Removes the compressed, ambiguous phrase “levantamento de rota física precisa.” |
| prose | §F, Tiles OpenStreetMap — “Ao afastar, sair da cobertura ou falhar a camada, a imagem de satélite volta.” | “Ao afastar, sair da área de cobertura ou ocorrer falha na camada fotorealística, a base retorna à imagem de satélite.” | Names the failing layer and makes the three transition conditions parallel and explicit. |
| prose | §G — “Ajustes AA registrados não substituem verificação de texto sobre textura, transparência e brilho.” | Consider: “Os ajustes de acessibilidade no nível AA registrados não substituem a verificação de texto sobre textura, transparência e brilho.”? | Expand “AA” at first use if it refers to an accessibility conformance level; the addendum does not identify the standard here. |

## Summary

- Recommendations: 5.
- Estimated reduction if accepted: 0 words (about 0% of 2,565 words); these are clarity edits, not cuts.
- Length target: none provided.
- Comprehension trade-offs: none.
