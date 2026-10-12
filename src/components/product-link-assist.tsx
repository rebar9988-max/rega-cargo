import { useState } from "react";
import { Field, controlClass, btnPrimary, btnGhost } from "@/components/field";
import { formatEur } from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { NUM_LOCALE } from "@/lib/numbers";
import { checkProductUrl } from "@/lib/orders/store-request";
import { productLinkCheck } from "@/lib/product-link/api";
import { productLinkEnabled } from "@/lib/product-link/flag";
import { productLinkCopy } from "@/lib/product-link/copy";
import { LINK_MAX } from "@/lib/product-link/url";

type Result = {
  error?: string;
  link?: { canonicalUrl: string; provider: string };
  info?: { title: string } | null;
  estimate?: {
    shippingEur: number;
    shippingIqd: number;
    chargeableKg: number;
    daysMin: number;
    daysMax: number;
  } | null;
};

/** Optional helper above the request form. Renders nothing unless the server flag is on. */
export function ProductLinkAssist({ dest, onUse }: { dest: string; onUse: (url: string) => void }) {
  const { lang } = useI18n();
  const c = productLinkCopy(lang);
  // Known on the server and stamped on <html>, so the first paint already includes the panel.
  const [enabled] = useState(productLinkEnabled);
  const [url, setUrl] = useState("");
  const [kg, setKg] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  if (!enabled) return null;

  async function run(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      setResult((await productLinkCheck({ data: { url, kg: kg.trim(), dest } })) as Result);
    } catch {
      setResult({ error: "unavailable" });
    } finally {
      setBusy(false);
    }
  }

  const number = new Intl.NumberFormat(NUM_LOCALE, { maximumFractionDigits: 1 });
  const canUse = result?.link && checkProductUrl(result.link.canonicalUrl, undefined).ok;
  return (
    <form onSubmit={run} className="rl-card flex flex-col gap-4" aria-busy={busy} data-product-link>
      <div>
        <h2 className="text-2xl leading-tight font-bold">{c.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{c.lede}</p>
      </div>
      <Field label={c.link}>
        <input
          className={controlClass}
          dir="ltr"
          type="url"
          inputMode="url"
          maxLength={LINK_MAX}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </Field>
      <Field label={c.kg}>
        <input
          className={controlClass}
          dir="ltr"
          inputMode="decimal"
          maxLength={6}
          value={kg}
          onChange={(e) => setKg(e.target.value)}
        />
      </Field>
      <button type="submit" className={`${btnPrimary} disabled:opacity-60`} disabled={busy}>
        {busy ? c.checking : c.check}
      </button>
      <div aria-live="polite" className="flex flex-col gap-3">
        {result?.error ? (
          <p role="alert" className="text-sm text-clay">
            {c.errors[result.error] ?? c.errors.unavailable}
          </p>
        ) : null}
        {result?.link ? (
          <>
            <p className="font-sans text-sm text-muted">
              <bdi dir="ltr">{result.link.canonicalUrl}</bdi>
            </p>
            {!result.info ? <p className="text-sm text-muted">{c.noInfo}</p> : null}
            {result.estimate ? (
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>
                    {c.shipping} <span className="text-muted">({c.estimateLabel})</span>
                  </dt>
                  <dd className="font-semibold">
                    ≈ {formatEur(result.estimate.shippingEur)} · ≈{" "}
                    {new Intl.NumberFormat(NUM_LOCALE).format(result.estimate.shippingIqd)} IQD
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{c.chargeable}</dt>
                  <dd>{number.format(result.estimate.chargeableKg)} kg</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{c.days}</dt>
                  <dd>
                    {number.format(result.estimate.daysMin)}–
                    {number.format(result.estimate.daysMax)}
                  </dd>
                </div>
              </dl>
            ) : null}
            <p className="text-sm text-muted">{c.disclaimer}</p>
            {canUse ? (
              <button
                type="button"
                className={btnGhost}
                onClick={() => onUse(result.link!.canonicalUrl)}
              >
                {c.use}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  );
}
