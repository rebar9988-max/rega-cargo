/**
 * The layout suite is served by `wrangler dev`, which puts every request through its own
 * ProxyWorker. Under the suite's parallel load that proxy sometimes drops a single request
 * and answers 500 with "Network connection lost" — it says so itself:
 *
 *   Error inside ProxyWorker (the affected request failed; the dev server continues):
 *   POST http://localhost:8788/api/auth/change-email (failed after 1 attempt):
 *   Network connection lost.
 *
 * (Observed on CI run 39747070993, 2026-10-22; the same commit passed and failed on
 * consecutive runs, and 160 identical requests sent without the rest of the suite running
 * were all answered correctly.)
 *
 * Such a request never reaches the Worker, so it carries NO information about what the
 * application would answer and must not be read as an answer. Everything else — including
 * any other 500 — is a real answer the test has to judge.
 */

export type Attempt = { status: number; body: string };

/** Exactly the proxy's own dropped-request signature, nothing wider. */
export function isDevProxyDrop(attempt: Attempt): boolean {
  return attempt.status === 500 && /Network connection lost/i.test(attempt.body);
}

/** A request the application accepted: anything that is not an error status. */
export function isAccepted(attempt: Attempt): boolean {
  return attempt.status >= 100 && attempt.status < 400;
}

export type Verdict =
  /** The application answered; `status` is what it said. */
  | { ok: true; status: number }
  /** The application accepted a request it must refuse. Never retried, never excused. */
  | { ok: false; reason: "accepted"; status: number }
  /** Every attempt was dropped by the dev proxy, so the endpoint was never exercised. */
  | { ok: false; reason: "all_dropped" };

/**
 * What a sequence of attempts at one endpoint proves. An acceptance anywhere in the
 * sequence fails immediately — a later refusal cannot make an earlier acceptance safe.
 */
export function denialVerdict(attempts: readonly Attempt[]): Verdict {
  const accepted = attempts.find(isAccepted);
  if (accepted) return { ok: false, reason: "accepted", status: accepted.status };
  const answered = attempts.find((attempt) => !isDevProxyDrop(attempt));
  return answered ? { ok: true, status: answered.status } : { ok: false, reason: "all_dropped" };
}
