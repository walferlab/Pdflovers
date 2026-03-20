// app/(legal)/disclaimer/page.jsx
"use client";

import Link from "next/link";

const LAST_UPDATED = "March 18, 2026";

const sections = [
    {
        id: "general",
        title: "1. General Disclaimer",
        content: [
            `The information, content, documents, and materials available on PDF Lovers ("the Platform," located at pdflovers.app) are provided strictly for general informational and educational purposes only. PDF Lovers makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of any content on the Platform for any purpose.`,
            `Any reliance you place on information found on the Platform is strictly at your own risk. PDF Lovers expressly disclaims all liability for any action taken or not taken based on content available through the Platform.`,
        ],
    },
    {
        id: "copyright",
        title: "2. Copyright & Content Sources",
        content: [
            `PDF Lovers is committed to hosting only legally permissible content. All documents available on the Platform fall into one or more of the following categories: (a) works that have entered the public domain and are no longer protected by copyright; (b) works licensed under Creative Commons, Open Access, or equivalent free licenses that explicitly permit redistribution; (c) academic and research publications made available under open-access mandates or publisher policies; (d) works submitted or authorized for distribution by the copyright holder directly.`,
            `Despite our best efforts, if you believe any content on the Platform infringes your copyright or the copyright of a third party, please contact us immediately at legal@pdflovers.app with full details. We will investigate the matter promptly and remove or disable access to any infringing material upon confirmation of a valid claim.`,
            `PDF Lovers does not condone, encourage, or facilitate copyright infringement in any form. We are not a piracy platform. Any content found to be in violation of applicable copyright law will be removed without delay.`,
        ],
    },
    {
        id: "accuracy",
        title: "3. Accuracy of Content",
        content: [
            `The documents hosted on the Platform are made available as-is. PDF Lovers does not review, edit, verify, or endorse the accuracy, completeness, or reliability of any document or its contents. Content may be outdated, contain errors, or reflect views that do not represent those of PDF Lovers.`,
            `PDF Lovers is not responsible for any errors, omissions, or inaccuracies in any content hosted on the Platform. Users are encouraged to verify any critical information obtained through the Platform from authoritative primary sources before relying on it for any decision-making purpose.`,
        ],
    },
    {
        id: "professional",
        title: "4. No Professional Advice",
        content: [
            `Nothing on the Platform constitutes or should be construed as legal, medical, financial, psychological, academic, or any other form of professional advice. If you require professional guidance, you should consult a qualified professional in the relevant field.`,
            `PDF Lovers, its operators, employees, contributors, and affiliates are not liable for any decisions made or actions taken based on information obtained from content available on the Platform.`,
        ],
    },
    {
        id: "third-party",
        title: "5. Third-Party Content & Links",
        content: [
            `The Platform may contain links to third-party websites, advertisements, or resources. These links are provided for your convenience only. PDF Lovers has no control over the content, privacy policies, practices, or availability of any third-party sites and does not endorse or assume responsibility for them.`,
            `Third-party advertising displayed on the Platform is served by independent ad networks. PDF Lovers does not control the content of advertisements and is not responsible for any representations made therein. The display of an advertisement does not imply endorsement of the advertised product or service.`,
            `PDF Lovers is not liable for any loss or damage arising from your use of any third-party content, website, or service accessed through or in connection with the Platform.`,
        ],
    },
    {
        id: "advertising-disclaimer",
        title: "6. Advertising Disclosure",
        content: [
            `PDF Lovers is supported by advertising revenue. The Platform displays advertisements served by third-party advertising partners including, but not limited to, Google AdSense and other premium ad networks. These advertisers may use cookies and tracking technologies to serve ads relevant to your interests based on your browsing activity.`,
            `Advertisements displayed on the Platform are clearly identifiable as such. PDF Lovers does not receive compensation in exchange for editorially featuring, recommending, or promoting any specific book, author, or product within non-advertising content.`,
            `If you have concerns about interest-based advertising, you may opt out through your browser settings or through industry opt-out tools such as the NAI Consumer Opt-Out or the DAA WebChoices tool.`,
        ],
    },
    {
        id: "availability",
        title: "7. Platform Availability",
        content: [
            `PDF Lovers does not warrant that the Platform will be available at all times or that access will be uninterrupted, timely, or error-free. The Platform may be temporarily unavailable due to maintenance, technical issues, or circumstances beyond our control.`,
            `We reserve the right to modify, suspend, or discontinue the Platform or any part thereof at any time without notice. PDF Lovers shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Platform.`,
        ],
    },
    {
        id: "uploads-disclaimer",
        title: "8. User-Uploaded Content",
        content: [
            `If the Platform permits user uploads, PDF Lovers does not pre-screen or verify user-submitted content before it is published. Any content uploaded by users represents the views and responsibility of the uploader, not of PDF Lovers.`,
            `PDF Lovers reserves the right to remove any user-uploaded content at its sole discretion, particularly content that appears to infringe copyright, violate applicable law, or breach our Terms of Service. Users who upload infringing or illegal content may have their access terminated and may be reported to appropriate authorities.`,
        ],
    },
    {
        id: "liability-disclaimer",
        title: "9. Limitation of Liability",
        content: [
            `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, PDF LOVERS AND ITS OWNERS, OPERATORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE PLATFORM OR ITS CONTENT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`,
            `THIS INCLUDES BUT IS NOT LIMITED TO: DAMAGES FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES; UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA; STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE PLATFORM; OR ANY OTHER MATTER RELATING TO THE PLATFORM.`,
            `SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. IN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.`,
        ],
    },
    {
        id: "indemnity",
        title: "10. Indemnity",
        content: [
            `By using the Platform, you agree to indemnify, defend, and hold harmless PDF Lovers and its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including attorney's fees) arising from: (a) your use of the Platform; (b) your violation of these disclaimers or our Terms of Service; (c) your violation of any third-party rights, including copyright or intellectual property rights; or (d) any claim that your use of the Platform caused damage to a third party.`,
        ],
    },
    {
        id: "changes",
        title: "11. Changes to This Disclaimer",
        content: [
            `PDF Lovers reserves the right to amend this Disclaimer at any time without prior notice. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform following any changes constitutes your acceptance of the revised Disclaimer.`,
            `We encourage you to review this Disclaimer periodically to stay informed about how we are protecting the interests of all parties. The date of the most recent revision appears at the top of this page.`,
        ],
    },
    {
        id: "contact-disclaimer",
        title: "12. Contact Us",
        content: [
            `If you have any questions, concerns, or complaints regarding this Disclaimer or the content on the Platform, please contact us at legal@pdflovers.app or visit our Contact page at pdflovers.app/contact-us. We aim to respond to all inquiries within 5 business days.`,
        ],
    },
];

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen text-white p-2 sm:pl-20" style={{ background: "#080808" }}>

            {/* Header */}
            <section className="px-6 pt-32 pb-16 max-w-3xl mx-auto">
                <h1
                    className="font-brand font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.03em] leading-[1.08] mb-5"
                    style={{ background: "linear-gradient(160deg,#fff 40%,#666 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                    Disclaimer
                </h1>
                <p className="font-satoshi font-medium text-[14px] leading-relaxed mb-3" style={{ color: "#666" }}>
                    Last updated: <span style={{ color: "#999" }}>{LAST_UPDATED}</span>
                </p>
                <p className="font-satoshi font-medium text-[15px] leading-relaxed" style={{ color: "#777" }}>
                    This Disclaimer governs your use of pdflovers.app. Please read it carefully. By using the Platform you acknowledge and accept its terms in full.
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
                <Link href="/contact-us" className="hover:text-white transition-colors duration-150">Contact</Link>
                {" · "}
                <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms</Link>
                {" · "}
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-150">Privacy Policy</Link>
            </div>
        </main>
    );
}