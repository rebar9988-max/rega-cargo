import { handleIdentify } from "../../../../src/lib/ai/identify.server";
import { aiEnv } from "../../../../src/lib/ai/env.server";

export default function identifyRoute(event: { req: Request }) {
  let deps: ReturnType<typeof aiEnv>;
  try {
    deps = aiEnv();
  } catch {
    return Response.json(
      { ok: false, error: "unavailable" },
      {
        status: 503,
        headers: { "cache-control": "no-store" },
      },
    );
  }
  return handleIdentify(event.req, deps);
}
