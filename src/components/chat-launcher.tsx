import { lazy, Suspense, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageCircle, X } from "lucide-react";
import { Mark } from "./site-mark";
import { langMeta } from "@/lib/langs";
import { useI18n } from "@/lib/i18n";
import { rlAiEnabled } from "@/lib/ai/flag";
import { CHAT_COPY } from "@/lib/ai/chat-copy";
import type { ChatMessage } from "./chat-panel";

const ChatPanel = lazy(() => import("./chat-panel"));

/** Persistent across route navigation; the heavier assistant loads only when opened. */
export function ChatLauncher() {
  const { lang } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const clear = () => {
      setMessages([]);
      setConsent(false);
      setOpen(false);
    };
    window.addEventListener("rl-session-changed", clear);
    return () => window.removeEventListener("rl-session-changed", clear);
  }, []);
  const t = CHAT_COPY[lang];
  if (!rlAiEnabled() || /^\/(?:admin|auth|_design)(?:\/|$)/.test(path)) return null;
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next)
          setMessages((old) =>
            old.map((message) =>
              message.role === "assistant" ? { ...message, order: undefined } : message,
            ),
          );
      }}
    >
      <Dialog.Trigger asChild>
        <button
          className="rl-chat-launcher"
          type="button"
          aria-label={t.open}
          disabled={!ready}
          aria-busy={!ready}
        >
          <MessageCircle aria-hidden="true" />
          <span>R&L AI</span>
        </button>
      </Dialog.Trigger>
      {open ? (
        <Dialog.Portal>
          <Dialog.Overlay className="rl-chat-overlay" />
          <Dialog.Content
            className="rl-chat-panel"
            data-expanded={expanded}
            dir={langMeta(lang).dir}
            lang={lang}
          >
            <Suspense
              fallback={
                <>
                  <header className="rl-chat-header">
                    <Mark className="rl-chat-mark" />
                    <div className="rl-chat-identity">
                      <Dialog.Title>{t.title}</Dialog.Title>
                      <Dialog.Description>{t.subtitle}</Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                      <button className="rl-chat-icon" type="button" aria-label={t.close}>
                        <X aria-hidden />
                      </button>
                    </Dialog.Close>
                  </header>
                  <div className="rl-chat-log">
                    <div className="rl-chat-skeleton" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </div>
                    <p role="status">{t.thinking}</p>
                  </div>
                </>
              }
            >
              <ChatPanel
                messages={messages}
                setMessages={setMessages}
                consent={consent}
                setConsent={setConsent}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            </Suspense>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
