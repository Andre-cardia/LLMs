# Epic 4 Context: Explorar Empresas no Globo Cesium

<!-- Compilado dos artefatos de planejamento. Edite livremente. Regenere com compile-epic-context se o planejamento mudar. -->

## Goal

Permitir que Andre explore Empresas, Lançamentos e Relações no Globo principal sempre 3D, alternando MAPA/SAT e consultando o Terminal sem perder câmera, filtros ou seleção. Terreno, edifícios compatíveis e detalhe progressivo enriquecem a exploração. A prioridade atual é preparar contratos e estado compartilhado localmente, não integrar Cesium ou autorizar produção.

## Stories

- Story 4.1: Manter estado, bases e preferências no store compartilhado
- Story 4.2: Integrar o renderer Cesium ao Globo principal
- Story 4.3: Compor terreno, edifícios e detalhe automático de MAPA/SAT
- Story 4.4: Mostrar e selecionar Empresas e Lançamentos no Globo
- Story 4.5: Explorar Relações e prévias fantasmas sem publicar propostas
- Story 4.6: Operar Prévia, Terminal e som por teclado e toque
- Story 4.7: Aplicar famílias visuais, navegação e acesso completo no celular

## Requirements & Constraints

- **Prioridade:** executar 4.1 com fixtures sintéticas e base inicial injetada por configuração. Fundamentos, SPECs e verificações históricos não comprovam conclusão dos critérios atuais. Fixtures não escolhem a base de produção.
- **Geografia:** MAPA escuro com detalhe OSM progressivo; SAT amplo com fotorealismo automático próximo onde coberto. Afastamento, falta de cobertura ou falha fotorealística retorna à imagem SAT. Terreno acompanha ambas; edifícios não duplicam fotorealismo. Falha MAPA não troca silenciosamente para SAT. Camadas opcionais não bloqueiam exploração; exigir créditos ativos e cache permitido, sem pré-download/offline.
- **Entidades:** filtros incluem Camada principal ou Etiqueta; contagens usam a principal. Laboratórios têm losango/rótulo prioritário, mantendo a cor da Camada principal. Espalhamento é apenas visual. Pulso usa o último Lançamento canônico dentro de sete dias, nunca a ingestão tardia. Relações dirigidas exigem ambos os extremos visíveis; fantasmas não publicam propostas nem inferem vínculos por proximidade.
- **Qualidade e segurança:** evitar tela em branco; metas futuras de aproximadamente 3 s para primeira tela útil, 60 fps em notebook e pelo menos 30 fps em celular com cerca de 200 Empresas e camadas disponíveis. Exigir teclado/toque, foco, redução de movimento e WCAG AA. Dados privados exigem acesso do dono; URL não contém segredos/conversas. Não ativar infraestrutura, serviços pagos ou publicação; coordenadas demonstrativas não são locais corporativos aprovados. Não adicionar controles/rastreamento de voos.

## Technical Decisions

- Preservar JavaScript ESM/UI vanilla e domínio independente de DOM/Cesium/provedores. Um proprietário publica schemas, validadores e fixtures válidas/inválidas compartilhados antes dos consumidores; nenhuma migração implícita ou contrato paralelo.
- Só o reducer escreve estado semântico por intents tipados. Separar `preferences`, `sessionOverrides` e `effectiveState`: URL altera apenas sessão; ação manual persiste somente o campo editado. Família e modo são independentes. Trocar base preserva câmera, Pontos, Relações, filtros, Empresa e Terminal.
- Estado canônico: projeção 3D fixa e `base: MAPA|SAT`. URL serializa `base`, que prevalece sobre `view`; `view=MAPA|SAT` é alias, `view=3D` não escolhe base e `view=2D` usa a configuração inicial, nunca mapa plano. Valores desconhecidos da URL usam opção válida; intents/IDs/payloads incompatíveis retornam erro explícito sem perder contexto nem executar JS, URL ou patch arbitrário.
- Avançar snapshot reconcilia seleção/remapeamentos/janelas numa transição. Seguir substituição canônica explícita; remoção sem substituição limpa seleção/Terminal com aviso. Tokens de intenção/revisão descartam callbacks vencidos de câmera/digitação.
- CesiumJS 1.146 é a baseline planejada atrás de `GlobeRenderer`. Recebe projeção elegível/visível única e devolve intents, sem recalcular filtros ou possuir curadoria/preferências. `GlobeSceneComposer` possui coleções; provedores entregam recurso/status/créditos. Fotorealismo deriva de SAT/câmera/cobertura/disponibilidade, nunca terceira base persistida. Preservar Viewer/câmera e descartar cargas de geração vencida.

## UX & Interaction Patterns

- Artificial Analysis Light é o padrão, com escuro opcional e seis alternativas. Trocar família não força claro nem perde contexto. OSIRIS/âmbar mantêm painéis escuros; fundo do palco não altera MAPA/SAT.
- Hover estável de cerca de 300 ms abre Prévia; clique/toque abre Terminal, sem hover no toque. Arrastar nunca fecha; controles mantêm Terminal. MODELOS/NOTÍCIAS fecham-no. Leitor lateral/Fila/MERCADOS são exclusivos.
- `Esc` atua na janela superior, completa digitação antes de fechar e restaura foco. Artificial Analysis apresenta conteúdo imediatamente; retrô limita digitação a cerca de 2 s. Reduzir movimento remove animações. Som começa desligado, exige gesto e mantém canais/volumes independentes. Celular conserva todas as funções; pinça controla Globo e teclado mantém zoom da página.

## Cross-Story Dependencies

- Ordem atual: **4.1 → incremento local de 7.1**, sem declarar 7.1 integralmente concluída. Sequência Cesium posterior: **4.2 → 4.3 → 4.4 → 4.5 → 4.6 → 4.7**, respeitando gates.
- Consumir snapshots do Epic 1, Cadastro/Relações/logos/prévias do Epic 2 e Lançamentos canônicos do Epic 3. Fixtures permitem Terminal antes dos provedores de Notícias/mercados. BACKBONES permanece no Epic 8; detalhe geográfico pertence a 4.3.
- Q11 tem semântica decidida, mas contratos/fixtures executáveis são obrigação atual. Permanecem abertos Q3 (UX/acessibilidade), Q6 (base inicial/provedores/composição/licenças/custos/limiares), Q8 (significado/evidência/precisão geográfica) e Q9 (distribuição Cesium/assets/workers/CSP/WebGL/desempenho). Não impedem a fatia local autorizada nem são encerrados por ela. Integração, desempenho e produção exigem evidências próprias.
