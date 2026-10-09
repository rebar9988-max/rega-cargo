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

/** Page gutter shared by every home section (16px on phones). */
export const GUTTER = "px-4 md:px-5";
/** Hidden scrollbar for horizontal rails. */
export const RAIL = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function IconBadge({
  icon: Icon,
  size = "md",
  tone = "solid",
}: {
  icon: LucideIcon;
  size?: "sm" | "md";
  tone?: "solid" | "soft";
}) {
  const color =
    tone === "solid" ? "rl-grad shadow-[0_6px_14px_-8px_rgb(168_0_0/0.7)]" : "bg-pine/[0.08] text-pine";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${color} ${size === "sm" ? "size-9" : "size-11"}`}
    >
      <Icon className={size === "sm" ? "size-4" : "size-5"} aria-hidden="true" />
    </span>
  );
}

/** One header pattern for every section: title (+ optional subtitle) left, action right. */
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4" style={{ direction: "ltr" }}>
      <div className="flex min-w-0 flex-col items-start">
        <h2 className="text-xl leading-tight font-bold tracking-tight text-ink md:text-2xl">{title}</h2>
        {sub ? <p className="mt-1 text-xs text-muted md:text-sm">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export const seeAllClass =
  "inline-flex h-9 shrink-0 items-center gap-0.5 rounded-full ps-3 pe-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface";

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
      <div className={`relative mx-auto max-w-6xl ${GUTTER} pt-8 pb-14 md:pt-14 md:pb-24`}>
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

/** The calm "free delivery · secure payment" style strip of global stores. */
export function TrustRow() {
  const { lang } = useI18n();
  const d = DESIGN_COPY[lang];
  const items: { icon: LucideIcon; label: string }[] = [
    { icon: Truck, label: d.trust.fast },
    { icon: ShieldCheck, label: d.trust.safe },
    { icon: Globe, label: d.trust.reach },
    { icon: Clock, label: d.trust.onTime },
  ];
  return (
    <section className="border-b border-line bg-surface" aria-label={d.trustLabel}>
      <ul
        className={`mx-auto flex max-w-6xl items-center overflow-x-auto ${GUTTER} ${RAIL} md:justify-between`}
        style={{ direction: "ltr" }}
      >
        {items.map((item, index) => (
          <li key={item.label} className="flex h-12 shrink-0 items-center gap-2">
            {index > 0 ? <span className="mx-3.5 h-4 w-px bg-line md:hidden" aria-hidden="true" /> : null}
            <item.icon className="size-4 shrink-0 text-pine" strokeWidth={1.75} aria-hidden="true" />
            <span dir="auto" className="text-xs font-medium whitespace-nowrap text-ink">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
