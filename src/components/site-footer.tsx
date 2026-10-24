import { DEFAULT_MARKET_SEARCH } from "@/lib/market/search";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Mail, Warehouse } from "lucide-react";
import { Mark } from "./site-mark";
import { Icon, Select, ThemeToggle } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { LANGS } from "@/lib/langs";
import { SITE_COPY } from "@/lib/site-copy";
import { ITEMS_COPY } from "@/lib/items-copy";
import { CONTACT_EMAIL } from "@/lib/contact";
import { DESIGN_COPY } from "@/lib/design-copy";
import { JOURNEY_COPY } from "@/lib/journey-copy";
export function SiteFooter({
  bottomBar = true,
  compact = false,
}: {
  bottomBar?: boolean;
  compact?: boolean;
}) {
  const { lang, t, setLang } = useI18n();
  const c = redesignCopy(lang);
  const j = JOURNEY_COPY[lang];
  const legal = SITE_COPY[lang].legal;
  if (compact)
    return (
      <footer
        className={`rl-site-footer rl-store-compact-footer ${bottomBar ? "clear-bottom-bar" : ""}`}
      >
        <nav className="page rl-compact-links" aria-label={c.footerLegal}>
          <Link to="/contact">{t.nav.contact}</Link>
          {(["impressum", "privacy", "terms"] as const).map((doc) => (
            <Link key={doc} to={`/${doc}`}>
              {legal[doc]}
            </Link>
          ))}
          <Link to="/prohibited-items">{ITEMS_COPY[lang].link}</Link>
        </nav>
      </footer>
    );
  return (
    <footer className={`rl-site-footer rl-defer ${bottomBar ? "clear-bottom-bar" : ""}`}>
      <div className="page rl-footer-grid">
        <div className="rl-footer-brand">
          <Mark className="rl-footer-mark" />
          <div className="rl-footer-identity">
            <p className="rl-footer-slogan">
              <bdi lang="en" dir="ltr">
                {t.brandSub}
              </bdi>
            </p>
            <p>{DESIGN_COPY[lang].route}</p>
          </div>
          <p className="rl-row">
            <Icon as={Warehouse} />
            {c.warehouse}
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="rl-text-link">
            <Icon as={Mail} />
            <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
          </a>
        </div>
        <details className="rl-footer-group">
          <summary>
            <span>{c.footerShop}</span>
            <Icon as={ChevronDown} />
          </summary>
          <nav aria-label={c.footerShop} className="rl-footer-links">
            {/* One link to the marketplace instead of repeating the category list here. */}
            <Link to="/market" search={DEFAULT_MARKET_SEARCH}>
              {c.marketplace}
            </Link>
            <Link
              to="/stores/request"
              search={{ intent: "buy", store: undefined, item: undefined }}
            >
              {j.bring}
            </Link>
            <Link to="/stores">{j.stores}</Link>
            <Link to="/stores" search={{ fav: 1 }}>
              {DESIGN_COPY[lang].wishlist}
            </Link>
          </nav>
        </details>
        <details className="rl-footer-group">
          <summary>
            <span>{c.footerHelp}</span>
            <Icon as={ChevronDown} />
          </summary>
          <nav aria-label={c.footerHelp} className="rl-footer-links">
            <Link to="/quote" search={{ from: undefined, to: undefined, kg: undefined }}>
              {c.shipping}
            </Link>
            <Link to="/track" search={{ id: undefined }}>
              {t.nav.track}
            </Link>
            <Link to="/contact">{t.nav.contact}</Link>
            <Link to="/prohibited-items">{ITEMS_COPY[lang].link}</Link>
            <a href="/rl-cargo.pdf" download>
              {c.pdf}
            </a>
          </nav>
        </details>
        <details className="rl-footer-group">
          <summary>
            <span>{c.footerLegal}</span>
            <Icon as={ChevronDown} />
          </summary>
          <nav aria-label={c.footerLegal} className="rl-footer-links">
            {(["impressum", "privacy", "terms"] as const).map((doc) => (
              <Link key={doc} to={`/${doc}`}>
                {legal[doc]}
              </Link>
            ))}
          </nav>
        </details>
        <div className="rl-footer-preferences">
          <label className="rl-footer-language">
            <span>{DESIGN_COPY[lang].language}</span>
            <Select
              value={lang}
              onChange={(e) => {
                const next = LANGS.find((l) => l.id === e.target.value);
                if (next) setLang(next.id);
              }}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </label>
          <ThemeToggle />
        </div>
      </div>
      <div className="page rl-footer-note">
        <p>{t.footerNote}</p>
      </div>
    </footer>
  );
}
