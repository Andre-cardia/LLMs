---
review: inherited-conflict-and-dropped-requirement
subject: _bmad-output/planning-artifacts/architecture/architecture-epic-7-2026-10-14/ARCHITECTURE-SPINE.md
binding_parent: _bmad-output/planning-artifacts/architecture/architecture-LLMs-2026-10-10/ARCHITECTURE-SPINE.md
parent_status: final (READ-ONLY)
child_altitude: epic (AD-18..AD-24)
checked: 2026-10-14
verdict: CONCERNS
---

# Review — Epic 7 spine against its binding parent

Two jobs: (A) conflict check of AD-18..AD-24 against parent AD-1..AD-17; (B) dropped-requirement
check against `epics.md` Story 7.1, `deferred-work.md`, the sprint-readiness dependency table, and
`acceptance-7-1-local.md`.

The parent is `status: final` and read-only. Where the child contradicts the parent, the finding is
recorded as a conflict to surface to the parent's owner, never as a local override.

**Verdict: CONCERNS.** No AD-18..AD-24 rule is a frank repudiation of a parent AD, and the child is
unusually disciplined about naming its inheritance (lines 45–53). But there are three structural
defects that must be fixed before the child can be treated as binding: an invented gate ID (Q12) at
epic altitude that displaces a parent-owned gate (critical), a manifest contract change asserted by
AD-22 without naming the AD-2/AD-16 authority that must make it (high), and a structural-seed
contradiction (`src/ui/` ownership, high). Beyond those, four of the six readiness-table rows are
addressed, one is partially addressed, and one is silently dropped; Story 7.1's criterion 1 and
criterion 2 are only partially supported architecturally.

---

## Part A — Conflict check, AD-18..AD-24 vs parent AD-1..AD-17

### A1. AD-21 vs parent AD-9 and AD-14 — legitimate scoping, but the gate that carries it is illegitimate

**Finding A1 — severity: medium (the scoping itself) / see A5 for the critical part.**

AD-21 (child:86–90) rules that the browser shell is fed only by bundled synthetic fixtures, that
real Cadastro, curated snapshot, Histórico and any private JSON are *vedado* by that path "enquanto
a hospedagem não tiver autorização server-side", and that a `Symbol`-comparison
`authorizeRead: c => c === owner` is fixture and "não pode ser promovida".

Checked against parent AD-9 (parent:90–94): "identidade verificada e allowlist do dono antes de
servir assets, JSON ou comandos… Config ausente nega acesso. Origens alternativas e previews
precisam da mesma prova." And parent AD-14 (parent:120–124): "local/test usam fixtures sintéticas;
preview/prod têm bancos, objetos, segredos, ledgers e identidades isolados."

**This is legitimate scoping, not a weakening.** AD-21 is strictly *more* restrictive than AD-9: it
refuses to serve any private asset at all, which satisfies AD-9's "config ausente nega acesso" by
the strongest available means, and it aligns the browser preview with AD-14's "local/test usam
fixtures sintéticas" rather than inventing a third environment class. The explicit ban on promoting
the `Symbol` comparison to real authorization (child:90) is exactly the anti-weakening clause one
would want. Parent AD-17 (parent:142) already establishes the same pattern for coordinates
("coordenadas do protótipo permanecem fixtures"), so AD-21 is consistent with house style.

Two residual gaps keep this at medium rather than clean:

1. **AD-14's preview/prod isolation is not restated for the fixture bundle.** AD-21 governs what the
   shell *reads*; it does not say the fixture bundle is forbidden from being built with, or deployed
   alongside, preview/prod secrets or identities. `acceptance-7-1-local.md:32` records that
   `npm run build:ui:local` already ships to `https://irisglobal.com.br` carrying a Cesium Ion token
   via build env (confirmed in `scripts/build-ui-preview.mjs`, which writes
   `dist/ui/assets/cesium-config.json` with the token at mode `0o600` plus a `no-store` header).
   That is a real deployed artifact with a real credential sitting on the same origin the fixture
   shell will occupy. AD-21 says nothing about it, and AD-9's "Segredos ficam em bindings/env
   servidor e nunca nos snapshots, bundles, URLs ou logs" (parent:94) is directly in tension with a
   static build that writes a token into a fetchable JSON under `dist/ui/`. The child spine should
   either bind that case or explicitly defer it; it does neither.
2. **AD-21's own scope sentence is narrower than AD-9's.** AD-9 binds "todas as rotas, objetos,
   Histórico e mutações" (parent:92). AD-21 binds only *reads* ("`readSnapshot`, `readFeedback`,
   `resolveAlias` e `clock`", child:90). The shell also writes — `persistPreferences` (child:72) and
   `localStorage` (child:27). Nothing in the child says that a preference write from an
   unauthenticated browser is forbidden or is also fixture-scoped. Under AD-9 a mutation requires
   "Origin/CSRF, método, schema e autorização" (parent:94); under AD-21 as written, a
   `localStorage` preference write is simply unaddressed. Story 7.1 criterion 3 requires the URL path
   to "continua exigindo autenticação" (`epics.md:1639`) — see B3.

**Required action:** keep AD-21, but extend its rule to cover the write side and to state that the
fixture bundle inherits AD-14's environment isolation and AD-9's no-secrets-in-bundle clause. Do not
weaken AD-9's wording to match AD-21.

### A2. AD-18 vs parent AD-10 and AD-1 — consistent; one placement conflict

**Finding A2a — severity: low.** AD-18 (child:68–72) puts a single `src/application/` module in sole
possession of `getState`/`dispatch`/`subscribe` over `explorationReducer`, forbids the store from
owning DOM or `localStorage`, forbids reentrant dispatch, and states "Nenhum outro módulo mantém
estado de exploração próprio."

Against parent AD-10 (parent:96–100): "um reducer é o único escritor semântico do store: intents
tipados, preferences persistidas, sessionOverrides e effectiveState separados." Against parent AD-1
(parent:42–46): "somente `domain` define essas regras; `application` é a entrada de comandos."

**No conflict.** AD-18 is a faithful epic-altitude refinement: it names the owner of the *wrapper*
without moving the semantic writer out of `domain`, and "dispatch devolve os efeitos ao chamador e
nunca os executa" preserves AD-1's "UI consulta projeções e emite intenções". Placing the wrapper in
`application` rather than `ui` is the AD-1-correct choice, because a wrapper in `ui` would make the
shell a command entry point.

