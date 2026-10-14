---
review: technology
target: ../ARCHITECTURE-SPINE.md
scope: 'Stack table, AD-19, AD-20, AD-21 dependency claim, secure-context assumption'
date: '2026-10-14'
verdict: CONCERNS
method: 'web verification (nodejs.org, MDN, web.dev) + repo evidence (package.json, amplify.yml, src/)'
---

# Technology Review — Architecture Spine, Epic 7

Mandate: flag every committed technical decision that could be out of date and was **not** confirmed against the web, the existing project, or a current starter. Each finding below carries severity, the web source and/or `file:line` evidence, and a concrete remediation.

**Verdict: CONCERNS.** The Stack table is accurate and matches repo reality. Nothing in the spine is factually wrong about versions. The concerns are all *omissions* in AD-20 and the Stack table: an unstated ArrayBuffer→hex adaptation, an unstated secure-context constraint, and an unstated Web Crypto `digest` input-type constraint. One of these (the hex gap) is load-bearing: a naive implementation of AD-20 as written fails every digest check.

---

## 1. Stack table — verified claim by claim

Spine lines 120–129.

### 1.1 `Node.js (desenvolvimento e teste) | >=24.0.0 (engines, amplify.yml usa 24)` — **CONFIRMED, no finding**

- Repo reality: `package.json` declares `"engines": { "node": ">=24.0.0" }`. Verbatim match.
- Repo reality: `amplify.yml` preBuild runs `nvm install 24` / `nvm use 24` / `node --version`. Verbatim match — the spine's parenthetical is literally true, not inferred.
- Web reality: Node.js 24.x ("Krypton") is a real release line, initial release 2025-05-06, **Active LTS** since 2025-10-28, maintenance from 2026-10-20, EOL 2028-04-30 — per the Node.js Release WG schedule ([nodejs/Release README](https://raw.githubusercontent.com/nodejs/Release/main/README.md)). Current line at review time is 26.x; 22.x is Maintenance LTS.
- **Note (low, informational):** Node 24 enters *Maintenance* on 2026-10-20 — six days after this spine's `created: 2026-10-14`. The line stays supported until 2028-04-30, so `>=24.0.0` is safe, but the project is pinning to an LTS line that stops receiving new features within the week. This is a fine choice; it is just worth knowing it was a boundary date, not a fresh one.
- Local toolchain divergence (low): the development machine runs `v25.9.0` (`node --version`), and 25.x went **End-of-Life 2026-06-01** per the same schedule. `>=24.0.0` admits it, and CI/Amplify pins 24, so this is a local hygiene note, not a spine defect. There is no `.nvmrc` to pin local dev (checked: absent).

**Severity: none for the claim itself. Low for the two notes.** Both notes are observations about the environment, not errors in the spine.

### 1.2 `JavaScript ES modules (.mjs) | ES2022+, sem transpilação` — **CONFIRMED, no finding**

- Repo reality: `package.json` has `"type": "module"`, every source file is `.mjs`, and sources use ES2022 features natively — private class fields (`#current`, `#intent`, `#manifest` at src/application/snapshot-reader.mjs:5), `Object.hasOwn` (src/adapters/memory-snapshots.mjs:57), top-level `await` in scripts (`scripts/build-ui-preview.mjs`).
- No build step touches JS: `npm run build` → `build:ui` → `node scripts/build-ui-preview.mjs`, which is a *file copy plus config injection* (`cp`, `writeFile`), not a transpile or bundle. Verified by reading the script. "sem transpilação" is therefore a description of the real pipeline, not an aspiration.
- Node 24 supports all of ES2022 natively. No finding.

### 1.3 `Runner de teste | node --test nativo` — **CONFIRMED stable, no finding**

- Repo reality: `"test": "node --test \"tests/*.test.mjs\""`. Executed during this review: **132 tests, 132 pass, 0 fail**, 459 ms. The runner is not aspirational, it is the working harness.
- Web reality: the `node:test` module is **Stability: 2 — Stable**, and the official docs' history table records "**v20.0.0 — The test runner is now stable**" ([Node.js Test runner docs](https://nodejs.org/api/test.html)). It is stable in 24.x, well before it. The spine's claim is correct and was not an over-reach.
- **Finding T-1 (low):** adjacent to the claim, `test:coverage` still uses `--experimental-test-coverage`, and that flag is **still experimental** in the installed runtime (confirmed: `node --help` lists `--experimental-test-coverage` under experimental flags). The spine's "runner nativo" statement is about `node --test` and is correct, but if any Epic 7 story adds a coverage gate it will be gating on an experimental flag. Worth one clause in the Stack table or Deferred section. Not a blocker.

### 1.4 `Web Crypto (crypto.subtle) | API de plataforma, sem dependência` — **CORRECT but under-specified; see §5 and §2**

The "no dependency" half is true (§4). The "platform API" half omits the secure-context constraint (§5) and the data-type constraints (§2). Findings are raised there.

---

## 2. AD-20 — digest injection: the port is awaited, but the spine omits the hex gap

Spine lines 80–84.

### 2.1 Is the `digest` port actually awaited? — **YES, claim CONFIRMED**

src/application/snapshot-reader.mjs:14:

```js
if (typeof bytes !== 'string' || await this.#digest(bytes) !== manifest.slices[slice].digest) throw new Error('SNAPSHOT_DIGEST_INVALID');
```

The port is invoked under `await` inside an `async` arrow (line 12, within `Promise.all(SLICES.map(async slice => …))`). An async digest implementation is therefore genuinely viable — the spine's phrase "a porta `digest` que `SnapshotReader` já aguarda" is precisely accurate and verifiable at that line. The existing synchronous Node implementation (`sha256Text`, src/adapters/memory-snapshots.mjs:6) also works under `await`, since `await` on a non-Promise resolves to the value. Both shapes are accepted. **No finding on awaitability.**

### 2.2 The ArrayBuffer-vs-hex gap — **FINDING T-2, HIGH**

The spine says the shell injects "um digest Web Crypto (`crypto.subtle.digest`)" as if it were drop-in. It is not, on two independent axes, and the spine mentions neither.

**Axis A — return type.** `crypto.subtle.digest()` "returns a `Promise` that fulfills with an **`ArrayBuffer`** containing the digest" ([MDN SubtleCrypto.digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)). Confirmed empirically in this runtime: `crypto.subtle.digest('SHA-256', …)` resolved to a value whose `constructor.name` is `ArrayBuffer`.

**What the reader compares it to.** src/application/snapshot-reader.mjs:14 compares with `!==` against `manifest.slices[slice].digest`, which the contract constrains to a 64-char lowercase hex string — src/contracts/snapshot.mjs:13:

```js
string(ref.objectKey, 'objectKey'); if (!/^[a-f0-9]{64}$/.test(ref.digest)) fail('digest');
```

And that is exactly what the Node adapter produces — src/adapters/memory-snapshots.mjs:6:

```js
export const sha256Text = text => createHash('sha256').update(text).digest('hex');
```

An `ArrayBuffer` is **never** `!==`-equal to a hex string. A shell that injects `crypto.subtle.digest` bound directly to the port makes **every slice fail** with `SNAPSHOT_DIGEST_INVALID` at line 14, which `refresh()` swallows into `kept-last-good` / `unavailable` with `errorCode: 'SNAPSHOT_INVALID_OR_UNAVAILABLE'` (lines 23) — a *silent, misattributed* failure that looks like corrupt data rather than a type mismatch. This is the worst failure shape for a debugging developer.

**Axis B — input type.** The port receives a **string** (`bytes`, guarded `typeof bytes !== 'string'` at line 14). But `crypto.subtle.digest`'s `data` parameter accepts only "an `ArrayBuffer`, a `TypedArray` or a `DataView`" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)) — a string is rejected. The shell must `new TextEncoder().encode(bytes)` first. The spine's `sha256Text` precedent hides this, because `createHash().update(string)` accepts strings natively.

**Axis C — algorithm name.** Node's `'sha256'` is not Web Crypto's `'SHA-256'`. The supported-values list is `"SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"` ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)). Minor, but part of the same unstated adapter.

