"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { User, LoginCredentials, RegisterPayload, AuthResponse } from "@/types";
import { api, UserSchema } from "@/lib/api";
import { useAppRouter } from "@/lib/router";

export function useAuthInternal() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const router = useAppRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
          setInitializing(false);
          return;
        }

        const parsedUser = JSON.parse(savedUser);
        const result = UserSchema.safeParse(parsedUser);

        if (!result.success) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setInitializing(false);
          return;
        }

        setUser({
          ...result.data,
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setInitializing(false);
      }
    };

    const handleStorage = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || !savedUser) {
        setUser(null);
      }
    };

    initAuth();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleAuthSuccess = useCallback(
    async (res: AuthResponse) => {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setUser(res.user);

      toast.success(`Access granted: Welcome, ${res.user.username}`);

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/";

      router.push(redirectTo);
      router.refresh();
    },
    [router],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const res = await api.auth.login(credentials);
        await handleAuthSuccess(res);
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(err.response?.data?.error || "Invalid credentials");
        }

        throw err;
      }
    },
    [handleAuthSuccess],
  );
  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        await api.auth.register(payload);
        toast.success(
          "Account initialized! Please sign in with your credentials.",
        );
        router.push("/login");
      } catch (err) {
        if (isAxiosError(err)) {
          toast.error(err.response?.data?.error || "Registration failed");
        }
        throw err;
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    toast.info("Session archived. You have been logged out.");

    router.push("/login");
    router.refresh();
  }, [router]);

  return useMemo(
    () => ({
      user,
      loading: initializing,
      login,
      register,
      logout,
      isAuthenticated: !!user,
    }),
    [user, initializing, login, register, logout],
  );
}
