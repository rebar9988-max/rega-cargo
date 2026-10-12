/** Shared, bounded bot challenge. Widgets and listeners are removed on completion or abort. */
export function turnstileToken(siteKey: string, signal?: AbortSignal) {
  return new Promise<string | null>((resolve, reject) => {
    type Turnstile = {
      render(el: HTMLElement, opts: Record<string, unknown>): string;
      remove(id: string): void;
    };
    const w = window as Window & { turnstile?: Turnstile };
    const el = document.createElement("div");
    el.className = "rl-ai-challenge";
    let widget: string | undefined;
    let script: HTMLScriptElement | undefined;
    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      script?.removeEventListener("load", run);
      script?.removeEventListener("error", fail);
      if (widget) w.turnstile?.remove(widget);
      el.remove();
      if (signal?.aborted) reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      else resolve(token);
    };
    const abort = () => finish(null);
    const fail = () => finish(null);
    const run = () => {
      if (settled) return;
      (document.querySelector(".rl-chat-composer") ?? document.body).appendChild(el);
      widget = w.turnstile?.render(el, {
        sitekey: siteKey,
        callback: (token: string) => finish(token),
        "error-callback": fail,
        "expired-callback": fail,
      });
    };
    const timer = window.setTimeout(fail, 20_000);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) {
      abort();
      return;
    }
    if (w.turnstile) run();
    else {
      script =
        document.querySelector<HTMLScriptElement>(
          'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
        ) ?? document.createElement("script");
      script.addEventListener("load", run, { once: true });
      script.addEventListener("error", fail, { once: true });
      if (!script.src) {
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        document.head.appendChild(script);
      }
    }
  });
}

export async function gateFields({ signal }: { signal?: AbortSignal } = {}): Promise<{
  token?: string;
  turnstile?: string;
}> {
  const gate = await fetch("/api/ai/challenge", { signal, headers: { accept: "application/json" } })
    .then((res) => res.json() as Promise<{ mode?: string; token?: string; siteKey?: string }>)
    .catch((error) => {
      if (signal?.aborted) throw error;
      return null;
    });
  if (gate?.mode === "token" && gate.token) return { token: gate.token };
  if (gate?.mode === "turnstile" && gate.siteKey) {
    const token = await turnstileToken(gate.siteKey, signal);
    return token ? { turnstile: token } : {};
  }
  return {};
}
