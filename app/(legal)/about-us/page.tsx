"use client";

import Link from "next/link";
import { BookOpen, Globe, Shield, Heart, ArrowRight } from "lucide-react";

const values = [
    {
        icon: BookOpen,
        title: "Open Knowledge",
        desc: "We believe great books and ideas should be accessible to everyone, not locked behind paywalls or geographic barriers.",
    },
    {
        icon: Globe,
        title: "Built for Everyone",
        desc: "From students in small towns to researchers in big cities — PDF Lovers is designed for curious minds everywhere.",
    },
    {
        icon: Shield,
        title: "Legal & Trustworthy",
        desc: "Every title on our platform is sourced through public domain, Creative Commons, or direct author partnerships. No grey areas.",
    },
    {
        icon: Heart,
        title: "Community First",
        desc: "We're building more than a library — a place where readers discover, share, and fall in love with books again.",
    },
];

const stats = [
    { value: "50K+", label: "Books available" },
    { value: "120+", label: "Countries reached" },
    { value: "2M+",  label: "Pages read monthly" },
    { value: "100%", label: "Free to access" },
];

export default function AboutPage() {
    return (
        <main
            className="min-h-screen text-white p-2 sm:pl-20"
            style={{ background: "#080808" }}
        >
            {/* ── Hero ── */}
            <section className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-28 overflow-hidden">
                {/* Glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 rounded-full pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
                        filter: "blur(40px)",
                    }}
                />

                {/* Headline */}
                <h1
                    className="font-brand font-bold text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.03em] max-w-3xl mb-6"
                    style={{
                        background: "linear-gradient(160deg, #ffffff 40%, #777 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    The world&apos;s books,<br />one open shelf.
                </h1>

                <p className="font-satoshi font-medium text-[16px] leading-relaxed max-w-xl mb-10" style={{ color: "#888" }}>
                    PDF Lovers started with a simple frustration — finding good books online
                    shouldn&apos;t feel like searching for contraband. We built the platform we
                    always wanted: clean, fast, legal, and completely free.
                </p>

                <Link
                    href="/library"
                    className="inline-flex items-center gap-2 font-satoshi text-[13px] font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-80"
                    style={{
                        color: "#e0e0e0",
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                    }}
                >
                    Browse the library
                    <ArrowRight size={14} />
                </Link>
            </section>

            {/* ── Stats ── */}
            <section className="px-6 py-16 mx-auto max-w-4xl">
                <div
                    className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.09)" }}
                >
                    {stats.map(({ value, label }, i) => (
                        <div
                            key={label}
                            className="flex flex-col items-center justify-center py-10 px-4 text-center"
                            style={{
                                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.09)" : "none",
                                background: "rgba(255,255,255,0.02)",
                            }}
                        >
                            <span
                                className="font-brand font-bold text-[2.2rem] tracking-[-0.03em] leading-none mb-2"
                                style={{
                                    background: "linear-gradient(135deg, #fff 0%, #888 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                {value}
                            </span>
                            <span className="font-satoshi font-medium text-[12px] tracking-[0.02em]" style={{ color: "#777" }}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Story ── */}
            <section className="px-6 py-16 max-w-2xl mx-auto">
                <span
                    className="font-satoshi font-medium text-[11px] tracking-widest uppercase mb-4 block"
                    style={{ color: "#666" }}
                >
                    Our story
                </span>

                <h2
                    className="font-brand font-bold text-[clamp(1.6rem,3vw,2.4rem)] tracking-[-0.025em] leading-[1.15] mb-8"
                    style={{ color: "#eee" }}
                >
                    Built out of love<br />for the written word.
                </h2>

                <div className="flex flex-col gap-5 font-satoshi font-medium text-[15px] leading-[1.8]" style={{ color: "#888" }}>
                    <p>
                        It started the way most things do — with a problem. We kept stumbling across
                        piracy sites every time we searched for a PDF. Not because we wanted pirated
                        content, but because legitimate alternatives were either buried, broken, or
                        behind paywalls that cost more than the book itself.
                    </p>
                    <p>
                        So we built PDF Lovers. A clean, fast, respectful platform that surfaces
                        public domain classics, Creative Commons titles, open-access academic
                        papers, and books shared directly by their authors — all in one place.
                    </p>
                    <p>
                        We&apos;re not a piracy site dressed up nicely. We&apos;re the alternative that
                        should have existed all along. Every book on our platform is here legally,
                        ethically, and intentionally.
                    </p>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="px-6 py-16 max-w-4xl mx-auto">
                <span
                    className="font-satoshi font-medium text-[11px] tracking-widest uppercase mb-4 block"
                    style={{ color: "#666" }}
                >
                    What we stand for
                </span>

                <h2
                    className="font-brand font-bold text-[clamp(1.6rem,3vw,2.4rem)] tracking-[-0.025em] leading-[1.15] mb-12"
                    style={{ color: "#eee" }}
                >
                    The principles we<br />build everything around.
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {values.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="flex flex-col gap-4 p-6 rounded-2xl transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.07)",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.13)"}
                            onMouseLeave={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"}
                        >
                            <div
                                className="w-9 h-9 flex items-center justify-center rounded-xl"
                                style={{ background: "rgba(255,255,255,0.07)" }}
                            >
                                <Icon size={16} style={{ color: "#aaa" }} />
                            </div>
                            <div>
                                <h3
                                    className="font-brand font-semibold text-[15px] tracking-[-0.015em] mb-2"
                                    style={{ color: "#e0e0e0" }}
                                >
                                    {title}
                                </h3>
                                <p
                                    className="font-satoshi font-medium text-[13px] leading-relaxed"
                                    style={{ color: "#777" }}
                                >
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-6 py-24 max-w-2xl mx-auto text-center">
                <h2
                    className="font-brand font-bold text-[clamp(1.8rem,4vw,3rem)] tracking-[-0.03em] leading-[1.1] mb-5"
                    style={{
                        background: "linear-gradient(160deg, #ffffff 40%, #666 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Start reading.<br />No signup needed.
                </h2>
                <p
                    className="font-satoshi font-medium text-[15px] mb-10"
                    style={{ color: "#777" }}
                >
                    Thousands of books, zero friction. Just open and read.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link
                        href="/library"
                        className="font-satoshi text-[13px] font-semibold px-6 py-2.5 rounded-full text-black transition-all duration-200 hover:opacity-90"
                        style={{ background: "#fff" }}
                    >
                        Explore library
                    </Link>
                    <Link
                        href="/contact-us"
                        className="font-satoshi text-[13px] font-medium px-6 py-2.5 rounded-full transition-all duration-200 hover:opacity-80"
                        style={{
                            color: "#aaa",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.04)",
                        }}
                    >
                        Get in touch
                    </Link>
                </div>
            </section>

            {/* ── Footer note ── */}
            <div className="text-center pb-12 font-satoshi font-medium text-[12px]" style={{ color: "#444" }}>
                © {new Date().getFullYear()} PDF Lovers ·{" "}
                <Link href="/contact-us" className="hover:text-white transition-colors duration-150">Contact</Link>
                {" · "}
                <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms</Link>
                {" · "}
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
                {" · "}
                <Link href="/disclaimer" className="hover:text-white transition-colors duration-150">Disclaimer</Link>
            </div>
        </main>
    );
}
