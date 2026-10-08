import { handleIdentify } from "../../../../src/lib/ai/identify.server";
import { aiEnv } from "../../../../src/lib/ai/env.server";

export default function identifyRoute(event: { req: Request }) {
  return handleIdentify(event.req, aiEnv());
}
