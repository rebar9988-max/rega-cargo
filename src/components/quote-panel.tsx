import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BOOKING_KEY,
  DESTS,
  HELD_KEY,
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
import { Eur, Field, Iqd, btnGhost, btnPrimary, controlClass } from "@/components/field";

function readHeld(): HeldQuote[] {
  try {
    const raw = window.localStorage.getItem(HELD_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as HeldQuote[]).slice(0, 4) : [];
  } catch {
    return [];
  }
}

export function QuotePanel({
  variant,
  initial,
}: {
  variant: "compact" | "full";
  initial?: { from?: string; to?: string; kg?: string };
}) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [fromId, setFromId] = useState(getOrigin(initial?.from).id);
  const [toId, setToId] = useState(getDest(initial?.to).id);
  const [kg, setKg] = useState(initial?.kg && Number(initial.kg) > 0 ? initial.kg : String(SAMPLE_BOX.kg));
  const [length, setLength] = useState(String(SAMPLE_BOX.l));
  const [width, setWidth] = useState(String(SAMPLE_BOX.w));
  const [height, setHeight] = useState(String(SAMPLE_BOX.h));
  const [pieces, setPieces] = useState("1");
  const [contents, setContents] = useState<Contents>("personal");
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState("");
  const [held, setHeld] = useState<HeldQuote[] | null>(null);

  useEffect(() => {
    if (variant === "full") setHeld(readHeld());
  }, [variant]);

  const origin = getOrigin(fromId);
  const dest = getDest(toId);
  const weight = Number(kg);
  const dims = variant === "compact" ? SAMPLE_BOX : { l: Number(length), w: Number(width), h: Number(height) };
  const weightOk = Number.isFinite(weight) && weight >= 0.2 && weight <= 300;
  const dimsOk =
    variant === "compact" ||
    [dims.l, dims.w, dims.h].every((n) => Number.isFinite(n) && n >= 0 && n <= 300);
  const valid = weightOk && dimsOk;
  const pieceCount = Math.min(50, Math.max(1, Math.round(Number(pieces) || 1)));
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

  function book(modeId: ModeId, total: number, chargeable: number) {
    const draft = persist(modeId, total, chargeable);
    window.sessionStorage.setItem(BOOKING_KEY, JSON.stringify(draft));
    void navigate({ to: "/contact" });
  }

  function save(modeId: ModeId, total: number, chargeable: number) {
    const draft: HeldQuote = { ...persist(modeId, total, chargeable), at: new Date().toISOString() };
    const next = [draft, ...(held ?? []).filter((item) => !(item.fromId === fromId && item.toId === toId && item.mode === modeId))].slice(0, 4);
    window.localStorage.setItem(HELD_KEY, JSON.stringify(next));
    setHeld(next);
    setNotice(t.saved);
  }

  function removeHeld(index: number) {
    const next = (held ?? []).filter((_, i) => i !== index);
    window.localStorage.setItem(HELD_KEY, JSON.stringify(next));
    setHeld(next);
  }

  return (
    <div className={variant === "compact" ? "ticket rounded-2xl border border-line bg-surface p-5 md:p-6" : "flex flex-col gap-8"}>
      <div className={variant === "full" ? "ticket rounded-2xl border border-line bg-surface p-5 md:p-6" : ""}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-widest text-pine">{t.waybill}</p>
          <p className="text-xs text-muted">
            <bdi dir="ltr">EUR · IQD</bdi>
          </p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={t.from}>
            <select className={controlClass} value={fromId} onChange={(event) => setFromId(event.target.value)}>
              {ORIGINS.map((item) => (
                <option key={item.id} value={item.id}>
                  {placeName(item, lang)} — {countryName(item, lang)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.to}>
            <select className={controlClass} value={toId} onChange={(event) => setToId(event.target.value)}>
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={`${t.weight} (${t.kg})`}>
              <input
                className={controlClass}
                dir="ltr"
                inputMode="decimal"
                value={kg}
                onChange={(event) => setKg(event.target.value)}
              />
            </Field>
            <Field label={t.pieces}>
              <input
                className={controlClass}
                dir="ltr"
                inputMode="numeric"
                value={pieces}
                onChange={(event) => setPieces(event.target.value)}
              />
            </Field>
            <Field label={`${t.length} (${t.cm})`}>
              <input className={controlClass} dir="ltr" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} />
            </Field>
            <Field label={`${t.width} (${t.cm})`}>
              <input className={controlClass} dir="ltr" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} />
            </Field>
            <Field label={`${t.height} (${t.cm})`}>
              <input className={controlClass} dir="ltr" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
            </Field>
            <Field label={t.inside}>
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
            <Field label={`${t.value} (€)`}>
              <input className={controlClass} dir="ltr" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
            </Field>
          </div>
        )}

        {!weightOk ? <p className="mt-4 text-sm text-clay">{t.weightError}</p> : null}
        {!dimsOk ? <p className="mt-2 text-sm text-clay">{t.dimError}</p> : null}
        {variant === "full" && pieceCount > 1 ? <p className="mt-3 text-sm text-muted">{t.perPiece}</p> : null}

        {valid && lead ? (
          <div className="mt-5" aria-live="polite">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
              <Meter k={t.scale} v={`${weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)} ${t.kg}`} />
              <Meter k={t.volumeWord} v={`${lead.price.volumetric.toFixed(1)} ${t.kg}`} />
              <Meter k={t.chargeable} v={`${lead.price.chargeable.toFixed(1)} ${t.kg}`} hot={lead.price.volumetricWins} />
            </div>
            {lead.price.volumetricWins ? <p className="mt-3 text-sm text-pine">{t.boxSets}</p> : null}

            {variant === "compact" ? (
              <ul className="mt-2 divide-y divide-line">
                {rows.map((row) => (
                  <li key={row.mode.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.modes[row.mode.id].name}</p>
                      <p className="text-xs text-muted">
                        <bdi dir="ltr">
                          {dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])} · {row.price.chargeable.toFixed(1)} {t.kg}
                        </bdi>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-semibold">
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
                {rows.map((row) => {
                  const less = Math.round((rows[0].price.total - row.price.total) * 100) / 100;
                  return (
                    <article key={row.mode.id} className="rounded-xl border border-line bg-paper p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {row.mode.id === "economy" ? (
                            <p className="text-xs font-medium text-pine">{t.usual}</p>
                          ) : null}
                          <h3 className="text-lg font-semibold">{t.modes[row.mode.id].name}</h3>
                          <p className="text-sm text-muted">
                            <bdi dir="ltr">{dayRange(t.dayRange, row.mode.days[0], row.mode.days[1])}</bdi>
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="text-2xl font-semibold tracking-tight">
                            <Eur value={row.price.total} />
                          </p>
                          <p className="text-xs text-muted">
                            <Iqd eur={row.price.total} />
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{t.modes[row.mode.id].blurb}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        <bdi dir="ltr" className="tabular-nums text-ink">
                          {row.price.chargeable.toFixed(1)} kg × €{row.mode.perKg.toFixed(2)} × {origin.factor.toFixed(2)}
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
                          className={btnPrimary}
                          onClick={() => book(row.mode.id, row.price.total, row.price.chargeable)}
                        >
                          {t.book}
                        </button>
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => save(row.mode.id, row.price.total, row.price.chargeable)}
                        >
                          {t.save}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {variant === "full" ? (
              <div className="mt-4 rounded-xl border border-line bg-paper p-4">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{t.duty}</span>
                  <span className="font-medium">
                    <Eur value={duty} />
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {contents === "documents" ? t.dutyDocs : safeValue > 0 && safeValue <= 200 && contents === "personal" ? t.dutyLow : t.dutyPlan}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {variant === "compact" && valid ? (
          <Link
            to="/quote"
            search={{ from: fromId, to: toId, kg }}
            className={`${btnPrimary} mt-4 w-full`}
          >
            {t.changeBox}
          </Link>
        ) : null}
        {notice ? <p className="mt-4 text-sm text-pine">{notice}</p> : null}
        {variant === "full" ? <p className="mt-4 text-sm leading-relaxed text-muted">{t.footnote}</p> : null}
      </div>

      {variant === "full" && held && held.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">{t.heldTitle}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {held.map((item, index) => {
              const from = getOrigin(item.fromId);
              const to = getDest(item.toId);
              return (
                <li key={`${item.at}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
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
                    <button type="button" className="text-sm text-muted underline" onClick={() => removeHeld(index)}>
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
        <bdi dir="ltr" className="tabular-nums">
          {v}
        </bdi>
      </p>
    </div>
  );
}
