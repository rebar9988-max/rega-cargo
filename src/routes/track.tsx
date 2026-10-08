import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { DeliveryTabs } from "@/components/delivery-hub";
import { btnPrimary, controlClass } from "@/components/field";
import { getDest, getOrigin, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { localizedTrack } from "@/lib/track-copy";
import { SHIPMENTS, currentEvent, findShipment } from "@/lib/shipments";

export const Route = createFileRoute("/track")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" && search.id ? search.id : undefined,
  }),
  head: () => ({
    meta: [{ title: "شوێنپێکردن · R&L" }],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t, lang } = useI18n();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(id ?? "");

  useEffect(() => {
    setDraft(id ?? "");
  }, [id]);

  const shipment = id ? findShipment(id) : undefined;
  const missing = Boolean(id) && !shipment;

  return (
    <Shell>
      <DeliveryTabs active="/track" />
      <PageHeader kicker={t.trackKicker} title={t.trackTitle} lede={t.trackLede} />
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 md:py-16">
        <form
          className="flex flex-col gap-3 sm:flex-row"
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
              placeholder="RG-48291"
              autoCapitalize="characters"
            />
          </label>
          <button type="submit" className={`${btnPrimary} sm:self-end`}>
            {t.trackButton}
          </button>
        </form>

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

        {missing ? <p className="text-sm text-clay">{t.notFound}</p> : null}

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
