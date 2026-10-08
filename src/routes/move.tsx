import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Report } from "@/routes/market.$slug";
import { btnGhost, btnPrimary, controlClass, Field } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { marketCopy } from "@/lib/market-copy";
import { marketRole, moveChoose, moveCreateDelivery, moveCreateTransport, moveJobs, moveOffer, moveRate, moveStatus } from "@/lib/market/api";

export const Route = createFileRoute("/move")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search.product === "string" ? search.product : "",
    item: typeof search.item === "string" ? search.item : "",
  }),
  loader: () => moveJobs(),
  head: () => ({
    meta: [
      { title: "گەیاندن · R&L" },
      { name: "description", content: "داوای گەیاندن و گواستنەوە. شۆفێر خۆی پێشنیار دەکات و تۆ هەڵیدەبژێریت." },
    ],
  }),
  component: MovePage,
});

function MovePage() {
  const initial = Route.useLoaderData();
  const { product, item } = Route.useSearch();
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
  return (
    <Shell>
      <PageHeader kicker={t.moveKicker} title={t.moveTitle} lede={t.moveLede} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-2">
        <form
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = await moveCreateDelivery({
              data: { pickup: form.get("pickup"), dropoff: form.get("dropoff"), item: form.get("item"), size: form.get("size"), date: form.get("date"), product: product || undefined },
            });
            note(result);
            if (!("error" in result)) void refresh();
          }}
        >
          <h2 className="text-xl font-semibold">{t.deliver}</h2>
          <Field label={t.pickup}><input name="pickup" required className={controlClass} /></Field>
          <Field label={t.dropoff}><input name="dropoff" required className={controlClass} /></Field>
          <Field label={t.item}><input name="item" required defaultValue={item} className={controlClass} /></Field>
          <Field label={t.size}><input name="size" className={controlClass} /></Field>
          <Field label={t.date}><input name="date" dir="ltr" className={controlClass} /></Field>
          <button className={btnPrimary} type="submit">{t.send}</button>
        </form>
        <form
          className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = await moveCreateTransport({ data: { origin: form.get("origin"), destination: form.get("destination"), load: form.get("load"), date: form.get("date") } });
            note(result);
            if (!("error" in result)) void refresh();
          }}
        >
          <h2 className="text-xl font-semibold">{t.load}</h2>
          <Field label={t.origin}><input name="origin" required className={controlClass} /></Field>
          <Field label={t.destination}><input name="destination" required className={controlClass} /></Field>
          <Field label={t.load}><input name="load" required className={controlClass} /></Field>
          <Field label={t.date}><input name="date" dir="ltr" className={controlClass} /></Field>
          <button className={btnPrimary} type="submit">{t.send}</button>
        </form>
        {!jobs.courier ? (
          <form
            className="flex flex-col gap-3 md:col-span-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const result = await marketRole({ data: { role: "courier", displayName: form.get("name"), city: form.get("city"), phone: form.get("phone") } });
              note(result);
            }}
          >
            <h2 className="text-xl font-semibold">{t.roleDriver}</h2>
            <Field label={t.name}><input name="name" required className={controlClass} /></Field>
            <Field label={t.city}><input name="city" required className={controlClass} /></Field>
            <Field label={t.phone}><input name="phone" dir="ltr" className={controlClass} /></Field>
            <button className={btnGhost} type="submit">{t.send}</button>
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
        {message ? <p className="text-sm text-clay md:col-span-2">{message}</p> : null}
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
