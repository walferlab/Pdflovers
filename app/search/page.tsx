"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
    useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Loader2, Search, X, Clock, ArrowRight, BookOpen } from "lucide-react";
import { trackSearch } from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import { buildPdfDetailHref } from "@/lib/pdf-links";
import PdfCard from "@/app/components/pdf/pdfCard";
import AdCard from "@/app/components/ads/AdCard"; 

// ─── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CX = process.env.NEXT_PUBLIC_GOOGLE_CX;
const GOOGLE_COUNT = 10;
const MAX_GOOGLE_START = 91;
const LIBRARY_PAGE_SIZE = 24;
const LIBRARY_CANDIDATE_LIMIT = 60;
const POPULAR_FALLBACK_LIMIT = 120;
const SEARCH_DEBOUNCE_MS = 280;
const MAX_RECENT_SEARCHES = 6;
const RECENT_SEARCHES_KEY = "pl_recent_searches";
// Insert an ad slot after every Nth book card
const AD_EVERY_N = 6;

const LIBRARY_SELECT = [
    "id", "title", "author", "category", "tags", "summary",
    "cover_image_url", "is_featured", "public_id", "rating",
    "download_count", "smart_link", "download_url",
].join(", ");

const TRENDING = [
    "Atomic Habits", "The Alchemist", "Rich Dad Poor Dad", "1984",
    "Sapiens", "Think and Grow Rich", "The 48 Laws of Power",
    "Psychology of Money", "Deep Work", "Man's Search for Meaning",
];

const SYNONYM_MAP: Record<string, string[]> = {
    "finance": ["money", "wealth", "investing", "financial"],
    "money": ["finance", "wealth", "rich", "investing"],
    "self help": ["self-improvement", "personal development", "motivation"],
    "sci fi": ["science fiction", "scifi"],
    "science fiction": ["sci fi", "scifi"],
    "bio": ["biography", "memoir", "autobiography"],
    "biography": ["bio", "memoir", "life story"],
    "history": ["historical", "ancient", "civilization"],
    "biz": ["business", "entrepreneurship", "startup"],
    "business": ["entrepreneurship", "startup", "management"],
    "philosophy": ["philosophical", "ethics", "wisdom"],
    "health": ["wellness", "medicine", "fitness", "nutrition"],
    "fiction": ["novel", "story", "literary"],
};

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchPhase = "idle" | "loading-db" | "done";
type GooglePhase = "idle" | "loading" | "done";

type SearchBook = {
    id: number | string;
    title: string;
    author: string | null;
    category: string | null;
    tags?: string[] | null;
    summary?: string | null;
    cover_image_url: string | null;
    displayLink?: string | null;
    is_featured?: boolean | null;
    public_id?: string | null;
    rating?: number | null;
    download_count?: number | null;
    smart_link?: string | null;
    download_url?: string | null;
    link?: string;
    source?: "library" | "google";
};

type SearchPlan = {
    raw: string;
    normalized: string;
    tokens: string[];
    phraseVariants: string[];
    tokenVariants: string[];
    synonymTokens: string[];
};

type SearchState = {
    phase: SearchPhase;
    googlePhase: GooglePhase;
    featured: SearchBook[];
    dbBooks: SearchBook[];
    visibleDbCount: number;
    googleBooks: SearchBook[];
    googleStart: number;
    googleHasMore: boolean;
    loadingMore: boolean;
    activeCategory: string | null;
};

type GoogleSearchItem = {
    title?: string;
    link: string;
    displayLink?: string;
    snippet?: string;
    pagemap?: {
        metatags?: Array<Record<string, string>>;
        cse_image?: Array<{ src: string }>;
        cse_thumbnail?: Array<{ src: string }>;
    };
};

type GoogleSearchResponse = { items?: GoogleSearchItem[] };
type GoogleRequestResult = { books: SearchBook[]; status: "ok" | "error" | "rate_limited" };
type GooglePageResult = { books: SearchBook[]; queryUsed: string | null; status: "ok" | "error" | "rate_limited" };

const INITIAL_STATE: SearchState = {
    phase: "idle", googlePhase: "idle",
    featured: [], dbBooks: [], visibleDbCount: LIBRARY_PAGE_SIZE,
    googleBooks: [], googleStart: 1, googleHasMore: false,
    loadingMore: false, activeCategory: null,
};

const googleResultCache = new Map<string, SearchBook[]>();
let googleRateLimitUntil = 0;

// ─── Text utilities ───────────────────────────────────────────────────────────

