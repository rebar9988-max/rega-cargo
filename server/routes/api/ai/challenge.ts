import { aiEnv, turnstileSiteKey } from "../../../../src/lib/ai/env.server";

export default async function challengeRoute(event: { req: Request }) {
  // Tokens are cheap to request, so issuing them is rate-limited per IP too.
  const { allow } = await import("../../../../src/lib/rate-limit.server");
  const ip = event.req.headers.get("cf-connecting-ip")?.trim() || "unknown";
  if (!(await allow("challenge", ip))) {
    return Response.json({ mode: "unavailable" }, { status: 429, headers: { "cache-control": "no-store" } });
  }
  const siteKey = turnstileSiteKey();
  if (siteKey && aiEnv().turnstileSecret) {
    return Response.json({ mode: "turnstile", siteKey });
  }
  const deps = aiEnv();
  const now = Date.now();
  if (deps.verifyToken && deps.usage) {
    const raw = (globalThis as { __env__?: { RL_AI_USAGE?: { idFromName(n: string): unknown; get(id: unknown): { issue(now: number): Promise<string> } } } }).__env__;
    const ns = raw?.RL_AI_USAGE;
    if (ns) {
      const token = await ns.get(ns.idFromName("global")).issue(now);
      return Response.json({ mode: "token", token });
    }
  }
  if (deps.tokenSecret) {
    const { signAiToken } = await import("../../../../src/lib/ai/challenge");
    return Response.json({ mode: "token", token: await signAiToken(deps.tokenSecret, now) });
  }
  return Response.json({ mode: "unavailable" }, { status: 503 });
}
