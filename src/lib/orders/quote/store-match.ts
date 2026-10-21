/** Matches a host to the small supported-stores list; any other public host is an "unknown store". */
export type StoreRow = { key: string; name: string; domains: readonly string[]; enabled: boolean };
export type StoreMatch = { key: string; name: string; known: boolean };

export function matchStore(host: string, stores: readonly StoreRow[]): StoreMatch {
  const h = host.toLowerCase();
  for (const s of stores) {
    if (!s.enabled) continue;
    if (s.domains.some((d) => h === d || h.endsWith(`.${d}`)))
      return { key: s.key, name: s.name, known: true };
  }
  const bare = h.replace(/^www\./, "");
  return { key: bare.slice(0, 80), name: bare.slice(0, 80), known: false };
}
