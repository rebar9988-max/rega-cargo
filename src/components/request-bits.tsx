import { CONTACT_EMAIL } from "@/lib/contact";
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

/** Contact row for request and tracking pages. Only verified details are shown (email for now). */
export function RequestHelp({ t, refCode }: { t: RequestCopy; refCode?: string }) {
  const subject = refCode ? `?subject=${encodeURIComponent(refCode)}` : "";
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-sm">
      <span className="text-muted">{t.contactHelp}</span>
      <a
        href={`mailto:${CONTACT_EMAIL}${subject}`}
        className="inline-flex min-h-10 items-center font-medium text-pine underline underline-offset-4"
      >
        <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
      </a>
    </div>
  );
}
