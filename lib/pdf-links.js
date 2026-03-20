// lib/pdf-links.js
// Builds the correct detail-page href for both library books and Google-sourced books.

/**
 * Converts a string to a URL-safe slug.
 *
 * @param {string} [str]
 * @returns {string}
 */
export function toSlug(str = "") {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

/**
 * Builds the href for a book detail page.
 *
 * Library books -> /pdf/<title-slug>
 * Google books  -> /pdf/<title-slug>?source=google&url=...
 *
 * @param {{
 *   id: string | number,
 *   title: string,
 *   author?: string | null,
 *   category?: string | null,
 *   cover_image_url?: string | null,
 *   summary?: string | null,
 *   link?: string | null,
 *   source?: string | null,
 *   smart_link?: string | null,
 *   download_url?: string | null,
 * }} book
 * @returns {string}
 */
export function buildPdfDetailHref(book) {
    if (!book) return "/library";

    const slug = toSlug(book.title ?? "book");
    const isGoogle =
        book.source === "google" ||
        (typeof book.id === "string" && book.id.startsWith("google-"));

    if (!isGoogle) {
        return `/pdf/${slug}`;
    }

    const params = new URLSearchParams();
    params.set("source", "google");

    if (book.link || book.download_url) {
        params.set("url", book.link ?? book.download_url ?? "");
    }
    if (book.title) {
        params.set("title", book.title);
    }
    if (book.author) {
        params.set("author", book.author);
    }
    if (book.category) {
        params.set("category", book.category);
    }
    if (book.cover_image_url) {
        params.set("cover", book.cover_image_url);
    }
    if (book.summary) {
        params.set("summary", book.summary.slice(0, 300));
    }

    return `/pdf/${slug}?${params.toString()}`;
}
