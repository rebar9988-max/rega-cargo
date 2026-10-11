import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { CATEGORY_ICON } from "./category-icons";
import { Badge, Icon } from "./ui";
import type { BazaarSearch } from "@/lib/bazaar-search";
import {
  PRIMARY_CATEGORIES,
  findSubcategory,
  isPrimaryCategory,
  isPublishedCategory,
  publishedSubcategories,
  subcategorySearchUrl,
} from "@/lib/catalogue";
import { catalogueCopy } from "@/lib/catalogue-copy";
import type { Lang } from "@/lib/langs";
import { storeCopy } from "@/lib/store-copy";

type To = "/" | "/stores";

/**
 * The catalogue entry point: one row per primary category (icon, name, directional chevron).
 * Rows are links, so each category has a direct URL and a history entry; other query
 * parameters (country, favourites) are kept.
 */
export function CategoryDirectory({
  lang,
  to,
  heading = true,
}: {
  lang: Lang;
  to: To;
  /** false where the page already has its own section heading (home). */
  heading?: boolean;
}) {
  const t = storeCopy(lang);
  const c = catalogueCopy(lang);
  const Wrapper = heading ? "section" : "div";
  return (
    // With its own heading it is a labelled region; on home the parent section already is one.
    <Wrapper
      className="rl-catalogue"
      {...(heading ? { "aria-labelledby": "rl-catalogue-title" } : {})}
    >
      {heading ? (
        <div className="rl-result-heading">
          <h2 id="rl-catalogue-title">{c.title}</h2>
          <p>{c.lede}</p>
        </div>
      ) : null}
      <ul className="rl-category-list">
        {PRIMARY_CATEGORIES.map((cat) => (
          <li key={cat}>
            {isPublishedCategory(cat) ? (
              <Link
                to={to}
                search={(previous: BazaarSearch) => ({ ...previous, cat, sub: undefined })}
                className="rl-category-row"
                data-category={cat}
              >
                <span className="rl-category-icon">
                  <Icon as={CATEGORY_ICON[cat]} />
                </span>
                <span className="rl-category-name">{t.categories[cat]}</span>
                <Icon as={ChevronRight} directional className="rl-category-chevron" />
              </Link>
            ) : (
              // Awaiting owner approval: discoverable, but not a link and lists nothing.
              <div className="rl-category-row" data-category={cat} aria-disabled="true">
                <span className="rl-category-icon">
                  <Icon as={CATEGORY_ICON[cat]} />
                </span>
                <span className="rl-category-name">{t.categories[cat]}</span>
                <Badge>{c.comingSoon}</Badge>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="rl-caption">{c.note}</p>
    </Wrapper>
  );
}

/**
 * Subcategories of the selected primary category. Choosing one refines the page (?sub=…);
 * it never claims stock. A subcategory either links to the public idealo search (prices are
 * only shown there) or is request-only, where R&L checks the goods first.
 */
export function SubcategoryPanel({
  lang,
  to,
  params,
}: {
  lang: Lang;
  to: To;
  params: BazaarSearch;
}) {
  if (!isPrimaryCategory(params.cat)) return null;
  const cat = params.cat;
  const t = storeCopy(lang);
  const c = catalogueCopy(lang);
  if (!isPublishedCategory(cat)) {
    return (
      <section className="rl-subcategories" aria-labelledby="rl-sub-title">
        <div className="rl-subcategory-head">
          <span className="rl-category-icon">
            <Icon as={CATEGORY_ICON[cat]} />
          </span>
          <div>
            <h2 id="rl-sub-title">{t.categories[cat]}</h2>
            <p className="rl-muted">{c.pendingBody}</p>
          </div>
          <Badge>{c.comingSoon}</Badge>
        </div>
      </section>
    );
  }
  const selected = findSubcategory(cat, params.sub);
  const href = selected ? subcategorySearchUrl(selected) : null;
  return (
    <section className="rl-subcategories" aria-labelledby="rl-sub-title">
      <div className="rl-subcategory-head">
        <span className="rl-category-icon">
          <Icon as={CATEGORY_ICON[cat]} />
        </span>
        <div>
          <h2 id="rl-sub-title">{t.categories[cat]}</h2>
          <p className="rl-muted">{c.subTitle}</p>
        </div>
      </div>
      <ul className="rl-chip-row rl-subcategory-chips">
        <li>
          <Link
            to={to}
            search={(previous: BazaarSearch) => ({ ...previous, sub: undefined })}
            className="rl-chip"
            aria-current={selected ? undefined : "true"}
          >
            {c.all}
          </Link>
        </li>
        {publishedSubcategories(cat).map((item) => (
          <li key={item.id}>
            <Link
              to={to}
              search={(previous: BazaarSearch) => ({ ...previous, sub: item.id })}
              className="rl-chip"
              aria-current={selected?.id === item.id ? "true" : undefined}
              data-sub={item.id}
            >
              {c.subs[cat][item.id]}
            </Link>
          </li>
        ))}
      </ul>
      {selected ? (
        <div className="rl-subcategory-detail rl-card" data-sub-detail={selected.id}>
          <h3>{c.subs[cat][selected.id]}</h3>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="rl-button"
              data-variant="secondary"
            >
              {c.searchIdealo}
              <Icon as={ArrowUpRight} directional />
            </a>
          ) : (
            <p className="rl-muted">{c.requestOnly}</p>
          )}
          <Link
            to="/stores/request"
            search={{ store: undefined, intent: "buy", item: undefined }}
            className="rl-button"
            data-variant="primary"
          >
            {t.assist}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
