# Rubric review — 2026-10-12

## Veredito

**Aprovável com dois ajustes de prioridade média antes de fechar o spine.** Não encontrei divergência crítica ou alta entre unidades do nível abaixo. AD-17 fixa ownership, renderer, intents e o limite entre protótipo e produto; Q3/Q6/Q8/Q9/Q10 mantêm explicitamente abertas as decisões que ainda dependem de UX, provider, localização ou implementação.

## Escopo e método

Avaliei `ARCHITECTURE-SPINE.md` pelo checklist em `.agents/skills/bmad-architecture/references/reviewer-gate.md`. Para confirmar alegações de atualidade e compatibilidade, consultei o estado do código do workspace e fontes oficiais do Cesium. Não editei o spine, handoff nem código. A ausência de evidência no próprio spine foi tratada como uma lacuna documental; este review não atesta execução do protótipo ou do renderer de produção.

## Achados

### P2 — Definir o modelo de credenciais de providers de browser

**Evidência:** AD-9, linha 94, proíbe segredos em bundles e URLs. AD-17, linha 142, deixa providers externos independentes; Q6, linha 212, fecha licença, custo/quota, crédito, cache/Referer e fallback, mas não explicita token público, escopos, restrição de origem nem monitoramento de uso por token.

**Risco de divergência:** Cesium ion documenta tokens com escopos públicos apropriados para clientes públicos e recomenda token próprio por app, escopo mínimo, restrição por URL e assets selecionados; o token default é só para desenvolvimento. Duas implementações podem obedecer à regra genérica de “segredos fora do bundle” e chegar a resultados incompatíveis: rejeitar o provider porque o token cliente seria tratado como segredo, ou embutir credencial ampla sem a restrição recomendada.

**Recomendação:** completar Q6/AD-17 com uma decisão obrigatória por provider sobre autenticação em cliente, escopo mínimo, restrições de origem/assets, separação de ambientes e monitoramento/rotação de quota. Distinguir credencial pública restrita de segredo privado; nunca pôr escopos privados ou credenciais de escrita no browser. Se provider não exigir token, registrar isso como parte da decisão. Fontes: [guia oficial de tokens ion](https://cesium.com/learn/ion/cesium-ion-access-tokens/) e [quickstart oficial CesiumJS](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/).

### P3 — Tornar explícito o envelope de dispositivo e a degradação do renderer

**Evidência:** Q3, linha 209, deixa teclado, leitor de tela, toque/pinça, movimento reduzido, mobile e foco em aberto. Q9, linha 214, manda medir tamanho, CSP, cache e fallback no preview. O Structural Seed, linha 157, exige benchmark do envelope completo e fallback, mas não define que o envelope inclui suporte WebGL/dispositivos nem os estados de degradação.

**Risco de divergência:** dois implementadores podem entregar critérios diferentes para GPU/dispositivo sem WebGL disponível, memória/quadros insuficientes ou perda do contexto gráfico; um pode bloquear o app, enquanto outro apresenta estado alternativo. O restante da UI e o estado semântico podem ficar indisponíveis junto com o canvas.

**Recomendação:** explicitar em Q9 que o spike deve validar navegadores/dispositivos suportados, falha/perda do WebGL, envelope de desempenho e o comportamento do fallback, antes de marcar vistas como habilitadas. Manter critérios numéricos como resultado medido, não como fato presumido.

## Checklist do gate

- **Divergências reais de unidades abaixo:** não encontrei par de unidades que possa divergir sobre autoridade de entidade, filtro, estado semântico ou publicação: AD-10 e AD-16 fecham esses caminhos; AD-17 encaminha ações ao reducer comum.
- **Rules enforceable:** AD-17 proíbe store paralelo, dados curados no renderer e localizações de demonstração como fatos; Q8 bloqueia pontos reais até fechar significado/proveniência/precisão. Q10 também impede assumir que todo recurso do protótipo vira escopo.
- **Deferred/open:** Q3/Q6/Q8/Q9/Q10 identificam gates e predecessores apropriados. O modelo de credenciais de provider deve ser acrescentado ao Q6; o envelope WebGL/dispositivo, ao Q9.
- **Tecnologia atual:** CesiumJS 1.146 está confirmado como release mais recente na data deste review; o repositório oficial lista a publicação em 2026-10-01. [Releases oficiais](https://github.com/CesiumGS/cesium/releases). O quickstart oficial mostra CDN/NPM e confirma que a instalação NPM precisa servir Workers, ThirdParty, Assets e Widgets; Q9 cobre a decisão de entrega e assets. [Quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/).
- **Fit com brownfield:** coerente com o código presente. `src/contracts/exploration.mjs` enumera 3D/2D/MAPA/SAT; `createExploration` recebe `availableViews`, inicia com 3D e exige 3D disponível. AD-17 respeita isso ao habilitar apenas vistas implementadas. Não há Cesium instalado nem fronteira `GlobeRenderer` no app atual; o spine afirma ambas as condições e não apresenta o seed Vite/TypeScript como código existente.
- **Cobertura PRD:** o renderer está ligado aos FR de Globo, interação, vistas, Notícias e Relações; Q6 menciona base com oceanos/continentes/relevo, variantes de tema/Vista, fallback e regras OSM. Q8 impede promover coordenadas de demo a localização empresarial. Não identifiquei lacuna de capacidade que contradiga o PRD no escopo desta atualização.
- **Dimensões operacionais:** ambientes, deploy, recuperação, logs e custo pertencem a AD-14; provider/licença/atribuição/cache/pre-fetch estão em AD-13/Q6; CSP, cache, assets e fallback estão em Q9. O detalhamento de credenciais e do envelope de dispositivo ficam nos achados acima.

## Limites

Este é um review do spine, não validação funcional do protótipo nem prova de licenças, chaves, orçamento ou implantação. A checagem brownfield foi somente leitura e limitada aos contratos/estado de exploração relevantes ao renderer. Não acessei credenciais locais.
