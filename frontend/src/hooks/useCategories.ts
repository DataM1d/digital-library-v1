"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category } from "@/types";

export function useCategories() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.posts.categories(),
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => api.admin.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories: (data as Category[]) ?? [],
    isLoading,
    isSubmitting: addMutation.isPending || deleteMutation.isPending,
    addCategory: async (name: string) => {
      try {
        await addMutation.mutateAsync(name);
        return true;
      } catch (error) {
        console.error("Failed to add category:", error);
        return false;
      }
    },
    deleteCategory: (id: string) => deleteMutation.mutate(id),
  };
}
