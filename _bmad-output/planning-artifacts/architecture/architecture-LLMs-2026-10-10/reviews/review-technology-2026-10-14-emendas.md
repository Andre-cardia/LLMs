# Revisão de tecnologia — emendas de 14/10/2026 (AD-9, Structural Seed, implantação, Q2)

- **Data:** 2026-10-14
- **Escopo:** [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md) (AD-9, Structural Seed, diagrama de implantação, Deferred Q2), [technology-evidence.md](../technology-evidence.md) (seção "Emenda de 14/10/2026") e as últimas entradas de [.memlog.md](../.memlog.md).
- **Método:** cada afirmação de tecnologia emendada foi conferida em documentação primária da AWS buscada hoje (14/10/2026). Também conferi a realidade do repositório (`amplify.yml`, `customHttp.yml`, `package.json`). Nenhum arquivo foi editado além deste relatório.

## Veredito: **CONCERNS**

As escolhas de tecnologia existem e se comportam, no essencial, como o texto diz. Quatro pontos, porém, estão desatualizados, incompletos ou sem evidência. Nenhum invalida o AD-9, mas dois deles (escopos e `aud`) mudam o desenho concreto da autenticação e precisam ser fechados antes das stories de infraestrutura.

## 1. Rastreabilidade: o que foi verificado e o que só foi afirmado

