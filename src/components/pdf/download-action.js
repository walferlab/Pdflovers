"use client";

import { useMemo, useState } from "react";

function openInNewTab(url) {
  if (!url || typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function DownloadAction({ title, pdfId, smartLink, downloadLink }) {
  const [showNotice, setShowNotice] = useState(false);

  const hasAnyLink = Boolean(downloadLink || smartLink);

  const directApiLink = useMemo(() => {
    return pdfId ? `/api/download/${pdfId}?stage=direct` : "";
  }, [pdfId]);

  const fallbackApiLink = useMemo(() => {
    return pdfId ? `/api/download/${pdfId}?stage=smart` : "";
  }, [pdfId]);

  const directManualLink = downloadLink || smartLink || "";
  const fallbackManualLink = fallbackApiLink || smartLink || downloadLink || "";
  const directTarget = directApiLink || directManualLink;

  function handleDownloadClick() {
    if (!hasAnyLink) {
      return;
    }

    openInNewTab(directTarget);
    setShowNotice(true);
  }

  const statusText = hasAnyLink
    ? "Status: direct download link is ready."
    : "Download link unavailable right now.";

  return (
    <div className="download-action">
      <button className="button-solid" type="button" disabled={!hasAnyLink} onClick={handleDownloadClick}>
        Download PDF
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
          <p>Thanks! {title ? `"${title}"` : "Your file"} is downloading in a few seconds.</p>
          {fallbackManualLink ? (
            <a href={fallbackManualLink} target="_blank" rel="noopener noreferrer">
              Click here if download doesn&apos;t start.
            </a>
          ) : (
            <p className="download-unavailable">Download link is not configured yet.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
