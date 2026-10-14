import { useHydrated } from "@/lib/use-hydrated";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { TRUST_COPY } from "@/lib/trust-copy";
import { CONTACT_EMAIL } from "@/lib/contact";
import { requestEmailDraft } from "@/lib/orders/draft";
import { Field, controlClass } from "./field";

/** Reviewable complaint intake; no invented eligibility, refunds, deadlines or receipt. */
export function ComplaintPanel() {
  const ready = useHydrated();
  const { lang } = useI18n();
  const t = TRUST_COPY[lang];
  const [ref, setRef] = useState("");
  const [details, setDetails] = useState("");
  return (
    <section className="rl-card rl-stack w-full" data-complaint-panel>
      <h2 className="text-2xl font-semibold">{t.complaint}</h2>
      <p className="text-sm text-muted">{t.help}</p>
      <Field label={t.reference}>
        <input
          className={controlClass}
          dir="ltr"
          disabled={!ready}
          maxLength={40}
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
      </Field>
      <Field label={t.details}>
        <textarea
          className={`${controlClass} h-32`}
          disabled={!ready}
          maxLength={2000}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </Field>
      <p className="text-sm text-muted">{t.note}</p>
      <div className="rl-row">
        {details.trim() ? (
          <a
            href={requestEmailDraft(CONTACT_EMAIL, [
              [t.complaint, ref],
              [t.details, details],
            ])}
            className="rl-button"
            data-variant="primary"
          >
            {t.send}
          </a>
        ) : (
          <button type="button" className="rl-button" disabled>
            {t.send}
          </button>
        )}
        <Link to="/terms" className="rl-text-link">
          {t.policy}
        </Link>
      </div>
    </section>
  );
}