**Finding A2b — severity: high.** The placement *does* conflict with the parent's Structural Seed,
which assigns the store to `src/ui/`: "`src/ui/` store, componentes vanilla, renderers"
(parent:193). The child's Structural Seed (child:133–140) silently reassigns: `application/` gains
"`+ store (AD-18, novo)`" and `ui/` is redescribed as "shell de navegador (novo): DOM, history,
storage, digest, fixtures" — with no `store` and no note that the parent said otherwise. The child's
own Deferred section does not mention it either.

This is a genuine parent contradiction, and it is the *silent* kind this review is looking for. The
child's choice is architecturally better (it is what AD-1 implies, and `src/ui/` does not even exist
in the repo today — `src/application/`, `src/domain/`, `src/contracts/`, `src/adapters/` do), but the
child is not entitled to resolve it by quietly rewriting the parent's directory table. It must be
surfaced as a parent-level correction to parent:193.

**Required action:** add an explicit conflict note to the child (Deferred or an "Inherited
Invariants" row) citing parent:193, stating that AD-18 relocates the store to `src/application/` and
that the parent's Structural Seed needs a corresponding correction. Do not leave the two tables
disagreeing.

**Finding A2c — severity: medium.** AD-10 also requires that the single semantic store carry
"preferences persistidas" and that "Lateral Leitor/Fila/MERCADOS exclusivos; `Esc` age no foco
superior e completa digitação primeiro" (parent:100). AD-18 hands `persistPreferences` execution to
the shell (child:72) — correct, as an effect — but no child AD assigns ownership of the `Esc`
priority / typing-completion rule or the exclusive side-panel rule. The child defers "foco, `Esc`,
teclado, toque" to UI stories under Q3 (child:156). That deferral is defensible for *visual* focus
behavior, but `Esc` priority and panel exclusivity are **semantic reducer behavior already encoded
in the contract** (`src/contracts/exploration.mjs:129` constrains `panel` to `queue|markets|null`;
`escape` is a typed intent at line 113). Deferring them to "stories de UI" risks a UI story
reimplementing them outside the reducer, which is precisely what AD-1 and AD-10 forbid. The child
should state that `Esc`/panel semantics remain reducer-owned and that Q3 defers only presentation.

### A3. AD-22 vs parent AD-2 and AD-16 — a manifest contract change is asserted without naming its authority

**Finding A3 — severity: high.**

AD-22 (child:92–96) rules: "o Publicador declara os `companyRemaps` no manifesto da revisão"; and
"O contrato do manifesto precisa carregar esse campo, com fixtures válidas e inválidas nos dois
lados, antes das stories consumidoras."

Parent AD-2 (parent:48–52): "O Publisher é o único escritor do manifesto `schemaVersion: 1`, com
`revision`, `publishedAt`, `curationRevision` e refs imutáveis por slice."
Parent AD-16 (parent:132–136): "`src/contracts/` é a única definição executável de formatos de
fronteira, sob responsabilidade do núcleo Domain/Contracts… Mudança incompatível exige nova
versão/migração, nunca heurística local."
Parent Consistency Conventions (parent:148): "`/api/v1`, `schemaVersion: 1`; incompatibilidade
rejeita, migração explícita."

**Yes, AD-22 requires a manifest contract change that AD-2 and AD-16 govern, and no, that is not
stated.** Three concrete problems:

1. **The manifest field list in AD-2 is closed and does not include remaps.** AD-2 enumerates
   `revision`, `publishedAt`, `curationRevision` and per-slice refs. The executable contract enforces
   that enumeration *strictly*: `src/contracts/snapshot.mjs:8` calls
   `object(value, ['schemaVersion','revision','curationRevision','publishedAt','slices'], 'Manifest')`,
   and `object()` in `src/contracts/primitives.mjs` fails on any key-count mismatch
   ("campos incompatíveis"). Adding `companyRemaps` to the manifest is therefore a **breaking change
   to an existing, shipped, strictly-validated v1 schema** — every current manifest fixture would
   still pass, but every new manifest carrying remaps would be *rejected* by the current validator
   until the contract is changed. AD-22 states the field "precisa carregar esse campo" as if it were
   an additive note, and never says who changes it or under what version discipline.
2. **AD-16's "nova versão/migração" clause is not invoked.** Under parent:136 and parent:148, an
   incompatible change to a boundary format "exige nova versão/migração, nunca heurística local."
   AD-22 must either (a) argue that adding `companyRemaps` is compatible and stays at
   `schemaVersion: 1` — which the strict `object()` check makes hard to sustain for the *producer*
   side — or (b) name the migration. It does neither. Silence here is exactly the "quiet
   reinterpretation" failure mode: a reader of AD-22 alone would add a manifest field at epic
   altitude without a version decision.
3. **AD-22 names the wrong author.** AD-22's rule sentence makes the *Publicador* declare the field,
   and the child's binds line says "contrato de manifesto" (child:94). But under AD-16 the *author*
   of `src/contracts/` is "o núcleo Domain/Contracts", not the Publisher; the Publisher is only the
   sole *writer of manifest instances* (AD-2). AD-22 conflates "only writer of the data" with
   "author of the schema." The two are different owners under AD-2 vs AD-16, and AD-1's
   one-rule-one-owner makes the distinction load-bearing.

Supporting evidence that the child *could* have cited and did not: the remap vocabulary already
exists on the **intent** side — `advanceSnapshot` already accepts `companyRemaps` with
`{fromCompanyId,toCompanyId}` validation (`src/contracts/exploration.mjs:113` and `:138-141`). So the
delta AD-22 actually needs is narrow and well-defined: carry the same shape from the manifest through
`LocalNewsView`'s frame. `src/application/local-news-view.mjs:26-39` shows the frame today returns
`{data, now, hiddenNewsIds, dataRevision, feedbackRevision}` — **no remap channel at all**. AD-22
says remaps "atravessam o frame de `LocalNewsView`" (child:96) without noting that the frame has no
such field and that adding one is a second contract change on a second boundary.

**Required action:** rewrite AD-22's final sentence to (i) name Domain/Contracts as the schema author
per AD-16, (ii) state the `schemaVersion` decision explicitly (bump vs. compatible-additive, with
the `object()` strictness in `src/contracts/primitives.mjs` as the deciding evidence), (iii) name the
`LocalNewsView` frame field as a second contract surface, and (iv) record that AD-2's manifest field
enumeration at parent:52 needs a parent-level update. Do not add the field at epic altitude on the
child's own authority.

### A4. AD-24 vs parent AD-10's Q11 clause and the parent's Q11 resolution — the principle is right, the alias inventory is unsourced and partly wrong

**Finding A4a — severity: medium.**

AD-24 (child:104–108) makes `src/contracts/` canonical (`tab: globe|models|news`, `mode: dark|light`,
`company=`, `base=MAPA|SAT`) and treats the published prototype's forms (`tab=globo`,
`mode=claro|escuro`, `select=`, `view=3d`, `reader=`, `pov=`) as legacy aliases translated in one
table at the input edge.

