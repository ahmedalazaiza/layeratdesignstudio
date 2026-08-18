import { supabase } from "../lib/supabase";
import type { Review } from "../types";

/**
 * Review & Rating Data Service
 */
export const reviewService = {
  /**
   * Fetches approved reviews for a given product
   */
  async getApprovedReviews(productId: string): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error || !data) return [];

      return data.map((r: any): Review => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name || "Community Designer",
        userAvatar: r.user_avatar || undefined,
        rating: r.rating || 5,
        title: r.title || undefined,
        comment: r.comment || "",
        isVerifiedPurchase: Boolean(r.is_verified_purchase),
        helpfulCount: r.helpful_count || 0,
        createdAt: r.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submits a customer review
   */
  async submitReview(review: {
    product_id: string;
    user_id?: string | null;
    user_name: string;
    user_avatar?: string | null;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("reviews").insert({
        ...review,
        is_approved: true, // auto-approve default
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to submit review" };
    }
  },
};
