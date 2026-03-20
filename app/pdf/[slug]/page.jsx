// app/pdf/[slug]/page.jsx
"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    trackBookDownload,
    trackBookView,
    trackEvent,
} from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import PdfCard from "@/app/components/pdf/pdfCard";
import {
    Star, Download, ExternalLink, ChevronLeft,
    BookOpen, User, ArrowRight, Lock, Unlock,
    Check, Loader2, AlertCircle, Tag, Library,
    TrendingUp, Globe,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const GOOGLE_SMART_LINK = process.env.NEXT_PUBLIC_GOOGLE_SMART_LINK ?? "https://pdflovers.app";
const CLICKS_REQUIRED   = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str = "") {
    return str.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

async function downloadPdfInline(url, filename = "book.pdf") {
    const safeFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(safeFilename)}`;
    const a = document.createElement("a");
    a.href = proxyUrl;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ─── Star rating ──────────────────────────────────────────────────────────────
function StarRow({ rating }) {
    const filled = Math.round(rating ?? 0);
    return (
        <div className="flex items-center gap-[3px]">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={11}
                    fill={i < filled ? "#c8a44a" : "none"}
                    stroke={i < filled ? "#c8a44a" : "#2a2a2a"}
                />
            ))}
            <span className="ml-1.5 font-satoshi text-[12px] font-semibold text-[#ccc]">
                {Number(rating).toFixed(1)}
            </span>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ className = "" }) {
    return <div className={`rounded-md bg-white/[0.06] animate-pulse ${className}`} />;
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }) {
    return (
        <span className="font-satoshi text-[10.5px] font-black uppercase tracking-[0.11em] text-[#777]">
            {children}
        </span>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
    return <div className="border-t border-white/[0.1] my-7" />;
}

// ─── Download gate ────────────────────────────────────────────────────────────
function DownloadGate({ book }) {
    const [clicks,      setClicks]      = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [dlError,     setDlError]     = useState(null);
    const [dlDone,      setDlDone]      = useState(false);

    const smartLink = book?.smart_link ?? GOOGLE_SMART_LINK;
    const downloadUrl = book?.download_url ?? null;
    const title = book?.title ?? "book";

    const storageKey = `gate_${toSlug(title ?? "book")}`;

    useEffect(() => {
        const saved = parseInt(sessionStorage.getItem(storageKey) ?? "0", 10);
        if (!isNaN(saved) && saved > 0) setClicks(Math.min(saved, CLICKS_REQUIRED));
    }, [storageKey]);

    const unlocked  = clicks >= CLICKS_REQUIRED;
    const remaining = CLICKS_REQUIRED - clicks;

    const handleSmartClick = useCallback(() => {
        trackEvent("sponsor_visit", {
            item_id: book?.id ? String(book.id) : undefined,
            item_name: title,
            item_category: book?.category,
            source: book?.source,
            context: "book_download_gate",
        });
        window.open(smartLink, "_blank", "noopener,noreferrer");
        const next = Math.min(clicks + 1, CLICKS_REQUIRED);
        setClicks(next);
        sessionStorage.setItem(storageKey, String(next));
    }, [book?.category, book?.id, book?.source, clicks, smartLink, storageKey, title]);

    const handleDownload = useCallback(async () => {
        if (!downloadUrl) return;
        setDownloading(true);
        setDlError(null);
        try {
            const fname = (title ?? "book").replace(/[^a-z0-9\s-]/gi, "").trim();
            trackBookDownload(book, { method: "download_button" });
            await downloadPdfInline(downloadUrl, fname);
            setDlDone(true);
        } catch (err) {
            setDlError("Download failed. Use the direct link below.");
            console.error("Download error:", err.message);
        } finally {
            setDownloading(false);
        }
    }, [book, downloadUrl, title]);

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">

            {/* Step tracker */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center mb-2">
                    {Array.from({ length: CLICKS_REQUIRED }).map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black font-satoshi transition-all duration-300 ${
                                i < clicks
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                    : "bg-transparent border-white/20 text-[#888]"
                            }`}>
                                {i < clicks ? <Check size={9} strokeWidth={3} /> : i + 1}
                            </div>
                            <div className={`w-5 h-px transition-all duration-300 ${i < clicks ? "bg-emerald-500/40" : "bg-white/[0.12]"}`} />
                        </div>
                    ))}
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 ${
                        unlocked
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                            : "bg-transparent border-white/20 text-[#888]"
                    }`}>
                        <Download size={9} strokeWidth={2.5} />
                    </div>
                </div>
                <p className="font-satoshi text-[11.5px] font-medium text-[#999]">
                    {unlocked
                        ? "Unlocked — ready to download"
                        : `${remaining} sponsor visit${remaining !== 1 ? "s" : ""} left to unlock`}
                </p>
            </div>

            {/* Actions */}
            <div className="px-5 py-4 flex flex-col gap-2.5">
                {!unlocked ? (
                    <>
                        <button
                            onClick={handleSmartClick}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-[#c8a44a]/10 border border-[#c8a44a]/25 text-[#d4ac52] font-satoshi font-black text-[13px] hover:bg-[#c8a44a]/18 hover:border-[#c8a44a]/45 hover:text-[#e8c060] active:scale-[0.99] transition-all duration-150 cursor-pointer"
                        >
                            <ExternalLink size={13} strokeWidth={2.5} />
                            {clicks === 0 ? "Visit sponsor to unlock" : "One more visit to unlock"}
                        </button>
                        <p className="flex items-start gap-1.5 font-satoshi text-[11.5px] font-medium text-[#888] leading-[1.6]">
                            <Lock size={9} className="shrink-0 mt-[2px] text-[#666]" />
                            Visiting the sponsor {CLICKS_REQUIRED} times keeps this library free.
                        </p>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleDownload}
                            disabled={downloading || !downloadUrl}
                            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-white text-[#080808] font-satoshi font-black text-[13px] hover:bg-white/90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                        >
                            {downloading
                                ? <><Loader2 size={13} className="animate-spin" /> Preparing download…</>
                                : dlDone
                                ? <><Check size={13} strokeWidth={3} /> Download started</>
                                : <><Download size={13} strokeWidth={2.5} /> Download PDF — Free</>
                            }
                        </button>

                        {dlError && (
                            <p className="flex items-center gap-1.5 font-satoshi text-[11px] text-red-400">
                                <AlertCircle size={10} /> {dlError}
                            </p>
                        )}

                        <p className="flex items-center gap-1.5 font-satoshi text-[11.5px] font-semibold text-emerald-400">
                            <Unlock size={9} /> File saves directly — no new tab
                        </p>

                        <div className="flex items-center gap-4 pt-0.5">
                            {downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackBookDownload(book, { method: "direct_link" })}
                                    className="font-satoshi text-[11.5px] font-medium text-[#888] hover:text-[#ddd] transition-colors flex items-center gap-1"
                                >
                                    <ExternalLink size={9} /> Direct link
                                </a>
                            )}
                            <button
                                onClick={handleSmartClick}
                                className="font-satoshi text-[11.5px] font-medium text-[#888] hover:text-[#ddd] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <ExternalLink size={9} /> Visit sponsor
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Book detail rows (shared by card + mobile inline) ────────────────────────
function BookDetailRows({ book, isLibrary }) {
    const rows = [
        book.author         && { label: "Author",    value: book.author,                                   icon: <User size={10} />,     href: `/search?q=${encodeURIComponent(book.author)}` },
        book.category       && { label: "Category",  value: book.category,                                 icon: <Tag size={10} />,      href: `/library/${toSlug(book.category)}` },
        book.rating != null && { label: "Rating",    value: `${Number(book.rating).toFixed(1)} / 5.0`,     icon: <Star size={10} /> },
        book.download_count != null && { label: "Downloads", value: book.download_count.toLocaleString(),  icon: <Download size={10} /> },
        {                      label: "Source",      value: isLibrary ? "PDF Lovers Library" : "Web",      icon: isLibrary ? <Library size={10} /> : <Globe size={10} /> },
    ].filter(Boolean);

    return (
        <div className="divide-y divide-white/[0.05]">
            {rows.map(({ label, value, icon, href }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[#777]">{icon}</span>
                        <span className="font-satoshi text-[12px] font-semibold text-[#888]">{label}</span>
                    </div>
                    {href ? (
                        <Link
                            href={href}
                            className="font-satoshi text-[12px] font-medium text-[#ccc] hover:text-white transition-colors text-right max-w-[170px] truncate flex items-center gap-1 group"
                        >
                            {value}
                            <ArrowRight size={9} className="shrink-0 text-[#777] group-hover:text-white transition-colors" />
                        </Link>
                    ) : (
                        <span className="font-satoshi text-[12px] font-medium text-[#bbb] text-right max-w-[170px] truncate">
                            {value}
                        </span>
                    )}
                </div>
            ))}
            {/* Quick nav */}
            <div className="px-4 py-3 flex flex-col gap-2">
                {book.author && (
                    <Link
                        href={`/search?q=${encodeURIComponent(book.author)}`}
                        className="flex items-center gap-1 font-satoshi text-[11.5px] font-semibold text-[#888] hover:text-white transition-colors w-fit"
                    >
                        More by {book.author.split(" ").slice(-1)[0]} <ArrowRight size={9} />
                    </Link>
                )}
                {book.category && (
                    <Link
                        href={`/library/${toSlug(book.category)}`}
                        className="flex items-center gap-1 font-satoshi text-[11.5px] font-semibold text-[#888] hover:text-white transition-colors w-fit"
                    >
                        Browse {book.category} <ArrowRight size={9} />
                    </Link>
                )}
            </div>
        </div>
    );
}

// ─── Related books ────────────────────────────────────────────────────────────
function RelatedBooks({ category, excludeId, supabase }) {
    const [books,   setBooks]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category) return;
        supabase
            .from("pdfs")
            .select("id, title, author, category, cover_image_url")
            .eq("category", category)
            .neq("id", excludeId ?? 0)
            .order("download_count", { ascending: false })
            .limit(12)
            .then(({ data }) => { setBooks(data ?? []); setLoading(false); });
    }, [category, excludeId, supabase]);

    if (!category) return null;
    if (!loading && !books.length) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-brand font-extrabold text-[14px] tracking-tight text-white">
                    More in {category}
                </h2>
                <Link
                    href={`/library/${toSlug(category)}`}
                    className="flex items-center gap-1 font-satoshi text-[11.5px] font-semibold text-[#888] hover:text-white transition-colors"
                >
                    See all <ArrowRight size={9} />
                </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-[108px] min-w-[108px] shrink-0 flex flex-col gap-2">
                            <Skel className="w-full aspect-[2/3] !rounded-lg" />
                            <Skel className="h-2.5 w-3/4" />
                            <Skel className="h-2 w-1/2 opacity-60" />
                        </div>
                    ))
                    : books.map((b) => (
                        <div key={b.id} className="w-[158px] min-w-[108px] shrink-0">
                            <PdfCard
                                title={b.title}
                                img_url={b.cover_image_url}
                                genre={b.category}
                                link={`/pdf/${toSlug(b.title)}`}
                            />
                        </div>
                    ))
                }
            </div>
        </section>
    );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function PageSkeleton() {
    return (
        <div className="min-h-screen bg-[#080808] sm:pl-[68px]">
            <div className="max-w-[880px] mx-auto px-4 sm:px-6 pt-4">
                <Skel className="h-3.5 w-12 mb-8" />
                <div className="flex gap-5 sm:gap-8 mb-8">
                    <Skel className="w-[108px] sm:w-[148px] min-w-[108px] sm:min-w-[148px] aspect-[2/3] !rounded-xl" />
                    <div className="flex flex-col gap-3 flex-1 pt-1">
                        <Skel className="h-7 w-4/5" />
                        <Skel className="h-4 w-2/5" />
                        <Skel className="h-3 w-1/3" />
                        <div className="flex gap-1.5 mt-1">
                            <Skel className="h-6 w-20 !rounded-full" />
                            <Skel className="h-6 w-14 !rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/[0.06] my-7" />
                <Skel className="h-[180px] w-full sm:w-[400px] !rounded-2xl" />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PdfDetailPage({ params }) {
    const { slug }     = use(params);
    const searchParams = useSearchParams();
    const router       = useRouter();
    const supabase     = createClient();

    const isGoogle = searchParams.get("source") === "google";

    const [book,     setBook]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [notFound, setNotFound] = useState(false);
    const trackedViewRef = useRef("");

    useEffect(() => {
        async function fetchBook() {
            if (isGoogle) {
                const rawUrl = searchParams.get("url") ?? "";
                setBook({
                    id:              `google-${encodeURIComponent(rawUrl)}`,
                    title:           searchParams.get("title")    ?? "Unknown Title",
                    author:          searchParams.get("author")   ?? null,
                    category:        searchParams.get("category") ?? null,
                    cover_image_url: searchParams.get("cover")    ?? null,
                    summary:         searchParams.get("summary")  ?? null,
                    smart_link:      GOOGLE_SMART_LINK,
                    download_url:    rawUrl,
                    source:          "google",
                });
                setLoading(false);
                return;
            }

            const titleGuess = slug.replace(/-/g, " ");
            const SELECT = "id,title,author,category,tags,summary,cover_image_url,is_featured,public_id,rating,download_count,smart_link,download_url";

            const { data: d1, error: e1 } = await supabase
                .from("pdfs")
                .select(SELECT)
                .ilike("title", `%${titleGuess}%`)
                .limit(30);

            let match = (d1 ?? []).find((b) => toSlug(b.title) === slug);

            if (!match && !e1) {
                const words = titleGuess.split(" ").filter((w) => w.length > 2);
                if (words.length > 0) {
                    const orFilter = words.map((w) => `title.ilike.%${w}%`).join(",");
                    const { data: d2 } = await supabase
                        .from("pdfs")
                        .select(SELECT)
                        .or(orFilter)
                        .limit(50);
                    match = (d2 ?? []).find((b) => toSlug(b.title) === slug);
                }
            }

            if (!match) { setNotFound(true); setLoading(false); return; }
            setBook({ ...match, source: "library" });
            setLoading(false);
        }
        fetchBook();
    }, [slug, isGoogle]);

    useEffect(() => {
        if (!book) return;

        const key = `${book.id ?? slug}:${book.source ?? "library"}`;
        if (trackedViewRef.current === key) return;

        trackedViewRef.current = key;
        trackBookView(book);
    }, [book, slug]);

    if (loading)  return <PageSkeleton />;

    if (notFound) return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center sm:pl-[68px]">
            <div className="flex flex-col items-center gap-4 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <BookOpen size={20} className="text-[#555]" />
                </div>
                <div>
                    <p className="font-brand font-extrabold text-[18px] text-white mb-1.5">Book not found</p>
                    <p className="font-satoshi text-[13px] font-medium text-[#999]">We couldn&apos;t find this title in the library.</p>
                </div>
                <Link
                    href="/library"
                    className="font-satoshi text-[12.5px] font-semibold text-[#aaa] hover:text-white transition-colors flex items-center gap-1.5 border border-white/[0.12] rounded-xl px-4 py-2.5"
                >
                    Browse library <ArrowRight size={11} />
                </Link>
            </div>
        </div>
    );

    const hasTags   = Array.isArray(book.tags) && book.tags.length > 0;
    const isLibrary = book.source !== "google";

    return (
        <div className="min-h-screen bg-[#080808] text-white pt-20 pb-20 sm:pl-17">
            <div className="max-w-[1080px] mx-auto px-4 sm:px-6">

                {/* Back */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 py-5 font-satoshi text-[12.5px] font-semibold text-[#888] hover:text-white transition-colors"
                >
                    <ChevronLeft size={13} strokeWidth={2.5} /> Back
                </button>

                {/* ══ HERO ══════════════════════════════════════════════════ */}
                <div className="flex gap-5 sm:gap-8 mb-8">

                    {/* Cover */}
                    <div className="relative shrink-0">
                        {book.cover_image_url ? (
                            <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="w-[108px] sm:w-[148px] aspect-[2/3] rounded-xl object-cover border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.65)]"
                            />
                        ) : (
                            <div className="w-[108px] sm:w-[148px] aspect-[2/3] rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                <BookOpen size={26} className="text-[#2a2a2a]" />
                            </div>
                        )}
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-satoshi text-[8px] font-black uppercase tracking-widest text-white/50 bg-[#0e0e0e] border border-white/[0.1] rounded-md px-1.5 py-[3px]">
                            {isLibrary ? "Library" : "Web"}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center gap-2.5 min-w-0 flex-1 pt-1">

                        <h1
                            className="font-brand font-extrabold tracking-[-0.025em] leading-[1.1] text-white"
                            style={{ fontSize: "clamp(1.2rem, 4vw, 1.9rem)" }}
                        >
                            {book.title}
                        </h1>

                        {book.author && (
                            <Link
                                href={`/search?q=${encodeURIComponent(book.author)}`}
                                className="flex items-center gap-1.5 font-satoshi text-[13px] font-semibold text-[#aaa] hover:text-white transition-colors w-fit group"
                            >
                                <User size={11} className="text-[#777] group-hover:text-white transition-colors" />
                                {book.author}
                            </Link>
                        )}

                        {(book.rating != null || book.download_count != null) && (
                            <div className="flex items-center gap-3.5 flex-wrap">
                                {book.rating != null && <StarRow rating={book.rating} />}
                                {book.download_count != null && (
                                    <span className="flex items-center gap-1 font-satoshi text-[12px] font-semibold text-[#999]">
                                        <TrendingUp size={10} className="text-[#777]" />
                                        {book.download_count.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        )}

                        {(book.category || hasTags) && (
                            <div className="flex flex-wrap gap-1.5">
                                {book.category && (
                                    <Link
                                        href={`/library/${toSlug(book.category)}`}
                                        className="font-satoshi text-[11px] font-semibold text-[#999] bg-white/[0.06] border border-white/[0.1] rounded-full px-2.5 py-[3px] hover:text-white hover:bg-white/[0.1] hover:border-white/[0.18] transition-all"
                                    >
                                        {book.category}
                                    </Link>
                                )}
                                {hasTags && book.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="font-satoshi text-[11px] text-[#555] bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-[3px]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Summary preview — desktop only in hero, full text below */}
                        {book.summary && (
                            <p className="hidden sm:block font-satoshi text-[12.5px] text-[#666] leading-[1.8] line-clamp-3 max-w-[480px]">
                                {book.summary}
                            </p>
                        )}
                    </div>
                </div>

                <Divider />

                {/* ══ BODY ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-8 lg:gap-10 items-start">

                    {/* Left */}
                    <div className="flex flex-col gap-8 min-w-0">

                        {/* Download gate */}
                        <div>
                            <Label>Download</Label>
                            <div className="mt-3">
                                <DownloadGate
                                    book={book}
                                />
                            </div>
                        </div>

                        {/* About */}
                        {book.summary && (
                            <div>
                                <Label>About this book</Label>
                                <p className="mt-3 font-satoshi text-[14px] text-[#888] leading-[1.9]">
                                    {book.summary}
                                </p>
                            </div>
                        )}

                        {/* Book details — mobile only (inline) */}
                        <div className="lg:hidden">
                            <Label>Book details</Label>
                            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                                <BookDetailRows book={book} isLibrary={isLibrary} />
                            </div>
                        </div>
                    </div>

                    {/* Right — desktop sticky card */}
                    <aside className="hidden lg:block lg:sticky lg:top-6">
                        <Label>Book details</Label>
                        <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
                            <BookDetailRows book={book} isLibrary={isLibrary} />
                        </div>
                    </aside>
                </div>

                <Divider />

                {/* Related books */}
                {book.category && (
                    <RelatedBooks
                        category={book.category}
                        excludeId={book.id}
                        supabase={supabase}
                    />
                )}
            </div>
        </div>
    );
}
