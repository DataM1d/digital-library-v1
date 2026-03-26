import axios from "axios";
import { z } from "zod";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiInstance = axios.create({
  baseURL: BASE_URL,
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
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?redirect=" + window.location.pathname;
      }
    }
    return Promise.reject(error);
  }
);

export async function request<T>(
  config: import("axios").AxiosRequestConfig,
  schema?: z.ZodSchema<T>
): Promise<T> {
  const response = await apiInstance(config);
  return schema ? schema.parse(response.data) : response.data;
}