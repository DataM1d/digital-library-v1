import { UseFormSetValue } from "react-hook-form";
import { PostFormData } from "@/lib/api/schemas";

export function useArtifactImage(setValue: UseFormSetValue<PostFormData>) {
  const handleFileSelect = (file: File | null) => {
    setValue("image", file as any, { shouldValidate: true });
  };

  return { handleFileSelect };
}
