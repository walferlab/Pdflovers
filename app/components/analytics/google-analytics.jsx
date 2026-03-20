"use client";

import { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import {
    GA_MEASUREMENT_ID,
    isAnalyticsEnabled,
    pageview,
} from "@/lib/analytics/google-analytics";

function AnalyticsPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams.toString();

    useEffect(() => {
        const path = search ? `${pathname}?${search}` : pathname;
        pageview(path);
    }, [pathname, search]);

    return null;
}

export function GoogleAnalytics() {
    if (!isAnalyticsEnabled()) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
                `}
            </Script>
            <Suspense fallback={null}>
                <AnalyticsPageView />
            </Suspense>
        </>
    );
}
