/**
 * Product metadata extraction from the HTML of ONE page. Pure and bounded: no DOM, no network,
 * no script execution, hard caps on every scan. Order of trust:
 *   1. JSON-LD  (schema.org Product / Offer)
 *   2. OpenGraph + product:* meta tags
 *   3. schema.org microdata (itemprop)
 * A field is only filled from a source that states it unambiguously; otherwise it stays null and
 * the caller asks the customer to type it. Prices are parsed as exact decimal strings into minor
 * units (cents): no floating point ever touches money.
 */
import { CURRENCIES, LIMITS, type Currency } from "../orders/quote/constants.ts";
import { safeImageUrl } from "./ssrf.ts";

export type ExtractSource = "jsonld" | "opengraph" | "microdata";

export type Extracted = {
  title: string | null;
  titleSource: ExtractSource | null;
  imageUrl: string | null;
  priceMinor: number | null;
  currency: Currency | null;
  priceSource: ExtractSource | null;
  /** Raw currency code the page stated when it is not one we support. */
  unsupportedCurrency: string | null;
  priceAmbiguous: boolean;
  /** Category-like texts the page states (breadcrumbs, category fields), for the product screen. */
  categoryTexts: string[];
  /** Page looks like a bot challenge / captcha / access-denied wall. */
  challenge: boolean;
};

const MAX_HTML_SCAN = 1_048_576;
const MAX_JSONLD_BLOCKS = 10;
const MAX_JSONLD_BYTES = 262_144;
const MAX_JSON_NODES = 3_000;
const MAX_META_TAGS = 300;
const MAX_TEXT = 300;
const MAX_CATEGORY_TEXTS = 12;

// --------------------------------------------------------------------------------- text helpers

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (m, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1]?.toLowerCase() === "x" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (
        !Number.isFinite(code) ||
        code < 0x20 ||
        code > 0x10ffff ||
        (code >= 0xd800 && code <= 0xdfff)
      )
        return " ";
      return String.fromCodePoint(code);
    }
    return NAMED[body.toLowerCase()] ?? m;
  });
}

/** Plain, short, single-line text; never HTML. */
export function cleanText(value: unknown, max = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  const text = decodeEntities(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/[\p{Cc}\u200b-\u200f\u2028-\u202e\ufeff]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max).trimEnd() : text;
}

// ------------------------------------------------------------------------------------- money

/**
 * "19.99", "19,99", "1.299,00", "1,299.00", "€ 19,90", 19.99 -> minor units (cents), or null when
 * the text is empty, ambiguous ("1.299"), has more than two decimals, or is out of range.
 */
export function parsePriceToMinor(raw: unknown): number | null {
  let text: string;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return null;
    text = String(raw);
    if (/e/i.test(text)) return null;
  } else if (typeof raw === "string") {
    text = raw;
  } else {
    return null;
  }
  // Only decoration (currency symbols, letters such as "EUR", spaces) may surround the number.
  // Signs, exponents, ranges ("19,99 to 29,99") and anything else inside refuse the whole value.
  text = text.replace(/^[\p{L}\p{Sc}\s*]+|[\p{L}\p{Sc}\s*]+$/gu, "");
  if (/^\d{1,3}([ \u00a0\u202f]\d{3})+([.,]\d{1,2})?$/.test(text)) {
    text = text.replace(/[ \u00a0\u202f]/g, "");
  }
  if (!/^(\d|\d[\d.,]*\d)$/.test(text)) return null;
  const lastDot = text.lastIndexOf(".");
  const lastComma = text.lastIndexOf(",");
  let intPart: string;
  let fracPart = "";
  if (lastDot !== -1 && lastComma !== -1) {
    const decimalAt = Math.max(lastDot, lastComma);
    const thousands = decimalAt === lastDot ? "," : ".";
    intPart = text.slice(0, decimalAt);
    fracPart = text.slice(decimalAt + 1);
    if (
      intPart
        .split(thousands)
        .slice(1)
        .some((g) => g.length !== 3)
    )
      return null;
    if (intPart.includes(decimalAt === lastDot ? "." : ",")) return null;
    intPart = intPart.split(thousands).join("");
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? "." : ",";
    const parts = text.split(sep);
    if (parts.length > 2) {
      // 1.299.000 -> thousands only
      if (parts.slice(1).some((g) => g.length !== 3)) return null;
      intPart = parts.join("");
    } else {
      const [i, f] = parts as [string, string];
      if (f.length === 3) return null; // "1.299": thousands or 1.299? Do not guess.
      if (f.length > 2) return null;
      intPart = i;
      fracPart = f;
    }
  } else {
    intPart = text;
  }
  if (!/^\d{1,12}$/.test(intPart) || !/^\d{0,2}$/.test(fracPart)) return null;
  const minor = Number(intPart) * 100 + Number(fracPart.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > LIMITS.maxPriceMinor) return null;
  return minor;
}

