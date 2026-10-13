---
reviewer: architecture_tech_reality_check
lens: ".agents/skills/bmad-architecture/customize.toml — finalize reviewer 1"
date: 2026-10-12
verdict: partial
critical: 0
high: 0
medium: 1
---

# Revisão tecnológica final — spine de 12/10/2026

**Veredito: parcial; baseline CesiumJS confirmada e adequada para spike isolado com fixtures.** As escolhas vinculantes de renderer foram confrontadas com releases e documentação primária atuais. CesiumJS 1.146 existe, é a release atual observada nesta data e cobre o papel de renderer principal do Globo. CDN e npm são caminhos documentados, e o suporte do Vite a JavaScript vanilla/`.mjs` encaixa na base existente sem exigir migração a TypeScript. A ressalva média é específica: antes de aprovar Google Photorealistic 3D Tiles em Q6, provar uma topologia de credencial segura que funcione com os pedidos disparados pelo renderer no browser.

## Escopo e método

Li a lente `finalize_reviewers` de [`.agents/skills/bmad-architecture/customize.toml`](../../../../../.agents/skills/bmad-architecture/customize.toml), o [spine atual](../ARCHITECTURE-SPINE.md), [evidências tecnológicas](../technology-evidence.md), [handoff Cesium](../cesium-integration.md), [readiness](../implementation-readiness.md), o `package.json`, módulos locais e o protótipo Cesium. Confirmei as alegações tecnológicas em fontes primárias do Cesium, Google, Vite e OpenStreetMap.

Não instalei dependências, compilei a aplicação, executei testes, usei credenciais, chamei providers, configurei contas, fiz benchmark ou publiquei recursos. A única escrita desta revisão é este relatório.

## Achado

### M1 — Média: falta provar o fluxo seguro de credenciais caso Google seja o provider de fotorealismo

