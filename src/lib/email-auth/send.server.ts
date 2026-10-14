/**
 * Sign-in code email through the Resend HTTP API (plain fetch, no SDK).
 * RESEND_API_KEY is a Worker secret; RESEND_FROM is an optional plain var for a
 * sender on the Resend-verified domain. Neither the address nor the code is logged.
 */

const DEFAULT_FROM = "R&L <no-reply@rlgo.net>";

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function resendConfigured() {
  return Boolean(env("RESEND_API_KEY"));
}

export function emailText(code: string) {
  return [
    `R&L: کۆدی چوونەژوورەوەت ${code} ـە.`,
    "ئەم کۆدە بۆ 5 خولەک کار دەکات و تەنها یەک جار بەکاردێت. بە کەسی مەدە.",
    "ئەگەر تۆ داوات نەکردووە، ئەم ئیمەیڵە پشتگوێ بخە.",
    "",
    `R&L: Your sign-in code is ${code}.`,
    "It works once and expires in 5 minutes. Never share it.",
    "If you did not ask for it, ignore this email.",
  ].join("\n");
}

export function emailHtml(code: string) {
  // The code is six digits from the server, so nothing here needs escaping.
  return `<!doctype html><html lang="ckb" dir="rtl"><body style="margin:0;padding:24px;background:#ffffff;color:#111111;font-family:'Noto Sans Arabic',Vazirmatn,Tahoma,Arial,sans-serif">
<p style="margin:0 0 16px;font-size:16px;line-height:1.7">کۆدی چوونەژوورەوەی R&amp;L:</p>
<p dir="ltr" style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;color:#b80000;font-family:Inter,Arial,sans-serif">${code}</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.7">ئەم کۆدە بۆ 5 خولەک کار دەکات و تەنها یەک جار بەکاردێت. بە کەسی مەدە.</p>
<p style="margin:0 0 24px;font-size:14px;line-height:1.7">ئەگەر تۆ داوات نەکردووە، ئەم ئیمەیڵە پشتگوێ بخە.</p>
<p dir="ltr" style="margin:0;font-size:13px;line-height:1.6;color:#555555;text-align:left;font-family:Inter,Arial,sans-serif">Your R&amp;L sign-in code is ${code}. It works once and expires in 5 minutes. Never share it.</p>
</body></html>`;
}

export async function deliverEmailCode(email: string, code: string): Promise<boolean> {
  const key = env("RESEND_API_KEY");
  if (!key) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env("RESEND_FROM") ?? DEFAULT_FROM,
        to: [email],
        subject: `R&L: ${code} — کۆدی چوونەژوورەوە / sign-in code`,
        text: emailText(code),
        html: emailHtml(code),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      console.error("[email] send failed", response.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send", err instanceof Error ? err.name : "failed");
    return false;
  }
}
