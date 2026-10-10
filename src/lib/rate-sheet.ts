/**
 * The downloadable rate sheet (public/rl-cargo.pdf) is generated from this
 * data, which is computed from corridor.ts: the same modes, minimums,
 * surcharges, IQD rate and priceShipment() the app uses. Regenerate with
 * `npm run rate-sheet`; rate-sheet.test.ts fails if prices change and the PDF
 * was not regenerated (hash in rate-sheet.lock.json).
 */
import { NUM_LOCALE } from "./numbers.ts";
import { BRAND_ASSETS } from "./brand-assets.ts";
import {
  DESTS,
  DUTY_RULES,
  IQD_PER_EUR,
  IQD_RATE_UPDATED,
  MODES,
  ORIGINS,
  SAMPLE_BOX,
  iqdFromCents,
  priceShipment,
} from "./corridor.ts";
import { CONTACT_EMAIL } from "./contact.ts";

export function rateSheetData() {
  const origin = ORIGINS[0];
  const dest = DESTS[0];
  return {
    iqdPerEur: IQD_PER_EUR,
    iqdUpdated: IQD_RATE_UPDATED,
    contact: CONTACT_EMAIL,
    duty: DUTY_RULES,
    sample: { ...SAMPLE_BOX, origin: origin.id, dest: dest.id },
    modes: MODES.map((mode) => {
      const price = priceShipment({ mode, origin, dest, weightKg: SAMPLE_BOX.kg, l: SAMPLE_BOX.l, w: SAMPLE_BOX.w, h: SAMPLE_BOX.h });
      return {
        id: mode.id,
        perKgCents: Math.round(mode.perKg * 100),
        minCents: Math.round(mode.min * 100),
        days: mode.days,
        divisor: mode.divisor,
        sampleChargeable: price.chargeable,
        sampleCents: price.totalCents,
        sampleIqd: iqdFromCents(price.totalCents),
      };
    }),
    origins: ORIGINS.map((item) => ({ id: item.id, city: item.cityKu, country: item.countryKu, code: item.code, factor: item.factor })),
    dests: DESTS.map((item) => ({ id: item.id, city: item.cityKu, surchargeCents: Math.round(item.surcharge * 100) })),
  };
}

export type RateSheetData = ReturnType<typeof rateSheetData>;

