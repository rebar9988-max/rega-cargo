# Shared footer refinement — 2026-10-24

Owner supplied a recording and two screenshots and authorized only the oversized R&L
footer's refinement. Identity guard verified repository `rebar9988-max/rega-cargo`,
Worker `rega-cargo` and canonical `https://www.rlgo.net`.

## Cause and implementation

The footer stacked brand/contact details, permanently expanded navigation/legal links,
a full-width language field and a separate theme control, with large full-row gaps.

Use three native details/summary groups, closed initially at every width; a compact
brand/contact grid; and a single wrapping language/theme row. Keep every destination,
translation, route/search parameter, email address, official artwork and existing token.
The same component adapts to three columns from the existing tablet breakpoint. Bottom
navigation safe-area clearance is preserved; the explicit compact stores footer is unchanged.
Only `src/components/site-footer.tsx` and footer selectors in `src/styles/design-system.css`
change the application. Header, hero, R&L AI, pricing, authentication and databases are untouched.
Modern Web Guidance was used only for nonvisual accessibility/keyboard guidance.

## Verification

- Local TypeScript, ESLint (0 errors; 4 existing warnings), build without DATABASE_URL and
  Worker dry-run passed. Supported Node 22: 769 passed, 4 skipped, 0 failed. Node 24 initially
  hit the documented AI ReadableStream test incompatibility; no unrelated source was changed.
- Official Playwright 1.63 image, run 40068780275: Node 22 gate passed; browser tests
  **760 passed, 16 intentional skips, 0 failures**. Includes native Enter/Space disclosures,
  visible expanded links with >=44px targets, seven locales, theme switching and compactness.
- 279 affected page baselines re-rendered in the official image (commit eb839d2). On the
  390px Sorani homepage, image height is 2940px versus 3565px, a 625px reduction. All pixels
  before y=2400 match exactly; the change begins inside the footer. Representative phone
  render inspected visually. The branch-only temporary renderer is removed before release.
- Added a narrow-phone regression at 320/360/430px for compact height and expanded controls
  fitting the viewport; final ordinary strict gate pending at this checkpoint.
- Pre-change Cloudflare allocation directly verified: Version
  13b74c75-3728-4333-92e4-a7aa8723e4f0 at 100%.
- PR #167: implementation and baseline review complete; final strict gate/release pending.

No public preview, migration, new dependency, paid service or infrastructure change.
