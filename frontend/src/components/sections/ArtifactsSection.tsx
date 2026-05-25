"use client";

import React, { useRef } from "react";
import { ARTIFACT_FEED } from "@/types";
import { FilterBar } from "@/components/shared/FilterBar";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { useDebounce } from "@/hooks/useDebounce";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useSearch } from "@/hooks/useSearch";

export function ArtifactsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { query, updateSearch } = useSearch();
  const debouncedQuery = useDebounce(query, 500);

  useSmoothScroll(sectionRef as React.RefObject<HTMLElement>, query);

  const filteredArtifacts = ARTIFACT_FEED.filter((item) => {
    const q = debouncedQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      ref={sectionRef}
      className="w-full px-6 md:px-12 mt-16 relative z-30 flex flex-col gap-8"
    >
      <FilterBar value={query} onChange={updateSearch} />

      <div className="w-full pb-24">
        {filteredArtifacts.length > 0 ? (
          <MasonryGrid items={filteredArtifacts} />
        ) : (
          <div className="w-full py-24 flex justify-center items-center border border-dashed border-zinc-900/60 rounded-xl">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
              // ERROR: NO MATCHING RUNTIME RECORDS FOUND
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
