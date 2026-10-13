---
reviewer: architecture_tech
lens: finalize_reviewers technology reality-check
date: 2026-10-12
verdict: partial
critical: 0
high: 0
medium: 1
resolvedMedium: 0
---

# Revisão tecnológica — retomada CesiumJS

**Veredito: parcial, adequada para seguir com o spike e fixtures.** A escolha de CesiumJS para renderizar o Globo principal tem bom encaixe no requisito e no código atual; a versão 1.146 existe, é a release mais recente listada em 12/10/2026, e a documentação oficial confirma CDN, npm, Vite e os assets/workers necessários. A separação entre CesiumJS e providers geográficos continua correta: nenhuma fonte de imagery, terreno ou edifícios foi aprovada por esta escolha. Há uma condição média sobre a transição do app brownfield para o seed Vite/TypeScript/Cloudflare.

Escopo: `ARCHITECTURE-SPINE.md` AD-17 e Structural Seed; `technology-evidence.md`; `cesium-integration.md`; código e arquivos de build existentes no workspace. O foco foi a lente de realidade tecnológica do reviewer-gate, incluindo confirmação em fontes primárias. Não alterei arquitetura, código, dependências ou configuração; este relatório é a única escrita desta lente.

## Achados

### M1 — Média: fronteira da migração brownfield não está decidida

- **Locais:** `ARCHITECTURE-SPINE.md` Structural Seed/Q9; `implementation-readiness.md`; estado atual do repositório.
- **Observado localmente:** o projeto contém módulos ES JavaScript em `src/**/*.mjs`, incluindo reducer e contratos compartilhados. O `package.json` atual declara scripts Node customizados e não declara Vite, TypeScript, Cesium ou Cloudflare. Nesta revisão não encontrei `vite.config.*`, `tsconfig`, configuração Wrangler ou lockfile. O build local existente (`scripts/build-ui-preview.mjs`) copia a prévia visual estática e escreve sua configuração de build; ele não cria bundle do app principal. Node local é `v25.9.0` e npm `11.12.1`; a evidência do documento já marca Node 25 como EOL e exige runtime LTS isolado para scaffold/CI.
- **Fit:** Vite `vanilla-ts` e o plugin Cloudflare podem tecnicamente formar a próxima aplicação: o guia Vite lista `vanilla-ts`; o plugin oficial Cloudflare integra o runtime Workers e aceita sites estáticos/SPAs com ou sem API. Isso não demonstra que instalar esse seed sobre o app atual seja migração sem impacto, nem define se os módulos `.mjs` serão migrados gradualmente, consumidos como JS ou separados num novo ponto de entrada.
- **Ação antes do scaffold do app principal:** registrar se o seed é a migração do app existente ou um novo ponto de entrada; se for migração, decidir compatibilidade/migração progressiva do JS e como os módulos do store/contratos existentes serão importados pelo `GlobeRenderer`. Manter uma única instância do store do AD-10. Depois fixar versões e lockfile no projeto, sem atualizar o runtime global do usuário.
- **Triage:** mantém bloqueio apenas para a decisão de scaffold/hospedagem; não invalida a seleção de CesiumJS nem impede um spike isolado que consuma fixtures. Q2/Q9 cobrem a infraestrutura e carregamento, mas ainda não nomeiam este limite de migração brownfield.

## Confirmação das decisões tecnológicas

