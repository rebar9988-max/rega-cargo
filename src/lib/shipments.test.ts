import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DESTS, MODES, ORIGINS } from "./corridor.ts";
import { SHIPMENTS, currentEvent, findShipment } from "./shipments.ts";
import { localizedTrack } from "./track-copy.ts";

describe("demo tracking catalog", () => {
  it("locks the four public sample shipment ids and their corridors", () => {
    assert.equal(SHIPMENTS.length, 4);
    assert.deepEqual(
      SHIPMENTS.map((s) => s.id),
      ["RG-48291", "RG-22910", "RG-11084", "RG-77302"],
    );
    for (const shipment of SHIPMENTS) {
      assert.ok(
        ORIGINS.some((o) => o.id === shipment.fromId),
        shipment.id,
      );
      assert.ok(
        DESTS.some((d) => d.id === shipment.toId),
        shipment.id,
      );
      assert.ok(
        MODES.some((m) => m.id === shipment.mode),
        shipment.id,
      );
      assert.ok(shipment.events.length >= 1, shipment.id);
      assert.ok(shipment.kg > 0, shipment.id);
      const nowCount = shipment.events.filter((e) => e.phase === "now").length;
      assert.equal(nowCount, 1, `${shipment.id} must have exactly one "now" event`);
    }
  });

  it("finds a shipment case-insensitively and ignores surrounding spaces", () => {
    const a = findShipment("rg-48291");
    const b = findShipment("  RG-48291  ");
    assert.equal(a?.id, "RG-48291");
    assert.equal(b?.id, "RG-48291");
    assert.equal(a?.mode, "express");
    assert.equal(a?.fromId, "ber");
    assert.equal(a?.toId, "ebl");
  });

  it("returns undefined for an unknown tracking id", () => {
    assert.equal(findShipment("RG-00000"), undefined);
    assert.equal(findShipment(""), undefined);
    assert.equal(findShipment("not-a-tracking-number"), undefined);
  });
});

describe("currentEvent", () => {
  it("returns the in-progress event for each demo shipment", () => {
    assert.equal(currentEvent(findShipment("RG-48291")!).title, "Out for delivery");
    assert.equal(
      currentEvent(findShipment("RG-22910")!).title,
      "Clearance paused — invoice name does not match",
    );
    assert.equal(currentEvent(findShipment("RG-11084")!).title, "At the border");
    assert.equal(currentEvent(findShipment("RG-77302")!).title, "Delivered");
  });

  it("falls back to the last event when nothing is marked now", () => {
    const shipment = findShipment("RG-48291")!;
    const withoutNow = {
      ...shipment,
      events: shipment.events.map((e) => ({ ...e, phase: "done" as const })),
    };
    assert.equal(currentEvent(withoutNow).title, shipment.events.at(-1)!.title);
  });
});

describe("localizedTrack", () => {
  it("keeps Sorani and English, and maps other languages from the catalog", () => {
    const en = "Out for delivery";
    const ku = "دەرچووە بۆ گەیاندن";
    assert.equal(localizedTrack("ckb", en, ku), ku);
    assert.equal(localizedTrack("en", en, ku), en);
    assert.equal(localizedTrack("fa", en, ku), "برای تحویل خارج شد");
    assert.equal(localizedTrack("de", en, ku), "In Zustellung");
  });

  it("translates month tokens when the line itself is unmapped", () => {
    assert.equal(localizedTrack("fa", "04 Oct · 09:40", "x"), "04 اکتبر · 09:40");
    assert.equal(localizedTrack("tr", "24 Sep · 16:20", "x"), "24 Eyl · 16:20");
  });
});
