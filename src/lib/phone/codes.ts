/** Phone-code helpers that do not touch the database or cookies. */

const encoder = new TextEncoder();

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

/** Test-only sink. Never active in production, even if the env var is set. */
export function phoneTestSinkEnabled() {
  return process.env.NODE_ENV === "test" && process.env.RL_PHONE_TEST_SINK === "1" && !isProduction();
}

export function codeSecret() {
  const fromEnv = process.env.PHONE_CODE_SECRET?.trim();
  if (fromEnv) return fromEnv;
  if (isProduction()) {
    throw new Error("PHONE_CODE_SECRET is not set");
  }
  const g = globalThis as typeof globalThis & { __rlPhoneCodeSecret__?: string };
  g.__rlPhoneCodeSecret__ ??= crypto.randomUUID() + crypto.randomUUID();
  return g.__rlPhoneCodeSecret__;
}

export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function codesMatch(actualHex: string, expectedHex: string) {
  if (actualHex.length !== expectedHex.length || actualHex.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < actualHex.length; i += 1) diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  return diff === 0;
}

export async function hashCode(secret: string, phone: string, code: string) {
  return hmacHex(secret, `${phone}\n${code}`);
}

/** Six digits, 100000–999999, from crypto.randomInt (not Math.random). */
export async function randomCode() {
  const { randomInt } = await import("node:crypto");
  return String(randomInt(100000, 1000000));
}

export async function verifyTurnstile(secret: string, token: string, ip: string) {
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return false;
    const json = (await response.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
