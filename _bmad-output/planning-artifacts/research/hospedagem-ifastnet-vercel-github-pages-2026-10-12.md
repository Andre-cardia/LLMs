# IRIS Global — InfinityFree premium, Vercel e GitHub Pages

Data: 12/10/2026. Complemento ao [estudo PHP/MySQL](tradeoffs-php-mysql-2026-10-12.md). Status: estudo concluído e hospedagem escolhida pelo dono; nenhum plano contratado, conta alterada, pipeline configurado ou deploy realizado.

Andre delimitou três alternativas e informou que seus projetos atuais na Vercel estão caros. O repositório permanece no GitHub. A análise usa documentação pública dos fornecedores; não inspecionou faturas nem configurações de sua conta.

## Decisão do dono

**Andre decidiu manter a Vercel em 12/10/2026: “vamos manter a vercel”.** Vercel é a hospedagem selecionada para o IRIS Global, com o repositório no GitHub. Preservar o núcleo JavaScript atual, Artificial Analysis Light como entrada, Dark, templates e Cesium. A escolha não aprova reescrita PHP, define o banco ou retoma o deploy adiado.

A recomendação anterior deste estudo era validar primeiro a iFastNet; a decisão do dono substitui essa prioridade. As demais alternativas permanecem abaixo como referência. Na evolução da arquitetura para Vercel, registrar persistência, autenticação, jobs e custo incremental; o seed anterior de Cloudflare não constitui a escolha de hospedagem vigente.

GitHub é o local do código e do histórico; o servidor de produção pode ser de outro fornecedor. Não é necessário trocar de repositório para nenhuma dessas escolhas.

## Comparativo

| Aspecto | Premium indicado pela InfinityFree / iFastNet | Vercel | GitHub Pages |
| --- | --- | --- | --- |
| Perfil | Hospedagem compartilhada com cPanel | Plataforma com frontend, funções e outros serviços | Publicação de arquivos estáticos |
| PHP/MySQL | Recursos anunciados; confirmar versões e plano | PHP por runtime comunitário; MySQL depende de serviço de banco separado | Não executa PHP nem oferece MySQL para a aplicação |
| JavaScript atual | Frontend pode ser servido; Node.js anunciado, execução precisa ser validada | Integração adequada ao ambiente JS | Executa o JS do navegador, sem backend próprio |
| Agendamento | Cron anunciado; limites efetivos precisam ser confirmados | Hobby diário; Pro permite frequência por minuto | Não possui scheduler de aplicação; Actions é um serviço separado |
| Painel privado | Autenticação e proteção no servidor devem ser implementadas | Autenticação da aplicação deve ser implementada | Repositório privado não torna o site privado automaticamente |
| GitHub | Publicação por pipeline a implementar e validar | Integração automática com GitHub | Integração direta com repositório/Actions |
| Custos | Assinatura publicada, limites compartilhados e custos externos | Plano, consumo e serviços adicionais | Sem taxa separada do Pages nos planos elegíveis; backend continua externo |
| Melhor uso no IRIS | Candidata para aplicação integrada de baixo volume | Conveniência de publicação e backend JS, com controle de custos | Preview público ou documentação, sem dados privados |

As linhas de adequação são avaliações deste estudo; os recursos documentados estão citados nas seções seguintes.

## 1. O premium é da iFastNet

