import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

const root = new URL("../", import.meta.url);
const brand = "public/brand/official-da41b3010f96-v1";
const bytes = (path) => readFileSync(new URL(path, root));
const text = (path) => bytes(path).toString("utf8");
const sha = (data) => createHash("sha256").update(data).digest("hex");

test("approved original is byte-for-byte preserved; legacy R&L assets are removed", () => {
  assert.equal(
    sha(bytes(`${brand}/original.jpg`)),
    "da41b3010f96b80d0b35cd8a83987f9053c0698b6db676fbe66ca4c756c2362c",
  );
  for (const path of [
    "src/assets/rega-logo.jpg",
    "public/rega-logo.jpg",
    "public/rega-logo-168.webp",
    "public/rl-logo.png",
    "public/rl-logo.svg",
    "public/favicon.png",
    "public/favicon.svg",
    "public/apple-touch-icon.png",
    "public/icon-192.png",
    "public/icon-512.png",
    "public/__grok/icon-180.png",
    "src/components/site-mark.tsx",
  ])
    assert.equal(existsSync(new URL(path, root)), false, path);
  assert.equal(sha(bytes("public/favicon.ico")), sha(bytes(`${brand}/favicon.ico`)));
  assert.equal(sha(bytes("public/og.jpg")), sha(bytes(`${brand}/social-1200x630.jpg`)));
});

test("manifest icons are real square PNGs of the declared size and retain installed app identity", () => {
  const manifest = JSON.parse(text("public/manifest.webmanifest"));
  assert.equal(manifest.id, "/");
  assert.equal(manifest.scope, "/");
  for (const icon of manifest.icons) {
    assert.match(icon.src, /^\/brand\/official-da41b3010f96-v1\/icon-\d+\.png$/);
    const png = bytes(`public${icon.src}`);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    const width = png.readUInt32BE(16),
      height = png.readUInt32BE(20);
    assert.equal(`${width}x${height}`, icon.sizes);
    assert.equal(width, height);
    // The square source isn't maskable-safe: don't invite OS cropping of the artwork.
    assert.equal(icon.purpose, "any");
  }
});

test("all active application brand references use the versioned official identity", () => {
  for (const path of [
    "src/components/brand-logo.tsx",
    "src/components/site-header.tsx",
    "src/components/site-footer.tsx",
    "src/components/shell.tsx",
    "src/routes/__root.tsx",
    "src/lib/seo.ts",
    "src/lib/rate-sheet.ts",
    "server/middleware/rl-og.ts",
    "public/offline.html",
    "public/sw.js",
    "public/manifest.webmanifest",
  ])
    assert.doesNotMatch(
      text(path),
      /rega-logo|rl-logo\.(?:png|svg)|\/favicon\.png|\/og\.jpg|site-mark/,
      path,
    );
  for (const path of ["src/components/site-header.tsx", "src/components/site-footer.tsx"]) {
    assert.match(text(path), /<BrandLogo/);
  }
  assert.match(text("src/components/brand-logo.tsx"), /object-contain/);
  assert.doesNotMatch(text("src/components/brand-logo.tsx"), /onError|scaleX|rotate|rounded/);
});

test("service worker upgrade evicts cached legacy logos and pages and precaches official assets", async () => {
  const sw = text("public/sw.js");
  const handlers = {};
  const deleted = [];
  const requests = [];
  const current = "rl-sw-v11-brand-da41b3010f96";
  let claimed = false;
  runInNewContext(sw, {
    self: {
      addEventListener: (name, handler) => {
        handlers[name] = handler;
      },
      skipWaiting: async () => {},
      registration: { navigationPreload: { enable: async () => {} } },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
    caches: {
      keys: async () => ["rl-sw-v10-pages", "rl-sw-v10-static", `${current}-pages`],
      delete: async (name) => {
        deleted.push(name);
        return true;
      },
      open: async (cacheName) => ({
        add: async (request) => {
          requests.push({ cacheName, url: request.url });
        },
      }),
    },
    Request: class {
      constructor(url) {
        this.url = url;
      }
    },
  });
  let pending;
  handlers.install({
    waitUntil: (promise) => {
      pending = promise;
    },
  });
  await pending;
  for (const path of ["logo-168.webp", "icon-32.png"]) {
    assert.ok(
      requests.some(
        (request) =>
          request.url === `/brand/official-da41b3010f96-v1/${path}` &&
          request.cacheName === `${current}-static`,
      ),
    );
  }
  assert.equal(
    requests.some((request) => request.url.includes("rega-logo")),
    false,
  );
  handlers.activate({
    waitUntil: (promise) => {
      pending = promise;
    },
  });
  await pending;
  assert.deepEqual(deleted, ["rl-sw-v10-pages", "rl-sw-v10-static"]);
  assert.equal(claimed, true);
});
