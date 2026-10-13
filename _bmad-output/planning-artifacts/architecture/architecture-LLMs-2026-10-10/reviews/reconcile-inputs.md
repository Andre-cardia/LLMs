# Reconciliação independente de inputs — LLMs

Revisão documental em 2026-10-10. Leitura integral de `prd.md`, `addendum.md`, `DESIGN.md`, `EXPERIENCE.md` e memlog UX, comparada com `ARCHITECTURE-SPINE.md`, `contracts.md` e `coverage.md`; `implementation-readiness.md` e memlog de arquitetura consultados para verificar gates. Fontes originais permaneceram intactas; nenhuma credencial ou `.env` foi lida.

**Veredito final: PASS documental de reconciliação — R1/P1 e R2/P2 resolvidos, sem achado aberto neste escopo.** Foram encontrados uma lacuna de autoridade/estado do feedback humano e uma ambiguidade entre relevância e menção; ambas receberam correções conferidas por leitura dos contratos. Defaults e consequência da quota inicial também foram explicitados. O escopo foi herdado corretamente; não há motivo para reiniciar UX ou bloquear toda a arquitetura por seus frontmatters `draft`. Os gates específicos do PRD §11 continuam; este veredito não atesta implementação ou runtime.

## R1 — P1 resolvido documentalmente: ocultação e feedback humano de Notícias

- **Origem:** PRD FR-15, `prd.md:233`, exige confirmação; cancelar conserva a Notícia; confirmar oculta a mesma Notícia em Terminal, FLUXO, LABS, NOTÍCIAS e Leitor e orienta o filtro da Empresa.
- **Destino original, antes da correção:** `coverage.md:21` atribuía FR-15 somente a News Agent/validator; seção Fila e comandos só definia comandos para propostas e Cadastro. A lista de IDs não declarava `NewsId`, embora `openNews(newsId)` o usasse. AD-10 definia store de UI, mas não fixava autoridade durável de ocultações/feedback. News Agent permanecia corretamente sem escrita.
- **Divergência possível:** cada superfície pode ocultar por índice ou URL local; uma publicação seguinte pode reintroduzir a matéria, LABS pode continuar mostrando-a e nenhum componente registra feedback para orientar o filtro. Fazer a ocultação esperar a publicação staged do Cadastro também não cumpre a interação imediata da confirmação.
- **Correção mínima:** identidade canônica da Notícia, preservada pela deduplicação, mais porta/comando privado autenticado do dono para feedback e registro durável. Fixar que uma confirmação bem-sucedida atualiza a projeção compartilhada das cinco superfícies imediatamente; futuras Atualizações e consultas respeitam o mesmo registro. Cancelamento não escreve. Consumir feedback como dado de filtragem, sem conceder escrita ao News Agent. O contrato deve distinguir esse efeito imediato das alterações curadas staged.
- **Prova necessária:** a mesma matéria sindicalizada em duas Fontes tem um `NewsId`; cancelamento conserva todas as superfícies; confirmação remove de todas, inclusive Leitor aberto e LABS; reload e nova Atualização não a reapresentam; comando sem dono autorizado falha. Pode ser testado em fixtures antes de provider real.
- **Resolução conferida:** AD-15, `ARCHITECTURE-SPINE.md:125`, mais seção Feedback de relevância em `contracts.md` e owner atualizado em `coverage.md:21`, fixam NewsId/aliases persistentes, comando autenticado confirmado, ledger privado, revisão de feedback independente e efeito imediato nas cinco superfícies. APIs/Busca/chat também aplicam supressão; Atualização consulta ledger antes dos limites de cinco/catorze. Cancelamento não emite comando, News Agent não escreve e Leitor removido repõe foco. Leitura da correção confirmou a resolução arquitetural; execução dos cenários continua pendente.

## R2 — P2 resolvido documentalmente: relevância por Empresa versus Empresas citadas

- **Origem:** PRD FR-15 descarta homônimos e menções de passagem por Empresa; FR-34 mantém Empresas citadas clicáveis no Leitor. Addendum §D manda resolver citações para Empresas já cadastradas, sem criar Empresas por geração.
- **Destino original, antes da correção:** `NewsResult` tinha apenas `relevant` booleano e `companyIds`, sem escopo da Empresa avaliada nem distinção entre Empresa relevante e Empresa somente citada. Deduplicação/limite por Empresa já era definido no contrato.
- **Divergência possível:** a matéria é relevante para Amazon e apenas menciona Apple de passagem. O coletor pode publicá-la para todas as `companyIds`, enquanto o Leitor usa o mesmo campo para links das citadas; isso viola FR-15 ou elimina citações legítimas para satisfazer o filtro. Um único booleano não resolve a relação para várias Empresas.
- **Correção mínima:** declarar resultado de relevância no par `(newsId, targetCompanyId)` ou `relevantCompanyIds`, separado de `citedCompanyIds`. Todas as projeções por Empresa/Camada e os limites por Empresa usam a associação relevante; links do Leitor usam as citadas validadas. Não permitir associação pelo fato de um nome aparecer no resumo. IDs sempre pertencem ao Cadastro da revisão consultada.
- **Prova necessária:** matéria relevante para uma Empresa, menção incidental a outra e homônimo de uma terceira; só a primeira recebe o item no seu conjunto de Notícias, a segunda pode continuar como citação válida do Leitor, e o homônimo não vira Empresa citada.
- **Resolução conferida:** `contracts.md:11` e seção Agentes e orçamento fixam `relevantCompanyIds` separado de `citedCompanyIds`, avaliação por Empresa-alvo, projeções/limites/LABS somente sobre relevantes e navegação de citadas somente após resolução no Cadastro. O esquema anterior não permanece como alternativa. A correção resolve a divergência entre coletor, filtro e Leitor; prova de qualidade com homônimos e amostra humana continua gate antes da integração de Notícias.

