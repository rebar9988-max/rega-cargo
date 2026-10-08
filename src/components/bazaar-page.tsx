import { responsiveImage } from "@/lib/images";
import { Link } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { QuotePanel } from "@/components/quote-panel";
import { Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import { GOODS, readFavs, STORE_CATEGORIES, STORES, storeById, writeFavs, type StoreCategory } from "@/lib/stores";

const BRANDS: { name: string; category: StoreCategory }[] = [
  { name: "NIVEA", category: "beauty" },
  { name: "L'ORÉAL", category: "beauty" },
  { name: "GARNIER", category: "beauty" },
  { name: "KÉRASTASE", category: "beauty" },
  { name: "SEPHORA", category: "beauty" },
  { name: "ZARA", category: "fashion" },
  { name: "H&M", category: "fashion" },
  { name: "ZALANDO", category: "fashion" },
  { name: "AMAZON", category: "electronics" },
  { name: "OTTO", category: "home" },
  { name: "DECATHLON", category: "sports" },
];

export function BazaarPage() {
  const { lang } = useI18n();
  const t = storeCopy(lang);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<StoreCategory | "all">("all");
  const [brandName, setBrandName] = useState<string | null>(null);
  const [country, setCountry] = useState<"all" | "DE" | "INT">("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => readFavs());
  const query = q.trim().toLowerCase();

  const goods = useMemo(() => {
    return GOODS.filter((good) => {
      if (category !== "all" && good.category !== category) return false;
      if (!query) return true;
      const shop = storeById(good.storeId);
      return `${t.goods[good.id]} ${shop?.name ?? ""} ${shop?.host ?? ""}`.toLowerCase().includes(query);
    });
  }, [category, query, t]);

  const list = useMemo(() => {
    return STORES.filter((store) => {
      if (onlyFav && !favs.includes(store.id)) return false;
      if (category !== "all" && !store.categories.includes(category)) return false;
      if (country !== "all" && store.country !== country) return false;
      if (!query) return true;
      return `${store.name} ${store.host}`.toLowerCase().includes(query);
    });
  }, [query, category, country, onlyFav, favs]);

  function toggle(id: string) {
    const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
    setFavs(next);
    writeFavs(next);
  }

  return (
    <Shell>
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-6xl items-start gap-6 px-5 py-6 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8 md:py-14">
          <div>
            <p className="font-sans text-xs font-semibold tracking-[0.16em] text-pine">EUROPE ↔ KURDISTAN ↔ IRAQ</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-5xl">{t.title}</h1>
            <div className="mt-4">
              <p className="hidden max-w-xl text-base leading-relaxed text-muted md:block">{t.lede}</p>
              <SearchBox q={q} setQ={setQ} label={t.search} />
              <p className="mt-3 text-xs text-muted">{t.notPartner}</p>
            </div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {BRANDS.map((brand) => {
                const on = brandName === brand.name;
                return (
                  <button
                    key={brand.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setBrandName(brand.name);
                      setCategory(brand.category);
                    }}
                    className={`h-11 shrink-0 rounded-full border px-4 font-sans text-sm ${on ? "border-ink bg-ink text-pine-ink" : "border-line bg-surface text-ink"}`}
                  >
                    <bdi dir="ltr">{brand.name}</bdi>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden md:block">
            <QuotePanel variant="compact" />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 md:py-12">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip on={category === "all" && !brandName} onClick={() => { setBrandName(null); setCategory("all"); }}>{t.allCategories}</Chip>
          {STORE_CATEGORIES.filter((item) => item !== "general").map((item) => (
            <Chip key={item} on={category === item && !brandName} onClick={() => { setBrandName(null); setCategory(item); }}>{t.categories[item]}</Chip>
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
          {goods.map((good, index) => {
            const shop = storeById(good.storeId);
            return (
              <li key={good.id} className="flex flex-col">
                <div className="overflow-hidden rounded-2xl bg-surface">
                  <img
                    {...responsiveImage(good.image, "(min-width: 768px) 270px, 50vw")}
                    alt={t.goods[good.id]}
                    width={640}
                    height={640}
                    loading={index < 2 ? "eager" : "lazy"}
                    decoding="async"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 px-1 pt-3">
                  {shop ? <p className="font-sans text-[10px] font-semibold tracking-[0.16em] text-muted"><bdi dir="ltr">{shop.name}</bdi></p> : null}
                  <h2 className="text-sm font-medium leading-snug">{t.goods[good.id]}</h2>
                  <p className="text-xs text-muted">{t.awaiting}</p>
                  <Link
                    to="/stores/request"
                    search={{ store: good.storeId, intent: "buy", item: good.id }}
                    className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-ink text-sm text-pine-ink"
                  >
                    {t.order}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t.storesHeading}</h2>
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value as "all" | "DE" | "INT")}
              aria-label={t.allCountries}
              className="h-11 rounded-full border border-line bg-surface px-4 text-sm"
            >
              <option value="all">{t.allCountries}</option>
              <option value="DE">{t.germany}</option>
              <option value="INT">{t.international}</option>
            </select>
            <button
              type="button"
              aria-pressed={onlyFav}
              onClick={() => setOnlyFav((value) => !value)}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm ${onlyFav ? "border-pine text-pine" : "border-line"}`}
            >
              <Heart className="size-4" fill={onlyFav ? "currentColor" : "none"} />
              {t.favorites}
            </button>
          </div>
        </div>

        {list.length === 0 ? <p className="text-sm text-muted">{t.empty}</p> : null}
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((store) => {
            const loved = favs.includes(store.id);
            return (
              <li key={store.id} className="flex flex-col rounded-3xl border border-line bg-surface p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink font-sans text-lg font-semibold text-pine-ink">
                    {store.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-sans text-xl font-semibold tracking-tight">{store.name}</h3>
                      <button
                        type="button"
                        aria-pressed={loved}
                        aria-label={t.favorites}
                        onClick={() => toggle(store.id)}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-line"
                      >
                        <Heart className={`size-4 ${loved ? "text-pine" : "text-muted"}`} fill={loved ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {store.country === "DE" ? t.germany : t.international}
                      {" · "}
                      <bdi dir="ltr">{store.host}</bdi>
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted">{store.categories.map((item) => t.categories[item]).join(" · ")}</p>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-pine-ink"
                >
                  {t.open}
                </a>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <Link to="/stores/request" search={{ store: store.id, intent: "buy", item: undefined }} className="text-ink underline-offset-4 hover:underline">
                    {t.assist}
                  </Link>
                  <Link to="/stores/request" search={{ store: store.id, intent: "ship", item: undefined }} className="text-muted underline-offset-4 hover:underline">
                    {t.shipOwn}
                  </Link>
                </div>
                <details className="mt-3 text-sm text-muted">
                  <summary className="cursor-pointer">{t.external}</summary>
                  <p className="mt-2 leading-relaxed">{t.notes[store.note]}</p>
                  {store.caution.length > 0 ? (
                    <ul className="mt-2 flex flex-col gap-1">
                      {store.caution.map((item) => (
                        <li key={item}>{t.cautions[item]}</li>
                      ))}
                    </ul>
                  ) : null}
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </Shell>
  );
}

function SearchBox({ q, setQ, label }: { q: string; setQ: (value: string) => void; label: string }) {
  return (
    <label className="mt-4 flex h-14 max-w-xl items-center gap-3 rounded-full border border-line bg-surface px-4">
      <Search className="size-4 shrink-0 text-muted" />
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-full w-full bg-transparent text-base text-ink outline-none"
      />
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full border px-4 text-sm ${on ? "border-ink bg-ink text-pine-ink" : "border-line bg-surface text-ink"}`}
    >
      {children}
    </button>
  );
}
