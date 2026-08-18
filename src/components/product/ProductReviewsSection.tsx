import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  ShieldCheck,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import type { AuthUser, ProductReview } from "../../types";

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
  authUser: AuthUser | null;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  onStatsUpdate?: (newAverage: number, count: number) => void;
}

export function ProductReviewsSection({
  productId,
  productTitle,
  authUser,
  onAuthOpen,
  onStatsUpdate,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [checkingDownload, setCheckingDownload] = useState(false);

  // Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState<ProductReview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch Reviews
  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        // Table might be created freshly or empty
        console.warn("Reviews load note:", error.message);
      }

      const mapped: ProductReview[] = (data || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name || r.name || "Community Designer",
        userAvatar: r.user_avatar || r.avatar,
        rating: r.rating || 5,
        reviewText: r.review_text || r.comment || r.content || "",
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at,
      }));

      setReviews(mapped);

      // Check if current user already left a review
      if (authUser) {
        const myRev = mapped.find((r) => r.userId === authUser.id);
        if (myRev) {
          setUserExistingReview(myRev);
          setRating(myRev.rating);
          setReviewText(myRev.reviewText);
        } else {
          setUserExistingReview(null);
        }
      }

      // Compute stats
      if (onStatsUpdate && mapped.length > 0) {
        const avg = mapped.reduce((s, r) => s + r.rating, 0) / mapped.length;
        onStatsUpdate(Math.round(avg * 10) / 10, mapped.length);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Check if user has downloaded this product
  useEffect(() => {
    const checkDownloadStatus = async () => {
      if (!authUser) {
        setHasDownloaded(false);
        return;
      }

      try {
        setCheckingDownload(true);
        const { data, error } = await supabase
          .from("downloads")
          .select("id")
          .eq("product_id", productId)
          .eq("user_id", authUser.id)
          .maybeSingle();

        setHasDownloaded(Boolean(data));
      } catch (err) {
        console.error("Error checking download status:", err);
      } finally {
        setCheckingDownload(false);
      }
    };

    checkDownloadStatus();
    loadReviews();
  }, [productId, authUser]);

  // 3. Submit / Update Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      onAuthOpen("login");
      return;
    }

    if (!hasDownloaded) {
      toast.error("You must download this resource first before rating it.");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please enter a short review or feedback.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Attempt upsert with review_text
      let { error } = await supabase
        .from("reviews")
        .upsert(
          {
            product_id: productId,
            user_id: authUser.id,
            rating,
            review_text: reviewText.trim(),
            user_name: authUser.name || "Community Designer",
            user_avatar: authUser.avatar || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "product_id,user_id" }
        );

      // 2. If table has legacy column name (comment), fallback smoothly
      if (
        error &&
        (error.message?.includes("review_text") ||
          error.message?.includes("column") ||
          error.code === "42703")
      ) {
        const fallbackRes = await supabase
          .from("reviews")
          .upsert(
            {
              product_id: productId,
              user_id: authUser.id,
              rating,
              comment: reviewText.trim(),
              user_name: authUser.name || "Community Designer",
              user_avatar: authUser.avatar || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "product_id,user_id" }
          );
        error = fallbackRes.error;
      }

      if (error) throw error;

      toast.success(
        userExistingReview
          ? "Your review has been updated!"
          : "Thank you! Your verified review is published."
      );
      setIsEditing(false);
      await loadReviews();
    } catch (err: any) {
      console.error("Submit review error:", err);
      toast.error(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Review
  const handleDeleteReview = async (reviewId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this review?");
    if (!confirm) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
      if (error) throw error;

      toast.success("Review deleted.");
      setUserExistingReview(null);
      setReviewText("");
      setIsEditing(false);
      await loadReviews();
    } catch (err: any) {
      console.error("Delete review error:", err);
      toast.error("Failed to delete review.");
    }
  };

  // Rating calculations
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const getRatingCount = (star: number) =>
    reviews.filter((r) => r.rating === star).length;

  const isAdmin =
    authUser &&
    (authUser.role === "admin" ||
      authUser.email?.toLowerCase().trim() === "ahmedazy.uxui@gmail.com");

  return (
    <div className="space-y-8 pt-8 border-t border-border" id="reviews-section">
      {/* Header & Stats Overview */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold mb-3">
          <Star size={13} className="fill-current" /> Verified Community Reviews
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Ratings & Designer Feedback
        </h2>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Honest feedback exclusively from designers who downloaded this kit
        </p>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl border border-border bg-card shadow-sm">
        {/* Big Score */}
        <div className="flex flex-col items-center justify-center p-4 text-center border-b md:border-b-0 md:border-r border-border">
          <div className="text-5xl font-display font-black text-foreground mb-1 tracking-tight">
            {averageRating}
          </div>
          <div className="flex items-center gap-1 text-amber-400 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={18}
                className={
                  s <= Math.round(Number(averageRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted"
                }
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Based on {totalReviews} verified {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = getRatingCount(star);
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1 w-12 text-muted-foreground font-bold shrink-0">
                  <span>{star}</span>
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── WRITE / EDIT REVIEW SECTION ─────────────────────────────────── */}
      <div className="p-6 sm:p-7 rounded-3xl border border-border bg-card shadow-sm">
        {!authUser ? (
          <div className="text-center py-6">
            <MessageSquare size={32} className="mx-auto mb-3 text-muted-foreground opacity-40" />
            <h3 className="text-base font-display font-bold text-foreground mb-1">
              Have you used this design kit?
            </h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">
              Sign in and download this free resource to leave a rating and share your experience with the community.
            </p>
            <button
              onClick={() => onAuthOpen("login")}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-[0_0_20px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              Sign In to Review
            </button>
          </div>
        ) : !hasDownloaded ? (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Download size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                Download Required to Review
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                To keep all reviews authentic and high-quality, only designers who have downloaded this kit can post a rating. Click the "Download Free" button above to unlock reviews!
              </p>
            </div>
          </div>
        ) : userExistingReview && !isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-bold text-foreground">
                  You reviewed this design kit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <Edit2 size={12} /> Edit Review
                </button>
                <button
                  onClick={() => handleDeleteReview(userExistingReview.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/60 bg-background/50 space-y-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= userExistingReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed">
                "{userExistingReview.reviewText}"
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-display font-bold text-foreground flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                {isEditing ? "Update Your Review" : "Write a Verified Review"}
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-muted-foreground hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Star selector */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-semibold">
                Your Overall Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-muted-foreground hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      size={24}
                      className={
                        star <= (hoverRating ?? rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }
                    />
                  </button>
                ))}
                <span className="ml-3 text-xs font-mono font-bold text-foreground">
                  {rating === 5
                    ? "⭐⭐⭐⭐⭐ Exceptional"
                    : rating === 4
                    ? "⭐⭐⭐⭐ Very Good"
                    : rating === 3
                    ? "⭐⭐⭐ Good / Useful"
                    : rating === 2
                    ? "⭐⭐ Needs Improvement"
                    : "⭐ Poor"}
                </span>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide block mb-2 font-semibold">
                Review & Feedback
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
                rows={3}
                placeholder="What did you like about the components, typography, variables, or layouts in this kit?"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:shadow-[0_0_20px_rgba(170,255,56,0.25)] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Star size={13} className="fill-current" />
                  <span>{isEditing ? "Update Review" : "Publish Verified Review"}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* ── REVIEWS LIST ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-base font-display font-bold text-foreground">
          Community Reviews ({totalReviews})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-muted-foreground font-mono text-xs">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-10 rounded-3xl border border-border/80 bg-card text-center text-muted-foreground">
            <Star size={28} className="mx-auto mb-2 opacity-30 text-amber-400" />
            <p className="font-semibold text-foreground text-sm">No reviews yet.</p>
            <p className="text-xs font-mono mt-1">
              Be the first designer to download and review {productTitle}!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((rev) => {
              const isOwner = authUser && authUser.id === rev.userId;
              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl border border-border bg-card space-y-2.5 transition-all hover:border-border/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary font-display">
                          {rev.userName[0]?.toUpperCase() || "D"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">
                            {rev.userName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            <CheckCircle2 size={10} /> Verified Download
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={12}
                            className={
                              s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted"
                            }
                          />
                        ))}
                      </div>

                      {(isOwner || isAdmin) && (
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete review"
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed pl-11">
                    {rev.reviewText}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
