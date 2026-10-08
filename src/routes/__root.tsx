import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { I18nProvider } from "@/lib/i18n";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { rlAiEnabled } from "@/lib/ai/flag";
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
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png?v=6" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ckb" dir="ltr" data-textdir="rtl" data-rl-ai={rlAiEnabled() ? "1" : undefined} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
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
