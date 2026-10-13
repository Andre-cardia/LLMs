# Reconciliação de inputs — PRD Monitor Global de Labs de LLM

Data: 2026-10-08 · Escopo: `forged-idea.md` + `.memlog.md` (Forge) + pedido original do usuário + pedidos posteriores + `.memlog.md` do PRD, comparados com `prd.md` e `addendum.md`.

Mudanças registradas no memlog **não** são tratadas como lacuna: cor = camada / pulso = lançamento; áudio desligado por padrão; prévia curta no hover e conteúdo completo no clique; Nasdaq inteira rejeitada; só faixa de cotações + cotação no terminal; custo por tarefa estimado (opção A); Fila de revisão e Agente de descoberta no MVP; responsividade completa.

## Cobertura confirmada (sem ação)

Globo 3D com pontos por empresa · cores por camada (5, dark/light) · pulso de 7 dias · logos no zoom + monograma · terminal retrô com digitação caractere a caractere, ≤ ~2 s, notícias linha a linha, transição ASCII → logo · som Web Audio sintetizado, desligado por padrão, preferência salva · reduced-motion · tabela com inteligência, preço/M tokens, cache, contexto, latência rotulada, modalidades in/out, características, custo estimado por tarefa (ⓘ, "≈") · atribuição AA · notícias traduzidas com título original + link, filtro de homônimos, agente isolado · faixa de cotações (4 índices, verde/vermelho, ~15 min, aviso de atraso, reserva Finnhub, "Privada") · lista obrigatória (Google, Apple, SpaceX, Microsoft, IBM, Tesla, TSMC, Amazon, Broadcom, Oracle + chips/nuvem/energia) · labs privados (OpenAI, Anthropic) · logos locais oficiais + rodapé de marcas · dark/light com preferência do SO · referência artificialanalysis.ai · uso pessoal, nuvem gratuita portátil, GitHub Actions, sem scraping · teto ~US$5/mês · 5 notícias / 2 semanas · tarefa padrão 2.000+1.000 · atualização horária.

## Lacunas e contradições

### G1 — Contradição: `Esc` e clique (pular animação × fechar o Terminal)
- **Input:** memlog Forge (lock, linha 35): "clique/Esc **pula** animação"; `forged-idea.md`: "clique/Esc pula".
- **PRD:** FR-7 diz que "clicar ou apertar uma tecla" mostra tudo (pula); FR-6 diz que o Terminal **fecha** com `Esc` e com "clique fora". Uma mesma tecla (`Esc`) tem dois efeitos, e o PRD não diz qual vale durante a digitação.
- **Onde resolver:** FR-6 e FR-7. Sugestão: durante a digitação, `Esc`/clique **dentro** do Terminal pulam a animação; com o texto completo, `Esc` fecha; clique **fora** sempre fecha. Ajustar também §5 (Acessibilidade).

### G2 — Lacuna qualitativa: aparência do Globo ("globo 3D colorido representando o planeta Terra")
- **Input:** pedido original: "globo 3d **colorido** representando o planeta terra"; "pequeno ponto".
- **PRD:** o Glossário define Globo só como "visualização 3D interativa da Terra"; §7 (Estética e tom) não descreve o Globo e fala em "gráficos sóbrios", o que pode levar UX/arquitetura a um globo abstrato e monocromático (pontilhado/wireframe), contrário ao pedido. O tamanho "pequeno" do Ponto também não aparece (só "tamanho reservado" para v2).
- **Onde resolver:** §7 (adicionar item "Globo": Terra reconhecível e colorida — continentes/oceanos, com variante para dark/light — e Pontos pequenos que não escondem o mapa) e consequência em FR-1/FR-27 (as cinco cores de Camada contrastam com a textura colorida da Terra, não só com o fundo).

### G3 — Lacuna: benchmarks do Artificial Analysis sumiram da Tabela
- **Input:** `forged-idea.md`: "Tabela de modelos: AA (inteligência, **benchmarks**, preço, tokens/s, TTFT, release_date)"; memlog Forge (linhas 36 e 43): coding index, math index + 15 benchmarks disponíveis na API gratuita.
- **PRD:** FR-9 lista só o "índice de inteligência". Coding/math index e benchmarks não aparecem nem como colunas nem como "fora do MVP" (§9.2).
- **Onde resolver:** FR-9 (adicionar índices de programação e matemática, e eventualmente benchmarks em linha expandida) ou registrar a exclusão explícita em §9.2.

### G4 — Lacuna: Camada principal/Etiquetas/ticker definidos só para 9 empresas
- **Input:** tabela de `forged-idea.md` cobre 9 empresas (Google, Apple, SpaceX, Microsoft, IBM, Tesla, TSMC, Amazon, Broadcom). **Oracle**, também obrigatória a pedido do usuário, não está nessa tabela (aparece só no texto como Nuvem, "infraestrutura OpenAI/Stargate").
- **PRD:** FR-20 manda seguir "a tabela de `forged-idea.md`", mas essa tabela não cobre Oracle nem as outras ~25 empresas obrigatórias (Meta, OpenAI, NVIDIA, AMD, CoreWeave, Palantir etc.). O addendum B tem tickers, mas sem Camada principal nem Etiquetas. A referência é circular e incompleta.
- **Onde resolver:** addendum B → transformar em tabela completa (Empresa · ticker/bolsa · Camada principal · Etiquetas) para toda a lista do FR-20; FR-20 aponta para o addendum, não para o forged-idea.

### G5 — Restrição latente: acesso restrito × hospedagem gratuita × Vercel
- **Input:** memlog Forge (crack, linha 49): GitHub Pages é sempre público; proteção por senha na Vercel **depende de plano** (pago); Cloudflare Pages + Cloudflare Access atende login de graça para poucos usuários.
- **PRD:** FR-30 assume "proteção por login na hospedagem"; §6 exige hospedagem "gratuita ou quase"; o addendum D aponta "provável Vercel". O conflito registrado na ideação e a alternativa Cloudflare foram descartados sem registro. Com a Fila de revisão no MVP (que escreve no Cadastro), o acesso restrito deixa de ser opcional.
- **Onde resolver:** addendum D (acesso restrito: citar o limite do plano Vercel Hobby e a opção Cloudflare Access) e §11 Q1 (a escolha de hospedagem depende também do login, não só da portabilidade); manter a premissa de FR-30 em §12 com esse risco.

### G6 — Lacuna menor: logos fora do Globo e origem das logos
- **Input:** memlog Forge (lock, linha 33): "tabela **e painel** com logo pequena"; fallback monograma; coleta única de Simple Icons, press kits e Wikimedia.
- **PRD:** a logo pequena aparece na Tabela (FR-9) e no Terminal (FR-7), mas não na Faixa de cotações (FR-18). O fallback monograma está só no Globo (FR-4), não no Terminal/Tabela/Faixa. O addendum A não lista as fontes de logos (só as descartadas).
- **Onde resolver:** FR-18 (logo pequena ao lado do ticker, se mantida a decisão), FR-21 (monograma como fallback em todas as telas) e addendum A (fontes de logos).

## Observações menores (sem lacuna de input, apenas consistência)
- Addendum C ainda marca a Tarefa padrão 2.000+1.000 como `[ASSUMPTION]`, mas o memlog do PRD (linha 14) a registra como **confirmada**. Remover a marca.
- §5 Desempenho cita só "notebook recente"; com responsividade completa (FR-29), falta uma meta mínima para celular.
- O pedido original fala em "janela **animada**" ao abrir; o PRD cobre a digitação, mas não a animação de abertura/fechamento da janela (detalhe para UX, não bloqueia).
