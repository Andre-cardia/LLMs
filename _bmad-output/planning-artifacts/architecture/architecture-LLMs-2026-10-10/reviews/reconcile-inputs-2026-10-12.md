# Reconciliação de entradas — 12/10/2026

Escopo: retomar o spine existente e registrar a integração escolhida de CesiumJS ao Globo principal. Revisores independentes compararam o spine/handoff aos requisitos do PRD, à UX vigente e ao código local. O protótipo Cesium e sua rota independente não foram tratados como implementação ou especificação de produto.

## PRD e addendum — reconciliado

- **Imagery-base do FR-1:** oceano/continentes/relevo e textura por tema/Vista exigem uma base explícita; terreno, edifícios e fotorealismo seguem opcionais. Q6 agora pede imagery-base, variantes e fallback satélite antes de habilitar o renderer.
- **Créditos e tiles OSM:** Q6 e o handoff preservam créditos visíveis/acessíveis em tema e mobile, HTTPS, Referer válido, respeito aos cache headers e vedação a prefetch em massa se `tile.openstreetmap.org` for escolhido.
- **Escopo do mock:** Q10 foi repetido no handoff; as funções demonstradas no protótipo não entram automaticamente na fatia.
- **Compatibilidade:** `globe.gl / three.js` no addendum é exemplo; CesiumJS atrás de `GlobeRenderer` não contradiz esse requisito. Localizações reais continuam sujeitas a proveniência/precisão; pontos demonstrativos não viram dados aprovados.

## UX — reconciliado

- **Vistas:** EXPERIENCE já fixa semântica para 3D, 2D, MAPA e SAT, inclusive exceção da Sala de Controle noturna. O handoff agora registra essa composição; Q3 não reabre as quatro definições e trata viabilidade/renderização, providers, controles e acessibilidade como trabalho pendente. Q6 decide a fonte imagery para compor as Vistas.
- **Interações:** o handoff preserva hover (~300 ms) para Prévia, clique/toque para Terminal Fixado e os fluxos/tempos de voo/leitura da UX. Gestos passam por intents do store; o cartão de detalhe próprio do protótipo não é promovido a UI aprovada.
- **Acessibilidade:** controles mobile, teclado, toque/pinça, foco e retorno, leitor de tela, redução de movimento, contraste sobre textura e navegação com muitos Pontos permanecem critérios de aceite. A implementação do canvas/layout no mock não prova paridade.

## Código local — reconciliado

- **Estado de implementação:** existe reducer semântico com vistas `3D`, `2D`, `MAPA`, `SAT`; hoje `availableViews` começa somente com `3D`. Não existe `GlobeRenderer` e Cesium não participa do fluxo. O handoff foi ajustado para falar da autoridade arquitetural futura do reducer, sem sugerir integração já executada.
- **Contrato geográfico:** a estrutura atual `Company.location` não consegue expressar ausência/aproximação, precisão e evidência específica da localização. Q8 segue obrigatório antes de dados reais; `contracts.md` exige esses conceitos e um schema comum em `src/contracts/` conforme AD-16 antes de stories consumidoras. Coordenadas demonstrativas continuam fixtures.
- **Providers e ciclo de vida:** o protótipo local carrega imagery, terreno e prédios em configuração de demonstração; isso não aprova providers para produção. A decisão arquitetural mantém gates por provider e exige descarte de listeners/subscriptions, cancelamento de carga pendente e benchmark. Nenhuma medição de performance foi executada.

## Resultado

Os requisitos load-bearing examinados estão cobertos pelo spine, contratos e handoff, sem conflito material com PRD/UX/código. Achados foram aplicados em `ARCHITECTURE-SPINE.md`, `contracts.md`, `implementation-readiness.md` e `cesium-integration.md`. Permanecem Q3, Q6, Q8 e Q9 como gates delimitados para as stories afetadas; Q10 foi resolvido por Andre em 12/10 e não impede finalizar o contrato de arquitetura. Esta reconciliação é documental e não afirma teste de integração, acesso a providers, desempenho ou publicação.

## Escopo de capacidade decidido pelo dono — 12/10/2026

Andre decidiu manter as funções existentes do Globo e integrar suporte Cesium a 2D/3D, terreno, prédios e fotorealismo; não acrescentar controles de voo por Empresa/região demonstrados pelo protótipo. Busca/filtros seguem no store/seletor original, sem catálogo local de 35 pontos ou predicados duplicados. Os fluxos de câmera que já pertencem à UX do produto são preservados. A capacidade está decidida, mas provider específico, credencial, licença, cota, atribuição e ativação dependem de Q6; Q3/Q8/Q9 continuam gates independentes.

## Condição tecnológica de fotorealismo — 12/10/2026

A orientação oficial recomenda restringir por IP as chaves da Map Tiles API; o projeto adota isso como gate e explica que um renderer 3D faz requisições adicionais ao explorar a cena. A capacidade de fotorealismo está escolhida, mas Q6 precisa demonstrar caminho de credenciais compatível com o uso em browser e os termos do provider; sem isso, seleciona-se uma fonte alternativa. Nenhuma chave ou conta foi inspecionada.
