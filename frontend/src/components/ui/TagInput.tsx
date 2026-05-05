"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({ value = [], onChange, placeholder = "Add tag..." }: TagInputProps) {
    const [input, setInput] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ".") && input.trim()) {
            e.preventDefault();
            const newTag = input.trim().toLowerCase();

            if (!value.includes(newTag)) {
                onChange([...value, newTag]);
            }
            setInput("");
        } else if (e.key === "Backspace" && !input && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((t) => t !== tagToRemove));
    };

return (
    <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus-within:ring-2 focus-within:ring-zinc-500 transition-all">
      {value.map((tag) => (
        <span 
          key={tag} 
          className="flex items-center gap-1 px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-lg"
        >
          {tag}
          <button 
            type="button" 
            onClick={() => removeTag(tag)}
            className="hover:text-red-500 transition-colors"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent outline-none text-sm py-1 min-w-30"
      />
    </div>
  );
}
