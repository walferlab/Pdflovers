// app/blogs/[slug]/page.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    trackBlogFeedback,
    trackBlogRead,
    trackEvent,
} from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import BlogCard from "@/app/components/blogs/blogCard";
import {
    ThumbsUp, ThumbsDown, ChevronRight, ArrowLeft,
    ExternalLink, Share2, BookOpen, Clock, Tag,
    Copy, Check, Twitter, Link2
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

function formatDateShort(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

function estimateReadTime(html = "") {
    const text  = html.replace(/<[^>]*>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function getSessionKey() {
    if (typeof window === "undefined") return "";
    const key = "pdflovers_session";
    let val = localStorage.getItem(key);
    if (!val) {
        val = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem(key, val);
    }
    return val;
}

function extractHeadings(html = "") {
    if (typeof window === "undefined") return [];
    const div = document.createElement("div");
    div.innerHTML = html;
    const nodes = div.querySelectorAll("h2, h3");
    return Array.from(nodes).map((node, i) => {
        const id    = node.id || `heading-${i}`;
        const level = node.tagName.toLowerCase();
        const text  = node.textContent?.trim() || "";
        return { id, text, level };
    });
}

function injectHeadingIds(html = "") {
    let counter = 0;
    return html.replace(/<(h[23])((?:[^>](?!id=))*)>/gi, (match, tag, attrs) => {
        if (/id=/.test(attrs)) return match;
        return `<${tag}${attrs} id="heading-${counter++}">`;
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
}

// ─── Prose styles ─────────────────────────────────────────────────────────────

const proseCSS = `
.blog-prose {
    color: #c0c0c0;
    font-family: var(--font-satoshi, sans-serif);
    font-size: 16px;
    line-height: 1.85;
    font-weight: 420;
    word-break: break-word;
}
.blog-prose h1,
.blog-prose h2,
.blog-prose h3,
.blog-prose h4 {
    font-family: var(--font-brand, sans-serif);
    font-weight: 700;
    color: #efefef;
    letter-spacing: -0.025em;
    line-height: 1.25;
    margin-top: 2.4em;
    margin-bottom: 0.75em;
    scroll-margin-top: 96px;
}
.blog-prose h1 { font-size: 1.8rem; }
.blog-prose h2 {
    font-size: 1.35rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding-bottom: 0.45em;
}
.blog-prose h3 { font-size: 1.1rem; color: #e0e0e0; }
.blog-prose h4 { font-size: 1rem; color: #aaa; }
.blog-prose p  { margin-bottom: 1.4em; }
.blog-prose a  {
    color: #d8d8d8;
    text-decoration: underline;
    text-decoration-color: rgba(255,255,255,0.18);
    text-underline-offset: 3px;
    transition: color 0.15s, text-decoration-color 0.15s;
}
.blog-prose a:hover { color: #fff; text-decoration-color: rgba(255,255,255,0.5); }
.blog-prose ul,
.blog-prose ol  { padding-left: 1.6em; margin-bottom: 1.4em; }
.blog-prose li  { margin-bottom: 0.5em; }
.blog-prose ul li { list-style-type: disc; }
.blog-prose ol li { list-style-type: decimal; }
.blog-prose blockquote {
    border-left: 2px solid rgba(255,255,255,0.18);
    padding: 0.6em 0 0.6em 1.3em;
    margin: 1.8em 0;
    color: #888;
    font-style: italic;
    font-size: 1.05em;
}
.blog-prose code {
    font-family: var(--font-mono, monospace);
    font-size: 0.84em;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    padding: 0.15em 0.45em;
    color: #d4d4d4;
}
.blog-prose pre {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 1.2em 1.4em;
    overflow-x: auto;
    margin-bottom: 1.6em;
    font-size: 0.875em;
    line-height: 1.7;
}
.blog-prose pre code {
    background: none; border: none; padding: 0;
    font-size: inherit; color: #ccc;
}
.blog-prose img {
    max-width: 100%; border-radius: 10px;
    margin: 1.8em 0;
    border: 1px solid rgba(255,255,255,0.07);
    display: block;
}
.blog-prose table {
    width: 100%; border-collapse: collapse;
    margin-bottom: 1.6em; font-size: 0.9em;
}
.blog-prose th,
.blog-prose td {
    border: 1px solid rgba(255,255,255,0.07);
    padding: 0.6em 1em; text-align: left;
}
.blog-prose th {
    background: rgba(255,255,255,0.04);
    color: #d8d8d8; font-weight: 600;
}
.blog-prose hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin: 2.8em 0;
}
/* In-content ad slot */
.inline-ad-slot {
    margin: 2.5em 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
}
`;

// ─── Ad components ────────────────────────────────────────────────────────────

// Sidebar vertical ad
function SidebarAd({ ad, label = "Advertisement" }) {
    if (!ad) {
        return (
            <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-white/[0.02]">
                <div className="h-[160px] animate-pulse bg-white/[0.03]" />
                <div className="p-3 flex flex-col gap-2">
                    <div className="h-3 rounded-full animate-pulse bg-white/[0.05] w-3/4" />
                    <div className="h-2.5 rounded-full animate-pulse bg-white/[0.04] w-1/2" />
                    <div className="h-2.5 rounded-full animate-pulse bg-white/[0.03] w-2/3" />
                </div>
                <div className="px-3 pb-3">
                    <span className="font-satoshi text-[9px] font-semibold tracking-[0.08em] uppercase text-[#252525]">
                        {label}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block rounded-xl border border-white/[0.07] overflow-hidden bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04] transition-all duration-200 no-underline"
        >
            {ad.image_url && (
                <div className="h-[160px] overflow-hidden">
                    <img
                        src={ad.image_url}
                        alt={ad.title || "Ad"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        style={{ display: "block" }}
                    />
                </div>
            )}
            <div className="p-3.5 flex flex-col gap-1.5">
                {ad.title && (
                    <p className="font-satoshi font-semibold text-[13px] text-[#d0d0d0] leading-snug group-hover:text-white transition-colors duration-150">
                        {ad.title}
                    </p>
                )}
                {ad.description && (
                    <p className="font-satoshi text-[11.5px] text-[#555] leading-snug line-clamp-2">
                        {ad.description}
                    </p>
                )}
                <span className="inline-flex items-center gap-1 mt-0.5 font-satoshi text-[11px] font-semibold text-[#555] group-hover:text-[#888] transition-colors duration-150">
                    Visit <ExternalLink size={9} />
                </span>
            </div>
            <div className="px-3.5 pb-3">
                <span className="font-satoshi text-[9px] font-semibold tracking-[0.08em] uppercase text-[#282828]">
                    Sponsored
                </span>
            </div>
        </a>
    );
}

// Top strip ad — sits just below back-link, full article width
function TopBannerAd({ ad }) {
    if (!ad) return null;
    return (
        <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group relative flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200 px-3.5 py-2.5 no-underline overflow-hidden mb-8"
        >
            {ad.image_url && (
                <div className="w-8 h-8 rounded-md flex-shrink-0 overflow-hidden bg-white/[0.04]">
                    <img src={ad.image_url} alt="" className="w-full h-full object-cover" style={{ display: "block" }} />
                </div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-satoshi text-[9px] font-semibold tracking-[0.08em] uppercase text-[#303030] flex-shrink-0">
                    Ad
                </span>
                {ad.title && (
                    <span className="font-satoshi font-medium text-[12.5px] text-[#888] group-hover:text-[#bbb] transition-colors duration-150 truncate">
                        {ad.title}
                    </span>
                )}
            </div>
            <span className="flex-shrink-0 font-satoshi font-semibold text-[11px] text-[#555] group-hover:text-[#999] transition-colors duration-150 flex items-center gap-1">
                Visit <ExternalLink size={9} />
            </span>
        </a>
    );
}

// Horizontal banner ad — placed after article body, before tags
function BannerAd({ ad }) {
    if (!ad) {
        return (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-4 p-4 overflow-hidden">
                <div className="w-16 h-16 rounded-lg flex-shrink-0 animate-pulse bg-white/[0.04]" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 rounded-full animate-pulse bg-white/[0.05] w-1/2" />
                    <div className="h-2.5 rounded-full animate-pulse bg-white/[0.04] w-3/4" />
                </div>
                <div className="h-7 w-16 rounded-lg flex-shrink-0 animate-pulse bg-white/[0.04]" />
                <span className="absolute bottom-1.5 right-3 font-satoshi text-[8.5px] font-semibold tracking-[0.08em] uppercase text-[#222]">
                    Ad
                </span>
            </div>
        );
    }

    return (
        <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group relative flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200 p-4 no-underline overflow-hidden"
        >
            {/* subtle gradient shimmer */}
            <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
            {ad.image_url && (
                <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-white/[0.04]">
                    <img src={ad.image_url} alt={ad.title || "Ad"} className="w-full h-full object-cover" style={{ display: "block" }} />
                </div>
            )}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                {ad.title && (
                    <p className="font-satoshi font-semibold text-[13.5px] text-[#d0d0d0] leading-snug group-hover:text-white transition-colors duration-150 truncate">
                        {ad.title}
                    </p>
                )}
                {ad.description && (
                    <p className="font-satoshi text-[12px] text-[#555] leading-snug line-clamp-1">
                        {ad.description}
                    </p>
                )}
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 font-satoshi font-semibold text-[12px] text-[#606060] group-hover:text-[#a0a0a0] border border-white/[0.1] rounded-lg px-3 py-1.5 transition-all duration-150 group-hover:border-white/[0.2]">
                Visit <ExternalLink size={10} />
            </span>
            <span className="absolute bottom-1.5 right-3 font-satoshi text-[8.5px] font-semibold tracking-[0.08em] uppercase text-[#262626]">
                Sponsored
            </span>
        </a>
    );
}

// Small text-link ad — ultra-minimal, between TOC items
function TextLinkAd({ ad }) {
    if (!ad) return null;
    return (
        <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group flex items-start gap-2.5 px-2.5 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-150 no-underline"
        >
            {ad.image_url && (
                <img src={ad.image_url} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0 mt-0.5" style={{ display: "block" }} />
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
                <p className="font-satoshi font-semibold text-[11.5px] text-[#b0b0b0] group-hover:text-white transition-colors duration-150 leading-snug line-clamp-2">
                    {ad.title}
                </p>
                <span className="font-satoshi text-[9px] font-semibold tracking-[0.07em] uppercase text-[#2a2a2a]">
                    Sponsored
                </span>
            </div>
        </a>
    );
}

// ─── TOC Sidebar ──────────────────────────────────────────────────────────────

function TableOfContents({ headings, activeId }) {
    const [hoverId, setHoverId] = useState(null);

    if (!headings.length) return null;

    const handleClick = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            window.history.replaceState(null, "", `#${id}`);
        }
    };

    return (
        <nav style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <p className="font-satoshi font-semibold text-[10.5px] tracking-[0.07em] uppercase text-[#3a3a3a] mb-3">
                On this page
            </p>
            {headings.map(({ id, text, level }) => {
                const isActive = activeId === id;
                const isHover  = hoverId  === id;
                return (
                    <a
                        key={id}
                        href={`#${id}`}
                        onClick={(e) => handleClick(e, id)}
                        onMouseEnter={() => setHoverId(id)}
                        onMouseLeave={() => setHoverId(null)}
                        title={text}
                        style={{
                            display:        "block",
                            fontFamily:     "var(--font-satoshi, sans-serif)",
                            fontSize:       level === "h3" ? "11.5px" : "12px",
                            fontWeight:     500,
                            lineHeight:     "1.4",
                            paddingTop:     "5px",
                            paddingBottom:  "5px",
                            paddingLeft:    level === "h3" ? "16px" : "8px",
                            paddingRight:   "8px",
                            borderRadius:   "6px",
                            textDecoration: "none",
                            overflow:       "hidden",
                            whiteSpace:     "nowrap",
                            textOverflow:   "ellipsis",
                            transition:     "color 0.15s, background 0.15s, border-color 0.15s",
                            color:          isActive ? "#e8e8e8" : isHover ? "#909090" : "#484848",
                            background:     isActive ? "rgba(255,255,255,0.06)" : isHover ? "rgba(255,255,255,0.03)" : "transparent",
                            borderLeft:     isActive ? "2px solid rgba(255,255,255,0.25)" : "2px solid transparent",
                        }}
                    >
                        {text}
                    </a>
                );
            })}
        </nav>
    );
}

// ─── Share box ────────────────────────────────────────────────────────────────

function ShareBox({ title, slug }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== "undefined"
        ? `${window.location.origin}/blogs/${slug}`
        : `/blogs/${slug}`;

    const handleCopy = async () => {
        await copyToClipboard(url);
        trackEvent("share", {
            content_type: "blog",
            method: "copy_link",
            item_id: slug,
            item_name: title,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;

    return (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3">
            <p className="font-satoshi font-semibold text-[10.5px] tracking-[0.07em] uppercase text-[#3a3a3a]">
                Share
            </p>
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleCopy}
                    className="group flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-150"
                >
                    {copied
                        ? <Check size={13} className="text-[#5a5]" />
                        : <Link2 size={13} className="text-[#555] group-hover:text-[#999] transition-colors" />
                    }
                    <span className={`font-satoshi font-medium text-[12px] transition-colors duration-150 ${copied ? "text-[#5a5]" : "text-[#666] group-hover:text-[#aaa]"}`}>
                        {copied ? "Copied!" : "Copy link"}
                    </span>
                </button>
                <a
                    href={tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                        trackEvent("share", {
                            content_type: "blog",
                            method: "x",
                            item_id: slug,
                            item_name: title,
                        })
                    }
                    className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-150 no-underline"
                >
                    <Twitter size={13} className="text-[#555] group-hover:text-[#1d9bf0] transition-colors" />
                    <span className="font-satoshi font-medium text-[12px] text-[#666] group-hover:text-[#aaa] transition-colors duration-150">
                        Share on X
                    </span>
                </a>
            </div>
        </div>
    );
}

// ─── Reading progress bar ─────────────────────────────────────────────────────

function ReadingProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const el  = document.documentElement;
            const top = el.scrollTop || document.body.scrollTop;
            const h   = el.scrollHeight - el.clientHeight;
            setProgress(h > 0 ? Math.min(100, Math.round((top / h) * 100)) : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className="fixed top-0 left-0 z-50 h-[2px] bg-white/30 transition-all duration-75"
            style={{ width: `${progress}%` }}
        />
    );
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

function FeedbackBox({ blogId, supabase }) {
    const [vote,    setVote]    = useState(null);
    const [counts,  setCounts]  = useState({ yes: 0, no: 0 });
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const sessionKey = useRef("");

    useEffect(() => {
        if (!blogId) return;
        sessionKey.current = getSessionKey();

        async function load() {
            const [{ data: existing }, { data: all }] = await Promise.all([
                supabase
                    .from("blog_feedback")
                    .select("is_useful")
                    .eq("blog_id", blogId)
                    .eq("session_key", sessionKey.current)
                    .maybeSingle(),
                supabase
                    .from("blog_feedback")
                    .select("is_useful")
                    .eq("blog_id", blogId),
            ]);

            if (existing) setVote(existing.is_useful);
            if (all) {
                setCounts({
                    yes: all.filter((r) =>  r.is_useful).length,
                    no:  all.filter((r) => !r.is_useful).length,
                });
            }
            setChecked(true);
        }
        load();
    }, [blogId, supabase]);

    const handleVote = useCallback(async (isUseful) => {
        if (loading) return;
        const next = vote === isUseful ? null : isUseful;
        setLoading(true);

        if (next === null) {
            await supabase
                .from("blog_feedback")
                .delete()
                .eq("blog_id", blogId)
                .eq("session_key", sessionKey.current);
        } else {
            await supabase
                .from("blog_feedback")
                .upsert(
                    { blog_id: blogId, is_useful: next, session_key: sessionKey.current },
                    { onConflict: "blog_id,session_key" }
                );
        }

        setCounts((prev) => {
            const u = { ...prev };
            if (vote !== null) u[vote ? "yes" : "no"] = Math.max(0, u[vote ? "yes" : "no"] - 1);
            if (next !== null) u[next ? "yes" : "no"] += 1;
            return u;
        });

        setVote(next);
        setLoading(false);

        trackBlogFeedback(
            blogId,
            next === null ? "cleared" : next ? "helpful" : "not_helpful"
        );
    }, [loading, vote, blogId, supabase]);

    if (!checked) return null;

    const total = counts.yes + counts.no;
    const pct   = total > 0 ? Math.round((counts.yes / total) * 100) : null;

    return (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <p className="font-brand font-bold text-[15px] text-[#e0e0e0]" style={{ letterSpacing: "-0.02em" }}>
                    Was this article helpful?
                </p>
                {pct !== null && (
                    <div className="flex flex-col gap-2">
                        <p className="font-satoshi text-[11.5px] font-medium text-[#484848]">
                            {pct}% of {total} {total === 1 ? "reader" : "readers"} found this useful
                        </p>
                        {/* Progress bar */}
                        <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                            <div
                                className="h-full rounded-full bg-white/20 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3">
                {[
                    { val: true,  Icon: ThumbsUp,   label: "Yes", count: counts.yes },
                    { val: false, Icon: ThumbsDown,  label: "No",  count: counts.no  },
                ].map(({ val, Icon, label, count }) => (
                    <button
                        key={label}
                        onClick={() => handleVote(val)}
                        disabled={loading}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg border font-satoshi font-semibold text-[13px]
                            transition-all duration-150 cursor-pointer disabled:opacity-40
                            ${vote === val
                                ? "bg-white/[0.1] border-white/[0.22] text-white"
                                : "bg-white/[0.03] border-white/[0.07] text-[#686868] hover:bg-white/[0.07] hover:text-[#b0b0b0] hover:border-white/[0.14]"
                            }
                        `}
                    >
                        <Icon size={14} />
                        {label}
                        {count > 0 && (
                            <span className="text-[11px] font-medium opacity-50">({count})</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Related Blogs ────────────────────────────────────────────────────────────

function RelatedBlogs({ currentId, category, supabase }) {
    const [blogs,   setBlogs]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category) return;

        async function load() {
            const { data } = await supabase
                .from("blogs")
                .select("id, title, slug, excerpt, cover_image_url, category, tags, published_at")
                .eq("is_published", true)
                .ilike("category", category)
                .neq("id", currentId)
                .not("published_at", "is", null)
                .order("published_at", { ascending: false })
                .limit(3);

            setBlogs(data || []);
            setLoading(false);
        }
        load();
    }, [currentId, category, supabase]);

    if (!category) return null;
    if (!loading && !blogs.length) return null;

    return (
        <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2
                    className="font-brand font-bold text-[20px] text-[#e0e0e0]"
                    style={{ letterSpacing: "-0.025em" }}
                >
                    Related Posts
                </h2>
                <Link
                    href="/blogs"
                    className="flex items-center gap-1 font-satoshi font-medium text-[12px] text-[#404040] no-underline hover:text-[#777] transition-colors duration-150"
                >
                    All blogs <ChevronRight size={12} />
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-pulse">
                            <div className="h-36 bg-white/[0.04]" />
                            <div className="p-4 flex flex-col gap-2.5">
                                <div className="h-3 rounded-full bg-white/[0.05] w-4/5" />
                                <div className="h-2.5 rounded-full bg-white/[0.04] w-3/5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {blogs.map((blog) => (
                        <BlogCard
                            key={blog.id}
                            title={blog.title}
                            excerpt={blog.excerpt || ""}
                            coverImage={blog.cover_image_url || ""}
                            category={blog.category || ""}
                            tags={blog.tags || []}
                            date={formatDateShort(blog.published_at)}
                            href={`/blogs/${blog.slug}`}
                            size="sm"
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="font-brand font-bold text-[18px] text-[#383838]" style={{ letterSpacing: "-0.02em" }}>
                Post not found.
            </p>
            <Link href="/blogs" className="font-satoshi font-medium text-[13px] text-[#484848] no-underline hover:text-[#888] transition-colors flex items-center gap-1">
                <ArrowLeft size={13} /> Back to blogs
            </Link>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
    const bar = (w, h = "h-3", extra = "") => (
        <div className={`${h} rounded-full ${w} ${extra} animate-pulse`} style={{ background: "rgba(255,255,255,0.05)" }} />
    );
    return (
        <div className="flex gap-10">
            <aside className="hidden xl:flex flex-col gap-2 w-[200px] flex-shrink-0 pt-2">
                {bar("w-2/3", "h-2.5", "mb-3")}
                {[...Array(6)].map((_, i) => bar("w-full", "h-2.5", `opacity-${70 - i * 10}`))}
            </aside>
            <div className="flex-1 flex flex-col gap-5 min-w-0">
                {bar("w-1/3", "h-3")}
                {bar("w-5/6", "h-8")}
                {bar("w-2/3", "h-8")}
                {bar("w-1/3", "h-2.5", "mt-2")}
                <div className="h-56 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                {[...Array(6)].map((_, i) => bar("w-full", "h-3", `opacity-${80 - i * 8}`))}
            </div>
            <aside className="hidden lg:flex flex-col gap-4 w-[240px] flex-shrink-0">
                <div className="h-[200px] rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            </aside>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogDetailPage() {
    const { slug }   = useParams();
    const [supabase] = useState(createClient);

    const [blog,          setBlog]          = useState(null);
    const [notFound,      setNotFound]      = useState(false);
    const [loading,       setLoading]       = useState(true);
    const [ads,           setAds]           = useState([]);     // all active ads

    const [headings,      setHeadings]      = useState([]);
    const [activeId,      setActiveId]      = useState("");
    const [processedHtml, setProcessedHtml] = useState("");

    const articleRef = useRef(null);
    const trackedReadRef = useRef("");

    // ── Fetch blog + ads ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!slug) return;

        async function load() {
            const [{ data: blogData }, { data: adsData }] = await Promise.all([
                supabase
                    .from("blogs")
                    .select("id, title, slug, excerpt, content_html, cover_image_url, category, tags, published_at")
                    .eq("slug", slug)
                    .eq("is_published", true)
                    .single(),

                supabase
                    .from("advertisements")
                    .select("id, title, description, image_url, link_url")
                    .eq("is_active", true)
                    .or("expires_at.is.null,expires_at.gt.now()")
                    .limit(5),           // grab up to 5 — assign to different slots
            ]);

            if (!blogData) { setNotFound(true); setLoading(false); return; }

            const html = injectHeadingIds(blogData.content_html || "");
            setProcessedHtml(html);
            setBlog(blogData);
            setAds(adsData || []);
            setHeadings(extractHeadings(html));
            setLoading(false);
        }
        load();
    }, [slug, supabase]);

    // ── Active heading tracker ────────────────────────────────────────────────
    useEffect(() => {
        if (!headings.length || !articleRef.current) return;

        const els = headings
            .map(({ id }) => document.getElementById(id))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveId(visible[0].target.id);
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
        );

        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [headings]);

    // ─────────────────────────────────────────────────────────────────────────

    const readTime = blog ? estimateReadTime(blog.content_html) : null;

    useEffect(() => {
        if (loading || !blog) return;

        const key = `${blog.id}:${blog.slug}`;
        if (trackedReadRef.current === key) return;

        trackedReadRef.current = key;
        trackBlogRead(blog, {
            read_time_minutes: readTime,
        });
    }, [blog, loading, readTime]);

    // Ad slot helpers — fall back to null (skeleton) if not enough ads
    if (notFound) return (
        <main className="min-h-screen pt-20 sm:pl-20" style={{ background: "#080808" }}>
            <NotFound />
        </main>
    );

    const adTop       = ads[0] ?? null;   // top strip below back-link
    const adSidebar1  = ads[1] ?? null;   // right sidebar primary
    const adSidebar2  = ads[2] ?? null;   // right sidebar secondary
    const adMid       = ads[3] ?? null;   // horizontal banner after content body
    const adTextLink  = ads[4] ?? null;   // left TOC sidebar text-link

    return (
        <main className="min-h-screen text-white pt-20 sm:pl-20" style={{ background: "#080808" }}>
            <style>{proseCSS}</style>

            {/* ── Reading progress bar ───────────────────────────────── */}
            <ReadingProgress />

            <div className="max-w-[1260px] mx-auto px-4 sm:px-6 sm:pt-10 pb-32">
                {loading ? (
                    <PageSkeleton />
                ) : (
                    <div className="flex gap-8 xl:gap-12 items-start">

                        {/* ══ LEFT SIDEBAR ══════════════════════════════════ */}
                        <aside className="hidden xl:flex flex-col gap-5 w-[200px] flex-shrink-0 sticky top-24 self-start">
                            <TableOfContents headings={headings} activeId={activeId} />

                            

                            {/* Text-link ad in TOC sidebar */}
                            {adTextLink && <TextLinkAd ad={adTextLink} />}
                        </aside>

                        {/* ══ MAIN ARTICLE ══════════════════════════════════ */}
                        <article className="flex-1 min-w-0 max-w-[740px]" ref={articleRef}>

                            {/* Back link */}
                            <Link
                                href="/blogs"
                                className="inline-flex items-center gap-1.5 font-satoshi font-medium text-[12px] text-[#424242] no-underline hover:text-[#888] transition-colors mb-5"
                            >
                                <ArrowLeft size={13} /> All blogs
                            </Link>

                            {/* ── Top ad strip ─────────────────────────────── */}
                            <TopBannerAd ad={adTop} />

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                {blog.category && (
                                    <span className="font-satoshi font-semibold text-[10px] tracking-[0.06em] uppercase text-[#e8e8e8] bg-white/[0.08] border border-white/[0.1] rounded-md px-2.5 py-0.5">
                                        {blog.category}
                                    </span>
                                )}
                                {blog.published_at && (
                                    <span className="inline-flex items-center gap-1.5 font-satoshi font-medium text-[12px] text-[#484848]">
                                        <Clock size={11} className="opacity-60" />
                                        {formatDate(blog.published_at)}
                                    </span>
                                )}
                                {readTime && (
                                    <>
                                        <span className="text-[#303030]">·</span>
                                        <span className="inline-flex items-center gap-1.5 font-satoshi font-medium text-[12px] text-[#484848]">
                                            <BookOpen size={11} className="opacity-60" />
                                            {readTime} min read
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Title */}
                            <h1
                                className="font-brand font-bold text-[clamp(1.7rem,3.5vw,2.5rem)] text-[#f2f2f2] leading-tight mb-5"
                                style={{ letterSpacing: "-0.03em" }}
                            >
                                {blog.title}
                            </h1>

                            {/* Excerpt */}
                            {blog.excerpt && (
                                <p className="font-satoshi font-medium text-[16px] text-[#636363] leading-relaxed mb-8 border-l-2 border-white/[0.09] pl-4">
                                    {blog.excerpt}
                                </p>
                            )}

                            {/* Cover image */}
                            {blog.cover_image_url && (
                                <div className="w-full rounded-xl overflow-hidden mb-10 border border-white/[0.07]">
                                    <img
                                        src={blog.cover_image_url}
                                        alt={blog.title}
                                        className="w-full object-cover max-h-[440px]"
                                        style={{ display: "block" }}
                                    />
                                </div>
                            )}

                            {/* Mobile TOC */}
                            {headings.length > 2 && (
                                <details className="xl:hidden mb-8 rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                                    <summary className="px-4 py-3 font-satoshi font-semibold text-[12.5px] text-[#888] cursor-pointer select-none list-none flex items-center justify-between">
                                        <span>On this page</span>
                                        <ChevronRight size={13} className="rotate-90" />
                                    </summary>
                                    <div className="px-4 pb-4 border-t border-white/[0.06]">
                                        <div className="pt-3">
                                            <TableOfContents headings={headings} activeId={activeId} />
                                        </div>
                                    </div>
                                </details>
                            )}

                            {/* ── Content ──────────────────────────────────── */}
                            <div
                                className="blog-prose"
                                dangerouslySetInnerHTML={{ __html: processedHtml }}
                            />

                            {/* ── Mid ad — after article body, before tags ── */}
                            {adMid && (
                                <div className="mt-10 mb-2">
                                    <BannerAd ad={adMid} />
                                </div>
                            )}

                            {/* Tags */}
                            {blog.tags?.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/[0.07]">
                                    <Tag size={12} className="text-[#383838]" />
                                    {blog.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="font-satoshi font-medium text-[11px] text-[#565656] bg-white/[0.04] border border-white/[0.07] rounded-full px-3 py-1 hover:text-[#909090] hover:border-white/[0.12] transition-colors duration-150 cursor-default"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Feedback */}
                            <div className="mt-10">
                                <FeedbackBox blogId={blog.id} supabase={supabase} />
                            </div>

                            {/* Related blogs */}
                            <RelatedBlogs
                                currentId={blog.id}
                                category={blog.category}
                                supabase={supabase}
                            />
                        </article>

                        {/* ══ RIGHT SIDEBAR ═════════════════════════════════ */}
                        <aside className="hidden lg:flex flex-col gap-4 w-[240px] flex-shrink-0 sticky top-24 self-start">

                            {/* Ad slot 1 — primary sidebar */}
                            <SidebarAd ad={adSidebar1} />

                            {/* Share box */}
                            <ShareBox title={blog.title} slug={blog.slug} />

                            {/* Quick metadata card */}
                            {(blog.tags?.length > 0 || blog.category) && (
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3.5">
                                    {blog.category && (
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-satoshi font-semibold text-[10px] tracking-[0.07em] uppercase text-[#383838]">
                                                Category
                                            </p>
                                            <p className="font-satoshi font-medium text-[13px] text-[#a8a8a8]">
                                                {blog.category}
                                            </p>
                                        </div>
                                    )}
                                    {blog.published_at && (
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-satoshi font-semibold text-[10px] tracking-[0.07em] uppercase text-[#383838]">
                                                Published
                                            </p>
                                            <p className="font-satoshi font-medium text-[13px] text-[#a8a8a8]">
                                                {formatDate(blog.published_at)}
                                            </p>
                                        </div>
                                    )}
                                    {readTime && (
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-satoshi font-semibold text-[10px] tracking-[0.07em] uppercase text-[#383838]">
                                                Read time
                                            </p>
                                            <p className="font-satoshi font-medium text-[13px] text-[#a8a8a8]">
                                                {readTime} min
                                            </p>
                                        </div>
                                    )}
                                    {blog.tags?.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <p className="font-satoshi font-semibold text-[10px] tracking-[0.07em] uppercase text-[#383838]">
                                                Tags
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {blog.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="font-satoshi font-medium text-[10.5px] text-[#505050] bg-white/[0.04] border border-white/[0.07] rounded-full px-2 py-0.5"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Ad slot 2 — secondary sidebar */}
                            <SidebarAd ad={adSidebar2} label="Promoted" />

                        </aside>

                    </div>
                )}
            </div>
        </main>
    );
}
