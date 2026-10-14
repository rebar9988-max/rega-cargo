import { handleAssistant } from "../../../../src/modules/rl-ai/application/assistant-service";
import { searchMarketplace } from "../../../../src/modules/rl-ai/infrastructure/marketplace-client";
import { verifyGate } from "../../../../src/modules/rl-ai/infrastructure/ai-gateway-adapter";
import { aiEnv } from "../../../../src/lib/ai/env.server";

import { configureAssistant } from "../../../../src/lib/admin/ai-contract.server";

export default async function chatRoute(event: { req: Request }) {
  try {
    return handleAssistant(event.req, {
      ...(await configureAssistant(aiEnv())),
      gate: verifyGate,
      search: searchMarketplace,
    });
  } catch {
    return Response.json(
      { ok: false, error: "unavailable" },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
