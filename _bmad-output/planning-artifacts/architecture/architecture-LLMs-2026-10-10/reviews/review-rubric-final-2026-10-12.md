---
reviewer: architecture_rubric_final
date: 2026-10-12
verdict: pass_with_close_note
critical: 0
high: 0
medium: 0
low: 1
---

# Revisão final independente do rubric

## Veredito

**Aprovável pelo checklist do reviewer-gate.** Não encontrei divergência arquitetural residual que permita a duas unidades do nível abaixo obedecerem ao spine e ainda implementarem estados ou cenas incompatíveis. As decisões do renderer e os gates Q6/Q8/Q9 fecham os achados que estavam abertos nas revisões anteriores.

### Nota de fechamento — P3: frontmatter ainda marca `status: draft`

O conteúdo atual passa pelo rubric, mas o frontmatter de `ARCHITECTURE-SPINE.md` ainda declara `status: draft`. A etapa de fechamento do skill pede mudar para `final` e atualizar a data quando o dono encerrar o spine. É uma pendência de ciclo de vida do documento, não uma lacuna de arquitetura.

## Escopo e método

Li o spine atual, o rubric em `.agents/skills/bmad-architecture/references/reviewer-gate.md`, a cobertura de requisitos e os artefatos de reconciliação/revisões desta retomada. Conferi a base local em `package.json`, `src/domain/exploration-state.mjs` e `src/contracts/exploration.mjs`. Rodei o lint documental obrigatório; ele retornou `ok: true`, zero achados. Confirmei a release atual e os requisitos de carregamento CesiumJS em documentação/repositório oficiais. Não alterei o spine nem o código.

## Checklist do gate

- **Divergências reais entre unidades abaixo:** resolvidas. AD-10 dá ao store um único caminho de mutação semântica e a projeção comum calcula uma vez as Empresas elegíveis/visíveis; renderers consomem os mesmos IDs e não reavaliam Camada/Etiqueta/Laboratório. AD-17 vincula o renderer a essa projeção e encaminha eventos como intents ao store. Isso fecha a divergência entre filtros da UI e filtros de uma rota de mapa paralela.
- **Composição da cena:** resolvida. AD-17 atribui ao único `GlobeSceneComposer` a posse das coleções da cena e a aplicação da receita definida em Q6. Adapters de provider devolvem recursos, status e créditos sem mutar a cena. Q6 pede a receita por Vista/tema, imagery-base, variantes, terreno, edifícios, fotorealismo e fallback. As unidades não podem concorrer pela composição ou empilhar/substituir camadas de modo independente.
- **Localizações aproximadas ou ausentes:** gate suficiente. Q8 exige significado, evidência e precisão por localização e mapeia cada classe para ponto, região ou omissão, elegibilidade de seleção e limite de aproximação da câmera. A projeção entrega a classe visual aprovada; o renderer não infere precisão. A ausência de coordenada utilizável omite o marcador, e pontos demonstrativos continuam fixtures.
- **Rules dos ADs:** executáveis em termos arquiteturais. Em particular, AD-10, AD-16 e AD-17 definem autoridade única, formatos compartilhados, proibição de predicados duplicados e intents; Q8/Q9 bloqueiam stories dependentes até fechar dados e compatibilidade. Os demais ADs igualmente nomeiam proprietários e guardas observáveis para publicação, identidade, orçamento, auth, feedback e recuperação. Não encontrei regra que apenas aconselhe sem impedir a divergência indicada.
- **Deferred e perguntas abertas:** delimitadas e com predecessores. Q2 bloqueia infraestrutura real; Q3 trata acabamento/viabilidade e acessibilidade; Q4/Q5 cobrem BACKBONES e instrumentos; Q6 cobre provider e receita geográfica; Q8 cobre dados reais; Q9 cobre forma de carga, browser/dispositivo, WebGL, desempenho e fallback. Q10 está registrado como resolvido pelo dono, com capacidade decidida e controles de voo adicionais do protótipo excluídos. Os gates não reabrem a semântica de produto já decidida.
- **Tecnologia atual:** CesiumJS 1.146 é a release marcada como `Latest` no repositório oficial, datada de 01/10/2026; o Quickstart oficial usa a versão 1.146 e descreve CDN ou NPM e os quatro diretórios estáticos necessários (`Workers`, `ThirdParty`, `Assets`, `Widgets`). A baseline do spine está atual na data deste review. A fonte confirma a versão e o requisito de distribuição, não prova build ou integração no app. [Releases oficiais CesiumJS](https://github.com/CesiumGS/cesium/releases), [Quickstart oficial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/).
- **Fit com brownfield:** coerente. O app existente é JavaScript ES modules, e o `package.json` não declara Vite, TypeScript, Cesium ou Workers. O spine preserva `.mjs` como origem do store/contratos, não presume conversão e deixa CDN ou NPM/Vite e eventual migração/importação explícita para Q9. O diagrama de seed não afirma que Cloudflare/D1/R2 já estejam instalados; Q2 continua gate. Nada no novo AD-17 substitui a instância do reducer existente.
- **Cobertura do PRD:** adequada para a altitude declarada. O spine vincula FR-1 a FR-40; `coverage.md` mapeia cada FR a um proprietário, ADs e estado/gate, e relaciona os requisitos transversais a regras e provas. A integração Cesium não reduz capacidades herdadas do PRD/UX e marca como condicionais os requisitos dependentes de dados, licença, provider e desempenho.
- **Dimensões operacionais e ambientais:** decididas ou adiadas explicitamente. AD-14 define isolamento local/test/preview/prod, proíbe ativação/deploy pago por testes, exige backups privados, recuperação e exclusão testadas, logs sem conteúdo/chaves e medição operacional. Q2 mantém a decisão de hospedagem/IdP/custo e a prova de infraestrutura antes de produção. Q6 mantém licença, créditos, custo/quota, cache e fallback de providers. Não há dimensão operacional inteira silenciosa.
- **Spine pai herdado:** não identifiquei spine pai indicado nos metadados/artefatos desta retomada; portanto, não há AD herdado a comparar.

## Limites

Esta revisão é documental e de estado local. Não executei build, testes de produto, browser, benchmark, acesso a provider ou validação de credenciais/licenças. Cesium ainda não está integrado ao app principal; a atualidade da release e os contratos escritos não provam desempenho nem autorização para publicar imagery, terreno ou edifícios.
