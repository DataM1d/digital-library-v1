import { request } from "./client";
import { CategorySchema } from "./schemas";
import { Category } from "@/types";
import { z } from "zod";

export const adminApi = {
  createCategory: (name: string) =>
    request<Category>(
      {
        url: "/admin/categories",
        method: "POST",
        data: { name },
      },
      CategorySchema,
    ),

  deleteCategory: (id: string) =>
    request<{ message: string }>(
      {
        url: `/admin/categories/${id}`,
        method: "DELETE",
      },
      z.object({ message: z.string() }),
    ),
};
