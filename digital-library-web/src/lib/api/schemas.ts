import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
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
  id: z.number(),
  name: z.string().min(1),
  slug: z.string(),
  created_at: z.string().optional(),
});

export const PostSchema = z.object({
  id: z.number(),
  created_by: z.number(),
  category_id: z.number(),
  last_modified_by: z.number(),
  like_count: z.number().catch(0),
  user_has_liked: z.boolean().catch(false),
  title: z.string(),
  content: z.string(),
  image_url: z.string(),
  blur_hash: z.string().nullable().transform(val => val ?? ""),
  alt_text: z.string().nullable().transform(val => val ?? ""),
  slug: z.string(),
  status: z.enum(["published", "draft"]).default("published"),
  category_name: z.string(),
  tags: z.preprocess((val) => val ?? [], z.array(z.string())),
  created_at: z.string(),
  updated_at: z.string(),
  meta_description: z.string().nullable().optional(),
  og_image: z.string().nullable().optional(),
});

export const PostFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be more descriptive (20+ chars)"),
  category_id: z.string().min(1, "Taxonomy classification is required"),
  status: z.enum(["published", "draft"]),
  tags: z.array(z.string()), 
  alt_text: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostFormSchema>;

export const PaginatedPostSchema = z.object({
  data: z.array(PostSchema).nullable().transform((val) => val ?? []),
  meta: z.object({
    current_page: z.number(),
    limit: z.number(),
    total_items: z.number(), 
    total_pages: z.number(),
  }),
});

export const AuthResponseSchema = z.object ({
    token: z.string(),
    user: UserSchema,
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const UserResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  role: z.string().default("user",)
  //avatar_url: z.string().nullable().optional(),
})