Parent AD-10 (parent:100): "URL restaura a base/contexto da sessão sem sobrescrever preferência
persistida; **compatibilidade dos parâmetros legados é Q11**."
Parent Q11 resolution (parent:216): "estado canônico usa `base: MAPA|SAT`, intent de troca de base e
projeção 3D fixa; URL nova serializa `base`. `view=MAPA|SAT` são aliases legados, `view=3D` não
escolhe uma base, `view=2D` cai na base inicial configurada sem projetar mapa plano, e `base`
prevalece se coexistir com `view`. A base inicial segue aberta em Q6. Domain/Contracts publica schema
e fixtures executáveis via AD-16 antes das stories consumidoras."

**Partly consistent, partly a silent reinterpretation.** The canonical-vocabulary principle and the
"one table at the input edge, no scattered heuristics, never emit a legacy alias on serialization"
rule are a clean refinement of Q11 and of AD-16. The implementation already matches for `view`:
`src/domain/exploration-url.mjs:14-16` implements base-sovereignty and the `3D` exclusion exactly as
Q11 resolved, and `explorationQuery` (`:21-26`) emits only canonical keys. AD-24's citation of
`parseExplorationUrl` as the precedent is accurate.

The problems:

1. **AD-24 lists `view=3d` lowercase; Q11 and the code are uppercase `3D`.** Parent:216 says
   `view=3D`; `exploration-url.mjs:16` compares `one('view') !== '3D'` — a case-sensitive string
   compare. AD-24's `view=3d` (child:108) would, read literally, be treated as a *base* value, hit
   `base()`, fail `config.availableBases.includes('3d')`, and fall back to `initialBase`. That is the
   `view=2D` behavior Q11 assigned, not the `view=3D` behavior. A one-character discrepancy in a
   normative alias inventory is a real defect, because AD-24's whole point is that the table is
   authoritative and singular.
2. **AD-24 silently expands Q11's scope without saying so.** Q11 (parent:216) resolves *only* the
   `view`/`base` family. AD-24 adds five more aliases — `tab=globo`, `mode=claro|escuro`, `select=`,
   `reader=`, `pov=` — and presents the whole set as settled. But AD-10 assigns "compatibilidade dos
   parâmetros legados" to Q11 as a class, not just to `view`. Resolving the remaining five at epic
   altitude is deciding a parent-owned gate. The honest framing is either "Q11 is hereby extended,
   surfaced to the parent" or "AD-24 governs only translation *mechanism*; the per-parameter
   inventory needs Q11 confirmation." AD-24 asserts the inventory as fact.
3. **The inventory is incomplete and one entry has no canonical target.** Verified against the
   published prototypes: `prototype-artificial-analysis.html` reads `mode` (line 722,
   `pick(params.get('mode'),['claro','escuro'],'claro')`), `tab` (line 1132,
   `pick(...,['globo','models','news'],'models')`), `reader` (1133), `select` (845, 1134), `pov`
   (1135); `prototype-globe.html` reads `tab`/`reader`/`select`/`pov` plus **`theme`** (per the
   template gallery links at `prototype-artificial-analysis.html:848`, which generate
   `prototype-globe.html?theme=<k>&mode=<m>`). `theme` is a real published URL parameter and a real
   canonical preference key (`src/contracts/exploration.mjs:52` enumerates
   `theme: artificial-analysis|osiris|ambar|noturna`), and it is **absent from AD-24's table**.
   Meanwhile `pov=asia` (line 1135 → `G.pointOfView(...)`) has **no canonical counterpart at all** —
   camera position is not in `explorationQuery` and AD-10 says base switching "preserva câmera"
   without putting camera in the URL. AD-24 lists `pov=` as an alias to be "traduzido" without
   saying what it translates *to*, or that the correct answer may be "dropped."
4. **`mode` is a persisted preference, not session state — AD-24 does not say which side wins.**
   `mode` is in `PREFERENCE_KEYS` (`src/contracts/exploration.mjs:9`). AD-10 is explicit: "URL
   restaura a base/contexto da sessão **sem sobrescrever preferência persistida**" and "Hidratação de
   URL não dispara persistência" (parent:100). AD-19 restates the second half correctly ("hidratação
   grava apenas `sessionOverrides` e nunca persiste preferência", child:78), but AD-24 adds
   `mode=claro|escuro` to the *URL* vocabulary without reconciling it: today
   `parseExplorationUrl` returns overrides for `layers`, `base`, `tab`, `company` only
   (`exploration-url.mjs:10-19`) — there is no `mode` override path, and
   `assertExplorationUrlContext` accepts only `{companyIds, config}`
   (`src/contracts/exploration.mjs:86-91`). So AD-24 implies a new session-override channel for a
   preference key, which is the exact seam AD-10 guards. Unstated.

**Required action:** correct `view=3d` → `view=3D`; add `theme`; state `pov=` as dropped-not-
translated (or name its canonical target); state explicitly whether `mode=` becomes a session
override and how AD-10's no-overwrite-persisted-preference rule is honored; and reframe the inventory
as a Q11 extension surfaced to the parent rather than as a settled epic-altitude fact.

### A5. Q12 as a new open question derived from Q2 — not legitimate at epic altitude

**Finding A5 — severity: critical.**

The child introduces Q12 (child:154): "AD-9 exige authz server-side com vocabulário Cloudflare
Workers, mas a hospedagem observada é AWS Amplify estático, sem camada server-side. Andre decide:
reconciliar AD-9 com Amplify nomeando a camada autenticada, confirmar outro provedor, ou manter o
preview permanentemente só com fixtures. Até então vale AD-21." Q12 is then load-bearing throughout
the child: it is referenced in the AD-9 inheritance row (child:50), in AD-21's binds and title
(child:86, 88), and in the Stack note (child:129).

Confirmed new: a repository-wide search for `Q12` outside
`architecture-epic-7-2026-10-14/` returns nothing. Q1..Q11 are all defined in the parent's Deferred
section (parent:207–216); the gate ID namespace is demonstrably parent-owned and parent-numbered.

**The substance of Q12 is correct and important. The mechanism is wrong.** Three reasons:

