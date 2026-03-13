"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { User, LoginCredentials, RegisterPayload, AuthResponse } from "@/types";
import { api, UserSchema } from "@/lib/api";

export function useAuthInternal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

 useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const validateUser = UserSchema.parse(parsedUser);
          setUser(validateUser);
        } catch (error) {
          console.error("Archive authentication corrupted:", error);
          localStorage.clear();
        }
      }
      setLoading(false);
      setMounted(true);
    };
    initAuth();
  }, []);

  const handleAuthSuccess = useCallback((res: AuthResponse) => {
    localStorage.setItem("token", res.token);
    if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.username}`);
    }
    
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/admin";
    router.push(redirectTo);
  }, [router]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await api.auth.login(credentials);
      handleAuthSuccess(res);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Invalid credentials");
      }
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await api.auth.register(payload);
      handleAuthSuccess(res);
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Registration failed");
      }
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Session archived. You have been logged out.");
    router.push("/login");
    router.refresh();
  }, [router]);

  return {
    user,
    loading,
    mounted,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}