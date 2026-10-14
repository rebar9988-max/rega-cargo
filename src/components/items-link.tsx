import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ITEMS_COPY } from "@/lib/items-copy";

/** Link to /prohibited-items, shown next to every contents declaration and quote. */
export function ItemsLink({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  return (
    <Link to="/prohibited-items" className={`inline-flex min-h-12 items-center gap-2 text-sm font-medium text-pine underline underline-offset-4 ${className}`}>
      <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
      {ITEMS_COPY[lang].link}
    </Link>
  );
}
