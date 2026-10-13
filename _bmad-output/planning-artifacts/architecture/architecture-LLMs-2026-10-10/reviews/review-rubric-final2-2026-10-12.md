---
reviewer: architecture_rubric_final2
date: 2026-10-12
verdict: pass_with_close_note
critical: 0
high: 0
medium: 0
low: 1
---

# Segunda revisão final independente do rubric

## Veredito

**Aprovável pelo checklist do reviewer-gate.** Os últimos ajustes tornam explícitos os comportamentos compartilhados para falha de camada obrigatória/opcional, credencial Google e provider alternativo, perda/restauração de WebGL e escopo de Q10. Não encontrei nova divergência arquitetural nem pendência fora dos gates registrados.

### Nota de fechamento — P3: frontmatter ainda marca `status: draft`

O conteúdo passa no rubric, mas o frontmatter de `ARCHITECTURE-SPINE.md` ainda declara `status: draft`. Ao encerrar o spine, a etapa de fechamento do skill pede definir `status: final` e atualizar a data. Essa é uma pendência de ciclo de vida do documento, não uma lacuna de arquitetura.

## Escopo e método

Reli o spine atualizado e comparei as mudanças em AD-17/Q6/Q9/Q10 com o checklist em `.agents/skills/bmad-architecture/references/reviewer-gate.md`, a cobertura de requisitos e a base brownfield registrada. Rodei o lint documental obrigatório: `ok: true`, zero achados. Conferi a orientação atual do Google para chaves da Map Tiles API, renderer CesiumJS e atribuição. Não alterei spine, código ou outros artefatos.

## Checklist do gate

- **Divergências entre unidades do nível abaixo:** resolvidas. AD-10 mantém o reducer como escritor semântico único e a projeção comum de Empresas filtradas. AD-17 proíbe recalcular filtros no adapter do Globo e encaminha seleção/navegação como intents. `GlobeSceneComposer` é o único dono das coleções da cena. A aplicação, o seletor de Vistas e o renderer não têm estado de produto paralelo.
- **Falha de camada opcional ou obrigatória:** agora tem resultado comum explícito. Falha opcional preserva a imagery-base; indisponibilidade de camada obrigatória desabilita a Vista tanto no estado/seletor compartilhado quanto no adapter. Créditos pertencem apenas a camadas ativas. Q6 e AD-17 descrevem a mesma regra e deixam a disponibilidade fora da decisão independente de cada provider.
- **Google Photorealistic 3D Tiles e credenciais:** Q6 obriga a demonstrar um caminho compatível com a chave restrita por IP; se o renderer browser e os termos não permitirem esse caminho, exige provider alternativo e veda chave de serviço irrestrita no cliente. Isso resolve a ambiguidade anterior entre chave pública de browser e segredo de servidor sem presumir que Google será aprovado. A documentação oficial atual recomenda restringir chaves da Map Tiles API por API e IP, lista CesiumJS como renderer de 3D Tiles e exige créditos do Google/dados exibidos e respeito aos headers de cache. O gate pede validação concreta desses requisitos e alternativa segura. [Chaves da Map Tiles API](https://developers.google.com/maps/documentation/tile/get-api-key), [renderers de 3D Tiles](https://developers.google.com/maps/documentation/tile/use-renderer), [políticas e atribuição](https://developers.google.com/maps/documentation/tile/policies).
- **WebGL e estado de falha:** Q9 agora exige que o spike defina matriz de browsers/dispositivos, perda/restauração do contexto, desempenho/tamanho e estado/fallback comum. Ele ainda fixa invariantes: preservar a seleção, desabilitar a Vista incompatível, permitir retorno a uma Vista habilitada sem estado local paralelo e habilitar só Vistas aprovadas. Em conjunto com AD-10/AD-17, isso impede que renderer e seletor anunciem disponibilidades ou transições incompatíveis. O spike deve registrar a transição da Vista atualmente ativa quando ela se torna incompatível como parte desse contrato comum, antes de stories dependentes; isso cabe no gate Q9, não é uma decisão arquitetural omitida.
- **Localizações:** Q8 exige significado, evidência/precisão, classes de exibição (ponto/região/omissão), elegibilidade de seleção e limite de aproximação da câmera; coordenadas demonstrativas continuam fixtures e ausência de coordenada utilizável omite o marcador. A projeção entrega classe visual aprovada e o renderer não infere precisão.
- **ADs enforceable:** Rules nomeiam a autoridade e as guardas que previnem as divergências descritas. AD-10, AD-16 e AD-17 fecham filtro, store, contrato e cena; Q6/Q8/Q9 bloqueiam o trabalho dependente até decisões documentadas. AD-17 também mantém ciclo de vida do renderer no fluxo comum: descarte de listeners/subscriptions, cancelamento de cargas e descarte de resultados de geração de cena vencida.
- **Deferred/open:** Q2–Q9 identificam dono/condição/predecessor para infraestrutura, UX, BACKBONES, MERCADOS, providers, geodados e carga do renderer. Q10 está resolvido pelo dono: 2D/3D, terreno, edifícios e fotorealismo entram no escopo; controles de voo novos por Empresa/região ficam fora; filtros e câmera continuam sob as regras do produto. Não há decisão aberta escondida que permita prosseguir em stories paralelas com contratos diferentes.
- **Tecnologia atual:** CesiumJS 1.146 continua como baseline verificada na data. A versão e distribuição precisam ser fixadas no scaffold, já tratado por Q9; a revisão documental não presume instalação/build. Para Google, a própria Q6 exige prova de viabilidade antes de escolher provider, portanto a arquitetura não trata compatibilidade documental como aprovação operacional.
- **Fit com brownfield:** a aplicação existente continua em JavaScript ES modules (`src/**/*.mjs`), e o spine preserva os módulos existentes como origem do store/contratos. Vite vanilla JS é alternativa; importação ou migração explícita será decidida em Q9, mantendo uma única instância semântica. Cloudflare/D1/R2 permanecem proposta de seed sujeita a Q2, não implementação existente.
- **Cobertura da especificação:** o spine liga FR-1 a FR-40; `coverage.md` mapeia cada requisito funcional a proprietário, AD e estado/gate, além de requisitos transversais e suas provas. AD-17 preserva a autoridade do PRD/UX e não promove comportamentos exclusivos do protótipo.
- **Dimensões operacionais:** AD-14 determina isolamento entre local/test/preview/prod, recuperação, backups, exclusão, logs e medição; Q2 bloqueia hospedagem/IdP/custo/provas antes de infraestrutura real. Q6 cobre licenças, credenciais, custos, créditos, cache e falhas de provider. O envelope operacional não está silencioso.
- **Spine pai:** não há spine pai indicado nos metadados ou artefatos desta retomada; não encontrei invariantes herdados a comparar.

## Limites

Esta é uma revisão documental e do estado local. Não rodei browser, benchmark, integração com Google ou outro provider, nem validei chaves, conta, termos contratuais ou licenças. A mudança fecha os contratos arquiteturais; Q2/Q6/Q9 e as provas correspondentes ainda são gates antes de integração/publicação.
