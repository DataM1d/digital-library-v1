import { request } from "./client";
import { PostComment } from "@/types";

export const commentApi = {
  getByPost: (postId: string | number) =>
    request<PostComment[]>({
      url: `posts/id/${postId}/comments`,
    }),

  create: (
    postId: string | number,
    content: string,
    parentId?: string | number | null,
  ) =>
    request<PostComment>({
      method: "POST",
      url: `user/posts/id/${postId}/comments`,
      data: {
        content,
        parent_id: parentId ?? null,
      },
    }),
};
