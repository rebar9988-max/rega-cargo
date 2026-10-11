# AI-assisted development workflow

How Claude Code (or any AI agent) works on R&L Cargo. Read with AGENTS.md
(product and hard rules), DEPLOY.md (build, deploy, brand, layout lock) and
[../integrations/connector-responsibilities.md](../integrations/connector-responsibilities.md).

## Session start

1. Read `AGENTS.md`, then `docs/integrations/mcp-connectors.md`.
2. Re-verify only the connectors the task needs (read-only check listed in the inventory). Load deferred tools with `ToolSearch` before deciding a connector is missing.
3. If a result differs from the inventory, update the inventory in the same change.

## Workflows

Use only the steps that add value to the task.

### UI/UX change

Figma (read the frame, if one exists) → map to existing tokens in `src/styles/tokens.css` / `src/styles.css` → implement with logical CSS properties, i18n strings (`TODO(translate-review)` for unsure ckb/ar) → `npm run lint && npm run typecheck && npm test` → `npm run test:layout:geometry` (local Chromium) → check `/`, `/stores`, `/quote`, `/market` in ckb (RTL), ar and en, light and dark.

Screenshot baselines are re-rendered only via the "Cargo quality gate" workflow with `update_baselines` (DEPLOY.md "Layout lock").

### Database change

Use Neon project `rl-cargo-production` only (never `rega-platform`; see `docs/architecture/cargo-database.md`) → inspect schema → write a forward-only `migrations/NNNN_*.sql` → test locally against PGLite (`npm test`) → with owner approval, test on a Neon branch → Neon branch/snapshot of production → `npm run db:migrate`.

### Production bug

Sentry (once a project exists) or Cloudflare Workers logs → GitHub (recent commits, CI) → reproduce locally → root-cause fix → regression test → CI green → verify on the live URL before reporting it fixed.

### Framework or library upgrade

Context7 docs for the target version → compatibility review against `package.json` → isolated change on the session branch → full checks + `npm run cf:dry-run` → CI.

### Marketing asset

Canva or Adobe draft → brand check (logo untouched, `#dd0303` accent, approved fonts, no invented prices/promises, no implied partnerships, no banned products) → owner approval → only then export into `public/` (new file name, bump `sw.js` `VERSION`).

## Validation before every commit

```bash
npm run lint
npm run typecheck
npm test
npm run build            # DATABASE_URL unset → no production migration
npm run cf:dry-run       # Worker bundle check, no deploy
```

Plus: `git diff` contains no secrets and no unrelated changes; protected routes
(AGENTS.md "Routes that must keep working") still resolve.

## Delivery

- Commit on the designated branch with a focused message; push with `git push -u origin <branch>`.
- PRs only when the owner asks. Deploys (`npm run deploy`) only when authorised and after CI is green; verify https://cargo.regaplatform.com afterwards.
