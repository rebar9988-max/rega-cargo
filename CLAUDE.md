@AGENTS.md

# Claude Code session memory

AGENTS.md (imported above) holds the product and hard rules; it always wins.

Before choosing any MCP connector (Figma, Canva, Adobe, Context7, Neon, Sentry,
GitHub, Google Sheets, …), read:

- `docs/integrations/mcp-connectors.md` — verified inventory, status and evidence, re-verification checks
- `docs/integrations/connector-responsibilities.md` — who does what, usage and security rules
- `docs/architecture/ai-development-workflow.md` — step-by-step workflows and pre-commit validation

Key facts (verified 2026-10-11, re-verify before relying on them):

- Cargo's database is Neon project `rl-cargo-production` (`old-cherry-79292410`). `rega-platform` is REGA's: **never use it for Cargo.** Production and staging are connected through `DATABASE_URL` (since 2026-10-11); Hyperdrive is still to do. See `docs/architecture/cargo-database.md`.
- No Sentry project or SDK for Cargo. No Supabase project.
- Figma seat is View-only. TinyFish is metered with a negative wallet: do not use; local Playwright + Chromium is the browser tool.
- Never activate paid services, expose secrets, or run destructive production operations without the owner.
