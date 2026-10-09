import { aiEnv } from "./env.server";
import { verifyAiToken } from "./challenge";
import { verifyTurnstile } from "../phone/codes";
import { ipKey } from "./usage";

/**
 * Bot gate shared by forms: Cloudflare Turnstile when TURNSTILE_SECRET is set,
 * otherwise the short-lived signed token from GET /api/ai/challenge.
 */
export async function verifyGate(input: { token?: unknown; turnstile?: unknown }, ip: string): Promise<boolean> {
  const deps = aiEnv();
  const now = Date.now();
  const turnstile = deps.turnstileSecret?.trim();
  if (turnstile) return verifyTurnstile(turnstile, String(input.turnstile ?? ""), ipKey(ip));
  const token = typeof input.token === "string" ? input.token.slice(0, 200) : "";
  if (!token) return false;
  if (deps.verifyToken) return deps.verifyToken(token, now);
  if (deps.tokenSecret) return verifyAiToken(deps.tokenSecret, token, now);
  return false;
}
