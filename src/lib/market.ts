export type MarketRole = "buyer" | "seller" | "courier" | "admin" | "super_admin";
export type MarketCategory = "beauty" | "fashion" | "electronics" | "home" | "baby" | "sports";
export type Stock = "in" | "low" | "out";
export type ReviewStatus = "pending" | "approved" | "removed";
export type JobStatus =
  "requested" | "accepted" | "picked_up" | "on_the_way" | "delivered" | "cancelled";
export type JobKind = "delivery" | "transport";

export const JOB_FLOW = ["requested", "accepted", "picked_up", "on_the_way", "delivered"] as const;

export class MarketError extends Error {
  code: "invalid" | "rate" | "forbidden" | "notfound" | "prohibited";
  constructor(code: "invalid" | "rate" | "forbidden" | "notfound" | "prohibited") {
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

/** HTTPS hosts allowed for product images. Local /bazaar/ paths are always allowed. */
export const IMAGE_HOSTS: readonly string[] = [];

export function cleanContact(value: unknown) {
  const text = cleanText(value, 200);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new MarketError("invalid");
  }
  if (url.protocol !== "https:" && url.protocol !== "tel:" && url.protocol !== "mailto:") {
    throw new MarketError("invalid");
  }
  if (url.protocol === "https:" && !url.hostname) throw new MarketError("invalid");
  return text;
}

/** Link only when the contact is https, tel or mailto. Everything else is plain text. */
export function contactHref(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "tel:" || url.protocol === "mailto:")
      return value;
  } catch {
    /* plain text */
  }
  return null;
}

export function cleanImage(value: unknown) {
  if (value == null || value === "") return null;
  const text = cleanText(value, 300);
  if (text.includes("..") || /\s/.test(text) || text.includes("\\"))
    throw new MarketError("invalid");
  if (text.startsWith("/bazaar/") && !text.includes("//")) return text;
  if (text.startsWith("https://")) {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      throw new MarketError("invalid");
    }
    if (url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname)) return url.href;
  }
  throw new MarketError("invalid");
}

/** City or area only — the part before the first comma — for open courier jobs. */
export function areaOnly(address: string) {
  const part = address.split(",")[0]?.trim() || address.trim();
  return part.slice(0, 60);
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

export function rankOffers<T extends { price: number; shipping: number; stock: Stock }>(
  offers: T[],
) {
  return offers
    .map((offer) => ({ ...offer, total: offerTotal(offer.price, offer.shipping) }))
    .sort(
      (a, b) =>
        Number(a.stock === "out") - Number(b.stock === "out") ||
        a.total - b.total ||
        a.price - b.price,
    );
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
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `${base || "item"}-${suffix}`;
}

export function canSetJobStatus(from: JobStatus, to: JobStatus, who: "requester" | "courier") {
  if (from === to) return false;
  if (to === "cancelled")
    return who === "requester" && from !== "delivered" && from !== "cancelled";
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
