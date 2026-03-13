import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Category } from "@/types";
import { toast } from "sonner";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.posts.categories();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to sync taxonomy");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (name: string) => {
    setIsSubmitting(true);
    try {
      await api.admin.createCategory(name);
      toast.success("New category archived");
      await fetchCategories(); // Refresh list
      return true;
    } catch (err) {
      toast.error("Archive rejection: Duplicate or invalid name");
      console.error(err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.admin.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Category purged");
    } catch (err) {
      toast.error("Cannot delete category with active links");
      console.error(err);
    }
  };

  return { 
    categories, 
    isLoading, 
    isSubmitting, 
    addCategory, 
    deleteCategory,
    refresh: fetchCategories 
  };
}