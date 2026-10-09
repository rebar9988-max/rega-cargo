/**
 * `kg` travels as a plain number (`?kg=3.2`). Old links carried it as a
 * JSON-quoted string (`?kg=%223.2%22`), which the router decodes to "3.2", so
 * both forms are accepted. Anything that is not a positive, sane weight is dropped.
 */
export function parseKg(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim().replace(",", ".")) : NaN;
  if (!Number.isFinite(n) || n <= 0 || n > 100000) return undefined;
  return Math.round(n * 100) / 100;
}
