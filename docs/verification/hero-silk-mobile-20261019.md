# Mobile silk rendering incident and repair — 2026-10-19

**Repair released and independently verified on https://www.rlgo.net in public Chromium and WebKit. Native iPhone hardware is unavailable.** This supersedes the earlier “no remaining blocker” assessment in the [initial visible-motion report](hero-silk-20261019.md).

## Owner evidence and immediate mitigation

The owner supplied an iPhone/Safari screenshot with blown highlights, colour mixing and imperceptible motion and requested an urgent repair. Passing software-browser frame/pixel tests did not establish native mobile compositing quality.

GitHub main was `ddcd005f95bea09000fdbc6e336aa01c512a8676`; Cloudflare version `fc270538-66c7-4cb2-9ed0-40cdce8e088d` was at 100%. Comparing runtime source against the known static main `96d9f15` shows only four hero-related files differ: the hero component, integration/style and foreground matte. No unrelated runtime repair or rollback is needed.

At **08:30:03 UTC**, the existing verified main-built static version `20ffc4f4-0cf5-43f2-b623-cc61410bdf10` was restored to 100% using the Workers Deployments API, deployment `ecf64c82-7d11-4bc1-8335-a4d5b4ec03e6`. Independent public phone browsing confirms 200, original `hero-art.webp` and zero silk canvases. No source merge, binding, secret, domain, auth, database, data or migration change. This is an interim quality mitigation, not completion of the animation request. Work resumed after the managed environment restarted; the two edited files and successful build/check output survived.

## Responsible-layer repair

Only `src/components/hero-silk.tsx` changes runtime behaviour:

- Explicit premultiplied output and context make every fully transparent pixel exactly RGBA zero. The old straight-alpha buffer retained bright product RGB at alpha zero, an unsafe input for masked mobile compositing. The owner's exact hardware overexposure is not independently reproduced in software WebKit; do not claim a native-device root-cause reproduction.
- Remove synthetic brightness modulation. Highlights move by sampling the original photograph's flowing folds; its source colours are preserved.
- Raise the bounded decorative high-density buffer to 800k pixels / DPR3 to avoid unnecessary double filtering on phones. Under sustained slow frames it adapts down to 200k instead of permanently switching off after an ordinary slow spell. Product quality still comes from the untouched poster.
- Start at idle once the hero images decode and it is visible, without waiting for unrelated images to complete the global window load.
- Preserve original layout, image bytes, static headphones/podium, 18/26-second local waves, viewport/tab pause, reduced-motion and unavailable-renderer/mask/context-loss poster fallback. No dependency or unrelated UI/business change.

## Focused verification

New tests check zero-alpha colour leakage, actual composited PNG product colour at DPR3, blocked unrelated-image startup and sustained slow-frame continuation, alongside existing visible movement, protected product edges, fixed geometry, pause and accessible fallbacks.

The initial local 80-case run had **71 pass / 7 unsupported-WebGL skips / 2 colour-reference failures**. Both failures were Chromium desktop max deltas 11/13 caused by hiding the canvas, which rerasterized its masked parent at fractional pixel coordinates. The reference now clears the existing GPU layer to transparent while preserving its CSS/compositing geometry; no threshold was weakened. Focused colour confirmation: **9 pass / 1 Firefox WebGL skip**. All nine Chromium/WebKit sizes have **max RGB delta 0** across 63,135–225,114 sampled opaque foreground pixels. Final assertion requires exact equality. Clean final focused confirmation on the committed hero source: **73 passed / 7 unsupported-WebGL skips / 0 failures or flaky retries**. All nine displayed-product comparisons have max RGB delta exactly 0.

Node 22: typecheck, lint (four existing warnings), 507 unit/script/security passes + 4 existing skips, migration-free production build and Worker dry-run passed. Browser emulation and software GPU samples are not native iPhone or field Core Web Vitals certification.

## Release state

The temporary static mitigation above is historical. PR #127 was normally merged after the combined exact-head gate; the released renderer is the repaired one. The earlier #126 renderer must not be reused as a purported quality fix. Current evidence remains in the existing project-memory system.

## Concurrent main reconciliation

