"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { TagInput } from "@/components/admin/TagInput";
import { api } from "@/lib/api";
import { toast } from "sonner"; 

export default function CreatePostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category_id: "1",
        alt_text: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return toast.error("Please upload an image");

        setLoading(true);
        setUploadProgress(0);

        const data = new FormData();
        data.append("image", imageFile);
        data.append("title", formData.title);
        data.append("content", formData.content);
        data.append("category_id", formData.category_id);
        data.append("alt_text", formData.alt_text);
        tags.forEach(tag => data.append("tags", tag));

        try {
            const result = await api.posts.createWithProgress(data, (percent) => {
                setUploadProgress(percent);
            });
            toast.success("Post archived successfully!");
            router.push(`/posts/s/${result.slug}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">New Artifact</h1>
                    <p className="text-zinc-500 mt-2">Document a new entry into the digital archive.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold uppercase text-zinc-400">Main Image</label>
                        <ImageUploadZone onFileSelect={setImageFile} />
                    </div>
                    <TagInput tags={tags} setTags={setTags} />
                </div>

                <div className="lg:col-span-7 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase text-zinc-400">Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full text-2xl font-medium bg-transparent border-b border-zinc-200 outline-none focus:border-black transition-all"
                                placeholder="Enter title..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase text-zinc-400">Story / Content</label>
                            <textarea
                                required
                                rows={6}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 outline-none focus:ring-1 focus:ring-black resize-none"
                                placeholder="Describe this entry..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold uppercase text-zinc-400">Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 outline-none"
                                >
                                    <option value="1">Architecture</option>
                                    <option value="2">Minimalism</option>
                                    <option value="3">Photography</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold uppercase text-zinc-400">Alt Text</label>
                                <input
                                    value={formData.alt_text}
                                    onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 outline-none"
                                    placeholder="Accessibility description"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading && (
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-black dark:bg-white h-full transition-all duration-300" 
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {loading ? `Uploading ${uploadProgress}%...` : "Archive Entry"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}