/**
 * Splits copy like "Language: rl-lang-v4. Saved quotes: rl-held-v1. Free text." into
 * labelled items (bold lead-in + regular text) and the trailing plain text.
 * Only short labels (≤ 32 chars, no sentence punctuation) count, so ordinary sentences
 * containing a colon are left alone.
 */
export type LeadItem = { label: string; text: string };
export type LeadParts = { lead: string; items: LeadItem[]; rest: string };

const LABEL = /^([^.:؛،!?؟\n]{1,32}):\s+([\s\S]*)$/u;

export function splitLeadIns(line: string): LeadParts {
  const parts = line.split(/(?<=[.)])\s+(?=[^.:؛!?؟\n]{1,32}:\s)/u);
  const items: LeadItem[] = [];
  let lead = "";
  let rest = "";
  for (const part of parts) {
    const match = rest ? null : part.match(LABEL);
    if (!match) {
      if (items.length) rest = rest ? `${rest} ${part}` : part;
      else lead = lead ? `${lead} ${part}` : part;
      continue;
    }
    // The value ends at the first sentence break; anything after it is trailing text.
    const value = match[2];
    const cut = value.search(/\.\s+/u);
    if (cut >= 0) {
      items.push({ label: match[1].trim(), text: value.slice(0, cut + 1).trim() });
      rest = value.slice(cut + 1).trim();
    } else {
      items.push({ label: match[1].trim(), text: value.trim() });
    }
  }
  return { lead, items, rest };
}
