import { RichLine } from "@/components/rich-line";
import { Info } from "lucide-react";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { LEGAL_COPY } from "@/lib/legal-copy";

/** Impressum / privacy / terms. Placeholders stay visibly marked until the owner supplies the details. */
export function LegalPage({ doc }: { doc: "impressum" | "privacy" | "terms" }) {
  const { lang } = useI18n();
  const copy = LEGAL_COPY[lang];
  const page = copy[doc];
  return (
    <Shell>
      <PageHeader kicker="R&L" title={page.title} lede={page.lede} />
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-[var(--gutter)] py-10 md:py-14">
        {doc !== "privacy" ? (
          <p className="flex items-start gap-3 rounded-2xl border border-pine/30 bg-pine/[0.04] p-4 text-sm leading-relaxed text-ink" role="note" style={{ direction: "ltr" }}>
            <Info className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden="true" />
            <span dir="auto" className="min-w-0 flex-1">{copy.pending}</span>
          </p>
        ) : null}
        {page.sections.map((section) => (
          <section key={section.h} className="flex flex-col gap-3">
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
