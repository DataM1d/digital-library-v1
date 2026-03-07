"use client"

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadZoneProps {
    onFileSelect: (file: File | null) => void;
}

export function ImageUploadZone({ onFileSelect }: ImageUploadZoneProps) {
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onFileSelect((file));
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpeg", ".png", ".webp"] },
        multiple: false,
    });

    const clearFile = () => {
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full">
      {preview ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <button
            onClick={clearFile}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer
            ${isDragActive 
              ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900" 
              : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
            }`}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900 mb-4">
            <Upload className="text-zinc-500" size={24} />
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            JPG, PNG or WEBP (MAX. 5MB)
          </p>
        </div>
      )}
    </div>
  );
}