1. **The gate ID namespace belongs to the parent.** Q1..Q11 live at parent:207–216 and are
   cross-referenced from parent ADs (AD-10→Q11, AD-13→Q4, AD-17→Q6/Q8). Minting Q12 in a child
   creates an ID that the parent does not know about, cannot see, and cannot resolve — while the
   child's own AD-21 is *conditioned* on that invisible gate ("enquanto Q12 estiver aberto",
   child:88). If the parent is later updated by someone who has not read this child, Q12 is a
   dangling reference. This violates the spirit of AD-1 (one rule, one owner) applied to the
   decision-gate register.
2. **The content is already inside a parent gate.** Parent Q2 (parent:208): "antes das stories de
   infraestrutura: aceite de hospedagem/IdP/custo total e prova de limites do job, transações,
   proteção e recuperação. **Seed Cloudflare é proposta; alternativas preservam as mesmas portas.**"
   Hosting acceptance, IdP, and asset/data protection are *definitionally* Q2. The child even
   acknowledges this framing is Q2's, since the readiness report files the same item as "Q2 / acesso"
   (`sprint-readiness-2026-10-13-continuacao-7-1.md:46`): "Reconciliar hospedagem/pipeline, IdP,
   proteção de assets/dados, negação e revogação com AD-9." The child renamed an existing parent gate
   instead of citing it, and the readiness report's wording is the proof that the input the child was
   given called it Q2.
3. **One of Q12's three options would amend a final parent AD.** Q12 offers "reconciliar AD-9 com
   Amplify nomeando a camada autenticada" (child:154). AD-9's rule text names a Worker with
   `run_worker_first: true` and JWT/JWKS (parent:94). Renaming AD-9's authenticated layer is an
   amendment to a `final` parent AD — the most clearly parent-altitude action in the whole child
   document — and the child presents it as a bullet in its own Deferred list, under an ID it coined.
   Notably, the child's own front-matter `binds:` (child:11) includes AD-9, i.e. it declares itself
   bound by the AD whose amendment it is scheduling.

