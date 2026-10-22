/**
 * Sign-in code delivery through Resend (https://resend.com/docs/api-reference/emails/send-email).
 * The API key is the Worker secret RESEND_API_KEY. Neither the key, the code nor the
 * recipient is ever logged; failures log only the HTTP status.
 */
import { isLang, isRtl } from "../langs.ts";
import { emailOtpCopy } from "./copy.ts";

/** Verified Resend domain for R&L. The sender must stay on it. */
export const SENDER_DOMAIN = "rlgo.net";
const DEFAULT_FROM = `R&L <no-reply@${SENDER_DOMAIN}>`;

/** Worker secret or var (nodejs_compat populates process.env; __env__ is the raw binding map). */
export function readEnv(name: string): string | undefined {
  const fromBindings = (globalThis as { __env__?: Record<string, unknown> }).__env__?.[name];
  const value =
    typeof fromBindings === "string"
      ? fromBindings
      : typeof process !== "undefined"
        ? process.env[name]
        : undefined;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isProduction() {
  return typeof process !== "undefined" && process.env.NODE_ENV === "production";
}

/** Test-only sink. Never active in production, even if the env var is set. */
export function emailTestSinkEnabled() {
  return (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "test" &&
    process.env.RL_EMAIL_TEST_SINK === "1" &&
    !isProduction()
  );
}

/** HMAC key for stored codes: a dedicated secret, else the Better Auth secret. */
export function emailCodeSecret(): string | null {
  const secret = readEnv("EMAIL_CODE_SECRET") ?? readEnv("BETTER_AUTH_SECRET");
  if (secret) return secret;
  if (isProduction()) return null;
  const g = globalThis as typeof globalThis & { __rlEmailCodeSecret__?: string };
  g.__rlEmailCodeSecret__ ??= crypto.randomUUID() + crypto.randomUUID();
  return g.__rlEmailCodeSecret__;
}

/** Sender address, only ever on the verified R&L domain. */
export function senderAddress(): string {
  const from = readEnv("EMAIL_FROM");
  if (!from) return DEFAULT_FROM;
  const address = /<([^<>\s]+)>$/.exec(from)?.[1] ?? from;
  return address.toLowerCase().endsWith(`@${SENDER_DOMAIN}`) ? from : DEFAULT_FROM;
}

export function emailDeliveryConfigured() {
  if (!emailCodeSecret()) return false;
  return emailTestSinkEnabled() || Boolean(readEnv("RESEND_API_KEY"));
}

export function signInMessage(lang: string, code: string) {
  const t = emailOtpCopy(lang);
  const dir = isLang(lang) && isRtl(lang) ? "rtl" : "ltr";
  const text = `${t.mail.intro}\n\n${code}\n\n${t.mail.expiry}\n${t.mail.ignore}\n\nR&L · https://www.rlgo.net`;
  const html = `<!doctype html><html lang="${isLang(lang) ? lang : "en"}" dir="${dir}"><body style="margin:0;padding:24px;background:#f6f6f4;font-family:Inter,Arial,sans-serif;color:#141414">
<div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:start">
<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#c8102e;letter-spacing:.04em">R&amp;L</p>
<p style="margin:0 0 16px;font-size:16px">${t.mail.intro}</p>
<p dir="ltr" style="margin:0 0 16px;font-size:34px;font-weight:700;letter-spacing:.3em;text-align:center">${code}</p>
<p style="margin:0 0 8px;font-size:14px;color:#555">${t.mail.expiry}</p>
<p style="margin:0;font-size:14px;color:#555">${t.mail.ignore}</p>
</div></body></html>`;
  return { subject: t.mail.subject, text, html };
}

/**
 * Tell an administrator that their account just signed in to the administration.
 *
 * Never blocks the sign-in: a mail outage must not keep an administrator out, so this
 * reports failure instead of throwing, and waits only briefly.
 */
export async function deliverAdminSignInNotice(
  email: string,
  lang: string,
  when: Date,
): Promise<boolean> {
  const { adminSignInNotice } = await import("../admin/sign-in-notice.ts");
  const { isLang } = await import("../langs.ts");
  const message = adminSignInNotice(isLang(lang) ? lang : "en", when);
  if (emailTestSinkEnabled()) {
    (
      globalThis as { __rlLastAdminNotice?: { email: string; subject: string } }
    ).__rlLastAdminNotice = { email, subject: message.subject };
    return true;
  }
  const key = readEnv("RESEND_API_KEY");
  if (!key) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: senderAddress(), to: [email], ...message }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) console.error("[admin-sign-in] notice failed", response.status);
    return response.ok;
  } catch {
    console.error("[admin-sign-in] notice failed", "network");
    return false;
  }
}

/** True only when Resend accepted the message. */
export async function deliverEmailCode(
  email: string,
  code: string,
  lang: string,
): Promise<boolean> {
  if (emailTestSinkEnabled()) {
    (globalThis as { __rlLastEmailCode?: { email: string; code: string } }).__rlLastEmailCode = {
      email,
      code,
    };
    return true;
  }
  const key = readEnv("RESEND_API_KEY");
  if (!key) return false;
  const message = signInMessage(lang, code);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: senderAddress(), to: [email], ...message }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) console.error("[email-otp] delivery failed", response.status);
    return response.ok;
  } catch {
    console.error("[email-otp] delivery failed", "network");
    return false;
  }
}
