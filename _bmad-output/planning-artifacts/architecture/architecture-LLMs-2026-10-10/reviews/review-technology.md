---
reviewer: architecture_tech
lens: finalize_reviewers technology reality-check
date: 2026-10-10
verdict: partial
critical: 0
high: 2
medium: 0
resolvedMedium: 2
---

# Revisão de tecnologia

**Veredito: parcial, adequado para fundações com fixtures.** As tecnologias propostas existem e suas capacidades básicas estão confirmadas em fontes primárias. Cloudflare permanece seed condicionado a Q2; nenhuma evidência demonstra o produto executando nessa infraestrutura. Os dois achados altos são condições de aceitação operacional já delimitadas pelo gate, não defeitos encontrados em código implementado. A rechecagem final confirmou as correções de CAS perdido/fencing, calendário e runtime. Não restam correções documentais pendentes nesta lente.

Escopo: `ARCHITECTURE-SPINE.md`, `contracts.md`, `technology-evidence.md`; confronto com DESIGN e addendum do projeto original. Critério: lente de tecnologia de `.agents/skills/bmad-architecture/customize.toml` e `references/reviewer-gate.md`. Não modifiquei esses documentos, não instalei pacotes, não li `.env`, não usei contas ou APIs pagas.

## Achados

### T1 — Alta: batch D1 não prova a operação conjunta de CAS, decisões e lease

