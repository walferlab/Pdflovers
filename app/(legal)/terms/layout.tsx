import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Terms of Service | PDF Lovers",
    description:
        "Read the PDF Lovers terms of service for platform rules, copyright policy, acceptable use, and dispute terms.",
    path: "/terms",
    keywords: ["terms of service", "acceptable use policy", "copyright complaints"],
});

export default function TermsLayout({ children }: { children: ReactNode }) {
    return children;
}
