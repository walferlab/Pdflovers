// app/(legal)/privacy/page.jsx
"use client";

import Link from "next/link";

const LAST_UPDATED = "March 18, 2026";

const sections = [
    {
        id: "introduction",
        title: "1. Introduction",
        content: [
            `PDF Lovers ("we," "us," "our," or "the Platform") operates pdflovers.app. We are committed to protecting your privacy and handling your personal information with transparency, integrity, and respect. This Privacy Policy explains what information we collect, how we use it, who we share it with, and what rights you have over your data.`,
            `By accessing or using PDF Lovers, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with any part of this policy, please discontinue your use of the Platform immediately.`,
            `This Privacy Policy applies to all users of pdflovers.app, including visitors, registered users, and content uploaders. It covers information collected through the website, any associated APIs, and any other digital properties operated by PDF Lovers.`,
        ],
    },
    {
        id: "information-we-collect",
        title: "2. Information We Collect",
        content: [
            `We collect information in the following ways:`,
            `(a) Information You Provide Directly: When you contact us via our contact form or email, we collect your name, email address, and the content of your message. If the Platform permits account creation or content uploads in the future, we will collect registration details such as username, email, and password (stored in hashed form).`,
            `(b) Information Collected Automatically: When you visit the Platform, we and our third-party partners automatically collect certain technical information including: your IP address; browser type and version; operating system; device type and identifiers; referring URLs; pages visited and time spent; clickstream data; and search queries entered on the Platform. This information is collected using cookies, web beacons, pixel tags, and similar tracking technologies.`,
            `(c) Information from Third-Party Advertising Partners: Our advertising partners, including Google AdSense and other premium ad networks, may collect information about your browsing behavior across websites to serve interest-based advertisements. This data is collected independently by these third parties and is governed by their respective privacy policies.`,
            `(d) Analytics Data: We use third-party analytics tools (such as Google Analytics) that collect aggregated, anonymized data about how users interact with the Platform, including page views, session duration, traffic sources, and geographic location at the country or city level.`,
        ],
    },
    {
        id: "cookies",
        title: "3. Cookies & Tracking Technologies",
        content: [
            `The Platform uses the following categories of cookies and tracking technologies:`,
            `(a) Strictly Necessary Cookies: These are essential for the Platform to function. They enable core functionality such as security, page navigation, and access to secure areas. The Platform cannot function properly without these cookies and they cannot be disabled.`,
            `(b) Performance & Analytics Cookies: These cookies collect information about how visitors use the Platform, such as which pages are visited most often and whether error messages are received. All information collected is aggregated and anonymized. We use Google Analytics for this purpose.`,
            `(c) Advertising Cookies: These cookies are set by our advertising partners to build a profile of your interests and serve relevant advertisements on the Platform and across other websites. They uniquely identify your browser and device. If you do not allow these cookies, you will experience less targeted advertising.`,
            `(d) Functional Cookies: These cookies allow the Platform to remember choices you make (such as your language or region) and provide enhanced, personalized features.`,
            `You can control cookies through your browser settings. Most browsers allow you to refuse or delete cookies. However, disabling certain cookies may affect the functionality of the Platform. To opt out of Google Analytics, you can install the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.`,
        ],
    },
    {
        id: "how-we-use",
        title: "4. How We Use Your Information",
        content: [
            `We use the information we collect for the following purposes:`,
            `(a) To Operate and Improve the Platform: We use technical and usage data to maintain, improve, and optimize the Platform's performance, features, and user experience.`,
            `(b) To Serve Advertising: We use cookies and browsing data to display relevant advertisements through our third-party advertising partners. This advertising revenue supports the Platform and allows us to provide free access to content.`,
            `(c) To Respond to Communications: If you contact us, we use the information you provide solely to respond to your inquiry or complaint.`,
            `(d) To Ensure Security: We use technical data to detect, prevent, and address fraud, abuse, security incidents, and other harmful or illegal activity.`,
            `(e) To Comply with Legal Obligations: We may use and disclose your information as required by applicable law, regulation, legal process, or governmental request.`,
            `(f) To Enforce Our Policies: We use collected information to enforce our Terms of Service, Disclaimer, and other applicable policies, including investigating potential violations.`,
            `We do not use your personal information to make automated decisions that significantly affect you, and we do not engage in profiling for purposes beyond serving contextually relevant advertising.`,
        ],
    },
    {
        id: "legal-basis",
        title: "5. Legal Basis for Processing (GDPR)",
        content: [
            `If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, our legal bases for processing your personal information are as follows:`,
            `(a) Legitimate Interests: We process technical and usage data based on our legitimate interests in operating, securing, and improving the Platform, provided these interests are not overridden by your fundamental rights and freedoms.`,
            `(b) Consent: Where required by law, we obtain your consent before placing non-essential cookies or processing your data for advertising purposes. You may withdraw your consent at any time by adjusting your browser cookie settings or using available opt-out tools.`,
            `(c) Legal Obligation: We process data where necessary to comply with applicable legal obligations, including responding to valid legal requests from authorities.`,
            `(d) Contractual Necessity: If you enter into any agreement with us (such as a content partnership), we process your data to fulfill our obligations under that agreement.`,
        ],
    },
    {
        id: "sharing",
        title: "6. How We Share Your Information",
        content: [
            `PDF Lovers does not sell, rent, or trade your personally identifiable information to third parties for their own marketing purposes. We share information only in the following limited circumstances:`,
            `(a) Advertising Partners: We share cookie identifiers and browsing data with our advertising partners (including Google AdSense) to enable the delivery of targeted advertisements. This sharing is governed by those partners' privacy policies and industry self-regulatory frameworks.`,
            `(b) Analytics Providers: We share anonymized, aggregated usage data with analytics providers such as Google Analytics to understand Platform usage and improve the user experience.`,
            `(c) Service Providers: We may share data with trusted third-party service providers who assist us in operating the Platform, such as hosting providers, content delivery networks (CDNs), and security services. These providers are contractually obligated to use your data only as directed by us and in accordance with this Privacy Policy.`,
            `(d) Legal Requirements: We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the rights, property, or safety of PDF Lovers, our users, or the public.`,
            `(e) Business Transfers: If PDF Lovers is acquired, merged, or undergoes a change of ownership, your information may be transferred as part of that transaction. We will notify you via a prominent notice on the Platform prior to any such transfer becoming subject to a different Privacy Policy.`,
        ],
    },
    {
        id: "advertising-privacy",
        title: "7. Advertising & Your Choices",
        content: [
            `PDF Lovers is supported by advertising. We work with third-party advertising networks to display ads on the Platform. These networks may use cookies and similar technologies to collect data about your visits to the Platform and other websites to serve advertisements that are relevant to your interests.`,
            `Google, as a third-party vendor, uses cookies to serve ads on our Platform. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting Google's Ads Settings at adssettings.google.com.`,
            `You may also opt out of interest-based advertising from other participating companies through the Network Advertising Initiative (NAI) opt-out tool at optout.networkadvertising.org or the Digital Advertising Alliance (DAA) opt-out tool at optout.aboutads.info.`,
            `Please note that opting out of interest-based advertising does not mean you will no longer see advertisements on the Platform — you will still see ads, but they will not be personalized based on your browsing behavior.`,
        ],
    },
    {
        id: "data-retention",
        title: "8. Data Retention",
        content: [
            `We retain personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.`,
            `Server logs and IP addresses are retained for a maximum of 90 days for security and abuse prevention purposes. Analytics data is retained in anonymized, aggregated form for up to 26 months. Email correspondence is retained for up to 2 years from the date of last communication.`,
            `When personal data is no longer required, we delete or anonymize it in a secure manner. Where deletion is not technically feasible, we isolate the data from further processing until deletion is possible.`,
        ],
    },
    {
        id: "security",
        title: "9. Data Security",
        content: [
            `We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include HTTPS encryption for all data transmitted to and from the Platform, regular security assessments, access controls, and monitoring for suspicious activity.`,
            `However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. You use the Platform at your own risk and are responsible for maintaining the security of any account credentials.`,
            `In the event of a data breach that is likely to result in a risk to your rights and freedoms, we will notify affected users and relevant supervisory authorities as required by applicable law, including within 72 hours where required under the GDPR.`,
        ],
    },
    {
        id: "childrens",
        title: "10. Children's Privacy",
        content: [
            `The Platform is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected personal information from a child under 13, we will take immediate steps to delete that information from our records.`,
            `If you are a parent or guardian and believe your child has provided personal information to the Platform, please contact us immediately at privacy@pdflovers.app so we can take appropriate action.`,
            `Users between the ages of 13 and 18 should review this Privacy Policy with their parent or guardian before using the Platform.`,
        ],
    },
    {
        id: "your-rights",
        title: "11. Your Privacy Rights",
        content: [
            `Depending on your location, you may have the following rights regarding your personal information:`,
            `(a) Right of Access: You have the right to request a copy of the personal information we hold about you.`,
            `(b) Right to Rectification: You have the right to request that we correct any inaccurate or incomplete personal information we hold about you.`,
            `(c) Right to Erasure ("Right to Be Forgotten"): You have the right to request that we delete your personal information, subject to certain exceptions such as compliance with legal obligations.`,
            `(d) Right to Restrict Processing: You have the right to request that we restrict the processing of your personal information under certain circumstances.`,
            `(e) Right to Data Portability: Where processing is based on consent or contract, you have the right to receive your personal data in a structured, commonly used, machine-readable format.`,
            `(f) Right to Object: You have the right to object to the processing of your personal information where we rely on legitimate interests as our legal basis.`,
            `(g) Rights Related to Automated Decision-Making: You have the right not to be subject to decisions based solely on automated processing, including profiling, that produce legal or similarly significant effects.`,
            `(h) California Privacy Rights (CCPA/CPRA): If you are a California resident, you have the right to know what personal information we collect, the right to delete personal information, the right to opt out of the sale of personal information (we do not sell personal information), and the right not to be discriminated against for exercising your rights.`,
            `To exercise any of these rights, please contact us at privacy@pdflovers.app. We will respond to all legitimate requests within 30 days. We may need to verify your identity before processing your request.`,
        ],
    },
    {
        id: "international",
        title: "12. International Data Transfers",
        content: [
            `PDF Lovers operates globally and your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.`,
            `Where we transfer personal data from the EEA, UK, or Switzerland to countries that have not been deemed to provide an adequate level of data protection, we rely on appropriate safeguards such as Standard Contractual Clauses approved by the European Commission, or we ensure that the recipient is certified under an applicable adequacy framework.`,
            `By using the Platform, you consent to your information being transferred to and processed in countries outside your country of residence, including countries that may not offer the same level of data protection as your home country.`,
        ],
    },
    {
        id: "third-party-links",
        title: "13. Third-Party Links & Services",
        content: [
            `The Platform may contain links to third-party websites, services, or advertisements. This Privacy Policy does not apply to those third-party sites. We are not responsible for the privacy practices or content of any third-party website. We encourage you to review the privacy policies of any third-party sites you visit.`,
            `When you click on a third-party advertisement displayed on the Platform, you will be directed to a third-party website. Your interaction with that website is governed solely by the third party's privacy policy and terms of service.`,
        ],
    },
    {
        id: "changes",
        title: "14. Changes to This Privacy Policy",
        content: [
            `We reserve the right to update or modify this Privacy Policy at any time. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, notify you by posting a prominent notice on the Platform.`,
            `Your continued use of the Platform after any changes to this Privacy Policy constitutes your acceptance of the revised policy. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.`,
            `If we make changes that materially affect how we use your personal information, we will seek your consent where required by applicable law.`,
        ],
    },
    {
        id: "contact-privacy",
        title: "15. Contact & Data Controller",
        content: [
            `PDF Lovers is the data controller responsible for your personal information. If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us at:`,
            `Email: privacy@pdflovers.app`,
            `For DMCA or legal matters: legal@pdflovers.app`,
            `General inquiries: pdflovers.app/contact-us`,
            `We aim to respond to all privacy-related inquiries within 5 business days. If you are located in the EEA and are not satisfied with our response, you have the right to lodge a complaint with your local data protection supervisory authority.`,
        ],
    },
];

