import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/terms",
      title: "مەرجەکانی بەکارهێنان · R&L",
      description: "مەرجەکانی بەکارهێنانی ئەپی R&L.",
    }),
  component: () => <LegalPage doc="terms" />,
});
