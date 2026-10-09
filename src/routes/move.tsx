import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { useRef, useState } from "react";
import { UX_COPY } from "@/lib/ux-copy";
import { ContactNote } from "@/components/contact-note";
import { Report } from "@/routes/market.$slug";
import { btnGhost, btnPrimary, controlClass, Field } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { DeliveryTabs } from "@/components/delivery-hub";
import { SignInGate } from "@/components/sign-in-gate";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { marketCopy } from "@/lib/market-copy";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { marketRole, moveChoose, moveCreateDelivery, moveCreateTransport, moveJobs, moveOffer, moveRate, moveStatus } from "@/lib/market/api";

export const Route = createFileRoute("/move")({
  validateSearch: (search: Record<string, unknown>): { product?: string; item?: string } => ({
    product: typeof search.product === "string" && search.product ? search.product : undefined,
    item: typeof search.item === "string" && search.item ? search.item : undefined,
  }),
  loader: async () => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state };
    return { gate: null, jobs: await moveJobs() };
  },
  head: () =>
    seo({
      path: "/move",
      title: "گواستنەوە و ناردن · R&L",
      description: "داوای گەیاندن و گواستنەوە. شۆفێر خۆی پێشنیار دەکات و تۆ هەڵیدەبژێریت.",
    }),
  component: MovePage,
});

function MovePage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const t = marketCopy(lang);
  if (data.gate) return <SignInGate state={data.gate} kicker={t.moveKicker} />;
  return <MoveSignedIn initial={data.jobs} />;
}

function MoveSignedIn({ initial }: { initial: Awaited<ReturnType<typeof moveJobs>> }) {
  const { product = "", item = "" } = Route.useSearch();
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [jobs, setJobs] = useState(initial);
  const [message, setMessage] = useState("");
  async function refresh() {
    setJobs(await moveJobs());
  }
  function note(result: { error?: string } | { ok?: boolean } | { id?: string }) {
    const error = "error" in result ? result.error : undefined;
    setMessage(error ? t[error as "invalid"] ?? t.invalid : t.saved);
  }
  // One request at a time per page; the result is shown under the form that sent it.
  const ux = UX_COPY[lang];
  const [busy, setBusy] = useState<string | null>(null);
  const inFlight = useRef(false);
  const [status, setStatus] = useState<{ where: string; text?: string; failed?: boolean } | null>(null);
  async function send(
    where: string,
    event: React.FormEvent<HTMLFormElement>,
    call: (form: FormData) => Promise<{ error?: string } | { ok?: boolean } | { id?: string }>,
    reload = true,
  ) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    inFlight.current = true;
    setBusy(where);
    setStatus(null);
    try {
      const result = await call(form);
      const error = "error" in result ? result.error : undefined;
      setStatus({ where, text: error ? t[error as "invalid"] ?? t.invalid : t.saved });
      if (!error && reload) void refresh();
    } catch {
      setStatus({ where, failed: true });
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }
  function formStatus(where: string) {
    return (
      <div aria-live="polite">
        {status?.where === where && status.failed ? <ContactNote pre={ux.failPre} post={ux.failPost} /> : null}
        {status?.where === where && status.text ? (
          <p role="alert" className="text-sm text-clay">
            {status.text}
          </p>
        ) : null}
      </div>
    );
  }
  function sendButton(where: string, children: React.ReactNode, ghost = false) {
    return (
      <button className={`${ghost ? btnGhost : btnPrimary} disabled:opacity-60`} type="submit" disabled={busy !== null} aria-busy={busy === where}>
        {busy === where ? ux.sending : children}
      </button>
    );
  }
  return (
    <Shell>
      <DeliveryTabs active="/move" />
      <PageHeader kicker={t.moveKicker} title={t.moveTitle} lede={t.moveLede} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-2">
        <form
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          onSubmit={(event) =>
            send("delivery", event, (form) =>
              moveCreateDelivery({
                data: { pickup: form.get("pickup"), dropoff: form.get("dropoff"), item: form.get("item"), size: form.get("size"), date: form.get("date"), product: product || undefined, declared: form.get("declared") === "on" },
              }),
            )
          }
        >
          <h2 className="text-xl font-semibold">{t.deliver}</h2>
          <Field label={t.pickup}><input name="pickup" required className={controlClass} /></Field>
          <Field label={t.dropoff}><input name="dropoff" required className={controlClass} /></Field>
          <Field label={t.item}><input name="item" required defaultValue={item} className={controlClass} /></Field>
          <Field label={t.size}><input name="size" className={controlClass} /></Field>
          <Field label={t.date}><input name="date" type="date" dir="ltr" className={controlClass} /></Field>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" name="declared" required className="mt-1 size-4 shrink-0 accent-pine" />
            <span>{DECLARE_COPY[lang].declare}</span>
          </label>
          {sendButton("delivery", t.send)}
          {formStatus("delivery")}
        </form>
        <form
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          onSubmit={(event) =>
            send("transport", event, (form) =>
              moveCreateTransport({ data: { origin: form.get("origin"), destination: form.get("destination"), load: form.get("load"), date: form.get("date"), declared: form.get("declared") === "on" } }),
            )
          }
        >
          <h2 className="text-xl font-semibold">{t.load}</h2>
          <Field label={t.origin}><input name="origin" required className={controlClass} /></Field>
          <Field label={t.destination}><input name="destination" required className={controlClass} /></Field>
          <Field label={t.load}><input name="load" required className={controlClass} /></Field>
          <Field label={t.date}><input name="date" type="date" dir="ltr" className={controlClass} /></Field>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" name="declared" required className="mt-1 size-4 shrink-0 accent-pine" />
            <span>{DECLARE_COPY[lang].declare}</span>
          </label>
          {sendButton("transport", t.send)}
          {formStatus("transport")}
        </form>
        {!jobs.courier ? (
          <form
            className="flex flex-col gap-3 md:col-span-2"
            onSubmit={(event) =>
              send("courier", event, (form) => marketRole({ data: { role: "courier", displayName: form.get("name"), city: form.get("city"), phone: form.get("phone") } }), false)
            }
          >
            <h2 className="text-xl font-semibold">{t.roleDriver}</h2>
            <Field label={t.name}><input name="name" required className={controlClass} /></Field>
            <Field label={t.city}><input name="city" required className={controlClass} /></Field>
            <Field label={t.phone}><input name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" className={controlClass} /></Field>
            {sendButton("courier", t.send, true)}
            {formStatus("courier")}
          </form>
        ) : null}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t.myJobs}</h2>
          {jobs.deliveries.map((job) => (
            <JobCard key={job.id} kind="delivery" id={job.id} status={job.status} label={`${job.pickup} → ${job.dropoff}`} bids={jobs.bids.filter((bid) => bid.jobId === job.id && bid.kind === "delivery")} onDone={refresh} onNote={note} />
          ))}
          {jobs.transports.map((job) => (
            <JobCard key={job.id} kind="transport" id={job.id} status={job.status} label={`${job.origin} → ${job.destination}`} bids={jobs.bids.filter((bid) => bid.jobId === job.id && bid.kind === "transport")} onDone={refresh} onNote={note} />
          ))}
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{t.openJobs}</h2>
          {jobs.openDeliveries.map((job) => (
            <OpenCard key={job.id} kind="delivery" id={job.id} label={`${job.pickup} → ${job.dropoff} · ${job.item}`} onDone={refresh} onNote={note} />
          ))}
          {jobs.openTransports.map((job) => (
            <OpenCard key={job.id} kind="transport" id={job.id} label={`${job.origin} → ${job.destination} · ${job.load}`} onDone={refresh} onNote={note} />
          ))}
        </section>
        <div className="md:col-span-2"><Report /></div>
        <div aria-live="polite" className="md:col-span-2">{message ? <p role="status" className="text-sm text-clay">{message}</p> : null}</div>
      </div>
    </Shell>
  );
}

