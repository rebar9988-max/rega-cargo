# Decisions log

Append new decisions at the top. Format: date — decision — who/where (source). Never delete; mark superseded ones.

| Date | Decision | Source |
|---|---|---|
| 2026-10-11 | Project-wide memory system: `CLAUDE.md` entry → `PROJECT_MEMORY.md` → `docs/project-memory/`. Memory links to DEPLOY.md / docs/integrations / docs/redesign instead of duplicating them | this memory PR |
| 2026-10-11 | Chat replies to the owner are always in Sorani (ckb); code, commits, identifiers stay in their original language | owner, PR #56 (`CLAUDE.md`) |
| 2026-10-11 | Production database is Neon via Cloudflare Hyperdrive binding `HYPERDRIVE` (fallback `DATABASE_URL`). Connection string read only inside a request (workerd forbids global-scope I/O) | PR #54, PR #58 |
| 2026-10-11 | Product-link check enabled in production behind `PRODUCT_LINK_ENABLED` | PR #53 |
| 2026-10-11 | Integration usage policy: read-only by default; deploys, secrets, Neon writes, merges and paid tools need explicit owner approval | `docs/integrations/usage-policy.md` (PR #59) |
| 2026-10-10 | `<html dir>` is always `rtl`; layout never mirrors on language switch (Sorani primary) | owner, AGENTS.md |
| 2026-10-10 | Locale identity fixed: `ckb` = Sorani, `ku` = Kurmanji. Never relabel | AGENTS.md |
| 2026-10-10 | Ten-group catalogue; `food`, `beauty/health`, `pets/food` held until owner approves (halal/health) | DEPLOY.md "Catalogue" |
| 2026-10-09 | Noto Sans Arabic is the Arabic-script brand font (replaces Vazirmatn, kept as fallback) | owner, DEPLOY.md |
| 2026-10-09 | Custom domain `cargo.regaplatform.com`; old workers.dev host only 301-redirects and unregisters the SW | owner, DEPLOY.md step 7 |
| 2026-10-08 | R&L AI on in production with a hard daily cap of 200 identifications | owner, `wrangler.jsonc` |
| 2026-10-08 | `IQD_PER_EUR` = 1520 (override via env) | `src/lib/corridor.ts` |
| ≤2026-10-08 | Islamic compliance filter is permanent with no off switch; DB rows locked by triggers | PR #42, DEPLOY.md "Compliance" |
| ≤2026-10-08 | Western digits everywhere | PR #40 |
| ≤2026-10-08 | Cargo is fully separate from REGA (own Worker, own DB, never `rega-platform`) | DEPLOY.md |
| standing | No new dependency without a clear need; no paid services without owner authorization | AGENTS.md, owner |
