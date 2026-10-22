import { createFileRoute } from "@tanstack/react-router";
import { EmailSignIn } from "@/components/email-sign-in";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { adminSignInCopy } from "@/lib/admin/sign-in-copy";
import { seo } from "@/lib/seo";

/**
 * The administrative entrance. An approved administrator signs in with a code sent to the
 * address already verified on their account — no invitation link, and no password, which
 * accounts created through email sign-in do not have.
 *
 * The server decides everything: `/api/auth/rl-admin/*` issues a code only for an approved,
 * verified, enabled administrative account, answers the same for every other address, and
 * opens a session for nobody else. This page only shows the form.
 */
export const Route = createFileRoute("/dr")({
  head: () => seo({ path: "/dr", title: "R&L", description: "R&L", noindex: true }),
  component: AdminEntrance,
});

function AdminEntrance() {
  const { lang } = useI18n();
  const t = adminSignInCopy(lang);
  return (
    <Shell>
      <PageHeader kicker="R&L" title={t.title} lede={t.lede} />
      <section className="mx-auto flex max-w-lg flex-col gap-5 px-[var(--gutter)] py-10">
        <EmailSignIn
          endpoint="rl-admin"
          onUser={() => window.location.assign(`/admin?lang=${lang}`)}
        />
      </section>
    </Shell>
  );
}
