import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { AiPage } from "@/components/ai-page";

export const Route = createFileRoute("/ai")({
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/ai",
      title: "R&L AI",
      description: "ناسینەوەی کاڵا بە وێنە لەگەڵ R&L AI.",
      noindex: true,
    }),
  component: AiPage,
});
