import { NUM_LOCALE } from "@/lib/numbers";
import { useEffect, useState } from "react";
import { seo } from "@/lib/seo";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { DeliveryTabs } from "@/components/delivery-hub";
import { btnPrimary, controlClass } from "@/components/field";
import { getDest, getOrigin, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { localizedTrack } from "@/lib/track-copy";
import { SHIPMENTS, currentEvent, findShipment } from "@/lib/shipments";
import { orderTrack } from "@/lib/orders/api";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { UX_COPY, type UxCopy } from "@/lib/ux-copy";
import { ContactNote } from "@/components/contact-note";
import { TRACKING_COPY } from "@/lib/tracking/copy";
import { trackingAction } from "@/lib/tracking/presentation";
import { REQUEST_COPY } from "@/lib/requests/copy";
import type { Lang } from "@/lib/langs";

type LiveEvent = {
  title: string;
  titleKu: string;
  place?: string;
  placeKu?: string;
  phase: string;
  at?: string | null;
  recordedAt?: string | null;
  nextAction?: string;
  estimateFrom?: string | null;
  estimateTo?: string | null;
};
type LiveResult = { error?: string; id?: string; status?: string; events?: LiveEvent[] };

const DEV = import.meta.env.DEV;

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" && search.id ? search.id : undefined,
  }),
  head: () =>
    seo({
      path: "/track",
      title: "شوێنپێکردنی بار · R&L",
      description: "شوێنی بارەکەت بە کۆدی شوێنپێکردن بدۆزەوە.",
      noindex: true,
    }),
  component: TrackPage,
});

