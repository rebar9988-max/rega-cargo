/**
 * The message an administrator gets when their account signs in to the administration.
 *
 * Nobody watches the audit log continuously, so a sign-in that was not theirs would
 * otherwise go unnoticed until the damage showed. It carries no code, no link and no
 * session — reading it changes nothing — so it is safe to send to a mailbox.
 */
import { isLang, isRtl, type Lang } from "../langs.ts";
import { adminSignInCopy } from "./sign-in-copy.ts";

/** A fixed, unambiguous instant: UTC, to the minute, the same for every reader. */
export function noticeTime(when: Date): string {
  return `${when.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

const escape = (text: string) =>
  text.replace(
    /[&<>"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character,
  );

export function adminSignInNotice(lang: Lang, when: Date) {
  const t = adminSignInCopy(lang).notice;
  const at = noticeTime(when);
  const dir = isLang(lang) && isRtl(lang) ? "rtl" : "ltr";
  const text = `${t.intro}\n\n${t.when} ${at}\n\n${t.ignore}\n\nR&L · https://www.rlgo.net`;
  const html =
    `<!doctype html><html lang="${lang}" dir="${dir}"><body style="margin:0;padding:24px;background:#f6f6f4;font-family:system-ui,sans-serif;color:#1a1a1a">` +
    `<div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:start">` +
    `<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#c8102e;letter-spacing:.04em">R&amp;L</p>` +
    `<p style="margin:0 0 16px;font-size:16px">${escape(t.intro)}</p>` +
    `<p style="margin:0 0 16px;font-size:14px;color:#555">${escape(t.when)} <span dir="ltr">${escape(at)}</span></p>` +
    `<p style="margin:0;font-size:14px;color:#555">${escape(t.ignore)}</p>` +
    `</div></body></html>`;
  return { subject: t.subject, text, html };
}
