"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials, RegisterPayload } from "@/types";
import { isAxiosError } from "axios"; 

type AuthMode = "login" | "register";

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
          password: formData.password
        };
        await register(payload);
      } else {
        const credentials: LoginCredentials = { 
          email: formData.email, 
          password: formData.password 
        };
        await login(credentials);
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const apiError = err.response?.data?.error || "Authentication failed";
        setError(apiError);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    formData, 
    handleChange, 
    handleSubmit, 
    isLoading, 
    error 
  };
}