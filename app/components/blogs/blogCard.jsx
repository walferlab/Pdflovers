// app/components/blog/BlogCard.jsx
import Link from "next/link";

/**
 * BlogCard — aligned to public.blogs schema
 *
 * @param {string}   title          — Blog post title
 * @param {string}   excerpt        — Short description (optional)
 * @param {string}   coverImage     — Cover image URL (optional)
 * @param {string}   category       — Category label (optional)
 * @param {string}   date           — Formatted published_at date string
 * @param {number}   readTime       — Estimated read time in minutes (optional)
 * @param {string}   href           — Link destination (built from slug)
 * @param {"sm"|"md"|"lg"} size     — Size variant (default "md")
 */
export default function BlogCard({
    title      = "Untitled Post",
    excerpt    = "",
    coverImage = "",
    category   = "",
    date       = "",
    readTime   = null,
    href       = "#",
    size       = "md",
}) {
    const sizeMap = {
        sm: {
            card:    "rounded-xl",
            cover:   "h-40",
            padding: "p-4",
            title:   "text-[14px] leading-snug line-clamp-2",
            excerpt: "text-[12px] line-clamp-2",
            meta:    "text-[10.5px]",
            cat:     "text-[9.5px] px-2 py-0.5",
        },
        md: {
            card:    "rounded-[14px]",
            cover:   "h-48",
            padding: "p-5",
            title:   "text-[16px] leading-snug line-clamp-2",
            excerpt: "text-[13px] line-clamp-3",
            meta:    "text-[11.5px]",
            cat:     "text-[10px] px-2.5 py-0.5",
        },
        lg: {
            card:    "rounded-[18px]",
            cover:   "h-60",
            padding: "p-6",
            title:   "text-[19px] leading-snug line-clamp-2",
            excerpt: "text-[14px] line-clamp-3",
            meta:    "text-[12px]",
            cat:     "text-[10.5px] px-3 py-1",
        },
    };

    const s = sizeMap[size] ?? sizeMap.md;

    return (
        <Link
            href={href}
            className={`
                group relative flex flex-col no-underline overflow-hidden
                bg-[#111111] border border-white/[0.09]
                hover:border-white/[0.22]
                transition-[border-color,box-shadow] duration-300 ease-out
                shadow-[0_2px_16px_rgba(0,0,0,0.5)]
                hover:shadow-[0_4px_32px_rgba(0,0,0,0.7)]
                ${s.card}
            `}
        >
            {/* ── Ambient glow on hover ───────────────────────────────── */}
            <span
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-0 z-0
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-500
                    bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.04)_0%,transparent_70%)]
                "
            />

            {/* ── Cover ──────────────────────────────────────────────── */}
            {coverImage ? (
                <div className={`relative w-full ${s.cover} flex-shrink-0 overflow-hidden bg-white/[0.03]`}>
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                        style={{ transformOrigin: "center center", display: "block" }}
                    />
                    {/* subtle dark scrim at bottom of image for text contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#111111]/80 to-transparent" />
                </div>
            ) : (
                /* Placeholder when no image — decorative noise fill */
                <div
                    className={`relative w-full ${s.cover} flex-shrink-0 overflow-hidden`}
                    style={{
                        background:
                            "repeating-linear-gradient(135deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 12px)",
                        backgroundColor: "#0d0d0d",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                </div>
            )}

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className={`relative z-10 flex flex-col gap-3 flex-1 ${s.padding}`}>

                {/* Category pill */}
                {category && (
                    <span
                        className={`
                            self-start font-satoshi font-semibold tracking-[0.06em] uppercase
                            text-[#c8c8c8] bg-white/[0.07] border border-white/[0.12]
                            rounded-md leading-none ${s.cat}
                        `}
                    >
                        {category}
                    </span>
                )}

                {/* Title */}
                <h3
                    className={`
                        font-brand font-bold
                        text-[#f0f0f0] group-hover:text-white
                        transition-colors duration-200
                        ${s.title}
                    `}
                    style={{ letterSpacing: "-0.028em" }}
                >
                    {title}
                </h3>

                {/* Excerpt */}
                {excerpt && (
                    <p
                        className={`
                            font-satoshi font-normal
                            text-[#999] group-hover:text-[#b0b0b0]
                            leading-[1.6] transition-colors duration-200
                            ${s.excerpt}
                        `}
                    >
                        {excerpt}
                    </p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer — date · read time */}
                {(date || readTime) && (
                    <div className="flex items-center gap-2 pt-3 border-t border-white/[0.07]">
                        {/* Subtle dot accent */}
                        <span
                            aria-hidden="true"
                            className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0"
                        />

                        {date && (
                            <span className={`font-satoshi font-medium text-[#777] group-hover:text-[#999] transition-colors duration-200 ${s.meta}`}>
                                {date}
                            </span>
                        )}

                        {/* Arrow that slides in on hover */}
                        <span
                            aria-hidden="true"
                            className="
                                ml-auto text-[#444] group-hover:text-[#888]
                                translate-x-0 group-hover:translate-x-0.5
                                transition-all duration-200
                                text-[13px] leading-none select-none
                            "
                        >
                            →
                        </span>
                    </div>
                )}
            </div>
        </Link>
    );
}