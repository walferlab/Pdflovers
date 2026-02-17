import { getSitemapPdfEntries } from "@/lib/pdfs/repository";
import { siteConfig } from "@/lib/seo";

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/library`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/request-pdf`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/contact-us`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/about-us`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/privacy-policy`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/terms-of-service`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/disclaimer`, changeFrequency: "monthly", priority: 0.4 },
  ].map((route) => ({
    ...route,
    lastModified: now,
  }));

  const pdfEntries = await getSitemapPdfEntries();

  const pdfRoutes = pdfEntries.map((pdf) => ({
    url: `${siteConfig.url}/pdf/${pdf.id}`,
    lastModified: pdf.publishedAt ? new Date(pdf.publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...pdfRoutes];
}
