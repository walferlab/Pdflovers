"use client";

import { useState, useEffect } from "react";
import {
    Send, Users, Mail, ChevronDown, CheckCircle,
    AlertCircle, Clock, BookOpen, Loader2, Eye, EyeOff,
} from "lucide-react";

const TEMPLATES = [
    {
        label: "📚 Weekly Book Picks",
        subject: "Your 5 Free Reads This Week 📚",
        html: `<h2 style="color:#fff;margin:0 0 16px">Your Weekly Book Picks</h2>
<p>Hi there,</p>
<p>Here are this week's handpicked free reads from PDF Lovers:</p>
<h3 style="color:#fff">📖 Book of the Week</h3>
<p><strong style="color:#fff">Title:</strong> [Book Name]<br/>
<strong style="color:#fff">Author:</strong> [Author]<br/>
<strong style="color:#fff">Why you'll love it:</strong> [2-line hook]</p>
<p><a href="https://pdflovers.app" style="background:#fff;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Read Now →</a></p>
<h3 style="color:#fff">💎 Hidden Gem</h3>
<p>[Lesser-known title description]</p>
<h3 style="color:#fff">🔗 From the Blog</h3>
<p>[Latest blog post title and excerpt]</p>
<p style="color:#888;margin-top:24px">Happy reading,<br/>The PDF Lovers Team</p>`,
    },
    {
        label: "🌟 New Books Added",
        subject: "New books just landed on PDF Lovers 🎉",
        html: `<h2 style="color:#fff;margin:0 0 16px">Fresh Reads Just Added!</h2>
<p>Hi there,</p>
<p>We've just added new books to the library. Here's what's new:</p>
<ul style="padding-left:20px;color:#ccc">
  <li>[Book 1 — Genre]</li>
  <li>[Book 2 — Genre]</li>
  <li>[Book 3 — Genre]</li>
</ul>
<p><a href="https://pdflovers.app/library" style="background:#fff;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Browse Library →</a></p>
<p style="color:#888;margin-top:24px">Happy reading,<br/>The PDF Lovers Team</p>`,
    },
    {
        label: "✍️ Blank (Write from scratch)",
        subject: "",
        html: `<h2 style="color:#fff;margin:0 0 16px">Your Title Here</h2>
<p>Hi there,</p>
<p>Write your message here...</p>
<p style="color:#888;margin-top:24px">Happy reading,<br/>The PDF Lovers Team</p>`,
    },
];

const GENRE_OPTIONS = [
    { value: "all",        label: "All Subscribers" },
    { value: "fiction",    label: "Fiction readers only" },
    { value: "nonfiction", label: "Non-fiction readers only" },
    { value: "classics",   label: "Classics readers only" },
    { value: "philosophy", label: "Philosophy readers only" },
    { value: "science",    label: "Science readers only" },
];

