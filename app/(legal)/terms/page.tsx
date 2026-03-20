// app/(legal)/terms/page.jsx
"use client";

import Link from "next/link";

const LAST_UPDATED = "March 18, 2026";

const sections = [
    {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: [
            `By accessing or using PDF Lovers ("the Platform," "we," "us," or "our") at pdflovers.app, you ("User," "you") agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, you must immediately discontinue use of the Platform.`,
            `These Terms constitute a legally binding agreement between you and PDF Lovers. Your continued use of the Platform following any modification to these Terms constitutes acceptance of the revised Terms. We reserve the right to update these Terms at any time without prior notice.`,
            `If you are accessing the Platform on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.`,
        ],
    },
    {
        id: "eligibility",
        title: "2. Eligibility",
        content: [
            `You must be at least 13 years of age to use the Platform. If you are under 18 years of age, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.`,
            `You represent that you are not located in a country subject to a U.S. Government embargo or sanctions, and that you are not listed on any U.S. Government list of prohibited or restricted parties.`,
            `PDF Lovers reserves the right to refuse service, terminate accounts, or remove content at its sole discretion, including for violation of these Terms or applicable law.`,
        ],
    },
    {
        id: "content",
        title: "3. Content & Intellectual Property",
        content: [
            `PDF Lovers hosts documents that are either (a) in the public domain, (b) licensed under Creative Commons or equivalent open licenses, (c) open-access academic or research publications, or (d) shared with explicit permission from the copyright holder. We make no claim of ownership over any hosted content.`,
            `All content on the Platform is provided strictly for personal, non-commercial, educational, and informational use only. You may not reproduce, redistribute, sell, sublicense, broadcast, or otherwise exploit any content from the Platform for commercial purposes without express written authorization from the applicable rights holder.`,
            `If you believe any content on the Platform infringes your copyright, please refer to Section 9 (DMCA & Copyright Complaints) below. We take intellectual property rights seriously and will respond promptly to valid notices.`,
            `The PDF Lovers name, logo, brand identity, and all associated intellectual property are exclusively owned by PDF Lovers. You may not use our branding, trademarks, or trade dress without our prior written consent.`,
        ],
    },
    {
        id: "prohibited",
        title: "4. Prohibited Conduct",
        content: [
            `You agree not to engage in any of the following prohibited activities: (a) uploading, transmitting, or distributing any content that infringes any patent, trademark, trade secret, copyright, or other intellectual property rights; (b) using the Platform to distribute malware, viruses, or any other harmful software; (c) attempting to gain unauthorized access to any portion of the Platform, other accounts, computer systems, or networks; (d) scraping, crawling, or using automated tools to access or index the Platform without our express written permission; (e) circumventing, disabling, or interfering with any security or access-control features of the Platform; (f) using the Platform to harass, abuse, or harm another person; (g) impersonating any person or entity or misrepresenting your affiliation with any person or entity.`,
            `We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates this provision, including without limitation, reporting such violations to law enforcement authorities.`,
        ],
    },
    {
        id: "uploads",
        title: "5. User Uploads & Submissions",
        content: [
            `If the Platform permits you to upload content, you represent and warrant that: (a) you own all rights to the content or have obtained all necessary permissions, licenses, and consents to submit such content; (b) the content does not violate any applicable law, regulation, or third-party rights; (c) the content is not defamatory, obscene, harmful to minors, or otherwise objectionable.`,
            `By submitting content, you grant PDF Lovers a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Platform and our business operations.`,
            `PDF Lovers does not endorse any user-submitted content and expressly disclaims all liability in connection with such content. We reserve the right, but not the obligation, to monitor, edit, or remove any user-submitted content at our sole discretion.`,
        ],
    },
    {
        id: "advertising",
        title: "6. Advertising & Third-Party Services",
        content: [
            `The Platform may display advertisements served by third-party ad networks including but not limited to Google AdSense and other premium advertising partners. These advertisements are served by third parties who may use cookies, web beacons, or similar tracking technologies to collect information about your interaction with ads. PDF Lovers does not control the content of these advertisements and is not responsible for any claims arising from them.`,
            `The Platform may contain links to third-party websites or services. These links are provided for convenience only. PDF Lovers has no control over the content of linked sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them. Your use of third-party websites is subject to the terms and privacy policies of those websites.`,
        ],
    },
    {
        id: "privacy",
        title: "7. Privacy",
        content: [
            `Your use of the Platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.`,
            `We may collect usage data, device information, and browsing behavior to improve the Platform and serve relevant advertising. We do not sell personally identifiable information to third parties.`,
        ],
    },
    {
        id: "disclaimer-terms",
        title: "8. Disclaimer of Warranties",
        content: [
            `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.`,
            `PDF LOVERS DOES NOT WARRANT THAT: (A) THE PLATFORM WILL FUNCTION UNINTERRUPTED, SECURE, OR ERROR-FREE; (B) ANY ERRORS WILL BE CORRECTED; (C) THE PLATFORM IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; (D) THE RESULTS OF USING THE PLATFORM WILL MEET YOUR REQUIREMENTS.`,
        ],
    },
    {
        id: "liability",
        title: "9. Limitation of Liability",
        content: [
            `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PDF LOVERS, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM: (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM; (C) ANY CONTENT OBTAINED FROM THE PLATFORM; (D) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.`,
            `IN JURISDICTIONS THAT DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, OUR LIABILITY SHALL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.`,
        ],
    },
    {
        id: "dmca",
        title: "10. DMCA & Copyright Complaints",
        content: [
            `PDF Lovers respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA). If you believe that material available on the Platform infringes your copyright, please send a written notice to our designated agent containing: (a) a physical or electronic signature of the copyright owner or authorized agent; (b) identification of the copyrighted work claimed to have been infringed; (c) identification of the material claimed to be infringing with sufficient detail to locate it; (d) your contact information; (e) a statement that you have a good faith belief that the use is not authorized; (f) a statement, under penalty of perjury, that the information in the notice is accurate.`,
            `Send DMCA notices to: legal@pdflovers.app. We will respond to valid DMCA notices promptly and will remove or disable access to infringing material. Repeat infringers will have their access to the Platform terminated.`,
        ],
    },
    {
        id: "indemnification",
        title: "11. Indemnification",
        content: [
            `You agree to defend, indemnify, and hold harmless PDF Lovers and its officers, directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Platform, including, but not limited to, any use of the Platform's content, services, and products other than as expressly authorized in these Terms.`,
        ],
    },
    {
        id: "governing",
        title: "12. Governing Law & Dispute Resolution",
        content: [
            `These Terms shall be governed by and construed in accordance with applicable law. Any dispute arising out of or relating to these Terms or the Platform shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.`,
            `You agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action. If for any reason a claim proceeds in court, you waive any right to a jury trial.`,
            `Notwithstanding the above, PDF Lovers may seek injunctive or other equitable relief in any court of competent jurisdiction to protect its intellectual property rights.`,
        ],
    },
    {
        id: "termination",
        title: "13. Termination",
        content: [
            `PDF Lovers reserves the right to terminate or suspend your access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Platform will immediately cease.`,
            `All provisions of these Terms which by their nature should survive termination shall survive, including without limitation ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
        ],
    },
    {
        id: "contact-terms",
        title: "14. Contact",
        content: [
            `If you have any questions about these Terms, please contact us at legal@pdflovers.app or through our Contact page at pdflovers.app/contact-us.`,
        ],
    },
];

export default function TermsPage() {
    return (
        <main className="min-h-screen text-white p-2 sm:pl-20" style={{ background: "#080808" }}>

            {/* Header */}
            <section className="px-6 pt-32 pb-16 max-w-3xl mx-auto">
                <h1
                    className="font-brand font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.03em] leading-[1.08] mb-5"
                    style={{ background: "linear-gradient(160deg,#fff 40%,#666 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                    Terms of Service
                </h1>
                <p className="font-satoshi font-medium text-[14px] leading-relaxed mb-3" style={{ color: "#666" }}>
                    Last updated: <span style={{ color: "#999" }}>{LAST_UPDATED}</span>
                </p>
                <p className="font-satoshi font-medium text-[15px] leading-relaxed" style={{ color: "#777" }}>
                    Please read these Terms carefully before using PDF Lovers. By accessing the Platform, you agree to be legally bound by these Terms.
                </p>
            </section>

            {/* Table of Contents */}
            <section className="px-6 pb-12 max-w-3xl mx-auto">
                <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <p className="font-satoshi font-semibold text-[11px] tracking-widest uppercase mb-4" style={{ color: "#666" }}>
                        Contents
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="font-satoshi font-medium text-[13px] py-1.5 transition-colors duration-150 hover:text-white"
                                style={{ color: "#666" }}
                            >
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sections */}
            <section className="px-6 pb-24 max-w-3xl mx-auto">
                <div className="flex flex-col gap-12">
                    {sections.map((s) => (
                        <div key={s.id} id={s.id} className="scroll-mt-24">
                            <h2
                                className="font-brand font-semibold text-[19px] tracking-[-0.015em] mb-5"
                                style={{ color: "#e0e0e0" }}
                            >
                                {s.title}
                            </h2>
                            <div className="flex flex-col gap-4">
                                {s.content.map((para, i) => (
                                    <p
                                        key={i}
                                        className="font-satoshi font-medium text-[14px] leading-[1.85]"
                                        style={{ color: "#888" }}
                                    >
                                        {para}
                                    </p>
                                ))}
                            </div>
                            <div className="mt-10" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer note */}
            <div className="text-center pb-12 font-satoshi font-medium text-[12px]" style={{ color: "#444" }}>
                © {new Date().getFullYear()} PDF Lovers ·{" "}
                <Link href="/about-us" className="hover:text-white transition-colors duration-150">About</Link>
                {" · "}
                <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms</Link>
                {" · "}
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
                {" · "}
                <Link href="/disclaimer" className="hover:text-white transition-colors duration-150">Disclaimer</Link>
            </div>
        </main>
    );
}