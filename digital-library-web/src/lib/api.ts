import { z } from "zod";
import { PaginatedResponse, Post, AuthResponse, LoginCredentials, RegisterPayload } from "@/types";

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
  title: z.string(),
  content: z.string(),
  image_url: z.string().default("/placeholder.jpg"),
  blur_hash: z.string().default(""),
  alt_text: z.string().default(""),
  slug: z.string(),
  status: z.enum(["published", "draft"]).default("published"),
  category_id: z.number().nullable().transform((val) => val ?? 1), 
  created_by: z.number(),
  like_count: z.number().default(0),
});

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    schema?: z.ZodSchema<T>
): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

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
    list: (query: string = "") => 
        request<PaginatedResponse<Post>>(`/posts${query}`),
    slug: (slug: string) => 
        request<Post>(`/posts/s/${slug}`),
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