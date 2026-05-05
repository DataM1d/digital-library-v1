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
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const result = UserSchema.safeParse(parsedUser);

          if (result.success) {
            setUser(result.data);
          } else {
            console.warn("Archive authentication schema mismatch. Resetting session.");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Archive authentication corrupted:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
        setMounted(true);
      }
    };
    initAuth();
  }, []);

  const handleAuthSuccess = useCallback((res: AuthResponse) => {
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    setUser(res.user);
    toast.success(`Access granted: Welcome, ${res.user.username}`);
    
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect") || "/";

    router.push(redirectTo);
    router.refresh();
  }, [router]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await api.auth.login(credentials);
      await handleAuthSuccess(res);
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
      await handleAuthSuccess(res);
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