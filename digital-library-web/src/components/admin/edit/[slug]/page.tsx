"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { TagInput } from "@/components/admin/TagInput";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EditPostPage() {
    const router = useRouter();
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        category_id: "1",
        alt_text: "",
    });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const post = await api.posts.slug(slug as string);
                setFormData({
                    title: post.title,
                    content: post.content,
                    category_id: post.category_id.toString(),
                    alt_text: post.alt_text || "",
                });
                setTags(post.tags);
                setExistingImage(post.image_url);
            } catch (error) {
                toast.error("Could not find that artifact.");
                router.push("/admin");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        if (imageFile) data.append("image", imageFile);

        data.append("title", formData.title);
        data.append("content", formData.content);
        data.append("category_id", formData.category_id);
        data.append("alt_text", formData.alt_text);
        tags.forEach(tag => data.append("tags", tag));

        try {
            await api.posts.update(slug as string, data);
            toast.success("Artifact updated!");
            router.push("/admin");
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unexpected error occured while updating.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-mono">Loading Artifact Data...</div>;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <header className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight">Edit Artifact</h1>
                <p className="text-zinc-500 mt-2 font-mono text-sm">Target: {slug}</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold uppercase text-zinc-400">Update Image (Optional)</label>
                        <ImageUploadZone key={existingImage} onFileSelect={setImageFile} defaultValue={existingImage} />
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
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold uppercase text-zinc-400">Content</label>
                            <textarea
                                required
                                rows={6}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 outline-none focus:ring-1 focus:ring-black resize-none"
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
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        {saving ? "Saving Changes..." : "Update Archive"}
                    </button>
                </div>
            </form>
        </div>
    );
}