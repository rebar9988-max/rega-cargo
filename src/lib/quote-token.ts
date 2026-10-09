/**
 * Server-issued, signed quotes. The client never sends a price: it asks the
 * server to price a shipment, gets back an HMAC-SHA256 signed token valid for
 * 30 minutes, and books with that token. The server verifies it (constant-time
 * signature compare) and stores the price from inside the token.
 * Pricing itself is `priceShipment` from corridor.ts, unchanged.
 */
import { DESTS, MODES, ORIGINS, priceShipment, type ModeId } from "./corridor.ts";
import { dimInRange, kgInRange } from "./quote-search.ts";

export const QUOTE_TTL_MS = 30 * 60 * 1000;

export type QuoteInput = { fromId: string; toId: string; mode: ModeId; kg: number; l: number; w: number; h: number };
export type QuotePayload = QuoteInput & { v: 1; total: number; chargeable: number; exp: number };

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  try {
    const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4));
    return Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

/** Constant-time byte comparison (length is not secret: always 32 bytes). */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : NaN;
}

/** Validates client input strictly (no silent fallbacks) and prices it. */
export function priceQuote(raw: Record<string, unknown>): Omit<QuotePayload, "v" | "exp"> | null {
  const origin = ORIGINS.find((item) => item.id === raw.fromId);
  const dest = DESTS.find((item) => item.id === raw.toId);
  const mode = MODES.find((item) => item.id === raw.mode);
  const kg = num(raw.kg);
  const [l, w, h] = [num(raw.l), num(raw.w), num(raw.h)];
  if (!origin || !dest || !mode) return null;
  if (!kgInRange(kg)) return null;
  if (![l, w, h].every(dimInRange)) return null;
  const price = priceShipment({ mode, origin, dest, weightKg: kg, l, w, h });
  return { fromId: origin.id, toId: dest.id, mode: mode.id, kg, l, w, h, total: price.total, chargeable: price.chargeable };
}

export async function signQuote(priced: Omit<QuotePayload, "v" | "exp">, secret: string, now = Date.now()): Promise<{ token: string; payload: QuotePayload }> {
  const payload: QuotePayload = { v: 1, ...priced, exp: now + QUOTE_TTL_MS };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = b64url(await hmac(secret, body));
  return { token: `${body}.${sig}`, payload };
}

export async function verifyQuote(token: unknown, secret: string, now = Date.now()): Promise<QuotePayload | null> {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const given = unb64url(sig);
  if (!given) return null;
  const expected = await hmac(secret, body);
  if (!timingSafeEqual(given, expected)) return null;
  const bytes = unb64url(body);
  if (!bytes) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as QuotePayload;
    if (payload.v !== 1 || typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}
