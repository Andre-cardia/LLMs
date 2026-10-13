---
reviewer: architecture_tech_reality_check
lens: ".agents/skills/bmad-architecture/customize.toml — finalize reviewer 1"
date: 2026-10-12
verdict: pass
critical: 0
high: 0
medium: 0
---

# Revisão tecnológica — Cesium e PRD atual

**Veredito: PASS documental, condicionado aos gates Q6/Q9 já registrados.** A arquitetura distingue a escolha do engine CesiumJS da aprovação de provedores e explicita que a composição entre imagery, terreno e fotorealismo ainda precisa de prova. Não encontrei tecnologia nomeada obsoleta nem erro factual que exija revisão do spine.

## Escopo e método

Revisei o ARCHITECTURE-SPINE.md, confrontando tecnologias nomeadas com releases e documentação oficiais atuais. Inspecionei também o package.json e os módulos de exploração existentes para separar capacidade declarada de integração já presente. A única escrita desta revisão é este relatório; não instalei dependências, executei testes, chamei serviços de mapas nem usei credenciais.

## Verificações

| Item no spine | Evidência atual | Parecer e limite |
| --- | --- | --- |
| **CesiumJS 1.146** | A [release oficial 1.146](https://github.com/CesiumGS/cesium/releases/tag/1.146), publicada em 01/10/2026, aparece como a release mais recente na consulta de 12/10. A release introduz o pacote @cesium/core, que separa utilitários antes publicados por @cesium/engine; o [resumo oficial da release](https://cesium.com/blog/2026/10/02/cesium-releases-in-october-2026/) descreve essa mudança. | A versão escolhida é atual e adequada como baseline para um spike do renderer. O repositório ainda não a instala: package.json não lista Cesium, Vite ou TypeScript e declara "type": "module"; o domínio/store permanece em .mjs. Portanto, a release está verificada, mas o encaixe do pacote no build do aplicativo ainda não. O Q9 mantém corretamente a decisão CDN ou npm/Vite, assets/workers, instância única, compatibilidade e benchmark em aberto. Se npm for escolhido, a nova divisão modular deve ser considerada no lockfile e nas dependências. |
| **Google Photorealistic 3D Tiles como candidato de fotorealismo** | A [documentação oficial do Google](https://developers.google.com/maps/documentation/tile/3d-tiles) descreve tiles de alta resolução em áreas povoadas, requer billing e API key, e exige renderer com atribuição. A receita oficial do Google/Cesium configura globe: false para a cena fotorealística; Cesium chama o conjunto de tiles de camada global em seu [quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-photorealistic-3d-tiles). | O requisito “em zoom próximo coberto” está corretamente limitado à cobertura real. “Global” descreve a camada/extent do tileset, mas não deve ser interpretado como detalhe fotorealístico uniforme: a documentação do Google caracteriza a cobertura de alta resolução como áreas povoadas. O Google permanece candidato, não provider aprovado. |
| **Imagery SAT, terreno e fotorealismo na mesma cena** | A configuração oficial Google acima oculta o Globe padrão, que é quem desenha o terreno e imagery globe. A API [Cesium ImageryLayer](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html) permite imagery sobre Globe ou sobre Cesium3DTileset; isso confirma uma capacidade de composição do engine, mas não demonstra que a fonte SAT escolhida, o mesh Google e o terreno desejado coexistam visualmente ou tenham cobertura/fallback compatíveis. | O spine não promete essa compatibilidade como prova concluída: Q6 manda validar a composição e diz para não presumir SAT ou terreno simultâneos com Google sem spike/provider aprovado. O fallback para imagery SAT em zoom-out, ausência de cobertura ou falha está explícito. Manter Q6 aberto é correto até a prova incluir cobertura, troca sem flicker/duplicação e recuperação de terreno. |
| **Google API key, billing, atribuição e cache** | A [FAQ oficial de credenciais](https://developers.google.com/maps/faq?hl=en) lista Map Tiles API com chave restrita por IP e diz que restrições são recomendadas; as [políticas Map Tiles](https://developers.google.com/maps/documentation/tile/policies) exigem atribuição/dados legíveis e respeitar Cache-Control, além de restringir prefetch/cache. | Q6 registra a restrição por IP como orientação, exige provar um caminho de requisição compatível ou selecionar alternativa e mantém credencial/licença/billing/quota/créditos/cache como gates. AD-17 exige créditos ativos visíveis/acessíveis. Essa redação não trata a chave como secreta no browser nem transforma Google em escolha aprovada. A topologia de chamadas e as atribuições próprias/terceiras ainda são parte da aprovação futura do provider. |
| **JavaScript vanilla, Vite, TypeScript e Cloudflare** | O estado observado do projeto confere com o seed: módulos ES .mjs e type: module, sem dependências de Cesium/Vite/TypeScript. A proposta Cloudflare continua marcada como hipótese no spine, condicionada a Q2. | Não há versões fixadas a revalidar para esses itens. Vite segue apenas alternativa; a arquitetura não presume migração a TypeScript nem implantação de Workers/D1/R2. Não há alegação de que essa composição de runtime/build já foi integrada. |
| **OSM e mapa escuro** | O spine cita tile.openstreetmap.org condicionalmente e exige HTTPS, Referer, crédito, respeito a cache e ausência de prefetch em massa, alinhado à [política oficial de tiles da OSMF](https://operations.osmfoundation.org/policies/tiles/). | O provedor público padrão não está aprovado e não foi apresentado como serviço com SLA. Q6 preserva escolha de tiles e compatibilidade de estilo escuro em aberto; nenhuma incompatibilidade tecnológica está escondida no spine. |

## Conclusão

CesiumJS 1.146 está atual na data desta revisão. O aplicativo ainda não o integrou, e o texto mantém essa distinção; Q9 cobre o trabalho técnico que falta. O comportamento de produto solicitado — base SAT em zoom amplo, fotorealismo automático somente em área coberta e retorno a SAT — é uma regra arquitetural válida, mas a sua realização com Google e terreno não está demonstrada pela documentação do engine ou do provider. Q6 exige a validação correta e mantém Google como candidato.

Este PASS cobre precisão documental e atualidade das tecnologias nomeadas. Não atesta build, compatibilidade em navegador, execução do renderer, cobertura contratual de provider, licença, preço ou qualidade visual.

## Fontes primárias

- [CesiumJS 1.146 release](https://github.com/CesiumGS/cesium/releases/tag/1.146)
- [Cesium Releases — outubro de 2026](https://cesium.com/blog/2026/10/02/cesium-releases-in-october-2026/)
- [CesiumJS Photorealistic 3D Tiles quickstart](https://cesium.com/learn/cesiumjs-learn/cesiumjs-photorealistic-3d-tiles)
- [Cesium ImageryLayer API](https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayer.html)
- [Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)
- [Google Maps Platform FAQ — credenciais](https://developers.google.com/maps/faq?hl=en)
- [Google Map Tiles API policies](https://developers.google.com/maps/documentation/tile/policies)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
