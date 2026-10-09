import { CONTACT_EMAIL } from "@/lib/contact";

/** "pre <email> post" with the address as an isolated LTR mailto link. */
export function ContactNote({ pre, post, className = "", role = "alert" }: { pre: string; post: string; className?: string; role?: "alert" | "status" }) {
  return (
    <p role={role} className={`text-sm leading-relaxed text-clay ${className}`}>
      {pre}
      <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block py-1 font-medium text-pine underline underline-offset-4">
        <bdi dir="ltr">{CONTACT_EMAIL}</bdi>
      </a>
      {post}
    </p>
  );
}
