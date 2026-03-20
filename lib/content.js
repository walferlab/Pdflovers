import { toSlug } from "@/lib/pdf-links";
import { createClient } from "@/lib/supabase/server";

const PDF_SELECT = [
    "id",
    "title",
    "author",
    "category",
    "tags",
    "summary",
    "cover_image_url",
    "rating",
    "download_count",
    "published_at",
].join(", ");

const BLOG_SELECT = [
    "id",
    "title",
    "slug",
    "excerpt",
    "content_html",
    "cover_image_url",
    "category",
    "tags",
    "published_at",
].join(", ");

export const LIBRARY_SPECIAL_SLUGS = [
    "featured",
    "new-releases",
    "top-rated",
    "most-downloaded",
];

async function fetchAllRows(builder, pageSize = 500) {
    let from = 0;
    const rows = [];

    while (true) {
        const { data, error } = await builder().range(from, from + pageSize - 1);

        if (error) {
            throw error;
        }

        if (!data?.length) {
            break;
        }

        rows.push(...data);

        if (data.length < pageSize) {
            break;
        }

        from += pageSize;
    }

    return rows;
}

async function fetchAllRowsWithOptionalCreatedAt(primaryBuilder, fallbackBuilder, pageSize = 500) {
    try {
        return await fetchAllRows(primaryBuilder, pageSize);
    } catch (error) {
        const message = String(error?.message || error);
        if (!fallbackBuilder || !/created_at/i.test(message)) {
            throw error;
        }

        return fetchAllRows(fallbackBuilder, pageSize);
    }
}

export async function getPdfBySlug(slug) {
    const normalizedSlug = String(slug || "").trim().toLowerCase();
    if (!normalizedSlug) return null;

    const supabase = await createClient();
    const titleGuess = normalizedSlug.replace(/-/g, " ");

    const { data: primaryCandidates, error } = await supabase
        .from("pdfs")
        .select(PDF_SELECT)
        .ilike("title", `%${titleGuess}%`)
        .limit(30);

    let match = (primaryCandidates || []).find((book) => toSlug(book.title) === normalizedSlug);

    if (!match && !error) {
        const words = titleGuess.split(" ").filter((word) => word.length > 2);

        if (words.length > 0) {
            const orFilter = words.map((word) => `title.ilike.%${word}%`).join(",");
            const { data: secondaryCandidates } = await supabase
                .from("pdfs")
                .select(PDF_SELECT)
                .or(orFilter)
                .limit(50);

            match = (secondaryCandidates || []).find((book) => toSlug(book.title) === normalizedSlug);
        }
    }

    return match || null;
}

export async function getBlogBySlug(slug) {
    const normalizedSlug = String(slug || "").trim();
    if (!normalizedSlug) return null;

    const supabase = await createClient();
    const { data } = await supabase
        .from("blogs")
        .select(BLOG_SELECT)
        .eq("slug", normalizedSlug)
        .eq("is_published", true)
        .maybeSingle();

    return data || null;
}

export async function getAllPublishedBlogs() {
    const supabase = await createClient();

    return fetchAllRowsWithOptionalCreatedAt(
        () =>
            supabase
                .from("blogs")
                .select("slug, created_at, published_at, category")
                .eq("is_published", true)
                .order("created_at", { ascending: false }),
        () =>
            supabase
                .from("blogs")
                .select("slug, published_at, category")
                .eq("is_published", true)
                .order("published_at", { ascending: false })
    );
}

export async function getAllPdfEntries() {
    const supabase = await createClient();

    return fetchAllRowsWithOptionalCreatedAt(
        () =>
            supabase
                .from("pdfs")
                .select("title, category, created_at, published_at")
                .order("created_at", { ascending: false }),
        () =>
            supabase
                .from("pdfs")
                .select("title, category, published_at")
                .order("published_at", { ascending: false })
    );
}

export function getSitemapLastmod(entry) {
    return entry?.created_at || entry?.published_at || null;
}

export function getLibraryCategoriesFromBooks(books = []) {
    return [...new Set(
        books
            .map((book) => book.category)
            .filter(Boolean)
            .map((category) => String(category).trim())
            .sort((left, right) => left.localeCompare(right))
    )];
}
