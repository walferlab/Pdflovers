import type { Metadata } from "next";
import Logo from "@/public/logo.ico";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "./components/analytics/google-analytics";
import { NavLayout } from "./components/ui/navbar";
import { createPageMetadata } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createPageMetadata({
  title: "PDF Lovers | Free PDF Library, Open Access Books & Reading Guides",
  description:
    "Discover free PDF books, open access titles, public domain classics, and reading guides on PDF Lovers.",
  path: "/",
  keywords: [
    "free pdf library",
    "open access pdf books",
    "public domain pdf books",
    "free reading guides",
    "book discovery platform",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href={Logo.src} type="image/x-icon" />
        <link href="https://api.fontshare.com/v2/css?f[]=beVietnam-pro@300,400,401,500,600,700,800,900&f[]=satoshi@300,301,400,401,500,501,700,701,900&f[]=asap@400,500,600,700&display=swap" rel="stylesheet"></link>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <NavLayout />
        {children}
      </body>
    </html>
  );
}
