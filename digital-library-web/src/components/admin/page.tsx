"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Post } from "@/types";
import { Edit3, Trash2, Plus, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminDashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const result = await api.posts.list({ limit: 50 });
            setPosts(result.data);
        } catch (error) {
            toast.error("Failed to load archive");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-12 px-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Archive Management</h1>
                    <p className="text-zinc-500 mt-2">Manage your digital artifacts and their visibility.</p>
                </div>
                <Link 
                    href="/admin/create" 
                    className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:opacity-90 transition-all w-fit"
                >
                    <Plus size={18} />
                    New Entry
                </Link>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Search the archive..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-900">
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Artifact</th>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-10 bg-zinc-50/50 dark:bg-zinc-900/50" />
                                </tr>
                            ))
                        ) : filteredPosts.map((post) => (
                            <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden shrink-0 relative">
                                            <Image 
                                                src={post.image_url} 
                                                alt={post.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">{post.title}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{post.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                        {post.category_name}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${post.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {post.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/posts/s/${post.slug}`} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                                            <ExternalLink size={18} />
                                        </Link>
                                        <Link href={`/admin/edit/${post.slug}`} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                                            <Edit3 size={18} />
                                        </Link>
                                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-500 transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!loading && filteredPosts.length === 0 && (
                    <div className="py-20 text-center text-zinc-500">
                        No artifacts found in the archive.
                    </div>
                )}
            </div>
        </div>
    );
}