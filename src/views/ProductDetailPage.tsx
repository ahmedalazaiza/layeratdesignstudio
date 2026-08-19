"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Download,
  Eye,
  Heart,
  ExternalLink,
  Shield,
  Check,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  FileCode,
  FileText,
  Share2,
  Loader2,
  User,
  Package,
} from "lucide-react";
import { ProductLightbox } from "@/components/product/ProductLightbox";
import { ProductReviewsSection } from "@/components/product/ProductReviewsSection";
import { productService } from "@/services/productService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Product, Category, Page, User as UserType } from "@/types/api";

interface ProductDetailPageProps {
  product: Product;
  onBack?: () => void;
  categories?: Category[];
  onNavigate?: (p: Page) => void;
  onProductClick?: (p: Product) => void;
  relatedProducts?: Product[];
}

export function ProductDetailPage({
  product: initialProduct,
  onBack,
  categories = [],
  onNavigate,
  onProductClick,
  relatedProducts = [],
}: ProductDetailPageProps) {
  const queryClient = useQueryClient();
  const {
    authUser,
    isAuthenticated,
    wishlist,
    toggleWishlist,
    openAuthModal,
    openEmailVerifyModal,
  } = useAuth();

  const productId = initialProduct?._id || initialProduct?.id || "";

  // 1. Fetch live product details from backend API
  const { data: product = initialProduct } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const live = await productService.getProductById(productId);
      return live || initialProduct;
    },
    initialData: initialProduct,
    staleTime: 60 * 1000,
  });

  // 2. Active gallery image & Lightbox index
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // 3. Ratings and Download State
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitting, setRatingSubmitting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const isFavorited = wishlist.includes(productId);

  // 4. Record View on Mount
  useEffect(() => {
    if (productId) {
      productService.recordView(productId);
    }
  }, [productId]);

  const previewImages =
    product.previewImages && product.previewImages.length > 0
      ? product.previewImages
      : product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"];

  const currentImage = previewImages[selectedImageIndex] || previewImages[0];

  // 5. Star Rating Submission
  const handleRate = async (star: number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to rate this product.");
      openAuthModal("login");
      return;
    }

    try {
      setRatingSubmitting(true);
      setUserRating(star);
      const res = await productService.rateProduct({
        productId,
        rating: star,
      });

      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success(`Thank you for rating ${star} stars!`, {
        description: "Your rating helps creators build better Figma resources.",
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  // 6. S3 Presigned URL Download Flow
  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.info("Sign in to download 100% free Figma design files.", {
        description: "Instant access to all design systems and templates.",
      });
      openAuthModal("login");
      return;
    }

    if (authUser && !authUser.isEmailVerified && !authUser.isVerified) {
      toast.error("Please verify your email address to unlock free downloads.");
      openEmailVerifyModal();
      return;
    }

    try {
      setDownloading(true);
      const data = await productService.downloadProduct(productId);
      const targetUrl = data.downloadLink || product.downloadFileUrl || product.figmaPreviewUrl;

      if (!targetUrl) {
        toast.error("Download link is currently unavailable for this item.");
        return;
      }

      // Trigger client file download
      const anchor = document.createElement("a");
      anchor.href = targetUrl;
      anchor.setAttribute("download", data.fileName || `${product.slug || "layerat-kit"}.fig`);
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      toast.success("Download started!", {
        description: "Your Figma resource is downloading.",
      });

      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to generate download link";
      toast.error(msg);
    } finally {
      setDownloading(false);
    }
  };

  // Publisher details
  const publisherObj: UserType | null =
    typeof product.publisher === "object" ? (product.publisher as UserType) : null;
  const publisherName = publisherObj?.displayName || publisherObj?.userName || (typeof product.publisher === "string" ? product.publisher : "Layerat Studio");
  const publisherUsername = publisherObj?.userName || "layerat";
  const publisherAvatar = publisherObj?.avatar;

  const categoryObj =
    typeof product.category === "object"
      ? (product.category as Category)
      : categories.find(
          (c) => (c._id || c.id) === (product.categoryId || product.category)
        );

  const categoryName = categoryObj?.name || (typeof product.category === "string" ? product.category : "Design Kit");
  const isFree = product.isFree !== undefined ? product.isFree : (Number(product.price || 0) === 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <ProductLightbox
          images={previewImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="border-b border-border/70 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <button
              type="button"
              onClick={onBack || (() => onNavigate?.("browse"))}
              className="hover:text-foreground inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} />
              Browse
            </button>
            <span>/</span>
            <span className="text-foreground truncate">{categoryName}</span>
            <span>/</span>
            <span className="text-muted-foreground/80 truncate hidden sm:inline">{product.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Share Button */}
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied to clipboard!");
                }
              }}
              className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy link"
            >
              <Share2 size={14} />
            </button>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal("login");
                  return;
                }
                toggleWishlist(productId);
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isFavorited
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={14} className={isFavorited ? "fill-primary" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Left Column: Preview Gallery & Carousel ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Main Stage Image */}
            <div
              onClick={() => setLightboxIndex(selectedImageIndex)}
              className="group relative rounded-3xl overflow-hidden border border-border bg-card shadow-sm cursor-zoom-in aspect-[16/10]"
            >
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />

              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold shadow-md flex items-center gap-1.5">
                  <Sparkles size={12} />
                  {isFree ? "100% Free" : `$${product.price}`}
                </span>
              </div>

              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand HD
              </div>
            </div>

            {/* Thumbnail Strip */}
            {previewImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {previewImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-primary shadow-sm scale-105"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Product Overview & Description */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">
                  Overview & Details
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {product.overview || product.fullDescription || product.shortDescription}
                </p>
              </div>

              {/* Highlights Bulleted List */}
              {product.highlights && product.highlights.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-mono uppercase text-muted-foreground tracking-wider font-bold mb-3">
                    Key Features & Highlights
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground">
                        <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Included Files Badges */}
              {product.includedFiles && product.includedFiles.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-mono uppercase text-muted-foreground tracking-wider font-bold mb-3">
                    Included Files & Formats
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.includedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-muted/60 border border-border text-xs font-mono text-foreground font-medium"
                      >
                        <FileCode size={13} className="text-primary" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <ProductReviewsSection
              productId={productId}
              authUser={authUser}
              onAuthOpen={openAuthModal}
            />
          </div>

          {/* ── Right Column: Purchase/Download Box & Publisher ── */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Download Action Box */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <Eye size={12} /> {product.views || 0} views
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight mb-3">
                  {product.title}
                </h1>

                {/* Rating Bar */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center text-primary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= Math.round(product.rating || 5)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="font-bold text-foreground font-mono">
                    {(product.rating || 5.0).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({product.reviewsCount || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Price & Free Guarantee */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground block font-mono">
                    License Price
                  </span>
                  <span className="text-2xl font-display font-bold text-primary">
                    {isFree ? "Free Forever" : `$${product.price}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    Commercial Use
                  </span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end">
                    <Check size={13} /> Included
                  </span>
                </div>
              </div>

              {/* Main Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_35px_rgba(170,255,56,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Free Figma File
                  </>
                )}
              </button>

              {/* Interactive 1-5 Star Rating Widget */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Rate this resource:</span>
                  {userRating > 0 && (
                    <span className="text-primary font-bold">Rated {userRating} ★</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 py-2 bg-muted/40 rounded-2xl border border-border/60">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingSubmitting}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRate(star)}
                      className="p-1 text-muted-foreground hover:text-primary transition-transform hover:scale-125 cursor-pointer disabled:opacity-50"
                    >
                      <Star
                        size={20}
                        className={
                          (hoverRating !== null ? star <= hoverRating : star <= (userRating || Math.round(product.rating || 0)))
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Specifications Box */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono">File Size:</span>
                  <span className="font-bold text-foreground font-mono">
                    {product.fileSize || product.specifications?.fileSize || "14.2 MB"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono">Figma Auto-Layout:</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">
                    <Check size={12} /> Supported
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono">Figma Variables:</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">
                    <Check size={12} /> Color & Spacing
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono">Total Downloads:</span>
                  <span className="font-bold text-foreground font-mono">
                    {product.downloads || product.downloadsCount || 0}
                  </span>
                </div>
              </div>

              {/* ── Mini Publisher Card ── */}
              <div className="pt-6 border-t border-border">
                <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider block mb-3 font-semibold">
                  Published By
                </span>

                <Link
                  href={`/profile/${publisherUsername}`}
                  className="p-3.5 rounded-2xl border border-border bg-background hover:bg-muted/50 hover:border-primary/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                      {publisherAvatar ? (
                        <img src={publisherAvatar} alt={publisherName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {publisherName}
                        </p>
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">
                        @{publisherUsername}
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              You Might Also Like
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <div key={p.id || p._id} onClick={() => onProductClick?.(p)}>
                  <img
                    src={p.thumbnail || p.previewImages?.[0]}
                    alt={p.title}
                    className="w-full h-44 rounded-2xl object-cover border border-border mb-2 hover:border-primary/40 cursor-pointer"
                  />
                  <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                  <span className="text-[10px] font-mono text-primary font-bold">100% Free</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