**So AD-20's injected port is not `crypto.subtle.digest`; it is a three-step adapter around it:**

```js
const digest = async text =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).toHex();
```

(`Uint8Array.prototype.toHex` exists in this runtime — verified: `typeof Uint8Array.prototype.toHex === 'function'`. MDN notes it "became available in 2025" and documents the `Array.from(...).map(b => b.toString(16).padStart(2,'0')).join('')` fallback for older browsers. **A browser shell must use the fallback or feature-detect**, since `toHex` is far newer than the 2020-Baseline `digest` itself and is not safe to assume across the unstated browser matrix. This is a second, subtler currency trap inside the remediation.)

**Why HIGH, not medium:** AD-20 is a binding rule for "qualquer bundle de navegador". It is written as a port substitution ("injeta um digest Web Crypto … na porta que já aguarda"), which reads as compatible-by-construction. The spine asserts compatibility it never checked. A story implementing AD-20 literally gets a total, silently-misreported data-read failure. It is also the only AD in the spine whose correctness depends on a type contract the spine does not name.

**Remediation:** AD-20's Rule should state that the injected port must return a **lowercase hex string of 64 chars** matching `src/contracts/snapshot.mjs:13`, that the input is a **string that must be UTF-8 encoded** before hashing, and that encoding equivalence with `sha256Text` must be proven by a shared contract fixture (which AD-16 already demands: "fixtures nos dois lados"). One sentence plus one fixture closes it.

