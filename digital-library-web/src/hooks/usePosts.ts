"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { Post, PaginationMeta } from "@/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface UsePostsOptions {
  initialLimit?: number;
  initialSearch?: string;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { initialLimit = 12, initialSearch = "" } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.posts.list({
        search: searchQuery,
        page: page,
        limit: initialLimit,
      });
      
      setPosts(res.data);
      setMeta(res.meta);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to sync with archive");
      } else {
        console.error("Discovery error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, page, initialLimit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = useCallback((val: string) => {
    setSearchQuery(val);
    setPage(1); // Reset to first page on new search
  }, []);

  const deletePost = async (id: number) => {
    try {
      await api.posts.delete(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Artifact purged from archive");
      
      // If we deleted the last item on a page, move back
      if (posts.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
    } catch (err) {
      toast.error("Purge failed: System rejection");
      console.error(err);
    }
  };

  return {
    posts,
    meta,
    isLoading,
    searchQuery,
    setSearchQuery: handleSearch, // Alias for backward compatibility
    handleSearch,
    page,
    setPage,
    deletePost,
    refresh: fetchPosts,
  };
}