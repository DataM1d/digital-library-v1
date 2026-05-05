import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { PostComment } from "@/types";
import { isAxiosError } from "axios";
import { toast } from "sonner";

export function useComments(postId: number) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId || isNaN(Number(postId)) || Number(postId) <= 0) {
      console.warn("[Comments] Skipping fetch: Invalid postId", postId);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.comments.getByPost(postId);
      setComments(data);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 429) {
        console.error(`[Comment Fetch Error]: ${err.response?.status} - ${err.message}`);
        toast.error("Archive is busy: Rate limit exceeded");
      } else {
        console.error("[Unexpected Comment Error]:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId?: number | null) => {
    if (!content.trim())return;

    setIsSubmitting(true);
    try {
      await api.comments.create(postId, content, parentId);
      toast.success("Comment archived successfully");
      await fetchComments();
    } catch (err: unknown) {
      let errorMessage = "Failed to commit comment to archive";
      
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.error || errorMessage;
      }

      toast.error(errorMessage);
      throw err;
    } finally {
        setIsSubmitting(false);
    }
  };

  return {
    comments,
    isLoading,
    isSubmitting,
    addComment,
    refresh:fetchComments
    };
 }