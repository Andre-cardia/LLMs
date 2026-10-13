# Aceite humano — incremento local da Story 7.1

- Registro: 2026-10-13 (persistência da decisão tomada nesta conversa).
- Responsável: Andre.
- Especificação: [Busca e URL local](spec-7-1-busca-url-local.md).
- Base do incremento: `650e413bea8dbadd506f2fd2096e0267e462192e`.
- Escopo aceito: Busca local, revalidação de destinos, supressão e decisões de URL 1A + 2A, incluindo patches da revisão independente.

## Decisão

Após walkthrough e demonstração local solicitada, Andre respondeu **“nao precisa, ta aprovado”**, dispensando a proposta de página adicional de demonstração frontend. Isso confirma o aceite **da entrega local**, sem reivindicar UI integrada, autenticação real ou conclusão integral da Story 7.1.

## Evidência observada

- Sessão Empresa A → link Empresa B → refresh → URL sem `company`: retornou a `company-1`.
- `company=`: seleção `null` e serialização explicitamente vazia, sem persistir preferências.
- Notícia disponível: seleção `available`, Leitor em `news-1`.
- Ocultação simulada posterior: mesmo resultado antigo retornou `unavailable`, Leitor `null`; nova busca não retornou a notícia.
- Efeitos emitidos: `[]`. Cenários em memória, sem serviços externos.
- Verificação anterior ao aceite: 66 testes direcionados, 132 totais, 55 módulos ESM, sem falhas/skips. A verificação final para envio em 2026-10-13 repetiu `npm run validate`: 132 testes e 55 módulos aprovados.

## Limites e continuidade

- O incremento local está aceito; o acompanhamento da Story integral permanece `in-progress` pela integração de interface/acesso e pelos gates remanescentes.
- Os [diferidos](deferred-work.md), incluindo BH3 (porta síncrona versus adapter assíncrono) e BH5 (transporte/ordenação de remaps), permanecem registrados.
- A página adicional de demonstração não será criada.

## Autorização posterior de publicação

Andre solicitou separadamente **“commit local e git hub, deploy em produção”**. Essa solicitação autoriza versionar/enviar o incremento e publicar pelo processo de hospedagem existente. O build atual publica apenas o preview estático; não conecta automaticamente os módulos locais de 7.1 ao frontend nem fecha os gates do produto completo.

O build local `npm run build:ui:local` passou para `https://irisglobal.com.br`, sem incluir configuração Cesium local no pacote e sem expor seu token no registro. Sucesso do build não constitui prova de deploy: a conclusão da hospedagem deve ser verificada separadamente. Não remover proteção de acesso, criar nova hospedagem nem habilitar serviços pagos por este aceite.
