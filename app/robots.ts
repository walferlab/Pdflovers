import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            },
        ],
        sitemap: [
            `${siteUrl}/sitemap.xml`,
            `${siteUrl}/pages-sitemap.xml`,
            `${siteUrl}/blogs-sitemap.xml`,
            `${siteUrl}/books-sitemap.xml`,
            `${siteUrl}/library-sitemap.xml`,
            `${siteUrl}/legal-sitemap.xml`,
        ],
        host: siteUrl,
    };
}
