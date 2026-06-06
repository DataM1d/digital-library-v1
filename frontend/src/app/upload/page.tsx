"use client";

import { ArtifactForm } from "@/app/upload/ArtifactForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className="min-h-screen relative text-white pl-8 pr-8 pt-4 pb-10">
      <div
        className="fixed inset-0 bg-cover bg-center -z-20"
        style={{ backgroundImage: "url('/assets/bg-header.jpg')" }}
      />
      <div className="fixed inset-0 bg-black/85 -z-10" />

      <header className="flex justify-between items-center mb-12 relative z-10 pl-2">
        <h1 className="font-mono text-2xl uppercase tracking-tighter">
          Upload Artifact
        </h1>
        <button
          onClick={() => router.back()}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95 duration-200"
        >
          <Image
            src="/svg/home.svg"
            alt="Back"
            width={26}
            height={26}
            className="opacity-60 hover:opacity-100 transition-opacity"
          />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-full mx-auto relative z-10 items-start">
        <div className="h-[600px] w-full">
          <ArtifactForm />
        </div>
      </div>
    </main>
  );
}
