"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { isAxiosError } from "axios";

export function usePostDetail(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchArtifact() {
      if (!slug) return;
      try {
        setLoading(true);
        // api.posts.slug returns { data: Post }
        const response = await api.posts.slug(slug);
        
        if (isMounted) {
          setPost(response.data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = isAxiosError(err) 
            ? err.response?.data?.error || "Archive_Access_Denied" 
            : "System_Link_Failure";
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchArtifact();
    return () => { isMounted = false; };
  }, [slug]);

  const toggleLike = async () => {
    if (!post) return;

    // Optimistic Update
    setPost(prev => prev ? {
      ...prev,
      user_has_liked: !prev.user_has_liked,
      like_count: prev.user_has_liked ? prev.like_count - 1 : prev.like_count + 1
    } : null);

    try {
      await api.posts.like(post.id);
    } catch (err) {
      // Rollback on failure
      setPost(prev => prev ? {
        ...prev,
        user_has_liked: !prev.user_has_liked,
        like_count: prev.user_has_liked ? prev.like_count + 1 : prev.like_count - 1
      } : null);
      console.error("[Feedback_Sync_Error]:", err);
    }
  };

  return { post, loading, error, toggleLike };
}