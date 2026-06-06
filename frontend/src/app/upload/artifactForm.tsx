"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PostFormSchema, type PostFormData } from "@/lib/api/schemas";
import { ImageUploadZone } from "@/app/admin/ImageUploadZone";
import { apiInstance } from "@/lib/api/client";

export function ArtifactForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(PostFormSchema),
    defaultValues: {
      status: "published",
      tags: [],
      category_id: "1",
      alt_text: "",
    },
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation Errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data: PostFormData) => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("category_id", data.category_id);
    formData.append("status", data.status);
    formData.append("alt_text", data.alt_text ?? "");

    if (data.image) {
      formData.append("image", data.image);
    }

    data.tags.forEach((tag) => {
      formData.append("tags", tag);
    });

    try {
      await apiInstance.post("/admin/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <input type="hidden" {...register("category_id")} />
      <input type="hidden" {...register("status")} />
      <input type="hidden" {...register("alt_text")} />

      <div className="flex flex-col gap-6 flex-grow -mt-1.5">
        <div className="h-64">
          <ImageUploadZone
            onFileSelect={(file) =>
              setValue("image", file as File, { shouldValidate: true })
            }
          />
        </div>
        {errors.image && (
          <p className="text-red-500 text-sm">
            {errors.image.message as string}
          </p>
        )}

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register("title")}
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all placeholder:text-zinc-400 mt-3"
            placeholder="e.g. Neon Horizon"
          />
          {errors.title && (
            <p className="text-red-500 text-sm">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-mono uppercase tracking-tight text-zinc-300">
            Description
          </label>
          <textarea
            {...register("content")}
            rows={8}
            className="w-full bg-zinc-450 border border-zinc-800 p-4 text-sm text-zinc-300 focus:border-zinc-500 outline-none transition-all resize-none placeholder:text-zinc-400 mt-3"
            placeholder="What is the story behind this artifact?"
          />
          {errors.content && (
            <p className="text-red-500 text-sm">
              {errors.content.message as string}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-transparent text-zinc-200 font-mono text-s uppercase tracking-wider hover:bg-zinc-1000 transition-all font-bold mt-6 border-1 border-zinc-800 hover:border-zinc-400 hover:cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? "Publishing..." : "Publish to Archive"}
      </button>
    </form>
  );
}
