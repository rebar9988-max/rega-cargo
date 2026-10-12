import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUp,
  Camera,
  Check,
  Maximize2,
  MessageCircle,
  Minimize2,
  Package,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Square,
  Truck,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LANGS } from "@/lib/langs";
import { CHAT_COPY, type ChatCopyKey } from "@/lib/ai/chat-copy";
import {
  MAX_CHAT_HISTORY,
  MAX_CHAT_MESSAGE,
  readChatStream,
  type ChatIntent,
  type ChatReply,
} from "@/lib/ai/chat";
import { gateFields } from "@/lib/ai/gate-client";
import { Mark } from "./site-mark";
import { localizedTrack } from "@/lib/track-copy";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { NUM_LOCALE } from "@/lib/numbers";

type OrderView = {
  ref: string;
  status: string;
  events: { title: string; titleKu: string; at: string; phase: string }[];
};
export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; reply?: ChatReply; error?: ChatCopyKey; order?: OrderView };
const suggested: { key: ChatCopyKey; intent?: ChatIntent; icon: typeof ShoppingBag }[] = [
  { key: "shop", icon: ShoppingBag },
  { key: "ship", intent: "shipping", icon: Truck },
  { key: "track", intent: "tracking", icon: Package },
  { key: "photo", intent: "identify", icon: Camera },
];
function errorKey(code: string): ChatCopyKey {
  if (["daily_cap", "rate_limited"].includes(code)) return "rate";
  if (code === "prohibited") return "blocked";
  if (["bad_request", "too_large"].includes(code)) return "invalid";
  return "unavailable";
}
function localizedHref(href: string, lang: string) {
  if (!href.startsWith("/")) return href;
  const url = new URL(href, "https://cargo.regaplatform.com");
  url.searchParams.set("lang", lang);
  return url.pathname + url.search;
}

