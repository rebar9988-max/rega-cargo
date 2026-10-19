# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Primary production domain: https://www.rlgo.net (Cloudflare Worker `rega-cargo`); apex and HTTP variants redirect directly to canonical HTTPS www. Retired cargo.regaplatform.com detached; production workers.dev and version previews disabled.
- Staging: Worker `rega-cargo-staging` retained with no public URL; workers.dev and version previews disabled. Cloudflare Builds branch previews disabled.
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-19**. Continuation after PR #115/#116: see [current release evidence](docs/verification/release-hardening-20261018.md). Owner permits pending legal content during beta; public-stage release still requires completion. R&L AI permanent baseline remains intact.


## Current continuation — shopping/shipping verified, 2026-10-19

The original mobile cleanup is complete on https://www.rlgo.net: home/stores have no shipping form or rates; `/quote` owns the dedicated form and three rate options. Eighteen public Chromium checks passed across 360/390/820/1440 px and ckb/ar/en, with no overflow or page errors. Superseded alternative PR #74 is closed; the merged #72 route architecture and subsequent refinements are preserved. [Evidence and limitations](docs/verification/shopping-shipping-20261019.md).

**Current production mitigation:** direct Cloudflare readback confirms static original-art version `20ffc4f4-0cf5-43f2-b623-cc61410bdf10` at 100% (deployment `ecf64c82-7d11-4bc1-8335-a4d5b4ec03e6`, 08:30:03 UTC). The central Doc records the owner-reported mobile silk incident and a separate repair in progress. Do not redeploy the unchanged animated renderer from main during this task. This supersedes the earlier release status below; no runtime/deployment change was made in this continuation.

## Earlier visible silk release checkpoint — superseded by the mitigation above

