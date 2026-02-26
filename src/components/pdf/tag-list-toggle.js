"use client";

import { useMemo, useState } from "react";

const DEFAULT_VISIBLE_TAGS = 3;

export function TagListToggle({ tags, visibleCount = DEFAULT_VISIBLE_TAGS }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedTags = useMemo(() => {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags
      .filter((tag) => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [tags]);

  if (!normalizedTags.length) {
    return null;
  }

  const hiddenCount = Math.max(normalizedTags.length - visibleCount, 0);
  const visibleTags = isExpanded ? normalizedTags : normalizedTags.slice(0, visibleCount);

  return (
    <div className="tag-list">
      {visibleTags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="tag-pill">
          {tag}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="tag-pill tag-pill-toggle"
          onClick={() => setIsExpanded((previous) => !previous)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Show less" : `+${hiddenCount}`}
        </button>
      ) : null}
    </div>
  );
}
