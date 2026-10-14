import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Mail } from "lucide-react";
import { PageHeader, Shell } from "@/components/shell";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { btnPrimary } from "@/components/field";
import { UX_COPY } from "@/lib/ux-copy";
import { ComplaintPanel } from "@/components/complaint-panel";
import { TrustSummary } from "@/components/trust-summary";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      path: "/contact",
      title: "پەیوەندی · R&L",
      description: "پەیوەندی بە R&L بکە لە ڕێگەی ئیمەیڵەوە: 2233rega@gmail.com.",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { t, lang } = useI18n();
  return (
    <Shell>
      <PageHeader kicker={t.contactKicker} title={t.contactTitle} lede={t.contactLede} />
      <div className="page flex flex-col items-start gap-6 py-10 md:py-16">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="group flex max-w-xl items-center gap-4 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-pine md:p-6"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-pine text-pine-ink">
            <Mail className="size-6" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col items-start gap-1">
            <span dir="auto" className="text-sm text-muted">
              {t.contactEmailLabel}
            </span>
            <bdi
              dir="ltr"
              className="truncate text-lg font-semibold text-ink group-hover:text-pine md:text-xl"
            >
              {CONTACT_EMAIL}
            </bdi>
          </span>
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className={`${btnPrimary} gap-2`}>
          <Mail className="size-4" aria-hidden="true" />
          {UX_COPY[lang].sendEmail}
        </a>
        <ComplaintPanel />
        <TrustSummary />
      </div>
    </Shell>
  );
}
