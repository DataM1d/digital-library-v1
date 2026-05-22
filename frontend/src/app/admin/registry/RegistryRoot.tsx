"use client";

import React from "react";
import { RegistryItem } from "./RegistryItem";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

export function RegistryRoot() {
  const { posts = [], isLoading } = usePosts();

  return (
    <section className="w-full overflow-hidden">
      <div className="min-h-[600px] backdrop-blur-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-48">
            <div className="flex flex-col items-center gap-4">
              <Loader2
                className="animate-spin text-zinc-600"
                size={24}
                strokeWidth={2.5}
              />
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-500">
                Loading_System_Archive...
              </p>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between pl-8 pr-6 py-3.5 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400 select-none">
              <div className="w-[35%] pr-6">Title</div>
              <div className="w-[25%] text-center flex-shrink-0">
                Visual Reference
              </div>
              <div className="w-[20%] text-center flex-shrink-0">Metrics</div>
              <div className="w-[20%] text-right flex-shrink-0">
                Status / Controls
              </div>
            </div>

            {posts.map((post) => (
              <RegistryItem key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-48 text-center">
            <p className="text-sm font-serif italic text-zinc-600">
              The archive database is currently empty.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
