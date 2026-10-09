import { useRouter } from "@tanstack/react-router";
import { PhoneButton } from "@/components/phone-gate";
import { PageHeader, Shell } from "@/components/shell";
import { CONTACT_EMAIL } from "@/lib/contact";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/langs";
import type { ViewerState } from "@/lib/viewer/api";

const COPY: Record<Lang, { out: string; outBody: string; off: string; offBody: string }> = {
  ckb: {
    out: "سەرەتا بچۆ ژوورەوە",
    outBody: "بۆ بەکارهێنانی ئەم پەڕەیە بە ژمارەی مۆبایلەکەت بچۆ ژوورەوە.",
    off: "هێشتا ئامادە نییە",
    offBody: "هەژمارەکان هێشتا نەکراونەتەوە. بۆ داواکاری ئیمەیڵ بنێرە:",
  },
  ku: {
    out: "Pêşî têkeve",
    outBody: "Ji bo vê rûpelê bi hejmara xwe ya telefonê têkeve.",
    off: "Hê ne amade ye",
    offBody: "Hesab hê nehatine vekirin. Ji bo daxwazê e-name bişîne:",
  },
  ar: {
    out: "سجّل الدخول أولاً",
    outBody: "سجّل الدخول برقم هاتفك لاستخدام هذه الصفحة.",
    off: "غير متاح بعد",
    offBody: "الحسابات غير مفتوحة بعد. للطلبات راسلنا على:",
  },
  fa: {
    out: "اول وارد شوید",
    outBody: "برای استفاده از این صفحه با شماره تلفن خود وارد شوید.",
    off: "هنوز آماده نیست",
    offBody: "حساب‌ها هنوز باز نشده‌اند. برای درخواست ایمیل بزنید:",
  },
  de: {
    out: "Bitte zuerst anmelden",
    outBody: "Melde dich mit deiner Telefonnummer an, um diese Seite zu nutzen.",
    off: "Noch nicht verfügbar",
    offBody: "Konten sind noch nicht geöffnet. Anfragen per E-Mail an:",
  },
  tr: {
    out: "Önce giriş yapın",
    outBody: "Bu sayfayı kullanmak için telefon numaranızla giriş yapın.",
    off: "Henüz hazır değil",
    offBody: "Hesaplar henüz açık değil. Talepler için e-posta:",
  },
  en: {
    out: "Sign in first",
    outBody: "Sign in with your phone number to use this page.",
    off: "Not available yet",
    offBody: "Accounts are not open yet. For requests, email:",
  },
};

export function SignInGate({ state, kicker }: { state: Exclude<ViewerState, "in">; kicker: string }) {
  const { lang } = useI18n();
  const router = useRouter();
  const t = COPY[lang] ?? COPY.en;
  const off = state === "unavailable";
  return (
    <Shell>
      <PageHeader kicker={kicker} title={off ? t.off : t.out} lede={off ? t.offBody : t.outBody} />
      <div className="mx-auto max-w-md px-[var(--gutter)] py-10">
        {off ? (
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-11 items-center font-sans text-base font-semibold underline" dir="ltr">
            {CONTACT_EMAIL}
          </a>
        ) : (
          <PhoneButton variant="block" onUser={(user) => (user ? void router.invalidate() : undefined)} />
        )}
      </div>
    </Shell>
  );
}
