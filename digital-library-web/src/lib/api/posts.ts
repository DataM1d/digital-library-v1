import { request, apiInstance } from "./client";
import { z } from "zod";
import { PostSchema, PaginatedPostSchema, CategorySchema } from "./schemas";
import { Post } from "@/types";

export const postsApi = {
  list: (params: { search?: string; category?: string; page?: number; limit?: number } = {}) => 
    request({
      url: "posts",
      params 
    }, PaginatedPostSchema),

  slug: (slug: string) => 
    request<Post>({ 
      url: `posts/s/${slug}` 
    }, PostSchema),

  like: (id: number) =>
    request<{ message: string }>({
      method: "POST",
      url: `use/posts/id/${id}/like`,
    }),

  categories: () => 
    request({ 
      url: "posts/categories" 
    }, z.array(CategorySchema)),

  create: async (formData: FormData, onProgress?: (percent: number) => void) => {
    const response = await apiInstance.post("admin/posts", formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress(percent);
        }
      },
    });
    return PostSchema.parse(response.data);
  },

  update: (slug: string, formData: FormData) => 
    request<Post>({
      method: "PUT",
      url: `admin/posts/${slug}`,
      data: formData
    }, PostSchema),

  delete: (id: number | string) => 
    request({ 
      method: "DELETE", 
      url: `admin/posts/${id}` 
    }),
};
