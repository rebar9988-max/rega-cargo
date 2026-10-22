import type { Lang } from "../langs.ts";

const en = {
  title: "Administrator sign-in",
  lede: "Enter the email address on your administrator account. We send a six-digit code to it. Nothing here grants access on its own.",
  // Said the same way for every address, because naming who holds a role would let
  // anyone find the administrators by trying addresses. Only an administrator is sent
  // anything.
  sentTo: "If this address holds administrator access, we have sent a code to:",
  notice: {
    subject: "Administrator sign-in to R&L",
    intro: "Somebody signed in to the R&L administration with your account.",
    when: "Time:",
    ignore:
      "If this was you, nothing to do. If it was not, sign out of every device from your account and have the administrator roles reviewed at once.",
  },
};
type Copy = typeof en;

const ckb: Copy = {
  title: "چوونەژوورەوەی بەڕێوەبەر",
  lede: "ئەو ئیمەیڵە بنووسە کە لەسەر هەژماری بەڕێوەبەرەکەتە. کۆدێکی شەش ژمارەیی بۆی دەنێرین. ئەم لاپەڕە بە تەنها هیچ دەسەڵاتێک نادات.",
  sentTo: "ئەگەر ئەم ئیمەیڵە مافی بەڕێوەبەری هەبێت، کۆدێکمان بۆ نارد:",
  notice: {
    subject: "چوونەژوورەوەیەکی بەڕێوەبەر بۆ R&L",
    intro: "کەسێک بە هەژمارەکەی تۆ چووەتە ناو بەشی بەڕێوەبردنی R&L.",
    when: "کات:",
    ignore:
      "ئەگەر خۆت بوویت، هیچ کارێک پێویست نییە. ئەگەر خۆت نەبوویت، دەستبەجێ لە هەموو ئامێرەکان بچۆ دەرەوە و ڕۆڵە بەڕێوەبەرەکان بپشکنە.",
  },
};

const ar: Copy = {
  title: "دخول المشرف",
  lede: "أدخل البريد المسجّل على حساب المشرف. نرسل إليه رمزاً من ست خانات. هذه الصفحة وحدها لا تمنح أي صلاحية.",
  sentTo: "إذا كان هذا البريد يملك صلاحية إشراف، فقد أرسلنا إليه رمزاً:",
  notice: {
    subject: "تسجيل دخول مشرف إلى R&L",
    intro: "سجّل أحدهم الدخول إلى إدارة R&L بحسابك.",
    when: "الوقت:",
    ignore:
      "إن كنت أنت، فلا شيء عليك. وإن لم تكن، فسجّل الخروج من كل الأجهزة وراجع صلاحيات المشرفين فوراً.",
  },
};

// TODO(translate-review): other supported locales use the reviewed English fallback.
export function adminSignInCopy(lang: Lang): Copy {
  return lang === "ckb" ? ckb : lang === "ar" ? ar : en;
}
