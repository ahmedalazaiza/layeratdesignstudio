import { apiClient } from "@/lib/api-client";
import { FALLBACK_CATEGORIES, iconMap } from "@/data/fallbackData";
import type { Category, SubCategory, Tag, ApiResponse } from "@/types/api";
import { Layers } from "lucide-react";

export const categoryService = {
  /**
   * Fetches all categories with nested subcategories
   * GET /api/product/category/
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>("/api/product/category/");
      const categories = response.data.data;

      if (Array.isArray(categories) && categories.length > 0) {
        return categories.map((cat) => ({
          ...cat,
          id: cat._id || cat.id,
          icon: cat.icon && iconMap[cat.icon as string] ? iconMap[cat.icon as string] : (cat.icon || Layers),
          subcategories: (cat.subcategories || []).map((sub) => ({
            ...sub,
            id: sub._id || sub.id,
          })),
        }));
      }

      return FALLBACK_CATEGORIES;
    } catch (err) {
      console.warn("Category service note: using fallback categories", err);
      return FALLBACK_CATEGORIES;
    }
  },

  /**
   * Fetches a single category by ID or slug
   * GET /api/product/category/:id
   */
  async getCategoryById(idOrSlug: string): Promise<Category | null> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(`/api/product/category/${encodeURIComponent(idOrSlug)}`);
      const cat = response.data.data;
      if (cat) {
        return {
          ...cat,
          id: cat._id || cat.id,
          icon: cat.icon && iconMap[cat.icon as string] ? iconMap[cat.icon as string] : (cat.icon || Layers),
        };
      }
      return null;
    } catch (err) {
      console.warn(`Category lookup error for ${idOrSlug}:`, err);
      return FALLBACK_CATEGORIES.find((c) => c.slug === idOrSlug || c.id === idOrSlug || c._id === idOrSlug) || null;
    }
  },

  /**
   * Fetches all product tags
   * GET /api/product/tags/
   */
  async getTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get<ApiResponse<Tag[]>>("/api/product/tags/");
      const tags = response.data.data;
      if (Array.isArray(tags) && tags.length > 0) {
        return tags.map((t) => ({ ...t, id: t._id || t.id }));
      }
      return [
        { _id: "t1", id: "t1", name: "Figma", slug: "figma", productCount: 42 },
        { _id: "t2", id: "t2", name: "Design System", slug: "design-system", productCount: 38 },
        { _id: "t3", id: "t3", name: "UI Kit", slug: "ui-kit", productCount: 29 },
        { _id: "t4", id: "t4", name: "SaaS", slug: "saas", productCount: 24 },
        { _id: "t5", id: "t5", name: "Dashboard", slug: "dashboard", productCount: 22 },
        { _id: "t6", id: "t6", name: "Mobile", slug: "mobile", productCount: 19 },
        { _id: "t7", id: "t7", name: "Wireframe", slug: "wireframe", productCount: 15 },
        { _id: "t8", id: "t8", name: "Icons", slug: "icons", productCount: 12 },
      ];
    } catch (err) {
      console.warn("Tags service note: using fallback tags", err);
      return [
        { _id: "t1", id: "t1", name: "Figma", slug: "figma", productCount: 42 },
        { _id: "t2", id: "t2", name: "Design System", slug: "design-system", productCount: 38 },
        { _id: "t3", id: "t3", name: "UI Kit", slug: "ui-kit", productCount: 29 },
        { _id: "t4", id: "t4", name: "SaaS", slug: "saas", productCount: 24 },
        { _id: "t5", id: "t5", name: "Dashboard", slug: "dashboard", productCount: 22 },
        { _id: "t6", id: "t6", name: "Mobile", slug: "mobile", productCount: 19 },
        { _id: "t7", id: "t7", name: "Wireframe", slug: "wireframe", productCount: 15 },
        { _id: "t8", id: "t8", name: "Icons", slug: "icons", productCount: 12 },
      ];
    }
  },

  /**
   * Fetches single tag by ID or slug
   * GET /api/product/tags/:id
   */
  async getTagById(idOrSlug: string): Promise<Tag | null> {
    try {
      const response = await apiClient.get<ApiResponse<Tag>>(`/api/product/tags/${encodeURIComponent(idOrSlug)}`);
      return response.data.data;
    } catch {
      return null;
    }
  },
};
