/**
 * Request budgets for R&L AI: a per-visitor hourly limit and a hard daily cap
 * across all visitors (keeps Workers AI inside its free daily allocation).
 * The decision logic is pure; production state lives in one Durable Object
 * (strongly consistent, so the cap is exact), tests use the in-memory store.
 */
export type UsageInput = {
  day: string;
  hour: string;
  visitor: string;
  dailyCap: number;
  perVisitorHourly: number;
};
export type UsageDecision =
  { ok: true; used: number } | { ok: false; reason: "daily_cap" | "rate_limited" };

export interface UsageStore {
  get(key: string): Promise<number | undefined>;
  put(entries: Record<string, number>): Promise<void>;
}

export async function consumeUsage(store: UsageStore, input: UsageInput): Promise<UsageDecision> {
  const dayKey = `day:${input.day}`;
  const visitorKey = `ip:${input.hour}:${input.visitor}`;
  const visitorCount = (await store.get(visitorKey)) ?? 0;
  if (visitorCount >= input.perVisitorHourly) return { ok: false, reason: "rate_limited" };
  const dayCount = (await store.get(dayKey)) ?? 0;
  if (dayCount >= input.dailyCap) return { ok: false, reason: "daily_cap" };
  await store.put({ [dayKey]: dayCount + 1, [visitorKey]: visitorCount + 1 });
  return { ok: true, used: dayCount + 1 };
}

export function memoryUsageStore(): UsageStore & { data: Map<string, number> } {
  const data = new Map<string, number>();
  return {
    data,
    async get(key) {
      return data.get(key);
    },
    async put(entries) {
      for (const [key, value] of Object.entries(entries)) data.set(key, value);
    },
  };
}

export function parseCap(value: unknown, fallback: number): number {
  const n =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : typeof value === "number"
        ? value
        : Number.NaN;
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 10_000) : fallback;
}

/** Visitor ids are salted daily hashes, so no raw IP address is ever stored. */
export async function visitorId(ip: string, day: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`rl-ai|${day}|${ip}`),
  );
  return [...new Uint8Array(digest).slice(0, 12)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
