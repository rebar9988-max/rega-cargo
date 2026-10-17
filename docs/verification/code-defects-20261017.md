# Code defect sweep — 2026-10-17

Base `origin/main` @ `61f8d7e`. Method: `tsc`, ESLint, `npm audit`, the unit/e2e suite, a type-aware lint with extra rules
(floating/misused promises, awaiting non-promises, base-to-string, thrown non-errors), then a logic review of pricing,
compliance, orders/requests, auth/phone sessions, rate limits and middleware. Every review finding was verified against
the code and, where possible, reproduced before any change. Fixes have regression tests that fail on the old code.

## Static analysis

`tsc --noEmit` 0 errors; ESLint 0 errors (5 warnings before, 4 now); `npm audit --omit=dev` 0 vulnerabilities.
The type-aware pass reported 292 floating promises, all in test files (`node:test` top-level `test()` calls), plus style-level
items (async handlers on React props, `FormData.get()` stringification on text inputs) and three harmless production
cases (a promise executor returning `canvas.toBlob`'s result, a re-thrown `AbortSignal.reason`, a constant-guarded hook).

## Fixed (6 verified defects)

| # | Defect | Root cause | Fix | Test |
|---|---|---|---|---|
| 1 | One signed quote could be booked up to 4 times (defeats "one booking per signed quote") | `atob` drops the unused trailing bits of the 43-character signature, so 4 spellings verify; the booking key is the raw signature text | `verifyQuote` accepts only the canonical spelling (`quote-token.ts`) | `quote-token.test.ts` (4 variants verified before, 1 now) |
| 2 | Requests with long links silently lost their data | `submitRequest` cut the JSON at 4,000 characters; validation allows ~11,000 (link + 3 attachments x 2,000). The request was accepted and read back as empty | Refuse payloads over 16,000 characters instead of truncating (`orders/handlers.server.ts`) | `requests.e2e.test.ts` (stored link was `""`) |
| 3 | Permanent product ban bypass | The "alcohol-free" exemption applied to the whole text: `Absolut Vodka 40cl, Kind regards, 0.0% fees` and `non alcoholic beer, and whisky gift set` were downgraded from block to review, and request flows only reject `block` | The exemption now applies only to alcohol words in the same clause (split at punctuation, newlines and "and/und/ve/و") and within 2 words (`compliance/check.ts`). Strictening only: genuine "alcohol free beer", "Beer 0,0 %", "بيرة بدون كحول", "بیرە بێ ئەلکهول" stay `review` | `check.test.ts`; all 40 compliance tests pass |
| 4 | Admin keywords stopped being enforced during a database blip | After the 5-minute TTL a failed refresh returned only the bundled rules and dropped the loaded DB rules | Keep the last loaded rules and retry after 30 s (`compliance/service.server.ts`) | `compliance/db.test.ts` |
| 5 | Owner saw tracking events that staff archived (public page hid them) | `requestDetail` lacked `archived_at is null` | Added the filter and an id tie-break (`requests/handlers.server.ts`) | `requests.e2e.test.ts` |
| 6 | Staff quote and customer acceptance could overwrite each other | Check-then-write across several statements, no guard on the final status update | `staffQuote` and `acceptQuote` are single data-modifying statements with the status guard inside (`requests/handlers.server.ts`) | `requests.e2e.test.ts` (refused quote leaves state untouched; existing flows pass) |

Also: `rl-og` middleware uses a function replacer so `$&` in a host can never corrupt the HTML; a stale lint directive
was removed from `use-current-user.ts`.

## Verified but NOT changed (owner decisions)

* **Phone code resend keeps the attempt counter** (`phone/session.server.ts`): after 5 wrong guesses a resend cannot
  unlock sign-in until a full window passes. This blocks brute force through resends but lets anyone who knows a number
  lock that user out. Choosing between the two is a security-policy decision. Phone sign-in is currently unavailable in production (no provider).
* **Chargeable weight rounds to the nearest 0.1 kg** (`corridor.ts`): a 4.84 kg parcel is billed as 4.8 kg (up to about EUR 0.39 under).
  This is the documented, test-locked pricing formula (AGENTS: do not change pricing formulas); rounding up would raise prices.
* **Rate limiting fails open** when the `RL_LIMIT` binding is missing and uses one shared bucket when `cf-connecting-ip` is absent
  (`rate-limit.server.ts`). The production binding exists; this is configuration drift protection, not a current defect.
* **HTML middleware buffers whole responses** several times (security nonce, render priority, og, cache): a performance
  trade-off, not a correctness bug.
* **Request flows only reject `block`**; `review`-level matches are accepted without being flagged for staff. Changing that is a product/process decision.

## Verification

typecheck, lint (0 errors), `npm test` 236 + 261 pass (6 new regression tests), build, `cf:dry-run`, and the
Chromium layout suite on the built Worker: 394 passed, 12 by-design skips, 0 failed. Firefox/WebKit, the
official-image layout lock and hosted CI were not run (see `final-verification-20261016.md`).
