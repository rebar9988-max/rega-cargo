import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calculator,
  Heart,
  PackageSearch,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./ui";
import { responsiveImage } from "@/lib/images";
import { useI18n } from "@/lib/i18n";
import { refHomeCopy } from "@/lib/ref-home-copy";
import { redesignCopy } from "@/lib/redesign-copy";
import { storeCopy } from "@/lib/store-copy";
import { storeById } from "@/lib/stores";
import { CATEGORY_TILES, featuredGoods } from "@/lib/ref-home-data";

function SectionHead({ id, title, action }: { id: string; title: string; action: ReactNode }) {
  return (
    <div className="rl-ref-head">
      <h2 id={id}>{title}</h2>
      {action}
    </div>
  );
}

export function RefHome() {
  const { lang } = useI18n();
  const c = refHomeCopy(lang);
  const sc = storeCopy(lang);
  const rc = redesignCopy(lang);
  const featured = featuredGoods(sc.goods);
  return (
    <div className="rl-ref" data-layout-exempt>
      <section className="rl-ref-hero" aria-labelledby="rl-ref-title">
        <div className="rl-ref-hero-copy" dir="ltr">
          <p className="rl-ref-eyebrow" dir="auto">
            {c.eyebrow}
          </p>
          <h1 id="rl-ref-title" dir="auto">
            <span className="rl-ref-title-1">{c.titleLines[0]}</span>{" "}
            <span className="rl-ref-title-2">{c.titleLines[1]}</span>
          </h1>
          <p className="rl-ref-lede" lang={lang === "ckb" ? "en" : undefined} dir="auto">
            {c.lede}
          </p>
          <div className="rl-ref-actions">
            <Link to="/stores" className="rl-ref-btn" data-variant="primary">
              <span dir="auto">{c.shop}</span>
              <Icon as={ArrowRight} />
            </Link>
            <Link
              to="/market"
              search={{
                q: "",
                category: "",
                brand: "",
                min: "",
                max: "",
                stock: "",
                sort: "price",
                page: 1,
                saved: "",
              }}
              className="rl-ref-btn"
              data-variant="light"
            >
              <span dir="auto">{c.compare}</span>
              <Icon as={ArrowRight} />
            </Link>
          </div>
        </div>
        <div className="rl-ref-hero-art" aria-hidden="true">
          <img
            src="/home/hero-art.webp"
            alt=""
            width={504}
            height={496}
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section className="rl-ref-section" aria-labelledby="rl-ref-cats">
        <SectionHead
          id="rl-ref-cats"
          title={c.categoriesTitle}
          action={
            <Link to="/stores" className="rl-ref-link">
              {c.categoriesAll}
              <Icon as={ArrowRight} directional />
            </Link>
          }
        />
        <ul className="rl-ref-cats">
          {CATEGORY_TILES.map((tile) => (
            <li key={tile.key}>
              <Link
                to="/stores"
                search={tile.cat ? { cat: tile.cat, sub: tile.sub } : {}}
                className="rl-ref-cat"
              >
                <img
                  src={tile.image}
                  alt=""
                  width={108}
                  height={114}
                  loading="lazy"
                  decoding="async"
                />
                <span dir="auto">{c.cats[tile.key]}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link to="/stores" className="rl-ref-cat rl-ref-cat-more">
              <span className="rl-ref-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span dir="auto">{c.cats.more}</span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="rl-ref-section" aria-labelledby="rl-ref-featured">
        <SectionHead
          id="rl-ref-featured"
          title={c.featuredTitle}
          action={
            <Link to="/stores" className="rl-ref-link">
              {c.featuredAll}
              <Icon as={ArrowRight} directional />
            </Link>
          }
        />
        <ul className="rl-ref-products">
          {featured.map((good) => (
            <li key={good.id} className="rl-ref-product" data-good={good.id}>
              <Link
                to="/stores/request"
                search={{ store: good.storeId, intent: "buy", item: good.id }}
                className="rl-ref-product-image"
              >
                <img
                  {...responsiveImage(good.image, "(min-width: 1024px) 200px, 45vw")}
                  alt=""
                  width={640}
                  height={640}
                  loading="lazy"
                  decoding="async"
                />
                <span className="rl-ref-badge">{c.example}</span>
              </Link>
              <div className="rl-ref-product-row">
                <div className="rl-ref-product-text">
                  <h3 dir="auto">{sc.goods[good.id]}</h3>
                  <p className="rl-ref-muted" dir="auto">
                    <bdi dir="ltr">{storeById(good.storeId)?.name}</bdi> · {c.priceAwaiting}
                  </p>
                </div>
                <Link
                  to="/stores/request"
                  search={{ store: good.storeId, intent: "buy", item: good.id }}
                  className="rl-ref-cart"
                  aria-label={`${c.addRequest}: ${sc.goods[good.id]}`}
                >
                  <Icon as={ShoppingCart} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rl-ref-banners" aria-label={`${c.bringTitle} · R&L CARE+`}>
        <article className="rl-ref-banner rl-ref-banner-bring" dir="ltr">
          <div className="rl-ref-banner-text">
            <h2 dir="auto">{c.bringTitle}</h2>
            <p dir="auto">{c.bringBody}</p>
            <Link
              to="/stores/request"
              search={{ store: undefined, item: undefined, intent: "buy" }}
              className="rl-ref-btn rl-ref-btn-sm"
              data-variant="light"
            >
              <span dir="auto">{c.bringCta}</span>
              <Icon as={ArrowRight} />
            </Link>
          </div>
          <img
            src="/home/banner-bring.webp"
            alt=""
            width={212}
            height={221}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        </article>
        <article className="rl-ref-banner rl-ref-banner-care" dir="ltr">
          <div className="rl-ref-banner-text">
            <p className="rl-ref-care-mark">
              <img
                src="/rl-mark-168.webp"
                alt="R&L"
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
              <span dir="ltr">CARE+</span>
              <span className="rl-ref-soon">{c.careSoon}</span>
            </p>
            <h2 dir="auto">{c.careTitle}</h2>
            <p dir="auto">{c.careBody}</p>
            <Link to="/contact" className="rl-ref-btn rl-ref-btn-sm" data-variant="primary">
              <span dir="auto">{c.careCta}</span>
              <Icon as={ArrowRight} />
            </Link>
          </div>
          <img
            src="/home/banner-care.webp"
            alt=""
            width={270}
            height={221}
            loading="lazy"
            decoding="async"
            aria-hidden="true"
          />
        </article>
      </section>

      <section className="rl-ref-section rl-ref-benefits-wrap" aria-label={c.benefits[0].title}>
        <ul className="rl-ref-benefits">
          <li>
            <Link to="/quote" search={{ from: undefined, to: undefined, kg: undefined }}>
              <Icon as={Calculator} />
              <span>
                <b dir="auto">{c.benefits[0].title}</b>
                <small dir="auto">{c.benefits[0].body}</small>
              </span>
            </Link>
          </li>
          <li>
            <Link to="/track" search={{ id: "" }}>
              <Icon as={PackageSearch} />
              <span>
                <b dir="auto">{c.benefits[1].title}</b>
                <small dir="auto">{c.benefits[1].body}</small>
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/stores/request"
              search={{ store: undefined, item: undefined, intent: "buy" }}
            >
              <Icon as={ShoppingBag} />
              <span>
                <b dir="auto">{c.benefits[2].title}</b>
                <small dir="auto">{c.benefits[2].body}</small>
              </span>
            </Link>
          </li>
          <li>
            <Link to="/stores" search={{ fav: 1 }}>
              <Icon as={Heart} />
              <span>
                <b dir="auto">{c.benefits[3].title}</b>
                <small dir="auto">{c.benefits[3].body}</small>
              </span>
            </Link>
          </li>
        </ul>
      </section>
      <div className="rl-ref-section">
        <p className="rl-ref-note">
          {c.featuredNote} {rc.noPartner}
        </p>
      </div>
    </div>
  );
}
