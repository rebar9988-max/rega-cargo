/**
 * SSRF guards for the link-import feature. Pure (no network, no framework), so every rule here
 * is unit-tested without a server.
 *
 * Principles:
 *  - FAIL CLOSED. An address is allowed only when it is positively recognised as public:
 *    IPv4 outside every reserved block, IPv6 inside global unicast 2000::/3 minus the special
 *    blocks. Anything we cannot parse is refused.
 *  - A host name is refused when ANY of its resolved addresses is not public, so a mixed
 *    public/private answer (DNS rebinding trick) cannot slip through.
 *  - Only one `https://` URL on the default port, no credentials, no IP literals, no internal
 *    suffixes. The check is repeated for every redirect hop by the caller.
 */

export const IMPORT_URL_MAX = 2000;

export type ImportUrlError =
  | "url" // not a string / empty / too long / does not parse
  | "multiple" // whitespace inside: more than one URL, or a pasted sentence
  | "scheme" // anything but https
  | "credentials" // user:pass@host
  | "port" // anything but the default port
  | "host"; // IP literal, internal name, single label, bad characters

const HOST_LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const BLOCKED_SUFFIXES = [
  ".localhost",
  ".local",
  ".localdomain",
  ".internal",
  ".intranet",
  ".private",
  ".corp",
  ".home",
  ".lan",
  ".home.arpa",
  ".onion",
  ".test",
  ".invalid",
  ".example",
  ".arpa",
];

/** Host-name rules only (no DNS). Returns the normalised host or null. */
export function normalizeHost(rawHost: string): string | null {
  if (rawHost.startsWith("[") || rawHost.includes(":")) return null; // IPv6 literal
  const host = rawHost.toLowerCase().replace(/\.$/, "");
  if (!host || host.length > 253) return null;
  const labels = host.split(".");
  if (labels.length < 2) return null; // "localhost", "intranet", "redis"
  if (!labels.every((l) => HOST_LABEL.test(l))) return null;
  // A real TLD is never all digits: this also rejects every spelling of an IPv4 literal.
  if (/^[0-9]+$/.test(labels[labels.length - 1]!)) return null;
  if (BLOCKED_SUFFIXES.some((s) => host === s.slice(1) || host.endsWith(s))) return null;
  return host;
}

export type ParsedImportUrl = { url: URL; host: string };

/** Exactly one absolute https URL. Does not resolve anything. */
export function parseImportUrl(
  raw: unknown,
): { ok: true; value: ParsedImportUrl } | { ok: false; error: ImportUrlError } {
  if (typeof raw !== "string") return { ok: false, error: "url" };
  const text = raw.trim();
  if (!text || text.length > IMPORT_URL_MAX) return { ok: false, error: "url" };
  if (/[\s\u0000-\u001f\u007f]/.test(text)) return { ok: false, error: "multiple" };
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return { ok: false, error: "url" };
  }
  if (url.protocol !== "https:") return { ok: false, error: "scheme" };
  if (url.username || url.password) return { ok: false, error: "credentials" };
  if (url.port) return { ok: false, error: "port" };
  const host = normalizeHost(url.hostname);
  if (!host) return { ok: false, error: "host" };
  url.hash = "";
  return { ok: true, value: { url, host } };
}

/** The next hop of a redirect, validated with the very same rules (relative links allowed). */
export function parseRedirectTarget(
  base: URL,
  location: string,
): { ok: true; value: ParsedImportUrl } | { ok: false; error: ImportUrlError } {
  if (typeof location !== "string" || !location || location.length > IMPORT_URL_MAX) {
    return { ok: false, error: "url" };
  }
  // A Location header never contains whitespace; resolving it would silently %-encode it.
  if (/[\s\u0000-\u001f\u007f]/.test(location.trim())) return { ok: false, error: "multiple" };
  let next: URL;
  try {
    next = new URL(location.trim(), base);
  } catch {
    return { ok: false, error: "url" };
  }
  return parseImportUrl(next.href);
}

// ---------------------------------------------------------------- IP addresses

export function parseIPv4(text: string): number[] | null {
  const parts = text.split(".");
  if (parts.length !== 4) return null;
  const out: number[] = [];
  for (const p of parts) {
    if (!/^(0|[1-9][0-9]{0,2})$/.test(p)) return null; // no leading zeros (octal tricks)
    const n = Number(p);
    if (n > 255) return null;
    out.push(n);
  }
  return out;
}

