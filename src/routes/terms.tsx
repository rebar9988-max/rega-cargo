import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => seo({ path: "/terms", title: "مەرجەکانی بەکارهێنان · R&L", description: "مەرجەکانی بەکارهێنانی ئەپی R&L." }),
  component: () => <LegalPage doc="terms" />,
});