export default function PrivacyPage() {
    return (
        <main className="min-h-screen text-white p-2 sm:pl-20" style={{ background: "#080808" }}>

            {/* ── Header ── */}
            <section className="px-6 pt-32 pb-16 max-w-3xl mx-auto">
                <span
                    className="inline-block font-satoshi font-medium text-[11px] tracking-[0.12em] uppercase mb-6 px-3 py-1 rounded-full"
                    style={{ color: "#aaa", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
                >
                    Legal
                </span>
                <h1
                    className="font-brand font-bold text-[clamp(2rem,5vw,3.5rem)] tracking-[-0.03em] leading-[1.08] mb-5"
                    style={{ background: "linear-gradient(160deg,#fff 40%,#666 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                    Privacy Policy
                </h1>
                <p className="font-satoshi font-medium text-[14px] leading-relaxed mb-3" style={{ color: "#666" }}>
                    Last updated: <span style={{ color: "#999" }}>{LAST_UPDATED}</span>
                </p>
                <p className="font-satoshi font-medium text-[15px] leading-[1.75]" style={{ color: "#777" }}>
                    Your privacy matters to us. This policy explains exactly what data we collect, why we collect it, how we use it, and the rights you have over it. We have written this in plain language — no legalese where it can be avoided.
                </p>
            </section>

            {/* ── Table of Contents ── */}
            <section className="px-6 pb-12 max-w-3xl mx-auto">
                <div
                    className="rounded-2xl p-6"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                    <p className="font-satoshi font-medium text-[11px] tracking-widest uppercase mb-4" style={{ color: "#666" }}>
                        Contents
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {sections.map((s) => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className="font-satoshi font-medium text-[13px] py-1 transition-colors duration-150 hover:text-white"
                                style={{ color: "#555" }}
                            >
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Sections ── */}
            <section className="px-6 pb-24 max-w-3xl mx-auto">
                <div className="flex flex-col gap-12">
                    {sections.map((s) => (
                        <div key={s.id} id={s.id} className="scroll-mt-24">
                            <h2
                                className="font-brand font-semibold text-[18px] tracking-[-0.015em] mb-5"
                                style={{ color: "#ddd" }}
                            >
                                {s.title}
                            </h2>
                            <div className="flex flex-col gap-4">
                                {s.content.map((para, i) => (
                                    <p
                                        key={i}
                                        className="font-satoshi font-medium text-[14px] leading-[1.85]"
                                        style={{ color: "#777" }}
                                    >
                                        {para}
                                    </p>
                                ))}
                            </div>
                            <div className="mt-10" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Footer ── */}
            <div className="text-center pb-12 font-satoshi font-medium text-[12px]" style={{ color: "#444" }}>
                © {new Date().getFullYear()} PDF Lovers ·{" "}
                <Link href="/about-us" className="hover:text-white transition-colors duration-150">About</Link>
                {" · "}
                <Link href="/contact-us" className="hover:text-white transition-colors duration-150">Contact</Link>
                {" · "}
                <Link href="/terms" className="hover:text-white transition-colors duration-150">Terms</Link>
                {" · "}
                <Link href="/disclaimer" className="hover:text-white transition-colors duration-150">Disclaimer</Link>
            </div>
        </main>
    );
}