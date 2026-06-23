"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Post } from "@/types";

export function usePostDetail(slug: string) {
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.posts.slug(slug),
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: (id: string) => api.posts.like(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["post", slug] });
      const previousPost = queryClient.getQueryData<Post>(["post", slug]);

      if (previousPost) {
        queryClient.setQueryData<Post>(["post", slug], {
          ...previousPost,
          user_has_liked: !previousPost.user_has_liked,
          like_count: previousPost.user_has_liked
            ? previousPost.like_count - 1
            : previousPost.like_count + 1,
        });
      }
      return { previousPost };
    },
    onError: (err, id, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", slug], context.previousPost);
      }
      console.error("[Feedback_Sync_Error]:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", slug] });
    },
  });

  const toggleLike = () => {
    if (post) {
      likeMutation.mutate(post.id);
    }
  };

  return {
    post,
    loading: isLoading,
    error: error?.message || null,
    toggleLike,
  };
}
