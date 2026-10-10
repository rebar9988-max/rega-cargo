import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/privacy",
      title: "تایبەتمەندی · R&L",
      description:
        "R&L چی لە زانیارییەکانت دەکات: میوانداری لەسەر Cloudflare، بێ شوێنکەوتن، ئەوەی لەسەر ئامێرەکەت هەڵدەگیرێت.",
    }),
  component: () => <LegalPage doc="privacy" />,
});
