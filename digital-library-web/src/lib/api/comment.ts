import { request } from "./client";
import { PostComment } from "@/types";

export const commentApi = {
  getByPost: (postId: number) => 
    request<PostComment[]>({ 
      url: `posts/id/${postId}/comments` 
    }),
    
  create: (postId: number, content: string, parentId?: number | null) => 
    request<PostComment>({
      method: "POST",
      url: `user/posts/id/${postId}/comments`,
      data: { 
        content,
        parent_id: parentId ?? null
      }
    }),
};