export default function SendNewsletterPage() {
    const [subject, setSubject]           = useState("");
    const [html, setHtml]                 = useState(TEMPLATES[0].html);
    const [genre, setGenre]               = useState("all");
    const [preview, setPreview]           = useState(false);
    const [sending, setSending]           = useState(false);
    const [result, setResult]             = useState(null);
    const [subCount, setSubCount]         = useState(null);
    const [logs, setLogs]                 = useState([]);
    const [logsLoading, setLogsLoading]   = useState(true);
    const [templateOpen, setTemplateOpen] = useState(false);

    useEffect(() => {
        setSubject(TEMPLATES[0].subject);
        fetchStats();
        fetchLogs();
    }, []);

    const fetchStats = async () => {
        const res = await fetch("/api/newsletter/stats");
        if (res.ok) {
            const d = await res.json();
            setSubCount(d.count);
        }
    };

    const fetchLogs = async () => {
        setLogsLoading(true);
        const res = await fetch("/api/newsletter/logs");
        if (res.ok) {
            const d = await res.json();
            setLogs(d.logs || []);
        }
        setLogsLoading(false);
    };

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        setSubject(t.subject);
        setHtml(t.html);
        setTemplateOpen(false);
    };

    const handleSend = async () => {
        if (!subject.trim() || !html.trim()) return;
        setSending(true);
        setResult(null);

        const res = await fetch("/api/newsletter/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, html, genre_filter: genre }),
        });

        const data = await res.json();
        setResult(data);
        setSending(false);
        if (data.success) fetchLogs();
    };

    const inputStyle = {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
    };

    const focusStyle = {
        borderColor: "rgba(255,255,255,0.2)",
    };

    return (
        <div
            className="min-h-screen font-satoshi"
            style={{ background: "#080808", color: "#ccc" }}
        >
            {/* Top bar */}
            <div
                className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
                style={{
                    background: "rgba(8,8,8,0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-[#888]" />
                    <span className="font-brand font-bold text-white text-[16px] tracking-[-0.02em]">
                        PDF Lovers
                    </span>
                    <span className="text-[#333] text-[13px]">/</span>
                    <span className="text-[#666] text-[13px]">Newsletter Sender</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users size={14} className="text-[#555]" />
                    <span className="text-[13px] text-[#555]">
                        {subCount === null ? "..." : `${subCount} subscribers`}
                    </span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT: Composer ── */}
                <div className="lg:col-span-2 flex flex-col gap-4">

                    {/* Template picker */}
                    <div className="relative">
                        <button
                            onClick={() => setTemplateOpen(!templateOpen)}
                            className="w-full flex items-center justify-between h-10 px-4 rounded-xl text-[13px] font-medium transition-all"
                            style={{ ...inputStyle, color: "#888" }}
                        >
                            <span>Use a template</span>
                            <ChevronDown size={14} className={`transition-transform ${templateOpen ? "rotate-180" : ""}`} />
                        </button>
                        {templateOpen && (
                            <div
                                className="absolute top-12 left-0 right-0 z-20 rounded-xl overflow-hidden"
                                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 48px rgba(0,0,0,0.6)" }}
                            >
                                {TEMPLATES.map((t, i) => (
                                    <button
                                        key={i}
                                        onClick={() => applyTemplate(t)}
                                        className="w-full text-left px-4 py-3 text-[13px] transition-all hover:bg-white/5"
                                        style={{ color: "#bbb", borderBottom: i < TEMPLATES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-medium text-[#555]">Subject line</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Your 5 Free Reads This Week 📚"
                            className="h-10 rounded-xl px-4 text-[13px] text-white placeholder-[#333] outline-none transition-all"
                            style={inputStyle}
                            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                        />
                    </div>

                    {/* HTML editor / preview toggle */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-[12px] font-medium text-[#555]">Email body (HTML)</label>
                            <button
                                onClick={() => setPreview(!preview)}
                                className="flex items-center gap-1.5 text-[12px] text-[#555] hover:text-[#aaa] transition-colors"
                            >
                                {preview ? <EyeOff size={12} /> : <Eye size={12} />}
                                {preview ? "Edit" : "Preview"}
                            </button>
                        </div>

                        {preview ? (
                            <div
                                className="rounded-xl p-6 min-h-[360px] overflow-auto"
                                style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
                                dangerouslySetInnerHTML={{ __html: html }}
                            />
                        ) : (
                            <textarea
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                                rows={16}
                                placeholder="Write HTML email content here..."
                                className="rounded-xl px-4 py-3 text-[13px] text-white placeholder-[#333] outline-none transition-all resize-none font-mono leading-relaxed"
                                style={inputStyle}
                                onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                                onBlur={(e) => Object.assign(e.target.style, inputStyle)}
                            />
                        )}
                    </div>

                    {/* Audience filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-medium text-[#555]">Send to</label>
                        <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="h-10 rounded-xl px-4 text-[13px] text-white outline-none appearance-none transition-all"
                            style={inputStyle}
                        >
                            {GENRE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value} style={{ background: "#111" }}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Result banner */}
                    {result && (
                        <div
                            className="flex items-start gap-3 px-4 py-3 rounded-xl text-[13px]"
                            style={{
                                background: result.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                border: result.success ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                            }}
                        >
                            {result.success
                                ? <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                                : <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            }
                            <div>
                                {result.success ? (
                                    <>
                                        <p className="text-green-400 font-medium">Newsletter sent!</p>
                                        <p className="text-[#666] mt-0.5">
                                            ✅ {result.sent} sent &nbsp;·&nbsp; ❌ {result.failed} failed &nbsp;·&nbsp; {result.total} total
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-red-400">{result.error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Send button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || !subject.trim() || !html.trim()}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                        {sending
                            ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                            : <><Send size={15} /> Send Newsletter</>
                        }
                    </button>
                </div>

                {/* ── RIGHT: Send history ── */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-[#555]" />
                        <span className="text-[13px] font-medium text-[#555]">Send history</span>
                    </div>

                    {logsLoading ? (
                        <div className="flex items-center gap-2 text-[#444] text-[13px] py-4">
                            <Loader2 size={13} className="animate-spin" /> Loading…
                        </div>
                    ) : logs.length === 0 ? (
                        <div
                            className="rounded-xl px-4 py-6 text-center text-[13px] text-[#444]"
                            style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                            No emails sent yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="rounded-xl px-4 py-3"
                                    style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="text-[13px] text-white font-medium leading-snug line-clamp-2">
                                            {log.subject}
                                        </p>
                                        <span
                                            className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
                                            style={{
                                                background: log.status === "done" ? "rgba(34,197,94,0.12)" : log.status === "failed" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
                                                color: log.status === "done" ? "#4ade80" : log.status === "failed" ? "#f87171" : "#888",
                                            }}
                                        >
                                            {log.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-[#444] mt-1">
                                        <span className="flex items-center gap-1">
                                            <Users size={10} /> {log.sent_to_count} sent
                                        </span>
                                        {log.failed_count > 0 && (
                                            <span className="text-red-400/60">{log.failed_count} failed</span>
                                        )}
                                        <span className="flex items-center gap-1 ml-auto">
                                            <Clock size={10} />
                                            {new Date(log.created_at).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
