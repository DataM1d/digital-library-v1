import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function usePostDetail(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchPost() {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await api.posts.slug(slug);
        
        if (isMounted) {
          setPost(data);
          setLikesCount(data.like_count);
          setIsLiked(!!data.user_has_liked);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = isAxiosError(err) 
            ? err.response?.data?.error || "Archive not found" 
            : "System failure";
          setError(msg);
          console.error("[Post Detail Fetch Error]:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchPost();
    return () => { isMounted = false; };
  }, [slug]);

  const toggleLike = async () => {
    if (!post || !post.id) return;

    const prevCount = likesCount;
    const prevStatus = isLiked;

    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    try {
      await api.posts.like(post.id);
    } catch (err: unknown) {
        setLikesCount(prevCount);
        setIsLiked(prevStatus);
        let errorMsg = "Feedback synchronization failed";
          if (isAxiosError(err) && err.response?.status === 401) {
            errorMsg = "Authentication required to like artifacts";
          }
        toast.error(errorMsg);
        console.error("[Like Error]:", err);
    }
  };

  return { post, loading, error, likesCount, isLiked, toggleLike };
}