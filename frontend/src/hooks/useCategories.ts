"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.posts.categories(),
  });

  return {
    categories: data ?? [],
    isLoading
  };
}