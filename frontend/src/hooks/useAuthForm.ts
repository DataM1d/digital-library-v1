"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials, RegisterPayload } from "@/types";
import { isAxiosError } from "axios";

type AuthMode = "login" | "register";

const ERROR_DIAGNOSTICS: Record<string, string> = {
  ERR_INVALID_AUTH_TOKEN: "AUTHENTICATION_FAILED: KEY_REJECTED",
  ERR_USER_NOT_FOUND: "IDENTITY_NOT_FOUND: CHECK_REGISTRY",
  ERR_RATE_LIMIT: "PROTOCOL_LOCKDOWN: TOO_MANY_ATTEMPTS",
  ERR_DB_CONNECTION: "SYSTEM_CRITICAL: DATABASE_UNREACHABLE",
};

const formatAuthError = (err: unknown): string => {
  if (isAxiosError(err)) {
    const rawError = err.response?.data?.error || "Authentication failed";
    return ERROR_DIAGNOSTICS[rawError] || `VERIFICATION FAILED: ${rawError}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred";
};

export function useAuthForm(mode: AuthMode) {
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "register") {
        const payload: RegisterPayload = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };
        await register(payload);
      } else {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password,
        };
        await login(credentials);
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
  };
}
