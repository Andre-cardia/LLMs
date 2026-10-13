# Epic 7 Context: Pesquisar, localizar e retomar contexto

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Permitir que Andre encontre Empresas, Modelos, tickers e Notícias, restaure sua exploração e, posteriormente, pesquise com fontes, navegação verificável e Histórico privado. **Este Build limita-se ao incremento local 7.1 com fixtures, após aceite humano da fatia local 4.1.** Não autoriza UI integrada, Cesium, produção, serviços externos, infraestrutura ou outras stories; aceite local não fecha gates.

## Stories

- Story 7.1: Buscar entidades e restaurar o contexto da URL
- Story 7.2: Pesquisar com fontes, navegação tipada e orçamento separado
- Story 7.3: Retomar e excluir o Histórico privado

## Requirements & Constraints

- Busca retorna entidades existentes com tipo e ID canônico. Sem resultados, conserva consulta e informa ausência; nunca fabrica Empresa, ativo ou associação. Notícias suprimidas não aparecem nem reabrem por resultado, URL ou ação antiga.
- Empresa direciona a GLOBO/Terminal; Modelo a MODELOS com destaque; ticker à Empresa ou ativo em MERCADOS; Notícia ao Leitor. Referência eliminada, oculta ou sem acesso fica indisponível; remapeamento exige substituição canônica explícita, nunca coincidência de nome.
- URL compartilha Camadas, base, aba e Empresa. Valores desconhecidos são saneados; restauração vale só na sessão, sem regravar preferências. URL não contém conversas, Histórico ou segredos nem concede acesso aos dados privados.
- Fixtures não são curadoria nem prova de autenticação, cobertura financeira ou localização real. Não ativar rede paga, deploy, cron, migrations, secrets ou providers. Todos os gates pendentes permanecem abertos.
- Na expansão futura, chat apenas lê/navega, sem propor, aprovar ou publicar. Conteúdo externo é não confiável; citações exigem fontes consultadas e dados mantêm data/revisão. Chat/busca paga têm orçamento separado, inicialmente zero; Histórico exige política de retenção, exclusão e backups.

## Technical Decisions

- Domínio, contratos e estado semântico têm proprietários únicos. Domain/Contracts define formatos versionados e fixtures válidas/inválidas antes dos consumidores; não criar schemas paralelos. IDs são opacos e estáveis, nunca substituídos por nomes ou símbolos externos.
- Um reducer processa intents tipados, separando preferências persistidas, overrides de sessão e estado efetivo. Busca/URL usam essa autoridade; adapters não escrevem patches semânticos. Avanço de snapshot reconcilia seleção/remapeamentos/janelas; callbacks vencidos não restauram destinos antigos.
- Projeção sempre 3D, base `MAPA|SAT`. Serializar `base`; aceitar `view=MAPA|SAT` como aliases, `view=3D` sem escolher base e `view=2D` como retorno à base inicial configurada, nunca mapa plano. `base` prevalece sobre `view`. Base inicial continua pendente em Q6; fixture não decide produto. Fotorealismo não é terceira base.
- Leitura mantém revisão consistente. Notícias/Busca combinam `(dataRevision, feedbackRevision)` e supressão owner-wide, inclusive aliases; revalidar destinos no contexto vigente.
- Chat futuro limita ferramentas a `focusCompany`, `openNews`, `openModels` e `highlightLabs`, validando IDs/filtros no servidor e cliente. Streaming versionado ordena eventos, rejeita duplicatas e identifica interrupção. Retomar Histórico não reexecuta ações ou chamadas pagas.

## UX & Interaction Patterns

- Busca identifica tipos e oferece teclado/toque. Abrir/fechar move/restaura foco; Esc atua na camada superior e completa digitação antes de fechar. Atalhos não interceptam texto; reduzir movimento remove animações, não funções.
- Artificial Analysis Light é o padrão; famílias compartilham domínio/navegação. Empresa/Leitor têm conteúdo imediato nessa família. A forma visual da Busca global continua indefinida; o incremento prova semântica local, não UI/browser.
- Console futuro abre por botão ou `/`, não fecha por clique fora e reduz tela cheia ao navegar. Falhas preservam painel e registros acessíveis, sem inventar resposta ou efeito.

## Cross-Story Dependencies

- 7.1 consome store/URL da 4.1 e entidades/projeções dos épicos 2–6, sem depender de chat/Histórico. Aceite humano local de 4.1 não autoriza integrar consumidores reais.
- 7.2 depende do orçamento comum e Q1/Q7/Q2; 7.3 consome seus registros privados e exige Q7/Q2. UI segue Q3/browser; mapas/localizações/renderer, Q6/Q8/Q9; finanças reais, Q5. Q11 tem semântica definida, não fecha Q6 nem autoriza Cesium.
- Planejamento não fixa matching/ranking/normalização/limite de busca ou desempate de tickers. Atualização sem nova entrada no histórico do navegador é premissa UX, não decisão final. Não apresentar escolhas locais como aprovação desses pontos.
