/**
 * Server-side validation for /stores/request (buy / ship requests).
 * Pure functions, shared by the server function and unit tests. Only the
 * minimal fields below are ever stored; nothing else from the client is kept.
 */
import { DESTS } from "../corridor.ts";
import { westernDigits } from "../numbers.ts";
import { GOODS, STORES, type StoreEntry } from "../stores.ts";

export const URL_MAX = 2000;
export const TEXT_MAX = { size: 40, color: 40, notes: 500 } as const;
export const QTY_MIN = 1;
export const QTY_MAX = 20;
export const E164 = /^\+[1-9]\d{7,14}$/;

export type StoreRequest = {
  intent: "buy" | "ship";
  storeId: string | null;
  item: string | null;
  url: string;
  size: string;
  color: string;
  qty: number;
  dest: string;
  notes: string;
  phone: string;
};

export type StoreRequestError = "url" | "host" | "qty" | "dest" | "contact" | "invalid";

/** NFKC, strip control/bidi-override characters, collapse spaces, trim, cap. */
export function cleanField(value: unknown, max: number): string {
  if (value == null) return "";
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value)
    .normalize("NFKC")
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Phone / WhatsApp number in E.164 (spaces, dashes, dots and brackets are ignored; 00 → +). */
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let raw = value.normalize("NFKC").replace(/[\s\-().]/g, "");
  if (raw.startsWith("00")) raw = `+${raw.slice(2)}`;
  return E164.test(raw) ? raw : null;
}

function hostMatches(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Product links: https only, no user:pass@, no explicit port, at most 2000
 * characters, and the hostname must be the selected store's domain or one of
 * its subdomains (or, with no store selected, a domain from the store list).
 * The link is stored as text and never fetched by the server.
 */
export function checkProductUrl(raw: unknown, store: StoreEntry | undefined): { ok: true; url: string } | { ok: false; error: "url" | "host" } {
  if (typeof raw !== "string") return { ok: false, error: "url" };
  const text = raw.trim();
  if (!text || text.length > URL_MAX) return { ok: false, error: "url" };
  let parsed: URL;
  try {
    parsed = new URL(text);
  } catch {
    return { ok: false, error: "url" };
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return { ok: false, error: "url" };
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const allowed = store ? [store.host] : STORES.map((entry) => entry.host);
  if (!allowed.some((domain) => hostMatches(host, domain))) return { ok: false, error: "host" };
  const url = parsed.href;
  return url.length > URL_MAX ? { ok: false, error: "url" } : { ok: true, url };
}

export function validateStoreRequest(
  raw: Record<string, unknown>,
  sessionPhone: string | null | undefined,
  { requireContact = true }: { requireContact?: boolean } = {},
): { ok: true; data: StoreRequest } | { ok: false; error: StoreRequestError } {
  const intent = raw.intent === "ship" ? "ship" : raw.intent === "buy" || raw.intent == null ? "buy" : null;
  if (!intent) return { ok: false, error: "invalid" };
  const good = typeof raw.item === "string" ? GOODS.find((entry) => entry.id === raw.item) : undefined;
  if (raw.item != null && raw.item !== "" && !good) return { ok: false, error: "invalid" };
  const picked = typeof raw.storeId === "string" ? STORES.find((entry) => entry.id === raw.storeId) : undefined;
  if (raw.storeId != null && raw.storeId !== "" && !picked) return { ok: false, error: "invalid" };
  const store = picked ?? (good ? STORES.find((entry) => entry.id === good.storeId) : undefined);

  let url = "";
  if (typeof raw.url === "string" && raw.url.trim()) {
    const checked = checkProductUrl(raw.url, store);
    if (!checked.ok) return { ok: false, error: checked.error };
    url = checked.url;
  } else if (!good) {
    return { ok: false, error: "url" };
  }

  const qtyText = typeof raw.qty === "number" ? String(raw.qty) : typeof raw.qty === "string" ? westernDigits(raw.qty.trim()) : "";
  if (!/^\d{1,2}$/.test(qtyText)) return { ok: false, error: "qty" };
  const qty = Number(qtyText);
  if (!Number.isInteger(qty) || qty < QTY_MIN || qty > QTY_MAX) return { ok: false, error: "qty" };

  const dest = DESTS.find((entry) => entry.id === raw.dest)?.id;
  if (!dest) return { ok: false, error: "dest" };

  const phone = normalizePhone(sessionPhone ?? "") ?? normalizePhone(raw.phone) ?? "";
  if (!phone && requireContact) return { ok: false, error: "contact" };

  return {
    ok: true,
    data: {
      intent,
      storeId: store?.id ?? null,
      item: good?.id ?? null,
      url,
      size: cleanField(raw.size, TEXT_MAX.size),
      color: cleanField(raw.color, TEXT_MAX.color),
      qty,
      dest,
      notes: cleanField(raw.notes, TEXT_MAX.notes),
      phone,
    },
  };
}