function currencyOf(raw: unknown): { currency: Currency | null; unsupported: string | null } {
  if (typeof raw !== "string") return { currency: null, unsupported: null };
  const code = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return { currency: null, unsupported: null };
  return (CURRENCIES as readonly string[]).includes(code)
    ? { currency: code as Currency, unsupported: null }
    : { currency: null, unsupported: code };
}

// ------------------------------------------------------------------------------------ tags

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(tag)) && n++ < 30) {
    const name = m[1]!.toLowerCase();
    if (!(name in out)) out[name] = m[2] ?? m[3] ?? "";
  }
  return out;
}

function metaMap(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /<meta\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(html)) && n++ < MAX_META_TAGS) {
    const a = attrs(m[0]);
    const key = (a["property"] ?? a["name"] ?? a["itemprop"])?.toLowerCase();
    if (key && a["content"] !== undefined && !map.has(key)) map.set(key, a["content"]);
  }
  return map;
}

// ---------------------------------------------------------------------------------- JSON-LD

type Json = unknown;
const isObj = (v: Json): v is Record<string, Json> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const asArray = (v: Json): Json[] =>
  Array.isArray(v) ? v : v === undefined || v === null ? [] : [v];

function typesOf(node: Record<string, Json>): string[] {
  return asArray(node["@type"]).filter((t): t is string => typeof t === "string");
}

function jsonLdBlocks(html: string): Json[] {
  const out: Json[] = [];
  const re = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < MAX_JSONLD_BLOCKS) {
    const body = m[1]!.trim();
    if (!body || body.length > MAX_JSONLD_BYTES) continue;
    try {
      out.push(JSON.parse(body.replace(/^<!--|-->$/g, "")));
    } catch {
      /* malformed block: ignore it */
    }
  }
  return out;
}

function walk(roots: Json[], visit: (node: Record<string, Json>) => void) {
  const queue: Json[] = [...roots];
  let seen = 0;
  while (queue.length && seen++ < MAX_JSON_NODES) {
    const v = queue.shift();
    if (Array.isArray(v)) queue.push(...v);
    else if (isObj(v)) {
      visit(v);
      for (const child of Object.values(v))
        if (typeof child === "object" && child !== null) queue.push(child);
    }
  }
}

function imageFrom(v: Json): string | null {
  for (const item of asArray(v)) {
    if (typeof item === "string") return item;
    if (isObj(item)) {
      const u = item["url"] ?? item["contentUrl"];
      if (typeof u === "string") return u;
    }
  }
  return null;
}

type OfferPrice = { priceMinor: number; currency: string | null };
function offerPrices(offers: Json): { prices: OfferPrice[]; unparsed: boolean } {
  const prices: OfferPrice[] = [];
  let unparsed = false;
  const take = (o: Json) => {
    if (!isObj(o)) return;
    const spec = isObj(o["priceSpecification"])
      ? o["priceSpecification"]
      : asArray(o["priceSpecification"]).find(isObj);
    const priceRaw = o["price"] ?? o["lowPrice"] ?? (isObj(spec) ? spec["price"] : undefined);
    const currencyRaw = o["priceCurrency"] ?? (isObj(spec) ? spec["priceCurrency"] : undefined);
    if (priceRaw === undefined) return;
    const minor = parsePriceToMinor(priceRaw);
    if (minor === null) unparsed = true;
    else
      prices.push({
        priceMinor: minor,
        currency: typeof currencyRaw === "string" ? currencyRaw : null,
      });
    if (o["offers"] !== undefined) {
      for (const inner of asArray(o["offers"]).slice(0, 20)) take(inner);
    }
  };
  for (const o of asArray(offers).slice(0, 20)) take(o);
  return { prices, unparsed };
}

