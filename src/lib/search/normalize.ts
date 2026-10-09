/**
 * Search folding shared by every language. One input character becomes zero or
 * more output characters, and `map[i]` records which original character produced
 * output position i, so a match can be highlighted in the original text.
 *
 * - Latin: lower case, accents removed (é→e, ü→u, ş→s, ı→i), ß→ss.
 * - Arabic script: Arabic/Persian/Kurdish letter variants folded together
 *   (ي/ى/ی/ێ, ك/ک, ه/ة/ە, و/ۆ/ؤ, ل/ڵ, ر/ڕ, ف/ڤ, alef forms), harakat,
 *   tatweel removed; the Kurdish vowel carrier ئ (and ئە) read as ا, so
 *   ئەمازۆن, أمازون and امازون fold the same.
 * - Eastern Arabic and Persian digits become 0-9.
 * - Punctuation, ZWNJ and whitespace collapse to a single space.
 */
const LETTERS: Record<string, string> = {
  "\u064A": "\u06CC", // ي
  "\u0649": "\u06CC", // ى
  "\u06CE": "\u06CC", // ێ
  "\u0643": "\u06A9", // ك
  "\u0629": "\u0647", // ة
  "\u06D5": "\u0647", // ە
  "\u06C6": "\u0648", // ۆ
  "\u0624": "\u0648", // ؤ
  "\u06B5": "\u0644", // ڵ
  "\u0695": "\u0631", // ڕ
  "\u06A4": "\u0641", // ڤ
  "\u0623": "\u0627", // أ
  "\u0625": "\u0627", // إ
  "\u0622": "\u0627", // آ
  "\u0671": "\u0627", // ٱ
  "\u0626": "\u0627", // ئ (Kurdish vowel carrier, read like a bare alef)
  "\u0621": "", // ء
  "\u0640": "", // tatweel
  "\u0131": "i", // ı
  "\u00DF": "ss", // ß
  "\u00E6": "ae",
  "\u0153": "oe",
  "\u00F8": "o",
  "\u0142": "l",
  "&": " ",
};

const MARKS = /[\u0300-\u036f\u064B-\u065F\u0670\u06E1-\u06ED]/;
const SEPARATORS = new Set([
  "\u200C", "\u200D", "\u00A0", "\u060C", "\u061B", "\u061F", "\u066B", "\u066C", "\u06D4",
  "\u00AB", "\u00BB", "\u201C", "\u201D", "'", "\u2019", "`", '"', ".", ",", ":", ";", "!", "?",
  "(", ")", "[", "]", "{", "}", "-", "_", "/", "\\", "|", "+", "*", "#", "@", "%", "^", "~", "<", ">", "=", "&",
]);
const isSeparator = (ch: string) => /\s/.test(ch) || SEPARATORS.has(ch);

function digit(ch: string): string | null {
  const code = ch.charCodeAt(0);
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
  if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
  return null;
}

export type Folded = { text: string; map: number[] };

export function foldWithMap(input: string): Folded {
  let text = "";
  const map: number[] = [];
  let lastSpace = true;
  let afterCarrier = false;
  for (let i = 0; i < input.length; i += 1) {
    const raw = input[i];
    const carrier = afterCarrier;
    afterCarrier = raw === "\u0626";
    // ئە → ا, and never two alefs in a row (ئا → ا).
    if (carrier && raw === "\u06D5") continue;
    if (raw === "\u0627" || raw === "\u0623" || raw === "\u0625" || raw === "\u0622") {
      if (text.endsWith("\u0627") && carrier) continue;
    }
    if (isSeparator(raw)) {
      if (!lastSpace) {
        text += " ";
        map.push(i);
        lastSpace = true;
      }
      continue;
    }
    const d = digit(raw);
    let out: string;
    if (d !== null) out = d;
    else if (raw in LETTERS) out = LETTERS[raw];
    else {
      out = "";
      for (const part of raw.normalize("NFKD").toLowerCase()) {
        if (MARKS.test(part)) continue;
        out += part in LETTERS ? LETTERS[part] : part;
      }
    }
    for (const ch of out) {
      if (ch === " ") {
        if (lastSpace) continue;
        lastSpace = true;
      } else lastSpace = false;
      text += ch;
      map.push(i);
    }
  }
  if (text.endsWith(" ")) {
    text = text.slice(0, -1);
    map.pop();
  }
  return { text, map };
}

export function fold(input: string): string {
  return foldWithMap(input).text;
}

/** Optimal string alignment distance, stopping early once it exceeds `max`. */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i += 1) {
    rows.push([i]);
  }
  for (let j = 1; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      rows[i][j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/** Typos allowed for a query token of this length. */
export function typoBudget(length: number): number {
  if (length >= 7) return 2;
  if (length >= 4) return 1;
  return 0;
}
