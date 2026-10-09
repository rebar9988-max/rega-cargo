import { responsiveImage } from "@/lib/images";
import { seo } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { btnGhost, btnPrimary, controlClass, Field } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { iqd, marketCopy } from "@/lib/market-copy";
import { contactHref } from "@/lib/market";
import { marketAlert, marketFavorite, marketProduct, marketReport, marketReview } from "@/lib/market/api";

export const Route = createFileRoute("/market/$slug")({
  loader: ({ params }) => marketProduct({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const found = loaderData && "nameKu" in loaderData;
    return seo({
      path: `/market/${encodeURIComponent(params.slug)}`,
      title: `${found ? loaderData.nameKu : "بەراوردی نرخ"} · R&L`,
      description: found && "descriptionKu" in loaderData && loaderData.descriptionKu ? loaderData.descriptionKu : "بەراوردی نرخی کاڵا لە چەند فرۆشیارێک.",
      noindex: !found,
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const initial = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [data, setData] = useState(initial);
  const [message, setMessage] = useState("");
  if ("error" in data) {
    return (
      <Shell>
        <PageHeader kicker="R&L" title={t.notfound} lede={t.marketLede} />
      </Shell>
    );
  }
  const name = lang === "ckb" ? data.nameKu : data.nameEn;
  const max = Math.max(1, ...data.history.map((point) => point.total));
  async function reload() {
    setData(await marketProduct({ data: { slug } }));
  }
  return (
    <Shell>
      <PageHeader kicker={lang === "ckb" ? data.categoryKu : data.categoryEn} title={name} lede={data.descriptionKu} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[16rem_minmax(0,1fr)]">
        {data.image ? <img {...responsiveImage(data.image, "(min-width: 768px) 576px, 100vw")} alt="" width={640} height={640} decoding="async" className="aspect-square w-full rounded-2xl object-cover" /> : <div className="aspect-square rounded-2xl bg-paper" />}
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-muted"><bdi dir="ltr">{data.brand}</bdi>{data.specs ? ` · ${data.specs}` : ""}</p>
          <p className="text-sm text-muted">{t.freeSort}</p>
          {data.avg != null ? <p className="text-sm"><bdi dir="ltr">{data.avg.toFixed(1)} / 5</bdi></p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnGhost}
              onClick={async () => {
                const result = await marketFavorite({ data: { slug, on: !data.favorite } });
                if ("error" in result) setMessage(t[result.error as "invalid"] ?? t.invalid);
                else void reload();
              }}
            >
              {data.favorite ? t.saved : t.favorite}
            </button>
            <Link to="/move" search={{ product: slug, item: name }} className={btnPrimary}>{t.deliver}</Link>
          </div>
          <ul className="flex flex-col gap-3">
            {data.offers.map((offer) => {
              const best = offer.id === data.cheapestId;
              const href = contactHref(offer.contact);
              return (
                <li key={offer.id} className={`rounded-2xl border p-4 ${best ? "border-pine bg-paper" : "border-line bg-surface"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{offer.sellerName}</p>
                    <p className="text-lg font-semibold text-pine"><bdi dir="ltr">{iqd(offer.total)}</bdi></p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{offer.city} · {t.price} <bdi dir="ltr">{iqd(offer.price)}</bdi> · {t.shipping} <bdi dir="ltr">{iqd(offer.shipping)}</bdi></p>
                  <p className="mt-1 text-sm">{offer.stock === "in" ? t.inStock : offer.stock === "low" ? "کەم ماوە" : "نەماوە"}</p>
                  {href ? (
                    <a href={href} target="_blank" rel="noreferrer" className={`${btnPrimary} mt-3`}>{t.visit}</a>
                  ) : (
                    <p className="mt-3 text-sm"><bdi dir="ltr">{offer.contact}</bdi></p>
                  )}
                </li>
              );
            })}
          </ul>
          {data.history.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold">{t.history}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {data.history.map((point) => (
                  <li key={point.at} className="grid grid-cols-[minmax(0,1fr)_8rem] items-center gap-3 text-sm">
                    <span className="block h-2 rounded-full bg-pine" style={{ width: `${Math.max(12, (point.total / max) * 100)}%` }} />
                    <bdi dir="ltr">{iqd(point.total)}</bdi>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <form
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const target = new FormData(event.currentTarget).get("target");
              const result = await marketAlert({ data: { slug, target: Number(target) } });
              setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.saved);
              if (!("error" in result)) void reload();
            }}
          >
            <Field label={t.alert}>
              <input name="target" dir="ltr" inputMode="numeric" defaultValue={data.alert ?? ""} className={controlClass} required />
            </Field>
            <button className={btnPrimary} type="submit">{t.save}</button>
          </form>
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const result = await marketReview({ data: { slug, rating: Number(form.get("rating")), body: String(form.get("body") ?? "") } });
              setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.saved);
              if (!("error" in result)) void reload();
            }}
          >
            <h2 className="text-lg font-semibold">{t.review}</h2>
            <Field label={t.rating}>
              <input name="rating" dir="ltr" inputMode="numeric" min={1} max={5} defaultValue={5} className={controlClass} />
            </Field>
            <Field label={t.body}>
              <textarea name="body" className={`${controlClass} h-24 py-3`} />
            </Field>
            <button className={btnGhost} type="submit">{t.send}</button>
            <ul className="flex flex-col gap-2">
              {data.reviews.map((review) => (
                <li key={review.at} className="text-sm text-muted"><bdi dir="ltr">{review.rating}/5</bdi> {review.body}</li>
              ))}
            </ul>
          </form>
          <Report />
          {message ? <p className="text-sm text-clay">{message}</p> : null}
        </div>
      </div>
    </Shell>
  );
}

export function Report() {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const [message, setMessage] = useState("");
  return (
    <form
      className="flex flex-col gap-3 rounded-2xl border border-line p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await marketReport({ data: { subject: String(form.get("subject") ?? ""), body: String(form.get("body") ?? "") } });
        setMessage("error" in result ? t[result.error as "invalid"] ?? t.invalid : t.saved);
        if (!("error" in result)) event.currentTarget.reset();
      }}
    >
      <h2 className="text-lg font-semibold">{t.report}</h2>
      <input name="subject" required placeholder={t.subject} aria-label={t.subject} className={controlClass} />
      <textarea name="body" required placeholder={t.body} aria-label={t.body} className={`${controlClass} h-24 py-3`} />
      <button className={btnGhost} type="submit">{t.send}</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}
