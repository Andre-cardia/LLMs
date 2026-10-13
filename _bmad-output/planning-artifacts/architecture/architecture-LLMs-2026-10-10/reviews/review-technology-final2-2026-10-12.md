---
reviewer: architecture_tech_reality_check
lens: ".agents/skills/bmad-architecture/customize.toml — finalize reviewer 1"
date: 2026-10-12
verdict: partial
critical: 0
high: 0
medium: 0
resolvedMedium: 1
---

# Revisão tecnológica final 2 — ajuste de Q6

**Veredito: M1 fechado no contrato arquitetural; Google continua não aprovado até Q6 passar.** Reli o spine, `cesium-integration.md` e `technology-evidence.md` atuais. Q6 agora exige provar uma topologia compatível com uma chave de Map Tiles API restrita por IP e, se isso não funcionar com o renderer e os termos, manda adotar outro provider sem expor chave de serviço irrestrita no cliente. AD-17 também torna fail-closed a Vista cuja camada obrigatória não esteja disponível. Isso resolve a lacuna de desenho que eu havia registrado como M1; não demonstra que Google ou qualquer alternativa já esteja operacional.

## Reavaliação do M1 anterior

O achado anterior pedia um gate concreto para o caso de Google Photorealistic 3D Tiles: provar como proteger a credencial nos pedidos do renderer no browser, escolher outro provider se não houvesse caminho compatível e impedir o uso de chave de serviço irrestrita no cliente. A versão atual de Q6 contém essas três condições. O handoff repete o mesmo estado e conserva Google como candidato, enquanto `technology-evidence.md` registra que nenhuma chave foi lida/testada. Portanto, **o achado está resolvido como regra de arquitetura, não como validação do provider**.

### Precisão factual sobre a chave IP-restricted

A exigência de IP restriction é uma **recomendação de segurança do Google**, adotada por Q6 como condição do projeto. Na [FAQ oficial](https://developers.google.com/maps/faq?hl=en), a Google diz que restrições de chave são opcionais, mas fortemente recomendadas; sua matriz associa Map Tiles API a chave com restrição por endereço IP. A [orientação oficial de segurança](https://developers.google.com/maps/api-security-best-practices) trata essa API entre os serviços Web e recomenda proxy seguro, autenticado e que não repasse chamadas arbitrárias, quando uma aplicação cliente precisa acessar um web service sem SDK cliente adequado. Logo, o gate está alinhado à recomendação oficial e pode ser mais estrito que os termos do serviço; o relatório não deve dizer que a Google torna IP restriction um requisito contratual.

A preocupação concreta continua válida. A documentação de [Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles) exige chave e billing, e mostra a chave no URL raiz usado por CesiumJS; após esse pedido, o renderer busca os tiles seguintes conforme a navegação. A página de [integração com renderers](https://developers.google.com/maps/documentation/tile/use-renderer) confirma CesiumJS e exige exibição dos créditos. Uma chamada direta do browser expõe a chave e tem IP de origem do usuário. O caminho protegido pode exigir proxy servidor com IP permitido; essa configuração não foi testada e a seed Cloudflare continua apenas proposta. A regra fail-closed de Q6 evita tratar o exemplo de integração como aprovação de segurança.

## A capacidade de fotorealismo

**A capacidade escolhida não precisa ser retirada do escopo.** Ela é uma decisão de produto/renderer, não uma aprovação antecipada de Google, Cesium ion ou outra fonte. O spine mantém cada provider sujeito a Q6 e permite manter a base quando uma camada for opcional ou desabilitar a Vista compartilhada se uma camada necessária falhar. Assim:

- Google só pode ser aprovado depois da prova com a restrição escolhida, termos aplicáveis, billing, custos/quota, créditos dinâmicos e regras de cache.
- Se Google falhar no spike, Q6 exige alternativa compatível; não se deve enfraquecer a credencial para fazer o mock funcionar.
- Se nenhum provider aceitável estiver pronto, fotorealismo permanece inativo e a Vista que o exigir fica indisponível até Q6 aprovar uma fonte. Isso bloqueia ativação dessa Vista, não a baseline CesiumJS nem o restante do mapa.

As [políticas da Map Tiles API](https://developers.google.com/maps/documentation/tile/policies) impõem uso visual, créditos Google/data variáveis visíveis, respeito aos headers HTTP e restrições severas de armazenamento, cache, extração e offline; Q6 e AD-17 deixam crédito e política de cache sob os requisitos por-provider. São condições adequadas para o futuro gate e ainda não foram exercitadas na UI.

## Resultado e limites

- **M1 anterior:** resolvido pelo Q6 atual como critério explícito e fail-closed.
- **Achados novos:** nenhum bloqueio tecnológico novo no texto revisto. Pequena precisão editorial: referir-se a “restrição por IP recomendada pela Google e adotada como gate do projeto”, não a uma obrigação contratual da Google.
- **Estado de Google:** candidato; a compatibilidade técnica CesiumJS é confirmada, a credencial/topologia permanece não provada.
- **Estado da fotorealidade:** capacidade escolhida; provider e ativação continuam gate. Fallback de AD-17 dá saída se não houver camada obrigatória disponível.
- **Não executado:** teste com chave, proxy, egress fixo, billing, quota, pedidos reais, créditos no browser, CSP/cache ou termos da conta concreta. Sem isso, não aprovar provider.

## Fontes oficiais consultadas

- [Google Maps Platform FAQ — restrições de credenciais](https://developers.google.com/maps/faq?hl=en)
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)
- [Work with a 3D Tiles renderer](https://developers.google.com/maps/documentation/tile/use-renderer)
- [Map Tiles API Policies](https://developers.google.com/maps/documentation/tile/policies)
