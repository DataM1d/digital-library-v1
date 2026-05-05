"use client";

import React, { useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, ChevronDown } from "lucide-react";
import axios from "axios";

import { PostFormSchema, type PostFormData } from "@/lib/api/schemas";
import { ImageUploadZone } from "./ImageUploadZone";
import { TagInput } from "./TagInput";
import { api } from "@/lib/api";
import { Post, Category } from "@/types";
import { useCategories } from "@/hooks/useCategories";

interface PostEditorProps {
  post: Post;
  isEditing?: boolean;
}

interface BackendErrorResponse {
  errors?: Record<string, string>;
}

export function PostEditor({ post, isEditing = true }: PostEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
  register,
  handleSubmit,
  control,
  setError,
  formState: { errors, isSubmitting },
} = useForm<PostFormData>({
  resolver: zodResolver(PostFormSchema),
  defaultValues: {
    title: post.title || "",
    content: post.content || "",
    category_id: post.category_id?.toString() || "",
    status: (post.status as "published" | "draft") || "published",
      tags: post.tags || [],
      alt_text: post.alt_text || "",
    },
  });

  const onSubmit: SubmitHandler<PostFormData> = async (data) => {
    try {
      const formData = new FormData();
      
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("category_id", data.category_id);
      formData.append("status", data.status);
      formData.append("alt_text", data.alt_text || "");

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach((tag) => {
          formData.append("tags", tag);
        })
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing && post.slug) {
        await api.posts.update(post.slug, formData);
        toast.success("Archive updated");
      } else {
        await api.posts.create(formData);
        toast.success("New artifact archived");
      }

      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/admin/posts");
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError<BackendErrorResponse>(error)) {
        const serverErrors = error.response?.data?.errors;
        if (serverErrors) {
          Object.entries(serverErrors).forEach(([field, msg]) => {
            setError(field as keyof PostFormData, { 
              type: "server", 
              message: msg
            });
          });
          return;
        }
      }
      toast.error(error instanceof Error ? error.message : "Sync failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8">
        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Media</label>
          <ImageUploadZone onFileSelect={setImageFile} defaultValue={post.image_url} />
        </section>

        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Taxonomy</label>
          <Controller
            control={control}
            name="tags"
            render={({ field: { value, onChange } }) => (
              <TagInput tags={value as string[]} onChange={onChange} />
            )}
          />
        </section>

        <div className="p-6 rounded-4xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Status</label>
          <div className="relative">
            <select
              {...register("status")}
              className="w-full bg-transparent font-bold text-sm uppercase tracking-widest outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer appearance-none"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <input
              {...register("title")}
              className="w-full text-5xl font-black uppercase tracking-tighter bg-transparent border-b-2 border-zinc-100 dark:border-zinc-900 outline-none focus:border-black dark:focus:border-white pb-6 transition-colors"
              placeholder="Title..."
            />
            {errors.title && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <textarea
              {...register("content")}
              rows={10}
              className="w-full p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none font-medium text-lg"
              placeholder="Content..."
            />
            {errors.content && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
              <div className="relative">
                <select
                  {...register("category_id")}
                  className="w-full p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none appearance-none font-bold text-sm uppercase"
                >
                  <option value="" disabled>Select Category...</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
              </div>
              {errors.category_id && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1">{errors.category_id.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Alt Text</label>
              <input
                {...register("alt_text")}
                className="w-full p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none font-medium"
                placeholder="Accessibility"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-4 w-full py-8 bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[0.98] disabled:opacity-50 transition-all shadow-2xl"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isEditing ? "Sync Changes" : "Commit to Archive"}
        </button>
      </div>
    </form>
  );
}