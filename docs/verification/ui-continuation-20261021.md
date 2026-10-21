# UI/UX continuation — 2026-10-21

Continues verified `main@7115ea7`, after the homepage bottom-navigation release (#132), original-silk mobile repair (#127), and official-image baseline reconciliation (#138/#140). The separate read-only matrix PR #141 is reviewed, not duplicated or merged. Open #133 owns the proposed Bring For Me steps; this continuation does not recreate that work.

## Scope and authority

The owner's master UI/UX brief and renewed continuation authorize targeted responsive geometry repairs, preserving existing branding, artwork, typefaces, tokens, data, authentication, business rules and module boundaries. Modern Web Guidance is used only for technical accessibility checks, per AGENTS.md; it does not prescribe visual changes. The supplied homepage screenshot remains the visual reference. No screen recording is available in this session. The existing `ku` locale is Kurmanji and is preserved rather than renamed to `kmr`.

Read: root instructions, repository checkpoint and relevant design/architecture/progress/issues memory, central Google Doc, current GitHub PRs and commits. Cloudflare API discovery returned an internal tool error twice; no active Worker allocation can be claimed from that connector. Public production browser checks are read-only. No merge/deploy is authorized by this task.

## Prioritized findings before implementation

| Route/component | Actual defect and evidence | Root cause | Severity | Proposed correction | Regression risk |
| --- | --- | --- | --- | --- | --- |
| `/contact`, email card, 320px | Fresh production Chromium capture: card x=-3.265625, width=307.265625; document scrollWidth=323 versus clientWidth=320. Its left border is visibly clipped. No overflow on the homepage at 320px. Prior #141 independently observed it in three engines. | The start-aligned flex item is capped at 36rem, not its containing column; the unbroken address contributes its intrinsic width. | P2, narrow-phone usability | Clamp the existing card to its column and let the full address wrap only when needed. Preserve its icon, spacing, borders, text, target and desktop dimensions. | Low, local presentation only; compare wider-width pixels and test all seven locales. |
| Shared desktop language control | Fresh official-image Chromium/axe 4.14 reports `label-content-name-mismatch` on the visible language-code button across public routes. The code is visible, but the accessible name puts it in parentheses, which speech-label matching excludes. | Parenthetical code in the explicit accessible name. | P2, voice-control accessibility | Keep all visible markup/styles and replace parentheses with a spoken separator, so the visible language code is part of the effective accessible name. | Low, accessible attribute only; verify axe and identical screenshots. |
| `/prohibited-items`, category labels in narrow cards | Fresh seven-language matrix and inspected Kurmanji 320px screenshot: document scrollWidth=340; the tobacco category's 136px card has 171px of scrollable content. German also overflows at 320px. | Anonymous flex text keeps a long word's intrinsic minimum width alongside the non-shrinking icon in the existing two-column grid. | P2, multilingual phone readability | Wrap the existing translated label in a shrinkable span with emergency word wrapping; keep the grid, icons, translations and prohibited-product rules. | Low, scoped text geometry; verify every label and all locales/widths without changing business logic. |
| Protected Vazirmatn font | #141 reports Firefox STAT/nameID diagnostics. Existing font still renders; fresh Firefox check pending. | Font metadata, protected asset. | P3, compatibility diagnostic | Record only; preserve font bytes. | Changing the official font would violate scope. |

## Verification checkpoint

Fresh public home/contact captures at the nine requested widths are being retained outside baselines. Official Playwright 1.63.0 image is available locally. Before/after, multilingual, accessibility, production build and existing regression results will be recorded here after they actually run. No Lighthouse, native-hardware or field Core Web Vitals result is claimed at this checkpoint.
