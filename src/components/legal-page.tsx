import { RichLine } from "@/components/rich-line";
import { Info } from "lucide-react";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { LEGAL_COPY } from "@/lib/legal-copy";
import approved from "@/lib/business-approved.json";
import { businessReadiness } from "@/lib/business-profile";
import { TRUST_COPY } from "@/lib/trust-copy";
import { DRAFT_COPY } from "@/lib/orders/draft-copy";

/** Impressum / privacy / terms. Placeholders stay visibly marked until the owner supplies the details. */
export function LegalPage({ doc }: { doc: "impressum" | "privacy" | "terms" }) {
  const { lang } = useI18n();
  const copy = LEGAL_COPY[lang];
  const page = copy[doc];
  const { profile } = businessReadiness(approved);
  const sections = page.sections.map((section) => ({ h: section.h, p: [...section.p] }));
  if (profile) {
    const address = `${profile.street}, ${profile.postalCode} ${profile.city}, ${profile.country}`;
    if (doc === "impressum") {
      sections[0].p = [
        profile.legalName,
        profile.legalForm,
        profile.street,
        `${profile.postalCode} ${profile.city}, ${profile.country}`,
      ];
      sections[1].p = [profile.representative];
      sections[3].p = [profile.registerDetails, profile.vatDetails];
      sections[4].p = [profile.contentResponsible];
    } else if (doc === "terms") {
      sections[0].p = sections[0].p.map((line) => line.replace(/\[[^\]]*\]/g, profile.legalName));
      sections[4].p = [profile.liability[lang]];
      sections[5].p = [profile.jurisdiction[lang]];
      sections.push({ h: TRUST_COPY[lang].policy, p: [profile.complaints[lang]] });
    } else {
      sections[0].p = sections[0].p.map((line) =>
        line.replace(/\[[^\]]*\]/g, `${profile.legalName}, ${address}`),
      );
      sections[7].p = sections[7].p.map((line) =>
        line.replace(/\[[^\]]*\]/g, profile.retention[lang]),
      );
    }
  }
  if (doc === "privacy") sections.push({ h: DRAFT_COPY[lang].keep, p: [DRAFT_COPY[lang].privacy] });
  return (
    <Shell>
      <PageHeader
        kicker="R&L"
        title={page.title}
        lede={profile && doc === "terms" ? TRUST_COPY[lang].policy : page.lede}
      />
      <div className="page rl-legal-body">
        {!profile ? (
          <p className="rl-legal-note" role="note">
            <Info className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden="true" />
            <span dir="auto" className="min-w-0 flex-1">
              {copy.pending}
            </span>
          </p>
        ) : null}
        <nav aria-label={page.title} className="rl-legal-toc">
          {sections.map((section, index) => (
            <a key={section.h} href={`#${doc}-${index}`}>
              {section.h}
            </a>
          ))}
        </nav>
        {sections.map((section, index) => (
          <section key={section.h} id={`${doc}-${index}`} className="rl-legal-section">
            <h2 className="text-2xl leading-tight font-bold tracking-tight">{section.h}</h2>
            {section.p.map((line) => (
              <RichLine key={line} text={line} className="text-base leading-relaxed text-muted" />
            ))}
          </section>
        ))}
        <p className="text-xs text-muted">{copy.updated}</p>
      </div>
    </Shell>
  );
}
