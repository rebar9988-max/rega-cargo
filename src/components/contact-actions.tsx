import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { btnGhost, btnPrimary } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/contact";
import { CONTACT_COPY } from "@/lib/contact-copy";
import { businessContact, whatsappLink } from "@/lib/business";

/**
 * Contact buttons from verified config only: email always; WhatsApp, phone, hours and
 * warehouse address only when set (see src/lib/business.ts). Buttons are full width on
 * phones (easy to reach) and inline from md up.
 */
export function ContactActions({ subject, details = false, className = "" }: { subject?: string; details?: boolean; className?: string }) {
  const { lang } = useI18n();
  const t = CONTACT_COPY[lang];
  const contact = businessContact();
  const mail = `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  const onlyEmail = !contact.whatsapp && !contact.phone;
  return (
    <section aria-label={t.title} className={`flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 ${className}`}>
      <h2 className="text-base font-bold">{t.title}</h2>
      <div className="grid gap-2 md:flex md:flex-wrap">
        {contact.whatsapp ? (
          <a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            <MessageCircle className="size-4" aria-hidden="true" />
            {t.whatsapp}
          </a>
        ) : null}
        {contact.phone ? (
          <a href={`tel:${contact.phone}`} className={contact.whatsapp ? btnGhost : btnPrimary}>
            <Phone className="size-4" aria-hidden="true" />
            {t.call} <bdi dir="ltr">{contact.phone}</bdi>
          </a>
        ) : null}
        <a href={mail} className={onlyEmail ? btnPrimary : btnGhost}>
          <Mail className="size-4" aria-hidden="true" />
          <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
        </a>
      </div>
      {onlyEmail ? <p className="text-sm text-muted">{t.emailOnly}</p> : null}
      {details && contact.hours ? (
        <p className="flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden="true" />
          <span>
            <span className="text-muted">{t.hours}: </span>
            <span dir="auto">{contact.hours}</span> <bdi dir="ltr" className="text-muted">({contact.timezone})</bdi>
          </span>
        </p>
      ) : null}
      {details && contact.address ? (
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden="true" />
          <span className="flex flex-col gap-1">
            <span>
              <span className="text-muted">{t.address}: </span>
              <span dir="auto">{contact.address}</span>
            </span>
            {contact.mapUrl ? (
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center font-medium text-pine underline underline-offset-4">
                {t.map}
              </a>
            ) : null}
          </span>
        </p>
      ) : null}
    </section>
  );
}
