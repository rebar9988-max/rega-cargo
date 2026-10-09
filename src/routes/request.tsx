import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { seo } from "@/lib/seo";
import { btnGhost, btnPrimary, controlClass, Field } from "@/components/field";
import { PageHeader, Shell } from "@/components/shell";
import { SignInGate } from "@/components/sign-in-gate";
import { RequestHelp } from "@/components/request-bits";
import { useI18n } from "@/lib/i18n";
import { viewerState } from "@/lib/viewer/api";
import { DESTS, ORIGINS, countryName, placeName } from "@/lib/corridor";
import { DECLARE_COPY } from "@/lib/declare-copy";
import { REQUEST_COPY } from "@/lib/requests/copy";
import { LIMITS, type Flow } from "@/lib/requests/validate";
import { requestCreate } from "@/lib/requests/api";

export const Route = createFileRoute("/request")({
  validateSearch: (search: Record<string, unknown>): { flow: Flow } => ({
    flow: search.flow === "forward" ? "forward" : "buy",
  }),
  loader: async () => {
    const { state } = await viewerState();
    return { gate: state === "in" ? null : state };
  },
  head: () =>
    seo({
      path: "/request",
      title: "داواکاری نوێ · R&L",
      description:
        "بۆم بکڕە، یان ئەوەی کڕیوتە بۆت دەنێرین. نرخ لە تیمەکەمان دێت و تۆ پەسەندی دەکەیت.",
      noindex: true,
    }),
  component: RequestPage,
});

function newKey() {
  return crypto.randomUUID();
}

function RequestPage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const t = REQUEST_COPY[lang];
  if (data.gate) return <SignInGate state={data.gate} kicker={t.kicker} />;
  return <RequestForm />;
}

