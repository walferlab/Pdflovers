const SITE_NAME = "PDF Lovers";
const DEFAULT_SITE_URL = "https://pdflovers.app";

/**
 * @typedef {Object} PageMetadataInput
 * @property {string} title
 * @property {string} description
 * @property {string} [path]
 * @property {string[]} [keywords]
 * @property {string} [image]
 * @property {"website" | "article"} [type]
 * @property {string} [publishedTime]
 * @property {string} [modifiedTime]
 * @property {import("next").Metadata["robots"]} [robots]
 */

const DEFAULT_KEYWORDS = [
    "free pdf books",
    "pdf library",
    "open access books",
    "free ebook download",
    "public domain books",
    "creative commons books",
    "book summaries",
    "reading guides",
    "online library",
    "pdf lovers",
    "pdflovers.app",
    "pdf lovers.app"
];

/**
 * @param {string[]} [values]
 */
function cleanArray(values = []) {
    const seen = new Set();
    return values
        .filter(Boolean)
        .map((value) => String(value).trim())
        .filter((value) => value.length > 0)
        .filter((value) => {
            const key = value.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

function normalizePath(path = "/") {
    if (!path) return "/";
    return path.startsWith("/") ? path : `/${path}`;
}

export function getSiteUrl() {
    const raw =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_GOOGLE_SMART_LINK ||
        DEFAULT_SITE_URL;

    return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/") {
    return new URL(normalizePath(path), `${getSiteUrl()}/`).toString();
}

export function resolveMetadataImage(image) {
    if (!image) return undefined;
    return /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
}

export function stripHtml(value = "") {
    return String(value)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function truncateText(value = "", maxLength = 160) {
    const normalized = String(value).replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

export function titleizeSlug(slug = "") {
    return String(slug)
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
        .trim();
}

/**
 * @param {PageMetadataInput} input
 * @returns {import("next").Metadata}
 */
export function createPageMetadata({
    title,
    description,
    path = "/",
    keywords = [],
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    robots,
}) {
    const canonicalPath = normalizePath(path);
    const metadataImage = resolveMetadataImage(image);
    const mergedKeywords = cleanArray([...DEFAULT_KEYWORDS, ...keywords]);

    return {
        metadataBase: new URL(`${getSiteUrl()}/`),
        title,
        description,
        keywords: mergedKeywords,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title,
            description,
            url: absoluteUrl(canonicalPath),
            siteName: SITE_NAME,
            type,
            ...(metadataImage
                ? {
                      images: [
                          {
                              url: metadataImage,
                              alt: title,
                          },
                      ],
                  }
                : {}),
            ...(publishedTime ? { publishedTime } : {}),
            ...(modifiedTime ? { modifiedTime } : {}),
        },
        twitter: {
            card: metadataImage ? "summary_large_image" : "summary",
            title,
            description,
            ...(metadataImage ? { images: [metadataImage] } : {}),
        },
        ...(robots ? { robots } : {}),
    };
}

const LIBRARY_SPECIAL_METADATA = {
    featured: {
        title: "Featured PDF Books | PDF Lovers",
        description:
            "Browse featured PDF books handpicked from the PDF Lovers library, including open access, public domain, and free reading picks.",
        keywords: ["featured pdf books", "featured free books", "editor picks books"],
    },
    "new-releases": {
        title: "New Release PDF Books | PDF Lovers",
        description:
            "Explore newly added PDF books on PDF Lovers, from fresh open access releases to newly published free reading titles.",
        keywords: ["new pdf books", "new release books", "latest free books"],
    },
    "top-rated": {
        title: "Top Rated PDF Books | PDF Lovers",
        description:
            "Discover top rated PDF books readers love on PDF Lovers, including the best free downloads across popular categories.",
        keywords: ["top rated pdf books", "best free books", "popular pdf books"],
    },
    "most-downloaded": {
        title: "Most Downloaded PDF Books | PDF Lovers",
        description:
            "See the most downloaded PDF books on PDF Lovers and find the free books readers are saving and sharing the most.",
        keywords: ["most downloaded pdf books", "popular book downloads", "trending pdf books"],
    },
};

/**
 * @param {string} [slug]
 * @returns {PageMetadataInput}
 */
export function getLibrarySegmentMetadata(slug = "") {
    const normalizedSlug = String(slug).trim().toLowerCase();
    const specialMetadata = LIBRARY_SPECIAL_METADATA[normalizedSlug];

    if (specialMetadata) {
        return {
            ...specialMetadata,
            path: `/library/${normalizedSlug}`,
        };
    }

    const label = titleizeSlug(normalizedSlug);

    return {
        title: `${label} PDF Books | PDF Lovers`,
        description: `Explore ${label.toLowerCase()} PDF books, free downloads, and open access reading recommendations in the PDF Lovers library.`,
        keywords: [
            `${label} books`,
            `${label} pdf`,
            `${label} free books`,
            `${label} ebook library`,
        ],
        path: `/library/${normalizedSlug}`,
    };
}

/**
 * @param {Record<string, any> | null} book
 * @param {string} slug
 * @returns {import("next").Metadata}
 */
export function createBookMetadata(book, slug) {
    if (!book) {
        return createPageMetadata({
            title: "Book PDF Library | PDF Lovers",
            description:
                "Browse free PDF books, summaries, and categories from the PDF Lovers library.",
            path: `/pdf/${slug}`,
            keywords: ["book pdf", "free pdf library", "online book collection"],
        });
    }

    const title = `${book.title} PDF Download & Summary | PDF Lovers`;
    const description = truncateText(
        book.summary ||
            `${book.title}${book.author ? ` by ${book.author}` : ""}${
                book.category ? ` in ${book.category}` : ""
            } on PDF Lovers.`,
        160
    );

    return createPageMetadata({
        title,
        description,
        path: `/pdf/${slug}`,
        type: "article",
        image: book.cover_image_url,
        publishedTime: book.published_at,
        modifiedTime: book.published_at,
        keywords: cleanArray([
            book.title,
            book.author,
            book.category,
            ...(Array.isArray(book.tags) ? book.tags : []),
            "pdf download",
            "book summary",
        ]),
    });
}

/**
 * @param {Record<string, any> | null} blog
 * @returns {import("next").Metadata}
 */
export function createBlogMetadata(blog) {
    if (!blog) {
        return createPageMetadata({
            title: "Reading Blog & Book Guides | PDF Lovers",
            description:
                "Read book guides, reading tips, and blog posts from PDF Lovers.",
            path: "/blogs",
            keywords: ["book blog", "reading blog", "book guides"],
        });
    }

    const description = truncateText(
        blog.excerpt || stripHtml(blog.content_html || ""),
        160
    );

    return createPageMetadata({
        title: `${blog.title} | PDF Lovers Blog`,
        description,
        path: `/blogs/${blog.slug}`,
        type: "article",
        image: blog.cover_image_url,
        publishedTime: blog.published_at,
        modifiedTime: blog.published_at,
        keywords: cleanArray([
            blog.title,
            blog.category,
            ...(Array.isArray(blog.tags) ? blog.tags : []),
            "pdf lovers blog",
            "reading guide",
        ]),
    });
}

export { DEFAULT_KEYWORDS, SITE_NAME };
