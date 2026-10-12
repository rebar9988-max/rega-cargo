import { z } from "zod";
import type { ChatCopyKey } from "./chat-copy.ts";

export const CHAT_INTENTS = [
  "greeting",
  "search",
  "compare",
  "shipping",
  "tracking",
  "account",
  "support",
  "identify",
  "link",
] as const;
export type ChatIntent = (typeof CHAT_INTENTS)[number];
export const MAX_CHAT_MESSAGE = 2000;
export const MAX_CHAT_HISTORY = 8;
export const chatInput = z
  .object({
    message: z.string().trim().min(1).max(MAX_CHAT_MESSAGE),
    lang: z.enum(["ckb", "ku", "de", "en", "ar", "fa", "tr"]),
    consent: z.literal(true),
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().max(MAX_CHAT_MESSAGE),
          })
          .strict(),
      )
      .max(MAX_CHAT_HISTORY)
      .default([]),
    action: z.enum(CHAT_INTENTS).optional(),
    token: z.string().max(200).optional(),
    turnstile: z.string().max(2048).optional(),
  })
  .strict()
  .refine(
    (input) => input.history.reduce((n, m) => n + m.content.length, input.message.length) <= 6000,
    "context_too_large",
  );
export type ChatInput = z.infer<typeof chatInput>;
const planSchema = z
  .object({
    intent: z.enum(CHAT_INTENTS),
    query: z.string().trim().max(80),
    otherQuery: z.string().trim().max(80),
  })
  .strict();
export type ChatPlan = z.infer<typeof planSchema>;
export const chatPlanJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["intent", "query", "otherQuery"],
  properties: {
    intent: { type: "string", enum: [...CHAT_INTENTS] },
    query: { type: "string", maxLength: 80 },
    otherQuery: { type: "string", maxLength: 80 },
  },
};
export function parseChatPlan(content: unknown): ChatPlan | null {
  try {
    const result = planSchema.safeParse(
      typeof content === "string" ? JSON.parse(content) : content,
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
export type ChatCard = {
  title: string;
  href: string;
  kind: "product" | "catalogue";
  priceIqd?: number | null;
  group?: string;
};
export type ChatLink = { label: ChatCopyKey; href: string };
export type ChatReply = {
  intent: ChatIntent;
  message: ChatCopyKey;
  notice?: ChatCopyKey;
  cards: ChatCard[];
  links: ChatLink[];
  ref?: string;
};
export type ChatEvent =
  | { type: "progress"; stage: "thinking" | "searching" }
  | { type: "result"; reply: ChatReply }
  | { type: "error"; error: string };

/** Private order details never enter the model's context, including previous turns. */
export function modelHistory(history: ChatInput["history"]) {
  return history
    .filter((entry) => entry.role === "user" && !/RG-[A-Z0-9-]+|https?:\/\//i.test(entry.content))
    .map((entry) => ({ role: "user", content: entry.content }));
}

/** Bounded UTF-8 SSE reader; handles split multibyte characters and multiple events per chunk. */
export async function readChatStream(response: Response, onEvent: (event: ChatEvent) => void) {
  if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "unavailable");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("unavailable");
  const decoder = new TextDecoder();
  let buffer = "";
  let received = 0;
  let complete = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (value) received += value.byteLength;
      if (received > 64_000) throw new Error("invalid_output");
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let at: number;
      while ((at = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, at);
        buffer = buffer.slice(at + 2);
        if (!frame.startsWith("data: ")) continue;
        const event = JSON.parse(frame.slice(6)) as ChatEvent;
        if (event.type === "error") throw new Error(event.error);
        if (event.type === "result") complete = true;
        onEvent(event);
      }
      if (done) break;
    }
    if (!complete) throw new Error("unavailable");
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
