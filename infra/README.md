# infra — camada autenticada (AD-9 / AD-26)

`auth-stack.yaml` é um template CloudFormation puro que cria, para **um** ambiente, o caminho autenticado do dono:

- **Cognito**: user pool em que só o admin cria usuários, domínio de prefixo com managed login v2, resource server `llms-api` (`read`, `write`) e app client público (sem secret, só authorization code, escopos `llms-api/read` e `llms-api/write`).
- **API Gateway HTTP API**: CORS só para `AppOrigin`, authorizer JWT (emissor do pool, `Audience` = client id) e três rotas, todas com `llms-api/read`: `GET /api/v1/whoami`, `GET /api/v1/snapshot` e `GET /api/v1/snapshots/{revision}/{slice}`.
- **Lambda** `owner-gate` (`nodejs24.x`, `arm64`): confere `token_use = access`, `client_id` e `sub` contra `OwnerSubs` e devolve `{ok:true, sub}`. Fora isso, devolve 403 genérico.
- **Lambda** `snapshot-reader` (`nodejs24.x`, `arm64`, AD-27): aplica a mesma regra de dono (importa o `owner-gate`) antes de qualquer leitura no S3. `GET /api/v1/snapshot` devolve o `ManifestResponse` (manifesto sem `objectKey`) da revisão corrente; `GET /api/v1/snapshots/{revision}/{slice}` devolve os bytes gravados da slice, sem reserializar. Só as três últimas revisões são legíveis; as outras, e as inexistentes, recebem 404. Respostas com `Cache-Control: private, no-store`. O papel só tem `s3:GetObject` em `manifest/*` e `slices/*` do bucket.
- **S3** privado de snapshots: os quatro bloqueios de acesso público, `BucketOwnerEnforced`, SSE-S3, versionamento e política que nega transporte sem TLS e URLs presigned. Só a `snapshot-reader` lê; nada escreve nele ainda.

**Layout do bucket** lido pela `snapshot-reader` (quem grava é o Publisher, sob Q2):

| Chave | Conteúdo |
| --- | --- |
| `manifest/current.json` | ponteiro `{schemaVersion: 1, revision, readableRevisions}`: a revisão corrente e as legíveis (no máximo 3, a primeira é a corrente) |
| `manifest/revisions/{revision}.json` | manifesto interno v2 da revisão (com `objectKey` de cada slice) |
| `slices/…` | bytes do envelope de cada slice; o `objectKey` do manifesto aponta para cá |

Sem `s3:ListBucket`, o S3 responde `AccessDenied` para chave ausente, e a Lambda trata isso como 404. Enquanto o bucket estiver vazio, `GET /api/v1/snapshot` responde 404.

Publicação no bucket, persistência de controle (DynamoDB) e agendador continuam sob Q2. O shell ainda não fala com a API: a porta HTTP (`src/ui/http-snapshot-port.mjs`) existe, mas a fonte do shell continua sendo `fixture-source` até o stack existir e o login ser ligado.

`prod` é outro stack criado do mesmo template, com outra origem e outro prefixo (AD-14). Os recursos levam `EnvironmentName` no nome, então os dois stacks convivem na mesma conta.

> Nenhum teste, build ou `npm` script aplica este template. Só os comandos abaixo, com a sua credencial, criam ou destroem recursos.

