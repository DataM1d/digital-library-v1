"use client";

import React from "react";
import { RegistryItem } from "./RegistryItem";
import { RegistryHeader } from "./RegistryHeader";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export function RegistryRoot() {
  const { posts = [], isLoading } = usePosts();

  return (
    <section className="w-full overflow-hidden">
      <RegistryHeader count={posts.length} />

      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-48">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-zinc-500" size={28} />
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-400">
                Loading_Registry_Data...
              </p>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col divide-y divide-zinc-900/40">
            {posts.map((post) => (
              <RegistryItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-48 text-center">
            <p className="text-sm font-serif italic text-zinc-500">
              The archive database is currently empty.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
