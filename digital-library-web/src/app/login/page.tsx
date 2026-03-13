"use client";

import React from "react";
import Link from "next/link";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Library, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { formData, handleChange, handleSubmit, isLoading, error } = useAuthForm("login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950 transition-colors">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-xl">
            <Library size={24} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
              Archive Access
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Identify yourself to manage the digital collection
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-2xl shadow-zinc-200/50 dark:bg-zinc-900 dark:shadow-none border border-zinc-100 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 text-[13px] font-bold text-red-600 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <AuthInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="collector@archive.com"
                value={formData.email}
                onChange={handleChange}
              />

              <AuthInput
                label="Access Key"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-zinc-800 disabled:bg-zinc-200 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Enter Archive
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              New Researcher?{" "}
              <Link href="/register" className="text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-400 transition-colors">
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AuthInput({ label, name, type, placeholder, value, onChange }: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-zinc-500/5 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-700 transition-all"
      />
    </div>
  );
}