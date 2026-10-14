/** Opt-in, tab-scoped order drafts. Never store contact details, consent, tokens or notes. */
export const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;
export type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type OrderDraft = { version: 1; expiresAt: number; url: string; qty: string; dest: string };
const DESTINATIONS = new Set(["ebl", "sul", "dhk", "krk", "bgw"]);

export function orderDraftKey(store: string | undefined, intent: "buy" | "ship") {
  return `rl-order-draft-v1:${encodeURIComponent((store ?? "any").slice(0, 60))}:${intent}`;
}

function safeLink(value: unknown): string | null {
  if (value === "") return "";
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.hash) return null;
    // Keep the exact product variant; reject sensitive links instead of silently rewriting them.
    if (
      [...url.searchParams.keys()].some((key) =>
        /token|secret|password|auth|session|email|phone|signature|credential/i.test(key),
      )
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export function writeOrderDraft(
  storage: DraftStorage,
  key: string,
  input: unknown,
  now = Date.now(),
) {
  try {
    const data = input as Record<string, unknown>;
    const url = safeLink(data?.url);
    const qty =
      typeof data?.qty === "string" &&
      /^\d{1,2}$/.test(data.qty) &&
      Number(data.qty) >= 1 &&
      Number(data.qty) <= 20
        ? data.qty
        : "1";
    const dest = typeof data?.dest === "string" && DESTINATIONS.has(data.dest) ? data.dest : "ebl";
    if (url === null) {
      storage.removeItem(key);
      return false;
    }
    const draft: OrderDraft = { version: 1, expiresAt: now + DRAFT_TTL_MS, url, qty, dest };
    const previous = readOrderDraft(storage, key, now);
    if (previous && previous.url === url && previous.qty === qty && previous.dest === dest) {
      draft.expiresAt = previous.expiresAt;
    }
    storage.setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function readOrderDraft(
  storage: DraftStorage,
  key: string,
  now = Date.now(),
): OrderDraft | null {
  try {
    const text = storage.getItem(key);
    if (!text) return null;
    if (text.length > 3000) {
      storage.removeItem(key);
      return null;
    }
    const value = JSON.parse(text) as OrderDraft;
    const url = safeLink(value.url);
    if (
      value.version !== 1 ||
      !Number.isFinite(value.expiresAt) ||
      value.expiresAt <= now ||
      value.expiresAt > now + DRAFT_TTL_MS ||
      url === null ||
      !/^\d{1,2}$/.test(value.qty) ||
      Number(value.qty) < 1 ||
      Number(value.qty) > 20 ||
      !DESTINATIONS.has(value.dest)
    ) {
      storage.removeItem(key);
      return null;
    }
    return { version: 1, expiresAt: value.expiresAt, url, qty: value.qty, dest: value.dest };
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      /* Storage unavailable. */
    }
    return null;
  }
}

export function clearOrderDraft(storage: DraftStorage, key: string) {
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** User reviews and sends this themselves. A mail draft is never an accepted platform order. */
export function requestEmailDraft(email: string, rows: Array<[string, string]>) {
  const body = rows
    .map(([label, value]) => `${label}: ${value.slice(0, 2000).replace(/[\r\n]/g, " ")}`)
    .join("\n");
  return `mailto:${email}?subject=${encodeURIComponent("R&L — request for review")}&body=${encodeURIComponent(body.slice(0, 6000))}`;
}
