import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginCredentials, RegisterPayload } from "@/types";

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
        await register(formData as RegisterPayload);
      } else {
        await login({ 
          email: formData.email, 
          password: formData.password 
        } as LoginCredentials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
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