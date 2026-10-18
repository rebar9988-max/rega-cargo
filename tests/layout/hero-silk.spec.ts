import { expect, test } from "@playwright/test";

// Observe actual draw calls, not React state; a paused canvas must stop doing GPU work.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { draws: 0, capture: false, pixels: [] as number[], width: 0, height: 0 };
    Object.assign(window, { silkProbe: probe });
    const original = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      original.apply(this, args);
      if (!(this.canvas as HTMLCanvasElement).classList.contains("rl-ref-hero-silk")) return;
      probe.draws++;
      if (probe.capture) {
        const pixels = new Uint8Array(this.drawingBufferWidth * this.drawingBufferHeight * 4);
        this.readPixels(
          0,
          0,
          this.drawingBufferWidth,
          this.drawingBufferHeight,
          this.RGBA,
          this.UNSIGNED_BYTE,
          pixels,
        );
        // Transfer a fixed grid instead of megabytes per frame; read back only on request.
        probe.pixels = [];
        for (let y = 0; y < this.drawingBufferHeight; y += 4) {
          for (let x = 0; x < this.drawingBufferWidth; x += 4) {
            const i = (y * this.drawingBufferWidth + x) * 4;
            probe.pixels.push(pixels[i], pixels[i + 1], pixels[i + 2]);
          }
        }
        probe.width = this.drawingBufferWidth;
        probe.height = this.drawingBufferHeight;
        probe.capture = false;
      }
    };
  });
});

test.use({ reducedMotion: "no-preference" });

async function ready(page: import("@playwright/test").Page) {
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  await page.locator(".rl-ref-hero-stage").scrollIntoViewIfNeeded();
  const supported = await page.evaluate(
    () => !!document.createElement("canvas").getContext("webgl"),
  );
  test.skip(!supported, "WebGL unavailable: matching static fallback is checked separately");
  await expect(page.locator(".rl-ref-hero-stage")).toHaveAttribute("data-silk", "on");
}

async function drawCount(page: import("@playwright/test").Page) {
  return page.evaluate(() => (window as any).silkProbe.draws as number);
}

test("silk pixels flow while the opaque product, podium and page geometry stay stationary", async ({
  page,
}) => {
  await ready(page);
  const geometry = () =>
    page
      .locator(".rl-ref-hero, .rl-ref-hero-copy, .rl-ref-hero-art, .rl-ref-actions")
      .evaluateAll((elements) => elements.map((e) => e.getBoundingClientRect().toJSON()));
  const beforeGeometry = await geometry();
  const capture = async () => {
    await page.evaluate(() => {
      (window as any).silkProbe.capture = true;
    });
    await expect.poll(() => page.evaluate(() => (window as any).silkProbe.capture)).toBe(false);
    return page.evaluate(() => {
      const { width, height, pixels } = (window as any).silkProbe;
      return { width, height, pixels: pixels as number[] };
    });
  };
  const before = await capture();
  await page.waitForTimeout(1500);
  const after = await capture();
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  // Classify source pixels with the real foreground matte, independently from the shader.
  const mask = await page.evaluate(async () => {
    const image = new Image();
    image.src = "/home/hero-fg.webp";
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 504;
    canvas.height = 496;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, 504, 496).data;
    return Array.from({ length: 504 * 496 }, (_, i) => pixels[i * 4 + 3]);
  });
  const desktop = await page.evaluate(() => matchMedia("(min-width: 48rem)").matches);
  const scale = Math.max(before.width / 504, before.height / 496);
  const offsetX = desktop ? 0 : before.width - 504 * scale;
  const offsetY = (before.height - 496 * scale) / 2;
  let productPixels = 0;
  let changedProduct = 0;
  let changedSilk = 0;
  for (let y = 0; y < before.height; y += 4) {
    for (let x = 0; x < before.width; x += 4) {
      const artX = Math.floor((x + 0.5 - offsetX) / scale);
      const artY = Math.floor((before.height - y - 0.5 - offsetY) / scale);
      if (artX < 1 || artX >= 503 || artY < 1 || artY >= 495) continue;
      const i = ((y / 4) * Math.ceil(before.width / 4) + x / 4) * 3;
      const changed = [0, 1, 2].some((c) => before.pixels[i + c] !== after.pixels[i + c]);
      if (mask[artY * 504 + artX] === 255) {
        productPixels++;
        if (changed) changedProduct++;
      } else if (changed) changedSilk++;
    }
  }
  expect(productPixels).toBeGreaterThan(500);
  expect(changedProduct).toBe(0);
  expect(changedSilk).toBeGreaterThan(100);
  expect(await geometry()).toEqual(beforeGeometry);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test("offscreen and hidden tabs stop drawing and resume without resetting", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  const offscreen = await drawCount(page);
  await page.waitForTimeout(300);
  expect(await drawCount(page)).toBe(offscreen);
  await page.locator(".rl-ref-hero-stage").scrollIntoViewIfNeeded();
  await expect.poll(() => drawCount(page)).toBeGreaterThan(offscreen);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await drawCount(page);
  await page.waitForTimeout(250);
  expect(await drawCount(page)).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(() => drawCount(page)).toBeGreaterThan(hidden);
});

