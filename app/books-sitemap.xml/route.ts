import { getAllPdfEntries, getSitemapLastmod } from "@/lib/content";
import { toSlug } from "@/lib/pdf-links";
import { buildUrlSetXml, createUrlEntry, createXmlResponse } from "@/lib/sitemaps";

export const revalidate = 3600;

function pickLatestDate(current: string | null, candidate: string | null) {
    if (!candidate) return current;
    if (!current) return candidate;
    return new Date(candidate).getTime() > new Date(current).getTime() ? candidate : current;
}

export async function GET() {
    const books = await getAllPdfEntries();
    const now = new Date().toISOString();
    const uniqueBooks = new Map();

    books.forEach((book) => {
        const slug = toSlug(book.title);
        if (!slug) return;
        const existing = uniqueBooks.get(slug);

        if (!existing) {
            uniqueBooks.set(slug, book);
            return;
        }

        const latestDate = pickLatestDate(
            getSitemapLastmod(existing),
            getSitemapLastmod(book)
        );

        if (latestDate === getSitemapLastmod(book)) {
            uniqueBooks.set(slug, book);
        }
    });

    const latestBookDate = books.reduce(
        (latest, book) => pickLatestDate(latest, getSitemapLastmod(book)),
        null
    ) || now;

    return createXmlResponse(
        buildUrlSetXml(
            [...uniqueBooks.entries()].map(([slug, book]) =>
                createUrlEntry(`/pdf/${slug}`, {
                    lastmod: getSitemapLastmod(book) || latestBookDate,
                    changefreq: "weekly",
                    priority: 0.7,
                })
            )
        )
    );
}
