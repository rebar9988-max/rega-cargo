import { responsiveImage } from "@/lib/images";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { marketHome } from "@/lib/market/api";
import { iqd, marketCopy } from "@/lib/market-copy";

export const Route = createFileRoute("/market/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "",
    brand: typeof search.brand === "string" ? search.brand : "",
    min: typeof search.min === "string" ? search.min : "",
    max: typeof search.max === "string" ? search.max : "",
    stock: search.stock === "in" ? "in" : "",
    sort: search.sort === "new" ? "new" : "price",
    page: typeof search.page === "number" && search.page > 0 ? search.page : 1,
    saved: search.saved === "1" || search.saved === true ? "1" : "",
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => marketHome({ data: { ...deps, saved: deps.saved === "1" } }),
  head: () => ({
    meta: [
      { title: "بازاڕ · R&L" },
      { name: "description", content: "بەراوردی نرخی کاڵا لە چەند فرۆشیارێک. بێ پارەدان و بێ ڕیکلام." },
    ],
  }),
  component: MarketHome,
});

function MarketHome() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/market/" });
  const { lang } = useI18n();
  const t = marketCopy(lang);
  if ("error" in data) {
    return (
      <Shell>
        <PageHeader kicker={t.marketKicker} title={t.marketTitle} lede={t.marketLede} />
        <p className="mx-auto max-w-6xl px-5 py-10 text-sm text-clay">{t.invalid}</p>
      </Shell>
    );
  }
  function set(patch: Partial<typeof search>) {
    void navigate({ search: { ...search, page: 1, ...patch } });
  }
  return (
    <Shell>
      <PageHeader kicker={t.marketKicker} title={t.marketTitle} lede={t.marketLede} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/market/sell" className="text-pine">{t.sell}</Link>
          <Link to="/admin" className="text-pine">{t.admin}</Link>
          <button type="button" className="text-pine" onClick={() => set({ saved: search.saved === "1" ? "" : "1" })}>
            {t.favorite}
          </button>
        </div>
        <form
          className="grid gap-3 md:grid-cols-4"
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
          <input name="q" defaultValue={search.q} placeholder={t.search} aria-label={t.search} className={controlClass} />
          <select name="category" defaultValue={search.category} aria-label={t.all} className={controlClass}>
            <option value="">{t.all}</option>
            {data.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{lang === "ckb" ? cat.name_ku : cat.name_en}</option>
            ))}
          </select>
          <select name="brand" defaultValue={search.brand} aria-label={t.brand} className={controlClass}>
            <option value="">{t.brand}</option>
            {data.brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <select name="sort" defaultValue={search.sort} aria-label={t.priceSort} className={controlClass}>
            <option value="price">{t.priceSort}</option>
            <option value="new">{t.newest}</option>
          </select>
          <input name="min" defaultValue={search.min} inputMode="numeric" dir="ltr" placeholder={t.min} aria-label={t.min} className={controlClass} />
          <input name="max" defaultValue={search.max} inputMode="numeric" dir="ltr" placeholder={t.max} aria-label={t.max} className={controlClass} />
          <label className="flex h-12 items-center gap-2 text-sm">
            <input name="stock" type="checkbox" defaultChecked={search.stock === "in"} />
            {t.inStock}
          </label>
          <button type="submit" className="h-12 rounded-full bg-pine px-5 text-sm font-medium text-pine-ink">{t.search}</button>
        </form>
        <p className="text-sm text-muted">{t.freeSort}</p>
        {data.items.length === 0 ? <p className="text-sm text-muted">{t.none}</p> : null}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {data.items.map((item) => (
            <li key={item.slug} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <Link to="/market/$slug" params={{ slug: item.slug }} className="flex h-full flex-col">
                {item.image ? <img {...responsiveImage(item.image, "(min-width: 768px) 270px, 50vw")} alt="" width={640} height={640} loading="lazy" decoding="async" className="aspect-square w-full object-cover" /> : <span className="aspect-square bg-paper" />}
                <span className="flex flex-1 flex-col gap-1 p-3">
                  <span className="font-semibold">{lang === "ckb" ? item.nameKu : item.nameEn}</span>
                  <span className="font-sans text-xs text-muted"><bdi dir="ltr">{item.brand}</bdi></span>
                  <span className="text-sm text-pine">{item.lowest == null ? "—" : <bdi dir="ltr">{iqd(item.lowest)}</bdi>}</span>
                  <span className="text-xs text-muted"><bdi dir="ltr">{item.offerCount}</bdi> {t.offers}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          {search.page > 1 ? (
            <button type="button" className="text-sm text-pine" onClick={() => set({ page: search.page - 1 })}>←</button>
          ) : null}
          <span className="text-sm text-muted"><bdi dir="ltr">{search.page} / {data.pages}</bdi></span>
          {search.page < data.pages ? (
            <button type="button" className="text-sm text-pine" onClick={() => navigate({ search: { ...search, page: search.page + 1 } })}>→</button>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}
