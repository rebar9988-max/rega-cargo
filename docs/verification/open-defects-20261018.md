# Open defects: OTP resend, shipping weight input, rate limits, review alerts — 2026-10-18

Base `origin/main` @ `07fb64e`. Owner instruction (chat, 2026-10-18): find, fix, test, deploy and verify the four items left open by
`code-defects-20261017.md`. Method: Playwright (Chromium) against production for read-only inspection, a real built Worker and PGLite for state-changing checks.

## Inspection of https://www.rlgo.net (read-only)

78 functional checks (ckb, en x 320 / 390 / 1440 px): header search suggestions, banned search (`vodka`) showing nothing, menu open + Escape,
`/stores?cat=fashion`, favourite toggle + `?fav=1`, footer language switch keeping `?cat=`, `/account`, `/track` (unknown id), request-form
validation sending nothing: **0 failures, 0 console or page errors.** No request was sent that stores data or notifies staff.
At 320 px the header search input itself is about 0 px wide (the pill is the tap target and works by touch; Playwright cannot click the input).

## Confirmed defects and fixes

| # | Defect | Reproduction | Root cause | Fix | Regression test |
|---|---|---|---|---|---|
| 1 | **Weight/size input rejected the decimal comma and Arabic-Indic / Persian digits**, the keyboards of the primary audience. Typing `3,2`, `٣٫٢` or `۳٫۲` showed "0.1-70 kg" (also `1e1` was accepted) | production `/quote` in en and ckb | `Number(text)` on the form value and in the request validator; display is Western-digit only, input was never normalised | one shared `parseDecimal` / `westernDigits` in `numbers.ts` (Western, Arabic-Indic and Persian digits; `.`, `,` and U+066B as the decimal mark; no signs, exponents or stray text). Used by the quote form, the URL/server quote parsers and the request validator. **Pricing formulas unchanged** (nearest 0.1 kg, as approved) | `numbers.test.ts`, `quote-token.test.ts`, `requests.e2e.test.ts`, Playwright `premium.spec.ts` (ckb, ar, en) |
| 2 | **OTP resend**: after 5 wrong guesses a resend was accepted, sent a code that could never be used (attempts are kept) and extended the lock | PGLite | `phoneStart` only checked the 60 s cooldown; the upsert refreshed `expires_at` for a locked code | a locked code refuses the resend with the existing `rate` error, sends nothing and keeps its expiry; attempts are still never reset by a resend (no brute force through resends); a fresh code works once the lock expires | `phone/session.server.test.ts` (3 cases) |
| 3 | **Rate limiter failed open when the `RL_LIMIT` binding is missing** | unit test | `allow()` returned `true` without the binding | in a production runtime a missing binding refuses and logs; local dev and tests stay open; a binding that errors was already closed | `rate-limit.test.ts`; on the built Worker: with the binding 19 requests served then refused, with the binding removed all 30 refused and `RL_LIMIT binding is missing` logged |
| 4 | **Review-level requests reached nobody**: a request matching a review rule was accepted with no flag or staff alert | PGLite | `submitRequest` only acted on `block` | the first status line carries `compliance review: <categories>` and every approved admin gets one notification, written in the same SQL statement as the request (no duplicate on a retry); banned wording is still refused | `requests.e2e.test.ts` |

## Production bindings and secrets (verified without reading values)

* `RL_LIMIT` is bound and enforced in production: the non-mutating quote-signing call is refused after about 20 calls in a minute from one IP; anonymous booking returns 401. This was verified before making a missing binding fail closed.
* `QUOTE_SECRET` is present (production signs quotes). The other secrets and the active Worker version could not be listed: the agent's only Cloudflare credential is DNS-scoped.

## Not changed

* Chargeable weight still rounds to the nearest 0.1 kg (approved, test-locked formula). The compact calculator shows a typed `0.15` as `0.1 kg` while billing `0.2`; display only, left for an owner decision.
* The R&L AI estimate card (`ai-page.tsx`) keeps its own number parsing (owner-only baseline).
* Open drafts #87 (security port) and #98 (email OTP) edit `phone/session.server.ts`, `orders/handlers.server.ts` and `rate-limit.server.ts`; they will need a rebase onto these changes.

## Verification

typecheck 0 errors; ESLint 0 errors (4 existing warnings); `npm test` 236 passed + 269 passed, 0 failed (4 `skip`ped by the repo's own builder-doc markers); production build and `cf:dry-run`;
Chromium layout suite on the built Worker: 395 passed, 12 skipped by design, 0 failed. One earlier full run had a single R&L AI chat timing failure
(`verified workflow shortcuts`, iPhone SE) under 4 parallel workers; it passed 3/3 in isolation and in a clean 3-worker full run. Firefox, WebKit, the official-image layout lock and hosted CI were not run (see `final-verification-20261016.md`).
