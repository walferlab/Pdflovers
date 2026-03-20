export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";

function getGtag() {
    if (!GA_MEASUREMENT_ID || typeof window === "undefined") return null;
    return typeof window.gtag === "function" ? window.gtag : null;
}

function sanitizeParams(params = {}) {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
    );
}

export function isAnalyticsEnabled() {
    return Boolean(GA_MEASUREMENT_ID);
}

export function pageview(path) {
    const gtag = getGtag();
    if (!gtag) return;

    gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: path,
    });
}

export function trackEvent(name, params = {}) {
    const gtag = getGtag();
    if (!gtag) return;

    gtag("event", name, sanitizeParams(params));
}

export function trackSearch(query, params = {}) {
    const searchTerm = String(query || "").trim();
    if (!searchTerm) return;

    trackEvent("search", {
        search_term: searchTerm,
        ...params,
    });
}

export function trackBookView(book, params = {}) {
    if (!book?.title) return;

    trackEvent("book_view", {
        item_id: book.id ? String(book.id) : undefined,
        item_name: book.title,
        item_category: book.category,
        author: book.author,
        source: book.source,
        ...params,
    });
}

export function trackBookDownload(book, params = {}) {
    if (!book?.title) return;

    trackEvent("book_download", {
        item_id: book.id ? String(book.id) : undefined,
        item_name: book.title,
        item_category: book.category,
        author: book.author,
        source: book.source,
        ...params,
    });
}

export function trackBlogListView(params = {}) {
    trackEvent("blog_list_view", params);
}

export function trackBlogRead(blog, params = {}) {
    if (!blog?.title) return;

    trackEvent("blog_read", {
        item_id: blog.id ? String(blog.id) : undefined,
        item_name: blog.title,
        item_category: blog.category,
        ...params,
    });
}

export function trackBlogFeedback(blogId, vote, params = {}) {
    if (!blogId) return;

    trackEvent("blog_feedback", {
        item_id: String(blogId),
        vote,
        ...params,
    });
}

export function trackFormSubmit(formName, params = {}) {
    if (!formName) return;

    trackEvent("form_submit", {
        form_name: formName,
        ...params,
    });
}
