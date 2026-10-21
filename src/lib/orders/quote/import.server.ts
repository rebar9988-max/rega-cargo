/**
 * importLink: read ONE product page and prefill what it states. Never trusted on its own:
 * the customer confirms every value, and the server only treats the prefilled price as
 * "imported" when it comes back through the signed proof.
 *
 * Safety, in order: per-user and per-IP rate limits -> one https URL only -> 10-minute cache ->
 * SSRF-safe bounded fetch (safe-fetch.ts) -> bounded extraction (extract.ts) -> prohibited-product
 * screening (the marketplace rules) -> signed proof.
 *
 * A store that blocks us (403/429/captcha/etc.) is NOT worked around: the outcome is
 * `needs_manual` and the customer types the details. A banned product is rejected, nothing about
 * it is cached or shown, and only time/category/domain are logged.
 */
import type { Sql } from "@/lib/db";
import { auditLog } from "@/lib/compliance/service.server";
import type { CompiledRules } from "@/lib/compliance/check";
import { extractProduct, type Extracted } from "../../product-link/extract.ts";
import type { SafeFetchResult } from "../../product-link/safe-fetch.ts";
import { parseImportUrl } from "../../product-link/ssrf.ts";
import { BfmError } from "./errors.ts";
import { signProof } from "./proof.ts";
import { screenItem } from "./screening.ts";
import { matchStore, type StoreRow } from "./store-match.ts";

export const CACHE_MS = 10 * 60 * 1000;

export type ImportDeps = {
  fetchPage(url: string): Promise<SafeFetchResult>;
  allow(scope: string, identity: string): Promise<boolean>;
  secret: string | null;
  now: Date;
  rules: CompiledRules;
  stores: StoreRow[];
};

type CachedData = {
  reason: string | null;
  title: string | null;
  imageUrl: string | null;
  priceMinor: number | null;
  currency: string | null;
  priceSource: "jsonld" | "opengraph" | "microdata" | null;
  unsupportedCurrency: string | null;
  priceAmbiguous: boolean;
  categoryTexts: string[];
  finalUrl: string | null;
};

const EMPTY: CachedData = {
  reason: null,
  title: null,
  imageUrl: null,
  priceMinor: null,
  currency: null,
  priceSource: null,
  unsupportedCurrency: null,
  priceAmbiguous: false,
  categoryTexts: [],
  finalUrl: null,
};

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromExtracted(x: Extracted, finalUrl: string): CachedData {
  if (x.challenge) return { ...EMPTY, reason: "challenge", finalUrl };
  return {
    reason: null,
    title: x.title,
    imageUrl: x.imageUrl,
    priceMinor: x.priceMinor,
    currency: x.currency,
    priceSource: x.priceSource,
    unsupportedCurrency: x.unsupportedCurrency,
    priceAmbiguous: x.priceAmbiguous,
    categoryTexts: x.categoryTexts,
    finalUrl,
  };
}

export type ImportResult =
  | { status: "rejected" }
  | {
      status: "imported" | "needs_manual";
      /** Why nothing (or not everything) could be read; null when complete. */
      reason: string | null;
      cached: boolean;
      store: { key: string; name: string; known: boolean };
      url: string;
      retrievedAt: string;
      fields: {
        title: string | null;
        imageUrl: string | null;
        priceMinor: number | null;
        currency: string | null;
        priceSource: string | null;
      };
      missing: ("title" | "price" | "currency")[];
      unsupportedCurrency: string | null;
      priceAmbiguous: boolean;
      /** Informational; the final screening happens again when the item is added. */
      screening: "clear" | "needs_review" | "pending";
      proof: string | null;
      mustConfirm: true;
    };

