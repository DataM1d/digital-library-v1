"use client";

import React from "react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-mono text-white uppercase tracking-[0.2em]">
            New Artifact
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white font-mono"
          >
            [CLOSE]
          </button>
        </div>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            className="bg-transparent border-b border-zinc-700 py-2 text-white focus:outline-none focus:border-white transition-colors"
          />
          <textarea
            placeholder="Content description..."
            rows={4}
            className="bg-transparent border-b border-zinc-700 py-2 text-white focus:outline-none focus:border-white transition-colors resize-none"
          />
          <button
            type="submit"
            className="mt-4 py-3 bg-white text-black font-mono font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
