"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";

interface UsePostsOptions {
  initialLimit?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { initialLimit = 12 } = options;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  
  const searchQuery = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;

  const { data, isLoading, isPlaceholderData, refetch } = useQuery({
    queryKey: ["posts", { searchQuery, page, initialLimit }],
    queryFn: () => api.posts.list({ search: searchQuery, page, limit: initialLimit }),
    placeholderData: (prev) => prev,
    staleTime: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => api.posts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Artifact purged from archive");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Purge failed: System rejection");
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    },
  });

  return {
    posts: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    isFetchingNext: isPlaceholderData,
    searchQuery,
    page,
    deletePost: deleteMutation.mutate,
    refresh: refetch,
  };
}