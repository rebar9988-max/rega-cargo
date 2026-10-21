/**
 * Prohibited-product screening for Bring For Me items. It REUSES the marketplace compliance
 * engine (the bundled + owner-locked keyword rules, the same normalisation and anti-obfuscation)
 * and never replaces or weakens it. Pure: the compiled rules are passed in.
 *
 * Outcomes:
 *   rejected     - any text matches a "block" rule. Nothing is stored or shown.
 *   needs_review - a "review" rule matched, OR the item cannot be classified (category "general",
 *                  or food, which depends on halal/permitted status, or a title too short to judge).
 *                  It can sit in the cart but cannot be quoted until the owner approves it.
 *   clear        - nothing matched and the item is classified.
 * Checked: the title, the page's own category/breadcrumbs, the store category, the options text,
 * the customer's category, and the URL path + query (host names are not scanned).
 */
import { checkProduct, checkText, type CompiledRules } from "../../compliance/check.ts";

export type ScreenInput = {
  title: string;
  /** Category-like texts the store page states (breadcrumbs, product category). */
  categoryTexts: readonly string[];
  /** Category the customer picked. */
  category: string;
  options?: string | null;
  url: URL;
};

export type Screening =
  | { decision: "rejected"; category: string }
  | { decision: "needs_review"; reason: string }
  | { decision: "clear" };

const PATH_JUNK = /[/_\-+.=&?%]+/g;

export function screenItem(input: ScreenInput, rules: CompiledRules): Screening {
  const urlText = decodeSafely(input.url.pathname + " " + input.url.search).replace(PATH_JUNK, " ");
  const checks = [
    checkProduct(
      {
        title: input.title,
        category: [...input.categoryTexts, input.category].join(" > "),
        attributes: input.options ?? "",
      },
      rules,
    ),
    checkText(urlText, rules),
    // The raw (undecoded) path as well: findMatches also decodes URL text itself.
    checkText(input.url.pathname + input.url.search, rules),
  ];
  const blocked = checks.flatMap((c) => c.matches).find((m) => m.level === "block");
  if (blocked) return { decision: "rejected", category: blocked.category };
  const review = checks.flatMap((c) => c.matches).find((m) => m.level === "review");
  if (review)
    return { decision: "needs_review", reason: `keyword_review:${review.category}`.slice(0, 120) };
  if (input.category === "food") return { decision: "needs_review", reason: "food_category" };
  if (input.category === "general")
    return { decision: "needs_review", reason: "unclassified_category" };
  if (input.title.replace(/\s/g, "").length < 3)
    return { decision: "needs_review", reason: "title_too_short" };
  return { decision: "clear" };
}

function decodeSafely(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
