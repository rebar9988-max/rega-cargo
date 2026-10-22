import type { Lang } from "../langs";
const en = {
  title: "Owner access",
  intro:
    "Activation requires an authorized invitation and verification of your email. Create your own password; the invitation can be used once.",
  email: "Email",
  name: "Name",
  password: "Password",
  passwordHint:
    "Use at least 16 characters for a new account. Never share your password or invitation link.",
  activate: "Verify email and activate owner access",
  signIn: "Sign in",
  signOut: "Sign out",
  dashboard: "Admin dashboard",
  invalid:
    "This invitation is unavailable, expired or already used. Request a new invitation from the authorized platform owner.",
  failed: "Activation or sign-in failed. Check your credentials and invitation, then retry.",
  ready: "Your owner access is active.",
  checking: "Checking invitation…",
  existing:
    "This account already exists. Sign in with its current password; it will not be replaced.",
  loginHint: "Already activated? Sign in with your verified owner account.",
  sessionHint:
    "This account signs in with an emailed code and has no password, so nothing is replaced. Sign in with your email code first, then open the invitation link again within 15 minutes and activate.",
  sessionFailed:
    "Activation needs a fresh sign-in with an emailed code for this exact email. Sign in, then open the invitation link again within 15 minutes.",
  signInFirst: "Sign in with an email code",
};
type Copy = { [K in keyof typeof en]: string };
const ckb: Copy = {
  title: "دەستگەیشتنی خاوەن",
  intro:
    "چالاککردن پێویستی بە بانگهێشتی ڕێپێدراو و پشتڕاستکردنەوەی ئیمەیڵەکەت هەیە. وشەی نهێنی خۆت دروست بکە؛ بانگهێشتەکە تەنها یەکجار بەکاردێت.",
  email: "ئیمەیڵ",
  name: "ناو",
  password: "وشەی نهێنی",
  passwordHint:
    "بۆ هەژماری نوێ لانیکەم 16 پیت بەکاربهێنە. وشەی نهێنی و لینکی بانگهێشتەکەت بە کەس مەدە.",
  activate: "پشتڕاستکردنەوەی ئیمەیڵ و چالاککردنی دەسەڵاتی خاوەن",
  signIn: "چوونەژوورەوە",
  signOut: "چوونەدەرەوە",
  dashboard: "داشبۆردی بەڕێوەبەر",
  invalid:
    "ئەم بانگهێشتە بەردەست نییە، بەسەرچووە یان بەکارهاتووە. داوای بانگهێشتێکی نوێ لە خاوەنی ڕێپێدراوی پلاتفۆرم بکە.",
  failed:
    "چالاککردن یان چوونەژوورەوە سەرکەوتوو نەبوو. زانیاری و بانگهێشتەکەت بپشکنە و دووبارە هەوڵ بدە.",
  ready: "دەسەڵاتی خاوەنەکەت چالاکە.",
  checking: "پشکنینی بانگهێشت…",
  existing: "ئەم هەژمارە هەیە. بە وشەی نهێنی ئێستای بچۆ ژوورەوە؛ ناگۆڕدرێت.",
  loginHint: "پێشتر چالاکت کردووە؟ بە هەژماری پشتڕاستکراوی خاوەن بچۆ ژوورەوە.",
  sessionHint:
    "ئەم هەژمارە بە کۆدی ئیمەیڵ دەچێتە ژوورەوە و وشەی نهێنی نییە، بۆیە هیچ شتێک ناگۆڕدرێت. سەرەتا بە کۆدی ئیمەیڵ بچۆ ژوورەوە، پاشان لە ماوەی 15 خولەکدا لینکی بانگهێشتەکە دووبارە بکەرەوە و چالاکی بکە.",
  sessionFailed:
    "چالاککردن پێویستی بە چوونەژوورەوەیەکی تازە هەیە بە کۆدی ئیمەیڵ بۆ هەمان ئیمەیڵ. بچۆ ژوورەوە و لە ماوەی 15 خولەکدا لینکی بانگهێشتەکە دووبارە بکەرەوە.",
  signInFirst: "چوونەژوورەوە بە کۆدی ئیمەیڵ",
};
const ar: Copy = {
  ...en,
  title: "دخول المالك",
  intro:
    "يتطلب التفعيل دعوة معتمدة والتحقق من بريدك. أنشئ كلمة مرورك بنفسك؛ الدعوة صالحة لمرة واحدة.",
  email: "البريد الإلكتروني",
  name: "الاسم",
  password: "كلمة المرور",
  passwordHint: "استخدم 16 حرفاً على الأقل للحساب الجديد. لا تشارك كلمة المرور أو رابط الدعوة.",
  activate: "تحقق من البريد وفعّل صلاحيات المالك",
  signIn: "تسجيل الدخول",
  signOut: "تسجيل الخروج",
  dashboard: "لوحة الإدارة",
  invalid: "الدعوة غير متاحة أو منتهية أو مستخدمة. اطلب دعوة جديدة من مالك المنصة المعتمد.",
  failed: "تعذر التفعيل أو الدخول. تحقق من بياناتك والدعوة ثم أعد المحاولة.",
  ready: "صلاحيات المالك مفعّلة.",
  checking: "جارٍ فحص الدعوة…",
  existing: "الحساب موجود. استخدم كلمة مروره الحالية؛ لن تُستبدل.",
  loginHint: "سبق أن فعّلت حسابك؟ ادخل بحساب المالك المؤكد.",
  sessionHint:
    "هذا الحساب يدخل برمز يصل إلى بريده ولا توجد له كلمة مرور، فلا يُستبدل شيء. سجّل الدخول أولاً برمز البريد، ثم افتح رابط الدعوة مجدداً خلال 15 دقيقة وفعّل.",
  sessionFailed:
    "يتطلب التفعيل تسجيل دخول حديثاً برمز البريد لنفس البريد تماماً. سجّل الدخول ثم افتح رابط الدعوة خلال 15 دقيقة.",
  signInFirst: "تسجيل الدخول برمز البريد",
};
// TODO(translate-review): other supported locales use the reviewed English fallback.
export function ownerCopy(lang: Lang): Copy {
  return lang === "ckb" ? ckb : lang === "ar" ? ar : en;
}
