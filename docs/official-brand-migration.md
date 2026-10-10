# Official logo migration — 2026-10-10

## Audit

The tracked repository was searched for branding, image imports, inline artwork,
favicons, manifest icons, metadata, offline/service-worker assets, authentication,
admin screens, PDF generation and email templates. Shared `Shell` renders the
header/footer across homepage, stores, requests, cargo/quote, tracking, marketplace,
AI, account/admin and legal pages. The mobile drawer has another shared logo.
No separate branded email template, login logo, loading/splash logo or sidebar
logo exists. Customer profile images and decorative UI SVGs are unrelated.

Active legacy references existed in `site-mark.tsx`, root metadata, `seo.ts`,
`rl-og.ts`, `rate-sheet.ts`, `manifest.webmanifest`, `offline.html`, `sw.js` and
cache headers. Unused legacy files included hand-drawn `rl-logo.svg`, full-size
`rl-logo.png`, `rega-logo.jpg`, and `src/assets/rega-logo.jpg`. The old Apple icon
was duplicated at `public/__grok/icon-180.png` (identical SHA-256).

## Replacement and cleanup

The uploaded source is saved unchanged under `public/brand/official-da41b3010f96-v1`.
`BrandLogo` replaces `site-mark.tsx`; `brand-assets.ts` centralizes UI, print,
favicon and share-image paths. Static manifest/offline/service-worker references
use the same directory. The PDF generator now uses an isolated Playwright browser,
waits for fonts and image decoding, and fails on missing artwork rather than
silently leaving an old PDF. It uses the existing dependency.

Removed legacy artwork:

- `public/rega-logo.jpg`, `public/rega-logo-168.webp`
- `public/rl-logo.png`, `public/rl-logo.svg`, `src/assets/rega-logo.jpg`
- `public/favicon.png`, `public/favicon.svg`
- `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`
- `public/__grok/icon-180.png`

`public/favicon.ico` and `public/og.jpg` are regenerated official compatibility
copies. `public/rl-cargo.pdf` is regenerated with the official artwork and unchanged
rate data. Old public logo/icon URLs redirect to the new files. The service-worker
version upgrade removes legacy caches. Manifest, offline HTML, PDF and conventional
icon/share URLs revalidate; content-versioned brand assets are immutable. No routes,
APIs, database models, pricing formulas, colors or unrelated UI were changed.

Store/brand SVGs, Grok's own third-party artwork, catalogue photographs and customer
avatars are preserved. Git history retains all previous source assets and versions.

## Verification and test URLs

Required commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`,
and `npm run cf:dry-run` under Node 22 with `DATABASE_URL=''`. The official-brand
unit tests cover source integrity, retired assets, PNG dimensions, manifest identity,
shared references, and service-worker cache migration. Browser tests check loaded,
square, unmirrored official logos on every required route in ckb/ar/en, light/dark.
Screenshot baselines must be regenerated in the official Playwright Docker image
because changing the approved artwork intentionally changes logo pixels.

Local verification: lint passed with five pre-existing warnings and zero errors;
typecheck passed; 391 unit tests passed with four existing skips; build and Worker
dry-run passed. Official Docker browser verification passed 376 tests with 12
intentional skips. The PDF embeds the exact pixels of the 512px official PNG and
retains rate fingerprint `9b1d3a64`. Full-size PNG/WebP pixels match the original.

Test on staging first, then production after GitHub quality gates pass:

- `https://cargo.regaplatform.com/?lang=ckb` (repeat with ar/en and dark mode)
- `https://cargo.regaplatform.com/stores?cat=fashion&lang=en`
- `https://cargo.regaplatform.com/stores?fav=1&lang=ar`
- `https://cargo.regaplatform.com/stores/request?store=zalando&intent=buy&lang=ckb`
- `https://cargo.regaplatform.com/quote?lang=en`
- `/market`, `/ai`, `/track`, `/contact`, `/account`, `/admin`, legal pages
- `/manifest.webmanifest`, `/favicon.ico`, `/offline`, `/rl-cargo.pdf`
- `/brand/official-da41b3010f96-v1/original.jpg`
- `/brand/official-da41b3010f96-v1/social-1200x630.jpg`

Deployment follows the existing Cargo Worker staging/production flow, preserving
bindings and secret values. Current pre-migration production version is
`10f69b7f-b3df-4f19-880f-7df212845908` for rollback. Auth/database connectivity
limitations already present in production are unrelated to brand assets; no new
login/account behavior or simulated business data is introduced.
