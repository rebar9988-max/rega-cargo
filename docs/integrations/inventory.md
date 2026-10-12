# Integration inventory

Snapshot from the Claude Code cloud session of **2026-10-11**. Connector state belongs to
the claude.ai account and the cloud environment, **not** to this repository: a new session
or a different account can see a different list. Re-check with `ListConnectors` (claude.ai
connectors), `ListPlugins`, the session's skill list, and the environment variable *names*
(never print values).

No secrets are recorded here. Neon project IDs, the Cloudflare account ID (already public in
`wrangler.jsonc`) and Worker names are identifiers, not credentials.

## Status legend

- **ready**: connected, authenticated and exercised with a read-only call in this session
- **ready (unused)**: connected, but not relevant to R&L Cargo, so not exercised
- **requires_authorization**: installed on the account, but the connection is incomplete or not enabled in chat
- **not used (paid)**: works, but usage is metered or paid; not used without explicit owner approval

## claude.ai connectors (MCP)

| Integration | Type | Status | Verified with | Relevance to R&L Cargo |
|---|---|---|---|---|
| GitHub | mcp | ready | `get_me` (rebar9988-max), `list_pull_requests`, `actions_list` | Source control, PRs, CI runs. Scope: `rebar9988-max/rega-cargo` |
| Neon | mcp | ready (**write mode**, destructive tools exposed) | `list_projects`, `get_database_tables`, read-only `run_sql` | Production Postgres |
| Sentry | mcp | ready, **no projects** | `find_organizations`, `find_projects` → 0 projects | None until the app is instrumented (it is not today) |
| Context7 | mcp | ready | `resolve-library-id` (Hyperdrive, Workers) | Current library and platform docs |
| Figma | mcp | ready, **View seat** (Starter plan) | `whoami` | Reading designs; a View seat cannot edit team files |
| Supabase | mcp | ready, **0 projects** | `list_projects` | None. Cargo uses Neon. Do not create a project |
| Google Sheets | mcp | ready (unused) | — | No current use |
| Adobe | mcp | ready (unused) | — | Marketing visuals only. Never use it to alter the logo |
| Adobe Marketing Agent | mcp | ready (unused) | — | No current use |
| Canva | mcp | ready (unused) | — | Marketing visuals only. Never use it to alter the logo |
| Lovable | mcp | ready (unused) | — | Not used: it is a separate app builder that spends workspace credits, and the Cargo stack lives here |
| TinyFish | mcp | not used (paid) | — | Metered browser automation. Use the local Playwright Chromium instead |
| alphaXiv | mcp | ready (unused) | — | Not relevant |
| Maryland Community Compass | mcp | ready (unused) | — | Not relevant |
| Claude Docs | mcp | ready (unused) | — | Shareable docs on request |
| Google Drive | mcp | requires_authorization (connected, **not enabled in chat**) | `ListConnectors` | Enable it in the chat's connector settings if needed |
| Google Calendar | mcp | requires_authorization (connect incomplete) | `ListConnectors` | — |
| Google Compute Engine | mcp | requires_authorization (needs reconnect) | `ListConnectors` | — |
| Adspirer Search Ads | mcp | requires_authorization (connect incomplete) | `ListConnectors` | Paid ads. Do not connect without the owner |
| AnythingMCP | mcp | requires_authorization (connect incomplete) | `ListConnectors` | — |
| Blackthorn Forge (Salesforce) | mcp | requires_authorization (connect incomplete) | `ListConnectors` | — |
| InfiniteWatch | mcp | requires_authorization (connect incomplete) | `ListConnectors` | — |
| WebMCP Evaluator | mcp | requires_authorization (connect incomplete) | `ListConnectors` | Could audit public pages later |

## Session tools (not claude.ai connectors)

| Integration | Type | Status | Notes |
|---|---|---|---|
| Cloudflare API | connector (env token) | ready, **partial scope** | `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` are present as env vars. Verified: token active, Workers scripts, deployments, settings (binding names), custom domains. **Hyperdrive read is denied** (`10000 Authentication error`). There is no Cloudflare MCP connector |
| Wrangler CLI | tool | ready | Installed via `npm ci`; `npm run cf:dry-run` passes |
| Playwright + Chromium | tool | ready | `/opt/pw-browsers/chromium`. Used for production QA |
| git / GitHub git proxy | tool | ready | Push to `claude/*` branches |
| claude-code-remote | mcp | ready | Sessions, routines, PR activity subscriptions |
| Artifacts | tool | ready | Private claude.ai pages |
| Plugins | plugin | **none enabled** | `ListPlugins` returned an empty list |
| Skills | skill | built-in only | No R&L-specific skill. Repo guidance lives in `AGENTS.md` and `DEPLOY.md` |

Totals: `ListConnectors` returned 21 claude.ai connectors (13 connected and enabled, 1
connected but off in chat, 7 incomplete or needing reconnect). GitHub and Claude Docs are
listed in the first table, but the session provides them, not `ListConnectors`. That is 23
MCP servers in total, plus the 7 session tools above (git, Wrangler, Playwright, Cloudflare
API, claude-code-remote, Artifacts, built-in skills).
