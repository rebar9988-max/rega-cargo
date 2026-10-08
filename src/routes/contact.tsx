import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { Eur, Field, btnPrimary, controlClass } from "@/components/field";
import {
  BOOKING_KEY,
  REQUESTS_KEY,
  getDest,
  getMode,
  getOrigin,
  placeName,
  type BookingDraft,
} from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";

type RequestRow = {
  name: string;
  phone: string;
  city: string;
  note: string;
  at: string;
  booking: BookingDraft | null;
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "پەیوەندی · Rega Cargo" }],
  }),
  component: ContactPage,
});

function readRequests(): RequestRow[] {
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as RequestRow[]).slice(0, 3) : [];
  } catch {
    return [];
  }
}

function ContactPage() {
  const { t, lang } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [rows, setRows] = useState<RequestRow[] | null>(null);

  useEffect(() => {
    setRows(readRequests());
    try {
      const raw = window.sessionStorage.getItem(BOOKING_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as BookingDraft;
      if (parsed && typeof parsed.total === "number") {
        setBooking(parsed);
        setCity((current) => current || placeName(getDest(parsed.toId), lang));
      }
    } catch {
      setBooking(null);
    }
  }, [lang]);

  function clearBooking() {
    window.sessionStorage.removeItem(BOOKING_KEY);
    setBooking(null);
  }

  return (
    <Shell>
      <PageHeader kicker={t.contactKicker} title={t.contactTitle} lede={t.contactLede} />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 lg:grid-cols-3 lg:py-16">
        <div className="min-w-0 lg:col-span-2">
          {booking ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pine bg-surface p-4">
              <div>
                <p className="text-xs font-medium text-pine">{t.attached}</p>
                <p className="mt-1 text-sm font-medium">{t.modes[getMode(booking.mode).id].name}</p>
                <p className="text-sm text-muted">
                  <bdi dir="ltr">
                    {placeName(getOrigin(booking.fromId), lang)} → {placeName(getDest(booking.toId), lang)}
                  </bdi>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">
                  <Eur value={booking.total} />
                </span>
                <button type="button" className="text-sm text-muted underline" onClick={clearBooking}>
                  {t.clearRate}
                </button>
              </div>
            </div>
          ) : null}

          {done ? (
            <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-2xl font-semibold">{t.successTitle}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{t.successBody}</p>
              <button
                type="button"
                className={`${btnPrimary} mt-6`}
                onClick={() => {
                  setDone(false);
                  setName("");
                  setPhone("");
                  setNote("");
                }}
              >
                {t.another}
              </button>
            </div>
          ) : (
            <form
              className="mt-8 grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (name.trim().length < 2 || phone.trim().length < 5) {
                  setError(t.formError);
                  return;
                }
                const row: RequestRow = {
                  name: name.trim(),
                  phone: phone.trim(),
                  city: city.trim(),
                  note: note.trim(),
                  at: new Date().toISOString(),
                  booking,
                };
                const next = [row, ...(rows ?? [])].slice(0, 3);
                window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
                setRows(next);
                setError("");
                setDone(true);
              }}
            >
              <Field label={t.name}>
                <input className={controlClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label={t.phone}>
                <input
                  className={controlClass}
                  dir="ltr"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </Field>
              <Field label={t.city}>
                <input className={controlClass} value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.note}>
                  <textarea
                    className={`${controlClass} h-28 py-3`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
              </div>
              {error ? <p className="text-sm text-clay sm:col-span-2">{error}</p> : null}
              <div className="sm:col-span-2">
                <button type="submit" className={btnPrimary}>
                  {t.send}
                </button>
              </div>
            </form>
          )}

          {rows && rows.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">{t.yourRequests}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {rows.map((row) => (
                  <li key={row.at} className="rounded-xl border border-line px-4 py-3 text-sm">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-muted">
                      <bdi dir="ltr">{row.phone}</bdi>
                      {row.city ? ` · ${row.city}` : ""}
                    </p>
                    {row.note ? <p className="mt-1 text-muted">{row.note}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
          <p className="text-sm font-medium">{t.hubsTitle}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {t.hubs.map((hub) => (
              <li key={hub.name}>
                <p className="font-medium">{hub.name}</p>
                <p className="text-sm text-muted">{hub.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium">{t.hoursTitle}</p>
          <ul className="mt-3 flex flex-col gap-2">
            {t.hours.map((row) => (
              <li key={row} className="text-sm text-muted">
                {row}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Shell>
  );
}
