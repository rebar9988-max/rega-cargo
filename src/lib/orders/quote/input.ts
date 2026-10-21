/** Strict parsing of customer-typed numbers. Exact decimals, no floats, nothing guessed. */

/**
 * "0.5" kg -> 500 g (scale 3), "12.5" cm -> 125 mm (scale 1). Empty means "not given" (null).
 * Anything else that is not a plain non-negative decimal inside [min, max] is `undefined`.
 */
export function parseScaled(
  raw: unknown,
  decimals: number,
  min: number,
  max: number,
): number | null | undefined {
  if (raw === undefined || raw === null) return null;
  let text: string;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || /e/i.test(String(raw))) return undefined;
    text = String(raw);
  } else if (typeof raw === "string") {
    text = raw.trim().replace(",", ".");
    if (text === "") return null;
  } else {
    return undefined;
  }
  const m = /^(\d{1,7})(?:\.(\d{1,9}))?$/.exec(text);
  if (!m) return undefined;
  const frac = m[2] ?? "";
  if (frac.length > decimals && /[1-9]/.test(frac.slice(decimals))) return undefined; // no silent rounding
  const scaled =
    Number(m[1]) * 10 ** decimals + Number(frac.slice(0, decimals).padEnd(decimals, "0"));
  if (!Number.isSafeInteger(scaled) || scaled < min || scaled > max) return undefined;
  return scaled;
}
