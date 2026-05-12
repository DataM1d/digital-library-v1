"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePost(slug: string) {
  return useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const res = await api.posts.slug(slug);
      return res.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
}
