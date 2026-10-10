import { BRAND_ASSETS } from "@/lib/brand-assets";

/** Entire approved artwork, at its original aspect ratio. Never mirror in RTL. */
export function BrandLogo({ className = "size-14" }: { className?: string }) {
  return (
    <img
      src={BRAND_ASSETS.logo}
      srcSet={`${BRAND_ASSETS.logo} 1x, ${BRAND_ASSETS.logo2x} 2x, ${BRAND_ASSETS.logo3x} 3x`}
      alt="R&L"
      width={56}
      height={56}
      decoding="async"
      data-brand-logo="official"
      className={`${className} shrink-0 object-contain`}
    />
  );
}
