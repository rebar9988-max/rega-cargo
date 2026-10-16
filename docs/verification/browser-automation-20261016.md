# Skyvern + Playwright + Codex — 2026-10-16

Base: `main` at `61f8d7ee1354065535107449e3f778b643793c71`.
[Draft PR #114](https://github.com/rebar9988-max/rega-cargo/pull/114).
Branch: `codex/skyvern-playwright-20261016`; implementation commits `0848079`,
`46f220b`; CI-budget-only follow-up `680a722`. Integration only; no application,
branding, route, architecture, database or live configuration changes.

## Audit and integration

Read root AGENTS/CLAUDE, PROJECT_MEMORY and relevant topics, DEPLOY, CI/CD
runbook, current browser specs, Playwright config and Actions workflow. Read the
existing [central memory Doc](https://docs.google.com/document/d/1Wt2rZdmMTviKNsz1bpDUg3as-Egy7FNB_HatI1Y7kH4/edit).
Verified current GitHub/Cloudflare state instead of trusting historical notes.

- Official [Skyvern Codex MCP integration](https://www.skyvern.com/docs/developers/getting-started/mcp)
  retrieved 2026-10-16: hosted `https://api.skyvern.com/mcp/`, browser OAuth,
  Codex >=0.125.0. Installed CLI is 0.159.2.
- Added secret-free `.codex/config.toml`. Registered the same official URL at
  user scope with `codex mcp add skyvern --url https://api.skyvern.com/mcp/`.
  `codex mcp get skyvern` confirms no static/bearer/environment header.
  **CLI OAuth not authenticated:** the command reached the owner browser sign-in
  boundary; `codex mcp list` reports `Not logged in`. A working session connector
  does not prove separate CLI login. Complete `codex mcp login skyvern` locally.
- Added three Firefox responsive projects at 390×844, 820×1180, 1280×800.
  `isMobile=false`, touch follows the narrow viewport; no native-device claim.
  Existing Chromium/WebKit tests, project names, viewport options, screenshot paths,
  tolerances and browser pin remain unchanged.
- New five-journey ckb/ar/en × light/dark regression spec uses the existing
  geometry lock, hydration checks, service links, console/pageerror capture and
  WCAG A/AA checks. Added exact development dependency `@axe-core/playwright`
  4.14.0 (+ `axe-core`); lockfile preserves all prior package entries.
- Added focused npm commands and an [operating runbook](../integrations/browser-automation.md).
  A focused seven-project config reuses existing engine options; its separate
  `browser regressions` Actions job preserves the original pixel job's time budget,
  selectors, report and baseline-update path. Both use the same scope/draft rules
  and image. No account billing or runner settings changed.
- Credential/auth-state paths are ignored; no secret copied into repository,
  browser, screenshots or memory. Authentication remains in user stores.

## Read-only live investigation

Skyvern session `pbs_586232683534068724` was created, used and closed.
No forms submitted, inference requested, dashboard controls changed or records
created. Its [session evidence](https://app.skyvern.com/browser-session/pbs_586232683534068724)
is account-restricted and is not a publicly accessible artifact.

| Investigation | Actual result |
|---|---|
| `https://www.rlgo.net/` | Loaded; ckb, RTL, one h1, 1920px viewport, document width 1905px (no horizontal overflow). Screenshots captured by Skyvern. This single observation does not establish all responsive states. |
| Cloudflare dashboard | Redirected to `/login`; no authenticated browser profile available. Dashboard-only build settings/logs not inspected. |
| GitHub billing dashboard | Redirected to GitHub login. No access to payment details or spending caps; no changes attempted. |
| Skyvern console inspection | Tool reports inspection buffers unavailable in stateless HTTP mode. Not passed; console evidence comes from Playwright. |
| Cloudflare Pages projects | GET 200, empty list. R&L is a Worker, not a Pages deployment. |
| Worker domain mapping | GET 200; `www.rlgo.net` and `rlgo.net` map to `rega-cargo`, production. Separate REGA Worker untouched. |
| Active production allocation | Workers deployments GET 200: deployment `84af8bfb-bfd5-4563-9c78-2b810fa702ca`, version `0a716ab6-91f2-4786-9cbd-ecd24d4243f0` at **100%**, created 2026-10-16 16:40:55 UTC. Version GET confirms number 93, `has_preview:false`. No allocation change. |
| Cloudflare build-minute availability | GET 200 with `{}`. This response does **not** establish quota usage or billing health. |
| GitHub hosted Actions | [Run 38933583488](https://github.com/rebar9988-max/rega-cargo/actions/runs/38933583488): `scope`/`verify` failure, zero steps; layout skipped. Check-run `117083372073` annotation explicitly says jobs did not start because recent payments failed or spending limit must increase. Cannot distinguish these alternatives with available access. |
| Cloudflare Builds trigger | GET 200 for the existing R&L Worker trigger: `npm run build`, deploy command `npm run release:check && npx wrangler deploy`, branch include `main`. No trigger/settings changes. |
| Draft PR checks | PR #114 run `38953119069`: scope/verify/layout/browser all **skipped**, as designed for drafts. Workers Builds check `117149249759` reports success / Build `37c463ef` with no Version ID in its output; this is not proof of unit/browser tests or deployment. Read-only Builds API/logs now confirm the branch runs `npm run build` then `npm run cf:dry-run`, without lint, typecheck, unit or browser tests. Success is a build/bundle check, not a test gate. Allocation re-read after push was unchanged at 100% for the existing version. |
| GitHub billing API | Read-only usage endpoint returned **403, Resource not accessible by integration**. Account payment/spending details unavailable; no mutation attempted. |
| GitHub safeguards | `main` read shows `protected:false`; no protections changed. Existing local-gate policy does not authorize this task to merge with unmet gates. |

## Verification

The focused read-only matrix used `http://localhost:8788` with `/?lang=...`,
`/market?lang=...`, `/stores?lang=...`, `/stores/request?intent=buy&lang=...`,
`/track?lang=...`, each in ckb/ar/en and light/dark. Actual command:
`npx playwright test --config=playwright.browser.config.ts --workers=3`, with
container-local JSON/HTML/output directories. The existing suite used local port
8790 and `--ignore-snapshots --grep-invert 'layout, accessibility and console'
--workers=2`; only the two explicit pixel cases enabled baseline comparison.
No public preview/port was exposed.

Official browser image: `mcr.microsoft.com/playwright:v1.63.0-noble`, digest
`sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27`.
Engine launches verified: Chromium 153.0.8010.12, Firefox 155.0, WebKit 26.6.
Browser runner uses the official image's Node 24.20.0; unit tests use isolated
Node 22.23.3, matching CI's Node major. CI itself remains unavailable.
Local Worker built with `DATABASE_URL=''`; migration runner explicitly skipped.
No production Hyperdrive is used for local browser tests. The local Worker logs
expected server-side "Database not configured" errors for database-backed views;
its honest unavailable states are under test. Browser console/pageerror assertions
are separate from server logs. This does not verify authenticated/data-backed
customer workflows or imply a clean production runtime-log audit.

| Check | Result |
|---|---|
| `npm ci` and focused dependency install | Completed; `npm ci --dry-run --ignore-scripts` accepted the final lockfile. |
| `npm run typecheck` | Passed, including the separate browser config. |
| `npm run lint` | Passed, 0 errors / 5 existing warnings. |
| Workflow static validation | Passed: official `actionlint` v1.7.12, no diagnostics. |
| `npm test`, isolated Node 22.23.3 | **491 passed, 4 skipped, 0 failed** (236+255). Same Node major as existing CI. |
| Initial host Node 24 run | Encountered existing AI test asynchronous `ERR_INVALID_STATE` stream-close rejection; interrupted after diagnosis. Not counted as passed. Source tests unchanged. Isolated Node 22 full run above supersedes this environment attempt. |
| `DATABASE_URL='' npm run build` | Passed, no production migrations. |
| `npm run cf:dry-run` | Passed; bundle validation only, no deployment. |
| Baseline preservation | All **366** tracked screenshots hash-identical to the base commit. No update-snapshots command used. |
| Focused browser matrix | **102 passed / 108 failed / 0 skipped**, all 210 cases completed, no retries/flakes. 96 axe label/name failures; 12 Firefox font console failures. 210 axe reports, 210 viewport captures and 210 console records. |
| Existing browser/geometry suite | **577 passed / 5 failed / 16 skipped**, all 598 cases accounted for, no retries. Tests unchanged. |
| Focused unchanged WebKit rerun | **3 passed / 3 failed**: expired-draft/fallback case passed on all three viewports; homepage search failed again on all three. |
| Focused unchanged CLS rerun | **1 failed**, English shift 0.066285 versus required <0.05, same value as the full run. |
| Focused official-image pixel lock | **2 failed / 0 passed / 0 skipped**: homepage English on Chromium laptop and WebKit phone. Existing stale baseline dimensions reproduced; full pixel matrix not run. |

Final matrix duration: 2,154.9 seconds (~35.9 minutes), sharing two CPU cores
with the existing suite. Its separate CI job now uses a 40-minute Playwright
budget inside a 45-minute job, preserving the original pixel job's 19/25 guards.
Hosted runtime remains unverified; no account quota or billing limit changed.
Only the new CI timeout changed after the local run, not test assertions or local behavior.

An initial 360-case redundant matrix (68 passed, 30 failed, 2 interrupted, 260 not run) was interrupted to separate the new checks
from the original pixel projects and keep the CI time budget bounded. It is not
counted as complete. The final focused matrix is a fresh run on the final config.

Preliminary smoke (before final evidence handling): 15 cases, 6 passed / 9 failed,
no skips. Failures included axe `label-content-name-mismatch` on desktop language
buttons, two timeout cases, and one Firefox trace stream/archive error while
writing artifacts on the shared mount. Final runs store artifacts on the
container filesystem before export. These preliminary failures are not erased
or claimed as passes.

Focused pixel command: `npx playwright test layout.spec.ts --grep 'home en'
--project=chromium-laptop --project=webkit-iphone --workers=1`. Expected/current
sizes: 1280×3639 → 1280×2220 (929,568 differing pixels, ratio 0.20),
390×5745 → 390×3505 (273,621 differing pixels, ratio 0.13). The WebKit assertion
also reached its 20-second screenshot timeout after reporting the mismatch.
Review the unedited official-image diffs: [Chromium laptop](browser-automation-20261016/chromium-home-diff.png),
[WebKit phone](browser-automation-20261016/webkit-home-diff.png).
Both application source and baselines are unchanged from base, so this is not
an integration-induced visual change. No full-pixel-gate success is claimed.

### Accessibility finding under review

Existing `HeaderLangPicker` shows `EN` and supplies accessible name
`Language: English (EN)`. axe 4.14 flags this at desktop widths. Inspection of
axe's `isLabelContainedInName` → `curateTokens` confirms that it strips parenthetical
text before comparing, dropping `(EN)`; DOM inspection confirms the actual
visible text and accessible name above. The finding is reproducible on unchanged
application source; keep it visible for review rather than disable a rule or
silently change existing UI. Axe also returned **74 color-contrast** and **42 aria-prohibited-attr** incomplete
rule occurrences requiring manual review; these are not passed checks. All 210
console records were inspected: 12 STAT and 12 table-discard diagnostics in 12
Firefox cases, no other captured console errors or uncaught exceptions. This
is local browser evidence, not a production runtime-log audit. Per-project counts
remain in the exported reports and machine summary. Automated checks alone do not
prove full WCAG compliance.

Final configuration discovery: `test:browser` lists **210** cases in seven
projects; default config lists **688** (598 preserved + 90 Firefox); the exact
Actions pixel-job project selectors list **598** cases in the six existing specs.
No existing browser case removed or baseline updated. The focused matrix is
separate so the original pixel-lock time budget is retained.

### Existing suite findings (unchanged application and tests)

The 598-case geometry/interaction run took 2,626.4 seconds (~43.8 minutes), in
parallel with the new matrix on two CPU cores. The 16 skips are the existing
viewport-specific cases, not passes. All six Chromium layout projects completed
without failures; WebKit and the 360px premium suite exposed the following:

- Homepage search failed on all three WebKit viewports: expected
  `/stores?...q=kettle`, observed `/?` and reset default locale. A focused run
  of the unchanged case reproduced all three failures. The SSR form has only
  a React `onSubmit` handler and no native query name, so the observed URL is
  consistent with submission before hydration. Exact readiness/root-cause repair
  remains open; do not call this a proven production outage.
- The landscape WebKit expired-draft/email-fallback case found the fallback
  disclosure hidden. It passed in the focused unchanged rerun on all three
  WebKit viewports. Original full-run failure retained; not declared fixed.
- The existing slow-font-swap CLS test failed for English: 0.06628502197265625
  versus <0.05. The unchanged focused rerun reproduced the same value. No budget,
  font or CSS tolerance relaxed.

Focused command: `npx playwright test unified.spec.ts improvements.spec.ts
--grep 'homepage search uses|expired drafts are never restored' --project='webkit-*'
--workers=1 --retries=0`. CLS command: `npx playwright test premium.spec.ts
--grep 'slow font swaps' --project=premium-360 --workers=1 --retries=0`.
All original six spec files are byte-identical to base. Full official-image
pixel comparison was limited to the two failing homepage cases; it is not green.

### Firefox console finding

The new Firefox listener exposed pre-existing font diagnostics on the homepage:
`vazirmatn-nl-v33.003.woff2` emits `STAT: Invalid nameID: 257` and
`Table discarded`. The test fails rather than suppress these console errors.
Read-only fontTools/Brotli inspection confirms the `STAT` weight axis references
name ID 257 and weight values reference 258–266, while none of IDs 257–266 exist
in the font's `name` table. [Raw metadata evidence](browser-automation-20261016/font-metadata.json).
SHA-256 is `cdef5578ea583313cbea060a14aa107955a99717a861971b860cb564dfe1bbf5`,
byte-identical to base. A read-only download of the public production font returned
the same SHA-256, confirming the same asset is live. Typography/font bytes remain unchanged. This needs a preserving font-metadata
review under the existing R&L typography ownership rules; no blanket clean-console
claim is made. Exact final occurrences are recorded in the machine summary.

## Release status and next safe continuation

[Machine-readable results](browser-automation-20261016/results.json) include all
per-project counts, failures, font metadata and preserved baseline tree hashes.
A local compressed artifact contains all five HTML reports and their evidence;
it is kept outside source control. The existing central Doc received a linked
checkpoint and final result, rather than creating another memory system.

**Draft PR #114; no merge or deploy.** Complete Codex OAuth in the owner's environment;
resolve/review the axe label/name finding, malformed font metadata, WebKit search/readiness,
fallback flake, CLS budget failure and existing baseline drift through normal gates; owner resolves Actions billing and reruns the newest main gate.
Authenticated dashboards, native devices, OTP/private customer workflows and
payment/billing details remain unverified. Update only the existing repository
memory and central Doc. Re-query live allocation before any future release;
documentation-only main builds can create a newer version.
