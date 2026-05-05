"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { isAxiosError } from "axios";

export function usePostEditor(initialPost: Post, isEditing: boolean) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(initialPost.tags || []);
  
  const [formData, setFormData] = useState({
    title: initialPost.title || "",
    content: initialPost.content || "",
    category_id: initialPost.category_id?.toString() || "",
    status: initialPost.status || "published",
    alt_text: initialPost.alt_text || "",
  });

  const savePost = async () => {
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      data.append("category_id", formData.category_id);
      data.append("status", formData.status);
      data.append("alt_text", formData.alt_text);

    if (tags.length > 0) {
      tags.forEach((tag) => data.append("tags", tag));
    }

    if (imageFile) {
      data.append("image", imageFile);
    }

    if (isEditing && initialPost.slug) {
        await api.posts.update(initialPost.slug, data);
        toast.success("Archive updated successfully");
      } else {
        await api.posts.create(data);
        toast.success("New artifact committed to archive");
      }

    router.push("/admin/posts");
    router.refresh();
    } catch (err: unknown) {
      let errorMessage = "System rejection: Check backend logs";
      
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error("[Post Save Error]:", err);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
   };

   return {
    formData,
    setFormData,
    tags,
    setTags,
    setImageFile,
    isSaving,
    savePost,
  };
  }