function uniqueValues(values: string[]) { return [...new Set(values.filter(Boolean))]; }
function normalizeWhitespace(value = "") { return value.trim().replace(/\s+/g, " "); }
function stripDiacritics(value = "") { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); }
function collapseRepeatedLetters(value = "") { return value.replace(/(.)\1{2,}/g, "$1$1"); }
function normalizeSearchText(value = "") {
    return collapseRepeatedLetters(
        stripDiacritics(value).toLowerCase()
            .replace(/&/g, " and ").replace(/['\u2019]/g, "")
            .replace(/[^a-z0-9\s-]/g, " ").replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ").trim()
    );
}
function singularizeToken(token: string) {
    if (token.endsWith("ies") && token.length > 4) return `${token.slice(0, -3)}y`;
    if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) return token.slice(0, -1);
    return token;
}
function expandSynonyms(normalized: string): string[] {
    const extras: string[] = [];
    for (const [key, syns] of Object.entries(SYNONYM_MAP))
        if (normalized.includes(key)) extras.push(...syns);
    return extras;
}
function buildSearchPlan(query: string): SearchPlan {
    const raw = normalizeWhitespace(query);
    const normalized = normalizeSearchText(raw);
    const tokens = uniqueValues(normalized.split(" ").filter((t) => t.length > 1));
    const tokenVariants = uniqueValues(
        tokens.flatMap((t) => [t, singularizeToken(t), collapseRepeatedLetters(t)]).filter((t) => t.length > 1)
    ).slice(0, 8);
    const synonymTokens = uniqueValues(
        expandSynonyms(normalized).flatMap((s) => normalizeSearchText(s).split(" ")).filter((t) => t.length > 1)
    ).slice(0, 6);
    return {
        raw, normalized, tokens,
        phraseVariants: uniqueValues([normalized, tokenVariants.join(" ")].filter(Boolean)).slice(0, 4),
        tokenVariants, synonymTokens,
    };
}

// ─── Recent searches ──────────────────────────────────────────────────────────

function getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"); } catch { return []; }
}
function addRecentSearch(query: string) {
    if (!query.trim() || typeof window === "undefined") return;
    try {
        const existing = getRecentSearches().filter((q) => q.toLowerCase() !== query.toLowerCase());
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([query, ...existing].slice(0, MAX_RECENT_SEARCHES)));
    } catch { /* noop */ }
}
function removeRecentSearch(query: string) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(getRecentSearches().filter((q) => q !== query)));
    } catch { /* noop */ }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

