import { aiEnv, turnstileSiteKey } from "../../../../src/lib/ai/env.server";
import { signAiToken } from "../../../../src/lib/ai/challenge";

export default async function challengeRoute() {
  const headers = { "cache-control": "no-store" };
  try {
    const siteKey = turnstileSiteKey();
    const deps = aiEnv();
    if (siteKey && deps.turnstileSecret) {
      return Response.json({ mode: "turnstile", siteKey }, { headers });
    }
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
        return Response.json({ mode: "token", token }, { headers });
      }
    }
    if (deps.tokenSecret) {
      return Response.json(
        { mode: "token", token: await signAiToken(deps.tokenSecret, now) },
        { headers },
      );
    }
  } catch {
    // Challenge-storage failures cannot issue a token or expose diagnostics.
  }
  return Response.json({ mode: "unavailable" }, { status: 503, headers });
}
