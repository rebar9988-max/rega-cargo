/**
 * Light brand pieces from the R&L board: a calm white hero with a diagonal
 * red swoosh, round red icon badges and the small trust row. The swoosh is an
 * inline SVG (no image request, no inline style) and always sweeps up to the
 * right: language changes text direction only, never the artwork.
 */
import { Clock, Globe, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";

export function IconBadge({ icon: Icon, size = "md" }: { icon: LucideIcon; size?: "sm" | "md" }) {
  return (
    <span
      className={`rl-grad grid shrink-0 place-items-center rounded-full shadow-[0_6px_14px_-8px_rgb(168_0_0/0.7)] ${size === "sm" ? "size-9" : "size-11"}`}
    >
      <Icon className={size === "sm" ? "size-4" : "size-5"} aria-hidden="true" />
    </span>
  );
}

function Swoosh() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full md:h-20"
    >
      <defs>
        <linearGradient id="rl-swoosh" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#db0100" stopOpacity="0" />
          <stop offset="0.45" stopColor="#db0100" />
          <stop offset="1" stopColor="#a80000" />
        </linearGradient>
      </defs>
      <path d="M0 120 C 420 112 820 70 1200 0 L1200 120 Z" fill="#db0100" fillOpacity="0.05" />
      <path d="M0 120 C 520 116 900 86 1200 34 L1200 58 C 920 104 560 120 0 120 Z" fill="url(#rl-swoosh)" />
      <path d="M0 106 C 480 104 860 70 1200 12" fill="none" stroke="#c9ced6" strokeWidth="1.5" />
    </svg>
  );
}

export function BrandHero({ title, route }: { title: string; route: string }) {
  return (
    <section className="rl-hero relative overflow-hidden border-b border-line">
      <div className="relative mx-auto max-w-6xl px-5 pt-9 pb-16 md:pt-14 md:pb-24">
        <p className="flex items-center gap-3 font-sans text-xs font-bold tracking-[0.3em] text-pine">
          <bdi dir="ltr">R&amp;L</bdi>
          <span className="rl-grad h-0.5 w-8 rounded-full" aria-hidden="true" />
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl leading-snug font-bold tracking-tight text-balance text-ink md:text-5xl md:leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-sm tracking-wide text-muted">{route}</p>
      </div>
      <Swoosh />
    </section>
  );
}

export function TrustRow({ children }: { children?: ReactNode }) {
  const { lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const items: { icon: LucideIcon; label: string }[] = [
    { icon: Truck, label: d.trust.fast },
    { icon: ShieldCheck, label: d.trust.safe },
    { icon: Globe, label: d.trust.reach },
    { icon: Clock, label: d.trust.onTime },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pt-5 md:px-5 md:pt-8" aria-label={d.trustLabel}>
      <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4" style={{ direction: "ltr" }}>
        {items.map((item) => (
          <li
            key={item.label}
            className="rl-soft flex min-h-16 min-w-0 items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2.5"
          >
            <IconBadge icon={item.icon} size="sm" />
            <span dir="auto" className="text-sm leading-snug font-semibold text-ink">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
