import { aiEnv, turnstileSiteKey } from "../../../../src/lib/ai/env.server";

type Limiter = { limit(input: { key: string }): Promise<{ success: boolean }> };

/**
 * Same rule as `allow()` in src/lib/rate-limit.server.ts (RL_LIMIT binding, allowed without
 * it, refused when it errors). Kept inline: importing that module from this Nitro route moves
 * shared code into the Worker entry chunk, which then exports a string (APPEARANCE_SCRIPT)
 * and workerd refuses to start ("Incorrect type for map entry").
 */
async function allowChallenge(ip: string): Promise<boolean> {
  const limiter = (globalThis as { __env__?: { RL_LIMIT?: Limiter } }).__env__?.RL_LIMIT;
  if (!limiter) return true;
  try {
    return (await limiter.limit({ key: `challenge:${ip}` })).success;
  } catch (err) {
    console.error("[rate-limit]", "challenge", err instanceof Error ? err.message : "failed");
    return false;
  }
}

export default async function challengeRoute(event: { req: Request }) {
  // Tokens are cheap to request, so issuing them is rate-limited per IP too.
  const ip = event.req.headers.get("cf-connecting-ip")?.trim() || "unknown";
  if (!(await allowChallenge(ip))) {
    return Response.json(
      { mode: "unavailable" },
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }
  const siteKey = turnstileSiteKey();
  if (siteKey && aiEnv().turnstileSecret) {
    return Response.json({ mode: "turnstile", siteKey });
  }
  const deps = aiEnv();
  const now = Date.now();
  if (deps.verifyToken && deps.usage) {
    const raw = (
      globalThis as {
        __env__?: {
          RL_AI_USAGE?: {
            idFromName(n: string): unknown;
            get(id: unknown): { issue(now: number): Promise<string> };
          };
        };
      }
    ).__env__;
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
