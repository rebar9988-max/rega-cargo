# Integration inventory (shared by Codex and Claude Code)

Last full verification: **2026-10-13, Claude Code cloud session** (evidence in
[verification-report.md](verification-report.md)). Previous snapshot: 2026-10-11.

Connector state belongs to the **account and the agent runtime**, not to this repository.
Codex and Claude Code have separate authentication. A tool that works in one agent does not
mean it works in the other, and this file never transfers credentials. Each agent re-checks
its own column at session start (Claude Code: `ListConnectors`, `ListPlugins`, `ListSkills`,
environment variable *names*; Codex: its own MCP/connector list and `codex mcp list`).

No secrets are recorded here. Neon project IDs, the Cloudflare account ID (already public in
`wrangler.jsonc`) and Worker names are identifiers, not credentials.

## Status legend

| Status | Meaning |
|---|---|
| **verified** | A safe read-only call succeeded in that agent on the date shown |
| **connected, untested** | Listed as connected, deliberately not exercised (not relevant to R&L, or metered) |
| **not authenticated** | Installed, but the connection is incomplete or needs reconnect |
| **owner authorization** | Needs OAuth consent, a new credential, a token scope change or billing — owner only |
| **unavailable** | Not present in that runtime |
| **paid / metered** | Usage costs money or credits; not used without explicit owner approval |
| **not needed** | Works or exists, but has no R&L engineering use |
| **unknown** | Not observable from that agent. Codex must fill in its own column |

## Comparison

The Codex column is **unknown** for every row: Claude Code cannot see Codex's runtime (no
`codex` CLI, no `.codex/` config in this container or repo). The first Codex session that reads
this file should replace `unknown` with its own verified result and date.

