import { AssistantHome } from "@/modules/rl-ai/ui/assistant-home";
import { CHAT_COPY } from "@/modules/rl-ai/ui/assistant-copy";
import { sniffKind, readDimensions } from "@/lib/ai/image";
import { UX_COPY } from "@/lib/ux-copy";
import { Camera, ImageUp, ShieldCheck, X } from "lucide-react";
import { gateFields } from "@/lib/ai/gate-client";
import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react";
import { AI_COPY, type AiCopy } from "@/components/ai-copy";
import { controlClass, Field } from "@/components/field";
import { Shell } from "@/components/shell";
import { landedEstimate } from "@/lib/ai/landed";
import type { IdentifyResult } from "@/lib/ai/schema";
import {
  countryName,
  DESTS,
  formatEur,
  formatIqdFromEur,
  ORIGINS,
  placeName,
  type Contents,
} from "@/lib/corridor";
import { useI18n } from "@/lib/i18n";
import { storeCopy } from "@/lib/store-copy";

const MAX_SIDE = 1024;

/** Downscale + re-encode on the device (drops EXIF/GPS) before upload. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  if (bitmap.width * bitmap.height > 16_000_000) {
    bitmap.close();
    throw new Error("bad_dimensions");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("encode");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      0.85,
    ),
  );
}

type Phase =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done"; result: IdentifyResult }
  | { kind: "error"; message: string };

function errorText(t: AiCopy, code: string | undefined) {
  return code && code in t.errors ? t.errors[code as keyof AiCopy["errors"]] : t.errors.generic;
}

export function AiPage() {
  const { lang } = useI18n();
  const t: AiCopy = AI_COPY[lang] ?? AI_COPY.en;
  const categories = storeCopy(lang).categories;
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [consent, setConsent] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const consentId = useId();
  const [pending, setPending] = useState<Blob | null>(null);
  const processing = useRef(false);
  const selection = useRef(0);
  const request = useRef<AbortController | null>(null);
  const chatCopy = CHAT_COPY[lang];
  useEffect(
    () => () => {
      selection.current++;
      request.current?.abort();
    },
    [],
  );

  useEffect(() => {
    let live = true;
    fetch("/api/ai/status", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : { enabled: false }))
      .then((body: { enabled?: boolean }) => live && setEnabled(body.enabled === true))
      .catch(() => live && setEnabled(false));
    return () => {
      live = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function onFile(file: File | undefined) {
    if (!file || !consent || processing.current) return;
    const selected = ++selection.current;
    setPending(null);
    setPreview(null);
    setPhase({ kind: "busy" });
    try {
      if (file.size > 10_000_000) throw new Error("too_large");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error("unsupported");
      const bytes = new Uint8Array(await file.slice(0, 256_000).arrayBuffer());
      const kind = sniffKind(bytes);
      if (!kind || !readDimensions(bytes, kind)) throw new Error("unsupported");
      const small = await shrink(file);
      if (selection.current !== selected) return;
      setPreview(URL.createObjectURL(small));
      setPending(small);
      setPhase({ kind: "idle" });
    } catch (error) {
      if (selection.current === selected)
        setPhase({
          kind: "error",
          message: errorText(t, error instanceof Error ? error.message : undefined),
        });
    }
  }
  async function processImage() {
    if (!pending || !consent || processing.current) return;
    processing.current = true;
    const controller = new AbortController();
    request.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 40_000);
    setPhase({ kind: "busy" });
    try {
      const form = new FormData();
      form.set("consent", "1");
      form.set("image", pending, "photo.jpg");
      const gate = await gateFields({ signal: controller.signal });
      if (gate.token) form.set("token", gate.token);
      if (gate.turnstile) form.set("turnstile", gate.turnstile);
      const res = await fetch("/api/ai/identify", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        result?: IdentifyResult;
        error?: string;
      };
      if (!controller.signal.aborted && res.ok && body.ok && body.result)
        setPhase({ kind: "done", result: body.result });
      else if (!controller.signal.aborted)
        setPhase({ kind: "error", message: errorText(t, body.error) });
    } catch {
      if (!controller.signal.aborted) setPhase({ kind: "error", message: t.errors.generic });
      else setPhase({ kind: "error", message: t.errors.timeout });
    } finally {
      window.clearTimeout(timer);
      processing.current = false;
      request.current = null;
    }
  }

  const busy = phase.kind === "busy";
  const pickClass = "rl-button rl-upload-action";

  return (
    <Shell>
      <AssistantHome />
      <div
        className="page rl-reading-stack"
        style={{ fontFamily: '"Vazirmatn", var(--rl-font-latin), sans-serif' }}
      >
        <details id="rl-ai-image" className="rl-card" open>
          <summary className="cursor-pointer py-3 text-lg font-semibold">{t.title}</summary>
          <p className="mb-4 text-sm text-muted">{t.lede}</p>
          {enabled === false ? (
            <p className="rl-card text-sm">{t.errors.disabled}</p>
          ) : (
            <section className="rl-card rl-ai-card">
              <div className="flex items-start gap-3">
                <input
                  id={consentId}
                  type="checkbox"
                  className="mt-0.5 size-6 shrink-0 accent-[var(--color-pine)]"
                  checked={consent}
                  disabled={busy}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <p className="min-w-0 flex-1 text-sm leading-relaxed">
                  <label htmlFor={consentId}>{t.consent}</label>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                <p className="min-w-0 flex-1">{t.privacyLine}</p>
              </div>
              <div className="grid max-w-md grid-cols-2 gap-3">
                <label
                  className={`${pickClass} rl-grad font-semibold shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine ${!consent || busy || !enabled ? "rl-upload-disabled" : "hover:opacity-90"}`}
                >
                  <Camera className="size-4" aria-hidden />
                  <span dir="auto">{preview ? t.retake : t.take}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    aria-label={preview ? t.retake : t.take}
                    className="sr-only"
                    disabled={!consent || busy || !enabled}
                    aria-describedby={consent ? undefined : `${consentId}-hint`}
                    onChange={(event) => {
                      void onFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <label
                  className={`${pickClass} border border-line bg-surface text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine ${!consent || busy || !enabled ? "rl-upload-disabled" : "hover:border-pine"}`}
                >
                  <ImageUp className="size-4" aria-hidden />
                  <span dir="auto">{t.choose}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label={t.choose}
                    className="sr-only"
                    disabled={!consent || busy || !enabled}
                    aria-describedby={consent ? undefined : `${consentId}-hint`}
                    onChange={(event) => {
                      void onFile(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {!consent ? (
                <p id={`${consentId}-hint`} className="-mt-2 text-xs text-muted">
                  {UX_COPY[lang].consentFirst}
                </p>
              ) : null}
              {preview ? (
                <img src={preview} alt="" className="max-h-72 w-full rounded-xl object-contain" />
              ) : null}
              {busy ? (
                <p className="text-sm text-muted" role="status">
                  {t.analyzing}
                </p>
              ) : null}
              {phase.kind === "error" ? (
                <p className="text-sm text-pine" role="alert">
                  {phase.message}
                </p>
              ) : null}
              {pending && preview ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rl-button"
                    data-variant="primary"
                    disabled={busy || !consent}
                    onClick={() => void processImage()}
                  >
                    {chatCopy.process}
                  </button>
                  <button
                    type="button"
                    className="rl-button"
                    data-variant="secondary"
                    disabled={busy}
                    onClick={() => {
                      selection.current++;
                      setPending(null);
                      setPreview(null);
                      setPhase({ kind: "idle" });
                    }}
                  >
                    <X className="size-4" aria-hidden />
                    {chatCopy.remove}
                  </button>
                </div>
              ) : null}
            </section>
          )}

          {phase.kind === "done" ? (
            <ResultCard
              t={t}
              result={phase.result}
              categoryLabel={categories[phase.result.category]}
            />
          ) : null}

          <EstimateCard t={t} />
        </details>
      </div>
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 md:flex-row md:gap-6">
      <dt className="shrink-0 md:w-40 text-sm text-muted">
        <p>{label}</p>
      </dt>
      <dd className="min-w-0 flex-1 text-sm">
        <p>{children}</p>
      </dd>
    </div>
  );
}

function English({ children }: { children: ReactNode }) {
  return (
    <bdi dir="ltr" lang="en" className="break-words">
      {children}
    </bdi>
  );
}

function ResultCard({
  t,
  result,
  categoryLabel,
}: {
  t: AiCopy;
  result: IdentifyResult;
  categoryLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6" aria-live="polite">
      <h2 className="text-2xl leading-tight font-bold tracking-tight">{t.result}</h2>
      <p className="mt-1 text-xs text-muted">{t.aiNote}</p>
      <dl className="mt-4">
        <Row label={t.category}>{categoryLabel}</Row>
        <Row label={t.brand}>{result.brand ? <English>{result.brand}</English> : "—"}</Row>
        <Row label={t.model}>{result.model ? <English>{result.model}</English> : "—"}</Row>
        <Row label={t.visibleText}>
          {result.visibleText.length ? <English>{result.visibleText.join(" · ")}</English> : "—"}
        </Row>
        <Row label={t.attributes}>
          {result.attributes.length ? <English>{result.attributes.join(" · ")}</English> : "—"}
        </Row>
        <Row label={t.confidence}>{t.levels[result.confidence]}</Row>
      </dl>
      {result.counterfeitSignals.length ? (
        <div className="mt-4 rounded-xl bg-paper p-4">
          <h3 className="text-sm font-semibold">{t.signals}</h3>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {result.counterfeitSignals.map((note) => (
              <p key={note}>
                <English>{note}</English>
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{t.signalsNote}</p>
        </div>
      ) : null}
    </section>
  );
}

function EstimateCard({ t }: { t: AiCopy }) {
  const { lang } = useI18n();
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [originId, setOriginId] = useState(ORIGINS[0].id);
  const [destId, setDestId] = useState(DESTS[0].id);
  const [contents, setContents] = useState<Contents>("personal");
  const estimate = useMemo(
    () =>
      landedEstimate({
        priceEur: Number.parseFloat(price.replace(",", ".")),
        weightKg: Number.parseFloat(weight.replace(",", ".")),
        originId,
        destId,
        contents,
      }),
    [price, weight, originId, destId, contents],
  );

  return (
    <section className="rl-card rl-ai-card">
      <div>
        <h2 className="text-2xl leading-tight font-bold tracking-tight">{t.estimateTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.estimateLede}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.price}>
          <input
            inputMode="decimal"
            dir="ltr"
            className={controlClass}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
        <Field label={t.weight}>
          <input
            inputMode="decimal"
            dir="ltr"
            className={controlClass}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </Field>
        <Field label={t.from}>
          <select
            className={controlClass}
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
          >
            {ORIGINS.map((o) => (
              <option key={o.id} value={o.id}>
                {placeName(o, lang)} — {countryName(o, lang)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.to}>
          <select
            className={controlClass}
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
          >
            {DESTS.map((d) => (
              <option key={d.id} value={d.id}>
                {placeName(d, lang)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t.contents}>
          <select
            className={controlClass}
            value={contents}
            onChange={(e) => setContents(e.target.value as Contents)}
          >
            <option value="personal">{t.personal}</option>
            <option value="commercial">{t.commercial}</option>
          </select>
        </Field>
      </div>
      {estimate ? (
        <dl className="rounded-xl bg-paper p-4">
          <Row label={t.item}>
            <bdi dir="ltr">{formatEur(estimate.itemEur)}</bdi>
          </Row>
          <Row label={t.shipping}>
            <bdi dir="ltr">{formatEur(estimate.shippingEur)}</bdi>
          </Row>
          <Row label={t.duty}>
            <bdi dir="ltr">{formatEur(estimate.dutyEur)}</bdi>
          </Row>
          <Row label={t.total}>
            <span className="font-semibold">
              <bdi dir="ltr">{formatEur(estimate.totalEur)}</bdi> ·{" "}
              <bdi dir="ltr">{formatIqdFromEur(estimate.totalEur)}</bdi>
            </span>
          </Row>
        </dl>
      ) : null}
      <p className="text-xs text-muted">{t.estimateNote}</p>
    </section>
  );
}
