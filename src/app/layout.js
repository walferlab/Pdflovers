import { DM_Serif_Display, Space_Grotesk } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { QueryProvider } from "@/providers/query-provider";

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
  title: {
    default: "PDF Lovers",
    template: "%s | PDF Lovers",
  },
  description: "Discover and download high-quality PDF resources across engineering, product, design, and growth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
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
