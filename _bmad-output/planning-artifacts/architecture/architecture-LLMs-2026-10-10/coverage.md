# Cobertura e gates

Requisitos de origem permanecem completos no [PRD](../../prds/prd-LLMs-2026-10-07/prd.md) e [addendum](../../prds/prd-LLMs-2026-10-07/addendum.md). Esta tabela mapeia responsabilidade sem substituir critérios do PRD. `P` = pode ser decomposto respeitando contratos; `G` = gate específico antes da story afetada, conforme §11. Toda publicação continua exigindo autorização de Andre.

| FR | Capacidade | Proprietário | Regras | Estado |
| --- | --- | --- | --- | --- |
| FR-1 | Empresas no Globo | UI/renderers e Cadastro | AD-3, AD-10 | G: renderer/performance e UX específica |
| FR-2 | Filtros por Camada | UI/store | AD-3, AD-10 | P |
| FR-3 | Pulso de Lançamento | Domain/release e UI | AD-3, AD-10 | P |
| FR-4 | Logos no zoom | UI/renderer e assets privados | AD-9, AD-10 | G: limiar/renderer e curadoria |
| FR-5 | Prévia | UI/store | AD-10 | P |
| FR-6 | Terminal Fixado | UI/store | AD-10 | P |
| FR-7 | Digitação e transição logo | UI/motion | AD-10 | P; transição com curadoria |
| FR-8 | Som | UI/Web Audio | AD-10 | P |
| FR-9 | Tabela de modelos | Domain/modelos e UI | AD-2, AD-3, AD-11 | P |
| FR-10 | Ordenação/filtro | UI/store | AD-10, AD-11 | P |
| FR-11 | Custo por tarefa | Domain/preços | AD-3, AD-11 | P |
| FR-12 | Tempo até resposta | Adaptador/modelos e UI | AD-3, AD-11 | P |
| FR-13 | Correspondência entre Fontes | Domain/identidade e Fila | AD-3, AD-4 | P; infra de mutação Q2 |
| FR-14 | Coleta/dedup de Notícias | Application/news | AD-2, AD-6 | P em fixtures; combinação de fontes antes de integração |
| FR-15 | Relevância e feedback confirmado por Empresa | News Agent/validator e Application/feedback | AD-5, AD-8, AD-15 | G: provider/preço e teste de qualidade |
| FR-16 | Português/título/link | News Agent/validator | AD-5, AD-8 | G: provider e tamanho editorial |
| FR-17 | Isolamento News Agent | Application/tools/schema | AD-5, AD-9 | P |
| FR-18 | Faixa de cotações | Domain/instrumentos e UI | AD-7, AD-11 | G: matriz Q5 |
| FR-19 | Cadência/reserva/horário | Application/quotes | AD-6, AD-7, AD-11 | G: calendário/cobertura Q5 |
| FR-20 | Cadastro inicial | Curadoria/Fila | AD-3, AD-4, AD-5 | G: confirmar cada entrada; lotes ≤10 propostas novas/semana |
| FR-21 | Logos oficiais locais | Curadoria/assets | AD-9, AD-13 | G: proveniência e uso |
| FR-22 | Descoberta | Discovery Agent/Fila | AD-4, AD-5, AD-8 | G: provider/preço; sem publicação automática |
| FR-23 | Revisão/DESFAZER | Domain/curadoria | AD-2, AD-4, AD-6 | P em fixtures; infra Q2 |
| FR-24 | Atualização periódica | Application/scheduler | AD-6, AD-7, AD-14 | P em fixtures; cron real Q2 |
| FR-25 | Falha parcial/status | Domain/freshness e Publisher | AD-2, AD-6, AD-7 | P |
| FR-26 | Detectar Lançamento | Domain/release | AD-3, AD-6 | P |
| FR-27 | Seis temas | UI/tokens | AD-10 | P; contraste completo exige browser proof |
| FR-28 | Atribuição de Fontes | Adaptadores/projeção e UI | AD-3, AD-13 | P; licenças Q4/Q6 |
| FR-29 | Todas funções no celular | UI/store/renderers | AD-10 | G: controles móveis e browser proof |
| FR-30 | Dono apenas | Auth/HTTP/storage | AD-9, AD-14 | G: Q2; invariantes definidos |
| FR-31 | Relações dirigidas | Domain/curadoria e renderer | AD-2, AD-3, AD-4, AD-10 | P em fixtures; visual Q3 |
| FR-32 | Globo 3D, bases MAPA/SAT, transição fotorealística automática e teclado | UI/renderers/store | AD-10, AD-13, AD-17 | G: Q3/Q6/Q8/Q9/Q11 e benchmark |
| FR-33 | Fluxo/Labs | UI/projeção | AD-2, AD-10, AD-15 | P |
| FR-34 | Leitor | UI e News projection | AD-5, AD-8, AD-10, AD-15 | G: tamanho editorial; resumo depende provider |
| FR-35 | Agente especialista/Histórico | Application/chat e UI | AD-5, AD-8, AD-9, AD-12 | G: Q1/Q7; desligado por padrão |
| FR-36 | MERCADOS | Domain/instrumentos e UI | AD-7, AD-10, AD-11 | G: Q3/Q5; resumo depende chat |
| FR-37 | Busca global | UI/store e índices | AD-3, AD-10 | P |
| FR-38 | Estado na URL | UI/store e Auth | AD-9, AD-10 | P |
| FR-39 | BACKBONES | Geographic adapter/renderer | AD-13 | G: Q4 e prova de Fonte |
| FR-40 | OSM no zoom | Tile adapter/renderer | AD-10, AD-13 | G: Q3/Q6 |