A InfinityFree direciona seus planos premium para a iFastNet. Sua página anuncia Super Premium a **US$ 4,99/mês**, cPanel, SSL e suporte a PHP, MySQL remoto e Node.js. São ofertas publicadas, não uma cotação contratual validada. [Oferta premium](https://www.infinityfree.com/premium/).

Há divergências entre páginas comerciais: o comparador antigo da iFastNet e a página atual de hospedagem exibem valores anuais diferentes. A página da InfinityFree também diverge no Ultimate. Confirmar valor inicial, renovação, ciclo, moeda e tributos no plano escolhido; não usar um preço anual promocional como mensalidade garantida. [Comparador antigo](https://ifastnet.com/portal/premium-hosting.html), [oferta atual](https://ifastnet.com/portal/sharedhosting.php).

A oferta atual lista PHP, MySQL, Node.js, cron e SSL. Também publica limites de conexões SQL, processos, CPU/RAM e I/O: “ilimitado” para disco ou tráfego não descreve capacidade ilimitada de execução. [Recursos e limites](https://ifastnet.com/portal/sharedhosting.php).

**O ponto decisivo:** suporte anunciado a Node.js abre a possibilidade de preservar o núcleo em JS e acrescentar MySQL. Não há motivo comprovado para reescrever em PHP somente para usar esse fornecedor. A forma de executar Node, as versões e os processos de fundo ainda precisam ser confirmados pelo suporte da iFastNet.

Para PHP/Laravel, confirmar PHP suportado, extensões, Composer ou publicação de dependências já construídas, raiz web em `public/`, permissões, comandos CLI e versão/engine do banco. A documentação comercial não prova disponibilidade de MySQL 8.4 ou PHP 8.5 em todo servidor.

Para automações, proponho comparar dois desenhos: worker supervisionado quando permitido, ou cron que processa uma fila persistente em lotes curtos e encerra. O segundo pode adaptar uma aplicação a hospedagem compartilhada, mas depende de tempo máximo, frequência e restrições do host. Ambos precisam conservar idempotência, reservas de orçamento, leases e revisão de publicação. Não tratar “tem cron” como prova de que um job completo funcionará.

Para chat, validar HTTPS externo, duração de requests, buffering e SSE. Um plano básico maior pode oferecer mais recursos sem mudar restrições de processos; upgrade deve responder a uma necessidade medida.

## 2. Vercel: conveniência e custo incremental

Vercel oferece publicação automática de repositórios GitHub e previews. Essa conveniência preserva nosso fluxo de desenvolvimento. [Integração GitHub](https://vercel.com/docs/git/vercel-for-github).

A página comercial anuncia Pro a partir de **US$ 20/mês**, com crédito de consumo, além de cobranças conforme recursos e adicionais. Como Andre já paga Vercel, não se deve atribuir automaticamente outra assinatura inteira ao IRIS: comparar o **custo incremental** do projeto e a fatura total da equipe. A causa do custo atual não foi investigada neste estudo. [Preços](https://vercel.com/pricing), [modelo de cobrança](https://vercel.com/docs/pricing).

Cron Hobby permite execução diária; Pro permite frequência por minuto. Execuções acionam funções e seguem seus limites/custos. O requisito financeiro de aproximadamente quinze minutos não cabe no cron nativo Hobby. [Cron e cobrança](https://vercel.com/docs/cron-jobs/usage-and-pricing).

PHP é possível por runtime comunitário, distinto dos runtimes oficiais. Minha avaliação é que Vercel não é a primeira candidata para uma aplicação convencional PHP/MySQL neste cenário de economia. [Runtimes](https://vercel.com/docs/functions/runtimes).

Spend Management pode alertar ou pausar produção, mas definir um valor sozinho não interrompe consumo. A pausa pode afetar todos os projetos da equipe, há atraso de verificação e despesas excluídas. Portanto, essa configuração merece uma decisão separada e não foi alterada. [Controle de gastos](https://vercel.com/docs/spend-management).

Para qualquer opção, coletar dados uma vez por janela e servir os resultados persistidos é uma proposta para controlar chamadas. Atualizar notícias e cotações a cada visita ao painel multiplicaria solicitações e custos de fontes/IA.

## 3. GitHub Pages: adequado ao preview estático

Pages publica HTML/CSS/JavaScript e aceita domínio próprio. Pode servir nossa interface e o Cesium, desde que a origem/token estejam configurados para o domínio e as condições de acesso sejam adequadas. **Não executa PHP ou o backend Node, nem substitui banco, agentes e APIs privadas.** [Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [limitação de linguagens](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

GitHub Free oferece Pages em repositórios públicos; planos elegíveis permitem publicá-lo a partir de repositórios privados. Isso é diferente de tornar o site privado: o controle nativo para publicação privada exige organização GitHub Enterprise Cloud. Não verificamos o plano da conta. [Disponibilidade](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [visibilidade](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site).

Nossa aplicação foi especificada como privada. Uma tela de login em JavaScript sobre arquivos públicos não protege esses arquivos. Hospedar frontend no Pages e backend na iFastNet é tecnicamente possível, mas adiciona origens, autenticação e operação; não vejo uma vantagem demonstrada para a primeira versão privada.

Actions pode construir/publicar arquivos; isso não transforma Pages em servidor contínuo. Pages também possui limites de tamanho e tráfego. Para um preview, publicar somente o pacote estático apropriado; dados privados e segredos ficam fora do artefato. [Limites](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Fluxo proposto a partir do GitHub

```text
Repositório GitHub → validação/build → artefato de release
                                    → publicação na hospedagem escolhida
```

Na iFastNet, confirmar acesso e protocolo seguro de transferência, depois construir um workflow que publique um artefato revisado e permita rollback. É uma proposta; não foi comprovada integração automática equivalente à da Vercel. Credenciais ficam em secrets do pipeline/ambiente, sem entrar no Git ou no bundle do navegador. Dependências PHP podem ser construídas no CI se o servidor não oferecer Composer, desde que haja compatibilidade com o runtime de produção.

Na Vercel, usar a integração Git já documentada. No Pages, usar o mecanismo próprio de publicação estática. Em todos os casos, preservar Artificial Analysis Light como entrada e os demais templates, manter ambiente de teste separado e configurar a origem canônica `https://irisglobal.com.br` apenas quando o deploy for retomado.

## Referência caso a decisão de hospedagem seja reaberta

Para a iFastNet, a consulta técnica deve especificar nosso caso: painel privado de um usuário, catálogo de cerca de 200 empresas, coleta financeira a cada quinze minutos no pregão, notícias/modelos em ciclos horários e futuro chat de IA.

Solicitar confirmação do plano sobre: versões PHP/Node e banco; engine transacional; execução CLI; cron e tempo máximo dos jobs; workers persistentes ou lotes finitos; requests externos/SSE; publicação segura a partir do GitHub; backups, retenção e restauração; limites e preço de renovação. Não foi enviada mensagem ao fornecedor.

Depois, executar a pequena prova de infraestrutura descrita no estudo PHP/MySQL. Se Node + MySQL atender, conservar as regras existentes. Se PHP for a melhor opção operacional, portar o backend progressivamente. Se o plano compartilhado não atender, reabrir a decisão de hospedagem antes de migrar o código.

O orçamento total deve separar hospedagem, IA, Cesium e fontes financeiras. A mensalidade de qualquer host não representa o custo completo do IRIS, e mover este projeto não reduz automaticamente o gasto dos outros projetos já na Vercel.

No BMad, a escolha da Vercel refina Q2. **[CA] Architecture — `bmad-architecture`**, em contexto novo, deve reconciliar a arquitetura com essa decisão e registrar as demais escolhas de produção. O estudo registra a hospedagem escolhida; a revisão completa da arquitetura e a implantação permanecem pendentes.
