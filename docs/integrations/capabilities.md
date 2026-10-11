# Capability map: which tool for which R&L task

Use the first tool listed that is available. Re-verify availability with `inventory.md` and
the live connector list. A name in this table does not mean the tool is connected.

| Task | Primary | Fallback | Notes |
|---|---|---|---|
| Repo state, PRs, CI runs and logs | GitHub MCP (`list_pull_requests`, `actions_list`, `get_job_logs`) | local `git` | `gh` is not available in cloud sessions. Use the MCP tools |
| Local quality gate | `npm run typecheck`, `npm test`, `npm run lint`, `DATABASE_URL='' npm run build`, `npm run cf:dry-run` | — | Same steps as `.github/workflows/quality.yml` |
| Layout lock | GitHub CI `layout lock` job | `npm run test:layout:geometry` locally | Baselines are only valid from the official Playwright image (CI or `npm run test:layout:update`) |
| Worker deployments, bindings, custom domains | Cloudflare REST API with the env token (read-only GETs) | `npx wrangler deployments list` | The token **cannot read Hyperdrive** |
| Live Worker logs | `npx wrangler tail rega-cargo --format json` | — | Works with the env token. The observability REST API is denied |
| Which database a binding really reaches | `wrangler dev --remote` against the built config (no production traffic), then compare `pg_stat_database` (`xact_commit`, `xact_rollback`) and `pg_stat_user_tables` counters across Neon projects before and after uncached `/market?q=<random>` probes | — | Read-only. Never print connection strings |
| Worker bundle validation | `npm run cf:dry-run` | — | No deploy |
| Production deploy | `npm run deploy` (DEPLOY.md) | — | **Owner approval only.** Never from an unmerged branch |
| Database schema and migrations | Neon MCP `get_database_tables`, `describe_table_schema`, read-only `run_sql` on project `old-cherry-79292410` | `npm run db:migrate` (only with an approved `DATABASE_URL`) | Make a Neon branch or snapshot before any migration (DEPLOY.md) |
| Compliance blocklist check | Neon `run_sql` read-only counts, `npm test` (`src/lib/compliance/*.test.ts`) | — | Never edit the prohibited tables. DB triggers block this anyway |
| Library and platform docs | Context7 (`/websites/developers_cloudflare_hyperdrive`, `/cloudflare/workers-sdk`) | WebFetch on official docs | |
| Production browser QA | Local Playwright + `/opt/pw-browsers/chromium` against https://cargo.regaplatform.com | `curl` status checks | TinyFish is metered: do not use without approval |
| Design reference | Figma MCP (`get_design_context`, `get_screenshot`) when given a figma.com URL | repo design system at `/_design` | View seat only: no edits to team files |
| Error monitoring | Sentry MCP | Cloudflare Workers observability (enabled in `wrangler.jsonc`) | Sentry has no project yet. Instrumenting it would need a new dependency and owner approval |
| Marketing visuals | Canva / Adobe | — | Never redraw or modify the R&L logo |
