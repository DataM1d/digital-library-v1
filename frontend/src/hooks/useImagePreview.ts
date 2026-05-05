import { useState, useCallback, useEffect } from "react";

export function useImagePreview(defaultValue?: string) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (preview && !preview.startsWith("http")) {
      URL.revokeObjectURL(preview);
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setSelectedFile(file);
    } else {
        setPreview(defaultValue || null);
        setSelectedFile(null);
    }
  }, [preview , defaultValue]);
  
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("http")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return {
    preview,
    selectedFile,
    handleFileChange,
  };
}