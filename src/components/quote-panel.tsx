import { Price, Icon } from "./ui";
import { Scale, Package } from "lucide-react";
import { redesignCopy } from "@/lib/redesign-copy";
import { NUM_LOCALE } from "@/lib/numbers";
import { QUOTE_LIMITS, dimInRange, kgInRange, parseKg } from "@/lib/quote-search";
import { useEffect, useMemo, useState, useRef, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  DESTS,
  IQD_PER_EUR,
  IQD_RATE_UPDATED,
  MODES,
  ORIGINS,
  SAMPLE_BOX,
  dutyEstimate,
  formatEur,
  getDest,
  getOrigin,
  countryName,
  placeName,
  priceShipment,
  type BookingDraft,
  type Contents,
  type HeldQuote,
  type ModeId,
} from "@/lib/corridor";
import { dayRange, useI18n } from "@/lib/i18n";
import { issueQuote, orderQuote } from "@/lib/orders/api";
import { UX_COPY } from "@/lib/ux-copy";
import { ContactNote } from "@/components/contact-note";
import { RichLine } from "@/components/rich-line";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { ItemsLink } from "@/components/items-link";
import { getJson, setJson } from "@/lib/storage";
import { Eur, Field, Iqd, btnGhost, btnPrimary, controlClass } from "@/components/field";

const HELD_FIELDS = ["fromId", "toId", "mode", "contents", "at"] as const;

/** Saved quotes: route, mode, weight and price only (no personal data). Tampered entries are dropped. */
function readHeld(): HeldQuote[] {
  return getJson(
    "held",
    (value) =>
      Array.isArray(value)
        ? (
            value.filter(
              (item) =>
                item &&
                typeof item === "object" &&
                HELD_FIELDS.every(
                  (key) => typeof (item as Record<string, unknown>)[key] === "string",
                ) &&
                ["total", "kg", "chargeable"].every((key) =>
                  Number.isFinite((item as Record<string, unknown>)[key]),
                ),
            ) as HeldQuote[]
          ).slice(0, 4)
        : null,
    [],
  );
}

