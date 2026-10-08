import { createFileRoute } from "@tanstack/react-router";
import { BazaarPage } from "@/components/bazaar-page";

export const Route = createFileRoute("/stores/")({
  head: () => ({ meta: [{ title: "بازاڕ · R&L" }] }),
  component: BazaarPage,
});
