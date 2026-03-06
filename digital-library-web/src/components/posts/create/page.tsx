"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatePostPage() {
    const [title, setTitle] = useState("");

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Post metadata saved to archive.");
    };

    return (
    <ProtectedRoute>
      <main className="min-h-screen bg-zinc-50 py-12 dark:bg-black">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Upload to Archive</h1>
            <p className="mt-2 text-sm text-zinc-500">Add a new entry to the digital library.</p>
            
            <form onSubmit={handleUpload} className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 bg-transparent p-3 outline-none focus:ring-2 focus:ring-black dark:border-zinc-800 dark:focus:ring-white"
                  placeholder="The Architecture of Tomorrow"
                />
              </div>
              <button className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all">
                Submit for Review
              </button>
            </form>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}