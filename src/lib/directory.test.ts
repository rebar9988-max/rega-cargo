import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { LANGS } from "./langs.ts";
import { DIRECTORY_COPY } from "./directory-copy.ts";
import { selectBazaar } from "./bazaar-listing.ts";
import {
  DIRECTORY_STORES,
  EUROPEAN_COUNTRIES,
  GOODS,
  REGIONAL_STOREFRONTS,
  STORES,
  BRING_FOR_ME_STORES,
  CARD_LOGO,
  RAIL_LOGO,
  STORE_LOGO_RATIO,
  storeBrand,
  storeLogoSize,
} from "./stores.ts";

const TLD: Record<string, RegExp> = {
  DE: /\.de$/,
  CH: /\.ch$/,
  IT: /\.it$/,
  FR: /\.fr$/,
  GB: /\.co\.uk$/,
};

test("the European stores directory lists exactly the five authorized countries", () => {
  assert.deepEqual([...EUROPEAN_COUNTRIES], ["DE", "CH", "IT", "FR", "GB"]);
  for (const store of DIRECTORY_STORES)
    assert.ok(EUROPEAN_COUNTRIES.includes(store.country), `${store.id}: ${store.country}`);
  for (const country of EUROPEAN_COUNTRIES)
    assert.ok(
      DIRECTORY_STORES.some((store) => store.country === country),
      `${country}: empty`,
    );
  // China/US/outside-Europe stores stay in the shared data but are not listed here.
  assert.ok(STORES.some((store) => store.id === "shein"));
  assert.ok(!DIRECTORY_STORES.some((store) => store.id === "shein"));
});

test("every directory store is an official https storefront of a known retailer", () => {
  const ids = new Set<string>();
  const hosts = new Set<string>();
  for (const store of DIRECTORY_STORES) {
    assert.ok(!ids.has(store.id), `${store.id}: duplicate id`);
    assert.ok(!hosts.has(store.host), `${store.host}: duplicate host`);
    ids.add(store.id);
    hosts.add(store.host);
    assert.equal(store.url, `https://www.${store.host}/`, store.id);
    assert.match(store.host, TLD[store.country], `${store.id}: host matches its country`);
    // Logos and notes come from the retailer's existing entry: no new brand is introduced.
    assert.ok(
      STORES.some((entry) => entry.id === store.brand),
      `${store.id}: brand ${store.brand}`,
    );
    assert.ok(existsSync(`public/store-logos/${store.brand}.svg`), `${store.brand}: logo`);
  }
  // Storefronts claim no API/affiliate arrangement their German site's note describes.
  for (const store of REGIONAL_STOREFRONTS) assert.equal(store.note, "link", store.id);
});

test("every directory store is a Bring For Me store; search and R&L AI keep STORES", () => {
  for (const store of DIRECTORY_STORES) {
    const entry = BRING_FOR_ME_STORES.find((item) => item.id === store.id);
    assert.ok(entry, `${store.id}: Bring For Me`);
    assert.equal(entry.host, store.host, store.id);
  }
  // Bring For Me covers only the five authorized countries and the existing SHEIN entry.
  for (const store of BRING_FOR_ME_STORES)
    assert.ok(
      EUROPEAN_COUNTRIES.includes(store.country as never) || store.id === "shein",
      store.id,
    );
  // The registry behind header search and the R&L AI shop filter is unchanged.
  assert.equal(STORES.length, 11);
});

test("country, retailer and banned-search filters apply to the directory", () => {
  const labels = {};
  const list = (params: Parameters<typeof selectBazaar>[0]["params"]) =>
    selectBazaar({ params, favs: [], labels, stores: DIRECTORY_STORES });
  for (const country of EUROPEAN_COUNTRIES) {
    const { stores } = list({ country });
    assert.ok(stores.length > 0, country);
    assert.ok(
      stores.every((store) => store.country === country),
      country,
    );
  }
  // `?store=` names a retailer: every storefront of it, narrowed by country when chosen.
  assert.equal(list({ store: "zalando" }).stores.length, 5);
  assert.deepEqual(
    list({ store: "zalando", country: "IT" }).stores.map((store) => store.id),
    ["zalando-it"],
  );
  assert.deepEqual(
    list({ store: "zalando-fr" }).stores.map((store) => store.id),
    ["zalando-fr"],
  );
  // Example goods never point at a store outside the directory.
  for (const good of list({}).goods)
    assert.ok(
      DIRECTORY_STORES.some((store) => store.id === good.storeId),
      good.id,
    );
  assert.ok(GOODS.some((good) => good.storeId === "shein"));
  for (const q of ["vodka", "cigarettes", "vape", "pork bacon"]) {
    const banned = list({ q });
    assert.equal(banned.blocked, true, q);
    assert.equal(banned.stores.length + banned.goods.length, 0, q);
  }
});

test("directory copy is complete and translated in all seven languages", () => {
  const en = DIRECTORY_COPY.en;
  for (const { id } of LANGS) {
    const copy = DIRECTORY_COPY[id];
    assert.deepEqual(Object.keys(copy).sort(), Object.keys(en).sort(), id);
    assert.deepEqual(Object.keys(copy.country).sort(), [...EUROPEAN_COUNTRIES].sort(), id);
    for (const value of [...Object.values(copy), ...Object.values(copy.country)])
      if (typeof value === "string") assert.ok(value.trim(), `${id}: empty`);
    assert.ok(copy.backTitle.includes("{store}"), `${id}: store placeholder`);
    if (id !== "en") {
      assert.notEqual(copy.handoff, en.handoff, `${id}: handoff is still English`);
      assert.notEqual(copy.country.CH, en.country.CH, `${id}: countries are still English`);
    }
  }
});

test("store logos: ratios match the SVG files and every logo gets a similar visual weight", () => {
  for (const store of STORES) {
    const svg = readFileSync(`public/store-logos/${store.id}.svg`, "utf8");
    const box = svg
      .match(/viewBox="([^"]+)"/)?.[1]
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    assert.ok(box && box.length === 4, `${store.id}: viewBox`);
    const ratio = STORE_LOGO_RATIO[store.id];
    assert.ok(ratio, `${store.id}: ratio listed`);
    assert.ok(Math.abs(ratio - box[2] / box[3]) < 0.01, `${store.id}: ratio ${ratio}`);
  }
  for (const spec of [RAIL_LOGO, CARD_LOGO])
    for (const store of DIRECTORY_STORES) {
      const id = storeBrand(store);
      const { width, height } = storeLogoSize(id, spec);
      // Inside the box, at the logo's own proportions (never stretched).
      assert.ok(width <= spec.maxWidth && height <= spec.maxHeight, `${id}: ${width}x${height}`);
      assert.ok(Math.abs(width / height - STORE_LOGO_RATIO[id]) / STORE_LOGO_RATIO[id] < 0.1, id);
      // Logos the box does not clamp share one area within rounding.
      if (width < spec.maxWidth && height < spec.maxHeight)
        assert.ok(Math.abs(width * height - spec.area) / spec.area < 0.06, `${id}: area`);
    }
  // Country storefronts use their retailer's logo; a STORES entry uses its own.
  assert.equal(storeBrand(DIRECTORY_STORES.find((s) => s.id === "zalando-it")!), "zalando");
  assert.equal(storeBrand(STORES.find((s) => s.id === "amazon-de")!), "amazon-de");
});
