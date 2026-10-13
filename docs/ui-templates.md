# Templates do Monitor Global

A [galeria](../_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/mockups/templates.html) reúne os seis temas originais e a família padrão **Artificial Analysis**, com versões Light e Dark.

O [template padrão](../_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/mockups/prototype-artificial-analysis.html) tem navegação, cartões de métricas, tabela e painéis que acompanham o modo claro ou escuro. Globo, cotações, revisão e chat usam dados demonstrativos do protótipo local. Notícias reúne cinco matérias originais verificadas e as notícias demo anteriores. As preferências da nova versão ficam separadas das originais.

Na raiz do projeto LLMs, execute:

```sh
python3 -m http.server 8767 --bind 127.0.0.1 --directory _bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/mockups
```

Depois abra [o projeto no design padrão](http://127.0.0.1:8767/). A [galeria local](http://127.0.0.1:8767/templates.html) continua disponível.

Nos seis temas anteriores, o link **Design padrão ↗** no cabeçalho retorna ao Globo claro; ele também aparece no seletor de Tema. A aba Notícias usa manchete em destaque, lista editorial e coluna de empresas inspiradas no Yahoo Finance. O Globo inicia com cinza suave (`#ECEDEF`); o seletor **Fundo do Globo** compara esse tom com o cinza original e branco, salvando a escolha só nesta variante.

Abra [Artificial Analysis Dark](http://127.0.0.1:8767/prototype-artificial-analysis.html?mode=escuro) ou [Light](http://127.0.0.1:8767/prototype-artificial-analysis.html?mode=claro). O botão **Claro/Escuro** troca o modo mantendo a página; a escolha fica salva apenas para essa família, mas a próxima abertura padrão inicia em Light. A galeria tem oito opções. No escuro, o Globo usa textura noturna e compara cinza suave, cinza original e preto.

O contrato da variante está em [DESIGN.md](../_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/variants/artificial-analysis-light/DESIGN.md) e [EXPERIENCE.md](../_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/variants/artificial-analysis-light/EXPERIENCE.md). A [referência visual registrada](../_bmad-output/planning-artifacts/ux-designs/ux-LLMs-2026-10-09/imports/artificial-analysis-reference-2026-10-12.md) distingue cores medidas e fontes substitutas do preview.

O núcleo local também inicia com `artificial-analysis`, modo claro e tabela analítica, preservando preferências salvas dos temas antigos. Esta entrega atualiza o template local; não publica o produto nem conecta cotações ou chat a serviços reais. As cinco matérias originais têm links reais e fotos carregadas diretamente do CDN da fonte.

A [página Notícias](http://127.0.0.1:8767/prototype-artificial-analysis.html?tab=news) também reúne os 10 indicadores macro, amplitude/extremos, favoritos, 29 ações (seis em foco + 23 demais por setor) e 11 índices mundiais. Cada ação tem **Conversar sobre {ticker}**, que abre o diálogo próprio do futuro especialista em ações. As perguntas recebem uma resposta local de demonstração; não há integração de IA financeira.

Os cinco destaques usam as fotos das próprias matérias consultadas no Yahoo Finance em 2026-10-12, com crédito e link original. O vínculo artigo/imagem está em `mockups/assets/news-original-sources.js`; é um snapshot do preview, sem ingestão automática. Nas notícias demo sem fonte e em falha de imagem, aparece um placeholder. Filtrar manchetes não reduz os blocos financeiros.

A abertura padrão do projeto e a entrada direta sem `mode` usam **Artificial Analysis Light**, mesmo após usar Dark. O modo escuro continua disponível pelo botão e pelo link explícito; não substitui o padrão de abertura.

O botão **Mapa 3D · teste** abre um [protótipo Cesium separado](http://127.0.0.1:8767/prototype-cesium.html). Ele reúne 35 pontos do preview, busca/filtros, destaque da empresa, aproximação urbana, terreno, prédios OSM, vistas 2D/3D e fotorealismo Google opcional. O mapa carrega o token público de leitura da conta pela configuração local descrita abaixo; não usa a credencial de avaliação do CesiumJS. As coordenadas são demonstrativas e não comprovam endereço/campus. Artificial Analysis Light permanece a abertura padrão.

## Token Cesium local

O protótipo lê `mockups/assets/cesium-config.local.json` (excluído do Git) antes de iniciar o mapa. Use `cesium-config.example.json` como modelo. Sem configuração válida, mostra uma mensagem e não usa o token padrão do CesiumJS. O HTML envia a origem no Referer para validar as restrições de URL.

Token criado e verificado em 2026-10-12: **LLMs · Globo 3D local**, somente `assets:read`, recursos 1 (World Terrain), 3 (Bing Aerial with Labels), 96188 (OSM Buildings) e 2275207 (Google Photorealistic 3D Tiles). URLs permitidas: `http://127.0.0.1:8767` e `http://localhost:8767`. Não há permissões de escrita, perfil, tokens ou geocodificação.

Este é um token público de cliente: ele pode ser visto nas requisições do navegador. As restrições do Cesium limitam seu uso ao site e aos recursos selecionados. A exclusão do Git evita incluir a credencial da conta no histórico; não a torna um segredo de servidor. Ao publicar em outro domínio, crie um token separado restrito à origem de produção e mantenha esta configuração local fora do pacote publicado. Consumo segue as cotas do plano atual.

Referência: [Tokens e restrições no Cesium](https://cesium.com/learn/ion/cesium-ion-access-tokens/).

## Preparação para deploy do preview

**O token local não funciona na nuvem.** A origem pública precisa de um token próprio de leitura, restrito ao domínio HTTPS e aos mesmos quatro recursos. Com as restrições atuais, o endpoint de terreno retornou 200 para `http://127.0.0.1:8767/` e 403 para a origem de teste `https://deploy-check.invalid/`. Não houve deploy.

Configure no ambiente de build da hospedagem:

- `CESIUM_ION_PUBLIC_TOKEN`: token público `assets:read` de produção, com os quatro recursos e restrição à origem pública; não usar tokens privados ou o token local.
- `CESIUM_APP_ORIGIN`: origem HTTPS exata que servirá a página, sem caminho (por exemplo, `https://mapa.seu-dominio.com`).

Execute `npm run build:ui` e publique **`dist/ui`** como raiz do site estático. O script exclui a configuração local, gera `assets/cesium-config.json` a partir do ambiente e conserva a entrada Artificial Analysis Light e os templates antigos. Não publica automaticamente nem valida as permissões do token no Cesium. Sem variáveis ou com origem HTTP/local, interrompe o build. O build usa Node.js moderno, sem dependências de terceiros.

No domínio público, o mapa lê `assets/cesium-config.json` e confere `appOrigin` antes de usar o token. Em localhost, lê o arquivo `.local.json`, com fallback para a configuração pública quando ausente (a origem ainda precisa coincidir). O token de cliente aparece no JSON público e nas requisições; a segurança depende do escopo e das restrições do Cesium, não da variável de ambiente.

O arquivo `_headers` emitido recomenda `Cache-Control: no-store` para a configuração e `Referrer-Policy: origin` para o mapa. A aplicação desses headers depende da hospedagem; adaptar sua configuração equivalente quando necessário. A página também possui a política de Referer em `<meta>`. Evitar um override `no-referrer`, que impede a validação de origem do Cesium.

A SDK e suas dependências usam CDN HTTPS oficial, com versão 1.146 fixada. Se adotarmos bundler/self-hosting na aplicação final, servir Workers, ThirdParty, Assets e Widgets com `CESIUM_BASE_URL` definido, conforme o [Quickstart oficial](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/).

**Pendências para validar na nuvem:** hospedagem, DNS/HTTPS e teste real do carregamento das quatro bases, créditos, WebGL, falha de rede e cabeçalhos/CSP. Domínio e token de produção configurados na seção IRIS Global abaixo. O build de ensaio usou credencial sintética e não comprova execução hospedada. Uso comercial/distribuição externa e quotas precisam de adequação ao [plano/licenciamento Cesium ion](https://cesium.com/platform/cesium-ion/pricing/); nenhum upgrade foi feito.

### Domínio escolhido: IRIS Global

Andre definiu `irisglobal.com.br` em 2026-10-12. A origem canônica preparada é **https://irisglobal.com.br** e o modelo de variáveis está em `deployment/ui-production.env.example`. A hospedagem ainda não foi definida. Usar redirecionamento do endereço `www` para a origem canônica na hospedagem; o runtime confere a origem exata.

Token de produção verificado na conta Cesium como **IRIS Global · produção**, sem expiração, somente `assets:read`, quatro recursos (1, 3, 96188, 2275207), Allowed URL `https://irisglobal.com.br`. **Criação observada e configuração concluída após a confirmação de Andre.** A regra de URL do Cesium inclui os subdomínios do domínio configurado; a configuração do app continua limitada à origem canônica. O token local permanece separado. A credencial está salva em `.env.production.local` fora do Git, com permissão 0600, para o build local; na hospedagem, configurar as variáveis pelo seu gerenciador de ambiente.

Para gerar o pacote com esse arquivo local (depois de conter o token real): `node --env-file=.env.production.local scripts/build-ui-preview.mjs`. O pacote não foi publicado; o ensaio para a origem escolhida usou uma credencial sintética e sua configuração foi removida depois.

Em 2026-10-12, o build real para `https://irisglobal.com.br` foi gerado em `dist/ui` usando a configuração de produção. Os quatro endpoints do Cesium responderam 200 com Referer desse domínio; `www` também foi aceito pela regra de subdomínios. HTTP, localhost e outro domínio responderam 403. O token local não aparece no pacote. Isso valida a autenticação e o pacote, **não a renderização já hospedada**: ainda não houve deploy, e o runtime espera a origem canônica sem `www` (usar redirecionamento na hospedagem).
