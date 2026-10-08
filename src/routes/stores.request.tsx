import { responsiveImage } from "@/lib/images";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Field, controlClass, btnPrimary } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { DESTS, placeName } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import { hostAllowed, storeById, goodById } from "@/lib/stores";
import { orderStore } from "@/lib/orders/api";

export const Route = createFileRoute("/stores/request")({
  validateSearch: (search: Record<string, unknown>) => ({
    store: typeof search.store === "string" ? search.store : undefined,
    item: typeof search.item === "string" ? search.item : undefined,
    intent: search.intent === "ship" ? "ship" : "buy",
  }),
  head: () => ({ meta: [{ title: "لینکی کاڵا · R&L" }] }),
  component: RequestPage,
});

function RequestPage() {
  const { lang } = useI18n();
  const t = storeCopy(lang);
  const { store: storeId, intent, item } = Route.useSearch();
  const store = storeById(storeId);
  const good = goodById(item);
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState("1");
  const [dest, setDest] = useState(DESTS[0].id);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    let href = "";
    const trimmed = url.trim();
    if (trimmed) {
      let parsed: URL;
      try {
        parsed = new URL(trimmed);
      } catch {
        setError(t.invalidUrl);
        return;
      }
      if (parsed.protocol !== "https:") {
        setError(t.invalidUrl);
        return;
      }
      href = parsed.href;
      setWarn(hostAllowed(store, href) ? "" : t.wrongHost);
    } else if (!good) {
      setError(t.invalidUrl);
      return;
    } else {
      setWarn("");
    }
    setError("");
    try {
      const result = await orderStore({
        data: { intent, storeId: store?.id ?? null, item: good?.id ?? null, url: href, size, color, qty, dest, notes },
      });
      if (result && "id" in result && result.id) {
        setSaved(String(result.id));
        return;
      }
      if (result && "error" in result && result.error === "unavailable") {
        setError(t.serviceLater);
        return;
      }
    } catch {
      /* signed out */
    }
    setSaved(null);
    setError(t.serviceLater);
  }

  return (
    <Shell>
      <PageHeader kicker={t.requestKicker} title={intent === "ship" ? t.shipTitle : t.buyTitle} lede={t.requestLede} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_20rem] md:py-16">
        {saved ? (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-2xl font-semibold">{t.sentTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t.sentBody}</p>
            <p className="mt-4 font-sans text-sm font-semibold">
              <bdi dir="ltr">{saved}</bdi>
            </p>
            <Link to="/stores" className="mt-6 inline-flex h-12 items-center rounded-full border border-line px-5 text-sm">
              {t.back}
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
            {good ? (
              <div className="flex items-center gap-3">
                <img {...responsiveImage(good.image, "64px")} alt="" width={64} height={64} decoding="async" className="size-16 rounded-xl object-cover" />
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
            <Field label={t.url} hint={t.urlHint}>
              <input className={controlClass} dir="ltr" inputMode="url" value={url} onChange={(event) => setUrl(event.target.value)} required={!good} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t.size}>
                <input className={controlClass} value={size} onChange={(event) => setSize(event.target.value)} />
              </Field>
              <Field label={t.color}>
                <input className={controlClass} value={color} onChange={(event) => setColor(event.target.value)} />
              </Field>
              <Field label={t.qty}>
                <input className={controlClass} dir="ltr" inputMode="numeric" value={qty} onChange={(event) => setQty(event.target.value)} />
              </Field>
            </div>
            <Field label={t.dest}>
              <select className={controlClass} value={dest} onChange={(event) => setDest(event.target.value)}>
                {DESTS.map((place) => (
                  <option key={place.id} value={place.id}>
                    {placeName(place, lang)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.notesLabel}>
              <textarea className={`${controlClass} h-28 py-3`} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            {error ? <p className="text-sm text-clay">{error}</p> : null}
            {warn ? <p className="text-sm text-clay">{warn}</p> : null}
            <button type="submit" className={btnPrimary}>
              {t.submit}
            </button>
          </form>
        )}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">{t.costs}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {t.rows.map((row) => (
                <li key={row} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{row}</span>
                  <bdi dir="ltr" className="shrink-0 text-muted">
                    {t.awaiting}
                  </bdi>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-lg font-semibold">{t.whoTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{intent === "ship" ? t.shipBody : t.whoBody}</p>
          </div>
          {store && store.caution.length > 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-lg font-semibold">{t.cautionTitle}</h2>
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
