import { responsiveImage } from "@/lib/images";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { QuotePanel } from "@/components/quote-panel";
import { DeliveryHub, ServiceSwitch } from "@/components/delivery-hub";
import { readService, writeService, type Service } from "@/lib/service-choice";
import { BrandHero, RAIL, SectionHeader, TrustRow, seeAllClass } from "@/components/brand";
import { Shell } from "@/components/shell";
import type { BazaarSearch } from "@/lib/bazaar-search";
import { BRANDS, COLLECTION_ORDER } from "@/lib/catalog";
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
  const [onlyFav, setOnlyFav] = useState(params.fav === 1);
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
    setOnlyFav(params.fav === 1);
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
              className="page-bleed grid grid-cols-3"
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
                      className={`absolute inset-x-6 bottom-0 h-0.5 ${on ? "bg-pine" : "bg-transparent"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <BrandHero title={d.tagline} route={d.route} />
          <TrustRow />

          <section className={`page pt-8 md:pt-12`}>
            <SectionHeader
              title={d.newCollection}
              action={
                <Link to="/stores" search={audience ? { who: audience } : {}} className={seeAllClass}>
                  <span dir="auto">{d.seeAll}</span>
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <ul
              className={`-mx-[var(--gutter)] mt-4 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-[var(--rail-gap)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:scroll-px-0 md:px-0 ${RAIL}`}
              style={{ direction: "ltr" }}
            >
              {collection.map((good, index) => (
                <li key={good.id} className="rail-item snap-start">
                  <Link to="/stores" search={{ cat: good.category }} className="group block">
                    <span className="block overflow-hidden rounded-xl bg-[#f1f0ee]">
                      <img
                        {...responsiveImage(good.image, "(min-width: 768px) 220px, 42vw")}
                        alt=""
                        width={640}
                        height={640}
                        loading={index < 3 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        decoding="async"
                        className="aspect-product w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </span>
                    <span dir="auto" className="mt-2 block truncate text-sm font-medium text-ink">
                      {t.goods[good.id]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`page grid items-start gap-6 pt-8 md:grid-cols-[minmax(0,1fr)_24rem] md:gap-8 md:pt-12`}>
            <div className="min-w-0">
              <SectionHeader
                title={t.title}
                sub={t.notPartner}
                action={
                  <Link to="/stores" className={seeAllClass}>
                    <span dir="auto">{d.seeAll}</span>
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                }
              />
              <p className="mt-3 hidden max-w-xl text-sm leading-relaxed text-muted md:block">{t.lede}</p>
              <ul
                className={`-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 ${RAIL}`}
                style={{ direction: "ltr" }}
              >
                {BRANDS.map((brand) => {
                  const on = brandName === brand.name;
                  const logo = STORES.find((store) => store.name.toLowerCase() === brand.name.toLowerCase());
                  return (
                    <li key={brand.name} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={brand.name}
                        onClick={() => {
                          setBrandName(brand.name);
                          setCategory(brand.category);
                        }}
                        className={`grid h-12 w-28 place-items-center rounded-xl border bg-surface px-3 transition-colors ${on ? "border-pine ring-1 ring-pine" : "border-line hover:border-silver"}`}
                      >
                        {logo ? (
                          <img
                            src={storeLogo(logo.id)}
                            alt=""
                            width={96}
                            height={24}
                            loading="lazy"
                            decoding="async"
                            className="h-5 w-full object-contain"
                          />
                        ) : (
                          <bdi dir="ltr" className="truncate font-sans text-sm font-semibold tracking-wide text-ink">
                            {brand.name}
                          </bdi>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="hidden md:block">
              <QuotePanel variant="compact" />
            </div>
          </section>

          <div className={`page flex flex-col gap-8 pt-8 pb-12 md:pt-12`}>
            <div className={`-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0 ${RAIL}`}>
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

            <ul data-layout="card-grid" className="card-grid gap-y-8">
              {goods.map((good) => {
                const shop = storeById(good.storeId);
                return (
                  <li key={good.id} className="flex flex-col">
                    <div className="overflow-hidden rounded-xl bg-[#f1f0ee]">
                      <img
                        {...responsiveImage(good.image, "(min-width: 768px) 270px, 50vw")}
                        alt={t.goods[good.id]}
                        width={640}
                        height={640}
                        loading="lazy"
                        decoding="async"
                        className="aspect-product w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 px-1 pt-3">
                      {shop ? (
                        <p className="font-sans text-xs font-semibold tracking-widest text-muted">
                          <bdi dir="ltr">{shop.name}</bdi>
                        </p>
                      ) : null}
                      <h3 className="text-sm font-medium leading-snug">{t.goods[good.id]}</h3>
                      <p className="text-xs text-muted">{t.awaiting}</p>
                      <Link
                        to="/stores/request"
                        search={{ store: good.storeId, intent: "buy", item: good.id }}
                        className="mt-2 inline-flex h-10 items-center justify-center rounded-full rl-grad text-sm"
                      >
                        {t.order}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-2xl leading-tight font-bold tracking-tight md:text-3xl">
                {t.storesHeading}
              </h2>
              <div className="flex min-w-0 gap-2">
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value as "all" | "DE" | "INT")}
                  aria-label={t.allCountries}
                  className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-base md:flex-none"
                >
                  <option value="all">{t.allCountries}</option>
                  <option value="DE">{t.germany}</option>
                  <option value="INT">{t.international}</option>
                </select>
                <button
                  type="button"
                  aria-pressed={onlyFav}
                  onClick={() => setOnlyFav((value) => !value)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm ${onlyFav ? "border-pine text-pine" : "border-line"}`}
                >
                  <Heart className="size-4" fill={onlyFav ? "currentColor" : "none"} />
                  {t.favorites}
                </button>
              </div>
            </div>

            {list.length === 0 ? <p className="text-sm text-muted">{t.empty}</p> : null}
            <ul data-layout="card-grid" className="card-grid">
              {list.map((store) => {
                const loved = favs.includes(store.id);
                return (
                  <li
                    key={store.id}
                    className="rl-soft flex flex-col rounded-2xl border border-line bg-surface p-3 md:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-16 min-w-0 flex-1 place-items-center rounded-2xl border border-line bg-white px-2 md:px-4">
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
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line"
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
                    <p className="mt-3 mb-4 line-clamp-2 text-sm text-muted">
                      {store.categories.map((item) => t.categories[item]).join(" · ")}
                    </p>
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full rl-grad px-3 py-2 text-center text-sm leading-tight font-medium"
                    >
                      {t.open}
                    </a>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                      <Link
                        to="/stores/request"
                        search={{ store: store.id, intent: "buy", item: undefined }}
                        className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
                      >
                        {t.assist}
                      </Link>
                      <Link
                        to="/stores/request"
                        search={{ store: store.id, intent: "ship", item: undefined }}
                        className="inline-flex min-h-11 items-center text-muted underline-offset-4 hover:underline"
                      >
                        {t.shipOwn}
                      </Link>
                    </div>
                    <details className="text-sm text-muted">
                      <summary className="flex min-h-11 cursor-pointer items-center">{t.external}</summary>
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
      className={`h-11 shrink-0 rounded-full border px-4 text-sm ${on ? "rl-grad border-transparent" : "border-line bg-surface text-ink"}`}
    >
      {children}
    </button>
  );
}
