import { supabase } from "../lib/supabase";
import { FALLBACK_CATEGORIES, iconMap } from "../data/fallbackData";
import type { Category, Subcategory } from "../types";
import { Layers } from "lucide-react";

/**
 * Category & Subcategory Data Service
 */
export const categoryService = {
  /**
   * Fetches all active categories with their nested subcategories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      const { data: subData, error: subError } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!catError && catData && catData.length > 0) {
        return catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: iconMap[c.icon] || Layers,
          color: c.color || "#aaff38",
          subcategories: !subError && subData
            ? subData
                .filter((s: any) => s.category_id === c.id)
                .map((s: any): Subcategory => ({
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                }))
            : [],
        }));
      }

      return FALLBACK_CATEGORIES;
    } catch (err) {
      console.warn("Category service note: using cached fallback categories", err);
      return FALLBACK_CATEGORIES;
    }
  },

  /**
   * Fetches flat subcategories list for admin and dropdowns
   */
  async getSubcategoriesList(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },
};
