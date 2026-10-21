import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { screenItem, type ScreenInput } from "./screening.ts";
import { matchStore } from "./store-match.ts";
import { BUNDLED_RULES } from "../../compliance/check.ts";

const base = (patch: Partial<ScreenInput> = {}): ScreenInput => ({
  title: "Basic Cotton T-Shirt",
  categoryTexts: ["Men", "T-Shirts"],
  category: "fashion",
  options: "size M, blue",
  url: new URL("https://www.zara.com/de/en/basic-t-shirt-p01234.html"),
  ...patch,
});
const screen = (patch?: Partial<ScreenInput>) => screenItem(base(patch), BUNDLED_RULES);

describe("screenItem: clear", () => {
  it("lets an ordinary classified item through", () =>
    assert.deepEqual(screen(), { decision: "clear" }));
  it("does not scan host names (only the path and query)", () => {
    assert.deepEqual(screen({ url: new URL("https://www.wine-and-more.de/p/shoes") }), {
      decision: "clear",
    });
  });
});

describe("screenItem: banned products are rejected, per category", () => {
  const cases: [string, string, Partial<ScreenInput>][] = [
    ["alcohol", "title", { title: "Premium Vodka 70cl" }],
    ["alcohol", "title (wine)", { title: "Red Wine Gift Set" }],
    ["tobacco_smoking", "title", { title: "Cigars box of 20" }],
    ["vape", "title", { title: "Disposable Vape Pen" }],
    ["pork", "title", { title: "Smoked pork sausage pack" }],
    ["drugs", "title", { title: "Cannabis CBD grow kit" }],
    ["gambling", "title", { title: "Poker chips casino set" }],
    ["adult", "title", { title: "Adult sex toy" }],
  ];
  for (const [category, label, patch] of cases) {
    it(`${category} (${label})`, () => {
      const r = screen(patch);
      assert.equal(r.decision, "rejected", JSON.stringify(r));
    });
  }

  it("rejects by the page's own category / breadcrumbs", () => {
    assert.equal(
      screen({ categoryTexts: ["Food & Drink", "Beer, Wine & Spirits"] }).decision,
      "rejected",
    );
    assert.equal(screen({ categoryTexts: ["Smoking accessories"] }).decision, "rejected");
  });
  it("rejects by the URL path or query even when the title looks harmless", () => {
    assert.equal(
      screen({ url: new URL("https://shop.example.com/c/vodka/item-1") }).decision,
      "rejected",
    );
    assert.equal(
      screen({ url: new URL("https://shop.example.com/p?cat=whisky&id=2") }).decision,
      "rejected",
    );
    assert.equal(
      screen({ url: new URL("https://shop.example.com/p/wh%69sky-bottle") }).decision,
      "rejected",
    );
  });
  it("rejects by the options text", () => {
    assert.equal(screen({ options: "flavour: tequila" }).decision, "rejected");
  });
  it("rejects spaced / lookalike spellings handled by the shared engine", () => {
    assert.equal(screen({ title: "V o d k a 0.7l" }).decision, "rejected");
  });
  it("reports which category matched (for the owner log only)", () => {
    assert.deepEqual(screen({ title: "Premium Vodka 70cl" }), {
      decision: "rejected",
      category: "alcohol",
    });
  });
  it("a block outranks a review in the same item", () => {
    assert.equal(screen({ title: "Alcohol free beer and vodka" }).decision, "rejected");
  });
});

describe("screenItem: unknown or ambiguous goes to the owner", () => {
  it("food always needs review", () => {
    assert.deepEqual(screen({ category: "food", title: "Chocolate bar 100g" }), {
      decision: "needs_review",
      reason: "food_category",
    });
  });
  it("an unclassified (general) item needs review", () => {
    assert.deepEqual(screen({ category: "general" }), {
      decision: "needs_review",
      reason: "unclassified_category",
    });
  });
  it("a title too short to judge needs review", () => {
    assert.deepEqual(screen({ title: "ab" }), {
      decision: "needs_review",
      reason: "title_too_short",
    });
  });
  it("a review-level keyword needs review, not rejection", () => {
    const r = screen({ title: "Hand disinfectant alcohol 70% 500ml" });
    assert.equal(r.decision, "needs_review", JSON.stringify(r));
  });
});

describe("matchStore", () => {
  const stores = [
    { key: "amazon", name: "Amazon", domains: ["amazon.de", "amazon.com"], enabled: true },
    { key: "hm", name: "H&M", domains: ["hm.com"], enabled: true },
    { key: "off", name: "Off", domains: ["off.example"], enabled: false },
  ];
  it("matches the exact domain and subdomains only", () => {
    assert.deepEqual(matchStore("www.amazon.de", stores), {
      key: "amazon",
      name: "Amazon",
      known: true,
    });
    assert.deepEqual(matchStore("hm.com", stores), { key: "hm", name: "H&M", known: true });
    assert.equal(matchStore("notamazon.de", stores).known, false);
    assert.equal(matchStore("amazon.de.evil.com", stores).known, false);
  });
  it("any other public host is an unknown store named after the host", () => {
    assert.deepEqual(matchStore("www.some-shop.com", stores), {
      key: "some-shop.com",
      name: "some-shop.com",
      known: false,
    });
  });
  it("a disabled store is treated as unknown", () => {
    assert.equal(matchStore("off.example", stores).known, false);
  });
});
