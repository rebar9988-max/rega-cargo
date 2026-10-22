import type { Lang } from "../langs.ts";

const en = {
  title: "Administrator sign-in",
  lede: "Enter the email address on your administrator account. We send a six-digit code to it. Nothing here grants access on its own.",
};
type Copy = { [K in keyof typeof en]: string };

const ckb: Copy = {
  title: "چوونەژوورەوەی بەڕێوەبەر",
  lede: "ئەو ئیمەیڵە بنووسە کە لەسەر هەژماری بەڕێوەبەرەکەتە. کۆدێکی شەش ژمارەیی بۆی دەنێرین. ئەم لاپەڕە بە تەنها هیچ دەسەڵاتێک نادات.",
};

const ar: Copy = {
  title: "دخول المشرف",
  lede: "أدخل البريد المسجّل على حساب المشرف. نرسل إليه رمزاً من ست خانات. هذه الصفحة وحدها لا تمنح أي صلاحية.",
};

// TODO(translate-review): other supported locales use the reviewed English fallback.
export function adminSignInCopy(lang: Lang): Copy {
  return lang === "ckb" ? ckb : lang === "ar" ? ar : en;
}
