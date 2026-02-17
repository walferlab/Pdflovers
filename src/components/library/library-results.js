"use client";

import { useQuery } from "@tanstack/react-query";

import { PdfGrid } from "@/components/pdf/pdf-grid";

async function fetchSearchResults(query, signal) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  params.set("limit", "36");

  const response = await fetch(`/api/pdfs?${params.toString()}`, {
    signal,
    cache: "default",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PDF results.");
  }

  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

export function LibraryResults({ query, initialItems }) {
  const { data = [], isFetching, isLoading, isError } = useQuery({
    queryKey: ["pdf-library-search", query],
    queryFn: ({ signal }) => fetchSearchResults(query, signal),
    initialData: initialItems,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  if (isError) {
    return <p className="empty-state">Unable to load results right now. Please try again.</p>;
  }

  if (isLoading && !data.length) {
    return (
      <div className="query-skeleton" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="query-skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="library-results-wrap">
      {isFetching ? <p className="query-status">Refreshing results...</p> : null}
      <PdfGrid items={data} emptyMessage="No PDF matched your search. Try a broader keyword." />
    </div>
  );
}
