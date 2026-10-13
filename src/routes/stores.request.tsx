import { responsiveImage } from "@/lib/images";
import { seo } from "@/lib/seo";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { ItemsLink } from "@/components/items-link";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Field, controlClass, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { DESTS, getDest, placeName } from "@/lib/corridor";
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
import { gateFields } from "@/lib/ai/gate-client";
import { orderStore } from "@/lib/orders/api";
import { UX_COPY } from "@/lib/ux-copy";
import { marketCopy } from "@/lib/market-copy";
import { ContactNote } from "@/components/contact-note";
import { ProductLinkAssist } from "@/components/product-link-assist";

import { JOURNEY_COPY } from "@/lib/journey-copy";
import { useHydrated } from "@/lib/use-hydrated";
import { REQUEST_COPY as ACCOUNT_REQUEST_COPY } from "@/lib/requests/copy";
import { useOrderDraft } from "@/lib/orders/use-draft";
import { DRAFT_COPY } from "@/lib/orders/draft-copy";
import { OrderFallback } from "@/components/order-fallback";
import { useOrderAvailability } from "@/lib/orders/use-availability";
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

function RequestPage() {
  const { lang, t: global } = useI18n();
  const t = storeCopy(lang);
  const rc = REQUEST_COPY[lang];
  const { store: storeId, intent, item } = Route.useSearch();
  const good = goodById(item);
  const store = storeById(storeId) ?? storeById(good?.storeId);
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState("1");
  const [dest, setDest] = useState(DESTS[0].id);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [failed, setFailed] = useState(false);
  const [declared, setDeclared] = useState(false);
  const ux = UX_COPY[lang];
  const ready = useHydrated();
  const j = JOURNEY_COPY[lang];
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldError, setFieldError] = useState("");
  const [signin, setSignin] = useState(false);
  const dc = DRAFT_COPY[lang];
  const unavailable = useOrderAvailability();
  const draft = useOrderDraft({
    store: store?.id,
    intent: intent === "ship" ? "ship" : "buy",
    url,
    qty,
    dest,
    restore: (value) => {
      setUrl(value.url);
      setQty(value.qty);
      setDest(value.dest);
      setDeclared(false);
    },
  });
  const summary: Array<[string, string]> = [
    [j.bring, intent === "ship" ? t.shipTitle : t.buyTitle],
    [t.url, url],
    [t.qty, qty],
    [t.dest, placeName(getDest(dest), lang)],
    [t.size, size],
    [t.color, color],
    [t.notesLabel, notes],
    [rc.phone, phone],
    [j.review, declared ? DECLARE_COPY[lang].declare : "—"],
  ];
  function invalid(field: string, message: string) {
    setError(message);
    setFieldError(field);
    formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    setFailed(false);
    setSignin(false);
    // Same checks as the server (store-request.ts); the server re-validates everything.
    let href = "";
    if (url.trim()) {
      const checked = checkProductUrl(url, store);
      if (!checked.ok) {
        invalid("url", checked.error === "host" ? t.wrongHost : t.invalidUrl);
        return;
      }
      href = checked.url;
    } else if (!good) {
      invalid("url", t.invalidUrl);
      return;
    }
    const count = Number(qty.trim());
    if (!/^\d{1,2}$/.test(qty.trim()) || count < QTY_MIN || count > QTY_MAX) {
      invalid("qty", rc.badQty);
      return;
    }
    if (phone.trim() && !normalizePhone(phone)) {
      invalid("phone", rc.badPhone);
      return;
    }
    if (!declared) {
      invalid("declared", DECLARE_COPY[lang].mustDeclare);
      return;
    }
    setError("");
    setFieldError("");
    inFlight.current = true;
    setBusy(true);
    try {
      const gate = await gateFields();
      const result = await orderStore({
        data: {
          intent,
          storeId: store?.id ?? null,
          item: good?.id ?? null,
          url: href,
          size,
          color,
          qty: qty.trim(),
          dest,
          notes,
          phone: phone.trim(),
          declared: true,
          ...gate,
        },
      });
      if (result && "id" in result && result.id) {
        draft.clear();
        setSaved(String(result.id));
        return;
      }
      const code = result && "error" in result ? result.error : "";
      setSignin(code === "signin");
      const message: Record<string, string> = {
        url: t.invalidUrl,
        host: t.wrongHost,
        qty: rc.badQty,
        dest: rc.badDest,
        contact: rc.badPhone,
        rate: rc.rate,
        signin: rc.signin,
        prohibited: marketCopy(lang).prohibited,
        declare: DECLARE_COPY[lang].mustDeclare,
      };
      if (code && message[code]) {
        const field = (
          {
            url: "url",
            host: "url",
            qty: "qty",
            dest: "dest",
            contact: "phone",
            declare: "declared",
          } as Record<string, string>
        )[code];
        if (field) invalid(field, message[code]);
        else {
          setFieldError("");
          setError(message[code]);
        }
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

  return (
    <Shell>
      <PageHeader kicker={t.requestKicker} title={j.bring} lede={j.bringBody} />
      <div className="page rl-form-layout">
        {saved ? (
          <div className="rl-card">
            <h2 className="text-2xl font-semibold">{t.sentTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{j.received}</p>
            <p role="status" className="mt-4 font-sans text-sm font-semibold">
              <bdi dir="ltr">{saved}</bdi>
            </p>
            <Link to="/track" search={{ id: saved }} className="rl-button" data-variant="secondary">
              {global.nav.track}
            </Link>
            <Link
              to="/stores"
              className="mt-6 inline-flex h-12 items-center rounded-full border border-line px-5 text-sm"
            >
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <form ref={formRef} noValidate onSubmit={submit} className="rl-card rl-request-form">
              {unavailable ? (
                <p role="status" className="text-sm text-muted">
                  {dc.unavailable}
                </p>
              ) : null}
              <div className="rl-stack">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.enabled}
                    onChange={(event) => draft.setEnabled(event.target.checked)}
                    disabled={!ready}
                    className="mt-0.5 size-6 shrink-0 accent-pine"
                  />
                  <span>{dc.keep}</span>
                </label>
                <p className="text-xs text-muted">{dc.privacy}</p>
                {draft.restored ? (
                  <p role="status" className="text-sm">
                    {dc.restored}
                  </p>
                ) : null}
                {draft.failed ? (
                  <p role="status" className="text-sm text-clay">
                    {dc.unsafe}
                  </p>
                ) : null}
                {draft.enabled ? (
                  <button type="button" className="rl-button" onClick={draft.clear}>
                    {dc.clear}
                  </button>
                ) : null}
              </div>
              {good ? (
                <div className="flex items-center gap-3">
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
              {store ? (
                <p className="font-sans text-sm text-muted">
                  {store.name} · <bdi dir="ltr">{store.host}</bdi>
                </p>
              ) : null}
              <nav className="rl-row" aria-label={j.bring}>
                <Link
                  to="/stores/request"
                  search={{ store: storeId, item, intent: "buy" }}
                  className="rl-chip"
                  aria-current={intent === "buy" ? "page" : undefined}
                >
                  {t.buyTitle}
                </Link>
                <Link
                  to="/stores/request"
                  search={{ store: storeId, item, intent: "ship" }}
                  className="rl-chip"
                  aria-current={intent === "ship" ? "page" : undefined}
                >
                  {t.shipTitle}
                </Link>
              </nav>
              <Field label={t.url} hint={good ? t.urlHint : undefined}>
                <input
                  name="url"
                  aria-invalid={fieldError === "url" || undefined}
                  aria-describedby={fieldError === "url" ? "rl-request-error" : undefined}
                  disabled={!ready}
                  className={controlClass}
                  dir="ltr"
                  type="url"
                  inputMode="url"
                  maxLength={URL_MAX}
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required={!good}
                />
              </Field>
              <Field label={t.qty}>
                <input
                  name="qty"
                  aria-invalid={fieldError === "qty" || undefined}
                  aria-describedby={fieldError === "qty" ? "rl-request-error" : undefined}
                  disabled={!ready}
                  className={controlClass}
                  dir="ltr"
                  type="number"
                  inputMode="numeric"
                  min={QTY_MIN}
                  max={QTY_MAX}
                  step={1}
                  value={qty}
                  onChange={(event) => setQty(event.target.value)}
                />
              </Field>
              <details className="rl-stack">
                <summary className="rl-mobile-menu-link">{j.optional}</summary>
                {/* Optional variants are disclosed without changing the request payload. */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  <Field label={t.size}>
                    <input
                      disabled={!ready}
                      className={controlClass}
                      maxLength={TEXT_MAX.size}
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                    />
                  </Field>
                  <Field label={t.color}>
                    <input
                      disabled={!ready}
                      className={controlClass}
                      maxLength={TEXT_MAX.color}
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                    />
                  </Field>
                </div>
                <Field label={t.notesLabel}>
                  <textarea
                    disabled={!ready}
                    className={`${controlClass} h-28 py-3`}
                    maxLength={TEXT_MAX.notes}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </Field>
              </details>
              <Field label={t.dest}>
                <select
                  name="dest"
                  aria-invalid={fieldError === "dest" || undefined}
                  aria-describedby={fieldError === "dest" ? "rl-request-error" : undefined}
                  disabled={!ready}
                  className={controlClass}
                  value={dest}
                  onChange={(event) => setDest(event.target.value)}
                >
                  {DESTS.map((place) => (
                    <option key={place.id} value={place.id}>
                      {placeName(place, lang)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={rc.phone} hint={rc.phoneHint}>
                <input
                  name="phone"
                  aria-invalid={fieldError === "phone" || undefined}
                  aria-describedby={fieldError === "phone" ? "rl-request-error" : undefined}
                  disabled={!ready}
                  className={controlClass}
                  dir="ltr"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={24}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </Field>
              <label className="flex items-start gap-3 text-sm leading-relaxed">
                <input
                  disabled={!ready}
                  type="checkbox"
                  name="declared"
                  aria-invalid={fieldError === "declared" || undefined}
                  aria-describedby={fieldError === "declared" ? "rl-request-error" : undefined}
                  checked={declared}
                  onChange={(event) => setDeclared(event.target.checked)}
                  className="mt-0.5 size-6 shrink-0 accent-pine"
                />
                <span>{DECLARE_COPY[lang].declare}</span>
              </label>
              <ItemsLink />
              <div aria-live="polite">
                {error ? (
                  <p id="rl-request-error" role="alert" className="text-sm text-clay">
                    {error}
                  </p>
                ) : null}
                {failed && !error ? <ContactNote pre={ux.failPre} post={ux.failPost} /> : null}
                {signin ? (
                  <Link to="/account" className="rl-text-link">
                    {rc.signin}
                  </Link>
                ) : null}
              </div>
              <button
                type="submit"
                className={`${btnPrimary} disabled:opacity-60`}
                disabled={busy || !ready}
                aria-busy={busy || !ready}
              >
                {busy ? ux.sending : ACCOUNT_REQUEST_COPY[lang].submit}
              </button>
            </form>
            <OrderFallback
              rows={summary}
              declared={declared}
              unavailable={unavailable || signin || failed}
            />
            <details className="rl-stack">
              <summary className="rl-mobile-menu-link">{j.linkCheck}</summary>
              <ProductLinkAssist dest={dest} onUse={setUrl} />
            </details>
          </div>
        )}
        <aside className="rl-form-aside">
          <div className="rl-card rl-stack">
            <h2 className="text-2xl leading-tight font-bold">{j.review}</h2>
            <p className="text-sm text-muted">{intent === "ship" ? t.shipBody : t.whoBody}</p>
            <details>
              <summary className="rl-mobile-menu-link">{t.costs}</summary>
              <ul className="mt-4 flex flex-col gap-3">
                {t.rows.map((row) => (
                  <li key={row} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{row}</span>
                    <span className="rl-awaiting text-muted">{t.awaiting}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
          {store && store.caution.length > 0 ? (
            <div className="rl-card">
              <h2 className="text-2xl leading-tight font-bold">{t.cautionTitle}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {store.caution.map((item) => (
                  <li key={item} className="text-sm text-clay">
                    {t.cautions[item]}
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
