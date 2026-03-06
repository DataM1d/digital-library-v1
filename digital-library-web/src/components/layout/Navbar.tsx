"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Library, PlusSquare, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <Library className="h-6 w-6" />
              <span className="hidden sm:inline">DIGITAL ARCHIVE</span>
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                Discovery
                </Link>

                {isAuthenticated ? (
                    <>
                      <Link href="/posts/create" className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                        <PlusSquare size={18} />
                        <span className="hidden md:inline">Upload</span>
                      </Link>
                      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <UserIcon size={14} />
                            {user?.username}
                        </span>
                        <button
                          onClick={logout}
                          className="rounded-full bg-zinc-100 p-2 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                      </div>
                    </>
                ) : (
                    <Link
                      href="/login"
                      className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all"
                    >
                        Sign In
                    </Link>
                )}
            </div>
          </div>
        </nav>
    );
}