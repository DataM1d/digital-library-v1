"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthForm } from "@/hooks/useAuthForm";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

const getErrorDiagnostic = (code: string) => {
  const map: Record<string, string> = {
    "ERR_INVALID_AUTH_TOKEN": "AUTHENTICATION_FAILED: KEY_REJECTED",
    "ERR_USER_NOT_FOUND": "IDENTITY_NOT_FOUND: CHECK_REGISTRY",
    "ERR_RATE_LIMIT": "PROTOCOL_LOCKDOWN: TOO_MANY_ATTEMPTS",
    "ERR_DB_CONNECTION": "SYSTEM_CRITICAL: DATABASE_UNREACHABLE",
  };
  return map[code] || `VERIFICATION_FAILED: ${code}`;
};

export default function LoginPage() {
  const { formData, handleChange, handleSubmit, isLoading, error } = useAuthForm("login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6">
      <div className="w-full max-w-100">
        <div className="mb-12">
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Archive_Portal</h1>
          <h2 className="text-2xl font-medium tracking-tight text-zinc-900 mt-2">Sign in to continue.</h2>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 text-[10px] font-bold text-red-600 border border-red-100 uppercase tracking-widest">
              {getErrorDiagnostic(error)}
            </div>
          )}

          <AuthInput
            label="Personnel Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="COLLECTOR@ARCHIVE.SE"
          />

          <AuthInput
            label="Access Key"
            name="password"
            type="password"
            isPassword
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={14} /> : "Initialize Session"}
            {!isLoading && <ArrowRight size={14} />}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-zinc-500 uppercase tracking-widest">
          New researcher?{" "}
          <Link href="/register" className="text-zinc-900 font-bold hover:underline">
            Apply here
          </Link>
        </p>
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
  isPassword?: boolean;
}

function AuthInput({ label, name, type, placeholder, value, onChange, isPassword }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:border-zinc-900 outline-none transition-all"
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}