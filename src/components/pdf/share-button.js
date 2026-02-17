"use client";

import { useState } from "react";

export function ShareButton({ title, path, className = "button-outline", label = "Share this book" }) {
  const [isCopied, setIsCopied] = useState(false);

  async function handleShare() {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = path ? `${window.location.origin}${path}` : window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title,
          text: `Check out this PDF: ${title}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1800);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Unable to share this book right now.", error);
      }
    }
  }

  return (
    <button className={className} type="button" onClick={handleShare}>
      {isCopied ? "Link copied" : label}
    </button>
  );
}
