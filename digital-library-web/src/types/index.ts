export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | string;
  created_at?: string | null;
  updated_at?: string | null;
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
  id: string; 
  created_by: string;
  category_id: string;
  last_modified_by: string;
  like_count: number;
  user_has_liked: boolean;
  title: string;
  content: string;
  image_url: string;
  blur_hash: string;
  slug: string;
  status: string;
  alt_text: string;
  category_name: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  meta_description?: string;
  og_image?: string;
}

export interface PostComment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;
  content: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  replies?: PostComment[] | null;
}

export interface PaginationMeta {
  current_page: number;
  total_items: number;
  total_pages: number;
  limit: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FileUploadResponse {
  url: string;
  Filename: string;
  blur_hash?: string;
}
export interface AuthResponse {
  token: string;  
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  post_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  mounted: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

