import React, { useState, useEffect } from "react";
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
  Minus,
  ArrowUpRight,
  CheckCircle,
  Sparkles,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { ProductLightbox } from "../components/product/ProductLightbox";
import { ProductReviewsSection } from "../components/product/ProductReviewsSection";
import { Footer } from "../components/layout/Footer";
import { supabase } from "../lib/supabase";
import { generateSEOMetadata, updateDOMHeadSEO } from "../lib/seo";
import { toast } from "sonner";
import type { Product, Category, AuthUser, Page } from "../types";

interface ProductDetailPageProps {
  product: Product;
  onBack?: () => void;
  authUser: AuthUser | null;
  onAuthOpen: (mode: "login" | "register" | "forgot_password") => void;
  onWishlistToggle?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  categories: Category[];
  onNavigate: (p: Page) => void;
  onProductClick?: (p: Product) => void;
  relatedProducts?: Product[];
  wishlist?: string[];
}

export function ProductDetailPage({
  product,
  onBack,
  authUser,
  onAuthOpen,
  onWishlistToggle,
  onToggleWishlist,
  categories,
  onNavigate,
  onProductClick,
  relatedProducts,
  wishlist,
}: ProductDetailPageProps) {
  const handleWishlist = onToggleWishlist || onWishlistToggle || (() => {});
  const handleBack = onBack || (() => onNavigate("browse"));

  const [stats, setStats] = useState({
    downloadsCount: product.downloadsCount || product.downloads || 0,
    viewsCount: product.viewsCount || product.views || 0,
    rating: product.rating || 5.0,
    reviewsCount: product.reviewsCount || 0,
  });
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isInWishlist =
    (wishlist && wishlist.includes(product.id)) ||
    (authUser?.wishlist.includes(product.id) ?? false);

  // Sync SEO & Structured Data Schema
  useEffect(() => {
    const meta = generateSEOMetadata({ page: "product", productId: product.id }, product);
    updateDOMHeadSEO(meta, product);
  }, [product]);

  useEffect(() => {
    const loadStatsAndRecordView = async () => {
      // 1) Record view
      const viewerKey =
        authUser?.id ||
        localStorage.getItem("ld_viewer_key") ||
        crypto.randomUUID();
      if (!localStorage.getItem("ld_viewer_key") && !authUser) {
        localStorage.setItem("ld_viewer_key", viewerKey);
      }

      await supabase.from("product_views").insert({
        product_id: product.id,
        viewer_key: viewerKey,
      });

      // 2) Count views
      const { count: viewsCount } = await supabase
        .from("product_views")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id);

      // 3) Count downloads
      const { count: downloadsCount } = await supabase
        .from("downloads")
        .select("*", { count: "exact", head: true })
        .eq("product_id", product.id);

      // 4) Reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id);

      const reviewsCount = reviews?.length || 0;
      const rating =
        reviewsCount > 0
          ? reviews!.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsCount
          : 0;

      setStats({
        downloadsCount: downloadsCount || product.downloadsCount || product.downloads || 0,
        viewsCount: viewsCount || product.viewsCount || product.views || 0,
        rating: Math.round(rating * 10) / 10 || product.rating || 5.0,
        reviewsCount: reviewsCount || product.reviewsCount || 0,
      });
    };

    loadStatsAndRecordView();
  }, [product.id, authUser?.id]);

  const handleDownload = async () => {
    if (!authUser) {
      toast.info("Please sign in or create an account to download resources.");
      onAuthOpen("login");
      return;
    }

    if (!authUser.isVerified) {
      try {
        // Real-time verification check in case user verified in another tab
        const { data: { user } } = await supabase.auth.getUser();
        if (user && (user.email_confirmed_at || user.confirmed_at)) {
          authUser.isVerified = true;
          toast.success("Account verified! Starting download...");
        } else {
          toast.error("Please verify your email address to unlock free downloads.", {
            description: `A confirmation link was sent to ${authUser.email}. Please click the link to activate your downloads.`,
            action: {
              label: "Resend Link",
              onClick: async () => {
                await supabase.auth.resend({
                  type: "signup",
                  email: authUser.email,
                  options: { emailRedirectTo: window.location.origin },
                });
                toast.success(`Verification link resent to ${authUser.email}!`);
              },
            },
          });
          return;
        }
      } catch {
        toast.error("Please verify your email address before downloading.");
        return;
      }
    }

    setDownloadStatus("loading");
    try {
      // Check if user already downloaded
      const { data: existingDownload } = await supabase
        .from("downloads")
        .select("id")
        .eq("user_id", authUser.id)
        .eq("product_id", product.id)
        .maybeSingle();

      if (!existingDownload) {
        // Record download
        await supabase.from("downloads").insert({
          user_id: authUser.id,
          product_id: product.id,
          downloaded_at: new Date().toISOString(),
        });
        setStats((prev) => ({ ...prev, downloadsCount: prev.downloadsCount + 1 }));
      }

      // Trigger direct file download
      const targetUrl = product.downloadFileUrl || product.figmaPreviewUrl;
      const rawFormat = (product.formats?.[0] || "").toLowerCase();
      const formatExt = rawFormat.includes("fig")
        ? "fig"
        : rawFormat.includes("sketch")
        ? "sketch"
        : rawFormat.includes("xd")
        ? "xd"
        : rawFormat.includes("pdf")
        ? "pdf"
        : "zip";
      const fileName = `${product.slug || "layerat-kit"}.${formatExt}`;

      if (targetUrl) {
        const link = document.createElement("a");
        link.href = targetUrl;
        link.download = fileName;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadStatus("success");
      toast.success(`Download started for ${fileName}! Added to your Library.`);
      setTimeout(() => setDownloadStatus("idle"), 3000);
    } catch (err: any) {
      console.error("Download error:", err);
      toast.error("Download failed. Please try again.");
      setDownloadStatus("idle");
    }
  };

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(
    (s) => s.id === product.subcategoryId
  );

  const allImages = Array.from(
    new Set([product.thumbnail, ...(product.galleryImages || [])].filter(Boolean))
  ) as string[];

  const galleryImages = allImages.length > 0 ? allImages : [product.thumbnail];

  const screensCountNum = product.screensCount ?? product.specifications?.screens ?? 0;
  const componentsCountNum = product.componentsCount ?? product.specifications?.components ?? 250;
  const formatsList = product.formats ?? product.specifications?.format ?? ["Figma (.fig)"];
  const tagsList = product.tags || [];

  const specs = [
    { label: "File Size", value: product.fileSize || product.specifications?.fileSize || "45 MB" },
    { label: "Formats", value: formatsList.join(", ") },
    {
      label: "Screens",
      value: screensCountNum > 0 ? `${screensCountNum}+` : "120+",
    },
    { label: "Components", value: `${componentsCountNum}+` },
    { label: "Version", value: product.version || product.specifications?.version || "v1.0.0" },
    {
      label: "License",
      value: "Free Commercial & Personal",
    },
  ];

  const figmaFeatures = [
    {
      label: "Figma Variables",
      supported: product.supportsVariables ?? product.specifications?.supportsVariables ?? true,
    },
    {
      label: "Auto Layout 5.0",
      supported: product.supportsAutoLayout ?? product.specifications?.supportsAutoLayout ?? true,
    },
    {
      label: "Light & Dark Mode",
      supported: product.supportsLightDark ?? product.specifications?.supportsLightDark ?? true,
    },
  ];

  return (
    <motion.main
      key="product"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <ProductLightbox
          images={galleryImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] bg-primary/6" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-20">
        {/* Back */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group cursor-pointer"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to marketplace
        </button>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-8 items-start">
          {/* ── LEFT: scrollable content ─────────────────────────────── */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Category badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  100% Free
                </span>
                {category && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-muted text-foreground border border-border">
                    {category.name}
                  </span>
                )}
                {subcategory && (
                  <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-border text-muted-foreground">
                    {subcategory.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-display font-extrabold text-foreground leading-tight mb-4">
                {product.title}
              </h1>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                {product.fullDescription || product.shortDescription}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-primary fill-primary" />
                  <span className="font-mono font-bold text-foreground">
                    {stats.rating.toFixed(1)}
                  </span>
                  <span>({stats.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Download size={13} />
                  <span className="font-mono font-bold text-foreground">
                    {stats.downloadsCount.toLocaleString()}
                  </span>{" "}
                  downloads
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={13} />
                  <span className="font-mono font-bold text-foreground">
                    {stats.viewsCount.toLocaleString()}
                  </span>{" "}
                  views
                </div>
              </div>

              {/* Tags */}
              {tagsList.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pb-8 border-b border-border mb-10">
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest shrink-0">
                    Tags ·
                  </span>
                  {tagsList.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full border border-primary/20 bg-primary/10 text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Featured Cover Hero Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="group relative rounded-3xl overflow-hidden border border-border bg-card aspect-[16/10] sm:aspect-[16/9] cursor-zoom-in shadow-xl mb-10"
                onClick={() => setLightboxIndex(0)}
              >
                <img
                  src={galleryImages[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-bold">
                    <ArrowUpRight size={14} className="text-primary" /> Click to view in Fullscreen Lightbox
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white/80 text-xs font-mono border border-white/10">
                    01 / {String(galleryImages.length).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>

              {/* Gallery Grid */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Preview Gallery & Screens ({galleryImages.length})
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                  Click any image to zoom
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {galleryImages.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: (i % 2) * 0.08 }}
                    className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-[3/2] cursor-zoom-in shadow-md"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={src}
                      alt={`${product.title} preview ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                        <ArrowUpRight size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(galleryImages.length).padStart(2, "0")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Verified Product Reviews & Ratings Section ── */}
            <ProductReviewsSection
              productId={product.id}
              productTitle={product.title}
              authUser={authUser}
              onAuthOpen={onAuthOpen}
              onStatsUpdate={(newAvg, newCount) => {
                setStats((prev) => ({
                  ...prev,
                  rating: newAvg,
                  reviewsCount: newCount,
                }));
              }}
            />
          </div>

          {/* ── RIGHT: sticky download card ──────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-6 rounded-3xl border border-border bg-card shadow-xl">
                {/* 100% Free Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                      Price
                    </span>
                    <div className="text-4xl font-display font-black text-primary">
                      Free
                    </div>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                    Community Edition
                  </span>
                </div>

                {/* Primary CTA */}
                {authUser && !authUser.isVerified ? (
                  <div className="space-y-2.5 mb-3">
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border-2 border-amber-500/40 text-amber-900 dark:text-amber-300 font-extrabold text-base transition-all duration-300 shadow-md cursor-pointer"
                    >
                      <Lock size={18} className="text-amber-600 dark:text-amber-400" />
                      <span>Verify Email to Download (.fig)</span>
                    </button>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
                      <ShieldAlert size={16} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-950 dark:text-amber-200">Verification Required:</span> Please click the link sent to <span className="font-mono text-foreground font-bold">{authUser.email}</span> to unlock all free downloads.
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDownload}
                    disabled={downloadStatus === "loading"}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_30px_rgba(170,255,56,0.35)] disabled:opacity-60 transition-all duration-300 mb-3 shadow-lg shadow-primary/20 cursor-pointer"
                  >
                    {downloadStatus === "loading" ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Preparing download...
                      </span>
                    ) : downloadStatus === "success" ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={18} /> Downloaded!
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download size={18} /> Download Free (.fig)
                      </span>
                    )}
                  </button>
                )}

                {/* Save + Preview */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!authUser) {
                        onAuthOpen("login");
                        return;
                      }
                      handleWishlist(product.id);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isInWishlist
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart
                      size={14}
                      className={isInWishlist ? "fill-current" : ""}
                    />
                    {isInWishlist ? "Saved to Wishlist" : "Save"}
                  </button>
                  {product.figmaPreviewUrl && (
                    <a
                      href={product.figmaPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all duration-200"
                    >
                      <ExternalLink size={14} />
                      Preview
                    </a>
                  )}
                </div>

                {/* Specs */}
                <div className="mt-5 pt-5 border-t border-border space-y-3">
                  {specs.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-mono text-foreground font-medium">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Figma features */}
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
                    Figma Features
                  </p>
                  <div className="space-y-2">
                    {figmaFeatures.map(({ label, supported }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            supported
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {supported ? (
                            <Check size={11} />
                          ) : (
                            <Minus size={11} />
                          )}
                        </div>
                        <span
                          className={
                            supported
                              ? "text-foreground font-medium"
                              : "text-muted-foreground line-through"
                          }
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* License */}
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                    <Shield size={14} className="text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Free Community License</strong> — 100% free to use for both personal and commercial projects.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── MOBILE FLOATING BOTTOM ACTION BAR (Sticky on screens < lg) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          {/* Wishlist button */}
          <button
            onClick={() => {
              if (!authUser) {
                onAuthOpen("login");
                return;
              }
              handleWishlist(product.id);
            }}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              isInWishlist
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground"
            }`}
            title="Save to library"
          >
            <Heart size={20} className={isInWishlist ? "fill-current text-primary" : ""} />
          </button>

          {/* Download CTA */}
          {authUser && !authUser.isVerified ? (
            <button
              onClick={handleDownload}
              className="flex-1 h-12 flex items-center justify-center gap-2 px-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-extrabold text-xs sm:text-sm cursor-pointer"
            >
              <Lock size={15} />
              <span>Verify to Download (.fig)</span>
            </button>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloadStatus === "loading"}
              className="flex-1 h-12 flex items-center justify-center gap-2 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              {downloadStatus === "loading" ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Downloading...
                </span>
              ) : downloadStatus === "success" ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={16} /> Downloaded!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Download size={16} /> Download Free (.fig)
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