function escapeLikeValue(value: string) { return value.replace(/[%_]/g, "").trim(); }
function buildOrFilters(values: string[], fields: string[]) {
    return uniqueValues(values.map(escapeLikeValue)).filter((v) => v.length > 1)
        .flatMap((v) => fields.map((f) => `${f}.ilike.%${v}%`)).join(",");
}
function mergeUniqueBooks(...cols: SearchBook[][]) {
    const seen = new Map<string, SearchBook>();
    for (const books of cols)
        for (const b of books) {
            const k = String(b.id ?? b.link ?? `${b.title}-${b.author ?? ""}`);
            if (!seen.has(k)) seen.set(k, b);
        }
    return [...seen.values()];
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function limitedLevenshtein(a: string, b: string, max: number) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let r = 1; r <= a.length; r++) {
        const cur = [r]; let rowMin = r;
        for (let c = 1; c <= b.length; c++) {
            const v = Math.min(prev[c] + 1, cur[c - 1] + 1, prev[c - 1] + (a[r - 1] === b[c - 1] ? 0 : 1));
            cur[c] = v; rowMin = Math.min(rowMin, v);
        }
        if (rowMin > max) return max + 1;
        for (let c = 0; c < cur.length; c++) prev[c] = cur[c];
    }
    return prev[b.length];
}
function classifyTokenMatch(token: string, fieldText: string, fieldWords: string[]) {
    if (!token) return "none";
    if (fieldWords.includes(token)) return "exact";
    if (fieldWords.some((w) => w.startsWith(token) || w.includes(token) || token.startsWith(w)) || fieldText.includes(token)) return "partial";
    const maxDist = token.length >= 7 ? 2 : 1;
    if (fieldWords.some((w) => limitedLevenshtein(token, w, maxDist) <= maxDist)) return "near";
    return "none";
}
function phraseScore(fieldText: string, phrase: string, exact: number, prefix: number, partial: number) {
    if (!fieldText || !phrase) return 0;
    if (fieldText === phrase) return exact;
    if (fieldText.startsWith(phrase)) return prefix;
    if (fieldText.includes(phrase)) return partial;
    return 0;
}
function scoreLibraryBook(book: SearchBook, plan: SearchPlan) {
    const title = normalizeSearchText(book.title ?? "");
    const author = normalizeSearchText(book.author ?? "");
    const category = normalizeSearchText(book.category ?? "");
    const summary = normalizeSearchText(book.summary ?? "");
    const tags = normalizeSearchText(Array.isArray(book.tags) ? book.tags.join(" ") : "");
    const tw = title.split(" ").filter(Boolean), aw = author.split(" ").filter(Boolean),
        cw = category.split(" ").filter(Boolean), sw = summary.split(" ").filter(Boolean),
        gw = tags.split(" ").filter(Boolean);
    let score = 0, matched = 0;
    if (title === plan.normalized) score += 80;
    score += phraseScore(title, plan.normalized, 200, 160, 120);
    score += phraseScore(author, plan.normalized, 130, 100, 75);
    score += phraseScore(category, plan.normalized, 85, 70, 55);
    score += phraseScore(tags, plan.normalized, 85, 65, 50);
    score += phraseScore(summary, plan.normalized, 45, 35, 22);
    for (const t of plan.tokens) {
        let best = "none";
        for (const [m, base] of [
            [classifyTokenMatch(t, title, tw), 20], [classifyTokenMatch(t, author, aw), 15],
            [classifyTokenMatch(t, category, cw), 11], [classifyTokenMatch(t, tags, gw), 11],
            [classifyTokenMatch(t, summary, sw), 5],
        ] as [string, number][]) {
            if (m === "exact") { score += base; best = "exact"; break; }
            if (m === "partial" && best === "none") { score += Math.round(base * 0.7); best = "partial"; }
            if (m === "near" && best === "none") { score += Math.round(base * 0.5); best = "near"; }
        }
        if (best !== "none") matched++;
    }
    for (const syn of plan.synonymTokens)
        if (classifyTokenMatch(syn, title, tw) !== "none" || classifyTokenMatch(syn, category, cw) !== "none") score += 8;
    if (plan.tokens.length > 0 && matched === plan.tokens.length) score += 28;
    else if (matched > 0) score += matched * 5;
    score += Math.min((book.download_count ?? 0) / 500, 8);
    score += Math.min(Math.max((book.rating ?? 0) - 3, 0) * 2, 5);
    if (book.cover_image_url) score += 3;
    if (book.is_featured) score += 8;
    return Math.round(score);
}
function minimumScore(plan: SearchPlan) { return plan.tokens.length <= 1 ? 18 : 24; }
function rankLibraryBooks(books: SearchBook[], plan: SearchPlan) {
    return books
        .map((b) => ({ book: b, score: scoreLibraryBook(b, plan) }))
        .filter(({ score }) => score >= minimumScore(plan))
        .sort((l, r) => {
            if (r.score !== l.score) return r.score - l.score;
            const ld = l.book.download_count ?? 0, rd = r.book.download_count ?? 0;
            if (rd !== ld) return rd - ld;
            return l.book.title.localeCompare(r.book.title);
        })
        .map(({ book }) => ({ ...book, source: "library" as const }));
}

// ─── Supabase fetcher ─────────────────────────────────────────────────────────

async function runLibraryQuery(query: PromiseLike<{ data: unknown; error: unknown }>) {
    try {
        const { data, error } = await query;
        if (error || !Array.isArray(data)) return [];
        return data as SearchBook[];
    } catch { return []; }
}
async function fetchLibraryBooks(supabase: ReturnType<typeof createClient>, plan: SearchPlan, signal: AbortSignal) {
    if (!plan.normalized) return [];
    const q = () => supabase.from("pdfs").select(LIBRARY_SELECT).abortSignal(signal);
    const phraseF = buildOrFilters(plan.phraseVariants, ["title", "author", "category", "summary"]);
    const tokenF = buildOrFilters(plan.tokenVariants, ["title", "author", "category", "summary"]);
    const synF = plan.synonymTokens.length > 0 ? buildOrFilters(plan.synonymTokens, ["title", "category", "tags", "summary"]) : null;
    const tasks = [
        runLibraryQuery(q().textSearch("search_document", plan.raw, { type: "websearch", config: "english" }).order("download_count", { ascending: false }).limit(LIBRARY_CANDIDATE_LIMIT)),
        ...(plan.normalized !== plan.raw.toLowerCase() ? [runLibraryQuery(q().textSearch("search_document", plan.normalized, { type: "websearch", config: "english" }).order("download_count", { ascending: false }).limit(LIBRARY_CANDIDATE_LIMIT))] : []),
        ...(phraseF ? [runLibraryQuery(q().or(phraseF).order("download_count", { ascending: false }).limit(LIBRARY_CANDIDATE_LIMIT))] : []),
        ...(tokenF && tokenF !== phraseF ? [runLibraryQuery(q().or(tokenF).order("download_count", { ascending: false }).limit(LIBRARY_CANDIDATE_LIMIT * 2))] : []),
        ...(synF ? [runLibraryQuery(q().or(synF).order("download_count", { ascending: false }).limit(LIBRARY_CANDIDATE_LIMIT))] : []),
    ];
    let candidates = mergeUniqueBooks(...await Promise.all(tasks));
    if (!signal.aborted && candidates.length < 8 && plan.tokens.some((t) => t.length >= 3))
        candidates = mergeUniqueBooks(candidates, await runLibraryQuery(q().order("download_count", { ascending: false }).limit(POPULAR_FALLBACK_LIMIT)));
    return rankLibraryBooks(candidates, plan);
}

