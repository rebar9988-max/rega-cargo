import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  retainSearchParams,
} from "@tanstack/react-router";
import { APPEARANCE_SCRIPT } from "@/lib/appearance-script";
import { AuthProvider } from "@/lib/auth/provider";
import { ThemeProvider } from "@/lib/theme";
import { loadCopy, I18nProvider } from "@/lib/i18n";
import { validateLocaleSearch } from "@/lib/locale-search";
import { LAYOUT_DIR, langMeta } from "@/lib/langs";
import { rlAiEnabled } from "@/lib/ai/flag";
import { ServiceWorkerSetup } from "@/components/sw-setup";
import { NotFound } from "@/components/not-found";
import "../styles.css";

export const Route = createRootRoute({
  validateSearch: validateLocaleSearch,
  search: { middlewares: [retainSearchParams(["lang"])] },
  beforeLoad: async ({ search }) => {
    const initialLang = search.lang ?? "ckb";
    return { initialLang, initialCopy: await loadCopy(initialLang), localeExplicit: !!search.lang };
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "R&L · MOVE SMART. DELIVER FAST." },
      {
        name: "description",
        content:
          "R&L — Move smart. Deliver fast. Europe, Kurdistan, and Iraq. Chargeable-weight prices in euro and dinar.",
      },
      { name: "theme-color", content: "#f7f6f2" },
      { property: "og:title", content: "R&L" },
      { property: "og:description", content: "MOVE SMART. DELIVER FAST." },
      { property: "og:image", content: "/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "apple-mobile-web-app-title", content: "R&L" },
    ],
    scripts: [
      {
        // Set appearance before the first paint. The CSP middleware supplies its nonce.
        children: APPEARANCE_SCRIPT,
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png?v=7" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootDocument,
});

function RootDocument() {
  const { initialLang, initialCopy, localeExplicit } = Route.useRouteContext();
  const meta = langMeta(initialLang);
  return (
    <html
      lang={meta.html}
      dir={LAYOUT_DIR}
      data-textdir={meta.dir}
      data-rl-ai={rlAiEnabled() ? "1" : undefined}
      suppressHydrationWarning
    >
      <head>
        {meta.dir === "rtl" ? (
          <link
            rel="preload"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
            href="/fonts/noto-sans-arabic-v2.woff2"
          />
        ) : null}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          href="/fonts/inter-variable.woff2?v=2"
        />
        <HeadContent />
      </head>
      <body>
        <ServiceWorkerSetup />
        <AuthProvider>
          <ThemeProvider>
            <I18nProvider
              initialLang={initialLang}
              initialCopy={initialCopy}
              localeExplicit={localeExplicit}
            >
              <Outlet />
            </I18nProvider>
          </ThemeProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
