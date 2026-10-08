import { createFileRoute } from "@tanstack/react-router";
import { BazaarPage } from "@/components/bazaar-page";
import { validateBazaarSearch } from "@/lib/bazaar-search";

export const Route = createFileRoute("/")({
  validateSearch: validateBazaarSearch,
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
  component: BazaarPage,
});