// ─── Google search ────────────────────────────────────────────────────────────

function buildGoogleQueryVariants(plan: SearchPlan) {
    return uniqueValues([plan.raw, plan.normalized, plan.tokens.slice(0, 6).join(" ")].map(normalizeWhitespace).filter(Boolean));
}
function buildGoogleCacheKey(query: string, startIndex: number) { return `${normalizeSearchText(query)}::${startIndex}`; }
async function requestGoogleBooks(query: string, startIndex = 1, signal?: AbortSignal): Promise<GoogleRequestResult> {
    if (!normalizeWhitespace(query) || !GOOGLE_API_KEY || !GOOGLE_CX) return { books: [], status: "error" };
    const cacheKey = buildGoogleCacheKey(query, startIndex);
    if (googleResultCache.has(cacheKey)) return { books: googleResultCache.get(cacheKey) || [], status: "ok" };
    if (googleRateLimitUntil > Date.now()) return { books: [], status: "rate_limited" };
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", GOOGLE_API_KEY); url.searchParams.set("cx", GOOGLE_CX);
    url.searchParams.set("q", `${query} filetype:pdf`); url.searchParams.set("num", String(GOOGLE_COUNT));
    url.searchParams.set("start", String(startIndex)); url.searchParams.set("safe", "active");
    try {
        const res = await fetch(url.toString(), { signal, cache: "no-store" });
        if (res.status === 429 || res.status === 403) { googleRateLimitUntil = Date.now() + 60_000; return { books: [], status: "rate_limited" }; }
        if (!res.ok) return { books: [], status: "error" };
        const data = (await res.json()) as GoogleSearchResponse;
        if (!Array.isArray(data.items)) { googleResultCache.set(cacheKey, []); return { books: [], status: "ok" }; }
        const books = data.items.map((item) => ({
            id: `google-${encodeURIComponent(item.link)}`,
            title: item.title?.replace(/\s*[-|]\s*.*$/, "")?.replace(/\.pdf$/i, "")?.trim() || "Unknown Title",
            author: item.pagemap?.metatags?.[0]?.author || item.pagemap?.metatags?.[0]?.["dc.creator"] || null,
            category: item.pagemap?.metatags?.[0]?.["dc.subject"] || null,
            cover_image_url: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src || null,
            summary: item.snippet ?? null, displayLink: item.displayLink ?? null, link: item.link,
            source: "google" as const,
        }));
        googleResultCache.set(cacheKey, books);
        return { books, status: "ok" };
    } catch { return { books: [], status: "error" }; }
}
async function fetchBestGoogleBooks(plan: SearchPlan, startIndex = 1, signal?: AbortSignal, preferredQuery?: string): Promise<GooglePageResult> {
    const queries = preferredQuery ? [preferredQuery] : buildGoogleQueryVariants(plan);
    for (const query of queries) {
        const result = await requestGoogleBooks(query, startIndex, signal);
        if (result.status === "rate_limited") return { books: [], queryUsed: null, status: "rate_limited" };
        if (result.books.length > 0) return { books: result.books, queryUsed: query, status: "ok" };
    }
    return { books: [], queryUsed: preferredQuery || queries[0] || null, status: "ok" };
}

// ─── Ad-injected grid ─────────────────────────────────────────────────────────

/**
 * Renders books in a responsive grid, injecting an <AdCard /> cell
 * after every AD_EVERY_N books. The ad occupies one column naturally.
 */
