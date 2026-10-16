---
title: 'Porta HTTP de leitura de snapshot (AD-27): ManifestResponse, porta única e Lambdas de leitura'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: '2a9f90e6ac79fb5d75ccca926c8e13b53a7705a9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-shell-pkce-login.md'
  - '{project-root}/infra/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o shell só lê fixtures. O AD-27 fixa como ele deve ler o snapshot real pela API (manifesto sem chave interna do S3, slice em bytes exatos, mapeamento de 401/403/404/5xx), mas não existe o contrato `ManifestResponse`, nem a porta HTTP do navegador, nem as rotas no stack.

**Approach:** 1) contrato `ManifestResponse` e projeção `toManifestResponse` em `src/contracts/snapshot.mjs`; o `SnapshotReader` passa a validar o formato externo, e tudo que hoje entrega o manifesto interno ao leitor passa pela projeção; 2) `src/ui/http-snapshot-port.mjs`, a porta única com o token do login; 3) duas rotas no `infra/auth-stack.template.yaml` com uma Lambda de leitura que serve do S3 privado. Nada é ligado: o shell continua com fixtures até o stack existir e o login ser ligado.

## Boundaries & Constraints

**Always:**
- `assertManifestResponse(value)`: o manifesto v2 sem `objectKey` em cada slice (só `digest` e `lastSuccessAt`); `revision` casa `^[A-Za-z0-9._-]{1,128}$`; mesmo validador de `companyMergedInto`. `toManifestResponse(manifest)` copia sem `objectKey` e valida. `assertManifest` (interno) continua igual.
- `SnapshotReader` chama `assertManifestResponse`. `MemorySnapshots` ganha `readManifestResponse(context, revision)`; `fixture-source`, `browser-shell`, os helpers de teste e o demo passam a entregar o formato externo ao leitor. Nenhum teste existente perde asserção.
- Porta `createHttpSnapshotPort({apiOrigin, accessToken, fetch, onAccessLost})`: `readManifest()` → `GET ${apiOrigin}/api/v1/snapshot`; `readSlice(revision, slice)` → `GET ${apiOrigin}/api/v1/snapshots/${revision}/${slice}`, com `revision` validado e `slice` em `SLICES` antes do fetch; header `Authorization: Bearer <token>`, `cache: 'no-store'`, sem cookie. A slice é devolvida como texto exato (`response.text()`), sem `JSON.parse`.
- Mapeamento: 401 → renova uma vez (`accessToken({forceRefresh: true})`) e repete; segundo 401 ou token nulo → `AccessDeniedError`. 403 → `AccessDeniedError`. 404/410 de slice → `RevisionSupersededError` (novo, em `src/contracts/access.mjs`). 5xx, erro de rede ou resposta malformada → erro genérico `SNAPSHOT_HTTP_UNAVAILABLE`. `AccessDeniedError` chama `onAccessLost` uma única vez por porta.
- `accessToken({forceRefresh})` em `auth-session.mjs`: com `forceRefresh` e refresh token presente, renova mesmo fora da margem; sem refresh token, devolve `null`.
- Raiz: `refreshSnapshot()` trata `RevisionSupersededError` com um único novo refresh (sem laço).
- Lambda `snapshot-reader` (`src/adapters/lambda/snapshot-reader.mjs`), mesma regra de dono do `owner-gate` reaproveitada por import local: `GET /api/v1/snapshot` lê o ponteiro `manifest/current.json` no bucket e devolve `toManifestResponse`; `GET /api/v1/snapshots/{revision}/{slice}` lê o manifesto da revisão `manifest/revisions/{revision}.json`, busca `objectKey` e devolve os bytes sem tocar. Revisão inexistente ou fora das 3 últimas → 404. `Cache-Control: private, no-store`. Papel IAM só com `s3:GetObject` em `manifest/*` e `slices/*` do bucket. Código empacotado por `scripts/render-auth-stack.mjs`, como o `owner-gate`.
- Fixture compartilhada: os mesmos bytes de slice produzem o mesmo digest no handler Lambda (com `sha256Text`) e no navegador (com `webDigest`).

**Never:** ligar a porta HTTP no shell ou trocar a fonte padrão (continua `fixture-source`); gravar no bucket (publicação é Q2); DynamoDB, agendador; token em URL, log ou mensagem; reserializar slice; mudar o formato interno do manifesto.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Manifesto ok | 200 com `ManifestResponse` válido | manifesto devolvido; `SnapshotReader` aceita | N/A |
| Manifesto com objectKey | 200 com `objectKey` | recusado pelo leitor | `kept-last-good`/`unavailable` |
| Slice ok | 200 com bytes | texto idêntico ao corpo; digest confere | N/A |
| 401 uma vez | 401 e depois 200 | 1 renovação forçada e 1 repetição | N/A |
| 401 duas vezes | 401, 401 | `AccessDeniedError`; `onAccessLost` uma vez | N/A |
| Sem token | `accessToken()` nulo | nenhum fetch; `AccessDeniedError` | N/A |
| 403 | 403 | `AccessDeniedError` | N/A |
| 404 de slice | 404 | `RevisionSupersededError`; a raiz faz um único refresh | N/A |
| 5xx / rede | 503 ou fetch lança | erro genérico; leitor `kept-last-good` | N/A |
| Revisão inválida | `readSlice('../x','catalog')` | lança antes do fetch | `TypeError` |
| Lambda: dono | claims válidas, ponteiro existe | 200 com `ManifestResponse` sem `objectKey` | N/A |
| Lambda: não dono | `sub` fora da lista | 403, sem ler o S3 | N/A |
| Lambda: revisão antiga | 4ª revisão mais velha | 404 | N/A |
| Lambda: bytes | slice gravada | corpo idêntico aos bytes do objeto | N/A |

