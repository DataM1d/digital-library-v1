export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin" | string;
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
  id: string;
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
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface Artifact {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl?: string;
  aspectRatio: "portrait" | "landscape" | "square";
  heightWeight: number;
  snippet: string;
}

export const ARTIFACT_FEED: Artifact[] = [
  {
    id: "art-001",
    title: "Vasa",
    slug: "system-arch-v1",
    category: "Logistics",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    aspectRatio: "portrait",
    heightWeight: 4,
    snippet:
      "Deep-dive diagnostic analytics tracing Go middleware optimizations and system architecture memory barriers across ultra-scale infrastructure arrays.",
  },
  {
    id: "art-002",
    title: "The Fragmented Grid Identity",
    slug: "fragmented-identity",
    category: "Design",
    imageUrl:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=600&q=80",
    aspectRatio: "square",
    heightWeight: 3,
    snippet:
      "Exploring brutalist UI aesthetics, high-horizon layouts, layout symmetry rules, and typographic rhythm across minimal technical documentation frameworks.",
  },
  {
    id: "art-003",
    title: "Cryptographic Matrix Array",
    slug: "crypto-matrix",
    category: "Security",
    imageUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80",
    aspectRatio: "landscape",
    heightWeight: 2,
    snippet:
      "An evaluation of security isolation paradigms within distributed key token ecosystems and decentralized cryptographic persistence architectures.",
  },
  {
    id: "art-004",
    title: "Kernel Trace Isolation",
    slug: "kernel-trace-isolation",
    category: "Backend",
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    aspectRatio: "portrait",
    heightWeight: 4,
    snippet:
      "Analyzing memory page mapping, low-level trace handling protocols, and multi-threaded scheduling configurations inside secure hypervisors.",
  },
];
