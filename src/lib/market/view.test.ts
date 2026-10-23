import { test } from "node:test";
import assert from "node:assert/strict";
import { marketView, validateMarketSearch } from "./search.ts";

const search = (raw: Record<string, unknown> = {}) => validateMarketSearch(raw);

test("an empty catalogue says so and shows no filters or pager", () => {
  assert.deepEqual(marketView(search(), 0, 1), {
    filters: false,
    empty: "catalogue",
    reset: false,
    pager: false,
  });
  // Sort order alone is not a filter.
  assert.equal(marketView(search({ sort: "new" }), 0, 1).empty, "catalogue");
});

test("an empty filtered result keeps the filters and offers a reset", () => {
  for (const raw of [
    { q: "kettle" },
    { category: "c1" },
    { brand: "B" },
    { min: "5" },
    { max: "9" },
    { stock: "in" },
    { saved: "1" },
  ])
    assert.deepEqual(
      marketView(search(raw), 0, 1),
      {
        filters: true,
        empty: "filtered",
        reset: true,
        pager: false,
      },
      JSON.stringify(raw),
    );
  // Past the last page: filters stay, and the pager leads back.
  assert.deepEqual(marketView(search({ page: 3 }), 0, 1), {
    filters: true,
    empty: "filtered",
    reset: false,
    pager: true,
  });
});

test("results show filters, no empty state, and the pager only with more than one page", () => {
  assert.deepEqual(marketView(search(), 12, 1), {
    filters: true,
    empty: null,
    reset: false,
    pager: false,
  });
  assert.equal(marketView(search(), 24, 2).pager, true);
});
