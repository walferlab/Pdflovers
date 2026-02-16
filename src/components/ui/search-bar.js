"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({
  initialQuery = "",
  actionPath = "/library",
  placeholder = "Search by title, author, category...",
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  function handleSubmit(event) {
    event.preventDefault();

    const nextQuery = query.trim();
    const path = nextQuery
      ? `${actionPath}?q=${encodeURIComponent(nextQuery)}`
      : actionPath;

    startTransition(() => {
      router.push(path);
    });
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="search-input">
        Search PDF library
      </label>
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
