import { useEffect, useState } from "react";
import { btnPrimary, controlClass } from "@/components/field";
import { gateFields } from "@/lib/ai/gate-client";
import { emailBegin, emailCheck } from "@/lib/email-auth/api";
import type { EmailAuthCopy } from "@/lib/email-auth/copy";

type ErrorKey = keyof EmailAuthCopy["errors"];

function errorKey(value: unknown): ErrorKey {
  const known: ErrorKey[] = ["email", "wrong", "rate", "cooldown", "invalid", "name", "forbidden", "gate", "unavailable"];
  return known.includes(value as ErrorKey) ? (value as ErrorKey) : "unavailable";
}

/** Email one-time-code sign-in / registration. Same account session as phone sign-in. */
export function EmailSignIn({
  t,
  onUser,
}: {
  t: EmailAuthCopy;
  onUser: (user: { name: string; email: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [needName, setNeedName] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  async function send(address: string) {
    setBusy(true);
    setError("");
    try {
      const gate = await gateFields();
      const result = await emailBegin({ data: { email: address, ...gate } });
      if ("error" in result && result.error) {
        if (result.error === "cooldown") setWait("retryAfter" in result ? Number(result.retryAfter) || 60 : 60);
        setError(t.errors[errorKey(result.error)]);
        return;
      }
      if ("sent" in result && result.sent) {
        setSentTo(result.email);
        setCode("");
        setWait(result.resendIn);
      } else setError(t.errors.unavailable);
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!sentTo) return;
    if (!/^[0-9]{6}$/.test(code)) {
      setError(t.errors.invalid);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await emailCheck({ data: { email: sentTo, code, name: needName ? name : "" } });
      if ("needName" in result && result.needName) {
        setNeedName(true);
        return;
      }
      if ("error" in result && result.error) {
        setError(t.errors[errorKey(result.error)]);
        return;
      }
      if ("name" in result && result.name && "email" in result && result.email)
        onUser({ name: result.name, email: result.email });
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  }

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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          inputMode="email"
          dir="ltr"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="name@example.com"
          aria-label={t.email}
          className={controlClass}
        />
        {error ? (
          <p role="alert" className="text-sm text-clay">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy || wait > 0} aria-busy={busy} className={`${btnPrimary} h-12 w-full rounded-2xl`}>
          {wait > 0 ? t.resendIn.replace("{s}", String(wait)) : t.send}
        </button>
      </form>
    );

  const [before, after] = t.sent.split("{email}");
  return (
    <form
      className="flex flex-col gap-3 px-5 py-6"
      onSubmit={(event) => {
        event.preventDefault();
        void verify();
      }}
    >
      <p role="status" className="text-sm text-muted">
        {before}
        <bdi dir="ltr">{sentTo}</bdi>
        {after}
      </p>
      <p className="text-sm text-muted">{t.spam}</p>
      <input
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        dir="ltr"
        autoComplete="one-time-code"
        placeholder={t.code}
        aria-label={t.code}
        className={`${controlClass} text-center font-sans text-2xl tracking-[0.4em]`}
      />
      {needName ? (
        <>
          <p className="text-sm">{t.needName}</p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            maxLength={40}
            placeholder={t.name}
            aria-label={t.name}
            className={controlClass}
          />
        </>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-clay">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={busy} aria-busy={busy} className={`${btnPrimary} w-full`}>
        {needName ? t.register : t.verify}
      </button>
      <button type="button" disabled={busy || wait > 0} className="text-sm text-muted disabled:opacity-60" onClick={() => void send(sentTo)}>
        {wait > 0 ? t.resendIn.replace("{s}", String(wait)) : t.resend}
      </button>
      <button
        type="button"
        className="text-sm text-muted"
        onClick={() => {
          setSentTo(null);
          setNeedName(false);
          setCode("");
          setError("");
        }}
      >
        {t.change}
      </button>
    </form>
  );
}
