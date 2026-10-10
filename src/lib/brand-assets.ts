/** Approved original: public/brand/official-da41b3010f96-v1/original.jpg.
 * Content-versioned URLs prevent cached legacy artwork from becoming a fallback.
 * Mechanical export recipe: scripts/build-brand-assets.py.
 */
export const BRAND_ASSET_ROOT = "/brand/official-da41b3010f96-v1";
export const BRAND_ASSETS = {
  logo: `${BRAND_ASSET_ROOT}/logo-56.webp`,
  logo2x: `${BRAND_ASSET_ROOT}/logo-112.webp`,
  logo3x: `${BRAND_ASSET_ROOT}/logo-168.webp`,
  print: `${BRAND_ASSET_ROOT}/icon-512.png`,
  favicon: `${BRAND_ASSET_ROOT}/icon-32.png`,
  faviconIco: `${BRAND_ASSET_ROOT}/favicon.ico`,
  apple: `${BRAND_ASSET_ROOT}/icon-180.png`,
  social: `${BRAND_ASSET_ROOT}/social-1200x630.jpg`,
} as const;
