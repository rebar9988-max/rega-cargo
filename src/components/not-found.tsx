import { Link } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { useI18n } from "@/lib/i18n";
import { PAGES_COPY } from "@/lib/pages-copy";

export function NotFound() {
  const { lang } = useI18n();
  const copy = PAGES_COPY[lang];
  return (
    <Shell>
      <PageHeader kicker="404" title={copy.notFoundTitle} lede={copy.notFoundBody} />
      <div className="page py-10">
        <Link to="/" className="rl-grad inline-flex h-11 items-center rounded-full px-5 text-sm font-medium">
          {copy.home}
        </Link>
      </div>
    </Shell>
  );
}
