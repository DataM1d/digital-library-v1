import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Post, PaginationMeta } from "@/types";

export function usePosts(initialSearch = "") {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.posts.list({ search: searchQuery });
      setPosts(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err) {
      console.error("Archive fetch error:", err);
      setError("Failed to load the archive.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { 
    posts, 
    meta, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    refresh: fetchPosts 
  };
}