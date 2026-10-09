import { NUM_LOCALE } from "@/lib/numbers";
import { formatIqdFromEur } from "@/lib/corridor";
import type { ReactNode } from "react";

export const controlClass =
  "h-12 w-full rounded-xl border border-silver bg-surface px-3 text-base text-ink";

export const btnPrimary =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pine rl-grad px-5 text-sm font-medium text-pine-ink shadow-[0_8px_18px_-10px_rgb(168_0_0/0.65)] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";

export const btnGhost =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 text-sm font-medium text-ink transition-colors duration-200 hover:border-pine disabled:cursor-not-allowed disabled:opacity-40";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="text-muted">{hint}</span> : null}
    </label>
  );
}

export function Eur({ value }: { value: number }) {
  const text = new Intl.NumberFormat(NUM_LOCALE, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return (
    <bdi dir="ltr" className="tabular-nums">
      {text}
    </bdi>
  );
}

export function Iqd({ eur }: { eur: number }) {
  const text = formatIqdFromEur(eur);
  return (
    <bdi dir="ltr" className="tabular-nums">
      {text}
    </bdi>
  );
}
