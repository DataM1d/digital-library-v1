export interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'admin';
    created_at?: string;
    updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    image_url: string;
    blur_hash: string;
    alt_text: string;
    slug: string;
    status: 'published' | 'draft';
    category_name: string; 
    tags: string[]
    like_count: number;
    created_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };
}

export interface AuthResponse {
    token: string;
    user?: User;
}

