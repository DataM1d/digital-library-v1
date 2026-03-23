import { request } from "./client";
import { z } from "zod";
import { PostSchema, PaginatedPostSchema, CategorySchema } from "./schemas";
import { Post } from "@/types";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function getPosts(params: { search?: string; category?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.category) query.append("category", params.category);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  
  const qs = query.toString();
  const res = await fetch(`${BASE_URL}/posts${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  return PaginatedPostSchema.parse(data);
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/posts/categories`, {
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return z.array(CategorySchema).parse(data.data);
}

export const postsApi = {
  list: (params: { search?: string; page?: number; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page.toString());
    const qs = queryParams.toString();
    return request(`/posts/${qs ? `?${qs}` : ""}`, {}, PaginatedPostSchema);
  },

  slug: (slug: string) => request<Post>(`/posts/s/${slug}`, {}, PostSchema),

  create: (formData: FormData) => 
    request<Post>("/admin/posts", { method: "POST", body: formData }, PostSchema),

  createWithProgress: async (formData: FormData, onProgress: (percent: number) => void) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await axios.post(`${BASE_URL}/admin/posts`, formData, {
      headers: { Authorization: `Bearer ${token}` },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(percent);
      },
    });
    return PostSchema.parse(response.data);
  },

  update: (slug: string, formData: FormData) => 
    request<Post>(`/admin/posts/${slug}`, { method: "PUT", body: formData }, PostSchema),

  delete: (id: number | string) => 
    request<{message: string}>(`/admin/posts/${id}`, { method: "DELETE" }),

  like: (id: number) => 
    request<{liked: boolean}>(`/user/posts/like/${id}`, { method: "POST" }),
  
  categories: () => 
    request("/posts/categories", {}, z.array(CategorySchema)),
};