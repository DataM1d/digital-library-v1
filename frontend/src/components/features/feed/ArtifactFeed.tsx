"use client";

import React from "react";
import { ArtifactCard } from "@/components/cards/ArtifactCard";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export function ArtifactFeed() {
  const { posts = [], isLoading } = usePosts();

  if (isLoading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4">
        <Loader2
          className="animate-spin text-[hsl(var(--border-strong))]"
          size={24}
        />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Loading_Artifacts
        </p>
      </div>
    );
  }

  return (
    <section className="archive-grid">
      {posts.map((post) => (
        <ArtifactCard key={post.id} post={post} />
      ))}
    </section>
  );
}