function RequestForm() {
  const { flow } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { lang } = useI18n();
  const t = REQUEST_COPY[lang];
  const declare = DECLARE_COPY[lang];
  const [form, setForm] = useState({
    link: "",
    description: "",
    qty: "1",
    origin: ORIGINS[0].id,
    originNote: "",
    dest: DESTS[0].id,
    weightKg: "",
    l: "",
    w: "",
    h: "",
    a1: "",
    a2: "",
    a3: "",
    notes: "",
  });
  const [declared, setDeclared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  // One key per filled-in form: a double tap or a retry returns the same request.
  const key = useRef(newKey());
  const inFlight = useRef(false);
  const set = (name: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [name]: event.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (inFlight.current) return;
    if (!declared) {
      setError(t.err.declare);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestCreate({
        data: {
          ...form,
          flow,
          attachments: [form.a1, form.a2, form.a3].filter(Boolean),
          declared: true,
          key: key.current,
        },
      });
      if ("id" in result && result.id) {
        setSaved(result.id);
        key.current = newKey();
      } else {
        const code = "error" in result ? String(result.error) : "unavailable";
        setError(t.err[code] ?? t.err.invalid);
      }
    } catch {
      setError(t.err.unavailable);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const tabs: [Flow, string][] = [
    ["buy", t.newBuy],
    ["forward", t.newForward],
  ];

  return (
    <Shell>
      <PageHeader
        kicker={t.kicker}
        title={flow === "buy" ? t.buyTitle : t.forwardTitle}
        lede={flow === "buy" ? t.buyLede : t.forwardLede}
      />
      <div className="page flex flex-col gap-6 py-10">
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={flow === id}
              className={flow === id ? btnPrimary : btnGhost}
              onClick={() => {
                setSaved(null);
                setError("");
                void navigate({ search: { flow: id }, replace: true });
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {saved ? (
          <div
            role="status"
            className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6"
          >
            <p className="text-base">
              {t.saved}{" "}
              <bdi dir="ltr" className="font-bold tabular-nums">
                {saved}
              </bdi>
            </p>
            <p className="text-sm text-muted">{t.acceptNote}</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/account/$ref" params={{ ref: saved }} className={btnPrimary}>
                {t.view}
              </Link>
              <button type="button" className={btnGhost} onClick={() => setSaved(null)}>
                {t.another}
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={submit}
            className="grid max-w-3xl gap-5 rounded-2xl border border-line bg-surface p-5 md:p-6"
          >
            {flow === "buy" ? (
              <Field label={t.link} hint={t.linkHint}>
                <input
                  className={controlClass}
                  dir="ltr"
                  type="url"
                  inputMode="url"
                  maxLength={LIMITS.link}
                  value={form.link}
                  onChange={set("link")}
                />
              </Field>
            ) : null}
            <Field label={flow === "buy" ? t.descBuy : t.descForward}>
              <textarea
                className={`${controlClass} h-24 py-3`}
                maxLength={LIMITS.desc}
                value={form.description}
                onChange={set("description")}
                required={flow === "forward"}
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label={t.qty}>
                <input
                  className={controlClass}
                  dir="ltr"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={LIMITS.qtyMax}
                  step={1}
                  value={form.qty}
                  onChange={set("qty")}
                />
              </Field>
              <Field label={t.origin}>
                <select className={controlClass} value={form.origin} onChange={set("origin")}>
                  {ORIGINS.map((place) => (
                    <option key={place.id} value={place.id}>
                      {placeName(place, lang)} · {countryName(place, lang)}
                    </option>
                  ))}
                  <option value="other">{t.originOther}</option>
                </select>
              </Field>
              <Field label={t.dest}>
                <select className={controlClass} value={form.dest} onChange={set("dest")}>
                  {DESTS.map((place) => (
                    <option key={place.id} value={place.id}>
                      {placeName(place, lang)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {form.origin === "other" ? (
              <Field label={t.originNote}>
                <input
                  className={controlClass}
                  maxLength={LIMITS.originNote}
                  value={form.originNote}
                  onChange={set("originNote")}
                />
              </Field>
            ) : null}
            <Field label={t.weight}>
              <input
                className={controlClass}
                dir="ltr"
                type="text"
                inputMode="decimal"
                maxLength={7}
                value={form.weightKg}
                onChange={set("weightKg")}
              />
            </Field>
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-2 font-medium text-ink">{t.dims}</legend>
              <div className="grid grid-cols-3 gap-3">
                {(["l", "w", "h"] as const).map((side) => (
                  <input
                    key={side}
                    aria-label={`${t.dims} ${side.toUpperCase()}`}
                    className={controlClass}
                    dir="ltr"
                    type="text"
                    inputMode="decimal"
                    maxLength={6}
                    value={form[side]}
                    onChange={set(side)}
                  />
                ))}
              </div>
            </fieldset>
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-2 font-medium text-ink">{t.attachments}</legend>
              {(["a1", "a2", "a3"] as const).map((name, index) => (
                <input
                  key={name}
                  aria-label={`${t.attachments} ${index + 1}`}
                  className={controlClass}
                  dir="ltr"
                  type="url"
                  inputMode="url"
                  maxLength={LIMITS.link}
                  value={form[name]}
                  onChange={set(name)}
                />
              ))}
              <span className="text-muted">{t.attachHint}</span>
            </fieldset>
            <Field label={t.notes}>
              <textarea
                className={`${controlClass} h-24 py-3`}
                maxLength={LIMITS.notes}
                value={form.notes}
                onChange={set("notes")}
              />
            </Field>
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 accent-[var(--color-pine)]"
                checked={declared}
                onChange={(event) => setDeclared(event.target.checked)}
              />
              <span>{declare.declare}</span>
            </label>
            <div aria-live="polite">
              {error ? (
                <p role="alert" className="text-sm text-clay">
                  {error}
                </p>
              ) : null}
            </div>
            <p className="text-sm text-muted">{t.acceptNote}</p>
            <button type="submit" className={btnPrimary} disabled={busy} aria-busy={busy}>
              {busy ? t.sending : t.submit}
            </button>
          </form>
        )}
        <RequestHelp t={t} />
      </div>
    </Shell>
  );
}
