"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const post = await api.posts.slug(slug);
      return post;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}
