# Custo por tarefa — base local

Esta fatia implementa a base do FR-11; a Tabela de modelos e seu ⓘ ainda aguardam integração com a UX. Todos os dados da demonstração são fictícios e ficam em `tests/fixtures/model-pricing.json`. Nenhuma execução busca preços ou lê `.env`.

No diretório do projeto:

```sh
npm test
npm run check
npm run demo
```

Sem instalação de dependências. A execução foi validada no Node instalado no Mac (25.9.0); ainda não foi validada em Node 24 LTS, navegador ou ambiente de produção. A escolha do runtime do produto continua na story de scaffold/infraestrutura.

## Contrato

`src/contracts/model-pricing.mjs` é a autoridade executável da cotação v1. Cada registro contém `schemaVersion: 1`, IDs opacos de família e variante, `inputUsdPerMillion`, `outputUsdPerMillion`, `reasoning` e proveniência (`source`, `sourceRecordId`, `sourceUrl`, `fetchedAt`, `observedAt`). Os dois preços pertencem à mesma fonte/registro; combinar fontes diferentes requer preservar suas proveniências em um contrato futuro. Este registro não substitui o schema completo do snapshot de Modelos.

Preços são strings decimais não negativas, com no máximo 256 caracteres, sem expoente ou separador de milhar. `null` significa ausência; `"0"` significa zero informado. IDs/fonte têm até 256 caracteres; URL absoluta HTTPS sem credenciais até 4.096, sem controles, espaços ou barras invertidas. Datas UTC usam `Z` com segundos e, opcionalmente, três dígitos de milissegundos. O adaptador deve normalizar os formatos da fonte antes de validar. Campo extra, omitido, getter, propriedade não enumerável ou versão desconhecida falha explicitamente. A fixture inválida compartilhada verifica rejeição nas fronteiras produtora e consumidora.

O validador de formato não certifica atualização: horário futuro, envelhecimento, estado da fonte e precedência entre provedores continuam responsabilidades da ingestão/snapshot. A demo conserva a proveniência e os horários da fixture; não anuncia LIVE nem uma fonte real.

## Cálculo

`estimateStandardTaskCost` valida novamente na fronteira consumidora e retorna USD em string decimal exata, estado disponível/indisponível e perfil fixo de 2.000 tokens de entrada + 1.000 de saída. Fórmula: `(2000 × inputUsdPerMillion + 1000 × outputUsdPerMillion) / 1000000`. Inteiros escalados (`BigInt`) evitam arredondamento durante o cálculo. A apresentação futura decide o arredondamento visual.

Se um preço estiver ausente, o custo total é `null`, com os campos ausentes identificados. Modelos de raciocínio têm `approximate: true` e aviso de que tokens de raciocínio não estão incluídos. A futura UI usa `≈` para a estimativa e `—` para ausência, conforme PRD/UX.

## Decisões que podem esperar

Não há decisão indispensável de Andre nesta fatia. Antes das integrações afetadas, confirmar hospedagem/autenticação e custo real (Q2); orçamento e provedor de chat/busca e retenção do Histórico (Q1/Q7); e fontes de mapas/BACKBONES com preço/licença (Q4/Q6). Pesquisa de fontes/calendários de MERCADOS (Q5) e questões específicas da UX (Q3) ficam com as stories correspondentes. Não habilitar chamadas pagas, dados reais ou publicação com esses gates em aberto.
