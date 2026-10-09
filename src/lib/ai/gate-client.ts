/**
 * Browser side of the bot gate (see gate.server.ts): fetches /api/ai/challenge
 * and returns either a signed token or a Turnstile token to send with a form.
 */
export function turnstileToken(siteKey: string) {
  return new Promise<string | null>((resolve) => {
    const w = window as Window & { turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void } };
    const run = () => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      w.turnstile?.render(el, {
        sitekey: siteKey,
        callback: (token: string) => resolve(token),
        "error-callback": () => resolve(null),
      });
    };
    if (w.turnstile) run();
    else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.onload = run;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    }
  });
}

export async function gateFields(): Promise<{ token?: string; turnstile?: string }> {
  const gate = await fetch("/api/ai/challenge", { headers: { accept: "application/json" } })
    .then((res) => res.json() as Promise<{ mode?: string; token?: string; siteKey?: string }>)
    .catch(() => null);
  if (gate?.mode === "token" && gate.token) return { token: gate.token };
  if (gate?.mode === "turnstile" && gate.siteKey) {
    const token = await turnstileToken(gate.siteKey);
    return token ? { turnstile: token } : {};
  }
  return {};
}
