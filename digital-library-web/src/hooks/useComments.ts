import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PostComment } from "@/types";

export function useComments(postSlug: string) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await api.comments.getByPost(postSlug);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  }, [postSlug]); 

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: number) => {
    setIsSubmitting(true);
    try {
      await api.comments.create(postSlug, content, parentId);
      await fetchComments(); // Refresh list
    } finally {
      setIsSubmitting(false);
    }
  };

  return { comments, addComment, isSubmitting };
}