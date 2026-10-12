import { test, expect } from "@playwright/test";

const copy = {
  en: "Open R&L chat",
  ckb: "کردنەوەی چاتی R&L",
  ar: "فتح محادثة R&L",
  fa: "باز کردن گفتگوی R&L",
  ku: "Sohbeta R&L veke",
  de: "R&L Chat öffnen",
  tr: "R&L sohbetini aç",
};
const mockReply = {
  intent: "search",
  message: "searchReply",
  cards: [{ title: "NIVEA", href: "/stores?q=Nivea", kind: "catalogue" }],
  links: [{ label: "market", href: "/market?q=Nivea" }],
};
async function open(page: import("@playwright/test").Page, lang = "en") {
  await page.goto(`/?lang=${lang}`);
  await page.getByRole("button", { name: copy[lang as keyof typeof copy] }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeVisible();
  return dialog;
}

test("chat opening, consent, stream, history, keyboard focus and closing", async ({ page }) => {
  let submitted = 0;
  await page.route("**/api/ai/chat", async (route) => {
    submitted++;
    const data = route.request().postDataJSON();
    expect(data.consent).toBe(true);
    expect(data.lang).toBe("en");
    await route.fulfill({
      contentType: "text/event-stream",
      body: `data: ${JSON.stringify({ type: "progress", stage: "thinking" })}\n\ndata: ${JSON.stringify({ type: "result", reply: mockReply })}\n\n`,
    });
  });
  const dialog = await open(page);
  const input = dialog.getByRole("textbox");
  await expect(input).toBeFocused();
  await input.fill("Find Nivea");
  await expect(dialog.getByRole("button", { name: "Send message" })).toBeDisabled();
  expect(submitted).toBe(0);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByRole("link", { name: /NIVEA/ })).toBeVisible();
  expect(submitted).toBe(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: copy.en })).toBeFocused();
  await page.getByRole("button", { name: copy.en }).click();
  await expect(dialog.getByText("Find Nivea", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "New conversation" }).click();
  await dialog.getByRole("button", { name: "Start fresh" }).click();
  await expect(dialog.getByText("How can I help?", { exact: true })).toBeVisible();
});

test("chat provider failure keeps text recoverable and exposes real service links", async ({
  page,
}) => {
  await page.route("**/api/ai/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"unavailable"}',
    }),
  );
  const dialog = await open(page);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("textbox").fill("Find Nivea");
  await dialog.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Contact customer service" })).toHaveAttribute(
    "href",
    "/contact?lang=en",
  );
  await expect(dialog.getByText("Find Nivea", { exact: true })).toBeVisible();
});

test("chat is localized in all seven languages and stays inside the viewport", async ({ page }) => {
  for (const lang of Object.keys(copy)) {
    const dialog = await open(page, lang);
    await expect(dialog).toHaveAttribute("dir", ["ckb", "ar", "fa"].includes(lang) ? "rtl" : "ltr");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(dialog.locator("select option")).toHaveCount(7);
    const bounds = await dialog.boundingBox();
    const viewport = page.viewportSize()!;
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.keyboard.press("Escape");
  }
});

test("launcher clears the existing mobile navigation and chat traps focus", async ({
  page,
  isMobile,
}) => {
  await page.goto("/?lang=en");
  const launcher = page.getByRole("button", { name: copy.en });
  const bar = page.locator('[data-layout="bottom-bar"]');
  if (isMobile && (await bar.isVisible())) {
    const a = await launcher.boundingBox();
    const b = await bar.boundingBox();
    expect(a!.y + a!.height).toBeLessThan(b!.y);
  }
  await launcher.click();
  const dialog = page.getByRole("dialog");
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
});

test("direct shipping suggestion reaches the existing backend without inference", async ({
  page,
}) => {
  const dialog = await open(page);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "How does shipping work?" }).click();
  await expect(dialog.getByRole("link", { name: "How does shipping work?" })).toHaveAttribute(
    "href",
    "/quote?lang=en",
  );
  await expect(
    dialog.getByText(/Shipping uses the greater of actual and volumetric weight/),
  ).toBeVisible();
});

test("chat gate rejects unconsented and cross-origin requests without inference", async ({
  request,
  baseURL,
}) => {
  const missingGate = await request.post("/api/ai/chat", {
    data: { message: "Hi", lang: "en", consent: true },
    headers: { origin: baseURL! },
  });
  expect(missingGate.status()).toBe(403);
  const crossOrigin = await request.post("/api/ai/chat", {
    data: { message: "Hi", lang: "en", consent: true },
    headers: { origin: "https://evil.example" },
  });
  expect(crossOrigin.status()).toBe(403);
});

test("sign-out clears this session's conversation and consent", async ({ page }) => {
  const dialog = await open(page);
  await dialog.getByRole("checkbox").check();
  await page.route("**/api/ai/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"unavailable"}',
    }),
  );
  await dialog.getByRole("textbox").fill("A private conversation");
  await dialog.getByRole("button", { name: "Send message" }).click();
  await expect(dialog.getByRole("button", { name: "Try again" })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("rl-session-changed")));
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: copy.en }).click();
  await expect(dialog.getByRole("checkbox")).not.toBeChecked();
  await expect(dialog.getByText("A private conversation", { exact: true })).toBeHidden();
});

test("stop interrupts an unfinished stream and permits a new message", async ({ page }) => {
  await page.route("**/api/ai/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route
      .fulfill({
        contentType: "text/event-stream",
        body: 'data: {"type":"progress","stage":"thinking"}\n\n',
      })
      .catch(() => undefined);
  });
  const dialog = await open(page);
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("textbox").fill("Find Nivea");
  await dialog.getByRole("button", { name: "Send message" }).click();
  await dialog.getByRole("button", { name: "Stop response" }).click();
  await expect(dialog.getByText("Response stopped.", { exact: true })).toBeVisible();
  await dialog.getByRole("textbox").fill("Another question");
  await expect(dialog.getByRole("button", { name: "Send message" })).toBeEnabled();
});

test("launcher waits for hydration on slow connections before accepting the first click", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/index-*.js", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/?lang=en", { waitUntil: "commit" });
  const launcher = page.getByRole("button", { name: copy.en });
  await expect(launcher).toBeVisible();
  await expect(launcher).toBeDisabled();
  release();
  await expect(launcher).toBeEnabled();
  await launcher.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("loading and loaded chat share one keyboard focus scope", async ({ page }) => {
  let release!: () => void;
  const loaded = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/chat-panel-*.js", async (route) => {
    await loaded;
    await route.continue();
  });
  await page.goto("/?lang=en");
  const launcher = page.getByRole("button", { name: copy.en });
  await launcher.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status")).toContainText("Thinking");
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  release();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(launcher).toBeFocused();
});
