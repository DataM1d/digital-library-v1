"use client";

import { ImageUploadZone } from "./ImageUploadZone";
import { TagInput } from "./TagInput";
import { usePostEditor } from "@/hooks/usePostEditor";
import { useCategories } from "@/hooks/useCategories";
import { Post } from "@/types";
import { Save, Loader2 } from "lucide-react";
import { FormEvent, ChangeEvent } from "react";

interface PostEditorProps {
  post: Post;
  isEditing?: boolean;
}

export function PostEditor({ post, isEditing = true }: PostEditorProps) {
  const { categories } = useCategories();
  const { 
    formData, setFormData, 
    tags, setTags, 
    setImageFile, 
    isSaving, savePost 
  } = usePostEditor(post, isEditing);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    savePost();
  };

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ 
      ...formData, 
      status: e.target.value as 'published' | 'draft'
    });
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, category_id: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5 space-y-8">
        <section className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Artifact Media</label>
          <ImageUploadZone onFileSelect={setImageFile} defaultValue={post.image_url} />
        </section>

        <section className="space-y-2">
          <label className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Taxonomy</label>
          <TagInput tags={tags} setTags={setTags} />
        </section>

        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 block">Status</label>
          <select
            value={formData.status}
            onChange={handleStatusChange}
            className="w-full bg-transparent font-medium outline-none text-zinc-900 dark:text-zinc-100 cursor-pointer"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-6">
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-4xl font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-800 outline-none focus:border-black dark:focus:border-white pb-4"
            placeholder="Title..."
          />

          <textarea
            required
            rows={12}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none font-serif text-xl"
            placeholder="Content..."
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Category</label>
              <div className="relative">
                <select
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Alt Text</label>
              <input
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none"
                placeholder="Accessibility description"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-3 w-full py-6 bg-black dark:bg-white text-white dark:text-black rounded-3xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
        >
          {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
          {isEditing ? "Sync Changes" : "Commit to Archive"}
        </button>
      </div>
    </form>
  );
}