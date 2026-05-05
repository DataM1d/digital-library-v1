"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${returnUrl}`);
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300 dark:text-zinc-700" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Verifying Credentials
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}