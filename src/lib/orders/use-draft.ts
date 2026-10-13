import { useEffect, useRef, useState } from "react";
import {
  clearOrderDraft,
  orderDraftKey,
  readOrderDraft,
  writeOrderDraft,
  type OrderDraft,
} from "./draft";

export function useOrderDraft(input: {
  store?: string;
  intent: "buy" | "ship";
  url: string;
  qty: string;
  dest: string;
  restore: (draft: OrderDraft) => void;
}) {
  const key = orderDraftKey(input.store, input.intent);
  const restore = useRef(input.restore);
  restore.current = input.restore;
  const [enabled, setEnabled] = useState(false);
  const [loadedKey, setLoadedKey] = useState("");
  const [restored, setRestored] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
    setRestored(false);
    setEnabled(false);
    try {
      const draft = readOrderDraft(sessionStorage, key);
      if (draft) {
        restore.current(draft);
        setEnabled(true);
        setRestored(true);
      }
    } catch {
      /* Storage is optional, never required to use the form. */
    }
    setLoadedKey(key);
  }, [key]);
  useEffect(() => {
    if (loadedKey !== key) return;
    try {
      if (enabled)
        setFailed(
          !writeOrderDraft(sessionStorage, key, {
            url: input.url,
            qty: input.qty,
            dest: input.dest,
          }),
        );
      else clearOrderDraft(sessionStorage, key);
    } catch {
      if (enabled) setFailed(true);
    }
  }, [key, loadedKey, enabled, input.url, input.qty, input.dest]);
  function clear() {
    try {
      clearOrderDraft(sessionStorage, key);
    } catch {
      /* Storage disabled. */
    }
    setEnabled(false);
    setRestored(false);
    setFailed(false);
  }
  return { enabled, setEnabled, restored, failed, clear };
}