- **Escopo afetado:** AD-17 e Q6; o handoff corretamente mantém Google como candidato, não como provider aprovado.
- **Evidência:** a documentação Google de Photorealistic 3D Tiles mostra CesiumJS buscando o tileset com uma API key na URL e diz que os pedidos seguintes são feitos pelo renderer enquanto a pessoa explora. O mesmo material exige conta de billing e API habilitada. Já a [matriz oficial de credenciais](https://developers.google.com/maps/faq?hl=en) recomenda chave com restrição por IP para Map Tiles API; a orientação de segurança trata Map Tiles API entre os serviços Web e recomenda proxy seguro para chamadas feitas por uma aplicação cliente quando não há SDK cliente apropriado. A key exposta no caminho direto do renderer não pode ser tratada como segredo de servidor.
- **Risco concreto:** se Q6 escolher Google e mantiver tile requests diretos do browser, a restrição de IP recomendada para essa API pode não corresponder às origens variáveis dos usuários. Deixar chave sem restrição amplia risco de consumo indevido e cobrança. O desenho Cloudflare ainda é proposta e esta revisão não confirma IP de saída estático nem proxy para os pedidos de tiles.
- **Ação antes de aprovar Google em Q6:** fazer um spike de autenticação com a API e renderer reais; registrar a restrição de chave aceita para esta topologia. Se for necessário proxy, ele deve autenticar o dono, permitir apenas os endpoints/parâmetros previstos, impor limites/custo e não virar relay arbitrário. Alternativamente, escolher outro provider cuja credencial cliente e contrato se encaixem. Continuam necessários crédito visível/acessível, billing, quota, política de cache e fallback.
- **Triage:** não bloqueia CesiumJS, as demais fontes candidatas ou o spike com fixtures. Bloqueia apenas a aprovação/ativação do Google Tiles até o desenho de credencial e billing ser provado.

## Confirmação das decisões e limites

| Decisão/alegação do spine | Confirmação por fonte primária atual | Limite observado |
| --- | --- | --- |
| **CesiumJS 1.146 como baseline vinculante do renderer** | A [release 1.146](https://github.com/CesiumGS/cesium/releases/tag/1.146) foi publicada em 01/10/2026 e aparece como `Latest` na consulta de 12/10. O [manifesto do pacote na tag 1.146](https://github.com/CesiumGS/cesium/blob/1.146/package.json) informa pacote `cesium` versão `1.146.0`, licença Apache-2.0 e dependências modulares; a release introduz também `@cesium/core`. | A baseline está confirmada, mas o pacote não está instalado no app principal. Se Q9 escolher npm, fixar `cesium@1.146.0` e registrar o lockfile para congelar também a resolução transitiva. A release, sozinha, não prova build nem compatibilidade do app. |
| **Fit para Globo 2D/3D, pontos/rótulos, terreno e imagery** | [CesiumJS Fundamentals](https://cesium.com/learn/cesiumjs-fundamentals/) descreve globos 3D e mapas 2D no browser usando WebGL, entidades de dados espaciais, controles de câmera e carregamento de terrain, imagery e 3D Tiles. A [Quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/) demonstra terreno global e edifícios no Viewer. | Confirma capacidade do engine, não desempenho, acessibilidade, compatibilidade em dispositivos alvo, qualidade das coordenadas nem experiência das quatro Vistas do produto. O benchmark, fallback e gates Q3/Q8/Q9 seguem necessários. |
| **Terreno, edifícios e fotorealismo incluídos no escopo escolhido** | O engine pode exibir Terrain, imagery, entidades e 3D Tiles. Google documenta CesiumJS como renderer compatível com [Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles) e mostra exibição de créditos. | A escolha de capacidade não seleciona conteúdo. Google 3D Tiles exige billing/API key e restrições contratuais; Cesium ion, World Terrain, OSM Buildings e quaisquer fontes de satélite/imagery continuam decisões separadas de Q6. Google não deve ser descrito como provider aprovado. |
| **CDN ou npm e serving de assets/workers** | A [Quickstart oficial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/) apresenta CDN versionada 1.146 e npm. Na opção npm, exige definir `CESIUM_BASE_URL` antes do import e servir `Workers`, `ThirdParty`, `Assets` e `Widgets`; a opção CDN já mostra HTML com `<script type="module">`. | Q9 mantém aberta uma escolha real e corretamente pendente. O guia de Webpack é legado e não deve ser usado como configuração pronta para Vite. Ainda faltam paths, CSP, cache, bundle, workers em produção e prova nos navegadores/dispositivos alvo. |
| **Compatibilidade com a base local `.mjs` e seed JavaScript** | O `package.json` local é `type: module`, e o store/reducer e contratos estão em ES modules `.mjs`. O guia atual do [Vite](https://vite.dev/guide/) oferece template `vanilla` JavaScript e entradas HTML com `type="module"`; a configuração padrão de [resolução do Vite](https://vite.dev/config/shared-options#resolve-extensions) lista `.mjs`. Portanto, não há exigência técnica de TypeScript ou framework para esse renderer. | A compatibilidade é de formato/build, ainda não um spike no app. O repo não tem Vite, Cesium, configuração de build do app ou lockfile; `node_modules/cesium` está ausente. Um adapter local, `src/adapters/memory-snapshots.mjs`, importa `node:crypto`, então a entrada do browser deve importar módulos compartilháveis seletivamente e manter adapters Node fora do bundle. A build local inspecionada copia a prévia estática; não representa build do app principal. Q9 exige preservar uma só instância do store e decidir a estratégia de carregamento antes do scaffold. |
| **Credenciais Cesium ion** | A [documentação oficial de Access Tokens](https://cesium.com/learn/ion/cesium-ion-access-tokens/) distingue scopes públicos (`assets:read`, `geocode`) de scopes privados/de escrita, recomenda token separado por app, escopo mínimo, restrição por URL e monitoramento/rotação. A restrição por URL depende do `Referer`; o token default é apenas conveniência de desenvolvimento e não é recomendado em produção. | AD-17 está alinhado ao manter segredo/de escrita no servidor e permitir apenas credencial pública restrita e monitorada no cliente. Se houver ion, ainda deve ser definida a lista mínima de assets e origens de preview/prod. Token de ion não é requisito do CesiumJS em si, apenas dos serviços/ativos ion usados. |
| **OpenStreetMap como possível fonte de tiles** | A [política oficial OSMF](https://operations.osmfoundation.org/policies/tiles/) exige HTTPS, crédito visível, Referer válido para web, respeito a cache headers e proíbe bulk prefetch/offline no `tile.openstreetmap.org`; o serviço não oferece SLA. | Q6 já preserva esses limites e um fallback. OSM tile server não é uma fonte de produção aprovada por esta revisão; política pode mudar e operação comercial deve contar com provider alternativo. |
| **Cloudflare Workers, D1, R2, Access; Vite** | A classificação do spine está correta: Cloudflare é `[ASSUMPTION]` sujeito a Q2, e Vite vanilla JS é alternativa de build, sem escolha. | Esta revisão não encontrou scaffold nem recurso Cloudflare configurado. Não se deve converter a proposta em decisão vinculante, presumir custo/limite, ou afirmar CAS, proteção de assets ou recuperação sem prova no ambiente escolhido. |

## Conclusão

AD-17 está sustentado como escolha do **engine e renderer**: CesiumJS 1.146. A fonte oficial confirma 1.146.0, o caminho CDN fixado usado pelo protótipo e a distribuição npm com assets/workers. A base ES module atual pode ser preservada; Vite vanilla JS é tecnicamente compatível com `.mjs`, mas continua opção, e a integração ao store ainda não foi construída.

As capacidades de terreno, edifícios e fotorealismo são escopo escolhido, enquanto fonte de imagery, Cesium ion, Google, OSM, credenciais, billing, crédito, cache, fallback e licenças seguem em Q6. Antes de aprovar Google, fechar M1 com uma prova da topologia de chave/requests. Q8 ainda bloqueia localizações reais; Q9 ainda bloqueia scaffold e carga operacional; o renderer precisa passar pelo benchmark e fallback que o spine já exige. Workers/D1/R2 permanecem apenas proposta em Q2.

## Fontes primárias consultadas

- [CesiumJS 1.146 release](https://github.com/CesiumGS/cesium/releases/tag/1.146)
- [Cesium 1.146 package manifest](https://github.com/CesiumGS/cesium/blob/1.146/package.json)
- [CesiumJS Quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/)
- [CesiumJS Fundamentals](https://cesium.com/learn/cesiumjs-fundamentals/)
- [Cesium ion Access Tokens](https://cesium.com/learn/ion/cesium-ion-access-tokens/)
- [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)
- [Google Map Tiles API policies](https://developers.google.com/maps/documentation/tile/policies)
- [Google Maps Platform FAQ — API credential restrictions](https://developers.google.com/maps/faq?hl=en)
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Vite Getting Started](https://vite.dev/guide/)
- [Vite resolve extensions](https://vite.dev/config/shared-options#resolve-extensions)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
