import { NUM_LOCALE } from "@/lib/numbers";
import { formatIqdFromEur } from "@/lib/corridor";
import type { ReactNode } from "react";

export const controlClass = "rl-control";

export const btnPrimary = "rl-button rl-grad disabled:opacity-40";

export const btnGhost =
  "rl-button border border-line bg-surface text-ink hover:border-pine disabled:opacity-40";

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  /** Extra classes, e.g. a grid column span. */
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 text-sm ${className ?? ""}`}>
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
