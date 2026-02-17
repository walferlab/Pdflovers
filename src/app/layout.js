import { DM_Serif_Display, Space_Grotesk } from "next/font/google";
import Script from "next/script";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QueryProvider } from "@/providers/query-provider";
import { JsonLdScript } from "@/components/seo/json-ld";
import { getOrganizationSchema, getWebsiteSchema, siteConfig } from "@/lib/seo";

import "./globals.css";

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: "%s | PDF Lovers",
  },
  description: siteConfig.defaultDescription,
  manifest: "/manifest.webmanifest",
  applicationName: siteConfig.name,
  generator: "Next.js",
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: siteConfig.category,
  keywords: [siteConfig.superKeyword, ...siteConfig.defaultKeywords],
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.defaultDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.defaultDescription,
    creator: siteConfig.twitterHandle,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f5cd7",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const globalSchemas = [getOrganizationSchema(), getWebsiteSchema()];

  return (
    <html lang="en">
      <head>
        {googleSiteVerification ? (
          <meta name="google-site-verification" content={googleSiteVerification} />
        ) : null}
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <JsonLdScript data={globalSchemas} id="global-schema" />
        {adsenseClient ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
        <QueryProvider>
          <div className="app-shell">
            <SiteHeader />
            <main className="container page-shell">{children}</main>
            <SiteFooter />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
