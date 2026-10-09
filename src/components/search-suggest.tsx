/**
 * Suggestion panel for the global search field. Loaded lazily on the first
 * touch/focus of the field (see search-box.tsx), together with the
 * multilingual index, so none of this is in the main bundle.
 *
 * Every row is a real destination: a store card on /stores, /stores filtered
 * by category, an idealo.de search, or /ai. No prices, no invented products.
 */
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Baby,
  Camera,
  ChevronRight,
  Dumbbell,
  Flower2,
  Headphones,
  History,
  House,
  Search,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { COLLECTION_ORDER, idealoSearchUrl } from "@/lib/catalog";
import { responsiveImage } from "@/lib/images";
import type { Lang } from "@/lib/langs";
import { SUGGEST_COPY } from "@/lib/search/copy";
import { ITEM_IDEALO, suggest, type Destination, type Hit } from "@/lib/search/index";
import { storeCopy } from "@/lib/store-copy";
import { GOODS, STORE_CATEGORIES, STORES, storeLogo, type StoreCategory } from "@/lib/stores";

export const LISTBOX_ID = "rl-suggest";

const CATEGORY_ICON: Record<StoreCategory, LucideIcon> = {
  beauty: Flower2,
  fashion: Shirt,
  electronics: Headphones,
  home: House,
  baby: Baby,
  sports: Dumbbell,
  general: Search,
};

export type SuggestProps = {
  query: string;
  lang: Lang;
  activeId: string | null;
  recent: string[];
  ai: boolean;
  /** A row was chosen (by click or Enter). Records the typed text and closes the panel. */
  onChoose: () => void;
  /** Run a free-text search (recent searches). */
  onSearch: (text: string) => void;
  onClearRecent: () => void;
};

const optionBase =
  "outline-none aria-selected:bg-paper aria-selected:ring-2 aria-selected:ring-pine/40 hover:bg-paper";

function Mark({ label, mark }: { label: string; mark: [number, number] | null }) {
  if (!mark) return <>{label}</>;
  return (
    <>
      {label.slice(0, mark[0])}
      <mark className="bg-transparent font-bold text-pine">{label.slice(mark[0], mark[1])}</mark>
      {label.slice(mark[1])}
    </>
  );
}

