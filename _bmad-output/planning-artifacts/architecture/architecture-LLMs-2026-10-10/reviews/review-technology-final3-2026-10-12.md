---
reviewer: architecture_tech_reality_check
lens: ".agents/skills/bmad-architecture/customize.toml — finalize reviewer 1"
date: 2026-10-12
verdict: pass
critical: 0
high: 0
medium: 0
---

# Revisão tecnológica final 3 — precisão editorial de Q6

**Veredito: aprovado quanto à precisão editorial.** Reli Q6 no `ARCHITECTURE-SPINE.md`, a tabela de gates/handoff em `cesium-integration.md` e a evidência em `technology-evidence.md`. Os três dizem que a orientação da Google recomenda chave da Map Tiles API restrita por IP e que Q6 adota essa restrição como gate do projeto. Nenhum atribui essa condição aos termos contratuais da Google.

A distinção é factual: a [FAQ oficial](https://developers.google.com/maps/faq) associa Map Tiles API a chave com restrição de endereço IP e explicita que restrições são opcionais, embora fortemente recomendadas. A [orientação oficial de segurança](https://developers.google.com/maps/api-security-best-practices) inclui Map Tiles API entre os serviços e recomenda proteção por IP para chaves de web service; para chamadas feitas por cliente browser sem SDK apropriado, remete a um fluxo seguro de chamadas client-side. Isso sustenta a recomendação citada, sem transformá-la em obrigação contratual.

Q6 também conserva o gate operacional: provar request path browser compatível com a restrição e os termos, ou selecionar provider alternativo. A página de [integração do renderer](https://developers.google.com/maps/documentation/tile/use-renderer) confirma CesiumJS e mostra chave no URL raiz, além de exigir créditos visíveis. Portanto Google continua candidato; a redação não afirma que a chave ou o fluxo foram testados nem aprova o provider. Nenhum finding permanece para esta revisão editorial.

## Fontes oficiais

- [Google Maps Platform FAQ — credenciais e restrições](https://developers.google.com/maps/faq)
- [Google Maps Platform security guidance](https://developers.google.com/maps/api-security-best-practices)
- [Work with a 3D Tiles renderer](https://developers.google.com/maps/documentation/tile/use-renderer)
