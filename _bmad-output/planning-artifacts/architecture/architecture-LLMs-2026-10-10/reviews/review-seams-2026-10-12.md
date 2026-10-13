# Revisão adversarial de fronteiras — integração CesiumJS

Data: 12/10/2026. Lente configurada do reviewer-gate: construir pares de unidades um nível abaixo que obedeçam aos ADs e ainda possam divergir. O julgamento recai no spine; `contracts.md` e `cesium-integration.md` foram consultados para localizar contratos e gates, sem tratar o handoff como substituto dos ADs.

Versões examinadas:

- `ARCHITECTURE-SPINE.md`: SHA-256 `ed23f5f94036455e18cf329af60273b3aeeae1ca6d7b9edf5821b046d9f97b18`.
- `cesium-integration.md`: SHA-256 `420d387a31aaac5c7cbf0d841c6035c6df0f74ea24b8cc645700c1fdd3c2c7d1`.

**Veredito: corrigir três contratos de fronteira antes das stories independentes do Globo.** Não encontrei conflito que invalide a escolha CesiumJS nem os fluxos herdados de UX. Os pares abaixo podem divergir apesar dos ADs atuais; Q3, Q6 e Q8 já são gates próximos, mas precisam fechar também os itens de autoridade e comportamento identificados aqui.

## G1 — Alta: o resultado semântico dos filtros não tem um produtor único

**Evidência:** AD-10 diz que o store possui filtros e que renderers projetam as mesmas entidades (linha 100); AD-17 proíbe o adapter de possuir filtros, mas exige que consuma uma projeção somente de leitura (linha 142). O AD não determina se essa projeção já contém o conjunto visível nem quem avalia os predicados aplicados aos registros.

**Par permitido:**

- `GlobeProjection` lê `effectiveState`, aplica uma vez os filtros semânticos e entrega ao Cesium os IDs visíveis com suas localizações.
- `CesiumLayerAdapter` recebe todos os IDs canônicos e os filtros ativos, lê-os do store sem gravar estado, e avalia quais entidades desenhar dentro da cena.

Ambas as unidades mantêm o reducer como único escritor de estado, não persistem filtros no Cesium e usam IDs canônicos. Ainda assim, filtros de Camada/Etiquetas e os critérios de Laboratório podem ser interpretados de modo diferente pela projeção compartilhada e pelo adapter; o globo então mostra uma lista diferente das outras superfícies, contrariando o propósito explícito do AD-10.

**Aperto recomendado:** declarar em AD-10/AD-17 que a elegibilidade semântica de cada Empresa é calculada uma única vez pelo seletor/projeção comum e que o adapter só desenha os IDs resultantes. O contrato compartilhado deve definir a forma desse conjunto e os predicados de filtro antes de abrir stories paralelas de renderização.

**Prova de implementação:** para cada combinação de filtros e fixture com `primaryLayer`, `tags` e `isLab`, validar igualdade exata entre IDs projetados e IDs desenhados no globo; a cena não deve conter um avaliador alternativo de predicados.

## G2 — Média: falta um dono único para compor imagery e camadas por Vista

**Evidência:** AD-13 separa infraestrutura geográfica e exige atribuição, viewport interativo, fallback e gates de provider/zoom/Vista/estilo (linha 118). AD-17 exige providers independentes e aprovação por provider (linha 142). Q6 lista imagery-base, variantes por tema/Vista, fallback e opções, mas nenhum AD define quem monta a composição na cena ou a autoridade sobre slots de base/overlay.

**Par permitido:**

- `GlobeLayerComposer` é dono da receita por Vista: uma imagery-base, overlays de tema/luzes, terreno e edifícios; providers só entregam fontes/capacidades e atribuição.
- Cada adapter de provider altera diretamente as coleções da cena quando a Vista ou um toggle muda; o controlador de Vista também adiciona fallback/base e overlays.

Ambos mantêm providers independentes, podem cumprir licença/cache/créditos, e respeitam as semânticas visuais herdadas. A segunda organização ainda pode substituir uma base instalada pela outra, empilhar overlay duplicado ou exibir crédito associado à camada não visível. O resultado difere por ordem de montagem e falha de provider, sem decisão explícita que viole AD-13/17.

**Aperto recomendado:** Q6 deve registrar a receita e as dependências de cada Vista, incluindo camadas obrigatórias/opcionais e fallback. AD-17 deve apontar um único compositor como dono das coleções de imagery/terrain/buildings; adapters de provider retornam recursos e status, sem mutar a cena. Vincular disponibilidade das Vistas ao mesmo contrato compartilhado, inclusive quando uma camada opcional falha.

**Prova de implementação:** permutar ordem de inicialização e falhas de cada provider e verificar que cada Vista conserva sua receita, não duplica camadas e apresenta créditos apenas para os providers visíveis.

## G3 — Média: qualidade aproximada de Localização não determina como o ponto aparece

**Evidência:** AD-17 exige Localizações com significado, precisão e evidência, mantém ausência/aproximação no gate Q8 e proíbe tratar ponto não validado como endereço preciso (linha 142). Q8 pede significado, proveniência e precisão (linha 213); os contratos também deixam o schema exato para Q8/AD-16. Não há regra de apresentação para um registro aproximado ou sem coordenada utilizável.

**Par permitido:**

- `GlobeProjection` omite do globo Localizações aproximadas ou incompletas; a Empresa continua disponível nas demais superfícies.
- `CesiumLocationAdapter` desenha a coordenada aproximada com símbolo visual de incerteza e limita a aproximação da câmera para não sugerir precisão.

Ambas preservam a qualidade e a evidência, não afirmam endereço preciso e mantêm o ID canônico da Empresa. Mesmo assim, contagem de Pontos, resultados visíveis e navegação ao selecionar uma Empresa mudam de forma perceptível.

**Aperto recomendado:** Q8 deve mapear classes de qualidade para comportamento de exibição, seleção e câmera (mostrar como região de incerteza, mostrar como ponto aproximado ou omitir); quando não houver coordenada, definir explicitamente se o Globo não recebe aquele registro. AD-17 deve exigir que a projeção entregue esse estado visual sem o renderer inferi-lo do grau de precisão.

**Prova de implementação:** fixtures para localização precisa, aproximada, incompleta e ausente produzem o comportamento aprovado em todas as quatro Vistas; seleção nunca usa centroide ou coordenada de demonstração como destino preciso.

## Limites

Esta é uma análise estática dos contratos documentais. Não instalei Cesium, não alterei spine/código e não executei benchmark, browser ou testes de produto. O handoff já pede descarte de listeners/cargas ao sair da Vista e mapeia as quatro Vistas; por isso não classifiquei ciclo de vida nem a semântica nominal das Vistas como achados separados. Os exemplos acima são testes de arquitetura para execução quando as stories correspondentes forem liberadas.
