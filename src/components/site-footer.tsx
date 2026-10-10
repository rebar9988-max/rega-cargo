import { Link } from "@tanstack/react-router";
import { Mail, Warehouse } from "lucide-react";
import { Mark } from "./site-mark";
import { Icon, Select, ThemeToggle } from "./ui";
import { useI18n } from "@/lib/i18n";
import { redesignCopy } from "@/lib/redesign-copy";
import { LANGS } from "@/lib/langs";
import { SITE_COPY } from "@/lib/site-copy";
import { ITEMS_COPY } from "@/lib/items-copy";
import { CONTACT_EMAIL } from "@/lib/contact";
import { NAV_CATEGORIES } from "@/lib/navigation";
import { isPublishedCategory } from "@/lib/catalogue";
import { storeCopy } from "@/lib/store-copy";
import { DESIGN_COPY } from "@/lib/design-copy";
export function SiteFooter() {
  const { lang, t, setLang } = useI18n();
  const c = redesignCopy(lang);
  const legal = SITE_COPY[lang].legal;
  return (
    <footer className="rl-site-footer rl-defer clear-bottom-bar">
      <div className="page rl-footer-grid">
        <div className="rl-stack">
          <Mark />
          <p className="rl-footer-slogan" lang="en" dir="ltr">
            {t.brandSub}
          </p>
          <p>{DESIGN_COPY[lang].route}</p>
          <p className="rl-row">
            <Icon as={Warehouse} />
            {c.warehouse}
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="rl-text-link">
            <Icon as={Mail} />
            <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
          </a>
        </div>
        <nav aria-label={c.footerShop} className="rl-stack">
          <h2>{c.footerShop}</h2>
          {NAV_CATEGORIES.filter(isPublishedCategory).map((cat) => (
            <Link key={cat} to="/stores" search={{ cat }}>
              {storeCopy(lang).categories[cat]}
            </Link>
          ))}
          <Link to="/stores" search={{ fav: 1 }}>
            {DESIGN_COPY[lang].wishlist}
          </Link>
        </nav>
        <nav aria-label={c.footerHelp} className="rl-stack">
          <h2>{c.footerHelp}</h2>
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
        <div className="rl-stack">
          <nav aria-label={c.footerLegal} className="rl-stack">
            <h2>{c.footerLegal}</h2>
            {(["impressum", "privacy", "terms"] as const).map((doc) => (
              <Link key={doc} to={`/${doc}`}>
                {legal[doc]}
              </Link>
            ))}
          </nav>
          <label className="rl-stack">
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
