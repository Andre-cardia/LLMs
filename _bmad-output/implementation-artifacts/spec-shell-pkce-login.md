---
title: 'Login PKCE no shell: src/ui/auth/ e página /app/auth/callback (AD-9)'
type: 'feature'
created: '2026-10-15'
status: 'done'
baseline_commit: 'fcce6833f0e3cfa7f8cdc113fd47677422a234fc'
route: 'dispatch'
review_loop_iteration: 1
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md'
  - '{project-root}/infra/README.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** o stack do AD-9 define o app client público com code + PKCE e a callback `${AppOrigin}/app/auth/callback`, mas o shell não sabe fazer login: não gera PKCE, não tem a página de callback e não guarda nem renova tokens. Sem isso, o stack aplicado não pode ser usado pelo navegador.

**Approach:** `src/ui/auth/` implementa o fluxo do AD-9 com `crypto.subtle`, sem pacote: iniciar login (redirect a `/oauth2/authorize`), concluir no callback (troca do code em `/oauth2/token`), reautenticação silenciosa (`prompt=none`), renovação por refresh token e logout. Tokens ficam só em memória. Uma página `auth/callback/index.html` valida o `state` e repassa o `code` para `/app/` no fragmento; a troca do code acontece em `/app/`, no mesmo documento que guarda o token em memória (AD-9 emendado em 15/10). Enquanto não houver configuração pública do ambiente, o shell continua só com fixtures e o login fica desligado.

## Boundaries & Constraints

**Always:**
- Configuração pública num único módulo `src/ui/auth/auth-config.mjs`: `{enabled, cognitoDomain, clientId, appOrigin, scopes}`. Nesta spec, `enabled: false` e valores vazios; nenhuma ID real no repositório. Com `enabled: false`, nada de auth roda e a página continua como hoje.
- PKCE: `code_verifier` de 64 caracteres do alfabeto não reservado (RFC 7636) com `crypto.getRandomValues`; `code_challenge` = base64url sem padding de SHA-256 do verifier; método `S256`. `state` aleatório de 32 bytes em base64url.
- Login: grava em `sessionStorage` só `{verifier, state, returnTo}` sob uma única chave, e redireciona para `${cognitoDomain}/oauth2/authorize` com `response_type=code`, `client_id`, `redirect_uri=${appOrigin}/app/auth/callback`, `scope=llms-api/read llms-api/write`, `state`, `code_challenge`, `code_challenge_method=S256`. `returnTo` é só a query atual do shell, nunca uma URL completa.
- Callback (`/app/auth/callback`): lê `code`, `state` e `error` da URL; recusa `state` divergente ou ausente e apaga o `state` salvo; limpa a própria URL com `history.replaceState`; redireciona com `location.replace` para `/app/` + `returnTo` + `#code=<code>`. Não chama o token endpoint. Em erro, apaga toda a chave, mostra mensagem e link para `/app/`, sem exibir o code.
- Conclusão em `/app/`: `completeLogin()` lê `#code=` do fragmento antes de qualquer `hydrateUrl`, limpa o fragmento com `history.replaceState`, troca o code em `/oauth2/token` (`grant_type=authorization_code`, `client_id`, `code`, `code_verifier`, `redirect_uri`, `application/x-www-form-urlencoded`) e apaga o verifier. Fragmento sem verifier salvo é ignorado e limpo. O token resultante fica na sessão em memória desta página.
- Sessão: tokens só em memória num objeto `createAuthSession({config, ports})`; expõe `accessToken()` (renova pelo refresh token quando faltam menos de 60 s para expirar), `signOut()` (zera a memória e redireciona para `${cognitoDomain}/logout?client_id=…&logout_uri=${appOrigin}/app/`) e `silentLogin()` (`/oauth2/authorize` com `prompt=none`; `login_required` volta como não autenticado, sem laço). Expiração calculada por `expires_in` e relógio injetado, não pela decodificação do JWT.
- Recarga: como tokens não persistem, a página chama `silentLogin()` uma vez por carga quando `enabled`; um marcador em `sessionStorage` impede repetir o redirect na mesma volta.
- Portas injetadas (`fetch`, `location`, `history`, `sessionStorage`, `crypto`, `clock`), tudo testável com `node --test` sem DOM.
- Build: `scripts/build-app.mjs` passa a aceitar `auth/callback/index.html` além do `index.html` raiz, com as mesmas regras (sem inline, scripts relativos que resolvem). `customHttp.yml`: `/app/auth/callback` e `/app/auth/callback/` com a mesma CSP e `Cache-Control: no-store`. A CSP de `/app/**` não muda nesta spec (`connect-src` para o Cognito entra quando `enabled` virar `true`, AD-26).

