import { checkText } from "../../../lib/compliance/check.ts";
import { verifyAiToken } from "../../../lib/ai/challenge.ts";
import {
  AI_MODEL,
  DEFAULT_DAILY_CAP,
  INFERENCE_TIMEOUT_MS,
  PER_VISITOR_DAILY,
  PER_VISITOR_HOURLY,
  NEW_VISITOR_RESERVE,
  type IdentifyDeps,
} from "../../../lib/ai/identify.server.ts";
import { ipKey, parseCap, visitorId } from "../../../lib/ai/usage.ts";
import { extractModelContent } from "../../../lib/ai/schema.ts";
import {
  chatInput,
  chatPlanJsonSchema,
  parseChatPlan,
  type ChatCard,
  type ChatEvent,
  type ChatInput,
  type ChatPlan,
} from "../domain/assistant-types.ts";
import { classifyIntent } from "../domain/intent-classifier.ts";
import { instructionAttack, unrelatedTask } from "../domain/scope-policy.ts";
import { replyFor, validPlan } from "../domain/response-policy.ts";
import { SYSTEM_PROMPT } from "../prompts/system-prompt.ts";

export type AssistantDeps = IdentifyDeps & {
  gate?: (input: { token?: unknown; turnstile?: unknown }, ip: string) => Promise<boolean>;
  search: (
    query: string,
    lang: ChatInput["lang"],
  ) => Promise<{ cards: ChatCard[]; unavailable: boolean }>;
};
const MAX_BODY = 24_000;
function errorResponse(error: string, status: number) {
  return Response.json({ ok: false, error }, { status, headers: { "cache-control": "no-store" } });
}
export function deadline<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  const expires = Date.now() + 5000;
  try {
    while (true) {
      const { done, value } = await deadline(reader.read(), Math.max(1, expires - Date.now()));
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) return null;
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } finally {
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

/** Retrieved data is never sent to inference and cannot define tools, instructions or URLs. */
export function verifiedCards(cards: ChatCard[]): ChatCard[] {
  return cards
    .filter(
      (c) =>
        c.kind === "product" &&
        /^\/market\/[a-z0-9%_-]+$/iu.test(c.href) &&
        typeof c.title === "string" &&
        !instructionAttack(c.title) &&
        !unrelatedTask(c.title) &&
        checkText(c.title).decision !== "block" &&
        !/[<>]/u.test(c.title),
    )
    .slice(0, 8)
    .map((c) => ({
      title: c.title.slice(0, 160),
      href: c.href,
      kind: "product",
      priceIqd:
        typeof c.priceIqd === "number" && Number.isFinite(c.priceIqd) && c.priceIqd >= 0
          ? c.priceIqd
          : null,
    }));
}

export async function handleAssistant(request: Request, deps: AssistantDeps): Promise<Response> {
  if (deps.env.RL_AI_ENABLED !== "true") return errorResponse("disabled", 404);
  if (request.method !== "POST") return errorResponse("method", 405);
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return errorResponse("forbidden", 403);
  const ip = ipKey(request.headers.get("cf-connecting-ip") ?? "unknown");
  try {
    if (deps.limit && !(await deadline(deps.limit(ip), 5000)))
      return errorResponse("rate_limited", 429);
  } catch {
    return errorResponse("unavailable", 503);
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return errorResponse("bad_request", 415);
  if (Number(request.headers.get("content-length")) > MAX_BODY)
    return errorResponse("too_large", 413);
  let input: ChatInput;
  try {
    const raw = await readBody(request);
    if (raw === null) return errorResponse("too_large", 413);
    const parsed = chatInput.safeParse(JSON.parse(raw));
    if (!parsed.success) return errorResponse("bad_request", 400);
    input = parsed.data;
  } catch {
    return errorResponse("bad_request", 400);
  }
  const scope = classifyIntent(input);
  // action is an untrusted hint, never a scope override. Refusals need no inference or bot challenge.
  if (scope.intent !== "refusal" && checkText(input.message).decision === "block")
    return errorResponse("prohibited", 400);
  const now = (deps.now ?? (() => new Date()))();
  if (scope.intent !== "refusal" && !deps.skipGate) {
    try {
      const allowed = deps.turnstileSecret?.trim()
        ? deps.gate
          ? await deadline(deps.gate(input, ip), 5000)
          : false
        : deps.verifyToken
          ? await deadline(deps.verifyToken(input.token ?? "", now.getTime()), 5000)
          : deps.tokenSecret
            ? await verifyAiToken(deps.tokenSecret, input.token ?? "", now.getTime())
            : false;
      if (!allowed) return errorResponse("forbidden", 403);
    } catch {
      return errorResponse("unavailable", 503);
    }
  }
  if (scope.infer) {
    if (!deps.env.AI || !deps.usage) return errorResponse("unavailable", 503);
    const iso = now.toISOString();
    const cap = parseCap(deps.env.RL_AI_DAILY_CAP, DEFAULT_DAILY_CAP);
    try {
      const decision = await deadline(
        deps.usage.consume({
          day: iso.slice(0, 10),
          hour: iso.slice(0, 13),
          visitor: await visitorId(ip, iso.slice(0, 10)),
          dailyCap: cap,
          perVisitorDaily: PER_VISITOR_DAILY,
          perVisitorHourly: PER_VISITOR_HOURLY,
          reserve: cap > NEW_VISITOR_RESERVE ? NEW_VISITOR_RESERVE : 0,
        }),
        5000,
      );
      if (!decision.ok) return errorResponse(decision.reason, 429);
    } catch {
      return errorResponse("unavailable", 503);
    }
  }
  let cancelled = request.signal.aborted;
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => {
        if (!cancelled)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      const abort = () => {
        cancelled = true;
      };
      request.signal.addEventListener("abort", abort, { once: true });
      try {
        if (cancelled) return;
        send({ type: "progress", stage: "thinking" });
        let plan: ChatPlan = { intent: scope.intent, query: "", otherQuery: "" };
        if (scope.infer) {
          const result = await deadline(
            deps.env.AI!.run(AI_MODEL, {
              messages: [
                { role: "system", content: `${SYSTEM_PROMPT} Authorized intent: ${scope.intent}.` },
                { role: "user", content: input.message },
              ],
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "rl_assistant_plan",
                  strict: true,
                  schema: chatPlanJsonSchema,
                },
              },
              chat_template_kwargs: { enable_thinking: false },
              max_completion_tokens: 200,
              temperature: 0,
            }),
            deps.timeoutMs ?? INFERENCE_TIMEOUT_MS,
          );
          const candidate = parseChatPlan(extractModelContent(result));
          if (!validPlan(candidate, scope.intent, input.message)) throw new Error("invalid_output");
          plan = candidate;
        }
        if (checkText(`${plan.query}\n${plan.otherQuery}`).decision === "block")
          throw new Error("prohibited");
        if (cancelled) return;
        const reply = replyFor(plan);
        reply.locale = input.lang;
        if (
          scope.intent === "refusal" &&
          ["ckb", "ar", "fa"].includes(input.lang) &&
          /^[\x20-\x7e]+$/.test(input.message)
        )
          reply.locale = "en";
        if (
          scope.intent === "refusal" &&
          input.lang === "ckb" &&
          /(?:ماذا|ما هو|اكتب|تجاهل|اشرح)/.test(input.message)
        )
          reply.locale = "ar";
        if ((plan.intent === "search" || plan.intent === "compare") && plan.query) {
          send({ type: "progress", stage: "searching" });
          const queries = [
            ...new Set([
              plan.query,
              ...(plan.intent === "compare" && plan.otherQuery ? [plan.otherQuery] : []),
            ]),
          ];
          const found = await deadline(
            Promise.all(queries.map((q) => deps.search(q, input.lang))),
            6000,
          );
          const seen = new Set<string>();
          reply.cards = verifiedCards(found.flatMap((r) => r.cards)).filter(
            (c) => !seen.has(c.href) && Boolean(seen.add(c.href)),
          );
          if (found.some((r) => r.unavailable)) reply.notice = "marketUnavailable";
          if (!reply.cards.length) reply.message = "noMatches";
        }
        send({ type: "result", reply });
      } catch (error) {
        const code =
          error instanceof Error &&
          ["timeout", "invalid_output", "prohibited"].includes(error.message)
            ? error.message
            : "unavailable";
        send({ type: "error", error: code });
        // A timed-out provider can still consume resources. Never refund attempts or auto-retry.
      } finally {
        request.signal.removeEventListener("abort", abort);
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-content-type-options": "nosniff",
    },
  });
}
