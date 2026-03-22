"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Copy, Check, ExternalLink, Star } from "lucide-react";

const PAYPAL_DONATE =
    `https://www.paypal.com/donate?business=${encodeURIComponent("support@pdflovers.app")}&currency_code=USD&item_name=Support+PDF+Lovers`;
const PAYPAL_ME = "https://www.paypal.com/ncp/payment/NKJYH2F95ETAE";
const PAYPAL_EMAIL = "rafortwalfer@gmail.com";
const AMAZON_REVIEW = "https://www.amazon.com/books-used-books-textbooks/b?node=283155";
const SITE_URL = "https://pdflovers.app";

function useCopy() {
    const [copied, setCopied] = useState(false);

    const copy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return [copied, copy];
}

export default function SupportPage() {
    const [emailCopied, copyEmail] = useCopy();
    const [urlCopied, copyUrl] = useCopy();

    const shareLinks = [
        {
            label: "X",
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Free books, no signup - PDF Lovers is great.")}&url=${encodeURIComponent(SITE_URL)}`,
        },
        {
            label: "WhatsApp",
            href: `https://wa.me/?text=${encodeURIComponent(`Free open-access books: ${SITE_URL}`)}`,
        },
        {
            label: "Reddit",
            href: `https://reddit.com/submit?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent("PDF Lovers - free open-access books")}`,
        },
    ];

    return (
        <main
            className="min-h-screen text-white pt-20 sm:pl-20 pb-28"
            style={{ background: "#080808" }}
        >
            <div className="max-w-[520px] mx-auto px-5 pt-12">
                <div
                    className="flex flex-col gap-3 mb-12"
                    style={{ animation: "fadeUp .45s both" }}
                >
                    <span className="inline-flex items-center gap-1.5 self-start font-satoshi font-semibold text-[10.5px] tracking-[0.1em] uppercase text-[#c8a44a] bg-[rgba(200,164,74,0.1)] border border-[rgba(200,164,74,0.18)] rounded-full px-3 py-1">
                        <Heart size={9} fill="currentColor" /> Support
                    </span>
                    <h1
                        className="font-brand font-bold text-[clamp(1.8rem,5vw,2.8rem)] leading-tight text-[#f0f0f0]"
                        style={{ letterSpacing: "-0.035em" }}
                    >
                        Keep books free.
                    </h1>
                    <p className="font-satoshi font-medium text-[14px] text-[#505050] leading-relaxed">
                        PDF Lovers is run independently - no VC, no paywalls. If it&apos;s been useful, here&apos;s how to help.
                    </p>
                </div>

                <div className="border-t border-white/[0.05] mb-10" />

                <section
                    className="flex flex-col gap-5 mb-12"
                    style={{ animation: "fadeUp .45s .08s both" }}
                >
                    <div className="flex flex-col gap-1">
                        <p className="font-satoshi font-semibold text-[10.5px] tracking-[0.08em] uppercase text-[#383838]">
                            Donate
                        </p>
                        <h2
                            className="font-brand font-bold text-[18px] text-[#d0d0d0]"
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            Chip in for server costs
                        </h2>
                        <p className="font-satoshi font-medium text-[13px] text-[#484848] leading-relaxed mt-0.5">
                            Hosting isn&apos;t free. Even $2 covers a day of uptime. 100% goes toward keeping this library online.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <a
                            href={PAYPAL_DONATE}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full font-satoshi font-bold text-[13.5px] text-[#0a0800] bg-[#c8a44a] hover:bg-[#d9b55a] rounded-xl py-3 transition-all duration-150 no-underline"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
                            </svg>
                            Donate via PayPal
                        </a>

                        <a
                            href={PAYPAL_ME}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full font-satoshi font-semibold text-[13px] text-[#686868] bg-white/[0.04] border border-white/[0.09] hover:bg-white/[0.07] hover:border-white/[0.15] hover:text-[#a0a0a0] rounded-xl py-2.5 transition-all duration-150 no-underline"
                        >
                            <ExternalLink size={12} />
                            paypal.me/pdflovers
                        </a>
                    </div>

                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                        <span className="font-satoshi font-medium text-[12px] text-[#585858] flex-1 truncate">
                            {PAYPAL_EMAIL}
                        </span>
                        <button
                            onClick={() => copyEmail(PAYPAL_EMAIL)}
                            className="flex items-center gap-1.5 font-satoshi font-semibold text-[11px] text-[#484848] hover:text-[#888] transition-colors cursor-pointer"
                        >
                            {emailCopied ? (
                                <>
                                    <Check size={11} className="text-[#64dc8c]" /> Copied
                                </>
                            ) : (
                                <>
                                    <Copy size={11} /> Copy
                                </>
                            )}
                        </button>
                    </div>
                </section>

                <div className="border-t border-white/[0.05] mb-10" />

                <section
                    className="flex flex-col gap-4 mb-12"
                    style={{ animation: "fadeUp .45s .16s both" }}
                >
                    <div className="flex flex-col gap-1">
                        <p className="font-satoshi font-semibold text-[10.5px] tracking-[0.08em] uppercase text-[#383838]">
                            Rate &amp; review
                        </p>
                        <h2
                            className="font-brand font-bold text-[18px] text-[#d0d0d0]"
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            Review the author&apos;s book on Amazon
                        </h2>
                        <p className="font-satoshi font-medium text-[13px] text-[#484848] leading-relaxed mt-0.5">
                            Enjoyed a book you found here? The author deserves the recognition. Leave a review on Amazon - it directly helps them reach more readers.
                        </p>
                    </div>

                    <a
                        href={AMAZON_REVIEW}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-150 no-underline group"
                    >
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={13}
                                    fill="#c8a44a"
                                    stroke="none"
                                    className="group-hover:scale-110 transition-transform duration-150"
                                    style={{ transitionDelay: `${i * 30}ms` }}
                                />
                            ))}
                        </div>
                        <span className="font-satoshi font-semibold text-[13px] text-[#b0b0b0] flex-1">
                            Search the book on Amazon
                        </span>
                        <ExternalLink size={12} className="text-[#404040] group-hover:text-[#686868] transition-colors" />
                    </a>

                    <p className="font-satoshi text-[11.5px] text-[#383838] leading-relaxed">
                        Search the title or author on Amazon - open the book page - scroll to &ldquo;Customer reviews&rdquo; - &ldquo;Write a review&rdquo;. You don&apos;t need to have bought it there.
                    </p>
                </section>

                <div className="border-t border-white/[0.05] mb-10" />

                <section
                    className="flex flex-col gap-4 mb-12"
                    style={{ animation: "fadeUp .45s .24s both" }}
                >
                    <div className="flex flex-col gap-1">
                        <p className="font-satoshi font-semibold text-[10.5px] tracking-[0.08em] uppercase text-[#383838]">
                            Spread the word
                        </p>
                        <h2
                            className="font-brand font-bold text-[18px] text-[#d0d0d0]"
                            style={{ letterSpacing: "-0.025em" }}
                        >
                            Tell a reader about this
                        </h2>
                        <p className="font-satoshi font-medium text-[13px] text-[#484848] leading-relaxed mt-0.5">
                            We don&apos;t run ads. Every new reader finds us through someone like you.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {shareLinks.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] font-satoshi font-medium text-[12px] text-[#585858] hover:border-white/[0.15] hover:text-[#a0a0a0] hover:bg-white/[0.05] transition-all duration-150 no-underline"
                            >
                                <ExternalLink size={10} />
                                {label}
                            </a>
                        ))}
                        <button
                            onClick={() => copyUrl(SITE_URL)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] font-satoshi font-medium text-[12px] text-[#585858] hover:border-white/[0.15] hover:text-[#a0a0a0] hover:bg-white/[0.05] transition-all duration-150 cursor-pointer"
                        >
                            {urlCopied ? (
                                <>
                                    <Check size={10} className="text-[#64dc8c]" /> Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={10} /> Copy link
                                </>
                            )}
                        </button>
                    </div>
                </section>

                <div className="border-t border-white/[0.05] pt-8">
                    <p
                        className="font-satoshi text-[11.5px] text-[#2e2e2e] leading-relaxed"
                        style={{ animation: "fadeUp .45s .32s both" }}
                    >
                        PDF Lovers only hosts public domain, Creative Commons, and open-access titles.{" "}
                        <Link href="/about-us" className="text-[#424242] hover:text-[#686868] transition-colors no-underline border-b border-white/[0.07]">About</Link>
                        {" · "}
                        <Link href="/contact-us" className="text-[#424242] hover:text-[#686868] transition-colors no-underline border-b border-white/[0.07]">Contact</Link>
                        {" · "}
                        <Link href="/privacy-policy" className="text-[#424242] hover:text-[#686868] transition-colors no-underline border-b border-white/[0.07]">Privacy</Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </main>
    );
}
