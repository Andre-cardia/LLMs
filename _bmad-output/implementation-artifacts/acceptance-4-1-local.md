# Aceite humano — Story 4.1, escopo local

- Registro: 2026-10-12T22:56:06-0300 (momento de persistência; a decisão ocorreu anteriormente nesta conversa).
- Responsável pelo aceite: Andre.
- Escopo aceito: contrato/store/URL v2 de 4.1, incluindo o patch CR-01, com os itens diferidos preservados para as histórias consumidoras.
- Revisão do código demonstrado: `8149ff825a6f67ef3b8f58a7482549d3e3c30202`.
- HEAD no registro: `650e413bea8dbadd506f2fd2096e0267e462192e` (inclui posteriormente as configurações de Amplify, fora do escopo deste aceite).

## Decisão e autorização

Após walkthrough, pontos de atenção e duas demonstrações locais, foi perguntado: **“Você aceita o escopo local de 4.1, mantendo os itens diferidos para as próximas histórias?”** Andre respondeu **“sim”**.

O aceite foi inicialmente confirmado apenas na conversa. Depois, Andre respondeu **“sim”** à proposta de registrar o aceite no acompanhamento e iniciar o incremento local da Story 7.1. Este documento persiste essas decisões; não amplia o escopo aprovado.

## Evidência observada no walkthrough

1. `npm run demo:local`: execução bem-sucedida; `simulation: true`, `externalCalls: 0`, projeção `3D`, base `SAT`, aba `models`, empresa `company-2`, URL `?layers=cloud&base=SAT&tab=models&company=company-2` e `persistEffects: []`.
2. Chamada em memória do reducer com a fixture literal: troca SAT → MAPA preservou projeção 3D, empresa `literal-company`, painel `queue`, Terminal com token 1 e câmera pendente com token 3; efeitos retornados `[]`.

A suíte completa não foi reexecutada no walkthrough. Os 108 testes e 52 módulos verificados pertencem à evidência histórica pós-CR-01 na [especificação de 4.1](spec-4-1-store-bases-preferencias.md), na seção de fechamento do patch CR-01. As demonstrações não comprovam comportamento visual, desempenho de navegador ou serviços reais.

## Consequências para acompanhamento

- 4.1 passa a `done` **somente no escopo local aceito**; o Épico 4 permanece `in-progress`.
- Os [itens diferidos](deferred-work.md) continuam abertos, sem serem reclassificados como corrigidos por este aceite. CR-02/CR-08 e a semântica de URL/sessão devem ser reconciliados no planejamento de 7.1.
- 7.1 é a próxima ação local: investigar, especificar e obter aprovação antes de implementar. Sua conclusão integral ainda depende de interface/acesso e dos gates aplicáveis.
- Não há aceite de integração Cesium, câmera física, foco/teclado/toque, produção ou encerramento dos gates.
- O commit/push anterior das configurações Amplify foi autorizado separadamente. Seu sucesso não comprova deploy nem muda `production_authorized: false` no acompanhamento do produto.