function fromJsonLd(html: string, base: URL) {
  const blocks = jsonLdBlocks(html);
  if (!blocks.length) return null;
  let found: Record<string, Json> | null = null;
  const crumbs: string[] = [];
  const categories: string[] = [];
  walk(blocks, (node) => {
    const types = typesOf(node);
    if (
      !found &&
      types.some((t) => t === "Product" || t === "IndividualProduct" || t === "ProductGroup")
    ) {
      found = node;
    }
    if (types.includes("BreadcrumbList")) {
      for (const el of asArray(node["itemListElement"]).slice(0, 12)) {
        if (!isObj(el)) continue;
        const name = el["name"] ?? (isObj(el["item"]) ? el["item"]["name"] : undefined);
        const text = cleanText(name, 120);
        if (text) crumbs.push(text);
      }
    }
  });
  if (!found) return null;
  const product = found as Record<string, Json>;
  const cat = product["category"];
  for (const c of asArray(cat).slice(0, 6)) {
    const text = cleanText(isObj(c) ? c["name"] : c, 200);
    if (text) categories.push(text);
  }
  let offerSource = offerPrices(product["offers"]);
  if (!offerSource.prices.length) {
    // ProductGroup: variants hold the offers.
    for (const variant of asArray(product["hasVariant"]).slice(0, 20)) {
      if (!isObj(variant)) continue;
      const o = offerPrices(variant["offers"]);
      offerSource = {
        prices: [...offerSource.prices, ...o.prices],
        unparsed: offerSource.unparsed || o.unparsed,
      };
    }
  }
  const image = imageFrom(product["image"]);
  return {
    title: cleanText(product["name"]),
    imageUrl: image ? safeImageUrl(image, base) : null,
    offers: offerSource,
    categoryTexts: [...categories, ...crumbs],
  };
}

// ----------------------------------------------------------------------------- microdata