function CardGridWithAds({ books }: { books: SearchBook[] }) {
    const cells: React.ReactNode[] = [];

    books.forEach((book, i) => {
        cells.push(
            <div
                key={String(book.id)}
                className="card-cell"
                style={{ animationDelay: `${Math.min(i * 26, 280)}ms` }}
            >
                <PdfCard
                    title={book.title}
                    img_url={book.cover_image_url}
                    genre={book.category}
                    link={buildPdfDetailHref(book)}
                />
                {book.source === "google" && book.displayLink && (
                    <span className="google-domain">{book.displayLink.replace(/^www\./, "")}</span>
                )}
            </div>
        );

        // After every AD_EVERY_N books (but not at the very end), splice in an ad
        if ((i + 1) % AD_EVERY_N === 0 && i < books.length - 1) {
            cells.push(
                <div
                    key={`ad-${i}`}
                    className="card-cell ad-cell"
                    style={{ animationDelay: `${Math.min((i + 1) * 26, 280)}ms` }}
                >
                    <AdCard />
                </div>
            );
        }
    });

    return (
        <div className="books-grid">
            {cells}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="flex flex-col gap-2.5 w-full">
            <div className="skel-cover" />
            <div className="skel-line" style={{ width: "72%" }} />
            <div className="skel-line" style={{ width: "48%", opacity: 0.55 }} />
        </div>
    );
}
function SkeletonGrid({ count = 12 }: { count?: number }) {
    return (
        <div className="books-grid">
            {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
    );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ initialValue, onSearch }: { initialValue: string; onSearch: (v: string) => void }) {
    const [value, setValue] = useState(initialValue);
    const [recent, setRecent] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setValue(initialValue); }, [initialValue]);
    useEffect(() => { if (open) setRecent(getRecentSearches()); }, [open]);

    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && document.activeElement !== inputRef.current) {
                e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select();
            }
            if (e.key === "Escape") inputRef.current?.blur();
        };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, []);

    const fire = (v: string) => {
        if (debRef.current) clearTimeout(debRef.current);
        debRef.current = setTimeout(() => onSearch(v), SEARCH_DEBOUNCE_MS);
    };
    const pick = (term: string) => {
        setValue(term); addRecentSearch(term); onSearch(term);
        setOpen(false); inputRef.current?.blur();
    };
    const removeItem = (e: React.MouseEvent, term: string) => {
        e.stopPropagation(); removeRecentSearch(term); setRecent(getRecentSearches());
    };

    return (
        <div className="relative">
            <div className="sb-wrap">
                <Search size={15} className="sb-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => { setValue(e.target.value); fire(e.target.value); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 160)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (debRef.current) clearTimeout(debRef.current);
                            if (value.trim()) addRecentSearch(value.trim());
                            onSearch(value); setOpen(false); inputRef.current?.blur();
                        }
                    }}
                    placeholder="Search books, authors, topics…"
                    className="sb-input"
                    autoComplete="off"
                    spellCheck={false}
                />
                {value && (
                    <button type="button" onClick={() => { setValue(""); onSearch(""); inputRef.current?.focus(); }} className="sb-clear" aria-label="Clear">
                        <X size={12} />
                    </button>
                )}
                <kbd className="sb-kbd">⌘K</kbd>
            </div>

            {open && (
                <div className="sb-dropdown">
                    {recent.length > 0 && (
                        <div className="sb-group">
                            <p className="sb-group-label"><Clock size={10} /> Recent</p>
                            {recent.map((t) => (
                                <button key={t} className="sb-row" onMouseDown={() => pick(t)}>
                                    <span className="flex-1 text-left truncate">{t}</span>
                                    <span className="sb-row-action" onMouseDown={(e) => removeItem(e, t)}><X size={11} /></span>
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="sb-group">
                        <p className="sb-group-label"><TrendingUp size={10} /> Trending</p>
                        {TRENDING.slice(0, 5).map((t) => (
                            <button key={t} className="sb-row" onMouseDown={() => pick(t)}>
                                <span className="flex-1 text-left truncate">{t}</span>
                                <ArrowRight size={11} className="sb-row-action" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Category chips ───────────────────────────────────────────────────────────

function CategoryChips({ books, active, onSelect }: { books: SearchBook[]; active: string | null; onSelect: (c: string | null) => void }) {
    const categories = useMemo(() => {
        const counts = new Map<string, number>();
        for (const b of books) if (b.category) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
        return [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([cat, count]) => ({ cat, count }));
    }, [books]);
    if (!categories.length) return null;
    return (
        <div className="flex flex-wrap gap-1.5 mb-4">
            <button onClick={() => onSelect(null)} className={`chip ${active === null ? "chip-on" : ""}`}>All</button>
            {categories.map(({ cat, count }) => (
                <button key={cat} onClick={() => onSelect(active === cat ? null : cat)} className={`chip ${active === cat ? "chip-on" : ""}`}>
                    {cat} <span className="chip-count">{count}</span>
                </button>
            ))}
        </div>
    );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, label }: { icon: typeof BookOpen; label: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <Icon size={12} className="sec-icon" />
            <span className="sec-label">{label}</span>
        </div>
    );
}

// ─── Default screen ───────────────────────────────────────────────────────────

function DefaultScreen({ onTrendingClick }: { onTrendingClick: (t: string) => void }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={12} className="sec-icon" />
                <span className="sec-label">Trending</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {TRENDING.map((term, i) => (
                    <button
                        key={term}
                        onClick={() => onTrendingClick(term)}
                        className="trend-pill"
                        style={{ animationDelay: `${i * 30}ms` }}
                    >
                        {term}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const css = `
/* grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 16px;
}
@media (min-width: 640px)  { .books-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 768px)  { .books-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .books-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 1280px) { .books-grid { grid-template-columns: repeat(6, 1fr); } }

/* card cell */
.card-cell { animation: fade-up .3s both; }
@keyframes fade-up { from { opacity:0; transform:translateY(7px) } to { opacity:1; transform:translateY(0) } }

/* ad cell */
.ad-cell { position: relative; }
.ad-label {
  display: inline-block; margin-bottom: 4px;
  font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: #4a4a4a; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 3px; padding: 1px 5px;
  font-family: var(--font-satoshi, sans-serif);
}

/* google source */
.google-domain {
  display: block; margin-top: 3px;
  font-size: 10px; color: #505050; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
  font-family: var(--font-satoshi, sans-serif);
}

/* search bar */
.sb-wrap {
  position: relative; display: flex; align-items: center;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 11px; transition: border-color .16s, box-shadow .16s;
}
.sb-wrap:focus-within { border-color: rgba(255,255,255,0.15); box-shadow: 0 0 0 3px rgba(255,255,255,0.03); }
.sb-icon { position: absolute; left: 14px; color: #585858; pointer-events: none; flex-shrink: 0; }
.sb-input {
  width: 100%; background: transparent; border: none; outline: none;
  color: #d8d8d8; font-size: 14px; font-weight: 450; letter-spacing: -.01em;
  padding: 12px 52px 12px 40px; font-family: var(--font-satoshi, sans-serif);
}
.sb-input::placeholder { color: #484848; }
.sb-clear {
  position: absolute; right: 46px; width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06); color: #666; border: none; cursor: pointer;
  transition: background .14s;
}
.sb-clear:hover { background: rgba(255,255,255,0.1); color: #aaa; }
.sb-kbd {
  position: absolute; right: 13px; font-size: 10px; color: #505050;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px; padding: 1px 5px; pointer-events: none; user-select: none;
  font-family: var(--font-satoshi, sans-serif);
}
.sb-dropdown {
  position: absolute; top: calc(100% + 5px); left: 0; right: 0;
  background: #0d0d0d; border: 1px solid rgba(255,255,255,0.09); border-radius: 11px;
  z-index: 50; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.7);
  animation: dd-in .13s ease;
}
@keyframes dd-in { from { opacity:0; transform:translateY(-3px) } to { opacity:1; transform:none } }
.sb-group { padding: 8px 0; }
.sb-group + .sb-group { border-top: 1px solid rgba(255,255,255,0.06); }
.sb-group-label {
  display: flex; align-items: center; gap: 5px; padding: 4px 14px;
  font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #505050;
  font-family: var(--font-satoshi, sans-serif);
}
.sb-row {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 14px;
  background: none; border: none; color: #808080; font-size: 13px; cursor: pointer;
  transition: background .1s, color .1s; font-family: var(--font-satoshi, sans-serif);
}
.sb-row:hover { background: rgba(255,255,255,0.04); color: #c8c8c8; }
.sb-row-action { color: #505050; transition: color .14s; flex-shrink: 0; }
.sb-row:hover .sb-row-action { color: #707070; }

/* chips */
.chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 500; padding: 4px 11px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: #707070; cursor: pointer; transition: border-color .15s, color .15s;
  font-family: var(--font-satoshi, sans-serif);
}
.chip:hover { border-color: rgba(255,255,255,0.14); color: #b0b0b0; }
.chip-on { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.07); color: #e0e0e0; }
.chip-count { font-size: 10px; color: #585858; background: rgba(255,255,255,0.05); border-radius: 999px; padding: 0 4px; }
.chip-on .chip-count { color: #909090; }

/* section */
.sec-icon { color: #606060; }
.sec-label {
  font-size: 10.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #606060;
  font-family: var(--font-satoshi, sans-serif);
}

/* trending pills */
.trend-pill {
  font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);
  color: #686868; cursor: pointer; transition: border-color .15s, color .15s;
  animation: fade-up .32s both; font-family: var(--font-satoshi, sans-serif);
}
.trend-pill:hover { border-color: rgba(255,255,255,0.16); color: #d8d8d8; }

/* skeletons */
.skel-cover {
  width: 100%; aspect-ratio: 2/3; border-radius: 9px;
  background: linear-gradient(90deg, rgba(255,255,255,0.025) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.025) 75%);
  background-size: 200% 100%; animation: shimmer 1.7s infinite;
}
.skel-line {
  height: 9px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,0.025) 25%, rgba(255,255,255,0.045) 50%, rgba(255,255,255,0.025) 75%);
  background-size: 200% 100%; animation: shimmer 1.7s infinite;
}
@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }

/* results count */
.res-count {
  font-size: 11.5px; color: #5a5a5a; margin-bottom: 10px;
  font-family: var(--font-satoshi, sans-serif);
}
`;

// ─── Search inner ─────────────────────────────────────────────────────────────

function SearchInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [supabase] = useState(createClient);
    const [state, setState] = useState<SearchState>(INITIAL_STATE);

    const query = normalizeWhitespace(searchParams.get("q") || "");
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const activeQueryRef = useRef("");
    const activeGoogleQueryRef = useRef("");
    const activePlanRef = useRef<SearchPlan | null>(null);
    const requestIdRef = useRef(0);
    const trackedSearchRef = useRef("");
    const hasGoogleSearch = Boolean(GOOGLE_API_KEY && GOOGLE_CX);

    const runSearch = useEffectEvent(async (nextQuery: string) => {
        const plan = buildSearchPlan(nextQuery);
        activePlanRef.current = plan;
        const requestId = ++requestIdRef.current;
        activeQueryRef.current = nextQuery;
        activeGoogleQueryRef.current = "";

        setState({
            phase: "loading-db",
            googlePhase: hasGoogleSearch ? "loading" : "idle",
            featured: [], dbBooks: [], visibleDbCount: LIBRARY_PAGE_SIZE,
            googleBooks: [], googleStart: 1, googleHasMore: false,
            loadingMore: false, activeCategory: null,
        });

        const ctrl = new AbortController();

        // Library + Google fire in parallel — no gatekeeping
        const [libraryBooks, gr] = await Promise.all([
            fetchLibraryBooks(supabase, plan, ctrl.signal),
            hasGoogleSearch
                ? fetchBestGoogleBooks(plan, 1, ctrl.signal)
                : Promise.resolve(null),
        ]);

        if (requestIdRef.current !== requestId) { ctrl.abort(); return; }

        const featured = libraryBooks.filter((b) => b.is_featured);
        const dbBooks  = libraryBooks.filter((b) => !b.is_featured);
        if (gr) activeGoogleQueryRef.current = gr.queryUsed || "";

        setState({
            phase: "done",
            googlePhase: hasGoogleSearch ? "done" : "idle",
            featured,
            dbBooks,
            visibleDbCount: LIBRARY_PAGE_SIZE,
            googleBooks: gr?.books ?? [],
            googleStart: 1,
            googleHasMore: gr
                ? Boolean(gr.queryUsed) && gr.books.length === GOOGLE_COUNT && 1 + GOOGLE_COUNT <= MAX_GOOGLE_START
                : false,
            loadingMore: false,
            activeCategory: null,
        });
    });

    const loadMore = useCallback(async () => {
        if (state.phase !== "done" || !activeQueryRef.current) return;
        if (state.visibleDbCount < state.dbBooks.length) {
            setState((s) => ({ ...s, visibleDbCount: Math.min(s.visibleDbCount + LIBRARY_PAGE_SIZE, s.dbBooks.length) }));
            return;
        }
        if (state.loadingMore || !hasGoogleSearch || !activePlanRef.current) return;
        if (state.googlePhase === "done" && !state.googleHasMore) return;
        const requestId = requestIdRef.current;
        const nextStart = state.googlePhase === "idle" ? 1 : state.googleStart + GOOGLE_COUNT;
        setState((s) => ({ ...s, googlePhase: s.googlePhase === "idle" ? "loading" : s.googlePhase, loadingMore: true }));
        const gr = await fetchBestGoogleBooks(activePlanRef.current, nextStart, undefined, state.googlePhase === "done" ? activeGoogleQueryRef.current : undefined);
        if (requestIdRef.current !== requestId) return;
        if (gr.queryUsed) activeGoogleQueryRef.current = gr.queryUsed;
        setState((s) => ({ ...s, googlePhase: "done", googleBooks: nextStart === 1 ? gr.books : mergeUniqueBooks(s.googleBooks, gr.books), googleStart: nextStart, googleHasMore: Boolean(activeGoogleQueryRef.current) && gr.books.length === GOOGLE_COUNT && nextStart + GOOGLE_COUNT <= MAX_GOOGLE_START, loadingMore: false }));
    }, [hasGoogleSearch, state.dbBooks.length, state.googleHasMore, state.googlePhase, state.googleStart, state.loadingMore, state.phase, state.visibleDbCount]);

    useEffect(() => {
        if (!query) {
            activeQueryRef.current = "";
            activeGoogleQueryRef.current = "";
            activePlanRef.current = null;
            requestIdRef.current += 1;
            queueMicrotask(() => setState(INITIAL_STATE));
            return;
        }
        const t = window.setTimeout(() => void runSearch(query), 0);
        return () => window.clearTimeout(t);
    }, [query]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver((e) => { if (e[0]?.isIntersecting) void loadMore(); }, { rootMargin: "400px" });
        obs.observe(el);
        return () => obs.disconnect();
    }, [loadMore]);

    const handleSearch = useCallback((val: string) => {
        const t = normalizeWhitespace(val);
        router.push(t ? `/search?q=${encodeURIComponent(t)}` : "/search", { scroll: false } as never);
    }, [router]);

    const handleTrending = (term: string) => { addRecentSearch(term); router.push(`/search?q=${encodeURIComponent(term)}`); };

    const isLoadingDb      = Boolean(query) && state.phase === "loading-db";
    const isLoadingGoogle  = Boolean(query) && state.googlePhase === "loading";

    const filteredFeatured = state.activeCategory ? state.featured.filter((b) => b.category === state.activeCategory) : state.featured;
    const filteredDb       = state.activeCategory ? state.dbBooks.filter((b) => b.category === state.activeCategory) : state.dbBooks;
    const visibleDb        = filteredDb.slice(0, state.visibleDbCount);
    const filteredGoogle   = state.activeCategory ? state.googleBooks.filter((b) => b.category === state.activeCategory) : state.googleBooks;

    // Single flat list: featured → library → google
    const allBooks  = useMemo(
        () => [...filteredFeatured, ...visibleDb, ...filteredGoogle],
        [filteredFeatured, visibleDb, filteredGoogle]
    );
    const hasAny    = allBooks.length > 0 || isLoadingGoogle;
    const totalCount = state.featured.length + state.dbBooks.length + state.googleBooks.length;
    const allDb     = useMemo(() => mergeUniqueBooks(state.featured, state.dbBooks), [state.featured, state.dbBooks]);

    useEffect(() => {
        if (!query || state.phase !== "done") return;

        const signature = query;
        if (trackedSearchRef.current === signature) return;

        trackedSearchRef.current = signature;
        trackSearch(query, {
            results_count: totalCount,
            library_results: state.featured.length + state.dbBooks.length,
            web_results: state.googleBooks.length,
        });
    }, [
        query,
        state.dbBooks.length,
        state.featured.length,
        state.googleBooks.length,
        state.phase,
        totalCount,
    ]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-24">

                {/* Page title */}
                <h1
                    className="font-brand font-bold tracking-[-0.03em] leading-none mb-3"
                    style={{
                        fontSize: "clamp(1.25rem,2.2vw,1.75rem)",
                        background: "linear-gradient(150deg,#c8c8c8 30%,#555 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}
                >
                    {query || "Discover books"}
                </h1>

                {/* Inline search */}
                <div className="mb-5">
                    <SearchBar initialValue={query} onSearch={handleSearch} />
                </div>

                {/* Default / no query */}
                {!query && <DefaultScreen onTrendingClick={handleTrending} />}

                {/* Loading */}
                {isLoadingDb && <SkeletonGrid count={12} />}

                {/* Results */}
                {!isLoadingDb && query && hasAny && (
                    <div>
                        {/* Result count + category chips */}
                        {totalCount > 0 && (
                            <p className="res-count">{totalCount} result{totalCount !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>
                        )}
                        {allDb.length > 0 && (
                            <CategoryChips
                                books={allDb}
                                active={state.activeCategory}
                                onSelect={(c) => setState((s) => ({ ...s, activeCategory: c }))}
                            />
                        )}

                        {/* Unified grid — featured → library → google, no section labels */}
                        {allBooks.length > 0 && <CardGridWithAds books={allBooks} />}

                        {/* Skeleton rows appended while Google is still loading */}
                        {isLoadingGoogle && (
                            <div className="books-grid mt-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="skel-cover" />
                                        <div className="skel-line w-3/4" />
                                        <div className="skel-line w-1/2" style={{ opacity: 0.6 }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div ref={sentinelRef} className="h-4 mt-4" />

                        {state.loadingMore && (
                            <div className="flex justify-center py-6">
                                <Loader2 size={14} className="animate-spin" style={{ color: "#555" }} />
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {state.phase === "done" && state.googlePhase !== "loading" && query && !hasAny && (
                    <div className="flex flex-col items-center py-24 gap-4 text-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <Search size={15} style={{ color: "#444" }} />
                        </div>
                        <p className="font-brand font-semibold" style={{ fontSize: 16, color: "#666", letterSpacing: "-0.015em" }}>
                            Nothing found for &ldquo;{query}&rdquo;
                        </p>
                        <p style={{ fontSize: 13, color: "#505050", fontFamily: "var(--font-satoshi, sans-serif)" }}>
                            Try a different title, author, or topic
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-1">
                            {TRENDING.slice(0, 5).map((term) => (
                                <button key={term} className="trend-pill" onClick={() => handleTrending(term)}>{term}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function SearchPage() {
    return (
        <main className="min-h-screen text-white pt-10 p-2 sm:pl-20" style={{ background: "#080808" }}>
            <Suspense>
                <SearchInner />
            </Suspense>
        </main>
    );
}
