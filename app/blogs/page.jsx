// app/blogs/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { trackBlogListView } from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import BlogCard from "@/app/components/blogs/blogCard";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
    });
}

// Rough read-time estimate: ~200 words/min from excerpt length as a proxy.
// If you store word_count in the DB later, swap this out.
function estimateReadTime(excerpt = "") {
    const words = excerpt.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200)) || null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogCardSkeleton() {
    const shimmer = {
        background:
            "linear-gradient(90deg, rgba(255,255,255,0.025) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.025) 75%)",
        backgroundSize: "200% 100%",
    };
    return (
        <div className="flex flex-col rounded-[14px] overflow-hidden border border-white/[0.06] bg-white/[0.02]">
            {/* Cover */}
            <div className="h-44 w-full animate-shimmer" style={shimmer} />
            {/* Body */}
            <div className="flex flex-col gap-3 p-4">
                <div className="h-3.5 rounded-full w-4/5 animate-shimmer" style={shimmer} />
                <div className="h-3.5 rounded-full w-3/5 animate-shimmer" style={{ ...shimmer, opacity: 0.7 }} />
                <div className="h-3 rounded-full w-full animate-shimmer mt-1" style={{ ...shimmer, opacity: 0.5 }} />
                <div className="h-3 rounded-full w-2/3 animate-shimmer" style={{ ...shimmer, opacity: 0.4 }} />
                <div className="flex items-center gap-2 pt-3 mt-1 border-t border-white/[0.05]">
                    <div className="w-6 h-6 rounded-full animate-shimmer flex-shrink-0" style={shimmer} />
                    <div className="h-2.5 rounded-full w-1/3 animate-shimmer" style={{ ...shimmer, opacity: 0.5 }} />
                </div>
            </div>
        </div>
    );
}

// ─── Category pill ────────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex-shrink-0 font-satoshi text-[12px] font-medium px-3.5 py-1.5 rounded-full
                border transition-all duration-150 cursor-pointer
                ${active
                    ? "bg-white text-black border-white"
                    : "bg-white/[0.03] text-[#606060] border-white/[0.08] hover:bg-white/[0.07] hover:text-[#a0a0a0] hover:border-white/[0.14]"
                }
            `}
        >
            {label}
        </button>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ category }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="text-[32px]" aria-hidden>📭</span>
            <p className="font-satoshi font-medium text-[14px] text-[#3a3a3a]">
                {category === "All"
                    ? "No blogs published yet."
                    : `No blogs in "${category}" yet.`}
            </p>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogsPage() {
    const [supabase] = useState(createClient);

    const [blogs,       setBlogs]       = useState([]);
    const [categories,  setCategories]  = useState([]);  // ["All", "Tech", ...]
    const [activecat,   setActiveCat]   = useState("All");
    const [page,        setPage]        = useState(0);
    const [hasMore,     setHasMore]     = useState(true);
    const [loading,     setLoading]     = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const sentinelRef  = useRef(null);
    const requestIdRef = useRef(0);
    const trackedViewRef = useRef("");

    // ── Fetch distinct categories once ────────────────────────────────────────
    useEffect(() => {
        async function fetchCategories() {
            const { data, error } = await supabase
                .from("blogs")
                .select("category")
                .eq("is_published", true)
                .not("category", "is", null);

            if (error) {
                console.error("[BlogsPage] category fetch error:", error.message);
                return;
            }

            const unique = [
                "All",
                ...Array.from(
                    new Set((data || []).map((r) => r.category).filter(Boolean))
                ).sort(),
            ];
            setCategories(unique);
        }
        fetchCategories();
    }, [supabase]);

    // ── Core fetch ────────────────────────────────────────────────────────────
    const fetchPage = useCallback(
        async (pageNum, category) => {
            const from = pageNum * PAGE_SIZE;
            const to   = from + PAGE_SIZE - 1;

            let q = supabase
                .from("blogs")
                .select(
                    "id, title, slug, excerpt, cover_image_url, category, tags, published_at, content_html"
                )
                .eq("is_published", true)
                .not("published_at", "is", null)
                .order("published_at", { ascending: false })
                .range(from, to);

            if (category && category !== "All") {
                q = q.ilike("category", category);
            }

            const { data, error } = await q;
            if (error) {
                console.error("[BlogsPage] fetch error:", error.message);
                return [];
            }
            return data || [];
        },
        [supabase]
    );

    // ── Initial / category-change load ───────────────────────────────────────
    useEffect(() => {
        const requestId = ++requestIdRef.current;

        queueMicrotask(() => {
            setBlogs([]);
            setPage(0);
            setHasMore(true);
            setLoading(true);
        });

        fetchPage(0, activecat).then((data) => {
            if (requestIdRef.current !== requestId) return;
            setBlogs(data);
            setHasMore(data.length === PAGE_SIZE);
            setLoading(false);
        });
    }, [activecat, fetchPage]);

    // ── Infinite scroll ───────────────────────────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        const data = await fetchPage(nextPage, activecat);
        setBlogs((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
        setLoadingMore(false);
    }, [loadingMore, hasMore, page, activecat, fetchPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) handleLoadMore(); },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    useEffect(() => {
        if (loading || page !== 0) return;

        const key = `${activecat}:${blogs.length}`;
        if (trackedViewRef.current === key) return;

        trackedViewRef.current = key;
        trackBlogListView({
            category: activecat,
            result_count: blogs.length,
        });
    }, [activecat, blogs.length, loading, page]);

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen text-white pt-10 sm:pl-20" style={{ background: "#080808" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-32">

                {/* ── Page heading ─────────────────────────────────────── */}
                <div className="mb-8">
                    <h1
                        className="font-brand font-bold text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-[-0.03em]"
                        style={{
                            background: "linear-gradient(160deg, #fff 40%, #555 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Blogs
                    </h1>
                    <p className="font-satoshi text-[13px] text-[#3a3a3a] mt-2">
                        Thoughts, guides, and discoveries from PDF Lovers.
                    </p>
                </div>

                {/* ── Category filter ───────────────────────────────────── */}
                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] pb-1 mb-8">
                        {categories.map((cat) => (
                            <CategoryPill
                                key={cat}
                                label={cat}
                                active={activecat === cat}
                                onClick={() => {
                                    if (cat !== activecat) setActiveCat(cat);
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── Grid ─────────────────────────────────────────────── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <EmptyState category={activecat} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                title={blog.title}
                                excerpt={blog.excerpt || ""}
                                coverImage={blog.cover_image_url || ""}
                                category={blog.category || ""}
                                date={formatDate(blog.published_at)}
                                readTime={estimateReadTime(blog.excerpt)}
                                href={`/blogs/${blog.slug}`}
                                size="md"
                            />
                        ))}
                    </div>
                )}

                {/* ── Infinite scroll sentinel ──────────────────────────── */}
                <div ref={sentinelRef} className="h-4 mt-8" />

                {/* ── Load-more spinner ─────────────────────────────────── */}
                {loadingMore && (
                    <div className="flex justify-center py-10">
                        <Loader2
                            size={18}
                            className="animate-spin"
                            style={{ color: "#3a3a3a" }}
                        />
                    </div>
                )}

                {/* ── End of list ───────────────────────────────────────── */}
                {!loading && !loadingMore && !hasMore && blogs.length > 0 && (
                    <p className="text-center font-satoshi text-[12px] text-[#282828] pt-10">
                        You&apos;ve reached the end.
                    </p>
                )}

            </div>
        </main>
    );
}
