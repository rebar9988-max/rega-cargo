import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleOwnerAuth } = await import("@/lib/owner/auth-route.server");
        return handleOwnerAuth(request);
      },
      POST: async ({ request }) => {
        const { handleOwnerAuth } = await import("@/lib/owner/auth-route.server");
        return handleOwnerAuth(request);
      },
    },
  },
});