**Never:** `localStorage` para token ou verifier; token, code ou verifier em URL que fique no histórico, em log ou em mensagem de erro; decodificar ou confiar em claims do JWT no cliente para autorização; pacote npm novo; chamar a API (`whoami`, snapshots) — isso entra com a porta HTTP do AD-27; ligar `enabled: true` ou colocar IDs reais.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| PKCE | verifier gerado | 64 chars do alfabeto RFC 7636; challenge igual ao vetor do RFC 7636 (apêndice B) para o verifier de exemplo | N/A |
| Início do login | `startLogin()` | 1 redirect para `/oauth2/authorize` com todos os parâmetros; `sessionStorage` com verifier/state/returnTo | N/A |
| Callback ok | `?code=c&state=s` igual ao salvo | nenhum POST; URL limpa; `location.replace` para `/app/` + returnTo + `#code=c`; `state` apagado | N/A |
| Conclusão em /app/ | `#code=c` com verifier salvo | 1 POST correto ao token endpoint; fragmento limpo antes do `hydrateUrl`; verifier apagado; token em memória | N/A |
| Fragmento órfão | `#code=c` sem verifier salvo | nenhum POST; fragmento limpo | N/A |
| Login completo | início → callback → conclusão | `accessToken()` devolve o token na própria `/app/` | N/A |
| State divergente | `state` ≠ salvo | sem POST; mensagem de erro; chave apagada | erro tipado |
| Sem chave salva | callback aberto direto | sem POST; erro | erro tipado |
| Erro do Cognito | `?error=access_denied` | sem POST; mensagem sem detalhes sensíveis | erro tipado |
| Token endpoint 400 | resposta `invalid_grant` | erro; nada em memória | erro tipado |
| Renovação | `accessToken()` a 30 s do fim | 1 POST `refresh_token`; novo token | N/A |
| Renovação falha | refresh recusado | sessão zerada; `accessToken()` devolve `null` | N/A |
| Silencioso sem sessão | volta com `error=login_required` | não autenticado; nenhum novo redirect na mesma carga | N/A |
| Desligado | `enabled: false` | nenhuma porta de auth chamada | N/A |
| Logout | `signOut()` | memória zerada; redirect para `/logout` com `client_id` e `logout_uri` | N/A |
| Build | artefato | `auth/callback/index.html` presente e verificado | build falha se o script não resolver |

</frozen-after-approval>

## Code Map

- `infra/auth-stack.template.yaml` -- callback `${AppOrigin}/app/auth/callback`, logout `${AppOrigin}/app/`, escopos `llms-api/read` e `llms-api/write`, só fluxo `code`, `ALLOW_REFRESH_TOKEN_AUTH`.
- `src/ui/web-digest.mjs` -- SHA-256 via `crypto.subtle` em hex; o challenge precisa de base64url, então a auth faz seu próprio digest em bytes (não reaproveitar o hex).
- `src/ui/main.mjs` -- único arquivo com DOM da página principal; acrescentar só a chamada condicional a `silentLogin()` e um botão "Entrar"/"Sair" visível quando `enabled`.
- `scripts/build-app.mjs` -- `verifyApp` aceita hoje só o `index.html` raiz; acrescentar a segunda página com as mesmas regras.
- `customHttp.yml`, `scripts/build-ui-preview.mjs` (`_headers`) -- padrões de `/app`.
- `tests/build-app.test.mjs`, `tests/browser-shell.test.mjs` -- padrões de teste de artefato e de guardas de import.
- Fontes: [authorize endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html), [token endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/token-endpoint.html) (CORS `*`, form-urlencoded, refresh só no `authorization_code`), [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636).

## Tasks & Acceptance

