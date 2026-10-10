# Official R&L Cargo identity

The brand owner supplied the final artwork on 2026-10-10. The only approved source is
`official-da41b3010f96-v1/original.jpg` (1254 × 1254 RGB).

SHA-256: `da41b3010f96b80d0b35cd8a83987f9053c0698b6db676fbe66ca4c756c2362c`.

The original is preserved byte for byte. Full-size PNG and lossless WebP exports
have identical decoded pixels. Smaller icons and display images resize the whole
square with Lanczos resampling. Do not crop, stretch, mirror, recolor, trace, or
regenerate the artwork. Retain its red background, highlights and shadows; accurate
background removal would damage this flattened design, so no transparent variant
is approved.

`src/lib/brand-assets.ts` centralizes application paths; `BrandLogo` renders the UI
at 1×/2×/3× density with an accessible brand name. Native manifest icons use `any`,
not `maskable`, because the supplied artwork isn't safe for OS masking. The social
card fits the complete square into 1200 × 630 with white margins. The conventional
`/favicon.ico` and `/og.jpg` contain copies of the same official exports for automatic
browser requests and existing platform tools. These are intentional compatibility
copies, not alternate identities. Legacy URLs redirect to the official files.

Regenerate mechanical exports with `python3 scripts/build-brand-assets.py` (Pillow
in the maintainer environment), then `CHROME=/usr/bin/chromium npm run rate-sheet`.
No application dependency was added. The generated rate sheet keeps the original
pricing fingerprint. Always use a new versioned directory for approved artwork or
export recipe changes; never replace files marked immutable under their current URL.

Store logos, third-party brand files, photographs and user avatars are unrelated
assets and must not be changed during an R&L identity migration.
