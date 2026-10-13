---
id: SPEC-llm-labs-globe
status: partial
created: 2026-10-10
updated: 2026-10-12
companions:
  - ../../planning-artifacts/prds/prd-LLMs-2026-10-07/prd.md
  - ../../planning-artifacts/prds/prd-LLMs-2026-10-07/addendum.md
  - ../../planning-artifacts/ux-designs/ux-LLMs-2026-10-09/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-LLMs-2026-10-09/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/contracts.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/coverage.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/implementation-readiness.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/cesium-integration.md
  - ../../planning-artifacts/architecture/architecture-LLMs-2026-10-10/technology-evidence.md
sources: []
---

# Monitor Global de Labs de LLM

## Why

Andre quer consultar várias vezes ao dia um painel pessoal que reúna Laboratórios de LLM, Modelos, Lançamentos, Notícias em português e infraestrutura/mercados de IA. A experiência usa Globo e Terminal como centro de comando e ajuda a perceber mudanças em menos de um minuto e escolher Modelos com dados comparáveis.

## Capabilities

- **CAP-1**
  - **intent:** explorar Empresas, Camadas, Laboratórios e Relações por Globo/Vistas e Terminal.
  - **success:** o Globo permanece em projeção 3D e alterna entre as bases MAPA e SAT; SAT troca automaticamente para fotorealismo 3D em zoom próximo coberto e volta à imagem de satélite ao afastar, sair da cobertura ou falhar a camada; terreno e edifícios aparecem quando compatíveis, sem duplicar geometria fotorealística. Pontos, seleção, cores, filtros e Relações permanecem coerentes; busca, câmera, Pulso de até sete dias e Terminal preservam o fluxo existente. Controles por teclado/toque e tema padrão Artificial Analysis (claro/escuro) mais seis temas alternativos seguem FR-1 a FR-8, FR-27 a FR-29 e FR-31/32.
- **CAP-2**
  - **intent:** comparar Modelos por capacidade, custo, inteligência e desempenho.
  - **success:** família canônica única, variantes explícitas e correspondência incerta revisada; ausência distinta de zero; fórmula 2.000 entrada + 1.000 saída, filtros/ordenação/crédito e detalhes conforme FR-9 a FR-13.
- **CAP-3**
  - **intent:** ler as Notícias relevantes do setor em português e acessar o original.
  - **success:** dedup e limites de cinco por Empresa/duas semanas/catorze no Fluxo; casos de homônimos e ≥90% de relevância em cinquenta itens; Leitor/Fluxo/Labs usam o mesmo conjunto, feedback humano confirmado persiste ocultação comum e orienta relevância por Empresa separada de mera citação, com fallback de resumo conforme FR-14 a FR-17 e FR-33/34.
- **CAP-4**
  - **intent:** consultar ações/índices e contexto de mercado na Faixa e MERCADOS.
  - **success:** cobertura/símbolo/moeda/unidade/calendário/reserva verificáveis por instrumento; quinze minutos em pregão e pós-fechamento; favoritos, datas, busca e navegação conforme FR-18/19 e FR-36, com ausência explícita.
- **CAP-5**
  - **intent:** curar Cadastro, Relações, logos e aliases com revisão humana.
  - **success:** Cadastro inicial obrigatório confirmado; Agentes só propõem até dez propostas de Empresas novas/semana; publicação na Atualização seguinte, DESFAZER auditável e rejeição reapresentada apenas com fato novo conforme FR-20 a FR-23, FR-13 e FR-31.
- **CAP-6**
  - **intent:** manter dados atuais com falha parcial compreensível e últimos valores válidos.
  - **success:** Modelos/Notícias a cada hora salvo degradação de orçamento; coleções full vazias ou <50% rejeitadas, snapshots consistentes, Fonte isolada, horário/status e Lançamento detectado conforme FR-24 a FR-26 e FR-19/25.
- **CAP-7**
  - **intent:** pesquisar com Agente especialista, retomar Histórico e navegar por busca e endereço salvo.
  - **success:** fontes/datas/citações reais, ações válidas visíveis, leitura preservada em erro/budget, Histórico só do dono com política de retenção/exclusão; URL restaura contexto sem segredos nem sobrescrever preferências conforme FR-30, FR-35 e FR-37/38.
- **CAP-8**
  - **intent:** explorar cabos/estações e detalhe de cidades/ruas junto às Empresas.
  - **success:** BACKBONES é independente e inicialmente desligado; vínculos são confirmados e fonte/licença/atribuição/cache são verificáveis. MAPA tem fundo cartográfico escuro e revela detalhes OSM de cidades, rodovias e ruas conforme o zoom; se falhar, mantém Globo/Pontos utilizáveis, informa indisponibilidade e não troca de base; FR-28 e FR-39/40.