/** Stable fingerprint of the sheet data (FNV-1a over the JSON). */
export function rateSheetHash(data: RateSheetData = rateSheetData()): string {
  let h = 0x811c9dc5;
  for (const ch of JSON.stringify(data)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

const eur = (cents: number) => `€${(cents / 100).toFixed(2)}`;
const iqd = (n: number) => `${n.toLocaleString(NUM_LOCALE)} IQD`;
const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MODE_COPY: Record<string, { name: string; blurb: string }> = {
  express: { name: "ئێکسپرێسی ئاسمانی", blurb: "کاتێک هەفتەیەک زۆر درەنگە." },
  economy: { name: "ئابووری ئاسمانی", blurb: "هەمان ڕێڕەوی ئاسمانی، نرخی ئارامتر." },
  road: { name: "وشکانی لە ڕێگەی تورکیا", blurb: "کاتێک ڕۆژژمێرەکە ڕێگە دەدات." },
};

/** Sorani A4 HTML for the PDF. `assets` is the base URL for the font and logo. */
export function rateSheetHtml(data: RateSheetData, assets: string): string {
  const origin = data.origins.find((item) => item.id === data.sample.origin)!;
  const dest = data.dests.find((item) => item.id === data.sample.dest)!;
  const ltr = (text: string) => `<bdi dir="ltr">${esc(text)}</bdi>`;
  const modeCards = data.modes
    .map((mode) => {
      const copy = MODE_COPY[mode.id];
      return `<div class="card">
        <h3>${esc(copy.name)}</h3>
        <p class="muted">${ltr(`${mode.days[0]}–${mode.days[1]}`)} ڕۆژ</p>
        <p class="big">${ltr(eur(mode.sampleCents))}</p>
        <p class="muted">${ltr(iqd(mode.sampleIqd))}</p>
        <table>
          <tr><td>نرخی هەر کیلۆ</td><td>${ltr(eur(mode.perKgCents))}</td></tr>
          <tr><td>کەمترین کرێ</td><td>${ltr(eur(mode.minCents))}</td></tr>
          <tr><td>کێشی قەبارەیی</td><td>${ltr(`L×W×H ÷ ${mode.divisor}`)}</td></tr>
        </table>
        <p class="muted small">${esc(copy.blurb)}</p>
      </div>`;
    })
    .join("");
  const origins = data.origins
    .map((item) => `<tr><td>${esc(item.city)}، ${esc(item.country)}</td><td>${ltr(item.code)}</td></tr>`)
    .join("");
  const dests = data.dests
    .map((item) => `<tr><td>${esc(item.city)}</td><td>${item.surchargeCents === 0 ? "دەروازە — لە ناو نرخەکەدایە" : ltr(`+${eur(item.surchargeCents)}`)}</td></tr>`)
    .join("");
  const duty = data.duty;
  return `<!doctype html>
<html lang="ckb" dir="rtl"><head><meta charset="utf-8"><title>R&amp;L</title>
<style>
@font-face { font-family: Vazirmatn; src: url("${assets}/fonts/vazirmatn-nl-v33.003.woff2") format("woff2"); font-weight: 100 900; }
@page { size: A4; margin: 12mm 14mm 12mm; }
* { box-sizing: border-box; }
body { font-family: Vazirmatn, sans-serif; color: #1b1b1b; font-size: 10.5pt; line-height: 1.6; margin: 0; }
header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #DB0100; padding-bottom: 8px; }
header img { width: 44px; height: 44px; object-fit: contain; }
.tag { direction: ltr; font: 600 8.5pt Vazirmatn, sans-serif; letter-spacing: .06em; color: #DB0100; }
h1 { font-size: 19pt; line-height: 1.3; margin: 10px 0 2px; }
h2 { font-size: 12.5pt; margin: 12px 0 6px; }
h3 { font-size: 11.5pt; margin: 0; }
.muted { color: #5b6470; margin: 2px 0; }
.small { font-size: 9pt; }
.big { font-size: 18pt; font-weight: 700; margin: 6px 0 0; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.card { border: 1px solid #E9ECEF; border-radius: 12px; padding: 12px; break-inside: avoid; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5pt; }
td { padding: 2px 0; border-top: 1px solid #E9ECEF; }
td:last-child { text-align: left; }
.box { border: 1px solid #C9CED6; border-radius: 12px; padding: 10px 12px; break-inside: avoid; }
footer { margin-top: 12px; border-top: 1px solid #E9ECEF; padding-top: 8px; font-size: 8.5pt; color: #5b6470; }
</style></head>
<body>
<header><div><div class="tag">MOVE SMART. DELIVER FAST.</div><div class="tag">EUROPE ↔ KURDISTAN ↔ IRAQ</div></div><img src="${assets}${BRAND_ASSETS.print}" alt="R&amp;L" width="44" height="44"></header>
<h1>لە دەرگایەکی ئەوروپییەوە بۆ دەرگایەکی کوردی.</h1>
<p class="muted">نرخەکان بە پێی کێشی حیسابکراو، بە یۆرۆ و دینار. هەمان ژمارەکانی ناو ئەپەکە.</p>

<h2>سێ ڕێگا. بێ پسوولەی چوارەمی شاراوە.</h2>
<p class="muted">نموونە: پاکەتێکی ${ltr(`${data.sample.kg} kg`)}، ${esc(origin.city)} ← ${esc(dest.city)}، سندووقی ${ltr(`${data.sample.l} × ${data.sample.w} × ${data.sample.h} cm`)} — کێشی حیسابکراو ${ltr(`${data.modes[0].sampleChargeable} kg`)}.</p>
<div class="cards">${modeCards}</div>

<div class="cols">
  <div><h2>کۆکردنەوە لە ئەوروپا</h2><table>${origins}</table></div>
  <div><h2>گەیاندن لە کوردستان و عێراق</h2><table>${dests}</table></div>
</div>

<h2>گومرگ</h2>
<div class="box">
  <p><strong>گومرگ: لەناو نرخەکەدا نییە، پێش وەرگرتنی بارەکە پشتڕاست دەکرێتەوە.</strong></p>
  <p class="muted">ڕێژەی پلاندانان، بڕیاری گومرگ نییە: بەڵگەنامە زۆرجار بێ باج. کەلوپەلی کەسی تا ${ltr(`€${duty.personalFreeEur}`)} زۆرجار بێ باج، لە سەرووی ئەوە نزیکەی ${ltr(`${Math.round(duty.personalRate * 100)}%`)}. باری بازرگانی نزیکەی ${ltr(`${Math.round(duty.commercialRate * 100)}%`)}.</p>
</div>

<footer>
  <p>دینار بە نرخی ${ltr(`1 € = ${data.iqdPerEur.toLocaleString(NUM_LOCALE)} IQD`)}، دوایین نوێکردنەوە ${ltr(data.iqdUpdated)}. نرخەکان بۆ پلاندانانن و پێش کۆکردنەوە پشتڕاست دەکرێنەوە.</p>
  <p>پەیوەندی: ${ltr(data.contact)} · © R&amp;L · ${ltr(`rate sheet ${rateSheetHash(data)}`)}</p>
</footer>
</body></html>`;
}
