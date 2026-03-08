 "use client";

 import { useState, KeyboardEvent } from "react";
import { X, Hash } from "lucide-react";

interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                setTags([...tags, input.trim()]);
            }
            setInput("");
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="space-y-2">
           <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tags (Press Enter)</label> 
           <div className="flex flex-wrap gap-2 p-2 border rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition-all "></div>
           {tags.map((tag, index) => (
            <span key={index} className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs rounded-lg font-medium border border-zinc-200 dark:border-zinc-700">
             <Hash size={12} className="opacity-50" />
             {tag}
             <button type="button" onClick={() => removeTag(index)} className="hover:text-red-500 transition-colors">
                <X size={14} />
             </button>
             </span>
          ))}
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="flex-1 bg-transparent border-none outline-none text-sm min-w-30 py-1"
          />
        </div>
    )
}