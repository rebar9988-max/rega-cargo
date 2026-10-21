/**
 * Signed "import proof": the server's record of what it actually read from a store page.
 * The client sends the proof back with the cart item; the server trusts the price, currency and
 * title only if they match the proof, and otherwise stores the item as customer-typed (manual).
 * Anything the client sends on its own is never treated as imported data.
 *
 * HMAC-SHA256 over a domain-separated body (so a quote token from quote-token.ts can never be
 * replayed as a proof), canonical signature encoding only, constant-time compare, short expiry.
 */
import { timingSafeEqual } from "../../quote-token.ts";

export const PROOF_TTL_MS = 30 * 60 * 1000;
const DOMAIN = "bfm-import-proof-v1.";
const enc = new TextEncoder();

export type ProofPayload = {
  v: 1;
  /** Canonical source URL (https, no fragment). */
  url: string;
  host: string;
  title: string | null;
  imageUrl: string | null;
  priceMinor: number | null;
  currency: string | null;
  priceSource: "jsonld" | "opengraph" | "microdata" | null;
  /** Category-like texts the page stated, so screening still sees them when the item is added. */
  categoryTexts: string[];
  /** ISO time the page was read. */
  retrievedAt: string;
  exp: number;
};

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function unb64url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  try {
    const bin = atob(
      text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4),
    );
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}
async function mac(secret: string, body: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(DOMAIN + body)));
}

export async function signProof(
  payload: Omit<ProofPayload, "v" | "exp">,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const full: ProofPayload = { v: 1, ...payload, exp: now + PROOF_TTL_MS };
  const body = b64url(enc.encode(JSON.stringify(full)));
  return `${body}.${b64url(await mac(secret, body))}`;
}

export async function verifyProof(
  token: unknown,
  secret: string,
  now = Date.now(),
): Promise<ProofPayload | null> {
  if (typeof token !== "string" || token.length > 6000) return null;
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  const given = unb64url(sig);
  if (!given || b64url(given) !== sig) return null; // canonical spelling only
  if (!timingSafeEqual(given, await mac(secret, body))) return null;
  const bytes = unb64url(body);
  if (!bytes) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(bytes)) as ProofPayload;
    if (p.v !== 1 || typeof p.exp !== "number" || p.exp < now || typeof p.url !== "string")
      return null;
    return p;
  } catch {
    return null;
  }
}
