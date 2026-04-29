"use client";

import { usePosts } from "@/hooks/usePosts";
import { ArtifactCard } from "./ArtifactCard";

export function LibraryGrid() {
  const { posts, isLoading } = usePosts(12);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[400px] bg-[#050505] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-zinc-900">
        <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.3em]">
          No Artifacts Found In Registry
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
      {posts.map((post, index) => (
        <ArtifactCard
          key={post.id}
          post={post}
          index={index}
        />
      ))}
    </div>
  );
}