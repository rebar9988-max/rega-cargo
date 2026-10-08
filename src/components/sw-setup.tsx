import { useEffect } from "react";

/** Registers /sw.js (offline-capable shell) once the page is idle. Never on localhost/dev. */
export function ServiceWorkerSetup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    const idle = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
    if (document.readyState === "complete") (idle ?? setTimeout)(register);
    else window.addEventListener("load", () => (idle ?? setTimeout)(register), { once: true });
  }, []);
  return null;
}
