"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Artifact } from "@/types";

interface ArtifactCardProps {
  artifact: Artifact;
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const aspectVariants = {
    portrait: "aspect-[3/4]",
    landscape: "aspect-[16/10]",
    square: "aspect-square",
  };

  return (
    <div className="w-full group transition-all duration-300 flex flex-col mb-1 select-none">
      {artifact.imageUrl && (
        <Link
          href={`/fragments/${artifact.slug}`}
          className="block relative overflow-hidden w-full rounded-lg bg-zinc-950"
        >
          <div
            className={`relative w-full ${aspectVariants[artifact.aspectRatio]}`}
          >
            <Image
              src={artifact.imageUrl}
              alt={artifact.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover opacity-95 group-hover:opacity-30 group-hover:scale-[1.01] transition-all duration-700 ease-out"
            />
          </div>

          <div
            className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent 
                       opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                       transition-all duration-500 ease-out 
                       flex flex-col justify-end p-5 pointer-events-none"
          >
            <div className="flex items-baseline justify-between w-full border-b border-zinc-800/50 pb-2 mb-2.5">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-zinc-400 font-medium">
                {artifact.category}
              </span>

              <h3 className="font-mono text-[12px] font-bold text-[var(--text-bright)] tracking-wide uppercase text-right max-w-[65%] truncate">
                {artifact.title}
              </h3>
            </div>

            <p className="font-sans text-[12px] leading-relaxed text-zinc-300 line-clamp-3 font-light tracking-normal">
              {artifact.snippet}
            </p>
          </div>
        </Link>
      )}
    </div>
  );
}