export default function ChatPanel({
  messages,
  setMessages,
  consent,
  setConsent,
  expanded,
  setExpanded,
}: {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  consent: boolean;
  setConsent: Dispatch<SetStateAction<boolean>>;
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}) {
  const { lang, setLang } = useI18n();
  const t = CHAT_COPY[lang];
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"thinking" | "searching">("thinking");
  const [clearing, setClearing] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const composer = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const consentId = useId();
  const hintId = useId();
  const orderCopy = REQUEST_COPY[lang];
  useEffect(() => {
    mounted.current = true;
    composer.current?.focus();
    return () => {
      mounted.current = false;
      requestRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    requestRef.current?.abort();
  }, [lang]);
  useEffect(() => {
    const box = log.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, busy]);
  // VisualViewport follows the on-screen keyboard; safe-area padding stays on the composer.
  useEffect(() => {
    const viewport = window.visualViewport;
    const panel = document.querySelector<HTMLElement>(".rl-chat-panel");
    const update = () => {
      panel?.style.setProperty("--rl-chat-viewport", `${viewport?.height ?? window.innerHeight}px`);
      panel?.style.setProperty("--rl-chat-top", `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
    };
  }, []);

  async function send(text: string, action?: ChatIntent) {
    const message = text.trim();
    if (!message || busy || !consent) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const id = crypto.randomUUID();
    const history = messages
      .filter((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
      .slice(-MAX_CHAT_HISTORY)
      .map((m) => ({ role: m.role, content: m.text }));
    while (history.reduce((size, item) => size + item.content.length, message.length) > 6000)
      history.shift();
    setMessages((old) => [...old, { id, role: "user" as const, text: message }].slice(-40));
    setDraft("");
    setBusy(true);
    setStage("thinking");
    try {
      // One bounded deadline includes the bot challenge and streaming request.
      const timer = window.setTimeout(() => controller.abort(new Error("timeout")), 40_000);
      try {
        const gate = await gateFields({ signal: controller.signal });
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          signal: controller.signal,
          headers: { "content-type": "application/json", accept: "text/event-stream" },
          body: JSON.stringify({ message, history, lang, action, consent: true, ...gate }),
        });
        let reply: ChatReply | undefined;
        await readChatStream(response, (event) => {
          if (event.type === "progress") setStage(event.stage);
          if (event.type === "result") reply = event.reply;
        });
        if (controller.signal.aborted) throw controller.signal.reason;
        if (!reply) throw new Error("unavailable");
        let order: OrderView | undefined;
        let orderError: ChatCopyKey | undefined;
        if (reply.intent === "tracking" && reply.ref) {
          try {
            const { chatOrder } = await import("@/lib/ai/chat-order");
            const result = await chatOrder({ data: { ref: reply.ref }, signal: controller.signal });
            if ("error" in result)
              orderError = result.error === "notfound" ? "missingOrder" : "orderUnavailable";
            else order = result;
          } catch {
            orderError = "signin";
          }
        }
        if (controller.signal.aborted) throw controller.signal.reason;
        if (mounted.current)
          setMessages((old) => [
            ...old,
            { id: crypto.randomUUID(), role: "assistant", reply, order, error: orderError },
          ]);
      } finally {
        window.clearTimeout(timer);
      }
    } catch (error) {
      const key =
        controller.signal.aborted &&
        !(
          controller.signal.reason instanceof Error &&
          controller.signal.reason.message === "timeout"
        )
          ? "cancelled"
          : errorKey(error instanceof Error ? error.message : "unavailable");
      if (mounted.current)
        setMessages((old) => [...old, { id: crypto.randomUUID(), role: "assistant", error: key }]);
    } finally {
      setBusy(false);
      requestRef.current = null;
      if (!window.matchMedia("(max-width: 767px)").matches) composer.current?.focus();
    }
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  return (
    <>
      <header className="rl-chat-header">
        <Mark className="rl-chat-mark" />
        <div className="rl-chat-identity">
          <Dialog.Title>{t.title}</Dialog.Title>
          <Dialog.Description>{t.subtitle}</Dialog.Description>
        </div>
        <button
          type="button"
          className="rl-chat-icon rl-chat-expand"
          aria-label={expanded ? t.shrink : t.expand}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Minimize2 aria-hidden /> : <Maximize2 aria-hidden />}
        </button>
        <Dialog.Close asChild>
          <button type="button" className="rl-chat-icon" aria-label={t.close}>
            <X aria-hidden />
          </button>
        </Dialog.Close>
      </header>
      <div className="rl-chat-toolbar">
        <label className="rl-chat-language">
          <span className="sr-only">{t.language}</span>
          <select
            aria-label={t.language}
            value={lang}
            onChange={(event) => setLang(event.target.value as typeof lang)}
          >
            {LANGS.map((locale) => (
              <option key={locale.id} value={locale.id}>
                {locale.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rl-chat-icon"
          disabled={busy || !messages.length}
          aria-label={t.clear}
          onClick={() => setClearing(true)}
        >
          <RotateCcw aria-hidden />
        </button>
      </div>
      {clearing ? (
        <div className="rl-chat-clear" role="alert">
          <span>{t.clearConfirm}</span>
          <button
            className="rl-button"
            type="button"
            onClick={() => {
              setMessages([]);
              setClearing(false);
              composer.current?.focus();
            }}
          >
            {t.newChat}
          </button>
          <button
            className="rl-chat-icon"
            type="button"
            aria-label={t.close}
            onClick={() => setClearing(false)}
          >
            <X aria-hidden />
          </button>
        </div>
      ) : null}
      <div
        className="rl-chat-log"
        ref={log}
        role="log"
        aria-label={t.title}
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
      >
        {!messages.length ? (
          <div className="rl-chat-empty">
            <div className="rl-chat-empty-icon">
              <MessageCircle aria-hidden />
            </div>
            <h2>{t.welcome}</h2>
            <p>{t.intro}</p>
            <div className="rl-chat-suggestions" aria-label={t.suggestions}>
              {suggested.map(({ key, intent, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (consent) void send(t[key], intent);
                    else {
                      setDraft(t[key]);
                      document.getElementById(consentId)?.focus();
                    }
                  }}
                >
                  <Icon aria-hidden />
                  <span>{t[key]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <article key={message.id} className="rl-chat-message" data-role={message.role}>
              {message.role === "user" ? (
                <p className="rl-chat-bubble" dir="auto">
                  {message.text}
                </p>
              ) : (
                <div className="rl-chat-answer">
                  {message.reply ? (
                    <>
                      <p>{t[message.reply.message]}</p>
                      {message.reply.notice ? (
                        <p className="rl-chat-note">{t[message.reply.notice]}</p>
                      ) : null}
                      {message.reply.cards.length ? (
                        <div className="rl-chat-cards">
                          {message.reply.cards.map((card) => (
                            <a
                              key={card.href}
                              className="rl-chat-card"
                              href={localizedHref(card.href, lang)}
                              {...(!card.href.startsWith("/")
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                            >
                              <span className="rl-chat-card-label">
                                {card.kind === "product" ? t.market : t.catalogue}
                              </span>
                              <strong dir="auto">{card.title}</strong>
                              {card.kind === "product" && card.priceIqd != null ? (
                                <span>
                                  {t.price}{" "}
                                  <bdi>
                                    {new Intl.NumberFormat(NUM_LOCALE).format(card.priceIqd)}
                                  </bdi>
                                </span>
                              ) : null}
                              {message.reply?.intent === "compare" && card.group ? (
                                <span className="rl-chat-note" dir="auto">
                                  {card.group}
                                </span>
                              ) : null}
                            </a>
                          ))}
                        </div>
                      ) : null}
                      {message.reply.cards.some((card) => card.kind === "catalogue") ? (
                        <p className="rl-chat-note">{t.disclaimer}</p>
                      ) : null}
                      {message.reply.links.length ? (
                        <div className="rl-chat-links" role="group" aria-label={t.suggestions}>
                          {message.reply.links.map((link) => (
                            <a key={link.href} href={localizedHref(link.href, lang)}>
                              {t[link.label]}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  {message.order ? (
                    <section className="rl-chat-order">
                      <p>
                        <ShieldCheck aria-hidden />
                        {t.verified}
                      </p>
                      <p>
                        <bdi>{message.order.ref}</bdi> ·{" "}
                        {orderCopy.statuses[
                          message.order.status as keyof typeof orderCopy.statuses
                        ] ?? message.order.status}
                      </p>
                      <ol>
                        {message.order.events.map((event, index) => (
                          <li key={index}>
                            <Check aria-hidden />
                            <span>
                              {localizedTrack(lang, event.title, event.titleKu)}
                              <time dateTime={event.at}>
                                {new Intl.DateTimeFormat(lang, {
                                  dateStyle: "medium",
                                  numberingSystem: "latn",
                                }).format(new Date(event.at))}
                              </time>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ) : null}
                  {message.error ? (
                    <div className="rl-chat-error" role="status">
                      <p>{t[message.error]}</p>
                      {message.error !== "cancelled" &&
                      message.error !== "blocked" &&
                      lastUser?.role === "user" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void send(lastUser.text)}
                        >
                          {t.retry}
                        </button>
                      ) : null}
                      <div className="rl-chat-links">
                        <a href={localizedHref("/contact", lang)}>{t.support}</a>
                        <a href={localizedHref("/account", lang)}>{t.account}</a>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          ))
        )}
        {busy ? (
          <div className="rl-chat-typing" role="status">
            <span className="rl-chat-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
            <span>{t[stage]}</span>
          </div>
        ) : null}
      </div>
      <form
        className="rl-chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label className="rl-chat-consent" htmlFor={consentId}>
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            disabled={busy}
            onChange={(event) => setConsent(event.target.checked)}
          />
          {t.consent}
        </label>
        <div className="rl-chat-input-row">
          <textarea
            ref={composer}
            aria-label={t.placeholder}
            aria-describedby={hintId}
            placeholder={t.placeholder}
            value={draft}
            rows={2}
            maxLength={MAX_CHAT_MESSAGE}
            onChange={(event) => setDraft(event.target.value)}
            dir="auto"
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing &&
                !window.matchMedia("(max-width: 767px)").matches
              ) {
                event.preventDefault();
                void send(draft);
              }
            }}
          />
          {busy ? (
            <button
              className="rl-chat-send"
              type="button"
              aria-label={t.stop}
              onClick={() => requestRef.current?.abort()}
            >
              <Square aria-hidden />
            </button>
          ) : (
            <button
              className="rl-chat-send"
              type="submit"
              disabled={!consent || !draft.trim()}
              aria-label={t.send}
            >
              <ArrowUp aria-hidden />
            </button>
          )}
        </div>
        <p id={hintId} className="rl-chat-privacy">
          {t.privacy}
        </p>
      </form>
    </>
  );
}