</frozen-after-approval>

## Code Map

- `src/contracts/snapshot.mjs` -- `assertManifest`, `assertCompanyMergedInto`, `SLICES`; acrescentar `assertManifestResponse`, `toManifestResponse`, `REVISION_PATTERN`.
- `src/contracts/access.mjs` -- `AccessDeniedError`; acrescentar `RevisionSupersededError`.
- `src/application/snapshot-reader.mjs:11` -- troca de `assertManifest` por `assertManifestResponse`.
- `src/adapters/memory-snapshots.mjs:83-94` -- `readManifest`; acrescentar `readManifestResponse`.
- `src/ui/fixture-source.mjs:49` -- `readManifest` passa a devolver a projeção.
- `src/ui/browser-shell.mjs:138-160` -- `refreshSnapshot`; tratar `RevisionSupersededError`.
- `src/ui/auth/auth-session.mjs:201-210` -- `accessToken`; acrescentar `forceRefresh`.
- `tests/helpers/local-fixtures.mjs:13`, `scripts/demo-local-core.mjs` e testes que constroem `SnapshotReader` com `readManifest: () => snapshots.readManifest(...)` -- passar à projeção.
- `src/adapters/lambda/owner-gate.mjs`, `scripts/render-auth-stack.mjs`, `infra/auth-stack.template.yaml` -- padrão do handler inline e do stack; o render precisa aceitar dois handlers.
- `tests/auth-stack.test.mjs`, `tests/owner-gate.test.mjs` -- padrões de teste do stack e do handler.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/snapshot.mjs`, `src/contracts/access.mjs` -- contrato externo e erro de revisão superada.
- [x] `src/application/snapshot-reader.mjs`, `src/adapters/memory-snapshots.mjs`, `src/ui/fixture-source.mjs`, helpers e demo -- leitor no formato externo.
- [x] `src/ui/http-snapshot-port.mjs` -- porta única com o mapeamento do AD-27.
- [x] `src/ui/auth/auth-session.mjs`, `src/ui/browser-shell.mjs` -- `forceRefresh` e refresh único em revisão superada.
- [x] `src/adapters/lambda/snapshot-reader.mjs`, `infra/auth-stack.template.yaml`, `scripts/render-auth-stack.mjs`, `infra/auth-stack.yaml`, `infra/README.md` -- Lambda de leitura, duas rotas e papel mínimo.
- [x] `tests/http-snapshot-port.test.mjs`, `tests/snapshot-reader-lambda.test.mjs` e ajustes -- matriz inteira e a fixture de digest compartilhada.

**Acceptance Criteria:**
- Given a suíte existente, when roda depois da troca para o formato externo, then todos os testes anteriores passam e nenhum perde asserção.
- Given a porta HTTP com `fetch` falso servindo os bytes que o handler Lambda devolve para uma slice gravada por `MemorySnapshots`, when o `SnapshotReader` com `webDigest` faz `refresh()`, then o status é `updated`.

## Implementation Notes

- Os validadores do manifesto (`assertManifest`, `assertManifestResponse`, `toManifestResponse`, `assertCompanyMergedInto`, `assertRevision`, `REVISION_PATTERN`, `SLICES`) moram no módulo folha `src/contracts/manifest.mjs`, que só importa `primitives.mjs`; `snapshot.mjs` reexporta tudo, então nenhum import existente mudou. Motivo: a Lambda empacota esse módulo sem arrastar os validadores de catálogo/modelos/notícias.
- `assertManifestResponse` também recusa revisões só de pontos (`.`, `..`): casam o padrão, mas o navegador as normalizaria como segmentos de caminho.
- Layout do bucket (não fixado pelo AD-27, escolhido aqui e documentado em `infra/README.md`): `manifest/current.json` é um ponteiro `{schemaVersion: 1, revision, readableRevisions}` (até 3, a primeira é a corrente), validado por `assertSnapshotPointer`; `manifest/revisions/{revision}.json` é o manifesto interno; o `objectKey` precisa começar com `slices/`. O formato do ponteiro é um contrato novo que o Publisher (Q2) terá de gravar.
- Sem `s3:ListBucket`, chave ausente volta `AccessDenied`; a Lambda trata como 404. Objeto corrompido ou S3 fora → 503 genérico `{error:{code,message,retryable},requestId}`.
- `scripts/render-auth-stack.mjs` ganhou um empacotador mínimo para o leitor (só `import {a} from './x.mjs';` relativo, um escopo por módulo, único `require` permitido `@aws-sdk/client-s3`, teto de 32 768 caracteres). O `owner-gate` continua com a regra antiga e sai byte a byte igual.
- `accessToken({forceRefresh: true})` com falha de rede na renovação lança `AUTH_NETWORK_ERROR` em vez de devolver o token que a API acabou de recusar; a porta trata como erro genérico (não como perda de acesso).
- `SnapshotReader` devolve `errorCode: 'REVISION_SUPERSEDED'` quando a causa é `RevisionSupersededError`; `refreshSnapshot()` da raiz repete uma única vez nesse caso.
- A porta envia também `credentials: 'omit'`, `redirect: 'error'` e `referrerPolicy: 'no-referrer'`.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | gap | O adaptador S3 da Lambda (`s3GetObject`) nunca rodava em teste; o pacote inline só era exercitado até a regra do dono, com o resultado esperado já sendo 503 | high | Teste novo executa o pacote inline completo num contexto limpo com SDK S3 falso: 200 com `ManifestResponse` sem `objectKey`, 200 com os bytes exatos da slice, 404 para chave ausente. Ao rodar, revelou que passar os built-ins do host ao `vm` quebrava a checagem de protótipo (artefato do teste, não da Lambda); corrigido | patch |
| 2 | blind, edge | Falha de rede numa renovação forçada zerava a sessão e virava perda de acesso | high | `refresh()` agora informa a causa; numa renovação forçada com falha de rede a sessão continua e `accessToken` lança `AUTH_NETWORK_ERROR`, que a porta trata como indisponibilidade. Teste novo | patch |
| 3 | blind, edge | Três slices com 401 em paralelo renovavam várias vezes | medium | A porta passa o token recusado; se outra requisição já renovou, a sessão devolve o token novo sem nova ida ao Cognito. Teste com 3 em paralelo: uma única renovação. Mutação confirma | patch |
| 4 | edge | 403 numa slice e 404 em outra: o leitor podia tratar como revisão superada e refazer em vez de descartar | medium | `Promise.allSettled`; `AccessDeniedError` prevalece. Teste novo; mutação confirma | patch |
| 5 | blind, edge | O único novo refresh por revisão superada só valia em `refreshSnapshot`, não na carga | medium | `readOnce` compartilhado por `start` e `refresh`; teste novo | patch |
| 6 | blind, edge | Publisher aceitava revisão que a leitura externa recusaria (503 permanente) | medium | `assertManifest` usa `assertRevision`; teste novo | patch |
| 7 | blind, edge | S3 `AccessDenied` virava 404 sem rastro; Lambda sem nenhum log | medium | Log estruturado com o nome do erro do S3 e o código interno, sem token, claims, chave nem conteúdo; teste confere que o log não contém `sub` nem conteúdo | patch |
| 8 | blind | Porta sem timeout: conexão travada prendia o refresh | medium | `AbortController` com 15 s; teste com relógio simulado | patch |
| 9 | blind | Depois de perder o acesso, a porta continuava chamando a rede | low | Curto-circuito em `AccessDeniedError`; teste confere uma única chamada | patch |
| 10 | blind | Permissão de invocação com curinga `snapshot*` cobriria rotas futuras | low | Uma permissão por rota; teste recusa o curinga | patch |
| 11 | blind | Comentário duplicado e contraditório em `refreshSnapshot` | low | Removido; um comentário único no `readOnce` | patch |
| 12 | blind | Slices acima de 6 MB (limite de resposta da Lambda) falhariam sem aviso | medium | Real, mas só aparece com dados reais publicados; a escrita é do Publisher (Q2), já com o limite de 6 MB listado no Q2 do spine | defer |
| 13 | blind | Cada slice relê ponteiro e manifesto (11 GETs por refresh); sem timeout explícito do SDK | low | Correto hoje; otimizar com cache do manifesto imutável por revisão quando houver medição real | defer |
| 14 | blind, edge | Bundler regex: `/*` em string, exports com vários nomes, `$` em nomes | low | Os módulos empacotados hoje não usam essas formas; o teste do pacote completo (achado 1) falharia se um nome sumisse. Endurecer junto do próximo módulo empacotado | defer |
| 15 | blind | Bucket vazio e indisponibilidade parecem iguais no navegador | low | Só importa quando a porta for ligada; distinguir no momento de exibir o estado | defer |
| 16 | edge | Afirmação "nenhum teste perde asserção" com asserções reescritas no teste do stack | false | As asserções reescritas contradiziam a própria spec (rotas e `s3:GetObject` agora existem); foram trocadas por verificações mais estritas (conjunto exato de rotas, `s3:GetObject` só no papel do leitor) | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `node scripts/render-auth-stack.mjs && uvx --from cfn-lint cfn-lint infra/auth-stack.yaml` -- expected: zero erros.
- `git diff --check` -- expected: sem erros.
