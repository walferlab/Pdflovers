import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Contact PDF Lovers",
    description:
        "Contact PDF Lovers for questions, copyright concerns, support requests, partnerships, or general feedback.",
    path: "/contact-us",
    keywords: ["contact pdf lovers", "support contact", "copyright concerns"],
});

export default function ContactLayout({ children }: { children: ReactNode }) {
    return children;
}
