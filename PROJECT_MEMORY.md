# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Production: https://cargo.regaplatform.com (Cloudflare Worker `rega-cargo`)
- Staging: https://rega-cargo-staging.rebar9988.workers.dev (Worker `rega-cargo-staging`)
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-11 ~15:10 UTC**, against `main` @ `f5cfccb`

## Current state (verified 2026-10-11 ~15:08 UTC)

| Area | State | Evidence |
|---|---|---|
| Public pages | `/`, `/stores`, `/quote`, `/ai`, `/robots.txt` return 200; `<html lang="ckb" dir="rtl">` | `curl` against production |
| R&L AI | On (`/api/ai/status` → `{"enabled":true}`) | production |
| Live Worker version | `c20d050d`, deployed 2026-10-11 10:45 UTC (wrangler) | Cloudflare API |
| **Production database** | **BROKEN — blocker.** `HYPERDRIVE` and `DATABASE_URL` both reach the empty duplicate Neon project `misty-recipe-03041407/neondb` (12 market tables, no compliance tables). `/market` shows its "try again" error state | Now: `misty/neondb` 255 rollbacks, `old-cherry/cargo` 0 (Neon SQL); `/market` HTML. Per-binding mapping: verification-report.md (10:40 UTC). See [issues.md](docs/project-memory/issues.md) (I-1) |
| Real schema | `old-cherry-79292410`, database `cargo`: 12/12 migrations (latest `0013`), 378 prohibited keywords, 0 products | Neon read-only SQL |
| Banned-products protection | Holds in production via the bundled list in `src/lib/compliance/rules.ts` | earlier `wrangler tail` (verification-report.md) |
| `main` CI | Run 153 on `f5cfccb`: success | GitHub Actions |

## Next safe continuation point

1. **Owner action (blocker):** repoint Hyperdrive config `795013d0…` and the `DATABASE_URL` secret at `old-cherry-79292410` / `cargo` — exact steps in [verification-report.md](docs/integrations/verification-report.md#open-items-for-the-owner). Agents cannot do this: the Cloudflare token cannot read/edit Hyperdrive, and secret changes need owner approval.
2. After that: re-verify `/market` loads, `wrangler tail` is clean, and the `old-cherry` counters move.
3. Open PRs to review/land — see [progress.md](docs/project-memory/progress.md).

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
