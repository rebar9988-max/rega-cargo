# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Production: https://cargo.regaplatform.com (Cloudflare Worker `rega-cargo`)
- Staging: https://rega-cargo-staging.rebar9988.workers.dev (Worker `rega-cargo-staging`)
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-12**, UI follow-up [PR #74](https://github.com/rebar9988-max/rega-cargo/pull/74) integrates `main` @ `238b755` (including PR #57 released as `5a2c2ecc`). The UI branch is not merged or deployed; final integration checks are pending. Earlier production observations below remain historical.

## Current state (verified 2026-10-11 15:14–15:38 UTC)

| Area | State | Evidence |
|---|---|---|
| Public pages | All AGENTS.md required routes return 200 (`/`, `/stores`, `?cat=`, `?fav=1`, `/stores/request`, `/quote`, `/ai`, legal pages); `<html lang="ckb" dir="rtl">` | `curl` against production, 15:36 |
| R&L AI | On (`/api/ai/status` → `{"enabled":true}`) | production |
| Live Worker version | `5a2c2ecc`, deployed 2026-10-12 18:11 UTC from `main` @ `361f954` (PR #57); previous `853e698b` | `wrangler deploy` output, `wrangler deployments list` |
| **Production database** | **BROKEN — blocker (I-1).** The Worker queries `misty-recipe-03041407/neondb`, which only has `0002_market.sql`. `/market` renders its error state; logs: `column p.compliance_status does not exist`, `relation "prohibited_keywords" does not exist` | `7b92d650`: 6 probes, `misty/neondb` rollbacks 257→287; `10723cf0`: 4 probes, 334→340; `old-cherry/cargo` rollbacks 0 throughout; `wrangler tail` (7/7 requests) |
| Correct database | `old-cherry-79292410`, database `cargo`: 12/12 migrations (09:38 UTC), 8 compliance triggers, 378 banned keywords | Neon read-only SQL |
| Customer data | **None in either database** (0 products, users, requests, orders) — repointing loses nothing | `pg_stat_user_tables` on both |
| Hyperdrive config `795013d0…` | Origin cannot be read by agents (API and `wrangler hyperdrive get`: `Authentication error 10000`) | Cloudflare |
| Sign-in | Worker logs `auth is disabled (VITE_AUTH_ENABLED=false)`; Better Auth fails closed and phone codes cannot be sent, so nobody can sign in (I-3, I-6) | `wrangler tail` |
| GitHub Actions | **BROKEN — blocker for merging (I-7).** No job starts since ~15:38 UTC 2026-10-11, on `main` too. Verified cause: account billing (failed payment or spending limit) — owner must fix in Billing and plans | check-run annotation, 2026-10-12 06:31 |
| Production smoke (2026-10-12 06:48) | Live `853e698b`: all required routes 200, `<html lang="ckb" dir="rtl">`, `/api/ai/status` enabled, banned searches (vodka, cigarettes, vape, pork bacon) list nothing, legacy host 301; hero card + tracking card render at 360/390px light/dark in ckb/ar/en with no horizontal scroll; `wrangler tail` 63/63 ok | `curl`, Playwright, `wrangler tail` |
| Banned-products protection | Holds via the bundled list in `src/lib/compliance/rules.ts` | `wrangler tail`: "using bundled list" |

## Next safe continuation point

- Home UI follow-up: finish the browser gate and review the [service-separation report](docs/redesign/home-service-separation.md). Merge/deploy remains subject to the existing explicit owner-approval policy.

1. **Owner action (I-7)** — GitHub Actions stays blocked by billing (owner chose not to pay; included minutes reset next billing cycle). Until then run the full quality gate locally in the official Playwright image before any merge (decision 2026-10-12). Once Actions runs again, re-run CI on `main` to confirm `9ba82e9` is green.
2. **Owner action (blocker, I-1)** — agents lack the Hyperdrive permission and need owner approval for secrets/deploys. Exact steps in [issues.md](docs/project-memory/issues.md) (I-1 "Fix").
3. After the owner's change: run the verification recipe in [deployments.md](docs/project-memory/deployments.md) ("Which database does production use?") and the post-deploy checklist; record results here.
4. Open PRs — see [progress.md](docs/project-memory/progress.md).
5. **Nitro bump (I-4)** is validated locally only (isolated worktree: `npm audit` 5 highs -> 0, 400 unit tests, build, dry-run, 95 geometry tests) and not yet a PR. PR #57 (I-8) merged as `361f954` and deployed as `5a2c2ecc` on a reduced local gate (no official image, screenshots or WebKit: Docker has no reachable daemon in the agent environment; see decisions.md).

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
