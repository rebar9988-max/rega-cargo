import { useEffect, useState } from "react";

/** Interactive submissions become available when their handlers are actually attached. */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