test("reduced motion avoids WebGL and the mask request, including live preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const maskRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("hero-fg.webp")) maskRequests.push(request.url());
  });
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  await page.locator(".rl-ref-hero-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await drawCount(page)).toBe(0);
  expect(maskRequests).toHaveLength(0);
  await expect(page.locator(".rl-ref-hero-poster")).toBeVisible();
  await expect(page.locator(".rl-ref-hero-silk")).toBeHidden();
  const supported = await page.evaluate(
    () => !!document.createElement("canvas").getContext("webgl"),
  );
  test.skip(
    !supported,
    "Static reduced-motion checks completed; WebGL unavailable for live resume",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".rl-ref-hero-stage")).toHaveAttribute("data-silk", "on");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".rl-ref-hero-stage")).not.toHaveAttribute("data-silk", "on");
  const stopped = await drawCount(page);
  await page.waitForTimeout(250);
  expect(await drawCount(page)).toBe(stopped);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => drawCount(page)).toBeGreaterThan(stopped);
});

test("a lost WebGL context restores the original poster", async ({ page }) => {
  await ready(page);
  await page.locator(".rl-ref-hero-silk").evaluate((canvas) => {
    (canvas as HTMLCanvasElement)
      .getContext("webgl")!
      .getExtension("WEBGL_lose_context")!
      .loseContext();
  });
  await expect(page.locator(".rl-ref-hero-stage")).not.toHaveAttribute("data-silk", "on");
  const stopped = await drawCount(page);
  await page.waitForTimeout(300);
  expect(await drawCount(page)).toBe(stopped);
  await expect(page.locator(".rl-ref-hero-poster")).toBeVisible();
});

test("unavailable WebGL or a failed mask keeps the matching static artwork", async ({ page }) => {
  await page.route("**/home/hero-fg.webp", (route) => route.abort());
  await page.goto("/?lang=ckb", { waitUntil: "networkidle" });
  await page.locator(".rl-ref-hero-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(await drawCount(page)).toBe(0);
  await expect(page.locator(".rl-ref-hero-stage")).not.toHaveAttribute("data-silk", "on");
  await expect(page.locator(".rl-ref-hero-poster")).toBeVisible();
  await page.unroute("**/home/hero-fg.webp");
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: any,
      ...args: any[]
    ) {
      if (type === "webgl") return null;
      return (original as any).call(this, type, ...args);
    } as any;
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".rl-ref-hero-stage").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(await drawCount(page)).toBe(0);
  await expect(page.locator(".rl-ref-hero-stage")).not.toHaveAttribute("data-silk", "on");
  await expect(page.locator(".rl-ref-hero-poster")).toBeVisible();
});