### 2.3 UTF-8 equivalence — **FINDING T-3, MEDIUM**

Beyond shape, the two digests must agree **byte for byte** on the same input. `createHash('sha256').update(text)` with no encoding argument defaults to UTF-8, and `TextEncoder` is UTF-8-only, so they agree for well-formed text. The inputs are `canonicalJson(...)` output (src/adapters/memory-snapshots.mjs:62), so BMP/ASCII-dominant and safe in practice.

But the equivalence is **asserted nowhere and tested nowhere**. Searching the suite, every `SnapshotReader` construction injects `sha256Text` — tests/local-snapshot.test.mjs:61,74, tests/helpers/local-fixtures.mjs:13, tests/integration-regressions.test.mjs:15, tests/update-regressions.test.mjs:39, scripts/demo-local-core.mjs:10. **Zero tests exercise a Web Crypto digest path.** AD-20 is thus an unverified-by-construction decision: the whole browser integrity story rests on an equivalence with no fixture. Lone surrogates (e.g. a `\uD800` surviving into a slice) encode differently in edge cases and would diverge. Add one cross-implementation fixture asserting `sha256Text(x) === webDigest(x)` for an ASCII, an accented-Portuguese, and an emoji payload.

### 2.4 The "nenhum módulo alcançável pelo navegador os importa" invariant — **CONFIRMED, no finding**

AD-20's isolation claim holds today, verified structurally: `grep "from 'node:"` across `src/domain`, `src/application`, `src/contracts` returns **nothing**. The only `node:crypto` import in `src/` is src/adapters/memory-snapshots.mjs:2, inside the `adapters/` layer the spine already fences off. All `src/application` and `src/domain` imports are relative (no bare specifiers), so no transitive package can drag Node builtins in. `SnapshotReader` is Node-free precisely because the `digest` port exists. The architecture already earns this rule — AD-20 is codifying observed reality, which is the good case.

---

## 3. AD-19 — History API semantics: current and non-deprecated

Spine lines 74–78.

### 3.1 pushState / replaceState / popstate are current — **CONFIRMED, no finding**

- `history.pushState()` is **Baseline Widely available**, "available across browsers since July 2015", spec'd in the living HTML standard (`#dom-history-pushstate-dev`) ([MDN History.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)). **Not deprecated.**
- `popstate` is **Baseline Widely available**, since July 2015 ([MDN popstate event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)).
- The spine's intent classification is semantically correct per spec: `pushState` "adds an entry to the browser's session history stack", `replaceState` modifies the current entry. So routing `company`/`tab`/`navigate`/result-selection → `pushState` and `base`/`layers`/`preference` → `replaceState` genuinely delivers the stated Prevents ("histórico inflado por toggle de Camada", "um único Back expulsar Andre do app"). This is sound design, not an assertion.

### 3.2 The "silent writer during popstate" approach is sound — **CONFIRMED, no finding**

MDN is explicit: "just calling `history.pushState()` or `history.replaceState()` won't trigger a `popstate` event" ([MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)). So there is no browser-level write/event feedback loop to break. The spine's "o escritor permanece silencioso durante o tratamento" guards against the *application-level* loop: `popstate` → `hydrateUrl` → state change → subscriber → writer → duplicate entry. That loop is real and the guard is the right one. Verified consistent with the domain: hydration writes only `sessionOverrides` and `explorationQuery` (src/domain/exploration-url.mjs:21–27) is a pure serializer with no side effects, so the writer can be suppressed without touching domain logic.

