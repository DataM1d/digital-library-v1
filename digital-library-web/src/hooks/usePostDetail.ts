import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Post } from "@/types";

export function usePostDetail(slug: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await api.posts.slug(slug);
        setPost(data);
        setLikesCount(data.like_count);
      } catch (err) {
        setError("Archive not found or server error.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const toggleLike = async () => {
    if (!post) return;
    const prevCount = likesCount;
    const prevStatus = isLiked;
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);

    try {
        await api.posts.like(post.id);
    } catch (err) {
        setLikesCount(prevCount);
        setIsLiked(prevStatus);
        console.error(err);
    }
  };

  return { post, loading, error, likesCount, isLiked, toggleLike };
}