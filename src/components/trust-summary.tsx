import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { TRUST_COPY } from "@/lib/trust-copy";
import approved from "@/lib/business-approved.json";
import { businessReadiness } from "@/lib/business-profile";

export function TrustSummary() {
  const { lang } = useI18n();
  const t = TRUST_COPY[lang];
  const { profile } = businessReadiness(approved);
  return (
    <section className="rl-card rl-stack" data-trust-summary>
      <h2 className="text-xl font-semibold">{t.title}</h2>
      {profile ? (
        <p dir="auto" className="text-sm">
          {profile.legalName} · {profile.city}, {profile.country}
        </p>
      ) : (
        <p className="text-sm text-muted">{t.pending}</p>
      )}
      <div className="rl-row text-sm">
        <Link to="/impressum" className="rl-text-link">
          {t.provider}
        </Link>
        <Link to="/terms" className="rl-text-link">
          {t.policy}
        </Link>
        <Link to="/contact" className="rl-text-link">
          {t.complaint}
        </Link>
      </div>
    </section>
  );
}
