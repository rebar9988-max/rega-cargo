/**
 * Is R&L AI switched on for this deployment?
 *
 * Server: read from the Worker env (RL_AI_ENABLED === "true" and an AI binding).
 * The root document stamps the answer on <html data-rl-ai="1">, so the client
 * reads the same value during hydration (no extra request, no layout shift).
 */
export function rlAiEnabled(): boolean {
  if (typeof document !== "undefined") return document.documentElement.dataset.rlAi === "1";
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const flag = env?.RL_AI_ENABLED ?? (typeof process !== "undefined" ? process.env.RL_AI_ENABLED : undefined);
  return flag === "true" && Boolean(env?.AI);
}
