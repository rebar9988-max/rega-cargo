import { test } from "node:test";
import assert from "node:assert/strict";
import { checkProduct, checkText, isProhibitedQuery, normalizeText } from "./check.ts";

const d = (s: string) => checkText(s).decision;

test("clear prohibited words block, in every language", () => {
  for (const s of [
    "Vodka 0.7l",
    "Absolut VODKA",
    "Red wine 75cl",
    "Craft beers pack",
    "Bacon strips",
    "Pork belly",
    "Marlboro cigarettes",
    "Disposable vape 600 puffs",
    "E-Liquid 10ml",
    "Poker chips set",
    "sex toys",
    "خمر",
    "الخمر",
    "والخمر",
    "بالخمر",
    "بيرة",
    "سجائر",
    "لحم الخنزير",
    "كازينو",
    "جگەرە",
    "جگەرەکان",
    "بیرە",
    "گۆشتی بەراز",
    "قومار",
    "sigara",
    "sigaralar",
    "şarap",
    "votka",
    "domuz eti",
    "سیگار",
    "قلیان",
    "آبجو",
    "Bier",
    "Wodka",
    "Zigaretten",
    "Schweinefleisch",
    "Glücksspiel",
  ])
    assert.equal(d(s), "block", s);
});

test("Arabic/Kurdish letter variants and diacritics fold", () => {
  assert.equal(d("بيره"), "block"); // ة written as ه
  assert.equal(d("بیرە"), "block"); // Kurdish ی / ە
  assert.equal(d("خَمْر"), "block"); // harakat
  assert.equal(d("خـــمر"), "block"); // tatweel
  assert.equal(d("كازينو"), d("کازینو"));
  assert.equal(d("VÓDKA"), "block");
  assert.equal(d("ｖｏｄｋａ"), "block"); // NFKC full-width
  assert.equal(normalizeText("أإآا"), "اااا");
});

test("no false positives (decisions in progress.md)", () => {
  for (const s of [
    "Ginger tea",
    "Ginger shot",
    "Hammer drill",
    "Hamburg",
    "Rummikub family game",
    "rummy cards",
    "Ginkgo biloba",
    "Gingerbread",
    "Hamster cage",
    "Champion shoes",
    "Portable fan",
    "Sakura cream",
    "Wine red dress",
    "Ham radio kit",
    "For the sake of comfort",
    "Nivea Creme",
    "Speckled mug",
    "Taschen",
    "Lagerfeld perfume",
    "Rumford baking powder",
    "Origin T-shirt",
    "Begin here",
    "Engine oil",
    "Sunglasses",
    "برهان",
    "مزيل عرق",
    "شامپۆ",
    "بیرەوەری",
    "ئارەق",
    "Sextant",
  ])
    assert.equal(d(s), "allow", s);
  // "Gin" as a word is blocked; inside names it is not (decision: a product literally called
  // "Gin ..." is rejected, e.g. "Gin Lane bag", because a whole-word match cannot tell them apart).
  for (const s of ["Ginny doll", "Gina dress", "Ginza bag", "Virginia tea", "Engineering kit"]) {
    assert.equal(d(s), "allow", s);
  }
  assert.equal(d("Gin Lane bag"), "block");
  assert.equal(d("Gin Tonic"), "block");
  assert.equal(d("Gingko / Ginseng / Original"), "allow");
});

test("ambiguous wording goes to review, not reject", () => {
  assert.equal(d("Alcohol wipes 70%"), "review");
  assert.equal(d("Turkish porcelain tabak set"), "review");
  assert.equal(d("Gelatin capsules"), "review");
  assert.equal(d("Alcohol-free beer"), "review");
  assert.equal(d("Non-alcoholic wine"), "review");
  assert.equal(d("Malzbier 0.0%"), "allow"); // no prohibited word at all
  assert.equal(d("Beer 0,0 %"), "review");
  assert.equal(d("بيرة بدون كحول"), "review");
  assert.equal(d("بیرە بێ ئەلکهول"), "review");
  assert.equal(d("alkoholfrei Bier"), "review");
});