- **Locais:** spine AD-2/AD-4/AD-6/AD-8 e Q2; `contracts.md:57`, `contracts.md:79`; `technology-evidence.md:14`.
- **Confirmado:** D1 oferece batch de statements como transação, com rollback quando um statement falha. R2 oferece escrita consistente e operações condicionais de objeto. [D1 batch](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch), [R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).
- **Ainda não demonstrado:** a transação concreta que rejeita CAS perdido/fencing vencido e impede qualquer decisão ou registro de idempotência da publicação de se confirmar nessa situação. Um UPDATE cuja condição não encontra linhas é válido em SQLite; portanto, **inferência técnica:** colocar esse UPDATE em um batch junto a outras escritas não basta para provocar rollback. [SQLite UPDATE](https://www.sqlite.org/lang_update.html).
- **Ação:** manter Q2 bloqueando infraestrutura real. A prova deve mostrar que ponteiro, revisão curada, decisões e checagens de concorrência usam a mesma operação atômica de controle; perda de CAS produz zero efeitos desse plano. Gravações imutáveis em R2 precedem essa operação e só podem deixar órfãos privados. Não há prova de transação distribuída D1+R2. Testar dois publishers concorrentes, lease vencido, CAS que altera zero linhas e falha entre upload e commit. Reserva concorrente exige uma prova própria de operação condicional atômica; custo de chamada externa já feita nunca é apagado pelo rollback de publicação. O seed deve escolher explicitamente o store de controle antes da implementação correspondente.
- **Triage:** lacuna textual resolvida pelo autor em `contracts.md:57`, conferida nesta revisão: CAS perdido ou fencing aborta o plano; zero linhas não é sucesso; batch que confirme decisões nesse caso viola o contrato. Resta a prova Q2, sem escolha humana nova nesta revisão.

### T2 — Alta: capacidade do dispatcher de quinze minutos e custo total continuam desconhecidos

- **Locais:** spine AD-7/AD-14 e Q2; `technology-evidence.md:15`, `technology-evidence.md:32–34`.
- **Confirmado:** cron Cloudflare usa UTC. Os limites consultados em 10/10 são CPU de 10 ms e 50 subrequests por execução no Free; para cron com intervalo menor que uma hora no Paid, CPU de 30 s. Há 128 MB por isolate, seis conexões simultâneas e wall time máximo de quinze minutos para cron. [Cron](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
- D1 adiciona 50 queries por invocação no Free, 500 MB por banco Free e duração máxima de query de 30 s. Seu throughput depende das queries. Plano Paid de Workers tem assinatura a partir de US$5/mês, separada do orçamento LLM; isso não é estimativa de custo do produto. [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).
- **Ainda não demonstrado:** envelope completo com ~200 Empresas, parsing/dedup/validação/digests, APIs, retries, JWKS, banco e objetos. Noventa e seis janelas por dia não demonstram que o trabalho cabe em uma invocação.
- **Ação:** registrar esses limites no aceite Q2 e medir o trabalho representativo com fixtures, depois validar no ambiente escolhido antes de ativar jobs. Se precisar dividir o job, preservar fencing, idempotência e publicação única. Não inferir que o Free basta ou que o orçamento automático de US$5 inclui infraestrutura.
- **Triage:** defer a Q2. A documentação atual já evita essas promessas; o achado impede chamar a infraestrutura de validada.

### T3 — Média, resolvida: runtime observado é EOL, apesar de atender o mínimo sintático do starter

- **Local:** `technology-evidence.md:9–10`; spine Structural Seed.
- **Confirmado localmente nesta revisão:** `node --version` retornou `v25.9.0`; `npm --version`, `11.12.1`. A lista oficial marca a série Node 25 como EOL e Node 24 como LTS. A release 24.21.0 citada existe. [Node releases](https://nodejs.org/en/about/previous-releases), [Node 24.21.0](https://nodejs.org/en/blog/release/v24.21.0).
- **Ação/autofix documental:** distinguir runtime apenas observado de runtime de build aceito; exigir versão LTS suportada e isolamento por projeto/CI no scaffold, sem atualizar o Node global do dono. Não qualificar Node25 como runtime suportado para produção só por passar no `engines` do Vite.
- **Triage:** corrigido pelo autor e conferido em `technology-evidence.md:9–10`: Node25 somente como fotografia local, EOL linkado à fonte primária, LTS suportado e isolado exigido para scaffold/CI, sem alteração global. Instalação/pin e build seguem no scaffold autorizado; nenhuma instalação foi executada para fechar este achado documental.

### T4 — Média, resolvida: “calendário IANA/feriados” descrevia uma capacidade que IANA tzdb não fornece

- **Local:** `contracts.md:73`.
- IANA tzdb descreve fusos, offsets e mudanças de horário de verão. A expressão atual mistura esse identificador com calendário de pregão. [IANA Time Zones](https://www.iana.org/time-zones).
- **Ação/autofix documental:** exigir separadamente `timeZone` com identificador IANA e calendário de mercado versionado, com sessões, feriados e fechamentos extraordinários provenientes de Fonte confirmada. Q5 já bloqueia a matriz; preservar esse bloqueio e testar DST/feriados/half-days na story pertinente.
- **Triage:** corrigido pelo autor e conferido em `contracts.md:73`: calendário de bolsa/sessão/feriados separado de timezone IANA. Calendário, símbolos e sua validação permanecem Q5.

## Reality-check dos demais compromissos

| Item | Resultado e limite da evidência |
| --- | --- |
| Web vanilla/WebGL | Confirmado no frontmatter local do DESIGN e addendum §E: é compromisso herdado, não preferência introduzida pelo executor. Não há pacote gráfico comprometido. |
| Vite vanilla-ts/TypeScript | [Guide](https://vite.dev/guide/) confirma template, modo não interativo e Node mínimo. O [template upstream](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-vanilla-ts/package.json) consultado contém ESM, `tsc && vite build`, TypeScript `~6.0.2` e Vite `^8.3.3`; [create-vite upstream](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/package.json) declara 9.2.1. Isso confere defaults atuais de `main`, não prova a resolução publicada no registry, um lockfile ou build local. A deferral de versões é honesta; fixá-las e testar no scaffold. |
| Worker antes de assets | `assets.run_worker_first: true` está documentado precisamente para autenticação anterior ao atendimento de assets. É configuração necessária, não implementação de auth. [Worker routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/). |
| Access/JWT | Fonte oficial exige validar JWT no próprio Worker e fornece JWKS/issuer/audience. Spine acrescenta allowlist do dono e falha fechada. Nenhum middleware ou IdP real foi verificado. [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/). |
| R2 privado | Binding permite servir objetos pelo Worker. Buckets são privados por padrão; `r2.dev` e domínios públicos são caminhos independentes. Q2 deve verificar ambos desabilitados ou igualmente protegidos, além de origem/preview/cache. O requisito AD-9 é compatível com isso. [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/). |
| GitHub schedule alternativo | Fonte confirma atrasos e possibilidade de descarte em alta carga, sustentando a ressalva de SLA. [GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). |
| Vercel alternativo | Scheduler externo é uma opção, não necessidade universal: Hobby admite somente cron diário; Pro permite maior frequência. Qualificar o tradeoff por plano se isso virar escolha. Não há compromisso com Vercel/AWS. [Vercel cron pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing). |
| Tiles | HTTPS, atribuição, Referer, cache e proibição de bulk/offline estão confirmados para o serviço OSMF. Não extrapolar a política para todo provedor. Provider/estilo/custo ficam em Q6. [OSMF Tile Policy](https://operations.osmfoundation.org/policies/tiles/). |
| BACKBONES | FAQ atual diz que o antigo repositório não é mantido e que dados brutos geocodificados requerem licença anual; licença de imagem não prova licença da base. Q4 é necessário. [TeleGeography FAQ](https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions), [geocoded license](https://www2.telegeography.com/license-geocoded-map-data). |
| AA/HF/OpenRouter/news/quotes | A autoridade herdada é a fotografia datada de 07/10 no addendum; não houve live probe nesta revisão. A normalização OpenRouter por token está registrada nessa fonte local. Schemas atuais, preços, aliases, licenças e cobertura não são aceites operacionais e seguem os gates pertinentes. |
| Segurança de agentes/orçamento | Saída de esquema fixo, sem ferramentas de escrita, SSRF, autorização do dono, reservas e retenção são requisitos de desenho. Não são capacidades automaticamente fornecidas pelo host ou por um LLM. Provas continuam gates; chat/busca com limite zero evita cobrança prematura. |

## Provas executadas e não executadas

Executados: leitura documental, consultas web de fontes primárias, confronto local do DESIGN/addendum, comandos de versão Node/npm. O arquivo de revisão é a única escrita desta lente.

Não executados: instalação/scaffold/build/typecheck, testes de produto, D1/R2 real, CAS/lease/ledger concorrente, auth/CSRF/previews/objetos, cron real, APIs de dados, custos, browser e performance. Não há resultado de teste de produto “passou” nesta revisão. A evidência permite finalizar a arquitetura como contrato com gates explícitos; a prontidão de implementação integral permanece parcial por Q1/Q2/Q7 e os demais gates das superfícies afetadas.

## Resolução final — 2026-10-10T17:31:08Z

Rechecagem solicitada pelo autor, exclusivamente documental:

- **T1:** regra de aborto de todos os efeitos do plano em CAS perdido/fencing confirmado, zero linhas explicitamente tratado como falha, ledger econômico externo preservado. Lacuna de texto fechada; prova operacional continua alta/Q2.
- **T2:** `technology-evidence.md` agora registra Free CPU 10 ms/50 subrequests, cron Paid com intervalo menor que uma hora CPU 30 s e D1 Free 50 queries/invocação, com fontes oficiais. Capacidade e custo não foram medidos; gate operacional continua alta/Q2.
- **T3 e T4:** fechados documentalmente. Nota Node25 EOL/LTS isolado e separação de calendário de bolsa e timezone IANA conferidas.
- **Starter:** números TS/Vite/create-vite claramente apresentados como fotografia do upstream `main`, não como latest publicado ou resolução instalada. Lockfile e versões exatas permanecem obrigatórios no scaffold antes de aceitar infraestrutura. Sem compromisso indevido com pacote publicado.
- **Vercel:** alternativa agora distingue Hobby diário de Pro com maior cadência; fonte oficial linkada. A ressalva opcional da matriz está atendida.

Hashes SHA-256 dos bytes dos três documentos no instante desta rechecagem; mudanças posteriores exigem nova comparação. Não são hashes de arquivos do projeto original nem prova de execução do produto.

| Documento | SHA-256 |
| --- | --- |
| `ARCHITECTURE-SPINE.md` | `2aa8e5adf6709e7ce0100e48b47e57037c6984f1a9a5469e784e61c8c4033478` |
| `contracts.md` | `b4415990571ebb1c1d93daed88ef9cd4cf19e3827d14b0c14400b5acd29380a0` |
| `technology-evidence.md` | `4b8fdda86524cf22ada41039cca5797f9b02f8314724f1b6e75bc2a2ec4f3c2f` |

**Conclusão da rechecagem:** documentação aprovada nesta lente, com prontidão operacional parcial por Q2. Zero achados críticos; duas condições altas de infraestrutura; zero achados médios abertos. Não foram executados testes de produto nesta rechecagem.
