import { responsiveImage } from "@/lib/images";
import { seo } from "@/lib/seo";
import { ItemsLink } from "@/components/items-link";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import {
  ChevronDown,
  CircleCheck,
  ClipboardPaste,
  Link2,
  MapPin,
  Minus,
  Package,
  Plus,
  Smartphone,
  X,
} from "lucide-react";
import { controlClass, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { DESTS, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import { storeById, goodById } from "@/lib/stores";
import {
  checkProductUrl,
  normalizePhone,
  QTY_MAX,
  QTY_MIN,
  TEXT_MAX,
  URL_MAX,
} from "@/lib/orders/store-request";
import { REQUEST_COPY } from "@/lib/request-copy";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { EASY_REQUEST_COPY } from "@/lib/easy-request-copy";
import { gateFields } from "@/lib/ai/gate-client";
import { orderStore } from "@/lib/orders/api";
import { UX_COPY } from "@/lib/ux-copy";
import { marketCopy } from "@/lib/market-copy";
import { ContactNote } from "@/components/contact-note";

export const Route = createFileRoute("/stores/request")({
  validateSearch: (search: Record<string, unknown>) => ({
    store: typeof search.store === "string" ? search.store : undefined,
    item: typeof search.item === "string" ? search.item : undefined,
    intent: search.intent === "ship" ? "ship" : "buy",
  }),
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/stores/request",
      title: "لینکی کاڵا · R&L",
      description: "داوای کڕینی کاڵایەک لە فرۆشگایەکی ئەوروپی.",
      noindex: true,
    }),
  component: RequestPage,
});

/** Where an error is shown: under the link, the phone, the contents checkbox, or above the send button. */
type ErrorAt = "link" | "phone" | "declare" | "form";

/** One numbered step: a big number, an icon and a short question, then the control. */
function Step({
  n,
  icon,
  label,
  labelFor,
  children,
}: {
  n: number;
  icon: ReactNode;
  label: string;
  labelFor?: string;
  children: ReactNode;
}) {
  const id = `rl-step-${n}`;
  return (
    <fieldset className="rl-easy-step" aria-labelledby={id}>
      <legend className="rl-easy-step-head">
        <span className="rl-easy-step-n" aria-hidden="true">
          {n}
        </span>
        <span className="rl-easy-step-icon" aria-hidden="true">
          {icon}
        </span>
        {labelFor ? (
          <label id={id} htmlFor={labelFor}>
            {label}
          </label>
        ) : (
          <span id={id}>{label}</span>
        )}
      </legend>
      {children}
    </fieldset>
  );
}

