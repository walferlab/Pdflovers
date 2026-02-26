"use client";

import { useMemo, useState } from "react";

const DEFAULT_PREVIEW_LENGTH = 220;

export function SummaryToggle({ summary, previewLength = DEFAULT_PREVIEW_LENGTH }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const previewText = useMemo(() => {
    if (typeof summary !== "string") {
      return "";
    }

    const trimmed = summary.trim();
    if (trimmed.length <= previewLength) {
      return trimmed;
    }

    return `${trimmed.slice(0, previewLength).trimEnd()}...`;
  }, [previewLength, summary]);

  const canToggle = typeof summary === "string" && summary.trim().length > previewLength;

  if (!summary) {
    return null;
  }

  return (
    <div className="summary-toggle">
      <p className="pdf-summary">{isExpanded ? summary : previewText}</p>
      {canToggle ? (
        <button
          type="button"
          className="summary-toggle-button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}
