---
title: '7.1 — Busca e restauração de URL, incremento local'
type: 'feature'
created: '2026-10-12'
status: 'done'
completion_scope: 'local-search-url-fixtures-only'
human_delivery_acceptance: 'accepted-local'
acceptance_record: 'acceptance-7-1-local.md'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '650e413bea8dbadd506f2fd2096e0267e462192e'
story_key: '7-1-buscar-entidades-e-restaurar-o-contexto-da-url'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-7-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problema:** Falta integrar Busca/URL ao store v2, com limpeza explícita e origem da seleção preservada.

**Abordagem:** Integrar busca, projeções e reducer com revalidação de destinos e fixtures.

## Boundaries & Constraints

**Sempre:** ESM, reducer como única autoridade semântica, IDs canônicos, supressão incluindo aliases, revisões de dados/feedback, configuração de base injetada. Conservar 3D, prioridade de `base` e aliases Q11, preferências legadas e patch CR-01. Preservar busca atual: substring sem acentos/caixa, consulta até 256 caracteres, ordem existente, sem novo ranking. Ticker: Cadastro/Empresa/símbolo/bolsa; sem seleção automática de homônimos.

**Nunca:** UI/DOM/foco, Cesium, serviços reais, autenticação real, chat/Histórico, índices financeiros novos, base inicial de produção, deploy ou mudanças Amplify. Não fechar gates nem declarar a Story 7.1 integralmente concluída.

## I/O & Edge-Case Matrix

| Cenário | Entrada | Saída / erro |
|---|---|---|
| Busca | Empresa/Modelo/ticker/Notícia | Destinos v1 existentes e par de revisões; sem entidades inventadas |
| Vazio | Consulta sem correspondência | Texto original preservado, resultados vazios e estado explícito |
| Navegação | Resultado selecionado | Revalidar identidade/relevância; Empresa/ticker → Globo/Terminal, Modelo → MODELOS, Notícia → Leitor |
| Obsoleto | Nova intenção durante leitura | Descartar retorno tardio sem trocar destino nem reabrir janela |
| Restrição | Oculta/removida/acesso negado | Indisponibilidade; não selecionar outra entidade nem devolver dados negados |
| URL | Base/aliases inválidos, repetidos, indisponíveis | Regras de 4.1, sem persistir preferências ou serializar dados privados |

## Decisões humanas — 1A + 2A

- **CR-08:** URL sem `company` não cria override; usa seleção da sessão. Seleção efetiva vazia serializa `company=`; hidratar esse valor limpa a seleção efetiva sem persistir preferência.
- **CR-02:** Snapshot reconcilia sessão e override separadamente, sem promover Empresa do link à sessão. Remover override retorna à sessão reconciliada. Remap exige correspondência explícita; remoção vira `null`, conservando override explícito para não selecionar outra Empresa por acidente.

</frozen-after-approval>

## Code Map

- `src/domain/global-search.mjs`: reutilizar `globalSearch`/`resolveNavigation`; matching e destinos já existem.
- `src/application/local-news-view.mjs`: composição snapshot/feedback e aliases; evitar segunda política de supressão.
- `src/domain/exploration-state.mjs`: `hydrateUrl`, `navigate`, `advanceSnapshot`; somente reducer altera seleção.
- `src/domain/exploration-url.mjs`: parser/serializador; alterar apenas semântica aprovada de Empresa.
- `src/contracts/exploration.mjs`, `src/contracts/navigation.mjs`: reutilizar v2/v1, sem migração implícita.

## Tasks & Acceptance

**Execução:**
- [x] `src/contracts/search.mjs`, `tests/fixtures/search-contract.json` — publicar contrato/fixtures do resultado de busca e contexto de revisão antes do consumidor; reutilizar NavigationTarget.
- [x] `src/application/local-news-view.mjs` — expor frame coerente para o consumidor local, reutilizando composição e resolução de aliases; manter APIs atuais.
- [x] `src/application/local-search.mjs` — coordenar consulta/seleção com frame, geração local e store injetado; sem store semântico paralelo. Erro de acesso limpa resultados privados; falha não navega.
- [x] `src/domain/exploration-url.mjs`, `src/domain/exploration-state.mjs` — aplicar decisões de Empresa; reconciliar remaps explícitos/remoções sem alterar regras de base/painéis.
- [x] `tests/search.test.mjs`, `tests/exploration.test.mjs` — testar matriz, contratos, concorrência controlada e decisões de URL; preservar regressões de 4.1.
- [x] `docs/local-core-fixtures.md`, `_bmad-output/implementation-artifacts/deferred-work.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml` — registrar provas locais e destino dos diferidos, sem concluir integrações.

