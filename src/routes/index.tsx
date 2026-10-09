import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { BazaarPage } from "@/components/bazaar-page";
import { validateBazaarSearch } from "@/lib/bazaar-search";
import { initialService } from "@/lib/service-initial";

export const Route = createFileRoute("/")({
  validateSearch: validateBazaarSearch,
  loader: async () => ({ service: await initialService() }),
  head: () =>
    seo({
      path: "/",
      title: "R&L · بازاڕ و گەیاندن، ئەوروپا ↔ کوردستان ↔ عێراق",
      description: "لە فرۆشگا ئەوروپییەکان داوای کڕین بکە و بار بنێرە بۆ کوردستان و عێراق. نرخ بە یۆرۆ و دینار، بە پێی کێشی حیسابکراو.",
    }),
  component: HomePage,
});

function HomePage() {
  const { service } = Route.useLoaderData();
  return <BazaarPage home initialService={service} />;
}
