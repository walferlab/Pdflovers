// app/library/[slug]/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PdfCard from "@/app/components/pdf/pdfCard";
import { buildPdfDetailHref } from "@/lib/pdf-links";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 24;

function fromSlug(slug = "") {
    return slug.replace(/-/g, " ");
}

// map slug → supabase query config
function getQueryConfig(slug) {
    switch (slug) {
        case "featured":
            return {
                filter: (q) => q.eq("is_featured", true),
                label: "Featured",
            };
        case "new-releases":
            return {
                // FIX: filter out nulls before ordering so the query actually returns rows
                filter: (q) =>
                    q
                        .not("published_at", "is", null)
                        .order("published_at", { ascending: false }),
                label: "New Releases",
            };
        case "top-rated":
            return {
                // FIX: filter out nulls before ordering so the query actually returns rows
                filter: (q) =>
                    q
                        .not("rating", "is", null)
                        .order("rating", { ascending: false }),
                label: "Top Rated",
            };
        case "most-downloaded":
            return {
                filter: (q) => q.order("download_count", { ascending: false }),
                label: "Most Downloaded",
            };
        default:
            // treat as category — use ilike for case-insensitive match so
            // slug "science-fiction" matches DB value "Science Fiction"
            return {
                filter: (q) => q.ilike("category", fromSlug(slug)),
                label: fromSlug(slug).replace(/\b\w/g, (c) => c.toUpperCase()),
            };
    }
}

function SkeletonCard() {
    return (
        <div className="flex flex-col gap-3 w-full animate-pulse">
            <div
                className="w-full rounded-xl"
                style={{ aspectRatio: "2/3", background: "rgba(255,255,255,0.05)" }}
            />
            <div className="flex flex-col gap-1.5 px-0.5">
                <div
                    className="h-3 rounded-full w-3/4"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                />
                <div
                    className="h-2.5 rounded-full w-1/2"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                />
            </div>
        </div>
    );
}

export default function LibrarySlugPage() {
    const { slug }   = useParams();
    const [supabase] = useState(createClient);
    const config     = useMemo(() => getQueryConfig(slug), [slug]);

    const [books,    setBooks]    = useState([]);
    const [page,     setPage]     = useState(0);
    const [hasMore,  setHasMore]  = useState(true);
    const [loading,  setLoading]  = useState(true);
    const [loadMore, setLoadMore] = useState(false);

    const sentinelRef  = useRef(null);
    // Used to discard stale responses when slug changes mid-flight
    const requestIdRef = useRef(0);

    const fetchPage = useCallback(
        async (pageNum) => {
            const from = pageNum * PAGE_SIZE;
            const to   = from + PAGE_SIZE - 1;

            let q = supabase
                .from("pdfs")
                .select(
                    "id, title, author, category, cover_image_url, public_id, rating, download_count, published_at, smart_link, download_url"
                )
                .range(from, to);

            q = config.filter(q);

            const { data, error } = await q;
            if (error) {
                console.error("[LibrarySlugPage] Supabase error:", error.message);
                return [];
            }
            return data || [];
        },
        [config, supabase]
    );

    // FIX: replaced useEffectEvent (experimental / not in stable React) with a
    // plain async function inside useEffect. The requestId ref guards against
    // stale responses when the slug changes before the fetch completes.
    useEffect(() => {
        const requestId = ++requestIdRef.current;

        queueMicrotask(() => {
            setBooks([]);
            setPage(0);
            setHasMore(true);
            setLoading(true);
        });

        fetchPage(0).then((data) => {
            // Discard if a newer request has started
            if (requestIdRef.current !== requestId) return;

            setBooks(data);
            setHasMore(data.length === PAGE_SIZE);
            setLoading(false);
        });
    }, [slug, fetchPage]);

    // Infinite scroll — load next page
    const handleLoadMore = useCallback(async () => {
        if (loadMore || !hasMore) return;
        setLoadMore(true);
        const nextPage = page + 1;
        const data     = await fetchPage(nextPage);
        setBooks((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
        setLoadMore(false);
    }, [loadMore, hasMore, page, fetchPage]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) handleLoadMore();
            },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [handleLoadMore]);

    return (
        <main className="min-h-screen text-white p-2 sm:pl-20" style={{ background: "#080808" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32">

                {/* Heading */}
                <div className="mb-10">
                    <h1
                        className="font-brand font-bold text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.03em] leading-none"
                        style={{
                            background: "linear-gradient(160deg,#fff 40%,#555 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        {config.label}
                    </h1>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : books.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {books.map((book) => (
                            <PdfCard
                                key={book.id}
                                title={book.title}
                                img_url={book.cover_image_url}
                                genre={book.category}
                                link={buildPdfDetailHref(book)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-28">
                        <p
                            className="font-satoshi font-medium text-[14px]"
                            style={{ color: "#3a3a3a" }}
                        >
                            No books found.
                        </p>
                    </div>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-4 mt-8" />

                {/* Load-more spinner */}
                {loadMore && (
                    <div className="flex justify-center py-8">
                        <Loader2
                            size={18}
                            className="animate-spin"
                            style={{ color: "#3a3a3a" }}
                        />
                    </div>
                )}
            </div>
        </main>
    );
}
