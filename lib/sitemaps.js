import { absoluteUrl } from "@/lib/seo";

function escapeXml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function normalizeDate(value) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function createUrlEntry(path, options = {}) {
    return {
        loc: absoluteUrl(path),
        lastmod: normalizeDate(options.lastmod),
        changefreq: options.changefreq,
        priority: options.priority,
    };
}

export function buildUrlSetXml(entries = []) {
    const rows = entries
        .map(
            (entry) => `
  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
                entry.lastmod ? `
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ""
            }${
                entry.changefreq ? `
    <changefreq>${escapeXml(entry.changefreq)}</changefreq>` : ""
            }${
                typeof entry.priority === "number" ? `
    <priority>${entry.priority.toFixed(1)}</priority>` : ""
            }
  </url>`
        )
        .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}
</urlset>`;
}

export function buildSitemapIndexXml(entries = []) {
    const rows = entries
        .map(
            (entry) => `
  <sitemap>
    <loc>${escapeXml(entry.loc)}</loc>${
                entry.lastmod ? `
    <lastmod>${escapeXml(normalizeDate(entry.lastmod))}</lastmod>` : ""
            }
  </sitemap>`
        )
        .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}
</sitemapindex>`;
}

export function createXmlResponse(xml) {
    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}
