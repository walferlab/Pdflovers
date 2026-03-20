// app/request-pdf/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { trackFormSubmit } from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BookOpen, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ label, hint, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <label className="font-satoshi font-semibold text-[12px] tracking-[0.05em] uppercase text-[#686868]">
                    {label}
                </label>
                {hint && (
                    <span className="font-satoshi text-[11px] text-[#404040]">{hint}</span>
                )}
            </div>
            {children}
            {error && (
                <p className="font-satoshi text-[11.5px] text-[#c0392b] flex items-center gap-1">
                    <AlertCircle size={11} className="flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Input / Textarea base styles (Tailwind) ──────────────────────────────────

const inputCls = `
    w-full font-satoshi font-medium text-[14px] text-[#d8d8d8] placeholder-[#2e2e2e]
    bg-white/[0.04] border border-white/[0.09]
    rounded-xl px-4 py-3 outline-none
    transition-all duration-150
    focus:bg-white/[0.06] focus:border-white/[0.2]
    hover:border-white/[0.14]
`;

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessView({ name, onReset }) {
    return (
        <div className="flex flex-col items-center text-center gap-6 py-10">
            <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                <CheckCircle2 size={26} className="text-[#888]" />
            </div>
            <div className="flex flex-col gap-2">
                <h2
                    className="font-brand font-bold text-[22px] text-[#e8e8e8]"
                    style={{ letterSpacing: "-0.025em" }}
                >
                    Request received!
                </h2>
                <p className="font-satoshi font-medium text-[14px] text-[#585858] max-w-[340px] leading-relaxed">
                    Thanks{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ll review your request and notify you once the PDF is available.
                </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
                <Link
                    href="/library"
                    className="font-satoshi font-semibold text-[13px] text-[#e0e0e0] bg-white/[0.07] border border-white/[0.1] rounded-xl px-5 py-2.5 no-underline hover:bg-white/[0.11] hover:border-white/[0.18] transition-all duration-150"
                >
                    Browse library
                </Link>
                <button
                    onClick={onReset}
                    className="font-satoshi font-semibold text-[13px] text-[#505050] hover:text-[#909090] transition-colors duration-150 cursor-pointer"
                >
                    Submit another
                </button>
            </div>
        </div>
    );
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate({ name, email, details }) {
    const errors = {};
    if (!name.trim())                          errors.name    = "Name is required.";
    if (!email.trim())                         errors.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                               errors.email   = "Enter a valid email address.";
    if (!details.trim())                       errors.details = "Please describe the PDF you're looking for.";
    else if (details.trim().length < 20)       errors.details = "Please add a bit more detail (at least 20 characters).";
    return errors;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestPdfPage() {
    const [supabase] = useState(createClient);

    const [form, setForm] = useState({ name: "", email: "", details: "" });
    const [errors,    setErrors]    = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [submitted,   setSubmitted]   = useState(false);

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        // Clear field error on change
        if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    };

    const handleSubmit = async () => {
        setServerError("");
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSubmitting(true);

        const { error } = await supabase
            .from("pdf_requests")
            .insert({
                name:    form.name.trim(),
                email:   form.email.trim().toLowerCase(),
                details: form.details.trim(),
                // status defaults to 'reviewing' per schema
            });

        setSubmitting(false);

        if (error) {
            console.error("[RequestPdf] insert error:", error.message);
            setServerError("Something went wrong. Please try again in a moment.");
            return;
        }

        trackFormSubmit("request_pdf", {
            has_name: Boolean(form.name.trim()),
            details_length: form.details.trim().length,
        });
        setSubmitted(true);
    };

    const handleReset = () => {
        setForm({ name: "", email: "", details: "" });
        setErrors({});
        setServerError("");
        setSubmitted(false);
    };

    return (
        <main className="min-h-screen text-white pt-20 sm:pl-20" style={{ background: "#080808" }}>
            <div className="max-w-[600px] mx-auto px-4 sm:px-6 pt-10 pb-32">

                {/* Back */}
                <Link
                    href="/library"
                    className="inline-flex items-center gap-1.5 font-satoshi font-medium text-[12px] text-[#484848] no-underline hover:text-[#888] transition-colors mb-10"
                >
                    <ArrowLeft size={13} /> Library
                </Link>

                {/* Header */}
                <div className="flex flex-col gap-3 mb-10">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.09] flex items-center justify-center mb-1">
                        <BookOpen size={20} className="text-[#686868]" />
                    </div>
                    <h1
                        className="font-brand font-bold text-[clamp(1.7rem,4vw,2.6rem)] text-[#f0f0f0] leading-tight"
                        style={{ letterSpacing: "-0.03em" }}
                    >
                        Request a PDF
                    </h1>
                    <p className="font-satoshi font-medium text-[14px] text-[#505050] leading-relaxed">
                        Can&apos;t find what you&apos;re looking for? Tell us and we&apos;ll do our best to add it to the library.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.06] mb-10" />

                {submitted ? (
                    <SuccessView name={form.name} onReset={handleReset} />
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* Name */}
                        <Field label="Your name" error={errors.name}>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={set("name")}
                                autoComplete="name"
                                className={`${inputCls} ${errors.name ? "border-[#c0392b]/60 focus:border-[#c0392b]" : ""}`}
                            />
                        </Field>

                        {/* Email */}
                        <Field
                            label="Email address"
                            hint="We'll notify you when it's added"
                            error={errors.email}
                        >
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={set("email")}
                                autoComplete="email"
                                className={`${inputCls} ${errors.email ? "border-[#c0392b]/60 focus:border-[#c0392b]" : ""}`}
                            />
                        </Field>

                        {/* Details */}
                        <Field
                            label="PDF details"
                            hint={`${form.details.length} / 1000`}
                            error={errors.details}
                        >
                            <textarea
                                rows={5}
                                placeholder="Title, author, edition, ISBN, or any details that help us find the right book…"
                                value={form.details}
                                onChange={set("details")}
                                maxLength={1000}
                                className={`${inputCls} resize-none leading-relaxed ${errors.details ? "border-[#c0392b]/60 focus:border-[#c0392b]" : ""}`}
                            />
                        </Field>

                        {/* Server error */}
                        {serverError && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-[#c0392b]/25 bg-[#c0392b]/[0.06] px-4 py-3">
                                <AlertCircle size={14} className="text-[#c0392b] flex-shrink-0 mt-0.5" />
                                <p className="font-satoshi font-medium text-[13px] text-[#c0392b]">
                                    {serverError}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="
                                self-start flex items-center gap-2.5
                                font-satoshi font-semibold text-[14px] text-[#101010]
                                bg-[#e8e8e8] hover:bg-white
                                rounded-xl px-6 py-3
                                transition-all duration-150
                                disabled:opacity-50 disabled:cursor-not-allowed
                                cursor-pointer
                            "
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    <Send size={14} />
                                    Submit request
                                </>
                            )}
                        </button>

                        {/* Fine print */}
                        <p className="font-satoshi text-[11.5px] text-[#383838] leading-relaxed">
                            We only host legally available PDFs — public domain, Creative Commons, and open access titles.
                            Requests for copyrighted material will not be fulfilled.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
