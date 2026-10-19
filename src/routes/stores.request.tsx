import { responsiveImage } from "@/lib/images";
import { seo } from "@/lib/seo";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { ItemsLink } from "@/components/items-link";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import { BRING_COPY, stepStatus } from "@/lib/bring-copy";
import { westernDigits } from "@/lib/numbers";
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
import { TrustSummary } from "@/components/trust-summary";
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

const STEP_TOTAL = 3;
/** Which step owns each validated field, so an error always brings the customer to its field. */
const FIELD_STEP: Record<string, 1 | 2 | 3> = { url: 1, qty: 1, dest: 2, phone: 2, declared: 3 };

function RequestPage() {
  const { lang, t: global } = useI18n();
  const t = storeCopy(lang);
  const rc = REQUEST_COPY[lang];
  const b = BRING_COPY[lang];
  const { store: storeId, intent, item } = Route.useSearch();
  const good = goodById(item);
  const store = storeById(storeId) ?? storeById(good?.storeId);
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);
  const pendingFocus = useRef<string | null>(null);
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

  // After a step change keep keyboard and screen-reader users oriented: focus the field that
  // needs fixing, or else the new step's heading. Never on first load.
  useEffect(() => {
    if (!touched.current) return;
    const name = pendingFocus.current;
    pendingFocus.current = null;
    const target = name
      ? formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)
      : headingRef.current;
    target?.focus();
  }, [step]);

  function goTo(next: 1 | 2 | 3) {
    touched.current = true;
    setStep(next);
  }

  function invalid(field: string, message: string) {
    setError(message);
    setFieldError(field);
    touched.current = true;
    const owner = FIELD_STEP[field] ?? 1;
    if (owner === step) {
      formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return;
    }
    pendingFocus.current = field;
    setStep(owner);
  }

  /** The same checks as the server (store-request.ts), in step order; the server re-validates. */
  function validate(upTo: 1 | 2 | 3): { ok: true; href: string } | { ok: false } {
    let href = "";
    if (url.trim()) {
      const checked = checkProductUrl(url, store);
      if (!checked.ok) {
        invalid("url", checked.error === "host" ? t.wrongHost : t.invalidUrl);
        return { ok: false };
      }
      href = checked.url;
    } else if (!good) {
      invalid("url", t.invalidUrl);
      return { ok: false };
    }
    const count = Number(qty.trim());
    if (!/^\d{1,2}$/.test(qty.trim()) || count < QTY_MIN || count > QTY_MAX) {
      invalid("qty", rc.badQty);
      return { ok: false };
    }
    if (upTo >= 2 && phone.trim() && !normalizePhone(phone)) {
      invalid("phone", rc.badPhone);
      return { ok: false };
    }
    if (upTo >= 3 && !declared) {
      invalid("declared", DECLARE_COPY[lang].mustDeclare);
      return { ok: false };
    }
    return { ok: true, href };
  }

  function next() {
    if (step >= STEP_TOTAL) return;
    if (!validate(step).ok) return;
    setError("");
    setFieldError("");
    goTo((step + 1) as 2 | 3);
  }

  function adjustQty(delta: number) {
    const parsed = Number(westernDigits(qty.trim()));
    const base = Number.isInteger(parsed) && parsed >= QTY_MIN ? parsed : QTY_MIN;
    setQty(String(Math.min(QTY_MAX, Math.max(QTY_MIN, base + delta))));
  }
  const qtyNow = Number(westernDigits(qty.trim()));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    // Enter on the first two steps moves forward; only the review step sends.
    if (step < STEP_TOTAL) {
      next();
      return;
    }
    setFailed(false);
    setSignin(false);
    const checked = validate(3);
    if (!checked.ok) return;
    const href = checked.href;
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

  const titles = [b.productTitle, b.deliveryTitle, b.steps[2]];
  const intentLabel = intent === "ship" ? t.shipTitle : t.buyTitle;
  const productLabel = url.trim() || (good ? t.goods[good.id] : "");
  const place = getDest(dest);

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
              <p
                role="status"
                className={`text-sm text-muted ${unavailable ? "" : "invisible"}`}
                aria-hidden={!unavailable}
              >
                {dc.unavailable}
              </p>
              <ol className="rl-steps" aria-label={b.stepsLabel}>
                {b.steps.map((label, index) => {
                  const n = index + 1;
                  const state = n === step ? "current" : n < step ? "done" : "todo";
                  return (
                    <li
                      key={label}
                      className="rl-step"
                      data-state={state}
                      aria-current={n === step ? "step" : undefined}
                    >
                      {n < step ? (
                        <button
                          type="button"
                          className="rl-step-link"
                          disabled={busy || !ready}
                          onClick={() => goTo(n as 1 | 2)}
                        >
                          <span className="rl-step-num" aria-hidden="true">
                            ✓
                          </span>
                          <span>{label}</span>
                        </button>
                      ) : (
                        <>
                          <span className="rl-step-num" aria-hidden="true">
                            {n}
                          </span>
                          <span>{label}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="sr-only" role="status" aria-live="polite">
                {stepStatus(b, step, STEP_TOTAL)}
              </p>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="rl-step-heading text-2xl leading-tight font-bold"
              >
                {titles[step - 1]}
              </h2>

              {step === 1 ? (
                <div className="rl-stack" data-step-panel="1">
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
                  <div className="flex flex-col gap-2 text-sm">
                    <label htmlFor="rl-qty" className="font-medium text-ink">
                      {t.qty}
                    </label>
                    <div className="rl-qty">
                      <button
                        type="button"
                        className="rl-qty-button"
                        aria-label={b.qtyLess}
                        disabled={!ready || !(qtyNow > QTY_MIN)}
                        onClick={() => adjustQty(-1)}
                      >
                        −
                      </button>
                      <input
                        id="rl-qty"
                        name="qty"
                        aria-invalid={fieldError === "qty" || undefined}
                        aria-describedby={fieldError === "qty" ? "rl-request-error" : undefined}
                        disabled={!ready}
                        className={`${controlClass} rl-qty-input`}
                        dir="ltr"
                        type="number"
                        inputMode="numeric"
                        min={QTY_MIN}
                        max={QTY_MAX}
                        step={1}
                        value={qty}
                        onChange={(event) => setQty(event.target.value)}
                      />
                      <button
                        type="button"
                        className="rl-qty-button"
                        aria-label={b.qtyMore}
                        disabled={!ready || qtyNow >= QTY_MAX}
                        onClick={() => adjustQty(1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
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
                  <div className="rl-stack">
                    <label className="-my-3 flex items-center gap-3 py-3 text-sm">
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
                </div>
              ) : null}

              {step === 2 ? (
                <div className="rl-stack" data-step-panel="2">
                  <div className="flex flex-col gap-2 text-sm">
                    <span className="font-medium text-ink">{b.country}</span>
                    <p>{b.countryValue}</p>
                  </div>
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
                      {DESTS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {placeName(option, lang)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <h3 className="text-lg font-semibold">{b.contactTitle}</h3>
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
                </div>
              ) : null}

              {step === 3 ? (
                <div className="rl-stack" data-step-panel="3">
                  <p className="text-sm text-muted">{b.reviewHint}</p>
                  <section className="rl-review" aria-label={b.steps[0]}>
                    <div className="rl-review-head">
                      <h3 className="text-lg font-semibold">{b.steps[0]}</h3>
                      <button
                        type="button"
                        className="rl-button"
                        data-variant="secondary"
                        disabled={busy}
                        onClick={() => goTo(1)}
                      >
                        {b.edit}
                      </button>
                    </div>
                    <dl>
                      <div>
                        <dt>{j.bring}</dt>
                        <dd>{intentLabel}</dd>
                      </div>
                      <div>
                        <dt>{t.url}</dt>
                        <dd>
                          <bdi dir="ltr" className="break-all">
                            {productLabel || "—"}
                          </bdi>
                        </dd>
                      </div>
                      <div>
                        <dt>{t.qty}</dt>
                        <dd>
                          <bdi dir="ltr">{qty.trim()}</bdi>
                        </dd>
                      </div>
                      {size.trim() ? (
                        <div>
                          <dt>{t.size}</dt>
                          <dd dir="auto">{size}</dd>
                        </div>
                      ) : null}
                      {color.trim() ? (
                        <div>
                          <dt>{t.color}</dt>
                          <dd dir="auto">{color}</dd>
                        </div>
                      ) : null}
                      {notes.trim() ? (
                        <div>
                          <dt>{t.notesLabel}</dt>
                          <dd dir="auto" className="break-words">
                            {notes}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </section>
                  <section className="rl-review" aria-label={b.steps[1]}>
                    <div className="rl-review-head">
                      <h3 className="text-lg font-semibold">{b.steps[1]}</h3>
                      <button
                        type="button"
                        className="rl-button"
                        data-variant="secondary"
                        disabled={busy}
                        onClick={() => goTo(2)}
                      >
                        {b.edit}
                      </button>
                    </div>
                    <dl>
                      <div>
                        <dt>{b.country}</dt>
                        <dd>{b.countryValue}</dd>
                      </div>
                      <div>
                        <dt>{b.city}</dt>
                        <dd>{placeName(place, lang)}</dd>
                      </div>
                      <div>
                        <dt>{rc.phone}</dt>
                        <dd>
                          {phone.trim() ? <bdi dir="ltr">{phone.trim()}</bdi> : b.notProvided}
                        </dd>
                      </div>
                    </dl>
                  </section>
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
                </div>
              ) : null}

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
              <div className="rl-step-actions">
                {step > 1 ? (
                  <button
                    type="button"
                    className="rl-button"
                    data-variant="secondary"
                    data-step-back
                    disabled={busy || !ready}
                    onClick={() => goTo((step - 1) as 1 | 2)}
                  >
                    {b.back}
                  </button>
                ) : null}
                <button
                  key={step}
                  type="submit"
                  className={`${btnPrimary} disabled:opacity-60`}
                  data-step-next={step < STEP_TOTAL ? "" : undefined}
                  disabled={busy || !ready}
                  aria-busy={busy || !ready}
                >
                  {step < STEP_TOTAL
                    ? b.next
                    : busy
                      ? ux.sending
                      : ACCOUNT_REQUEST_COPY[lang].submit}
                </button>
              </div>
            </form>
            {step === 1 ? (
              <details className="rl-stack">
                <summary className="rl-mobile-menu-link">{j.linkCheck}</summary>
                <ProductLinkAssist dest={dest} onUse={setUrl} />
              </details>
            ) : null}
            {step === STEP_TOTAL ? (
              <OrderFallback
                rows={summary}
                declared={declared}
                unavailable={unavailable || signin || failed}
              />
            ) : null}
          </div>
        )}
        <aside className="rl-form-aside">
          <TrustSummary />
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
