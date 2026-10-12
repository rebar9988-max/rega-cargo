import { handleChat } from "../../../../src/lib/ai/chat.server";
import { aiEnv } from "../../../../src/lib/ai/env.server";
import { chatTools } from "../../../../src/lib/ai/chat-tools.server";

export default async function chatRoute(event: { req: Request }) {
  return handleChat(event.req, { ...aiEnv({ failClosed: true }), tools: chatTools });
}
