"use client";

import React, { useEffect } from "react";
import { ArtifactForm } from "@/app/upload/ArtifactForm";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-mono text-white uppercase tracking-[0.2em] text-sm">
            New Artifact
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-widest"
          >
            [CLOSE]
          </button>
        </div>

        <ArtifactForm />
      </div>
    </div>
  );
}
