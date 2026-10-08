import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { BAZAAR_PHOTOS, responsiveImage } from "./images.ts";

test("bundled bazaar photos map to WebP variants", () => {
  assert.deepEqual(responsiveImage("/bazaar/kettle.jpg", "50vw"), {
    src: "/bazaar/kettle-640.webp",
    srcSet: "/bazaar/kettle-320.webp 320w, /bazaar/kettle-640.webp 640w",
    sizes: "50vw",
  });
});

test("unknown or external images pass through untouched", () => {
  assert.deepEqual(responsiveImage("/bazaar/unknown.jpg", "50vw"), { src: "/bazaar/unknown.jpg" });
  assert.deepEqual(responsiveImage("https://example.com/a.jpg", "50vw"), {
    src: "https://example.com/a.jpg",
  });
  assert.deepEqual(responsiveImage("/bazaar/kettle.jpg?x=1", "50vw"), {
    src: "/bazaar/kettle.jpg?x=1",
  });
});

test("every variant and original exists in public/", () => {
  for (const name of BAZAAR_PHOTOS) {
    for (const file of [`${name}.jpg`, `${name}-320.webp`, `${name}-640.webp`]) {
      assert.ok(existsSync(new URL(`../../public/bazaar/${file}`, import.meta.url)), file);
    }
  }
});
