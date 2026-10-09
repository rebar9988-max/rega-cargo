import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { pagesCopyFromDocument } from "@/lib/pages-copy";

/**
 * Route error fallback. Never shows the error message or stack (they can name
 * internals); logs it to the console for debugging and offers a retry.
 */
export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  const copy = pagesCopyFromDocument();
  if (typeof window !== "undefined") console.error("[route]", error instanceof Error ? error.name : "error");
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-ink">
      <span className="text-pine" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={1.75} />
      </span>
      <h1 className="text-lg font-semibold">{copy.errorTitle}</h1>
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
