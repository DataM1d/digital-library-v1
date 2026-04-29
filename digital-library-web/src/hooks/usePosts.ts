"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export function usePosts(limit = 12) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const category = searchParams.get("category") || "";

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["posts", { search, page, category, limit }],
    queryFn: () => api.posts.list({ search, page, limit, category }),
  });

  return {
    posts: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    refresh: refetch,
  };
}