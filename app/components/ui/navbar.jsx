"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    Menu,
    Search,
    House,
    LibraryBig,
    BookHeart,
    ArrowLeft,
    X,
    Upload,
    DollarSign,
    MessageSquareHeart,
} from "lucide-react";

const NAV_ITEMS = [
    { icon: House,      label: "Home",    href: "/" },
    { icon: Search,     label: "Search",  href: "/search" },
    { icon: LibraryBig, label: "Library", href: "/library" },
    { icon: MessageSquareHeart, label: "Request PDF", href: "/request-pdf" },
    { icon: BookHeart,  label: "Blogs",   href: "/blogs" },
    { icon: DollarSign,  label: "Support",   href: "/support" },
];

const SECONDARY_ITEMS = [
    { label: "About us",   href: "/about-us" },
    { label: "Contact us", href: "/contact-us" },
    { label: "Terms",      href: "/terms" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar({ onMenuToggle }) {
    const [activeSearch, setActiveSearch] = useState(false);
    const [query, setQuery]               = useState("");
    const inputRef                        = useRef(null);
    const router                          = useRouter();

    const openSearch = () => {
        setActiveSearch(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setActiveSearch(false);
        setQuery("");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        closeSearch();
    };

    return (
        <header
            className="fixed top-0 left-0 right-0 z-99 h-14.5 flex items-center px-4 gap-3"
            style={{
                background: "rgba(8,8,8,0.9)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            {/* ── MOBILE LAYOUT ── */}
            <div className="flex sm:hidden w-full items-center gap-3">
                {activeSearch ? (
                    <>
                        {/* Back */}
                        <button
                            onClick={closeSearch}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#888] hover:text-white shrink-0 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        {/* Search input */}
                        <form onSubmit={handleSearch} className="flex-1 flex items-center h-9 rounded-full px-3 gap-2"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <Search size={13} className="text-[#555] shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                                className="flex-1 bg-transparent text-[13px] text-white placeholder-[#444] outline-none font-satoshi"
                            />
                            {query && (
                                <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                    className="text-[#555] hover:text-white transition-colors">
                                    <X size={13} />
                                </button>
                            )}
                        </form>
                    </>
                ) : (
                    <>
                        {/* Hamburger */}
                        <button
                            onClick={onMenuToggle}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#ddd] hover:text-white shrink-0 transition-colors"
                        >
                            <Menu size={18} />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="font-brand font-bold text-white text-[16px] tracking-[-0.02em] flex-1">
                            PDF Lovers
                        </Link>

                        {/* Search icon */}
                        <button
                            onClick={openSearch}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#888] hover:text-white transition-colors"
                        >
                            <Search size={18} />
                        </button>

                        {/* Upload */}
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[#888] hover:text-white transition-colors"
                            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                            <Upload size={15} />
                        </button>
                    </>
                )}
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden sm:flex w-full items-center gap-4">
                {/* Hamburger */}
                <button
                    onClick={onMenuToggle}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-[#ddd] hover:text-white hover:bg-white/6 transition-all shrink-0"
                >
                    <Menu size={18} />
                </button>

                {/* Logo */}
                <Link href="/" className="font-brand font-bold text-white text-[17px] tracking-[-0.02em] shrink-0 hover:opacity-80 transition-opacity">
                    PDF Lovers
                </Link>

                {/* Search */}
                <div className="flex-1 flex justify-center">
                    <form
                        onSubmit={handleSearch}
                        className="w-full max-w-sm flex items-center h-9 rounded-full px-4 gap-2 transition-all duration-200"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onFocus={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.18)"}
                        onBlur={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"}
                    >
                        <Search size={13} className="text-[#555] shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search books, authors, topics…"
                            className="flex-1 bg-transparent text-[13px] text-white placeholder-[#444] outline-none font-satoshi min-w-0"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")}
                                className="text-[#555] hover:text-white transition-colors shrink-0">
                                <X size={13} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Upload */}
                <button
                    className="flex items-center gap-2 h-8 px-4 rounded-full text-[13px] font-satoshi font-medium text-white transition-all hover:opacity-80 shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                    <Upload size={13} />
                    Upload
                </button>
            </div>
        </header>
    );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
export function MobileDrawer({ open, onClose }) {
    const pathname = usePathname();

    return (
        <>
            {/* Backdrop */}
            <div
                className="sm:hidden fixed inset-0 z-97 transition-all duration-300"
                style={{
                    background: open ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0)",
                    pointerEvents: open ? "auto" : "none",
                    backdropFilter: open ? "blur(4px)" : "blur(0px)",
                }}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className="sm:hidden fixed top-0 left-0 bottom-0 z-98 flex flex-col py-6 transition-all duration-300 ease-in-out"
                style={{
                    width: "240px",
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                    background: "rgba(10,10,10,0.97)",
                    backdropFilter: "blur(24px)",
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                }}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 mb-6">
                    <Link href="/" onClick={onClose}
                        className="font-brand font-bold text-white text-[17px] tracking-[-0.02em]">
                        PDF Lovers
                    </Link>
                    <button onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-[#555] hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.06)" }}>
                        <X size={14} />
                    </button>
                </div>

                {/* Main nav */}
                <nav className="flex flex-col gap-0.5 px-3">
                    {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onClose}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                                style={{
                                    color: active ? "#fff" : "#bbb",
                                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                                }}
                            >
                                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
                                <span className="font-satoshi text-[14px] font-medium tracking-[-0.01em]">
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="mx-6 my-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

                {/* Secondary */}
                <div className="flex flex-col gap-0.5 px-3">
                    {SECONDARY_ITEMS.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className="font-satoshi font-medium text-[13px] px-3 py-2 rounded-lg transition-all duration-150"
                            style={{ color: "#444" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#aaa"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#444"; }}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────
export function Sidebar({ menu }) {
    const pathname = usePathname();

    return (
        <aside
            className="hidden sm:flex flex-col fixed top-14.5 left-0 bottom-0 z-90 overflow-hidden py-4 transition-all duration-300 ease-in-out"
            style={{
                width: menu ? "210px" : "68px",
                background: "rgba(8,8,8,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(255,255,255,0.05)",
            }}
        >
            <nav className="flex flex-col gap-0.5 px-2">
                {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={!menu ? label : undefined}
                            className="flex items-center rounded-xl py-2.5 px-2 overflow-hidden whitespace-nowrap transition-all duration-150"
                            style={{
                                color: active ? "#fff" : "#bbb",
                                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) { e.currentTarget.style.color = "#ddd"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) { e.currentTarget.style.color = "#bbb"; e.currentTarget.style.background = "transparent"; }
                            }}
                        >
                            {/* Fixed icon — never moves */}
                            <span className="flex items-center justify-center shrink-0" style={{ width: "36px" }}>
                                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                            </span>

                            <span
                                className="font-satoshi text-[13.5px] font-medium overflow-hidden transition-all duration-300 ease-in-out"
                                style={{
                                    maxWidth: menu ? "140px" : "0px",
                                    opacity: menu ? 1 : 0,
                                    letterSpacing: "-0.01em",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div
                className="flex flex-col gap-0.5 px-2 mt-3 overflow-hidden transition-all duration-200"
                style={{
                    opacity: menu ? 1 : 0,
                    maxHeight: menu ? "300px" : "0px",
                    transitionDelay: menu ? "60ms" : "0ms",
                    pointerEvents: menu ? "auto" : "none",
                }}
            >
                <div className="mx-2 mb-3" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                {SECONDARY_ITEMS.map(({ label, href }) => (
                    <Link
                        key={href}
                        href={href}
                        className="font-satoshi font-medium text-[14px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150"
                        style={{ color: "#3a3a3a" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#888"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#3a3a3a"; e.currentTarget.style.background = "transparent"; }}
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}

// // ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
// export function BottomNav() {
//     const pathname = usePathname();

//     return (
//         <nav
//             className="sm:hidden fixed bottom-0 left-0 right-0 z-[99] flex items-center justify-around h-[56px]"
//             style={{
//                 background: "rgba(8,8,8,0.92)",
//                 backdropFilter: "blur(24px)",
//                 WebkitBackdropFilter: "blur(24px)",
//                 borderTop: "1px solid rgba(255,255,255,0.06)",
//             }}
//         >
//             {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
//                 const active = pathname === href;
//                 return (
//                     <Link
//                         key={href}
//                         href={href}
//                         className="flex flex-col items-center gap-[3px] px-5 py-1 transition-all duration-150"
//                         style={{ color: active ? "#fff" : "#3a3a3a" }}
//                     >
//                         <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
//                         <span className="font-satoshi text-[10px] font-medium tracking-[-0.01em]">{label}</span>
//                     </Link>
//                 );
//             })}
//         </nav>
//     );
// }

// ─── Layout ───────────────────────────────────────────────────────────────────
export function NavLayout() {
    const [menu,       setMenu]       = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Navbar
                onMenuToggle={() => {
                    // Mobile: open drawer / Desktop: toggle sidebar
                    if (window.innerWidth < 640) {
                        setDrawerOpen((prev) => !prev);
                    } else {
                        setMenu((prev) => !prev);
                    }
                }}
            />
            <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            <Sidebar menu={menu} />
            {/* <BottomNav /> */}
        </>
    );
}