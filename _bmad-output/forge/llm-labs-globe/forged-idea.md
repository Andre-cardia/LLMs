# Forged Idea — Monitor Global de Labs de LLM

Status: HARDENED · Uso: pessoal (por ora) · Fonte: sessão Forge Idea

## Locks
- **Laboratório** = empresa que treina o próprio modelo base (fronteira ou pesos abertos), privada ou listada; não hosts/revendedores. Corte: modelo no Artificial Analysis/OpenRouter ou pesos abertos relevantes no HF.
- **Empresas listadas**: lista curada por camada — Labs · Chips · Nuvem/datacenter · Energia p/ IA · Software IA — sem restrição de bolsa (~80–150 + labs). **Inclusão obrigatória** (exemplos da lista inicial): Chips — NVIDIA, **TSMC** (fabrica os chips da NVIDIA), AMD, ASML, Broadcom, Micron, SK Hynix, Samsung; Nuvem — **Oracle** (infraestrutura para a OpenAI/Stargate), CoreWeave, Equinix, Vertiv, Arista; Energia — Constellation, Vistra, Oklo, GE Vernova, NuScale.
- **Inclusão obrigatória pedida pelo usuário** (camada principal = cor; demais camadas = etiquetas que também respondem aos filtros):

  | Empresa | Ticker | Camada principal | Etiquetas |
  |---|---|---|---|
  | Google (Alphabet) | GOOGL · Nasdaq | Labs (Gemini) | Chips (TPU), Nuvem |
  | Apple | AAPL · Nasdaq | Labs (Apple Foundation Models) | Chips (Apple Silicon) |
  | SpaceX (incorporou a xAI em 2026) | SPCX · Nasdaq | Labs (Grok/xAI) | Nuvem/datacenter (Colossus) |
  | Microsoft | MSFT · Nasdaq | Labs (MAI, Phi) | Nuvem (Azure) |
  | IBM | IBM · NYSE | Labs (Granite) | Nuvem |
  | Tesla | TSLA · Nasdaq | Software/IA aplicada (FSD, Optimus) | Chips (AI5), Energia |
  | TSMC | TSM · NYSE / 2330 · TWSE | Chips | — |
  | Amazon | AMZN · Nasdaq | Nuvem (AWS) | Labs (Nova), Chips (Trainium) |
  | Broadcom | AVGO · Nasdaq | Chips | — |
- **Atualização por risco**: dados estruturados das APIs → script agendado sem LLM, publica sozinho. Notícias → agente barato filtra/resume/traduz p/ PT, publica sempre com título original + link. Novo lab/sede/coordenadas/email/logo → agente propõe, **fila de revisão humana** aprova. Agente de notícias sem escrita no cadastro (notícia = entrada hostil).
- **Globo**: cor = camada (5 cores, ok em dark/light); pulso = lançamento, decai e para em **7 dias**; zoom regional troca pontos por logos; legenda com filtros.
- **Terminal retrô**: hover ~0,3 s = prévia; clique/toque fixa e digita tudo (links clicáveis); clique/Esc pula; ≤ ~2 s; som Web Audio sintetizado, **desligado por padrão**; respeita reduced-motion.
- **Logos**: arquivos locais `logos/<slug>.svg`, oficiais sem alteração; transição ASCII → logo no terminal; fallback monograma; rodapé de marcas.
- **Tabela de modelos**: AA (inteligência, benchmarks, preço, tokens/s, TTFT, release_date) + OpenRouter (contexto, cache, modalidades) + HF (pesos/licença). **"Custo estimado por tarefa"** com fórmula própria visível (ⓘ); "≈" em modelos de raciocínio. Latência rotulada como tempo até resposta. Atribuição ao Artificial Analysis.
- **Mercado**: só faixa de cotações (índices NDX, Composite, S&P 500, SOX + ações IA) e cotação/minigráfico 30d no terminal. Yahoo (principal) + Finnhub (reserva); ~15 min no pregão; aviso de atraso.
- **Infra**: nuvem gratuita, portátil — jobs no GitHub Actions geram arquivos de dados; site estático só lê. Provável Vercel; AWS depois sem reescrever.
- Dark/light toggle; referência visual artificialanalysis.ai.

## Rejeitado (e por quê)
- Nasdaq inteira (~4 mil empresas): afoga os labs, notícias ~40x, vira terminal genérico.
- Critério "só Nasdaq / setor oficial": rejeitado justamente porque deixaria de fora TSMC, Oracle, Vistra e Oklo (listadas na NYSE) e incluiria centenas de empresas sem relação com IA. Essas empresas ESTÃO no projeto.
- Scraping do site AA: viola termos, quebra.
- Rodar só no Mac: atualizações param.
- Cartões de índices e heatmap: excesso de painéis.

## Fatos verificados
- AA API gratuita (chave em `.env`): 696 modelos/58 criadores; sem custo por tarefa, sem tokens de raciocínio; 1.000 req/dia; chave só no servidor.
- OpenRouter `/api/v1/models` sem chave: 467 modelos/63 orgs.
- Sem chave: GDELT DOC API, Google News RSS, HF `/api/models?author=`, Yahoo chart. Finnhub e logo.dev exigem chave; Clearbit fora do ar.

## Em aberto
- Hospedagem final (Vercel vs AWS); cron do Vercel Hobby ~1x/dia (confirmar).
- Teto do agente: assumido ~US$5/mês. Modelo tradutor. Nº de notícias por empresa.
- Contato: email quando houver, senão link de formulário.
- Antes de abrir ao público: rever licenças AA e cotações.
