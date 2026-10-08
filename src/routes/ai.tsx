import { createFileRoute } from "@tanstack/react-router";
import { AiPage } from "@/components/ai-page";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [{ title: "R&L AI" }, { name: "robots", content: "noindex" }],
  }),
  component: AiPage,
});