Also: the child's Q12 asserts "a hospedagem observada é AWS Amplify estático". That is consistent
with the readiness report ("`amplify.yml` é configuração observada; não resolve o desenho de
autorização nem comprova deploy", `sprint-readiness-...-7-1.md:46`) and with the child's own Stack
row (child:124, "`amplify.yml` usa 24"), so the observation is sound — but the readiness report is
equally explicit that configuration "não comprova hospedagem ou acesso real"
(`sprint-readiness-...-7-1.md:29`). Q12's premise should carry that caveat; as written it states the
hosting fact more confidently than its own source does.

**Required action:** retire Q12. Re-express the item as **"Q2 (escopo de acesso do navegador)"**,
cite parent:208 and parent:94, and raise the AD-9-vs-Amplify contradiction as an explicit
**parent-level conflict for AD-9**, to be resolved in the parent spine. Rewrite the four child
references (child:50, 86, 88, 129) accordingly. AD-21 can keep its substance verbatim; only the gate
it hangs on changes. Until the parent resolves it, AD-21 is the correct interim rule.

### A6. AD-19, AD-20, AD-23 — no parent conflict found

**Finding A6 — severity: none (recorded for completeness).**

- **AD-19** (child:74–78): single address writer, `pushState` for `company|tab|navigate|result`,
  `replaceState` for `base|layers|preference`, `popstate` → `hydrateUrl` with the writer silent,
  hydration writes only `sessionOverrides`. Faithful to AD-10's "Hidratação de URL não dispara
  persistência" and to Q11's "URL nova serializa `base`" (parent:100, parent:216). The
  pushState/replaceState split is new detail, not a contradiction, and the readiness report
  explicitly asked for exactly this policy to be *registered* rather than inferred
  (`sprint-readiness-...-7-1.md:47`). Good.
- **AD-20** (child:80–84): Web Crypto digest injected into the `digest` port;
  `src/adapters/memory-snapshots.mjs` and `sha256Text` stay Node/test-only; nothing
  browser-reachable imports them. This is the direct architectural answer to the readiness row "Não
  importar `memory-snapshots.mjs` no navegador: usa `node:crypto`"
  (`sprint-readiness-...-7-1.md:45`), and it respects AD-2's digest-validated read path
  (parent:52) and AD-14's local/test fixture boundary. No conflict.
- **AD-23** (child:98–102): `subscribe` returns `unsubscribe`; on store-instance swap or permission
  loss the shell cancels subscriptions, calls `LocalSearch.cancel()`, abandons in-flight work; a
  disposal test is required before story close. This is the architectural home for CR-05
  (`deferred-work.md:34`) and for the readiness "Lifecycle / Q3" row
  (`sprint-readiness-...-7-1.md:50`). It does not touch any parent AD's rule. Good — and the
  "Teste de disposal comprova isolamento entre instâncias antes de fechar a story" clause is the
  kind of enforceable obligation this review wants to see more of.

### A7. Front-matter `binds:` omits two parent ADs the child actually constrains

**Finding A7 — severity: medium.**

Child front-matter (child:11) declares `binds: [FR-37, FR-38, AD-1, AD-2, AD-3, AD-9, AD-10, AD-15,
AD-16]`, and the Inherited Invariants table (child:45–53) mirrors it exactly. Two parent ADs are
materially engaged and listed nowhere:

- **AD-14** (parent:120–124, environment separation / synthetic fixtures in local-test). AD-21 is
  functionally an AD-14 application; the review prompt itself names AD-14 as in-scope. Its absence
  from both the binds list and the inheritance table is why the bundle-and-secrets gap in A1 has no
  owner.
- **AD-17** (parent:138–142, CesiumJS renderer owns no product state). The child's Stack says
  "CesiumJS e hospedagem autenticada permanecem sob Q9 e Q12" (child:129) and the Deferred list
  touches Q9 (child:159) — but AD-17 is the AD that governs how the future `GlobeRenderer` receives
  the AD-10 projection and returns typed intents. Story 7.1 criterion 2 requires "Empresa abre
  GLOBO/Terminal" (`epics.md:1635`), i.e. a Search result must drive the Globe surface. That is an
  AD-17 seam, unlisted.

Also note the front-matter claims `status: final` (child:8). A document that mints an unauthorized
gate ID (A5) and schedules an undeclared contract change (A3) should not be `final`. Recommend
`status: draft` until A5, A3 and A2b are resolved.

---

## Part B — Dropped-requirement check

### B1. Story 7.1, criterion 1 — Search returns typed canonical results, respects suppression, invents nothing, preserves text on empty

Source: `epics.md:1629-1631`. "**Then** retorna Empresa, Modelo, ticker ou Notícia com tipo e ID
canônico, respeita supressão e não inventa resultados; **sem resultado preserva o texto e informa
ausência** (FR-37, AD-16)."

**Finding B1 — severity: medium. Partially supported; the empty-result obligation is dropped.**

Supported: typed canonical IDs and suppression are covered by the inherited AD-15 row ("Notícia
suprimida não reaparece em nenhuma superfície, inclusive resultados de Busca", child:52) and by
AD-24's canonical-vocabulary rule; FR-37 is mapped to `application/local-search.mjs` + shell dialog
under AD-18/AD-23/AD-24 (child:146). "Não inventa resultados" is implicitly covered by AD-1's
domain-only-rules inheritance (child:47).

Dropped: **"sem resultado preserva o texto e informa ausência."** No child AD, convention, or
deferral mentions the empty-result state. This is not purely cosmetic — "preserva o texto" is a
*state* obligation (the query string survives an empty response; it is not cleared by the result
render), and it interacts directly with AD-23's cancellation rule: if the shell cancels in-flight
work on instance/permission change (child:102), something must specify whether the query text
survives that cancellation and whether an aborted search renders as "ausência" or as nothing. The
child's Q3 deferral (child:156) covers "foco, `Esc`, teclado, toque, ordem de Tab e a matriz de
browser" — it does not cover query-text retention or absence signaling. Neither addressed nor
deferred ⇒ finding.

### B2. Story 7.1, criterion 2 — activation routes each result type to its surface, focus, Esc priority, stale intent must not change destination

Source: `epics.md:1633-1635`. "Empresa abre GLOBO/Terminal, Modelo abre MODELOS com destaque, ticker
navega à Empresa/ativo em MERCADOS e Notícia abre o Leitor. Popover/campo recebem foco, Esc segue a
prioridade e uma intenção vencida não troca o destino atual."

**Finding B2 — severity: medium. Mostly supported; the destination-routing table and the MERCADOS
scope caveat are dropped.**

Supported: the stale-intent half is well covered — AD-18 names `intentToken` sequence integrity as a
thing to protect (child:71), AD-23 owns abandonment of in-flight operations (child:102), and the
Sincronia convention states `LocalSearch`/`LocalNewsView` "já descartam operação vencida por
`generation` e `intentToken`" (child:116). Focus and `Esc` are deferred to Q3 (child:156) — an
explicit deferral, so acceptable (modulo A2c: the `Esc` *priority semantics* are reducer-owned and
should not ride along into the UI deferral).

Dropped:

1. **The four-way destination mapping has no architectural owner.** The canonical intent vocabulary
   has `navigate` with `target: terminal|reader|camera` (`src/contracts/exploration.mjs:113, 133`),
   `tab: globe|models|news` (`:8`), `panel: queue|markets|null` (`:129`) and `selectedModel` in state
   (`:177`). So "Modelo abre MODELOS com destaque" and "ticker navega à … MERCADOS" each require a
   specific composition of canonical intents. AD-24 fixes the *vocabulary* but assigns no owner to
   the *result-type → intent-composition* mapping, and the readiness row "Mapear IDs canônicos aos
   elementos de Empresa, Modelo e Notícia" (`sprint-readiness-...-7-1.md:45`) asked for exactly
   that. Without an owner, Globe and Search can route the same result differently — the very harm
   AD-24's own Prevents clause names (child:107).
2. **The explicit MERCADOS scope limit is dropped.** The readiness report is emphatic: "O escopo de
   destinos também deve ser explícito: o núcleo atual resolve tickers do Cadastro para
   Empresa/Terminal; instrumentos e índices adicionais dependem dos contratos de MERCADOS/Q5"
   (`sprint-readiness-...-7-1.md:37`). The child spine never mentions Q5, MERCADOS coverage, or the
   ticker→instrument limitation. Criterion 2 literally says "ticker navega à Empresa/**ativo em
   MERCADOS**" (`epics.md:1635`), and parent Q5 (parent:211) gates exactly that. A story built from
   this child spine would believe full ticker→MERCADOS routing is in scope. This is a dropped
   constraint with a named parent gate behind it.

### B3. Story 7.1, criterion 3 — URL uses base=MAPA|SAT and Q11 contract/aliases, sanitizes unknown values, session-only overrides, no conversation/Histórico/secrets, still requires authentication

Source: `epics.md:1637-1639`.

**Finding B3 — severity: high. Three of five clauses supported; two dropped.**

Supported: `base=MAPA|SAT` and the Q11 alias contract → AD-24 (child:108) plus AD-19's
`explorationQuery` serialization (child:78). Session-only overrides → AD-19's "hidratação grava
apenas `sessionOverrides` e nunca persiste preferência" (child:78), inherited AD-10 row (child:51).
Sanitization of unknown values → *weakly* supported: AD-24 forbids scattered translation heuristics,
and `exploration-url.mjs:12-18` does sanitize (`layers` → full set, `base` → `initialBase`, `tab` →
`globe`, `company` → `null`), but no child AD states sanitization as a rule, and criterion 3 makes it
explicit ("saneia valores desconhecidos para opções válidas"). Call that partial.

Dropped:

1. **"Não contém conversa/Histórico/segredos" has no child AD.** Parent AD-10 ends with "O estado
   não guarda conversas/segredos" (parent:100); parent AD-12 governs chat/Histórico privacy
   (parent:108–112); AD-9 says secrets never appear in "snapshots, bundles, **URLs** ou logs"
   (parent:94); and the Epic 7 list entry states it as an epic-level constraint: "A URL usa base
   MAPA/SAT e **nunca inclui conversa ou segredo**" (`epics.md:620`). The child's AD-19 is the single
   address writer and is the natural home for this prohibition — it says nothing about it. The child
   defers 7.2/7.3 chat and "Histórico privado … sob Q1/Q7" (child:158), which disposes of the chat
   *feature* but not of the *URL content prohibition*, which binds now, in 7.1, on the writer AD-19
   creates. Neither addressed nor deferred ⇒ finding. Severity high because AD-19 is being written as
   the authoritative address-writer rule and this is a security-class constraint from three parent
   ADs plus the epic entry.
2. **"continua exigindo autenticação" is contradicted-by-omission.** Criterion 3 requires the URL/
   hydration path to still demand authentication. AD-21 instead rules that the browser path serves
   only fixtures with no server-side authz until the gate clears (child:90). Those are reconcilable —
   the fixture preview is not the authenticated product, and AD-21's refusal to serve private data is
   the stronger guarantee — but the child never performs the reconciliation. As written, a reader
   comparing criterion 3 to AD-21 sees an unauthenticated browser surface and no statement that
   criterion 3's authentication clause is deferred to the hosting gate. Combined with A1's write-side
   gap (shell owns `localStorage` and `persistPreferences`, child:27, 72) and with
   `acceptance-7-1-local.md:32`'s already-live `irisglobal.com.br` build, this needs an explicit
   sentence. Under A5 it should point at Q2, not Q12.

### B4. Story 7.1, criterion 4 — eliminated / remapped / hidden / access-denied entities

Source: `epics.md:1641-1643`. "**Then** usa substituição canônica explícita ou informa
indisponibilidade, sem selecionar outra entidade por acidente; nenhuma Notícia suprimida é
reaberta (AD-3, AD-9)."

**Finding B4 — severity: low. Well supported, with one sub-case unowned.**

Supported, and this is the child's strongest criterion: AD-22 is squarely aimed at it (its Prevents
clause names "o quarto critério da Story 7.1" explicitly, child:95); AD-3's inheritance row forbids
heuristic substitution in the shell (child:49); AD-15's row carries news suppression into Search
results (child:52); the capability map routes entity reconciliation through
manifest → frame → `advanceSnapshot` (child:150); `INVALID_REMAP` is already reducer-enforced per
`deferred-work.md:59`. Parent contract support exists too: "referências obsoletas retornam
substituição explícita ou 410, nunca identificam outra entidade por acidente" (`contracts.md:9`).

Gap: the criterion's **"acesso negado"** sub-case. AD-22 covers eliminated/remapped, AD-15 covers
hidden — but access-denied is an AD-9 condition, and under AD-21 the browser has no server-side authz
at all, so there is no architectural place for "informa indisponibilidade" on a *permission* denial
as distinct from a *missing-entity* denial. AD-23 mentions "perder permissão" as a disposal trigger
(child:102) and `src/contracts/access.mjs` defines `AccessDeniedError`/`FORBIDDEN`, so the pieces
exist; nothing joins them to criterion 4's user-visible outcome. Low only because AD-21 makes the
case currently unreachable — but it must be named as deferred rather than left silent.

### B5. Readiness table, `Dependências da integração de 7.1` — row-by-row

Source: `sprint-readiness-2026-10-13-continuacao-7-1.md:43-50`.

| Readiness row (line) | Child AD / deferral | Status |
|---|---|---|
| **Consumidor e entrada** (`:45`) — how the existing UI imports ESM modules and receives valid data; the current build publishes only mockups; map canonical IDs to Empresa/Modelo/Notícia elements; do not import `memory-snapshots.mjs` in the browser | AD-20 (child:80-84) covers the `memory-snapshots`/`node:crypto` ban exactly; AD-21 covers "receives valid data" via fixtures; Q9 deferral (child:159) covers module serving | **Partially addressed** — the ESM-import/bundling half is deferred to Q9 and the `node:crypto` half is ruled. But **"Mapear IDs canônicos aos elementos de Empresa, Modelo e Notícia"** has no owner (see B2.1), and the row's premise that **"o build atual publica apenas mockups"** — with the mockups running their own search over local arrays (`sprint-readiness-...-7-1.md:29`; dialog at `prototype-artificial-analysis.html:608`, handlers at `:1169`) — is never named as something AD-24's single translation table must *replace*. The child cites the prototype only as an alias source (child:108), not as a parallel Search implementation that must be retired under AD-1/AD-18. |
| **Q2 / acesso** (`:46`) — reconcile hosting/pipeline, IdP, asset/data protection, **denial and revocation** with AD-9; `amplify.yml` does not resolve the authorization design nor prove deploy | Child Deferred "Q12" (child:154) + AD-21 | **Addressed in substance, defective in form** — see A5 (critical): the child renamed parent Q2 as a new Q12. Also note the row names **"negação e revogação"**; the child covers revocation only as a disposal trigger in AD-23 ("perder permissão", child:102) and never covers *denial* presentation (see B4). |
| **URL do navegador** (`:47`) — register address-update and Back/Forward policy; consume common parser/serializer; preserve preferences; **do not infer `pushState`/`replaceState` from demonstrative behavior** | AD-19 (child:74-78) | **Addressed.** The best-served row: single writer, explicit per-intent push/replace split, `popstate`→`hydrateUrl`, writer silent during handling, preferences preserved. The child states the policy rather than inheriting it from the prototype, which is precisely what the row demanded. |
| **BH3 / store** (`:48`) — preserve synchronous `getState`/`dispatch`; an async adapter needs its own protocol; `requireSynchronous` does not undo arbitrary effects already started | AD-18 (child:72) + Sincronia convention (child:116) | **Addressed.** AD-18's "estritamente síncronos" + "`dispatch` devolve os efeitos ao chamador e nunca os executa" + "o store não chama nada que possa despachar durante um `dispatch`" is a direct answer to `deferred-work.md:56`'s warning that "o corpo do adapter pode mutar o store depois de `cancel()`". |
| **BH5 / remaps** (`:49`) — define the origin and delivery of explicit remaps before consolidating removals; do not order opaque revisions nor infer substitution by name | AD-22 (child:92-96) | **Addressed in substance** (Publisher is the origin; manifest → frame → `advanceSnapshot` is the delivery; name-matching explicitly forbidden), **defective in authority** — see A3 (high). Note the row's second half, **"Não ordenar revisões opacas"**: that is CR-04 (`deferred-work.md:33`), and the child parks CR-04 in Deferred as unverified `maybe-false` (child:157) **without any AD stating the ordered-delivery obligation**. `deferred-work.md:13` and `:52` require proving "que o controlador não reenvia snapshot antigo ao store"; AD-18/AD-23 give the shell disposal and non-reentrancy but never assign snapshot-delivery ordering. See B6. |
| **Lifecycle / Q3** (`:50`) — cancel/unsubscribe on instance or permission change; prove focus, Esc, touch, keyboard, and absence of reopen-by-stale-result | AD-23 (child:98-102) + Q3 deferral (child:156) | **Addressed.** Cancellation and the no-reopen guarantee are AD-23's rule; focus/Esc/touch/keyboard are explicitly deferred to UI stories. Clean bucket assignment. |

**Finding B5 — severity: high (aggregate).** Four rows addressed; "Consumidor e entrada" partially
(canonical-ID mapping and prototype-Search retirement dropped); "Q2 / acesso" addressed under an
illegitimate gate ID with denial presentation dropped.

### B6. Snapshot delivery ordering (CR-04) — deferred as a *verification* gap while the *architectural* obligation is dropped

**Finding B6 — severity: high.**

`deferred-work.md:13`: "A integração precisa provar que snapshot antigo não é reenviado ao store;
não comparar IDs lexicograficamente." `deferred-work.md:33` (CR-04, medium, preexistente,
reconfirmado): "reducer aceita entrega manual `two` → `one`; não possui ordenação de revisão opaca…
Provar que o controlador não reenvia snapshot antigo ao store." `deferred-work.md:52`: "Provar
entrega ordenada e isolamento/disposal entre instâncias e serviços no adapter futuro; preservar
CR-04/CR-05 como integração pendente." The readiness table repeats it (`:49`).

