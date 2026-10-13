# Cesium: token local e avaliação de deploy — 2026-10-12

## Observado

Token “LLMs · Globo 3D local” criado na conta andrecardia após confirmação explícita. Escopo exclusivo `assets:read`, sem expiração, recursos 1, 3, 96188 e 2275207; URLs localhost e 127.0.0.1 na porta 8767. Valor omitido de relatórios, screenshots e código compartilhável. Configuração local ignorada pelo Git, permissão de arquivo 0600.

Browser Chrome: terreno, imagens e prédios 3/3; Google fotorealístico ativo; OpenAI selecionada; fonte de token marcada como project no DOM. Sem uso de token de avaliação. Créditos preservados.

API Cesium com o token real e Referer local: quatro endpoints `/v1/assets/{id}/endpoint` retornaram 200. Referer `https://deploy-check.invalid/`: 403. Recurso 2 fora da lista: 404. Corpos, endpoints assinados e credencial não foram registrados.

## Preparado e validado localmente

`scripts/build-ui-preview.mjs` e comando `npm run build:ui` geram o preview estático em dist/ui com token público e origem fornecidos pelo ambiente. Falham sem variáveis ou com origem local/HTTP; não copiam o token local. Ensaio com credencial sintética e origem HTTPS reservada passou; configuração sintética removida após teste. Todos os recursos HTML locais do mapa existem e os externos usam HTTPS. HTML working/promoted idêntico; sintaxe do JS e check do projeto (51 módulos) passaram.

A página busca configuração pública na nuvem, exige coincidência de origem e mantém política de Referer origin. Nenhum deploy, backend, API financeira, benchmark mobile ou atualização de plano executado.

## Conclusão e limite

Compatibilidade técnica de hospedagem estática HTTPS: proposta sustentada pelo pacote e documentação. **Não está validado na nuvem.** O token local bloqueia deliberadamente o domínio público. Necessários domínio/plataforma e token próprio restrito à origem; depois testar o mapa e cabeçalhos no deploy. URLs de preview diferentes precisam de credencial/origem própria; não liberar todos os domínios para contornar esse limite.

Licenciamento Community não presume autorização comercial ou distribuição externa: verificar plano com Cesium antes desse uso. Nenhuma credencial foi adicionada ao histórico Git ou enviada a terceiros além das chamadas ao próprio Cesium autorizadas pelo usuário.

## Fontes oficiais consultadas

- https://cesium.com/learn/ion/cesium-ion-access-tokens/
- https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/
- https://cesium.com/platform/cesium-ion/pricing/

## Produção IRIS Global: configuração concluída

Após a confirmação explícita de Andre, a UI do Cesium já mostrou **IRIS Global · produção** criado na conta. Foi reutilizado o token existente, sem criar duplicata. Confirmados assets:read exclusivo, sem expiração, Allowed URL https://irisglobal.com.br e recursos 1, 3, 96188, 2275207. Nenhuma alteração de plano ou permissão adicional.

Credencial salva em .env.production.local, ignorado pelo Git e com 0600; outras variáveis preexistentes preservadas. Pacote real emitido por `node --env-file=.env.production.local scripts/build-ui-preview.mjs` em dist/ui; appOrigin https://irisglobal.com.br; token de produção distinto e ausência do token/configuração local no pacote verificados. Tokens de cliente são públicos no artefato final, conforme documentado.

### Teste de autenticação contra API Cesium

Referer HTTPS do domínio: quatro endpoints de base com 200. Referer https://www.irisglobal.com.br/: terreno 200 pela regra de subdomínios. Referer HTTP do domínio, localhost e origem externa reservada: terreno 403 em todos. Corpos e credenciais não registrados.

Esses testes enviam Referer ao próprio Cesium e **não carregam a aplicação em um deploy real**. A UI final ainda precisa de validação hospedada, DNS/HTTPS e hospedagem escolhida. Última consulta DNS do domínio retornou NXDOMAIN; DNS não foi alterado. Usar a origem canônica sem www, com redirecionamento na hospedagem.
