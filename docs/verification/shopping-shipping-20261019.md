# Shopping and shipping continuation — 2026-10-19

The owner's original cleanup request is fulfilled by the merged dedicated-route
implementation in [PR #72](https://github.com/rebar9988-max/rega-cargo/pull/72)
and the subsequent homepage refinements. The older alternative tab implementation
in [PR #74](https://github.com/rebar9988-max/rega-cargo/pull/74) was closed as
superseded; its branch and evidence remain available. It was never deployed.

## Verified current result

Verified against https://www.rlgo.net, the current canonical public domain:

- `/` and `/stores` contain no parcel measurement fields or shipping rate cards.
- `/quote?kg=3.2&l=40&w=30&h=20` contains the dedicated shipping page, five decimal
  inputs and exactly three shipping options. The first option shows EUR 37.44
  and IQD 56,909, matching the existing quote calculation.
- Eighteen read-only Chromium page checks passed: these three routes at
  360/390/820/1440 px in Sorani, plus 390 px in Arabic and English.
- Every checked page returned 200, had no horizontal overflow and emitted no
  JavaScript page errors. Full-page 390 px Sorani home/quote screenshots were
  visually inspected; the shopping grid and shipping form are separate.

[Machine evidence](shopping-shipping-20261019.json) records every checked case.
These public checks used system Chromium and are not an official-image pixel
baseline comparison or native-device test. No booking, saved quote, login,
inference, request submission or customer-data mutation was performed.

## Preserve the current production mitigation

GitHub `main` was `ddcd005f95bea09000fdbc6e336aa01c512a8676`. Cloudflare directly
confirmed deployment `ecf64c82-7d11-4bc1-8335-a4d5b4ec03e6`, version
`20ffc4f4-0cf5-43f2-b623-cc61410bdf10` at 100%, created 2026-10-19 08:30:03 UTC.
The central project Doc records the owner-reported mobile silk compositing
incident and the separate repair in progress. The live hero intentionally uses
the original static artwork; this supersedes earlier animation-release status.
Do not redeploy the unchanged animation renderer from current main as part of
this cleanup. Preserve the separate repair and require its own verified release.

This continuation changes documentation only. No runtime code, baseline,
dependency, production deployment, domain, binding, secret or database was
changed. The retired cargo.regaplatform.com browser attempt failed before
content loaded; the successful checks above use the actual canonical domain.
The complete application quality gate was not rerun for this documentation-only
follow-up; the repository memory checks were run instead.

Next safe continuation: the original shopping/shipping cleanup is complete.
Preserve the current routes/design and the separately tracked hero mitigation;
query the live allocation again before any future release.
