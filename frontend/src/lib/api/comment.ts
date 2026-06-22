import { request } from "./client";
import { PostComment } from "@/types";
import { CommentSchema } from "./schemas";
import { z } from "zod";

export const commentApi = {
  getByPost: (postId: string) =>
    request<PostComment[]>(
      {
        url: `posts/id/${postId}/comments`,
      },
      z.array(CommentSchema),
    ),

  create: (postId: string, content: string, parentId?: string | null) =>
    request<PostComment>(
      {
        method: "POST",
        url: `user/posts/id/${postId}/comments`,
        data: {
          content,
          parent_id: parentId ?? null,
        },
      },
      CommentSchema,
    ),
};
