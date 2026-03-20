import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Support PDF Lovers",
    description:
        "Support PDF Lovers with donations, reviews, and sharing so we can keep free books and open access reading available.",
    path: "/support",
    keywords: ["support pdf lovers", "donate to pdf lovers", "help free books stay online"],
});

export default function SupportLayout({ children }: { children: ReactNode }) {
    return children;
}
