"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: () => api.posts.slug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}