## Constraints

- Os companions são o contrato completo; preservar os quarenta FR e IDs AD. PRD final e decisões aprovadas no spine/handoff governam comportamento e composição do Globo; DESIGN/EXPERIENCE continuam referências de interação onde não conflitarem. Prescrições antigas de quatro Vistas ou projeção plana ficam supersedidas; nenhum corte de FR-31 a FR-40 sem decisão de Andre.
- Interface vanilla/WebGL; todos os recursos no celular; teclado/toque, foco, reduzir movimento, contraste AA no padrão e nos seis temas alternativos. Metas: primeira tela útil ~3s, ~60fps notebook/~30fps celular com ~200 Empresas e overlays completos.
- Uso pessoal e acesso do dono em assets, dados, Histórico e comandos; chaves só servidor; conteúdo externo não confiável; Agentes não publicam curadoria. APIs/snapshots/mutações independentes do fornecedor.
- Priorizar Fontes e infra gratuitas/quase; teto de automação perto de US$5/mês, degradação 80%/100%. Não inferir verba para chat/busca/mapas. Sem scraping AA, sem dependência de serviço externo de logos e sem licença geográfica presumida.
- Nenhuma publicação, deploy, contratação ou serviço pago autorizado nesta delegação. Protótipo e dados simulados não comprovam runtime ou integrações.
- CesiumJS integra o Globo principal sob estado e contratos compartilhados; projeção é sempre 3D e a escolha do usuário é MAPA ou SAT. MAPA escuro tem detalhe OSM progressivo; SAT troca automaticamente para fotorealismo 3D próximo quando houver cobertura e retorna a satélite em zoom amplo, fora de cobertura ou em falha. Terreno acompanha as bases; edifícios só aparecem quando compatíveis e não duplicam o fotorealismo. Busca, filtros, câmera, seleção e Terminal permanecem compartilhados. Localizações demonstrativas não viram dados do produto.

## Non-goals

- Terminal financeiro, trading/carteira/alertas, preço em tempo real ou Nasdaq inteira.
- Benchmark próprio, agregador genérico de Notícias, contas de terceiros ou recursos sociais.
- Fibra terrestre, incidentologia/capacidade e precisão de rota física de cabo; tradução integral de matérias.
- Perfil de Tarefa personalizável, Ponto por market cap e sexta Camada IA física na v1; projeção plana 2D; voos ou controles de voo por Empresa/região do protótipo; abertura pública sem revisão de licenças.

## Success signal

- SM-1: Andre usa o painel ≥4 dias por semana no primeiro mês e continua após três meses.
- SM-2: ≥95% das Atualizações em sete dias reais têm sucesso. SM-3: Lançamento elegível aparece com Pulso ≤2h após surgir em Fonte; coletar timestamps de origem/detecção/publicação.
- Não maximizar volume de Notícias, Empresas ou Fila: respeitar contramétricas do PRD §10.

## Assumptions

- A aplicação existente usa JavaScript ES modules; preservar essa base sem presumir conversão TypeScript. Vite vanilla JS é candidato; infraestrutura Cloudflare depende de Q2 e distribuição Cesium CDN/NPM depende de Q9.
- Regras inferidas de atualidade, compensação após publicação e chat somente leitura estão explícitas na spine; rever com Andre antes das stories afetadas.

## Open Questions

- Q1/Q7: orçamento/provider de chat/busca/LLMs, limite, tamanho editorial e retenção/exclusão de Histórico.
- Q2: fornecedor/IdP/custo de infraestrutura, quotas e provas de transação/auth/recuperação.
- Q3: controles móveis, acessibilidade, foco, contraste/legibilidade e acabamento visual para a projeção 3D e bases MAPA/SAT.
- Q4/Q6: direitos e proveniência de BACKBONES; base inicial e providers compatíveis de cartografia, satélite, terreno, prédios e fotorealismo; cobertura, composição, licença, credenciais, custo/quota, créditos, cache, fallback e limiares/histerese do zoom.
- Q5: cobertura/símbolos/unidades/calendários/Fontes de reserva e histórico por instrumento de MERCADOS.
- Q8: semântica, evidência, precisão e schema comum para localizações; classe para ponto/região/omissão, seleção e limite de câmera antes de exibir dados reais.
- Q9: CDN ou NPM/Vite, assets/workers, CSP/cache, browsers/dispositivos, WebGL, tamanho/desempenho e fallback; sem presumir migração a TypeScript.
- Q11: implementar e validar no store, URL e fixtures a base MAPA/SAT e compatibilidade com parâmetros legados `view`.

O spine está documentalmente final; este contrato permanece parcial para implementação. Q1–Q9 e Q11 bloqueiam somente as partes correspondentes, com donos e predecessores em `implementation-readiness.md`.