function JobCard({
  kind,
  id,
  status,
  label,
  bids,
  onDone,
  onNote,
}: {
  kind: "delivery" | "transport";
  id: string;
  status: string;
  label: string;
  bids: { courierId: string; name: string }[];
  onDone: () => Promise<void>;
  onNote: (result: { error?: string } | { ok?: boolean } | { id?: string }) => void;
}) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  return (
    <article className="rounded-2xl border border-line bg-surface p-4 text-sm">
      <p className="font-semibold">{label}</p>
      <p className="text-muted">{status} · <bdi dir="ltr">{id.slice(0, 8)}</bdi></p>
      <div className="mt-3 flex flex-wrap gap-2">
        {status === "requested"
          ? bids.map((bid) => (
              <button
                key={bid.courierId}
                type="button"
                className={btnGhost}
                onClick={async () => {
                  const result = await moveChoose({ data: { kind, id, courierId: bid.courierId } });
                  onNote(result);
                  if (!("error" in result)) await onDone();
                }}
              >
                {t.choose} {bid.name}
              </button>
            ))
          : null}
        {status !== "requested" && status !== "delivered" && status !== "cancelled" ? (
          <button
            type="button"
            className={btnGhost}
            onClick={async () => {
              const next = status === "accepted" ? "picked_up" : status === "picked_up" ? "on_the_way" : "delivered";
              const result = await moveStatus({ data: { kind, id, status: next } });
              onNote(result);
              if (!("error" in result)) await onDone();
            }}
          >
            {status === "accepted" ? t.picked : status === "picked_up" ? t.way : t.done}
          </button>
        ) : null}
        {status !== "delivered" && status !== "cancelled" ? (
          <button type="button" className={btnGhost} onClick={async () => { const result = await moveStatus({ data: { kind, id, status: "cancelled" } }); onNote(result); if (!("error" in result)) await onDone(); }}>{t.cancel}</button>
        ) : null}
      </div>
      {status === "delivered" ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const rating = new FormData(event.currentTarget).get("rating");
            const result = await moveRate({ data: { kind, id, rating: Number(rating), body: "" } });
            onNote(result);
          }}
        >
          <input name="rating" dir="ltr" inputMode="numeric" defaultValue={5} className={`${controlClass} max-w-24`} />
          <button className={btnGhost} type="submit">{t.rating}</button>
        </form>
      ) : null}
    </article>
  );
}

function OpenCard({ kind, id, label, onDone, onNote }: { kind: "delivery" | "transport"; id: string; label: string; onDone: () => Promise<void>; onNote: (result: { error?: string } | { ok?: boolean } | { id?: string }) => void }) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  return (
    <article className="rounded-2xl border border-line p-4 text-sm">
      <p>{label}</p>
      <button
        type="button"
        className={`${btnPrimary} mt-3`}
        onClick={async () => {
          const result = await moveOffer({ data: { kind, id, note: "" } });
          onNote(result);
          if (!("error" in result)) await onDone();
        }}
      >
        {t.offer}
      </button>
    </article>
  );
}

