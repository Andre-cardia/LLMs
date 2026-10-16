---
title: 'Publicador no S3 (Q2): lease, fencing e CAS por escrita condicional, publicando o dataset sintético'
type: 'feature'
created: '2026-10-16'
status: 'done'
baseline_commit: '3f20225fbbfcfb000b5bc0af212049f009ddd578'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-http-snapshot-port.md'
  - '{project-root}/infra/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o bucket privado e a Lambda de leitura existem, mas nada grava snapshots: a API responde "nada publicado". O AD-2 e o AD-6 exigem lease, fencing e CAS do manifesto, e o Q2 ainda não tinha onde guardá-los.

**Approach:** um Publicador S3 (`src/adapters/s3-snapshots.mjs`) implementa lease, fencing e CAS só com escrita condicional do S3, na disposição que a Lambda de leitura já lê. Uma Lambda `snapshot-publisher`, invocada à mão, publica o dataset sintético por esse caminho. Decisões de Andre em 16/10: controle no S3, sem serviço novo; só dados sintéticos; só invocação manual.

## Boundaries & Constraints

**Always:**
- Porta de objetos injetada `{get(key) → {text, etag} | null, put(key, text, {ifNoneMatch?, ifMatch?}) → {etag}, delete?}`; `put` condicional falha com `PreconditionFailedError` (412) ou `ConflictError` (409). Uma implementação em memória fiel a essas regras (inclusive 412 em corrida) serve aos testes; outra fala com o S3 via `@aws-sdk/client-s3` (`IfNoneMatch: '*'`, `IfMatch: etag`).
- Disposição: as constantes `POINTER_KEY`, `SLICE_PREFIX`, `revisionKey` e `LEASE_KEY = 'control/lease.json'` passam a viver em `src/contracts/manifest.mjs`, usadas pelo Publicador e pela Lambda de leitura (sem duplicar).
- Lease: `acquire(owner, ttlMs, now)` cria `control/lease.json` com `If-None-Match`; se existir e estiver vencido, substitui com `If-Match` no ETag lido; se vigente, `LEASE_BUSY`. O lease guarda `owner`, `expiresAt` e `fencingToken`, que cresce a cada aquisição (lido do lease anterior, ou 1). `release` só apaga com `If-Match` se o dono e o token ainda forem os seus.
- Publicação (`publish({data, now, lease})`), em ordem: valida `assertSnapshotData`; grava cada slice em `slices/<digest>` com `envelopeBytes` e `If-None-Match` (412 de chave igual = mesmo conteúdo, aceito); monta o manifesto v2 com `revision` única que casa `REVISION_PATTERN`, `curationRevision`, `companyMergedInto` herdado do manifesto atual e `objectKey` = chave da slice; grava `manifest/revisions/<revision>.json` com `If-None-Match`; confere que o lease ainda é seu e o `fencingToken` não mudou; troca o ponteiro com `If-Match` no ETag lido no início (ou `If-None-Match` na primeira publicação), com `readableRevisions` = a nova seguida das duas anteriores. 412 no ponteiro → `SNAPSHOT_CAS_LOST`, sem retry automático.
- Lambda `snapshot-publisher` (`src/adapters/lambda/snapshot-publisher.mjs`): sem rota HTTP, só `aws lambda invoke`; publica o dataset sintético (`src/ui/fixtures/synthetic-workspace.mjs` não pode ser importado por adapters: o dataset vem de um módulo de dados em `src/contracts/` ou de um gerador compartilhado, sem duplicar o JSON). Papel IAM: `s3:GetObject` e `s3:PutObject` em `slices/*`, `manifest/*` e `control/*`, `s3:DeleteObject` só em `control/*`. Empacotada pelo `scripts/render-auth-stack.mjs`. Timeout 30 s.
- Bucket policy: `PutObject` em `slices/*` e `manifest/revisions/*` exige escrita condicional (nega sem `s3:if-none-match`), conforme a documentação de escrita condicional imposta.
- `infra/README.md`: como invocar, ler o resultado e conferir com `curl` em `/api/v1/snapshot`.

**Never:** fonte real (Artificial Analysis) ou chamada externa; agendador; DynamoDB; rota HTTP para publicar; apagar ou sobrescrever slice ou manifesto de revisão; mudar a Lambda de leitura além de usar as constantes compartilhadas; ligar a porta HTTP no shell.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Primeira publicação | bucket vazio | slices, manifesto e ponteiro gravados; a Lambda de leitura serve tudo e o `SnapshotReader` com `webDigest` dá `updated` | N/A |
| Quarta publicação | 3 revisões legíveis | ponteiro com as 3 mais novas; a mais velha passa a 404 na leitura | N/A |
| Slice repetida | mesmo conteúdo já gravado | 412 tratado como sucesso; nenhuma sobrescrita | N/A |
| Lease ocupado | lease vigente de outro dono | não publica | `LEASE_BUSY` |
| Lease vencido | lease de outro dono expirado | assume com token maior | N/A |
| Corrida de lease | dois `acquire` simultâneos no bucket vazio | só um vence | `LEASE_BUSY` no outro |
| Fencing | lease foi tomado por outro durante a publicação | ponteiro não muda | `LEASE_EXPIRED_OR_FENCED` |
| CAS perdido | ponteiro mudou entre a leitura e a troca | ponteiro não muda; revisão órfã fica privada | `SNAPSHOT_CAS_LOST` |
| Dataset inválido | `assertSnapshotData` falha | nada gravado | `TypeError` |
| Release alheio | `release` com token antigo | lease não apagado | N/A |

