import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { toast } from "sonner";

export function usePostEditor(post: Post, isEditing: boolean) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
    category_id: post.category_id.toString(),
    alt_text: post.alt_text || "",
    status: post.status as "published" | "draft",
  });

  const savePost = async () => {
    setIsSaving(true);
    const data = new FormData();
    
    if (imageFile) data.append("image", imageFile);
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("category_id", formData.category_id);
    data.append("alt_text", formData.alt_text);
    data.append("status", formData.status);
    tags.forEach((tag) => data.append("tags", tag));

    try {
      if (isEditing) {
        await api.posts.update(post.slug, data);
        toast.success("Artifact updated!");
      } else {
        await api.posts.create(data);
        toast.success("New artifact archived!");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
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