## Requisitos conferidos sem perda material

| Área | Resultado da reconciliação |
| --- | --- |
| Defaults | FLUXO inicial; OSIRIS com modo do sistema; som/BACKBONES desligados; seis temas e painéis OSIRIS/âmbar escuros aparecem em coverage/AD-10/AD-13. HÍBRIDO inicial, Leitor LATERAL e abertura por NOTÍCIAS sem substituir preferência foram explicitados em `coverage.md:68` e seção Estado de interface de `contracts.md`, além da herança do PRD/UX. |
| Globo e Laboratórios | Identidade `isLab` independente da Camada principal, localização real preservada e renderer compartilhado estão definidos. Herança explícita mantém losango/rótulo inclusive Laboratórios por Etiqueta, cor da Camada principal, prioridade selecionado/Lançamento, contagem pela principal e filtragem por principal OU Etiqueta. Tokens do protótipo não podem prevalecer sobre FR-1/FR-2. |
| Limites e lançamentos | Cinco Notícias por Empresa/duas semanas, 14 no FLUXO, dez propostas novas/semana, datas AA > HF > OpenRouter, variantes e prévia/final preservados. A primeira ingestão não cria data de Lançamento nova. |
| Auth e Histórico | AD-9 cobre assets, objetos, snapshots, endpoints, mutações, origens/preview e Histórico; URL não concede acesso. Q2/Q7 mantêm integração auth, retenção, exclusão e backup dependentes de prova/decisão. |
| Orçamento | Reserva pessimista e buckets separados; 80% passa Notícias a seis horas; 100% pausa geração paga com título/link; chat/busca começam com teto zero. US$5 exato e custos novos continuam premissa/gate, sem contratação inferida. |
| MERCADOS | Cobertura por instrumento, moeda/unidade, calendário/fuso, fallback e histórico não são fabricados. Q5 antecede stories reais; amplitude não pode contar ausências como zero. |
| Geografia | Namespace independente, sem sexta Camada, sem vínculo Empresa/cabo inferido; associação estação/cabo requer evidência. Proveniência/licença do protótipo não são aceitas como prova. Tiles interativos, crédito, cache, histerese, fallback satélite e Q4/Q6 preservados. |
| UX e acessibilidade | Reduzir movimento, foco, toque, todas as funções no celular e seis temas continuam requisitos. Confirmação oral de UX concluída permite Architecture; questões específicas de PRD §11 continuam antes das stories afetadas, sem promoção silenciosa de arquivos UX. |

## Consequências registráveis, sem novo bloqueio global

- AD-5 aplica dez novas Empresas/semana também à curadoria inicial. O addendum §B contém 35 entradas obrigatórias: com esse limite, a lista completa exige pelo menos quatro janelas semanais (e pode ser maior com outros Laboratórios elegíveis). Isso é interpretação conservadora compatível com FR-22, não licença para publicar lista incompleta como FR-20 cumprido. Registrar a consequência no planejamento; qualquer exceção de bootstrap exige decisão explícita e não deve ser presumida nesta revisão.
- Q1/Q7, Q2, Q3, Q4, Q5 e Q6 delimitam partes afetadas. Contratos e fixtures sintéticas independentes podem avançar; integração de Notícias deve respeitar a combinação de Fontes/validação requerida por PRD §11 antes de declarar a story real pronta.
- FR-31 a FR-40 permanecem no MVP; gates ou ausência de provider validado não autorizam corte. Logos, ASCII, som e benchmarks mantêm somente a ordem de corte já acordada.

## Evidência e limites da revisão

Foi executada leitura e reconciliação documental integral. Após as correções, SHA-256 dos cinco inputs originais foi recalculado independentemente e comparado com `/Users/andrecardia/Documents/Codex/2026-10-10/task/evidence/llms-before.json`: **5/5 iguais ao baseline**.

| Input original | SHA-256 conferido |
| --- | --- |
| PRD `prd.md` | `2ed36e72613dfce8e3375dc97a143c8542a3504e8de5f92e5ccaca6e09be9e9b` |
| PRD `addendum.md` | `6d1e0447c202b49bdb67a022123799a3815c422b7cde7f5c5b00b0fc2eac5953` |
| UX `DESIGN.md` | `49198d0bb3388d4376543f2e215bd3b71d6cb89e90c2b60dedefc25dfc1cee39` |
| UX `EXPERIENCE.md` | `0a0292dbbb68f31d2a9242588c07dcf174b9db32d86f0f96207467694bf25f35` |
| UX `.memlog.md` | `7b28f2a11ae7daf2599d27bdd46b62180f81f9c4ab50485f8ba7dea63f166510` |

Não foram executados testes de produto, browser, performance, chamadas reais de API, auth integrada, jobs agendados, licenças ou custos reais. Os cenários acima são critérios propostos para a validação posterior, sem alegação de aprovação em runtime. A única edição deste revisor foi `reviews/reconcile-inputs.md` em staging.
