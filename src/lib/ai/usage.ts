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
  /** Hard per-visitor cap for the UTC day. Omit in tests that only check the hourly limit. */
  perVisitorDaily?: number;
  /** Last N daily slots are kept for visitors who have not used the service today. */
  reserve?: number;
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
  const dayVisitorKey = `ipday:${input.day}:${input.visitor}`;
  const visitorCount = (await store.get(visitorKey)) ?? 0;
  if (visitorCount >= input.perVisitorHourly) return { ok: false, reason: "rate_limited" };
  const visitorDay = (await store.get(dayVisitorKey)) ?? 0;
  const perDay = input.perVisitorDaily ?? Number.POSITIVE_INFINITY;
  if (visitorDay >= perDay) return { ok: false, reason: "rate_limited" };
  const dayCount = (await store.get(dayKey)) ?? 0;
  const reserve = input.reserve ?? 0;
  const ceiling = visitorDay === 0 ? input.dailyCap : Math.max(0, input.dailyCap - reserve);
  if (dayCount >= ceiling) return { ok: false, reason: "daily_cap" };
  await store.put({
    [dayKey]: dayCount + 1,
    [visitorKey]: visitorCount + 1,
    [dayVisitorKey]: visitorDay + 1,
  });
  return { ok: true, used: dayCount + 1 };
}

export async function refundUsage(
  store: UsageStore,
  input: { day: string; hour: string; visitor: string },
): Promise<void> {
  const dayKey = `day:${input.day}`;
  const visitorKey = `ip:${input.hour}:${input.visitor}`;
  const dayVisitorKey = `ipday:${input.day}:${input.visitor}`;
  const [day, hour, dayVisitor] = await Promise.all([
    store.get(dayKey),
    store.get(visitorKey),
    store.get(dayVisitorKey),
  ]);
  await store.put({
    [dayKey]: Math.max(0, (day ?? 0) - 1),
    [visitorKey]: Math.max(0, (hour ?? 0) - 1),
    [dayVisitorKey]: Math.max(0, (dayVisitor ?? 0) - 1),
  });
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

/**
 * Rate-limit key for an address: IPv4 as is, IPv6 reduced to its /64 prefix
 * (clients rotate privacy addresses inside their /64, so a full IPv6 address
 * would give every request a fresh budget).
 */
export function ipKey(ip: string): string {
  const raw = ip.trim().toLowerCase();
  if (!raw.includes(":")) return raw;
  const [head, tail = ""] = raw.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const fill = raw.includes("::") ? Array(Math.max(0, 8 - left.length - right.length)).fill("0") : [];
  const groups = [...left, ...fill, ...right].map((g) => (g || "0").replace(/^0+(?=.)/, ""));
  return `${groups.slice(0, 4).join(":")}::/64`;
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
