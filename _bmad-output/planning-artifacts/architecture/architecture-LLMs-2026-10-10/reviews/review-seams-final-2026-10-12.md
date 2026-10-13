# Revisão adversarial final de fronteiras — spine CesiumJS

Data: 12/10/2026. Escopo: `ARCHITECTURE-SPINE.md` atualizado e seus fechamentos em AD-10/16/17 e Q6/Q8/Q9/Q10. Critério: formar pares de unidades um nível abaixo que respeitam literalmente os contratos e ainda podem divergir. `cesium-integration.md` e `contracts.md` foram lidos para conferir a amarração dos gates, sem tratar provas de runtime como concluídas.

Versão do spine examinada: SHA-256 `2ca13c6741eca36a1723bd7972ab332eeea7f2c05e34e23a1408c9e2f89e5c6e`.

**Veredito: PASS documental condicional para fundação e fixtures sintéticas; Q6 e Q9 precisam entregar resultados compartilhados revisáveis antes das stories independentes do renderer.** Não encontrei achado crítico ou alto. AD-10, Q8, Q10 e as regras de credenciais fecham as divergências anteriores no contrato; persistem duas brechas médias de especificação nos gates Q6/Q9. O ciclo de vida está coberto pelo companion, mas a regra não está amarrada ao AD-17.

## Fechamentos conferidos

### Filtros e formas da projeção — fechado por AD-10/16/17

AD-10 agora atribui ao seletor/projeção comum o cálculo único das Empresas elegíveis/visíveis e proíbe os renderers de reavaliar predicados de Camada, Etiqueta ou Laboratório (spine, linha 100). AD-17 exige que o adapter receba essa projeção e não recalcule filtros (linha 142); AD-16 exige schemas e fixtures antes de stories independentes da fronteira (linha 136).

O par antigo — uma `GlobeProjection` filtrando IDs e um `CesiumLayerAdapter` filtrando de novo — já viola a regra. Também não encontrei um par restante de formas de payload com autorização para ser decidido por cada renderer: o schema executável e as fixtures são gate. A decisão deve incluir a projeção do Globo na fronteira compartilhada, em vez de deixar seu formato como um objeto local do adapter; AD-17 e AD-16, lidos juntos, apontam para esse resultado.

### Classes e representação geográfica — fechado condicionalmente por Q8

Q8 exige mapear cada classe de localização para ponto, região ou omissão, elegibilidade para seleção e limite de aproximação de câmera (spine, linha 213); AD-17 exige que a projeção entregue a classe visual aprovada, sem inferência do adapter (linha 142); `contracts.md` põe schema e mapeamento em `src/contracts/`.

Após Q8 ser fechado e compartilhado, o par “omitir aproximações” versus “desenhá-las como região incerta” deixa de ser uma escolha independente de duas unidades. Até então, somente fixtures sintéticas podem passar pela fronteira. Não há achado documental aberto nesta dimensão.

### Credenciais — fechado como política; modelos específicos seguem no gate Q6

AD-17 separa credenciais privadas/de escrita, que nunca chegam ao browser, de credenciais públicas do cliente, específicas de app/ambiente, restritas e monitoradas (spine, linha 142). Q6 exige modelo, escopo/restrição aplicável, custo/quota e monitoramento por provider (linha 212). Um provider pode precisar de token público restrito e outro de credencial servida por mecanismo próprio; isso é uma decisão por provider, não uma licença para adapters usarem ou exporem segredos privados.

O modelo específico continua pendente de Q6, mas a política compartilhada já impede um adapter de browser e um adapter de servidor de tratarem uma credencial privada de modo incompatível. Nenhum achado aberto nesta dimensão.

### Escopo — fechado por Q10 e AD-17

Q10 decide manter as funções do Globo e integrar 2D/3D, terreno, edifícios e fotorealismo, sem controles de voo por Empresa/região do protótipo (spine, linha 215). AD-17 manda manter os fluxos de câmera da UX e o seletor/store compartilhado (linha 142). Dois adapters não podem reintroduzir controles locais ou substituir os filtros do produto sem violar essas regras. A escolha de providers e a habilitação permanecem corretamente atrás de Q6/Q9.

### Autoridade da cena — fechada; receita e comportamento de falha continuam dependentes de Q6

AD-17 resolve quem compõe: existe um único `GlobeSceneComposer`, dono das coleções de imagery/terreno/edifícios; adapters de provider devolvem recurso, status e créditos sem mutar a cena (spine, linha 142). Isso fecha a divisão anterior em que o compositor e cada provider poderiam acrescentar bases ou overlays por conta própria.

O que ainda precisa ser escrito antes das stories está detalhado em S1. A frase “receita única por Vista/tema” dá a autoridade, mas o spine não especifica o artefato compartilhado nem a matriz de transições e atribuição que esse compositor executará.

## S1 — Média: Q6 não fixa a forma canônica da receita nem todos os resultados de falha/atribuição

**Evidência:** Q6 manda definir uma receita única por Vista/tema, opções e fallback (spine, linha 212), mas não declara que a receita aprovada será schema/fixture executável em `src/contracts/`, nem define disponibilidade por falha de camada opcional ou a regra de atribuição derivada dos recursos efetivamente ativos. AD-16 dá autoridade para schemas de fronteira (linha 136) e AD-17 dá um compositor (linha 142), mas nenhum nomeia essas saídas de Q6 como fronteira compartilhada.

