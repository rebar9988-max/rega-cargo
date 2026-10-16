# Touch-target, accessibility and visual verification — PR #109 — 2026-10-16

Scope: continuation of the 2026-10-14 refinement ([report](ui-refinement-20261014.md), PR #102,
already on `main`). Presentation only. No copy, route, API, data, pricing, auth, compliance filter,
R&L AI, dependency, CI or deployment-config change. Base: `origin/main` @ `0b41e74`.

## What PR #109 changes in the application

One class change in `src/routes/stores.request.tsx`: the Bring For Me "keep a draft" checkbox label
(26 px tall, the only genuine remaining phone touch-target defect outside R&L AI) becomes a
50 px hit area with `-my-3 … py-3`, so its layout footprint is unchanged.
Everything else previously in this PR duplicated #102 and was dropped after merging `main`.
Measured against production (`https://www.rlgo.net`): page height identical on both request pages in
ckb/ar/en at 360/390/1440 (18 of 18 combinations), same label text and checkbox position.
`#97` (open draft) does not touch these lines (nearest hunk is 40+ lines away).

## Verification environment (no Docker)

* Real built Worker, no database, exactly as `playwright.config.ts` runs it:
  `npm run build` (empty `DATABASE_URL`), then `wrangler dev --config .output/server/wrangler.layout.json --port 8788 --local --host localhost`.
  `--host localhost` matters: without it wrangler infers the production www host and every request
  hits the HTTPS canonical redirect (301 to itself).
* Playwright 1.63 expects a Chromium build this machine lacks, so the suite was run through a
  temporary config (not committed) that sets `launchOptions.executablePath` to the installed Chromium.
* Do not run the layout suite against `npm run dev` (Vite dev server): see the classification below.

## Playwright failures: infrastructure vs defects

| Run | Result | Cause |
|---|---|---|
| Vite dev server, `premium-360` | 17 pass / 4 fail | infrastructure: dev-mode hydration timing; same 4 fail on unmodified `main` |
| Vite dev server, iPhone + iPad portrait | 120 pass / 8 fail | infrastructure: same 8 fail on unmodified `main` |
| **Built Worker, all Chromium projects, geometry** (`--ignore-snapshots`) | **394 pass / 12 skipped / 0 fail** | the supported path; run on this PR head |
| Built Worker, Chromium iPhone + laptop-1440, **with** pixel baselines | 44 pass / 80 fail / 4 skipped | 66 of 80 are page-height mismatches vs committed baselines: baselines are stale for current `main` (documented since PR #100/#102) and are not authoritative off the official image |

So no product defect was behind any Playwright failure; WebKit projects were not run (no WebKit build here).

## Safe alternative to Docker for visual checks

Committed screenshots can only be re-rendered in the official image, and local Chromium does not
match it (see the 80 failures above), so local runs must never update baselines.
Instead `docs/verification/ui-touch-targets-20261016/ab-diff.mjs` renders the same routes from two
origins with the same Chromium and compares full pages pixel by pixel (renderer drift cancels).
Production vs a Worker built from this branch, 9 routes × ckb/ar/en × 360/1440 × light/dark:
results in the table below. Nothing was approved or regenerated.

## Results (Chromium, built Worker, this PR head)

| Check | Method | Result |
|---|---|---|
| Horizontal overflow | `scrollWidth <= innerWidth`, 15 routes × 5 widths (360/390/768/1024/1440) × ckb/ar/en × light/dark = 450 states | 0 of 450 |
| `<html lang dir>` | same 450 states | `dir="rtl"` always (owner decision), `lang` = active locale |
| Touch targets < 44 px on phones | same audit, tap-size of every link/button/input | 150 detections on `main` after #102, all native checkbox/file inputs or the header search input (below); the Bring For Me draft label was the only fixable one and is now 50 px |
| Contrast (axe `color-contrast` + 10 other rules) | 10 routes × 3 widths × ckb/ar/en × light/dark = 180 states | 0 violations |
| Contrast on gradients (axe cannot resolve) | text hidden, real pixels sampled under every text rect | see "Reported" |
| Keyboard focus | Tab through up to 70 stops, 54 page states (2,727 stops) | every stop has a visible indicator (category strip rings its icon by design) |
| CLS | `PerformanceObserver` on 108 loads | max 0.0023 (limit 0.1) |
| Unit/type/lint | `npm run typecheck`, `npm run lint`, `npm test` | pass, 0 lint errors (5 existing warnings), 236 + 255 tests, 0 fail |
| Build | `DATABASE_URL='' npm run build`, `npm run cf:dry-run` | pass |
| Production vs branch pixels | `ab-diff.mjs`: live `https://www.rlgo.net` vs Worker built from this head, 9 routes × ckb/ar/en × 360/1440 × light/dark = 108 | 0 height differences; 79 pixel-identical; 29 differ by at most 0.051 % of pixels (24 are the two request pages: the draft label's vertical centring; 5 are sub-0.01 % renderer noise on `/impressum`, `/terms`, `/track`). Suite tolerance is 0.2 % |
| Live production (read-only) | 13 routes × ckb/ar/en × 390/1440 = 78 loads on `www.rlgo.net` | all HTTP 200; no horizontal overflow; `lang` = locale, `dir="rtl"`; ≥1 h1; no page errors. `rlgo.net` and `http://www` 301 to canonical |

Remaining touch-target detections are not defects to fix here: native 24 px checkboxes whose
`<label>` is the hit area (quote 358×148, declarations 308×137, draft 308×50); hidden file inputs
(1×1, their labels are 44+); the R&L AI consent checkbox (owner-only baseline, not touched).

## Reported, not changed

* **Header search at 360 px:** the five-control reference header leaves the search pill 86 px wide
  (116 px at 390) so its placeholder truncates. It opens a full-width sheet on focus. Giving it room
  needs a different header arrangement, which is a redesign of the approved reference.
* **Contrast, dark mode 360 px:** hero eyebrow text (`--rl-accent` over the hero artwork) measures
  4.1–4.17:1 (needs 4.5:1). Brand token, so reported only. Light-mode hero CTA is 4.52:1 at 16 px/800
  (passes narrowly); the R&L AI capsule text is 5.34:1.
* **R&L AI consent checkbox:** 24×24 with no label wrapper; AI baseline is owner-only.
* **Store-card category text:** three-line clamp by design.

## Not run / blocked

* Official-image layout lock, pixel baselines and WebKit: no Docker daemon (`dockerd` not startable
  here) and hosted Actions is blocked by billing (I-7). `main` baselines are stale; they need the
  "Cargo quality gate" `update_baselines` run once Actions works. This PR does not change any
  rendered pixel except the draft-label hit area (invisible).
* Native iPhone/Android, real OTP and database-backed pages (no database in the Worker).

## Release status

**PARTIAL, not released.** Everything that can be verified here passed, but `docs/operations/cicd.md`
§3 requires the hosted layout lock or the official Playwright image for a source change, and neither
exists in this environment. PR #109 therefore stays a draft: merging it on `main` deploys through
Cloudflare Workers Builds. Required to finish: (1) re-render baselines via the
"Cargo quality gate" `update_baselines` run (or the official image) and review the diffs;
(2) owner decision to merge on the local gate recorded here, as in decisions of 2026-10-12;
(3) after the build, confirm the Worker version and repeat the live checks above plus the Bring For
Me label (`label` ≥ 44 px, page height unchanged).
