# Revisão de prosa — PRD Íris Global

Este PRD existe para ajudar Andre, a arquitetura e os futuros implementadores a definir e decompor a v1 do Íris Global, preservando o escopo pessoal aprovado.

**Modelo estrutural do passe anterior:** Strategic/Context (Pyramid). O passe anterior consolidou pontualmente o texto de FR-32 e FR-40; não moveu a §11 nem condensou o glossário, e não estabeleceu uma meta de redução líquida.

## Voz e escolhas a preservar

O texto usa português direto, requisitos numerados, consequências em listas e termos de produto capitalizados conforme o Glossário. Também preserva rótulos de interface em caixa alta, nomes originais e termos técnicos comuns como *zoom*, *cache* e *trackpad*. Essas escolhas ajudam a ligar requisitos às interfaces e devem permanecer. Mantive a avaliação restrita a trechos em que a formulação pode deixar uma ação ou referência ambígua.

## Achados

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| prose | FR-23: “O dono vê a Fila de revisão e, para cada proposta, aprova, edita e aprova, ou rejeita.” | “O dono vê a Fila de revisão e, para cada proposta, pode aprová-la sem alterações, editá-la e então aprová-la, ou rejeitá-la.” | Torna explícitas as três alternativas e deixa claro que a aprovação após edição é sequencial. |
| prose | FR-32: “Em SAT, a cena transita automaticamente para o conteúdo fotorealístico 3D ao aproximar em área coberta e quando sua Fonte estiver disponível. Ao afastar, sair da cobertura ou falhar a camada, volta à imagem de satélite.” | “Em SAT, ao aproximar em uma área coberta, o Globo transita automaticamente para o conteúdo fotorealístico 3D quando a Fonte de fotorealismo estiver disponível. Ao afastar, sair da área coberta ou ocorrer uma falha nessa camada, o Globo retorna à imagem de satélite.” | Substitui “sua Fonte” e “a camada” por referências explícitas e mantém claros os três gatilhos para voltar à imagem de satélite. |
| prose | FR-18: “A Faixa pausa quando o mouse está sobre ela; com reduzir movimento, todos os itens continuam acessíveis sem rolagem automática.” | “A Faixa pausa quando o mouse está sobre ela. Com a opção Reduzir movimento ativada, todos os itens continuam acessíveis sem rolagem automática.” | Corrige a construção “com reduzir movimento” e identifica Reduzir movimento como opção do sistema. |
| prose | FR-19: “A Faixa e o Painel MERCADOS mostram o horário da cotação e o aviso ‘Dados com atraso, apenas para fins informativos’. Horários indicam seu fuso; pregões respeitam o calendário da respectiva bolsa.” | “A Faixa e o Painel MERCADOS mostram o horário da cotação e o aviso ‘Dados com atraso, apenas para fins informativos’. Cada horário identifica o fuso utilizado; os pregões respeitam o calendário da respectiva bolsa.” | Remove a referência ambígua de “seu” e deixa claro que cada horário informa o fuso associado. |
| prose | FR-34: “Nos principais destaques de NOTÍCIAS, usar a imagem da própria matéria, com procedência/link original. Sem imagem vinculada ou em falha, manter título/Fonte/link e mostrar placeholder; uma foto da mesma Empresa não prova correspondência com a matéria.” | “Nos principais destaques de NOTÍCIAS, usar a imagem da própria matéria, com indicação de procedência e link original. Se não houver imagem vinculada à matéria ou se o carregamento falhar, manter o título, a Fonte e o link, e mostrar um placeholder; uma foto da mesma Empresa não prova correspondência com a matéria.” | Explicita que “em falha” se refere ao carregamento e troca as barras por uma enumeração mais fácil de interpretar. |

## Fechamento

- Recomendações deste passe: 5.
- PRD staged: 8.575 palavras, conforme `word_metrics.py`.
- Meta de extensão: não foi fornecida. As sugestões são correções de clareza e não buscam reduzir o documento; o passe estrutural anterior também não definiu redução líquida.
- Trade-offs de compreensão: nenhum. As mudanças mantêm os requisitos e tornam mais explícitas as referências, a sequência de ações e as condições de retorno ao SAT.