**Custo e pré-requisitos.** O user pool usa o plano **Essentials** do Cognito, necessário para o managed login v2, cobrado por usuário ativo no mês (veja [Amazon Cognito pricing](https://aws.amazon.com/cognito/pricing)); com um único dono o valor é baixo, mas não é zero, e cada ambiente é um pool. API Gateway, Lambda, CloudWatch Logs e S3 cobram por uso. A região escolhida precisa oferecer `nodejs24.x` e o managed login do Cognito.

## 1. Gerar o template

`auth-stack.yaml` é **gerado**. Edite `auth-stack.template.yaml`, `src/adapters/lambda/owner-gate.mjs`, `src/adapters/lambda/snapshot-reader.mjs` ou os módulos que ele importa e rode:

```sh
node scripts/render-auth-stack.mjs
```

O script embute cada handler no `ZipFile` da sua Lambda. O código vai inline, então o deploy não precisa de bucket de artefatos. O CloudFormation grava esse código como `index.js` (CommonJS), por isso a última linha `export {...};` vira `module.exports = {...};`.

- `owner-gate`: arquivo autossuficiente, sem `import`, `import()` nem `require()`, com até 4096 caracteres.
- `snapshot-reader`: o script empacota o handler com seus imports locais (`owner-gate.mjs`, `src/contracts/manifest.mjs` e `primitives.mjs`), cada módulo no próprio escopo. Só a forma `import {a, b} from './x.mjs';` é aceita; o único `require` permitido é `@aws-sdk/client-s3`, que o runtime `nodejs24.x` já traz. Teto de 32 768 caracteres.

Os tetos são nossos, bem abaixo do limite do `ZipFile` (zip de até 4 MB). `npm test` falha se o arquivo gerado estiver desatualizado.

## 2. Validar

```sh
uvx --from cfn-lint cfn-lint infra/auth-stack.yaml
npm run validate
```

## 3. Aplicar (exemplo `preview` em `us-east-1`)

```sh
export AWS_REGION=us-east-1
STACK=llms-preview-auth

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK" \
  --template-file infra/auth-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EnvironmentName=preview \
    AppOrigin=https://<origem-do-preview> \
    CognitoDomainPrefix=<prefixo-unico-do-preview> \
    OwnerSubs=''

aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name "$STACK" \
  --query 'Stacks[0].Outputs' --output table
```

- `AppOrigin` é a origem HTTPS do shell, sem barra final (por exemplo `https://preview.<seu-dominio>`). Ela alimenta o CORS da API, a callback `…/app/auth/callback` e o logout `…/app/`.
- `CognitoDomainPrefix` precisa ser único na região; o template recusa prefixos com `aws`, `amazon` ou `cognito` antes de criar qualquer recurso.
- Desenvolvimento local: de propósito, a callback aceita só `AppOrigin`, que precisa ser HTTPS, então o login não funciona com o shell em `http://localhost`. Por enquanto, a prova de autenticação é a chamada manual abaixo. Um parâmetro opcional de callback de desenvolvimento, só para `preview`, entra junto com a spec do PKCE no shell.
- Com `OwnerSubs` vazio, a primeira aplicação nega todo mundo. Esse é o comportamento esperado.
- Saídas: `ApiOrigin`, `CognitoDomain`, `UserPoolId`, `AppClientId` e `SnapshotBucketName`. Uma spec futura vai levar esses valores para a configuração pública do shell (AD-26). Não cole as saídas no repositório.

## 4. Criar o usuário dono e liberar o `sub`

```sh
POOL_ID=$(aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)

aws cognito-idp admin-create-user \
  --region "$AWS_REGION" \
  --user-pool-id "$POOL_ID" \
  --username <seu-email> \
  --user-attributes Name=email,Value=<seu-email> Name=email_verified,Value=true \
  --desired-delivery-mediums EMAIL

OWNER_SUB=$(aws cognito-idp admin-get-user \
  --region "$AWS_REGION" \
  --user-pool-id "$POOL_ID" \
  --username <seu-email> \
  --query "UserAttributes[?Name=='sub'].Value" --output text)

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK" \
  --template-file infra/auth-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides OwnerSubs="$OWNER_SUB"
```

O `deploy` reaproveita os parâmetros que você não passar de novo. A senha temporária chega por e-mail, vale 3 dias e é trocada no primeiro login do managed login. Se expirar, reenvie com `aws cognito-idp admin-create-user --region "$AWS_REGION" --user-pool-id "$POOL_ID" --username <seu-email> --message-action RESEND`. Para mais de um dono, separe os `sub` por vírgula.

**MFA.** No primeiro login, o managed login oferece cadastrar um app autenticador (TOTP). Em `prod` a MFA é obrigatória; em `preview` é opcional, mas cadastre também.

### Prova de ponta a ponta (opcional, manual)

Faça login pelo managed login (`<CognitoDomain>/oauth2/authorize` com `response_type=code`, PKCE `S256` e `scope=llms-api/read`), troque o code em `/oauth2/token` e chame:

```sh
curl -sS -H "Authorization: Bearer <access-token>" "<ApiOrigin>/api/v1/whoami"
# {"ok":true,"sub":"<seu-sub>"}
```

Com o mesmo token, `curl -sS -H "Authorization: Bearer <access-token>" "<ApiOrigin>/api/v1/snapshot"` responde 404 enquanto nada for publicado no bucket.

Um ID token, um token sem `llms-api/read` ou um `sub` fora da lista recebem 401 (do authorizer) ou 403 (da Lambda). Não guarde tokens em arquivos nem no histórico do shell.

## 5. Destruir

```sh
aws cloudformation delete-stack --region "$AWS_REGION" --stack-name "$STACK"
aws cloudformation wait stack-delete-complete --region "$AWS_REGION" --stack-name "$STACK"
```

- O bucket de snapshots tem `DeletionPolicy: Retain` e **fica** depois da exclusão do stack. Como o nome do bucket é fixo por ambiente, conta e região, **recriar o stack do mesmo ambiente falha** enquanto o bucket existir. Antes de recriar, ou apague o bucket (esvazie todas as versões e marcadores de exclusão, depois `aws s3api delete-bucket --bucket <SnapshotBucketName>`), ou traga-o de volta ao stack com uma importação de recurso do CloudFormation.
- Em `prod`, o user pool tem `DeletionProtection: ACTIVE`. Desative antes de excluir: `aws cognito-idp update-user-pool --user-pool-id <id> --deletion-protection INACTIVE`. Esse comando também redefine outros atributos não informados; confira antes de rodar.

## Permissões IAM da credencial do deploy

Use uma credencial de humano (não a da sessão de agente) com, no mínimo:

| Serviço | Ações |
| --- | --- |
| CloudFormation | `cloudformation:CreateStack`, `UpdateStack`, `DeleteStack`, `DescribeStacks`, `DescribeStackEvents`, `DescribeStackResources`, `GetTemplate`, `GetTemplateSummary`, `ValidateTemplate`, `CreateChangeSet`, `DescribeChangeSet`, `ExecuteChangeSet`, `DeleteChangeSet`, `ListStackResources` |
| Cognito | `cognito-idp:CreateUserPool`, `UpdateUserPool`, `DeleteUserPool`, `DescribeUserPool`, `SetUserPoolMfaConfig`, `GetUserPoolMfaConfig`, `CreateUserPoolDomain`, `UpdateUserPoolDomain`, `DeleteUserPoolDomain`, `DescribeUserPoolDomain`, `CreateResourceServer`, `UpdateResourceServer`, `DeleteResourceServer`, `DescribeResourceServer`, `CreateUserPoolClient`, `UpdateUserPoolClient`, `DeleteUserPoolClient`, `DescribeUserPoolClient`, `CreateManagedLoginBranding`, `UpdateManagedLoginBranding`, `DeleteManagedLoginBranding`, `DescribeManagedLoginBranding`, `DescribeManagedLoginBrandingByClient`, `AdminCreateUser`, `AdminGetUser`, `TagResource`, `UntagResource` |
| API Gateway | `apigateway:GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `TagResource`, `UntagResource` em `arn:aws:apigateway:<região>::/apis*` e `/tags*` |
| Lambda | `lambda:CreateFunction`, `UpdateFunctionCode`, `UpdateFunctionConfiguration`, `DeleteFunction`, `GetFunction`, `GetFunctionConfiguration`, `GetPolicy`, `GetRuntimeManagementConfig`, `AddPermission`, `RemovePermission`, `TagResource`, `UntagResource`, `ListTags` |
| IAM | `iam:CreateRole`, `DeleteRole`, `GetRole`, `UpdateAssumeRolePolicy`, `ListRolePolicies`, `ListAttachedRolePolicies`, `PutRolePolicy`, `DeleteRolePolicy`, `GetRolePolicy`, `TagRole`, `UntagRole` e `iam:PassRole`, restritos a `arn:aws:iam::<conta>:role/llms-*`, com `iam:PassedToService = lambda.amazonaws.com` |
| CloudWatch Logs | `logs:CreateLogGroup`, `DeleteLogGroup`, `PutRetentionPolicy`, `DeleteRetentionPolicy`, `DescribeLogGroups`, `TagResource`, `UntagResource`, `ListTagsForResource`, e para os logs de acesso da API: `CreateLogDelivery`, `GetLogDelivery`, `UpdateLogDelivery`, `DeleteLogDelivery`, `ListLogDeliveries`, `PutResourcePolicy`, `DescribeResourcePolicies` |
| S3 | `s3:CreateBucket`, `DeleteBucket`, `PutBucketPublicAccessBlock`, `GetBucketPublicAccessBlock`, `PutBucketOwnershipControls`, `GetBucketOwnershipControls`, `PutEncryptionConfiguration`, `GetEncryptionConfiguration`, `PutBucketVersioning`, `GetBucketVersioning`, `PutBucketPolicy`, `GetBucketPolicy`, `DeleteBucketPolicy`, `PutBucketTagging`, `GetBucketTagging`, `PutLifecycleConfiguration`, `GetLifecycleConfiguration`, e para esvaziar o bucket na destruição: `ListBucket`, `ListBucketVersions`, `DeleteObject`, `DeleteObjectVersion`, em `arn:aws:s3:::llms-*` |

AD-9 também pede Block Public Access **na conta**. Esse bloqueio fica fora do stack. Confira com `aws s3control get-public-access-block --account-id <conta>` e, se necessário, ative com `put-public-access-block` (pede `s3:GetAccountPublicAccessBlock` e `s3:PutAccountPublicAccessBlock`).

Esta lista foi escrita a partir da documentação de cada recurso e ainda não passou por um deploy real. Se um passo falhar com `AccessDenied`, o evento do stack mostra a ação que faltou; acrescente-a e registre a correção aqui.
