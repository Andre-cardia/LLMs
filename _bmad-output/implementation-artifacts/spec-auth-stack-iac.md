---
title: 'IaC da camada autenticada (AD-9/AD-26): template CloudFormation de Cognito, API Gateway, Lambda e S3'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: '5eda4dd7aa00129cd82219df5ac4a12e9feb070a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o AD-9 fixa a camada autenticada na AWS (Cognito, API Gateway HTTP API com JWT, Lambda `nodejs24.x`, S3 privado) e o AD-26 fixa uma origem por ambiente, mas nada disso existe como código. A credencial desta sessão não provisiona recursos; Andre aplica com as próprias credenciais.

**Approach:** um template CloudFormation puro em `infra/auth-stack.yaml`, parametrizado por ambiente e origem, aplicado com `aws cloudformation deploy`. Um handler Lambda mínimo `src/adapters/lambda/owner-gate.mjs` confere `token_use`, `client_id` e `sub` contra `OWNER_SUBS` e devolve `{ok:true, sub}` em `GET /api/v1/whoami`, para provar a autenticação de ponta a ponta. Leitura de snapshot (AD-27), persistência de controle e agendador continuam sob Q2.

## Boundaries & Constraints

**Decisões (Andre, 15/10):** CloudFormation puro + AWS CLI, sem pacote npm; template parametrizado, com exemplo `preview` em `us-east-1`; recursos nomeados por ambiente, `prod` é outro stack do mesmo template (AD-14).

**Always:**
- Parâmetros: `EnvironmentName` (`preview|prod`), `AppOrigin` (HTTPS, sem barra final), `OwnerSubs` (lista separada por vírgula; vazia permitida, e então tudo nega), `CognitoDomainPrefix`.
- Cognito: user pool com `AdminCreateUserConfig.AllowAdminCreateUserOnly: true`; domínio de prefixo com `ManagedLoginVersion: 2`; resource server `llms-api` com escopos `read` e `write`; app client público (`GenerateSecret: false`), `AllowedOAuthFlows: [code]`, `AllowedOAuthFlowsUserPoolClient: true`, escopos só `llms-api/read` e `llms-api/write` (sem `aws.cognito.signin.user.admin`), `SupportedIdentityProviders: [COGNITO]`, `PreventUserExistenceErrors: ENABLED`, `EnableTokenRevocation: true`, callback `${AppOrigin}/app/auth/callback` e logout `${AppOrigin}/app/`.
- API Gateway HTTP API: `CorsConfiguration` com `AllowOrigins` só `AppOrigin`, métodos `GET`, header `Authorization`; authorizer `JWT` com `IdentitySource: $request.header.Authorization`, `Issuer` do pool e `Audience` = client id; rota `GET /api/v1/whoami` com `AuthorizationScopes: [llms-api/read]`; stage `$default` com auto-deploy e limite de throttling.
- Lambda `nodejs24.x`, `arm64`, handler do arquivo acima, `OWNER_SUBS` e `APP_CLIENT_ID` em variáveis de ambiente, timeout curto, papel IAM só com logs. O código vai inline no template por `ZipFile`, para que o deploy não exija bucket de artefatos; um script `scripts/render-auth-stack.mjs` injeta o conteúdo de `owner-gate.mjs` no template e é a única forma de gerar `infra/auth-stack.yaml` a partir de `infra/auth-stack.template.yaml`.
- S3 de snapshots: `PublicAccessBlockConfiguration` com os quatro bloqueios, `OwnershipControls` `BucketOwnerEnforced`, criptografia SSE-S3, versionamento, bucket policy negando `aws:SecureTransport = false` e `s3:authType = REST-QUERY-STRING`. Nada lê nem escreve nele ainda.
- Handler: aceita só `token_use === 'access'` e `client_id === APP_CLIENT_ID`; `sub` precisa estar em `OWNER_SUBS`; resposta 403 genérica sem detalhe; `Cache-Control: private, no-store`. Nunca registra o token. Lê as claims de `event.requestContext.authorizer.jwt.claims` (payload 2.0).
- Saídas do stack: `ApiOrigin`, `CognitoDomain`, `UserPoolId`, `AppClientId`, `SnapshotBucketName`, para alimentar a configuração pública do shell (AD-26) numa spec futura.
- `infra/README.md`: como gerar o template, rodar `cfn-lint`, aplicar com `aws cloudformation deploy`, criar o usuário dono com `aws cognito-idp admin-create-user`, pegar o `sub` e atualizar `OwnerSubs`, e destruir o stack. Inclui a lista de permissões IAM que a credencial do deploy precisa.

