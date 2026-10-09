import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { businessContact, whatsappLink } from "@/lib/business";
import { CONTACT_COPY } from "@/lib/contact-copy";
import { PageHeader, Shell } from "@/components/shell";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import { btnPrimary } from "@/components/field";
import { UX_COPY } from "@/lib/ux-copy";

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
  const c = CONTACT_COPY[lang];
  // Only details the owner has configured and that pass validation (src/lib/business.ts).
  const contact = businessContact();
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
            <span dir="auto" className="text-sm text-muted">{t.contactEmailLabel}</span>
            <bdi dir="ltr" className="truncate text-lg font-semibold text-ink group-hover:text-pine md:text-xl">
              {CONTACT_EMAIL}
            </bdi>
          </span>
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`} className={`${btnPrimary} gap-2`}>
          <Mail className="size-4" aria-hidden="true" />
          {UX_COPY[lang].sendEmail}
        </a>
        {contact.whatsapp || contact.phone || contact.hours || contact.address ? (
          <div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
            {contact.whatsapp ? (
              <DetailCard icon={<MessageCircle className="size-6" aria-hidden="true" />} label={c.whatsapp} href={whatsappLink(contact.whatsapp)} external>
                <bdi dir="ltr">{contact.whatsapp}</bdi>
              </DetailCard>
            ) : null}
            {contact.phone ? (
              <DetailCard icon={<Phone className="size-6" aria-hidden="true" />} label={c.call} href={`tel:${contact.phone}`}>
                <bdi dir="ltr">{contact.phone}</bdi>
              </DetailCard>
            ) : null}
            {contact.hours ? (
              <DetailCard icon={<Clock className="size-6" aria-hidden="true" />} label={c.hours}>
                <span dir="auto">{contact.hours}</span> <bdi dir="ltr" className="text-sm text-muted">({contact.timezone})</bdi>
              </DetailCard>
            ) : null}
            {contact.address ? (
              <DetailCard icon={<MapPin className="size-6" aria-hidden="true" />} label={c.address} href={contact.mapUrl} external>
                <span dir="auto">{contact.address}</span>
                {contact.mapUrl ? <span className="block text-sm text-pine underline underline-offset-4">{c.map}</span> : null}
              </DetailCard>
            ) : null}
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

function DetailCard({ icon, label, href, external, children }: { icon: ReactNode; label: string; href?: string; external?: boolean; children: ReactNode }) {
  const body = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-paper text-pine">{icon}</span>
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-base font-semibold break-words text-ink">{children}</span>
      </span>
    </>
  );
  const cls = "flex min-h-16 items-center gap-4 rounded-3xl border border-line bg-surface p-5";
  return href ? (
    <a href={href} className={`${cls} transition-colors hover:border-pine`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}
