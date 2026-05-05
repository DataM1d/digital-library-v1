import axios from "axios";
import { z } from "zod";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const BASE_URL = `${API_BASE}/api`;

export const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login')) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export async function request<T>(
  config: import("axios").AxiosRequestConfig,
  schema?: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await apiInstance(config);
    const data = response.data;
    if (schema) {
        const result = schema.safeParse(data);
        if (!result.success) {
            console.error(`[Zod Validation Error] ${config.method?.toUpperCase()} ${config.url}:`, result.error.format());
            return data as T;
        }
        return result.data
    }
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? "NETWORK_ERROR";
      const message = err.response?.data?.message || err.message;
      
      console.error(
        `[API Error] ${config.method?.toUpperCase()} ${config.url}`,
        `| Status: ${status}`,
        `| Message: ${message}`
      );
    } else {
        console.error("[Unexpected Error]:", err);
    }
    throw err;
  }
}