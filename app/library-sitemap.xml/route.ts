import {
    getAllPdfEntries,
    getLibraryCategoriesFromBooks,
    getSitemapLastmod,
    LIBRARY_SPECIAL_SLUGS,
} from "@/lib/content";
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
    const categories = getLibraryCategoriesFromBooks(books);
    const latestLibraryDate = books.reduce(
        (latest, book) => pickLatestDate(latest, getSitemapLastmod(book)),
        null
    ) || now;
    const categoryDates = new Map();

    books.forEach((book) => {
        const category = String(book.category || "").trim();
        if (!category) return;

        const latestForCategory = pickLatestDate(
            categoryDates.get(category) || null,
            getSitemapLastmod(book)
        );

        if (latestForCategory) {
            categoryDates.set(category, latestForCategory);
        }
    });

    return createXmlResponse(
        buildUrlSetXml([
            createUrlEntry("/library", { lastmod: latestLibraryDate, changefreq: "daily", priority: 0.9 }),
            ...LIBRARY_SPECIAL_SLUGS.map((slug) =>
                createUrlEntry(`/library/${slug}`, {
                    lastmod: latestLibraryDate,
                    changefreq: "daily",
                    priority: 0.8,
                })
            ),
            ...categories.map((category) =>
                createUrlEntry(`/library/${toSlug(category)}`, {
                    lastmod: categoryDates.get(category) || latestLibraryDate,
                    changefreq: "weekly",
                    priority: 0.7,
                })
            ),
        ])
    );
}