| Tool | Purpose for R&L | Claude Code (2026-10-13) | Codex | Free | Action required |
|---|---|---|---|---|---|
| GitHub MCP | PRs, CI runs, logs, files | **verified**: `get_me` = rebar9988-max, `list_pull_requests` (10 open), `actions_list` | unknown | yes | none |
| GitHub Actions (hosted CI) | `quality.yml` gate | **verified broken**: runs 217–220 end in ~3 s (billing block, I-7) | n/a (account level) | blocked | **Owner**: fix billing or wait for minute reset. Agents must not pay |
| git CLI + git proxy | commits, `claude/*` branches | **verified**: fetch `origin/main` @ `5d39d9d` | unknown | yes | none |
| `gh` CLI | — | installed (2.89.0) but **not to be used** in cloud sessions; use GitHub MCP | unknown | yes | none |
| Cloudflare REST API (env token `CLOUDFLARE_API_TOKEN`) | Worker, deployment, domain reads | **verified, partial scope**: token active; scripts `rega-cargo`, `rega-cargo-staging`, `rega-platform`; live version `db08bc5b` (100 %); `cargo.regaplatform.com → rega-cargo`. **Denied**: Hyperdrive, Workers Observability telemetry (code 10000), User Details | unknown | yes (reads) | **Owner (optional)**: add `Hyperdrive: Read` and `Workers Observability: Read` to the token |
| Wrangler CLI 4.149.0 | dry-run, `deployments list`, `tail` | **verified**: `whoami` (user API token), `deployments list --name rega-cargo`, `cf:dry-run` 4850.60 KiB | unknown | yes | none. Deploys follow `CLAUDE.md` / `DEPLOY.md` policy |
| Cloudflare Workers Observability | logs/traces | config `observability.enabled: true`; REST read **denied** for token; `wrangler tail` is the working path | unknown | included in plan | see token scope above |
| Neon MCP | production Postgres | **verified (write mode, destructive tools exposed)**: `list_projects` (3), read-only `run_sql` on `old-cherry-79292410/cargo` | unknown | free plan limits | none. Writes/migrations = owner approval |
| PostgreSQL `psql` 16.15 | local SQL client | installed, not used (no connection string in env, by design) | unknown | yes | none |
| Playwright 1.63.0 + Chromium | browser QA, layout lock | **verified with `executablePath`**: preinstalled `/opt/pw-browsers/chromium-1194` (Chromium 141) loads production. Default launch fails: 1.63 expects build 1243, which is not installed | unknown | yes | Use `executablePath` (or the official Docker image in CI). Never `playwright install` in cloud |
| Docker CLI 29.8.2 | official-image layout lock | CLI present, **no daemon** in this container (`/var/run/docker.sock` missing) | unknown | yes | Run `npm run test:layout:update` / full layout lock where Docker runs |
| Lighthouse 12.8.2 (via `npx`, not a dependency) | perf / a11y / SEO audits | **verified**: production `/` → perf 0.95, a11y 1.00, best practices 1.00, SEO 1.00 | unknown | yes | none (not added to `package.json`) |
| TypeScript 5.9.3 | type-check | **verified**: `npm run typecheck` pass | unknown | yes | none |
| ESLint 9.39.5 | lint | **verified**: 0 errors, 5 warnings | unknown | yes | none |
| Node test runner | unit / integration / compliance tests | **verified**: `npm test` 211 + 216 pass, 0 fail | unknown | yes | none |
| `npm audit` | dependency vulnerabilities | **verified**: `--omit=dev --audit-level=high` → 0 vulnerabilities | unknown | yes | none |
| Compliance scan | banned-product guard | **verified**: `npm run compliance:scan` pass | unknown | yes | none |
| Context7 MCP | current library docs | **verified**: `resolve-library-id` (Cloudflare Workers) | unknown | yes | none |
| Sentry MCP | error monitoring | **verified**: org `terms-of-service-1c` (EU), **0 projects**; app has no SDK | unknown | free tier exists, limits not verified | Not activated. Creating a project + SDK = owner decision and a new dependency |
| Figma MCP | read designs | **verified**: `whoami` → Starter team, **View seat** | unknown | yes (read) | none. Read-only; `generate_image` spends Figma AI credits — do not use |
| Supabase MCP | — | connected, 0 projects (2026-10-11) | unknown | — | **not needed**: R&L uses Neon. Never create a project |
| Canva MCP | marketing visuals | connected, untested | unknown | plan-dependent | only on explicit request; never touch the logo |
| Adobe / Adobe Marketing Agent MCP | marketing visuals | connected, untested | unknown | plan-dependent | only on explicit request; never touch the logo |
| Lovable MCP | — | connected, untested | unknown | **paid / metered** (workspace credits) | **not needed**: separate app builder |
| TinyFish MCP | — | connected, untested | unknown | **paid / metered** | **not needed**: use local Playwright |
| Google Sheets MCP | — | connected, untested | unknown | yes | not needed today |
| Claude Docs MCP | shareable docs | connected, untested | unknown | yes | only on request |
| alphaXiv, Maryland Community Compass MCP | — | connected | unknown | — | **not needed** |
| Google Drive | — | **not authenticated** (`connect_incomplete`; was "connected but off" on 2026-10-11) | unknown | — | Owner reconnect only if needed |
| Google Calendar, Adspirer, AnythingMCP, Blackthorn Forge, InfiniteWatch, WebMCP Evaluator | — | **not authenticated** (`connect_incomplete`) | unknown | Adspirer = paid ads | not needed; do not connect |
| Google Compute Engine | — | **not authenticated** (`needs_reconnect`) | unknown | paid infra | not needed; do not connect |
| claude-code-remote MCP | sessions, routines, PR subscriptions | available (Claude Code only) | unavailable | yes | none |
| Artifacts | private claude.ai pages | available (Claude Code only) | unavailable | yes | none |
| Plugins (claude.ai) | — | `ListPlugins` → **none** | unknown | — | none |
| Skills | — | built-in/claude.ai skills only; **no R&L-specific skill**; repo guidance lives in `AGENTS.md`, `CLAUDE.md`, `DEPLOY.md` | unknown | — | none |

## Totals (Claude Code, 2026-10-13)

| Count | Value | Which |
|---|---|---|
| Tools discovered | **40** (33 table rows; some rows group several connectors) | 21 claude.ai connectors (`ListConnectors`), GitHub MCP, Claude Docs MCP, claude-code-remote, Artifacts, plugins, skills, GitHub Actions, and 12 local CLIs/services |
| Verified working today | **15** | GitHub MCP, git, Cloudflare API (partial), Wrangler, Neon, Playwright+Chromium, Lighthouse, TypeScript, ESLint, Node tests, npm audit, compliance scan, Context7, Sentry (0 projects), Figma (View seat) |
| Broken or unavailable | **4** | GitHub Actions (billing), Docker daemon, Cloudflare Hyperdrive + Observability REST (token scope), Codex CLI (not in this container) |
| Not authenticated | **8** | Google Drive, Google Calendar, Google Compute Engine, Adspirer, AnythingMCP, Blackthorn Forge, InfiniteWatch, WebMCP Evaluator |
| Owner authorization required | **3** | GitHub billing (I-7), Cloudflare token scopes (optional), any connector reconnect |
| Paid or metered | **6** | Lovable, TinyFish, Adspirer, Google Compute Engine, Figma AI image generation, GitHub Actions minutes |
| Configured by agents | **0 new** | Nothing needed a new connection: every relevant free tool was already connected. No OAuth, token, plan or account was created or changed |
