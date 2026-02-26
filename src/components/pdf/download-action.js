"use client";

import { useMemo, useState } from "react";

const REQUIRED_SMART_CLICKS = 2;

function openInNewTab(url) {
  if (!url || typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function triggerDownload(url) {
  if (!url || typeof window === "undefined") {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.rel = "noopener noreferrer";
  anchor.setAttribute("download", "");
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function DownloadAction({ title, pdfPublicId, smartLink, downloadLink }) {
  const [smartClicksCompleted, setSmartClicksCompleted] = useState(0);
  const [noticeType, setNoticeType] = useState("idle");
  const [showNotice, setShowNotice] = useState(false);

  const requiresSmartGate = Boolean(smartLink);
  const hasAnyLink = Boolean(downloadLink || smartLink);

  const smartApiLink = useMemo(() => {
    return pdfPublicId && smartLink ? `/api/download/${pdfPublicId}?stage=smart` : "";
  }, [pdfPublicId, smartLink]);

  const directApiLink = useMemo(() => {
    return pdfPublicId && downloadLink ? `/api/download/${pdfPublicId}?stage=direct` : "";
  }, [pdfPublicId, downloadLink]);

  const smartTarget = smartApiLink || smartLink || "";
  const directTarget = directApiLink || downloadLink || smartLink || "";
  const remainingUnlockClicks = requiresSmartGate
    ? Math.max(REQUIRED_SMART_CLICKS - smartClicksCompleted, 0)
    : 0;
  const isDownloadReady = remainingUnlockClicks === 0;

  function handleDownloadClick() {
    if (!hasAnyLink) {
      return;
    }

    if (requiresSmartGate && !isDownloadReady) {
      const nextCompleted = Math.min(smartClicksCompleted + 1, REQUIRED_SMART_CLICKS);
      openInNewTab(smartTarget);
      setSmartClicksCompleted(nextCompleted);
      setNoticeType(nextCompleted >= REQUIRED_SMART_CLICKS ? "ready" : "step");
      setShowNotice(true);
      return;
    }

    triggerDownload(directTarget);
    setNoticeType("download");
    setShowNotice(true);
  }

  let statusText = "Download link unavailable right now.";

  if (hasAnyLink) {
    if (remainingUnlockClicks === 2) {
      statusText = "2 clicks left";
    } else if (remainingUnlockClicks === 1) {
      statusText = "1 click left";
    } else {
      statusText = "Download ready";
    }
  }

  return (
    <div className="download-action">
      <button className="button-solid" type="button" disabled={!hasAnyLink} onClick={handleDownloadClick}>
        {isDownloadReady ? "Download PDF" : "Unlock Download"}
      </button>
      <p className="download-status">{statusText}</p>

      {showNotice ? (
        <div className="download-notice" role="status" aria-live="polite">
          <button
            className="download-notice-close"
            type="button"
            onClick={() => setShowNotice(false)}
            aria-label="Close download notice"
          >
            X
          </button>
          {noticeType === "download" ? (
            <p>Thanks! {title ? `"${title}"` : "Your file"} is downloading in a few seconds.</p>
          ) : noticeType === "ready" ? (
            <p>Download ready. Click the button once to start the real PDF download.</p>
          ) : (
            <p>
              Step complete. {remainingUnlockClicks} click{remainingUnlockClicks === 1 ? "" : "s"} left to
              unlock download.
            </p>
          )}
          {noticeType === "download" && directTarget ? (
            <a href={directTarget} rel="noopener noreferrer">
              Click here if download doesn&apos;t start.
            </a>
          ) : noticeType !== "download" && smartTarget ? (
            <a href={smartTarget} target="_blank" rel="noopener noreferrer">
              If the ad page did not open, click here.
            </a>
          ) : <p className="download-unavailable">Download link is not configured yet.</p>}
        </div>
      ) : null}
    </div>
  );
}