test("products: every field is checked, category mapping applies", () => {
  assert.equal(
    checkProduct({ title: "Gift box", description: "with a bottle of whisky" }).decision,
    "block",
  );
  assert.equal(checkProduct({ title: "Gift box", tags: ["party", "vodka"] }).decision, "block");
  assert.equal(
    checkProduct({ title: "Gift box", brand: "Jack Daniel's whiskey" }).decision,
    "block",
  );
  assert.equal(
    checkProduct({ title: "Gift box", attributes: { flavour: "rum" } }).decision,
    "block",
  );
  assert.equal(checkProduct({ title: "Leather case", category: "Tabakwaren" }).decision, "block");
  assert.equal(
    checkProduct({ title: "Gift set", category: "Wein & Spirituosen" }).decision,
    "block",
  );
  assert.equal(checkProduct({ title: "Massager", category: "Sexual Wellness" }).decision, "block");
  assert.equal(
    checkProduct({ title: "Nivea Soft", brand: "Nivea", category: "beauty" }).decision,
    "allow",
  );
  const r = checkProduct({ title: "ok", description: "contains pork" });
  assert.equal(r.matches[0]?.field, "description");
  assert.equal(r.matches[0]?.category, "pork");
});

test("search queries: any prohibited word (block or review) means no results", () => {
  for (const q of ["vodka", "جگەرە", "sigara", "خمر", "alcohol", "cheap beer near me"])
    assert.ok(isProhibitedQuery(q), q);
  for (const q of ["nivea", "ginger", "hamburg", "rossmann", "dm", "douglas", "iphone"])
    assert.ok(!isProhibitedQuery(q), q);
});

test("percent-encoded product names in links are still blocked", () => {
  const link = (slug: string) => `https://www.amazon.de/${slug}/dp/B08N5WRWNW`;
  for (const slug of [
    "Absolut%20Vodka%200,7l",
    "%56%6F%64%6B%61",
    "%2556%256F%2564%256B%2561",
    encodeURIComponent("فودكا"),
    encodeURIComponent("جگەرە"),
    encodeURIComponent("لحم الخنزير"),
  ])
    assert.equal(d(link(slug)), "block", slug);
  assert.equal(d("https://www.zalando.de/search?q=red%20wine"), "block");
  assert.ok(isProhibitedQuery("%76%6F%64%6B%61"));
  // Decoding adds text, it never hides or invents a match.
  assert.equal(d(link("Nivea%20Soft%20Creme")), "allow");
  assert.equal(d(link("Ginger%20Tea")), "allow");
  assert.equal(d("100%25 cotton %ZZ shirt"), "allow");
});

test("brands sold by name alone are blocked, without catching ordinary words", () => {
  for (const s of [
    "Marlboro Gold",
    "Elfbar 600",
    "Geek Bar Pulse",
    "Lost Mary BM600",
    "IQOS Terea Amber",
    "Smirnoff Ice",
    "Jagermeister 0,7l",
    "Jack Daniel's Old No. 7",
    "Johnnie Walker Black Label",
    "Heineken 6x0,33",
    "Corona Extra",
    "Jamón ibérico",
  ])
    assert.equal(d(s), "block", s);
  for (const s of [
    "Velo city bike",
    "Guinness World Records 2026",
    "Corona virus test kit",
    "Walker boots",
  ])
    assert.equal(d(s), "allow", s);
});

test("disguised spellings are still blocked", () => {
  for (const s of [
    "vo​dka",
    "vod­ka",
    "‮vodka",
    "vоdka",
    "v0dka",
    "v o d k a",
    "v.o.d.k.a",
    "vodka70cl",
    "فودكا٧٠",
    "سج‌ائر",
    "جگە‌رە",
  ])
    assert.equal(d(s), "block", JSON.stringify(s));
  for (const s of [
    "Samsung Galaxy A54 5G",
    "Size: S M L XL",
    "U S B C cable",
    "3M tape",
    "شاي و قهوة",
  ])
    assert.equal(d(s), "allow", s);
});