**Execution:**
- [x] `src/ui/auth/pkce.mjs` -- verifier, challenge S256, state.
- [x] `src/ui/auth/auth-config.mjs` -- configuração pública desligada.
- [x] `src/ui/auth/auth-session.mjs` -- `startLogin`, `completeCallback`, `accessToken`, `silentLogin`, `signOut`.
- [x] `src/ui/auth/callback.mjs` e `src/ui/auth/callback/index.html` -- página de callback mínima que valida e repassa o code.
- [x] `src/ui/main.mjs` -- `completeLogin()` antes do `shell.start()`, login silencioso condicional e botão Entrar/Sair.
- [x] `scripts/build-app.mjs`, `customHttp.yml`, `scripts/build-ui-preview.mjs` -- segunda página no artefato e headers.
- [x] `tests/auth.test.mjs`, ajustes em `tests/build-app.test.mjs` -- matriz inteira com portas fake.

**Acceptance Criteria:**
- Given `enabled: false`, when o shell carrega no navegador, then a página se comporta exatamente como hoje e nenhum redirect acontece.
- Given um fluxo completo com portas fake (início, callback, renovação, logout), when ele roda, then nenhum token, code ou verifier aparece em `sessionStorage` depois do callback, em URL do histórico ou em mensagem de erro.

## Implementation Notes

- A lógica da callback fica em `src/ui/auth/callback-flow.mjs` (sem DOM, testada); `callback.mjs` só monta as portas reais e escreve a mensagem.
- `completeCallback` trata `login_required`/`interaction_required`/`consent_required` como "não autenticado" e volta para `/app/` + `returnTo`, sem POST; qualquer outro `error` é `AUTH_PROVIDER_ERROR`. Erros são `AuthError` com `message === code`.
- `signOut()` grava o marcador do silencioso, para que a volta do `/logout` não dispare `prompt=none`.
- O build ganhou `APP_PAGES` em `scripts/build-app.mjs`; a página da callback é obrigatória e passa pelas mesmas verificações da raiz.
- **Limite da iteração 0, resolvido na iteração 1:** a troca do code numa página separada perdia o token em memória ao voltar para `/app/`. Com a emenda do AD-9, a callback só repassa o code no fragmento e a troca acontece em `/app/`; o teste do login completo termina com `accessToken()` válido na própria `/app/`.
## Spec Change Log

- **Iteração 1 (bad_spec, 15/10).** Achado do implementador, confirmado pelo arquiteto: com a troca do code numa página de callback separada e tokens só em memória, o token morria ao navegar de volta para `/app/` e o login nunca concluía; o login silencioso caía no mesmo caminho. Emendados o AD-9 do pai e o bloco congelado: a callback só valida o `state` e repassa o code no fragmento; a troca acontece em `/app/`. Estado ruim evitado: login que parece funcionar nos testes de unidade e nunca autentica no navegador. **KEEP:** o gerador de PKCE (verifier uniforme de 64 caracteres, challenge S256 em base64url sem padding, state de 32 bytes) e o teste com o vetor do RFC 7636 apêndice B; erros com código tipado e mensagem sem dado sensível; sessão desligada que não toca nenhuma porta (provado com Proxy); renovação única compartilhada entre chamadas simultâneas; token renovado depois do `signOut` descartado; `login_required`, `interaction_required` e `consent_required` como "não autenticado"; marcador gravado no `signOut` para a volta do logout não disparar o silencioso; `APP_PAGES` no build com a callback obrigatória e as mesmas regras da raiz; teste que prova que nada sensível fica em `sessionStorage`, no histórico ou em mensagem.

## Review Triage Log