function TrackPage() {
  const { t, lang } = useI18n();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(id ?? "");
  const ux = UX_COPY[lang];
  const hintId = "track-hint";
  const [live, setLive] = useState<LiveResult | null>(null);

  useEffect(() => {
    setDraft(id ?? "");
  }, [id]);
  useEffect(() => {
    if (!id) {
      setLive(null);
      return;
    }
    let on = true;
    setLive(null);
    orderTrack({ data: { id } })
      .then((result) => {
        if (on) setLive(result as LiveResult);
      })
      .catch(() => {
        if (on) setLive({ error: "unavailable" });
      });
    return () => {
      on = false;
    };
  }, [id]);

  const loading = Boolean(id) && live === null;
  const demo = DEV && id && live?.error === "notfound" ? findShipment(id) : undefined;
  const shipment = demo;
  const missing = Boolean(id) && live?.error === "notfound" && !shipment;

  return (
    <Shell>
      <DeliveryTabs active="/track" />
      <PageHeader
        kicker={t.trackKicker}
        title={t.trackTitle}
        lede={DEV ? t.trackLede : ux.trackLede}
      />
      <div className="page flex flex-col gap-10 py-12 md:py-16">
        <form
          className="flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({ to: "/track", search: { id: draft.trim().toUpperCase() } });
          }}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
            <span className="font-medium">{t.trackLabel}</span>
            <input
              className={controlClass}
              dir="ltr"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="RG-XXXX-XXXX-XXXX"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={hintId}
            />
            <span id={hintId} className="text-xs text-muted">
              {ux.trackHint}
            </span>
          </label>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`${btnPrimary} md:mb-7 md:self-end disabled:opacity-60`}
          >
            {t.trackButton}
          </button>
        </form>

        {DEV ? (
          <div>
            <p className="text-sm font-medium">{t.samples}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SHIPMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void navigate({ to: "/track", search: { id: item.id } })}
                  className={`h-12 rounded-full border px-4 text-sm ${item.id === shipment?.id ? "border-pine bg-pine text-pine-ink" : "border-line bg-surface"}`}
                >
                  <bdi dir="ltr">{item.id}</bdi>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div aria-live="polite" className="-mt-4 flex flex-col gap-3">
          {loading ? (
            <p role="status" className="flex items-center gap-2 text-sm text-muted">
              <span
                className="size-4 animate-spin rounded-full border-2 border-line border-t-pine"
                aria-hidden="true"
              />
              {ux.trackLoading}
            </p>
          ) : null}
          {missing ? (
            <p className="text-sm text-clay">{DEV ? t.notFound : ux.trackNotFound}</p>
          ) : null}
          {live?.error === "rate" ? (
            <p className="text-sm text-clay">{DECLARE_COPY[lang].rate}</p>
          ) : null}
          {live?.error === "unavailable" ? (
            <ContactNote
              role="status"
              pre={ux.trackUnavailablePre}
              post={ux.trackUnavailablePost}
              className="max-w-2xl rounded-2xl border border-line bg-surface p-5 text-ink"
            />
          ) : null}
        </div>
        {live && !live.error && live.events ? <LiveTrack data={live} lang={lang} ux={ux} /> : null}

        {shipment ? (
          <article className="grid gap-8 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <p className="text-sm font-medium text-pine">
                {currentEvent(shipment).phase === "next" ? t.expected : t.nowLabel}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                {localizedTrack(lang, currentEvent(shipment).title, currentEvent(shipment).titleKu)}
              </h2>
              <p className="mt-3 text-sm text-muted">
                <bdi dir="ltr" className="font-medium text-ink">
                  {shipment.id}
                </bdi>
                {" · "}
                <bdi dir="ltr">
                  {placeName(getOrigin(shipment.fromId), lang)} →{" "}
                  {placeName(getDest(shipment.toId), lang)}
                </bdi>
                {" · "}
                {t.modes[shipment.mode].name}
                {" · "}
                {t.contentsOpt[shipment.contents]}
              </p>
              <ol className="mt-8">
                {shipment.events.map((event, index) => (
                  <li
                    key={`${event.title}-${index}`}
                    className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          event.phase === "now"
                            ? "size-3 rounded-full bg-pine ring-4 ring-pine/20"
                            : event.phase === "done"
                              ? "size-3 rounded-full bg-pine"
                              : "size-3 rounded-full border-2 border-line bg-paper"
                        }
                      />
                      {index < shipment.events.length - 1 ? (
                        <span className="w-px flex-1 bg-line" />
                      ) : null}
                    </div>
                    <div className="pb-6">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p
                          className={`font-medium ${event.phase === "next" ? "text-muted" : "text-ink"}`}
                        >
                          {localizedTrack(lang, event.title, event.titleKu)}
                        </p>
                        <p className="text-sm text-muted">
                          <bdi dir="ltr">{localizedTrack(lang, event.at, event.atKu)}</bdi>
                        </p>
                      </div>
                      <p className="text-sm text-muted">
                        {localizedTrack(lang, event.place, event.placeKu)}
                      </p>
                      {event.phase === "next" ? (
                        <p className="text-xs text-muted">{t.expected}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-24">
              <p className="text-xs font-semibold tracking-widest text-pine">{t.hubRecord}</p>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">{t.weight}</dt>
                  <dd className="font-medium">
                    <bdi dir="ltr">
                      {shipment.kg} {t.kg}
                    </bdi>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">{t.pieces}</dt>
                  <dd className="font-medium">
                    <bdi dir="ltr">{shipment.pieces}</bdi>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">{t.length}</dt>
                  <dd className="font-medium">
                    <bdi dir="ltr">
                      {shipment.l}×{shipment.w}×{shipment.h} {t.cm}
                    </bdi>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t.hubsTitle}</dt>
                  <dd className="mt-1 font-medium">
                    {localizedTrack(lang, shipment.hub, shipment.hubKu)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{t.photoOnFile}</dt>
                  <dd className="mt-1 font-medium text-pine">
                    {shipment.photo ? t.photoOnFile : "—"}
                  </dd>
                </div>
              </dl>
            </aside>
          </article>
        ) : null}
      </div>
    </Shell>
  );
}

function when(at: string | null | undefined) {
  if (!at) return null;
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(NUM_LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(
    date,
  );
}

/** Real tracking record: status, last update, next step (labelled as an estimate). Shows only what the server returned. */
function LiveTrack({ data, lang, ux }: { data: LiveResult; lang: Lang; ux: UxCopy }) {
  const events = data.events ?? [];
  const title = (event: LiveEvent) =>
    lang === "ckb"
      ? event.titleKu || event.title
      : localizedTrack(lang, event.title, event.titleKu);
  const past = events.filter((event) => event.phase !== "next");
  const current = past[past.length - 1];
  const copy = TRACKING_COPY[lang];
  const action = trackingAction(data.status ?? "", current?.nextAction ?? "none");
  const statusLabel =
    REQUEST_COPY[lang].statuses[data.status ?? ""] ?? (current ? title(current) : "—");
  const next = events.find((event) => event.phase === "next");
  const updated = when(events[events.length - 1]?.recordedAt);
  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-5 md:p-6">
      <h2 className="text-2xl leading-tight font-bold">
        <bdi dir="ltr">{data.id}</bdi>
      </h2>
      {current ? (
        <dl className="grid gap-4 md:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">{ux.status}</dt>
            <dd className="mt-1 font-semibold text-pine">{statusLabel}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{ux.lastUpdate}</dt>
            <dd className="mt-1 font-medium">{updated ? <bdi dir="ltr">{updated}</bdi> : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">{ux.nextStep}</dt>
            <dd className="mt-1 font-medium">
              {next ? title(next) : "—"}
              {next?.estimateFrom && next?.estimateTo ? (
                <span className="block text-xs font-normal text-muted">
                  <bdi dir="ltr">
                    {when(next.estimateFrom)} — {when(next.estimateTo)}
                  </bdi>{" "}
                  · {ux.estimate}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-muted">{ux.noEvents}</p>
      )}
      <div className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
        <h3 className="font-bold">{copy.action}</h3>
        <p>{copy[action as keyof typeof copy]}</p>
        <p className="text-muted">
          {(next ?? current)?.estimateFrom && (next ?? current)?.estimateTo ? (
            <>
              <bdi dir="ltr">
                {when((next ?? current)?.estimateFrom)} — {when((next ?? current)?.estimateTo)}
              </bdi>{" "}
              · {ux.estimate}
            </>
          ) : (
            copy.unknownEta
          )}
        </p>
        <div className="flex flex-wrap gap-4">
          <a className="underline" href="/account">
            {copy.account}
          </a>
          <a className="underline" href="/contact">
            {copy.contact}
          </a>
        </div>
      </div>
      {past.length ? (
        <ol className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
          {past.map((event, index) => (
            <li
              key={`${event.title}-${index}`}
              className="flex flex-wrap items-baseline justify-between gap-2"
            >
              <span className={event === current ? "font-semibold" : ""}>{title(event)}</span>
              {!event.at ? <span className="text-xs text-muted">{copy.uncertain}</span> : null}
              {when(event.at ?? event.recordedAt) ? (
                <span className="text-xs text-muted">
                  <bdi dir="ltr">{when(event.at ?? event.recordedAt)}</bdi> ·{" "}
                  {event.at ? copy.actual : copy.recorded}
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
    </article>
  );
}