The child handles the *CR-05* half of that pair properly: AD-23 gives disposal an owner and demands a
test (child:102). The *CR-04* half gets no AD. The child's Deferred bullet lumps CR-04 with the
`maybe-false` items: "CR-03, CR-04, CR-06, CR-07: permanecem `maybe-false` não verificados"
(child:157). That is a **misclassification with consequences**: `deferred-work.md:33` records CR-04
as "**medium, preexistente, reconfirmado**", not `maybe-false`. CR-03, CR-06 and CR-07 are the
`maybe-false` ones (`deferred-work.md:32, 35, 36`). By downgrading a confirmed medium finding into an
unverified bucket, the child removes the obligation to architect ordered snapshot delivery — the
reducer provably accepts out-of-order opaque revisions, and the new shell is exactly the controller
that must not re-send. AD-18 covers synchrony and reentrancy; neither it nor AD-23 says who owns
monotonic snapshot delivery to the store.

**Required action:** either add an ordered-delivery clause to AD-18 (the store wrapper rejects or the
shell never issues a snapshot older than the current `snapshotRevision`, without lexicographic ID
comparison), or state CR-04 as an explicit, correctly-classified deferral with the proof obligation
intact. Also correct the severity attribution at child:157.

### B7. Quiet obligations present in the inputs and absent from the child

