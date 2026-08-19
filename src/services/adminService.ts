import { apiClient } from "@/lib/api-client";
import type { Category, Tag, ApiResponse } from "@/types/api";

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  subcategories?: { name: string; slug?: string }[];
  includedFiles?: string[];
}

export interface TagPayload {
  name: string;
  slug?: string;
}

export const adminService = {
  // ── Categories CRUD ──

  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>("/api/admin/category/");
    return response.data.data || [];
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>("/api/admin/category/", payload);
    return response.data.data;
  },

  async updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
    const response = await apiClient.put<ApiResponse<Category>>(`/api/admin/category/${encodeURIComponent(id)}`, payload);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/api/admin/category/${encodeURIComponent(id)}`);
  },

  // ── Tags CRUD ──

  async getTags(): Promise<Tag[]> {
    const response = await apiClient.get<ApiResponse<Tag[]>>("/api/admin/tags/");
    return response.data.data || [];
  },

  async createTag(payload: TagPayload): Promise<Tag> {
    const response = await apiClient.post<ApiResponse<Tag>>("/api/admin/tags/", payload);
    return response.data.data;
  },

  async updateTag(id: string, payload: Partial<TagPayload>): Promise<Tag> {
    const response = await apiClient.put<ApiResponse<Tag>>(`/api/admin/tags/${encodeURIComponent(id)}`, payload);
    return response.data.data;
  },

  async deleteTag(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<any>>(`/api/admin/tags/${encodeURIComponent(id)}`);
  },
};
