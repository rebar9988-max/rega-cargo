import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { I18nProvider } from "@/lib/i18n";
import { rlAiEnabled } from "@/lib/ai/flag";
import { ServiceWorkerSetup } from "@/components/sw-setup";
import { NotFound } from "@/components/not-found";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "R&L · MOVE SMART. DELIVER FAST." },
      {
        name: "description",
        content:
          "R&L — Move smart. Deliver fast. Europe, Kurdistan, and Iraq. Chargeable-weight prices in euro and dinar.",
      },
      { name: "theme-color", content: "#f4f4f4" },
      { property: "og:title", content: "R&L" },
      { property: "og:description", content: "MOVE SMART. DELIVER FAST." },
      { property: "og:image", content: "/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "apple-mobile-web-app-title", content: "R&L" },
    ],
    scripts: [
      {
        // Preload Vazirmatn only for Arabic-script languages (ckb is the default).
        children:
          '(function(){try{var l=localStorage.getItem("rl-lang-v4")||localStorage.getItem("rega-lang");if(!l||l==="ckb"||l==="ar"||l==="fa"){var k=document.createElement("link");k.rel="preload";k.as="font";k.type="font/woff2";k.crossOrigin="anonymous";k.href="/fonts/vazirmatn-nl-v33.003.woff2";document.head.appendChild(k)}}catch(e){}})()',
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png?v=6" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  notFoundComponent: NotFound,
  component: () => (
    <html lang="ckb" dir="ltr" data-textdir="rtl" data-rl-ai={rlAiEnabled() ? "1" : undefined} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ServiceWorkerSetup />
        <AuthProvider>
          <I18nProvider>
            <Outlet />
          </I18nProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