function RequestPage() {
  const { lang } = useI18n();
  const t = storeCopy(lang);
  const rc = REQUEST_COPY[lang];
  const e = EASY_REQUEST_COPY[lang];
  const ux = UX_COPY[lang];
  const { store: storeId, intent, item } = Route.useSearch();
  const good = goodById(item);
  const store = storeById(storeId) ?? storeById(good?.storeId);
  const [url, setUrl] = useState("");
  const [qty, setQty] = useState(QTY_MIN);
  const [dest, setDest] = useState(DESTS[0].id);
  const [phone, setPhone] = useState("");
  const [declared, setDeclared] = useState(false);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<{ at: ErrorAt; text: string } | null>(null);
  const [pasteHint, setPasteHint] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);
  const linkRef = useRef<HTMLInputElement>(null);
  const declareRef = useRef<HTMLInputElement>(null);

  /**
   * A link from another store on our list is fine too: then the request is sent without the
   * pre-selected store (the server allows any listed store when none is given). Only possible
   * when no catalogue item is attached, because an item fixes its store.
   */
  function resolveLink(raw: string) {
    const own = checkProductUrl(raw, store);
    if (own.ok || good) return { ...own, storeId: store?.id ?? null };
    const any = checkProductUrl(raw, undefined);
    return any.ok ? { ...any, storeId: null } : { ...own, storeId: store?.id ?? null };
  }

  const linkOk = url.trim() !== "" && resolveLink(url).ok;

  async function paste() {
    setPasteHint(false);
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        setUrl(text.slice(0, URL_MAX));
        if (error?.at === "link") setError(null);
        return;
      }
    } catch {
      /* clipboard blocked or unsupported: fall back to the long-press hint */
    }
    setPasteHint(true);
    linkRef.current?.focus();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setFailed(false);
    // Same checks as the server (store-request.ts); the server re-validates everything.
    let href = "";
    let sendStore: string | null = store?.id ?? null;
    if (url.trim()) {
      const checked = resolveLink(url);
      if (!checked.ok) {
        setError({ at: "link", text: checked.error === "host" ? t.wrongHost : e.badLink });
        linkRef.current?.focus();
        return;
      }
      href = checked.url;
      sendStore = checked.storeId;
    } else if (!good) {
      setError({ at: "link", text: e.badLink });
      linkRef.current?.focus();
      return;
    }
    if (phone.trim() && !normalizePhone(phone)) {
      setError({ at: "phone", text: e.badPhone });
      return;
    }
    if (!declared) {
      setError({ at: "declare", text: DECLARE_COPY[lang].mustDeclare });
      declareRef.current?.focus();
      return;
    }
    setError(null);
    inFlight.current = true;
    setBusy(true);
    try {
      const gate = await gateFields();
      const result = await orderStore({
        data: {
          intent,
          storeId: sendStore,
          item: good?.id ?? null,
          url: href,
          size,
          color,
          qty: String(qty),
          dest,
          notes,
          phone: normalizePhone(phone) ?? phone.trim(),
          // Only reached with the box ticked; the server rejects anything but true.
          declared,
          ...gate,
        },
      });
      if (result && "id" in result && result.id) {
        setSaved(String(result.id));
        return;
      }
      const code = result && "error" in result ? result.error : "";
      const messages: Record<string, { at: ErrorAt; text: string }> = {
        url: { at: "link", text: e.badLink },
        host: { at: "link", text: t.wrongHost },
        qty: { at: "form", text: rc.badQty },
        dest: { at: "form", text: rc.badDest },
        contact: { at: "phone", text: phone.trim() ? e.badPhone : e.needPhone },
        rate: { at: "form", text: rc.rate },
        signin: { at: "form", text: rc.signin },
        prohibited: { at: "link", text: marketCopy(lang).prohibited },
        declare: { at: "declare", text: DECLARE_COPY[lang].mustDeclare },
      };
      if (code && messages[code]) {
        setError(messages[code]);
        return;
      }
    } catch {
      /* network error, or the service is not configured */
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
    // Inputs stay as typed; the email route is offered instead of a dead end.
    setSaved(null);
    setFailed(true);
  }

  const how = intent === "ship" ? e.howShip : e.howBuy;
  const linkError = error?.at === "link" ? error.text : "";
  const phoneError = error?.at === "phone" ? error.text : "";
  const declareError = error?.at === "declare" ? error.text : "";

  return (
    <Shell>
      <PageHeader title={intent === "ship" ? t.shipTitle : t.buyTitle} lede={e.lede} />
      <div className="page rl-form-layout rl-easy">
        {saved ? (
          <div className="rl-card rl-easy-done" role="status">
            <CircleCheck className="rl-easy-done-icon" aria-hidden="true" />
            <h2 className="text-2xl font-bold">{e.sentTitle}</h2>
            <p className="text-base leading-relaxed text-muted">{e.sentBody}</p>
            <p className="text-sm text-muted">
              {e.sentRef}:{" "}
              <bdi dir="ltr" className="font-sans font-semibold text-ink">
                {saved}
              </bdi>
            </p>
            <Link to="/stores" className="rl-button" data-variant="secondary">
              {t.back}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="rl-card rl-request-form" noValidate>
            {good ? (
              <div className="rl-easy-item">
                <img
                  {...responsiveImage(good.image, "64px")}
                  alt=""
                  width={64}
                  height={64}
                  decoding="async"
                  className="size-16 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold">{t.goods[good.id]}</p>
                  <p className="text-sm text-muted">{t.sample}</p>
                </div>
              </div>
            ) : null}

            <Step n={1} icon={<Link2 />} label={e.linkLabel} labelFor="rl-link">
              {store ? (
                <p className="font-sans text-sm text-muted">
                  {store.name} · <bdi dir="ltr">{store.host}</bdi>
                </p>
              ) : null}
              <div className="rl-easy-link">
                <input
                  id="rl-link"
                  ref={linkRef}
                  className={controlClass}
                  dir="ltr"
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  placeholder="https://"
                  maxLength={URL_MAX}
                  value={url}
                  aria-invalid={linkError ? true : undefined}
                  aria-describedby="rl-link-note"
                  onChange={(event) => {
                    setUrl(event.target.value);
                    setPasteHint(false);
                    if (error?.at === "link") setError(null);
                  }}
                />
                {url ? (
                  <button
                    type="button"
                    className="rl-easy-icon-btn"
                    aria-label={e.clear}
                    onClick={() => {
                      setUrl("");
                      linkRef.current?.focus();
                    }}
                  >
                    <X aria-hidden="true" />
                  </button>
                ) : (
                  <button type="button" className="rl-easy-paste" onClick={paste}>
                    <ClipboardPaste aria-hidden="true" />
                    <span dir="auto">{e.paste}</span>
                  </button>
                )}
              </div>
              <p id="rl-link-note" className="rl-easy-note" aria-live="polite">
                {linkError ? (
                  <span role="alert" className="text-clay">
                    {linkError}
                  </span>
                ) : linkOk ? (
                  <span className="rl-easy-ok">
                    <CircleCheck aria-hidden="true" />
                    {e.linkOk}
                  </span>
                ) : pasteHint ? (
                  e.pasteFailed
                ) : good ? (
                  e.linkHintSample
                ) : (
                  e.linkHint
                )}
              </p>
            </Step>

            <Step n={2} icon={<Package />} label={e.qtyLabel}>
              <div className="rl-easy-qty">
                <button
                  type="button"
                  className="rl-easy-qty-btn"
                  aria-label={e.less}
                  disabled={qty <= QTY_MIN}
                  onClick={() => setQty((n) => Math.max(QTY_MIN, n - 1))}
                >
                  <Minus aria-hidden="true" />
                </button>
                <output className="rl-easy-qty-value" aria-live="polite" dir="ltr">
                  {qty}
                </output>
                <button
                  type="button"
                  className="rl-easy-qty-btn"
                  aria-label={e.more}
                  disabled={qty >= QTY_MAX}
                  onClick={() => setQty((n) => Math.min(QTY_MAX, n + 1))}
                >
                  <Plus aria-hidden="true" />
                </button>
              </div>
            </Step>

            <Step n={3} icon={<MapPin />} label={e.cityLabel}>
              <div className="rl-easy-cities">
                {DESTS.map((place) => (
                  <label key={place.id} className="rl-easy-city" data-on={dest === place.id || undefined}>
                    <input
                      type="radio"
                      name="dest"
                      value={place.id}
                      checked={dest === place.id}
                      onChange={() => setDest(place.id)}
                    />
                    {placeName(place, lang)}
                  </label>
                ))}
              </div>
            </Step>

            <Step n={4} icon={<Smartphone />} label={e.phoneLabel} labelFor="rl-phone">
              <input
                id="rl-phone"
                className={controlClass}
                dir="ltr"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0750 123 4567"
                maxLength={24}
                value={phone}
                aria-invalid={phoneError ? true : undefined}
                aria-describedby="rl-phone-note"
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (error?.at === "phone") setError(null);
                }}
              />
              <p id="rl-phone-note" className="rl-easy-note" aria-live="polite">
                {phoneError ? (
                  <span role="alert" className="text-clay">
                    {phoneError}
                  </span>
                ) : (
                  e.phoneHint
                )}
              </p>
            </Step>

            <details className="rl-easy-more">
              <summary>
                <span>{e.details}</span>
                <span className="text-sm text-muted">{e.detailsHint}</span>
                <ChevronDown className="rl-easy-more-chevron" aria-hidden="true" />
              </summary>
              <div className="rl-easy-more-body">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex min-w-0 flex-col gap-2 text-sm">
                    <span className="font-medium text-ink">{t.size}</span>
                    <input
                      className={controlClass}
                      maxLength={TEXT_MAX.size}
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-2 text-sm">
                    <span className="font-medium text-ink">{t.color}</span>
                    <input
                      className={controlClass}
                      maxLength={TEXT_MAX.color}
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                    />
                  </label>
                </div>
                <label className="flex min-w-0 flex-col gap-2 text-sm">
                  <span className="font-medium text-ink">{t.notesLabel}</span>
                  <textarea
                    className={`${controlClass} h-24 py-3`}
                    maxLength={TEXT_MAX.notes}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </label>
              </div>
            </details>

            <div className="rl-easy-declare">
              <label className="rl-easy-check">
                <input
                  ref={declareRef}
                  type="checkbox"
                  checked={declared}
                  required
                  aria-invalid={declareError ? true : undefined}
                  aria-describedby={declareError ? "rl-declare-note" : undefined}
                  onChange={(event) => {
                    setDeclared(event.target.checked);
                    if (error?.at === "declare") setError(null);
                  }}
                />
                <span>{e.declare}</span>
              </label>
              <ItemsLink />
              {declareError ? (
                <p id="rl-declare-note" role="alert" className="text-sm text-clay">
                  {declareError}
                </p>
              ) : null}
            </div>

            <div aria-live="polite">
              {error?.at === "form" ? (
                <p role="alert" className="text-sm text-clay">
                  {error.text}
                </p>
              ) : null}
              {failed && !error ? <ContactNote pre={ux.failPre} post={ux.failPost} /> : null}
            </div>
            <button
              type="submit"
              className={`${btnPrimary} rl-easy-send disabled:opacity-60`}
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? ux.sending : t.submit}
            </button>
          </form>
        )}
        <aside className="rl-form-aside">
          <div className="rl-card">
            <h2 className="text-xl leading-tight font-bold">{e.howTitle}</h2>
            <ol className="rl-easy-how">
              {how.map((line, i) => (
                <li key={line}>
                  <span className="rl-easy-step-n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            <Link to="/quote" className="rl-easy-quote">
              {e.quoteLink}
            </Link>
          </div>
          {store && store.caution.length > 0 ? (
            <div className="rl-card">
              <h2 className="text-xl leading-tight font-bold">{t.cautionTitle}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {store.caution.map((entry) => (
                  <li key={entry} className="text-sm text-clay">
                    {t.cautions[entry]}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </Shell>
  );
}
