import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/impressum")({
  head: () => seo({ path: "/impressum", title: "زانیاریی یاسایی · R&L", description: "زانیاریی دابینکەری R&L." }),
  component: () => <LegalPage doc="impressum" />,
});
