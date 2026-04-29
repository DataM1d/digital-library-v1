import { request, apiInstance } from "./client";
import { z } from "zod";
import { PostSchema, PaginatedPostSchema, CategorySchema } from "./schemas";

export const postsApi = {
  list: (params: { search?: string; category?: string; page?: number; limit?: number } = {}) => 
    request({
      url: "posts",
      params 
    }, PaginatedPostSchema),

  slug: (slug: string) => 
    request({ 
      url: `posts/s/${slug}` 
    }, z.object({ data: PostSchema })),

  like: (id: number | string) =>
    request<{ message: string }>({
      method: "POST",
      url: `user/posts/id/${id}/like`,
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
    // Check if backend wraps response in { data: ... }
    const responseData = response.data.data ? response.data.data : response.data;
    return PostSchema.parse(responseData);
  },

  update: (slug: string, formData: FormData) => 
    request({
      method: "PUT",
      url: `admin/posts/${slug}`,
      data: formData
    }, z.object({ data: PostSchema })),

  delete: (id: number | string) => 
    request({ 
      method: "DELETE", 
      url: `admin/posts/${id}` 
    }),
};