| # | Camada | Achado | Veredito | Evidência | Rota |
| --- | --- | --- | --- | --- | --- |
| 1 | edge | Um `#code=` forjado em `/app/` consumia o verifier de um login cujo `state` ainda não fora validado | high | `completeLogin` aceitava qualquer pending com verifier. Agora só troca o code se a callback marcou o pending como validado (`validatedAt`, sem `state`) há no máximo 5 min; teste novo | patch |
| 2 | blind | Login silencioso redirecionava a cada recarga para quem nunca entra | medium | O marcador era consumido na volta. Agora dura a aba até um login concluído ou um `startLogin` explícito; teste novo e verificação no navegador (duas recargas sem redirect) | patch |
| 3 | blind | Falha de rede no refresh derrubava a sessão mesmo com o token ainda válido | medium | Só refresh recusado zera a sessão; em erro de rede o token atual volta enquanto não expira; teste novo | patch |
| 4 | blind, edge | Botão ficava "Sair" depois que a sessão caía | medium | `onChange` na sessão; o botão rerenderiza; teste do aviso | patch |
| 5 | blind | Logout deixava o refresh token válido | medium | `signOut` chama `/oauth2/revoke` (melhor esforço) antes do `/logout`, conforme a [documentação](https://docs.aws.amazon.com/cognito/latest/developerguide/revocation-endpoint.html); testes com e sem rede | patch |
| 6 | edge | `sessionStorage` indisponível caía num `Map` em memória e podia gerar laço de redirect | medium | Sem `sessionStorage` o login fica indisponível com aviso; nenhum redirect | patch |
| 7 | edge | Falha ao montar a auth (ou contexto inseguro) deixava `#code=` na URL | medium | `dropCodeFragment` nos dois caminhos de falha | patch |
| 8 | gap | `AUTH_CODE_MISSING` sem teste | medium | Teste novo: state válido sem code não redireciona e apaga a chave | patch |
| 9 | gap | Ramo sem refresh token em `accessToken()` nunca rodava | medium | Teste novo: vale até expirar e depois zera sem POST | patch |
| 10 | gap | Recusa de `token_type` não Bearer e `refresh_token` inválido sem teste | medium | Três casos novos | patch |
| 11 | blind | Comentário do teste PKCE dava o corte errado (252); limite nunca exercitado | low | Corte é 198 (`256 - 256 % 66`); comentário corrigido e teste com 197 e 198 | patch |
| 12 | blind, edge | Callback sem portas lançava `TypeError` cru | low | `AUTH_PORTS_MISSING` tipado; teste | patch |
| 13 | blind | Código de erro `APP_INDEX_SCRIPT_UNRESOLVED` usado para a página de callback | low | `APP_PAGE_SCRIPT_UNRESOLVED` para páginas que não são a raiz | patch |
| 14 | blind | Diretório vazio `ui/auth/callback/` ia para o artefato | low | `pruneEmptyDirs` antes de verificar; confirmado no build | patch |
| 15 | blind | Callback sem barra final resolveria o script errado | false | O Amplify acrescenta a barra quando não existe `callback.html`, e o teste no navegador confirmou o redirect `/app/auth/callback` → `/app/auth/callback/` com o login concluído | rejeitado |
| 16 | blind | Ligar o login sem `connect-src` para o Cognito quebraria a troca | medium | Real, mas é exatamente o passo de ligar (AD-26), que depende dos valores do stack aplicado | defer |
| 17 | blind | Dependência do comportamento de `prompt=none` do Cognito sem verificação | low | Documentado como exigência do managed login v2 (já fixado no template); só um deploy real confirma | defer |
| 18 | blind, gap | `main.mjs` testado só por texto do código | medium | Mitigado pela verificação no navegador real; mover a decisão de boot para um helper testável fica para quando o login for ligado | defer |
| 19 | blind, gap | Teste de `_headers` lê o código-fonte do build, não o arquivo gerado | low | Mesmo padrão já aceito na spec 5b; o `_headers` não é lido pelo Amplify | rejeitado |
| 20 | blind | CSP repetida em vários lugares | low | Já há teste que mantém `_headers` e `customHttp.yml` iguais; gerar de uma fonte única entra com o `connect-src` (AD-26) | defer |

**Verificação no navegador real (fora da matriz):** artefato com o login ligado só numa cópia temporária, servido por HTTPS local com um Cognito falso que confere o PKCE. Chrome headless via DevTools: carga sem sessão faz uma ida `prompt=none` e volta não autenticada; "Entrar" passa pelo authorize, pela callback e pela troca em `/app/` (verificação S256 do lado do Cognito falso: ok), com o botão em "Sair"; `sessionStorage` vazio, `localStorage` vazio; o histórico do navegador tem só `/app/` (nenhuma entrada com code ou token); recarga reautentica em silêncio; "Sair" chama `/oauth2/revoke` e `/logout`; duas recargas seguintes não redirecionam; zero exceções e zero bloqueios de CSP.


## Verification

**Commands:**
- `npm run validate` -- expected: check e todos os testes passam, zero falhas/skips.
- `npm run build:ui:local` -- expected: `status: built`, com `dist/ui/app/auth/callback/index.html`.
- `git diff --check` -- expected: sem erros.
