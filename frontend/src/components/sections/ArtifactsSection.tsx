"use client";

import React, { useState, useMemo } from "react";
import { ARTIFACT_FEED } from "@/types";
import { FilterBar } from "@/components/shared/FilterBar";
import { MasonryGrid } from "@/components/cards/MasonryGrid";

export function ArtifactsSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtifacts = useMemo(() => {
    return ARTIFACT_FEED.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.snippet.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="w-full px-2 mt-14 relative z-30 flex flex-col gap-6">
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="w-full pb-24">
        {filteredArtifacts.length > 0 ? (
          <MasonryGrid items={filteredArtifacts} />
        ) : (
          <div className="w-full py-20 flex justify-center items-center border border-dashed border-zinc-900/60 rounded-lg">
            <span className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase">
              // ERROR: NO MATCHING RUNTIME RECORDS FOUND
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
