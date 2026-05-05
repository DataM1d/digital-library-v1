"use client";

import { useCallback, MouseEvent, useMemo } from "react";
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useImagePreview } from "@/hooks/useImagePreview";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
interface ImageUploadZoneProps {
  onFileSelect: (file: File | null) => void;
  defaultValue?: string;
}

interface PlaceholderProps {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
}

export function ImageUploadZone({ onFileSelect, defaultValue }: ImageUploadZoneProps) {
  const { preview, handleFileChange } = useImagePreview(defaultValue);

  const fullPreviewUrl = useMemo(() => {
    if (!preview) return null;
    if (preview.startsWith("blob:") || preview.startsWith("data:") || preview.startsWith("http")) {
      return preview;
    }
    return `${API_URL}${preview}`;
  }, [preview]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      handleFileChange(file);
      onFileSelect(file);
    },
    [handleFileChange, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    multiple: false,
    maxSize: 5242880, // 5MB limit check at the browser level
  });

  const clearFile = (e: MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {fullPreviewUrl ? (
        <PreviewCard src={fullPreviewUrl} onClear={clearFile} />
      ) : (
        <UploadPlaceholder 
          getRootProps={getRootProps} 
          getInputProps={getInputProps} 
          isDragActive={isDragActive} 
        />
      )}
    </div>
  );
}

function PreviewCard({ src, onClear }: { src: string; onClear: (e: MouseEvent) => void }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner bg-zinc-100 dark:bg-zinc-900 group">
      <Image 
        src={src} 
        alt="Upload preview" 
        fill 
        className="object-cover transition-transform duration-500 group-hover:scale-105" 
        priority 
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <button
        type="button"
        onClick={onClear}
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-red-500 transition-all scale-90 group-hover:scale-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function UploadPlaceholder({ getRootProps, getInputProps, isDragActive }: PlaceholderProps) {
  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all cursor-pointer min-h-50
        ${isDragActive 
          ? "border-black bg-zinc-50 dark:border-white dark:bg-zinc-900" 
          : "border-zinc-200 hover:border-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-400"
        }`}
    >
      <input {...getInputProps()} />
      <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900 mb-4 text-zinc-400 transition-transform group-hover:scale-110">
        <Upload size={24} />
      </div>
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        Drop your artifact here
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
        JPG, PNG or WEBP (MAX. 5MB)
      </p>
    </div>
  );
}