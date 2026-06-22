import { request, apiInstance } from "./client";
import { z } from "zod";
import { PostSchema, PaginatedPostSchema, CategorySchema } from "./schemas";
import { Post, PaginatedResponse, Category } from "@/types";

export const postsApi = {
  // Page and limit stay as numbers - these are query instructions, not DB IDs
  list: (
    params: {
      search?: string;
      category?: string;
      page?: number;
      limit?: number;
    } = {},
  ) =>
    request<PaginatedResponse<Post>>(
      {
        url: "posts",
        params,
      },
      PaginatedPostSchema,
    ),

  slug: (slug: string) =>
    request<Post>(
      {
        url: `posts/s/${slug}`,
      },
      PostSchema,
    ),

  // ID is now strictly string
  like: (id: string) =>
    request<{ message: string }>({
      method: "POST",
      url: `user/posts/id/${id}/like`,
    }),

  categories: () =>
    request<Category[]>(
      {
        url: "posts/categories",
      },
      z.array(CategorySchema),
    ),

  create: async (
    formData: FormData,
    onProgress?: (percent: number) => void,
  ) => {
    const response = await apiInstance.post("admin/posts", formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          onProgress(percent);
        }
      },
    });

    const responseData = response.data.data
      ? response.data.data
      : response.data;
    return PostSchema.parse(responseData) as Post;
  },

  update: (slug: string, formData: FormData) =>
    request<{ data: Post }>(
      {
        method: "PUT",
        url: `admin/posts/${slug}`,
        data: formData,
      },
      z.object({ data: PostSchema }),
    ),

  delete: (id: string) =>
    request<{ message: string }>({
      method: "DELETE",
      url: `admin/posts/${id}`,
    }),
};
