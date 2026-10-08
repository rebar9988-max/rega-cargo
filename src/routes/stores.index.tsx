import { createFileRoute } from "@tanstack/react-router";
import { BazaarPage } from "@/components/bazaar-page";
import { validateBazaarSearch } from "@/lib/bazaar-search";

export const Route = createFileRoute("/stores/")({
  validateSearch: validateBazaarSearch,
  head: () => ({ meta: [{ title: "بازاڕ · R&L" }] }),
  component: BazaarPage,
});