## Requisitos transversais

| Requisito | Cobertura | Prova exigida |
| --- | --- | --- |
| Primeira tela útil ~3s, ~60fps notebook/~30fps celular, ~200 Empresas | AD-10, AD-13, contracts.md | Benchmark completo com relações/rótulos/BACKBONES, não só canvas vazio |
| Tolerância a falha sem branco | AD-2, AD-6, AD-7 | Fake-clock/source failures, perda de conexão e snapshot incompleto |
| Sem segredos no cliente/Agentes | AD-5, AD-9 | Testes de autorização e inspeção do bundle/objetos |
| Teclado/toque, foco, WCAG AA, reduzir movimento | AD-10 | Seis temas e superfícies sobre textura; viewport e leitor assistivo |
| Portabilidade do snapshot e contratos autenticados | AD-1, AD-2, AD-9, AD-12 | Suite de contratos por adaptador |
| Teto automático e degradação 80%/100% | AD-8 | Ledger concorrente, retries e fronteira de mês UTC |
| Fonte de reserva obrigatória | AD-11 | Cobertura individual e fallback de cada instrumento, sem reserva global presumida |
| Uso pessoal/licenças/sem scraping AA | AD-3, AD-13 | Fonte e direito de uso confirmados; AA só API |
| SM-1 hábito ≥4 dias/semana, persistindo após 3 meses | AD-14 | Observação do dono após uso real; nenhum teste local prova hábito |
| SM-2 ≥95% jobs/semana, SM-3 Pulso ≤2h após Fonte | AD-6, AD-7, AD-14 | Sete dias reais e timestamps de origem/detecção/publicação |
| Sem maximizar Notícias, Empresas ou Fila | AD-5, AD-6 | Limites de duas semanas, cinco por Empresa, catorze Fluxo, dez propostas de Empresas novas/semana e amostra humana |

## Preservação de UX

Andre declarou a UX concluída em 10/10. DESIGN/EXPERIENCE conservam seus status `draft` existentes; essa diferença de registro não bloqueia começar arquitetura. Os documentos e o memlog são referências de experiência preservadas. O PRD já concilia BACKBONES/OSM e lista questões específicas para as stories. Defaults obrigatórios: FLUXO, OSIRIS com modo do sistema, três famílias × claro/escuro, cinco Camadas na legenda horizontal, painéis escuros OSIRIS/âmbar, som desligado, BACKBONES desligado, Terminal versus drag, e ações da Fila/Leitor/MERCADOS/Agente sem fechar Terminal indevidamente.

Default de tabela HÍBRIDO e Leitor LATERAL; abertura pela aba NOTÍCIAS não substitui preferência salva. Bootstrap via descoberta de35 Empresas obrigatórias requer pelo menos quatro janelas semanais de quota; manter esse lead time explícito, sem inventar exceção. AD-16 bloqueia implementação paralela nas fronteiras até schemas/fixtures executáveis existirem.

Protótipo promovido e `.working` têm comportamentos diferentes; não copiar um sobre o outro. Chat, escrita e mercados simulados não são prova de integração.
