# R&L Cargo — Project memory index

Central memory for every Claude Code session on R&L Cargo. Entry point: [CLAUDE.md](CLAUDE.md).
Memory is a guide, not proof: **re-verify against code, GitHub and production before acting**.

- Production: https://cargo.regaplatform.com (Cloudflare Worker `rega-cargo`)
- Staging: https://rega-cargo-staging.rebar9988.workers.dev (Worker `rega-cargo-staging`)
- Repo: `rebar9988-max/rega-cargo`, default branch `main`
- Last memory update: **2026-10-12 06:57 UTC production recheck and local gate-repair follow-up**, PR [#68](https://github.com/rebar9988-max/rega-cargo/pull/68); main remains `486e442`. Earlier AI runtime fixes `e430bbf` / `f210498` and this continuation are not deployed.

## Current state (dated evidence from 2026-10-11 15:14–16:10 UTC; quality follow-up below)

| Area | State | Evidence |
|---|---|---|
| Public pages | All AGENTS.md required routes return 200 (`/`, `/stores`, `?cat=`, `?fav=1`, `/stores/request`, `/quote`, `/ai`, legal pages); `<html lang="ckb" dir="rtl">` | `curl` against production, 15:36 |
| R&L AI | On (`/api/ai/status` → `{"enabled":true}`) | production |
| Live Worker version | `10723cf0`, deployed 2026-10-11 15:28 UTC by another session (source commit not recorded) | Cloudflare API, 15:36 |
| **Production database** | **BROKEN — blocker (I-1).** The Worker queries `misty-recipe-03041407/neondb`, which only has `0002_market.sql`. `/market` renders its error state; logs: `column p.compliance_status does not exist`, `relation "prohibited_keywords" does not exist` | `7b92d650`: 6 probes, `misty/neondb` rollbacks 257→287; `10723cf0`: 4 probes, 334→340; `old-cherry/cargo` rollbacks 0 throughout; `wrangler tail` (7/7 requests) |
| Correct database | `old-cherry-79292410/cargo`: later read verified 13 migrations / 413 keywords; existing staging still 12 / 378. Migration 0014 was applied by another session | Neon exact read-only SQL; [AI audit](docs/ai/audit-2026-10-11.md) |
| Customer data | Exact counts found zero accessible application records in both targets, including phone users/sessions, roles, products/offers and requests/events. Other schemas, external identity and later writes are not covered; do not infer lossless repointing without the full safety checks | Read-only aggregate counts, no row contents |
| Hyperdrive config `795013d0…` | This session's authorized Cloudflare connector **can read** the origin: misty-recipe/neondb, still verified at 16:10. CLI auth unavailable; edit permission and rollback credentials unverified | Authorized GET 200; session-specific permissions |
| AI P0 repair | Tested, unmerged draft #68: nonrefundable attempts, monotonic UTC rollover, safe error/origin/output handling, localized-price filtering, atomic layout config | [Audit and evidence](docs/ai/audit-2026-10-11.md); no production release |
| Sign-in | Worker logs `auth is disabled (VITE_AUTH_ENABLED=false)`; Better Auth fails closed and phone codes cannot be sent, so nobody can sign in (I-3, I-6) | `wrangler tail` |
| Banned-products protection | Holds via the bundled list in `src/lib/compliance/rules.ts` | `wrangler tail`: "using bundled list" |

Latest local gate repairs: **445 Node 22 tests passed, zero failed, four existing skips**; typecheck, lint, empty-DB build and dry run passed. Rate-binding failures now fail closed; token/upload/namespace faults return classified responses, and challenge responses are no-store. All 148 public assets remain unchanged; the full pinned-Docker browser run passed with 379 passes, one flaky passed on existing retry and 12 existing skips. See [the audit](docs/ai/audit-2026-10-11.md). This is local evidence, not remote CI or a production deployment.

## Next safe continuation point

Owner renewed autonomous authorization. The related AI gate repairs and full pinned-Docker browser check are complete locally and recorded in draft #68. Continue from the concrete billing/connected-preview/CI release gates below; do not repeat routine permission requests. At 06:32 UTC, billing errors, Hyperdrive origin and production version remained unchanged; authorization does not create missing account scopes or runtime credentials. The single flaky WebKit case remains disclosed, not declared repaired.

Fresh live baseline at 06:54 UTC passes ten desktop/mobile page and negative AI checks; actual inference/authenticated DB workflows remain unverified. Final 06:57 UTC production read still reports `10723cf0` at 100%, deployed by another session. No deployment or production data/credential/binding change by this work.

Latest [TinyFish investigation and concrete recovery sequence](docs/ai/access-recovery-2026-10-12.md): paid automation is blocked by the reported negative wallet balance and unconfirmed dashboard sign-in; only verified zero-rate Search/Fetch was used. Cloudflare billing still fails 10000, GitHub billing still fails 403, and Hyperdrive still points to `neondb`. Production version remains `10723cf0`. No repair/deployment of those external blockers is claimed.

1. Continue from draft [#68](https://github.com/rebar9988-max/rega-cargo/pull/68). Its review base mirrors audited main and avoids starting unverified-cost Actions. Verify the Actions allowance/zero-spend guard before retargeting to current main; preserve later work and satisfy both mandatory quality jobs/reviews. No remote CI result exists for this patch.
2. For I-1, reuse existing Cargo/staging; recheck their current migration/data difference, connected app preview, authentication boundaries, coordinated Hyperdrive/fallback configuration and rollback readiness. Keep both databases. Do not automatically run legacy cleanup migrations or delete the duplicate.
3. The owner explicitly authorized autonomous safe incremental work and no routine questions in this task. That does not waive billing, authentication, data-safety or required release gates. Cloudflare billing reads fail 10000 and GitHub Actions usage reads fail 403. Deployment remains blocked by those evidence/gate gaps, not by a request to repeat routine permission.
4. Open PRs and verified limitations — see [progress.md](docs/project-memory/progress.md), [issues.md](docs/project-memory/issues.md), and the linked AI audit.

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
