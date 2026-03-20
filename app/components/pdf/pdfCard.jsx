/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

const FALLBACK_IMG = "https://i.pinimg.com/736x/64/9a/49/649a49f06ea825be7575640ba48cad2a.jpg";

function CardBody({ title, genre, imgSrc, onImageError }) {
    return (
        <>
            <div
                className="relative w-full rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl"
                style={{
                    aspectRatio: "2/3",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
            >
                <img
                    src={imgSrc}
                    alt={title}
                    onError={onImageError}
                    className="w-full h-full object-cover transition-opacity duration-300"
                />

                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "rgba(0,0,0,0.18)" }}
                />
            </div>

            <div className="flex flex-col gap-0.5 px-0.5">
                <p
                    className="font-satoshi font-semibold text-[13.5px] leading-snug tracking-[-0.01em] text-white/90 overflow-hidden"
                    style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                    }}
                >
                    {title}
                </p>
                {genre && (
                    <p
                        className="font-satoshi font-medium text-[11px] tracking-[0.02em]"
                        style={{ color: "#555" }}
                    >
                        {genre}
                    </p>
                )}
            </div>
        </>
    );
}

export default function PdfCard({ title = "Untitled", img_url, genre, link }) {
    const sharedProps = {
        className: "group flex flex-col gap-3 w-40",
        "aria-label": title,
    };

    const card = (
        <CardBody
            title={title}
            genre={genre}
            imgSrc={img_url || FALLBACK_IMG}
            onImageError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMG;
            }}
        />
    );

    if (!link || link === "#") {
        return (
            <div {...sharedProps}>
                {card}
            </div>
        );
    }

    if (/^https?:\/\//i.test(link)) {
        return (
            <a
                {...sharedProps}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
            >
                {card}
            </a>
        );
    }

    return (
        <Link {...sharedProps} href={link}>
            {card}
        </Link>
    );
}
