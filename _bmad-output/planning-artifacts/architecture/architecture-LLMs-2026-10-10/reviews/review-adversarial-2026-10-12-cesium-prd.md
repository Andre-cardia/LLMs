---
reviewer: adversarial_globe_divergence
date: 2026-10-12
verdict: pass
critical: 0
high: 0
medium: 0
low: 0
---

# Revisão adversarial — divergências do Globo Cesium

## Veredito

**PASS — não encontrei uma divergência de implementação que duas unidades pudessem introduzir obedecendo às regras atuais da spine.** Os comportamentos que continuam variáveis estão nomeados como gates Q3, Q6, Q8, Q9 e Q11 antes das stories afetadas.

## Escopo e método

Ataque focado nas regras AD-10, AD-13 e AD-17 da `ARCHITECTURE-SPINE.md`, confrontadas com FR-1, FR-31, FR-32, FR-38, FR-40 e §11 do PRD final, além dos contratos de estado. Para cada fronteira tentei descrever duas implementações incompatíveis que ainda cumprissem literalmente as regras. Não alterei a spine, o PRD, os contratos ou o código; este relatório é a única escrita.

## Cenários adversariais tentados

### Estado, base e URL

**Fork tentado:** unidade A mantém `base: MAPA|SAT` como estado canônico e URL `base`; unidade B mantém um estado independente de Vista/projeção e trata MAPA/SAT apenas como camadas, eventualmente restaurando 2D.

**Resultado:** o fork não satisfaz AD-10/Q11. A projeção é fixa em 3D, a base canônica é MAPA ou SAT, nenhum estado de produto seleciona Vista 2D, aliases legados têm migração descrita e a troca de base conserva câmera, Pontos, Relações, Filtros, seleção e Terminal. A linha herdada de FR-1 que ainda diz “a textura segue ... a Vista” não cria outro estado selecionável à luz desse contrato; a leitura compatível é a base MAPA/SAT e o tema. A base inicial continua aberta em Q6 e não permite divergir em stories antes de ser escolhida.

### Composição e transição fotorealística

**Fork tentado:** unidade A mantém imagery SAT por baixo do fotorealismo e mantém ambas as cargas ativas; unidade B substitui a cena/base e só recupera imagery SAT após falha ou zoom-out.

**Resultado:** não é uma divergência sem gate. AD-17 concentra a composição e propriedade das coleções em um único `GlobeSceneComposer`; os adapters de provider devolvem recurso, status e crédito sem alterar a cena. O comportamento observável é fixado: SAT em zoom amplo; detalhe fotorealístico automático quando há cobertura e zoom próximo; retorno a SAT ao afastar, sair da cobertura ou falhar o detalhe; geometria duplicada não é permitida. A viabilidade da composição com provider real, a receita por tema, thresholds/histerese e o fallback completo continuam explicitamente no Q6, que bloqueia as stories do Globo. Portanto, a escolha interna da técnica de composição pode ser refinada nesse gate sem permitir duas unidades consumidoras criarem contratos diferentes.

### Falha de base, camada e provider

**Fork tentado:** unidade A mantém MAPA/SAT escolhida e mostra a camada indisponível; unidade B troca automaticamente a base ou desativa a opção no seletor quando um provider falha.

**Resultado:** os resultados de falha que já estão decididos são comuns: falha em MAPA não seleciona SAT silenciosamente; falha do detalhe fotorealístico em SAT retorna à imagery SAT; indicação de indisponibilidade e uso interativo sem prefetch são obrigatórios. FR-32 também diz que base indisponível não aparece como selecionável. A definição dos providers obrigatórios/opcionais, disponibilidade por base e fallback restante está em Q6; comportamento de contexto/WebGL e fallback comum está em Q9. Ambos bloqueiam as stories dependentes. A alternativa ainda em aberto é, assim, uma decisão de gate documentada, não uma lacuna silenciosa entre módulos.

### Projeção de Empresas e relações

**Fork tentado:** a UI filtra Pontos, mas o renderer reavalia Camada/Etiqueta/Laboratório ou mostra arcos diferentes da projeção compartilhada.

**Resultado:** AD-10 atribui a um seletor/projeção comum o conjunto de Empresas elegíveis/visíveis, veda ao renderer recalcular os predicados de Camada/Etiqueta/Laboratório e exige que os renderers projetem as mesmas entidades. FR-31, herdado pela spine, define a elegibilidade dos arcos pelas Empresas visíveis e pelo filtro de relações. AD-17 preserva as intenções no store comum e não autoriza estado de filtro próprio no Cesium. Não encontrei um segundo proprietário válido para esses filtros.

## Gates explicitamente reconhecidos

- **Q3:** controles móveis, ordem/foco, contraste, teclado/toque/leitor de tela e redução de movimento.
- **Q6:** base inicial, composição/provedores/cobertura/licença, fallback e disponibilidade, créditos, credenciais, custos/quota, cache/Referer, temas, thresholds e histerese.
- **Q8:** semântica, precisão e evidência das localizações antes de dados reais.
- **Q9:** carregamento Cesium, assets/workers, WebGL, desempenho e fallback comum.
- **Q11:** migração compartilhada de store/URL; o contrato foi decidido, mas ainda requer implementação via AD-16.

Esses gates tornam os limites de decisão e os bloqueios visíveis. Variantes de provider e desempenho não devem ser lidas como prova de integração aprovada; o PRD/addendum dizem explicitamente que a compatibilidade precisa ser validada antes das stories do Globo.

## Fontes examinadas

- `ARCHITECTURE-SPINE.md`, principalmente AD-10, AD-13, AD-16, AD-17 e Deferred Q3/Q6/Q8/Q9/Q11.
- `contracts.md`, seção “Estado de interface”.
- `implementation-readiness.md`, questões e bloqueios do Globo.
- PRD final `prd.md`, FR-1, FR-31, FR-32, FR-38, FR-40 e §11.
- Addendum `addendum.md`, §§F–H, especialmente composição SAT/fotorealismo e política de tiles.

Revisão documental; não executada integração Cesium, browser, provider, licenciamento, chave, benchmark ou teste de produto.
