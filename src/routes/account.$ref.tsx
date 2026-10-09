import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { seo } from "@/lib/seo";
import { btnGhost, btnPrimary, Eur } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { IqdAmount, RequestHelp, StatusBadge } from "@/components/request-bits";
import { when } from "@/lib/requests/format";
import { StaffRequestTools } from "@/components/staff-requests";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { DESTS, ORIGINS, placeName } from "@/lib/corridor";
import { REQUEST_COPY, type RequestCopy } from "@/lib/requests/copy";
import { requestDecide, requestGet } from "@/lib/requests/api";

export const Route = createFileRoute("/account/$ref")({
  loader: async ({ params }) => {
    const { state } = await viewerState();
    if (state !== "in") return { gate: state, result: null };
    return { gate: null, result: await requestGet({ data: { ref: params.ref } }) };
  },
  head: () =>
    seo({
      path: "/account",
      title: "داواکاری · R&L",
      description: "وردەکاری داواکاری، نرخ و مێژووی دۆخ.",
      noindex: true,
    }),
  component: DetailPage,
});

type Detail = Extract<Awaited<ReturnType<typeof requestGet>>, { request: unknown }>["request"];

function DetailPage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const t = REQUEST_COPY[lang];
  if (data.gate || !data.result) return <SignInGate state={data.gate ?? "out"} kicker={t.kicker} />;
  if ("error" in data.result) {
    return (
      <Shell>
        <PageHeader
          kicker={t.kicker}
          title={t.dashTitle}
          lede={t.err[String(data.result.error)] ?? t.err.notfound}
        />
        <div className="page py-10">
          <Link to="/account" className={btnGhost}>
            {t.dashTitle}
          </Link>
        </div>
      </Shell>
    );
  }
  return <Detail request={data.result.request} t={t} />;
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-xl leading-tight font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ request, t }: { request: Detail; t: RequestCopy }) {
  const { lang } = useI18n();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const origin = ORIGINS.find((place) => place.id === request.item.origin);
  const dest = DESTS.find((place) => place.id === request.item.dest);

  async function decide(quoteId: string, accept: boolean) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const result = await requestDecide({ data: { ref: request.ref, quoteId, accept } });
      if ("error" in result) setMessage(t.err[String(result.error)] ?? t.err.invalid);
      await router.invalidate();
    } catch {
      setMessage(t.err.unavailable);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const rows: [string, ReactNode][] = [
    [
      t.link,
      request.item.link ? (
        <code dir="ltr" className="select-all break-all text-xs">
          {request.item.link}
        </code>
      ) : null,
    ],
    [
      t.description,
      request.item.description ? <span dir="auto">{request.item.description}</span> : null,
    ],
    [t.qty, request.item.qty != null ? <bdi dir="ltr">{request.item.qty}</bdi> : null],
    [t.origin, origin ? placeName(origin, lang) : request.item.originNote || null],
    [t.dest, dest ? placeName(dest, lang) : null],
    [
      t.weight,
      request.item.weightKg != null ? <bdi dir="ltr">{request.item.weightKg} kg</bdi> : null,
    ],
    [
      t.dims,
      request.item.dims ? (
        <bdi dir="ltr">{`${request.item.dims.l} × ${request.item.dims.w} × ${request.item.dims.h} cm`}</bdi>
      ) : null,
    ],
    [t.notes, request.item.notes ? <span dir="auto">{request.item.notes}</span> : null],
  ];

  return (
    <Shell>
      <PageHeader
        kicker={`${t.kinds[request.kind] ?? request.kind} · ${t.ref}`}
        title={request.ref}
        lede={`${t.date}: ${when(request.at)}`}
      />
      <div className="page grid gap-5 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">{t.status}:</span>
            <StatusBadge status={request.status} t={t} />
          </div>
          <Box title={t.quotes}>
            {request.quotes.length === 0 ? <p className="text-sm text-muted">{t.noQuote}</p> : null}
            {request.quotes.map((quote) => (
              <div
                key={quote.id}
                className={`flex flex-col gap-2 rounded-xl border p-4 ${quote.status === "sent" && !quote.expired ? "border-pine" : "border-line"} ${quote.status === "superseded" || quote.status === "declined" ? "opacity-60" : ""}`}
              >
                <p className="text-2xl font-bold">
                  <IqdAmount value={quote.amountIqd} />
                </p>
                <p className="text-sm">{quote.customsIncluded ? t.customsIn : t.customsOut}</p>
                {quote.note ? (
                  <p dir="auto" className="text-sm text-muted">
                    {quote.note}
                  </p>
                ) : null}
                <p className="text-xs text-muted">
                  {t.validUntil}: <bdi dir="ltr">{when(quote.validUntil)}</bdi>
                </p>
                {quote.status === "accepted" ? (
                  <p className="text-sm font-medium text-pine">{t.acceptedNote}</p>
                ) : null}
                {quote.expired ? <p className="text-sm text-clay">{t.expired}</p> : null}
                {quote.status === "sent" &&
                !quote.expired &&
                request.owner &&
                request.status === "quoted" ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted">{t.acceptNote}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={btnPrimary}
                        disabled={busy}
                        onClick={() => decide(quote.id, true)}
                      >
                        {t.accept}
                      </button>
                      <button
                        type="button"
                        className={btnGhost}
                        disabled={busy}
                        onClick={() => decide(quote.id, false)}
                      >
                        {t.decline}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            {message ? (
              <p role="alert" className="text-sm text-clay">
                {message}
              </p>
            ) : null}
          </Box>
          {request.estimateEur != null ? (
            <Box title={t.estimate}>
              <p className="text-lg font-bold">
                <Eur value={request.estimateEur} />
              </p>
              <p className="text-sm text-muted">{t.estimateNote}</p>
            </Box>
          ) : null}
          <Box title={t.item}>
            <dl className="grid gap-3 text-sm md:grid-cols-[10rem_minmax(0,1fr)]">
              {rows
                .filter(([, value]) => value != null && value !== "")
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted">{label}</dt>
                    <dd className="min-w-0 break-words">{value}</dd>
                  </div>
                ))}
            </dl>
            {request.item.attachments.length ? (
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted">{t.attachments}</span>
                {request.item.attachments.map((link) => (
                  <code key={link} dir="ltr" className="select-all break-all text-xs">
                    {link}
                  </code>
                ))}
              </div>
            ) : null}
          </Box>
          {request.staff ? <StaffRequestTools request={request} t={t} /> : null}
        </div>
        <aside className="flex min-w-0 flex-col gap-5">
          <Box title={t.history}>
            <ol className="flex flex-col gap-3 text-sm">
              {request.history.map((item, index) => (
                <li key={index} className="flex flex-col">
                  <span className="font-medium">{t.statuses[item.status] ?? item.status}</span>
                  <span className="text-xs text-muted">
                    <bdi dir="ltr">{when(item.at)}</bdi> · {t.actors[item.actor] ?? item.actor}
                  </span>
                </li>
              ))}
            </ol>
          </Box>
          <Box title={t.events}>
            <p className="text-xs text-muted">{t.eventsNote}</p>
            {request.events.length === 0 ? (
              <p className="text-sm text-muted">{t.noEvents}</p>
            ) : null}
            <ol className="flex flex-col gap-3 text-sm">
              {request.events.map((event, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${event.phase === "now" ? "bg-pine" : "bg-silver"}`}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">
                      {lang === "ckb" ? event.titleKu : event.title}
                    </span>
                    <span className="text-xs text-muted">
                      <bdi dir="ltr">{when(event.at)}</bdi>
                      {event.place ? ` · ${event.place}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <Link to="/track" search={{ id: request.ref }} className={btnGhost}>
              {t.track}
            </Link>
          </Box>
          <RequestHelp t={t} refCode={request.ref} />
        </aside>
      </div>
    </Shell>
  );
}
