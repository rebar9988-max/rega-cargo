# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Primary production domain: https://www.rlgo.net (Cloudflare Worker `rega-cargo`); apex and HTTP variants redirect directly to canonical HTTPS www. Retired cargo.regaplatform.com detached; production workers.dev and version previews disabled.
- Staging: Worker `rega-cargo-staging` retained with no public URL; workers.dev and version previews disabled. Cloudflare Builds branch previews disabled.
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-14**, five-improvement beta candidate on main `19c17f2`; owner expressly permits incomplete legal content during beta. Existing R&L AI release and permanent baseline remain intact. See the candidate checkpoint and evidence below.


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
| GitHub Actions | **BROKEN — blocker for merging (I-7).** No job starts since ~15:38 UTC 2026-10-11, on `main` too. Verified cause: account billing (failed payment or spending limit; agents cannot read the billing page to tell which) — owner must fix in Billing and plans. Re-verified on `main` @ `a7ee020` run 186. Mitigation PR #77: docs-only changes skip the layout job, drafts skip CI, superseded PR runs cancel | check-run annotations, 2026-10-12 06:31 and 18:36 |
| Production smoke (2026-10-12 06:48) | Live `853e698b`: all required routes 200, `<html lang="ckb" dir="rtl">`, `/api/ai/status` enabled, banned searches (vodka, cigarettes, vape, pork bacon) list nothing, legacy host 301; hero card + tracking card render at 360/390px light/dark in ckb/ar/en with no horizontal scroll; `wrangler tail` 63/63 ok | `curl`, Playwright, `wrangler tail` |
| Shipping/bazaar separation | PR #72 merged (`3c7ad5a`) and live since `12dcd05e` (19:05 UTC). Dedicated shipping page on `/quote`, catalogue-only `/stores`, no home calculator/service switch | [verification report](docs/redesign/shipping-separation.md) |
| Header category strip | PR #78 live (`2e724d37`): phones/tablets get a 64px brand-red header and a swipeable category strip under it; desktop unchanged. Verified on production 21:05–21:10 UTC: 20 routes 200, Playwright 264 passed / 9 skipped / 0 failed (all Chromium devices + 360px suite), no horizontal overflow at 390/820/1280 | [design.md](docs/project-memory/design.md) |
| Banned-products protection | Holds via the bundled list in `src/lib/compliance/rules.ts` | `wrangler tail`: "using bundled list" |

## Five-improvement candidate checkpoint (2026-10-14)

Branch `codex/rl-five-improvements-20261013` integrates main `19c17f2` and preserves the owner-only AI baseline. Secure opt-in drafts/email fallback, verified-content trust/complaint plumbing, transparent unchanged pricing, truthful tracking and bounded AI policy/token replay repairs are implemented. Fresh database-role authority and domain-owned SUPER_ADMIN CRUD/audit are isolated-tested; no public grants or owner provisioning. [Candidate evidence](docs/verification/rl-five-improvements-20261013.md).

**Beta deployment newly authorized (2026-10-14):** owner explicitly defers legal/business completion until official release, superseding the earlier legal-data hold. No verified SUPER_ADMIN / delivered OTP verification is available; keep privileges closed and report this limitation. Production migration 0015 is now applied transactionally after successful existing Neon dev-branch validation/reapplication; business record counts unchanged and no roles granted. Fresh local 483-pass gate, build/typecheck/lint/dry-run passed; final mobile gate and authorized beta rollout continue. Main automatic build remains the existing deployment workflow. Existing production version inspected: `0f6e2dd7`, 100%, 07:16 UTC. Hosted main Actions `38527176459` failed before steps; no hosted green result. Final local checks and [open draft PR #95](https://github.com/rebar9988-max/rega-cargo/pull/95) are in the evidence report. Final strict affected gate: 45/45 pass with no retries, original failure/retry retests 14/14 pass; source 22ef7be. Worktree is committed/pushed; no merge/deploy.

## Next safe continuation point

For the five-improvement candidate: complete the authorized beta release using the explicit beta policy, safe additive migration and existing merge/build workflow. Keep missing legal content visibly pending; stage=public must require verified facts/policies. Do not seed an arbitrary SUPER_ADMIN or weaken OTP/security. Real owner/OTP verification remains an honest limitation.

- The critical domain/WebKit repair is released and verified (PR #89). Owner domain-exclusivity decision is now enforced in Cloudflare: only `https://www.rlgo.net` serves R&L; retired cargo DNS/domain and public staging/preview URLs are closed. Keep them closed; use isolated checks for staging. Preserve the apex/HTTP redirects and SW v12. Do not restore `content-visibility:auto` without the real viewport paint regression. Query current deployments before future releases; documentation-only builds may change the version ID. Native iPhone/direct IPv6/real OTP verification remains a clearly recorded follow-up, not a passed test.

- PR #72 is already merged/live. Continue the unified modernization release gate and existing Cloudflare Builds rollout; see [current verification](docs/redesign/unified-journeys-20261013.md).

1. **Owner action (I-7)** — GitHub Actions stays blocked by billing (owner chose not to pay; included minutes reset next billing cycle). Until then run the full quality gate locally in the official Playwright image before any merge (decision 2026-10-12). Once Actions runs again, re-run CI on `main` (newest head) and confirm `scope`, `verify` and `layout lock` are green; a docs-only push must show `layout lock` as skipped.
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

Detailed canonical docs (do not duplicate them in memory): [DEPLOY.md](DEPLOY.md) ·
[docs/integrations/](docs/integrations/inventory.md) · [docs/redesign/](docs/redesign/README.md).
