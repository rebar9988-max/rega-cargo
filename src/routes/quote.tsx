import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { QuotePanel } from "@/components/quote-panel";
import { PageHeader, Shell } from "@/components/shell";
import { DeliveryTabs } from "@/components/delivery-hub";
import { useI18n } from "@/lib/i18n";
import { parseKg } from "@/lib/quote-search";

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" && search.from ? search.from : undefined,
    to: typeof search.to === "string" && search.to ? search.to : undefined,
    kg: parseKg(search.kg),
  }),
  head: () =>
    seo({
      path: "/quote",
      title: "نرخی ناردن · R&L",
      description: "نرخی ناردنی بار لە ئەوروپاوە بۆ کوردستان و عێراق بە پێی کێشی حیسابکراو، بە یۆرۆ و دینار. گومرگ لەناو نرخەکەدا نییە.",
    }),
  component: QuotePage,
});

function QuotePage() {
  const { t } = useI18n();
  const { from, to, kg } = Route.useSearch();
  return (
    <Shell>
      <DeliveryTabs active="/quote" />
      <PageHeader kicker={t.quoteKicker} title={t.quoteTitle} lede={t.quoteLede} />
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <QuotePanel variant="full" initial={{ from, to, kg: kg === undefined ? undefined : String(kg) }} />
      </div>
    </Shell>
  );
}