function Option({
  id,
  active,
  dest,
  onChoose,
  className,
  label,
  children,
}: {
  id: string;
  active: boolean;
  dest: Destination | { type: "route"; to: "/ai" };
  onChoose: () => void;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (dest.type === "external") {
    return (
      <a
        id={id}
        role="option"
        aria-selected={active}
        aria-label={label}
        href={dest.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        onClick={onChoose}
        className={`${optionBase} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      id={id}
      role="option"
      aria-selected={active}
      aria-label={label}
      to={dest.to}
      search={"search" in dest ? dest.search : undefined}
      tabIndex={-1}
      onClick={onChoose}
      className={`${optionBase} ${className}`}
    >
      {children}
    </Link>
  );
}

function Heading({
  id,
  children,
  action,
}: {
  id: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 pt-5 pb-2"
      style={{ direction: "ltr" }}
    >
      <h3 id={id} dir="auto" className="text-sm font-bold text-ink">
        {children}
      </h3>
      {action}
    </div>
  );
}

const rowClass = "flex min-h-14 items-center gap-3 px-4 py-2";

export default function SearchSuggest({
  query,
  lang,
  activeId,
  recent,
  ai,
  onChoose,
  onSearch,
  onClearRecent,
}: SuggestProps) {
  const c = SUGGEST_COPY[lang] ?? SUGGEST_COPY.en;
  const t = storeCopy(lang);
  const q = query.trim();
  const results = useMemo(() => (q ? suggest(q, lang) : null), [q, lang]);
  let n = 0;
  const nextId = () => `rl-opt-${n++}`;
  const opt = (id: string) => id === activeId;

  const aiRow = ai
    ? (() => {
        const id = nextId();
        return (
          <Option
            id={id}
            active={opt(id)}
            dest={{ type: "route", to: "/ai" }}
            onChoose={onChoose}
            className={`${rowClass} border-t border-line`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-pine text-pine-ink">
              <Camera className="size-5" aria-hidden="true" />
            </span>
            <span dir="auto" className="min-w-0 flex-1 text-sm font-semibold">
              {c.aiPhoto}
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </Option>
        );
      })()
    : null;

  if (results?.blocked) {
    return (
      <div
        id={LISTBOX_ID}
        role="listbox"
        aria-label={c.items}
        className="pb-6"
        style={{ direction: "ltr" }}
      >
        <p dir="auto" className="px-4 pt-5 text-sm text-muted">
          {c.noResults}
        </p>
      </div>
    );
  }

  if (!results) {
    const trending = [...GOODS]
      .filter((good) => idealoSearchUrl(ITEM_IDEALO[good.id]))
      .sort((a, b) => COLLECTION_ORDER.indexOf(a.id) - COLLECTION_ORDER.indexOf(b.id));
    return (
      <div
        id={LISTBOX_ID}
        role="listbox"
        aria-label={c.categories}
        className="pb-6"
        style={{ direction: "ltr" }}
      >
        {recent.length > 0 ? (
          <div role="group" aria-labelledby="rl-g-recent">
            <Heading
              id="rl-g-recent"
              action={
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-sm font-medium text-pine"
                  dir="auto"
                >
                  {c.clear}
                </button>
              }
            >
              {c.recent}
            </Heading>
            <div className="flex flex-wrap gap-2 px-4">
              {recent.map((text) => {
                const id = nextId();
                return (
                  <button
                    key={text}
                    id={id}
                    type="button"
                    role="option"
                    aria-selected={opt(id)}
                    tabIndex={-1}
                    onClick={() => onSearch(text)}
                    className={`${optionBase} inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm`}
                  >
                    <History className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <span dir="auto" className="truncate">
                      {text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div role="group" aria-labelledby="rl-g-stores">
          <Heading id="rl-g-stores">{c.stores}</Heading>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {STORES.map((store) => {
              const id = nextId();
              return (
                <Option
                  key={store.id}
                  id={id}
                  active={opt(id)}
                  dest={{ type: "route", to: "/stores", search: { q: store.name } }}
                  onChoose={onChoose}
                  label={store.name}
                  className="grid h-16 w-28 shrink-0 place-items-center rounded-2xl border border-line bg-surface p-3"
                >
                  <img
                    src={storeLogo(store.id)}
                    alt=""
                    width={96}
                    height={32}
                    loading="lazy"
                    decoding="async"
                    className="max-h-8 w-auto max-w-full object-contain"
                  />
                </Option>
              );
            })}
          </div>
        </div>

        <div role="group" aria-labelledby="rl-g-cats">
          <Heading id="rl-g-cats">{c.categories}</Heading>
          <div className="mx-4 overflow-hidden rounded-2xl border border-line bg-surface">
            {STORE_CATEGORIES.filter((cat) => cat !== "general").map((cat) => {
              const id = nextId();
              const Icon = CATEGORY_ICON[cat];
              return (
                <Option
                  key={cat}
                  id={id}
                  active={opt(id)}
                  dest={{ type: "route", to: "/stores", search: { cat } }}
                  onChoose={onChoose}
                  className={`${rowClass} border-b border-line last:border-b-0`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span dir="auto" className="min-w-0 flex-1 text-base">
                    {t.categories[cat]}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                </Option>
              );
            })}
          </div>
        </div>

        <div role="group" aria-labelledby="rl-g-trend">
          <Heading
            id="rl-g-trend"
            action={
              <img
                src={storeLogo("idealo")}
                alt="idealo"
                width={72}
                height={18}
                loading="lazy"
                className="h-4 w-auto"
              />
            }
          >
            {c.trending}
          </Heading>
          <p dir="auto" className="px-4 pb-3 text-sm text-muted">
            {c.idealoNote}
          </p>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {trending.map((good) => {
              const id = nextId();
              return (
                <Option
                  key={good.id}
                  id={id}
                  active={opt(id)}
                  dest={{ type: "external", href: idealoSearchUrl(ITEM_IDEALO[good.id]) ?? "" }}
                  onChoose={onChoose}
                  label={`${t.goods[good.id]} · ${c.external}`}
                  className="flex w-24 shrink-0 flex-col gap-1 rounded-2xl p-1"
                >
                  <img
                    {...responsiveImage(good.image, "96px")}
                    alt=""
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full rounded-xl bg-surface object-cover"
                  />
                  <span dir="auto" className="line-clamp-2 text-xs leading-snug">
                    {t.goods[good.id]}
                  </span>
                </Option>
              );
            })}
          </div>
        </div>
        {aiRow ? <div className="mt-4">{aiRow}</div> : null}
      </div>
    );
  }

  const groups: { key: string; title: string; hits: Hit[] }[] = [
    { key: "stores", title: c.stores, hits: results.stores },
    { key: "brands", title: c.brands, hits: results.brands },
    { key: "cats", title: c.categories, hits: results.categories },
    { key: "items", title: c.items, hits: results.items },
  ];
  const anything = groups.some((group) => group.hits.length > 0);
  return (
    <div
      id={LISTBOX_ID}
      role="listbox"
      aria-label={c.items}
      className="pb-6"
      style={{ direction: "ltr" }}
    >
      {groups
        .filter((group) => group.hits.length > 0)
        .map((group) => (
          <div key={group.key} role="group" aria-labelledby={`rl-g-${group.key}`}>
            <Heading id={`rl-g-${group.key}`}>{group.title}</Heading>
            {group.hits.map((hit) => {
              const id = nextId();
              const Icon =
                hit.kind === "category" ? CATEGORY_ICON[hit.id as StoreCategory] : Search;
              return (
                <Option
                  key={`${hit.kind}-${hit.id}`}
                  id={id}
                  active={opt(id)}
                  dest={hit.dest}
                  onChoose={onChoose}
                  label={hit.dest.type === "external" ? `${hit.label} · ${c.external}` : hit.label}
                  className={rowClass}
                >
                  {hit.logo ? (
                    <span className="grid h-10 w-14 shrink-0 place-items-center rounded-xl border border-line bg-surface p-1.5">
                      <img
                        src={hit.logo}
                        alt=""
                        width={48}
                        height={20}
                        loading="lazy"
                        className="max-h-5 w-auto max-w-full object-contain"
                      />
                    </span>
                  ) : hit.image ? (
                    <img
                      {...responsiveImage(hit.image, "40px")}
                      alt=""
                      width={40}
                      height={40}
                      loading="lazy"
                      decoding="async"
                      className="size-10 shrink-0 rounded-xl bg-surface object-cover"
                    />
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  <span dir="auto" className="min-w-0 flex-1 truncate text-base">
                    <Mark label={hit.label} mark={hit.mark} />
                  </span>
                  {hit.dest.type === "external" ? (
                    <ArrowUpRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                  )}
                </Option>
              );
            })}
          </div>
        ))}
      {!anything ? (
        <p dir="auto" className="px-4 pt-5 text-sm text-muted">
          {c.none}
        </p>
      ) : null}
      <div className="mt-3 border-t border-line">
        {(() => {
          const href = idealoSearchUrl(results.idealoTerm);
          if (!href) return null;
          const id = nextId();
          return (
            <Option
              id={id}
              active={opt(id)}
              dest={{ type: "external", href }}
              onChoose={onChoose}
              className={rowClass}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-paper text-ink">
                <Search className="size-5" aria-hidden="true" />
              </span>
              <span dir="auto" className="min-w-0 flex-1 truncate text-sm font-semibold">
                {c.onIdealo.replace("{q}", results.idealoTerm)}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </Option>
          );
        })()}
        {aiRow}
      </div>
    </div>
  );
}
