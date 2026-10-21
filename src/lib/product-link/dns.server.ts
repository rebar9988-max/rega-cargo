/**
 * DNS-over-HTTPS resolver (Cloudflare 1.1.1.1 JSON API). Workers have no DNS API, so this is how
 * the import feature learns the addresses it must vet BEFORE connecting. The vetting itself is in
 * ssrf.ts / safe-fetch.ts; this module only returns the raw A and AAAA answers.
 *
 * It follows the CNAME chain implicitly (the resolver returns the final A/AAAA records) and keeps
 * only address records, so a CNAME to an internal name cannot smuggle in a non-address answer.
 */
export const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";
const TYPES = [
  { name: "A", code: 1 },
  { name: "AAAA", code: 28 },
] as const;

type DohAnswer = { type?: number; data?: string };
type DohBody = { Status?: number; Answer?: DohAnswer[] };

export type FetchLike = (
  input: string,
  init: { headers: Record<string, string>; signal: AbortSignal },
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

export function createDohResolver(
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
  timeoutMs = 3_000,
) {
  return async function resolve(host: string): Promise<string[]> {
    const queries = TYPES.map(async (t) => {
      const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(host)}&type=${t.name}`;
      const signal = AbortSignal.timeout(timeoutMs);
      const res = await fetchImpl(url, { headers: { accept: "application/dns-json" }, signal });
      if (!res.ok) throw new Error("doh_http");
      const body = (await res.json()) as DohBody;
      if (body.Status !== 0) return []; // NXDOMAIN / SERVFAIL: no addresses of this family
      return (body.Answer ?? [])
        .filter((a) => a.type === t.code && typeof a.data === "string")
        .map((a) => a.data as string);
    });
    // One family failing outright must not hide the other, but zero answers overall is an error
    // for the caller to treat as dns_failed.
    const settled = await Promise.allSettled(queries);
    const all = settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    if (settled.every((r) => r.status === "rejected")) throw new Error("doh_failed");
    return all.slice(0, 16);
  };
}
