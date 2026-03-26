import { postsApi } from "./api/posts";
import { authApi } from "./api/auth";
import { adminApi } from "./api/admin";
import { commentApi } from "./api/comment";

export const api = {
  posts: postsApi,
  auth: authApi,
  admin: adminApi,
  comments: commentApi
}

export const getPosts = postsApi.list;
export const getCategories = postsApi.categories;

export * from "./api/posts";
export * from "./api/auth";
export * from "./api/admin";
export * from "./api/comment";
export * from "./api/schemas";
