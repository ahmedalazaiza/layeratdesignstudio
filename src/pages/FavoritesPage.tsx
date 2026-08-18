import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Download, Gift, Sparkles, CheckCircle2, ShieldCheck, FileCode } from "lucide-react";
import { Footer } from "../components/layout/Footer";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import type { Product, AuthUser, Category, Page } from "../types";

interface FavoritesPageProps {
  authUser?: AuthUser | null;
  onProductClick: (p: Product) => void;
  onWishlistToggle?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  onNavigate: (p: Page) => void;
  products?: Product[];
  favoriteProducts?: Product[];
  categories: Category[];
}

export function FavoritesPage({
  authUser,
  onProductClick,
  onWishlistToggle,
  onToggleWishlist,
  onNavigate,
  products = [],
  favoriteProducts: passedFavorites,
  categories,
}: FavoritesPageProps) {
  const handleToggle = onToggleWishlist || onWishlistToggle || (() => {});

  const [giftConfig, setGiftConfig] = useState<{
    title: string;
    description: string;
    image_url: string;
    download_url: string;
    file_name: string;
    file_format: string;
    file_size: string;
    is_active: boolean;
  } | null>(null);

  useEffect(() => {
    const loadGift = async () => {
      try {
        const { data } = await supabase
          .from("gift_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (data && data.is_active) {
          setGiftConfig({
            title: data.title || "Free Figma Starter Kit",
            description: data.description || "50+ components · 3 themes · Variables-ready",
            image_url: data.image_url || "https://images.unsplash.com/photo-1637944059054-7091ca8efe14?w=600&q=80&fit=crop",
            download_url: data.download_url || "",
            file_name: data.file_name || "layerat-starter-kit.fig",
            file_format: (data as any).file_format || "fig",
            file_size: (data as any).file_size || "45 MB",
            is_active: data.is_active ?? true,
          });
        }
      } catch (err) {
        console.error("Error loading gift for library:", err);
      }
    };
    loadGift();
  }, []);

  const favoriteProducts =
    passedFavorites ??
    products.filter((p) => authUser?.wishlist?.includes(p.id));

  const handleDownloadGift = () => {
    if (!authUser?.isVerified) {
      toast.error("Please verify your email address to unlock your gift kit.");
      return;
    }

    if (giftConfig?.download_url) {
      const a = document.createElement("a");
      a.href = giftConfig.download_url;
      a.download = giftConfig.file_name;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Downloading ${giftConfig.file_name}!`);
    } else {
      toast.success("Gift Kit unlocked! Download initiated.");
    }
  };

  return (
    <motion.main
      key="favorites"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pt-24 pb-10"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Heart size={18} className="text-primary fill-current" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Studio Library & Saved Kits
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-13">
            {favoriteProducts.length === 0
              ? "Your saved UI kits, design systems, and unlocked community gifts"
              : `${favoriteProducts.length} saved resource${
                  favoriteProducts.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        {/* ── UNLOCKED GIFT KIT BANNER FOR VERIFIED USERS ────────────────────── */}
        {giftConfig && authUser?.isVerified && (
          <div className="relative rounded-3xl overflow-hidden border border-border/80 dark:border-primary/30 bg-card shadow-xl shadow-black/5 dark:shadow-black/30 p-6 sm:p-8 transition-all duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 -mb-10 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 w-full lg:w-auto">
                {/* Glowing Gift Badge */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 dark:border-primary/40 flex items-center justify-center text-primary shadow-md shadow-primary/10">
                    <Gift size={28} className="text-primary" />
                  </div>
                </div>

                {/* Content Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-400/40 text-[11px] font-mono font-bold tracking-wide">
                      <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                      Account Verified · Starter Gift Unlocked
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 text-foreground dark:text-primary font-mono font-bold text-[11px] border border-primary/20 dark:border-primary/30">
                      <Sparkles size={12} className="text-primary" /> Free Community Exclusive
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tracking-tight">
                    {giftConfig.title || "Free Figma Starter Kit"}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-sm font-medium text-muted-foreground">
                      {giftConfig.description || "50+ components · 3 themes · Variables-ready"}
                    </span>
                    <span className="text-muted-foreground/40 hidden sm:inline">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-primary/15 dark:bg-primary/25 text-foreground dark:text-primary font-mono font-bold text-xs border border-primary/30">
                      .{(giftConfig.file_format || "fig").toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-muted text-muted-foreground font-mono font-semibold text-xs border border-border">
                      {giftConfig.file_size || "45 MB"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Download CTA Button (High-Contrast AAA in Light and Dark) */}
              <button
                onClick={handleDownloadGift}
                className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm sm:text-base hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shrink-0 shadow-lg shadow-primary/20 group"
              >
                <Download size={18} className="text-primary-foreground group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Free Gift (.{(giftConfig.file_format || "fig").toUpperCase()})</span>
              </button>
            </div>
          </div>
        )}

        {/* Unverified Gift Notice */}
        {giftConfig && authUser && !authUser.isVerified && (
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-card p-6 sm:p-7 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-md shadow-amber-500/10">
                  <Gift size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/35 text-[10px] font-mono font-extrabold uppercase tracking-wider mb-1">
                    🔒 Verification Required to Unlock
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-foreground">
                    Your Free Gift Starter Kit is waiting! 🎁
                  </h3>
                  <p className="text-xs text-foreground/80 dark:text-muted-foreground font-normal mt-0.5">
                    Click the verification link sent to <strong className="text-foreground font-mono">{authUser.email}</strong> to download {giftConfig.file_name || "the starter kit"}.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold shrink-0 border border-amber-500/35 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Pending Verification
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border bg-card p-8 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Heart size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              No saved resources yet
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Click the heart icon on any UI kit, template, or design system to
              save it to your studio favorites.
            </p>
            <button
              onClick={() => onNavigate("browse")}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:shadow-[0_0_30px_rgba(170,255,56,0.25)] transition-all cursor-pointer"
            >
              Browse 100% Free Library
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onProductClick(p)}
                className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(p.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/40 ring-2 ring-white/30 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all cursor-pointer z-10"
                    aria-label="Remove from saved resources"
                  >
                    <Heart size={14} className="fill-current text-white" />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Free
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-foreground text-base group-hover:text-primary transition-colors truncate mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {p.shortDescription}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                    <span className="font-mono">
                      <Download size={11} className="inline mr-1" />
                      {p.downloadsCount || p.downloads || 0}
                    </span>
                    <span className="font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {p.formats?.[0] || p.specifications?.format?.[0] || "Figma"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} categories={categories} />
    </motion.main>
  );
}
