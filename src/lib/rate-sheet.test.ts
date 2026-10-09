import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { rateSheetData, rateSheetHash, rateSheetHtml } from "./rate-sheet.ts";

test("rl-cargo.pdf was generated from the current prices (run `npm run rate-sheet` after any price change)", () => {
  const lock = JSON.parse(readFileSync(new URL("./rate-sheet.lock.json", import.meta.url), "utf8")) as { hash: string };
  assert.equal(lock.hash, rateSheetHash());
});

test("rate sheet shows the same numbers as the app", () => {
  const data = rateSheetData();
  const html = rateSheetHtml(data, "file:///x");
  const express = data.modes.find((m) => m.id === "express")!;
  const economy = data.modes.find((m) => m.id === "economy")!;
  const road = data.modes.find((m) => m.id === "road")!;
  assert.equal(express.sampleCents, 3744);
  assert.equal(economy.sampleCents, 2208);
  assert.equal(road.minCents, 1800);
  assert.equal(data.iqdPerEur, 1520);
  for (const text of ["€37.44", "€22.08", "€18.00", "€7.80", "€4.60", "56,909 IQD", "1 € = 1,520 IQD", "2233rega@gmail.com"]) assert.ok(html.includes(text), text);
  assert.ok(!/RG-\d/.test(html), "no sample tracking numbers");
});
