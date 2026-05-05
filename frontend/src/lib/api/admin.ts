import { request } from "./client";
import { CategorySchema } from "./schemas";
import { Category } from "@/types";

export const adminApi = {
  createCategory: (name: string) => 
    request<Category>({
      url: "/admin/categories", 
      method: "POST",
      data: { name }
      }, CategorySchema),
  
  deleteCategory: (id: number) => 
    request<{ message: string }>({
      url: `/admin/categories/${id}`,
      method: "DELETE"
    })
};