import { DEFAULT_MARKET_SEARCH } from "@/lib/market/search";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Icon } from "./ui";
import { MarketProductCard, type ListedProduct } from "./market-product-card";
import { useI18n } from "@/lib/i18n";
import { JOURNEY_COPY } from "@/lib/journey-copy";
import { redesignCopy } from "@/lib/redesign-copy";
import { marketCopy } from "@/lib/market-copy";
import { useHydrated } from "@/lib/use-hydrated";

export type DiscoveryData =
  | { error: string }
  | {
      items: ListedProduct[];
      categories: { id: string; name_ku: string; name_en: string }[];
    };
export function MarketDiscovery({ data }: { data: DiscoveryData | null }) {
  const navigate = useNavigate();
  const ready = useHydrated();
  const { lang } = useI18n();
  const j = JOURNEY_COPY[lang],
    c = redesignCopy(lang),
    m = marketCopy(lang);
  const listing = data && !("error" in data) ? data : null;
  return (
    <section className="page rl-section rl-defer" aria-labelledby="rl-market-title">
      <div className="rl-section-heading">
        <div>
          <h2 id="rl-market-title">{c.marketplace}</h2>
          <p>{j.marketBody}</p>
        </div>
        <Link to="/market" search={DEFAULT_MARKET_SEARCH} className="rl-text-link">
          {j.shop}
        </Link>
      </div>
      <form
        action="/market"
        method="get"
        className="rl-discovery-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
          void navigate({ to: "/market", search: { ...DEFAULT_MARKET_SEARCH, q } });
        }}
      >
        <input type="hidden" name="lang" value={lang} />
        <input
          type="search"
          name="q"
          aria-label={m.search}
          placeholder={m.search}
          maxLength={80}
          className="rl-control"
        />
        <button
          type="submit"
          className="rl-button"
          data-variant="primary"
          disabled={!ready}
          aria-busy={!ready}
        >
          <Icon as={Search} />
          {m.search}
        </button>
      </form>
      {listing?.categories.length ? (
        <ul className="rl-row rl-discovery-categories">
          {listing.categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to="/market"
                search={{ ...DEFAULT_MARKET_SEARCH, category: cat.id }}
                className="rl-chip"
              >
                {lang === "ckb" ? cat.name_ku : cat.name_en}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {listing?.items.length ? (
        <ul className="card-grid" data-layout="card-grid">
          {listing.items.slice(0, 4).map((item) => (
            <MarketProductCard key={item.slug} item={item} />
          ))}
        </ul>
      ) : (
        <div className="rl-card rl-stack" role="status">
          <p className="text-sm text-muted">{listing ? j.marketEmpty : j.marketError}</p>
          <Link
            to="/stores/request"
            search={{ intent: "buy", store: undefined, item: undefined }}
            className="rl-text-link"
          >
            {j.bring}
          </Link>
        </div>
      )}
    </section>
  );
}
