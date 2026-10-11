import assert from "node:assert/strict";
import test from "node:test";
import { LANGS } from "./langs.ts";
import { redesignCopy } from "./redesign-copy.ts";
import { productLinkCopy } from "./product-link/copy.ts";
import { storeCopy } from "./store-copy.ts";
import { marketCopy } from "./market-copy.ts";
import { catalogueCopy } from "./catalogue-copy.ts";
import { heroCopy } from "./hero-copy.ts";
import { SEO_MESSAGES } from "./seo-messages.ts";

type Tree = unknown;
function flat(v: Tree, p = "", out: Record<string, string> = {}): Record<string, string> {
  if (typeof v === "string") out[p] = v;
  else if (Array.isArray(v)) v.forEach((x, i) => flat(x, `${p}[${i}]`, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) flat(x, p ? `${p}.${k}` : k, out);
  return out;
}

const MODULES: Record<string, { get: (l: never) => Tree; allowSame: number }> = {
  redesign: { get: redesignCopy as never, allowSame: 0 },
  productLink: { get: productLinkCopy as never, allowSame: 0 },
  store: { get: storeCopy as never, allowSame: 0 },
  // German "Name" is the same word as English.
  market: { get: marketCopy as never, allowSame: 1 },
  // German and Turkish keep loanwords: Smartphones, Tablets, Fitness, Camping, Snacks.
  catalogue: { get: catalogueCopy as never, allowSame: 5 },
  hero: { get: heroCopy as never, allowSame: 0 },
  seo: {
    get: ((l: string) => (SEO_MESSAGES as Record<string, unknown>)[l]) as never,
    allowSame: 0,
  },
};

for (const [name, { get, allowSame }] of Object.entries(MODULES)) {
  test(`${name}: every language has every key, none empty`, () => {
    const en = flat(get("en" as never));
    for (const { id } of LANGS) {
      const f = flat(get(id as never));
      const missing = Object.keys(en).filter((k) => !(k in f));
      const empty = Object.keys(f).filter((k) => f[k]!.trim() === "");
      assert.deepEqual(missing, [], `${name}/${id} missing keys`);
      assert.deepEqual(empty, [], `${name}/${id} empty strings`);
    }
  });

  test(`${name}: no language silently falls back to English`, () => {
    const en = flat(get("en" as never));
    for (const { id } of LANGS) {
      if (id === "en") continue;
      const f = flat(get(id as never));
      const same = Object.keys(f).filter(
        (k) => f[k] === en[k] && /[A-Za-z]{3}/.test(en[k]!) && !/^R&L/.test(en[k]!),
      );
      assert.ok(
        same.length <= allowSame,
        `${name}/${id}: ${same.length} strings are still English: ${same.slice(0, 5).join(", ")}`,
      );
    }
  });
}
