import { useEffect, useId, useRef, useState } from "react";
import {
  Search,
  Scale,
  ShoppingBag,
  Truck,
  CircleHelp,
  Send,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useHydrated } from "@/lib/use-hydrated";
import { useI18n } from "@/lib/i18n";
import { langMeta } from "@/lib/langs";
import { gateFields } from "@/lib/ai/gate-client";
import { CHAT_COPY, type ChatCopyKey } from "./assistant-copy";
import {
  MAX_CHAT_MESSAGE,
  readChatStream,
  type ChatReply,
  type ChatIntent,
} from "../domain/assistant-types";
import styles from "./assistant-styles.module.css";

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; reply?: ChatReply; error?: ChatCopyKey };
const shortcuts: { key: ChatCopyKey; intent: ChatIntent; icon: typeof Search }[] = [
  { key: "shop", intent: "search", icon: Search },
  { key: "compare", intent: "compare", icon: Scale },
  { key: "bring", intent: "bring", icon: ShoppingBag },
  { key: "track", intent: "tracking", icon: Truck },
  { key: "how", intent: "how", icon: CircleHelp },
];
function errorKey(code: string): ChatCopyKey {
  if (["daily_cap", "rate_limited"].includes(code)) return "rate";
  if (code === "prohibited") return "blocked";
  if (["bad_request", "too_large"].includes(code)) return "invalid";
  return "unavailable";
}

