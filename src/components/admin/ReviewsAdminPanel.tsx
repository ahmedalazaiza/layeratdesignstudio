import React, { useEffect, useState } from "react";
import {
  Star,
  Search,
  Trash2,
  Filter,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Layers,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { CustomSelect } from "../ui/CustomSelect";
import type { Product, AuthUser } from "../../types";

interface ReviewsAdminPanelProps {
  products: Product[];
  currentAuthUser: AuthUser | null;
}

export function ReviewsAdminPanel({
  products,
  currentAuthUser,
}: ReviewsAdminPanelProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products ( id, title, thumbnail_url )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Reviews load warning:", error.message);
      }

      setReviews(data || []);
    } catch (err) {
      console.error("Error loading reviews for admin:", err);
      toast.error("Failed to load reviews directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, []);

  const handleDeleteReview = async (reviewId: string, reviewerName: string) => {
    const confirm = window.confirm(
      `Are you sure you want to delete the review by "${reviewerName || "this user"}"?`
    );
    if (!confirm) return;

    try {
      setDeletingId(reviewId);
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted successfully.");
    } catch (err: any) {
      console.error("Delete review error:", err);
      toast.error(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (productFilter !== "all" && r.product_id !== productFilter) return false;
    if (ratingFilter !== "all" && String(r.rating) !== ratingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (r.user_name || r.name || "").toLowerCase().includes(q);
      const matchText = (r.review_text || r.comment || r.content || "")
        .toLowerCase()
        .includes(q);
      const matchProd = (r.products?.title || "").toLowerCase().includes(q);
      return matchName || matchText || matchProd;
    }
    return true;
  });

  // KPI Calculations
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / totalReviewsCount).toFixed(2)
      : "5.00";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fiveStarPct =
    totalReviewsCount > 0 ? Math.round((fiveStarCount / totalReviewsCount) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-2">
            <Star size={13} className="fill-current" /> Reviews & Ratings Control
          </div>
          <h2 className="text-2xl font-display font-extrabold text-foreground">
            Product Reviews & Community Feedback
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Monitor verified downloads feedback, platform ratings, and moderate spam
          </p>
        </div>

        <button
          onClick={loadAllReviews}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/40 text-xs font-mono font-bold transition-all cursor-pointer"
        >
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Reviews */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
              Total Reviews
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-foreground mb-1">
            {totalReviewsCount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Verified download submissions
          </p>
        </div>

        {/* Average Rating */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
              Platform Rating
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star size={18} className="fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-foreground mb-1 flex items-center gap-2">
            <span>{avgRating}</span>
            <span className="text-sm font-mono text-amber-400 font-bold">/ 5.0</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Across all active kits
          </p>
        </div>

        {/* 5-Star Percentage */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
              5-Star Ratio
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ThumbsUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-foreground mb-1">
            {fiveStarPct}%
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Top tier satisfaction score
          </p>
        </div>

        {/* Reviewed Products */}
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold">
              Active Kits
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-foreground mb-1">
            {products.length}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            100% Free resources
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by designer or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Product Filter */}
          <CustomSelect
            value={productFilter}
            onChange={(val) => setProductFilter(val)}
            options={[
              { value: "all", label: "All Products" },
              ...products.map((p) => ({ value: p.id || p._id || "", label: p.title })),
            ]}
            className="w-56 text-xs font-mono"
          />

          {/* Rating Filter */}
          <CustomSelect
            value={ratingFilter}
            onChange={(val) => setRatingFilter(val)}
            options={[
              { value: "all", label: "All Ratings" },
              { value: "5", label: "5 Stars ⭐⭐⭐⭐⭐" },
              { value: "4", label: "4 Stars ⭐⭐⭐⭐" },
              { value: "3", label: "3 Stars ⭐⭐⭐" },
              { value: "2", label: "2 Stars ⭐⭐" },
              { value: "1", label: "1 Star ⭐" },
            ]}
            className="w-48 text-xs font-mono"
          />
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-mono">Loading reviews directory...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-16 text-center text-muted-foreground">
          <Star size={36} className="mx-auto mb-3 opacity-30 text-amber-400" />
          <p className="font-semibold text-foreground">No reviews match your filters.</p>
          <p className="text-xs font-mono mt-1">
            Reviews left by verified users will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4">Design Kit</th>
                  <th className="px-6 py-4">Designer</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Review Text</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredReviews.map((r) => {
                  const prod = products.find((p) => p.id === r.product_id) || r.products;

                  return (
                    <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          {prod?.thumbnail_url || prod?.thumbnail ? (
                            <img
                              src={prod.thumbnail_url || prod.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                              <Layers size={16} />
                            </div>
                          )}
                          <span className="font-bold text-foreground truncate max-w-[160px]">
                            {prod?.title || "Figma Kit"}
                          </span>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 min-w-[140px]">
                          {r.user_avatar ? (
                            <img
                              src={r.user_avatar}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[11px] text-primary shrink-0">
                              {(r.user_name || "D")[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-foreground truncate">
                              {r.user_name || "Community Designer"}
                            </p>
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 font-bold">
                              <CheckCircle2 size={9} /> Verified Download
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rating Stars */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={
                                s <= r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted"
                              }
                            />
                          ))}
                          <span className="ml-1 font-mono font-bold text-foreground text-[11px]">
                            {r.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-foreground/90 line-clamp-2 leading-relaxed">
                          "{r.review_text || r.comment || r.content || ""}"
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 font-mono text-muted-foreground text-[11px]">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(r.id, r.user_name)}
                          disabled={deletingId === r.id}
                          title="Delete / Moderate Review"
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
