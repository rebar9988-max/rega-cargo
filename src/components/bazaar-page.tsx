import { responsiveImage } from "@/lib/images";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { QuotePanel } from "@/components/quote-panel";
import { DeliveryHub, ServiceSwitch } from "@/components/delivery-hub";
import { readService, writeService, type Service } from "@/lib/service-choice";
import { Shell } from "@/components/shell";
import type { BazaarSearch } from "@/lib/bazaar-search";
import { DESIGN_COPY } from "@/lib/design-copy";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";
import {
  GOODS,
  readFavs,
  STORE_CATEGORIES,
  STORES,
  storeById,
  storeLogo,
  writeFavs,
  type StoreCategory,
} from "@/lib/stores";

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

type Audience = "women" | "men" | "kids";
const AUDIENCES: Audience[] = ["women", "men", "kids"];
/** Real catalogue items and store categories per audience tab (no invented products). */
const AUDIENCE_GOODS: Record<Audience, string[]> = {
  women: ["perfume", "cream", "dress"],
  men: ["sneakers", "earbuds", "ball"],
  kids: ["baby", "ball"],
};
const AUDIENCE_CATEGORIES: Record<Audience, StoreCategory[]> = {
  women: ["beauty", "fashion"],
  men: ["fashion", "electronics", "sports"],
  kids: ["baby", "sports"],
};
const COLLECTION_ORDER = [
  "sneakers",
  "earbuds",
  "perfume",
  "dress",
  "cream",
  "kettle",
  "baby",
  "ball",
];
const isAudience = (value: unknown): value is Audience => AUDIENCES.includes(value as Audience);
const isCategory = (value: unknown): value is StoreCategory =>
  STORE_CATEGORIES.includes(value as StoreCategory);

