"use client";

import React, { createContext, useMemo } from "react";
import { useAuthInternal } from "@/hooks/useAuthInternal";
import { AuthContextType } from "@/types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    user, 
    loading, 
    mounted, 
    login, 
    register, 
    logout, 
    isAuthenticated 
  } = useAuthInternal();

  const value = useMemo(() => ({ 
    user, 
    loading, 
    mounted, 
    login, 
    register, 
    logout, 
    isAuthenticated 
  }), [user, loading, mounted, login, register, logout, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};