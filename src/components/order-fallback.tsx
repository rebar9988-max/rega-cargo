import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/lib/contact";
import { DRAFT_COPY } from "@/lib/orders/draft-copy";
import { requestEmailDraft } from "@/lib/orders/draft";
import { useI18n } from "@/lib/i18n";

export function OrderFallback({
  rows,
  declared,
  unavailable,
}: {
  rows: Array<[string, string]>;
  declared: boolean;
  unavailable: boolean;
}) {
  const { lang } = useI18n();
  const t = DRAFT_COPY[lang];
  const [message, setMessage] = useState("");
  const summary = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  return (
    <details className="rl-card rl-stack" open={unavailable || undefined} data-order-fallback>
      <summary className="rl-mobile-menu-link">{t.fallback}</summary>
      <p className="text-sm text-muted">{t.note}</p>
      <label className="rl-stack text-sm">
        {t.summary}
        <textarea className="rl-control h-40" readOnly value={summary} dir="auto" />
      </label>
      <div className="rl-row">
        {declared ? (
          <a
            className="rl-button"
            data-variant="secondary"
            href={requestEmailDraft(CONTACT_EMAIL, rows)}
          >
            {t.fallback}
          </a>
        ) : null}
        <button
          type="button"
          className="rl-button"
          disabled={!declared}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(summary);
              setMessage(t.copied);
            } catch {
              setMessage(t.copyFailed);
            }
          }}
        >
          {t.copy}
        </button>
        <Link to="/contact" className="rl-text-link">
          <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
        </Link>
      </div>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </details>
  );
}
