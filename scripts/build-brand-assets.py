#!/usr/bin/env python3
"""Mechanical exports of the approved artwork. No cropping, recoloring or tracing.

Requires Pillow in the maintainer environment; no runtime/application dependency.
The approved JPEG is immutable. Changing it requires explicit brand-owner approval.
"""
from hashlib import sha256
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public/brand/official-da41b3010f96-v1"
SOURCE = BRAND / "original.jpg"
EXPECTED = "da41b3010f96b80d0b35cd8a83987f9053c0698b6db676fbe66ca4c756c2362c"

assert sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED, "Unapproved source artwork"
original = Image.open(SOURCE)
assert original.size == (1254, 1254) and original.mode == "RGB"
original.save(BRAND / "logo.png", optimize=True)
original.save(BRAND / "logo.webp", lossless=True, method=6)

for size in (16, 32, 48, 180, 192, 512):
    original.resize((size, size), Image.Resampling.LANCZOS).save(
        BRAND / f"icon-{size}.png", optimize=True
    )
for size in (56, 112, 168):
    original.resize((size, size), Image.Resampling.LANCZOS).save(
        BRAND / f"logo-{size}.webp", lossless=True, method=6
    )

original.save(BRAND / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
# Conventional automatic browser request: same official artwork, never a legacy fallback.
(ROOT / "public/favicon.ico").write_bytes((BRAND / "favicon.ico").read_bytes())

# Fit the ENTIRE square artwork into the social canvas. Do not stretch or crop it.
card = Image.new("RGB", (1200, 630), "white")
card.paste(original.resize((630, 630), Image.Resampling.LANCZOS), (285, 0))
card.save(BRAND / "social-1200x630.jpg", quality=95, subsampling=0, optimize=True)
# Existing platform tooling discovers the conventional share-card location.
(ROOT / "public/og.jpg").write_bytes((BRAND / "social-1200x630.jpg").read_bytes())
print(f"Official brand exports generated from SHA-256 {EXPECTED}")
