# Decisions log

Append new decisions at the top. Format: date — decision — who/where (source). Never delete; mark superseded ones.

| Date | Decision | Source |
|---|---|---|
| 2026-10-12 | Owner renewed autonomous authorization; continue independent P0 repairs without routine confirmation. Preserve €0/data/CI gates and do not infer that chat authorization grants external API scopes or credentials | owner continuation; [native gate regressions and release recheck](../ai/audit-2026-10-11.md) |
| 2026-10-12 | Rate-binding outages fail closed with classified unavailable responses, not permitted inference. Preserve valid/denied decisions and challenge contracts; mark challenge responses no-store | failing-before-fix environment/workerd tests; draft #68 |
| 2026-10-12 | Explicit TinyFish request does not waive the owner's zero-new-cost rule. Use its verified zero-rate Search/Fetch; do not start paid browser automation, top up or assume a named profile is authenticated | [wallet/profile checks and official recovery requirements](../ai/access-recovery-2026-10-12.md) |
| 2026-10-11 | Owner authorized autonomous incremental upgrades without routine questions; preserve working AI/UI/data and enforce zero-new-cost, authorization and release gates. Existing task authorization can satisfy routine approval; it does not waive the gates | owner master directive and continuation instruction; draft #68 |
| 2026-10-11 | Use a dedicated unchanged-main review base for draft #68 while private Actions billing guard is inaccessible; no workflow/protection change, no merge/deploy. Retarget only after cost/current-main quality gates | [AI audit](../ai/audit-2026-10-11.md) |
| 2026-10-11 | Preserve all provider attempts in the existing global cap, ignore stale UTC state mutations, sanitize localized formatted prices, reuse atomic layout publication and the locked Wrangler test runtime | draft #68; failing-before-fix regressions |
| 2026-10-11 | Session permissions differ: connector Hyperdrive reads work here, CLI auth does not. Keep both database projects; exact empty accessible-table counts do not prove external identity/data-loss safety | dated read-only evidence in draft #68; supersedes broad earlier assumptions |
| 2026-10-11 | Correct production database is `old-cherry-79292410` / `cargo`; `misty-recipe-03041407` is an incomplete duplicate. Fix by repointing, never by migrating `misty` | verified evidence, issues I-1 |
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
