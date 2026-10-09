import { Link, useRouter } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { btnGhost, btnPrimary, controlClass, Field } from "@/components/field";
import { StatusBadge } from "@/components/request-bits";
import { when } from "@/lib/requests/format";
import { useI18n } from "@/lib/i18n";
import { REQUEST_COPY, type RequestCopy } from "@/lib/requests/copy";
import { staffAction, staffList } from "@/lib/requests/api";
import { STAFF_STATUSES, staffCanSet } from "@/lib/requests/validate";

type Rows = Awaited<ReturnType<typeof staffList>>;

/** Staff queue on /admin. The server refuses non-staff; this only renders what it returns. */
export function StaffRequestList({ initial }: { initial: Rows | null }) {
  const { lang } = useI18n();
  const t = REQUEST_COPY[lang];
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState("");
  async function load(status: string) {
    setFilter(status);
    setRows(await staffList({ data: { status } }));
  }
  const filters = ["", "received", "reviewing", "quoted", "accepted", "in_transit"];
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl leading-tight font-bold">{t.staffTitle}</h2>
      <div className="flex flex-wrap gap-2">
        {filters.map((status) => (
          <button
            key={status || "all"}
            type="button"
            aria-pressed={filter === status}
            className={filter === status ? btnPrimary : btnGhost}
            onClick={() => load(status)}
          >
            {status ? t.statuses[status] : t.all}
          </button>
        ))}
      </div>
      {!rows || "error" in rows ? (
        <p className="text-sm text-muted">
          {t.err[rows && "error" in rows ? String(rows.error) : "unavailable"] ?? t.err.unavailable}
        </p>
      ) : null}
      {rows && !("error" in rows) && rows.requests.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : null}
      {rows && !("error" in rows)
        ? rows.requests.map((row) => (
            <Link
              key={row.ref}
              to="/account/$ref"
              params={{ ref: row.ref }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 hover:border-pine"
            >
              <span className="flex min-w-0 flex-col gap-1 text-sm">
                <bdi dir="ltr" className="font-bold">
                  {row.ref}
                </bdi>
                <span className="text-muted">
                  {t.kinds[row.kind] ?? row.kind} · {row.name} · <bdi dir="ltr">{when(row.at)}</bdi>
                </span>
                {row.title ? (
                  <span dir="auto" className="line-clamp-1 break-all">
                    {row.title}
                  </span>
                ) : null}
              </span>
              <StatusBadge status={row.status} t={t} />
            </Link>
          ))
        : null}
    </section>
  );
}

type DetailLike = {
  ref: string;
  kind: string;
  status: string;
  contact: { name: string; phone: string } | null;
  quotes: { status: string }[];
};

/** Quote / status / tracking-event tools shown to staff on the request page. */
export function StaffRequestTools({ request, t }: { request: DetailLike; t: RequestCopy }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  const [amount, setAmount] = useState("");
  const [customs, setCustoms] = useState(false);
  const [days, setDays] = useState("7");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const accepted = request.quotes.some((quote) => quote.status === "accepted");
  const canQuote = ["received", "reviewing", "quoted"].includes(request.status);

  async function run(data: Record<string, unknown>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setMessage("");
    try {
      const result = await staffAction({ data: { ...data, ref: request.ref } });
      setMessage("error" in result ? (t.err[String(result.error)] ?? t.err.invalid) : t.done);
      if (!("error" in result)) await router.invalidate();
    } catch {
      setMessage(t.err.unavailable);
    } finally {
      inFlight.current = false;
    }
  }
  function sendQuote(event: FormEvent) {
    event.preventDefault();
    void run({
      action: "quote",
      amountIqd: Number(amount),
      customsIncluded: customs,
      validDays: Number(days),
      note,
    });
  }
  function addEvent(event: FormEvent) {
    event.preventDefault();
    void run({ action: "event", title, place }).then(() => {
      setTitle("");
      setPlace("");
    });
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border-2 border-pine/40 bg-surface p-5">
      {request.contact && (request.contact.name || request.contact.phone) ? (
        <p className="text-sm">
          <span className="text-muted">{t.customer}: </span>
          {request.contact.name} · <bdi dir="ltr">{request.contact.phone}</bdi>
        </p>
      ) : null}
      {canQuote ? (
        <form onSubmit={sendQuote} className="grid gap-3 md:grid-cols-2">
          <h3 className="font-bold md:col-span-2">{t.sendQuote}</h3>
          <Field label={t.amount}>
            <input
              className={controlClass}
              dir="ltr"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/\D/g, ""))}
              required
            />
          </Field>
          <Field label={t.validDays}>
            <input
              className={controlClass}
              dir="ltr"
              type="number"
              min={1}
              max={30}
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </Field>
          <label className="flex items-center gap-3 text-sm md:col-span-2">
            <input
              type="checkbox"
              className="size-5"
              checked={customs}
              onChange={(event) => setCustoms(event.target.checked)}
            />
            {t.customsIncluded}
          </label>
          <Field label={t.note}>
            <input
              className={controlClass}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="flex items-end">
            <button type="submit" className={btnPrimary}>
              {t.sendQuote}
            </button>
          </div>
        </form>
      ) : null}
      <div className="flex flex-col gap-2">
        <h3 className="font-bold">{t.setStatus}</h3>
        <div className="flex flex-wrap gap-2">
          {STAFF_STATUSES.filter((status) =>
            staffCanSet(request.status, status, request.kind, accepted),
          ).map((status) => (
            <button
              key={status}
              type="button"
              className={status === "cancelled" ? btnGhost : btnPrimary}
              onClick={() => run({ action: "status", status })}
            >
              {t.statuses[status]}
            </button>
          ))}
        </div>
        {!accepted ? <p className="text-xs text-muted">{t.needsAccept}</p> : null}
      </div>
      <form onSubmit={addEvent} className="grid gap-3 md:grid-cols-2">
        <h3 className="font-bold md:col-span-2">{t.addEvent}</h3>
        <Field label={t.eventTitle}>
          <input
            className={controlClass}
            minLength={3}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </Field>
        <Field label={t.eventPlace}>
          <input
            className={controlClass}
            maxLength={80}
            value={place}
            onChange={(event) => setPlace(event.target.value)}
          />
        </Field>
        <div>
          <button type="submit" className={btnGhost}>
            {t.save}
          </button>
        </div>
      </form>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
