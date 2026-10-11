# Integration usage policy

These rules add to `AGENTS.md` and `DEPLOY.md`. Where they conflict, those files win.

## Always allowed (read-only)

- GitHub: read PRs, runs, logs and files. Push to `claude/*` branches.
- Cloudflare: GET requests for Workers, deployments, settings and domains.
- Neon: list projects and tables, and `SELECT`-only SQL on the production project.
- Production HTTP and browser checks against public pages (no form submissions that create records).
- Context7 and other documentation lookups.

## Requires explicit owner approval

- Any production deploy (`npm run deploy`, `wrangler deploy`), secret change (`wrangler secret put`) or route or domain change.
- Any Neon write: DDL, DML, `db:migrate` against production, creating or deleting projects or branches, rotating credentials.
- Deleting the duplicate Neon project `misty-recipe-03041407` (see `verification-report.md`).
- Enabling any paid or metered service: TinyFish, Lovable credits, Adspirer, Neon or Cloudflare plan upgrades.
- Connecting a new connector, or completing the connection for any connector listed as `requires_authorization`.
- Merging PRs.

## Never

- Print, commit or log tokens, passwords, connection strings or cookies. Refer to env vars by *name* only.
- Point Cargo config at the REGA worker `rega-platform`, the apex or `www.regaplatform.com`, or the `rega-platform` Neon project.
- Edit `prohibited_categories`, `prohibited_keywords` or `compliance_audit_log`, or weaken the compliance filter.
- Alter the R&L logo in any design tool.
- Use one service's credentials to act as the owner in another service.

## Recovery

- Bad Worker deploy: follow DEPLOY.md "Rollback" (`npx wrangler deployments list --name rega-cargo`, then `npx wrangler rollback <version-id> --name rega-cargo`). Requires owner approval.
- Bad migration: migrations are forward-only. Restore from the Neon branch taken before migrating (DEPLOY.md "Rollback" → Database).
- Lost connector: reconnect it in claude.ai Settings → Connectors. Repository files cannot restore authentication.
