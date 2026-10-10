import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

function hydrate() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <StartClient />
      </StrictMode>,
    );
  });
}

// Give the server-rendered page a frame before React attaches its event handlers.
// A background tab has no animation frames, so hydrate it immediately.
if (document.visibilityState === "visible") {
  requestAnimationFrame(() => requestAnimationFrame(hydrate));
} else {
  hydrate();
}