export function BazaarPage({
  home = false,
  initialService = "bazaar",
}: { home?: boolean; initialService?: Service } = {}) {
  const { lang } = useI18n();
  const t = storeCopy(lang);
  const d = DESIGN_COPY[lang];
  const params = useRouterState({ select: (state) => state.location.search as BazaarSearch });
  const [q, setQ] = useState(params.q ?? "");
  const [category, setCategory] = useState<StoreCategory | "all">(
    isCategory(params.cat) ? params.cat : "all",
  );
  const [audience, setAudience] = useState<Audience | null>(
    isAudience(params.who) ? params.who : null,
  );
  const [brandName, setBrandName] = useState<string | null>(null);
  const [country, setCountry] = useState<"all" | "DE" | "INT">("all");
  const [onlyFav, setOnlyFav] = useState(params.fav === "1");
  const [favs, setFavs] = useState<string[]>(() => readFavs());
  const query = q.trim().toLowerCase();
  // Home offers both services. The server renders the remembered choice from the
  // rl-service cookie; this effect only corrects devices that still have the
  // older storage-only choice (and gives them the cookie for next time).
  const [service, setService] = useState<Service>(initialService);
  useEffect(() => {
    if (!home) return;
    const stored = readService();
    if (stored !== initialService) {
      setService(stored);
      writeService(stored);
    }
  }, [home, initialService]);
  const chooseService = (next: Service) => {
    setService(next);
    writeService(next);
  };
  const bazaarOn = !home || service === "bazaar";

  // Follow URL changes (header search, heart icon, collection cards) while mounted.
  useEffect(() => {
    setQ(params.q ?? "");
    if (isCategory(params.cat)) setCategory(params.cat);
    if (isAudience(params.who)) setAudience(params.who);
    setOnlyFav(params.fav === "1");
  }, [params.q, params.cat, params.who, params.fav]);

  const collection = useMemo(
    () =>
      (audience ? GOODS.filter((good) => AUDIENCE_GOODS[audience].includes(good.id)) : GOODS)
        .slice()
        .sort((a, b) => COLLECTION_ORDER.indexOf(a.id) - COLLECTION_ORDER.indexOf(b.id)),
    [audience],
  );

  const goods = useMemo(() => {
    return GOODS.filter((good) => {
      if (audience && !AUDIENCE_GOODS[audience].includes(good.id)) return false;
      if (category !== "all" && good.category !== category) return false;
      if (!query) return true;
      const shop = storeById(good.storeId);
      return `${t.goods[good.id]} ${shop?.name ?? ""} ${shop?.host ?? ""}`
        .toLowerCase()
        .includes(query);
    });
  }, [category, query, t, audience]);

  const list = useMemo(() => {
    return STORES.filter((store) => {
      if (onlyFav && !favs.includes(store.id)) return false;
      if (
        audience &&
        !store.categories.some((item) => AUDIENCE_CATEGORIES[audience].includes(item))
      )
        return false;
      if (category !== "all" && !store.categories.includes(category)) return false;
      if (country !== "all" && store.country !== country) return false;
      if (!query) return true;
      return `${store.name} ${store.host}`.toLowerCase().includes(query);
    });
  }, [query, category, country, onlyFav, favs, audience]);

  function toggle(id: string) {
    const next = favs.includes(id) ? favs.filter((item) => item !== id) : [...favs, id];
    setFavs(next);
    writeFavs(next);
  }

  return (
    <Shell search={{ q, setQ }}>
      {home ? <ServiceSwitch value={service} onChange={chooseService} /> : null}
      {bazaarOn ? (
        <>
          <div className="border-b border-line bg-surface">
            <div
              className="mx-auto grid max-w-6xl grid-cols-3"
              role="tablist"
              style={{ direction: "ltr" }}
            >
              {AUDIENCES.map((item) => {
                const on = audience === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setAudience(on ? null : item)}
                    className={`relative h-12 text-sm ${on ? "font-semibold text-ink" : "text-muted"}`}
                  >
                    {d.audience[item]}
                    <span
                      className={`absolute inset-x-6 bottom-0 h-0.5 ${on ? "bg-ink" : "bg-transparent"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <section className="bg-ink text-paper">
            <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
              <p
                dir="ltr"
                className="text-end font-sans text-[11px] tracking-[0.2em] text-paper/60"
              >
                R&amp;L
              </p>
              <h1 className="mt-4 text-3xl leading-snug font-bold tracking-tight text-balance text-paper md:text-5xl md:leading-tight">
                {d.tagline}
              </h1>
              <p className="mt-5 text-sm text-paper/60">{d.route}</p>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-5 pt-8 md:pt-12">
            <div className="flex items-center justify-between gap-3" style={{ direction: "ltr" }}>
              <h2 className="text-2xl font-bold tracking-tight">{d.newCollection}</h2>
              <Link
                to="/stores"
                search={audience ? { who: audience } : {}}
                aria-label={d.seeAll}
                className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
            <ul
              className="-mx-5 mt-4 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2"
              style={{ direction: "ltr" }}
            >
              {collection.map((good, index) => (
                <li
                  key={good.id}
                  className={`shrink-0 snap-start ${index === 0 ? "w-[46%] md:w-64" : "w-[38%] md:w-52"}`}
                >
                  <Link to="/stores" search={{ cat: good.category }} className="block">
                    <span className="block overflow-hidden rounded-sm bg-[#ececea]">
                      <img
                        {...responsiveImage(good.image, "(min-width: 768px) 256px, 46vw")}
                        alt=""
                        width={640}
                        height={640}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className={`w-full object-cover ${index === 0 ? "aspect-[3/4]" : "aspect-square"}`}
                      />
                    </span>
                    <span dir="auto" className="mt-2 block text-sm text-ink">
                      {t.goods[good.id]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mx-auto grid max-w-6xl items-start gap-6 px-5 pt-8 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8 md:pt-12">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight">{t.title}</h2>
              <p className="mt-2 hidden max-w-xl text-base leading-relaxed text-muted md:block">
                {t.lede}
              </p>
              <p className="mt-2 text-xs text-muted">{t.notPartner}</p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
                      className={`h-10 shrink-0 rounded-full border px-4 font-sans text-sm ${on ? "border-ink bg-ink text-pine-ink" : "border-line bg-surface text-ink"}`}
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
          </section>

          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-6 md:py-12">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Chip
                on={category === "all" && !brandName}
                onClick={() => {
                  setBrandName(null);
                  setCategory("all");
                }}
              >
                {t.allCategories}
              </Chip>
              {STORE_CATEGORIES.filter((item) => item !== "general").map((item) => (
                <Chip
                  key={item}
                  on={category === item && !brandName}
                  onClick={() => {
                    setBrandName(null);
                    setCategory(item);
                  }}
                >
                  {t.categories[item]}
                </Chip>
              ))}
            </div>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">
              {goods.map((good) => {
                const shop = storeById(good.storeId);
                return (
                  <li key={good.id} className="flex flex-col">
                    <div className="overflow-hidden rounded-2xl bg-surface">
                      <img
                        {...responsiveImage(good.image, "(min-width: 768px) 270px, 50vw")}
                        alt={t.goods[good.id]}
                        width={640}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/4] w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-1 pt-3">
                      {shop ? (
                        <p className="font-sans text-[10px] font-semibold tracking-[0.16em] text-muted">
                          <bdi dir="ltr">{shop.name}</bdi>
                        </p>
                      ) : null}
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
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {t.storesHeading}
              </h2>
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
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((store) => {
                const loved = favs.includes(store.id);
                return (
                  <li
                    key={store.id}
                    className="flex flex-col rounded-3xl border border-line bg-surface p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-16 min-w-0 flex-1 place-items-center rounded-2xl border border-line bg-white px-4">
                        <img
                          src={storeLogo(store.id)}
                          alt={store.name}
                          width={128}
                          height={32}
                          loading="lazy"
                          decoding="async"
                          className="h-8 w-full max-w-32 object-contain"
                        />
                      </span>
                      <button
                        type="button"
                        aria-pressed={loved}
                        aria-label={t.favorites}
                        onClick={() => toggle(store.id)}
                        className="inline-flex size-10 items-center justify-center rounded-full border border-line"
                      >
                        <Heart
                          className={`size-4 ${loved ? "text-pine" : "text-muted"}`}
                          fill={loved ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight">
                      <bdi dir="ltr">{store.name}</bdi>
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {store.country === "DE" ? t.germany : t.international}
                      {" · "}
                      <bdi dir="ltr">{store.host}</bdi>
                    </p>
                    <p className="mt-4 text-sm text-muted">
                      {store.categories.map((item) => t.categories[item]).join(" · ")}
                    </p>
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-pine-ink"
                    >
                      {t.open}
                    </a>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <Link
                        to="/stores/request"
                        search={{ store: store.id, intent: "buy", item: undefined }}
                        className="text-ink underline-offset-4 hover:underline"
                      >
                        {t.assist}
                      </Link>
                      <Link
                        to="/stores/request"
                        search={{ store: store.id, intent: "ship", item: undefined }}
                        className="text-muted underline-offset-4 hover:underline"
                      >
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
        </>
      ) : (
        <DeliveryHub />
      )}
    </Shell>
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
