/** What an administrator is told after a sign-in, and what the message must never carry. */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adminSignInNotice, noticeTime } from "./sign-in-notice.ts";

const WHEN = new Date("2026-10-22T13:05:42.000Z");

describe("the administrative sign-in notice", () => {
  it("states one unambiguous instant, in UTC, to the minute", () => {
    assert.equal(noticeTime(WHEN), "2026-10-22 13:05 UTC");
    for (const lang of ["ckb", "en", "ar"] as const) {
      assert.ok(adminSignInNotice(lang, WHEN).text.includes("2026-10-22 13:05 UTC"), lang);
    }
  });

  it("is written in the reader's language, with the right direction", () => {
    const ckb = adminSignInNotice("ckb", WHEN);
    assert.match(ckb.subject, /بەڕێوەبەر/);
    assert.match(ckb.html, /dir="rtl"/);
    const en = adminSignInNotice("en", WHEN);
    assert.match(en.subject, /Administrator sign-in/);
    assert.match(en.html, /dir="ltr"/);
    assert.notEqual(ckb.text, en.text);
  });

  it("tells the reader what to do when it was not them", () => {
    for (const lang of ["ckb", "en", "ar"] as const) {
      const notice = adminSignInNotice(lang, WHEN);
      assert.ok(notice.text.length > 80, lang);
      assert.ok(notice.html.includes("</html>"), lang);
    }
  });

  it("carries nothing that could open a session: no code, no link to sign in", () => {
    for (const lang of ["ckb", "en", "ar"] as const) {
      const { text, html } = adminSignInNotice(lang, WHEN);
      for (const body of [text, html]) {
        assert.doesNotMatch(body, /\b\d{6}\b/, "no six-digit code");
        assert.doesNotMatch(body, /invite=|token=|code=/, "no credential in a link");
        // If it points anywhere at all, it is the plain site and nothing deeper.
        const links = body.match(/https?:\/\/[^\s"<]+/g) ?? [];
        assert.ok(
          links.every((link) => link === "https://www.rlgo.net"),
          `unexpected link in ${lang}: ${links.join(", ")}`,
        );
      }
    }
  });
});
