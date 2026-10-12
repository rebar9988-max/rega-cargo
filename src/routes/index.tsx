import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { BazaarPage } from "@/components/bazaar-page";
import { PremiumHome } from "@/components/premium-home";
import { Shell } from "@/components/shell";
import { validateBazaarSearch } from "@/lib/bazaar-search";

export const Route = createFileRoute("/")({
  validateSearch: validateBazaarSearch,
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/",
      title: "R&L · بازاڕ و گەیاندن، ئەوروپا ↔ کوردستان ↔ عێراق",
      description:
        "لە فرۆشگا ئەوروپییەکان داوای کڕین بکە و بار بنێرە بۆ کوردستان و عێراق. نرخ بە یۆرۆ و دینار، بە پێی کێشی حیسابکراو.",
    }),
  component: HomePage,
});

function HomePage() {
  const params = Route.useSearch();
  // Preserve existing home-search URLs without mixing the catalogue with shipping.
  if (
    params.q ||
    params.cat ||
    params.sub ||
    params.fav ||
    params.who ||
    params.store ||
    params.country
  )
    return <BazaarPage home />;
  return (
    <Shell>
      <PremiumHome />
    </Shell>
  );
}
