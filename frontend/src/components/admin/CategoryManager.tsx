"use client";

import { useState } from "react";
import { Category } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";


interface CategoryRowProps {
  cat: Category; 
  onDelete: (id: number) => void;
}

export function CategoryManager() {
  const [newName, setNewName] = useState("");
  const { categories, isLoading, isSubmitting, addCategory, deleteCategory } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const success = await addCategory(newName);
    if (success) setNewName("");
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Tag size={18} className="text-zinc-400" />
          Taxonomy Manager
        </h3>
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="New category name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newName.trim()}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Add
          </button>
        </form>

        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
          ) : (
            categories.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} onDelete={deleteCategory} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, onDelete }: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 group transition-all">
      <div>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</span>
        <span className="ml-2 text-xs font-mono text-zinc-500">{cat.slug}</span>
      </div>
      <button
        onClick={() => {
            if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
            onDelete(cat.id);
         }
        }}
        className="p-2 text-zinc-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        aria-label={`Delete ${cat.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}