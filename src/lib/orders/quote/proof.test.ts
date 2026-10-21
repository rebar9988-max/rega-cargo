import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROOF_TTL_MS, signProof, verifyProof } from "./proof.ts";
import { signQuote } from "../../quote-token.ts";

const SECRET = "s".repeat(40);
const payload = {
  url: "https://www.zara.com/p/1",
  host: "www.zara.com",
  title: "Tee",
  imageUrl: null,
  priceMinor: 1999,
  currency: "EUR",
  priceSource: "jsonld" as const,
  categoryTexts: ["Men", "T-Shirts"],
  retrievedAt: "2026-10-21T10:00:00.000Z",
};

describe("import proof", () => {
  it("round-trips and keeps the exact values", async () => {
    const token = await signProof(payload, SECRET, 1_000);
    const p = await verifyProof(token, SECRET, 2_000);
    assert.ok(p);
    assert.equal(p.priceMinor, 1999);
    assert.equal(p.currency, "EUR");
    assert.equal(p.url, payload.url);
  });
  it("expires", async () => {
    const token = await signProof(payload, SECRET, 1_000);
    assert.equal(await verifyProof(token, SECRET, 1_000 + PROOF_TTL_MS + 1), null);
  });
  it("rejects a tampered body, another secret, junk and a re-spelled signature", async () => {
    const token = await signProof(payload, SECRET, 1_000);
    const [body, sig] = token.split(".") as [string, string];
    const forged = btoa(JSON.stringify({ v: 1, ...payload, priceMinor: 1, exp: 9e15 })).replace(
      /=+$/,
      "",
    );
    assert.equal(await verifyProof(`${forged}.${sig}`, SECRET, 2_000), null);
    assert.equal(await verifyProof(token, "x".repeat(40), 2_000), null);
    for (const bad of [
      "",
      "a.b.c",
      "nodot",
      5,
      null,
      undefined,
      "x".repeat(7000),
      `${body}.`,
      `.${sig}`,
    ]) {
      assert.equal(await verifyProof(bad, SECRET, 2_000), null, String(bad));
    }
    // a different final character that decodes to the same bytes is not accepted
    const last = sig.at(-1)!;
    const alt = "AQgw".includes(last) ? "AQgw".replace(last, "")[0] : "A";
    if (alt !== last)
      assert.equal(await verifyProof(`${body}.${sig.slice(0, -1)}${alt}`, SECRET, 2_000), null);
  });
  it("a shipping quote token is never accepted as an import proof (domain separation)", async () => {
    const { token } = await signQuote(
      {
        fromId: "a",
        toId: "b",
        mode: "air" as never,
        kg: 1,
        l: 1,
        w: 1,
        h: 1,
        total: 1,
        chargeable: 1,
      },
      SECRET,
      1_000,
    );
    assert.equal(await verifyProof(token, SECRET, 2_000), null);
  });
});
