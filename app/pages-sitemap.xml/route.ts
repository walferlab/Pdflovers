import { buildUrlSetXml, createUrlEntry, createXmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date().toISOString();

    return createXmlResponse(
        buildUrlSetXml([
            createUrlEntry("/", { lastmod: now, changefreq: "daily", priority: 1 }),
            createUrlEntry("/search", { lastmod: now, changefreq: "daily", priority: 0.8 }),
            createUrlEntry("/library", { lastmod: now, changefreq: "daily", priority: 0.9 }),
            createUrlEntry("/blogs", { lastmod: now, changefreq: "daily", priority: 0.9 }),
            createUrlEntry("/request-pdf", { lastmod: now, changefreq: "weekly", priority: 0.7 }),
            createUrlEntry("/support", { lastmod: now, changefreq: "weekly", priority: 0.6 }),
        ])
    );
}
