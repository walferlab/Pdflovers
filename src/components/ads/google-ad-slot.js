"use client";

import { useEffect } from "react";

export function GoogleAdSlot({ slot, className = "" }) {
  const adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const wrapperClassName = className ? `ad-slot-shell ${className}` : "ad-slot-shell";

  useEffect(() => {
    if (!adClient || !slot || typeof window === "undefined") {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("Google ad slot failed to load.", error);
    }
  }, [adClient, slot]);

  if (!adClient || !slot) {
    return (
      <aside className={wrapperClassName} aria-label="Advertisement">
        <p className="ad-slot-label">Sponsored</p>
        <div className="ad-slot-placeholder">Ad space reserved for Google Ads</div>
      </aside>
    );
  }

  return (
    <aside className={wrapperClassName} aria-label="Advertisement">
      <p className="ad-slot-label">Sponsored</p>
      <div className="ad-slot-frame">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
