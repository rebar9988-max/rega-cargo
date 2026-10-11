import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProductLink } from "./url.ts";
import { estimateLinkShipping } from "./estimate.ts";
import { checkText } from "../compliance/check.ts";

const ok = (u: string) => parseProductLink(u);

test("accepts product pages on allow-listed providers and rebuilds a canonical link", () => {
  const a = ok("https://www.amazon.de/Some-Title/dp/b08n5wrwnw/ref=sr_1_1?tag=x&utm=y");
  assert.ok(a.ok && a.link.productId === "B08N5WRWNW");
  assert.equal(a.ok && a.link.canonicalUrl, "https://www.amazon.de/dp/B08N5WRWNW");
  const e = ok("https://www.ebay.de/itm/Some-Slug/123456789012?hash=abc");
  assert.equal(e.ok && e.link.canonicalUrl, "https://www.ebay.de/itm/123456789012");
  const x = ok("https://de.aliexpress.com/item/1005001234567890.html?spm=a");
  assert.equal(
    x.ok && x.link.canonicalUrl,
    "https://www.aliexpress.com/item/1005001234567890.html",
  );
});

test("rejects unsafe or unsupported links (SSRF, redirects, look-alike hosts)", () => {
  for (const bad of [
    "http://www.amazon.de/dp/B08N5WRWNW",
    "https://user:pw@www.amazon.de/dp/B08N5WRWNW",
    "https://www.amazon.de:8443/dp/B08N5WRWNW",
    "https://127.0.0.1/dp/B08N5WRWNW",
    "https://169.254.169.254/latest/meta-data",
    "https://localhost/dp/B08N5WRWNW",
    "https://evil-amazon.de/dp/B08N5WRWNW",
    "https://amazon.de.evil.com/dp/B08N5WRWNW",
    "https://amzn.to/3abc",
    "https://www.amazon.de/gp/help",
    "javascript:alert(1)",
    "",
    "x".repeat(2100),
  ]) {
    assert.equal(ok(bad).ok, false, bad);
  }
  assert.equal(parseProductLink(null).ok, false);
});

test("shipping estimate reuses corridor pricing and needs customer weight", () => {
  const e = estimateLinkShipping({ kg: 2, dest: "ebl", mode: "economy" });
  assert.ok(e && e.estimate === true && e.shippingEur > 0 && e.shippingIqd > 0);
  assert.equal(estimateLinkShipping({ kg: 0, dest: "ebl" }), null);
  assert.equal(estimateLinkShipping({ kg: 999, dest: "ebl" }), null);
  assert.equal(estimateLinkShipping({ kg: 2, dest: "nowhere" }), null);
  assert.equal(estimateLinkShipping({ kg: 2, l: 5000, dest: "ebl" }), null);
});

test("banned product words in a link slug are blocked by the permanent filter", () => {
  assert.equal(
    checkText("https://www.amazon.de/Absolut-Vodka-0-7l/dp/B08N5WRWNW").decision,
    "block",
  );
});