Owner could not perceive the initial released motion. Isolated original-silk repair [#124](https://github.com/rebar9988-max/rega-cargo/pull/124) passed the exact-head hosted gate (507 unit/script passes + 4 existing skips; 651 browser/pixel/layout passes + 16 skips, zero failures/flakes) and merged normally as `5faa822`. Existing main Build `f5dd0b70` succeeded; direct readback confirms version `788eccf7-99bd-4cd7-aeaa-6f2787abe05f` at 100%. Actual public suite 15/15 passed, with visible three-second silk changes near 19% versus 3.86% before; all protected product samples remain stationary. Four public viewport samples, an existing service-worker client and 13 final-200 routes verified. Original image/design/business/AI behaviour preserved. [Release evidence and limitations](docs/verification/hero-silk-20261019.md). Documentation-only builds may change the version while retaining this app.

## R&L AI owner-only permanent baseline (2026-10-14)

Owner explicitly reconfirmed: the approved R&L AI foundation must survive every unrelated R&L change; only a new explicit owner request for the affected AI change authorizes a baseline change. Broad redesign/refactor/upgrade requests are insufficient. Preserving bug/security maintenance remains allowed. Read the identical OWNER-ONLY R&L AI BASELINE rule in root AGENTS/CLAUDE and module AGENTS/README before editing. Regression checks pin the official identity, tool allowlist and approved Sorani welcome/refusal/shortcuts; CODEOWNERS also covers the governance entry points. These checks and review rules detect accidental drift, but are not technical immutability or enabled branch protection.

## R&L AI modernization checkpoint (2026-10-13)

Owner-authorized isolated work is on `codex/rl-ai-domain-lock-20261013`, based on `631549f`. Identity: **R&L AI — یاریدەدەری زیرەکی کڕیار**; strictly R&L Marketplace, Bring For Me, Delivery / Tracking support. Read [module rules](src/modules/rl-ai/AGENTS.md) and [ownership/contracts](src/modules/rl-ai/README.md) before modifying AI. These invariants need an explicit new owner instruction to change; ordinary preserving maintenance is allowed.

Source implementation adds the owned module, short typed responses, pre-inference scope refusal, injected-output rejection, public Marketplace read contract, seven-language welcome/chat and explicit image preview/removal/processing. Existing provider, auth, database, homepage and business implementations are preserved. Preliminary gate: typecheck/lint/build/dry-run pass; 460 unit/integration/security passes + 4 existing skips; 12 focused official-image browser passes; only 27 intentional `/ai` pixel baselines updated. Continuation 2026-10-14: full run exposed two AI-only WebKit hydration races; existing readiness hook now guards AI controls. Final affected official-image gate passed 72/72, no retries; final full run: 499 passed/16 existing skips/one unchanged WebKit navigation harness cancellation; its original case passed 3 consecutive unmodified runs without retries. All 500 unique required cases passed across final runs. [PR #92](https://github.com/rebar9988-max/rega-cargo/pull/92). [Evidence, changed-file map and exact release blockers](docs/ai/rl-ai-verification-20261013.md).

**Verified release 2026-10-14**: PR #92 normally merged as `481bfeb`; existing Cloudflare Builds `7387019a` succeeded, Worker `c87c162d-11e9-4ca7-86e4-f6eca4a600a6`, 100%, 06:57 UTC. Live entry/welcome/five shortcuts, Sorani/English refusals, approved workflow links, genuine planner and genuine photo inference passed. Eight existing routes returned 200, mobile/desktop had no overflow; privacy-safe telemetry showed no exception/5xx. Existing bindings/secrets retained; no migration or unrelated business changes. Hosted Actions remains blocked by billing; full local gate policy applied, no bypass. Native camera/OTP/private orders are not claimed; live CLS outlier 0.1175 followed by diagnostic/cold confirmations 0.0051 is documented. Documentation-only follow-ups can deploy an identical app; verify current Cloudflare version before operating. [Full production evidence and limitations](docs/ai/rl-ai-verification-20261013.md).

## Current checkpoint (2026-10-13)

- **Exclusive public domain:** owner requested old domains closed. At 11:48 UTC cargo attachment/DNS removed; production/staging workers.dev and version previews disabled; R&L Builds branch previews disabled. Twelve closed-endpoint checks returned 404; both public DNS resolvers confirmed retired cargo NXDOMAIN; ten browser cases and 31 canonical protocol checks passed. Full local official-image gate passed: 432 unit tests/4 skips and 455 layout/browser tests/16 skips, zero failures; source persistence tracked in [PR #91](https://github.com/rebar9988-max/rega-cargo/pull/91). [Evidence](docs/verification/rlgo-exclusive-domain-20261013.md).
- **Critical domain/WebKit repair:** PR #89 (`codex/rlgo-critical-domain-fix`), application commits `f06bfcb` + `35c4547`. Live WebKit scrolling reproduced blank content from `.rl-defer` / `content-visibility:auto`; paired same-document control restored paint. CSS optimization removed, SW cache bumped to v12, www/apex/HTTP routing and source canonical/auth/cache settings aligned. Staging `75511c45` passed 40 browser cases, two slow-network checks and the corrected WebKit regressions; full official-image lock completed with 449 direct passes, 6 passes on configured retries, 16 skips, no final failures. Final focused gate passed 45/45 without retry. PR #89 merged as `4465ba7`; production `ddde9ad1` at 11:27 UTC passed 40 browser cases, 6 paint/navigation cases, 2 slow checks, 31 protocol checks and 2 stale-cache recovery checks. No rollback needed; native iPhone/direct IPv6/real OTP remain unavailable. [Evidence and limitations](docs/verification/rlgo-domain-20261013.md).

- Unified modernization branch: `claude/unified-journeys-20261013`. Navigation, homepage, real market discovery, request disclosure/errors and Safari submission readiness implemented in PR #82; final local gate 426 unit tests + 432 browser tests passed (4/12 existing skips). Staging `f04cd880`: 57 browser cases, 30 axe checks passed. PR #82 merged as `04ada22`; production UI release `fff69ec5` passed 57 read-only browser cases and 30 axe checks. Follow-up `claude/verified-release-preview-20261013` fixes reproduced catalogue first-click loss and missing preview configuration; final local gate 427 unit / 437 browser tests passed; follow-up merge/rollout pending. [Audit, 20-reference matrix and verification](docs/redesign/unified-journeys-20261013.md).
- **P1 marketplace database recovered live:** authorized Hyperdrive origin update to verified `old-cherry-79292410/cargo`; `/market` now renders filters and the genuine empty state. No schema/data writes, migration, project deletion or auth change. Existing fallback `DATABASE_URL` was then coordinated to the same verified cargo connection (secret-only version `2db4fb28`, no application code change). All inspected customer/product/request counts zero. Production fallback secret update succeeded; no connection value was logged or stored in the repository.
- Verified initial unified UI release: Worker `fff69ec5-69e0-4df9-a92e-f7101deebf79`, 100%, 06:20 UTC, main `04ada22`; Cloudflare Builds `d964e56c` succeeded. Root/market/request/track/account/catalogue browser checks passed at 390/820/1280; native-review and phone-provider gaps remain. Configuration/memory follow-ups may create another version with the same UI; query live deployments before operating.
- Existing Cloudflare Builds was connected after the last memory checkpoint (trigger created 2026-10-12 21:55): auto-build `main`, `npm run build`, `npx wrangler deploy`; initial preview `013e0da9` failed fetching the repository, then main `d964e56c` built/deployed successfully. Feature retry built but needs the missing `previews` block (follow-up prepared). Workers API released staging without changing bindings/secrets/headers; local Wrangler has no authentication. No new infrastructure or token was created.
- GitHub main run `38309201291` still cannot start because of account billing; no required branch checks/protection on `main`. Follow the existing full local official-image gate before an authorized merge; never call hosted CI green.
- Phone OTP provider credentials remain missing. No real sign-in or authenticated production submission can be verified; security gates stay intact.

### Historical checkpoint (superseded where the current checkpoint above differs)


| Area | State | Evidence |
|---|---|---|
| Public pages | All AGENTS.md required routes return 200 (`/`, `/stores`, `?cat=`, `?fav=1`, `/stores/request`, `/quote`, `/ai`, legal pages); `<html lang="ckb" dir="rtl">` | `curl` against production, 15:36 |
| R&L AI | On (`/api/ai/status` → `{"enabled":true}`) | production |
| Live Worker version | `2e724d37`, deployed 2026-10-12 21:04 UTC from `main` @ `bd03131` (PR #78, header category strip); previous `12dcd05e` (PR #72, `3c7ad5a`) | `wrangler deploy` output, `wrangler deployments list` |
| **Production database** | **BROKEN — blocker (I-1).** The Worker queries `misty-recipe-03041407/neondb`, which only has `0002_market.sql`. `/market` renders its error state; logs: `column p.compliance_status does not exist`, `relation "prohibited_keywords" does not exist` | `7b92d650`: 6 probes, `misty/neondb` rollbacks 257→287; `10723cf0`: 4 probes, 334→340; `old-cherry/cargo` rollbacks 0 throughout; `wrangler tail` (7/7 requests) |
| Correct database | `old-cherry-79292410`, database `cargo`: 12/12 migrations (09:38 UTC), 8 compliance triggers, 378 banned keywords | Neon read-only SQL |
| Customer data | **None in either database** (0 products, users, requests, orders) — repointing loses nothing | `pg_stat_user_tables` on both |
| Hyperdrive config `795013d0…` | Origin cannot be read by agents (API and `wrangler hyperdrive get`: `Authentication error 10000`) | Cloudflare |
| Sign-in | Worker logs `auth is disabled (VITE_AUTH_ENABLED=false)`; Better Auth fails closed and phone codes cannot be sent, so nobody can sign in (I-3, I-6) | `wrangler tail` |
| GitHub Actions | **Running (2026-10-18).** I-7 resolved: `scope`, `verify` and `layout lock` start on real runners. PR #121 (tests/config/baselines only, open): layout lock 606 passed / 16 skipped / 0 failed on Chromium, WebKit and Firefox (`premium.spec.ts`). `main` has no required checks | run 39117144355; [report](docs/verification/ci-gates-20261018.md) |
| Production smoke (2026-10-12 06:48) | Live `853e698b`: all required routes 200, `<html lang="ckb" dir="rtl">`, `/api/ai/status` enabled, banned searches (vodka, cigarettes, vape, pork bacon) list nothing, legacy host 301; hero card + tracking card render at 360/390px light/dark in ckb/ar/en with no horizontal scroll; `wrangler tail` 63/63 ok | `curl`, Playwright, `wrangler tail` |
| Shipping/bazaar separation | PR #72 merged (`3c7ad5a`) and live since `12dcd05e` (19:05 UTC). Dedicated shipping page on `/quote`, catalogue-only `/stores`, no home calculator/service switch | [verification report](docs/redesign/shipping-separation.md) |
| Header category strip | PR #78 live (`2e724d37`): phones/tablets get a 64px brand-red header and a swipeable category strip under it; desktop unchanged. Verified on production 21:05–21:10 UTC: 20 routes 200, Playwright 264 passed / 9 skipped / 0 failed (all Chromium devices + 360px suite), no horizontal overflow at 390/820/1280 | [design.md](docs/project-memory/design.md) |
| Banned-products protection | Holds via the bundled list in `src/lib/compliance/rules.ts` | `wrangler tail`: "using bundled list" |

## Five-improvement beta production checkpoint (2026-10-14)

[PR #95](https://github.com/rebar9988-max/rega-cargo/pull/95) merged normally as `8ae779f`; existing Cloudflare main Build `85d441c9` succeeded, Worker `1a514fed-3352-450b-9597-f3cac9f70a3e`, 100%, 13:09:57 UTC. Secure opt-in drafts/reviewable email fallback, verified-content trust/complaint plumbing, unchanged transparent pricing, truthful tracking and bounded AI/token security maintenance are live. Branding/routes/one database/isolated AI baseline preserved. [Evidence](docs/verification/rl-five-improvements-20261013.md).

Owner explicitly permits incomplete legal content during beta; this supersedes the earlier release hold. Source release-policy.json permits that exception only at beta; public release still requires complete verified content. Existing Cloudflare trigger now runs release:check before deploy. Missing facts remain visibly pending, with no legal certification claim.

Production migration 0015 applied transactionally after existing Neon dev-branch validation/reapplication. Business record counts unchanged, no user/role grant. Fresh 483 unit/script passes (4 skips), local typecheck/lint/build/dry-run pass. Real production checks: 12 customer cases + 3 tracking/unauthenticated-denial cases passed across final separate runs, including mobile/desktop/WebKit. Environment gateway/harness corrections and the unchanged WebKit rerun are documented honestly. Ready Actions run 38569257495 failed before steps; no hosted-green claim. Real positive SUPER_ADMIN/OTP/native hardware verification remains unavailable; public privileges stay closed. Telemetry inspection was Forbidden, so no blanket runtime-log/zero-5xx claim.

## Reference homepage (2026-10-14)

Owner's homepage screenshot is live on `/` ([PR #100](https://github.com/rebar9988-max/rega-cargo/pull/100), main `fb1bf7b`, sw v13). Local gate only (Actions blocked, I-7); `/` screenshot baselines were stale until re-rendered in the official image (PR #121, 2026-10-18). Owner to decide: keyed white logo, tracking form removed from the home, CARE+ wording. [Details and live evidence](docs/implementation/RL_DESIGN_PROGRESS.md).

## UI/UX refinement (2026-10-14)

Presentation-only refinement of spacing, alignment and touch targets ([report](docs/verification/ui-refinement-20261014.md)). 15 measured issues fixed; Bring For Me draft checkbox left to draft PR #97; hero gradient contrast reported only. Screenshot baselines were re-rendered in the official image on 2026-10-18 (PR #121). Release state: see deployments.md.

## CI/CD audit (2026-10-15)

Verified: production `4a48cd8c` = `main` `5d66eee`; PR branch Workers Builds are non-deploying (build `11b23adc`: no Version ID, no Preview URL); hosted Actions blocked by billing; `main` cannot have required checks on GitHub Free; production workers.dev still redirects (I-14). Code fix: branch/CI builds can never migrate production (I-13). Read the [CI/CD runbook](docs/operations/cicd.md) before touching CI, Builds, `wrangler.jsonc` or migrations.

## Next safe continuation point

- Shopping/shipping cleanup (2026-10-19): complete; [18 public checks passed](docs/verification/shopping-shipping-20261019.md). PR #74 is superseded and closed. Preserve the separate hero-incident mitigation recorded above; re-query live allocation before future releases.

- Visible silk repair (2026-10-19): **released and publicly verified** in #124 / `5faa822`. Preserve the original-image motion and smooth product protection. Re-query active Cloudflare allocation before future operations; no native-device/field-performance guarantee. [Evidence](docs/verification/hero-silk-20261019.md).

- Hero original silk (2026-10-18): **released** in #122 / `f430d75`, after prerequisite #121 and the passing hosted gate. The original photograph supplies folds and stationary foreground; guarded 18/26-second motion, offscreen/tab pause and reduced-motion/static fallback verified on production. No native-device/field-performance claim. [Release and continuation](docs/verification/hero-silk-20261018.md).

- Weight/size digit input (2026-10-18): deployed by Build `74e026c6`, Version `e3ab56d5-c74b-4317-9c63-c254af2a39cd` after the first build `be61d4c3` failed transiently (cause unknown, log unreadable by the agent; see deployments.md). Verify the active Worker version in Cloudflare (agent has no Workers API access). Details: [report](docs/verification/digit-input-20261018.md). The OTP, rate-limit, review-notice and tenth-kilogram work is in `release-hardening-20261018.md` (another session). Drafts #87 and #98 touch the same files and need a rebase.
- 2026-10-18 owner-authorized continuation after #115/#116: OTP fixed-window resends, decimal-weight regressions, fail-closed limits and transactional review inbox implemented. [Verification and release state](docs/verification/release-hardening-20261018.md). Live Workers API access is now available; initial version `db58bc44-faef-4a0d-bbaf-5c4b16dca311` verified at 100%. This supersedes older session-specific statements that allocation cannot be checked. Real OTP provider and approved staff accounts are still absent.

- Code defect sweep (2026-10-17/18): [PR #115](https://github.com/rebar9988-max/rega-cargo/pull/115) merged `56e53f2`, Workers Builds `6cedf284`, Version `c0c4f5a6-441d-4162-9d53-9b3f837316a0`; live smoke checks passed. The four deferred policy items are now authorized by the 2026-10-18 continuation request (OTP, weight precision with unchanged pricing, fail-closed limits and review notices): [report](docs/verification/code-defects-20261017.md). Verify the active Worker version in Cloudflare (agent has no Workers API access).
- Final verification (2026-10-16, read-only): [report](docs/verification/final-verification-20261016.md). Open blockers: Cloudflare active version/traffic (needs Workers-scoped access; check `wrangler deployments list --name rega-cargo` for `3ca8f27e-...` or a later docs-only build), GitHub Actions billing (owner), Firefox/WebKit/official-image layout lock.
- Final hardening release (2026-10-16): [PR #111](https://github.com/rebar9988-max/rega-cargo/pull/111) merged `d96c4a8`, Workers Builds `f276441a`, Version `63811e37-a1b7-4f30-8fc9-600331d5bc1b`; live ckb/ar/en mobile+desktop, light/dark checks passed. Still owed: Firefox/WebKit, official-image layout lock and stale baseline re-render once Docker/Actions exist; verify the active Worker version and traffic in Cloudflare (agent has no Workers API access). [Report](docs/verification/final-hardening-20261016.md)
- UI touch-target release (2026-10-16): [PR #109](https://github.com/rebar9988-max/rega-cargo/pull/109) merged `a406006`, Workers Builds `06a5f699`, Version `dd667bef-0fcf-4210-b8a3-0da8779a9976`; live ckb/ar/en mobile+desktop checks passed. Still owed: official-image layout lock and stale baseline re-render once Actions/Docker exist; verify the active Worker version in Cloudflare (agent has no API access). [Report](docs/verification/ui-touch-targets-20261016.md).
- CI/CD (2026-10-15): owner actions in [runbook](docs/operations/cicd.md) §4 (billing, required checks, workers.dev). Confirm the PR Workers Builds check actually runs the tests (build log + a deliberately failing draft) before treating it as a test gate (build times varied 27–85 s, which proves nothing; the log is dashboard-only).

The five-improvement beta release is verified. Before official/public release: supply owner-verified legal/business content and approved multilingual policies, configure a working existing OTP delivery provider and identify/verify the exact owner account. Keep stage=beta while content is pending; stage=public restores the complete legal gate. Never seed an arbitrary SUPER_ADMIN or weaken authentication. Query latest production deployments after documentation-only builds.

- The critical domain/WebKit repair is released and verified (PR #89). Owner domain-exclusivity decision is now enforced in Cloudflare: only `https://www.rlgo.net` serves R&L; retired cargo DNS/domain and public staging/preview URLs are closed. Keep them closed; use isolated checks for staging. Preserve the apex/HTTP redirects and SW v12. Do not restore `content-visibility:auto` without the real viewport paint regression. Query current deployments before future releases; documentation-only builds may change the version ID. Native iPhone/direct IPv6/real OTP verification remains a clearly recorded follow-up, not a passed test.

- PR #72 is already merged/live. Continue the unified modernization release gate and existing Cloudflare Builds rollout; see [current verification](docs/redesign/unified-journeys-20261013.md).

1. **PR #121** (re-rendered layout baselines + Firefox project + two test-only fixes): CI green on its head; merge needs the owner's chat instruction and a decisions.md entry. After merging, confirm `scope`, `verify` and `layout lock` on the new `main` run. Never mark a billing-blocked check as passed if Actions stops again (I-7 history).
2. **Database (I-1 resolved)** — Hyperdrive and fallback now target verified cargo. Never migrate/delete the duplicate database. Old scope/approval blockers were superseded by current connected access and the owner's end-to-end authorization.
3. After the owner's change: run the verification recipe in [deployments.md](docs/project-memory/deployments.md) ("Which database does production use?") and the post-deploy checklist; record results here.
4. Open PRs — see [progress.md](docs/project-memory/progress.md).
5. PR #57 (CLS, `5a2c2ecc`) and PR #75 (Nitro, `4242774e`) are live, both merged on a reduced local gate (no official image, screenshots or WebKit: Docker has no reachable daemon in the agent environment; decisions.md). Open: I-9 (staging-only test race, low).

## Memory map

| File | Holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Permanent instructions and the memory lifecycle (start here) |
| [AGENTS.md](AGENTS.md) | Product, hard rules, design-system rules (authoritative) |
| [architecture.md](docs/project-memory/architecture.md) | Stack, code map, runtime, database, environment *names* |
| [features.md](docs/project-memory/features.md) | Routes and features with implementation status |
| [design.md](docs/project-memory/design.md) | Logo, brand, tokens, RTL, layout lock |
| [decisions.md](docs/project-memory/decisions.md) | Dated architectural and product decisions |
| [integrations.md](docs/project-memory/integrations.md) | Integration status summary → `docs/integrations/` |
| [issues.md](docs/project-memory/issues.md) | Known bugs, root causes, fixes |
| [progress.md](docs/project-memory/progress.md) | Done / active / pending work, open PRs |
| [deployments.md](docs/project-memory/deployments.md) | CI/CD, release log, rollback pointers |
| Central Google Doc "R&L — Project Memory & Documentation Hub" (Drive ID `1Wt2rZdmMTviKNsz1bpDUg3as-Egy7FNB_HatI1Y7kH4`) | Cross-tool summary, decisions and change log; updated after every material change (permanent troubleshooting rule in CLAUDE.md, 2026-10-15) |

Detailed canonical docs (do not duplicate them in memory): [DEPLOY.md](DEPLOY.md) ·
[docs/integrations/](docs/integrations/inventory.md) · [docs/redesign/](docs/redesign/README.md).
