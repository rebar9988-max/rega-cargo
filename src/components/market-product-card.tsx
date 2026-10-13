import { Link } from "@tanstack/react-router";
import { responsiveImage } from "@/lib/images";
import { useI18n } from "@/lib/i18n";
import { iqd, marketCopy } from "@/lib/market-copy";

export type ListedProduct = {
  slug: string;
  nameKu: string;
  nameEn: string;
  brand: string;
  image: string | null;
  lowest: number | null;
  offerCount: number;
};

/** Shared card: only stored products and verified offer values are rendered. */
export function MarketProductCard({ item }: { item: ListedProduct }) {
  const { lang } = useI18n();
  const t = marketCopy(lang);
  return (
    <li className="rl-compare-product overflow-hidden rounded-2xl border border-line bg-surface">
      <Link to="/market/$slug" params={{ slug: item.slug }} className="flex h-full flex-col">
        {item.image ? (
          <img
            {...responsiveImage(item.image, "(min-width: 768px) 270px, 50vw")}
            alt=""
            width={640}
            height={640}
            loading="lazy"
            decoding="async"
            className="aspect-square w-full object-cover"
          />
        ) : (
          <span className="aspect-square bg-paper" />
        )}
        <span className="flex flex-1 flex-col gap-1 p-3">
          <span className="font-semibold">{lang === "ckb" ? item.nameKu : item.nameEn}</span>
          <span className="font-sans text-xs text-muted">
            <bdi dir="ltr">{item.brand}</bdi>
          </span>
          <span className="text-sm text-pine">
            {item.lowest == null ? "—" : <bdi dir="ltr">{iqd(item.lowest)}</bdi>}
          </span>
          <span className="text-xs text-muted">
            <bdi dir="ltr">{item.offerCount}</bdi> {t.offers}
          </span>
        </span>
      </Link>
    </li>
  );
}
