import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const data = await api.posts.categories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Could not load categories.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { 
    categories, 
    isLoading, 
    error 
  };
}