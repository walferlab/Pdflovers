import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Privacy Policy | PDF Lovers",
    description:
        "Read the PDF Lovers privacy policy covering cookies, analytics, advertising, and how we process personal data.",
    path: "/privacy-policy",
    keywords: ["privacy policy", "analytics policy", "cookies policy", "data privacy"],
});

export default function PrivacyPolicyLayout({ children }: { children: ReactNode }) {
    return children;
}