| Afirmação no spine/memlog | Evidência na emenda? | Conferido hoje | Resultado |
| --- | --- | --- | --- |
| JWT authorizer valida assinatura via JWKS, `iss`, `aud`/`client_id`, `exp`, escopo | Sim, fonte primária | [API Gateway JWT authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html) | Correto, mas incompleto quanto ao Cognito (achados A e B) |
| Lambda `nodejs24.x`, AL2023, depreciação em 30/04/2028 | Sim, fonte primária | [Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) | Correto |
| Amplify access control = só senha básica | Sim, fonte primária | [Amplify access control](https://docs.aws.amazon.com/amplify/latest/userguide/access-control.html) | Correto (por branch **ou global**) |
| `amplifyapp.com` não pode ser desligado | Só fonte secundária (DevelopersIO 2024) | [Amplify Firewall (WAF)](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started-using-waf.html) | **Desatualizado/impreciso** (achado C) |
| User pool sem auto-cadastro | **Não**: não está na tabela nem no memlog `(version)` | [AdminCreateUserConfigType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUserConfigType.html) | Correto, mas a evidência não foi registrada (achado E) |
| App client público, authorization code + PKCE, sem secret | **Não** | [App clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html), [Authorize endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html) | Correto, mas a evidência não foi registrada (achado E) |
| S3 privado com Block Public Access, sem URL pública nem presigned | **Não** | [S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) | BPA está correto; "sem presigned" não é garantido pelo BPA (achado D) |
| `customHttp.yml` só com cache/referrer (memlog) | Observação do código | [Amplify custom headers](https://docs.aws.amazon.com/amplify/latest/userguide/custom-headers.html), [Setting custom headers](https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html), arquivo `customHttp.yml` | Correto e vigente (ponto F) |
| CORS só aceita a origem do ambiente | Não | [HTTP API CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html) | Viável; há um detalhe com o authorizer (ponto G) |

Conclusão de processo: a entrada `(version)` do memlog e a tabela da emenda cobrem só o API Gateway, o Lambda e o Amplify. **Cognito e S3, metade da cadeia do AD-9, foram afirmados sem evidência registrada.** As afirmações estão corretas, mas isso foi confirmado por esta revisão, e não pela emenda.

## 2. Achados

### A. `aud`/`client_id`: o access token do Cognito normalmente **não tem `aud`** (impacto alto)

- Segundo [Understanding the access token](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-access-token.html), o access token do Cognito traz `client_id` (o app client). O `aud` aparece "somente se a aplicação pediu um [resource binding](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html#cognito-user-pools-resource-binding)". Nesse caso, `aud` passa a ser a URL do recurso, e não o client id.
- O [JWT authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html) valida `client_id` **apenas se `aud` estiver ausente**. Quando os dois estão presentes, ele avalia `aud`.
- O ID token do Cognito tem `aud` = client id. Um authorizer configurado com `Audience = <client id>` aceita, portanto, **ID tokens e access tokens**. A própria página do API Gateway alerta que "não há mecanismo padrão para diferenciar access tokens de ID tokens" e recomenda exigir scopes.
- A frase do AD-9, "valida … `aud`/`client_id`", é tecnicamente verdadeira, mas ambígua: não diz qual valor vai em `Audience` nem como o ID token é recusado.

**Correção sugerida (AD-9):** "o `Audience` do authorizer é o ID do app client do ambiente, sem resource binding (o access token carrega `client_id` e não `aud`); se resource binding for adotado, `Audience` passa a ser a URL do recurso. ID tokens são recusados porque toda rota exige um escopo custom, que ID tokens não têm, e a Lambda também confere `token_use = access` e `client_id`, por defesa em profundidade." A emenda em [technology-evidence.md](../technology-evidence.md) deve citar a página de access token do Cognito.

### B. Escopo exigido por rota só existe se o login usar o authorization server (managed login + domínio) (impacto alto)

- Escopos custom vêm de um **resource server** do user pool e só entram no access token por meio dos endpoints OAuth (`/oauth2/authorize` → `/oauth2/token`). Isso exige um **domínio do user pool** e managed login/hosted UI ([Scopes, M2M, and resource servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html); [App clients, "To integrate these OAuth grants in your app, you must add a domain"](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)).
- O login pela API/SDK (`InitiateAuth`, por exemplo SRP em formulário próprio) gera um access token com **somente** `aws.cognito.signin.user.admin`. Nesse caminho, um escopo custom por rota é impossível, e `aws.cognito.signin.user.admin` não deve ser usado como escopo de API, porque autoriza a autogestão do usuário no Cognito.
- O AD-9 já diz "authorization code + PKCE", o que aponta para o caminho certo, mas não fixa que o login **precisa** passar pelo managed login com domínio, nem que é preciso criar um resource server com escopos como `<api>/read` e `<api>/write`. Um implementador que use um formulário próprio com o SDK quebra a regra sem perceber.
- Detalhe verificado no [Authorize endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html): o Cognito só aceita PKCE com `S256`. A recomendação oficial para clients públicos é habilitar **só** o code grant e desligar o implicit.

**Correção sugerida (AD-9 e Q2):** "login exclusivamente via managed login do user pool (domínio por ambiente), `response_type=code`, PKCE `S256`, implicit grant desligado no app client; resource server com escopos custom de leitura e mutação, associados ao app client; nenhuma rota aceita `aws.cognito.signin.user.admin`." Acrescentar ao Q2: o domínio do user pool por ambiente e o callback/sign-out URL de cada ambiente (HTTPS obrigatório, exceto `http://localhost`).

### C. "O domínio `amplifyapp.com` não pode ser desligado" está desatualizado e tem fonte secundária (impacto médio)

- O domínio padrão de fato não pode ser removido. Porém, a documentação primária do Amplify mostra que a integração com AWS WAF tem a opção **"Restrict access to amplifyapp.com"** ("to prevent access to your app on the default Amplify domain"): [Enabling AWS WAF for an Amplify application](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started-using-waf.html). O web ACL vale para todos os domínios e branches do app, e é possível usar regras por header `Host` ([How Amplify integrates with AWS WAF](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-waf-configuration.html)). O WAF tem custo próprio ([Firewall pricing](https://docs.aws.amazon.com/amplify/latest/userguide/waf-pricing.html)).
- A emenda cita só o [DevelopersIO 2024](https://dev.classmethod.jp/articles/tsnote-amplify-how-do-i-disable-the-default-domain-for-amplify-hosting-en/), que é secundário e anterior a esse recurso de console.
- A conclusão do AD-9 continua válida (a origem padrão só serve código, e o CORS da API não a aceita), mas a premissa factual está errada, e a decisão fica mal registrada: "não dá" virou, na prática, "dá, com WAF pago, e escolhemos não fazer".

**Correção sugerida:** no AD-9 e na emenda, "o domínio padrão `amplifyapp.com` não pode ser removido; pode ser bloqueado com AWS WAF (opção 'Restrict access to amplifyapp.com', custo adicional). Não é necessário bloqueá-lo porque ele só serve código; se houver domínio próprio, o CORS aceita só ele." Trocar a fonte pela documentação do Amplify. Se não houver domínio próprio, a origem do ambiente **é** `https://<branch>.<appid>.amplifyapp.com`, e essa frase do AD-9 precisa dizer isso.

### D. "Sem presigned" não é imposto pelo Block Public Access (impacto médio)

- O [S3 Block Public Access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) está correto como descrito: as quatro configurações (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`), recomendadas no nível de conta e de bucket. Buckets novos já nascem sem acesso público.
- O BPA trata de ACLs e políticas públicas. Uma **URL presigned** é assinada por um principal da própria conta (por exemplo, o papel da Lambda) e **continua funcionando com o BPA ligado**. "Sem presigned" é, portanto, uma regra de código que o BPA não garante.
- Para tornar a regra verificável, use uma bucket policy com `Deny` quando `s3:authType = REST-QUERY-STRING` (ou um limite em `s3:signatureAge`), como em [Amazon S3 Signature Version 4 authentication specific policy keys](https://docs.aws.amazon.com/AmazonS3/latest/API/bucket-policy-s3-sigv4-conditions.html), além de um papel IAM da Lambda com o mínimo de ações e prefixos.

**Correção sugerida (AD-9):** "S3 privado: BPA com as quatro opções ligadas na conta e no bucket, ACLs desabilitadas (Object Ownership = BucketOwnerEnforced) e bucket policy que nega `s3:authType = REST-QUERY-STRING`; acesso só pelo papel da Lambda." Acrescentar ao Q2: a prova de que uma URL presigned é recusada.

### E. Cognito e S3 sem evidência registrada (impacto de processo)

As afirmações sobre o Cognito estão **corretas**, confirmadas hoje:
- `AllowAdminCreateUserOnly = true` desliga o `SignUp` self-service ([AdminCreateUserConfigType](https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUserConfigType.html)).
- Um public client "não tem client secret". Ter ou não secret **não pode ser mudado depois da criação**, e o console cria clients com secret nos tipos "Traditional web application" e "Machine-to-machine" ([App clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)).
- Authorization code + PKCE é a recomendação para clients públicos ([App clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html); [Authorize endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html)).

Mesmo assim, nada disso aparece na tabela da emenda nem na entrada `(version)` do memlog.

**Correção sugerida:** acrescentar linhas "Cognito user pool/app client" e "S3 BPA" à tabela da emenda com essas URLs. Registrar como armadilha de implementação: criar o app client como SPA/public (`GenerateSecret=false`), porque errar exige criar um client novo.

### Pontos verificados sem problema (com observações)

- **F. `customHttp.yml`: vigente.** A documentação atual oferece **dois** mecanismos: o console (Hosting → Custom headers) e o `customHttp.yml` na raiz. Quando os dois existem, **o `customHttp.yml` prevalece sobre o console** ([Setting custom headers](https://docs.aws.amazon.com/amplify/latest/userguide/setting-custom-headers.html)). O mecanismo descontinuado é o de headers dentro do `amplify.yml`/buildspec ([Custom headers](https://docs.aws.amazon.com/amplify/latest/userguide/custom-headers.html)). O repositório usa `customHttp.yml`, e o `amplify.yml` não tem headers, então o arranjo está correto. Uma observação para Q9: CSP e cabeçalhos de segurança (`connect-src` incluindo a API e o domínio do Cognito) devem ir no `customHttp.yml` versionado e não no console, para não serem sobrescritos silenciosamente. O Amplify aplica `Cache-Control` custom só a respostas 200.
- **Lambda `nodejs24.x`: correto.** AL2023, depreciação em 30/04/2028, bloqueio de criação em 01/06/2028 e de atualização em 01/07/2028 ([Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)). O alinhamento com o repositório confere: `package.json` tem `engines.node >=24.0.0` e o `amplify.yml` usa `nvm install 24`. Para informação: `nodejs26.x` está em public preview, fora do SLA, com GA prevista para novembro de 2026. Não deve ser adotado agora.
- **Detalhes corretos do JWT authorizer:** só RSA (o Cognito usa RS256), cache de chave por até 2 h com período de graça na rotação, `kid`/`nbf`/`iat` também validados, e as claims chegam à Lambda em `event.requestContext.authorizer.jwt.claims`. Atenção: o exemplo CloudFormation dessa mesma página usa **implicit grant e token em query string** (`$request.querystring.access_token`) e `nodejs18.x`, que já está depreciado. Ele contradiz o AD-9 e não deve ser copiado. A identity source deve ser `$request.header.Authorization`.
- **G. CORS em HTTP API:** com CORS configurado, o API Gateway responde ao preflight sozinho e **ignora os headers CORS devolvidos pela Lambda**. Se o authorizer estiver na rota `$default`, é preciso uma rota `OPTIONS /{proxy+}` sem autorização ([HTTP API CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html)). Recomendação: `AllowOrigins` com a origem exata do ambiente, nunca `*` nem `https://*`, e a validação de Origin/CSRF das mutações mantida na Lambda, como o AD-9 já exige.
- **Diagrama de implantação:** coerente com o AD-9. Sugestão: a seta `COGNITO -. JWT .-> API` sugere que o Cognito fala com a API. Na realidade, o navegador obtém o token e o envia à API, e o authorizer só busca o JWKS do Cognito. Representar como `OWNER -->|Bearer access token| API` e `API -. JWKS .-> COGNITO`.
- **Q2:** o estreitamento é coerente. Faltam três itens: o domínio do user pool e os callbacks por ambiente (achado B), a decisão sobre WAF ou domínio próprio (achado C) e a prova de recusa de presigned, ID token e token sem escopo (achados A, B e D). DynamoDB com escrita condicional e EventBridge Scheduler continuam corretamente marcados como candidatos não verificados.

## 3. Resumo das correções

1. AD-9: fixar `Audience` = client id do app client, sem resource binding; recusar ID token por escopo obrigatório e conferir `token_use=access` e `client_id` na Lambda. Citar a página de access token do Cognito.
2. AD-9: login só por managed login com domínio do user pool, code grant + PKCE `S256`, implicit desligado, resource server com escopos custom; proibir `aws.cognito.signin.user.admin` como escopo de rota.
3. AD-9 e emenda: trocar "não pode ser desligado" por "não pode ser removido; pode ser bloqueado via AWS WAF, o que não fazemos porque ele só serve código", com fonte primária do Amplify.
4. AD-9: o S3 "sem presigned" passa a ser imposto por bucket policy (`s3:authType`), com ACLs desabilitadas e BPA na conta e no bucket.
5. Emenda e memlog: registrar a evidência de Cognito e S3. Q2: acrescentar domínio/callbacks, decisão sobre WAF e as provas negativas.
