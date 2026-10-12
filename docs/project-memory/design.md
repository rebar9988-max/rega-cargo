# Design and brand

Authoritative rules: [AGENTS.md](../../AGENTS.md) "DESIGN SYSTEM RULES". Implementation detail:
[DEPLOY.md](../../DEPLOY.md) "Brand logo", "Brand typography", "Layout lock". Redesign history: [docs/redesign/](../redesign/README.md).

## Never change
- **Logo**: owner-supplied red/white R&L artwork, source `public/rl-logo.png`; derived `rl-mark-168.webp`, favicons, icons, `og.jpg`. Only cropped/resized, never redrawn, mirrored or paired with a wordmark. New art ships under a new filename and a bumped `sw.js` `VERSION`.
- Red is an **accent only**: `--rl-brand #dd0303` (buttons), `--rl-accent #b80000` (text/links/focus). White/off-white surfaces, near-black text.
- Slogan: "MOVE SMART. DELIVER FAST."

## System
- Tokens: `src/styles/tokens.css` (semantic colour light/dark, spacing 8px grid, radius, motion), type scale in `src/styles.css`, components in `src/styles/design-system.css`, primitives in `src/components/ui.tsx`. Browse at `/_design`.
- Buttons: one `.rl-button` primitive with `data-variant` primary|secondary|ghost|danger.
- Fonts (self-hosted, `font-display: swap`): Noto Sans Arabic for ckb/ar/fa (Vazirmatn fallback), Inter subsets for Latin and numbers. Western digits everywhere.
- Direction: `<html dir="rtl">` always; `lang` follows locale; `data-textdir` carries the language's text direction. CSS logical properties only; directional icons flip.
- Motion 150–250 ms, respects `prefers-reduced-motion`. Full dark mode; theme applied before first paint (`src/lib/appearance-script.ts`, CSP hash tested).

## Layout lock

Home follow-up (2026-10-12, review branch `claude/clean-shopping-shipping-20261012`, not deployed):
shopping and shipping have separate remembered tab panels and service-specific hero content.
Mobile quote options use compact rows; the three dimensions share one row. Home headings and
section gaps are scoped to the home rather than changing other pages. Evidence and validation:
[home-service-separation.md](../redesign/home-service-separation.md).

Breakpoints phone <768 · tablet 768–1023 · laptop ≥1024; content max 1200px; gutters 16/24/32.
Guards: `src/lib/layout-lock.test.ts` (in `npm test`) and `tests/layout/` Playwright (Chromium + WebKit) with screenshot baselines in `tests/layout/__screenshots__/`.
**A baseline change is a design change.** Re-render only in the official image (CI workflow `update_baselines`, or `npm run test:layout:update`), never from a local browser.

## Content rules that affect design
- No fake data (prices, ratings, stock, reviews, delivery promises). Catalogue photos are labelled examples.
- Store/brand logos keep a visible "not an official partner" note.