**Critérios:**
- **AC1:** Dadas fixtures e feedback vigente, quando buscar/selecionar cada tipo, então IDs/revisões e estado de destino correspondem ao contexto revalidado.
- **AC2:** Dadas leituras sobrepostas e nova intenção, quando a antiga terminar, então não sobrescreve consulta, resultado ou destino atual.
- **AC3:** Dada supressão/remoção/revogação entre busca e seleção, quando ativar resultado antigo, então não reabre o conteúdo; remap exige evidência canônica explícita.
- **AC4:** Dada sessão A e link B, quando atualizar e remover override, então volta a A reconciliada; `company=` limpa a seleção mesmo em sessão povoada, sem persistir preferências.

## Aceite humano

Incremento local aceito por Andre após walkthrough e demonstrações; [registro persistido em 2026-10-13](acceptance-7-1-local.md). As notas abaixo conservam o histórico anterior ao aceite. Story integral, UI/acesso e diferidos permanecem pendentes. Commit/push e deploy do preview existente foram solicitados posteriormente, separadamente do escopo de implementação congelado.

## Implementation Notes

- [Contrato v1 de Busca](../../src/contracts/search.mjs) e [fixtures válidas/inválidas](../../tests/fixtures/search-contract.json) publicados antes do consumidor; reutilizam destinos v1 e validam query original, estados explícitos e par de revisões.
- [LocalNewsView](../../src/application/local-news-view.mjs) expõe frame imutável compartilhado: alias resolvido antes da captura snapshot/feedback, sem política duplicada de supressão. APIs anteriores preservadas.
- [LocalSearch](../../src/application/local-search.mjs) usa `view.frame(target?)` e portas síncronas `store.getState()/dispatch()`. Geração local + intentToken impedem retornos vencidos e reentrância; somente o reducer recebe `advanceSnapshot`/`navigate`. Falha/negação limpa resultados e não navega. Não infere remaps de Empresa por nomes; aliases de Notícia usam evidência do resolvedor existente.
- CR-02 reconcilia sessão/override separadamente e conserva override nulo; CR-08 serializa `company=` quando seleção efetiva é nula. A expectativa histórica de promoção de B à sessão foi alterada exclusivamente pela decisão humana aprovada. Bases/painéis/CR-01 permanecem preservados.
- AC1–AC3 e matriz Busca/Vazio/Navegação/Obsoleto/Restrição: [testes de Busca](../../tests/search.test.mjs). AC4 e matriz URL: [testes store/URL](../../tests/exploration.test.mjs), junto das fixtures/regressões 4.1. Concorrência é controlada por promises, sem sleeps/rede.
- Evidências e limites em [documentação local](../../docs/local-core-fixtures.md); destinos das integrações em [diferidos](deferred-work.md). Sprint/Story continuam `in-progress`; revisão e aceite locais ainda pertencem ao fluxo principal. Nenhuma conclusão integral ou fechamento de gates.

## Spec Change Log

## Review Triage Log

### Revisão independente — rodada 1

Três camadas executadas, nenhuma omitida; piso do Blind Hunter: `min(floor(sqrt(74.172)+1),10)=9`. Vereditos individuais antes do agrupamento:

