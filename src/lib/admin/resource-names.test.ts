/**
 * The operational editor's resource picker. An administrator reading the site in any of
 * its languages must find the list in that language, not in English.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LANGS } from "../langs.ts";
import { ADMIN_COPY, ADMIN_RESOURCES, ADMIN_RESOURCE_NAMES } from "./copy.ts";

const langs = LANGS.map((l) => l.id);

describe("resource names in the operational editor", () => {
  it("covers every language the app offers", () => {
    assert.deepEqual(Object.keys(ADMIN_RESOURCE_NAMES).sort(), [...langs].sort());
  });

  it("names every resource in every language, with nothing blank", () => {
    for (const lang of langs) {
      const names = ADMIN_RESOURCE_NAMES[lang];
      assert.deepEqual(Object.keys(names).sort(), [...ADMIN_RESOURCES].sort(), lang);
      for (const resource of ADMIN_RESOURCES) {
        assert.ok(names[resource].trim().length > 1, `${lang}.${resource}`);
      }
    }
  });

  it("gives each resource a name of its own, so the picker cannot be ambiguous", () => {
    for (const lang of langs) {
      const names = ADMIN_RESOURCES.map((r) => ADMIN_RESOURCE_NAMES[lang][r]);
      assert.equal(new Set(names).size, names.length, `${lang} repeats a name`);
    }
  });

  it("does not leave a language reading English, except English itself", () => {
    for (const lang of langs) {
      if (lang === "en") continue;
      const sameAsEnglish = ADMIN_RESOURCES.filter(
        (r) => ADMIN_RESOURCE_NAMES[lang][r] === ADMIN_RESOURCE_NAMES.en[r],
      );
      // "Transport" is the same word in German; everything else must differ.
      assert.ok(
        sameAsEnglish.length === 0 || (lang === "de" && sameAsEnglish.join() === "transport"),
        `${lang} still shows English for: ${sameAsEnglish.join(", ")}`,
      );
    }
  });

  it("calls the audit log exactly what the rest of the editor calls it", () => {
    for (const lang of langs) {
      assert.equal(ADMIN_RESOURCE_NAMES[lang].audit, ADMIN_COPY[lang][6], lang);
    }
  });
});