function fromMicrodata(html: string, base: URL) {
  const scopeAt = html.search(/itemtype\s*=\s*["']https?:\/\/schema\.org\/Product["']/i);
  if (scopeAt === -1) return null;
  const scope = html.slice(scopeAt, scopeAt + 60_000);
  const prop = (name: string): string | null => {
    const re = new RegExp(`<([a-z0-9]+)\\b[^>]*itemprop\\s*=\\s*["']${name}["'][^>]*>`, "i");
    const m = re.exec(scope);
    if (!m) return null;
    const a = attrs(m[0]);
    if (a["content"] !== undefined) return a["content"];
    if (a["href"] !== undefined && name === "image") return a["href"];
    if (a["src"] !== undefined && name === "image") return a["src"];
    const after = scope.slice(m.index + m[0].length, m.index + m[0].length + 400);
    return after.split("<")[0] ?? null;
  };
  const price = prop("price");
  const image = prop("image");
  return {
    title: cleanText(prop("name")),
    imageUrl: image ? safeImageUrl(cleanText(image, 2000) ?? "", base) : null,
    priceRaw: price,
    currencyRaw: prop("priceCurrency"),
  };
}

// ----------------------------------------------------------------------------- challenge

const CHALLENGE_MARKERS = [
  /captcha/i,
  /robot check/i,
  /are you a (human|robot)/i,
  /verify (that )?you('| a)re (a )?human/i,
  /cf-chl|cf_chl|challenge-platform/i,
  /px-captcha|perimeterx/i,
  /access denied/i,
  /unusual traffic/i,
  /enable javascript and cookies to continue/i,
];

export function looksLikeChallenge(html: string): boolean {
  const head = html.slice(0, 60_000);
  return CHALLENGE_MARKERS.some((re) => re.test(head));
}

// ------------------------------------------------------------------------------- the entry

export function extractProduct(htmlIn: string, pageUrl: URL): Extracted {
  const html = htmlIn.length > MAX_HTML_SCAN ? htmlIn.slice(0, MAX_HTML_SCAN) : htmlIn;
  const result: Extracted = {
    title: null,
    titleSource: null,
    imageUrl: null,
    priceMinor: null,
    currency: null,
    priceSource: null,
    unsupportedCurrency: null,
    priceAmbiguous: false,
    categoryTexts: [],
    challenge: false,
  };
  const categories: string[] = [];
  const setPrice = (minor: number | null, currencyRaw: unknown, source: ExtractSource): boolean => {
    if (minor === null) return false;
    const { currency, unsupported } = currencyOf(currencyRaw);
    if (!currency) {
      result.unsupportedCurrency = unsupported;
      return false;
    }
    result.priceMinor = minor;
    result.currency = currency;
    result.priceSource = source;
    return true;
  };

  // 1. JSON-LD
  const ld = fromJsonLd(html, pageUrl);
  if (ld) {
    if (ld.title) {
      result.title = ld.title;
      result.titleSource = "jsonld";
    }
    result.imageUrl = ld.imageUrl;
    categories.push(...ld.categoryTexts);
    const distinct = new Set(
      ld.offers.prices.map((p) => `${p.priceMinor}|${(p.currency ?? "").toUpperCase()}`),
    );
    if (distinct.size > 1) {
      result.priceAmbiguous = true; // several different prices: do not pick one
    } else if (distinct.size === 1) {
      const only = ld.offers.prices[0]!;
      setPrice(only.priceMinor, only.currency, "jsonld");
    }
  }

  // 2. OpenGraph / product meta
  const meta = metaMap(html);
  if (!result.title) {
    const t = cleanText(meta.get("og:title") ?? meta.get("twitter:title"));
    if (t) {
      result.title = t;
      result.titleSource = "opengraph";
    }
  }
  if (!result.imageUrl) {
    const img =
      meta.get("og:image:secure_url") ?? meta.get("og:image") ?? meta.get("twitter:image");
    if (img) result.imageUrl = safeImageUrl(decodeEntities(img), pageUrl);
  }
  if (result.priceMinor === null && !result.priceAmbiguous) {
    const amount = meta.get("product:price:amount") ?? meta.get("og:price:amount");
    const cur = meta.get("product:price:currency") ?? meta.get("og:price:currency");
    if (amount !== undefined) setPrice(parsePriceToMinor(amount), cur, "opengraph");
  }
  for (const key of ["product:category", "og:type", "article:section"]) {
    const t = key === "og:type" ? null : cleanText(meta.get(key), 200);
    if (t) categories.push(t);
  }

  // 3. microdata
  if (result.priceMinor === null || !result.title || !result.imageUrl) {
    const md = fromMicrodata(html, pageUrl);
    if (md) {
      if (!result.title && md.title) {
        result.title = md.title;
        result.titleSource = "microdata";
      }
      if (!result.imageUrl) result.imageUrl = md.imageUrl;
      if (result.priceMinor === null && !result.priceAmbiguous && md.priceRaw) {
        setPrice(parsePriceToMinor(md.priceRaw), md.currencyRaw, "microdata");
      }
    }
  }

  // <title> is a last resort for the name only
  if (!result.title) {
    const m = /<title[^>]*>([\s\S]{0,500}?)<\/title>/i.exec(html);
    const t = cleanText(m?.[1]);
    if (t) {
      result.title = t;
      result.titleSource = "opengraph";
    }
  }

  result.categoryTexts = [...new Set(categories)].slice(0, MAX_CATEGORY_TEXTS);
  // A challenge page only counts when it did not also give us product data.
  result.challenge = looksLikeChallenge(html) && result.priceMinor === null;
  return result;
}