export function QuotePanel({
  variant,
  initial,
}: {
  variant: "compact" | "full" | "quick";
  initial?: { from?: string; to?: string; kg?: string; l?: number; w?: number; h?: number };
}) {
  const { t, lang } = useI18n();
  const c = redesignCopy(lang);
  const [fromId, setFromId] = useState(getOrigin(initial?.from).id);
  const [toId, setToId] = useState(getDest(initial?.to).id);
  const [kg, setKg] = useState(
    initial?.kg && Number(initial.kg) > 0 ? initial.kg : String(SAMPLE_BOX.kg),
  );
  const [length, setLength] = useState(String(initial?.l ?? SAMPLE_BOX.l));
  const [width, setWidth] = useState(String(initial?.w ?? SAMPLE_BOX.w));
  const [height, setHeight] = useState(String(initial?.h ?? SAMPLE_BOX.h));
  const [pieces, setPieces] = useState("1");
  const [contents, setContents] = useState<Contents>("personal");
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState("");
  // Per-card booking state: blocks duplicate submits and shows the result next to the button.
  const [booking, setBooking] = useState<{
    mode: ModeId;
    state: "busy" | "failed" | "message";
    text?: string;
  } | null>(null);
  const ux = UX_COPY[lang];
  const inFlight = useRef(false);
  const [held, setHeld] = useState<HeldQuote[] | null>(null);
  const [restrictedOk, setRestrictedOk] = useState(false);
  const dc = DECLARE_COPY[lang];

  useEffect(() => {
    if (variant === "full") setHeld(readHeld());
  }, [variant]);

  const origin = getOrigin(fromId);
  const dest = getDest(toId);
  const weight = Number(kg);
  const dims =
    variant === "compact" ? SAMPLE_BOX : { l: Number(length), w: Number(width), h: Number(height) };
  const weightOk = kgInRange(weight);
  const dimsOk = variant === "compact" || [dims.l, dims.w, dims.h].every(dimInRange);
  const valid = weightOk && dimsOk;
  const pieceCount = Math.min(
    QUOTE_LIMITS.pieces.max,
    Math.max(QUOTE_LIMITS.pieces.min, Math.round(Number(pieces) || 1)),
  );
  const declared = Number(value);
  const safeValue = Number.isFinite(declared) && declared > 0 ? declared : 0;

  const rows = useMemo(() => {
    if (!valid) return [];
    return MODES.map((mode) => ({
      mode,
      price: priceShipment({
        mode,
        origin,
        dest,
        weightKg: weight,
        l: dims.l,
        w: dims.w,
        h: dims.h,
      }),
    }));
  }, [valid, origin, dest, weight, dims.l, dims.w, dims.h]);

  const lead = rows[0];
  const duty = dutyEstimate(contents, safeValue);

  function persist(modeId: ModeId, total: number, chargeable: number) {
    const draft: BookingDraft = {
      fromId,
      toId,
      mode: modeId,
      total,
      kg: weight,
      chargeable,
      contents,
    };
    return draft;
  }

  async function book(modeId: ModeId) {
    if (inFlight.current) return;
    if (!restrictedOk) {
      setBooking({ mode: modeId, state: "message", text: dc.mustDeclare });
      return;
    }
    inFlight.current = true;
    setBooking({ mode: modeId, state: "busy" });
    try {
      // The server prices the shipment itself and signs the quote; no client price is sent.
      const quote = await issueQuote({
        data: { fromId, toId, mode: modeId, kg: weight, l: dims.l, w: dims.w, h: dims.h },
      });
      if ("token" in quote && quote.token) {
        const result = await orderQuote({ data: { quote: quote.token, contents, declared: true } });
        if (result && "id" in result && result.id) {
          setBooking({ mode: modeId, state: "message", text: String(result.id) });
          return;
        }
        if (result && "error" in result && result.error === "expired") {
          setBooking({ mode: modeId, state: "message", text: dc.expired });
          return;
        }
        if (result && "error" in result && result.error === "rate") {
          setBooking({ mode: modeId, state: "message", text: dc.rate });
          return;
        }
      } else if ("error" in quote && quote.error === "rate") {
        setBooking({ mode: modeId, state: "message", text: dc.rate });
        return;
      }
    } catch {
      /* not signed in, or the database is not configured */
    } finally {
      inFlight.current = false;
    }
    // Stay on the page: the quote and inputs are kept; offer the email route instead.
    setBooking({ mode: modeId, state: "failed" });
  }

  function save(modeId: ModeId, total: number, chargeable: number) {
    const draft: HeldQuote = {
      ...persist(modeId, total, chargeable),
      at: new Date().toISOString(),
    };
    const next = [
      draft,
      ...(held ?? []).filter(
        (item) => !(item.fromId === fromId && item.toId === toId && item.mode === modeId),
      ),
    ].slice(0, 4);
    setJson("held", next);
    setHeld(next);
    setNotice(t.saved);
  }

  function removeHeld(index: number) {
    const next = (held ?? []).filter((_, i) => i !== index);
    setJson("held", next);
    setHeld(next);
  }

  if (variant === "quick") {
    return (
      <div className="rl-quick-calc">
        <div className="rl-quick-fields">
          <Field label={t.from} className="rl-quick-route">
            <select
              className={controlClass}
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              {ORIGINS.map((p) => (
                <option key={p.id} value={p.id}>
                  {placeName(p, lang)} · {countryName(p, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.to} className="rl-quick-route">
            <select className={controlClass} value={toId} onChange={(e) => setToId(e.target.value)}>
              {DESTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {placeName(p, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${t.weight} (${t.kg})`} className="rl-quick-weight">
            <input
              className={controlClass}
              dir="ltr"
              inputMode="decimal"
              aria-invalid={!weightOk}
              value={kg}
              onChange={(e) => setKg(e.target.value)}
            />
          </Field>
          {[
            { label: t.length, value: length, set: setLength },
            { label: t.width, value: width, set: setWidth },
            { label: t.height, value: height, set: setHeight },
          ].map((f) => (
            <Field key={f.label} label={`${f.label} (${t.cm})`} className="rl-quick-dimension">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                aria-invalid={!dimInRange(Number(f.value))}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
              />
            </Field>
          ))}
        </div>
        {!valid ? (
          <p role="alert" className="rl-caption">
            {!weightOk ? t.weightError : t.dimError}
          </p>
        ) : null}
        <div className="rl-quick-options">
          {rows.map((row) => (
            <article key={row.mode.id}>
              <div className="rl-quick-option-copy">
                <h3>{t.modes[row.mode.id].name}</h3>
                <p className="rl-caption">
                  {t.chargeable}:{" "}
                  <bdi dir="ltr">
                    {row.price.chargeable.toFixed(1)} {t.kg}
                  </bdi>
                </p>
              </div>
              <Price eur={row.price.total} />
            </article>
          ))}
        </div>
        <div className="rl-calc-note">
          <p>{c.weightBody}</p>
          <Link
            to="/quote"
            search={{
              from: fromId,
              to: toId,
              kg: weightOk ? weight : undefined,
              l: dimInRange(dims.l) ? dims.l : undefined,
              w: dimInRange(dims.w) ? dims.w : undefined,
              h: dimInRange(dims.h) ? dims.h : undefined,
            }}
            className="rl-text-link"
          >
            {t.hero.fullQuote}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={variant === "compact" ? "rl-card rl-quote-card" : "rl-quote-stack"}>
      <div className={variant === "full" ? "rl-card rl-quote-card" : ""}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-widest text-pine">{t.waybill}</p>
          <p className="text-xs text-muted">
            <bdi dir="ltr">EUR · IQD</bdi>
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label={t.from}>
            <select
              className={controlClass}
              value={fromId}
              onChange={(event) => setFromId(event.target.value)}
            >
              {ORIGINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {placeName(item, lang)} — {countryName(item, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.to}>
            <select
              className={controlClass}
              value={toId}
              onChange={(event) => setToId(event.target.value)}
            >
              {DESTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {placeName(item, lang)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {variant === "compact" ? (
          <div className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <span className="text-sm font-medium">{t.weight}</span>
              <bdi dir="ltr" className="text-lg font-semibold tabular-nums">
                {Number.isFinite(weight) ? weight.toFixed(1) : "—"} {t.kg}
              </bdi>
            </div>
            <input
              className="mt-2 h-12 w-full"
              type="range"
              min={0.5}
              max={30}
              step={0.1}
              value={Math.min(30, Math.max(0.5, Number.isFinite(weight) ? weight : 3.2))}
              aria-label={t.weight}
              onChange={(event) => setKg(event.target.value)}
            />
            <p className="text-sm text-muted">
              <bdi dir="ltr">
                {SAMPLE_BOX.l} × {SAMPLE_BOX.w} × {SAMPLE_BOX.h} {t.cm}
              </bdi>
            </p>
          </div>
        ) : (
          // Phones too: weight and pieces side by side, the three dimensions in one row.
          <div className="mt-4 grid grid-cols-6 gap-x-3 gap-y-4">
            <Field label={`${t.weight} (${t.kg})`} className="col-span-3">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                aria-invalid={!weightOk}
                value={kg}
                onChange={(event) => setKg(event.target.value)}
              />
            </Field>
            <Field label={t.pieces} className="col-span-3">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="numeric"
                value={pieces}
                onChange={(event) => setPieces(event.target.value)}
              />
            </Field>
            <Field label={`${t.length} (${t.cm})`} className="col-span-2">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                aria-invalid={!dimInRange(Number(length))}
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </Field>
            <Field label={`${t.width} (${t.cm})`} className="col-span-2">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                aria-invalid={!dimInRange(Number(width))}
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </Field>
            <Field label={`${t.height} (${t.cm})`} className="col-span-2">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                aria-invalid={!dimInRange(Number(height))}
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Field>
            {!valid ? (
              <p role="alert" className="col-span-6 text-sm text-clay">
                {dc.range}
              </p>
            ) : null}
            <Field label={t.inside} className="col-span-6 md:col-span-3">
              <select
                className={controlClass}
                value={contents}
                onChange={(event) => setContents(event.target.value as Contents)}
              >
                {(Object.keys(t.contentsOpt) as Contents[]).map((key) => (
                  <option key={key} value={key}>
                    {t.contentsOpt[key]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`${t.value} (€)`} className="col-span-6 md:col-span-3">
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </Field>
          </div>
        )}

        {!weightOk ? <p className="mt-4 text-sm text-clay">{t.weightError}</p> : null}
        {!dimsOk ? <p className="mt-2 text-sm text-clay">{t.dimError}</p> : null}
        {variant === "full" && pieceCount > 1 ? (
          <p className="mt-3 text-sm text-muted">{t.perPiece}</p>
        ) : null}

        {valid && lead ? (
          <div className="mt-5" aria-live="polite">
            {variant === "full" ? (
              <section className="rl-weight-explanation">
                <h2>{c.weightTitle}</h2>
                <p>{c.weightBody}</p>
                <p className="rl-weight-formula">
                  <bdi dir="ltr">
                    {dims.l} × {dims.w} × {dims.h} ÷ {lead.mode.divisor} ={" "}
                    {lead.price.volumetric.toFixed(1)} {t.kg}
                  </bdi>{" "}
                  · {t.modes[lead.mode.id].name}
                </p>
                <div className="rl-weight-visual">
                  {[
                    { label: t.scale, value: weight, icon: Scale },
                    { label: t.volumeWord, value: lead.price.volumetric, icon: Package },
                  ].map((item) => (
                    <div key={item.label} className="rl-weight-item">
                      <div>
                        <Icon as={item.icon} />
                        <span>{item.label}</span>
                        <bdi dir="ltr">
                          {item.value.toFixed(1)} {t.kg}
                        </bdi>
                      </div>
                      <span className="rl-weight-track" aria-hidden="true">
                        <span
                          style={
                            {
                              "--rl-weight-fraction": `${(item.value / lead.price.chargeable) * 100}%`,
                            } as CSSProperties
                          }
                        />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
              <Meter
                k={t.scale}
                v={`${weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)} ${t.kg}`}
              />
              <Meter k={t.volumeWord} v={`${lead.price.volumetric.toFixed(1)} ${t.kg}`} />
              <Meter
                k={t.chargeable}
                v={`${lead.price.chargeable.toFixed(1)} ${t.kg}`}
                hot={lead.price.volumetricWins}
              />
            </div>
            {lead.price.volumetricWins ? (
              <p className="mt-3 text-sm text-pine">{t.boxSets}</p>
            ) : null}

            {variant === "compact" ? (
              <ul className="mt-2 divide-y divide-line">
                {rows.map((row) => (
                  <li key={row.mode.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.modes[row.mode.id].name}</p>
                      <p className="text-xs text-muted">
                        <bdi dir="ltr">
                          {dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])} ·{" "}
                          {row.price.chargeable.toFixed(1)} {t.kg}
                        </bdi>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-base font-semibold">
                        <Eur value={row.price.total} />
                      </p>
                      <p className="text-xs text-muted">
                        <Iqd eur={row.price.total} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <label className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={restrictedOk}
                    onChange={(event) => setRestrictedOk(event.target.checked)}
                    className="mt-0.5 size-6 shrink-0 accent-pine"
                  />
                  <span>{dc.declare}</span>
                </label>
                <ItemsLink />
                {rows.map((row) => {
                  const less = Math.round((rows[0].price.total - row.price.total) * 100) / 100;
                  return (
                    <article key={row.mode.id} className="rl-quote-option rl-defer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-2xl leading-tight font-bold">
                            {t.modes[row.mode.id].name}
                          </h2>
                          <p className="text-sm text-muted">
                            <bdi dir="ltr">
                              {dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])}
                            </bdi>
                          </p>
                        </div>
                        <Price eur={row.price.total} />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {t.modes[row.mode.id].blurb}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        <bdi dir="ltr" className="tabular-nums text-ink">
                          {row.price.chargeable.toFixed(1)} kg × €{row.mode.perKg.toFixed(2)} ×{" "}
                          {origin.factor.toFixed(2)}
                        </bdi>
                        {row.price.minApplied ? <span> · {t.minApplied}</span> : null}
                        {row.price.bulky ? <span> · {t.bulky}</span> : null}
                        {dest.surcharge > 0 ? (
                          <span>
                            {" "}
                            · <bdi dir="ltr">+{formatEur(dest.surcharge)}</bdi> {t.cityDrop}
                          </span>
                        ) : (
                          <span> · {t.gateway}</span>
                        )}
                      </p>
                      {less > 0.5 ? (
                        <p className="mt-2 text-sm text-pine">
                          <Eur value={less} /> {t.saveVs}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${btnPrimary} disabled:opacity-60`}
                          disabled={booking?.state === "busy"}
                          aria-busy={booking?.mode === row.mode.id && booking.state === "busy"}
                          onClick={() => book(row.mode.id)}
                        >
                          {booking?.mode === row.mode.id && booking.state === "busy"
                            ? ux.sending
                            : t.book}
                        </button>
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => save(row.mode.id, row.price.total, row.price.chargeable)}
                        >
                          {t.save}
                        </button>
                      </div>
                      <div aria-live="polite">
                        {booking?.mode === row.mode.id && booking.state === "failed" ? (
                          <ContactNote
                            pre={ux.bookFailPre}
                            post={ux.bookFailPost}
                            className="mt-3"
                          />
                        ) : null}
                        {booking?.mode === row.mode.id && booking.state === "message" ? (
                          <p role="alert" className="mt-3 text-sm text-pine">
                            <bdi>{booking.text}</bdi>
                          </p>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {variant === "full" ? (
              <div className="mt-4 rounded-xl border border-line bg-paper p-4">
                {duty > 0 ? (
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{t.duty}</span>
                    <span className="font-medium">
                      ≈ <Eur value={duty} />
                    </span>
                  </div>
                ) : null}
                <RichLine
                  text={dc.customs}
                  className={`text-sm leading-relaxed text-muted ${duty > 0 ? "mt-2" : ""}`}
                />
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {contents === "documents"
                    ? t.dutyDocs
                    : safeValue > 0 && safeValue <= 200 && contents === "personal"
                      ? t.dutyLow
                      : t.dutyPlan}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {dc.iqdRate
                    .replace("{rate}", IQD_PER_EUR.toLocaleString(NUM_LOCALE))
                    .replace("{date}", IQD_RATE_UPDATED)}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {variant === "compact" && valid ? (
          <Link
            to="/quote"
            search={{ from: fromId, to: toId, kg: parseKg(kg) }}
            className={`${btnPrimary} mt-4 w-full`}
          >
            {t.changeBox}
          </Link>
        ) : null}
        {notice ? (
          <p role="status" className="mt-4 text-sm text-pine">
            {notice}
          </p>
        ) : null}
        {variant === "full" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.footnote}</p>
        ) : null}
      </div>

      {variant === "full" && held && held.length > 0 ? (
        <section>
          <h2 className="text-2xl leading-tight font-bold">{t.heldTitle}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {held.map((item, index) => {
              const from = getOrigin(item.fromId);
              const to = getDest(item.toId);
              return (
                <li
                  key={`${item.at}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">{t.modes[item.mode].name}</p>
                    <p className="text-muted">
                      <bdi dir="ltr">
                        {placeName(from, lang)} → {placeName(to, lang)}
                      </bdi>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      <Eur value={item.total} />
                    </span>
                    <button
                      type="button"
                      className="text-sm text-muted underline"
                      onClick={() => removeHeld(index)}
                    >
                      {t.remove}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Meter({ k, v, hot }: { k: string; v: string; hot?: boolean }) {
  return (
    <div className={`bg-surface px-3 py-3 ${hot ? "text-pine" : ""}`}>
      <p className="text-xs text-muted">{k}</p>
      <p className="mt-1 text-sm font-semibold">
        <span className="tabular-nums">{v}</span>
      </p>
    </div>
  );
}
