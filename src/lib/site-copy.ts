// Existing localized navigation labels, separated from full AI and legal page copy.
import type { Lang } from "./langs";
export const SITE_COPY: Record<
  Lang,
  { ai: string; legal: { impressum: string; privacy: string; terms: string } }
> = {
  ckb: {
    ai: "یاریدەدەری R&L",
    legal: {
      impressum: "زانیاریی یاسایی",
      privacy: "تایبەتمەندی",
      terms: "مەرجەکان",
    },
  },
  ku: {
    ai: "Alîkarê R&L",
    legal: {
      impressum: "Agahiyên qanûnî",
      privacy: "Nepenîtî",
      terms: "Merc",
    },
  },
  de: {
    ai: "R&L Assistent",
    legal: {
      impressum: "Impressum",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
    },
  },
  en: {
    ai: "R&L Assistant",
    legal: {
      impressum: "Legal notice",
      privacy: "Privacy",
      terms: "Terms",
    },
  },
  ar: {
    ai: "مساعد R&L",
    legal: {
      impressum: "البيانات القانونية",
      privacy: "الخصوصية",
      terms: "الشروط",
    },
  },
  fa: {
    ai: "دستیار R&L",
    legal: {
      impressum: "اطلاعات حقوقی",
      privacy: "حریم خصوصی",
      terms: "شرایط",
    },
  },
  tr: {
    ai: "R&L Asistan",
    legal: {
      impressum: "Künye",
      privacy: "Gizlilik",
      terms: "Koşullar",
    },
  },
};