| ID | Veredito / rota | Evidência |
|---|---|---|
| BH1 | medium / patch | Probe: intenção externa vence busca e retorno é superseded, mas current permanece loading. Encerrar somente a geração ainda corrente, sem tocar uma busca nova. |
| BH2 | low / patch | getState assíncrono produz token undefined e busca retorna results. Reutilizar requireSynchronous e integer antes de ler frame/dispatch; sem API nova. |
| BH3 | medium / defer | Probe de adapter inválido: dispatch assíncrono é recusado, mas seu corpo aplica snapshot depois de cancel(). É a limitação preexistente de requireSynchronous: não desfaz efeitos do callback arbitrário já invocado. Portas desta fatia são síncronas; suporte transacional a adapters assíncronos permanece fora do incremento local e precisa ser provado no consumidor futuro. |
| BH4 | medium / patch | Frame válido com 13 objetos compartilhados causou 16.565 chamadas Object.freeze para 106 identidades totais. Limitar o congelamento local por identidade, sem alterar primitives nem o contrato CR-01. |
| BH5 | maybe-false / defer | Remap após remoção já consolidada falha INVALID_REMAP, conforme contrato de origem existente. Não há fonte de mapas de Empresa nem caller integrado que prove entrega legítima fora de ordem. Verificar transporte/ordenação de remaps na integração; impacto potencial medium não verificado, sem inferir correspondência por nomes. |
| BH6 | false / rejeitado | assertSearchResponse descreve current, não todos os retornos de métodos. Superseded é resultado de operação sem dados; testes e consumidor distinguem esse resultado. Nenhum consumidor incompatível ou promessa de validar a união inteira foi encontrado; adicionar contratos não corrige defeito demonstrado. |
| BH7 | low / rejeitado | Catch intencionalmente suprime mensagens privadas; testes comprovam saída indisponível. Hook/categoria de diagnóstico acrescentaria superfície sem falha concreta além de facilitar depuração de adapter defeituoso; não é correção direta necessária nesta fatia. |
| BH8 | medium / patch | Testes anteriores injetavam exceções, sem cobrir retorno malformado das portas. Nova tabela exercita snapshot, revisão, feedback, relógio e alias; casos passam sem patch produtivo. |
| BH9 | low / patch | Teste chamado merge só criava alias de um grupo. Acrescentar dois grupos canônicos, supressão anterior ao merge e snapshot pré-merge conservado; cenário passa no código existente. |
| EC1 | medium / patch | Mesmo probe de BH1 confirma loading sem conclusão após intenção externa. |
| EC2 | medium / patch | Mesmo percurso exponencial de BH4, confirmado com instrumentação limitada por identidade. |
| VG1 | medium / patch | Gap pré-verificado: teste anterior não detecta inversão alias/frame. Acrescentar supressão durante espera do alias e conferir revisão nova/Leitor fechado. |
| VG2 | medium / patch | Gap pré-verificado: cancelamento durante navigate não era testado. Acrescentar subscriber síncrono que cancela e verificar superseded sem republicação. |

Agrupamento: BH1/EC1 e BH4/EC2 compartilham suas respectivas causas; demais achados permanecem separados. Sete grupos de patch (três correções produtivas e quatro reforços de testes), dois diferidos e dois rejeitados. Sem intent_gap/bad_spec: patches privados e locais, sem superfície pública nova. A implementação síncrona delegada não devolveu endereço reengajável; o Lead aplica os patches e verifica o conjunto completo.

### Fechamento dos patches

- BH1/EC1: geração vencida por intent externo agora encerra somente seu loading em idle; uma geração mais nova permanece intacta. BH2: leitura de getState passa por requireSynchronous e valida contador antes de iniciar trabalho.
- BH4/EC2: congelamento privado do frame usa WeakSet por chamada; preserva imutabilidade/referências compartilhadas sem alterar primitives. A regressão de 16.565 visitas para 106 identidades falhou antes e passa com limite estrutural de três visitas por identidade, sem timeout.
- BH8/BH9/VG1/VG2: acrescentadas provas de retornos malformados, merge real de dois grupos com snapshot pré-merge conservado, supressão durante espera de alias e cancelamento reentrante no navigate. A seleção do grupo do teste usa ID explícito, não posição dependente da ordenação.
- Sete testes acrescentados; quatro falhas de asserção antes dos patches produtivos (duas expõem BH1), depois 34/34 no recorte de Busca/Notícias/integração. Todos os patches foram resolvidos; dois diferidos documentados, sem nova decisão de intenção.
- Build local concluído, especificação done e Story em review para revisão humana **desta fatia**. Não conclui a Story integral/Épico 7, não fecha gates e não implementa UI/Cesium. Sem commit/push automático, conforme escopo aprovado; alterações de aceite 4.1 preservadas.

## Design Notes

Sem efeitos irreversíveis ou commit/push automático. Cancelar geração não substitui revalidar destino. Não refatorar primitives, ingestão ou publisher.

## Verification

- `node --test tests/search.test.mjs tests/exploration.test.mjs tests/exploration-contract.test.mjs tests/news.test.mjs` — matriz e regressões, zero falhas/skips.
- `npm test`, `npm run check`, `npm run demo:local`, `git diff --check` — regressões/sintaxe/demo/whitespace; nenhuma chamada externa.
- Resultado inicial da implementação: **59 testes direcionados e 125 totais**, zero falhas/skips; **55 módulos ESM** verificados em Node **v25.9.0**. Demo: `externalCalls: 0`, 3D/SAT e `persistEffects: []`. Diff completo (incluindo untracked) lido; alterações preexistentes de aceite 4.1 preservadas. Um espaço em branco extra no fim dos diferidos foi detectado e removido antes da verificação inicial.
- Verificação final do Lead após revisão: **66/66 direcionados, 132/132 totais**, zero falhas/skips; **55 módulos** válidos em Node **v25.9.0**. Demo novamente executado: `simulation: true`, `externalCalls: 0`, URL canônica `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`. A matriz inteira e as regressões CR-01/4.1 rodaram, sem filtros. `git diff --check` sem erros.
