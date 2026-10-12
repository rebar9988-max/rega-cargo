# Decisions log

Append new decisions at the top. Format: date — decision — who/where (source). Never delete; mark superseded ones.

| Date | Decision | Source |
|---|---|---|
| 2026-10-12 | `/stores/request` simplified for low-literacy customers: four numbered steps (link + paste, − 1 + stepper, city buttons, phone), optional details folded; declaration is one line by the send button (pressing send confirms; server still requires `declared: true`); link-check panel and empty cost rows removed from this page; local Iraqi numbers and Kurdish/Arabic digits accepted | owner request, PR #79 |
| 2026-10-12 | PR #78 released while Actions is blocked (I-7): owner merged it, then instructed the deploy in chat; staging first, production `2e724d37`. Basis: local gate on the identical tree incl. official-image layout lock (387/12/0); `main` has no branch protection or required checks, so nothing was bypassed | owner messages in chat, PR #78 |
| 2026-10-12 | Phones/tablets: brand-red header bar (the logo's own red square merges into it) with the category strip directly under it, per the owner's reference screenshot. This is a deliberate exception to "red as accent only" for that one bar; content surfaces stay white. Layout stays rtl (menu + logo at the start/right), so the screenshot's left-to-right order appears mirrored | owner task in chat with screenshot, branch `claude/header-category-strip` |
| 2026-10-12 | Owner explicitly approved merging and deploying PR #72 without another pause. Bazaar and shipping have separate page components/designs; calculators and tracking belong to `/quote`. Validate against the latest `main` and preserve the Nitro update from #75 | owner message in chat, [verification](../redesign/shipping-separation.md) |
| 2026-10-12 | CI minutes: docs-only changes skip the Playwright layout job (verify still runs), draft PRs skip CI until ready, superseded PR runs cancel; `main` and manual runs are never cancelled. No gate step removed. Merged on the **local verify gate** (actionlint, typecheck, lint 0 errors, `npm test` 417/0, build, cf dry-run 4804.70 KiB = production) because hosted runs 190–191 were refused by the billing block; layout lock not run (workflow/docs-only, no Worker change, no deploy) | owner instruction "autonomous recovery", PR #77 |
| 2026-10-12 | PR #57 (CLS fix I-8, announcement landmark) merged and deployed while Actions is blocked (I-7), on a **reduced local gate**, because the official Playwright image cannot run in the agent environment (Docker CLI present, daemon unreachable). Run on the merged head: typecheck, lint (0 errors), `npm test` (417), build, cf dry-run, Playwright geometry 262 passed / 9 skipped on the 360px suite and all six Chromium device projects. **Not run:** screenshot comparison, WebKit, official image. The change is visually neutral after load. The #60 decision (full official-image gate) was not met; this is the owner's fresh chat instruction "go fix it, don't stop", with the gap stated here. `main` has no required checks | owner instruction in chat, PR #57 |
| 2026-10-12 | While GitHub Actions cannot start jobs (I-7, billing), PR #60 may merge and deploy on the full quality gate run locally in the official Playwright image (typecheck, lint, `npm test`, build, cf dry-run, layout lock). Repo stays private; no paid change. `main` has no required checks, so nothing is bypassed | owner authorization in chat, PR #60 |
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
