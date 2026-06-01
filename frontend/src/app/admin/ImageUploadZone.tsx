"use client";

import { useCallback, MouseEvent, useMemo } from "react";
import {
  useDropzone,
  DropzoneRootProps,
  DropzoneInputProps,
} from "react-dropzone";
import { X } from "lucide-react";
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

export function ImageUploadZone({
  onFileSelect,
  defaultValue,
}: ImageUploadZoneProps) {
  const { preview, handleFileChange } = useImagePreview(defaultValue);

  const fullPreviewUrl = useMemo(() => {
    if (!preview) return null;
    if (
      preview.startsWith("blob:") ||
      preview.startsWith("data:") ||
      preview.startsWith("http")
    ) {
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
    [handleFileChange, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".webp"] },
    multiple: false,
    maxSize: 5242880,
  });

  const clearFile = (e: MouseEvent) => {
    e.stopPropagation();
    handleFileChange(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full h-full">
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

function PreviewCard({
  src,
  onClear,
}: {
  src: string;
  onClear: (e: MouseEvent) => void;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-zinc-800 shadow-inner bg-zinc-900 group">
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
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-red-500 transition-all scale-90 group-hover:scale-100 z-10"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function UploadPlaceholder({
  getRootProps,
  getInputProps,
  isDragActive,
}: PlaceholderProps) {
  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-full rounded-l border-1 transition-all cursor-pointer
        ${
          isDragActive
            ? "border-white bg-zinc-900"
            : "border-zinc-800 hover:border-zinc-600 bg-zinc-950/50"
        }`}
    >
      <input {...getInputProps()} />
      <div className="mb-2 p-4e transition-transform group-hover:scale-110">
        <Image
          src="/svg/upload.svg"
          width={58}
          height={58}
          alt="Upload"
          className="opacity-90"
        />
      </div>
      <p className="text-lg font-bold text-zinc-300 tracking-widest">
        DROP ARTIFACT HERE
      </p>
      <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-zinc-500">
        JPG, PNG, WEBP (MAX. 5MB)
      </p>
    </div>
  );
}