| Decisão ou alegação | Evidência primária atual e resultado | Limite |
| --- | --- | --- |
| CesiumJS 1.146 como baseline do renderer | A [release oficial 1.146](https://github.com/CesiumGS/cesium/releases/tag/1.146) está datada de 01/10/2026 e marcada `Latest`; o repositório publica o código sob [Apache 2.0](https://github.com/CesiumGS/cesium/blob/main/LICENSE.md). A página oficial [Quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/) também apresenta caminhos para CDN 1.146 e npm. A [prévia local](../../ux-designs/ux-LLMs-2026-10-09/mockups/prototype-cesium.html) usa URLs fixadas em 1.146. | Release e distribuição foram confirmadas; a biblioteca não foi instalada, buildada ou testada no app principal nesta revisão. Fixar a dependência e verificar lockfile continua parte do scaffold. |
| Fit de CesiumJS ao Globo principal e às Vistas 2D/3D | A documentação oficial [CesiumJS Fundamentals](https://cesium.com/learn/cesiumjs-fundamentals/) descreve globos 3D e mapas 2D em browser via WebGL, entidades para pontos/rótulos/formas, e lista Vite entre as ferramentas compatíveis. A biblioteca oferece câmera, terreno, imagery e 3D Tiles; portanto encaixa no papel de renderer atrás de `GlobeRenderer`. | Isso comprova capacidade da biblioteca, não fluidez no envelope real (~200 Empresas), acessibilidade do overlay, controles móveis, custo do bundle ou acabamento das quatro Vistas. O spike/benchmark e os gates UX continuam necessários. |
| CDN ou npm com assets/workers | O [Quickstart oficial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/) documenta ambas as formas. Para npm, exige definir `CESIUM_BASE_URL` antes do import e servir `Workers`, `ThirdParty`, `Assets` e `Widgets`. Logo Q9 é uma decisão real de integração, e a regra da arquitetura para servir assets/workers está correta. | A estratégia escolhida precisa confirmar paths, CSP, cache, tamanho, segurança da carga e modo de build no app. A página de referência é suficiente para o requisito; o exemplo antigo de [Webpack](https://cesium.com/learn/cesiumjs-learn/cesiumjs-webpack/) está marcado como arquivado e não deve ser tratado como config atual de Vite. |
| Vite `vanilla-ts` brownfield | O [guia oficial Vite](https://vite.dev/guide/) lista o template `vanilla-ts` e indica o mínimo de Node atual. A integração oficial [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/local-development/vite-plugin/) dá suporte ao runtime Workers durante desenvolvimento/build e a assets frontend, SPA e API integrada. | Existência/compatibilidade não resolve a adoção frente à base atual `.mjs`, que não tem Vite nem TypeScript. Nenhum scaffold, conversão ou build foi executado. Ver M1. |
| Worker antes de assets e validação Cloudflare Access | A documentação [Static Assets](https://developers.cloudflare.com/workers/static-assets/) confirma `assets.run_worker_first` para encaminhar assets ao Worker. A orientação [Validate JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/) exige validação da assinatura, issuer e audience também no Worker. AD-9 exigir auth por asset/API e o seed mencionar middleware é coerente. | A documentação não comprova configuração implantada. `run_worker_first` sozinho não autentica; a verificação de identidade e allowlist do dono ainda precisam existir e ser testadas no ambiente escolhido. |
| Cloudflare D1 e R2 do seed | Os docs oficiais confirmam D1 por binding com `prepare`/`batch` e R2 por binding. O [guia D1](https://developers.cloudflare.com/d1/worker-api/d1-database/) define batch como transação sequencial que reverte se uma statement falha; o [Workers API de R2](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) documenta binding ao Worker. | A existência dos produtos não demonstra CAS/lease/publicação/idempotência atômicos na composição concreta nem privacidade de qualquer rota. A revisão de 10/10 já marcou essas provas como altas/Q2; o gate e `technology-evidence.md` atuais mantêm a limitação. |
| Cesium não implica provider de tiles | O [guia Google para renderers 3D](https://developers.google.com/maps/documentation/tile/use-renderer) confirma que CesiumJS pode renderizar Google Photorealistic 3D Tiles; as [políticas Map Tiles](https://developers.google.com/maps/documentation/tile/policies) exigem atribuição e restringem prefetch, cache, armazenamento e uso offline. A arquitetura corretamente separa renderer de provider e deixa Q6 exigir origem/licença, crédito, custo/quota, cache/Referer e fallback. | Compatibilidade técnica não é aprovação de Google, Cesium ion, OSM, terreno, edifícios ou qualquer provider. Nenhum foi selecionado como parte de AD-17. |

## Conclusão e verificação

CesiumJS está tecnologicamente comprovado para o papel escolhido e 1.146 está atual na data da revisão. O protótipo local confirma o carregamento da versão por CDN, mas não prova a integração com o store do app; AD-17 já define corretamente a projeção read-only e as intents ao store. O provider continua um gate independente em Q6, e o mecanismo CDN/npm permanece em Q9.

O único achado novo é M1, que precisa ser resolvido antes do scaffold Vite/TypeScript/Cloudflare do app principal. Permanecem aplicáveis os limites altos de D1/CAS e do envelope operacional documentados na revisão anterior de tecnologia (`reviews/review-technology.md`), sem nova prova de implantação nesta retomada.

Executados: leitura do estado local e das fontes; pesquisa web em documentação/release oficiais; confronto do protótipo Cesium e da base atual. Não executados: instalação, build, testes, chamadas a providers, configuração de conta, deploy, benchmark de browser ou validação de crédito visual. Esses passos não foram necessários para esta lente documental.
