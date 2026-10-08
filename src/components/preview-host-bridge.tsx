/**
 * Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
 * (and later receive registered routes). Noops when the app is not embedded.
 *
 * The bridge (and its zod schemas) is loaded on demand only when the page is
 * framed, so regular visitors never download or parse it.
 */

import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export function PreviewHostBridge() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    let cancelled = false;
    let uninstall: (() => void) | undefined;
    void import("@/lib/preview-host-bridge").then(
      ({ collectRoutePathsFromTree, installPreviewHostBridge }) => {
        if (cancelled) return;
        uninstall = installPreviewHostBridge({
          navigate: (path) => {
            router.history.push(path);
          },
          getRoutePaths: () => collectRoutePathsFromTree(router.routeTree),
        });
      },
    );
    return () => {
      cancelled = true;
      uninstall?.();
    };
  }, [router]);

  return null;
}
