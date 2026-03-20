import { absoluteUrl } from "@/lib/seo";
import { buildSitemapIndexXml, createXmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

export async function GET() {
    const now = new Date().toISOString();

    return createXmlResponse(
        buildSitemapIndexXml([
            { loc: absoluteUrl("/pages-sitemap.xml"), lastmod: now },
            { loc: absoluteUrl("/blogs-sitemap.xml"), lastmod: now },
            { loc: absoluteUrl("/books-sitemap.xml"), lastmod: now },
            { loc: absoluteUrl("/library-sitemap.xml"), lastmod: now },
            { loc: absoluteUrl("/legal-sitemap.xml"), lastmod: now },
        ])
    );
}
