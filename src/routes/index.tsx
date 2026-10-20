import { createFileRoute } from "@tanstack/react-router";
import { homeJsonLdScript, seo } from "@/lib/seo";
import { BazaarPage } from "@/components/bazaar-page";
import { RefHome } from "@/components/ref-home";
import { Shell } from "@/components/shell";
import { validateBazaarSearch } from "@/lib/bazaar-search";
import { marketHome } from "@/lib/market/api";

export const Route = createFileRoute("/")({
  validateSearch: validateBazaarSearch,
  loaderDeps: ({ search }) => ({
    catalogue: Boolean(
      search.q ||
      search.cat ||
      search.sub ||
      search.fav ||
      search.who ||
      search.store ||
      search.country,
    ),
  }),
  loader: ({ deps }) => (deps.catalogue ? null : marketHome({ data: { sort: "new", page: 1 } })),
  head: ({ match }) => {
    const page = seo({
      lang: match.context.initialLang,
      path: "/",
      title: "R&L · بازاڕ و گەیاندن، ئەوروپا ↔ کوردستان ↔ عێراق",
      description:
        "لە فرۆشگا ئەوروپییەکان داوای کڕین بکە و بار بنێرە بۆ کوردستان و عێراق. نرخ بە یۆرۆ و دینار، بە پێی کێشی حیسابکراو.",
    });
    const description = page.meta.find((tag) => tag.name === "description")?.content ?? "";
    return { ...page, scripts: [homeJsonLdScript(description)] };
  },
  component: HomePage,
});

function HomePage() {
  const params = Route.useSearch();
  const market = Route.useLoaderData();
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
    <Shell reference>
      <RefHome market={market} />
    </Shell>
  );
}
