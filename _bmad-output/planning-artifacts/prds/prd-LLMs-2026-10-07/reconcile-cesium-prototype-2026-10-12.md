# Reconciliação do protótipo Cesium — 2026-10-12

## Fontes

- `ux-designs/ux-LLMs-2026-10-09/mockups/prototype-cesium.html` e `mockups/assets/cesium-preview.js`
- `ux-designs/ux-LLMs-2026-10-09/imports/cesium-evaluation-2026-10-12.md`
- `ux-designs/ux-LLMs-2026-10-09/imports/cesium-token-deploy-2026-10-12.md` e `cesium-production-api-checks-2026-10-12.json`
- PRD §FR-32 e Addendum §§D, F e G

## Lacunas e limites da evidência

1. **Integração no Globo principal ainda não demonstrada.** O HTML se identifica como teste experimental, abre em rota separada e oferece 2D; a decisão atual é manter sempre o Globo 3D e integrar Cesium no Globo principal. A avaliação registra que não portou todos os estados e camadas do renderer atual.
2. **O seletor de bases e a transição aprovada não estão no protótipo.** Há uma imagem Cesium, alternância geral claro/escuro e botão manual “Fotorealismo Google”. O requisito atual oferece MAPA escura e SAT: em SAT, a imagem permanece de base e o fotorealismo aparece automaticamente em zoom próximo quando disponível, retornando à imagem SAT ao afastar, sair da cobertura ou falhar. O Addendum §F continua sendo contexto para detalhe cartográfico e seus limites; este relatório não o trata como desatualizado.
3. **Terreno, prédios e fotorealismo foram observados em cenários de demonstração.** A avaliação relata 3/3 inicializações das bases e tiles fotorealísticos renderizados em San Francisco, com um ponto de fixture. Isso não confirma cobertura para outros locais, precisão de instalações, a transição automática aprovada ou desempenho em uso real.
4. **Fixtures e acesso à API não comprovam operação de produção.** A cena usa 35 pontos demonstrativos; coordenadas não foram validadas como campi. O escopo não inclui voos de aeronaves nem controles adicionais de voo por empresa ou região; as ações existentes de foco e câmera permanecem. Os checks posteriores de token confirmam respostas da API Cesium para origens permitidas, mas o relatório registra `deployed: false`; permanecem validação hospedada, licença aplicável, cotas e custo de uso.
