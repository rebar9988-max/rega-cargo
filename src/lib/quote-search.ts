import { DESTS, ORIGINS } from "./corridor.ts";

/** Accepted input ranges for the calculator, its URL parameters and the signed-quote server. */
export const QUOTE_LIMITS = {
  kg: { min: 0.1, max: 70 },
  dim: { min: 1, max: 200 },
  pieces: { min: 1, max: 50 },
} as const;

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string" || value.length > 20) return NaN;
  return Number(value.trim().replace(",", "."));
}

/**
 * `kg` travels as a plain number (`?kg=3.2`). Old links carried it as a
 * JSON-quoted string (`?kg=%223.2%22`), which the router decodes to "3.2", so
 * both forms are accepted. NaN, negative, zero and out-of-range values
 * (outside 0.1–70 kg) are dropped and the calculator uses its default box.
 */
export function parseKg(value: unknown): number | undefined {
  const n = toNumber(value);
  if (!Number.isFinite(n) || n < QUOTE_LIMITS.kg.min || n > QUOTE_LIMITS.kg.max) return undefined;
  return Math.round(n * 100) / 100;
}

/** `from` must be a collection-city id and `to` a destination id; anything else is dropped. */
export function parseFrom(value: unknown): string | undefined {
  return typeof value === "string" ? ORIGINS.find((item) => item.id === value)?.id : undefined;
}

export function parseTo(value: unknown): string | undefined {
  return typeof value === "string" ? DESTS.find((item) => item.id === value)?.id : undefined;
}

export function kgInRange(n: number) {
  return Number.isFinite(n) && n >= QUOTE_LIMITS.kg.min && n <= QUOTE_LIMITS.kg.max;
}

export function dimInRange(n: number) {
  return Number.isFinite(n) && n >= QUOTE_LIMITS.dim.min && n <= QUOTE_LIMITS.dim.max;
}
