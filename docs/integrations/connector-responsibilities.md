# Connector responsibilities and usage policy

Applies to every AI-assisted session on R&L Cargo. Current availability lives in
[mcp-connectors.md](mcp-connectors.md); check it (and re-verify) before picking a
connector. AGENTS.md hard rules always win over anything here.

## Responsibility matrix

| Area                                                                  | Primary                                                                                  | Fallback / free alternative                                                         | Status (2026-10-11)                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------- |
| Source, branches, PRs, CI                                             | **GitHub MCP**                                                                           | local `git`                                                                         | Verified                                |
| Library / framework / API docs                                        | **Context7**                                                                             | official docs via WebFetch                                                          | Verified                                |
| UI/UX design authority (layouts, components, tokens, RTL review)      | **Figma**                                                                                | the code itself: `src/styles/tokens.css`, `src/styles.css`, DEPLOY.md "Layout lock" | Verified, View seat only                |
| Marketing / social visuals                                            | **Canva**                                                                                | Adobe Express (HTML → Express)                                                      | Verified                                |
| Asset refinement (crop, resize, background removal, vectorise, fonts) | **Adobe**                                                                                | local tooling                                                                       | Verified                                |
| Postgres inspection, schema checks, preview branches, query tuning    | **Neon**                                                                                 | PGLite (`src/lib/db.ts`) for local work                                             | Verified, but **no R&L project exists** |
| Runtime errors, regressions                                           | **Sentry**                                                                               | Cloudflare Workers observability + logs                                             | Org exists, no project, no SDK          |
| Browser verification                                                  | **Local Playwright + Chromium**                                                          | —                                                                                   | Available (pre-installed)               |
| Structured reporting / shared data                                    | **Google Sheets** (only sheets the owner names)                                          | Markdown in `docs/`                                                                 | Unverified                              |
| Not used for R&L                                                      | Lovable, Supabase, TinyFish, Adobe Marketing Agent, alphaXiv, Maryland Community Compass | —                                                                                   | see inventory                           |

## Tool selection priorities

1. Prefer what is already in the repo (tests, scripts, tokens, docs) over any connector.
2. Use a connector only when it materially improves the result. Never call every connector "to be thorough".
3. Read-only calls first. Any write goes through the rules below.
4. Free over metered. A connector that spends credits, licences or money needs the owner's explicit approval for that specific use.
5. Never claim a connector worked without a real response in the current session.

## Per-connector rules

### GitHub

- Work only on the session's designated branch; never push to another branch or force-push someone else's branch.
- Open a PR only when the owner asks. Check `.github/` for a PR template first.
- CI = "Cargo quality gate". A red check is root-caused, never skipped or quarantined.

### Context7

- Before non-trivial changes to TanStack Start/Router, React 19, Vite 8, Nitro, Tailwind 4, better-auth, Kysely, Wrangler or Playwright: `resolve-library-id` → `query-docs`.
- Match the installed version in `package.json`; do not "upgrade to the documented version" as a side effect.
- Never send secrets or proprietary code in queries.

### Figma

- Design authority for new screens and component specs (including the Soft 3D `.rl-button` primitive and RTL layouts).
- Implementation always maps Figma values onto existing tokens (`--rl-*`, 8px grid, logical properties); never hard-code raw values from Figma output.
- The R&L logo is never redrawn, recoloured or mirrored (DEPLOY.md "Brand logo").
- Current seat is **View**: read files/screenshots/variables only. Creating or editing files needs the owner to upgrade the seat.
- Load the Figma skill the server requires (`figma-design-to-code` before `get_design_context`, `figma-use` before `use_figma`).

### Canva

- Drafts only. Never publish, share publicly, or post marketing material automatically.
- Brand: deep red `#dd0303` accent on white, Noto Sans Arabic / Inter, slogan "MOVE SMART. DELIVER FAST."
- AGENTS.md rules apply to marketing too: no invented prices, discounts, delivery promises, stats or reviews; no implied brand partnership; no banned products (tobacco, vapes, alcohol, haram food/drink).
- Existing Canva designs for REGA or other brands are not R&L assets.

### Adobe

- Call `adobe_mandatory_init` first in every conversation.
- Use for optimisation and preparation of existing assets. Avoid generative output and Adobe Stock licensing unless the owner asks (licences may cost).
- Any image that ships in `public/` follows DEPLOY.md: new file name for changed art, bump `sw.js` `VERSION`.

### Neon (database authority)

- **The only project visible is `rega-platform` — REGA's database. It is off-limits for R&L work** (DEPLOY.md: "Never point this app at REGA's database"). Do not run SQL, create branches, or read data there for Cargo tasks.
- When the owner creates a dedicated Cargo project, record its name here and in the inventory (never its connection string).
- Then: inspect with `get_database_tables` / `describe_table_schema`; test migrations on a Neon branch via `prepare_database_migration` → verify → `complete_database_migration` only with owner approval.
- Migrations are forward-only (`migrations/*.sql`, `scripts/migrate.mjs`). Take a Neon branch before migrating production.
- Never call tools marked destructive (delete*\*, reset*\_, restore\_\_, set_default_branch, rotate/revoke credentials, etc.) without explicit owner approval for that exact action.
- The compliance block (banned products) lives in the database too (`migrations/0011_compliance.sql`, `0012_product_compliance.sql`); never weaken it.

### Sentry

- No R&L project or SDK yet. Do not add the SDK on your own (AGENTS.md rule 5: dependencies only when clearly needed). If the owner wants Sentry: create the project in the Sentry UI, then add the SDK in a dedicated, tested change with the DSN as a Worker secret.
- Once live: `search_issues` → GitHub source → root-cause fix → regression test. Fix the cause; never silence errors.

### Google Sheets

- Only sheets the owner identifies by ID or link. Read first; write only on explicit request.
- Never upload credentials, database exports or customer personal data.

### Supabase

- Empty account. Do not create projects or introduce a second production database. Inspect only.

### TinyFish and other metered browser tools

- Wallet is negative and metered. Do not use. Local Playwright covers browser testing at no cost.
- Never transfer login credentials or bypass authentication with any browser tool.

### Lovable

- Hosts REGA Connect, not R&L. `send_message` / `create_project` spend credits and change another codebase. Not part of R&L work.

## Security rules (all connectors)

- Never commit or paste tokens, connection strings, DSNs, wallet links, or customer data into the repo, PRs, issues, or third-party tools.
- MCP tooling is for development only. Never expose it to public users of cargo.regaplatform.com and never add MCP runtime services to the Worker.
- No paid plan, credit top-up, licence or subscription is activated without the owner.
- No destructive production action (DB, DNS, Worker, data) without explicit owner authorisation.
- Deployment success is claimed only after checking the live URL.
