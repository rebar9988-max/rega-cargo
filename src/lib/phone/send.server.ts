function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function messageLines() {
  return {
    whatsapp: Boolean(env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_ID")),
    sms: Boolean(env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN") && env("TWILIO_FROM")),
  };
}

function text(code: string) {
  return `R&L: کۆدەکەت ${code} ـە. بە کەسێکی مەیدە. Your code is ${code}.`;
}

async function post(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
  if (!response.ok) {
    console.error("[phone] send failed", response.status, url.split("?")[0]);
    return false;
  }
  return true;
}

async function sendWhatsApp(phone: string, code: string) {
  const token = env("WHATSAPP_TOKEN");
  const phoneId = env("WHATSAPP_PHONE_ID");
  if (!token || !phoneId) return false;
  const template = env("WHATSAPP_TEMPLATE");
  const body = template
    ? {
        messaging_product: "whatsapp",
        to: phone.replace("+", ""),
        type: "template",
        template: {
          name: template,
          language: { code: env("WHATSAPP_TEMPLATE_LANG") ?? "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: code }] }],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: phone.replace("+", ""),
        type: "text",
        text: { body: text(code) },
      };
  try {
    return await post(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[phone] whatsapp", err instanceof Error ? err.message : "failed");
    return false;
  }
}

async function sendSms(phone: string, code: string) {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_FROM");
  if (!sid || !token || !from) return false;
  const form = new URLSearchParams({ To: phone, From: from, Body: text(code) });
  try {
    return await post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
  } catch (err) {
    console.error("[phone] sms", err instanceof Error ? err.message : "failed");
    return false;
  }
}

export async function deliverCode(phone: string, code: string) {
  const [whatsapp, sms] = await Promise.all([sendWhatsApp(phone, code), sendSms(phone, code)]);
  return { whatsapp, sms };
}
