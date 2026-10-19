import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shell, PageHeader } from "@/components/shell";
import { Field, btnPrimary, btnGhost, controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useHydrated } from "@/lib/use-hydrated";
import { ownerCopy } from "@/lib/owner/copy";
import { activateFirstOwner, inspectOwnerInvitation } from "@/lib/owner/api";
import { authClient, signOut } from "@/lib/auth/client";

export const Route = createFileRoute("/owner")({
  head: () => seo({ path: "/owner", title: "R&L", description: "R&L", noindex: true }),
  component: OwnerPage,
});
function OwnerPage() {
  const { lang } = useI18n();
  const t = ownerCopy(lang);
  const ready = useHydrated();
  const [token, setToken] = useState("");
  const [ticket, setTicket] = useState<{ email: string; existing: boolean } | null>(null);
  const [state, setState] = useState<"login" | "checking" | "invalid" | "ready">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const secret = new URLSearchParams(window.location.hash.slice(1)).get("invite");
    if (!secret) return;
    // Keep the nonce only in memory, never storage, history, query strings or telemetry.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setToken(secret);
    setState("checking");
    void inspectOwnerInvitation({ data: { token: secret } })
      .then((result) => {
        if (!result.valid) {
          setState("invalid");
          return;
        }
        setTicket(result);
        setEmail(result.email);
        setState("login");
      })
      .catch(() => setState("invalid"));
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(false);
    try {
      if (ticket) {
        const result = await activateFirstOwner({ data: { token, name: name || "R&L", password } });
        if (!result.activated) throw new Error();
        setToken("");
        setTicket(null);
        setState("ready");
      } else {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error();
        window.location.assign(`/admin?lang=${lang}`);
      }
    } catch {
      setError(true);
    } finally {
      setPassword("");
      setBusy(false);
    }
  }
  return (
    <Shell>
      <PageHeader kicker="R&L" title={t.title} lede={t.intro} />
      <section className="mx-auto flex max-w-lg flex-col gap-5 px-[var(--gutter)] py-10">
        {state === "checking" ? (
          <p role="status">{t.checking}</p>
        ) : state === "invalid" ? (
          <p role="alert">{t.invalid}</p>
        ) : state === "ready" ? (
          <>
            <p role="status">{t.ready}</p>
            <a className={btnPrimary} href={`/admin?lang=${lang}`}>
              {t.dashboard}
            </a>
            <button
              className={btnGhost}
              onClick={async () => {
                try {
                  await signOut(`/owner?lang=${lang}`);
                } catch {
                  setError(true);
                }
              }}
            >
              {t.signOut}
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-5">
            <p className="text-sm text-muted">
              {ticket?.existing ? t.existing : !ticket ? t.loginHint : t.passwordHint}
            </p>
            <Field label={t.email}>
              <input
                className={controlClass}
                disabled={!ready || busy}
                type="email"
                autoComplete="username"
                dir="ltr"
                required
                value={email}
                readOnly={Boolean(ticket)}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {ticket && !ticket.existing ? (
              <Field label={t.name}>
                <input
                  className={controlClass}
                  disabled={!ready || busy}
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            ) : null}
            <Field label={t.password} hint={t.passwordHint}>
              <input
                className={controlClass}
                disabled={!ready || busy}
                type="password"
                autoComplete={ticket && !ticket.existing ? "new-password" : "current-password"}
                dir="ltr"
                required
                minLength={ticket && !ticket.existing ? 16 : 1}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error ? <p role="alert">{t.failed}</p> : null}
            <button type="submit" className={btnPrimary} disabled={!ready || busy}>
              {ticket ? t.activate : t.signIn}
            </button>
          </form>
        )}
      </section>
    </Shell>
  );
}
