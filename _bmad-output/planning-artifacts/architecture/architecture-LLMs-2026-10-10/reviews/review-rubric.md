# Revisão independente — rubric walker

Data: 2026-10-10. Escopo: `ARCHITECTURE-SPINE.md` e os quatro companions, confrontados com o PRD/addendum e os contratos relevantes da UX, todos lidos sem alteração. Critério: `.agents/skills/bmad-architecture/references/reviewer-gate.md` e a semântica de invariantes/seed do `SKILL.md` local.

**Veredito: REQUEST CHANGES documental antes de marcar a spine como final; há duas lacunas de consistência altas e duas correções médias, sem dimensão operacional inteiramente silenciosa e sem necessidade de aceitar o seed para continuar fundações independentes em fixtures.**

**Veredito final após releitura das correções: PASS documental — R1 a R4 resolvidos; nenhum achado desta lente permanece aberto.** O veredito inicial e os achados originais ficam preservados abaixo, com confirmação em “Resolução após correções do autor”. Os gates Q1–Q7 e as provas de runtime continuam obrigatórios para as partes afetadas.

O lint já registrado em `reviews/lint-spine.json` informa zero achados mecânicos. Esta revisão é semântica e não prova execução do produto. Nenhuma fonte, spine, código, segredo, conta ou recurso foi alterado por esta revisão.

## Achados altos

### R1 — HIGH — Ocultação humana de Notícia não tem autoridade nem contrato compartilhado

**Evidência:** PRD FR-15 exige confirmação, ocultação da mesma Notícia em Terminal, Fluxo, LABS, NOTÍCIAS e Leitor, além de orientar o filtro da Empresa. `coverage.md:21` reduz a responsabilidade a `News Agent/validator`, AD-5 e AD-8. `contracts.md:35` só descreve comandos de propostas/Cadastro, e `contracts.md:75` descreve saída do Agente; não há identidade canônica de Notícia nem mutação de feedback/supressão.

**Divergência permitida:** uma feature implementa uma lista de IDs ocultos em memória da UI; outra reaplica a projeção publicada após Atualização, fazendo a matéria reaparecer. Ambas podem respeitar o store único, a autoridade de curadoria e o isolamento do LLM. Uma terceira implementação pode ocultar a matéria em todas as Empresas, enquanto outra oculta apenas a associação que o dono marcou como irrelevante. O schema não resolve a diferença.

**Correção recomendada — autofix técnico, com a escolha de escopo registrada como inferência:** nomear uma identidade canônica de Notícia e o proprietário do feedback do dono; definir comando autenticado/idempotente e a chave de supressão; fixar como a confirmação é aplicada à projeção comum e à próxima ingestão e como orienta o filtro. Se a Notícia menciona múltiplas Empresas, declarar expressamente se a ação suprime a matéria inteira ou sua associação com a Empresa. Atualizar o mapa de FR-15. Esta lacuna deve ser fechada antes das stories de Notícias; não depende de escolher LLM pago.

### R2 — HIGH — `expectedRevision` é ambíguo na aprovação staged e publicação em lote

**Evidência:** AD-4 (`ARCHITECTURE-SPINE.md:63`) exige `expectedRevision`; `contracts.md:37` recebe esse campo e `contracts.md:51` diz que Publisher aplica decisões ordenadas contra ele. O manifesto distingue `revision` e `curationRevision`, porém o comando não define qual revisão é verificada, quando ela avança e qual revisão o cliente recebe após aprovação/undo.

**Divergência permitida:** o dono aprova duas propostas independentes lidas no baseline R. Uma implementação verifica R na revisão publicada, aceita as duas e publica um lote; outra avança a revisão staged na primeira aprovação e rejeita a segunda; uma terceira aceita ambas, mas aplica a primeira e torna a segunda conflitante ao avançar a revisão curada. São comportamentos incompatíveis para a Fila e o Publisher, mesmo seguindo literalmente as regras de revisão/idempotência/CAS.

**Correção recomendada — autofix técnico:** definir o alcance do token do comando (proposta, staging ou revisão curada), a transição que o avança e o envelope de resposta; fixar a validação de múltiplas decisões do mesmo baseline, com detecção de patches conflitantes e uma revisão curada final atômica. O contrato deve preservar a rejeição de conflitos reais sem transformar aprovações independentes em conflitos artificiais. A prova técnica de D1/CAS pode continuar em Q2; a semântica não deve ser deixada ao adaptador nem ao primeiro épico.

## Achados médios

### R3 — MEDIUM — `[ADOPTED]` mistura requisitos herdados com decisões novas inferidas

