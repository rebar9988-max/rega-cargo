# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Production: https://cargo.regaplatform.com (Cloudflare Worker `rega-cargo`)
- Staging: https://rega-cargo-staging.rebar9988.workers.dev (Worker `rega-cargo-staging`)
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-13 ~10:05 UTC**, branch `claude/local-quality-gate-20261013` (PR #85) based on `main` @ `5d39d9d`. Start with the Codex handoff below, then the current checkpoint.

## CODEX — NEXT SESSION HANDOFF

Written by Claude Code on 2026-10-13 ~10:05 UTC, updated ~10:40 UTC for Codex or any later agent. Read `AGENTS.md`, `CLAUDE.md`, this file and the topic files you need **before acting**, then re-check every "verified" fact below against the live state. **V** = verified by the writing session at the time given, **H** = historical (copied from older memory, not re-checked), **A** = assumption.

**Where things stand**
- V 09:58 UTC: `main` @ `5d39d9d` (PR #84). Task branch `claude/local-quality-gate-20261013`; head = the commit that adds this handoff (find it with `git log -1 origin/claude/local-quality-gate-20261013`); its code commit is `e67c51f`.
- V: [PR #85](https://github.com/rebar9988-max/rega-cargo/pull/85) is **draft**, open, `mergeable_state: clean`. Actions runs 221–222 on it were `skipped` (drafts start no job, so they cost no minutes).
- V 10:35 UTC: [PR #87](https://github.com/rebar9988-max/rega-cargo/pull/87) (**draft**, branch `claude/security-fixes-port-20261013`, head `cd0251c`) ports the five security commits onto `main` @ `5d39d9d`, plus one port fix (see I-12).
- V: [PR #86](https://github.com/rebar9988-max/rega-cargo/pull/86) (draft, `claude/integrations-refresh-20261013`) is **another agent's** concurrent docs-only work. It also edits `docs/project-memory/integrations.md`, which PR #85 changes too, so whichever merges second resolves that conflict. Do not push to #86.
- V: production Worker `rega-cargo` serves version `db08bc5b` at 100% (07:43 UTC, `triggered_by: secret`), on top of code version `fd88780b` (07:03 UTC). That `fd88780b` is the build of `5d39d9d` is **A**, inferred from timing. Read-only HTTP check at 09:35 UTC: required routes 200, banned search empty. Nothing was deployed by Claude Code on 2026-10-13; PR #85 does not change the Worker, so it needs **no deploy** after merge.

**Completed — do not repeat**
- `npm run quality:local` (`scripts/quality-local.mjs` + `scripts/quality-local.test.mjs`): CI verify steps + compliance scan + `npm audit` + layout lock in the official image. Exit 0 = PASS, 2 = PARTIAL, 1 = FAIL. Report: `.quality/local-report.json`.
- `quality.yml`: scope step folded into `verify`; `layout lock` `needs: verify`. No check removed.
- Security port (PR #87): cherry-picks with `-x`; `package.json` test-list conflict resolved; Worker-entry export bug found and fixed (`cd0251c`). Verified on `cd0251c` (PARTIAL): typecheck, `npm test` 221 + 215 tests (0 failed, 4 existing skips), lint 0 errors, build, dry-run 4855 KiB, compliance, audit 0, geometry 297 passed / 12 skipped / 0 failed.
- Audit of open PRs, Actions history and job timings (verify 1.3–1.5 min, layout 12–13 min, runs 159/160) — results are in `deployments.md`, `issues.md` I-7.

**Quality gate results on `e67c51f` (V, cloud session) — status PARTIAL, never call it PASS**
- Passed: typecheck · `npm test` 221 + 216 tests, 0 failed, 4 existing skips · lint 0 errors · build (`DATABASE_URL` empty) · `cf:dry-run` · compliance scan · `npm audit` 0 vulnerabilities · Playwright geometry 297 passed / 12 skipped (Chromium projects + `premium-360`).
- Blocked, not run: screenshot baselines, WebKit projects, official image `mcr.microsoft.com/playwright:v1.63.0-noble`. Hosted CI: blocked.

**Blockers**
1. GitHub Actions billing block (I-7) — owner only (Billing and plans). Agents must never pay, raise limits or change payment methods.
2. No Docker daemon in cloud agent sessions. `dockerd` exists at `/usr/bin/dockerd`, but starting it was **denied by the agent permission policy** (2026-10-13 10:05, classified as container escape); do not retry it. Consequently so the official-image layout lock (screenshots + WebKit) cannot run there. Preinstalled Chromium is revision 1194; Playwright 1.63 wants 1243; WebKit is not installed. Do not run `playwright install`. Geometry-only workaround: the browser shim in `issues.md` I-7.
3. Five security fixes are not on `main` yet. They are now in draft PR #87, which needs the full gate, owner security review and owner authorization to merge and deploy. The original branch `origin/claude/rega-cargo-clone-oyhxb4` @ `23eaa92` is kept unchanged; it can be closed or deleted by the owner once #87 merges.
4. Phone OTP provider credentials are missing (I-3/I-6), so authenticated journeys cannot be verified. **H**.

**Next actions, in order**
1. Re-verify: `git fetch origin`, open PRs (GitHub MCP `list_pull_requests`), the newest Actions runs, and the live deployments (read-only).
2. On a machine **with** a Docker daemon (owner laptop or Codex environment, if it has one):
   ```sh
   git checkout claude/local-quality-gate-20261013 && npm ci && npm run quality:local
   ```
   - Exit 0: record the result in `decisions.md`/`progress.md` and mark PR #85 ready.
   - Exit 1: fix the failure.
   - Exit 2: still PARTIAL — keep the PR in draft.
3. The owner merges PR #85, or authorizes the merge in chat (`main` has no branch protection on this plan, so the authorization is the gate). Nothing to deploy afterwards.
4. Security commits: **done as draft PR #87** — do not re-port them.
   - Remaining: on a Docker machine run the full gate on `claude/security-fixes-port-20261013`. `quality:local` lives on #85, so either merge #85 first or run its steps by hand.
   - Then the owner reviews.
   - After an authorized merge, deploy staging first, then production through the existing Cloudflare Builds path. That deploy is a Worker change and needs no migration or new binding. Never deploy while another deploy is running: check `GET .../workers/scripts/rega-cargo/deployments` first.
   - After deploy, smoke-test that the Worker starts, `/api/ai/challenge` works, and `/track` accepts a long code and refuses `RG-12345`.
5. Once billing is fixed: re-run the newest `main` run and confirm `verify` and `layout lock` pass, then close I-7.

**Safe to automate:**
- reading GitHub, Actions and Cloudflare state
- `npm ci`, `npm run quality:local`, and any local test
- commits and pushes on task branches; draft PRs
- updating memory

**Owner authorization required:**
- merging into `main`
- any production or staging deploy
- secret or binding changes
- database writes or migrations
- closing other people's PRs
- billing or plan changes
- anything that costs money

**Never:**
- touch REGA (`rebar9988-max/Rega`, Worker `rega-platform`)
- put secrets in memory
- report PARTIAL as PASS or hosted CI as green
- skip, quarantine or re-baseline tests to get green
- run two production deploys at once

**Engineering tools (availability is per session — re-check)**

| Tool | State 2026-10-13 |
|---|---|
| GitHub MCP | V working: PRs, Actions runs and jobs, PR create. No `gh` CLI |
| Cloudflare REST API (env token by name `CLOUDFLARE_API_TOKEN`) | V working read-only: Worker deployments and versions |
| npm registry | V reachable: `npm ci`, `npm audit` |
| Node | V 22.22 |
| Playwright | V 1.63 with the Chromium 1194 shim, geometry only |
| Docker | V CLI 29.8 present, daemon unreachable |
| Production over HTTPS | V reachable |
| Neon, Supabase, Sentry, Figma, Context7 MCP | Listed as connected; **not exercised** this session (see [integrations.md](docs/project-memory/integrations.md)) |

Codex's environment may differ: test each tool before relying on it.

## Current checkpoint (2026-10-13)

- **Local quality gate + CI minutes (branch `claude/local-quality-gate-20261013`, not merged):** `npm run quality:local` (`scripts/quality-local.mjs`, tests in `scripts/quality-local.test.mjs`). Run on `5d39d9d` + this change: typecheck, `npm test` 221+216 tests (4 existing skips, 0 failed), lint 0 errors, build, cf dry-run, compliance scan, `npm audit` 0 vulnerabilities, Playwright geometry 297 passed / 12 skipped on local Chromium → **PARTIAL**: no Docker daemon in the cloud session, so screenshots and WebKit were not run. The session's Chromium is revision 1194, Playwright 1.63 expects 1243 (scratchpad shim, see issues I-7). Workflow: `scope` folded into `verify` (one fewer billed job per run) and `layout lock` now `needs: verify`. Hosted CI still blocked (I-7). No Worker code change, no deploy.
- Production read-only check 09:35 UTC: live version `db08bc5b` (100%, created 07:43 UTC by a secret change, `triggered_by: secret`) on top of `fd88780b` (07:03, version upload ~30 s after `main` `5d39d9d` / PR #84 merged; the commit link is inferred from timing). 12 required routes 200, `/market` 307 to its canonical query URL then 200, `<html lang="ckb" dir="rtl">`, `/api/ai/status` 200, `?q=vodka` lists nothing.
- **Unmerged security work found:** `origin/claude/rega-cargo-clone-oyhxb4` carries 5 `fix(security)` commits (`df19bd1`..`8b67547`, 2026-10-12) that are not on `main` and have no open PR. Not touched; see progress.md.

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

## Next safe continuation point

- PR #72 is already merged/live. Continue the unified modernization release gate and existing Cloudflare Builds rollout; see [current verification](docs/redesign/unified-journeys-20261013.md).

1. **Owner action (I-7)** — GitHub Actions stays blocked by billing (owner chose not to pay; included minutes reset next billing cycle). Until then run the full quality gate locally in the official Playwright image before any merge (decision 2026-10-12). Once Actions runs again, re-run CI on `main` (newest head) and confirm `verify` and `layout lock` are green; a docs-only push must show `layout lock` as skipped. Before any merge run `npm run quality:local` on a machine with Docker (exit 0 = full parity).
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
