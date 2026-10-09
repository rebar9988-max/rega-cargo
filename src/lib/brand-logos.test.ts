import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { BRANDS } from "./catalog.ts";
import { checkText, isProhibitedQuery } from "./compliance/check.ts";

const file = (logo: string) => new URL(`../../public${logo}`, import.meta.url);

test("every rail brand has a self-hosted, scaleable SVG logo (no text-only tiles)", () => {
  assert.ok(BRANDS.length > 0);
  for (const brand of BRANDS) {
    assert.match(brand.logo, /^\/(brand|store)-logos\/[a-z0-9-]+\.svg$/, brand.name);
    assert.ok(existsSync(file(brand.logo)), `${brand.name}: ${brand.logo} missing`);
    const svg = readFileSync(file(brand.logo), "utf8");
    assert.match(svg, /viewBox="/, `${brand.name}: no viewBox (would not scale)`);
    assert.doesNotMatch(svg, /<script|\son[a-z]+=|href="(?:https?:|javascript:)/i, brand.name);
  }
});

test("every brand-logos file is documented in LOGOS.md with a Commons source", () => {
  const doc = readFileSync(file("/brand-logos/LOGOS.md"), "utf8");
  for (const brand of BRANDS.filter((b) => b.logo.startsWith("/brand-logos/"))) {
    const name = brand.logo.split("/").pop()!;
    const row = doc.split("\n").find((l) => l.includes(`\`${name}\``));
    assert.ok(row, `${name} not in LOGOS.md`);
    assert.match(row, /commons\.wikimedia\.org\/wiki\/File:/, name);
    assert.match(row, /trademarked/, name);
  }
});

test("brand list passes the compliance check", () => {
  for (const brand of BRANDS) {
    assert.equal(isProhibitedQuery(brand.name), false, brand.name);
    assert.equal(checkText(brand.name).decision, "allow", brand.name);
  }
  assert.equal(new Set(BRANDS.map((b) => b.name)).size, BRANDS.length);
});
