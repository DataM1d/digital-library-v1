"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
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
      const newTag = input.trim().toLowerCase(); // Normalize to lowercase for consistency
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags.length - 1);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div 
        className="flex flex-wrap gap-2 p-3 min-h-14 border rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all shadow-inner"
      >
        {tags.map((tag, index) => (
          <span 
            key={`${tag}-${index}`} 
            className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs rounded-xl font-bold border border-zinc-200 dark:border-zinc-700 animate-in fade-in zoom-in duration-200"
          >
            <Hash size={12} className="text-zinc-400" />
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(index)} 
              className="ml-1 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        
        <input 
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add classifications..." : ""}
          className="flex-1 bg-transparent border-none outline-none text-sm min-w-30 py-1 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
        />
      </div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 ml-1">
        Press enter to anchor tags
      </p>
    </div>
  );
}