export type MarketRole = "buyer" | "seller" | "courier" | "admin";
export type MarketCategory = "beauty" | "fashion" | "electronics" | "home" | "baby" | "sports";
export type Stock = "in" | "low" | "out";
export type ReviewStatus = "pending" | "approved" | "removed";
export type JobStatus = "requested" | "accepted" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
export type JobKind = "delivery" | "transport";

export const JOB_FLOW = ["requested", "accepted", "picked_up", "on_the_way", "delivered"] as const;

export class MarketError extends Error {
  code: "invalid" | "rate" | "forbidden" | "notfound";
  constructor(code: "invalid" | "rate" | "forbidden" | "notfound") {
    super(code);
    this.name = "MarketError";
    this.code = code;
  }
}

export function cleanText(value: unknown, max: number, min = 1) {
  if (typeof value !== "string") throw new MarketError("invalid");
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < min || text.length > max) throw new MarketError("invalid");
  return text;
}

export function cleanOptional(value: unknown, max: number) {
  if (value == null || value === "") return "";
  return cleanText(value, max, 0);
}

export function cleanMoney(value: unknown, max: number, allowZero: boolean) {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isInteger(n) || n > max || n < (allowZero ? 0 : 1)) throw new MarketError("invalid");
  return n;
}

export function cleanContact(value: unknown) {
  const text = cleanText(value, 200);
  if (text.includes("://") && !text.startsWith("https://")) throw new MarketError("invalid");
  return text;
}

export function cleanImage(value: unknown) {
  if (value == null || value === "") return null;
  const text = cleanText(value, 200);
  if (text.startsWith("/bazaar/") || text.startsWith("https://")) return text;
  throw new MarketError("invalid");
}

export function cleanStock(value: unknown): Stock {
  if (value === "in" || value === "low" || value === "out") return value;
  throw new MarketError("invalid");
}

export function likePattern(query: string) {
  return `%${query.replace(/[%_\\]/g, "\\$&")}%`;
}

export function offerTotal(price: number, shipping: number) {
  return price + shipping;
}

export function rankOffers<T extends { price: number; shipping: number; stock: Stock }>(offers: T[]) {
  return offers
    .map((offer) => ({ ...offer, total: offerTotal(offer.price, offer.shipping) }))
    .sort((a, b) => Number(a.stock === "out") - Number(b.stock === "out") || a.total - b.total || a.price - b.price);
}

export function cheapest<T extends { total: number; stock: Stock }>(offers: T[]) {
  return offers.find((offer) => offer.stock !== "out") ?? null;
}

export function slugify(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "item"}-${suffix}`;
}

export function canSetJobStatus(from: JobStatus, to: JobStatus, who: "requester" | "courier") {
  if (from === to) return false;
  if (to === "cancelled") return who === "requester" && from !== "delivered" && from !== "cancelled";
  if (who !== "courier") return false;
  const current = JOB_FLOW.indexOf(from as (typeof JOB_FLOW)[number]);
  const next = JOB_FLOW.indexOf(to as (typeof JOB_FLOW)[number]);
  return current >= 1 && next === current + 1;
}

export function pageWindow(page: unknown) {
  const n = typeof page === "number" ? page : Number(page ?? 1);
  if (!Number.isInteger(n) || n < 1 || n > 100) return 1;
  return n;
}