**Par permitido enquanto o gate ficar apenas como prosa:** um `GlobeSceneComposer` trata terreno como opcional; em SAT, sua falha mantém imagery e mapa disponíveis com terreno plano. Outro `GlobeSceneComposer` trata terreno como requisito daquela composição; na mesma falha, marca SAT indisponível e não o oferece no seletor. Ambos têm um só compositor, recebem status do provider, aplicam fallback e não permitem mutação da cena pelo provider. Também podem exibir créditos de todos os providers elegíveis para a Vista ou somente dos recursos carregados/ativos; Q6 exige crédito visível e acessível, mas não define qual conjunto o crédito representa.

**Aperto recomendado:** fazer Q6 produzir uma única matriz compartilhada por `(Vista, tema)` antes de stories independentes: base e overlays em ordem, camadas requeridas/opcionais, fallback e estado de disponibilidade em cada falha, recuperação, além da origem dos créditos quando um recurso falha, é opcional ou deixa de estar ativo. Registrar a receita e suas fixtures em `src/contracts/`; o compositor consome essa saída e uma projeção acessível de atribuições acompanha os recursos de fato usados. Isso torna testável a promessa “receita única”, sem escolher aqui providers nem licenças.

**Prova de implementação a exigir:** fixtures para provider carregado, indisponível, quota excedida e camada opcional; permutar inicialização/falha não duplica ou troca camadas silenciosamente, habilita somente Vistas aprovadas e mantém crédito correto, acessível e no tema/mobile.

## S2 — Média: Q9 nomeia a prova de WebGL, mas não exige um contrato de estado/fallback revisável

**Evidência:** Q9 exige validar navegador/dispositivo-alvo, perda/indisponibilidade de WebGL, degradação/fallback e habilitar somente Vistas aprovadas (spine, linha 214). Não pede que o resultado da spike fixe uma matriz de suporte ou o estado apresentado ao usuário quando WebGL não inicia ou o contexto se perde durante uso.

**Par permitido:** um `GlobeRenderer` que detecta WebGL indisponível inicia num fallback 2D, preserva seleção/filtros e oferece recuperação; outro `GlobeRenderer` desabilita a Vista Cesium e apresenta estado de indisponibilidade até recarga. Ambos podem demonstrar fallback/degradação no spike e deixar selecionáveis somente as Vistas que passaram. Sem uma condição de aceitação comum, a mesma classe de dispositivo e a mesma perda de contexto produzem interações diferentes.

**Aperto recomendado:** registrar como saída de Q9 a matriz de navegadores, dispositivos/GPU e estados suportados, além das transições observáveis para WebGL indisponível, contexto perdido/restaurado e recuperação. Fixar se o produto continua por fallback, desabilita a Vista ou pede recuperação, e preservar o estado semântico exigido pelo AD-10. Ligar habilitação de Vista e fixtures de estado a esse contrato antes do scaffold.

**Prova de implementação a exigir:** executar a matriz de alvos aprovada com WebGL ausente e contexto perdido/restaurado; conferir estado visível, seleção, filtros, navegação e habilitação de Vista, sem estado antigo reaparecer na recuperação.

## Ciclo de vida — coberto no companion, mas não vinculado explicitamente ao AD-17

**Par permitido se o implementador recebe só o AD-17:** um `GlobeRenderer` cria e destrói a instância Cesium e cancela/descarta subscriptions e cargas ao sair; outro mantém o viewer vivo ao trocar Vista/renderizador, substitui apenas algumas coleções e deixa resultados assíncronos antigos chegarem à cena. Ambos mantêm um compositor único para as coleções, não dão estado do produto aos providers e encaminham intents ao reducer.

`cesium-integration.md` regra 4 (linhas 54–56) já elimina esse par: subscriptions/eventos são removidos ao encerrar a Vista, cargas pendentes canceladas e não ficam listeners/requests após trocar aba/renderizador. Portanto, isto não conta como achado aberto se o companion for requisito normativo das stories. Para tornar a autoridade inequívoca, recomendo AD-17 referenciar explicitamente essa regra (ou incorporar o invariante), incluindo que uma conclusão assíncrona tardia não pode reaplicar recurso de Vista já encerrada. A lacuna restante é rastreabilidade e robustez contra conclusão tardia, não ausência total de requisito de descarte.

**Prova de implementação a exigir:** desmontar/trocar Vista durante carregamento e durante evento pendente; conferir listeners removidos, recurso liberado/cancelado ou resultado tardio ignorado e nenhuma duplicação ao voltar.

## Limites da revisão

Esta revisão é documental e somente leitura sobre spine/código. Não instalei Cesium, não editei spine/código e não executei testes, browser, benchmark, WebGL, chamadas a providers ou validação de credenciais. Q6, Q8 e Q9 permanecem gates; confirmar seus requisitos no texto não demonstra que providers, localizações ou fallback funcionem em runtime. A única escrita desta revisão é este arquivo.
