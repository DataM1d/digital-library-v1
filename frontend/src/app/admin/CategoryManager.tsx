"use client";

import { useState } from "react";
import { Category } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Trash2, Loader2, Hash } from "lucide-react";

interface CategoryRowProps {
  cat: Category;
  onDelete: (id: string) => void;
}

export function CategoryManager() {
  const [newName, setNewName] = useState("");
  const { categories, isLoading, isSubmitting, addCategory, deleteCategory } =
    useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const success = await addCategory(newName);
    if (success) setNewName("");
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b-2 border-zinc-200">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900">
          Index_Taxonomy
        </h2>
      </div>

      <div className="space-y-3">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Append_New_Class
        </label>
        <form
          onSubmit={handleSubmit}
          className="flex border-[1.5px] border-zinc-200 bg-white focus-within:border-black transition-colors"
        >
          <input
            type="text"
            placeholder="ENTRY_NAME..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider outline-none bg-transparent placeholder:text-zinc-200"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newName.trim()}
            className="bg-zinc-50 text-zinc-400 px-4 py-2.5 hover:bg-black hover:text-white disabled:opacity-50 transition-all border-l border-zinc-200"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Plus size={16} strokeWidth={2.5} />
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Active_Index
          </span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-zinc-200 text-zinc-600">
            {categories.length.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="border border-zinc-200 bg-zinc-100/50 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-10 bg-white/50">
              <Loader2 className="animate-spin text-zinc-200" size={20} />
            </div>
          ) : (
            <div className="divide-y divide-zinc-200">
              {categories.map((cat) => (
                <CategoryRow key={cat.id} cat={cat} onDelete={deleteCategory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, onDelete }: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 hover:bg-[#FFEF00]/5 group transition-colors cursor-default">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 flex items-center justify-center bg-white border border-zinc-200 group-hover:border-zinc-300 transition-colors">
          <Hash
            size={12}
            className="text-zinc-300 group-hover:text-black"
            strokeWidth={3}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-tight text-zinc-700 group-hover:text-black">
            {cat.name}
          </span>
          <span className="text-[8px] font-mono font-bold text-zinc-300 uppercase tracking-tighter">
            REF // {cat.slug}
          </span>
        </div>
      </div>
      <button
        onClick={() =>
          confirm(`CONFIRM_REMOVAL: ${cat.name}`) && onDelete(cat.id)
        }
        className="p-2 text-zinc-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
