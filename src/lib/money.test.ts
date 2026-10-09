import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESTS,
  IQD_PER_EUR,
  MODES,
  ORIGINS,
  dutyEstimate,
  formatIqdFromEur,
  iqdFromCents,
  priceShipment,
  type Contents,
  type Dest,
  type Mode,
  type Origin,
} from "./corridor.ts";
import { landedEstimate } from "./ai/landed.ts";

const berlin = ORIGINS.find((o) => o.id === "ber")!;
const erbil = DESTS.find((d) => d.id === "ebl")!;
const mode = (id: string) => MODES.find((m) => m.id === id)!;

/** Frozen copy of the float implementation before the integer-cents refactor. */
function legacyPrice(input: { mode: Mode; origin: Origin; dest: Dest; weightKg: number; l: number; w: number; h: number }) {
  const tenth = (n: number) => Math.round(n * 10) / 10;
  const cents = (n: number) => Math.round(n * 100) / 100;
  const volumetric = tenth((input.l * input.w * input.h) / input.mode.divisor);
  const chargeable = tenth(Math.max(input.weightKg, volumetric));
  const bulky = input.l > 120 || input.w > 120 || input.h > 120;
  let rated = chargeable * input.mode.perKg * input.origin.factor;
  if (bulky) rated *= 1.12;
  rated = cents(rated);
  const minApplied = rated < input.mode.min;
  const total = cents(Math.max(rated, input.mode.min) + input.dest.surcharge);
  return { volumetric, chargeable, minApplied, bulky, total };
}

describe("money: locked numbers (must never change without an explicit price decision)", () => {
  const box = { origin: berlin, dest: erbil, l: 0, w: 0, h: 0 };
  it("4.8 kg × 7.80 = 37.44 (express)", () => {
    const p = priceShipment({ ...box, mode: mode("express"), weightKg: 4.8 });
    assert.equal(p.totalCents, 3744);
    assert.equal(p.total, 37.44);
  });
  it("4.8 kg × 4.60 = 22.08 (economy)", () => {
    const p = priceShipment({ ...box, mode: mode("economy"), weightKg: 4.8 });
    assert.equal(p.totalCents, 2208);
    assert.equal(p.total, 22.08);
  });
  it("land (road) minimum is 18.00", () => {
    const p = priceShipment({ ...box, mode: mode("road"), weightKg: 1 });
    assert.equal(p.minApplied, true);
    assert.equal(p.totalCents, 1800);
  });
  it("volumetric divisor 5000 for air: 40×30×20 cm box → 4.8 kg chargeable", () => {
    const p = priceShipment({ origin: berlin, dest: erbil, mode: mode("express"), weightKg: 3.2, l: 40, w: 30, h: 20 });
    assert.equal(p.volumetric, 4.8);
    assert.equal(p.chargeable, 4.8);
    assert.equal(p.totalCents, 3744);
  });
  it("1 € = 1520 IQD, converted once from the final cents", () => {
    assert.equal(IQD_PER_EUR, 1520);
    assert.equal(iqdFromCents(3744), 56909);
    assert.equal(iqdFromCents(1800), 27360);
    assert.equal(iqdFromCents(2208), 33562);
    assert.equal(formatIqdFromEur(37.44), "56,909 IQD");
  });
  it("all totals are integer cents", () => {
    for (const m of MODES)
      for (const kg of [0.1, 0.5, 1, 2.3, 4.8, 9.99, 33.3, 70]) {
        const p = priceShipment({ ...box, mode: m, weightKg: kg });
        assert.ok(Number.isInteger(p.totalCents));
        assert.equal(p.total, p.totalCents / 100);
      }
  });
});

describe("money: integer-cents refactor gives exactly the old outputs", () => {
  it("matches the legacy float implementation on a dense grid", () => {
    let checked = 0;
    for (const m of MODES)
      for (const origin of ORIGINS)
        for (const dest of DESTS)
          for (let kg10 = 1; kg10 <= 700; kg10 += 7)
            for (const [l, w, h] of [[0, 0, 0], [40, 30, 20], [121, 50, 40], [200, 200, 200], [33, 17, 9]]) {
              const input = { mode: m, origin, dest, weightKg: kg10 / 10, l, w, h };
              const a = priceShipment(input);
              const b = legacyPrice(input);
              assert.equal(a.total, b.total, JSON.stringify({ ...input, mode: m.id, origin: origin.id, dest: dest.id }));
              assert.equal(a.minApplied, b.minApplied);
              assert.equal(Math.round(a.total * IQD_PER_EUR), iqdFromCents(a.totalCents));
              checked++;
            }
    assert.ok(checked > 10_000);
  });
  it("duty and landed totals are unchanged", () => {
    for (const contents of ["documents", "personal", "commercial"] as Contents[])
      for (const value of [0, 50, 199.99, 200, 200.01, 333.33, 1234.56]) {
        const old = Math.round(value * (contents === "personal" ? 0.05 : 0.08) * 100) / 100;
        const expected = contents === "documents" || (contents === "personal" && value <= 200) ? 0 : old;
        assert.equal(dutyEstimate(contents, value), expected);
      }
    const est = landedEstimate({ priceEur: 249.99, weightKg: 4.8, modeId: "express", contents: "personal" })!;
    assert.equal(est.shippingEur, 37.44);
    assert.equal(est.dutyEur, 12.5);
    assert.equal(est.totalEur, 299.93);
    assert.equal(est.totalIqd, Math.round(299.93 * 1520));
  });
});
