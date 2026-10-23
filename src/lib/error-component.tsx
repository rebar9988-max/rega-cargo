import { useEffect } from "react";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { pagesCopyFromDocument } from "@/lib/pages-copy";
import { reloadWithFreshModules, routerIsReloading, shouldReloadForChunk } from "@/lib/chunk-recovery";

/**
 * Route error fallback. Never shows the error message or stack (they can name
 * internals); logs it to the console for debugging and offers a retry.
 */
export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const copy = pagesCopyFromDocument();
  if (typeof window !== "undefined") console.error("[route]", error instanceof Error ? error.name : "error");
  // A page module that failed to load recovers with one reload, so the page and its
  // navigation come back instead of this fallback (see chunk-recovery.ts).
  useEffect(() => {
    // After this render pass, so a reload the router started for the same error is visible.
    const timer = setTimeout(() => {
      let storage: Storage | null = null;
      try {
        storage = window.sessionStorage;
      } catch {
        // Storage blocked: keep the retry button only.
      }
      const page = location.pathname + location.search;
      if (shouldReloadForChunk(error, page, Date.now(), storage, routerIsReloading(error)))
        void reloadWithFreshModules();
    });
    return () => clearTimeout(timer);
  }, [error]);
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <span className="text-pine" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={1.75} />
      </span>
      <h1 className="text-2xl leading-tight font-bold">{copy.errorTitle}</h1>
      <p className="max-w-md text-sm text-muted">{copy.errorBody}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            void router.invalidate();
          }}
          className="rl-grad inline-flex h-11 items-center rounded-full px-5 text-sm font-medium"
        >
          {copy.retry}
        </button>
        <a href="/" className="inline-flex h-11 items-center rounded-full border border-silver bg-surface px-5 text-sm font-medium">
          {copy.home}
        </a>
      </div>
    </main>
  );
}
