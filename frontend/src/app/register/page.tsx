"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuthInput } from "@/hooks/useAuthInput";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { formData, handleChange, handleSubmit, isLoading, error } =
    useAuthForm("register");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#08080a] px-6 overflow-hidden select-none">
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/assets/bg-header.jpg"
          alt="Archival blueprint texture background"
          fill
          priority
          className="object-cover object-center opacity-[0.09] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#08080a] opacity-40" />
      </div>

      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-screen bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#050507_100%)]" />

      <div className="relative z-10 w-full max-w-md p-6 min-h-screen flex flex-col justify-center">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[var(--text-bright)] font-serif italic">
            Create your account.
          </h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-red-400 border border-red-950/40 uppercase tracking-widest font-mono rounded-xl">
              {error}
            </div>
          )}

          <AuthInput
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="REGISTRY ID"
          />

          <AuthInput
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="EMAIL ADDRESS"
          />

          <AuthInput
            name="password"
            type="password"
            isPassword
            value={formData.password}
            onChange={handleChange}
            placeholder="PASSWORD"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-950 py-4 text-[10px] font-bold uppercase tracking-[0.25em] font-mono transition-all duration-300 disabled:opacity-50 rounded-full mt-8 shadow-[0_0_25px_rgba(255,255,255,0.04)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-[1.005]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Initialize Profile"
            )}
            {!isLoading && (
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-center items-center text-[10px] tracking-widest font-mono">
          <Link
            href="/login"
            className="text-zinc-400 font-bold hover:text-white transition-colors underline decoration-zinc-700 hover:decoration-zinc-400 underline-offset-4 tracking-[0.18em] uppercase"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

interface AuthInputProps {
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
}

function AuthInput({
  name,
  type,
  placeholder,
  value,
  onChange,
  isPassword,
}: AuthInputProps) {
  const { showPassword, togglePasswordVisibility } = useAuthInput();

  return (
    <div className="relative group">
      <input
        name={name}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          borderColor: "var(--search-border)",
          color: "var(--search-text-focus)",
        }}
        onFocus={(e) => {
          const el = e.target as HTMLInputElement;
          el.style.borderColor = "var(--search-border-focus)";
        }}
        onBlur={(e) => {
          const el = e.target as HTMLInputElement;
          el.style.borderColor = "var(--search-border)";
        }}
        className="w-full bg-zinc-950/10 backdrop-blur-sm border px-6 py-4 text-xs font-mono placeholder-zinc-500 focus:outline-none transition-all duration-300 tracking-[0.2em] rounded-full font-bold uppercase"
      />

      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-100 transition-colors"
        >
          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      )}
    </div>
  );
}
