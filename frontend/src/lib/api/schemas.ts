import { z } from "zod";
import { PostComment } from "@/types";

const ID = z.string();

export const UserSchema = z.object({
  id: ID,
  username: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const CategorySchema = z.object({
  id: ID,
  name: z.string().min(1),
  slug: z.string(),
  created_at: z.string().optional(),
});

export const CommentSchema: z.ZodSchema<PostComment> = z.object({
  id: ID,
  post_id: ID,
  user_id: ID,
  parent_id: z.string().nullable().optional(),
  content: z.string(),
  username: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  replies: z.lazy(() => z.array(CommentSchema)).default([]),
});

export const PostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  created_by: z.string(),
  category_id: z.string(),
  last_modified_by: z.string(),
  like_count: z.number(),
  user_has_liked: z.boolean(),
  title: z.string(),
  content: z.string(),
  image_url: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  blur_hash: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  alt_text: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  meta_description: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  og_image: z
    .string()
    .nullish()
    .transform((val) => val ?? ""),
  status: z.string(),
  category_name: z.string(),
  tags: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PostFormSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  category_id: z.string().min(1),
  status: z.enum(["published", "draft"]),
  tags: z.array(z.string()),
  alt_text: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostFormSchema>;

export const PaginatedPostSchema = z.object({
  data: z.array(PostSchema),
  meta: z.object({
    current_page: z.number(),
    limit: z.number(),
    total_items: z.number(),
    total_pages: z.number(),
    has_next_page: z.boolean(),
    has_prev_page: z.boolean(),
  }),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
});

export const UserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.string().default("user"),
});