/** Sixteen bytes, or null. Accepts `::` compression and an embedded IPv4 tail; no zone ids. */
export function parseIPv6(text: string): number[] | null {
  let s = text.trim().toLowerCase();
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  if (!s || s.includes("%") || !/^[0-9a-f:.]+$/.test(s)) return null;
  let tail: number[] = [];
  const lastColon = s.lastIndexOf(":");
  if (lastColon === -1) return null;
  if (s.slice(lastColon + 1).includes(".")) {
    const v4 = parseIPv4(s.slice(lastColon + 1));
    if (!v4) return null;
    tail = v4;
    s = `${s.slice(0, lastColon + 1)}0:0`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const toGroups = (part: string): number[] | null => {
    if (part === "") return [];
    const groups: number[] = [];
    for (const g of part.split(":")) {
      if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
      groups.push(parseInt(g, 16));
    }
    return groups;
  };
  const head = toGroups(halves[0]!);
  const rest = halves.length === 2 ? toGroups(halves[1]!) : [];
  if (!head || !rest) return null;
  let groups: number[];
  if (halves.length === 2) {
    const fill = 8 - head.length - rest.length;
    if (fill < 1) return null;
    groups = [...head, ...Array<number>(fill).fill(0), ...rest];
  } else {
    groups = head;
  }
  if (groups.length !== 8) return null;
  if (tail.length) {
    groups[6] = (tail[0]! << 8) | tail[1]!;
    groups[7] = (tail[2]! << 8) | tail[3]!;
  }
  const bytes: number[] = [];
  for (const g of groups) bytes.push(g >> 8, g & 255);
  return bytes;
}

function v4Public(b: readonly number[]): boolean {
  const [a, c, d] = [b[0]!, b[1]!, b[2]!];
  if (a === 0) return false; // 0.0.0.0/8 "this network"
  if (a === 10) return false; // private
  if (a === 100 && c >= 64 && c <= 127) return false; // 100.64/10 carrier-grade NAT
  if (a === 127) return false; // loopback
  if (a === 169 && c === 254) return false; // link-local, cloud metadata
  if (a === 172 && c >= 16 && c <= 31) return false; // private
  if (a === 192 && c === 0 && d === 0) return false; // 192.0.0.0/24 IETF protocol
  if (a === 192 && c === 0 && d === 2) return false; // TEST-NET-1
  if (a === 192 && c === 88 && d === 99) return false; // 6to4 relay (deprecated)
  if (a === 192 && c === 168) return false; // private
  if (a === 198 && (c === 18 || c === 19)) return false; // benchmarking
  if (a === 198 && c === 51 && d === 100) return false; // TEST-NET-2
  if (a === 203 && c === 0 && d === 113) return false; // TEST-NET-3
  if (a >= 224) return false; // multicast, reserved, broadcast
  return true;
}

function v6Public(b: readonly number[]): boolean {
  const g = (i: number) => (b[i * 2]! << 8) | b[i * 2 + 1]!;
  // Only global unicast 2000::/3 can ever be public. This alone refuses ::, ::1, ::ffff:a.b.c.d
  // (IPv4-mapped), IPv4-compatible, NAT64 64:ff9b::/96, fc00::/7, fe80::/10, fec0::/10, ff00::/8.
  if ((b[0]! & 0xe0) !== 0x20) return false;
  const g0 = g(0);
  const g1 = g(1);
  if (g0 === 0x2001 && g1 < 0x0200) return false; // 2001::/23 IETF: Teredo, ORCHID, benchmarking
  if (g0 === 0x2001 && g1 === 0x0db8) return false; // documentation
  if (g0 === 0x2002) return false; // 6to4: embeds an arbitrary IPv4 address
  if (g0 === 0x3fff && g1 < 0x1000) return false; // 3fff::/20 documentation
  return true;
}

/** True only for an address that is positively recognised as public. */
export function isPublicIp(ip: string): boolean {
  if (typeof ip !== "string") return false;
  if (ip.includes(":")) {
    const b = parseIPv6(ip);
    return b !== null && v6Public(b);
  }
  const b = parseIPv4(ip);
  return b !== null && v4Public(b);
}

/**
 * DNS answers for one host: every address must be public (and there must be at least one),
 * otherwise the host is refused as a whole.
 */
export function onlyPublicAddresses(
  ips: readonly string[],
): { ok: true; ips: string[] } | { ok: false } {
  if (!ips.length) return { ok: false };
  const unique = [...new Set(ips)];
  if (!unique.every(isPublicIp)) return { ok: false };
  return { ok: true, ips: unique };
}

// ---------------------------------------------------------------- image URLs

/**
 * An image URL we are willing to store and later show. It is never fetched by the server, but
 * it must still be a plain https URL on a public-looking host: no credentials, no ports, no
 * data:/javascript: schemes, no IP literals, bounded length.
 */
export function safeImageUrl(raw: unknown, base?: URL): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || text.length > IMPORT_URL_MAX || /[\s\u0000-\u001f\u007f]/.test(text)) return null;
  let url: URL;
  try {
    url = base ? new URL(text, base) : new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  if (!normalizeHost(url.hostname)) return null;
  url.hash = "";
  return url.href;
}
