import type { ChatPlan, ChatReply } from "./assistant-types.ts";
import { instructionAttack, unrelatedTask, normalizeScopeText } from "./scope-policy.ts";

export function validPlan(plan: ChatPlan | null, intent: string, source: string): plan is ChatPlan {
  if (!plan || plan.intent !== intent) return false;
  if (intent !== "compare" && plan.otherQuery) return false;
  const n = normalizeScopeText(source);
  return [plan.query, plan.otherQuery].every(
    (q) =>
      !q ||
      (n.includes(normalizeScopeText(q)) &&
        !instructionAttack(q) &&
        !unrelatedTask(q) &&
        !/https?:|[<>\n\r]/iu.test(q)),
  );
}

/** Only approved response keys and real R&L workflows leave the server. */
export function replyFor(plan: ChatPlan): ChatReply {
  const base: ChatReply = { intent: plan.intent, message: "greeting", cards: [], links: [] };
  switch (plan.intent) {
    case "refusal":
      return { ...base, message: "refusal" };
    case "bring":
      return {
        ...base,
        message: "bringReply",
        links: [{ label: "bring", href: "/stores/request?intent=buy" }],
      };
    case "how":
      return {
        ...base,
        message: "howReply",
        links: [{ label: "bring", href: "/stores/request?intent=buy" }],
      };
    case "shipping":
      return { ...base, message: "shippingReply", links: [{ label: "ship", href: "/quote" }] };
    case "tracking":
      return {
        ...base,
        message: "trackingReply",
        links: [
          { label: "track", href: "/track" },
          { label: "account", href: "/account" },
        ],
      };
    case "account":
      return { ...base, message: "accountReply", links: [{ label: "account", href: "/account" }] };
    case "support":
      return { ...base, message: "supportReply", links: [{ label: "support", href: "/contact" }] };
    case "identify":
      return {
        ...base,
        message: "identifyReply",
        links: [{ label: "photo", href: "#rl-ai-image" }],
      };
    case "compare":
    case "search":
      return {
        ...base,
        message: plan.query
          ? plan.intent === "compare"
            ? "compareReply"
            : "searchReply"
          : "askProduct",
        links: [{ label: "market", href: `/market?q=${encodeURIComponent(plan.query)}` }],
      };
    default:
      return base;
  }
}
