"use client";

import React from "react";
import Link from "next/link";
import { useAuthForm } from "@/hooks/useAuthForm";
import { UserPlus, Loader2, Fingerprint, Mail, Key, Database } from "lucide-react";

export default function RegisterPage() {
  const { formData, handleChange, handleSubmit, isLoading, error } = useAuthForm("register");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 overflow-hidden relative">
      {/* BACKGROUND INTERFACE LAYERS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
          <div className="group relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-zinc-900 border border-white/5 text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.1)] transition-all duration-700 hover:border-cyan-500/40">
            <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Database size={32} strokeWidth={1.5} className="relative z-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-[12px] font-black uppercase tracking-[0.8em] text-white">
              Request_Entry
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-4 bg-zinc-800" />
              <p className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest">
                New_Node Registration Protocol
              </p>
              <div className="h-px w-4 bg-zinc-800" />
            </div>
          </div>
        </div>

        <div className="relative rounded-[2.5rem] bg-[#0a0a0a]/80 backdrop-blur-xl p-10 border border-white/5 shadow-2xl">
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          
          <form className="space-y-7" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/5 p-4 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/20 text-center animate-pulse">
                Registration_Error: {error}
              </div>
            )}

            <div className="space-y-5">
              <AuthInput
                label="Registry_ID"
                name="username"
                type="text"
                icon={<Fingerprint size={14} />}
                placeholder="ARCHIVIST_01"
                value={formData.username}
                onChange={handleChange}
              />

              <AuthInput
                label="Communication_Node"
                name="email"
                type="email"
                icon={<Mail size={14} />}
                placeholder="COLLECTOR@ARCHIVE.COM"
                value={formData.email}
                onChange={handleChange}
              />

              <AuthInput
                label="Secure_Access_Key"
                name="password"
                type="password"
                icon={<Key size={14} />}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-white transition-all hover:bg-white/10 hover:border-cyan-500/40 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <>
                  <UserPlus size={14} className="text-cyan-500" />
                  Initialize_Profile
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/[0.03] text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Existing Researcher?{" "}
              <Link href="/login" className="ml-2 text-zinc-400 hover:text-cyan-400 underline underline-offset-8 decoration-zinc-800 hover:decoration-cyan-500/30 transition-all">
                Authorize_Session
              </Link>
            </p>
          </div>
        </div>

        {/* HUD ELEMENTS */}
        <div className="mt-8 flex items-center justify-between px-6 opacity-20">
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-cyan-500" />
            <span className="text-[7px] font-mono uppercase tracking-widest text-zinc-500">Security: Tier_1</span>
          </div>
          <span className="text-[7px] font-mono uppercase tracking-widest text-zinc-500">System_Time: 2026.04.04</span>
        </div>
      </div>
    </div>
  );
}

interface AuthInputProps {
  label: string;
  name: string;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function AuthInput({ label, name, type, icon, placeholder, value, onChange }: AuthInputProps) {
  return (
    <div className="space-y-2.5 group/input">
      <div className="flex items-center justify-between px-1">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 group-focus-within/input:text-cyan-500 transition-colors">
          {label}
        </label>
        <span className="text-zinc-800 group-focus-within/input:text-cyan-500/40 transition-colors">
          {icon}
        </span>
      </div>
      <div className="relative">
        <input
          name={name}
          type={type}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-white/5 bg-black/40 px-5 py-4 text-[10px] font-mono text-white placeholder:text-zinc-800 outline-none ring-0 focus:border-cyan-500/20 focus:bg-black transition-all duration-500"
        />
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-500/50 group-focus-within/input:w-full transition-all duration-700" />
      </div>
    </div>
  );
}