"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mail, BookOpen, Sparkles, CheckCircle } from "lucide-react";

export function SubscribeModal({ open, onClose }) {
    const [email, setEmail]           = useState("");
    const [name, setName]             = useState("");
    const [genre, setGenre]           = useState("all");
    const [loading, setLoading]       = useState(false);
    const [success, setSuccess]       = useState(false);
    const [message, setMessage]       = useState("");
    const [error, setError]           = useState("");
    const emailRef                    = useRef(null);

    // Focus email on open
    useEffect(() => {
        if (open) {
            setSuccess(false);
            setMessage("");
            setError("");
            setTimeout(() => emailRef.current?.focus(), 80);
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    // Prevent body scroll when modal open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, genre_preference: genre, source: "navbar" }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong.");
            } else {
                setSuccess(true);
                setMessage(data.message);
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] transition-all duration-300"
                style={{
                    background: "rgba(0,0,0,0.75)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                aria-modal="true"
                role="dialog"
            >
                <div
                    className="relative w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
                    style={{
                        background: "rgba(14,14,14,0.97)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[#555] hover:text-white transition-colors"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>

                    {success ? (
                        /* ── Success State ── */
                        <div className="flex flex-col items-center gap-4 py-4 text-center">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                                <CheckCircle size={28} className="text-green-400" />
                            </div>
                            <div>
                                <p className="font-brand font-bold text-white text-[18px] tracking-[-0.02em]">
                                    You&apos;re in! 🎉
                                </p>
                                <p className="font-satoshi text-[13px] text-[#777] mt-1">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 h-9 px-6 rounded-full font-satoshi font-medium text-[13px] text-white transition-all hover:opacity-80"
                                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}
                            >
                                Browse Books
                            </button>
                        </div>
                    ) : (
                        /* ── Form State ── */
                        <>
                            {/* Header */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(255,255,255,0.07)" }}
                                    >
                                        <BookOpen size={15} className="text-[#aaa]" />
                                    </div>
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-satoshi text-[11px] font-medium"
                                        style={{ background: "rgba(255,255,255,0.06)", color: "#888", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        <Sparkles size={10} /> Free Weekly Newsletter
                                    </span>
                                </div>
                                <h2 className="font-brand font-bold text-white text-[20px] tracking-[-0.025em]">
                                    Get free books in your inbox
                                </h2>
                                <p className="font-satoshi text-[13px] leading-relaxed" style={{ color: "#666" }}>
                                    Curated classics, hidden gems, and open-access titles — every week, no spam.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                {/* Name */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-satoshi text-[12px] font-medium" style={{ color: "#555" }}>
                                        Your name <span style={{ color: "#333" }}>(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Ramesh"
                                        className="h-10 rounded-xl px-3.5 font-satoshi text-[13px] text-white placeholder-[#333] outline-none transition-all duration-200"
                                        style={{
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                        onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                    />
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-satoshi text-[12px] font-medium" style={{ color: "#555" }}>
                                        Email address <span style={{ color: "#e05" }}>*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#333] pointer-events-none" />
                                        <input
                                            ref={emailRef}
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full h-10 rounded-xl pl-9 pr-3.5 font-satoshi text-[13px] text-white placeholder-[#333] outline-none transition-all duration-200"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; }}
                                            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                        />
                                    </div>
                                </div>

                                {/* Genre */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="font-satoshi text-[12px] font-medium" style={{ color: "#555" }}>
                                        I love reading…
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: "all",         label: "Everything" },
                                            { value: "fiction",     label: "Fiction" },
                                            { value: "nonfiction",  label: "Non-fiction" },
                                            { value: "classics",    label: "Classics" },
                                            { value: "philosophy",  label: "Philosophy" },
                                            { value: "science",     label: "Science" },
                                        ].map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setGenre(value)}
                                                className="h-7 px-3 rounded-full font-satoshi text-[12px] font-medium transition-all duration-150"
                                                style={{
                                                    background: genre === value ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                                                    border: genre === value ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.07)",
                                                    color: genre === value ? "#fff" : "#555",
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <p className="font-satoshi text-[12px] text-red-400 px-1">{error}</p>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-1 h-10 rounded-xl font-satoshi font-semibold text-[13px] text-white transition-all duration-200 hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
                                    style={{
                                        background: "rgba(255,255,255,0.10)",
                                        border: "1px solid rgba(255,255,255,0.14)",
                                    }}
                                >
                                    {loading ? "Subscribing…" : "Subscribe for free 📚"}
                                </button>

                                <p className="font-satoshi text-[11px] text-center" style={{ color: "#333" }}>
                                    No spam, ever. Unsubscribe anytime.
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
