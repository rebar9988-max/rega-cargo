import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { QuotePanel } from "@/components/quote-panel";
import { PageHeader, Shell } from "@/components/shell";
import { DeliveryTabs } from "@/components/delivery-hub";
import { useI18n } from "@/lib/i18n";
import { parseDim, parseFrom, parseKg, parseTo, type QuoteSearch } from "@/lib/quote-search";

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>): QuoteSearch => ({
    from: parseFrom(search.from),
    to: parseTo(search.to),
    kg: parseKg(search.kg),
    l: parseDim(search.l),
    w: parseDim(search.w),
    h: parseDim(search.h),
  }),
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/quote",
      title: "نرخی ناردن · R&L",
      description:
        "نرخی ناردنی بار لە ئەوروپاوە بۆ کوردستان و عێراق بە پێی کێشی حیسابکراو، بە یۆرۆ و دینار. گومرگ لەناو نرخەکەدا نییە.",
    }),
  component: QuotePage,
});

function QuotePage() {
  const { t } = useI18n();
  const { from, to, kg, l, w, h } = Route.useSearch();
  return (
    <Shell>
      <DeliveryTabs active="/quote" />
      <PageHeader kicker={t.quoteKicker} title={t.quoteTitle} lede={t.quoteLede} />
      <div className="page rl-quote-page">
        <QuotePanel
          key={`${from}-${to}-${kg}-${l}-${w}-${h}`}
          variant="full"
          initial={{ from, to, kg: kg === undefined ? undefined : String(kg), l, w, h }}
        />
      </div>
    </Shell>
  );
}