**Finding B7 — severity: medium.** Beyond the criteria and the table, these load-bearing items from
the named inputs appear nowhere in the child, in neither the AD nor the deferral bucket:

1. **The "no additional demonstration page" decision.** `acceptance-7-1-local.md:11, 26`: Andre said
   "nao precisa, ta aprovado" and "A página adicional de demonstração não será criada." The child
   creates an entire new `ui/` shell (child:139) without noting that the accepted scope explicitly
   excluded a demo page — i.e. the shell must be the *real* consumer surface, not a demo. This is a
   scope guardrail from a human acceptance record, silently dropped. (AD-21's provenance marker is
   adjacent but not the same obligation.)
2. **The already-published build and its token.** `acceptance-7-1-local.md:32`: the local build
   already shipped to `https://irisglobal.com.br` "sem incluir configuração Cesium local no pacote e
   sem expor seu token no registro", with "Não remover proteção de acesso, criar nova hospedagem nem
   habilitar serviços pagos por este aceite." The child's Stack (child:124-129) names
   `amplify.yml` but imposes no corresponding constraint on the new shell: nothing says the shell
   must not remove access protection, must not create new hosting, and must not activate paid
   services. Parent AD-8's "Nenhuma escolha de arquitetura ativa cobrança" (parent:88) and AD-14's
   "Não há deploy/cron/ativação paga automática por teste, build ou instalação" (parent:124) are the
   parent anchors — and neither AD-8 nor AD-14 is in the child's `binds` (see A7).
3. **Provenance marker has no contract.** The Procedência convention (child:117) and AD-21 both
   require a visible provenance marker, but `src/contracts/` has no provenance/mode field and AD-16
   makes `src/contracts/` the only executable definition of boundary formats (parent:136). A visible
   marker driven by nothing contractual is a rule with no enforcement surface — AD-21 should name
   where "this is fixture data" is represented, or defer it.
4. **Favorites identity / orphan-reference policy.** `deferred-work.md:19-21`: favorites hold bare
   strings with no `CompanyId` in the contract and persist without remapping — "Confirmar se são
   Empresas/instrumentos e como resolver aliases sem regravar preferências por atualização." The
   child's Deferred bullet (child:157) lists CR-03/04/06/07 and the child says "favoritos e avisos
   seguem seus registros existentes" nowhere — that phrase is in `deferred-work.md:52`, not in the
   child. AD-22 now routes remaps through the store, and favorites are a *persisted preference*
   holding entity references: AD-22 + AD-19's no-persist-on-hydration rule collide here (remap a
   company that is in `favorites` and either you rewrite a preference, violating AD-19/AD-10, or you
   keep a dangling reference). Unaddressed and undeferred.
5. **`company-unavailable` warning duration/dismiss (CR-09).** `deferred-work.md:24-25, 38`: switching
   base erases the `company-unavailable` warning by general warning reset; "Reconciliar
   duração/dismiss com a apresentação." The child's AD-19 makes `base` a `replaceState` address write
   (child:78) and AD-22 is explicitly about avoiding a silent `company-unavailable`
   (child:95) — so the child touches both sides of CR-09 and never names it. CR-09 appears in
   neither the child's AD text nor its Deferred list (which names CR-02/CR-08 at child:155 and
   CR-03/04/06/07 at child:157 — CR-09 is simply missing from the enumeration).
6. **Epic 7 entry's Q1/Q2/Q7 gating.** `epics.md:620`: "chat, orçamento, retenção e serviços externos
   permanecem gated por Q1/Q2/Q7." The child defers chat/paid-sources to "Q1/Q7" (child:158) and
   never names **Q2** (having replaced it with Q12, per A5), and never names retention. Retention is
   parent AD-12's "Histórico pertence ao dono e exige prazo configurado antes de habilitar"
   (parent:112) — relevant because the child's shell owns `localStorage` (child:27).
7. **Story 7.1 Readiness line's "sem dependência de chat ou Histórico."** `epics.md:1625` states 7.1
   has no chat/Histórico dependency and uses "os contratos Q11/AD-16 e consumidores dos Epics 2 a 6."
   The child's Deferred bullet on 7.2/7.3 (child:158) covers the forward direction, but the child
   never records the *positive* obligation that 7.1's shell must integrate the Epics 2–6 entity
   surfaces (`epics.md:628`: "O Epic 7 integra as superfícies de entidade dos Epics 2–6"). That
   integration obligation is the reason B2.1's canonical-ID mapping matters.
8. **The readiness report's own gate is CONCERNS, not PASS.** `sprint-readiness-...-7-1.md:6-16`:
   `gate: CONCERNS`, `fullImplementationReady: false`, `productionAuthorized: false`. The child is
   `status: final` (child:8) and carries no note that its only readiness input is a CONCERNS gate
   whose closure requires "prova no navegador". Tone dropped.

---

## Consolidated findings