export function AssistantHome() {
  const { lang } = useI18n();
  const t = CHAT_COPY[lang];
  const ready = useHydrated();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [stage, setStage] = useState<"thinking" | "searching">("thinking");
  const request = useRef<AbortController | null>(null);
  const retry = useRef<{ message: string; action?: ChatIntent } | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const consentId = useId();
  const hintId = useId();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);
  useEffect(() => {
    request.current?.abort();
    setMessages([]);
    retry.current = null;
    setDraft("");
  }, [lang]);
  useEffect(() => {
    const clear = () => {
      request.current?.abort();
      setMessages([]);
      setConsent(false);
      retry.current = null;
    };
    window.addEventListener("rl-session-changed", clear);
    return () => window.removeEventListener("rl-session-changed", clear);
  }, []);
  useEffect(() => {
    if (nearBottom.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy]);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  function choose(key: ChatCopyKey) {
    setOpen(true);
    setDraft(t[key]);
    window.requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.scrollIntoView({ block: "nearest" });
    });
  }
  async function send(text: string, action?: ChatIntent, isRetry = false) {
    const message = text.trim();
    if (!message || message.length > MAX_CHAT_MESSAGE || request.current || !consent) return;
    const controller = new AbortController();
    request.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 40_000);
    const userMessages = messages.filter(
      (m): m is Extract<Message, { role: "user" }> => m.role === "user",
    );
    const history = (isRetry ? userMessages.slice(0, -1) : userMessages)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.text }));
    while (history.reduce((n, m) => n + m.content.length, message.length) > 6000) history.shift();
    if (!isRetry)
      setMessages((old) =>
        [...old, { id: crypto.randomUUID(), role: "user" as const, text: message }].slice(-40),
      );
    else setMessages((old) => old.slice(0, -1));
    retry.current = { message, action };
    setDraft("");
    setBusy(true);
    setStage("thinking");
    nearBottom.current = true;
    try {
      const gate = await gateFields({ signal: controller.signal });
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", accept: "text/event-stream" },
        body: JSON.stringify({ message, lang, history, consent: true, action, ...gate }),
      });
      let reply: ChatReply | undefined;
      await readChatStream(response, (event) => {
        if (event.type === "progress") setStage(event.stage);
        if (event.type === "result") reply = event.reply;
      });
      if (!reply || controller.signal.aborted) throw new Error("unavailable");
      if (mounted.current)
        setMessages((old) => [...old, { id: crypto.randomUUID(), role: "assistant", reply }]);
      retry.current = null;
    } catch (error) {
      if (mounted.current && !controller.signal.aborted)
        setMessages((old) => [
          ...old,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            error: errorKey(error instanceof Error ? error.message : "unavailable"),
          },
        ]);
      else if (mounted.current)
        setMessages((old) => [
          ...old,
          { id: crypto.randomUUID(), role: "assistant", error: "unavailable" },
        ]);
    } finally {
      window.clearTimeout(timer);
      if (request.current === controller) request.current = null;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <section
      className={`page ${styles.root}`}
      lang={lang}
      dir={langMeta(lang).dir}
      aria-labelledby="rl-ai-heading"
    >
      <div className={styles.welcome}>
        <div className={styles.identity}>
          <span className={styles.symbol} aria-hidden>
            <Sparkles />
          </span>
          <div>
            <h1 id="rl-ai-heading">
              <bdi dir="ltr">R&L AI</bdi>
            </h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
        </div>
        <p className={styles.intro} dir="auto">
          {t.intro}
        </p>
        <button
          type="button"
          className="rl-button"
          data-variant="primary"
          disabled={!ready}
          aria-busy={!ready || undefined}
          onClick={() => {
            setOpen(true);
            window.requestAnimationFrame(() => input.current?.focus());
          }}
        >
          {t.start}
          <Send aria-hidden />
        </button>
      </div>
      <div className={styles.shortcuts} aria-label={t.suggestions}>
        {shortcuts.map(({ key, icon: Icon }) => (
          <button type="button" key={key} disabled={!ready} onClick={() => choose(key)}>
            <span className={styles.shortcutIcon}>
              <Icon aria-hidden />
            </span>
            <span dir="auto">{t[key]}</span>
          </button>
        ))}
      </div>
      {open ? (
        <section className={styles.chat} aria-label={t.title}>
          <header className={styles.chatHeader}>
            <div>
              <strong>
                <bdi dir="ltr">R&L AI</bdi>
              </strong>
              <p>{t.subtitle}</p>
            </div>
            <button
              type="button"
              className="rl-button"
              data-variant="secondary"
              disabled={busy || !messages.length}
              onClick={() => setClearConfirm(true)}
            >
              <RotateCcw aria-hidden />
              {t.clear}
            </button>
          </header>
          {clearConfirm ? (
            <div className={styles.confirm} role="alert">
              <p>{t.clearConfirm}</p>
              <button
                type="button"
                className="rl-button"
                onClick={() => {
                  setMessages([]);
                  retry.current = null;
                  setClearConfirm(false);
                  input.current?.focus();
                }}
              >
                {t.newChat}
              </button>
              <button
                type="button"
                className="rl-button"
                data-variant="secondary"
                onClick={() => setClearConfirm(false)}
              >
                {t.close}
              </button>
            </div>
          ) : null}
          <div
            className={styles.messages}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            ref={log}
            onScroll={() => {
              const box = log.current;
              if (box)
                nearBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < 64;
            }}
          >
            {!messages.length ? (
              <div className={styles.assistantMessage}>
                <p>{t.greeting}</p>
              </div>
            ) : null}
            {messages.map((m) => (
              <article
                key={m.id}
                className={m.role === "user" ? styles.userMessage : styles.assistantMessage}
                dir="auto"
              >
                {m.role === "user" ? (
                  <p>{m.text}</p>
                ) : (
                  <>
                    {m.reply ? (
                      <>
                        <p>{CHAT_COPY[m.reply.locale ?? lang][m.reply.message]}</p>
                        {m.reply.notice ? (
                          <p className={styles.notice}>{t[m.reply.notice]}</p>
                        ) : null}
                        {m.reply.cards.length ? (
                          <ul className={styles.products}>
                            {m.reply.cards.map((card) => (
                              <li key={card.href}>
                                <a href={card.href} dir="auto">
                                  {card.title}
                                </a>
                                {card.priceIqd != null ? (
                                  <p>
                                    {t.price}{" "}
                                    <bdi dir="ltr">{card.priceIqd.toLocaleString("en")}</bdi>
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <div className={styles.links}>
                          {m.reply.links.map((link) => (
                            <a
                              key={link.href}
                              href={link.href}
                              className="rl-button"
                              data-variant="secondary"
                              onClick={
                                link.href.startsWith("#")
                                  ? () => {
                                      const image = document.getElementById("rl-ai-image");
                                      if (image instanceof HTMLDetailsElement) image.open = true;
                                    }
                                  : undefined
                              }
                            >
                              {t[link.label]}
                            </a>
                          ))}
                        </div>
                      </>
                    ) : null}
                    {m.error ? <p role="alert">{t[m.error]}</p> : null}
                  </>
                )}
              </article>
            ))}
            {busy ? (
              <p role="status" className={styles.notice}>
                {t[stage]}
              </p>
            ) : null}
          </div>
          <form
            className={styles.composer}
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <label className={styles.consent} htmlFor={consentId}>
              <input
                id={consentId}
                type="checkbox"
                checked={consent}
                disabled={busy}
                onChange={(e) => setConsent(e.target.checked)}
              />
              {t.consent}
            </label>
            <div className={styles.inputRow}>
              <label className="sr-only" htmlFor="rl-ai-input">
                {t.placeholder}
              </label>
              <textarea
                id="rl-ai-input"
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={MAX_CHAT_MESSAGE}
                rows={2}
                dir="auto"
                placeholder={t.placeholder}
                aria-describedby={hintId}
                enterKeyHint="send"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
              />
              <button
                type="submit"
                className="rl-button"
                data-variant="primary"
                aria-label={t.send}
                disabled={busy || !consent || !draft.trim()}
              >
                <Send aria-hidden />
              </button>
            </div>
            <p id={hintId} className={styles.notice}>
              <ShieldCheck aria-hidden />
              {t.privacy}
            </p>
            {retry.current && !busy && messages.at(-1)?.role === "assistant" ? (
              <button
                type="button"
                className="rl-button"
                data-variant="secondary"
                onClick={() => {
                  if (retry.current) void send(retry.current.message, retry.current.action, true);
                }}
              >
                {t.retry}
              </button>
            ) : null}
          </form>
        </section>
      ) : null}
    </section>
  );
}