Initial exact head `7b54e3e3f3423f44c257631546608391c525a440` passed the full automatic PR gate [39301683648](https://github.com/rebar9988-max/rega-cargo/actions/runs/39301683648): 507 unit/script/security passes + 4 existing skips, and 678 browser/pixel/layout passes + 16 existing skips, zero failures/flakes. Clean local focused confirmation: 73 passed / 7 unsupported-WebGL skips / 0 failures. The initially absent automatic event appeared after a manual dispatch; redundant manual run 39301604762 was cancelled, not called passed.

During that gate, separately authorized #125 merged as `131064d58faa493b1567814a35470cabc7c2d930`. Its own final head `40d2625` had a successful hosted gate. A normal merge of current main into the repair branch resolves documentation-only conflicts by preserving both sets of history. Hero runtime/tests remain identical to the tested `7b54e3e`; owner/auth/routes/migrations/package remain identical to new main. A fresh combined exact-head gate is required. The other release process re-confirmed static version `20ffc4f4` at 100% at 18:33:55 UTC (deployment `bf6a8f7c-1dc0-4de0-8a6e-014e4cc15248`) while waiting for this repair; no owner activation is performed by this task.

## Final combined gate and production verification

Exact integrated head `5633f6c9c836e001cb2a6422c62c99c343e88f5b` passed automatic gate [39303885139](https://github.com/rebar9988-max/rega-cargo/actions/runs/39303885139): typecheck, lint (four existing warnings), **517 unit/script/security passes + 4 existing skips**, migration-free production build and Worker dry-run. Browser/pixel/layout result: **712 clean passes / 2 successful configured retries / 16 existing skips / 0 final failures**. Both retries are unchanged owner.spec.ts privileged-denial cases: the first attempt returned fail-closed `[403,403,500,403]`, followed by the expected all-403 retry. No assertion or retry policy was changed; all silk cases pass without retry. Retain this inherited API-area flake for its owning work, not a claim of flawless CI or a privilege grant.

Normal merge [#127](https://github.com/rebar9988-max/rega-cargo/pull/127) is `8d4d33afb92367f8c402b2ae90f10fdec2bdf91c`, 18:47:36 UTC. Existing main-only Build `d4241c56-e079-4da0-86f2-a8b9be92c7ba` succeeded. Direct allocation verifies version `913d6dd4-38f7-4a7b-91c9-305c99052dea` at 100%, deployment `10627313-c848-4e58-9a34-18fef03ddb03`, **18:48:18 UTC**. Owner/auth/routes/migrations from #125 remain unchanged; no owner activation, email, data mutation, secret/binding/domain change or migration is performed by this hero task.

Actual public suites on that release: **24/24 Chromium cases** (390px phone, 412px Android emulation, 1440px desktop) plus **8/8 WebKit retina phone cases** (393px, DPR3), with zero skips/failures/retries. This includes transparent RGB zero, visible silk changes, fixed foreground/geometry, startup with an unrelated held image, continued motion under slow timestamps, viewport/tab pause, reduced-motion changes and renderer/mask/context-loss fallback.

Actual composited product PNG comparisons are exactly unchanged: RGB delta **0** across 68,355 / 76,055 / 225,114 Chromium samples and **69,450 WebKit retina samples**. Three-second visible silk change fractions are 16.63% / 17.01% / 17.23% in Chromium and **18.81% in WebKit**. All sampled foreground motion deltas are zero. These tests read actual public output; they are not native iPhone certification.

A service-worker-controlled phone client held open with the original static cached app obtains the new entry script on normal reload, returns 200 and renders 90 frames/3sec with zero overflow. No SW/cache-policy change or cache bust was needed. Independent public 390/412/820/1440px samples return 200, draw 48 frames/1.6sec, keep copy geometry fixed, show zero overflow, preserve reduced-motion poster fallback and report no page errors. Sampled CLS: 0 / 0 / 0.001976 / 0.000520. All 13 required public routes finish at 200 after existing redirects. No private account action or business submission was used.

Machine evidence: [local focused cases](hero-silk-mobile-20261019/local-focused.json), [public Chromium](hero-silk-mobile-20261019/production-chromium.json), [public WebKit](hero-silk-mobile-20261019/production-webkit.json), [cached client](hero-silk-mobile-20261019/existing-client.json), [viewport samples](hero-silk-mobile-20261019/production-viewports.json), [routes](hero-silk-mobile-20261019/production-routes.json) and [26-second software WebKit recording metadata](hero-silk-mobile-20261019/software-webkit-video.json). The original 504 × 496 photograph is retained; higher-density compositing avoids extra degradation, not a fabricated higher-resolution source image. Native hardware and field Core Web Vitals remain unclaimed.

No further rollback is indicated by these checks. A documentation-only follow-up records the outcome; its version ID may change while retaining the same verified runtime/source and client assets. Re-query active allocation before future work.
