import { useEffect, useId, useState } from "react";
import { btnPrimary, controlClass } from "@/components/field";
import { useI18n } from "@/lib/i18n";
import { emailOtpCopy, type EmailOtpCopy } from "@/lib/email-otp/copy";
import { RESEND_COOLDOWN_SECONDS } from "@/lib/email-otp/limits";

type Signed = { name: string; email: string };
type ErrorKey = keyof EmailOtpCopy["errors"];

/** Same-origin POST to the email-code endpoints; codes are generated and checked only on the server. */
/** Which entrance: the customer one, or the administrative one (same mechanics, own table). */
export type SignInEndpoint = "rl-email" | "rl-admin";

async function post(
  endpoint: SignInEndpoint,
  path: "send" | "verify",
  body: Record<string, string>,
) {
  try {
    const response = await fetch(`/api/auth/${endpoint}/${path}`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json().catch(() => null)) as {
      error?: string;
      sent?: boolean;
      ok?: boolean;
      name?: string;
      email?: string;
    } | null;
    if (response.status === 429) return { error: "rate" as const };
    return json ?? { error: "unavailable" as const };
  } catch {
    return { error: "unavailable" as const };
  }
}

/** Seconds a resend must wait. Shared with the server, which stays authoritative. */
const COOLDOWN = RESEND_COOLDOWN_SECONDS;

export function EmailSignIn({
  onUser,
  endpoint = "rl-email",
}: {
  onUser: (user: Signed) => void;
  /** The administrative entrance never creates an account, so it asks for no name. */
  endpoint?: SignInEndpoint;
}) {
  const asksForName = endpoint === "rl-email";
  const { lang } = useI18n();
  const t = emailOtpCopy(lang);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [wait, setWait] = useState(0);
  const errorId = useId();

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  function fail(key: string | undefined) {
    setError((key && key in t.errors ? key : "unavailable") as ErrorKey);
  }

  async function send(address: string) {
    setBusy(true);
    setError(null);
    const result = await post(endpoint, "send", { email: address, lang });
    setBusy(false);
    if ("sent" in result && result.sent) {
      setSentTo(address.trim().toLowerCase());
      setCode("");
      setWait(COOLDOWN);
      return;
    }
    if (result.error === "rate") setWait(COOLDOWN);
    fail(result.error);
  }

  async function verify() {
    if (!sentTo) return;
    setBusy(true);
    setError(null);
    const result = await post(
      endpoint,
      "verify",
      asksForName ? { email: sentTo, code, name } : { email: sentTo, code },
    );
    setBusy(false);
    if ("ok" in result && result.ok && result.email) {
      onUser({ name: result.name ?? "", email: result.email });
      return;
    }
    fail(result.error);
  }

  const message = error ? (
    <p id={errorId} role="alert" className="text-sm text-clay">
      {t.errors[error]}
    </p>
  ) : null;

  if (!sentTo)
    return (
      <form
        className="flex flex-col gap-4 px-5 py-6"
        onSubmit={(event) => {
          event.preventDefault();
          void send(email);
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          placeholder="name@example.com"
          aria-label={t.email}
          aria-invalid={error === "email" || undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${controlClass} text-start`}
        />
        {message}
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className={`${btnPrimary} h-12 w-full rounded-2xl`}
        >
          {busy ? t.sending : t.send}
        </button>
      </form>
    );

  return (
    <form
      className="flex flex-col gap-3 px-5 py-6"
      onSubmit={(event) => {
        event.preventDefault();
        void verify();
      }}
    >
      <p className="text-sm text-muted">
        {t.sentTo}{" "}
        <bdi dir="ltr" className="font-medium text-ink">
          {sentTo}
        </bdi>
      </p>
      <input
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        dir="ltr"
        autoComplete="one-time-code"
        autoFocus
        required
        pattern="\d{6}"
        placeholder={t.code}
        aria-label={t.code}
        aria-invalid={error === "code" || error === "expired" || undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${controlClass} text-center font-sans text-2xl tracking-[0.4em]`}
      />
      {asksForName ? (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          maxLength={40}
          placeholder={t.name}
          aria-label={t.name}
          className={controlClass}
        />
      ) : null}
      <p className="text-xs text-muted">{t.expiry}</p>
      {message}
      <button type="submit" disabled={busy || code.length !== 6} className={`${btnPrimary} w-full`}>
        {busy ? t.verifying : t.verify}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={busy || wait > 0}
          className="min-h-11 text-sm font-semibold underline disabled:no-underline disabled:opacity-50"
          onClick={() => void send(sentTo)}
        >
          {wait > 0 ? t.resendIn.replace("{s}", String(wait)) : t.resend}
        </button>
        <button
          type="button"
          className="min-h-11 text-sm text-muted"
          onClick={() => {
            setSentTo(null);
            setCode("");
            setError(null);
          }}
        >
          {t.change}
        </button>
      </div>
    </form>
  );
}
