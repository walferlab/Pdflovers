import { buildUrlSetXml, createUrlEntry, createXmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date().toISOString();

    return createXmlResponse(
        buildUrlSetXml([
            createUrlEntry("/about-us", { lastmod: now, changefreq: "monthly", priority: 0.5 }),
            createUrlEntry("/contact-us", { lastmod: now, changefreq: "monthly", priority: 0.5 }),
            createUrlEntry("/privacy-policy", { lastmod: now, changefreq: "monthly", priority: 0.4 }),
            createUrlEntry("/terms", { lastmod: now, changefreq: "monthly", priority: 0.4 }),
            createUrlEntry("/disclaimer", { lastmod: now, changefreq: "monthly", priority: 0.4 }),
            createUrlEntry("/support", { lastmod: now, changefreq: "monthly", priority: 0.5 }),
        ])
    );
}
