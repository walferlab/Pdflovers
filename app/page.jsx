// app/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PdfCard from "@/app/components/pdf/pdfCard";
import { ArrowRight, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(str = "") {
    return str.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

function buildBookLink(book) {
    return `/pdf/${toSlug(book.title)}`;
}

// ─── Supabase ad tracking (fire-and-forget) ───────────────────────────────────

async function trackImpression(supabase, id) {
    try {
        await supabase.rpc("increment_ad_impressions", { ad_id: id });
    } catch { /* non-critical */ }
}

async function trackClick(supabase, id) {
    try {
        await supabase.rpc("increment_ad_clicks", { ad_id: id });
    } catch { /* non-critical */ }
}

// ─── Shimmer keyframe (injected once, minimal) ────────────────────────────────
// Tailwind doesn't ship a "shimmer" animation by default.
// Add this to your tailwind.config.js under theme.extend:
//
// animation: { shimmer: "shimmer 1.6s infinite" },
// keyframes: {
//   shimmer: {
//     "from": { backgroundPosition: "200% 0" },
//     "to":   { backgroundPosition: "-200% 0" },
//   },
// },
//
// Then use `animate-shimmer` in className strings below.

// ─── Ad Banner Slider ─────────────────────────────────────────────────────────

function AdBannerSlider({ ads, supabase }) {
    const [idx, setIdx]         = useState(0);
    const [paused, setPaused]   = useState(false);
    const [animDir, setAnimDir] = useState("next");
    const [visible, setVisible] = useState(true);
    const intervalRef           = useRef(null);
    const trackedRef            = useRef(new Set());

    const go = useCallback((nextIdx, dir = "next") => {
        setAnimDir(dir);
        setVisible(false);
        setTimeout(() => { setIdx(nextIdx); setVisible(true); }, 180);
    }, []);

    const prev = useCallback(() => go((idx - 1 + ads.length) % ads.length, "prev"), [idx, ads.length, go]);
    const next = useCallback(() => go((idx + 1) % ads.length, "next"),              [idx, ads.length, go]);

    useEffect(() => {
        if (ads.length <= 1 || paused) return;
        intervalRef.current = setInterval(next, 5000);
        return () => clearInterval(intervalRef.current);
    }, [ads.length, paused, next]);

    useEffect(() => {
        const ad = ads[idx];
        if (!ad || trackedRef.current.has(ad.id)) return;
        trackedRef.current.add(ad.id);
        trackImpression(supabase, ad.id);
    }, [idx, ads, supabase]);

    if (!ads.length) return null;

    const ad = ads[idx];

    // Dynamic inline styles only for the parts that Tailwind can't express
    // (background-image, transitions driven by JS state).
    const imgStyle = {
        backgroundImage: `url(${ad.image_url})`,
        opacity: visible ? 1 : 0,
        transform: visible
            ? "scale(1)"
            : animDir === "next" ? "scale(1.015)" : "scale(0.985)",
        transition: "opacity 0.18s ease, transform 0.18s ease",
    };

    const contentStyle = {
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.18s ease, transform 0.18s ease",
    };

    return (
        <div
            className="relative w-full rounded-[14px] overflow-hidden bg-[#111] cursor-pointer h-[clamp(140px,22vw,260px)] group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block w-full h-full relative no-underline"
                onClick={() => trackClick(supabase, ad.id)}
            >
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={imgStyle}
                />

                {/* Overlay gradient */}
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.08) 100%)" }}
                />

                {/* Content */}
                {(ad.title || ad.description) && (
                    <div
                        className="absolute bottom-0 left-0 p-5 sm:p-6 flex flex-col gap-1"
                        style={contentStyle}
                    >
                        {ad.title && (
                            <span
                                className="font-brand font-bold text-white leading-tight max-w-[420px]"
                                style={{ fontSize: "clamp(13px,1.8vw,18px)", letterSpacing: "-0.02em" }}
                            >
                                {ad.title}
                            </span>
                        )}
                        {ad.description && (
                            <span className="font-satoshi text-xs text-white/55 max-w-[360px] truncate">
                                {ad.description}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 mt-1.5 font-satoshi text-[11px] font-semibold text-white/70 border-b border-white/25 pb-px w-fit">
                            Learn more <ExternalLink size={10} />
                        </span>
                    </div>
                )}

                {/* Sponsored pill */}
                <span className="absolute top-2.5 right-2.5 font-satoshi text-[9px] font-bold tracking-[0.07em] uppercase text-white/35 bg-black/50 border border-white/10 rounded px-1.5 py-0.5">
                    Ad
                </span>
            </a>

            {/* Prev / Next */}
            {ads.length > 1 && (
                <>
                    <button
                        className="absolute top-1/2 -translate-y-1/2 left-2.5 w-7 h-7 rounded-full border border-white/15 bg-black/55 text-white flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        aria-label="Previous"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        className="absolute top-1/2 -translate-y-1/2 right-2.5 w-7 h-7 rounded-full border border-white/15 bg-black/55 text-white flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        onClick={(e) => { e.preventDefault(); next(); }}
                        aria-label="Next"
                    >
                        <ChevronRight size={14} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {ads.map((_, i) => (
                            <button
                                key={i}
                                className={`w-[5px] h-[5px] rounded-full border-none cursor-pointer transition-all duration-200 ${
                                    i === idx
                                        ? "bg-white scale-[1.3]"
                                        : "bg-white/25"
                                }`}
                                onClick={(e) => { e.preventDefault(); go(i, i > idx ? "next" : "prev"); }}
                                aria-label={`Go to ad ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Skeleton for ad banner
function AdBannerSkeleton() {
    return (
        <div
            className="w-full rounded-[14px] overflow-hidden h-[clamp(140px,22vw,260px)] animate-shimmer"
            style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.055) 50%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "200% 100%",
            }}
        />
    );
}

// ─── Mid-page ad strip ────────────────────────────────────────────────────────

function MidAdStrip({ ads, supabase }) {
    const trackedRef = useRef(new Set());

    useEffect(() => {
        ads.forEach((ad) => {
            if (trackedRef.current.has(ad.id)) return;
            trackedRef.current.add(ad.id);
            trackImpression(supabase, ad.id);
        });
    }, [ads, supabase]);

    if (!ads.length) return null;

    return (
        <div className="flex gap-3 flex-wrap">
            {ads.slice(0, 2).map((ad) => (
                <a
                    key={ad.id}
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="relative flex-1 min-w-[240px] flex gap-3.5 items-center px-4 py-3.5 rounded-xl no-underline bg-white/[0.03] border border-white/[0.07] overflow-hidden transition-all duration-150 hover:border-white/[0.13] hover:bg-white/[0.05]"
                    onClick={() => trackClick(supabase, ad.id)}
                >
                    {ad.image_url && (
                        <div
                            className="w-14 h-14 rounded-lg flex-shrink-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${ad.image_url})` }}
                        />
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        {ad.title && (
                            <p className="font-satoshi text-[13px] font-semibold text-[#c8c8c8] truncate">
                                {ad.title}
                            </p>
                        )}
                        {ad.description && (
                            <p className="font-satoshi text-[11px] text-[#555] truncate">
                                {ad.description}
                            </p>
                        )}
                        <span className="inline-flex items-center gap-[3px] mt-1.5 font-satoshi text-[11px] font-semibold text-white/40">
                            Visit <ExternalLink size={9} />
                        </span>
                    </div>
                    <span className="absolute top-[7px] right-2 font-satoshi text-[8.5px] font-bold tracking-[0.07em] uppercase text-white/20">
                        Sponsored
                    </span>
                </a>
            ))}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
    const shimmerStyle = {
        background: "linear-gradient(90deg, rgba(255,255,255,0.025) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.025) 75%)",
        backgroundSize: "200% 100%",
    };
    return (
        <div className="flex flex-col gap-2">
            <div
                className="w-full aspect-[2/3] rounded-[10px] animate-shimmer"
                style={shimmerStyle}
            />
            <div className="flex flex-col gap-[5px] px-0.5">
                <div
                    className="h-[9px] rounded-full animate-shimmer"
                    style={{ ...shimmerStyle, width: "75%" }}
                />
                <div
                    className="h-[9px] rounded-full animate-shimmer opacity-60"
                    style={{ ...shimmerStyle, width: "50%" }}
                />
            </div>
        </div>
    );
}

// ─── Netflix Row ──────────────────────────────────────────────────────────────

function PDFRow({ title, books, href, loading }) {
    const scrollRef          = useRef(null);
    const [canLeft,  setLeft]  = useState(false);
    const [canRight, setRight] = useState(true);

    const check = () => {
        const el = scrollRef.current;
        if (!el) return;
        setLeft(el.scrollLeft > 10);
        setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
        setTimeout(check, 420);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        check();
        el.addEventListener("scroll", check, { passive: true });
        return () => el.removeEventListener("scroll", check);
    }, [books]);

    if (!loading && !books.length) return null;

    return (
        <section className="relative group/row">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3.5 px-4 sm:px-6">
                <h2 className="font-brand font-bold text-[14px] text-[#d8d8d8]" style={{ letterSpacing: "-0.02em" }}>
                    {title}
                </h2>
                {href && !loading && (
                    <Link
                        href={href}
                        className="flex items-center gap-1 font-satoshi text-[11px] font-medium text-[#4a4a4a] no-underline opacity-0 group-hover/row:opacity-100 hover:!text-[#aaa] transition-all duration-200"
                    >
                        See all <ArrowRight size={10} />
                    </Link>
                )}
            </div>

            <div className="relative">
                {/* Left fade + arrow */}
                {canLeft && (
                    <div className="absolute top-0 bottom-2 left-0 z-10 flex items-center w-[52px]"
                         style={{ background: "linear-gradient(90deg, #080808 0%, transparent 100%)" }}>
                        <button
                            className="w-[30px] h-[30px] ml-1 rounded-full border border-white/10 bg-white/[0.07] text-[#ddd] flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 hover:scale-110 transition-all duration-200"
                            onClick={() => scroll(-1)}
                        >
                            <ChevronLeft size={15} />
                        </button>
                    </div>
                )}
                {/* Right fade + arrow */}
                {canRight && !loading && (
                    <div className="absolute top-0 bottom-2 right-0 z-10 flex items-center justify-end w-[52px]"
                         style={{ background: "linear-gradient(270deg, #080808 0%, transparent 100%)" }}>
                        <button
                            className="w-[30px] h-[30px] mr-1 rounded-full border border-white/10 bg-white/[0.07] text-[#ddd] flex items-center justify-center cursor-pointer opacity-0 group-hover/row:opacity-100 hover:scale-110 transition-all duration-200"
                            onClick={() => scroll(1)}
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}

                {/* Scroll track */}
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] px-4 sm:px-6 pb-2 [scroll-snap-type:x_mandatory]"
                >
                    {loading
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="w-[136px] min-w-[136px] flex-shrink-0 [scroll-snap-align:start]">
                                <SkeletonCard />
                            </div>
                        ))
                        : books.map((book) => (
                            <div key={book.id} className="w-[156px] min-w-[136px] flex-shrink-0 [scroll-snap-align:start]">
                                <PdfCard
                                    title={book.title}
                                    img_url={book.cover_image_url}
                                    genre={book.category}
                                    link={buildBookLink(book)}
                                />
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

// ─── Author Pill ──────────────────────────────────────────────────────────────

function AuthorPill({ name, count }) {
    return (
        <Link
            href={`/search?q=${encodeURIComponent(name)}`}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] no-underline bg-white/[0.03] border border-white/[0.07] min-w-[168px] flex-shrink-0 transition-all duration-150 hover:bg-white/[0.06] hover:border-white/[0.13]"
        >
            <div className="w-[30px] h-[30px] rounded-full flex-shrink-0 bg-white/[0.07] text-[#888] flex items-center justify-center font-brand font-bold text-xs">
                {name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-satoshi text-[12.5px] font-medium text-[#c0c0c0] truncate">
                    {name}
                </span>
                <span className="font-satoshi text-[10.5px] text-[#404040] font-normal">
                    {count} {count === 1 ? "book" : "books"}
                </span>
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
    const supabase = createClient();

    const [adsLoading, setAdsLoading] = useState(true);
    const [topAds,     setTopAds]     = useState([]);
    const [midAds,     setMidAds]     = useState([]);

    const [loading,  setLoading]  = useState(true);
    const [newBooks, setNewBooks] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [mostRead, setMostRead] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [authors,  setAuthors]  = useState([]);
    const [catRows,  setCatRows]  = useState([]);

    // Fetch ads
    useEffect(() => {
        async function loadAds() {
            const { data } = await supabase
                .from("advertisements")
                .select("id, title, description, image_url, link_url, position, display_order")
                .eq("is_active", true)
                .or("expires_at.is.null,expires_at.gt.now()")
                .order("display_order", { ascending: true });

            const all = data || [];
            setTopAds(all.filter((a) => a.position === "top" || !a.position));
            setMidAds(all.filter((a) => a.position === "mid"));
            setAdsLoading(false);
        }
        loadAds();
    }, []);

    // Fetch books
    useEffect(() => {
        async function load() {
            const [featRes, newRes, topRes, mostRes, authorRes, catRes] = await Promise.all([
                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url, summary, rating")
                    .eq("is_featured", true)
                    .order("download_count", { ascending: false })
                    .limit(12),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url")
                    .not("published_at", "is", null)
                    .order("published_at", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url")
                    .not("rating", "is", null)
                    .order("rating", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("id, title, author, category, cover_image_url")
                    .order("download_count", { ascending: false })
                    .limit(16),

                supabase.from("pdfs")
                    .select("author")
                    .not("author", "is", null),

                supabase.from("pdfs")
                    .select("category")
                    .not("category", "is", null),
            ]);

            setFeatured(featRes.data || []);
            setNewBooks(newRes.data  || []);
            setTopRated(topRes.data  || []);
            setMostRead(mostRes.data || []);

            if (authorRes.data) {
                const counts = authorRes.data.reduce((acc, { author }) => {
                    if (author) acc[author] = (acc[author] || 0) + 1;
                    return acc;
                }, {});
                setAuthors(
                    Object.entries(counts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 20)
                        .map(([name, count]) => ({ name, count }))
                );
            }

            if (catRes.data) {
                const counts = catRes.data.reduce((acc, { category }) => {
                    if (category) acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {});
                const top6 = Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([name]) => name);

                const previews = await Promise.all(
                    top6.map((name) =>
                        supabase.from("pdfs")
                            .select("id, title, author, category, cover_image_url")
                            .eq("category", name)
                            .limit(14)
                    )
                );

                setCatRows(
                    top6.map((name, i) => ({ name, books: previews[i].data || [] }))
                        .filter(({ books }) => books.length > 0)
                );
            }

            setLoading(false);
        }
        load();
    }, []);

    // Skeleton shimmer for author pills
    const authorSkeletonStyle = {
        background: "linear-gradient(90deg, rgba(255,255,255,0.025) 25%, rgba(255,255,255,0.045) 50%, rgba(255,255,255,0.025) 75%)",
        backgroundSize: "200% 100%",
    };

    return (
        <main className="min-h-screen text-white pt-20 sm:pl-20" style={{ background: "#080808" }}>

            {/* ── Top ad banner ─────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 pt-5 pb-3 max-w-6xl mx-auto">
                {adsLoading
                    ? <AdBannerSkeleton />
                    : topAds.length > 0 && (
                        <AdBannerSlider ads={topAds} supabase={supabase} />
                    )
                }
            </div>

            {/* ── All rows ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-16">

                <PDFRow title="Featured"       books={featured} href="/library/featured"       loading={loading} />
                <PDFRow title="New Releases"   books={newBooks} href="/library/new-releases"   loading={loading} />

                {/* Mid-page ad strip */}
                {!adsLoading && midAds.length > 0 && (
                    <div className="px-4 sm:px-6">
                        <MidAdStrip ads={midAds} supabase={supabase} />
                    </div>
                )}

                <PDFRow title="Top Rated"       books={topRated} href="/library/top-rated"       loading={loading} />
                <PDFRow title="Most Downloaded" books={mostRead} href="/library/most-downloaded" loading={loading} />

                {/* Top Authors */}
                {(loading || authors.length > 0) && (
                    <section>
                        <div className="flex items-center gap-2.5 mb-3.5 px-4 sm:px-6">
                            <h2 className="font-brand font-bold text-[14px] text-[#d8d8d8]" style={{ letterSpacing: "-0.02em" }}>
                                Top Authors
                            </h2>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] px-4 sm:px-6 pb-1.5">
                            {loading
                                ? Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="min-w-[168px] h-[52px] rounded-[10px] flex-shrink-0 animate-shimmer"
                                        style={authorSkeletonStyle}
                                    />
                                ))
                                : authors.map(({ name, count }) => (
                                    <AuthorPill key={name} name={name} count={count} />
                                ))
                            }
                        </div>
                    </section>
                )}

                {/* Category rows */}
                {loading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <PDFRow key={i} title="…" books={[]} loading={true} />
                    ))
                    : catRows.map(({ name, books }) => (
                        <PDFRow
                            key={name}
                            title={name}
                            books={books}
                            href={`/library/${toSlug(name)}`}
                            loading={false}
                        />
                    ))
                }
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            <footer className="border-t border-white/[0.05] py-7 px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 max-w-6xl mx-auto">
                    <span className="font-brand font-bold text-[14px] text-[#303030]" style={{ letterSpacing: "-0.02em" }}>
                        PDF Lovers
                    </span>
                    <div className="flex items-center gap-5 flex-wrap justify-center">
                        {[
                            ["About",      "/about-us"],
                            ["Library",    "/library"],
                            ["Blogs",      "/blogs"],
                            ["Contact",    "/contact-us"],
                            ["Privacy",    "/privacy"],
                            ["Terms",      "/terms"],
                            ["Disclaimer", "/disclaimer"],
                        ].map(([label, href]) => (
                            <Link
                                key={href}
                                href={href}
                                className="font-satoshi font-medium text-[12px] text-[#303030] no-underline hover:text-white transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <span className="font-satoshi font-medium text-[11px] text-[#252525]">
                        © {new Date().getFullYear()} PDF Lovers
                    </span>
                </div>
            </footer>
        </main>
    );
}