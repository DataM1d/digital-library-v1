"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthInternal } from "@/hooks/useAuthInternal";
import { UploadModal } from "@/components/modals/UploadModal";

export function HeaderNavbar() {
  const { user } = useAuthInternal();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="w-full flex flex-col">
      <div className="flex w-full items-center px-6 py-6 transition-all duration-300">
        <Link href="/" className="flex items-center group shrink-0">
          <div className="relative w-10 h-6 flex items-center justify-center">
            <Image
              src="/svg/logo.svg"
              alt="Archive Mark"
              fill
              priority
              className="object-contain"
            />
          </div>
          <span className="font-mono text-xl ml-3 tracking-[0.02em] uppercase text-white font-medium">
            ARCHIVE
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-6">
          {user?.role === "admin" && (
            <Link
              href="/upload"
              className="font-mono text-[11px] text-zinc-300 hover:text-white uppercase tracking-[0.2em] transition-colors"
            >
              + Add Post
            </Link>
          )}

          {user?.role === "admin" && (
            <div className="h-3 w-[1px] bg-zinc-700" />
          )}

          <Link
            href={user ? "/admin" : "/login"}
            className="flex items-center gap-3 font-mono text-[11px] uppercase text-zinc-300 hover:text-white transition-colors tracking-[0.2em]"
          >
            {user ? user.username : "Login"}
            <div className="relative w-4 h-4">
              <Image
                src="/svg/user.svg"
                alt="User"
                fill
                className="object-contain brightness-100"
              />
            </div>
          </Link>
        </div>

        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
        />
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-zinc-700 via-zinc-800 to-transparent" />
    </div>
  );
}
