import { handleStatus } from "../../../../src/lib/ai/identify.server";
import { aiEnv } from "../../../../src/lib/ai/env.server";

export default function statusRoute() {
  return handleStatus(aiEnv().env);
}
