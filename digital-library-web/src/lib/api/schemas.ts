import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  slug: z.string(),
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

