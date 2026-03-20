// app/(legal)/contact-us/page.jsx
"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { trackFormSubmit } from "@/lib/analytics/google-analytics";
import { createClient } from "@/lib/supabase/client";
import {
    Mail,
    Instagram,
    Send,
    CheckCircle,
    AlertCircle,
    ArrowUpRight,
    MessageSquare,
} from "lucide-react";

const CONTACT_EMAIL   = "contact@pdflovers.app";
const INSTAGRAM_URL   = "https://instagram.com/walferlab";
const DISCORD_INVITE  = "https://discord.gg/a4Qnyq4nfs";

type ContactForm = {
    name: string;
    email: string;
    message: string;
};

function DiscordIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
    );
}

const contactMethods = [
    {
        icon: Mail,
        label: "Email us",
        value: CONTACT_EMAIL,
        desc: "We reply within 48 hours",
        href: `mailto:${CONTACT_EMAIL}`,
        external: false,
    },
    {
        icon: Instagram,
        label: "Instagram",
        value: "@walferlab",
        desc: "Follow us for updates",
        href: INSTAGRAM_URL,
        external: true,
    },
    {
        icon: DiscordIcon,
        label: "Discord",
        value: "Join our community",
        desc: "Chat with readers & the team",
        href: DISCORD_INVITE,
        external: true,
    },
];

const inputBase = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e0e0e0",
    outline: "none",
    transition: "all 0.2s",
};

const inputFocus = {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(255,255,255,0.06)",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="font-satoshi font-medium text-[12px] tracking-[0.08em] uppercase" style={{ color: "#888" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

export default function ContactPage() {
    const [form, setForm]       = useState<ContactForm>({ name: "", email: "", message: "" });
    const [status, setStatus]   = useState("idle"); // idle | loading | success | error
    const [focused, setFocused] = useState("");

    const supabase = createClient();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

        setStatus("loading");

        const { error } = await supabase.from("contact_messages").insert([
            {
                name:    form.name.trim(),
                email:   form.email.trim(),
                message: form.message.trim(),
            },
        ]);

        if (error) {
            console.error(error);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 4000);
        } else {
            trackFormSubmit("contact_us", {
                message_length: form.message.trim().length,
            });
            setStatus("success");
            setForm({ name: "", email: "", message: "" });
        }
    };

    const getInputStyle = (name: string) => ({
        ...inputBase,
        ...(focused === name ? inputFocus : {}),
    });

    return (
        <main className="min-h-screen text-white p-2 sm:pl-20" style={{ background: "#080808" }}>
            
            <section className="px-6 pt-32 pb-14 max-w-4xl mx-auto">
                <h1
                    className="font-brand font-bold text-[clamp(2rem,5vw,3.8rem)] tracking-[-0.03em] leading-[1.08] mb-5"
                    style={{ background: "linear-gradient(160deg,#fff 40%,#666 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                    We&apos;d love to<br />hear from you.
                </h1>
                <p className="font-satoshi font-medium text-[15px] leading-[1.75] max-w-lg" style={{ color: "#888" }}>
                    Have a question, a book recommendation, a copyright concern, or just want to say hi? 
                    Drop us a message, we read everything.
                </p>
            </section>

            <section className="px-6 pb-24 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

                    {/* Form Container */}
                    <div
                        className="rounded-2xl p-7 sm:p-9"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                        {status === "success" ? (
                            <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <CheckCircle size={26} style={{ color: "#aaa" }} />
                                </div>
                                <div>
                                    <h3 className="font-brand font-bold text-[22px] tracking-[-0.02em] mb-2" style={{ color: "#e0e0e0" }}>Message sent!</h3>
                                    <p className="font-satoshi font-medium text-[14px]" style={{ color: "#666" }}>Thanks for reaching out. We&apos;ll get back to you within 24-48 hours.</p>
                                </div>
                                <button
                                    onClick={() => setStatus("idle")}
                                    className="font-satoshi font-medium text-[13px] px-5 py-2 rounded-full transition-all duration-200 hover:opacity-80 mt-2"
                                    style={{ color: "#aaa", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
                                >
                                    Send another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div>
                                    <h2 className="font-brand font-semibold text-[20px] tracking-[-0.02em] mb-1" style={{ color: "#e0e0e0" }}>Send a message</h2>
                                    <p className="font-satoshi font-medium text-[13px]" style={{ color: "#555" }}>All fields are required.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Your name">
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            onFocus={() => setFocused("name")}
                                            onBlur={() => setFocused("")}
                                            placeholder="John Doe"
                                            required
                                            className="w-full rounded-xl px-4 py-3 font-satoshi font-medium text-[14px] placeholder-[#444]"
                                            style={getInputStyle("name")}
                                        />
                                    </Field>
                                    <Field label="Email address">
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            onFocus={() => setFocused("email")}
                                            onBlur={() => setFocused("")}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full rounded-xl px-4 py-3 font-satoshi font-medium text-[14px] placeholder-[#444]"
                                            style={getInputStyle("email")}
                                        />
                                    </Field>
                                </div>

                                <Field label="Message">
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        onFocus={() => setFocused("message")}
                                        onBlur={() => setFocused("")}
                                        placeholder="Tell us what&apos;s on your mind…"
                                        required
                                        rows={6}
                                        className="w-full rounded-xl px-4 py-3 font-satoshi font-medium text-[14px] placeholder-[#444] resize-none"
                                        style={getInputStyle("message")}
                                    />
                                </Field>

                                {status === "error" && (
                                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.15)" }}>
                                        <AlertCircle size={15} style={{ color: "#f87171" }} />
                                        <p className="font-satoshi font-medium text-[13px]" style={{ color: "#f87171" }}>Something went wrong. Please try again.</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === "loading"}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-satoshi font-semibold text-[14px] text-black transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ background: "#fff" }}
                                >
                                    {status === "loading" ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                                            Sending…
                                        </>
                                    ) : (
                                        <><Send size={14} /> Send message</>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Column Links */}
                    <div className="flex flex-col gap-4">
                        {contactMethods.map(({ icon: Icon, label, value, desc, href, external }) => (
                            <a
                                key={label}
                                href={href}
                                target={external ? "_blank" : undefined}
                                rel={external ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-200 group"
                                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                                onMouseEnter={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)"}
                                onMouseLeave={(e) => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"}
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                                    <Icon size={18} style={{ color: "#aaa" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-brand font-semibold text-[14px] tracking-[-0.01em] mb-0.5" style={{ color: "#ddd" }}>{label}</p>
                                    <p className="font-satoshi font-medium text-[13px] truncate mb-0.5" style={{ color: "#888" }}>{value}</p>
                                    <p className="font-satoshi font-medium text-[12px]" style={{ color: "#555" }}>{desc}</p>
                                </div>
                                <ArrowUpRight size={15} className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "#444" }} />
                            </a>
                        ))}

                        {/* Special Legal Note */}
                        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: "#555" }} />
                            <p className="font-satoshi font-medium text-[12px] leading-relaxed" style={{ color: "#666" }}>
                                For copyright concerns, email{" "}
                                <a href="mailto:legal@pdflovers.app" className="text-[#888] hover:text-white underline decoration-white/10 transition-colors">
                                    legal@pdflovers.app
                                </a>{" "}
                                directly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="text-center pb-12 font-satoshi font-medium text-[12px]" style={{ color: "#444" }}>
                © {new Date().getFullYear()} PDF Lovers ·{" "}
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                {" · "}
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                {" · "}
                <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
        </main>
    );
}
