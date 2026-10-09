import { ContactActions } from "@/components/contact-actions";
import { formatNumber } from "@/lib/numbers";
import type { RequestCopy } from "@/lib/requests/copy";

export function IqdAmount({ value }: { value: number }) {
  return (
    <bdi dir="ltr" className="tabular-nums">
      {formatNumber(value)} IQD
    </bdi>
  );
}

const TONE: Record<string, string> = {
  quoted: "bg-pine text-pine-ink",
  accepted: "bg-ink text-surface",
  delivered: "bg-ink text-surface",
  cancelled: "bg-line text-muted",
};

export function StatusBadge({ status, t }: { status: string; t: RequestCopy }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${TONE[status] ?? "border border-line bg-surface text-ink"}`}
    >
      {t.statuses[status] ?? status}
    </span>
  );
}

/** Contact buttons for request pages (verified config only; email subject = reference). */
export function RequestHelp({ refCode }: { t?: RequestCopy; refCode?: string }) {
  return <ContactActions subject={refCode} />;
}
