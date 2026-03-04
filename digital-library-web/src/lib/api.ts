import { PaginatedResponse, Post, AuthResponse, LoginCredentials, RegisterPayload } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    return response.json();
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