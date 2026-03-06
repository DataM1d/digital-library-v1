"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Post, PaginatedResponse } from "@/types";
import { PostCard } from "./PostCard";
import { SearchBar } from "./SearchBar";

export function DiscoveryFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const q = searchQuery ? `?search=${searchQuery}&page=${page}` : `?page=${page}`;
      const res = await api.posts.list(q);
      setPosts(res.data);
      setTotalPages(res.meta.total_pages);
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

return (
    <div className="space-y-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        <SearchBar onSearch={(val) => { setSearchQuery(val); setPage(1); }} />
      </div>

      {loading && posts.length === 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4 animate-pulse">
              <div className="aspect-16/10 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-500">
          No archives match your search criteria.
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-8">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                page === i + 1 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}