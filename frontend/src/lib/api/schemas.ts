import { z } from "zod";

export const UserSchema = z.object({
  id: z.coerce.string(),
  username: z.string().min(1),
  email: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase().trim() : val),
    z.string().email().catch("no-email@archive.com")
  ),
  role: z.preprocess(
    (val) => (typeof val === "string" ? val.toLowerCase() : val),
    z.enum(["user", "admin"]).catch("user")
  ),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const CategorySchema = z.object({
  id: z.coerce.string(),
  name: z.string().min(1),
  slug: z.string(),
  created_at: z.string().optional(),
});

export const PostSchema = z.object({
  // Use .catch to ensure a unique key even if the backend fails us
  id: z.coerce.string().catch(() => `temp-id-${Math.random().toString(36).slice(2, 9)}`),
  slug: z.string().catch(() => `missing-slug-${Math.random().toString(36).slice(2, 9)}`),
  
  // The rest remains the same as our previous "Invincible" version
  created_by: z.coerce.string().catch("0"),
  category_id: z.coerce.string().catch("0"),
  last_modified_by: z.coerce.string().catch("0"),
  like_count: z.number().catch(0),
  user_has_liked: z.boolean().catch(false),
  title: z.string().catch("UNTITLED_ARTIFACT"),
  content: z.string().catch(""),
  image_url: z.preprocess((val) => val ?? "", z.string().catch("")),
  blur_hash: z.preprocess((val) => val ?? "", z.string().catch("")),
  alt_text: z.preprocess((val) => val ?? "", z.string().catch("")),
  status: z.string().catch("published"),
  category_name: z.string().catch("UNCATEGORIZED"),
  created_at: z.string().catch(() => new Date().toISOString()),
  updated_at: z.string().catch(() => new Date().toISOString()),
  tags: z.preprocess((val) => val ?? [], z.array(z.string()).catch([])),
});

export const PostFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be more descriptive"),
  category_id: z.string().min(1, "Taxonomy classification is required"),
  status: z.enum(["published", "draft"]),
  tags: z.array(z.string()), 
  alt_text: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostFormSchema>;

export const PaginatedPostSchema = z.object({
  data: z.array(PostSchema).nullable().transform((val) => val ?? []),
  meta: z.object({
    current_page: z.number().default(1),
    limit: z.number().default(10),
    total_items: z.number().default(0), 
    total_pages: z.number().default(1),
  }).catch({
    current_page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1
  }),
});

export const AuthResponseSchema = z.object({
    token: z.string(),
    user: UserSchema,
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars")
});

export const UserResponseSchema = z.object({
  id: z.coerce.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.string().default("user")
});