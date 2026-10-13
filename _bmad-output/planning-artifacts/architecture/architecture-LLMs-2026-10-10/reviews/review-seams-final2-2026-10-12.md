# Rechecagem final de seams — integração CesiumJS

Data: 12/10/2026. Releitura solicitada após os ajustes em Q6/Q9, AD-17 e `cesium-integration.md`. Escopo: receita por Vista/tema, falhas de providers/layers, disponibilidade compartilhada, WebGL/fallback e ciclo de vida. Critério: verificar se ainda há pares de unidades abaixo do spine que sigam literalmente os contratos e produzam decisões incompatíveis.

Versões examinadas:

- `ARCHITECTURE-SPINE.md`: SHA-256 `385de8f46b985440c9f9744e732cb39426b6ef2d4fc748c1311f0af93b0ae453`.
- `cesium-integration.md`: SHA-256 `2ac9170baf4205039a3b16cd4fcc36175124bf6da3881d458b29ac4982536565`.

**Veredito: PASS documental — os dois achados médios do review anterior foram fechados; lifecycle e descarte de gerações vencidas também estão especificados no spine e no handoff.** Não encontrei par restante que viole a receita única, a política comum de disponibilidade, o estado/fallback WebGL ou o ciclo de vida. Resta uma ambiguidade textual de baixa severidade no handoff sobre erros de providers necessários; ela não altera a regra explícita do spine, mas vale eliminar.

## Rechecagem dos achados anteriores

| Área | Mudança conferida | Estado |
| --- | --- | --- |
| Q6 — receita e composição | Q6 agora exige receita única por Vista/tema, incluindo imagery-base, variantes, terreno, edifícios, fotorealismo e fallback. AD-17 atribui aplicação a um único `GlobeSceneComposer`; adapters só retornam recurso, status e crédito. | Fechado quanto a owner e escopo da receita. A composição concreta/provider continua gate Q6 antes da story de mapa. |
| Q6 — falha opcional/obrigatória | AD-17, Q6 e handoff Rule 3 concordam: falha opcional conserva a base; indisponibilidade de camada/provider necessário desabilita a Vista no estado compartilhado e no adapter. | Fechado. O seletor da Vista e o composer não podem adotar resultados separados. |
| Q6 — disponibilidade e créditos | A Vista necessária indisponível é desabilitada no estado compartilhado; créditos só aparecem para camadas/providers ativos. | Fechado no spine e no handoff Rule 3. |
| Q6 — credencial Google | Q6 exige demonstrar request path compatível com chave IP-restricted; se o fluxo não for compatível com browser/termos, deve-se escolher provider alternativo, sem chave de serviço irrestrita no cliente. | Fechado como restrição arquitetural; prova de compatibilidade e escolha ainda pendentes no gate. |
| Q9 — WebGL/fallback | O spike define matriz browser/device, perda/restauração de contexto e estado/fallback comum: mantém seleção, desabilita Vista incompatível e permite retornar a Vista habilitada sem estado local paralelo. | Fechado quanto ao estado comum. A matriz e a prova continuam pré-requisitos do scaffold. |
| AD-17/handoff — lifecycle | `dispose` remove listeners/subscriptions, cancela cargas e ignora conclusões/eventos de gerações vencidas; o handoff inclui encerramento da Vista e troca de aba/renderizador. | Fechado. |

### Pares anteriores que deixaram de ser permitidos

- Dois compositores tratando a mesma falha de terreno, imagery ou edifícios com resultados diferentes deixam de cumprir Q6/AD-17: a base permanece em falha opcional; a Vista é desabilitada em falha necessária.
- Um composer mantendo SAT habilitada enquanto o estado compartilhado a marca indisponível deixa de cumprir os dois contratos de disponibilidade.
- Dois renderers escolhendo fallback/estado local independente para WebGL indisponível ou contexto perdido deixam de cumprir Q9: a seleção semântica é mantida e a Vista incompatível é desabilitada em estado comum.
- Manter listeners/cargas antigos ou aplicar recurso concluído para geração vencida deixa de cumprir `dispose`/handoff.

## R1 — Baixa: a regra genérica de erro no handoff pode ser lida como exceção à falha de camada necessária

**Evidência:** o handoff Rule 3 replica a regra precisa: falha opcional preserva a base e camada necessária indisponível desabilita a Vista no estado compartilhado. A Rule 5 diz de forma mais ampla que “Erro/quota mantém a navegação, preserva a receita base e indica indisponibilidade”. Lida sem o contexto da Rule 3, essa frase pode sugerir que qualquer erro, inclusive em provider necessário, preserva a Vista selecionada com a base.

**Par residual:** um handler interpreta Rule 5 como fallback visual para a base e mantém a Vista SAT ativa durante erro do provider necessário; outro segue Rule 3 e remove SAT de `availableViews`, mas mantém navegação para outras Vistas. O segundo segue AD-17/Q6. O primeiro pode alegar cumprimento da frase geral da Rule 5, embora contradiga as regras específicas.

**Aperto recomendado:** reescrever Rule 5 para explicitar a precedência: “erro/quota em camada opcional preserva a base e indica indisponibilidade; camada necessária indisponível segue a Rule 3 e desabilita a Vista no estado compartilhado; a navegação para Vistas habilitadas permanece disponível; não há troca silenciosa de provider.” Isso elimina a leitura concorrente sem mudar a decisão de arquitetura.

## Limites

Esta rechecagem é documental. Não executei spike WebGL, testes de provider, validação de credenciais, benchmark ou prova de lifecycle. Q6/Q8/Q9 continuam gates antes das stories afetadas; os textos agora determinam os comportamentos a provar, mas não atestam funcionamento em runtime. Não alterei spine, handoff nem código; esta revisão é a única escrita.