**Never:** executar qualquer comando que crie, altere ou apague recurso na AWS; ligar o shell ao Cognito ou à API (PKCE, callback e `http-snapshot-port` são specs futuras); rotas de snapshot (AD-27), DynamoDB, agendador; segredo, token ou ID real no repositório; pacote npm novo; mudar `src/` fora de `src/adapters/lambda/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dono autenticado | claims `token_use: access`, `client_id` certo, `sub` em `OWNER_SUBS` | 200 `{ok:true, sub}`, `Cache-Control: private, no-store` | N/A |
| ID token | `token_use: id` | 403 genérico | N/A |
| Outro client | `client_id` diferente | 403 | N/A |
| Sub fora da lista | `sub` ausente de `OWNER_SUBS` | 403 | N/A |
| Lista vazia | `OWNER_SUBS` = `''` | 403 para todos | N/A |
| Sem claims | evento sem `authorizer.jwt` | 403 | N/A |
| Espaços e vazios na lista | `OWNER_SUBS` = `' a , ,b '` | aceita `a` e `b`, ignora vazio | N/A |
| Template gerado | `render-auth-stack.mjs` | `infra/auth-stack.yaml` com o handler inline, idêntico ao gerar de novo | N/A |
| Lint | `cfn-lint infra/auth-stack.yaml` | zero erros | N/A |

</frozen-after-approval>

## Code Map

- `_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md` -- AD-9 (token, login, S3, guarda) e AD-26 (origem única, CORS só no gateway, rota OPTIONS sem auth).
- `src/adapters/` -- adaptadores de Node; o handler entra em `src/adapters/lambda/` e não é alcançável por `src/ui/` (o gate de `npm run check` já impede).
- `scripts/check-local.mjs` -- já roda `node --check` em `src/` e `scripts/`, cobrindo o handler e o script de render.
- `scripts/gen-synthetic-workspace.mjs` -- padrão de gerador com saída versionada.
- Não mudar: `src/ui/`, `src/application/`, `src/domain/`, `src/contracts/`, `amplify.yml`, `customHttp.yml`.

## Tasks & Acceptance

**Execution:**
- [x] `src/adapters/lambda/owner-gate.mjs` -- handler `GET /api/v1/whoami` com a regra do dono.
- [x] `infra/auth-stack.template.yaml` -- template com marcador para o código do handler.
- [x] `scripts/render-auth-stack.mjs` -- gera `infra/auth-stack.yaml` a partir do template e do handler.
- [x] `infra/auth-stack.yaml` -- saída gerada e versionada.
- [x] `infra/README.md` -- aplicar, criar o dono, atualizar `OwnerSubs`, destruir, permissões necessárias.
- [x] `tests/owner-gate.test.mjs`, `tests/auth-stack.test.mjs` -- matriz do handler; o template gerado está atualizado, contém as propriedades de segurança exigidas e não tem segredo ou ID real.

**Acceptance Criteria:**
- Given o template gerado, when `uvx --from cfn-lint cfn-lint infra/auth-stack.yaml` roda, then não há erros.
- Given o template, when lido pelo teste, then o app client não tem secret nem `implicit`, o authorizer usa `Audience` igual ao client e a rota exige `llms-api/read`, e o bucket nega transporte sem TLS e URLs presigned.

## Implementation Notes

- O ZipFile inline vira `index.js` (CommonJS no `nodejs24.x`, que desliga a detecção de módulo). Por isso o handler é autossuficiente, sem `import`, e termina numa única linha `export {...};`, que `render-auth-stack.mjs` troca por `module.exports = {...};`. O render recusa `import`, `export` extra, falta do marcador e código acima de 4096 caracteres.
- O user pool usa `UserPoolTier: ESSENTIALS`, porque o managed login v2 não existe no plano Lite. Também há um `AWS::Cognito::ManagedLoginBranding` com `UseCognitoProvidedValues: true`, porque sem estilo associado o managed login v2 não renderiza a página do client.
- Não há rota `OPTIONS`: com `CorsConfiguration` e nenhuma rota OPTIONS, o API Gateway responde o preflight sem chamar o authorizer (AD-26).
- O bucket tem `DeletionPolicy: Retain`, e o user pool de `prod` tem `DeletionProtection: ACTIVE`. O README documenta a limpeza manual.
- O 403 usa o envelope de erro da convenção (`{error:{code,message,retryable},requestId}`), sempre com o mesmo corpo, sem motivo.
- O Block Public Access **da conta** (AD-9) fica fora do stack; o README mostra como conferir.
- `git diff --exit-code infra/auth-stack.yaml` só tem efeito depois do commit dos arquivos novos; antes disso, o render repetido foi conferido com `cmp`.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind, edge, gap | `CognitoDomainPrefix` dizia recusar `aws`/`amazon`/`cognito` mas o `AllowedPattern` aceitava | medium | Confirmado no template; o erro só viria no `UserPoolDomain`, com rollback. Lookahead negativo no padrão; teste com casos bons e ruins | patch |
| 2 | blind, edge, gap | Bucket com nome fixo e `Retain` impede recriar o stack do mesmo ambiente | medium | Real; README explicava só que o bucket fica. README agora diz como apagar ou importar antes de recriar | patch |
| 3 | blind, edge | Lista de permissões IAM incompleta (MFA do pool, `GetPolicy`, `GetRuntimeManagementConfig`, `ListRolePolicies`, esvaziar bucket, BPA da conta) | medium | Ações acrescentadas; README avisa que a lista ainda não passou por deploy real | patch |
| 4 | blind | Teste de `Resource: '*'` no papel nunca disparava | medium | Mutação confirmada: trocar o recurso por `'*'` não falhava. Asserções diretas; a mesma mutação agora quebra 3 testes | patch |
| 5 | blind | Propriedades de segurança sem teste (`SourceArn` da permissão, `DeletionProtection`, `Retain`, MFA, senha, plano) | medium | Testes novos para cada uma | patch |
| 6 | blind | Sem logs de acesso da API: 401 e 403 sem rastro | medium | `AccessLogSettings` no stage, log group com 90 dias, formato sem token nem claims; teste garante | patch |
| 7 | blind | Bucket versionado sem ciclo de vida | low | `NoncurrentVersionExpiration` (30 dias) e `AbortIncompleteMultipartUpload` (1 dia) | patch |
| 8 | blind | MFA opcional para o único usuário, o dono | medium | `ON` em `prod`, opcional em `preview`; README orienta cadastrar TOTP | patch |
| 9 | edge | `RoleName` é global por conta: mesmo ambiente em outra região falharia | low | Região incluída no nome; teste | patch |
| 10 | gap | Guardas de tamanho e tab do render sem teste | medium | Mutação confirmada; testes novos e a mutação agora falha | patch |
| 11 | blind | Guarda de import não pegava `import()` nem `require()` e acusava comentários | low | Guarda reescrita sobre o código sem comentários; testes nos dois sentidos | patch |
| 12 | edge | Checkout com CRLF quebrava o render | low | Normalização de quebras de linha; teste | patch |
| 13 | edge | Script não rodava se chamado por link simbólico | low | `realpathSync` em `argv[1]` | patch |
| 14 | edge | Senha temporária expira em 3 dias sem caminho de recuperação documentado | low | README com `--message-action RESEND` | patch |
| 15 | blind | Custo do plano Essentials e pré-requisitos de região não documentados | low | README com a nota e link de preços | patch |
| 16 | blind | Login impossível a partir de `http://localhost` | low | Intencional nesta spec (a callback é só `AppOrigin` HTTPS); documentado, com o parâmetro de callback de dev previsto para a spec do PKCE | defer |
| 17 | blind | Limite de 4096 caracteres tratado como regra da AWS | low | A referência diz zip de até 4 MB; o teto é nosso. Comentário e README corrigidos | patch |
| 18 | edge | Porta fora de faixa e rótulos vazios aceitos em `AppOrigin` | low | O Cognito e o API Gateway rejeitam essas URLs no deploy, sem efeito parcial além do rollback; não vale um regex maior | rejeitado |
| 19 | blind | `cfn-lint` não roda em `npm run validate` | low | Exigiria Python/`uvx` no pipeline do Amplify; fica como passo manual documentado | rejeitado |
| 20 | blind | `package.json` fora do diff deixaria testes novos sem rodar | false | `npm test` roda `tests/*.test.mjs`; os 324 testes incluem os novos | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `node scripts/render-auth-stack.mjs && git diff --exit-code infra/auth-stack.yaml` -- expected: saída já atualizada.
- `uvx --from cfn-lint cfn-lint infra/auth-stack.yaml` -- expected: zero erros.
- `git diff --check` -- expected: sem erros.
