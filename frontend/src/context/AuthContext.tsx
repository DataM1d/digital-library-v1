"use client";

import React, { createContext, useMemo } from "react";
import { useAuthInternal } from "@/hooks/useAuthInternal";
import { AuthContextType, User } from "@/types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, login, register, logout, isAuthenticated } =
    useAuthInternal();

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
    }),
    [user, loading, login, register, logout, isAuthenticated, isAdmin],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </AuthContext.Provider>
  );
};
