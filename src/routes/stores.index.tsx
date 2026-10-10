import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { BazaarPage } from "@/components/bazaar-page";
import { validateBazaarSearch } from "@/lib/bazaar-search";

export const Route = createFileRoute("/stores/")({
  validateSearch: validateBazaarSearch,
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/stores",
      title: "فرۆشگاکان · R&L",
      description: "فرۆشگا ئۆنلاینە ئەوروپییەکان. کاڵاکەت هەڵبژێرە و لێرە داوای کڕین بکە.",
    }),
  component: BazaarPage,
});
