# Skyvern + Playwright + Codex — 2026-10-16

Base: `main` at `61f8d7ee1354065535107449e3f778b643793c71`.
Branch: `codex/skyvern-playwright-20261016`; implementation commits `0848079`,
`46f220b`. Integration only; no application,
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
| GitHub billing API | Read-only usage endpoint returned **403, Resource not accessible by integration**. Account payment/spending details unavailable; no mutation attempted. |
| GitHub safeguards | `main` read shows `protected:false`; no protections changed. Existing local-gate policy does not authorize this task to merge with unmet gates. |

## Verification

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
| Browser regression and full geometry | In progress; final counts recorded below after completion. |
| Focused official-image pixel lock | **2 failed / 0 passed / 0 skipped**: homepage English on Chromium laptop and WebKit phone. Existing stale baseline dimensions reproduced; full pixel matrix not run. |

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
silently change existing UI. Other findings, incomplete axe checks and final
browser counts remain in the exported reports. Automated checks alone do not
prove full WCAG compliance.

Final configuration discovery: `test:browser` lists **210** cases in seven
projects; default config lists **688** (598 preserved + 90 Firefox); the exact
Actions pixel-job project selectors list **598** cases in the six existing specs.
No existing browser case removed or baseline updated. The focused matrix is
separate so the original pixel-lock time budget is retained.

## Release status and next safe continuation

**Draft PR; no merge or deploy.** Complete Codex OAuth in the owner's environment;
resolve/review reported accessibility and existing baseline drift through their
normal gates; owner resolves Actions billing and reruns the newest main gate.
Authenticated dashboards, native devices, OTP/private customer workflows and
payment/billing details remain unverified. Update only the existing repository
memory and central Doc. Re-query live allocation before any future release;
documentation-only main builds can create a newer version.
