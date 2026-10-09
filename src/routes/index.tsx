import { createFileRoute } from "@tanstack/react-router";
import { BazaarPage } from "@/components/bazaar-page";
import { validateBazaarSearch } from "@/lib/bazaar-search";
import { initialService } from "@/lib/service-initial";

export const Route = createFileRoute("/")({
  validateSearch: validateBazaarSearch,
  loader: async () => ({ service: await initialService() }),
  head: () => ({
    meta: [
      { title: "بازاڕ · R&L" },
      {
        name: "description",
        content:
          "فرۆشگا فەرمییەکانی ئەوروپا. وێنەکان ببینە و داوا بکە. هیچ شتێک ناکڕدرێت تا نرخەکە پشتڕاست بکەیتەوە.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { service } = Route.useLoaderData();
  return <BazaarPage home initialService={service} />;
}
