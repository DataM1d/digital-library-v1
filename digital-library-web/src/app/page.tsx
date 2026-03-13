"use client";

import { usePosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/posts/PostCard";
import { PostCardSkeleton } from "@/components/posts/PostCardSkeleton";
import { SearchBar } from "@/components/discovery/SearchBar";
import { Archive } from "lucide-react";

export default function HomePage() {
  const { posts, isLoading, searchQuery, setSearchQuery } = usePosts();

  return (
    <main className="min-h-screen px-6 py-20 transition-colors">
      <div className="mx-auto max-w-7xl">
        <header className="mb-24 flex flex-col items-center text-center space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <Archive size={24} className="text-zinc-900 dark:text-zinc-100" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white sm:text-6xl">
                The Digital Archive
              </h1>
              <p className="mx-auto max-w-md text-sm font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Curated Discoveries & Artifacts
              </p>
            </div>
          </div>
          
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={setSearchQuery} />
          </div>
        </header>

        <section className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                priority={index < 3} 
              />
            ))
          ) : (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                {searchQuery ? `No results for "${searchQuery}"` : "The archive is currently empty"}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}