**Evidência:** a skill reserva `[ADOPTED]` para escolhas assentadas pelo usuário ou pela realidade existente. PRD §11 deixa à arquitetura persistência/contratos e DESFAZER após publicação. AD-2 adota detalhes de CAS/slices; AD-4 adota compensação publicada na revisão seguinte; AD-9 inclui configuração específica de Worker. `implementation-readiness.md:24` afirma que decisões inferidas são marcadas, mas esses detalhes são apresentados dentro de blocos integralmente `[ADOPTED]` sem a distinção.

**Impacto:** o builder pode tratar um requisito herdado — privacidade, aprovação humana, publicação na Atualização seguinte — e sua solução técnica nova como tendo a mesma procedência de aceite. O texto `Worker proposto` e o Structural Seed limitam bem a hospedagem, porém não resolvem a procedência das outras escolhas.

**Correção recomendada — autofix editorial:** separar a referência herdada da solução de arquitetura inferida ou retirar a marca de adoção integral dos blocos novos, preservando os IDs. Registrar inferências no memlog/resultado headless e explicitar quais regras já são o contrato proposto para fixtures. Não exige reapresentar requisitos ao dono nem bloquear decisões reversíveis de implementação; exige não atribuir um aceite humano que não está demonstrado nas fontes.

### R4 — MEDIUM — Frescor não decide precedência nem idade máxima do dado de origem

**Evidência:** AD-7 (`ARCHITECTURE-SPINE.md:81`) impede dado velho receber frescor novo e distingue `quotedAt` de `lastSuccessAt`. Entretanto `contracts.md:65` permite LIVE por validação recente sem falha posterior, mesmo que o horário válido da cotação seja antigo; `contracts.md:66` e `contracts.md:67` também se sobrepõem (ATRASADO versus OFFLINE para três falhas e duas cadências excedidas). Q5 cobre calendários e cadência por instrumento, mas falta definir como esses valores entram no redutor comum de status, que `coverage.md:31` já considera decomponível.

**Divergência permitida:** após fetch bem-sucedido de uma cotação antiga em pregão aberto, uma implementação anuncia LIVE com atraso mostrado e outra anuncia ATRASADO. Na terceira falha, uma feature escolhe a primeira linha ATRASADO; outra escolhe a linha específica OFFLINE. Os módulos continuam usando a mesma tabela, mas reduzem as condições de modos diferentes.

**Correção recomendada — autofix do contrato:** tornar a política um redutor com ordem explícita (por exemplo: sem dado/credencial inválida; ausência de conexão da UI; calendário/horário inválido; mercado fechado válido; limite de falhas; idade da observação e da validação; LIVE). Separar idade da última coleta válida da idade do dado observado. Os limites por instrumento/Fonte podem seguir gated em Q5, mas sem limite confirmado o estado não deve inferir frescor de conteúdo. Incluir dois casos determinísticos: cotação antiga retornada hoje e condição simultânea ATRASADO/OFFLINE.

## Caminhada da rubric

| Critério | Resultado |
| --- | --- |
| Paradigma e fronteiras | Adequados ao escopo: monólito modular, domínio sem DOM/SDK/LLM, application como entrada e portas para adaptadores. AD-1 pode ser fiscalizada por import boundaries. |
| Propriedade e mutação | Snapshot tem Publisher único; Cadastro/Fila são humanos; agentes têm autoridade limitada. R1 e R2 são as lacunas restantes de consistência. |
| Identidade e valores | IDs opacos, aliases, variantes, ausência `null`, decimal e unidades evitam divergências usuais. O limite semanal incluindo bootstrap é consistente com FR-22; não inventar exceção para acelerar a lista inicial. |
| Publicação, concorrência e falha parcial | Last-good, baseline comparável, fencing, idempotência, integridade referencial e CAS conjunto são regras verificáveis. A tecnologia de transação está corretamente gated, sem alegação de prova runtime. |
| Agentes e orçamento | Ledger fechado por padrão, reserva por tentativa, reconciliação desconhecida e chat com limite zero têm responsabilidade clara. Teto exato/provedores estão abertos antes de chamada paga. |
| UI e acessibilidade | Um store semântico e herança explícita de DESIGN/EXPERIENCE preservam defaults, exclusividade de painéis, teclado, foco e redução de movimento. Questões móveis/renderers não foram convertidas em autorização para cortar FRs. |
| Segurança e privacidade | Auth em assets/API/objetos, origem alternativa, Owner allowlist, CSRF e segredos no servidor são invariantes; teste de auth/backup/retensão aparece como gate. O Worker é implementação condicional do seed. |
| Dimensão operacional/ambiental | Há isolamento local/test/preview/prod, recuperação de snapshot versus banco, métricas, logs e gates de backup/retensão/eliminação. Hospedagem/IdP/quotas/custos/jobs/calendários não estão silenciosos: Q2/Q5 e evidência os nomeiam. |
| Deploy e ativação | Ausência de deploy/cron/chamada paga automática é explícita. Publicação exige autorização do dono. Continuar fixtures não equivale a habilitar provedores ou produção. |
| Dados geográficos e licenças | BACKBONES separado, proveniência e licença gated, vínculo estação/cabo comprovável, OSM com atribuição/cache, sem prefetch e com fallback. |
| Cobertura de capacidades | Os 40 FR têm mapa; fontes mantêm critérios completos. R1 é requisito quieto cujo proprietário e consistência não chegaram ao contrato. |
| Seed versus invariantes | Vite/TS/Workers/D1/R2 e bibliotecas gráficas são explicitamente propostos e gated. Versões exatas/lockfile não foram assumidas como instaladas. R3 trata a marca de adoção de decisões novas, não a validade do seed. |
| Tecnologia atual | Companion inclui evidência primária datada e afirma limites não medidos. Esta lente conferiu essa separação documental; não reexecutou verificação web, instalações ou benchmark, reservados à lente técnica/provas aplicáveis. |
| Brownfield/herança | Readiness descreve baseline sem código de produto; UX vanilla foi herdada, protótipos divergentes preservados. Não há parent spine identificado a contradizer. |
| Deferred | Gates estão atados às stories afetadas; não permitem implementar integrações divergentes em paralelo. Semântica de R1/R2/R4 precisa fechar antes de decompor as fundações afetadas, em vez de ser relegada aos respectivos adaptadores. |

