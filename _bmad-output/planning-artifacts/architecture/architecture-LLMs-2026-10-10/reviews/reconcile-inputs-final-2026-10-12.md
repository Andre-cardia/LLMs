# Reconciliação final de entradas — Cesium no Globo 3D

Revisão documental após a versão final do PRD de 12/10/2026. Três revisões independentes compararam PRD/addendum, UX DESIGN/EXPERIENCE e código atual com o spine/handoff. Nenhum arquivo de produto ou fonte foi alterado.

## Resultado por entrada

| Entrada | Achado | Resolução |
| --- | --- | --- |
| PRD e addendum finais | O spine/handoff anteriores ainda tratavam 2D e quatro Vistas como comportamento vigente, não registravam por inteiro a transição automática/fallback e falha MAPA podia ser lida como troca para SAT. | AD-10/13/17 e Q3/Q6/Q10 agora fixam projeção 3D; bases MAPA escura e SAT; transição SAT automática; terreno/edifícios compatíveis; fallback por camada e base; base inicial/provedores seguem Q6. Coverage, readiness e handoff foram alinhados. |
| UX DESIGN/EXPERIENCE | Arquivos UX preservam prescrições anteriores de quatro Vistas, incluindo 2D, 3D diurno e MAPA noturno; não prevalecem sobre FR-32 e addendum finais. Interações do Globo original continuam relevantes. | Q3/AD-17 dizem explicitamente que PRD vigente prevalece; handoff preserva hover, clique/toque, Terminal, fluxos de foco/câmera, acessibilidade e redução de movimento. Controles extras de voo do protótipo continuam fora. |
| Código brownfield | `VIEWS`, reducer e URL misturam `3D`,`2D`,`MAPA`,`SAT`; o parâmetro atual é `view`. O reducer atual não modela câmera. | Handoff recomenda estado `base: MAPA|SAT`, projeção fixa, intent de troca, disponibilidade por base, URL canônica `base`, aliases legados sem reativar 2D. A câmera permanece na instância ativa do renderer; troca de base não a reinicializa. Alteração de fonte/código fica para a story futura. |

## Limites

Q3 mantém acabamento/acessibilidade; Q6 mantém base inicial, providers, composição, cobertura, licença, custo/quota, créditos, cache, limiares e fallback; Q8 mantém semântica/proveniência de localizações; Q9 mantém carregamento/assets/WebGL/desempenho. A combinação Google photorealism com imagery SAT e terreno não foi comprovada; documentação oficial Cesium usa `globe: false` para tiles globais Google. CesiumJS 1.146 está publicada e continua a baseline escolhida, mas nenhuma integração/provider foi executado.

**Veredito:** reconciliado documentalmente após as correções listadas. Lint determinístico passou sem achados. Reviewer gate atual passou após esclarecer Q6; os três inputs foram reconciliados e os achados aplicáveis foram corrigidos. Nenhum teste de produto, chamada externa com credencial, benchmark, publicação ou deploy foi feito.
