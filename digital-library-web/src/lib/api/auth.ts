import { request } from "./client";
import { AuthResponseSchema } from "./schemas";
import { LoginCredentials, RegisterPayload, AuthResponse } from "@/types";

export const authApi = {
  login: (credentials: LoginCredentials) => 
    request<AuthResponse>({
      url: "/auth/login",
      method: "POST",
      data: credentials,
      }, AuthResponseSchema),

  register: (payload: RegisterPayload) => 
    request<AuthResponse>({
      url: "/auth/register",
      method: "POST",
      data: payload,
    }, AuthResponseSchema),
};