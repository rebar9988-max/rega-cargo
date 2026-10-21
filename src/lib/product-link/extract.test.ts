import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { cleanText, extractProduct, looksLikeChallenge, parsePriceToMinor } from "./extract.ts";

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const run = (name: string, url = "https://www.example-shop.com/p/1") =>
  extractProduct(fixture(name), new URL(url));

describe("parsePriceToMinor (exact decimals, no floats)", () => {
  it("parses common spellings", () => {
    const cases: [unknown, number | null][] = [
      ["19.99", 1999],
      ["19,99", 1999],
      ["1.299,00", 129900],
      ["1,299.00", 129900],
      ["1.299,5", 129950],
      ["€ 19,90", 1990],
      ["$1,000", null /* ambiguous single separator + 3 digits */],
      ["1299", 129900],
      ["0.10", 10],
      ["1.299.000", 129900000],
      [19.99, 1999],
      [5, 500],
      ["19.9", 1990],
      [" 19,99 ", 1999],
    ];
    for (const [input, want] of cases) assert.equal(parsePriceToMinor(input), want, String(input));
  });
  it("is exact where floats are not (0.1 + 0.2 style, 1.15 x 100)", () => {
    assert.equal(parsePriceToMinor("1.15"), 115);
    assert.equal(parsePriceToMinor("4.35"), 435);
    assert.equal(parsePriceToMinor("8.2"), 820);
  });
  it("refuses empty, zero, negative, ambiguous, malformed, huge and non-string input", () => {
    for (const bad of [
      "",
      "abc",
      "0",
      "0.00",
      "-5",
      "1.299",
      "1,299",
      "19.999",
      "1.2.3",
      "12,34,56",
      "1,234.5.6",
      ".5",
      "5.",
      "1e21",
      "9".repeat(20),
      "99999999.99",
      NaN,
      Infinity,
      1e21,
      null,
      undefined,
      {},
      [],
      true,
    ]) {
      assert.equal(parsePriceToMinor(bad), null, String(bad));
    }
  });
});

describe("extractProduct on saved sample pages", () => {
  it("JSON-LD product wins over OpenGraph and the <title>", () => {
    const r = run("jsonld-product.html");
    assert.equal(r.title, "Basic Cotton T-Shirt & Co");
    assert.equal(r.titleSource, "jsonld");
    assert.equal(r.priceMinor, 1999);
    assert.equal(r.currency, "EUR");
    assert.equal(r.priceSource, "jsonld");
    assert.equal(r.imageUrl, "https://static.example-shop.com/img/tee-1.jpg");
    assert.deepEqual(r.categoryTexts, ["Apparel > Shirts", "Men", "T-Shirts"]);
    assert.equal(r.challenge, false);
  });

  it("OpenGraph / product:price fallback, decoded and parsed exactly", () => {
    const r = run("opengraph-only.html");
    assert.equal(r.title, "Wireless Mouse M185");
    assert.equal(r.titleSource, "opengraph");
    assert.equal(r.priceMinor, 129950);
    assert.equal(r.currency, "TRY");
    assert.equal(r.priceSource, "opengraph");
    assert.equal(r.imageUrl, "https://cdn.example-shop.com/mouse.png?x=1&y=2");
    assert.deepEqual(r.categoryTexts, ["Computer accessories"]);
  });

  it("microdata fallback, relative image resolved against the page", () => {
    const r = run("microdata.html");
    assert.equal(r.title, "Ceramic Mug 350ml");
    assert.equal(r.titleSource, "microdata");
    assert.equal(r.priceMinor, 750);
    assert.equal(r.currency, "GBP");
    assert.equal(r.priceSource, "microdata");
    assert.equal(r.imageUrl, "https://www.example-shop.com/img/mug.jpg");
  });

  it("a blocked / captcha page yields no product data and is flagged as a challenge", () => {
    const r = run("blocked-captcha.html");
    assert.equal(r.priceMinor, null);
    assert.equal(r.challenge, true);
    assert.equal(looksLikeChallenge(fixture("blocked-captcha.html")), true);
  });

  it("a partial page gives a title and no price (the customer will type the rest)", () => {
    const r = run("partial-title-only.html");
    assert.equal(r.title, "Nice Jacket");
    assert.equal(r.priceMinor, null);
    assert.equal(r.currency, null);
    assert.equal(r.imageUrl, null);
    assert.equal(r.challenge, false);
  });

  it("several different offers are ambiguous: no price is picked", () => {
    const r = run("ambiguous-prices.html");
    assert.equal(r.title, "Sneaker");
    assert.equal(r.priceAmbiguous, true);
    assert.equal(r.priceMinor, null);
  });

  it("a currency we cannot convert is reported, not guessed", () => {
    const r = run("unsupported-currency.html");
    assert.equal(r.priceMinor, null);
    assert.equal(r.currency, null);
    assert.equal(r.unsupportedCurrency, "SEK");
  });

  it("malformed JSON-LD is ignored and OpenGraph is used (currency case-insensitive)", () => {
    const r = run("malformed-jsonld.html");
    assert.equal(r.title, "Fallback Name");
    assert.equal(r.priceMinor, 1200);
    assert.equal(r.currency, "USD");
  });

  it("hostile content comes out as inert plain text, with unsafe images and prices dropped", () => {
    const r = run("hostile.html");
    assert.ok(r.title && !/[<>]/.test(r.title), r.title ?? "");
    assert.equal(r.imageUrl, null);
    assert.equal(r.priceMinor, null);
  });

  it("is bounded: a huge page is scanned only up to the cap and still returns quickly", () => {
    const html = `<html><head><meta property="og:title" content="Big"></head><body>${"<p>x</p>".repeat(400_000)}</body></html>`;
    const started = Date.now();
    const r = extractProduct(html, new URL("https://www.example-shop.com/p/1"));
    assert.equal(r.title, "Big");
    assert.ok(Date.now() - started < 2000);
  });

  it("handles garbage input without throwing", () => {
    for (const html of [
      "",
      "<",
      "<<<>>>",
      "\u0000\u0001",
      "<script type='application/ld+json'>[[[[</script>",
      "<meta property=og:title content=>",
    ]) {
      assert.doesNotThrow(() => extractProduct(html, new URL("https://www.example-shop.com/")));
    }
  });
});

describe("cleanText", () => {
  it("strips tags, entities and control characters and bounds the length", () => {
    assert.equal(cleanText("  <b>Hello</b>\n&amp; world\u0000  "), "Hello & world");
    assert.equal(cleanText("x".repeat(1000))?.length, 300);
    assert.equal(cleanText("   "), null);
    assert.equal(cleanText(5), null);
  });
});