export async function importLink(
  sql: Sql,
  deps: ImportDeps,
  input: { userId: string; ip: string; url: unknown },
): Promise<ImportResult> {
  if (!(await deps.allow("bfm-import-user", input.userId))) throw new BfmError("rate");
  if (!(await deps.allow("bfm-import-ip", input.ip))) throw new BfmError("rate");

  const parsed = parseImportUrl(input.url);
  if (!parsed.ok) throw new BfmError("unsafe_url");
  const { url, host } = parsed.value;
  const href = url.href;
  const hash = await sha256Hex(href);
  const store = matchStore(host, deps.stores);

  const reject = async (category: string): Promise<ImportResult> => {
    await auditLog(sql, "bfm_import_rejected", "bring_for_me", {
      category,
      domain: host,
      at: deps.now.toISOString(),
    });
    // Remember only that this link is refused: no title, no image, no content.
    await writeCache(sql, hash, host, "rejected", {}, deps.now);
    return { status: "rejected" };
  };

  // ---- cache (10 minutes)
  const since = new Date(deps.now.getTime() - CACHE_MS).toISOString();
  const hit = await sql<{ outcome: string; data: Partial<CachedData>; fetched_at: string | Date }>`
    select outcome, data, fetched_at from bfm_import_cache
    where url_hash = ${hash} and fetched_at > ${since}`;
  let data: CachedData;
  let fetchedAt: Date;
  let cached = false;
  if (hit[0]) {
    if (hit[0].outcome === "rejected") return { status: "rejected" };
    data = { ...EMPTY, ...hit[0].data };
    fetchedAt = new Date(hit[0].fetched_at);
    cached = true;
  } else {
    const page = await deps.fetchPage(href);
    fetchedAt = deps.now;
    if (page.ok) {
      data = fromExtracted(extractProduct(page.html, new URL(page.finalUrl)), page.finalUrl);
    } else if (page.reason === "blocked_host" || page.reason === "invalid_url") {
      throw new BfmError("unsafe_url"); // never cached, never explained
    } else {
      data = {
        ...EMPTY,
        reason: page.reason === "blocked_by_store" ? "store_blocked" : page.reason,
      };
    }
  }

  // ---- screening on what we read, the URL we were given and the URL we ended on
  const screenWith = (u: URL) =>
    screenItem(
      { title: data.title ?? "", categoryTexts: data.categoryTexts, category: "fashion", url: u },
      deps.rules,
    );
  const finalUrl = data.finalUrl ? new URL(data.finalUrl) : null;
  for (const s of [
    screenWith(url),
    ...(finalUrl && finalUrl.href !== href ? [screenWith(finalUrl)] : []),
  ]) {
    if (s.decision === "rejected") return reject(s.category);
  }
  const preview = data.title
    ? ((s) => (s.decision === "needs_review" ? "needs_review" : "clear"))(screenWith(url))
    : "pending";

  if (!cached) {
    await writeCache(
      sql,
      hash,
      host,
      data.title && data.priceMinor && data.currency ? "ok" : "needs_manual",
      data,
      deps.now,
    );
  }

  const missing: ("title" | "price" | "currency")[] = [];
  if (!data.title) missing.push("title");
  if (!data.priceMinor) missing.push("price");
  if (!data.currency) missing.push("currency");

  const retrievedAt = fetchedAt.toISOString();
  let proof: string | null = null;
  if (deps.secret && (data.title || data.priceMinor)) {
    proof = await signProof(
      {
        url: href,
        host,
        title: data.title,
        imageUrl: data.imageUrl,
        priceMinor: data.priceMinor,
        currency: data.currency,
        priceSource: data.priceSource,
        retrievedAt,
        categoryTexts: data.categoryTexts.slice(0, 12),
      },
      deps.secret,
      deps.now.getTime(),
    );
  }

  return {
    status: missing.length === 0 ? "imported" : "needs_manual",
    reason: data.reason ?? (missing.length ? "incomplete" : null),
    cached,
    store,
    url: href,
    retrievedAt,
    fields: {
      title: data.title,
      imageUrl: data.imageUrl,
      priceMinor: data.priceMinor,
      currency: data.currency,
      priceSource: data.priceSource,
    },
    missing,
    unsupportedCurrency: data.unsupportedCurrency,
    priceAmbiguous: data.priceAmbiguous,
    screening: preview,
    proof,
    mustConfirm: true,
  };
}

async function writeCache(
  sql: Sql,
  hash: string,
  host: string,
  outcome: string,
  data: object,
  now: Date,
) {
  try {
    await sql`
      insert into bfm_import_cache (url_hash, host, outcome, data, fetched_at)
      values (${hash}, ${host}, ${outcome}, ${JSON.stringify(data)}::jsonb, ${now.toISOString()})
      on conflict (url_hash) do update
        set host = excluded.host, outcome = excluded.outcome, data = excluded.data, fetched_at = excluded.fetched_at`;
  } catch (err) {
    // The cache is an optimisation: a failed write must never fail the import.
    console.error("[bfm-import] cache write failed", err instanceof Error ? err.message : "failed");
  }
}