</frozen-after-approval>

## Code Map

- `src/adapters/memory-snapshots.mjs` -- Publisher em memória: ordem de validação, `lastSuccessAt`, `companyMergedInto`, CAS e fencing; reaproveitar regras, não o armazenamento.
- `src/adapters/lambda/snapshot-reader.mjs:20-22` -- `POINTER_KEY`, `SLICE_PREFIX`, `revisionKey`; mover para `src/contracts/manifest.mjs`.
- `src/contracts/manifest.mjs`, `src/contracts/snapshot.mjs` -- `assertManifest`, `assertSnapshotPointer`, `envelopeBytes`, `READABLE_REVISIONS`.
- `tests/helpers/snapshot-bucket.mjs` -- espelha publicações no formato do bucket; o Publicador S3 passa a ser a fonte desse formato.
- `scripts/render-auth-stack.mjs`, `infra/auth-stack.template.yaml` -- empacotamento e recursos; padrão da Lambda de leitura.
- `scripts/gen-synthetic-workspace.mjs` -- gerador do dataset sintético; estender para o módulo de dados usado pelo Publicador.
- Fonte: [S3 conditional writes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html) (`If-None-Match: *`, `If-Match: <etag>`, 412, 409).

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/manifest.mjs` -- constantes de disposição e `LEASE_KEY`; a Lambda de leitura passa a importá-las.
- [x] `src/adapters/s3-snapshots.mjs` -- lease, fencing, publicação e CAS sobre a porta de objetos; porta em memória e porta S3.
- [x] Dataset sintético acessível a adapters sem duplicar o JSON.
- [x] `src/adapters/lambda/snapshot-publisher.mjs` -- handler de invocação manual.
- [x] `infra/auth-stack.template.yaml`, `scripts/render-auth-stack.mjs`, `infra/auth-stack.yaml`, `infra/README.md` -- Lambda, papel mínimo, política de escrita condicional, instruções.
- [x] `tests/s3-snapshots.test.mjs`, `tests/snapshot-publisher.test.mjs`, ajustes em `tests/auth-stack.test.mjs` -- matriz inteira.

**Acceptance Criteria:**
- Given um bucket em memória fiel às regras de escrita condicional, when o Publicador publica e a Lambda de leitura serve o resultado pela porta HTTP, then o `SnapshotReader` com `webDigest` termina em `updated` com o dataset sintético.
- Given o pacote inline da Lambda de publicação num contexto limpo com SDK S3 falso, when é invocado, then grava slices, manifesto e ponteiro com os cabeçalhos condicionais corretos.

## Implementation Notes

- Constantes de disposição (`POINTER_KEY`, `SLICE_PREFIX`, `revisionKey`, `LEASE_KEY`) e o validador novo `assertSnapshotLease` moram em `src/contracts/manifest.mjs`; `snapshot.mjs` reexporta com `import {...}` + `export {...};` (a forma `export {...} from` não passa no empacotador). A Lambda de leitura deixou de exportar as constantes; testes e helper importam de `src/contracts/`.
- Dataset: `scripts/gen-synthetic-workspace.mjs` gera `src/contracts/synthetic-workspace.mjs` (o único lugar com o JSON fora de `tests/fixtures/`), e `src/ui/fixtures/synthetic-workspace.mjs` passou a reexportá-lo. O gate de imports do shell e o build do `/app` continuam passando (o módulo é copiado com `src/contracts/`).
- Revisão: `r<instante compacto>-<fencingToken>-<8 hex aleatórios>`, casa `REVISION_PATTERN`. Colisão com revisão legível ou 412 no manifesto da revisão → `SNAPSHOT_REVISION_EXISTS`.
- Fencing confere dono, token, ETag do lease e validade contra o relógio injetado (`clock`, na Lambda o relógio real; sem `clock`, o `now` da publicação). O lease devolvido por `acquire` carrega o ETag.
- Slice com 412: relê a chave e confere o digest; bytes divergentes → `SNAPSHOT_SLICE_CORRUPT`, sem sobrescrever.
- `curationRevision` herdada do manifesto atual (ou `curation-0`); parâmetro opcional em `publish`.
- Porta S3: `AccessDenied` (sem `s3:ListBucket`) é ausência; é seguro porque toda escrita depois de uma leitura é condicional (um objeto ilegível faz o `If-None-Match` falhar). 412/`PreconditionFailed` → `PreconditionFailedError`; 409/`ConditionalRequestConflict` → `ConflictError`.
- Lambda: TTL do lease 25 s (Timeout 30 s); recusa eventos com cara de API Gateway (`PUBLISH_EVENT_NOT_ALLOWED`); o payload nunca vira dado; libera o lease no fim, com sucesso ou falha; resultado e log só com `ok`, `revision`, `readableRevisions`, `fencingToken`, `provenance` ou `error`.
- Empacotamento: o mesmo `bundleReader` com entrada `snapshot-publisher.mjs`; teto próprio de 98 304 caracteres (pacote atual ≈ 57,6 K); `readReaderModules` lê as duas entradas num único mapa.
- Bucket policy: `DenyUnconditionalImmutablePut` (`s3:PutObject` em `slices/*` e `manifest/revisions/*` com `Null: {s3:if-none-match: 'true'}`); a chave `'Null'` vai entre aspas porque `Null` sem aspas é o nulo do YAML.

## Spec Change Log

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | blind | O `release` apagava o lease, então o `fencingToken` voltava a 1 a cada publicação | medium | O próprio teste afirmava `fencingToken === 1` na segunda publicação. Agora o release regrava o lease já vencido com `If-Match`; o token cresce e o papel não precisa mais de `s3:DeleteObject`. Testes atualizados (token 2 na segunda publicação) | patch |
| 2 | blind | Ponteiro e lease podiam ser sobrescritos sem condição pela política do bucket | medium | Nova negação `DenyBlindPointerAndLeasePut` quando faltam `If-Match` e `If-None-Match`, conforme a [documentação de escrita condicional imposta](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes-enforce.html); teste do stack | patch |
| 3 | blind | Um lease forjado ou vencido gravava slices e manifesto (órfãos) antes de ser recusado | medium | Conferência do lease antes de qualquer escrita, além da conferência antes do ponteiro; teste confirma nenhum objeto gravado; mutação confirma | patch |
| 4 | blind, edge | Após 412 numa slice, uma releitura vazia era aceita como igual sem conferir o digest | medium | `null` na releitura agora é `SNAPSHOT_SLICE_CORRUPT`; teste novo; mutação confirma | patch |
| 5 | edge | 409 em escrita concorrente de slice igual derrubava a publicação inteira | low | Tratado como 412: aceito depois de conferir o digest; teste novo | patch |
| 6 | edge, gap | Ponteiro, manifesto ou lease ilegíveis viravam `SNAPSHOT_DATA_INVALID` ou `SNAPSHOT_PUBLISH_FAILED` | medium | Estado ilegível vira `SNAPSHOT_STATE_INVALID`; testes para ponteiro não JSON, ponteiro fora do contrato e lease ilegível; README descreve a recuperação | patch |
| 7 | blind, edge, gap | `SNAPSHOT_DATA_NOT_SYNTHETIC` fora dos códigos conhecidos; vários códigos fora da tabela do README | low | Código acrescentado; tabela completa com ação para cada código; teste do handler para `SNAPSHOT_STATE_INVALID` e `LEASE_EXPIRED_OR_FENCED` | patch |
| 8 | blind | Falha de publicação sem diagnóstico no log | medium | Log com `cause` (nome do erro) e `httpStatus` do S3, sem dados; teste confere ausência de conteúdo | patch |
| 9 | edge | Falha ao montar o cliente S3 escapava sem resultado nem log | low | Capturada; devolve `SNAPSHOT_PUBLISH_FAILED` e loga | patch |
| 10 | blind | Sem `MaximumRetryAttempts: 0` nem concorrência reservada | low | `EventInvokeConfig` com 0 retries e `ReservedConcurrentExecutions: 1` | patch |
| 11 | blind | TTL fixo do lease ignorava o tempo já gasto no cold start | low | TTL limitado ao tempo restante da invocação menos 5 s; teste | patch |
| 12 | blind | README superestimava o fencing | low | README explica que a segurança vem do CAS do ponteiro e da política do bucket | patch |
| 13 | blind | Permissão humana `llms-*-snapshot-publisher` valia para todos os ambientes | low | README recomenda uma ARN por ambiente | patch |
| 14 | blind | "Destruir" não dizia que o bucket fica com os snapshots | low | README atualizado | patch |
| 15 | blind | Bucket versionado sem ciclo de vida para versões antigas | false | O bucket já tem `NoncurrentVersionExpiration` de 30 dias desde a spec do stack | rejeitado |
| 16 | blind | Nomes `READER_*` do empacotador também cobrem o publicador | low | Cosmético; renomear junto do endurecimento do empacotador já registrado em `deferred-work.md` | defer |
| 17 | edge | Um publicador travado entre a conferência do lease e a troca do ponteiro | false | O CAS do ponteiro com `If-Match` impede a sobrescrita: ele perde com `SNAPSHOT_CAS_LOST` (achado 12) | rejeitado |


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `node scripts/render-auth-stack.mjs && uvx --from cfn-lint cfn-lint infra/auth-stack.yaml` -- expected: zero erros.
- `git diff --check` -- expected: sem erros.
