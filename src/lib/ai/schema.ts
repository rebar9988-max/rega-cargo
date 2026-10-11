import { z } from "zod";
import { STORES } from "../stores.ts";

/**
 * The only shape R&L AI output may take. Model text is untrusted: it is
 * parsed as JSON, validated, stripped of markup/URLs/prices and length-capped
 * before it reaches the browser (which renders it as plain text).
 */
export const AI_CATEGORIES = [
  "electronics",
  "beauty",
  "fashion",
  "home",
  "baby",
  "sports",
  "general",
] as const;
export type AiCategory = (typeof AI_CATEGORIES)[number];
export const AI_CONFIDENCE = ["low", "medium", "high"] as const;

const LIMITS = { short: 80, text: 200, items: 8 } as const;

export const identifyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "category",
    "brand",
    "model",
    "visibleText",
    "attributes",
    "confidence",
    "counterfeitSignals",
  ],
  properties: {
    category: { type: "string", enum: [...AI_CATEGORIES] },
    brand: { type: ["string", "null"] },
    model: { type: ["string", "null"] },
    visibleText: { type: "array", items: { type: "string" }, maxItems: LIMITS.items },
    attributes: { type: "array", items: { type: "string" }, maxItems: LIMITS.items },
    confidence: { type: "string", enum: [...AI_CONFIDENCE] },
    counterfeitSignals: { type: "array", items: { type: "string" }, maxItems: 4 },
  },
} as const;

const URL_RE =
  /\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|de|net|org|shop|store|io|co|uk|tr|iq)\b\S*/gi;
// Store names and shop domains from the store list: the UI promises the AI never names a shop.
const STORE_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${[...new Set(STORES.flatMap((store) => [store.name, store.host]))]
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})(?![\\p{L}\\p{N}])`,
  "giu",
);
const PRICE_RE = /(?:[€$£¥]\s?\d[\d.,]*|\d[\d.,]*\s?(?:€|eur|euro|usd|\$|iqd|dinar|tl|try|£))/gi;

/** Plain text only: no tags, no control chars, no links, no prices. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, " ")
    .replace(URL_RE, " ")
    .replace(PRICE_RE, " ")
    .replace(STORE_RE, " ")
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function cleanList(values: unknown, max: number, itemMax: number): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  for (const value of values) {
    const text = cleanText(value, itemMax);
    if (text && !out.includes(text)) out.push(text);
    if (out.length >= max) break;
  }
  return out;
}

const rawSchema = z.object({
  category: z.string(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  visibleText: z.array(z.unknown()).optional(),
  attributes: z.array(z.unknown()).optional(),
  confidence: z.string(),
  counterfeitSignals: z.array(z.unknown()).optional(),
});

export type IdentifyResult = {
  category: AiCategory;
  brand: string | null;
  model: string | null;
  visibleText: string[];
  attributes: string[];
  confidence: (typeof AI_CONFIDENCE)[number];
  counterfeitSignals: string[];
};

function firstJsonObject(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) return undefined;
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return undefined;
    }
  }
}

/** Returns a validated, sanitised result or null if the output is unusable. */
export function parseIdentifyOutput(content: unknown): IdentifyResult | null {
  const value = typeof content === "string" ? firstJsonObject(content) : content;
  const parsed = rawSchema.safeParse(value);
  if (!parsed.success) return null;
  const data = parsed.data;
  const category = (AI_CATEGORIES as readonly string[]).includes(data.category)
    ? (data.category as AiCategory)
    : "general";
  const confidence = (AI_CONFIDENCE as readonly string[]).includes(data.confidence)
    ? (data.confidence as IdentifyResult["confidence"])
    : "low";
  const brand = cleanText(data.brand ?? "", LIMITS.short) || null;
  const model = cleanText(data.model ?? "", LIMITS.short) || null;
  return {
    category,
    brand,
    model,
    visibleText: cleanList(data.visibleText, LIMITS.items, LIMITS.short),
    attributes: cleanList(data.attributes, LIMITS.items, LIMITS.short),
    confidence,
    counterfeitSignals: cleanList(data.counterfeitSignals, 4, LIMITS.text),
  };
}

/** Pulls the assistant text out of an OpenAI-style or legacy Workers AI reply. */
export function extractModelContent(reply: unknown): unknown {
  if (!reply || typeof reply !== "object") return reply;
  const r = reply as { response?: unknown; choices?: unknown };
  const choice: unknown = Array.isArray(r.choices) ? r.choices[0] : undefined;
  const message = choice && typeof choice === "object" && "message" in choice
    ? choice.message
    : undefined;
  if (message && typeof message === "object" && "content" in message)
    return message.content;
  if ("response" in r) return r.response;
  return undefined;
}
