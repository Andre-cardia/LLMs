# Fundações locais do Monitor Global de Labs de LLM

Este incremento implementa as stories locais 1.1, 1.2, 2.1, 3.2, 3.3, 4.1, 5.1 e 7.1. A story 3.1 (custo por tarefa) já existia. As stories não equivalem a épicos ou FRs inteiros concluídos: apresentação, Fontes reais e infraestrutura conservam os gates em `epics.md` e `local-plan.json`.

## Executar

- `npm test`: contratos, domínio, orquestração e adaptadores simulados.
- `npm run check`: sintaxe de todos os módulos ESM de src/scripts/tests.
- `npm run demo:local`: cenário integrado, dados fictícios e JSON de saída.
- `npm run demo`: demo anterior de preços, preservada.

Não há dependências npm, HTTP, SDK de Fonte, cron, servidor, credencial, implantação ou orçamento real. Node 25.9.0 é o runtime disponível no Mac; Node 24 LTS e browsers ainda precisam de validação no incremento correspondente. `example.invalid` identifica todas as evidências simuladas.

## Limite das provas

`MemoryControl`, `MemorySnapshots`, `MemoryCuration`, `MemoryNews` e `MemoryBudgetLedger` são adaptadores de um processo. Autorização injetada nega por padrão; símbolos usados nos testes representam dono/job/agente. Isso não prova JWT, CSRF, proteção de assets nem transação durável multi-processo. O publisher confirma catálogo curado, baselines e coleções por Fonte e recibo de Update numa transação de memória; CAS/fencing/rollback são exercitados nesse ambiente.

Slices inválidas/timeout conservam dados e horários anteriores. Negação explícita de acesso limpa o cache e impede a leitura composta. O leitor troca somente revisão inteira válida. Coleções completas vazias ou menores que metade do baseline comparável são rejeitadas. Notícias incrementais vazias são sucesso. Frescor é cálculo puro; ainda não existe scheduler/provider/calendário operacional.

O orçamento usa microUSD exatos e tetos zero por padrão. A porta de tentativa é simulada. Preço/limite desconhecido ou raciocínio sem limite verificável impede a tentativa. Reservas desconhecidas ficam comprometidas; overrun conserva gasto e exige reconciliação explícita autorizada com evidência simulada. Admissão real depende de Q1/Q7 e do teto autorizado.

Propostas não alteram Cadastro diretamente. Aprovação conserva a versão revisada; publicação posterior aplica alvos disjuntos e deixa conflitos staged. Evidência/fact dedup ignora novos horários de fetch; reenviar rejeitada precisa de Fonte independente. Reabertura por novo Modelo canônico e pares/logos reais dependem da integração correspondente. Compensação pós-publicação não é assumida automaticamente.

Notícias usam NewsId persistente e aliases exatos de URL/Fonte, sem similaridade de título. O índice conserva união de relevância/citação separadas. `LocalNewsView` compõe revisão do snapshot e feedback atual antes de retornar Terminal, Fluxo, LABS, NOTÍCIAS, Leitor, busca/navegação/contexto. Os utilitários puros pressupõem que o consumidor passe esse contexto. Confirmação cancelada não escreve; aliases conservam supressão owner-wide.

O reducer é a única transição semântica; URL não emite persistência, e ação explícita salva só o campo solicitado. Callbacks carregam token/revisão. O módulo não controla DOM, animação, teclado físico, WebGL, som ou foco real. Não substitui nem altera o protótipo UX.

## Próximas decisões documentadas

Q2: host/IdP, autorização do dono, custo, atomicidade durável e recuperação privada. Q1/Q7: provedor de LLM/busca, tetos, limites de raciocínio, política de Histórico e formato editorial. Q3: casos ainda abertos de Vistas 2D/SAT, controles móveis/foco, acabamento e benchmark do renderer. Q4/Q6: Fontes/licenças BACKBONES/tiles, custos e thresholds. Q5: cobertura e calendários por instrumento. Seed/logos precisam de evidência e curadoria, sem autorizar publicação por este demo.

Coleções normalizadas de Fontes/escopos diferentes conservam a união de famílias. IDs iguais com conteúdo diferente são conflito e conservam o conjunto publicado, sem escolher matching/precedência não decididos. O Leitor abre qualquer item elegível recebido por busca/navegação; limites de cinco/catorze/três se aplicam às listagens. Supressão inclui aliases antigos para proteger também um snapshot conservado após merge.
