# Store discovery refinement — 2026-10-23

Owner explicitly authorized substantial refinement of the existing R&L experience after the
45-second recording of `/stores`. No rebuild; official R&L logo and main colours preserved.
The REGA attachment was explicitly corrected by the owner to the R&L logo; REGA assets are not used.

## Verified findings before implementation

Recording sampled at 0/5/10/15/20/25/30/35/40 seconds and inspected as a contact sheet;
live desktop `/stores` also inspected in the browser. Categories repeated in the header and
long directory; seven illustrative products before the actual stores; 29 country storefronts
repeating ten brands; three competing actions and an external-store disclosure per card;
filters remote from the stores; oversized hero and footer. These match the current source.
The existing request form, official-site handoff, favourites, country data and compliance rules
already work and are retained.

## Changes

- One compact hero with real store-name search and validated product-link handoff to the
  existing request form; three explanatory steps, no invented catalogue or promises.
- One in-content category row, alongside country and audience filters; retailer logos remain
  available in a disclosure. Removed duplicate category directory and illustrative goods
  from `/stores` only. Their data and direct request URLs remain intact.
- Group filtered storefronts by brand. Every regional storefront remains reachable through
  the existing country filter or the card's native-dialog country selector. Filter first,
  group second: country, exact-store and regional favourites retain their meanings.
- Each card has one Explore action. The existing BottomSheet presents official site, buy
  request and self-purchased shipping request for the selected regional store. Official links
  still open with noopener/noreferrer and the return handoff remains.
- Compact `/stores` footer; existing mobile menu gains legal/prohibited/PDF resources.
  Mobile `/stores` header uses favourites instead of a duplicate Account link. No fake
  domain email created; actual contact details remain on the contact page.
- Existing CSS tokens only, shared responsive components and dark theme. No palette, font,
  logo, home hero, R&L AI, database, payment, pricing or server request API changes.

## Validation checkpoint

Local: typecheck passes; lint has zero errors and four existing refresh warnings; build
passes without a production database. Directory tests 8/8. Full suite on the container's
Node 24: 510 pass / 1 fail, an asynchronous closed-stream rejection in the existing AI
upload test. That unchanged AI file passes 18/18 on the project's supported Node 22.
A full local rerun on Node 22 passes **762 tests, 4 skipped, 0 failures** (250 script tests
plus 512 unit tests), with NODE_NO_WARNINGS=1 to keep an existing CLI JSON-stderr test free
of Node experimental warnings. The official-image workflow runs the full Node 22 gate, geometry/functional tests and
re-render affected store/menu baselines. Local browser installation failed (truncated CDN
archive); this is an environment limitation, not a passed browser check.

The entries below are historical checkpoints. The final closeout at the end supersedes their pending status.

## Browser refinement checkpoint (2026-10-23)

Official-image run 39922425475 on 9c49e26: affected page/menu renders passed (69 passed,
12 intentional device skips); full functional/geometry run: 732 passed, 16 skipped, 4 failed.
The failed cases were two Chromium interactions with the nested RTL retailer scroller in
native details, and the new menu test in Chromium/Firefox matching `/privacy` exactly while
localized links carry a query string. No failing gate was merged or deployed.

Follow-up d50e9f9 wraps expanded retailer choices instead of nesting an RTL scroller inside
details, retains equal logo tiles, uses a query-safe privacy selector, waits for hydration
before enabling the new search form, and retains a validated product link through the
buy/ship intent switch and refresh. Targeted browser proof is running before the final
standard strict gate. Initial unmasked review images (390 ckb, 1440 en) were inspected;
temporary review PNGs and workflow will be removed before merge. Native physical phones,
Lighthouse 100/100 and Cloudflare traffic allocation have not been verified.

## Focused gate and final review

Run **39958006766** on d50e9f9: supported Node 22 typecheck/lint/unit tests/build all passed;
**69 affected page/menu renders passed, 12 intentional device skips**; **20 focused browser
tests passed** in Chromium and Firefox. These cover all seven languages, 320–1440 px,
regional selection, official-site handoff, favourites, forbidden searches, safe product-link
prefill through intent switching/refresh, equal logos/cards and native-dialog keyboard use.
Unmasked 390 px ckb and 1440 px en review images inspected. Temporary screenshot capture,
review PNGs and render workflow removed before marking ready. Final strict gate pending.

## Final strict gate navigation finding

Run 39958967756: verify/scope and all screenshot baselines passed; layout finished
735 passed, 16 skipped, 1 failed. Firefox aborted the next document navigation in the
four-store handoff loop while the previous request page was still hydrating (the trace
shows disabled request controls). No product assertion or screenshot mismatch failed.
Each regional handoff now runs in its own fresh page and explicitly waits for the request
store identity and enabled product-link input. No retries increased or checks removed.
Full strict gate reruns before merge; release remains pending.

## Release and production closeout — 2026-10-24

PR #164 merged as `34d546340463c0b2d93d28605436db1c3c260627` after the final
strict gate **39961137799**: verify/scope success; **742 browser/layout passes,
16 intentional device skips, zero failures**. No safeguard bypassed. Supported Node 22
local suite: 762 passes, 4 skips; typecheck/lint/build/Worker dry-run pass.

The release automatically deployed on 2026-10-23 at 13:44 UTC as Version
`5b6b976c-30d4-4334-ad2e-7591ca633e1f`. Later PR #165 fixes failed page-module
recovery and the marketplace admin link; docs-only #166 is current main `193dc8e`.
Its Workers Builds check `9e058054-7318-4f77-a2f3-1d69949fb5ac` succeeded.

On 2026-10-24, direct read-only Cloudflare Deployments API verification confirms
Worker `rega-cargo`, deployment `d130320b-79e9-4904-bea4-1ab4e203335e`, Version
`13b74c75-3728-4333-92e4-a7aa8723e4f0`, **100% traffic**. Created 2026-10-23
18:20:14 UTC, no preview. This supersedes older session-specific allocation limits.
No new deployment, settings, secret, database or domain change was needed for this check.

Real-browser production review: canonical www.rlgo.net; Sorani directory has ten brand
cards, zero sample-product cards and no horizontal document overflow. At 1363×936,
page height is 1874 px versus the earlier 7682 px baseline. Zalando's Italy selector
updates all three actions to zalando.it / store=zalando-it; the buy action reaches the
existing request form and its product-link input is enabled. English search placeholder
is visible and functional in the live browser. Official R&L logo/palette unchanged.

Production browser automation: 35/35 passed (26 Chromium/Firefox journeys + 9 WebKit iPhone/iPad and Chromium desktop cases; run 40106077322) (run 40106077322).

Limitations: no physical-device check or Lighthouse score measured in this closeout.
New non-English copy remains marked for native-language review. The read-only test
branch `codex/stores-live-proof-20261024` is never merged or deployed and has no public
preview. PR #167 is separate footer work and was not changed by this task.

Production WebKit phone proof: [Sorani directory](assets/store-discovery-20261024-phone.png).
