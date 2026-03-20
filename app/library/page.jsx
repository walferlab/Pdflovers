// app/library/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PdfCard from "@/app/components/pdf/pdfCard";
import { buildPdfDetailHref } from "@/lib/pdf-links";
import { ArrowRight } from "lucide-react";

function toSlug(str = "") {
    return str.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div
            className="flex flex-col gap-3 animate-pulse"
            style={{ width: "140px", minWidth: "140px", flexShrink: 0 }}
        >
            <div
                className="rounded-xl"
                style={{
                    width: "140px",
                    aspectRatio: "2/3",
                    background: "rgba(255,255,255,0.05)",
                }}
            />
            <div className="flex flex-col gap-1.5">
                <div className="h-3 rounded-full"
                    style={{ width: "75%", background: "rgba(255,255,255,0.04)" }} />
                <div className="h-2.5 rounded-full"
                    style={{ width: "50%", background: "rgba(255,255,255,0.03)" }} />
            </div>
        </div>
    );
}

// ── Horizontal row ────────────────────────────────────────────────────────────
function SectionRow({ title, books, href, loading }) {
    return (
        <section>
            <div className="flex items-center justify-between mb-5">
                <h2
                    className="font-brand font-bold text-[17px] tracking-[-0.02em]"
                    style={{ color: "#e0e0e0" }}
                >
                    {title}
                </h2>
                <Link
                    href={href}
                    className="flex items-center gap-1 font-satoshi font-medium text-[12px] transition-colors hover:text-white group"
                    style={{ color: "#555" }}
                >
                    See all
                    <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>

            <div
                className="flex gap-5"
                style={{
                    overflowX: "auto",
                    overflowY: "visible",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                    paddingBottom: "6px",
                }}
            >
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))
                    : books.map((book) => (
                        <div
                            key={book.id}
                            style={{
                                width: "150px",
                                minWidth: "140px",
                                flexShrink: 0,
                            }}
                        >
                            <PdfCard
                                title={book.title}
                                img_url={book.cover_image_url}
                                genre={book.category}
                                link={buildPdfDetailHref(book)}
                            />
                        </div>
                    ))
                }
            </div>
        </section>
    );
}

// ── Category pill ─────────────────────────────────────────────────────────────
function CategoryPill({ name, count, href }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-150 group"
            style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.13)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)";
            }}
        >
            <span
                className="font-satoshi font-medium text-[13px] truncate"
                style={{ color: "#ccc" }}
            >
                {name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
                <span
                    className="font-satoshi font-medium text-[11px]"
                    style={{ color: "#3a3a3a" }}
                >
                    {count}
                </span>
                <ArrowRight
                    size={11}
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                    style={{ color: "#3a3a3a" }}
                />
            </div>
        </Link>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LibraryPage() {
    const [supabase] = useState(createClient);

    const [loading,    setLoading]    = useState(true);
    const [catLoading, setCatLoading] = useState(true);
    const [featured,   setFeatured]   = useState([]);
    const [newRelease, setNewRelease] = useState([]);
    const [topRated,   setTopRated]   = useState([]);
    const [mostRead,   setMostRead]   = useState([]);
    const [categories, setCategories] = useState([]);
    const [catBooks,   setCatBooks]   = useState({});

    useEffect(() => {
        async function load() {
            setLoading(true);

            const [featRes, newRes, topRes, mostRes, catRes] = await Promise.all([
                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url, public_id, smart_link, download_url")
                    .eq("is_featured", true)
                    .limit(16),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url, public_id, published_at, smart_link, download_url")
                    .not("published_at", "is", null)
                    .order("published_at", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url, public_id, rating, smart_link, download_url")
                    .not("rating", "is", null)
                    .order("rating", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url, public_id, download_count, smart_link, download_url")
                    .order("download_count", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("category")
                    .not("category", "is", null),
            ]);

            setFeatured(featRes.data   || []);
            setNewRelease(newRes.data  || []);
            setTopRated(topRes.data    || []);
            setMostRead(mostRes.data   || []);
            setLoading(false);

            // tally categories
            if (catRes.data) {
                const counts = catRes.data.reduce((acc, { category }) => {
                    if (category) acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {});
                const sorted = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => ({ name, count }));
                setCategories(sorted);

                // preview books for top 8 categories
                setCatLoading(true);
                const top8 = sorted.slice(0, 8);
                const previews = await Promise.all(
                    top8.map(({ name }) =>
                        supabase.from("pdfs")
                            .select("id, title, author, category, cover_image_url, public_id, smart_link, download_url")
                            .eq("category", name)
                            .limit(12)
                    )
                );
                const map = {};
                top8.forEach(({ name }, i) => {
                    map[name] = previews[i].data || [];
                });
                setCatBooks(map);
                setCatLoading(false);
            }
        }

        load();
    }, [supabase]);

    const mainSections = [
        { title: "Featured",        books: featured,   href: "/library/featured" },
        { title: "New Releases",    books: newRelease, href: "/library/new-releases" },
        { title: "Top Rated",       books: topRated,   href: "/library/top-rated" },
        { title: "Most Downloaded", books: mostRead,   href: "/library/most-downloaded" },
    ];

    return (
        <main
            className="min-h-screen text-white sm:pl-17"
            style={{ background: "#080808" }}
        >
            {/* hide webkit scrollbar globally for this page */}
            <style>{`
                main *::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32 flex flex-col gap-12">

                {/* ── Title ── */}
                <h1
                    className="font-brand font-bold tracking-[-0.03em] leading-none"
                    style={{
                        fontSize: "clamp(1.8rem, 4vw, 3rem)",
                        background: "linear-gradient(160deg,#fff 40%,#555 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Library
                </h1>

                {/* ── Categories first ── */}
                <section className="flex flex-col gap-5">
                    <h2
                        className="font-brand font-bold text-[17px] tracking-[-0.02em]"
                        style={{ color: "#e0e0e0" }}
                    >
                        Browse by category
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 rounded-xl animate-pulse"
                                    style={{ background: "rgba(255,255,255,0.03)" }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {categories.map(({ name, count }) => (
                                <CategoryPill
                                    key={name}
                                    name={name}
                                    count={count}
                                    href={`/library/${toSlug(name)}`}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Divider ── */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

                {/* ── Main rows ── */}
                {mainSections.map(({ title, books, href }) => (
                    <SectionRow
                        key={title}
                        title={title}
                        books={books}
                        href={href}
                        loading={loading}
                    />
                ))}

                {/* ── Category preview rows ── */}
                {!catLoading && categories.slice(0, 8).map(({ name }) =>
                    catBooks[name]?.length > 0 ? (
                        <SectionRow
                            key={name}
                            title={name}
                            books={catBooks[name]}
                            href={`/library/${toSlug(name)}`}
                            loading={false}
                        />
                    ) : null
                )}

            </div>
        </main>
    );
}
