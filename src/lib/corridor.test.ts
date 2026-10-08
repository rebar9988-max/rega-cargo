import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DESTS,
  IQD_PER_EUR,
  MODES,
  ORIGINS,
  SAMPLE_BOX,
  countryName,
  dutyEstimate,
  formatEur,
  formatIqdFromEur,
  getDest,
  getMode,
  getOrigin,
  placeName,
  priceShipment,
} from "./corridor.ts";

const berlin = ORIGINS.find((o) => o.id === "ber")!;
const erbil = DESTS.find((d) => d.id === "ebl")!;
const express = MODES.find((m) => m.id === "express")!;
const economy = MODES.find((m) => m.id === "economy")!;
const road = MODES.find((m) => m.id === "road")!;

describe("priceShipment", () => {
  it("prices the sample Berlin→Erbil express box (volumetric wins)", () => {
    const price = priceShipment({
      mode: express,
      origin: berlin,
      dest: erbil,
      weightKg: SAMPLE_BOX.kg,
      l: SAMPLE_BOX.l,
      w: SAMPLE_BOX.w,
      h: SAMPLE_BOX.h,
    });
    assert.equal(price.volumetric, 4.8);
    assert.equal(price.chargeable, 4.8);
    assert.equal(price.volumetricWins, true);
    assert.equal(price.minApplied, false);
    assert.equal(price.bulky, false);
    assert.equal(price.total, 37.44);
  });

  it("applies the road minimum when the rated fare is below it", () => {
    const price = priceShipment({
      mode: road,
      origin: berlin,
      dest: erbil,
      weightKg: SAMPLE_BOX.kg,
      l: SAMPLE_BOX.l,
      w: SAMPLE_BOX.w,
      h: SAMPLE_BOX.h,
    });
    // road divisor 4000 → volumetric 6.0 kg; 6 × 2.35 = 14.1 < min 18
    assert.equal(price.volumetric, 6);
    assert.equal(price.chargeable, 6);
    assert.equal(price.minApplied, true);
    assert.equal(price.total, 18);
  });

  it("charges destination surcharge on top of the minimum", () => {
    const baghdad = DESTS.find((d) => d.id === "bgw")!;
    const price = priceShipment({
      mode: road,
      origin: berlin,
      dest: baghdad,
      weightKg: SAMPLE_BOX.kg,
      l: SAMPLE_BOX.l,
      w: SAMPLE_BOX.w,
      h: SAMPLE_BOX.h,
    });
    assert.equal(price.minApplied, true);
    assert.equal(price.total, 18 + baghdad.surcharge);
  });

  it("uses actual weight when it beats volumetric, and marks bulky over 120 cm", () => {
    const dus = ORIGINS.find((o) => o.id === "dus")!;
    const price = priceShipment({
      mode: economy,
      origin: dus,
      dest: erbil,
      weightKg: 50,
      l: 130,
      w: 40,
      h: 40,
    });
    assert.equal(price.volumetricWins, false);
    assert.equal(price.volumetric, 41.6);
    assert.equal(price.chargeable, 50);
    assert.equal(price.bulky, true);
    // volumetric 130×40×40/5000 = 41.6 < 50 kg actual
    // 50 × 4.6 × 0.96 × 1.12 = 247.296 → cents → 247.3
    assert.equal(price.total, 247.3);
  });

  it("zero weight falls back to volumetric and still returns a finite total", () => {
    const price = priceShipment({
      mode: express,
      origin: berlin,
      dest: erbil,
      weightKg: 0,
      l: SAMPLE_BOX.l,
      w: SAMPLE_BOX.w,
      h: SAMPLE_BOX.h,
    });
    assert.equal(price.chargeable, 4.8);
    assert.equal(price.volumetricWins, true);
    assert.equal(price.total, 37.44);
    assert.ok(Number.isFinite(price.total));
  });

  it("rounds chargeable to one decimal and money to two (RTL-safe numerics)", () => {
    // 41 × 30 × 20 / 5000 = 4.92 → tenth → 4.9
    const price = priceShipment({
      mode: express,
      origin: berlin,
      dest: erbil,
      weightKg: 1,
      l: 41,
      w: 30,
      h: 20,
    });
    assert.equal(price.volumetric, 4.9);
    assert.equal(price.chargeable, 4.9);
    // 4.9 × 7.8 = 38.22 exactly
    assert.equal(price.total, 38.22);
    assert.match(formatEur(price.total), /^€38\.22$/);
  });
});

describe("dutyEstimate (customs planning)", () => {
  it("is free for documents and for personal goods at or under €200", () => {
    assert.equal(dutyEstimate("documents", 5000), 0);
    assert.equal(dutyEstimate("personal", 200), 0);
    assert.equal(dutyEstimate("personal", 0), 0);
  });

  it("charges 5% on personal above €200 and 8% on commercial", () => {
    assert.equal(dutyEstimate("personal", 250), 12.5);
    assert.equal(dutyEstimate("commercial", 100), 8);
    // rounding: 123.45 × 0.08 = 9.876 → 9.88
    assert.equal(dutyEstimate("commercial", 123.45), 9.88);
  });
});

describe("corridor lookups and formatters", () => {
  it("falls back to defaults for an unknown corridor id", () => {
    assert.equal(getOrigin("no-such-city").id, ORIGINS[0].id);
    assert.equal(getDest("no-such-city").id, DESTS[0].id);
    assert.equal(getMode("teleport").id, MODES[1].id); // economy
    assert.equal(getOrigin(undefined).id, "ber");
    assert.equal(getDest("").id, "ebl");
  });

  it("localizes place and country names without inventing unknown cities", () => {
    assert.equal(placeName(berlin, "ckb"), "بەرلین");
    assert.equal(placeName(berlin, "en"), "Berlin");
    assert.equal(placeName(berlin, "fa"), "برلین");
    assert.equal(placeName({ city: "Atlantis", cityKu: "ئەتلەنتیس" }, "fa"), "Atlantis");
    assert.equal(countryName(berlin, "de"), "Deutschland");
    assert.equal(countryName(berlin, "ckb"), "ئەڵمانیا");
  });

  it("formats euros and IQD from the fixed rate", () => {
    assert.equal(formatEur(37.44), "€37.44");
    assert.equal(IQD_PER_EUR, 1520);
    assert.equal(formatIqdFromEur(1), "1,520 IQD");
    assert.equal(formatIqdFromEur(37.44), "56,909 IQD");
  });
});