### 3.3 Two omissions worth one clause each

**FINDING T-4 (medium) — `pushState` rate limiting is a real exception path and the spine's chosen trigger set invites it.** MDN documents that `pushState` throws `SecurityError` "if the method is called too frequently" ([MDN History.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)). This is not theoretical: Safari enforces ~100 calls / 30 s, producing *fatal* `SecurityError: Attempt to use history.replaceState() more than 100 times per 30 seconds` — see [livewire/livewire discussion #5923](https://github.com/livewire/livewire/discussions/5923?sort=old) and [backstage #34941](https://github.com/backstage/backstage/issues/34941), which is a `replaceState` loop crashing Safari, plus the dedicated [history-throttled](https://github.com/joliss/history-throttled) shim built for exactly this. AD-19 assigns **`preference` and `layers` to `replaceState`** — precisely the high-frequency, user-draggable, rapidly-toggled interactions — and assigns **search-result selection to `pushState`**, i.e. a keyboard-repeatable action. AD-19 names no coalescing/throttle invariant and no error handling for a throwing address write. Since AD-19 declares the shell the *single* address writer, this is exactly the right place to fix the policy once. Add: the writer coalesces `replaceState` writes (e.g. one per frame / trailing debounce) and a failed address write must never break state (state is authoritative; the URL is a projection).

