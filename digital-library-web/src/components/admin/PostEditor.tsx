"use client";

import { ImageUploadZone } from "./ImageUploadZone";
import { TagInput } from "./TagInput";
import { usePostEditor } from "@/hooks/usePostEditor";
import { useCategories } from "@/hooks/useCategories";
import { Post, Category } from "@/types";
import { Save, Loader2, ChevronDown } from "lucide-react";
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
    if (!formData.category_id) {
       alert("Please select a valid taxonomy category.");
       return;
    }
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
        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Artifact Media</label>
          <ImageUploadZone onFileSelect={setImageFile} defaultValue={post.image_url} />
        </section>

        <section className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Taxonomy</label>
          <TagInput tags={tags} onChange={setTags} />
        </section>

        <div className="p-6 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 block">Status</label>
          <div className="relative">
            <select
              value={formData.status}
              onChange={handleStatusChange}
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
          <input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-5xl font-black uppercase tracking-tighter bg-transparent border-b-2 border-zinc-100 dark:border-zinc-900 outline-none focus:border-black dark:focus:border-white pb-6 transition-colors"
            placeholder="Title..."
          />

          <textarea
            required
            rows={10}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-10 rounded-[3rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none font-medium text-lg leading-relaxed"
            placeholder="Content..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
              <div className="relative">
                <select
                  required
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  className="w-full p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none appearance-none cursor-pointer font-bold text-sm uppercase tracking-widest"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: Category) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Alt Text</label>
              <input
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="w-full p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none font-medium focus:ring-1 focus:ring-black dark:focus:ring-white"
                placeholder="Accessibility description"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-4 w-full py-8 bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm hover:scale-[0.98] disabled:opacity-50 transition-all shadow-2xl active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isEditing ? "Sync Changes" : "Commit to Archive"}
        </button>
      </div>
    </form>
  );
}