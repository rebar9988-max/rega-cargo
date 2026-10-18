/**
 * Customer request flows (pure; shared by the server function, the form and tests).
 * - "buy":     we buy the item for the customer (link or description).
 * - "forward": the customer already bought it; we receive and ship it.
 * Links and attachment links are stored as text and never fetched by the server.
 * Attachments are links only: no file storage is enabled (see docs / progress notes).
 */
import { DESTS, MODES, ORIGINS, priceShipment } from "../corridor.ts";
import { cleanField } from "../orders/store-request.ts";
import { westernDigits } from "../numbers.ts";

export type Flow = "buy" | "forward";
export const FLOWS: readonly Flow[] = ["buy", "forward"];
export const LIMITS = {
  desc: 500,
  notes: 500,
  link: 2000,
  links: 3,
  qtyMax: 99,
  kgMax: 300,
  cmMax: 300,
  originNote: 60,
} as const;

export type RequestInput = {
  flow: Flow;
  link: string;
  description: string;
  qty: number;
  origin: string;
  originNote: string;
  dest: string;
  weightKg: number | null;
  dims: { l: number; w: number; h: number } | null;
  attachments: string[];
  notes: string;
  declared: true;
};

export type RequestError =
  | "flow"
  | "item"
  | "link"
  | "qty"
  | "origin"
  | "dest"
  | "weight"
  | "dims"
  | "attachments"
  | "declare";

/** https only, no credentials or port, at most 2000 characters. Any shop host (staff review it). */
export function cleanLink(raw: unknown): string | null | "bad" {
  if (raw == null || (typeof raw === "string" && !raw.trim())) return null;
  if (typeof raw !== "string") return "bad";
  const text = raw.trim();
  if (text.length > LIMITS.link) return "bad";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return "bad";
    return url.href.length > LIMITS.link ? "bad" : url.href;
  } catch {
    return "bad";
  }
}

function num(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const text =
    typeof raw === "number"
      ? String(raw)
      : typeof raw === "string"
        ? westernDigits(raw.trim()).replace(/[,\u066B]/, ".")
        : "";
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(text)) return Number.NaN;
  return Number(text);
}

export function validateRequest(
  raw: Record<string, unknown>,
): { ok: true; data: RequestInput } | { ok: false; error: RequestError } {
  const flow = FLOWS.find((value) => value === raw.flow);
  if (!flow) return { ok: false, error: "flow" };
  const link = cleanLink(raw.link);
  if (link === "bad") return { ok: false, error: "link" };
  const description = cleanField(raw.description, LIMITS.desc);
  // "Buy for me" needs a link or a description; "ship it" needs a description of what arrives.
  if (flow === "buy" ? !link && description.length < 3 : description.length < 3)
    return { ok: false, error: "item" };
  const qty = num(raw.qty);
  if (qty == null || !Number.isInteger(qty) || qty < 1 || qty > LIMITS.qtyMax)
    return { ok: false, error: "qty" };
  const origin =
    raw.origin === "other" ? "other" : ORIGINS.find((entry) => entry.id === raw.origin)?.id;
  if (!origin) return { ok: false, error: "origin" };
  const originNote = cleanField(raw.originNote, LIMITS.originNote);
  if (origin === "other" && originNote.length < 2) return { ok: false, error: "origin" };
  const dest = DESTS.find((entry) => entry.id === raw.dest)?.id;
  if (!dest) return { ok: false, error: "dest" };
  const weightKg = num(raw.weightKg);
  if (weightKg != null && !(weightKg > 0 && weightKg <= LIMITS.kgMax))
    return { ok: false, error: "weight" };
  const sides = [num(raw.l), num(raw.w), num(raw.h)];
  let dims: RequestInput["dims"] = null;
  if (sides.some((side) => side != null)) {
    if (!sides.every((side) => side != null && side > 0 && side <= LIMITS.cmMax))
      return { ok: false, error: "dims" };
    dims = { l: sides[0] as number, w: sides[1] as number, h: sides[2] as number };
  }
  const list = Array.isArray(raw.attachments) ? raw.attachments : [];
  if (list.length > LIMITS.links) return { ok: false, error: "attachments" };
  const attachments: string[] = [];
  for (const item of list) {
    const clean = cleanLink(item);
    if (clean === "bad") return { ok: false, error: "attachments" };
    if (clean) attachments.push(clean);
  }
  if (raw.declared !== true) return { ok: false, error: "declare" };
  return {
    ok: true,
    data: {
      flow,
      link: link ?? "",
      description,
      qty,
      origin,
      originNote: origin === "other" ? originNote : "",
      dest,
      weightKg,
      dims,
      attachments,
      notes: cleanField(raw.notes, LIMITS.notes),
      declared: true,
    },
  };
}

/**
 * Shipping-only estimate (economy rates, unchanged formula) when origin is on our
 * corridor and a weight is given. Not a quote: item price, purchase and customs
 * are not included. Returns whole euros or null.
 */
export function shippingEstimateEur(data: RequestInput): number | null {
  const origin = ORIGINS.find((entry) => entry.id === data.origin);
  const dest = DESTS.find((entry) => entry.id === data.dest);
  const mode = MODES.find((entry) => entry.id === "economy");
  if (!origin || !dest || !mode || data.weightKg == null) return null;
  const dims = data.dims ?? { l: 0, w: 0, h: 0 };
  return Math.round(priceShipment({ mode, origin, dest, weightKg: data.weightKg, ...dims }).total);
}

/** Status machine. Work only starts after the customer accepts a staff quote. */
export const STATUSES = [
  "received",
  "reviewing",
  "quoted",
  "accepted",
  "confirmed",
  "purchased",
  "in_transit",
  "arrived",
  "delivered",
  "cancelled",
] as const;
export type Status = (typeof STATUSES)[number];
export const STAFF_STATUSES = [
  "reviewing",
  "purchased",
  "in_transit",
  "arrived",
  "delivered",
  "cancelled",
] as const;
export const NEEDS_ACCEPTED: readonly string[] = [
  "purchased",
  "in_transit",
  "arrived",
  "delivered",
];

/** Can staff move a request from `from` to `to`? (Quoting and accepting have their own actions.) */
export function staffCanSet(from: string, to: string, kind: string, accepted: boolean): boolean {
  if (!(STAFF_STATUSES as readonly string[]).includes(to) || from === to) return false;
  if (from === "delivered" || from === "cancelled") return false;
  if (to === "cancelled") return true;
  if (to === "reviewing") return from === "received" || from === "quoted";
  if (!accepted) return false;
  if (to === "purchased" && kind === "forward") return false;
  const order = ["accepted", "confirmed", "purchased", "in_transit", "arrived", "delivered"];
  return order.indexOf(to) > order.indexOf(from);
}
