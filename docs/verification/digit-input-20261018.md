# Weight and size input: Arabic-Indic / Persian digits — 2026-10-18

Base `origin/main` @ `dc5bec0` (the concurrent release `release-hardening-20261018.md`: OTP window, tenth-kilogram pricing, fail-closed limits, review notices).
Owner brief (chat): inspect https://www.rlgo.net with a browser, reproduce real problems, fix root causes, test, deploy, verify. A second session worked the same brief and
released first; this change contains **only what that release left open**. My own OTP, rate-limit and review-alert implementations were dropped in favour of the released ones.

## Inspection of production (read-only, Playwright Chromium)

* 78 functional checks (ckb, en x 320 / 390 / 1440 px): header search suggestions, banned search (`vodka`) returning nothing, menu open and Escape, `/stores?cat=fashion`, favourite toggle and `?fav=1`,
  footer language switch keeping `?cat=`, `/account`, `/track` with an unknown id, request-form validation sending nothing. 0 failures, 0 console or page errors. Nothing was submitted and no staff were notified.
* `/quote` weight field, typed values: `3.2`, `3,2` and `0.1` are accepted on production now (the decimal comma shipped in `dc5bec0`); **`٣٫٢`, `٣.٢` and `۳٫۲` (Arabic-Indic / Persian digits) are rejected** with "0.1-70 kg" in en and ckb.
  `1e1` is accepted by the quote server (`Number("1e1")`).
* `RL_LIMIT` is enforced in production (about 20 non-mutating quote-signing calls per minute, then refused); anonymous booking returns 401.

## Defect and fix

Root cause: the display layer is Western-digit-only by owner decision, but typed input was read with `Number(...)` / a comma replace, so the digits Sorani and Arabic keyboards produce were never understood.
Fix: one shared `parseDecimal` / `westernDigits` in `numbers.ts` (Western, Arabic-Indic U+0660-0669 and Persian U+06F0-06F9 digits; `.`, `,` and U+066B as the decimal mark; no signs, exponents, several marks or stray text; `groupedThousands` option for the declared-value field).
Used by the calculator (weight, size, pieces, declared value), the URL and server quote parsers, and the request validator and server-side quantity. **No pricing formula, rounding or limit changed.** Sources keep escapes, not literal Eastern digits (the repo test forbids them).

Regression tests (fail on `dc5bec0`, pass now): `numbers.test.ts`, `quote-token.test.ts`, `requests.e2e.test.ts`, Playwright `premium.spec.ts` (ckb, ar, en: five spellings of 3.2 give identical results; `abc`, `1e1`, `0`, `70.1`, `3 kg` are refused; `0,1` accepted).

## Verification

tsc 0 errors; ESLint 0 errors (4 existing warnings); `npm test` 236 + 271 passed, 0 failed (4 existing `skip`s); `npm run build` and `cf:dry-run`;
Chromium layout suite on the built Worker: 395 passed, 12 skipped by design, 0 failed. Not run: Firefox, WebKit, official-image layout lock, hosted CI (billing block).

## Left as is

* The compact calculator displays a typed `0.15` as `0.1 kg` while billing rounds to `0.2` (display of a half-tenth only; the approved nearest-tenth rule is unchanged).
* The R&L AI estimate card keeps its own number parsing (owner-only baseline).
