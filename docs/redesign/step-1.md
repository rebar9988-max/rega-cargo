# Step 1 — Design system

Added semantic light/dark tokens, an 8px spacing scale, 12/16px card radii, motion/reduced-motion rules, self-hosted Inter (OFL license included), and the existing Noto Sans Arabic/Vazirmatn fonts. Added Button variants, Input, Select, Badge, Card, Chip, Skeleton, native accessible Modal/BottomSheet, RTL-aware Icon and EUR/IQD Price. Shared legacy form/button styles now use the new foundation. HTML dir follows the active locale. No dependency was added; no logo, API, data model or pricing formula changed.

Files: src/styles.css; src/styles/{tokens,design-system}.css; public/fonts/{inter-variable.woff2,Inter-OFL.txt}; src/components/{ui,field}.tsx; src/lib/{theme,redesign-copy,i18n}.tsx/ts; src/routes/{__root,[_]design}.tsx; generated route tree; server/routes/robots.txt.ts. New Sorani/Arabic marketing and accessibility strings are flagged TODO(translate-review).

Test: http://localhost:8080/_design. Choose Sorani (ckb), Arabic or English; switch appearance; open the dialog and bottom sheet; press Escape and verify focus returns to the trigger. Price 0 is explicitly a component example, not an offer. The page has noindex, robots disallow and no sitemap entry. Existing ku remains Kurmanji.

Validation: lint, typecheck, Node 22 tests (382 passed, 4 skipped), build all passed. Browser checks at 360px in ckb/ar/en × light/dark passed: HTTP 200, correct lang/dir, expected font, no horizontal overflow, no page errors, Escape closes the modal and restores focus. Logs: /workspace/rega-redesign/step-1-checks.log and step-1-browser.log; screenshots: /workspace/rega-redesign/step-1. A first capture revealed font cascade priority; it was corrected and all checks rerun before commit.
