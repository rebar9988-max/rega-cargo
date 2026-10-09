import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Static half of the layout lock (DEPLOY.md "Layout lock"); the Playwright suite in
 * tests/layout is the rendered half. Components must use the layout tokens, not ad-hoc sizes.
 */
function tsx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsx(path);
    return name.endsWith(".tsx") ? [path] : [];
  });
}

const RULES: [RegExp, string][] = [
  [/(?<=["'`\s])(sm|xl|2xl):/, "only md (768) and lg (1024) breakpoints exist"],
  [/(?<=["'`\s])(max|min)-\[\d/, "no ad-hoc breakpoints"],
  // Letter-spacing (tracking-[…em]) and viewport-relative sheet heights (…vh) are not layout sizes.
  [/(?<!tracking)-\[-?\d+(\.\d+)?(px|rem|em|%)\]/, "no ad-hoc single-value sizes; use a token"],
  [/\btext-\[\d/, "no ad-hoc font sizes; use the type scale"],
  [/\bmax-w-6xl\b/, "page containers use the `page` utility"],
  [/\baspect-\[/, "image ratios use aspect tokens (aspect-product, aspect-square)"],
];

test("components use layout tokens, not ad-hoc sizes or breakpoints", () => {
  const offenders: string[] = [];
  for (const path of tsx("src")) {
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((line, i) => {
        for (const [rule, why] of RULES)
          if (rule.test(line))
            offenders.push(`${path}:${i + 1} ${why}: ${line.trim().slice(0, 100)}`);
      });
  }
  assert.deepEqual(offenders, []);
});

test("styles.css declares exactly the locked breakpoints and layout tokens", () => {
  const css = readFileSync("src/styles.css", "utf8");
  for (const decl of [
    "--breakpoint-*: initial;",
    "--breakpoint-md: 48rem;",
    "--breakpoint-lg: 64rem;",
    "--layout-max: 75rem;",
    "--header-h: 4rem;",
    "--bottom-bar-h: 4rem;",
    "--aspect-product: 3 / 4;",
  ])
    assert.ok(css.includes(decl), decl);
  assert.equal((css.match(/--breakpoint-[a-z0-9]+:/g) ?? []).length, 2, "only md and lg");
  assert.ok(!/clamp\(/.test(css), "type scale is stepped, not fluid");
});

test("viewport meta allows safe areas and never disables zoom", () => {
  const root = readFileSync("src/routes/__root.tsx", "utf8");
  const meta = root.match(/name: "viewport", content: "([^"]+)"/)?.[1] ?? "";
  assert.equal(meta, "width=device-width, initial-scale=1, viewport-fit=cover");
});