## Limites e entrega

Leitura documental independente; sem teste de produto, benchmark, probe de API, cobrança, autenticação real ou restauração executada. `lint-spine.json` foi lido como evidência existente, não reexecutado por esta lente. O único arquivo criado por esta revisão é `reviews/review-rubric.md`. As quatro correções são delimitadas e podem ser aplicadas pelo autor na finalização; os aceites Q1–Q7 continuam gates para as partes correspondentes, sem impedir fundações sintéticas não afetadas.

## Resolução após correções do autor

Releitura independente em 2026-10-10. Os achados e o veredito iniciais acima ficam preservados como registro da revisão; esta seção descreve o estado posterior.

| Achado | Estado | Evidência da correção |
| --- | --- | --- |
| R1 — HIGH — Feedback de Notícias | Resolvido documentalmente | AD-15 define `NewsId`, confirmação, autoridade de Application e supressão owner-wide. O contrato `Feedback de relevância` acrescenta endpoint autenticado/idempotente, `expectedFeedbackRevision`, revisão de feedback retornada, combinação com revisão de dados, aliases/sindicados, aplicação em todas as superfícies/Busca/chat, proteção contra reaparecimento e exemplos para o filtro. FR-15/33/34 foram remapeados. |
| R2 — HIGH — Revisão de curadoria | Resolvido documentalmente | `expectedRevision` distingue `proposalVersion`, `curationRevision` e `targetVersions`; criação verifica ausência. Propostas disjuntas do mesmo baseline publicam juntas; concorrência no mesmo alvo bloqueia as decisões afetadas para reconciliação. O conjunto restante publica atomicamente. O contrato também rejeita CAS com zero efeitos e exige rollback integral do plano, sem apagar o ledger externo. |
| R3 — MEDIUM — Procedência de adoção | Resolvido documentalmente | A introdução distingue requisitos PRD/UX herdados de propostas técnicas headless; as marcas integrais `[ADOPTED]` foram removidas. Seed e aceites humanos continuam propostos/gated. |
| R4 — MEDIUM — Política de frescor | Resolvido documentalmente | O contrato fixa a precedência dos estados, diferencia coleta e observação, exige horário de cotação em pregão (30 min mais atraso documentado), conserva `observedAt` após HTTP sucesso e separa datas de publicação das matérias. Releitura adicional confirmou as duas bordas: bolsa fechada usa close/pós-close e `nextDueAt` do calendário sem expiração por 30 min corridos em fins de semana/feriados; Modelo cuja Fonte omite asOf opcional tem estado de coleta LIVE e `sourceAge: unknown` indicado, sem fabricar horário. |

As resoluções acima são confirmações de contrato documental, sem afirmar que auth, feedback, CAS, persistência ou recuperação já foram implementados/testados.

**Fechamento desta lente: PASS documental.** As quatro divergências apontadas foram eliminadas no contrato relido. A nova AD-16 ainda exige schemas/fixtures compartilhados antes de liberar stories independentes de fronteira, preservando a consistência na implementação. Hospedagem/provedores/licenças/retenção mantêm seus gates e esta revisão não autoriza ativação paga, publicação ou deploy. O autor informou lint e cobertura aprovados; esta lente só confirma os trechos relidos e a evidência de lint existente, sem tomar o relato como teste de produto executado pelo reviewer.
