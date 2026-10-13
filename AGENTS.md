# R&L (Rega Cargo) project rules

## PERMANENT R&L PRODUCT IDENTITY — HIGHEST PRIORITY

Owner-established permanent rule (2026-10-13):

**R&L = MARKETPLACE + BRING FOR ME + DELIVERY / TRACKING**

**Official Kurdish slogan: بازاڕ و گەیاندن**

- This is the highest-priority product identity rule for Codex, Claude Code and all future project work. It takes precedence over any conflicting or narrower product identity or slogan in existing instructions, project memory, documentation or legacy naming, including the repository name `rega-cargo`.
- All future development, UX/UI, navigation and architecture decisions must respect and support all three services as first-class parts of the same R&L product: MARKETPLACE, BRING FOR ME, and DELIVERY / TRACKING.
- Never redefine R&L as cargo-only, marketplace-only or delivery-only. Never remove, hide or demote a core service in a way that changes this identity.
- Never change the core mission, official identity, official Kurdish slogan or these three core services without explicit owner approval.
- Preserve all other existing project instructions. Earlier product descriptions and slogans remain historical context where they conflict with this permanent rule; they do not authorize a different identity.
- Keep this permanent identity rule identical in the repository-root `AGENTS.md` and `CLAUDE.md`.

Read PROJECT_MEMORY.md (repo root) when continuing work in this workspace; CLAUDE.md describes the memory lifecycle.

## PRODUCT
- R&L = marketplace + shipping/delivery. Customers in Kurdistan & Iraq order from European stores (later Turkish, Chinese, US brands). We buy/receive goods at our warehouse in Cologne, Germany and ship to Erbil, Sulaymaniyah, Duhok, Kirkuk, Baghdad.
- Slogan: "MOVE SMART. DELIVER FAST." (Europe ↔ Kurdistan ↔ Iraq)
- Logo: red and white (globe, swoosh arrow, letters R and L). Never modify it.
- Languages: Sorani Kurdish (default, RTL), Arabic (RTL), English (LTR).
- Prices in EUR and IQD, based on chargeable weight = max(actual, volumetric).

## ROUTES THAT MUST KEEP WORKING
/ · /stores · /stores?cat=... · /stores?fav=1 · /stores/request?store=..&intent=buy|ship · /quote · /market · /ai · /impressum · /privacy · /terms
Restyle, don't rewrite logic. Do not break routes, query params, APIs, data models or pricing formulas.

## HARD RULES
1. No fake data: no invented reviews, ratings, discounts, prices, stock, stats or delivery promises. If data is missing, show nothing or a clearly labeled placeholder.
2. Never imply partnership with brands. Brand/store logos keep a visible note that R&L is not an official partner of these brands.
3. Products against Islamic principles (all tobacco/smoking, vapes, alcohol, haram food & drink) stay permanently banned: blocked in the database, hidden from search, never linked. Never weaken or bypass this filter; add a test that proves banned products never appear in listings or search.
4. All UI text goes through i18n files. If unsure of a Kurdish/Arabic string, add it with // TODO(translate-review) instead of guessing silently.
5. Match the existing stack; add a dependency only if clearly needed and say why.

## DESIGN SYSTEM RULES
- All values as CSS variables: color, spacing (8px grid), radius (12–16px cards), shadows, type scale, motion. Light + full dark mode.
- Palette: deep brand red as accent only (buttons, badges, highlights); white/off-white surfaces; near-black text; soft neutral grays.
- Fonts: Vazirmatn (or Noto Sans Arabic) for Kurdish/Arabic, Inter for Latin/numbers; self-hosted, font-display: swap.
- CSS logical properties only (margin-inline-start, padding-inline, text-align: start…). Directional icons flip in RTL. <html lang> follows the active locale; <html dir> is always rtl (owner decision 2026-10-10: Sorani is primary and the layout never mirrors on language switch); data-textdir carries the language's own text direction (fonts, bidi).
- Motion 150–250ms, respect prefers-reduced-motion.

## Workflow
- Shared memory for Codex and Claude Code: start with the "CODEX — NEXT SESSION HANDOFF" section in PROJECT_MEMORY.md, then CLAUDE.md (memory lifecycle, CI rules, `npm run quality:local`). Use that memory; do not create a separate one. One agent per working tree; use your own branch or worktree.
- Work through Steps 0–6 in order, one focused commit per step.
- For each step run lint, type-check, tests and build, fix regressions, and write a short report with changed files and exact test URLs before continuing.
- If a change would break a route, logic, data or a hard rule, stop and explain.
- Existing locale identity is ckb = Sorani and ku = Kurmanji. Preserve existing language IDs and saved preferences. Never silently relabel Kurmanji as Sorani.
- Catalogue photographs are examples, not evidence of available inventory. Prices, stock and extra product images may only be displayed when backed by data.