| # | Severity | Finding | Evidence |
|---|---|---|---|
| A5 | **critical** | Q12 is a newly minted gate ID at epic altitude that duplicates parent Q2 and schedules an amendment to final parent AD-9; AD-21's validity is conditioned on this parent-invisible ID | child:154, 50, 86, 88, 129 vs parent:208, parent:94; `sprint-readiness-...-7-1.md:46` files the same item as "Q2 / acesso"; no `Q12` anywhere else in repo |
| A3 | **high** | AD-22 requires a breaking manifest contract change plus a new `LocalNewsView` frame field, naming neither the AD-16 author, the `schemaVersion` decision, nor the AD-2 field-list update | child:96 vs parent:52, parent:136, parent:148; `src/contracts/snapshot.mjs:8` + `src/contracts/primitives.mjs` strict `object()`; `src/application/local-news-view.mjs:26-39` has no remap channel |
| A2b | **high** | Child silently relocates the store from `src/ui/` to `src/application/`, contradicting the parent Structural Seed with no conflict note | child:137 vs parent:193 |
| B3 | **high** | Criterion 3's "não contém conversa/Histórico/segredos" has no AD on the new address writer, and "continua exigindo autenticação" is never reconciled with AD-21 | `epics.md:1639`, `epics.md:620` vs child:74-78, child:90; parent:94, parent:100 |
| B6 | **high** | CR-04 (confirmed medium) is misfiled as unverified `maybe-false` and the ordered-snapshot-delivery obligation is dropped; no AD owns monotonic delivery to the store | child:157 vs `deferred-work.md:13, 33, 52`; `sprint-readiness-...-7-1.md:49` |
| B5 | **high** | Readiness row "Consumidor e entrada": canonical-ID→element mapping unowned, and the prototype's parallel Search implementation is never ordered retired under AD-1/AD-18 | `sprint-readiness-...-7-1.md:45, 29` vs child:146; `prototype-artificial-analysis.html:608, 1169` |
| A4a | medium | AD-24's alias inventory: `view=3d` should be `view=3D`; `theme` missing; `pov=` has no canonical target; `mode=` implies a new session-override channel for a persisted preference; inventory extends parent-owned Q11 without saying so | child:108 vs parent:216, parent:100; `src/domain/exploration-url.mjs:16`; `src/contracts/exploration.mjs:9, 52, 86-91`; `prototype-artificial-analysis.html:722, 848, 1132-1135` |
| B2 | medium | Criterion 2: four-way result→surface routing has no owner, and the readiness report's explicit ticker/MERCADOS-Q5 scope limit is dropped | `epics.md:1635`, `sprint-readiness-...-7-1.md:37` vs child:146; parent:211 |
| B1 | medium | Criterion 1: "sem resultado preserva o texto e informa ausência" is neither ruled nor deferred, and interacts with AD-23 cancellation | `epics.md:1631` vs child:98-102, child:156 |
| A1 | medium | AD-21 governs reads only; shell writes (`localStorage`, `persistPreferences`) unaddressed, and AD-14 isolation / AD-9 no-secrets-in-bundle not applied to the fixture bundle or the live `irisglobal.com.br` build | child:90 vs child:27, 72; parent:94, parent:120-124; `acceptance-7-1-local.md:32`; `scripts/build-ui-preview.mjs` |
| A2c | medium | `Esc` priority and side-panel exclusivity are reducer semantics (AD-10) but ride along in the Q3 UI deferral, risking reimplementation outside `domain` | child:156 vs parent:100; `src/contracts/exploration.mjs:113, 129` |
| A7 | medium | Front-matter `binds` omits AD-14 and AD-17 though both are materially engaged; `status: final` is premature | child:8, 11, 45-53 vs parent:120-124, parent:138-142; `epics.md:1635` |
| B7 | medium | Eight quiet obligations dropped: no-demo-page decision, no-remove-protection/no-new-hosting/no-paid-activation, provenance has no contract field, favorites identity vs remaps, CR-09 absent from the CR enumeration, Q2 and retention unnamed in the Epic 7 gating, Epics 2–6 integration obligation, CONCERNS-gate tone | `acceptance-7-1-local.md:11, 26, 32`; `deferred-work.md:19-21, 24-25, 38`; `epics.md:620, 628, 1625`; `sprint-readiness-...-7-1.md:6-16`; parent:88, 112, 124, 136 |
| B4 | low | Criterion 4's "acesso negado" sub-case has no architectural home; denial presentation unowned (AD-23 covers revocation-as-disposal only) | `epics.md:1643` vs child:102; `src/contracts/access.mjs` |
| A2a / A6 | none | AD-18's ownership model, AD-19, AD-20, AD-23 carry no parent conflict; AD-19 and AD-20 answer their readiness rows precisely | child:68-72, 74-84, 98-102 vs parent:42-46, 52, 100, 120-124, 216 |

## Required actions before this child spine can bind

1. **Retire Q12** (A5). Re-express as "Q2 (escopo de acesso do navegador)" citing parent:208, and
   raise the AD-9-vs-Amplify contradiction as an explicit parent-level conflict against parent:94.
   Update child:50, 86, 88, 129. AD-21's substance stays.
2. **Rewrite AD-22's contract clause** (A3) to name Domain/Contracts as author per AD-16, state the
   `schemaVersion` decision against `src/contracts/snapshot.mjs:8`, name the `LocalNewsView` frame as
   a second contract surface, and flag parent:52's field enumeration for update.
3. **Record the store-location conflict** (A2b) against parent:193 instead of silently rewriting the
   directory table.
4. **Add the URL-content prohibition and the authentication reconciliation to AD-19/AD-21** (B3).
5. **Give ordered snapshot delivery an owner and fix CR-04's severity attribution** (B6, child:157).
6. **Assign the canonical-ID→surface routing owner, and order the prototype's parallel Search
   retired** (B5, B2.1); add the MERCADOS/Q5 scope limit (B2.2).
7. **Correct AD-24's alias table** (A4a) and reframe it as a Q11 extension surfaced upward.
8. **Place every B7 item in exactly one bucket** — an AD or an explicit deferral.
9. **Set `status: draft`** until 1–3 are closed (A7).

**Verdict: CONCERNS.** The child is a careful, well-structured epic spine whose seven ADs are
individually defensible and whose AD-19, AD-20 and AD-23 answer their inputs precisely. It fails a
clean PASS on process, not on taste: it mints a parent-owned gate ID, schedules a contract change
without naming its author or version, contradicts the parent's structural seed in silence, and drops
a security-class URL constraint plus a confirmed medium ordering finding. None of these require
redesign; all require surfacing upward instead of resolving locally.
