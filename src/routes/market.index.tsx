import { Skeleton } from "@/components/ui";
import { seo } from "@/lib/seo";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { PAGES_COPY } from "@/lib/pages-copy";
import { PageHeader, Shell } from "@/components/shell";
import { btnPrimary, controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { marketHome } from "@/lib/market/api";
import { marketCopy } from "@/lib/market-copy";

import { MarketProductCard } from "@/components/market-product-card";
import { JOURNEY_COPY } from "@/lib/journey-copy";
import { validateMarketSearch } from "@/lib/market/search";
export const Route = createFileRoute("/market/")({
  validateSearch: validateMarketSearch,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    brand: search.brand,
    min: search.min,
    max: search.max,
    stock: search.stock,
    sort: search.sort,
    page: search.page,
    saved: search.saved,
  }),
  loader: ({ deps }) => marketHome({ data: { ...deps, saved: deps.saved === "1" } }),
  head: ({ match }) =>
    seo({
      lang: match.context.initialLang,
      path: "/market",
      title: "بەراوردی نرخ · R&L",
      description: "بەراوردی نرخی کاڵا لە چەند فرۆشیارێک. بێ پارەدان و بێ ڕیکلام.",
    }),
  pendingComponent: MarketLoading,
  component: MarketHome,
});

function MarketHome() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/market/" });
  const { lang } = useI18n();
  const t = marketCopy(lang);
  const router = useRouter();
  const j = JOURNEY_COPY[lang];
  if ("error" in data) {
    const pc = PAGES_COPY[lang];
    return (
      <Shell>
        <PageHeader kicker={t.marketKicker} title={t.marketTitle} lede={t.marketLede} />
        <div className="page rl-market-unavailable" role="status">
          <p className="text-sm text-muted">
            {data.error === "unavailable" ? pc.unavailable : pc.errorBody}
          </p>
          <Link to="/stores" className={btnPrimary}>
            {j.stores}
          </Link>
          <Link
            to="/stores/request"
            search={{ intent: "buy", store: undefined, item: undefined }}
            className="rl-button"
            data-variant="secondary"
          >
            {j.bring}
          </Link>
          <button
            type="button"
            onClick={() => void router.invalidate()}
            className="rl-button"
            data-variant="secondary"
          >
            {pc.retry}
          </button>
        </div>
      </Shell>
    );
  }
  function set(patch: Partial<typeof search>) {
    void navigate({ search: { ...search, page: 1, ...patch } });
  }
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.marketTitle} lede={t.marketLede} />
      <div className="page rl-compare-page">
        <div className="rl-compare-actions">
          <Link to="/market/sell" className="text-pine">
            {t.sell}
          </Link>
          <Link to="/admin" className="text-pine">
            {t.admin}
          </Link>
          <button
            type="button"
            className="text-pine"
            onClick={() => set({ saved: search.saved === "1" ? "" : "1" })}
          >
            {t.favorite}
          </button>
        </div>
        <form
          key={JSON.stringify(search)}
          className="rl-card rl-compare-filters"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            set({
              q: String(form.get("q") ?? ""),
              category: String(form.get("category") ?? ""),
              brand: String(form.get("brand") ?? ""),
              min: String(form.get("min") ?? ""),
              max: String(form.get("max") ?? ""),
              stock: form.get("stock") === "on" ? "in" : "",
              sort: String(form.get("sort") ?? "price") === "new" ? "new" : "price",
            });
          }}
        >
          <input
            name="q"
            defaultValue={search.q}
            placeholder={t.search}
            aria-label={t.search}
            className={controlClass}
          />
          <select
            name="category"
            defaultValue={search.category}
            aria-label={t.all}
            className={controlClass}
          >
            <option value="">{t.all}</option>
            {data.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {lang === "ckb" ? cat.name_ku : cat.name_en}
              </option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={search.brand}
            aria-label={t.brand}
            className={controlClass}
          >
            <option value="">{t.brand}</option>
            {data.brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={search.sort}
            aria-label={t.priceSort}
            className={controlClass}
          >
            <option value="price">{t.priceSort}</option>
            <option value="new">{t.newest}</option>
          </select>
          <input
            name="min"
            defaultValue={search.min}
            inputMode="numeric"
            dir="ltr"
            placeholder={t.min}
            aria-label={t.min}
            className={controlClass}
          />
          <input
            name="max"
            defaultValue={search.max}
            inputMode="numeric"
            dir="ltr"
            placeholder={t.max}
            aria-label={t.max}
            className={controlClass}
          />
          <label className="flex h-12 items-center gap-2 text-sm">
            <input name="stock" type="checkbox" defaultChecked={search.stock === "in"} />
            {t.inStock}
          </label>
          <button type="submit" className={btnPrimary}>
            {t.search}
          </button>
        </form>
        <p className="text-sm text-muted">{t.freeSort}</p>
        {data.items.length === 0 ? (
          <div
            className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface p-5"
            role="status"
          >
            <p className="text-sm text-muted">{t.none}</p>
            <Link to="/stores" className={btnPrimary}>
              {j.stores}
            </Link>
            <Link
              to="/stores/request"
              search={{ intent: "buy", store: undefined, item: undefined }}
              className="rl-text-link"
            >
              {j.bring}
            </Link>
            {search.q ||
            search.category ||
            search.brand ||
            search.min ||
            search.max ||
            search.stock ||
            search.saved ? (
              <Link
                to="/market"
                search={{
                  sort: "price",
                  page: 1,
                  q: "",
                  category: "",
                  brand: "",
                  min: "",
                  max: "",
                  stock: "",
                  saved: "",
                }}
                className="text-sm font-medium text-pine"
              >
                {t.all}
              </Link>
            ) : null}
          </div>
        ) : null}
        <ul data-layout="card-grid" className="card-grid">
          {data.items.map((item) => (
            <MarketProductCard key={item.slug} item={item} />
          ))}
        </ul>
        <div className="flex gap-3">
          {search.page > 1 ? (
            <button
              type="button"
              aria-label={PAGES_COPY[lang].prev}
              className="inline-flex size-12 items-center justify-center rounded-full text-sm text-pine"
              onClick={() => set({ page: search.page - 1 })}
            >
              ←
            </button>
          ) : null}
          <span className="inline-flex items-center text-sm text-muted">
            <bdi dir="ltr">
              {search.page} / {data.pages}
            </bdi>
          </span>
          {search.page < data.pages ? (
            <button
              type="button"
              aria-label={PAGES_COPY[lang].next}
              className="inline-flex size-12 items-center justify-center rounded-full text-sm text-pine"
              onClick={() => navigate({ search: { ...search, page: search.page + 1 } })}
            >
              →
            </button>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

function MarketLoading() {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.marketTitle} lede={t.marketLede} />
      <div className="page py-10" role="status" aria-busy="true">
        <span className="sr-only">{PAGES_COPY[lang].loading}</span>
        <ul data-layout="card-grid" className="card-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <Skeleton className="rl-product-skeleton" />
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  );
}
