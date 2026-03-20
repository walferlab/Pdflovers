import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "About PDF Lovers",
    description:
        "Learn what PDF Lovers is, why we built it, and how we make legal, open access reading easier to discover.",
    path: "/about-us",
    keywords: ["about pdf lovers", "open library mission", "legal free books"],
});

export default function AboutLayout({ children }: { children: ReactNode }) {
    return children;
}
