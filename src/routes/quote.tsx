import { createFileRoute } from "@tanstack/react-router";
import { QuotePanel } from "@/components/quote-panel";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" && search.from ? search.from : undefined,
    to: typeof search.to === "string" && search.to ? search.to : undefined,
    kg: typeof search.kg === "string" && search.kg ? search.kg : undefined,
  }),
  head: () => ({
    meta: [{ title: "نرخ · Rega Cargo" }],
  }),
  component: QuotePage,
});

function QuotePage() {
  const { t } = useI18n();
  const { from, to, kg } = Route.useSearch();
  return (
    <Shell>
      <PageHeader kicker={t.quoteKicker} title={t.quoteTitle} lede={t.quoteLede} />
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <QuotePanel variant="full" initial={{ from, to, kg }} />
      </div>
    </Shell>
  );
}
