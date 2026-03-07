import { z } from "zod";
import { 
  PaginatedResponse, 
  Post, 
  AuthResponse, 
  LoginCredentials, 
  RegisterPayload,
  PostComment 
} from "@/types";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export const PostSchema = z.object({
  id: z.number(),
  created_by: z.number(),
  category_id: z.number(),
  last_modified_by: z.number(),
  like_count: z.number().default(0),
  title: z.string(),
  content: z.string(),
  image_url: z.string(),
  blur_hash: z.string().default(""),
  alt_text: z.string().default(""),
  slug: z.string(),
  status: z.enum(["published", "draft"]).default("published"),
  category_name: z.string(),
  tags: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
  meta_description: z.string().optional(),
  og_image: z.string().optional(),
});

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    schema?: z.ZodSchema<T>
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = new Headers(options.headers);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, { 
      ...options, 
      headers 
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Something went wrong");
    }

    if (response.status === 204) return {} as T; 
    
    const data = await response.json();

    if (schema) {
        return schema.parse(data);
    }

    return data;
}
export const api = {
  posts: {
    list: (params: { search?: string; page?: number; limit?: number } = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        
        const queryString = queryParams.toString();
        return request<PaginatedResponse<Post>>(`/posts${queryString ? `?${queryString}` : ""}`);
    },
    create: (formData: FormData) => 
        request<Post>("/posts", {
            method: "POST",
            body: formData,
        }, PostSchema),
    slug: (slug: string) => 
        request<Post>(`/posts/s/${slug}`, {}, PostSchema),
    like: (slug: string) => 
        request<void>(`/posts/s/${slug}/like`, { method: "POST" }),
  },
  comments: {
    getByPost: (slug: string) => 
      request<PostComment[]>(`/posts/s/${slug}/comments`),
    create: (slug: string, content: string, parentId?: number) => 
      request<PostComment>(`/posts/s/${slug}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, parent_id: parentId })
      }),
  },
  auth: {
    login: (credentials: LoginCredentials) => 
        request<AuthResponse>("/login", { 
            method: "POST", 
            body: JSON.stringify(credentials) 
        }),
    register: (payload: RegisterPayload) => 
        request<AuthResponse>("/register", { 
            method: "POST", 
            body: JSON.stringify(payload) 
        }),
  }
};