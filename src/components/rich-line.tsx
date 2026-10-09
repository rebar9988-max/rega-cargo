import { splitLeadIns } from "@/lib/lead-in";

/** Leading code/email/ID token isolated as LTR; the rest flows in the page direction. */
function Value({ text }: { text: string }) {
  // Isolate up to the last letter/digit so trailing punctuation follows the page direction.
  const match = text.match(/^([\x21-\x7e]*[A-Za-z0-9])([\s\S]*)$/);
  if (!match || !/[a-z0-9]/i.test(match[1])) return <>{text}</>;
  return (
    <>
      <bdi dir="ltr">{match[1]}</bdi>
      {match[2]}
    </>
  );
}

/**
 * One line of copy, rendered like the reference: bold lead-in label + regular text.
 * Two or more "Label: value." pairs become a list; a single label becomes an inline lead-in.
 */
export function RichLine({ text, className = "" }: { text: string; className?: string }) {
  const { lead, items, rest } = splitLeadIns(text);
  if (items.length >= 2) {
    return (
      <div className={`flex flex-col gap-2 wrap-anywhere ${className}`}>
        {lead ? <p>{lead}</p> : null}
        <ul dir="auto" className="flex flex-col gap-1.5 ps-5 [list-style:disc] marker:text-pine">
          {items.map((item) => (
            <li key={item.label}>
              <strong className="font-bold text-ink">{item.label}:</strong> <Value text={item.text} />
            </li>
          ))}
        </ul>
        {rest ? <p>{rest}</p> : null}
      </div>
    );
  }
  if (items.length === 1) {
    const [item] = items;
    return (
      <p className={`wrap-anywhere ${className}`}>
        {lead ? `${lead} ` : null}
        <strong className="font-bold text-ink">{item.label}:</strong> <Value text={item.text} />
        {rest ? ` ${rest}` : null}
      </p>
    );
  }
  return <p className={className}>{text}</p>;
}