**FINDING T-5 (low) — the Navigation API now exists as the modern alternative and the spine does not acknowledge the choice.** The Navigation API reached **Baseline Newly available in early 2026**, with Safari and Firefox support landing, and is explicitly framed as the successor to the History API for SPA routing — it centralizes link clicks, form submissions, back/forward and programmatic navigation in one `navigate` event, and handles URL updates and focus restoration automatically ([web.dev, Feb 2026](https://web.dev/blog/baseline-navigation-api); [InfoQ](https://www.infoq.com/news/2026/05/navigation-api-browser/)). The same article names the limitation AD-19 is working around: "the `popstate` event also behaves inconsistently, and doesn't trigger when `pushState` or `replaceState` are called programmatically."

AD-19 is **not wrong** — History API is Widely available (2015) while Navigation is only Newly available (2026), so for a spine fixing invariants today, History is the conservative and defensible pick, and its automatic focus management would partly collide with the Q3 accessibility work the spine defers. But "Newly available" vs "Widely available" is a *decision*, and the spine presents History as the only option. One line acknowledging the Navigation API and why it was not chosen converts an unexamined default into a recorded decision. Note also, relevant to AD-19's correctness: MDN warns browsers "may not fire the `popstate` event at all unless the page has been interacted with" ([MDN popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)) — benign for Back-button handling, but a constraint on any programmatic `history.back()` in tests.

---

## 4. "Nenhum pacote novo é introduzido por este spine" — CONFIRMED

Spine line 129. Audited every AD for a hidden dependency:

| AD | Requires | New package? |
| --- | --- | --- |
| AD-18 store wrapper | `getState`/`dispatch`/`subscribe` over the existing `explorationReducer`; ~30 lines, no library | No. Explicitly *not* Redux — the spine's "um único módulo em `src/application/`" rules out a state library. |
| AD-19 address writer | `history.pushState`/`replaceState`, `popstate`, `URLSearchParams` — all platform; serialization already exists at src/domain/exploration-url.mjs:21 | No. (Caveat: a throttle shim like `history-throttled` would be a package — the correct fix for T-4 is ~5 lines of own code, not a dependency. Flagging so the remediation does not *create* a violation.) |
| AD-20 digest | `crypto.subtle` + `TextEncoder`, both platform | No — and this is the AD's whole point: it exists to *prevent* `node:crypto` reaching the bundle. Needs the hex helper of §2.2, which is own code. |
| AD-21 fixtures | Bundled synthetic JSON + injected ports | No. |
| AD-22 remaps | A manifest contract field + fixtures in `src/contracts/` | No. |
| AD-23 disposal | `unsubscribe` return + existing `LocalSearch.cancel()` | No. |
| AD-24 alias table | One translation table at the edge; `parseExplorationUrl` already does this for `view=` (src/domain/exploration-url.mjs:16) | No. |

Repo corroboration: `package.json` has **no `dependencies` and no `devDependencies` at all** — zero-dependency is the established project reality, not a wish. The claim is honest, and no AD smuggles in a package.

**One scope caveat (low, not a contradiction):** the spine's own line 129 defers Bundler and CesiumJS to Q9/Q12, and `src/ui/` (Structural Seed, line 139) does not yet exist. A browser shell shipping `.mjs` ES modules does not strictly need a bundler (native `<script type="module">` works), so "no new package" is achievable — but it is contingent on the Q9 answer, which the spine correctly flags. Current preview reality supports this: `scripts/build-ui-preview.mjs` only copies files, and the shipped mockups in `dist/ui` contain **no** `type="module"` script and **no** `pushState`/`crypto.subtle` usage (verified by grep) — i.e. the shell really is greenfield, as the spine states at line 23.

---

## 5. `crypto.subtle` and secure context — the spine should state the constraint

**FINDING T-6, MEDIUM (becomes HIGH if any story serves the preview over plain HTTP on a LAN/IP host).**

The Stack table calls `crypto.subtle` an "API de plataforma, sem dependência" and AD-20 assumes availability unconditionally. Both MDN pages carry the same banner:

> **Secure context:** This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.

— for both [`Crypto.subtle`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle) and [`SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest). In a non-secure context `crypto.subtle` is **`undefined`**, so AD-20's injected port throws `TypeError` and `refresh()` buries it as `SNAPSHOT_INVALID_OR_UNAVAILABLE` (src/application/snapshot-reader.mjs:23) — the same silent misattribution as T-2. Chromium restricted `crypto.subtle` to secure origins deliberately ([Chromium review 299253003](http://codereview.chromium.org/299253003)), and the breakage pattern is live in the wild ([meshmonitor #3608](https://github.com/Yeraze/meshmonitor/pull/3608), a fix for a hash not deriving in non-secure HTTP contexts).

**Does it bite this project?** Per [MDN Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts), potentially-trustworthy origins include `https`, `file`, `localhost`/`localhost.`/`*.localhost`, `127.0.0.0/8`, `::1/128`. Against repo reality:

- Local preview is served at `http://127.0.0.1:8767` / `http://localhost:8767` (docs/ui-templates.md:10, and the Cesium token's allow-list at docs/ui-templates.md:35). **Loopback ⇒ secure context ⇒ `crypto.subtle` available.** Safe today.
- Production is `https://irisglobal.com.br`, and `scripts/build-ui-preview.mjs` *enforces* HTTPS at build time — it rejects any `CESIUM_APP_ORIGIN` whose `url.protocol !== 'https:'` and even rejects `localhost`/`127.0.0.1`/`[::1]` as the public origin. **HTTPS ⇒ secure context.** Safe today.

So today both paths are secure contexts — by accident of good practice, and only because that build guard happens to exist for Cesium-token reasons, not because AD-20 requires it. The gap is that **nothing in the spine records this dependency.** A story that serves the preview from `http://192.168.x.x:8767` for a tablet/touch review — and the spine defers "toque" and "a matriz de browser" to the Q3 UI stories (line 156), making exactly that scenario likely — lands in a non-secure context and AD-20 silently fails. The constraint is invisible to the person most likely to break it.

**Remediation:** add to the Stack table or AD-20: "`crypto.subtle` requires a secure context (HTTPS, `localhost`/loopback, or `file:`); the shell must fail loudly and distinguishably when `crypto.subtle` is unavailable, and any host serving the shell must be a secure context." A one-line `isSecureContext` precondition check in the shell (MDN recommends `window.isSecureContext` for exactly this feature detection) turns a silent data-unavailable into a diagnosable error.

**Related (low):** the Q12 Deferred item (line 154) is well-founded and reality-checked — AWS Amplify Hosting for a static SPA genuinely has no server-side authorization layer, which is why Amplify's own authenticated/SSR story requires a compute target rather than static artifacts ([AWS Amplify SSR docs](https://docs.amplify.aws/javascript/frontend/server-side-rendering/)). `amplify.yml` here publishes pure static artifacts (`baseDirectory: dist/ui`, `files: '**/*'`) with no compute, confirming the spine's observation. AD-21 holding the line until Q12 is correct and well-evidenced. No action.

---

## Findings summary

| ID | Severity | Finding | Evidence |
| --- | --- | --- | --- |
| T-2 | **high** | AD-20 omits that `crypto.subtle.digest` resolves to an **ArrayBuffer** while the port is compared to a **64-char hex string**; also needs `TextEncoder` input and `'SHA-256'` naming. A literal implementation fails every digest check, silently reported as `SNAPSHOT_INVALID_OR_UNAVAILABLE`. | [MDN digest](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest); src/application/snapshot-reader.mjs:14; src/contracts/snapshot.mjs:13; src/adapters/memory-snapshots.mjs:6 |
| T-3 | medium | UTF-8 byte-equivalence between `sha256Text` and a Web Crypto digest is asserted nowhere and tested nowhere — all 6 injection sites use `sha256Text`. AD-16 already requires two-sided fixtures. | tests/local-snapshot.test.mjs:61,74; tests/helpers/local-fixtures.mjs:13; tests/integration-regressions.test.mjs:15; tests/update-regressions.test.mjs:39 |
| T-6 | medium | Stack table and AD-20 assume `crypto.subtle` is unconditionally available; it is **secure-context-only** (`undefined` otherwise). Today's loopback + HTTPS paths are safe, but the constraint is unstated and the deferred touch/browser-matrix stories invite a plain-HTTP LAN host. | [MDN Crypto.subtle](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/subtle), [MDN Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts); docs/ui-templates.md:10; scripts/build-ui-preview.mjs |
| T-4 | medium | AD-19 omits `pushState`/`replaceState` rate limiting (`SecurityError` when called too frequently; Safari ~100/30 s is fatal) while assigning the highest-frequency interactions (`layers`, `preference`) to `replaceState`. No coalescing or write-failure invariant. | [MDN pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState); [livewire #5923](https://github.com/livewire/livewire/discussions/5923?sort=old); [backstage #34941](https://github.com/backstage/backstage/issues/34941) |
| T-5 | low | The Navigation API became Baseline Newly available in early 2026 and is the stated successor for SPA routing; AD-19 picks History (defensibly, Widely available since 2015) without recording that the alternative was considered. | [web.dev Feb 2026](https://web.dev/blog/baseline-navigation-api); [InfoQ](https://www.infoq.com/news/2026/05/navigation-api-browser/) |
| T-1 | low | `test:coverage` relies on the still-experimental `--experimental-test-coverage`, adjacent to the (correct) "runner nativo" claim. | package.json; `node --help` |
| — | low | Node 24 enters Maintenance 2026-10-20 (6 days post-spine); local dev runs EOL'd v25.9.0 with no `.nvmrc`. Claim remains valid. | [nodejs/Release](https://raw.githubusercontent.com/nodejs/Release/main/README.md) |

## What the spine got right, and verifiably so

Worth recording, because the mandate is to separate asserted from checked:

- **Every Stack version claim is true and matches the repo**, including the `amplify.yml usa 24` parenthetical, verified line by line. Nothing in the table is stale.
- **`node --test` is genuinely stable** (stable since v20.0.0 per Node's own history table) and genuinely the working harness (132/132 passing on execution).
- **"sem transpilação" describes the real pipeline**, confirmed by reading `scripts/build-ui-preview.mjs` — it copies and injects, it does not compile.
- **AD-20's core premise is correct and non-obvious**: the `digest` port *is* awaited at src/application/snapshot-reader.mjs:14, so an async Web Crypto digest is viable. The architecture genuinely supports the decision.
- **AD-20's Node-isolation invariant holds today**, proven structurally: no `node:` import anywhere in `domain`/`application`/`contracts`, and no bare specifiers to drag one in transitively.
- **AD-19's History API semantics are accurate and non-deprecated**, and the write/event-loop reasoning is spec-correct (`pushState` does not fire `popstate`).
- **"Nenhum pacote novo"** is true across all seven ADs, backed by a `package.json` with literally zero declared dependencies.
- **The Q12 deferral is reality-checked**, matching both `amplify.yml`'s static-only artifacts and Amplify's documented need for a compute target to do server-side authorization.

The failure mode in this spine is not stale versions. It is **three unstated platform constraints** (hex encoding, string→bytes encoding, secure context) concentrated in AD-20's single sentence, plus an unstated rate limit in AD-19. All four are closable with a clause each, plus one cross-implementation digest fixture that AD-16 already obliges.
